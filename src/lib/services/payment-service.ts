import { SettingsDataMap } from '@/server/settings/setting-schema';
import { BillingProvider } from '@/data/constans';
import settingsService from '@/server/settings/setting-service';
import prisma from '../prisma';
import APIError from '../api-error';
import Stripe from 'stripe';
import { Context, Env } from 'hono';
import httpStatus from 'http-status';
import { Plan } from '@prisma/client';
import axios from 'axios';

export interface CreateCheckoutOptions {
  userId: string;
  plan: Plan;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
}

export interface CustomerPortalResult {
  url: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private billingSettings: SettingsDataMap['billing'] | null = null;
  private initialized = false;
  private stripe: Stripe | null = null;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    const settings = await settingsService.getSetting('billing');
    this.billingSettings = settings;

    if (settings?.provider === 'stripe' && settings.stripeSecretKey) {
      this.stripe = new Stripe(settings.stripeSecretKey, {
        apiVersion: '2025-05-28.basil',
      });
    }

    this.initialized = true;
  }

  async setBillingSettings(settings: SettingsDataMap['billing'] | null) {
    this.billingSettings = settings;

    if (settings?.provider === 'stripe' && settings.stripeSecretKey) {
      this.stripe = new Stripe(settings.stripeSecretKey, {
        apiVersion: '2025-05-28.basil',
      });
    } else {
      this.stripe = null;
    }

    this.initialized = true;
  }

  private validateProvider(provider: BillingProvider): void {
    if (!this.billingSettings) {
      throw new APIError('Billing settings not configured');
    }

    if (this.billingSettings.provider !== provider) {
      throw new APIError(
        `Billing provider ${provider} is not configured. Current provider: ${this.billingSettings.provider}`,
      );
    }
  }

  // Stripe Implementation
  private async getStripeCustomerId(userId: string) {
    if (!this.stripe) {
      throw new APIError('Stripe is not initialized');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new APIError('User not found', httpStatus.NOT_FOUND);
    }

    const customerId = user.customerId;
    let createCustomer = false;

    if (!customerId) {
      createCustomer = true;
    } else {
      try {
        const customer = await this.stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          createCustomer = true;
        }
      } catch {
        createCustomer = true;
      }
    }

    if (createCustomer) {
      try {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            customerId: customer.id,
          },
        });
        return customer.id;
      } catch (error) {
        throw new APIError(
          `Failed to create Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return customerId as string;
  }

  private async createStripeCheckout(options: CreateCheckoutOptions): Promise<CheckoutResult> {
    if (!this.stripe) {
      throw new APIError('Stripe is not initialized');
    }

    try {
      // Get or create customer
      const customerId = await this.getStripeCustomerId(options.userId);

      if (!options.plan.price) {
        throw new APIError('Plan price is not set');
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: this.billingSettings?.currency || 'usd',
              unit_amount: options.plan.price * 100,
              product_data: {
                name: options.plan.name,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        metadata: {
          planId: options.plan.id,
        },
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
      });

      return {
        url: session.url!,
      };
    } catch (error) {
      throw new APIError(
        `Failed to create Stripe checkout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleStripeWebhook(c: Context<Env, string>) {
    if (!this.stripe) {
      throw new APIError('Stripe is not initialized');
    }

    try {
      const sig = c.req.header('stripe-signature');
      const payload = await c.req.text();

      if (!sig || !payload) {
        throw new APIError('Missing Stripe signature');
      }

      if (!this.billingSettings?.stripeWebhookSecret) {
        throw new APIError('Stripe webhook secret is not set');
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        this.billingSettings?.stripeWebhookSecret || '',
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;

          const planId = session.metadata?.planId;

          if (!planId) {
            throw new APIError('Plan ID is not set');
          }

          const plan = await prisma.plan.findFirst({
            where: { id: planId },
          });

          if (!plan) {
            throw new APIError('Plan not found', httpStatus.NOT_FOUND);
          }

          const user = await prisma.user.findFirst({
            where: {
              id: session.metadata?.userId,
            },
          });

          if (!user) {
            throw new APIError('User not found', httpStatus.NOT_FOUND);
          }

          const credits = plan.credits;

          await prisma.payment.create({
            data: {
              userId: user.id,
              price: session.amount_total ? session.amount_total / 100 : 0,
              credits,
              status: 'paid',
            },
          });

          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              credits: { increment: credits },
            },
          });

          return {
            success: true,
            message: 'Payment processed successfully',
          };
        }

        default:
          return {
            success: true,
            message: `Unhandled event type: ${event.type}`,
          };
      }
    } catch (error) {
      throw new APIError(
        `Failed to handle Stripe webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Get access token
  private async getPaypalAccessToken() {
    const paypalBaseUrl =
      this.billingSettings?.paypalMode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

    const response = await axios({
      url: `${paypalBaseUrl}/v1/oauth2/token`,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: this.billingSettings?.paypalClientId || '',
        password: this.billingSettings?.paypalClientSecret || '',
      },
      data: 'grant_type=client_credentials',
    });

    return response.data.access_token;
  }

  // Create checkout
  private async createPayPalCheckout(options: CreateCheckoutOptions): Promise<CheckoutResult> {
    const accessToken = await this.getPaypalAccessToken();

    const paypalBaseUrl =
      this.billingSettings?.paypalMode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

    const orderResponse = await axios({
      url: `${paypalBaseUrl}/v2/checkout/orders`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: this.billingSettings?.currency || 'usd',
              value: options.plan.price.toString(),
            },
            custom_id: JSON.stringify({
              userId: options.userId,
              planId: options.plan.id,
            }),
          },
        ],
        application_context: {
          return_url: options.successUrl,
          cancel_url: options.cancelUrl,
        },
      },
    });

    const approvalUrl = orderResponse.data.links.find((link: any) => link.rel === 'approve').href;

    if (!approvalUrl) {
      throw new APIError('Approval URL not found');
    }

    return {
      url: approvalUrl,
    };
  }

  // Handle webhook
  private async handlePayPalWebhook(c: Context<Env, string>) {
    try {
      const paypalBaseUrl =
        this.billingSettings?.paypalMode === 'sandbox'
          ? 'https://api-m.sandbox.paypal.com'
          : 'https://api-m.paypal.com';

      // Read the request body once and store it
      const body = await c.req.json();
      const headers = c.req.header();

      // Validate required settings
      if (!this.billingSettings?.paypalWebhookId) {
        throw new APIError('PayPal webhook ID is not configured');
      }

      // Get required headers (case-insensitive)
      const authAlgo = headers['paypal-auth-algo'] || headers['Paypal-Auth-Algo'];
      const certUrl = headers['paypal-cert-url'] || headers['Paypal-Cert-Url'];
      const transmissionId = headers['paypal-transmission-id'] || headers['Paypal-Transmission-Id'];
      const transmissionSig =
        headers['paypal-transmission-sig'] || headers['Paypal-Transmission-Sig'];
      const transmissionTime =
        headers['paypal-transmission-time'] || headers['Paypal-Transmission-Time'];

      // Validate required headers
      if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
        throw new APIError('Missing required PayPal webhook headers');
      }

      const accessToken = await this.getPaypalAccessToken();

      // Log the verification request data for debugging
      const verificationData = {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: this.billingSettings.paypalWebhookId,
        webhook_event: body,
      };

      const response = await axios({
        url: `${paypalBaseUrl}/v1/notifications/verify-webhook-signature`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: verificationData,
      });

      if (response.data.verification_status !== 'SUCCESS') {
        console.error('PayPal webhook verification failed:', JSON.stringify(response.data));
        throw new APIError('PayPal webhook verification failed');
      }

      // Parse the body for processing
      const eventType = body.event_type;
      const resource = body.resource;
      const metadata = resource?.purchase_units[0]?.custom_id;

      if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        const { userId, planId } = JSON.parse(metadata);
        if (!userId || !planId) {
          throw new APIError('User ID or plan ID is not set');
        }

        const plan = await prisma.plan.findFirst({
          where: { id: planId },
        });

        if (!plan) {
          throw new APIError('Plan not found', httpStatus.NOT_FOUND);
        }

        const credits = plan.credits;

        await prisma.payment.create({
          data: {
            userId,
            price: Number(resource.purchase_units[0].amount.value),
            credits,
            status: 'paid',
          },
        });

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            credits: { increment: credits },
          },
        });

        return {
          success: true,
          message: 'Payment processed successfully',
        };
      } else {
        return {
          success: true,
          message: `Unhandled event type: ${eventType}`,
        };
      }
    } catch (error) {
      console.error('PayPal webhook error:', error);
      throw new APIError(
        `Failed to handle PayPal webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCheckout(options: CreateCheckoutOptions): Promise<CheckoutResult> {
    await this.initialize();

    const provider = this.billingSettings?.provider || 'stripe';
    this.validateProvider(provider);

    switch (provider) {
      case 'stripe':
        return this.createStripeCheckout(options);
      case 'paypal':
        return this.createPayPalCheckout(options);
      default:
        throw new APIError(`Unsupported billing provider: ${provider}`);
    }
  }

  async handleWebhook(c: Context<Env, string>, provider: BillingProvider) {
    await this.initialize();

    this.validateProvider(provider);

    switch (provider) {
      case 'stripe':
        return this.handleStripeWebhook(c);
      case 'paypal':
        return this.handlePayPalWebhook(c);
      default:
        throw new APIError(`Unsupported billing provider: ${provider}`);
    }
  }
}

export default PaymentService.getInstance();

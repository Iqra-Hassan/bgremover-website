'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useBillingSettings } from './use-billing';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SettingsLoader from '@/components/skeletons/settings-loader';
import { currencies, paypalCurrencies } from '@/data/currencies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { PasswordInput } from '@/components/ui/password-input';
import {
  billingProviders,
  getBillingProviderLabel,
  paypalModes,
  getPaypalModeLabel,
} from '@/data/constans';
import { Input } from '@/components/ui/input';
import CopyButton from '@/components/ui/copy-button';

const BillingSettings = () => {
  const { form, onSubmit, isPending, isLoading } = useBillingSettings();
  const selectedProvider = form.watch('provider');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Billing Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your billing provider and payment settings.
        </p>
      </div>
      {isLoading ? (
        <SettingsLoader />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="provider"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Provider</FormLabel>
                    <Select
                      onValueChange={(e) => {
                        if (e) {
                          field.onChange(e);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a billing provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {getBillingProviderLabel(provider)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred billing provider for processing payments.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Combobox
                      options={
                        selectedProvider === 'paypal'
                          ? paypalCurrencies.map((currency) => ({
                              label: `${currency.code} - ${currency.description}`,
                              value: currency.code,
                            }))
                          : currencies.map((currency) => ({
                              label: `${currency.code} - ${currency.description}`,
                              value: currency.code,
                            }))
                      }
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Select a currency"
                    />
                    <FormDescription>The currency used for all transactions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProvider === 'stripe' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stripe Configuration</CardTitle>
                    <CardDescription>
                      Configure your Stripe API keys and webhook settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      isRequired
                      name="stripeSecretKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret Key</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="sk_live_..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      isRequired
                      name="stripeWebhookSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Secret</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="whsec_..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <div className="relative">
                        <Input
                          className="pr-10"
                          disabled
                          value={`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/webhook/stripe`}
                        />
                        <CopyButton
                          textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/webhook/stripe`}
                          className="absolute top-1/2 right-1 -translate-y-1/2"
                        />
                      </div>
                    </FormItem>
                  </CardContent>
                </Card>
              )}
              {selectedProvider === 'paypal' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paypal Configuration</CardTitle>
                    <CardDescription>
                      Configure your Paypal API keys and webhook settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      isRequired
                      name="paypalMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(e) => {
                                if (e) {
                                  field.onChange(e);
                                }
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paypalModes.map((mode) => (
                                  <SelectItem key={mode} value={mode}>
                                    {getPaypalModeLabel(mode)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>Your Paypal mode (sandbox or live).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      isRequired
                      name="paypalClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      isRequired
                      name="paypalClientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <PasswordInput {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      isRequired
                      name="paypalWebhookId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook ID</FormLabel>
                          <FormControl>
                            <PasswordInput {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <div className="relative">
                        <Input
                          className="pr-10"
                          disabled
                          value={`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/webhook/paypal`}
                        />
                        <CopyButton
                          textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/webhook/paypal`}
                          className="absolute top-1/2 right-1 -translate-y-1/2"
                        />
                      </div>
                    </FormItem>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="mt-2">
              <Button size="lg" isLoading={isPending} type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default BillingSettings;

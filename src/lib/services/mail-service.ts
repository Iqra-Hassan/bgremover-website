import nodemailer from 'nodemailer';
import APIError from '../api-error';
import settingsService from '@/server/settings/setting-service';
import { SettingsDataMap } from '@/server/settings/setting-schema';

export interface MailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class MailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter | null = null;
  private mailSettings: SettingsDataMap['mail'] | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    const settings = await settingsService.getSetting('mail');
    this.mailSettings = settings;
    this.initialized = true;
  }

  async setMailSettings(settings: SettingsDataMap['mail'] | null) {
    this.mailSettings = settings;
    this.initialized = true;
    // Reset transporter when settings change
    this.transporter = null;
  }

  private async createTransporter(): Promise<nodemailer.Transporter> {
    if (!this.mailSettings) {
      throw new APIError('Mail settings not found. Please configure mail settings in admin panel.');
    }

    if (!this.mailSettings.enableMail) {
      throw new APIError('Mail service is disabled. Please enable it in admin panel.');
    }

    if (
      !this.mailSettings.smtpHost ||
      !this.mailSettings.smtpUser ||
      !this.mailSettings.smtpPassword
    ) {
      throw new APIError(
        'Mail configuration is incomplete. Please check SMTP settings in admin panel.',
      );
    }

    const mailConfig = {
      host: this.mailSettings.smtpHost,
      port: this.mailSettings.smtpPort || 587,
      secure: this.mailSettings.smtpSecure || false,
      auth: {
        user: this.mailSettings.smtpUser,
        pass: this.mailSettings.smtpPassword,
      },
    };

    return nodemailer.createTransport(mailConfig);
  }

  async sendMail(options: MailOptions): Promise<nodemailer.SentMessageInfo> {
    await this.initialize();

    if (!this.transporter) {
      this.transporter = await this.createTransporter();
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from:
        options.from ||
        `${this.mailSettings?.senderName || 'System'} <${this.mailSettings?.senderEmail || this.mailSettings?.smtpUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error(error);
      throw new APIError(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async verifyConnection(): Promise<boolean> {
    await this.initialize();

    if (!this.transporter) {
      this.transporter = await this.createTransporter();
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      throw new APIError(
        `Mail connection verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  isMailEnabled(): boolean {
    return this.mailSettings?.enableMail || false;
  }

  getMailSettings(): SettingsDataMap['mail'] | null {
    return this.mailSettings;
  }
}

export default MailService.getInstance();

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    // Debug log SMTP configuration (mask password)
    console.log('SMTP Configuration:', {
      user: smtpUser,
      pass: smtpPass ? '****' : 'not set'
    });

    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP_USER and SMTP_PASS must be set in environment variables');
    }

    // Create Gmail SMTP transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',  // Use Gmail service
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,     // Use TLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      debug: true,      // Show debug logs
    });
  }

  async sendPasswordResetEmail(
    toEmail: string,
    resetToken: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get('FROM_EMAIL', 'no-reply@genstone.app'),
      to: toEmail,
      subject: 'Reset Your Password - GemStone',
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested to reset your password. Here is your 4-digit reset code:</p>
        <h2 style="font-family: monospace; font-size: 36px; letter-spacing: 8px; background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px;">${resetToken}</h2>
        <p>Enter this 4-digit code in the app to reset your password.</p>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    };

    try {
      // Verify SMTP connection first
      await this.transporter.verify();
      // Then send email
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email. SMTP Error: ' + error.message);
    }
  }
}
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service
 * Handles all email sending functionality
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize nodemailer transporter
     */
    initializeTransporter() {
        try {
            // Check if email configuration exists
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                logger.warn('Email configuration not set. Email service will be disabled.');
                return;
            }

            this.transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify connection
            this.transporter.verify((error, success) => {
                if (error) {
                    logger.error('Email transporter verification failed:', error.message);
                } else {
                    logger.info('Email transporter initialized successfully');
                }
            });
        } catch (error) {
            logger.error('Failed to initialize email transporter:', error.message);
        }
    }

    /**
     * Check if email service is enabled
     */
    isEnabled() {
        return this.transporter !== null;
    }

    /**
     * Send email
     */
    async sendEmail(to, subject, html, text = null) {
        if (!this.isEnabled()) {
            logger.warn('Email service is disabled. Email not sent.');
            return null;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@kigalifarms.com',
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '')
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            logger.info(`Email sent to ${to}`, {
                messageId: info.messageId,
                subject
            });

            return info;
        } catch (error) {
            logger.error(`Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }

    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(email, name, role, password) {
        const subject = 'Welcome to Mushroom Farm Management System';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2d7d46; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .credentials { background: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background: #2d7d46; color: white; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Mushroom Farm!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Your account has been created successfully in the Mushroom Farm Information Management System.</p>
                        
                        <div class="credentials">
                            <h3>Your Login Credentials:</h3>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Password:</strong> ${password}</p>
                            <p><strong>Role:</strong> ${role}</p>
                        </div>
                        
                        <p><strong>Important:</strong> Please change your password after your first login.</p>
                        
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.API_URL || 'http://localhost:5000'}/login" class="button">Login to System</a>
                        </p>
                        
                        <p>If you have any questions, please contact the system administrator.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Mushroom Farm Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, name, resetToken) {
        const resetUrl = `${process.env.API_URL || 'http://localhost:5000'}/reset-password/${resetToken}`;
        const subject = 'Password Reset Request - Mushroom Farm';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2d7d46; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .credentials { background: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background: #2d7d46; color: white; text-decoration: none; border-radius: 5px; }
                    .warning { color: #d9534f; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>We received a request to reset your password for the Mushroom Farm Information Management System.</p>
                        
                        <div class="credentials">
                            <p>Click the button below to reset your password:</p>
                            <p style="text-align: center; margin: 20px 0;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </p>
                            <p style="text-align: center; font-size: 14px;">
                                Or copy and paste this link in your browser:<br>
                                <a href="${resetUrl}">${resetUrl}</a>
                            </p>
                        </div>
                        
                        <p class="warning"><strong>Note:</strong> This link will expire in 1 hour.</p>
                        
                        <p>If you did not request a password reset, please ignore this email or contact the system administrator immediately.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Mushroom Farm Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    /**
     * Send notification email
     */
    async sendNotificationEmail(email, name, title, message, link = null) {
        const subject = `[Mushroom Farm] ${title}`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2d7d46; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background: #2d7d46; color: white; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${title}</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>${message}</p>
                        
                        ${link ? `
                            <p style="text-align: center; margin-top: 30px;">
                                <a href="${link}" class="button">View Details</a>
                            </p>
                        ` : ''}
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Mushroom Farm Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    /**
     * Send daily digest email
     */
    async sendDigestEmail(email, name, notifications) {
        const subject = `[Mushroom Farm] Daily Digest - ${new Date().toLocaleDateString()}`;
        
        let notificationList = '';
        notifications.forEach((notification, index) => {
            notificationList += `
                <div style="padding: 10px; margin: 10px 0; background: #fff; border-left: 4px solid ${notification.priority === 'urgent' ? '#d9534f' : '#2d7d46'};">
                    <p><strong>${index + 1}. ${notification.title}</strong></p>
                    <p>${notification.message}</p>
                    ${notification.link ? `<p><a href="${notification.link}">View Details</a></p>` : ''}
                    <p style="font-size: 12px; color: #666;">${new Date(notification.createdAt).toLocaleString()}</p>
                </div>
            `;
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2d7d46; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Daily Digest</h1>
                        <p>${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Here is your daily summary of notifications from the Mushroom Farm Management System.</p>
                        
                        <h3>Notifications (${notifications.length})</h3>
                        ${notificationList}
                        
                        <p style="margin-top: 30px;">
                            <a href="${process.env.API_URL || 'http://localhost:5000'}/notifications">View All Notifications</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Mushroom Farm Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    /**
     * Send invoice email to customer
     */
    async sendInvoiceEmail(email, name, invoiceNumber, totalAmount, invoiceLink) {
        const subject = `Invoice #${invoiceNumber} - Mushroom Farm`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2d7d46; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .amount { font-size: 24px; font-weight: bold; color: #2d7d46; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background: #2d7d46; color: white; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Invoice #${invoiceNumber}</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Thank you for your order. Please find your invoice details below:</p>
                        
                        <div style="background: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd; text-align: center;">
                            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                            <p><strong>Total Amount:</strong> <span class="amount">${totalAmount} RWF</span></p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="${invoiceLink}" class="button">View Full Invoice</a>
                        </p>
                        
                        <p>If you have any questions about this invoice, please contact our sales team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Mushroom Farm Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }
}

module.exports = new EmailService();
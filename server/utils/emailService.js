import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    // For production, use your email service (Gmail, SendGrid, etc.)
    // For development/testing, use Ethereal (fake SMTP)

    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Development - use Ethereal (fake emails, viewable in browser)
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER || 'test@ethereal.email',
                pass: process.env.ETHEREAL_PASS || 'testpass'
            }
        });
    }
};

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"MFMS - Mess Food Management" <${process.env.SMTP_USER || 'noreply@mfms.com'}>`,
        to: email,
        subject: '✅ Verify Your Email - MFMS',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to MFMS! 🍽️</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #111827;">Hi ${name}! 👋</h2>
                    <p style="color: #4b5563; line-height: 1.6;">
                        Thank you for registering with Mess Food Management System. 
                        Please verify your email to complete your registration.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        If the button doesn't work, copy and paste this link in your browser:<br>
                        <a href="${verificationUrl}" style="color: #10b981;">${verificationUrl}</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                        This link expires in 24 hours. If you didn't create an account, please ignore this email.
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);

        // In development, log the preview URL
        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"MFMS - Mess Food Management" <${process.env.SMTP_USER || 'noreply@mfms.com'}>`,
        to: email,
        subject: '🔐 Reset Your Password - MFMS',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Password Reset 🔒</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #111827;">Hi ${name}! 👋</h2>
                    <p style="color: #4b5563; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to create a new password.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        If the button doesn't work, copy and paste this link in your browser:<br>
                        <a href="${resetUrl}" style="color: #ef4444;">${resetUrl}</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                        This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);

        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

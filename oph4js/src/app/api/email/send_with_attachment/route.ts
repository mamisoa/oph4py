import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import type { APIResponse, EmailWithAttachmentRequest } from '@/lib/types/api';
import { SMTP_CONFIG } from '@/lib/config/email';

// Validation schema for email with attachment
const EmailWithAttachmentSchema = z.object({
  recipient: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  content: z.string().optional(),
  sender_name: z.string().optional(),
  attachmentName: z.string(),
  attachmentData: z.string(),
  attachmentType: z.string().default("application/pdf")
});

/**
 * POST handler to send an email with attachment
 * Mirrors py4web's api/email/send_with_attachment endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = EmailWithAttachmentSchema.parse(body);
    
    // Extract parameters
    const { 
      recipient, 
      subject = SMTP_CONFIG.DEFAULT_SUBJECT, 
      content = SMTP_CONFIG.DEFAULT_CONTENT,
      sender_name = SMTP_CONFIG.DEFAULT_SENDER_NAME,
      attachmentName,
      attachmentData,
      attachmentType
    } = validatedData;
    
    // Validate attachment data - check Base64 format
    let decodedAttachment: Buffer;
    try {
      // Try decoding the base64 data
      decodedAttachment = Buffer.from(attachmentData, 'base64');
      
      // Check if it's too large (rough estimate, ~10MB limit)
      if (decodedAttachment.length > 10000000) {
        return NextResponse.json({
          status: 'error',
          message: 'Attachment too large (max 10MB)',
          error_type: 'file_too_large'
        }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid attachment data format',
        error_type: 'validation_error'
      }, { status: 400 });
    }
    
    // Create HTML email template
    const htmlTemplate = `
      <html>
        <body>
          <div>${content}</div>
          <br>
          <p>Cordialement,<br>Vriendelijke groeten,<br>Best regards,</p>
          <table>
            <tr>
              <td><img src="${SMTP_CONFIG.COMPANY_LOGO}" alt="Company Logo" style="max-width: 100px;"></td>
              <td>
                <p>${sender_name}<br>${SMTP_CONFIG.DEFAULT_SENDER_QUALITY}</p>
              </td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #666;">
            The contents of this e-mail are intended for the named addressee only. It contains information which may be confidential and which may also be privileged. Any non-conform use, dissemination or disclosure of this message is prohibited. If you received it in error, please notify us immediately and then destroy it.
          </p>
        </body>
      </html>
    `;
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.SMTP_SERVER,
      port: SMTP_CONFIG.SMTP_PORT,
      secure: SMTP_CONFIG.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_CONFIG.SMTP_USER,
        pass: SMTP_CONFIG.SMTP_PASSWORD,
      },
    });
    
    // Create email with attachment
    const mailOptions = {
      from: `"${sender_name}" <${SMTP_CONFIG.SMTP_USER}>`,
      to: recipient,
      subject,
      html: htmlTemplate,
      attachments: [
        {
          filename: attachmentName,
          content: decodedAttachment,
          contentType: attachmentType
        }
      ]
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // Create success response
    const response: APIResponse = {
      status: 'success',
      message: 'Email with attachment sent successfully',
      data: {
        subject,
        recipient,
        attachmentName,
        messageId: info.messageId,
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error sending email with attachment:', error);
    
    // Create appropriate error response
    if (error instanceof z.ZodError) {
      const errorResponse: APIResponse = {
        status: 'error',
        message: 'Validation error',
        error_type: 'validation_error',
        data: error.errors
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Check if it's an SMTP error
    if (error instanceof Error && error.message.includes('SMTP')) {
      const errorResponse: APIResponse = {
        status: 'error',
        message: error.message,
        error_type: 'smtp_error'
      };
      
      return NextResponse.json(errorResponse, { status: 500 });
    }
    
    // Generic server error
    const errorResponse: APIResponse = {
      status: 'error',
      message: 'Failed to send email with attachment',
      error_type: 'server_error'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 
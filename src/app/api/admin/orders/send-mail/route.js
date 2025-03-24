import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
// src/app/api/admin/orders/send-mail/route.js
/**
 * @swagger
 *  /api/admin/orders/send-mail:
 *   post:
 *     summary: Send an email to a customer about their order
 *     description: Sends an email to a customer about their order status and payment details
 *     body:
 *       required:
 *         - email
 *         - subject
 *         - orderNumber
 *         - status
 *         - paymentStatus
 * */

export async function POST(request) {
  try {
    // Authenticate admin
    const { authenticated, response: authResponse } = await authenticateAdmin(request);
    if (!authenticated) {
      return authResponse;
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const { email, subject, orderNumber, status, paymentStatus } = requestData;

    if (!email || !subject || !orderNumber) {
      return errorResponse('Email, subject, and orderNumber are required', 400);
    }

    // Send email using Brevo API
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return errorResponse("Email service is not configured", 500);
    }

    const emailData = {
      sender: {
        name: "DaWa Dukaan Support",
        email: "dawadukaan7@gmail.com"
      },
      to: [{ email }],
      subject: subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.jpg" alt="DaWa Dukaan Logo" style="max-width: 100px; border-radius: 50%;">
            <h1 style="color: #4a5568; margin-top: 10px;">Order Update</h1>
          </div>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
            Your order #${orderNumber} has been updated
          </p>
          
          ${status ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-radius: 5px;">
            <p style="margin: 0; color: #4a5568;">
              <strong>Order Status:</strong> ${status}
            </p>
          </div>
          ` : ''}
          
          ${paymentStatus ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-radius: 5px;">
            <p style="margin: 0; color: #4a5568;">
              <strong>Payment Status:</strong> ${paymentStatus}
            </p>
          </div>
          ` : ''}
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-top: 30px;">
            Thank you for shopping with us!
          </p>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
            Best regards,<br>DaWa Dukaan Team
          </p>
        </div>
      `,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailData),
    });

    const emailResult = await response.json();
    if (!response.ok) {
      throw new Error(emailResult.message || 'Failed to send email');
    }

    return successResponse({
      message: "Email sent successfully"
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return errorResponse("Failed to send email", 500);
  }
} 
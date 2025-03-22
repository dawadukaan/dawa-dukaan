// src/app/api/auth/forgot-password/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import AdminUser from "@/lib/db/models/AdminUser";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";


// Forgot password route - api endpoint -> /api/auth/forgot-password
// request body -> { email: "user@example.com" }
export async function POST(request) {
  try {
    await dbConnect();
    
    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return errorResponse('Invalid JSON in request body', 400);
    }
    
    const { email, otp } = requestData || {};
    
    if (!email) {
      return errorResponse("Email is required", 400);
    }

    if (!otp) {
      return errorResponse("OTP is required", 400);
    }
    
    // Check if user exists (first in AdminUser, then in User)
    let user = await AdminUser.findOne({ email });
    let userModel = 'AdminUser';
    
    if (!user) {
      user = await User.findOne({ email });
      userModel = 'User';
      
      if (!user) {
        return errorResponse("No account found with this email", 404);
      }
    }
    
    
    // Send email using Brevo API directly
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      console.error("Brevo API key is not configured");
      return errorResponse("Email service is not configured", 500);
    }
    
    const emailData = {
      sender: {
        name: "DaWa Dukaan Support",
        email: "dawadukaan7@gmail.com"
      },
      to: [{ email }],
      subject: "Reset Your DaWa Dukaan App Password",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.jpg" alt="DaWa Dukaan Logo" style="max-width: 100px; border-radius: 50%;">
            <h1 style="color: #4a5568; margin-top: 10px;">Password Reset</h1>
          </div>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">We received a request to reset your DaWa Dukaan account password. Your one-time password (OTP) is:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #edf2f7; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</div>
          </div>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">This OTP will expire in 15 minutes. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-top: 30px;">Thank you,<br>DaWa Dukaan Team</p>
        </div>
      `,
    };
    
    try {
      // Send email using Brevo REST API
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
        message: "Password reset OTP has been sent to your email",
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return errorResponse("Failed to send OTP email. Please try again later.", 500);
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("An unexpected error occurred", 500);
  }
}


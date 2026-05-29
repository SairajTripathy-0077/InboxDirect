import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Next.js API Route Handler for bulk email delivery.
 * Path: /api/send-bulk-email
 * 
 * Supports:
 * - Synchronous mode (default): Awaits all email sends and returns a comprehensive delivery receipt.
 * - Background mode (background: true): Returns 202 immediately and processes email queue in background.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { emails, subject, htmlContent, background = false } = body;

    // 1. Inputs validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'emails' array." },
        { status: 400 }
      );
    }
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return NextResponse.json(
        { error: "Missing or invalid email 'subject'." },
        { status: 400 }
      );
    }
    if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim() === '') {
      return NextResponse.json(
        { error: "Missing or invalid 'htmlContent'." },
        { status: 400 }
      );
    }

    // 2. SMTP Environment configuration validation
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.error("[Mailer API Error]: SMTP environment configuration is incomplete.");
      return NextResponse.json(
        { error: "Mailer service is misconfigured. Missing server SMTP credentials in environment." },
        { status: 500 }
      );
    }

    // 3. Transporter Initialization
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465, // True for port 465, false for other ports (like 587)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Bulk email processor helper
    const sendEmails = async () => {
      console.log(`[Mailer API]: Starting transmission to ${emails.length} addresses...`);
      const results = [];
      
      for (const email of emails) {
        try {
          const mailOptions = {
            from: `"InboxDirect Mailer" <${SMTP_USER}>`,
            to: email,
            subject: subject,
            html: htmlContent,
          };

          await transporter.sendMail(mailOptions);
          console.log(`[Mailer API]: Delivered to: ${email}`);
          results.push({ email, status: 'success' });

          // Respectful throttle: 1 second delay between deliveries to maintain high IP reputation
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`[Mailer API]: Failed transmission to ${email}:`, error.message);
          results.push({ email, status: 'failed', error: error.message });
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      console.log(`[Mailer API]: Finished processing bulk queue. Successes: ${successCount}/${emails.length}`);
      return results;
    };

    // --- Execution Dispatcher ---
    
    // Background execution mode
    if (background) {
      // Run the email sending loop asynchronously (fire-and-forget)
      sendEmails().catch(err => {
        console.error("[Mailer API Background Error]:", err);
      });

      return NextResponse.json({
        message: `Broadcast started for ${emails.length} recipients in the background.`,
        mode: "background"
      }, { status: 202 });
    }

    // Synchronous execution mode (recommended for Serverless deployments like Vercel to guarantee delivery)
    const results = await sendEmails();
    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      message: "Mailing process completed.",
      mode: "synchronous",
      stats: {
        total: emails.length,
        success: successCount,
        failure: failureCount
      },
      details: results
    }, { status: 200 });

  } catch (error) {
    console.error("[Mailer API Unhandled Route Error]:", error);
    return NextResponse.json(
      { error: "Internal server error occurred.", details: error.message },
      { status: 500 }
    );
  }
}

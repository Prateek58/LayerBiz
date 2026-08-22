import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, _hp, _t } = body;

    // --- Anti-Bot Honeypot & Time-Trap Check ---
    // 1. If invisible honeypot is filled, it is 100% an automated spam bot
    if (_hp) {
      console.warn(`[Anti-Spam] Bot submission blocked via Honeypot trap: ${email}`);
      // Return fake success so bot does not retry
      return NextResponse.json(
        { message: 'Inquiry received and transmitted successfully' },
        { status: 200 }
      );
    }

    // 2. If submitted faster than 1 second (impossible for human typing)
    if (_t && typeof _t === 'number' && Date.now() - _t < 1000) {
      console.warn(`[Anti-Spam] Bot submission blocked via Time-trap: ${email}`);
      return NextResponse.json(
        { message: 'Inquiry received and transmitted successfully' },
        { status: 200 }
      );
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN;

    // 1. Save Inquiry to Strapi Database (CRM Record)
    try {
      await fetch(`${strapiUrl}/api/contact-inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
        },
        body: JSON.stringify({
          data: {
            name,
            email,
            subject: subject || 'No Subject',
            message,
            status: 'new',
          },
        }),
      });
    } catch (strapiErr) {
      console.error('Failed to save contact inquiry to Strapi:', strapiErr);
    }

    // 2. Send Instant Alert Email via Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"LayerBiz Website" <${process.env.EMAIL_USER}>`,
          to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
          replyTo: email,
          subject: `[LayerBiz Inquiry] ${subject || 'New Contact Submission'} from ${name}`,
          text: `
New Inquiry Received on LayerBiz:

Name: ${name}
Email: ${email}
Subject: ${subject || 'N/A'}

Message:
${message}
          `,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
              <h2 style="color: #f97316; margin-top: 0;">New LayerBiz Inquiry</h2>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 4px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
                <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject || 'N/A'}</p>
              </div>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px;">
                <p style="margin-top: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Message:</p>
                <p style="white-space: pre-wrap; line-height: 1.6; margin-bottom: 0;">${message}</p>
              </div>
              <p style="color: #64748b; font-size: 11px; margin-top: 20px;">Hit reply in your email client to respond directly to ${email}.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Error sending contact notification email:', emailErr);
      }
    }

    return NextResponse.json(
      { message: 'Inquiry received and transmitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, _hp, _t } = body;

    // --- Anti-Bot Honeypot & Time-Trap Check ---
    // 1. If invisible honeypot field is filled, it is an automated spam bot
    if (_hp) {
      console.warn(`[Anti-Spam] Newsletter submission blocked via Honeypot trap: ${email}`);
      return NextResponse.json(
        { message: "You're on the list for the next build update." },
        { status: 200 }
      );
    }

    // 2. If submitted faster than 1 second (impossible for humans)
    if (_t && typeof _t === 'number' && Date.now() - _t < 1000) {
      console.warn(`[Anti-Spam] Newsletter submission blocked via Time-trap: ${email}`);
      return NextResponse.json(
        { message: "You're on the list for the next build update." },
        { status: 200 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN;

    // 1. Check if already subscribed in Strapi
    try {
      const checkRes = await fetch(
        `${strapiUrl}/api/newsletter-subscribers?filters[email][$eq]=${encodeURIComponent(email)}`,
        {
          headers: {
            ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
          },
          cache: 'no-store',
        }
      );

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.data && checkData.data.length > 0) {
          return NextResponse.json(
            { message: 'You are already connected to the Alpha Feed!' },
            { status: 200 }
          );
        }
      }
    } catch (checkErr) {
      console.error('Error checking existing subscriber:', checkErr);
    }

    // 2. Save new subscriber to Strapi
    try {
      await fetch(`${strapiUrl}/api/newsletter-subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
        },
        body: JSON.stringify({
          data: {
            email,
            status: 'active',
            subscribedAt: new Date().toISOString(),
          },
        }),
      });
    } catch (saveErr) {
      console.error('Error saving subscriber to Strapi:', saveErr);
    }

    // 3. Admin Notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"LayerBiz Website" <${process.env.EMAIL_USER}>`,
          to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
          subject: `[LayerBiz Alpha Feed] New Subscriber: ${email}`,
          text: `A new user subscribed to the LayerBiz Alpha Feed:\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}`,
        });
      } catch (emailErr) {
        console.error('Error sending subscriber notification:', emailErr);
      }
    }

    return NextResponse.json(
      { message: "You're on the list for the next build update." },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

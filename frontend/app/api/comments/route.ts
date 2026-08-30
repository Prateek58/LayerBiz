import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// In-memory rate limiting map: IP -> array of timestamps
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, limit = 4, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= limit) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// Basic heuristic spam dictionary
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'crypto pump', 'telegram channel',
  'whatsapp group', 'seo ranking service', 'cheap backlinks', 'free followers',
  'onlyfans leak', 'adult dating', 'escort service', 'payday loan'
];

function containsSpam(text: string): boolean {
  const lower = text.toLowerCase();
  for (const keyword of SPAM_KEYWORDS) {
    if (lower.includes(keyword)) return true;
  }
  // Count URLs in content
  const urlMatches = text.match(/https?:\/\/[^\s]+/gi) || [];
  if (urlMatches.length > 2) return true; // Too many links = likely SEO spam
  return false;
}

// Fallback local memory storage for resilient zero-downtime comments
const localFallbackComments: Array<{
  id: string;
  postSlug: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  status: string;
}> = [];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
    }

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN;

    let comments: any[] = [];

    try {
      const res = await fetch(
        `${strapiUrl}/api/comments?filters[postSlug][$eq]=${encodeURIComponent(slug)}&filters[status][$eq]=approved&sort=createdAt:desc`,
        {
          headers: {
            ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
          },
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          comments = json.data.map((item: any) => {
            const raw = item.attributes || item;
            // Generate avatar seed/initials from name
            const initials = (raw.name || 'U')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return {
              id: item.documentId || item.id || String(Math.random()),
              name: raw.name || 'Anonymous',
              content: raw.content || '',
              createdAt: raw.createdAt || item.createdAt || new Date().toISOString(),
              initials,
            };
          });
        }
      }
    } catch (strapiErr) {
      console.warn('[Comments API] Strapi unreachable, using local fallback:', strapiErr);
    }

    // Include local fallback comments for this post if any
    const localMatches = localFallbackComments
      .filter(c => c.postSlug === slug && c.status === 'approved')
      .map(c => ({
        id: c.id,
        name: c.name,
        content: c.content,
        createdAt: c.createdAt,
        initials: (c.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      }));

    const combined = [...comments, ...localMatches].filter(
      (v, i, a) => a.findIndex(t => t.id === v.id) === i
    );

    return NextResponse.json({ comments: combined });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ comments: [] }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Rate Limiting: Max 4 submissions per minute per IP
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before posting again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { postSlug, name, email, content, _hp, _website_hp, _t, _challengeAns, _challengeExpected } = body;

    // --- Anti-Bot Defense Layer 1: Honeypot Check ---
    if (_hp || _website_hp) {
      console.warn(`[Anti-Spam] Comment blocked via Honeypot trap from: ${email || 'unknown'}`);
      return NextResponse.json(
        { message: 'Your comment has been submitted and is pending verification.' },
        { status: 200 }
      );
    }

    // --- Anti-Bot Defense Layer 2: Time-Trap Check (< 2500ms) ---
    if (_t && typeof _t === 'number' && Date.now() - _t < 2500) {
      console.warn(`[Anti-Spam] Comment blocked via Time-Trap (<2.5s) from: ${email || 'unknown'}`);
      return NextResponse.json(
        { message: 'Your comment has been submitted and is pending verification.' },
        { status: 200 }
      );
    }

    // --- Anti-Bot Defense Layer 3: Proof-of-Human Challenge ---
    if (
      _challengeAns === undefined ||
      _challengeExpected === undefined ||
      String(_challengeAns).trim() !== String(_challengeExpected).trim()
    ) {
      return NextResponse.json(
        { error: 'Human verification challenge failed. Please solve the calculation to submit.' },
        { status: 400 }
      );
    }

    // --- Validation ---
    if (!postSlug || !name || !email || !content) {
      return NextResponse.json(
        { error: 'All fields (Name, Email, Comment) are required.' },
        { status: 400 }
      );
    }

    if (!email.includes('@') || email.length < 5) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 3) {
      return NextResponse.json(
        { error: 'Comment must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 3000) {
      return NextResponse.json(
        { error: 'Comment cannot exceed 3000 characters.' },
        { status: 400 }
      );
    }

    // --- Anti-Bot Defense Layer 4: Heuristic Keyword & Link Spam Filter ---
    if (containsSpam(trimmedContent) || containsSpam(name)) {
      console.warn(`[Anti-Spam] Comment blocked via heuristic spam analysis from: ${email}`);
      return NextResponse.json(
        { message: 'Your comment has been submitted for administrative review.' },
        { status: 200 }
      );
    }

    const createdAt = new Date().toISOString();
    const cleanName = name.trim().slice(0, 80);
    const cleanContent = trimmedContent;
    const commentId = `comm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // 1. Save to Strapi
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN;

    try {
      await fetch(`${strapiUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
        },
        body: JSON.stringify({
          data: {
            postSlug,
            name: cleanName,
            email,
            content: cleanContent,
            status: 'approved',
          },
        }),
      });
    } catch (strapiErr) {
      console.error('[Comments API] Error saving to Strapi:', strapiErr);
      // Retain in local fallback buffer
      localFallbackComments.unshift({
        id: commentId,
        postSlug,
        name: cleanName,
        email,
        content: cleanContent,
        createdAt,
        status: 'approved',
      });
    }

    // 2. Send Admin Notification Email
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
          subject: `[LayerBiz Comments] New Comment on "${postSlug}" from ${cleanName}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
              <h2 style="color: #f97316; margin-top: 0;">New Reader Comment Received</h2>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 4px 0;"><strong>Article Slug:</strong> <code style="color: #38bdf8;">${postSlug}</code></p>
                <p style="margin: 4px 0;"><strong>Author:</strong> ${cleanName}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
                <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px;">
                <p style="margin-top: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Comment Body:</p>
                <p style="white-space: pre-wrap; line-height: 1.6; margin-bottom: 0;">${cleanContent}</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('[Comments API] Notification email error:', emailErr);
      }
    }

    const initials = cleanName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return NextResponse.json(
      {
        message: 'Comment published successfully.',
        comment: {
          id: commentId,
          name: cleanName,
          content: cleanContent,
          createdAt,
          initials,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { error: 'Failed to post comment. Please try again.' },
      { status: 500 }
    );
  }
}

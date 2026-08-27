import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Optional secret verification if configured in .env
    const envSecret = process.env.REVALIDATION_TOKEN || process.env.REVALIDATE_SECRET;
    if (envSecret && secret !== envSecret) {
      return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const model = body.model || body.uid;
    const entry = body.entry;

    // Purge global collections
    revalidateTag('blog-posts');
    revalidateTag('about-page');
    revalidatePath('/blog');
    revalidatePath('/about');
    revalidatePath('/');

    // Purge specific article if slug/id provided
    if (entry?.slug) {
      revalidateTag(`blog-post-${entry.slug}`);
      revalidatePath(`/blog/${entry.slug}`);
    }
    if (entry?.documentId) {
      revalidateTag(`blog-post-${entry.documentId}`);
      revalidatePath(`/blog/${entry.documentId}`);
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      model: model || 'all',
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Error revalidating', error: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Allow simple GET trigger for testing or manual cache clearing
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');

  const envSecret = process.env.REVALIDATION_TOKEN || process.env.REVALIDATE_SECRET;
  if (envSecret && secret !== envSecret) {
    return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 });
  }

  if (tag) {
    revalidateTag(tag);
  } else if (path) {
    revalidatePath(path);
  } else {
    revalidateTag('blog-posts');
    revalidateTag('about-page');
    revalidatePath('/blog');
    revalidatePath('/');
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Vercel Cron Job Route
 * Purpose: Keeps the Supabase project active by generating database activity.
 * Schedule: Configured in vercel.json
 */
export async function GET(request: Request) {
  // 1. Verify the request is coming from Vercel's Cron scheduler
  // This uses a secret set in Vercel environment variables
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Initialize Supabase client
  // Using direct environment variables to avoid session/cookie dependencies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3. Perform the "ping" (querying counts)
  // These requests counts as "activity" for Supabase's monitoring
  const tables = ['quizzes', 'questions', 'profiles', 'folders'];
  const results: Record<string, string> = {};

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      results[table] = error ? `Sent (Access: ${error.message})` : 'Success';
    } catch (e: any) {
      results[table] = `Failed: ${e.message}`;
    }
  }

  return NextResponse.json({ 
    message: 'Supabase activity generated successfully',
    timestamp: new Date().toISOString(),
    results 
  });
}

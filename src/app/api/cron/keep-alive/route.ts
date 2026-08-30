import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Keep-Alive / Heartbeat Cron Route
 * Purpose: Prevents Supabase project from pausing due to inactivity (7-day inactivity limit).
 * Triggers:
 *  - Vercel Cron (Daily via vercel.json)
 *  - GitHub Actions (.github/workflows/keep-alive.yml)
 *  - External Cron / Manual Ping (?key=CRON_SECRET)
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get('key');

  // Verify authentication if CRON_SECRET is configured
  if (cronSecret) {
    const isBearerMatch = authHeader === `Bearer ${cronSecret}`;
    const isQueryMatch = queryKey === cronSecret;
    if (!isBearerMatch && !isQueryMatch) {
      return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server misconfiguration: Supabase environment variables missing' },
      { status: 500 }
    );
  }

  // Initialize Supabase client directly
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ping key application tables
  const tables = [
    'quizzes',
    'questions',
    'profiles',
    'folders',
    'invitation_codes',
    'ai_chat_sessions',
    'halaqat',
    'halaqah_members'
  ];

  const results: Record<string, { status: string; latencyMs: number }> = {};
  let totalSuccess = 0;

  for (const table of tables) {
    const start = Date.now();
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      const latency = Date.now() - start;
      if (error) {
        // Even if RLS denies full access, reaching PostgREST counts as active traffic for Supabase
        results[table] = { status: `Reached (RLS/Access: ${error.message})`, latencyMs: latency };
      } else {
        results[table] = { status: 'Success (200 OK)', latencyMs: latency };
      }
      totalSuccess++;
    } catch (e: any) {
      const latency = Date.now() - start;
      results[table] = { status: `Failed: ${e.message}`, latencyMs: latency };
    }
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Supabase heartbeat activity generated successfully',
    timestamp: new Date().toISOString(),
    tables_pinged: `${totalSuccess}/${tables.length}`,
    results
  });
}

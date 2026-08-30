/**
 * Direct Supabase Activity / Heartbeat Generator
 * 
 * Works both in GitHub Actions (via process.env) and locally (reads .env.local).
 * Uses native fetch (Node 18+) with zero external dependencies to query Supabase REST API.
 */

const fs = require('fs');
const path = require('path');

let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// If not provided in environment variables, check .env.local
if (!supabaseUrl || !supabaseKey) {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
        if ((key === 'NEXT_PUBLIC_SUPABASE_URL' || key === 'SUPABASE_URL') && !supabaseUrl) {
          supabaseUrl = val;
        }
        if ((key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || key === 'SUPABASE_ANON_KEY') && !supabaseKey) {
          supabaseKey = val;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read .env.local:', e.message);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase URL or Key is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
  process.exit(1);
}

// Clean up trailing slashes
supabaseUrl = supabaseUrl.replace(/\/+$/, '');

const tablesToPing = [
  'quizzes',
  'questions',
  'profiles',
  'folders',
  'invitation_codes',
  'ai_chat_sessions'
];

async function pingTable(table) {
  const url = `${supabaseUrl}/rest/v1/${table}?select=*&limit=1`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });

    const latency = Date.now() - startTime;
    const countHeader = response.headers.get('content-range');
    
    // Status 200 (OK), 206 (Partial Content), or 401/403/404 all hit PostgREST API and count as activity
    console.log(`  ✓ [${table}] Status: ${response.status} ${response.statusText} (${latency}ms) - Content-Range: ${countHeader || 'N/A'}`);
    return { table, status: response.status, ok: true, latency };
  } catch (error) {
    console.error(`  ✗ [${table}] Request failed: ${error.message}`);
    return { table, status: 0, ok: false, error: error.message };
  }
}

async function run() {
  console.log('====================================================');
  console.log('🚀 Starting Supabase Heartbeat Ping');
  console.log(`Target: ${supabaseUrl}`);
  console.log(`Time:   ${new Date().toISOString()}`);
  console.log('====================================================');

  const results = [];
  for (const table of tablesToPing) {
    const res = await pingTable(table);
    results.push(res);
  }

  const successCount = results.filter(r => r.ok).length;
  console.log('====================================================');
  console.log(`📊 Completed: ${successCount}/${tablesToPing.length} tables pinged successfully.`);
  console.log('====================================================');

  if (successCount === 0) {
    console.error('❌ Failed to reach any Supabase endpoints.');
    process.exit(1);
  } else {
    console.log('✅ Supabase activity generated successfully. Project is active!');
  }
}

run();

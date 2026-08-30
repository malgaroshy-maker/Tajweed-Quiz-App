/**
 * Comprehensive Supabase Database Health & Performance Diagnostic Tool
 */

const fs = require('fs');
const path = require('path');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Load .env.local
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !supabaseUrl) supabaseUrl = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !anonKey) anonKey = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY' && !serviceKey) serviceKey = val;
    }
  }
} catch (e) {
  console.error('Error reading .env.local:', e);
}

supabaseUrl = supabaseUrl.replace(/\/+$/, '');

const expectedTables = [
  'profiles',
  'folders',
  'quizzes',
  'questions',
  'options',
  'attempts',
  'attempt_answers',
  'invitation_codes',
  'ai_chat_sessions',
  'ai_chat_messages',
  'most_missed_questions'
];

async function apiRequest(endpoint, key = anonKey, options = {}) {
  const start = Date.now();
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'count=exact',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const latency = Date.now() - start;
    let data = null;
    try {
      data = await res.json();
    } catch (_) {}
    return { status: res.status, ok: res.ok, latency, data, headers: res.headers };
  } catch (err) {
    return { status: 0, ok: false, latency: Date.now() - start, error: err.message };
  }
}

async function checkStorageBucket(bucketName) {
  const start = Date.now();
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const latency = Date.now() - start;
    let data = null;
    try { data = await res.json(); } catch (_) {}
    return { status: res.status, ok: res.ok, latency, data };
  } catch (err) {
    return { status: 0, ok: false, latency: Date.now() - start, error: err.message };
  }
}

async function runHealthCheck() {
  console.log('===============================================================');
  console.log('🔍 SUPABASE DATABASE HEALTH & PERFORMANCE AUDIT');
  console.log(`Endpoint: ${supabaseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('===============================================================\n');

  console.log('--- 1. TABLE HEALTH & RECORD COUNTS ---');
  const tableResults = [];
  for (const table of expectedTables) {
    const res = await apiRequest(`${table}?select=*&limit=1`);
    const contentRange = res.headers ? res.headers.get('content-range') : null;
    const totalCount = contentRange ? contentRange.split('/')[1] : 'N/A';
    
    let statusLabel = '✅ OK';
    if (res.status === 404) statusLabel = '❌ MISSING (404)';
    else if (res.status === 401 || res.status === 403) statusLabel = '🔒 RLS Restricted';
    else if (!res.ok && res.status !== 206) statusLabel = `⚠️ Warning (${res.status})`;

    console.log(`• ${table.padEnd(24)} | Status: ${res.status.toString().padEnd(3)} (${statusLabel.padEnd(16)}) | Rows: ${totalCount.toString().padEnd(6)} | Latency: ${res.latency}ms`);
    tableResults.push({ table, status: res.status, totalCount, latency: res.latency });
  }

  console.log('\n--- 2. PERFORMANCE & QUERY LATENCY BENCHMARK ---');
  // Test common frontend queries
  const queriesToBenchmark = [
    { name: 'Fetch Published Quizzes', endpoint: 'quizzes?select=id,title,share_code,is_published&is_published=eq.true' },
    { name: 'Lookup Quiz by Share Code', endpoint: 'quizzes?select=id,title,questions(id,text,type,options(id,text))&share_code=eq.DEMO01' },
    { name: 'Fetch Questions with Options', endpoint: 'questions?select=id,text,type,options(id,text,is_correct)&limit=10' },
    { name: 'Leaderboard / Attempts count', endpoint: 'attempts?select=id,score,total_questions,guest_name&limit=10' }
  ];

  for (const q of queriesToBenchmark) {
    const res = await apiRequest(q.endpoint);
    const speedRating = res.latency < 200 ? '⚡ Fast' : res.latency < 600 ? '⏱️ Moderate' : '🐢 Slow';
    console.log(`• ${q.name.padEnd(30)} | Latency: ${res.latency}ms (${speedRating}) | Status: ${res.status}`);
  }

  console.log('\n--- 3. STORAGE BUCKET AUDIT ---');
  const storageRes = await checkStorageBucket('quiz-images');
  if (storageRes.ok) {
    console.log(`• Bucket 'quiz-images'        | Status: ✅ Available (${storageRes.latency}ms)`);
  } else {
    console.log(`• Bucket 'quiz-images'        | Status: ⚠️ Not Found / Restricted (${storageRes.status}) - ${JSON.stringify(storageRes.data || storageRes.error)}`);
  }

  console.log('\n--- 4. ENVIRONMENT & CONFIGURATION CHECK ---');
  console.log(`• NEXT_PUBLIC_SUPABASE_URL     : ${supabaseUrl ? '✅ Configured' : '❌ Missing'}`);
  console.log(`• NEXT_PUBLIC_SUPABASE_ANON_KEY : ${anonKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`• SUPABASE_SERVICE_ROLE_KEY    : ${serviceKey ? '✅ Configured' : '⚠️ Missing from .env.local (Required for Teacher Invitation Code generation)'}`);

  console.log('\n===============================================================');
  console.log('📋 SUMMARY & RECOMMENDATIONS');
  console.log('===============================================================');
  
  const missingTables = tableResults.filter(t => t.status === 404).map(t => t.table);
  if (missingTables.length > 0) {
    console.log(`⚠️ Missing Tables detected: ${missingTables.join(', ')}`);
    console.log(`👉 Recommendation: Run the updated database_schema.sql in Supabase SQL Editor.`);
  } else {
    console.log('✅ All core tables are present and queryable.');
  }

  if (!serviceKey) {
    console.log('👉 Recommendation: Add SUPABASE_SERVICE_ROLE_KEY to your .env.local and Vercel environment variables.');
  }
}

runHealthCheck();

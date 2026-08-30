const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    env[k] = v;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectLiveDatabase() {
  console.log('====================================================');
  console.log('🔍 Auditing Live Supabase Database Schema');
  console.log(`URL: ${supabaseUrl}`);
  console.log('====================================================\n');

  const tables = [
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
    'halaqat',
    'halaqah_members'
  ];

  const statusReport = {};

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`Table [${table}] Error: code=${error.code}, message="${error.message}", details="${error.details || ''}"`);
        if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation')) {
          statusReport[table] = { exists: false, error: error.message };
        } else {
          statusReport[table] = { exists: true, accessible: false, message: error.message };
        }
      } else {
        statusReport[table] = { exists: true, accessible: true, rowCount: count };
        console.log(`✅ Table [${table}]: OK (Rows: ${count ?? 0})`);
      }
    } catch (e) {
      statusReport[table] = { exists: false, error: e.message };
      console.log(`❌ Table [${table}]: Exception (${e.message})`);
    }
  }

  console.log('\n--- Checking New Columns on Existing Tables ---');

  // Test new columns on quizzes
  const { error: quizColsErr } = await supabase
    .from('quizzes')
    .select('time_limit_minutes, start_date, end_date, target_halaqah_id, allow_guest, show_answers_after_submission')
    .limit(1);
  console.log(`Quizzes extended columns: ${quizColsErr ? '❌ Missing (' + quizColsErr.message + ')' : '✅ OK'}`);

  // Test new columns on questions
  const { error: questionColsErr } = await supabase
    .from('questions')
    .select('audio_url, surah_number, ayah_number, reciter_id, audio_start_time, audio_end_time, tajweed_rule')
    .limit(1);
  console.log(`Questions extended columns: ${questionColsErr ? '❌ Missing (' + questionColsErr.message + ')' : '✅ OK'}`);

  // Test new columns on attempt_answers
  const { error: answersColsErr } = await supabase
    .from('attempt_answers')
    .select('voice_recording_url, teacher_feedback, teacher_score, graded_at')
    .limit(1);
  console.log(`Attempt Answers extended columns: ${answersColsErr ? '❌ Missing (' + answersColsErr.message + ')' : '✅ OK'}`);

  // Test profiles AI columns
  const { data: profileSample, error: profileColsErr } = await supabase
    .from('profiles')
    .select('gemini_model, openrouter_model, ai_provider')
    .limit(1);
  console.log(`Profiles AI columns: ${profileColsErr ? '❌ Missing (' + profileColsErr.message + ')' : '✅ OK'}`);

  console.log('\n--- Checking Storage Buckets ---');
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  if (bucketErr) {
    console.log(`Storage check: (Anon key restricted - ${bucketErr.message})`);
  } else {
    console.log('Active storage buckets:', buckets.map(b => b.name));
  }

  console.log('\n====================================================');
}

inspectLiveDatabase();

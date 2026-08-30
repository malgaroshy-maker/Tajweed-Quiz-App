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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching live models from OpenRouter...');
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const json = await res.json();

  const freeModels = json.data
    .filter(m => parseFloat(m.pricing?.prompt || '1') === 0 && parseFloat(m.pricing?.completion || '1') === 0)
    .map(m => m.id);

  console.log(`Found ${freeModels.length} live free OpenRouter models.`);
  console.log('Top free models:', freeModels.slice(0, 10));

  console.log('\nChecking Supabase profiles...');
  const { data: profiles, error: selectError } = await supabase
    .from('profiles')
    .select('id, first_name, role, gemini_model, openrouter_model, ai_provider');

  if (selectError) {
    console.error('Failed to query profiles:', selectError.message);
  } else {
    console.log('Current profiles in database:', profiles);

    // Update profiles to use latest modern models
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        gemini_model: 'gemini-3.7-flash',
        openrouter_model: 'auto-quality-free',
        ai_provider: 'gemini'
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // matches all valid uuids
      .select();

    if (updateError) {
      console.error('Failed to update profiles:', updateError.message);
    } else {
      console.log(`Successfully updated ${updated?.length || 0} profiles in Supabase to Gemini 3.7 Flash and auto-quality-free!`);
    }
  }
}

run();

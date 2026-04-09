const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let supabaseUrl = '';
let supabaseKey = '';

// Manually parse .env.local to avoid needing external dependencies like dotenv
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error("Error reading .env.local:", e.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log(`Pinging Supabase project: ${supabaseUrl}`);
  
  // Attempt to query multiple tables
  // Even if they are empty or blocked by RLS, the request counts as activity.
  const tables = ['quizzes', 'questions', 'profiles', 'folders'];
  
  for (const table of tables) {
    console.log(`Sending activity request to table: ${table}...`);
    try {
      // Use head: true to minimize data transfer but still count as a request.
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        // If it's a 401/403, it's fine - activity is still logged at the API layer.
        console.log(`Request completed for ${table}. (Status: ${error.message})`);
      } else {
        console.log(`Successfully reached ${table}. Activity logged.`);
      }
    } catch (e) {
      console.error(`Request to ${table} failed to send:`, e.message);
    }
  }
  
  console.log("Activity generation complete.");
}

run();

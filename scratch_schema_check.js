const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    acc[match[1]] = match[2].replace(/['"\r]/g, '').trim();
  }
  return acc;
}, {});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('doctors').select('*').limit(1);
  if (error) {
    console.error('Error fetching doctors:', error);
  } else {
    if (data.length > 0) {
      console.log('Doctors columns:', Object.keys(data[0]));
    } else {
      console.log('No data in doctors. Forcing error to see schema...');
      const { error: e2 } = await supabase.from('doctors').select('non_existent_col').limit(1);
      console.log('Doctors schema error hint:', e2?.message);
    }
  }

  const { data: d2, error: e2 } = await supabase.from('doctor_departments').select('*').limit(1);
  if (e2) {
    console.error('doctor_departments Error:', e2.message);
  } else {
    console.log('doctor_departments exists!');
    if (d2.length > 0) console.log('doctor_departments cols:', Object.keys(d2[0]));
  }
}

run();

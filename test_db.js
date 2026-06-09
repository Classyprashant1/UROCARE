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

async function test() {
  const { data: doctors } = await supabase.from('doctors').select('*');
  console.log('Doctors:', doctors);

  const { data: depts } = await supabase.from('departments').select('id, name');
  console.log('Depts:', depts);

  const { data: docDepts } = await supabase.from('doctor_departments').select('*');
  console.log('docDepts:', docDepts);

  const { data: appts } = await supabase.from('appointments').select('*');
  console.log('Appts:', appts);
}

test();

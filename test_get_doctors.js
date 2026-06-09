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

async function testGetDoctors() {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      id, 
      first_name, 
      last_name, 
      doctor_departments(departments(id, name))
    `);

  console.log('Raw Data:', JSON.stringify(data, null, 2));

  if (data) {
    const mapped = data.map((d) => {
      const depts = d.doctor_departments?.map((dd) => dd.departments) || [];
      const departmentNames = depts.map((dep) => dep?.name).filter(Boolean).join(', ') || 'General';
      const departmentIds = depts.map((dep) => dep?.id).filter(Boolean);
      return {
        id: d.id,
        name: `Dr. ${d.first_name} ${d.last_name}`,
        department: departmentNames,
        departmentIds: departmentIds,
      };
    });
    console.log('Mapped:', JSON.stringify(mapped, null, 2));
  }
}

testGetDoctors();

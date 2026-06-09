const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbrfzglmmnhfctxsknbz.supabase.co';
const supabaseKey = 'sb_secret_E4IiLkFTLuelMvigdxBLpQ_MKehEhur';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  console.log("=== DIAGNOSTIC REPORT ===");

  console.log("\n--- a) Raw doctor record ---");
  const { data: rawDoctors, error: docError } = await supabase.from('doctors').select('*').limit(2);
  if (docError) console.error("Error fetching doctors:", docError);
  if (rawDoctors && rawDoctors.length > 0) {
      console.log(JSON.stringify(rawDoctors[0], null, 2));
  } else {
      console.log("No doctors found in DB.");
  }

  console.log("\n--- b) Raw doctor_departments record ---");
  const { data: docDepts, error: docDeptError } = await supabase.from('doctor_departments').select('*').limit(2);
  if (docDeptError) console.error("Error fetching doctor_departments:", docDeptError);
  if (docDepts && docDepts.length > 0) {
      console.log(JSON.stringify(docDepts[0], null, 2));
  } else {
      console.log("No doctor_departments found in DB.");
  }

  console.log("\n--- d) Selected department ID ---");
  const { data: departments, error: depError } = await supabase.from('departments').select('*');
  if (depError) console.error("Error fetching departments:", depError);
  const urology = departments?.find(d => d.slug === 'urology' || d.name.toLowerCase().includes('urology'));
  console.log("Urology Department ID:", urology?.id || 'Not Found');

  console.log("\n--- c) Final doctor object returned to BookingForm ---");
  const { data: joinedDoctors, error: joinedError } = await supabase
    .from('doctors')
    .select(`
      id, 
      first_name, 
      last_name, 
      designation, 
      qualifications, 
      experience, 
      languages, 
      bio, 
      phone,
      consultation_fee,
      available_days,
      doctor_departments(departments(id, name))
    `)
    .order('first_name');

  if (joinedError) {
      console.error("Error with joined query:", joinedError);
  } else {
      if (joinedDoctors && joinedDoctors.length > 0) {
          const sample = joinedDoctors[0];
          
          const depts = sample.doctor_departments?.map(dd => dd.departments) || [];
          const departmentNames = depts.map(dep => dep?.name).filter(Boolean).join(', ') || 'General';
          const departmentIds = depts.map(dep => dep?.id).filter(Boolean);

          const mapped = {
            id: sample.id,
            name: `Dr. ${sample.first_name} ${sample.last_name}`,
            department: departmentNames,
            departmentIds: departmentIds,
          };
          console.log(JSON.stringify(mapped, null, 2));
          
          console.log("\n--- e) Filtered doctor count ---");
          if (urology) {
            const filteredCount = joinedDoctors.map(d => {
                const depts = d.doctor_departments?.map(dd => dd.departments) || [];
                return depts.map(dep => dep?.id).filter(Boolean);
            }).filter(ids => ids.includes(urology.id)).length;
            console.log(`Number of mapped doctors in Urology: ${filteredCount}`);
          }
      } else {
          console.log("No doctors returned from joined query.");
      }
  }
}

runDiagnostics();

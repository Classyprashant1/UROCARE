const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbrfzglmmnhfctxsknbz.supabase.co';
const supabaseKey = 'sb_secret_E4IiLkFTLuelMvigdxBLpQ_MKehEhur';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestLeave() {
  const today = new Date().toISOString().split('T')[0];
  
  // Get a doctor
  const { data: doctors } = await supabase.from('doctors').select('id').limit(1);
  if (!doctors || doctors.length === 0) return console.log("No doctors found");
  
  const doctorId = doctors[0].id;
  
  // Insert leave
  const { error } = await supabase.from('doctor_leaves').insert({
    doctor_id: doctorId,
    leave_date: today,
    reason: "Test Leave"
  });
  
  if (error) {
    console.error("Error adding leave:", error);
  } else {
    console.log("Successfully added leave for today!");
  }
}

addTestLeave();

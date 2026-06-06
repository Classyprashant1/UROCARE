const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbrfzglmmnhfctxsknbz.supabase.co';
const supabaseKey = 'sb_secret_E4IiLkFTLuelMvigdxBLpQ_MKehEhur';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDoctorRole() {
  const email = 'doctor@urocare.com';

  const { data: listUsersData } = await supabase.auth.admin.listUsers();
  const existingUser = listUsersData?.users?.find(u => u.email === email);
  
  if (existingUser) {
     console.log('Updating user metadata for:', existingUser.id);
     const { data, error } = await supabase.auth.admin.updateUserById(
       existingUser.id,
       { user_metadata: { role: 'doctor' } }
     );
     
     if (error) {
       console.error('Error updating user:', error.message);
     } else {
       console.log('Successfully updated role to doctor!');
     }
  } else {
     console.log('User not found!');
  }
}

updateDoctorRole();

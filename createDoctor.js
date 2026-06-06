const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbrfzglmmnhfctxsknbz.supabase.co';
const supabaseKey = 'sb_secret_E4IiLkFTLuelMvigdxBLpQ_MKehEhur';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDoctor() {
  const email = 'doctor@urocare.com';
  const password = 'DoctorPass123!';

  // Get or Create Department
  let departmentId;
  const { data: depts, error: deptError } = await supabase.from('departments').select('id').limit(1);
  
  if (depts && depts.length > 0) {
    departmentId = depts[0].id;
    console.log('Using existing department:', departmentId);
  } else {
    console.log('No departments found. Creating a default Urology department...');
    const newDeptId = '11111111-1111-1111-1111-111111111111';
    const { error: newDeptError } = await supabase.from('departments').insert({
      id: newDeptId,
      name: 'Urology',
      slug: 'urology',
      description: 'Comprehensive urological care',
      is_coe: true,
      services: ['Kidney Stone Treatment', 'Prostate Surgery']
    });
    if (newDeptError) {
      console.error('Failed to create department:', newDeptError.message);
      return;
    }
    departmentId = newDeptId;
  }

  // Attempt to fetch the auth user if already registered from previous failed run
  const { data: listUsersData, error: listUsersError } = await supabase.auth.admin.listUsers();
  let userId;
  
  const existingUser = listUsersData?.users?.find(u => u.email === email);
  if (existingUser) {
     console.log('User already exists in auth.users, using ID:', existingUser.id);
     userId = existingUser.id;
  } else {
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating user:', authError.message);
        return;
      }
      userId = authData.user.id;
      console.log('User created with ID:', userId);
  }

  // Delete existing doctor record if any to avoid conflicts
  await supabase.from('doctors').delete().eq('id', userId);

  console.log('Inserting into doctors table...');
  const { error: insertError } = await supabase.from('doctors').insert({
    id: userId,
    department_id: departmentId,
    first_name: 'Sarah',
    last_name: 'Connor',
    phone: '+1987654321',
    designation: 'Senior Urologist',
    qualifications: 'MBBS, MS',
    experience: '12 Years',
    consultation_fee: 1000,
    languages: ['English', 'Hindi'],
    available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    bio: 'Dedicated urologist with over a decade of experience.'
  });

  if (insertError) {
    console.error('Error inserting doctor:', insertError.message);
    return;
  }

  console.log('Successfully created doctor account!');
  console.log(`\nEmail: ${email}\nPassword: ${password}\n`);
}

createDoctor();

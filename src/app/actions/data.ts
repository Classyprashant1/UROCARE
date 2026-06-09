'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { DEPARTMENTS as FallbackDepts, DOCTORS as FallbackDoctors } from '@/lib/data'

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('is_coe', { ascending: false })
    .order('name')

  if (error || !data || data.length === 0) {
    console.warn("Failed to fetch departments from DB, falling back to static data.");
    return FallbackDepts; // Use static data if DB is empty or fails (e.g. before seeding)
  }

  // Force Urology to the top since it's the center of excellence
  const urology = data.find((d: any) => d.slug === 'urology' || d.name.toLowerCase().includes('urology'));
  const others = data.filter((d: any) => d !== urology);
  
  return urology ? [urology, ...others] : data;
}

export async function getDoctors() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
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

    if (error) {
      console.error("Error fetching doctors:", error);
      console.warn("Failed to fetch doctors from DB, falling back to static data.");
      return FallbackDoctors;
    }

    if (!data || data.length === 0) {
      return FallbackDoctors;
    }

    // Map DB data to match the expected format
    return data.map((d: any) => {
      // doctor_departments returns an array of objects: { departments: { id, name } }
      const depts = d.doctor_departments?.map((dd: any) => dd.departments) || [];
      const departmentNames = depts.map((dep: any) => dep?.name).filter(Boolean).join(', ') || 'General';
      const departmentIds = depts.map((dep: any) => dep?.id).filter(Boolean);

      return {
        id: d.id,
        name: `Dr. ${d.first_name} ${d.last_name}`,
        department: departmentNames,
        departmentIds: departmentIds,
        designation: d.designation,
        qualifications: d.qualifications,
        experience: d.experience,
        languages: d.languages,
        bio: d.bio,
        phone: d.phone,
        consultation_fee: d.consultation_fee,
        available_days: d.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        // Assuming avatar is at public storage URL
        avatar_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${d.id}`
      }
    });
  } catch (error) {
    console.error("Unexpected error in getDoctors:", error);
    return FallbackDoctors;
  }
}

export async function getDoctorsOnLeaveToday() {
  const supabase = createAdminClient()
  
  // Get today's date in YYYY-MM-DD format based on local timezone
  // For simplicity, we'll use UTC date as Supabase DATE column compares exactly.
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('doctor_leaves')
    .select(`
      id,
      doctor_id,
      doctors (
        first_name,
        last_name,
        doctor_departments (
          departments (
            name
          )
        )
      )
    `)
    .eq('leave_date', today);

  if (error || !data) {
    console.error("Failed to fetch doctor leaves:", error);
    return [];
  }

  // Flatten the nested data structure
  return data.map((leave: any) => {
    const depts = leave.doctors?.doctor_departments?.map((dd: any) => dd.departments?.name).filter(Boolean) || [];
    return {
      id: leave.id,
      doctor_id: leave.doctor_id,
      name: `Dr. ${leave.doctors?.first_name} ${leave.doctors?.last_name}`,
      department: depts.length > 0 ? depts.join(', ') : 'General'
    };
  });
}

export async function getDoctorDepartments(doctorId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('doctor_departments')
    .select('department_id')
    .eq('doctor_id', doctorId)
  
  if (error || !data) return []
  return data.map((d: any) => d.department_id)
}

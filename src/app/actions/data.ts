'use server'

import { createClient } from '@/utils/supabase/server'
import { DEPARTMENTS as FallbackDepts, DOCTORS as FallbackDoctors } from '@/lib/data'

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error || !data || data.length === 0) {
    console.warn("Failed to fetch departments from DB, falling back to static data.");
    return FallbackDepts; // Use static data if DB is empty or fails (e.g. before seeding)
  }

  return data;
}

export async function getDoctors() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments(name)
    `)
    .order('first_name')

  if (error || !data || data.length === 0) {
    console.warn("Failed to fetch doctors from DB, falling back to static data.");
    return FallbackDoctors;
  }

  return data.map((d: any) => ({
    id: d.id,
    name: `Dr. ${d.first_name} ${d.last_name}`,
    department: d.departments?.name,
    designation: d.designation,
    // Add other fields as necessary depending on component usage
  }))
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { DepartmentSchema } from '@/lib/schema'
import { handleZodError, handleSupabaseError, DbResult } from '@/utils/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function addDepartment(formData: FormData): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }
    
    const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
    if (!adminCheck) return { success: false, error: "Admin access required." }

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      is_coe: formData.get('is_coe') === 'true',
      services: formData.get('services'),
    }

    const validatedData = DepartmentSchema.parse(rawData);

    // Generate slug from name
    const slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const servicesArray = validatedData.services ? validatedData.services.split(',').map(s => s.trim()) : [];

    const { error } = await supabase.from('departments').insert({
      name: validatedData.name,
      slug,
      description: validatedData.description,
      is_coe: validatedData.is_coe,
      services: servicesArray,
    });

    if (error) return handleSupabaseError(error);

    revalidatePath('/dashboard/admin/departments');
    revalidatePath('/departments');
    return { success: true };
    
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    return { success: false, error: "Unexpected error." }
  }
}

export async function deleteDepartment(id: string): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }
    const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
    if (!adminCheck) return { success: false, error: "Admin access required." }

    const { error } = await supabase.from('departments').delete().eq('id', id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/dashboard/admin/departments');
    revalidatePath('/departments');
    return { success: true };
    
  } catch (error) {
    return { success: false, error: "Unexpected error." }
  }
}

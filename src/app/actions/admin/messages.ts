'use server'

import { createClient } from '@/utils/supabase/server'
import { handleSupabaseError, DbResult } from '@/utils/db'
import { revalidatePath } from 'next/cache'

export async function updateMessageStatus(id: string, status: 'unread' | 'read' | 'resolved'): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized." }
    const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
    if (!adminCheck) return { success: false, error: "Admin access required." }

    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);

    if (error) return handleSupabaseError(error);

    revalidatePath('/dashboard/admin/messages');
    revalidatePath('/dashboard/admin'); // Overview uses it too
    return { success: true };
    
  } catch (error) {
    return { success: false, error: "Unexpected server error." }
  }
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { ContactFormSchema } from '@/lib/schema'
import { handleZodError, handleSupabaseError, DbResult } from '@/utils/db'
import { logger } from '@/utils/logger'
import { z } from 'zod'
import { rateLimit } from '@/utils/rate-limit'

export async function submitContactForm(formData: FormData): Promise<DbResult<null>> {
  try {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    // Rate Limiting (by IP/email)
    const identifier = typeof rawData.email === 'string' ? rawData.email.toLowerCase() : 'unknown_contact';
    const rateLimitCheck = rateLimit(\`contact_\${identifier}\`, 3, 3600000); // 3 per hour
    if (!rateLimitCheck.success) {
      return { success: false, error: rateLimitCheck.error };
    }

    // 1. Strict Form Validation
    const validatedData = ContactFormSchema.parse(rawData);

    // 2. Database Storage
    const supabase = await createClient();
    
    // We must bypass RLS for inserting contact messages if the user is not logged in.
    // However, our SQL policy allows public inserts: `CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);`
    // So standard client is fine.
    
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
      });

    if (error) return handleSupabaseError(error);

    // 3. Email Notification (Mocked for now)
    logger.info('New Contact Inquiry Submitted', {
      sender: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject
    });

    return { success: true };
    
  } catch (error) {
    logger.error('Failed to process contact form', error);
    if (error instanceof z.ZodError) return handleZodError(error);
    return { success: false, error: "Failed to send message. Please try again." }
  }
}

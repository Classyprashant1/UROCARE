import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MessageClient from './MessageClient'

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('id', user.id).single();
  if (!adminCheck) redirect('/dashboard');

  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Inquiries & Support</h1>
        <p className="text-slate-500 mt-2">Manage messages sent from the public website contact form.</p>
      </div>

      <MessageClient initialMessages={messages || []} />
    </div>
  )
}

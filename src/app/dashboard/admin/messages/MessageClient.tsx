'use client'

import { updateMessageStatus } from '@/app/actions/admin/messages'

export default function MessageClient({ initialMessages }: { initialMessages: any[] }) {
  
  const handleStatusChange = async (id: string, status: 'unread' | 'read' | 'resolved') => {
    const res = await updateMessageStatus(id, status);
    if (!res.success) {
      alert(res.error || "Failed to update status.");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 w-[20%]">Sender</th>
              <th className="px-6 py-4 w-[45%]">Message</th>
              <th className="px-6 py-4 w-[15%]">Status</th>
              <th className="px-6 py-4 w-[20%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialMessages.map(msg => (
              <tr key={msg.id} className={`hover:bg-slate-50 transition-colors ${msg.status === 'unread' ? 'bg-blue-50/30' : ''}`}>
                <td className="px-6 py-4 align-top">
                  <p className="font-bold text-slate-900">{msg.name}</p>
                  <p className="text-xs text-blue-600 truncate mt-1">
                    <a href={`mailto:${msg.email}`}>{msg.email}</a>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{msg.phone}</p>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-slate-800 mb-1">{msg.subject}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${msg.status === 'unread' ? 'bg-amber-50 text-amber-600 border-amber-200' : msg.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {msg.status}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <div className="flex flex-col gap-2 items-end">
                    {msg.status !== 'resolved' && (
                      <button onClick={() => handleStatusChange(msg.id, 'resolved')} className="text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full md:w-auto">
                        Mark Resolved
                      </button>
                    )}
                    {msg.status === 'unread' && (
                      <button onClick={() => handleStatusChange(msg.id, 'read')} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 w-full md:w-auto">
                        Mark Read
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {initialMessages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No messages found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

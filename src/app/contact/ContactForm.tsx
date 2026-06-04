'use client'

import { useState } from 'react'
import { submitContactForm } from '@/app/actions/contact'

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg({ type: '', text: '' })

    const formData = new FormData(e.currentTarget)
    const res = await submitContactForm(formData)
    
    setIsSubmitting(false)
    if (res.success) {
      setMsg({ type: 'success', text: 'Your message has been sent successfully. Our team will contact you shortly.' })
      e.currentTarget.reset(); // Clear the form
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to send message.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Send us a Message</h2>
      
      {msg.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          <span className="material-symbols-outlined shrink-0 mt-0.5">{msg.type === 'error' ? 'error' : 'check_circle'}</span>
          <p>{msg.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Full Name *</label>
          <input name="name" required placeholder="John Doe" className="h-12 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
          <input name="phone" required placeholder="+91 XXXXX XXXXX" className="h-12 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Email Address *</label>
        <input type="email" name="email" required placeholder="john@example.com" className="h-12 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Subject *</label>
        <input name="subject" required placeholder="How can we help?" className="h-12 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Message *</label>
        <textarea name="message" required placeholder="Please describe your inquiry in detail..." className="p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none resize-none min-h-[150px] transition" />
      </div>

      <button type="submit" disabled={isSubmitting} className="mt-2 h-14 bg-blue-700 text-white font-bold text-lg rounded-xl hover:bg-blue-800 transition disabled:opacity-70 flex items-center justify-center gap-2">
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined animate-spin">refresh</span>
            Sending...
          </>
        ) : (
          <>
            Send Message
            <span className="material-symbols-outlined">send</span>
          </>
        )}
      </button>
    </form>
  )
}

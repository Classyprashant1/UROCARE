const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
  const match = envLocal.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const adminClient = createClient(supabaseUrl, supabaseKey);

async function testAction() {
  console.log("=== SLOT GENERATION TRACE (ANON CLIENT) ===\n");
  const { data: doctors } = await adminClient.from('doctors').select('*').limit(1);
  const doctor = doctors[0];
  
  console.log("1. Raw doctor record from DB:");
  console.log("   morning_start_time:", doctor.morning_start_time);
  console.log("   morning_end_time:", doctor.morning_end_time);
  console.log("   evening_start_time:", doctor.evening_start_time);
  console.log("   evening_end_time:", doctor.evening_end_time);
  console.log("   slot_duration:", doctor.slot_duration);
  console.log("   available_days:", doctor.available_days);

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  for (let i = 1; i <= 7; i++) {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + i);
    const dateStr = testDate.toISOString().split('T')[0];
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    
    console.log(`\n--- Testing ${dateStr} (${dayName}) ---`);
    console.log("2. Selected date:", dateStr);
    console.log("3. Calculated day name:", dayName);

    const { data: docData } = await anonClient
      .from('doctors')
      .select('available_days')
      .eq('id', doctor.id)
      .single();

    if (!docData) {
      console.log("   🚨 EXACT LINE WHERE SLOTS BECOME EMPTY: appointments.ts line 126 (!doctor)");
      continue;
    }
    
    const dayMatch = docData.available_days && docData.available_days.includes(dayName);
    console.log("4. Verify selected day exists in available_days:", dayMatch);

    if (!dayMatch) {
      console.log(`   🚨 EXACT LINE WHERE SLOTS BECOME EMPTY: appointments.ts line 132`);
      continue;
    }

    const { data: appts } = await anonClient
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctor.id)
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled');
      
    const bookedTimes = new Set((appts || []).map(row => row.appointment_time));
    
    console.log("5. Before slot generation log:");
    console.log("   doctor schedule object:", docData);

    const STANDARD_SLOTS = ["Morning", "Evening"];
    const finalSlots = STANDARD_SLOTS.filter(s => !bookedTimes.has(s));
    
    console.log("6. After slot generation log:");
    console.log("   generatedSlots.length:", STANDARD_SLOTS.length);
    console.log("   generatedSlots:", STANDARD_SLOTS);
    
    console.log("7. Booked slots query:");
    console.log("   bookedSlots:", Array.from(bookedTimes));

    console.log("\n10. Final report:");
    console.log("- Doctor schedule from DB: (see top)");
    console.log("- Selected date:", dateStr);
    console.log("- Day match result:", dayMatch);
    console.log("- Generated slots count:", STANDARD_SLOTS.length);
    console.log("- Booked slots count:", bookedTimes.size);
    console.log("- Final available slots count:", finalSlots.length);
  }
}
testAction();

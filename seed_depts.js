const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbrfzglmmnhfctxsknbz.supabase.co';
const supabaseKey = 'sb_secret_E4IiLkFTLuelMvigdxBLpQ_MKehEhur';

const supabase = createClient(supabaseUrl, supabaseKey);

const DEPARTMENTS = [
  {
    name: "Urology",
    slug: "urology",
    icon: "urology",
    description: "Comprehensive urological care including kidney stones, prostate disorders, urinary tract infections, and minimally invasive urological surgeries.",
    is_coe: true,
    services: [
      "Kidney Stone Treatment (PCNL, URS, ESWL)",
      "Prostate Surgery (TURP, Laser)",
      "Urinary Tract Infections",
      "Bladder Disorders",
      "Laparoscopic Urology",
      "Male Infertility Treatment",
    ],
  },
  {
    name: "General Surgery",
    slug: "general-surgery",
    icon: "surgical",
    description: "Expert surgical care covering laparoscopic and open procedures for gallbladder, appendix, hernia, hydrocele, and more — with a focus on minimally invasive techniques.",
    is_coe: false,
    services: [
      "Laparoscopic Cholecystectomy (Gallbladder)",
      "Appendectomy",
      "Hernia Repair (Open & Laparoscopic)",
      "Hydrocele Surgery",
      "Piles, Fissure & Fistula Treatment",
      "Minor Surgical Procedures",
    ],
  },
  {
    name: "Gynaecology & Obstetrics",
    slug: "gynaecology",
    icon: "pregnant_woman",
    description: "Complete women's health services from routine gynaecological care to high-risk pregnancy management, normal and cesarean deliveries, and laparoscopic gynaecological surgeries.",
    is_coe: false,
    services: [
      "Normal & Cesarean Delivery",
      "High-Risk Pregnancy Management",
      "Laparoscopic Hysterectomy",
      "Infertility Evaluation & Counselling",
      "Menstrual Disorder Treatment",
      "Antenatal & Postnatal Care",
    ],
  },
  {
    name: "Internal Medicine",
    slug: "internal-medicine",
    icon: "stethoscope",
    description: "General physician services for managing chronic illnesses, infections, diabetes, hypertension, respiratory conditions, and preventive health checkups.",
    is_coe: false,
    services: [
      "Diabetes Management",
      "Hypertension Control",
      "Fever & Infection Treatment",
      "Respiratory Disorders",
      "Preventive Health Checkups",
      "Chronic Disease Management",
    ],
  },
  {
    name: "Orthopaedics",
    slug: "orthopedics",
    icon: "orthopedics",
    description: "Bone, joint and musculoskeletal care including fracture management, joint replacement advisory, sports injuries, and physiotherapy-assisted rehabilitation.",
    is_coe: false,
    services: [
      "Fracture Management",
      "Joint Pain Treatment",
      "Sports Injury Care",
      "Physiotherapy & Rehabilitation",
      "Arthritis Management",
      "Spine Disorders",
    ],
  },
  {
    name: "Paediatrics",
    slug: "pediatrics",
    icon: "child_care",
    description: "Dedicated child healthcare from newborn care to adolescent medicine, covering vaccinations, growth monitoring, and treatment of childhood illnesses.",
    is_coe: false,
    services: [
      "Newborn Care",
      "Vaccination & Immunisation",
      "Growth & Development Monitoring",
      "Childhood Infections",
      "Nutritional Counselling",
      "Adolescent Health",
    ],
  },
  {
    name: "Diagnostics & Laboratory",
    slug: "diagnostics",
    icon: "biotech",
    description: "In-house pathology laboratory and diagnostic services for blood tests, urine analysis, imaging support, and pre-surgical evaluations.",
    is_coe: false,
    services: [
      "Complete Blood Count (CBC)",
      "Liver & Kidney Function Tests",
      "Thyroid Profile",
      "Urine Analysis",
      "Blood Sugar & HbA1c",
      "Pre-Operative Investigations",
    ],
  },
  {
    name: "Emergency & Trauma",
    slug: "emergency",
    icon: "emergency",
    description: "24/7 emergency services with immediate medical attention for trauma, accidents, cardiac emergencies, and acute medical conditions.",
    is_coe: false,
    services: [
      "24/7 Emergency Care",
      "Trauma Management",
      "Accident & Injury Treatment",
      "Cardiac Emergency Stabilisation",
      "Ambulance Coordination",
      "Critical Care Stabilisation",
    ],
  },
];

async function seedDepartments() {
  console.log("Checking existing departments...");
  const { data: existing, error: fetchErr } = await supabase.from('departments').select('id, name');
  if (fetchErr) {
    console.error("Fetch error:", fetchErr);
    return;
  }

  // Find the bad urology
  const badUrology = existing.find(d => d.id === '11111111-1111-1111-1111-111111111111');
  if (badUrology) {
    console.log("Deleting invalid Urology department...");
    await supabase.from('departments').delete().eq('id', badUrology.id);
  }

  console.log("Inserting all proper departments...");
  
  // Only insert those that don't already exist by name
  for (const dept of DEPARTMENTS) {
    const exists = existing.find(d => d.name === dept.name && d.id !== '11111111-1111-1111-1111-111111111111');
    if (!exists) {
      const { error } = await supabase.from('departments').insert([dept]);
      if (error) {
        console.error("Error inserting", dept.name, error);
      } else {
        console.log("Inserted", dept.name);
      }
    } else {
      console.log("Skipping", dept.name, "as it already exists.");
    }
  }

  console.log("Seeding complete.");
}

seedDepartments();

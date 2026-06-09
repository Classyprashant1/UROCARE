/* ============================================================
   Urocare Apolo Hospital — Site Data Constants
   Source: Practo, JustDial, FreemedicalInfo
   ============================================================ */

export const HOSPITAL = {
  name: "Urocare Apolo Multi & Super Speciality Hospital",
  shortName: "Urocare Apolo Hospital",
  tagline: "Advanced Multispeciality Care, Compassionate Healing",
  description:
    "Urocare Apolo Multi & Super Speciality Hospital is a 25-bed multispeciality facility in Ballabhgarh, Faridabad, delivering round-the-clock comprehensive healthcare with advanced diagnostics, modular operation theatres, and a dedicated team of experienced specialists.",
  established: "2002",
  beds: 25,
  rating: 4.5,
  totalReviews: 120,
  openHours: "24 Hours / 7 Days",
  consultationFee: "₹500",
  email: "UrocareApolloHospital@gmail.com",
  phones: ["+91 9971107329", "+91 9555114730", "+91 9350160023"],
  emergencyPhone: "+91 9971107329",
  address: {
    line1: "Plot Number 44 A&B, Behind Women College",
    line2: "Tirkha Colony, Sector 2, Ballabhgarh",
    city: "Faridabad",
    state: "Haryana",
    pincode: "121004",
    landmark: "Near Govt. Girls College, Ballabhgarh",
    full: "Plot Number 44 A&B, Behind Women College, Tirkha Colony, Sector 2, Ballabhgarh, Faridabad, Haryana - 121004",
  },
  coordinates: {
    lat: 28.3418,
    lng: 77.3232,
  },
  nearbyTransport: [
    "Ballabhgarh Bus Stand — 4 min walk",
    "Raja Nahar Singh Metro Station — 5 min walk",
  ],
  socialMedia: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
    twitter: "#",
  },
};

export const DEPARTMENTS = [
  {
    id: "urology",
    name: "Urology",
    slug: "urology",
    icon: "urology",
    description:
      "Comprehensive urological care including kidney stones, prostate disorders, urinary tract infections, and minimally invasive urological surgeries.",
    isCoE: true,
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
    id: "general-surgery",
    name: "General Surgery",
    slug: "general-surgery",
    icon: "surgical",
    description:
      "Expert surgical care covering laparoscopic and open procedures for gallbladder, appendix, hernia, hydrocele, and more — with a focus on minimally invasive techniques.",
    isCoE: false,
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
    id: "gynaecology",
    name: "Gynaecology & Obstetrics",
    slug: "gynaecology",
    icon: "pregnant_woman",
    description:
      "Complete women's health services from routine gynaecological care to high-risk pregnancy management, normal and cesarean deliveries, and laparoscopic gynaecological surgeries.",
    isCoE: false,
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
    id: "internal-medicine",
    name: "Internal Medicine",
    slug: "internal-medicine",
    icon: "stethoscope",
    description:
      "General physician services for managing chronic illnesses, infections, diabetes, hypertension, respiratory conditions, and preventive health checkups.",
    isCoE: false,
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
    id: "orthopedics",
    name: "Orthopaedics",
    slug: "orthopedics",
    icon: "orthopedics",
    description:
      "Bone, joint and musculoskeletal care including fracture management, joint replacement advisory, sports injuries, and physiotherapy-assisted rehabilitation.",
    isCoE: false,
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
    id: "pediatrics",
    name: "Paediatrics",
    slug: "pediatrics",
    icon: "child_care",
    description:
      "Dedicated child healthcare from newborn care to adolescent medicine, covering vaccinations, growth monitoring, and treatment of childhood illnesses.",
    isCoE: false,
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
    id: "diagnostics",
    name: "Diagnostics & Laboratory",
    slug: "diagnostics",
    icon: "biotech",
    description:
      "In-house pathology laboratory and diagnostic services for blood tests, urine analysis, imaging support, and pre-surgical evaluations.",
    isCoE: false,
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
    id: "emergency",
    name: "Emergency & Trauma",
    slug: "emergency",
    icon: "emergency",
    description:
      "24/7 emergency services with immediate medical attention for trauma, accidents, cardiac emergencies, and acute medical conditions.",
    isCoE: false,
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

export const DOCTORS = [
  {
    id: "dr-darshan-kumar-sharma",
    name: "Dr. Darshan Kumar Sharma",
    slug: "dr-darshan-kumar-sharma",
    designation: "Senior Consultant & Director",
    department: "Urology",
    departmentId: "urology",
    departmentIds: ["urology"],
    qualifications: "MBBS, MS (Surgery), MCh (Urology)",
    experience: "25+ Years",
    consultationFee: "₹500",
    rating: 4.8,
    reviewCount: 85,
    languages: ["Hindi", "English"],
    availability: "Mon – Sat, 10:00 AM – 2:00 PM & 5:00 PM – 8:00 PM",
    nextAvailable: "Today, 10:00 AM",
    image: null,
    specializations: [
      "Kidney Stone Surgery (PCNL/URS)",
      "Prostate Surgery",
      "Laparoscopic Urology",
      "Urinary Tract Disorders",
    ],
    bio: "Dr. Darshan Kumar Sharma is the founding Director of Urocare Apolo Hospital with over 25 years of experience in urology and urological surgery. He is renowned for his expertise in minimally invasive kidney stone treatment and prostate surgeries. Patients consistently praise his thorough approach and compassionate care.",
  },
  {
    id: "dr-vinita-sharma",
    name: "Dr. Vinita Sharma",
    slug: "dr-vinita-sharma",
    designation: "Senior Consultant",
    department: "Internal Medicine",
    departmentId: "internal-medicine",
    departmentIds: ["internal-medicine"],
    qualifications: "MBBS, MD (Medicine)",
    experience: "20+ Years",
    consultationFee: "₹500",
    rating: 4.6,
    reviewCount: 52,
    languages: ["Hindi", "English"],
    availability: "Mon – Sat, 9:00 AM – 1:00 PM & 4:00 PM – 7:00 PM",
    nextAvailable: "Today, 9:00 AM",
    image: null,
    specializations: [
      "Diabetes Management",
      "Hypertension",
      "General Physician",
      "Preventive Health",
    ],
    bio: "Dr. Vinita Sharma is a highly experienced general physician with over 20 years of practice. She specialises in managing chronic conditions like diabetes and hypertension, and is known for her patient-friendly approach and thorough diagnostic skills.",
  },
  {
    id: "dr-shilpi-bansal",
    name: "Dr. Shilpi Bansal",
    slug: "dr-shilpi-bansal",
    designation: "Consultant",
    department: "Gynaecology & Obstetrics",
    departmentId: "gynaecology",
    departmentIds: ["gynaecology"],
    qualifications: "MBBS, MS (Obstetrics & Gynaecology)",
    experience: "12+ Years",
    consultationFee: "₹500",
    rating: 4.7,
    reviewCount: 38,
    languages: ["Hindi", "English"],
    availability: "Mon – Sat, 10:00 AM – 2:00 PM & 5:00 PM – 7:00 PM",
    nextAvailable: "Tomorrow, 10:00 AM",
    image: null,
    specializations: [
      "High-Risk Pregnancy",
      "Laparoscopic Gynaecology",
      "Normal & Cesarean Delivery",
      "Infertility Evaluation",
    ],
    bio: "Dr. Shilpi Bansal is an experienced gynaecologist and obstetrician, specialising in high-risk pregnancies, laparoscopic gynaecological procedures, and comprehensive women's healthcare. She is known for her empathetic patient care and clinical precision.",
  },
];

export const FACILITIES = [
  { icon: "local_hospital", name: "25-Bed Facility", description: "Fully equipped with modern amenities" },
  { icon: "vaccines", name: "Modular Operation Theatre", description: "State-of-the-art surgical suites" },
  { icon: "biotech", name: "In-House Laboratory", description: "Comprehensive diagnostic testing" },
  { icon: "local_pharmacy", name: "24/7 Pharmacy", description: "Round-the-clock medicine availability" },
  { icon: "emergency", name: "24/7 Emergency", description: "Immediate medical attention" },
  { icon: "local_shipping", name: "Ambulance Service", description: "Quick patient transport" },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    initials: "RK",
    condition: "Kidney Stone Patient",
    rating: 5,
    text: "Dr. Darshan Kumar Sharma performed my kidney stone surgery. The entire team was very professional and caring. I recovered quickly and was discharged within 2 days. Highly recommend this hospital for urological care.",
  },
  {
    id: 2,
    name: "Sunita Devi",
    initials: "SD",
    condition: "Maternity Patient",
    rating: 5,
    text: "I had my delivery at Urocare Apolo Hospital. Dr. Shilpi Bansal and the nursing staff were extremely supportive throughout. The facility is clean and well-maintained. Very happy with the experience.",
  },
  {
    id: 3,
    name: "Amit Verma",
    initials: "AV",
    condition: "General Surgery Patient",
    rating: 4,
    text: "Got my hernia surgery done here. The hospital is clean, staff is polite and well-mannered. The doctors explained everything clearly before the procedure. Good hospital at affordable prices.",
  },
  {
    id: 4,
    name: "Priya Sharma",
    initials: "PS",
    condition: "General Medicine Patient",
    rating: 5,
    text: "Dr. Vinita Sharma is an excellent physician. She listens patiently and prescribes effective treatment. The hospital follows proper hygiene and safety protocols. Very satisfied with the care received.",
  },
];

export const STATS = [
  { value: "10,000+", label: "Patients Treated", icon: "groups" },
  { value: "25+", label: "Years of Service", icon: "history" },
  { value: "4.5★", label: "Patient Rating", icon: "star" },
  { value: "24/7", label: "Emergency Care", icon: "emergency" },
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Departments", href: "/departments" },
  { label: "Doctors", href: "/doctors" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const QUICK_ACCESS_LINKS = [
  { icon: "emergency", label: "Emergency", href: "/contact#emergency" },
  { icon: "login", label: "Patient Portal", href: "/auth/login" },
  { icon: "videocam", label: "Telehealth", href: "/contact#telehealth" },
  { icon: "search", label: "Find Doctor", href: "/doctors" },
  { icon: "local_pharmacy", label: "Pharmacy", href: "/contact#pharmacy" },
];

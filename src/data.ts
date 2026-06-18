import { Doctor, BlogPost, Testimonial, SymptomGuide } from "./types";

export const DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Jordan Smith",
    role: "Cardiologist",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-slate-50 border-slate-100",
    tagline: "Dedicated to providing advanced cardiovascular care with a compassionate touch."
  },
  {
    id: "2",
    name: "Dr. Kevin Chen",
    role: "Surgeon",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-teal-50/70 border-teal-100",
    tagline: "Specializing in minimally invasive procedures and rapid recovery protocols."
  },
  {
    id: "3",
    name: "Dr. Shahid Ali",
    role: "Neurologist",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com"
    },
    featuredColor: "bg-blue-50/70 border-blue-100",
    tagline: "Unraveling neurological health concerns with precise, evidence-based therapies."
  },
  {
    id: "4",
    name: "Dr. Nasima B.",
    role: "Neurologist",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-purple-50/70 border-purple-100",
    tagline: "Empowering patients through cutting-edge brain health and nerve recovery plans."
  },
  {
    id: "5",
    name: "Dr. Clara Winters",
    role: "Palliative Care Specialist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-emerald-50/70 border-emerald-100",
    tagline: "Focusing on optimized quality of life and detailed support for complex conditions."
  },
  {
    id: "6",
    name: "Dr. Sophia Martinez",
    role: "Geriatrician",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-amber-50/70 border-amber-100",
    tagline: "Dedicated to promoting healthy aging and vitality with customized health plans."
  },
  {
    id: "7",
    name: "Dr. Aaron Vance",
    role: "Pulmonologist",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-rose-50/70 border-rose-100",
    tagline: "Treating complex respiratory, asthma, and chronic lung conditions."
  },
  {
    id: "8",
    name: "Dr. Maya Lin",
    role: "Emergency Specialist",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com"
    },
    featuredColor: "bg-indigo-50/70 border-indigo-100",
    tagline: "Providing rapid-response triage guidance and acute care crisis management."
  },
  {
    id: "9",
    name: "Dr. Marcus Thorne",
    role: "Oncologist",
    avatar: "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-cyan-50/70 border-cyan-100",
    tagline: "Pioneering state-of-the-art immunotherapies and compassionate support."
  },
  {
    id: "10",
    name: "Dr. Ryan Sterling",
    role: "Dermatologist",
    avatar: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-sky-50/70 border-sky-100",
    tagline: "Ensuring advanced therapeutic skin care, skin cancer screenings, and micrographic excellence."
  },
  {
    id: "11",
    name: "Dr. Lisa Chasen",
    role: "Pediatrician",
    avatar: "https://images.unsplash.com/photo-1643297654416-05795d62e39c?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-pink-50/70 border-pink-100",
    tagline: "Supporting youth health, development milestones, and early pediatric wellness diagnostics."
  },
  {
    id: "12",
    name: "Dr. Benjamin Cho",
    role: "Nephrologist",
    avatar: "https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com"
    },
    featuredColor: "bg-emerald-50/70 border-emerald-100",
    tagline: "Promoting kidney preservation protocols and sophisticated electrolyte balance audits."
  },
  {
    id: "13",
    name: "Dr. Eleanor Vance",
    role: "Palliative Care Specialist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    },
    featuredColor: "bg-emerald-50/70 border-emerald-100",
    tagline: "Dedicated to improving overall comfort, symptom relief, and family counseling for advanced illness."
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "How to talk to your loved one about elder care",
    category: "Palliative care",
    summary: "Instead of focusing on clinical 'care' or 'carers', try speaking about 'lifestyle support', 'personal assistants', and 'companions'. This shift preserves their absolute autonomy and pride.",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=500",
    readTime: "4 min read",
    date: "June 12, 2026"
  },
  {
    id: "b2",
    title: "Understanding Hospice Care: Myths vs. Reality",
    category: "Hospice care",
    summary: "Hospice is not about giving up hope; it is about focusing on comfort, dignity, and maximizing the precious time remaining with professional around-the-clock support.",
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=500",
    readTime: "6 min read",
    date: "June 10, 2026"
  },
  {
    id: "b3",
    title: "Safety First: Top Patient Protocols in Modern Clinics",
    category: "Patient Safety",
    summary: "Explore how advanced electronic health records and visual safety checklists prevent patient identification errors and build solid trust standardizations.",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=500",
    readTime: "5 min read",
    date: "June 08, 2026"
  },
  {
    id: "b4",
    title: "Collaborative Medicine: The Power of Medical Teams",
    category: "Medical Team",
    summary: "When multiple medical departments integrate their specialist insights, patient outcomes improve by over 40%. Read about our multi-disciplinary approach.",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=500",
    readTime: "7 min read",
    date: "June 05, 2026"
  },
  {
    id: "b5",
    title: "Mental Health Strategies in Living Independently Later",
    category: "Mental health in order adults",
    summary: "Cognitive training, neighborhood walking groups, and tele-health accessibility make older age highly stimulating, rewarding, and emotionally vibrant.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=500",
    readTime: "5 min read",
    date: "May 28, 2026"
  },
  {
    id: "b6",
    title: "How specialized doctors elevate geriatric care and patient longevity",
    category: "Medical Team",
    summary: "Geriatric doctors bring specialized protocols focusing on chronic symptom relief, medication audits, and preventive checkups to maximize peace of mind.",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=500",
    readTime: "5 min read",
    date: "May 25, 2026"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Ibrahim Khan",
    role: "Professional Athlete",
    quote: "Working with this medical team has been an absolute game-changer for my physical recovery. They understood my athletic demands, provided state-of-the-art diagnostic screening, and designed a personalized nerve therapy that got me back on the field faster than ever!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    rating: 5
  },
  {
    id: "t2",
    name: "Clara Montgomery",
    role: "Senior Graphic Lead",
    quote: "The patience and sheer kindness of the neurologists here gave my family the support we deserved during my mother's cognitive therapy. They spoke in clear, human terms, and the comfortable portal made secure communication absolutely effortless.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    rating: 5
  },
  {
    id: "t3",
    name: "David Reynolds",
    role: "Principal Tech Architect",
    quote: "As a software developer, I appreciate seamless user experiences, but as a patient, I appreciate clinical excellence even more. Cooper University Hospital perfectly balances both: elite, expert doctors combined with a frictionless medical experience.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
    rating: 5
  }
];

export const SPECIALTIES = [
  "Alzheimer's & Dementia Care",
  "General Cardiology",
  "Interventional Neurosurgery",
  "Palliative & Supportive Care",
  "Geriatric Rehabilitation",
  "General Surgery Desk"
];

export const LOCATIONS = [
  "New York City, NY",
  "Boston, MA",
  "Philadelphia, PA",
  "Los Angeles, CA"
];

export const SERVICE_TYPES = [
  "In-Clinic Consultation",
  "Home Care Visit",
  "Virtual Tele-Health Chat"
];

export const SYMPTOM_GUIDELINES: SymptomGuide[] = [
  {
    id: "fever",
    symptomEn: "Fever",
    symptomTe: "జ్వరం (Fever)",
    descriptionEn: "Elevated body temperature above 100.4°F (38°C), often indicating an underlying immune response.",
    descriptionTe: "శరీర ఉష్ణోగ్రత 100.4°F (38°C) కంటే ఎక్కువగా పెరగడం. ఇది సాధారణంగా రోగనిరోధక శక్తి ప్రతిస్పందనను సూచిస్తుంది.",
    homeCareEn: "Stay fully hydrated, secure 8+ hours of absolute bed rest, and consider over-the-counter fever reducers like acetaminophen or ibuprofen under pediatrician/medical safety instructions.",
    homeCareTe: "ధారళంగా మంచి నీరు తాగండి, కనీసం 8 గంటల విశ్రాంతి తీసుకోండి. ఒంటి నొప్పులు కూడా ఉంటే డాక్టర్ సలహాతో పారాసిటమాల్ వాడవచ్చు.",
    redFlagsEn: "Fever exceeding 103°F (39.4°C), stiff neck, severe shortness of breath, confusion, or a fever lasting longer than 3 continuous days.",
    redFlagsTe: "జ్వరం 103°F దాటినప్పుడు, మెడ బిగుసుకుపోవడం, ఊపిరి తీసుకోవడంలో తీవ్రమైన ఇబ్బంది ఉన్నప్పుడు వెంటనే 911 కి కాల్ చేయండి."
  },
  {
    id: "headache",
    symptomEn: "Headache",
    symptomTe: "తలనొప్పి (Headache)",
    descriptionEn: "Pain or discomfort in the head, scalp, or neck area, ranging from tension tightness to severe vascular migraines.",
    descriptionTe: "తలలో లేదా నరాల ప్రాంతంలో వచ్చే నొప్పి. ఇది ఒత్తిడి తలనొప్పి నుండి తీవ్రమైన మైగ్రేన్ వరకు ఉండవచ్చు.",
    homeCareEn: "Rest in a quiet, dark, and air-cooled room. Place a cool compress on your forehead and ensure steady water hydration.",
    homeCareTe: "నిశ్శబ్దంగా, కాంతి తక్కువగా ఉన్న గదిలో విశ్రాంతి తీసుకోండి. నుదుటిపై చల్లని గుడ్డతో కంప్రెస్ పెట్టండి.",
    redFlagsEn: "Sudden, thunderclap onset ('worst headache of your life'), vision changes, slurred speech, confusion, or post-head injury trauma.",
    redFlagsTe: "అకస్మాత్తుగా తీవ్రమైన తలనొప్పి రావడం, చూపు మసకబారడం, మాట్లాడటంలో ఇబ్బంది ఉంటే వెంటనే అత్యవసర సహాయం పొందండి."
  },
  {
    id: "cold",
    symptomEn: "Cold (Upper Respiratory Congestion)",
    symptomTe: "జలుబు (Common Cold)",
    descriptionEn: "Viral infection of the upper respiratory tract affecting the nose and throat, characterized by congestion and mild sneezing.",
    descriptionTe: "ముక్కు మరియు గొంతును ప్రభావితం చేసే వైరల్ ఇన్ఫెక్షన్. ముక్కు కారడం మరియు తుమ్ములు దీని ప్రధాన లక్షణాలు.",
    homeCareEn: "Inhale warm steam, utilize over-the-counter sterile saline nasal sprays, gargle with warm salt water, and drink soothing herbal teas.",
    homeCareTe: "వేడి నీటి ఆవిరి పట్టండి, గోరువెచ్చని ఉప్పునీటితో గొంతు కడగండి (గార్గ్లింగ్), మరియు వేడి ద్రవాలు తాగండి.",
    redFlagsEn: "Extreme chest tightness, wheezing, inability to swallow liquids, severe earache, or symptoms worsening past 10 days.",
    redFlagsTe: "ఛాతీ బిగుతుగా మారడం, శ్వాస ఆడకపోవడం, గొంతు తీవ్రంగా నొప్పిగా మారి మింగలేకపోతే వెంటనే డాక్టర్ ని సంప్రదించండి."
  },
  {
    id: "cough",
    symptomEn: "Cough (Dry or Productive)",
    symptomTe: "దగ్గు (Cough)",
    descriptionEn: "Reflexive clearance of foreign particles, mucus, or irritants from the bronchial airways and lungs.",
    descriptionTe: "శ్వాసకోశ మార్గాల్లో ఉన్న శ్లేష్మం లేదా దుమ్మును బయటకు నెట్టడానికి వచ్చే ఒక సహజ శారీరక క్లియరెన్స్ ప్రతిచర్య.",
    homeCareEn: "Stay hydrated to thin mucus, consume a spoonful of natural honey (for age 1+), and run a cool-mist humidifier in your sleeping area.",
    homeCareTe: "గోరువెచ్చని నీరు తాగండి, ఒక చెంచా స్వచ్ఛమైన తేనె తీసుకోండి (1 సంవత్సరం దాటిన పిల్లలకి మాత్రమే), గదిలో హ్యూమిడిఫైయర్ వాడండి.",
    redFlagsEn: "Coughing up pink or bloody phlegm, severe wheezing, extreme shortness of breath, or deep chest pain upon inhalation.",
    redFlagsTe: "దగ్గినప్పుడు రక్తం పడటం, శ్వాస పిల్చుకునేటప్పుడు ఈల శబ్దం రావడం, లేదా ఊపిరి తీసుకోవడం కష్టంగా మారినప్పుడు అత్యవసర కేర్ అవసరం."
  },
  {
    id: "body-pain",
    symptomEn: "Body Pain & Muscle Aches",
    symptomTe: "ఒంటి నొప్పులు (Body Pain)",
    descriptionEn: "Diffused discomfort across muscles or joints, frequently triggered by viral immune cascades, stress, or heavy exertion.",
    descriptionTe: "కండరాలు మరియు కీళ్లలో వచ్చే సాధారణమైన నొప్పి. ఇది వైరల్ ఇన్ఫెక్షన్లు, ఒత్తిడి లేదా అలసట వల్ల రావచ్చు.",
    homeCareEn: "Take a soothing warm shower, gentle full-body stretching of affected muscles, apply local warm heat pads, and sleep on a supportive surface.",
    homeCareTe: "గోరువెచ్చని నీటితో స్నానం చేయండి, తేలికపాటి స్ట్రెచింగ్స్ చేయండి, వీపుపై హాట్ ప్యాడ్ అమర్చండి మరియు నిద్రపోండి.",
    redFlagsEn: "Inability to walk, extreme localized swelling, high-grade unrelenting fever with muscle stiffness, or loss of limb sensation.",
    redFlagsTe: "నడవలేకపోవడం, కీళ్ల వద్ద తీవ్రమైన వాపులు, కండరాల దృఢత్వం మరియు స్పర్శ కోల్పోవడం ఉంటే వెంటనే తనిఖీ చేయించాలి."
  },
  {
    id: "stomach-pain",
    symptomEn: "Stomach Pain & Abdominal Distress",
    symptomTe: "కడుపు నొప్పి (Stomach Pain)",
    descriptionEn: "Gastrointestinal tract inflammation or muscle cramping, ranging from mild indigestion to acute inflammatory diseases.",
    descriptionTe: "జీర్ణవ్యవస్థలో వాపు లేదా ఉదర కండరాల తిమ్మిరి. ఇది అజీర్ణం నుండి తీవ్రమైన ఇన్ఫెక్షన్ల వరకు దారితీయవచ్చు.",
    homeCareEn: "Eat a highly bland diet (BRAT pattern: Bananas, Rice, Applesauce, Toast), sip clear fluids frequently to avoid dehydration, and avoid dairy.",
    homeCareTe: "సులువుగా జీర్ణమయ్యే ఆహారం తీసుకోండి (అరటిపండ్లు, అన్నం, గంజి). పాలు లేదా పాల ఉత్పత్తులను కొన్ని రోజులు దూరంగా పెట్టండి.",
    redFlagsEn: "Acute, localized pain in the lower right abdomen (possible appendicitis), persistent vomiting, blood in stool, or rigid, tender-to-touch stomach.",
    redFlagsTe: "కడుపులో కుడివైపు క్రింది భాగంలో తీవ్రమైన నొప్పి (అపెండిసైటిస్ సూచన), నిరంతర వాంతులు లేదా మలంలో రక్తం పడటం ఉంటే అత్యవసరం."
  }
];


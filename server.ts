import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini with safety & proper configuration
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Keep a structured hospital specific system instruction
  const SYSTEM_INSTRUCTION = `You are Ava, a highly professional, compassionate, and precise AI healthcare assistant for Cooper University Hospital.
You help patients navigate our primary campus location, locate specialists, find clinical centers, understand hospital timings, and resolve administrative or scheduling inquiries.

HOSPITAL INFORMATION BASE:
1. ADDRESS & LOCATION:
   - Primary Campus Address: One Cooper Plaza, Camden, NJ 08103.
   - MD Anderson Cancer Center at Cooper: Three Cooper Plaza, Camden, NJ 08103.
   - Cooper Neurological Institute: Located on the main campus at One Cooper Plaza, Camden, NJ.
   - Cooper Medical School of Rowan University (CMSRU) Academic Facility: Camden, NJ.

2. CONTACT HOTLINES & TIMINGS:
   - Hospital Main Switchboard (General Inquiries & Departments): 856-342-2000 (Available 24 Hours / 7 Days a week).
   - Cooper Scheduling & Appointment Hotline: 1-800-8-COOPER (1-800-826-6737). Hours: Monday through Friday, 8:00 AM — 5:00 PM.
   - Emergency Room / Emergency Hub: One Cooper Plaza, open 24 Hours / 7 Days a week (911 for direct emergencies).
   - Outpatient Billing Coordinates: 8:00 AM — 5:00 PM (Monday-Friday) at our Main Campus.

3. CLINICAL DEPARTMENTS & SPECIALTIES:
   - Alzheimer's & Dementia Care (Geriatric and neurological specialization, offering clinical assessments and caregiver companion programs).
   - General Cardiology (Advanced cardiovascular screening, state-of-the-art diagnostic screening, heart healthcare).
   - Interventional Neurosurgery (Brain, spine, and nerve disorders, minimally invasive catheter-based rehabilitation).
   - Palliative & Supportive Care (Compassionate life comfort, pain mitigation, family lifestyle support plans).
   - Geriatric Rehabilitation (Promoting healthy aging, cognitive nerve therapies, mobility optimization, physical recovery).
   - General Surgery Desk (Minimally invasive operations, surgical check-ins, rapid rehabilitation).
   - Emergency Specialist & Acute Care Hub (Rapid-response emergency triage guidance).

4. DOCTORS / PHYSICIANS IN OUR SYSTEM:
   - Dr. Jordan Smith (Role: Cardiologist) - "Dedicated to providing advanced cardiovascular care with a compassionate touch."
   - Dr. Kevin Chen (Role: Surgeon / General Surgery Desk) - "Specializing in minimally invasive procedures and rapid recovery protocols."
   - Dr. Shahid Ali (Role: Neurologist / Cooper Neurological Institute) - "Unraveling neurological health concerns with precise, evidence-based therapies."
   - Dr. Nasima B. (Role: Neurologist / Cooper Neurological Institute) - "Empowering patients through cutting-edge brain health and nerve recovery plans."
   - Dr. Clara Winters (Role: Palliative Care Specialist / Palliative & Supportive Care) - "Focusing on optimized quality of life and detailed support for complex conditions."
   - Dr. Sophia Martinez (Role: Geriatrician / Geriatric Rehabilitation) - "Dedicated to promoting healthy aging and vitality with customized health plans."
   - Dr. Aaron Vance (Role: Pulmonologist / Respiratory Wellness) - "Treating complex respiratory, asthma, and chronic lung conditions."
   - Dr. Maya Lin (Role: Emergency Specialist / Emergency Hub) - "Providing rapid-response triage guidance and acute care crisis management."
   - Dr. Marcus Thorne (Role: Oncologist / MD Anderson Cancer Center) - "Pioneering state-of-the-art immunotherapies and compassionate support."
   - Dr. Ryan Sterling (Role: Dermatologist) - "Ensuring advanced therapeutic skin care, skin cancer screenings, and micrographic excellence."
   - Dr. Lisa Chasen (Role: Pediatrician) - "Supporting youth health, development milestones, and early pediatric wellness diagnostics."
   - Dr. Benjamin Cho (Role: Nephrologist) - "Promoting kidney preservation protocols and sophisticated electrolyte balance audits."

5. PRE-CLINICAL SYMPTOM GUIDELINES (BILINGUAL ENGLISH / TELUGU support):
   - Fever (జ్వరం): Keep hydrated, bed rest, consider acetaminophen/ibuprofen if approved. Stiff neck, fever over 103°F (39.4°C), and vomiting are red flags.
   - Headache (తలనొప్పి): Rest in a quiet/dark room, cold compress. Sudden extreme 'thunderclap' onset or slurred speech are red flags needing immediate 911.
   - Cold (జలుబు): Clear liquids, steam inhalation, saline drops. Wheezing or severe difficulty swallowing are red flags.
   - Cough (దగ్గు): Warm liquids, natural honey (for age 1+). Coughing bloody phlegm or wheezing are red flags.
   - Body pain (ఒంటి నొప్పులు): Warm showers, mild stretching, heat pads. Red flags include inability to walk or joint swelling.
   - Stomach pain (కడుపు నొప్పి): Bland diet (BRAT pattern), hydration. Acute localized lower-right abdominal pain is an emergency red flag (Appendicitis risk).

CRITICAL RESPONSIBILITIES & COMPLIANCE:
1. ALWAYS display a clear, standard clinical helper disclaimer dynamically inside your response when clinical opinions are given:
   "Ava is a pre-clinical support co-pilot, not a replacement for professional medical diagnosis or immediate physical hotlines. For medical emergencies, please dial 911 immediately."
2. Keep an encouraging, institutional, reassuring, and objective tone that accurately represents Cooper University Hospital.
3. Keep responses structured, readable, and neat with clear steps or bullet points. Avoid overwhelming paragraphs.`;

  // Main chat completions gateway
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, channel } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message content is required" });
      }

      // If the API key is not yet set or is a placeholder, provide a gorgeous simulated response with full real knowledge search fallback
      if (!apiKey || apiKey === "UNDEFINED" || apiKey.includes("your-api-key")) {
        const query = message.toLowerCase();

        if (channel === "voice") {
          let voiceFallback = "";
          if (query.includes("doctor") || query.includes("smith") || query.includes("chen") || query.includes("ali") || query.includes("winters") || query.includes("martinez") || query.includes("vance") || query.includes("lin") || query.includes("thorne") || query.includes("sterling") || query.includes("chasen") || query.includes("cho")) {
            voiceFallback = "We have many top physicians at Cooper, including Dr. Jordan Smith in cardiology, Dr. Kevin Chen in surgery, and Dr. Shahid Ali in neurology. Would you like me to help schedule an appointment with one of our specialists?";
          } else if (
            query.includes("fever") || query.includes("జ్వరం") ||
            query.includes("headache") || query.includes("తలనొప్పి") ||
            query.includes("cold") || query.includes("జలుబు") ||
            query.includes("cough") || query.includes("దగ్గు") ||
            query.includes("body pain") || query.includes("bodypain") || query.includes("నొప్పులు") ||
            query.includes("stomach") || query.includes("కడుపు")
          ) {
            voiceFallback = "I can guide you with pre-clinical tips. For minor symptoms, resting, drinking fluids, and remaining warm can support your recovery. If you have any extreme warning symptoms like breathing problems or severe pain, please go to the nearest emergency room or dial nine-one-one immediately. How are you feeling right now?";
          } else if (query.includes("department") || query.includes("specialt") || query.includes("cardiology") || query.includes("neuro") || query.includes("cancer") || query.includes("palliative") || query.includes("surgery") || query.includes("geriatric")) {
            voiceFallback = "Cooper offers specialized hubs including cardiology, neurology, general surgery, and our MD Anderson Cancer Center. Which clinical specialty can I describe for you today?";
          } else if (query.includes("address") || query.includes("location") || query.includes("camden") || query.includes("where") || query.includes("plaza") || query.includes("map")) {
            voiceFallback = "Our main Cooper Hospital complex is located at One Cooper Plaza, in Camden, New Jersey, zero eight one zero three. We also have the MD Anderson Cancer Center at Three Cooper Plaza. Are you looking for directions or parking details?";
          } else {
            voiceFallback = "Thank you for reaching out to Ava at Cooper University Hospital. I can provide clinical info, check department schedules, or find physicians on our main campus. How can I assist you on this voice line today?";
          }
          return res.json({ text: voiceFallback });
        }

        let fallbackText = `[Sandbox Preview Mode] Hello! I am Ava, your pre-clinical support co-pilot here at Cooper University Hospital.

`;

        if (query.includes("doctor") || query.includes("smith") || query.includes("chen") || query.includes("ali") || query.includes("winters") || query.includes("martinez") || query.includes("vance") || query.includes("lin") || query.includes("thorne") || query.includes("sterling") || query.includes("chasen") || query.includes("cho")) {
          fallbackText += `🧑‍⚕️ **Cooper University Physicians & Care Teams**:
Here are several of our premier specialists on campus:
• **Dr. Jordan Smith** (Cardiologist): "Dedicated to providing advanced cardiovascular care with a compassionate touch."
• **Dr. Kevin Chen** (Surgeon): "Specializing in minimally invasive procedures and rapid recovery."
• **Dr. Shahid Ali** & **Dr. Nasima B.** (Neurologists at Cooper Neurological Institute): Precise brain and nerve recovery care.
• **Dr. Clara Winters** (Palliative Care): Quality of life and comfort focus.
• **Dr. Sophia Martinez** (Geriatrician): Specialized elderly care and wellness plans.
• **Dr. Marcus Thorne** (Oncologist): Practicing at the premier **MD Anderson Cancer Center at Cooper**.
• **Dr. Ryan Sterling** (Dermatologist): Advanced therapeutic skin care and screenings.
• **Dr. Lisa Chasen** (Pediatrician): Pediatric developmental wellness.
• **Dr. Benjamin Cho** (Nephrologist): Kidney wellness and electrolyte preservation.

Would you like me to help schedule an appointment with one of these providers through our booking portal?`;
        } else if (
          query.includes("fever") || query.includes("జ్వరం") ||
          query.includes("headache") || query.includes("తలనొప్పి") ||
          query.includes("cold") || query.includes("జలుబు") ||
          query.includes("cough") || query.includes("దగ్గు") ||
          query.includes("body pain") || query.includes("bodypain") || query.includes("నొప్పులు") ||
          query.includes("stomach") || query.includes("కడుపు")
        ) {
          // Identify precise sub-symptom requested
          let symTitle = "";
          let symEn = "";
          let symTe = "";
          let careEn = "";
          let careTe = "";
          let flagsEn = "";
          let flagsTe = "";

          if (query.includes("fever") || query.includes("జ్వరం")) {
            symTitle = "Fever / జ్వరం";
            symEn = "Elevated body temperature above 100.4°F (38°C), indicating potential immune activity.";
            symTe = "శరీర ఉష్ణోగ్రత 100.4°F లేదా అంతకంటే ఎక్కువ ఉండటం.";
            careEn = "Stay fully hydrated, rest, and utilize pediatric/adult approved fever reducers like acetaminophen according to directions.";
            careTe = "ధారళంగా నీరు తాగండి, విశ్రాంతి తీసుకోండి. డాక్టర్ సలహాతో జ్వరం తగ్గించే మందులు ఉదాహరణకు పారాసిటమాల్ ఉపయోగించండి.";
            flagsEn = "Fever above 103°F (39.4°C), stiff neck, extreme weakness, or fever that continues for over 3 days without relief.";
            flagsTe = "జ్వరం 103°F కన్నా ఎక్కువ ఉండటం, మెడ బిగుసుకోపోవడం, శ్వాస తీసుకోవడం కష్టంగా ఉండటం అత్యంత ప్రమాదకరం.";
          } else if (query.includes("headache") || query.includes("తలనొప్పి")) {
            symTitle = "Headache / తలనొప్పి";
            symEn = "Pain or pressure across the skull, temple, or neck area.";
            symTe = "తల భాగాంలో వచ్చే తీవ్రమైన లేదా సాధారణ నొప్పి.";
            careEn = "Rest in a modern dark/quiet chilled room, place cool compresses on your forehead, and sustain hydration.";
            careTe = "నిశ్శబ్దంగా మరియు చీకటిగా ఉండే గదిలో కళ్ళు మూసుకొని పడుకోండి. నుదుటిపై చల్లని గుడ్డ కంప్రెస్ పెట్టండి.";
            flagsEn = "Sudden extreme 'thunderclap' level headache, slurred speech, confusion, or difficulty walking.";
            flagsTe = "అకస్మాత్తుగా గుండె వేగంలా విపరీతమైన తలనొప్పి రావడం, కంటి చూపు మసకబారడం, వెంటనే 911 ని సంప్రదించాలి.";
          } else if (query.includes("cold") || query.includes("జలుబు") || query.includes("cough") || query.includes("దగ్గు")) {
            symTitle = "Cold & Cough / జలుబు మరియు దగ్గు";
            symEn = "Upper respiratory mucosal inflammation with throat or lung clears.";
            symTe = "ముక్కు కారడం మరియు శ్వాసకోశ గొంతు రాపిడి దగ్గు.";
            careEn = "Steam vapor inhalation, salt water gargling, organic honey for throat soothing, warm fluids.";
            careTe = "వేడి నీటి ఆవిరి పట్టడం, గోరువెచ్చని ఉప్పునీటితో గొంతు కడగడం, చెంచా తేనె గొంతును తేలికపరుస్తుంది.";
            flagsEn = "Shortness of breath, audible wheezing, coughing up pink/bloody mucus or persistent high fever.";
            flagsTe = "శ్వాస పీల్చుకోవడం తీవ్ర సమస్యగా మారడం, దగ్గినప్పుడు రక్తం పడటం ప్రమాద సంకేతాలు.";
          } else if (query.includes("body pain") || query.includes("bodypain") || query.includes("నొప్పులు")) {
            symTitle = "Body Pain & Muscle Aches / ఒంటి నొప్పులు";
            symEn = "Generalized soreness across skeletal muscles or major joints.";
            symTe = "కండరాలు మరియు కీళ్లలో వచ్చే నొప్పి.";
            careEn = "Slight muscular stretches, comforting warm showers, therapeutic heat packs, and adequate rest.";
            careTe = "గోరువెచ్చటి నీటి స్నానాలు చేసుకోండి, తేలికపాటి శరీరం సాగతీత కదలికలు (stretching), మరియు విశ్రాంతి అవసరం.";
            flagsEn = "Extreme localized joint inflammation, inability to support body weight or move digits.";
            flagsTe = "కీళ్లలో విపరీతమైన వాపు, ఏ అవయవమైనా కదలించలేకపోవడం లేదా స్పర్శ కోల్పోవడం.";
          } else {
            symTitle = "Stomach Pain / కడుపు నొప్పి";
            symEn = "Abdominal region muscular cramping or digestive tract distress.";
            symTe = "జీర్ణవ్యవస్థలో అసౌకర్యంగా ఉండి వచ్చే కడుపు నొప్పి.";
            careEn = "Adopt a highly bland BRAT diet framework, split fluids into tiny frequent sips, avoid dairy.";
            careTe = "సులువుగా జీర్ణమయ్యే అరటిపండ్లు, అన్నం తీసుకోండి. పాలు లేదా నూనె వస్తువులకి దూరంగా ఉండండి.";
            flagsEn = "Severe localized lower-right side abdomen pain, uncontrolled vomiting, or black blood in stool.";
            flagsTe = "కడుపు యొక్క కుడివైపు క్రింది భాగంలో కలగనే తీవ్రమైన నొప్పి (అపెండిసైటిస్ సూచన) లేదా రక్తం పడటం.";
          }

          fallbackText += `🩺 **Pre-Clinical Support for ${symTitle}**:

🔹 **Clinical Description**:
• *English*: ${symEn}
• *తెలుగు*: ${symTe}

💡 **Symptom Home Care (హోమ్ కేర్ విధానాలు)**:
• *English*: ${careEn}
• *తెలుగు*: ${careTe}

🚨 **Red Flags & Warning Signs (అత్యవసర ప్రమాద సంకేతాలు)**:
• *English*: ${flagsEn}
• *తెలుగు*: ${flagsTe}

*Please look at our red flag guidelines below. If severe issues persist, call 911 immediately.*`;
        } else if (query.includes("department") || query.includes("specialt") || query.includes("cardiology") || query.includes("neuro") || query.includes("cancer") || query.includes("palliative") || query.includes("surgery") || query.includes("geriatric")) {
          fallbackText += `🏥 **Specialized Hospital Departments & Centers**:
• **Cooper Neurological Institute**: State-of-the-art care for neurological and neurosurgical conditions.
• **MD Anderson Cancer Center at Cooper**: Regional powerhouse for innovative oncological care.
• **Cardiology & Cardiovascular Department**: Diagnostics, catheterizations, and lipid care.
• **Geriatric Rehabilitation & Palliative Care**: Long-term lifestyle adjustments, joint therapies, and comfort care.
• **General Surgery Desk**: Advanced outpatient and inpatient surgical procedures.`;
        } else if (query.includes("timing") || query.includes("hour") || query.includes("open") || query.includes("time") || query.includes("when")) {
          fallbackText += `⏱️ **Hours of Operation & Timings**:
• **Emergency Room / Trauma Center**: Located at One Cooper Plaza, open **24/7, 365 Days a Year**.
• **Outpatient Scheduling Line**: 1-800-8-COOPER (1-800-826-6737) is available **Monday - Friday, 8:00 AM — 5:00 PM**.
• **Main Switchboard Helpline**: Available **24 Hours / 7 Days a Week** at **856-342-2000**.
• **Billing Coordinators**: Main Campus office open **Monday - Friday, 8:00 AM — 5:00 PM**.`;
        } else if (query.includes("address") || query.includes("location") || query.includes("camden") || query.includes("where") || query.includes("plaza") || query.includes("map")) {
          fallbackText += `📍 **Campus Locations & Address Coordinates**:
• **Cooper Main Hospital**: One Cooper Plaza, Camden, NJ 08103.
• **MD Anderson Cancer Center at Cooper**: Three Cooper Plaza, Camden, NJ 08103.
• **Cooper Medical School (CMSRU)**: Academic clinical medical sciences facility, Camden, NJ.

Convenient parking garages are located adjacent to both One Cooper Plaza and Three Cooper Plaza with full valet check-in options.`;
        } else {
          fallbackText += `Thank you for your message regarding: "${message}".

I can assist you with precise clinical details:
• **Physical Campus Address**: One Cooper Plaza, Camden, NJ 08103.
• **24/7 Telephone Switchboard**: 856-342-2000.
• **Scheduling Line (8am - 5pm Mon-Fri)**: 1-800-8-COOPER.
• **Specialized Hubs**: MD Anderson Cancer Center, Cooper Neurological Institute.
• **Medical Experts**: Dr. Jordan Smith (Cardiology), Dr. Marcus Thorne (Oncology), Dr. Clara Winters (Palliative Care), Dr. Shahid Ali (Neurology).`;
        }

        fallbackText += `\n\n*Ava is a pre-clinical support co-pilot, not a replacement for professional medical diagnosis or immediate physical hotlines. For medical emergencies, please dial 911 immediately.*`;

        return res.json({ text: fallbackText });
      }

      // Build structured contents payload from client history for conversation context
      const contents: any[] = [];
      if (Array.isArray(history)) {
        history.forEach((msg: any) => {
          if (msg.sender === "user") {
            contents.push({ role: "user", parts: [{ text: msg.text }] });
          } else if (msg.sender === "ava") {
            contents.push({ role: "model", parts: [{ text: msg.text }] });
          }
        });
      }

      // Add the final active statement
      contents.push({ role: "user", parts: [{ text: message }] });

      // Build dynamic system instructions based on channel type
      let activeSystemInstruction = SYSTEM_INSTRUCTION;
      if (channel === "voice") {
        activeSystemInstruction += `\n\nVOICE INTERACTION SPEECH COMPLIANCE OVERRIDE:
- The user is talking directly over a live voice connection.
- Speak in a natural, smooth, conversational tone, as if speaking on a phone call.
- Keep your response extremely brief (under 3 sentences, ideally 1-2 short, clear sentences). Do NOT be verbose or long-winded!
- DO NOT use any markdown formatting (no bold **, italics *, bullets •, numbered lists, markdown heading lines #, emojis, links, brackets, or code blocks) because your response is being read aloud using browser Text-to-Speech synthesis and raw markdown characters sound extremely robotic and broken.
- Choose words that are comforting, human-like, and easy to pronounce.
- Keep the language plain and flow continuous.
- End with a brief, helpful conversational follow-up question or reassurance.`;
      }

      // Query Gemini 2.5 Flash (as requested)
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: activeSystemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I was unable to formulate a response to that inquiry. How else can I assist you at Cooper?";
      res.json({ text: replyText });
    } catch (err: any) {
      console.error("Gemini Assistant server proxy failed:", err);
      res.status(500).json({ error: err.message || "Internal GenAI Server Error" });
    }
  });

  // Specialized Doctor Consultation Endpoint
  app.post("/api/doctor-consult-init", async (req, res) => {
    // Helper function to generate a rich dynamic simulated/fallback response
    const getDynamicSimulatedResponse = (msgText: string, name: string, role: string, language: string) => {
      const docLastName = name.split(" ").pop() || "Doctor";
      const isTe = language === "te" || /[\u0c00-\u0c7f]/.test(msgText);
      const query = msgText.toLowerCase();
      let greeting = "";
      let treatmentAdvice = "";
      let warningAdvice = "";

      if (isTe) {
        greeting = `నమస్కారం! నేను డాక్టర్ ${docLastName}. మీ యొక్క శారీరక స్థితి మరియు ప్రశ్నను అర్థం చేసుకున్నాను.`;
        if (query.includes("fever") || query.includes("జ్వరం") || query.includes("వేడి")) {
          treatmentAdvice = `ప్రస్తుతం మీకు జ్వరం మరియు అధిక ఉష్ణోగ్రత ఉన్నట్లు తెలుస్తోంది. నా వైద్య సిఫార్సు ప్రకారం: దయచేసి పుష్కలంగా నీరు మరియు ద్రవపదార్థాలు తీసుకోండి, పూర్తి బెడ్ రెస్ట్ లో ఉండండి. నుదుటిపై తడిగుడ్డ కాపడం పెట్టండి.`;
          warningAdvice = `ఒకవేళ జ్వరం 103°F దాటినా, తీవ్రమైన మెడ బిగుతు లేదా శ్వాస ఇబ్బంది వచ్చినా తక్షణమే 911 లేదా అత్యవసర విభాగానికి వెళ్ళండి.`;
        } else if (query.includes("cough") || query.includes("దగ్గు") || query.includes("cold") || query.includes("throat") || query.includes("జలుబు")) {
          treatmentAdvice = `దగ్గు, జలుబు మరియు గొంతు నొప్పి నివారణ కోసం: వేడి నీటి ఆవిరి పట్టడం, ఒక చెంచా తేనె తీసుకోవడం మరియు గోరువెచ్చని నీరు తరచుగా తాగడం మంచిది.`;
          warningAdvice = `ఒకవేళ శ్వాస తీసుకోవడంలో తీవ్రమైన ఇబ్బంది ఉన్నట్లయితే వెంటనే అత్యవసర వైద్య సేవలను సంప్రదించండి.`;
        } else if (query.includes("stomach") || query.includes("కడుపు") || query.includes("నొప్పి")) {
          treatmentAdvice = `కడుపు నొప్పి మరియు జీర్ణ సమస్యల కొరకు: తేలికగా జీర్ణమయ్యే ఆహారాలు తీసుకోండి. ఎడమ వైపునకు తిరిగి పడుకోవడం మరియు గోరువెచ్చని శొంఠి నీరు తాగడం ఉపశమనం కలిగిస్తుంది.`;
          warningAdvice = `కడుపు యొక్క కుడివైపు క్రింది భాగంలో తీవ్రమైన నొప్పి ఉంటే అది అపెండిసైటిస్ కావచ్చు, నిర్లక్ష్యం చేయకండి.`;
        } else {
          treatmentAdvice = `మీరు ప్రస్తావించిన విషయం "${msgText}" కి సంబంధించి: నిరంతర శారీరక పరిశీలన, తగినంత విశ్రాంతి మరియు సమతుల్య హైడ్రేషన్ అవసరం.`;
          warningAdvice = `లక్షణాలు ఏదైనా తీవ్రంగా మారితే వెంటనే మమ్మల్ని సంప్రదించండి.`;
        }
        
        return `${greeting}

🩺 **నా వైద్య సలహా**:
${treatmentAdvice}

⚠️ **ప్రమాద సూచనలు**:
${warningAdvice}

*గమనిక: ఈ సమాచారం ప్రాథమిక విశ్లేషణ మాత్రమే. అత్యవసర పరిస్థితుల్లో దయచేసి 911 లేదా దగ్గరలోని ఆసుపత్రిని సంప్రదించండి.*`;
      }

      // English personalized offline simulator
      greeting = `Hello, I am Dr. ${docLastName}, practicing as a ${role} at Cooper Hospital. Thank you for utilizing our quick clinic consult. I've analyzed your specific concern: "${msgText}".`;
      
      let customSpecialtyInsight = "";
      if (role.toLowerCase().includes("neurologist")) {
        customSpecialtyInsight = "As a Neurologist, I focus heavily on how stress, physical fatigue, nerve coordination, or systemic pressure trigger these neuro-pathway indicators.";
      } else if (role.toLowerCase().includes("nephrologist")) {
        customSpecialtyInsight = "As a Nephrologist, I closely evaluate fluid dynamics, kidney filtration load, and electrolyte balance in relation to these symptoms.";
      } else if (role.toLowerCase().includes("palliative")) {
        customSpecialtyInsight = "As a Palliative Care Specialist, my clinical goal is always comfort optimization, proactive symptom mitigation, and alleviating stress.";
      } else if (role.toLowerCase().includes("cardiologist")) {
        customSpecialtyInsight = "From a Cardiology perspective, maintaining clean vascular circulation, stable blood pressure load, and proper hydration is paramount.";
      } else if (role.toLowerCase().includes("surgeon")) {
        customSpecialtyInsight = "From a General Surgery overview, we must continuously monitor for any localized inflammatory triggers, swelling, or acute soft-tissue stress.";
      } else {
        customSpecialtyInsight = `Considering my specialty in ${role}, safeguarding your body's vital baselines and energy reserves is critical.`;
      }

      if (query.includes("fever") || query.includes("temperature") || query.includes("hot") || query.includes("chill")) {
        treatmentAdvice = `Your fever or temperature signs indicate an active immune response. I recommend:
• Strict physical rest and avoiding active exertion.
• Sip room-temperature electrolytes or water frequently to keep kidney load balanced.
• Place a cool, damp compress on your forehead or back of the neck to draw away heat.`;
        warningAdvice = `Fever spikes exceeding 103°F (39.4°C), severe confusion, or a stiff neck.`;
      } else if (query.includes("head") || query.includes("migraine") || query.includes("headache") || query.includes("pressure")) {
        treatmentAdvice = `For localized head pressure or headaches, my recommended symptom-reducing protocol is:
• Dim room lights fully and disconnect entirely from digital screens.
• Focus on slow, rhythmic abdominal breathing to lower tension around the cranial area.
• Hydrate with a large glass of chilled water immediately to check for dehydration.`;
        warningAdvice = `A sudden, extreme 'thunderclap' headache, slurred speech, or difficulty walking/balancing.`;
      } else if (query.includes("stomach") || query.includes("belly") || query.includes("abdominal") || query.includes("cram") || query.includes("nausea")) {
        treatmentAdvice = `For stomach or abdominal discomfort:
• Lay quiet on your left side to align the digestive tract and reduce acid reflux.
• Adopt a highly basic BRAT (Bananas, Rice, Applesauce, Toast) food regimen for the next 12 hours.
• Avoid heavy dairy, oils, or carbonated beverages to give stomach tissues adequate recovery.`;
        warningAdvice = `Severe, localized stabbing pain on the lower right side of your stomach or persistent uncontrolled vomiting.`;
      } else if (query.includes("cough") || query.includes("throat") || query.includes("cold") || query.includes("congestion") || query.includes("breath")) {
        treatmentAdvice = `For upper respiratory, cough, or dry throat irritation:
• Inhale warm steam arising from a hot shower or tea to lubricate bronchial linings.
• Keep your throat lubricated with warm water containing a spoonful of honey (for age 1+).
• Use elevated pillows under your head at night to keep bronchial passages clear.`;
        warningAdvice = `Shortness of breath, blue-tinted lips, audible wheezing, or coughing up blood.`;
      } else {
        let parsedTopic = query;
        if (parsedTopic.length > 30) parsedTopic = parsedTopic.substring(0, 30) + "...";
        treatmentAdvice = `Regarding your specific indicator "${parsedTopic}":
• Focus on light physical or mental rest and avoid intense activity.
• Maintain continuous, proper hydration with pure water or mineral fluids.
• Monitor your vitals such as resting heart rate and sleep patterns.`;
        warningAdvice = `Any extreme, crushing pain, severe respiratory distress, or localized severe swelling.`;
      }

      return `${greeting}

💡 **Specialty Insight**:
${customSpecialtyInsight}

🩺 **Clinical Care Protocol**:
${treatmentAdvice}

🚨 **Red Flag Emergency Signs**:
If you experience: *${warningAdvice}*, do not wait. Call 911 immediately or go to the nearest emergency center.

*Disclaimer: This is an automated virtual consultation based on initial patient-typed text. It is not an official medical diagnosis or treatment.*`;
    };

    try {
      const { message, history, doctorName, doctorRole, lang = "en" } = req.body;
      if (!message || !doctorName || !doctorRole) {
        return res.status(400).json({ error: "Message, doctorName, and doctorRole are required" });
      }

      const docLastName = doctorName.split(" ").pop() || "Doctor";

      // If key is not set, use the dynamic offline simulator
      if (!apiKey || apiKey === "UNDEFINED" || apiKey.includes("your-api-key")) {
        const text = getDynamicSimulatedResponse(message, doctorName, doctorRole, lang);
        return res.json({ text });
      }

      // Build structured contents payload from client history for conversation context
      const contents: any[] = [];
      if (Array.isArray(history)) {
        history.forEach((msg: any) => {
          if (msg.sender === "user") {
            // Strictly enforce alternating structure or combine consecutive user messages
            if (contents.length > 0 && contents[contents.length - 1].role === "user") {
              contents[contents.length - 1].parts[0].text += "\n" + msg.text;
            } else {
              contents.push({ role: "user", parts: [{ text: msg.text }] });
            }
          } else if (msg.sender === "doctor" || msg.sender === "model" || msg.sender === "ava") {
            // Only add model messages if we already have a starting user message to maintain alternating state
            if (contents.length > 0) {
              if (contents[contents.length - 1].role === "model") {
                contents[contents.length - 1].parts[0].text += "\n" + msg.text;
              } else {
                contents.push({ role: "model", parts: [{ text: msg.text }] });
              }
            }
          }
        });
      }

      // Append the latest user message
      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        contents[contents.length - 1].parts[0].text += "\n" + message;
      } else {
        contents.push({ role: "user", parts: [{ text: message }] });
      }

      const activeSystemInstruction = `You are Dr. ${docLastName}, a highly professional, compassionate, and precise ${doctorRole} at Cooper University Hospital.
You are conducting a quick online consultation session.
Respond to the patient's messages and questions dynamically, with clear, personalized, professional guidance, medical tips, and diagnostic suggestions according to your specialty as a ${doctorRole}.

SPECIAL CORRESPONDENCE & COMPLIANCE:
1. Speak in your persona as "Dr. ${docLastName}". Do NOT break character.
2. Provide real, custom, and professional clinical-style advice based exactly on what they ask. Do NOT give generic or repetitive responses. Address their symptoms dynamically.
3. Keep your advice structured, encouraging, comforting, and easy to read (use key terms, brief bullets if needed).
4. ALWAYS end with a professional and compassionate clinical guidance disclaimer:
   "Please note: My electronic suggestions are pre-clinical tips based on initial text indicators. They do not constitute a formal diagnosis or physical treatment plan. In case of emergency or severe symptoms, please dial 911 or visit our primary Camden campus emergency department."`;

      // Query Gemini 2.5 Flash to ensure compatibility and robust routing
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: activeSystemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || `Hello, this is Dr. ${docLastName}. I received your query. Please stay well-hydrated and rest, or schedule an in-clinic slot.`;
      res.json({ text: replyText });
    } catch (err: any) {
      console.error("Doctor Consultation server proxy failed, falling back to dynamic offline response:", err);
      // Fallback gracefully to the high-fidelity dynamic response generator instead of throwing or static lines
      const { message = "", doctorName = "Doctor", doctorRole = "Physician", lang = "en" } = req.body || {};
      const fallbackText = getDynamicSimulatedResponse(message, doctorName, doctorRole, lang);
      res.json({ text: fallbackText });
    }
  });

  // Vite development vs production asset middleware pipeline
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cooper Hospital Ava full-stack server listening on http://localhost:${PORT}`);
  });
}

startServer();

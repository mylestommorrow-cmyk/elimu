import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-curated high quality Kenyan curriculum responses for offline & fallback support
function getCuratedTutorResponse(prompt: string, language: string, learnerGrade: string): string {
  const p = prompt.toLowerCase();
  const isSwahili = language === 'sw' || p.includes('nieleze') || p.includes('chakula') || p.includes('habari') || p.includes('kazi');

  if (isSwahili) {
    if (p.includes('chakula') || p.includes('mmeng\'enyo') || p.includes('tumbo')) {
      return `Habari mwanafunzi! Huu hapa ufafanuzi wa **Mfumo wa Mmeng'enyo wa Chakula (Human Digestive System)**:

1. **Kinywa (Mouth):** Meno husaga chakula, na mate (mate yenye kimeng'enya cha *ptyalin/amylase*) huanza kuyeyusha wanga kuwa sukari.
2. **Koo (Esophagus):** Husafirisha donge la chakula kuelekea tumboni kupitia msukumo wa misuli unaoitwa *peristalsis*.
3. **Tumbo (Stomach):** Chakula huchanganywa na asidi ya *hydrochloric* (HCl) inayoua bakteria na kusaidia kimeng'enya cha *pepsin* kuvunja protini.
4. **Utumbo Mdogo (Small Intestine):**
   - Hapa ndipo mafuta, wanga, na protini humeng'enywa kabisa kwa msaada wa nyongo (*bile*) kutoka kwenye ini na vimeng'enya vya kongosho (*pancreas*).
   - Virutubisho hufyonzwa mwilini kupitia vilindo (*villi*).
5. **Utumbo Mpana (Large Intestine):** Hufyonza maji na madini yaliyobaki.
6. **Mkundu (Anus):** Huondoa mabaki yasiyohitajika (kinyesi).

💡 **Dokezo la Mtihani:** Kumbuka kazi ya asidi ya HCl na umuhimu wa *villi* katika kuongeza eneo la kufyonza chakula!`;
    }

    if (p.includes('nomino') || p.includes('kitenzi') || p.includes('sarufi')) {
      return `Hujambo! Hapa kuna tofauti muhimu katika **Sarufi ya Kiswahili**:

- **Nomino (N):** Ni neno linalotaja jina la mtu, mahali, mnyama, kitu au hali.
  *Mifano:* Juma, Nairobi, ng'ombe, kitabu, amani, elimu.
- **Kitenzi (T):** Ni neno linaloelezea kitendo kinachofanyika, hali, au tendo.
  *Mifano:* anakimbia, alisoma, tulikula, wanacheka.

*Mfano katika sentensi:*
"**Mwanafunzi** (Nomino) **anasoma** (Kitenzi) kwa bidii."

💡 **Kidokezo cha KCSE/CBC:** Katika uchanganuzi wa sentensi, daima tambua kwanza kikundi nomino (KN) na kikundi tenzi (KT)!`;
    }

    return `Habari! Mimi ni **Mwalimu AI** kwenye ElimuBridge. Nipo hapa kukusaidia katika masomo yako ya **${learnerGrade}**.

Kuhusiana na swali lako: "${prompt}"

1. Jambo kuu katika mada hii ni kuelewa dhana za kimsingi zinazofundishwa kwenye silabasi ya CBC na KCSE.
2. Zingatia mifano halisi ya kila siku nchini Kenya (kama vile kilimo, sayansi ya mazingira, au uchumi wa kijamii).
3. Fanya mazoezi ya mara kwa mara kwa kutatua maswali ya mtihani yaliyopita (*past papers*).

Una swali lolote la ziada kuhusu fomula, maana ya maneno au mfano wa kimahesabu? Niulize bila wasiwasi!`;
  }

  // English curriculum responses
  if (p.includes('linear equation') || p.includes('equation') || p.includes('algebra')) {
    return `Hello! Let's break down **Linear Equations** step-by-step for **${learnerGrade}**:

### 1. What is a Linear Equation?
A linear equation is an algebraic equation where each term has an exponent of 1 (the graph produces a straight line).
The standard slope-intercept form is:
$$\\mathbf{y = mx + c}$$
- **m** = gradient / slope $\\left(\\frac{y_2 - y_1}{x_2 - x_1}\\right)$
- **c** = y-intercept (where the line crosses the vertical y-axis)

### 2. Worked Example
Solve for $x$:
$$3x + 7 = 22$$

- **Step 1:** Subtract 7 from both sides:
  $$3x = 22 - 7$$
  $$3x = 15$$
- **Step 2:** Divide both sides by 3:
  $$x = \\frac{15}{3} = 5$$

### 3. Key KCSE Exam Check:
Always substitute your answer back into the original equation to verify:
$$3(5) + 7 = 15 + 7 = 22 \\quad \\text{(Correct!)}$$`;
  }

  if (p.includes('xylem') || p.includes('phloem') || p.includes('plant') || p.includes('water transport')) {
    return `Great question! Here is how **Plant Vascular Transport (Xylem vs. Phloem)** works:

1. **Xylem Vessels:**
   - **What they transport:** Water and dissolved mineral salts.
   - **Direction:** Unidirectional flow (upward only: from roots $\\rightarrow$ stem $\\rightarrow$ leaves).
   - **Driving forces:** Transpiration pull, capillary action, and root pressure.
   - **Structure:** Hollow, non-living tube reinforced with tough **lignin** to withstand pressure.

2. **Phloem Vessels:**
   - **What they transport:** Manufactured food (sucrose and amino acids from photosynthesis).
   - **Direction:** Bidirectional flow (translocation from source leaves to storage sinks like roots, fruits, and growing buds).
   - **Structure:** Living cells with perforated **sieve plates** and adjacent **companion cells** packed with mitochondria to supply ATP.

💡 **Quick Revision Tip:** Remember "Xy = High" (water travels high from roots) and "Phloem = Flow everywhere" (food translocates up and down).`;
  }

  if (p.includes('circle') || p.includes('geometry') || p.includes('theorem') || p.includes('angle')) {
    return `Hello! Here are the core **Circle Theorems** frequently tested in KCSE Mathematics:

1. **Angle at the Centre Theorem:**
   The angle subtended by an arc at the center is twice the angle subtended by it at any point on the circumference:
   $$\\angle \\text{centre} = 2 \\times \\angle \\text{circumference}$$

2. **Angle in a Semicircle:**
   An angle subtended by the diameter at the circumference is always a right angle ($90^\\circ$).

3. **Angles in the Same Segment:**
   Angles subtended by the same chord or arc in the same segment of a circle are equal.

4. **Cyclic Quadrilateral:**
   Opposite interior angles in a cyclic quadrilateral always add up to $180^\\circ$:
   $$\\angle A + \\angle C = 180^\\circ, \\quad \\angle B + \\angle D = 180^\\circ$$

5. **Alternate Segment Theorem:**
   The angle between a tangent and a chord through the point of contact equals the angle in the alternate segment.`;
  }

  return `Hello! I am **Mwalimu AI**, your study companion on ElimuBridge.

Regarding your question on **"${prompt}"**:

1. **Core Concept:** In the Kenyan ${learnerGrade} syllabus, mastery of this topic requires understanding the foundational definitions, underlying principles, and standard problem-solving procedures.
2. **Key Principle:** Break down complex questions into known variables, applicable formulas or rules, and final conclusions with proper units.
3. **Application:** In practical contexts (like Kenyan science, agriculture, or commerce), connect theory to real-world observations.

Would you like me to walk you through a specific KCSE/CBC practice question, a worked formula, or a definition? Feel free to ask!`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Gemini API if configured
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log('Gemini AI client initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
    }
  }

  // AI Tutor API endpoint
  app.post('/api/tutor', async (req, res) => {
    const { prompt, language = 'en', learnerGrade = 'Grade 8 CBC', subject = 'General' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt text is required' });
    }

    // Try Gemini API first if available
    if (ai) {
      try {
        const systemInstruction = `You are "Mwalimu AI", an encouraging, knowledgeable Kenyan school curriculum tutor on the ElimuBridge educational platform.
Your mission is to help Kenyan learners excel in their CBC (Competency-Based Curriculum, Grades 7-9) and KCSE (Kenya Certificate of Secondary Education, Forms 1-4).
Current learner level: ${learnerGrade}. Subject area: ${subject}.
Target language: ${language === 'sw' ? 'Kiswahili (au mchanganyiko mwepesi wa Kiswahili fasaha na msamiati wa kimasomo)' : 'English (clear, encouraging, and structured)'}.

Formatting & Tone rules:
1. Provide accurate, curriculum-aligned explanations using Kenyan contexts (e.g. shillings, Kenyan geography, local farming, flora/fauna, KICD objectives).
2. Use clear markdown formatting: concise bullet points, bold key terms, and step-by-step worked math/science reasoning.
3. Keep answers compact, clear, and easy to read on mobile devices.
4. End with an empowering 1-sentence note of encouragement or a self-test question.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const text = response.text || '';
        if (text.trim().length > 0) {
          return res.json({ text, source: 'gemini-3.8-flash' });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to curated curriculum knowledge:', geminiError?.message || geminiError);
      }
    }

    // Curated high-fidelity fallback
    const fallbackText = getCuratedTutorResponse(prompt, language, learnerGrade);
    return res.json({ text: fallbackText, source: 'curated-offline' });
  });

  // Health and offline status check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'ElimuBridge',
      offlineSupported: true,
      geminiActive: !!ai,
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ElimuBridge server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

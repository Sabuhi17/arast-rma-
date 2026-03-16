const { GoogleGenerativeAI } = require("@google/generative-ai");

// Railway-ə yüklədiyiniz GEMINI_API_KEY dəyişənini sistemdən oxuyur
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI-dən cavab alma funksiyası
async function getAIResponse(userPrompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey:process.env.GEMINI_API_KEY,
});

app.get('/', (req, res) => {
  res.json({ status: 'Sahə Tədqiqatçısı Backend işləyir ✅' });
});

app.post('/evaluate', async (req, res) => {
  const { question, refAnswer, studentAnswer, scenarioTitle } = req.body;

  if (!question || !studentAnswer) {
    return res.status(400).json({ error: 'Sual və cavab tələb olunur' });
  }

  const prompt = `Sən sosial tədqiqat metodları üzrə müəllimsən. Azərbaycan universitetinin 3-cü kurs tələbəsinin cavabını qiymətləndirirsən.

SSENARI: ${scenarioTitle || ''}
SUAL: ${question}
DÜZGÜN CAVABDA OLMALI OLAN FİKİRLƏR: ${refAnswer || ''}
TƏLƏBƏNİN CAVABI: "${studentAnswer}"

QİYMƏTLƏNDİRMƏ (1-10 xal):
- 1-2: Boş, mövzudan kənar, "bilmirəm" tipli cavab
- 3-4: Çox az məlumat, əsas fikirlər yoxdur
- 5-6: Bəzi düzgün fikirlər var amma natamamdır
- 7-8: Əsas fikirlər var, yaxşı izah edilib
- 9-10: Demək olar tam, dərin anlayış göstərilir

VACIB QAYDALAR:
- Qrammatika, yazı səhvi, dialekt üçün XAL ÇIXMA
- Yalnız məzmuna, anlayışlara, məntiqi düşüncəyə bax
- Fikir düzgündürsə amma zəif ifadə olunubsa — fikrə görə xal ver
- "bilmirəm", "fərqi yoxdur", tamamilə kənar cavab = 1-2 xal
- Feedback Azərbaycan dilində, qısa və dost tonda

YALNIZ bu JSON formatında cavab ver, başqa heç nə yazma:
{"xal":<1-10 tam ədəd>,"guclu":"<güclü tərəf, 1 cümlə>","eksik":"<çatışmayan, 1 cümlə və ya boş string>","توصیه":"<tövsiyə, 1 cümlə>"}`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);

    if (typeof result.xal !== 'number' || result.xal < 1 || result.xal > 10) {
      throw new Error('Yanlış xal formatı');
    }

    res.json(result);
  } catch (err) {
    console.error('Xəta:', err.message);
    res.status(500).json({
      error: 'Qiymətləndirmə xətası',
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda işləyir`);
});

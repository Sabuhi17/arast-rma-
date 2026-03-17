const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
- "bilmirəm", boş cavab, tamamilə kənar cavab = 1-2 xal
- Feedback Azərbaycan dilində, qısa və dost tonda

YALNIZ bu JSON formatında cavab ver, başqa heç nə yazma:
{"xal":<1-10 tam ədəd>,"guclu":"<güclü tərəf, 1 cümlə>","eksik":"<çatışmayan, 1 cümlə və ya boş string>","توصیه":"<tövsiyə, 1 cümlə>"}`;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY tapılmadı');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 400,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('Groq xətası: ' + errText);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content
      .replace(/```json|```/g, '')
      .trim();

    const result = JSON.parse(raw);

    if (typeof result.xal !== 'number' || result.xal < 1 || result.xal > 10) {
      throw new Error('Yanlış xal formatı');
    }

    res.json(result);

  } catch (err) {
    console.error('Xəta:', err.message);
    res.status(500).json({
      error: 'Qiymətləndirmə xətası',
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda işləyir`);
});

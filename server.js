const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.json({ status: "Sahə Tədqiqatçısı Backend işləyir ✅" });
});

app.post("/evaluate", async (req, res) => {
  const { question, refAnswer, studentAnswer, scenarioTitle } = req.body;

  if (!question || !studentAnswer) {
    return res.status(400).json({ error: "Sual və cavab tələb olunur" });
  }

  const prompt = `
Sən sosial tədqiqat metodları üzrə müəllimsən. Azərbaycan universitetinin 3-cü kurs tələbəsinin cavabını qiymətləndirirsən.

SSENARI: ${scenarioTitle || ""}
SUAL: ${question}
DÜZGÜN CAVABDA OLMALI OLAN FİKİRLƏR: ${refAnswer || ""}
TƏLƏBƏNİN CAVABI: "${studentAnswer}"

QİYMƏTLƏNDİRMƏ (1-10 xal):
- 1-2: Boş və ya mövzudan kənar
- 3-4: Çox az məlumat
- 5-6: Qismən düzgün
- 7-8: Əsas fikirlər var
- 9-10: Demək olar tam cavab

JSON formatında cavab ver:
{"xal":<1-10>,"guclu":"<güclü tərəf>","eksik":"<çatışmayan>","tovsiyə":"<tövsiyə>"}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (err) {
    console.error("AI xətası:", err.message);

    res.status(500).json({
      error: "Qiymətləndirmə xətası",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server işləyir: " + PORT);
});

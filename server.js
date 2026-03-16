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
    return res.status(400).json({
      error: "Sual və tələbə cavabı lazımdır"
    });
  }

  const prompt = `
Sən sosial tədqiqat metodları üzrə müəllimsən və tələbə cavabını qiymətləndirirsən.

SSENARI: ${scenarioTitle || ""}
SUAL: ${question}
DÜZGÜN CAVABDA OLMALI OLAN FİKİRLƏR: ${refAnswer || ""}
TƏLƏBƏNİN CAVABI: "${studentAnswer}"

1-10 arası qiymətləndir.

QAYDALAR
- Qrammatika səhvinə görə xal çıxma
- Yalnız məzmunu qiymətləndir
- Dost və qısa rəy yaz

YALNIZ bu JSON formatında cavab ver:
{"xal":<1-10>,"guclu":"<güclü tərəf>","eksik":"<çatışmayan>","tovsiye":"<tövsiyə>"}
`;

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();

    const clean = text.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        xal: 5,
        guclu: "Cavab qismən mövzu ilə əlaqəlidir",
        eksik: "AI JSON formatını poza bilər",
        tovsiye: "Cavabı daha strukturlaşdırılmış yaz"
      };
    }

    res.json(parsed);

  } catch (err) {

    console.error("AI Xətası:", err);

    res.status(500).json({
      error: "AI qiymətləndirmə xətası",
      details: err.message
    });

  }

});

app.listen(PORT, () => {
  console.log("Server işləyir port:", PORT);
});

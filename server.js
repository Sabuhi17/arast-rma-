const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.json({ status: "Backend işləyir ✅" });
});

app.post("/evaluate", async (req, res) => {
  const { question, studentAnswer } = req.body;

  if (!question || !studentAnswer) {
    return res.status(400).json({ error: "Sual və cavab lazımdır" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
SUAL: ${question}
TƏLƏBƏ CAVABI: ${studentAnswer}

1-10 arası qiymətləndir və JSON qaytar:
{"xal":<1-10>,"feedback":"qısa rəy"}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ ai: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI xətası" });
  }
});

app.listen(PORT, () => {
  console.log("Server işləyir port:", PORT);
});

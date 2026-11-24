const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "Young Executive AI"
  });
});

app.get("/ask", async (req, res) => {
  try {
    const question = req.query.q;

    if (!question) {
      return res.status(400).json({
        error: "Add a question using ?q=your question"
      });
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `You are Young Executive AI. Answer clearly, simply, and helpfully.\n\nQuestion: ${question}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    const answer =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate an answer.";

    res.json({
      question: question,
      answer: answer
    });
  } catch (error) {
    console.error(
      "AI request failed:",
      error?.response?.data || error.message
    );

    res.status(500).json({
      error: "AI request failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Young Executive AI backend running on port ${PORT}`);
});

module.exports = app;

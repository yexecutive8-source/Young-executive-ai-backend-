const express = require("express");
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Young Executive AI. Answer clearly, simply, and helpfully.\n\nQuestion: ${question}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate an answer.";

    res.json({
      question: question,
      answer: answer
    });
  } catch (error) {
    console.error(error);
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

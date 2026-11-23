import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "Young Executive AI"
  });
});

app.post("/chat", async (req, res) => {
  const message = req.body?.message;

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 8000
  ) {
    return res.status(400).json({
      error: "Please send a question of 1–8000 characters."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "The AI service is not configured yet."
    });
  }

  const model =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text:
                "You are Young Executive AI, a helpful assistant. " +
                "Help users learn, solve math, write code, and " +
                "develop useful ideas. Explain clearly and " +
                "honestly. Admit uncertainty and never claim " +
                "to have performed actions you have not performed."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim() }]
          }]
        }),
        signal: AbortSignal.timeout(60000)
      }
    );

    if (!response.ok) {
      console.error("Gemini HTTP status:", response.status);

      return res.status(
        response.status === 429 ? 429 : 502
      ).json({
        error: response.status === 429
          ? "The AI usage limit was reached. Please try again later."
          : "The AI service could not answer. Please try again."
      });
    }

    const data = await response.json();

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .filter(part => typeof part.text === "string")
      .map(part => part.text)
      .join("\n")
      .trim();

    if (!reply) {
      return res.status(502).json({
        error: "No answer was returned. Try rephrasing your question."
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error("AI request failed:", error.name);

    res.status(502).json({
      error: "Could not reach the AI service. Please try again."
    });
  }
});

const port = Number(process.env.PORT) || 10000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Young Executive AI is listening on port ${port}`);
});

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai"; // ייבוא ספריית OpenAI

// הגדרת קובץ הסביבה
dotenv.config();

const app = express();
const PORT = 3000;

// הגדרות לניתוח בקשות JSON
app.use(bodyParser.json());

// אתחול ה-OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.API_KEY, // המפתח שלך מ-API_KEY
});

// פונקציה לשליחת בקשה ל-GPT API (OpenAI)
async function generateStory(words) {
  const prompt = BASE_PROMPT.replace("{WORDS}", words.join(", "));
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // יש להקפיד לשים את המודל המתאים (כמו gpt-4)
      store: true, // אם רוצים לשמור את הבקשות
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // הדפס את התגובה המלאה למעקב
    console.log("API response:", completion);

    // גישה לתוכן
    if (completion && completion.choices && completion.choices[0] && completion.choices[0].message.content) {
      return completion.choices[0].message.content;
    } else {
      console.error("Response is missing expected fields:", completion);
      throw new Error("Failed to retrieve content from response.");
    }
  } catch (error) {
    console.error("Error communicating with OpenAI:", error.message);
    throw new Error("Failed to generate story.");
  }
}

// מסלול POST לקבלת מילים ועוצמת קושי
app.post("/generate-story", async (req, res) => {
  const { words} = req.body;

  // בדיקות קלט בסיסיות
  if (!Array.isArray(words)) {
    return res.status(400).json({ error: "Please provide exactly 5 words in an array." });
  }

  try {
    const story = await generateStory(words);
    res.status(200).json({ story });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// הרצת השרת
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
console.log("API_KEY:", process.env.API_KEY);

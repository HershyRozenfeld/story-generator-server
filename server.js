const express = require("express");
const bodyParser = require("body-parser");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
const PORT = 3000;

// הגדרות לניתוח בקשות JSON
app.use(bodyParser.json());

// אתחול ה-Grok SDK
const anthropic = new Anthropic({
  apiKey: process.env.API_KEY,
  baseURL: "https://api.x.ai", // כתובת ה-API הנכונה של Grok
});

// פונקציה לשליחת בקשה ל-Grok AI
async function generateStory(words, difficulty) {
  const prompt = `Create a ${difficulty} difficulty story in Hebrew, using these 5 words in English in a meaningful and natural way within the Hebrew text: ${words.join(", ")},=It must be combined with English letters!. The story must be no longer than 40 words. (for example:"יוסי עמד ליד החלון, עשה quick check בטלפון ו-scroll מהיר בפייסבוק. פתאום הוא שמע noise מוזר מתחת למדרגות.")`;


  
  try {
    const response = await anthropic.messages.create({
      model: "grok-beta",
      max_tokens: 512, // הגבלת אורך התגובה
      system: "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    
    // הדפס את התגובה המלאה למעקב
    console.log("API response:", response);

    // גישה לתוכן
    if (response && response.content && response.content[0] && response.content[0].text) {
      return response.content[0].text;
    } else {
      console.error("Response is missing expected fields:", response);
      throw new Error("Failed to retrieve content from response.");
    }
  } catch (error) {
    console.error("Error communicating with Grok:", error.message);
    throw new Error("Failed to generate story.");
  }
}



// מסלול POST לקבלת מילים ועוצמת קושי
app.post("/generate-story", async (req, res) => {
  const { words, difficulty } = req.body;

  // בדיקות קלט בסיסיות
  if (!Array.isArray(words) || words.length !== 5) {
    return res.status(400).json({ error: "Please provide exactly 5 words in an array." });
  }
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).json({ error: "Difficulty must be one of: easy, medium, hard." });
  }

  try {
    const story = await generateStory(words, difficulty);
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
console.log("BASE_URL:", process.env.BASE_URL);

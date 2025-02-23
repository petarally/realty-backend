import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GPT_API,
});

export async function translateText(text) {
  if (!text) {
    throw new Error("No text provided to translate.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-mini",
      messages: [
        {
          role: "system",
          content: `You are a translation assistant. Translate the following text from Croatian to English, Italian, and German.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const response = completion.choices[0].message.content;

    const [english, italian, german] = response
      .split("\n")
      .map((line) => line.trim());

    return {
      en: english.replace("English:", "").trim(),
      it: italian.replace("Italian:", "").trim(),
      de: german.replace("German:", "").trim(),
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error during translation.");
  }
}

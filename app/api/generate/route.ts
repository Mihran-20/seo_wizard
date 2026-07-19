import { NextResponse } from "next/server";

const API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const modelName = "openai/gpt-4o-mini";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and generate 3 different types of SEO-friendly alt texts. 
                Return ONLY a valid JSON object with the following structure:
                {
                  "descriptive": "Description under 125 characters.",
                  "keywordOptimized": "Alt text rich in keywords.",
                  "creative": "Creative caption."
                }`
              },
              {
                type: "image_url",
                image_url: {
                  url: image 
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter Error Details:", errorData);
      throw new Error(errorData.error?.message || `OpenRouter responded with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("Empty response from AI model");
    }

    const cleanJsonString = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanJsonString);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Detailed Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
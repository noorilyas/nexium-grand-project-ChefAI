import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    console.error(
      "Server Error: OPENAI_API_KEY is not configured in environment variables."
    );
    return NextResponse.json(
      { message: "Server configuration error: OpenAI API Key not set." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse request body as JSON:", error);
    return NextResponse.json(
      {
        message:
          "Invalid JSON body received. Please ensure your request body is valid JSON.",
      },
      { status: 400 }
    );
  }

  const {
    ingredients,
    dietaryRestrictions,
    cuisinePreference,
    mealType,
    servingSize,
    cookingTime,
    difficulty,
    userId,
  } = body;

//   const recipePromptText = `Generate a detailed and creative recipe in JSON format based on the following criteria. Ensure the output is *only* the JSON object, ready for direct parsing. Do not include any markdown backticks or extra text outside the JSON. The JSON should have the following structure and fields, including a section for nutritional information (calories, protein, fat) based on common understanding of ingredients (use approximate common values if specific values aren't calculable by a general model). Use "N/A" if info is not available or estimable.:

// {
//   "title": "[Recipe Title]",
//   "description": "[Brief, enticing description]",
//   "servingSize": "[e.g., 2, 4-6 people]",
//   "cookingTime": "[e.g., 30 minutes, 1 hour]",
//   "difficulty": "[Easy/Medium/Hard]",
//   "dietaryRestrictions": ["e.g., Vegetarian", "Gluten-Free"],
//   "cuisinePreference": ["e.g., Italian", "Mexican"],
//   "mealType": "[e.g., Dinner", "Breakfast]",
//   "ingredients": [
//     "Quantity Unit Ingredient (Preparation)",
//     "..."
//   ],
//   "instructions": [
//     "Step 1: ...",
//     "Step 2: ...",
//     "..."
//   ],
//   "nutritionalInfo": {
//     "calories": "[e.g., 450 kcal per serving ]",
//     "protein": "[e.g., 25g per serving ]",
//     "fat": "[e.g., 15g per serving ]"
//   }
// }

// Here are the user's preferences:
// Ingredients: ${ingredients || "Any available ingredients"}
// Dietary Restrictions: ${dietaryRestrictions || "None"}
// Cuisine Preference: ${cuisinePreference || "Any"}
// Meal Type: ${mealType || "Any"}
// Serving Size: ${servingSize || "Not specified"}
// Cooking Time: ${cookingTime || "Not specified"}
// Difficulty: ${difficulty || "Any"}

// Strictly output only the JSON object.`;





// _________________________________________________

const recipePromptText = `Generate a detailed and creative recipe in JSON format based on the following criteria. Ensure the output is *only* the JSON object, ready for direct parsing. Do not include any markdown backticks or extra text outside the JSON. The JSON should have the following structure and fields, including a section for nutritional information (calories, protein, fat) based on common understanding of ingredients (use approximate common values if specific values aren't calculable by a general model). Use "N/A" if info is not available or estimable. **You must always include approximate values for calories, protein, and fat per serving — these fields are mandatory and cannot be omitted under any condition.**:

{
  "title": "[Recipe Title]",
  "description": "[Brief, enticing description]",
  "servingSize": "[e.g., 2, 4-6 people]",
  "cookingTime": "[e.g., 30 minutes, 1 hour]",
  "difficulty": "[Easy/Medium/Hard]",
  "dietaryRestrictions": ["e.g., Vegetarian", "Gluten-Free"],
  "cuisinePreference": ["e.g., Italian", "Mexican"],
  "mealType": "[e.g., Dinner", "Breakfast]",
  "ingredients": [
    "Quantity Unit Ingredient (Preparation)",
    "..."
  ],
  "instructions": [
    "Step 1: ...",
    "Step 2: ...",
    "..."
  ],
  "nutritionalInfo": {
    "calories": "[e.g., 450 kcal per serving]",
    "protein": "[e.g., 25g per serving]",
    "fat": "[e.g., 15g per serving]"
  }
}

Here are the user's preferences:
Ingredients: ${ingredients || "Any available ingredients"}
Dietary Restrictions: ${dietaryRestrictions || "None"}
Cuisine Preference: ${cuisinePreference || "Any"}
Meal Type: ${mealType || "Any"}
Serving Size: ${servingSize || "Not specified"}
Cooking Time: ${cookingTime || "Not specified"}
Difficulty: ${difficulty || "Any"}

Strictly output only the JSON object.`;

// _________________________________________________





  let recipeJson: any = null; 
  let rawRecipeText: string | undefined | null; // Added ' | null' here

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful culinary assistant that generates recipes in a precise JSON format.",
        },
        { role: "user", content: recipePromptText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    rawRecipeText = chatCompletion.choices?.[0]?.message?.content;

    if (!rawRecipeText) {
      console.error(
        "No recipe text content found in OpenAI response:",
        chatCompletion
      );
      return NextResponse.json(
        {
          message:
            "OpenAI did not return any recipe content. This might indicate an issue with the model response structure.",
        },
        { status: 500 }
      );
    }

    try {
      recipeJson = JSON.parse(rawRecipeText);
      if (
        !recipeJson.title ||
        !Array.isArray(recipeJson.ingredients) ||
        !Array.isArray(recipeJson.instructions)
      ) {
        throw new Error(
          "Parsed JSON is missing essential recipe fields (title, ingredients[], or instructions[])."
        );
      }
    } catch (parseError: any) {
      console.error(
        "Failed to parse OpenAI output as JSON:",
        parseError.message,
        "Raw text:",
        rawRecipeText
      );
      return NextResponse.json(
        {
          message: `OpenAI did not return valid JSON. Please try again or refine your prompt. Raw text (first 200 chars): ${rawRecipeText.substring(
            0,
            200
          )}...`,
          rawText: rawRecipeText,
          errorDetails: parseError.message,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Caught an error during OpenAI recipe generation:", error);
    if (error instanceof OpenAI.APIError) {
      console.error(error.status);
      console.error(error.message);
      console.error(error.code);
      console.error(error.type);
      return NextResponse.json(
        {
          message: `OpenAI API Error: ${error.message}. Check your API key, usage limits, or prompt.`,
          details: error.message,
        },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      {
        message: "Internal Server Error during recipe generation.",
        error: error.message,
      },
      { status: 500 }
    );
  } // --- DALL-E Image Generation ---

  let aiImageUrl: string | undefined = undefined;
  if (recipeJson?.title) {
    try {
      const imagePrompt = `Ultra-realistic photograph of '${recipeJson.title}' — styled like a professional magazine food photo. Use natural lighting with soft shadows, realistic colors, and authentic textures (e.g. visible grains, slight imperfections, natural steam or moisture). Beautifully plated on a clean surface with real-world imperfections like crumbs or sauce smears. Captured with a shallow depth of field and a softly blurred background for a natural DSLR look. 

    📌 Important: The image must **only show the food and background**. 
    **Do NOT include**: cameras, camera lenses, human hands, reflections, photography equipment, tripods, studio lights, photographers, person holding camera, hands holding camera, lens flare from camera, camera flash, camera view, photography studio, blurred camera in background, watermark, text. 
    The final output should feel like it was taken with a DSLR — but no camera or gear should be present in the image at all.`;
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });

      if (imageResponse.data && imageResponse.data.length > 0) {
        aiImageUrl = imageResponse.data[0].url || undefined;
        console.log("Successfully generated DALL-E image URL:", aiImageUrl);
      } else {
        console.warn(
          "DALL-E image generation returned no data or an empty array. Skipping image display."
        );
        aiImageUrl = undefined;
      }
    } catch (imageError: any) {
      console.error(
        "Error generating AI image with DALL-E:",
        imageError.message || imageError
      );
      if (imageError instanceof OpenAI.APIError) {
        console.error(
          "DALL-E Error Details:",
          imageError.status,
          imageError.message,
          imageError.code
        );
      }
      aiImageUrl = undefined;
    }
  }

  return NextResponse.json(
    { recipe: recipeJson, imageUrl: aiImageUrl },
    { status: 200 }
  );
}
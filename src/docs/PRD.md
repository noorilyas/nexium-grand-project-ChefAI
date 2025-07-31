

# 🍳 ChefAI – AI-Powered Recipe Generator

## 🧠 Problem

People often have ingredients lying around but no idea what to cook. This leads to food waste, indecision, or unhealthy ordering habits.

## 💡 Solution

ChefAI allows users to input available ingredients and instantly receive creative, delicious recipes powered by AI — helping reduce waste and make cooking easier and more enjoyable. The application also provides detailed nutritional information, helping users make informed dietary choices.

---

## ✨ Features

- 🔐 **Magic Link Email Login:** Secure user authentication using magic links provided by Supabase.
- 🥕 **Dynamic Recipe Generation:** Users can generate recipes based on available ingredients, text-based prompts, or their personal preferences.
- 🖼️ **AI Image Generation:** Each generated recipe is accompanied by a custom image created by the DALL-E API.
- 📈 **Dietary Information:** Recipes include detailed nutritional information, such as calories, proteins, and fats.
- 💾 **Save Recipes:** Users can store their favorite generated recipes.
- 🎨 **Modern UI:** The application features an animated, responsive, and mobile-first design built with Shadcn components, including a dark mode.
- 🚀 **CI/CD Deployment:** The project is automatically built and deployed on Vercel upon every push to the repository.

---

## 🧰 Tech Stack

| Layer              | Toolset                                                            |
|--------------------|--------------------------------------------------------------------|
| **Frontend**       | Next.js 15 (App Router), Tailwind CSS, Shadcn UI                   |
| **Authentication** | Supabase (magic link login)                                        |
| **AI Logic**       | OpenAI  (for recipe and image generation)                          |
| **Databases**      | Supabase (for authentication data) MongoDB for storing recipes     |


---

## 👤 User Flow

1.  User visits the homepage and clicks a "Get Started" call-to-action.
2.  The user is prompted to log in via their email using a magic link.
3.  The user enters ingredients, a prompt, or preferences in the main interface.
4.  The user clicks "Cook for me!" to trigger AI generation.
5.  The AI returns a complete recipe with a title, ingredients, step-by-step instructions, and dietary information.
6.  The user can choose to save the recipe.
7.  The user can access their saved recipes via an optional history page.

---

## 🗂️ App Pages

| Route                  |                         Description                                  |
|------------------------|----------------------------------------------------------------------|
| `/`                    | Landing page with an animated call-to-action.                        |
| `/login`               | The email-based login screen.                                        |
| `/generate`            | The main interface for recipe and image generation.(ingredients base)|
| `/generate-ai-recipe`  |The main interface for recipe and image generation.(prompt base)      |
| `/history`             | An optional page for Browse saved recipes.                           |

---

## 🎯 Project Goal

Deliver a full-stack, visually stunning recipe generator that feels magical — powered by real AI, deployed with modern tools, and designed for delight.

> "ChefAI is your personal smart sous-chef — ready to cook up brilliance from whatever’s in your fridge."
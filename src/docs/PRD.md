# 🍳 ChefAI – AI-Powered Recipe Generator

## 🧠 Problem

People often have ingredients lying around but no idea what to cook. This leads to food waste, indecision, or unhealthy ordering habits.

## 💡 Solution

ChefAI allows users to input available ingredients and instantly receive creative, delicious recipes powered by AI — helping reduce waste and make cooking easier and more enjoyable.

---

## ✨ Features

- 🔐 Magic link email login (via Supabase)
- 🥕 Ingredient input with multi-select and intelligent suggestions
- 🤖 AI-powered recipe generation (OpenAI via n8n)
- 🧾 MongoDB stores complete logs (inputs/outputs)
- 🗂️ Supabase stores recipe metadata for history
- 🌈 Animated, responsive UI with ShadCN components
- 🌙 Dark mode and mobile-first design
- 🚀 CI/CD deployment via Vercel (auto builds on push)

---

## 🧰 Tech Stack

| Layer          | Toolset                                          |
|----------------|--------------------------------------------------|
| Frontend       | Next.js 15 (App Router), Tailwind CSS, ShadCN UI |
| Authentication | Supabase (magic link login)                      |
| AI Logic       | OpenAI via n8n (workflow orchestration)          |
| Databases      | Supabase (metadata), MongoDB (logs)              |
| Hosting        | Vercel                                           |
| Automation     | n8n (cloud or local instance)                    |

---

## 👤 User Flow

1. User visits homepage
2. Clicks “Get Started” to log in via email magic link
3. Enters ingredients using a smart multi-select interface
4. Clicks “Cook for me!”
5. AI returns a recipe with title, ingredients, and step-by-step instructions
6. User can view, save, or share the recipe
7. Optional: Access recipe history

---

## 🗂️ App Pages

| Route        | Description                                |
|--------------|--------------------------------------------|
| `/`          | Landing page with animated CTA             |
| `/login`     | Email-based login screen                   |
| `/generate`  | Main recipe generator interface            |
| `/history`   | Optional page for browsing saved recipes   |

---

## 🎯 Project Goal

Deliver a full-stack, visually stunning recipe generator that feels magical — powered by real AI, deployed with modern tools, and designed for delight.

> "ChefAI is your personal smart sous-chef — ready to cook up brilliance from whatever’s in your fridge."


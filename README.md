

# ChefAI

## Project Overview

ChefAI is an AI-powered culinary assistant built with Next.js. The application generates unique recipes and accompanying images based on a user's preferences, specific ingredients, or text-based prompts. For each recipe, it provides detailed dietary information, including calories, proteins, and fats. This project leverages a modern technology stack to provide a fast, responsive, and personalized user experience.

## Features

  * **AI-Powered Recipe Generation:** Generate unique recipes based on user preferences, a list of available ingredients, or a text-based prompt.
  * **Detailed Dietary Information:** For every generated recipe, the app displays key dietary metrics such as calories, proteins, and fats.
  * **AI-Powered Image Generation:** Create a custom image for each recipe using the DALL-E API.
  * **Secure User Authentication:** User login and signup are handled securely using a **magic link** system powered by Supabase.
  * **Save Recipes:** Users can store their favorite generated recipes.
  * **Modern UI:** A clean, responsive user interface built with Shadcn UI, Radix UI, and Tailwind CSS.

## Technologies Used

  * **Framework:** Next.js
  * **Frontend:** React, Shadcn UI, Radix UI, Tailwind CSS
  * **Authentication:** Supabase
  * **AI Integration:** OpenAI API (for recipe and image generation)
  

## Getting Started

Follow these steps to get a local copy of the project up and running on your machine.

### Prerequisites

  * Node.js (LTS version)
  * pnpm (recommended package manager)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/noorilyas/nexium-grand-project-ChefAI.git
    cd nexium-grand-project-ChefAI
    ```

2.  Install project dependencies:

    ```bash
    pnpm install
    ```

### Environment Variables

This project requires environment variables to connect to your Supabase and OpenAI services. Create a `.env.local` file in the root of your project and add the following keys.

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_private_supabase_service_role_key

# AI Service Key
OPENAI_API_KEY=your_openai_api_key

MONGO_URI=your_mongo_db_uri
MONGO_DB_NAME=your_mongo_db_name
```

### Running the Project

1.  Run the development server:
    ```bash
    pnpm dev
    ```
2.  Open your browser and navigate to `http://localhost:3000` to see the application.


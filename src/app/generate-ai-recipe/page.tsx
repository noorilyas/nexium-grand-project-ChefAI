'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "sonner";
import Image from 'next/image';

// ShadCN UI components
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Lucide React Icons
import { AlertCircle, CheckCircle, ChefHat, Sparkles, UtensilsCrossed, Wheat, Soup, Flame, Leaf, BookText, Timer, Apple, Salad, Milk, ClipboardList } from "lucide-react";

// Framer Motion for animations
import { motion, AnimatePresence } from "framer-motion";

// Fonts
import { Inter, Lexend } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-lexend' });

// Import the new Navbar component
import Navbar from '@/components/Navbar';


export default function GenerateAiRecipePage() {
  const router = useRouter();
  // Form State for the AI prompt
  const [aiPrompt, setAiPrompt] = useState<string>('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [savingRecipe, setSavingRecipe] = useState(false);

  // Authentication States
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Refs for scrolling
  const loadingDisplayRef = useRef<HTMLDivElement>(null);
  const recipeDisplayRef = useRef<HTMLDivElement>(null);

  // --- Authentication Check (for page access) ---
  useEffect(() => {
    const checkUserAccess = async () => {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setIsAuthChecking(false);
      }
    };
    checkUserAccess();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setIsAuthChecking(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecipe(null);
    setAiImage(null);

    // Scroll to the loading area immediately
    if (loadingDisplayRef.current) {
      loadingDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const trimmedPrompt = aiPrompt.trim();

    if (!trimmedPrompt) {
      setError("Please enter a prompt to generate a recipe.");
      setLoading(false);
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session?.data.session?.access_token;

      if (!accessToken) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const response = await fetch("/api/generate-recipe-from-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userPrompt: trimmedPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage =
          errorData.message ||
          errorData.error ||
          "Failed to generate recipe. Please try again.";

        if (errorData.rawText) {
          errorMessage += ` Debug Info: Received malformed JSON from AI. Part of response: "${errorData.rawText.substring(
            0,
            100
          )}..."`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setRecipe(data.recipe);
      setAiImage(data.imageUrl);

      if (recipeDisplayRef.current) {
        recipeDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (err: any) {
      console.error("Recipe generation failed:", err);
      setError(
        err.message ||
          "An unexpected error occurred during recipe generation. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe || !aiImage || !user) {
      toast("Cannot Save Recipe", {
        description: "No recipe generated or user not logged in. Please generate a recipe and ensure you are logged in.",
        action: {
          label: "Login",
          onClick: () => router.push('/login'),
        },
        duration: 4000,
      });
      return;
    }

    setSavingRecipe(true);
    setError(null);

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session?.data.session?.access_token;

      if (!accessToken) {
        throw new Error("User not authenticated. Please log in again to save recipes.");
      }

      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipeData: recipe,
          imageUrl: aiImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save recipe. Please try again.");
      }

      const data = await response.json();
      console.log("Recipe saved successfully:", data);

      toast("Recipe Saved!", {
        description: "Your culinary creation has been successfully saved.",
        duration: 3000,
        action: {
          label: "View Saved",
          onClick: () => router.push('/saved-recipes'),
        },
        icon: <CheckCircle className="h-4 w-4" />,
      });

    } catch (err: any) {
      console.error("Error saving recipe:", err);
      toast("Save Failed", {
        description: err.message || "There was an error saving your recipe.",
        duration: 5000,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      setError(err.message || "Failed to save recipe.");
    } finally {
      setSavingRecipe(false);
    }
  };


  // --- Loading Spinner/Fallback ---
  if (isAuthChecking) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#FFF8F3] text-[#2F1B12]">
        <ChefHat className="animate-spin-slow-custom text-[#FF7A59] w-20 h-20 mb-4" />
        <p className={`${lexend.variable} font-lexend text-2xl font-bold`}>Warming up ChefAI...</p>
        <p className="text-lg text-gray-600 mt-2">Just a moment while we prepare your kitchen.</p>
      </div>
    );
  }

  return (
    <div className={`${inter.variable} font-inter min-h-screen bg-[#FFF8F3] text-[#2F1B12] pt-24 pb-12 px-4 sm:px-6 lg:px-8`}>
      <Navbar />
      <main className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`${lexend.variable} font-lexend text-4xl md:text-5xl font-extrabold text-center mb-6 text-[#2F1B12]`}
        >
          Your Personal Chef Awaits
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto"
        >
          Describe your desired meal, and let ChefAI craft your next delicious creation.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column: Input Form (now simplified for AI prompt) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#FFDAB9] lg:h-fit lg:sticky lg:top-28"
          >
            <h2 className={`${lexend.variable} font-lexend text-2xl sm:text-3xl font-bold mb-6 text-[#FF7A59] flex items-center`}>
              <Sparkles className="mr-2 sm:mr-3 w-6 h-6 sm:w-7 sm:h-7" /> Describe Your Culinary Vision
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div>
                <Label htmlFor="ai-prompt-input" className="text-base sm:text-lg font-semibold text-[#2F1B12] mb-2 block">
                  Tell ChefAI what kind of recipe you'd like: <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="ai-prompt-input"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'A quick weeknight chicken and vegetable stir-fry for two with a spicy kick', or 'A comforting vegan lentil soup recipe for a cold evening.'"
                  className="min-h-[120px] p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Be as descriptive as you like! Include ingredients you have, dietary needs, cuisine preferences, or desired cooking time.</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF7A59] hover:bg-[#e66549] text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 mt-8 sm:mt-10"
                disabled={loading}
              >
                {loading ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                    className="flex items-center"
                  >
                    <ChefHat className="animate-spin-slow-custom mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Crafting Your Culinary Masterpiece...
                  </motion.span>
                ) : (
                  <>
                    <UtensilsCrossed className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Get My Recipe!
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Right Column: Recipe Display Area */}
          <motion.div
            className="flex flex-col gap-6 sm:gap-8"
          >
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error-alert"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-800 p-4 sm:p-6">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <AlertTitle className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Oops! Something went wrong.</AlertTitle>
                    <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {loading && !recipe && (
                <motion.div
                  key="loading-card"
                  ref={loadingDisplayRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#FFDAB9] text-center flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]"
                >
                  <ChefHat className="animate-spin-slow-custom text-[#FF7A59] w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6" />
                  <p className={`${lexend.variable} font-lexend text-xl sm:text-2xl font-bold text-[#2F1B12]`}>
                    ChefAI is whipping up something delicious...
                  </p>
                  <p className="text-sm sm:text-lg text-gray-600 mt-2">This might take a moment as our AI assistant prepares your recipe and a unique image.</p>
                </motion.div>
              )}

              {recipe && (
                <motion.div
                  key="recipe-card"
                  ref={recipeDisplayRef}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  transition={{ duration: 0.7, type: "spring", stiffness: 100, damping: 20 }}
                  className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#FFDAB9]"
                >
                  <Card className="border-none shadow-none">
                    <CardHeader className="p-0 mb-4 sm:mb-6">
                      <CardTitle className={`${lexend.variable} font-lexend text-3xl sm:text-4xl font-extrabold text-[#2F1B12] mb-3 sm:mb-4 text-center`}>
                        {recipe.title || 'Your ChefAI Masterpiece'}
                      </CardTitle>
                      {aiImage && (
                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 sm:mb-6 shadow-lg border border-orange-100">
                          <Image
                            src={aiImage}
                            alt={recipe.title || "Generated recipe image"}
                            fill
                            sizes="(max-width: 1200px) 100vw, 50vw"
                            className="object-cover rounded-xl"
                            priority
                          />
                        </div>
                      )}
                      <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
                        Crafted by ChefAI based on your preferences. Enjoy!
                      </CardDescription>
                      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                        {recipe.servingSize && <Badge variant="secondary"><UtensilsCrossed className="w-3 h-3 mr-1" /> {recipe.servingSize}</Badge>}
                        {recipe.cookingTime && <Badge variant="secondary"><Soup className="w-3 h-3 mr-1" /> {recipe.cookingTime}</Badge>}
                        {recipe.difficulty && <Badge variant="secondary"><ChefHat className="w-3 h-3 mr-1" /> {recipe.difficulty}</Badge>}
                        {recipe.cuisinePreference && Array.isArray(recipe.cuisinePreference) && recipe.cuisinePreference.length > 0 &&
                          recipe.cuisinePreference.map((cuisine: string, idx: number) => <Badge key={idx} variant="secondary">{cuisine}</Badge>)}

                        {recipe.mealType && Array.isArray(recipe.mealType) && recipe.mealType.length > 0 &&
                          recipe.mealType.map((meal: string, idx: number) => <Badge key={idx} variant="secondary">{meal}</Badge>)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6 sm:space-y-8">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-[#FF7A59] flex items-center">
                          <Wheat className="mr-2 w-5 h-5 sm:w-6 h-6" /> Ingredients
                        </h3>
                        <ul className="list-disc list-inside space-y-2 sm:space-y-3 text-gray-700 text-base sm:text-lg leading-relaxed">
                          {recipe.ingredients && recipe.ingredients.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <Separator className="bg-orange-100" />

                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-[#FF7A59] flex items-center">
                          <ClipboardList className="mr-2 w-5 h-5 sm:w-6 h-6" /> Instructions
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-gray-700 text-base sm:text-lg leading-relaxed">
                          {recipe.instructions && recipe.instructions.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      {recipe.nutritionalInfo && (
                        <>
                          <Separator className="bg-orange-100" />
                          <div>
                            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-[#FF7A59] flex items-center">
                              <Salad className="mr-2 w-5 h-5 sm:w-6 h-6" /> Nutritional Information
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 text-base sm:text-lg leading-relaxed">
                              {recipe.nutritionalInfo.calories && (
                                <li><Apple className="inline-block w-4 h-4 mr-2 text-green-600" />Calories: {recipe.nutritionalInfo.calories}</li>
                              )}
                              {recipe.nutritionalInfo.protein && (
                                <li><Milk className="inline-block w-4 h-4 mr-2 text-blue-600" />Protein: {recipe.nutritionalInfo.protein}</li>
                              )}
                              {recipe.nutritionalInfo.fat && (
                                <li><Timer className="inline-block w-4 h-4 mr-2 text-yellow-600" />Fat: {recipe.nutritionalInfo.fat}</li>
                              )}
                            </ul>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2">
                              Note: Nutritional information is an estimate based on common understanding and may not be exact.
                            </p>
                          </div>
                        </>
                      )}

                      <Button
                        className="w-full mt-8 sm:mt-10 bg-[#FF7A59] hover:bg-[#e66549] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center transform hover:-translate-y-1"
                        onClick={handleSaveRecipe}
                        disabled={savingRecipe}
                      >
                        {savingRecipe ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                            className="flex items-center"
                          >
                            <ChefHat className="animate-spin-slow-custom mr-2 w-4 h-4 sm:w-5 h-5" /> Saving...
                          </motion.span>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 w-4 h-4 sm:w-5 h-5" /> Save This Recipe
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!loading && !error && !recipe && (
                <motion.div
                  key="initial-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#FFDAB9] text-center flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]"
                >
                  <Sparkles className="text-orange-300 w-20 h-20 sm:w-24 h-24 mb-4 sm:mb-6" />
                  <p className={`${lexend.variable} font-lexend text-xl sm:text-2xl font-bold text-[#2F1B12]`}>
                    Ready to discover your next meal?
                  </p>
                  <p className="text-sm sm:text-lg text-gray-600 mt-2">
                    Describe your perfect recipe using the input on the left!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
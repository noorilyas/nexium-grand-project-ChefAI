

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "sonner";

// ShadCN UI components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Lucide React Icons
import { AlertCircle, CheckCircle, ChefHat, Sparkles, ClipboardList, UtensilsCrossed, Wheat, Soup, X, Flame, Leaf, BookText, Timer, Apple, Salad, Milk } from "lucide-react";

// Framer Motion for animations
import { motion, AnimatePresence } from "framer-motion";

// Fonts
import { Inter, Lexend } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-lexend' });

// Import the new Navbar component
import Navbar from '@/components/Navbar';


export default function GenerateRecipePage() {
  const router = useRouter();
  // Form States
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredientInput, setCurrentIngredientInput] = useState<string>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisinePreference, setCuisinePreference] = useState<string[]>([]);
  const [mealType, setMealType] = useState<string[]>([]);
  const [servingSize, setServingSize] = useState<string>('');
  const [cookingTimeValue, setCookingTimeValue] = useState<string>('');
  const [cookingTimeUnit, setCookingTimeUnit] = useState<string>('minutes');
  const [difficulty, setDifficulty] = useState<string>('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any | null>(null); // Recipe will hold the JSON object from backend
  const [aiImage, setAiImage] = useState<string | null>(null); // Stores the DALL-E image URL
  const [savingRecipe, setSavingRecipe] = useState(false);

  // Authentication States
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Refs for scrolling
  const loadingDisplayRef = useRef<HTMLDivElement>(null); // New ref for the loading state
  const recipeDisplayRef = useRef<HTMLDivElement>(null); // Existing ref for the recipe card

  // Suggested options for badges/pre-fills
  const commonDietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
  const commonCuisineOptions = ['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American', 'French'];
  const commonMealTypeOptions = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
  const commonDifficultyOptions = [
    { label: 'Easy', icon: <Leaf className="w-4 h-4 mr-1" /> },
    { label: 'Medium', icon: <BookText className="w-4 h-4 mr-1" /> },
    { label: 'Hard', icon: <Flame className="w-4 h-4 mr-1" /> }
  ];

  // --- Utility for adding/removing items from array states (e.g., for badges) ---
  const toggleArrayItem = useCallback((item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  }, []);

  // --- Function to add ingredient from input ---
  const addIngredient = useCallback(() => {
    const ingredientToAdd = currentIngredientInput.trim();
    if (ingredientToAdd && !ingredients.includes(ingredientToAdd)) {
      setIngredients(prev => [...prev, ingredientToAdd]);
      setCurrentIngredientInput('');
    }
  }, [currentIngredientInput, ingredients]);

  // --- Function to remove an ingredient badge ---
  const removeIngredient = useCallback((ingredientToRemove: string) => {
    setIngredients(prev => prev.filter(ing => ing !== ingredientToRemove));
  }, []);


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
    setAiImage(null); // Clear previous image

    // Scroll to the loading area immediately when the button is clicked
    if (loadingDisplayRef.current) {
      loadingDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    if (ingredients.length === 0) {
      setError("Please enter at least one ingredient to get started.");
      setLoading(false); // Make sure to unset loading if validation fails
      return;
    }

    // New Validation: Cooking time must be greater than 0 if entered
    if (cookingTimeValue) {
      const timeNum = parseFloat(cookingTimeValue);
      if (isNaN(timeNum) || timeNum <= 0) {
        setError("Cooking time must be a positive number if entered.");
        setLoading(false); // Make sure to unset loading if validation fails
        return;
      }
    }

    const finalCookingTime = cookingTimeValue
      ? `${cookingTimeValue} ${cookingTimeUnit}`
      : "";

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session?.data.session?.access_token;

      if (!accessToken) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ingredients: ingredients.join(", "),
          dietaryRestrictions: dietaryRestrictions.join(", "),
          cuisinePreference: cuisinePreference.join(", "),
          mealType: mealType.join(", "),
          servingSize,
          cookingTime: finalCookingTime,
          difficulty,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage =
          errorData.message ||
          errorData.error ||
          "Failed to generate recipe. Please try again.";

        // --- Enhanced Error Display (if backend sends rawText for JSON parse failures) ---
        if (errorData.rawText) {
          errorMessage += ` Debug Info: Received malformed JSON from AI. Part of response: "${errorData.rawText.substring(
            0,
            100
          )}..."`;
        }
        // --- END Enhanced Error Display ---

        throw new Error(errorMessage);
      }

      // Backend now returns an object { recipe: recipeJson, imageUrl: aiImageUrl }
      const data = await response.json();

      setRecipe(data.recipe);
      setAiImage(data.imageUrl); // Set the DALL-E image URL

      // Scroll to the *recipe* display area after successful generation, overriding the loading scroll
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
      cancel: {
        label: "Dismiss",
        onClick: () => {},
      },
      duration: 4000,
    });
    return;
  }

  setSavingRecipe(true);
  setError(null); // Clear any previous errors

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
        recipeData: recipe, // This should be your recipe JSON
        imageUrl: aiImage, // This is your DALL-E image URL
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
        onClick: () => router.push('/saved-recipes'), // Assuming you have a saved recipes page
      },
      icon: <CheckCircle className="h-4 w-4" />,
    });

  } catch (err: any) {
    console.error("Error saving recipe:", err);
    toast("Save Failed", {
      description: err.message || "There was an error saving your recipe.",
      duration: 5000,
      cancel: {
        label: "Dismiss",
        onClick: () => {},
      },
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    });
    setError(err.message || "Failed to save recipe."); // Still set component-level error if you want to display it on page
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
          Enter your ingredients and preferences, and let ChefAI craft your next delicious meal.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column: Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#FFDAB9] lg:h-fit lg:sticky lg:top-28"
          >
            <h2 className={`${lexend.variable} font-lexend text-2xl sm:text-3xl font-bold mb-6 text-[#FF7A59] flex items-center`}>
              <ClipboardList className="mr-2 sm:mr-3 w-6 h-6 sm:w-7 sm:h-7" /> What's in Your Pantry?
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div>
                <Label htmlFor="current-ingredient-input" className="text-base sm:text-lg font-semibold text-[#2F1B12] mb-2 block">
                  Ingredients you have (Type one and press Enter or Add) <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    id="current-ingredient-input"
                    type="text"
                    value={currentIngredientInput}
                    onChange={(e) => setCurrentIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addIngredient();
                      }
                    }}
                    placeholder="e.g., chicken, rice, broccoli"
                    className="flex-grow p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-base"
                  />
                  <Button
                    type="button"
                    onClick={addIngredient}
                    className="bg-[#FF7A59] hover:bg-[#e66549] text-white rounded-lg px-4 py-2"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] border border-dashed border-orange-200 p-2 rounded-lg">
                  {ingredients.length === 0 && <p className="text-sm text-gray-500 italic">No ingredients added yet.</p>}
                  {ingredients.map((ingredient, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-[#FF7A59] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm sm:text-base hover:bg-[#e66549] cursor-pointer"
                      onClick={() => removeIngredient(ingredient)}
                    >
                      {ingredient}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded-full hover:bg-white/30 text-white p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeIngredient(ingredient);
                        }}
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Add ingredients one by one using the input field above.</p>
              </div>

              {/* Preferences Section */}
              <Separator className="bg-orange-100" />
              <div className="space-y-4 sm:space-y-6">
                <h3 className={`${lexend.variable} font-lexend text-xl sm:text-2xl font-bold text-[#2F1B12] flex items-center`}>
                  <Sparkles className="mr-2 w-5 h-5 sm:w-6 sm:h-6" /> Your Culinary Preferences
                </h3>

                {/* Dietary Restrictions */}
                <div>
                  <Label className="text-base sm:text-lg font-semibold text-[#2F1B12] mb-2 block">Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonDietaryOptions.map(option => (
                      <Badge
                        key={option}
                        variant={dietaryRestrictions.includes(option) ? 'default' : 'outline'}
                        className={`cursor-pointer px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base ${dietaryRestrictions.includes(option) ? 'bg-[#FF7A59] text-white hover:bg-[#e66549]' : 'border-orange-300 text-gray-700 hover:bg-orange-50'}`}
                        onClick={() => toggleArrayItem(option, dietaryRestrictions, setDietaryRestrictions)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    type="text"
                    value={dietaryRestrictions.filter(opt => !commonDietaryOptions.includes(opt)).join(', ')}
                    onChange={(e) => setDietaryRestrictions(Array.from(new Set([...dietaryRestrictions.filter(opt => commonDietaryOptions.includes(opt)), ...e.target.value.split(',').map(s => s.trim()).filter(Boolean)])))}
                    placeholder="e.g., no nuts, pescatarian, low-sodium"
                    className="mt-3 p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-base"
                  />
                </div>

                {/* Cuisine Preference */}
                <div>
                  <Label className="text-base sm:text-lg font-semibold text-[#2F1B12] mb-2 block">Cuisine Preference</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonCuisineOptions.map(option => (
                      <Badge
                        key={option}
                        variant={cuisinePreference.includes(option) ? 'default' : 'outline'}
                        className={`cursor-pointer px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base ${cuisinePreference.includes(option) ? 'bg-[#FF7A59] text-white hover:bg-[#e66549]' : 'border-orange-300 text-gray-700 hover:bg-orange-50'}`}
                        onClick={() => toggleArrayItem(option, cuisinePreference, setCuisinePreference)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    type="text"
                    value={cuisinePreference.filter(opt => !commonCuisineOptions.includes(opt)).join(', ')}
                    onChange={(e) => setCuisinePreference(Array.from(new Set([...cuisinePreference.filter(opt => commonCuisineOptions.includes(opt)), ...e.target.value.split(',').map(s => s.trim()).filter(Boolean)])))}
                    placeholder="e.g., Thai, Ethiopian, Comfort Food"
                    className="mt-3 p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-base"
                  />
                </div>

                {/* Meal Type */}
                <div>
                  <Label className="text-base sm:text-lg font-semibold text-[#2F1B12] mb-2 block">Meal Type</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonMealTypeOptions.map(option => (
                      <Badge
                        key={option}
                        variant={mealType.includes(option) ? 'default' : 'outline'}
                        className={`cursor-pointer px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base ${mealType.includes(option) ? 'bg-[#FF7A59] text-white hover:bg-[#e66549]' : 'border-orange-300 text-gray-700 hover:bg-orange-50'}`}
                        onClick={() => toggleArrayItem(option, mealType, setMealType)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    type="text"
                    value={mealType.filter(opt => !commonMealTypeOptions.includes(opt)).join(', ')}
                    onChange={(e) => setMealType(Array.from(new Set([...mealType.filter(opt => commonMealTypeOptions.includes(opt)), ...e.target.value.split(',').map(s => s.trim()).filter(Boolean)])))}
                    placeholder="e.g., Brunch, Appetizer, Side Dish"
                    className="mt-3 p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-base"
                  />
                </div>

                {/* Serving Size and Cooking Time - Now in a 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="servingSize" className="text-base sm:text-lg font-semibold text-[#2F1B12]">Servings</Label>
                    <Input
                      id="servingSize"
                      type="text"
                      value={servingSize}
                      onChange={(e) => setServingSize(e.target.value)}
                      placeholder="e.g., 2, 4-6"
                      className="mt-2 p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cookingTimeValue" className="text-base sm:text-lg font-semibold text-[#2F1B12]">Cook Time</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="cookingTimeValue"
                        type="number"
                        min="1"
                        value={cookingTimeValue}
                        onChange={(e) => setCookingTimeValue(e.target.value)}
                        placeholder="e.g., 30"
                        className="w-full sm:w-24 p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-base"
                      />
                      <Select value={cookingTimeUnit} onValueChange={setCookingTimeUnit}>
                        <SelectTrigger className="flex-grow p-2.5 sm:p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent text-base">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-orange-200 rounded-lg shadow-md">
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Difficulty - Now on its own row */}
                <div>
                  <Label className="text-base sm:text-lg font-semibold text-[#2F1B12] mb-2 block">Difficulty</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonDifficultyOptions.map(option => (
                      <Badge
                        key={option.label}
                        variant={difficulty === option.label ? 'default' : 'outline'}
                        className={`cursor-pointer px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base flex items-center ${difficulty === option.label ? 'bg-[#FF7A59] text-white hover:bg-[#e66549]' : 'border-orange-300 text-gray-700 hover:bg-orange-50'}`}
                        onClick={() => setDifficulty(option.label)}
                      >
                        {option.icon} {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>
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
                    <UtensilsCrossed className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" /> Cook for me!
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
                  ref={loadingDisplayRef} // Attach the new ref here
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
                  ref={recipeDisplayRef} // Keep this ref for the final recipe display
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
                          <img
                            src={aiImage}
                            alt={recipe.title || "Generated recipe image"}
                            width={512}
                            height={512}
                            className="object-cover rounded-xl w-full h-full"
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
                        {/* Ensure these are rendered only if they are not empty strings or null */}
                        {recipe.cuisinePreference && recipe.cuisinePreference.length > 0 && Array.isArray(recipe.cuisinePreference) ?
                          recipe.cuisinePreference.map((cuisine: string, idx: number) => <Badge key={idx} variant="secondary">{cuisine}</Badge>) :
                          (typeof recipe.cuisinePreference === 'string' && recipe.cuisinePreference) && <Badge variant="secondary">{recipe.cuisinePreference}</Badge>}

                        {recipe.mealType && recipe.mealType.length > 0 && Array.isArray(recipe.mealType) ?
                          recipe.mealType.map((meal: string, idx: number) => <Badge key={idx} variant="secondary">{meal}</Badge>) :
                          (typeof recipe.mealType === 'string' && recipe.mealType) && <Badge variant="secondary">{recipe.mealType}</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6 sm:space-y-8">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-[#FF7A59] flex items-center">
                          <Wheat className="mr-2 w-5 h-5 sm:w-6 sm:h-6" /> Ingredients
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
                          <ClipboardList className="mr-2 w-5 h-5 sm:w-6 sm:h-6" /> Instructions
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-gray-700 text-base sm:text-lg leading-relaxed">
                          {recipe.instructions && recipe.instructions.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* --- NEW: Nutritional Information Section --- */}
                      {recipe.nutritionalInfo && (
                        <>
                          <Separator className="bg-orange-100" />
                          <div>
                            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-[#FF7A59] flex items-center">
                              <Salad className="mr-2 w-5 h-5 sm:w-6 sm:h-6" /> Nutritional Information
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
                              {Object.keys(recipe.nutritionalInfo).length === 0 && (
                                <li>Nutritional information not available or estimable for this recipe.</li>
                              )}
                            </ul>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2">
                              Note: Nutritional information is an estimate based on common understanding and may not be exact.
                            </p>
                          </div>
                        </>
                      )}
                      {/* --- END NEW: Nutritional Information Section --- */}

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
                                    <ChefHat className="animate-spin-slow-custom mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Saving...
                                  </motion.span>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Save This Recipe
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
                  <Sparkles className="text-orange-300 w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6" />
                  <p className={`${lexend.variable} font-lexend text-xl sm:text-2xl font-bold text-[#2F1B12]`}>
                    Ready to discover your next meal?
                  </p>
                  <p className="text-sm sm:text-lg text-gray-600 mt-2">
                    Fill out the form on the left to get a personalized recipe from ChefAI!
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
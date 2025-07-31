// src/app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, BookText, UtensilsCrossed, Timer, ChefHat, Salad, Apple, Milk, ClipboardList, CalendarDays, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from '@/components/Navbar';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from 'date-fns'; 

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; 

import { Inter, Lexend } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-lexend' });

// Updated Recipe interface to strictly match your MongoDB data and API output
interface Recipe {
  _id: string; 
  userId: string;
  recipe: {
    title: string;
    description: string;
    servingSize?: string;
    cookingTime?: string;
    difficulty?: string;
    ingredients: string[];
    instructions: string[];
    nutritionalInfo?: {
      calories?: string;
      protein?: string;
      fat?: string;
    };
    dietaryRestrictions?: string[];
    cuisinePreference?: string[];
    mealType?: string;
  };
  savedAt: string; 
    imageUrl?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Supabase session error:", error);
        setUser(null);
        router.push('/login');
        toast.error("Authentication error. Please log in.");
      } else if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        router.push('/login');
        toast("Please Log In", {
          description: "You need to be logged in to view your saved recipes.",
          action: {
            label: "Login",
            onClick: () => router.push('/login'),
          },
          duration: 5000,
        });
      }
      setIsAuthChecking(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) {
        router.push('/login');
        toast("Logged Out", {
          description: "You have been logged out. Please login to view saved recipes.",
          action: {
            label: "Login",
            onClick: () => router.push('/login'),
          },
          duration: 5000,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
        setLoadingRecipes(false);
        setRecipes([]);
        return;
      }

      setLoadingRecipes(true);
      setError(null);

      try {
        const session = await supabase.auth.getSession();
        const accessToken = session?.data.session?.access_token;

        if (!accessToken) {
          throw new Error("No access token found. Please log in.");
        }

        const response = await fetch('/api/history', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch recipes.");
        }

        const data = await response.json();
        // Console log received data to confirm structure immediately after API call
        console.log("UI: Raw recipes data from API:", data.recipes);
        setRecipes(data.recipes);
      } catch (err: any) {
        console.error("Error fetching recipes:", err);
        setError(err.message || "Could not load saved recipes. Please try again.");
        toast.error("Failed to load recipes", { description: err.message });
      } finally {
        setLoadingRecipes(false);
      }
    };

    if (user && !isAuthChecking) {
      fetchRecipes();
    }
  }, [user, isAuthChecking]);

  const handleCardClick = (recipe: Recipe) => {
    // Console log selected recipe data just before opening modal
    console.log("UI: Selected Recipe for Modal:", recipe);
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  // Robust date formatting function for ISO 8601 string
  const getFormattedDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) { // Check if date is invalid
          return "Invalid Date";
      }
      return format(date, 'MMMM do, yyyy');
    } catch (e) {
      console.error("Error parsing date string:", e);
      return "Error";
    }
  };


  if (isAuthChecking) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4", inter.variable, lexend.variable)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <ChefHat className="animate-bounce text-[#FF7A59] h-20 w-20 mb-4" />
          <p className="text-xl md:text-2xl text-gray-700 font-semibold font-lexend">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", inter.variable, lexend.variable)}>
      <Navbar />
      {/* Increased pt- to ensure content is below the fixed Navbar */}
      <main className="container mx-auto p-6 md:p-10 pt-28 sm:pt-32 mt-15 max-sm:mt-0 max-md:mt-0 ">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-[#333] mb-8 text-center font-lexend drop-shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Culinary Journey
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md flex items-center"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 mr-3" />
            <p>{error}</p>
          </motion.div>
        )}

        {loadingRecipes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-200">
                <CardHeader className="flex-grow p-4 pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Skeleton className="h-4 w-full mb-1 bg-gray-200" />
                  <Skeleton className="h-4 w-5/6 bg-gray-200" />
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-10 w-full bg-gray-200 rounded-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-10 bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <BookText className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2 font-lexend">No Culinary Creations Yet!</h2>
            <p className="text-gray-500 mb-6">Start generating and saving your delicious recipes.</p>
            <Button
              onClick={() => router.push('/generate')}
              className="bg-[#FF7A59] hover:bg-[#e66549] text-white text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              Generate Your First Recipe
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {recipes.map((recipeItem) => (
              <Card
                key={recipeItem._id} // _id is now string as per API output
                className="rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200 hover:border-[#FF7A59] transform hover:-translate-y-1"
                onClick={() => handleCardClick(recipeItem)}
              >
                {/* Optional: If you have an imageUrl, you could add an image here */}
                {/* {recipeItem.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img src={recipeItem.imageUrl} alt={recipeItem.recipe.title} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                )} */}
                <CardHeader className="p-4 pb-2 flex-grow">
                  <CardTitle className="text-2xl font-extrabold text-[#333] leading-tight mb-1 font-lexend">
                    {recipeItem.recipe.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm line-clamp-2">
                    {recipeItem.recipe.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {recipeItem.recipe.cookingTime && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#FF7A59] text-white font-semibold shadow-sm">
                        <Timer className="h-3.5 w-3.5" /> {recipeItem.recipe.cookingTime}
                      </Badge>
                    )}
                    {recipeItem.recipe.servingSize && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#FF7A59] text-white font-semibold shadow-sm">
                        <UtensilsCrossed className="h-3.5 w-3.5" /> {recipeItem.recipe.servingSize} Servings
                      </Badge>
                    )}
                    {recipeItem.recipe.difficulty && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#FF7A59] text-white font-semibold shadow-sm">
                        <ChefHat className="h-3.5 w-3.5" /> {recipeItem.recipe.difficulty}
                      </Badge>
                    )}
                     {/* Corrected to use recipeItem.recipe for card badges */}
                     {recipeItem.recipe.dietaryRestrictions && recipeItem.recipe.dietaryRestrictions.length > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 border-gray-300">
                        <Tag className="h-3.5 w-3.5" /> {recipeItem.recipe.dietaryRestrictions[0]}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="ghost" className="w-full text-[#FF7A59] hover:bg-[#FFF2EE] hover:text-[#FF7A59] font-semibold transition-colors duration-200">
                    View Recipe
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Recipe Detail Dialog (Modal) */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[850px] max-h-[95vh] flex flex-col p-0 bg-white rounded-2xl shadow-2xl border-2 border-[#FF7A59] transform transition-all duration-300 ease-out">
            {selectedRecipe && (
              <>
                {/* ScrollArea wraps the *entire* content inside DialogContent */}
                <ScrollArea className="flex-grow overflow-auto"> {/* h-full ensures ScrollArea takes available height */}
                  <DialogHeader className="p-6 md:p-8 pb-4 border-b border-gray-200 bg-[#FFF2EE]">
                    <DialogTitle className="text-3xl md:text-5xl font-extrabold text-[#333] leading-tight font-lexend mb-2">
                      {selectedRecipe.recipe.title}
                    </DialogTitle>
                    <DialogDescription className="text-lg mt-2 text-gray-700">
                      {selectedRecipe.recipe.description}
                    </DialogDescription>
                    <div className="flex items-center text-sm text-gray-500 mt-3">
                      <CalendarDays className="h-4 w-4 mr-1.5 text-[#FF7A59]" />
                      <span className="font-medium">Saved On:</span> {getFormattedDate(selectedRecipe.savedAt)}
                    </div>
                  </DialogHeader>

                  <div className="p-6 md:p-8 flex flex-col gap-8">
                    {/* Meta Info Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
                      {selectedRecipe.recipe.servingSize && (
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                          <UtensilsCrossed className="h-8 w-8 text-[#FF7A59] mb-2" />
                          <span className="font-bold text-xl text-gray-800 font-lexend">{selectedRecipe.recipe.servingSize}</span>
                          <span className="text-sm text-gray-500">Servings</span>
                        </div>
                      )}
                      {selectedRecipe.recipe.cookingTime && (
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                          <Timer className="h-8 w-8 text-[#FF7A59] mb-2" />
                          <span className="font-bold text-xl text-gray-800 font-lexend">{selectedRecipe.recipe.cookingTime}</span>
                          <span className="text-sm text-gray-500">Cook Time</span>
                        </div>
                      )}
                      {selectedRecipe.recipe.difficulty && (
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                          <ChefHat className="h-8 w-8 text-[#FF7A59] mb-2" />
                          <span className="font-bold text-xl text-gray-800 font-lexend">{selectedRecipe.recipe.difficulty}</span>
                          <span className="text-sm text-gray-500">Difficulty</span>
                        </div>
                      )}
                    </div>
                    {(selectedRecipe.recipe.dietaryRestrictions?.length || selectedRecipe.recipe.cuisinePreference?.length || selectedRecipe.recipe.mealType) ? (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {selectedRecipe.recipe.dietaryRestrictions?.map((restriction, index) => (
                                <Badge key={`diet-${index}`} className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1">
                                    <Tag className="h-4 w-4" /> {restriction}
                                </Badge>
                            ))}
                            {selectedRecipe.recipe.cuisinePreference?.map((cuisine, index) => (
                                <Badge key={`cuisine-${index}`} className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1">
                                    <Tag className="h-4 w-4" /> {cuisine}
                                </Badge>
                            ))}
                             {selectedRecipe.recipe.mealType && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1">
                                    <Tag className="h-4 w-4" /> {selectedRecipe.recipe.mealType}
                                </Badge>
                            )}
                        </div>
                    ) : null}
                    <Separator className="bg-gray-200" />

                    {/* Ingredients */}
                    <div>
                      <h3 className="text-2xl font-bold text-[#333] mb-4 flex items-center font-lexend">
                        <ClipboardList className="h-7 w-7 mr-2 text-[#FF7A59]" /> Ingredients
                      </h3>
                      {selectedRecipe.recipe.ingredients && selectedRecipe.recipe.ingredients.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2 text-gray-700 text-base marker:text-[#FF7A59]">
                          {selectedRecipe.recipe.ingredients.map((ing, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="pl-2"
                            >
                              {ing}
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No ingredients listed for this recipe.</p>
                      )}
                    </div>
                    <Separator className="bg-gray-200" />

                    {/* Instructions */}
                    <div>
                      <h3 className="text-2xl font-bold text-[#333] mb-4 flex items-center font-lexend">
                        <BookText className="h-7 w-7 mr-2 text-[#FF7A59]" /> Instructions
                      </h3>
                      {selectedRecipe.recipe.instructions && selectedRecipe.recipe.instructions.length > 0 ? (
                        <ol className="list-decimal list-inside space-y-3 text-gray-700 text-base marker:font-semibold marker:text-[#FF7A59]">
                          {selectedRecipe.recipe.instructions.map((instruction, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="pl-2"
                            >
                              {instruction}
                            </motion.li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-gray-500 italic">No instructions provided for this recipe.</p>
                      )}
                    </div>
                    <Separator className="bg-gray-200" />

                    {/* Nutritional Info */}
                    {selectedRecipe.recipe.nutritionalInfo && (
                      <div>
                        <h3 className="text-2xl font-bold text-[#333] mb-4 flex items-center font-lexend">
                          <Salad className="h-7 w-7 mr-2 text-[#FF7A59]" /> Nutritional Information
                        </h3>
                        {(selectedRecipe.recipe.nutritionalInfo.calories ||
                          selectedRecipe.recipe.nutritionalInfo.protein ||
                          selectedRecipe.recipe.nutritionalInfo.fat) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {selectedRecipe.recipe.nutritionalInfo.calories && (
                                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg shadow-sm border border-green-100 text-green-800">
                                  <Apple className="h-6 w-6 mb-1" />
                                  <span className="font-bold text-lg">{selectedRecipe.recipe.nutritionalInfo.calories}</span>
                                  <span className="text-sm">Calories</span>
                                </div>
                              )}
                              {selectedRecipe.recipe.nutritionalInfo.protein && (
                                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg shadow-sm border border-blue-100 text-blue-800">
                                  <Milk className="h-6 w-6 mb-1" />
                                  <span className="font-bold text-lg">{selectedRecipe.recipe.nutritionalInfo.protein}</span>
                                  <span className="text-sm">Protein</span>
                                </div>
                              )}
                              {selectedRecipe.recipe.nutritionalInfo.fat && (
                                <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg shadow-sm border border-yellow-100 text-yellow-800">
                                  <UtensilsCrossed className="h-6 w-6 mb-1" />
                                  <span className="font-bold text-lg">{selectedRecipe.recipe.nutritionalInfo.fat}</span>
                                  <span className="text-sm">Fat</span>
                                </div>
                              )}
                            </div>
                        ) : (
                          <p className="text-gray-500 italic">No detailed nutritional information available.</p>
                        )}
                        <p className="text-sm text-gray-500 mt-4 italic">
                          Note: Nutritional information is an estimate based on common understanding and may not be exact.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
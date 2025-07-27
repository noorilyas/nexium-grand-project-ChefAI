'use client'

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { MoveRight, Sparkles, ClipboardList } from "lucide-react";
import { motion, Easing, RepeatType } from "framer-motion";
import { useRef, useCallback, useEffect, useState } from 'react'; // Import useEffect and useState
import { useRouter, usePathname } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient'; // Import your Supabase client

import { Inter, Lexend } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-lexend' });

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status
  const router = useRouter();
  const pathname = usePathname();
  const generateOptionsRef = useRef<HTMLDivElement>(null);

  // Effect to check user session on component mount and on auth state changes
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Check for existing session
      setIsLoggedIn(!!session); // Set isLoggedIn to true if session exists
    };

    checkUser(); // Initial check

    // Listen for auth state changes (e.g., after magic link click, or logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session); // Update state based on auth event
        // You could add specific logic here if needed for SIGNED_IN or SIGNED_OUT events
      }
    );

    // Cleanup the subscription when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


  const scrollToGenerateOptions = useCallback(() => {
    if (pathname === '/') {
      router.push('/#generate-options', { scroll: false });
      if (generateOptionsRef.current) {
        generateOptionsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [router, pathname]);

  const handleAuthButtonClick = async () => { // Make it async for signOut
    if (isLoggedIn) {
      // If logged in, the button is "Logout"
      const { error } = await supabase.auth.signOut(); // Call Supabase signOut
      if (error) {
        console.error('Logout error:', error.message);
      }
      router.push('/'); // Redirect to homepage after logout
    } else {
      // If not logged in, it's the "Login" button
      router.push('/login'); // Redirect to login page
    }
  };

  return (
    <main className={`${inter.variable} font-inter min-h-screen text-[#2F1B12] overflow-x-hidden`}>

      <header className="w-full flex items-center justify-between px-6 md:px-16 py-4 shadow-lg bg-white/80 backdrop-blur-sm fixed top-0 z-50 border-b border-orange-100">
        <Image src="/assets/logo.PNG" alt="ChefAI logo" width={160} height={90} className="object-contain" />
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-[#FF7A59] transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-[#FF7A59] transition-colors duration-200">How It Works</a>
          {/* Conditionally render History link */}
          {isLoggedIn && <a href="#history" className="hover:text-[#FF7A59] transition-colors duration-200">History</a>}
        </nav>
        {/* Conditionally render Login/Logout button text and action */}
        <Button
            onClick={handleAuthButtonClick} // Use the new handler
            className="bg-[#FF7A59] hover:bg-[#e66549] text-white text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
            {isLoggedIn ? 'Logout' : 'Login'} {/* Changed button text based on login status */}
        </Button>
      </header>

      <section className="relative pt-36 pb-24 px-6 md:px-16 overflow-hidden flex items-center justify-center min-h-[80vh] bg-[#FFF8F3]">

        <div className="absolute inset-0 -z-30 h-full">
          <div className="relative w-full h-full">
            <Image
              src="/assets/chef.jpg"
              alt="Subtle kitchen background texture"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-[0.03]"
            />
          </div>
        </div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FF7A59]/15 to-[#FFC2B3]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -z-20 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#FFE2D1]/25 to-[#FFD5C0]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -z-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-r from-[#FF7A59]/10 to-[#FFC2B3]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-20 animate-blob animation-delay-4000" />
        <div className="absolute -bottom-1/4 left-1/2 w-80 h-80 bg-gradient-to-tr from-[#FF7A59]/15 to-[#FFC2B3]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -z-20 animate-blob animation-delay-6000" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[2.5fr_1fr] items-center gap-12 w-full">
            <div className="text-center lg:text-left">
                <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className={`${lexend.variable} font-lexend text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg text-[#2F1B12]`}
                >
                Master Your Kitchen. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A59] to-[#FF5E33]">Effortlessly.</span>
                </motion.h1>

                <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-base md:text-lg max-w-3xl mx-auto lg:max-w-none mb-10 text-gray-700 leading-relaxed"
                >
                ChefAI crafts personalized recipes from your ingredients and preferences, transforming your cooking experience with intelligent simplicity.
                </motion.p>

                <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="lg:text-left"
                >
                <Button
                    onClick={scrollToGenerateOptions}
                    className="bg-[#FF7A59] hover:bg-[#e66549] text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto lg:mx-0 transform hover:-translate-y-1"
                >
                    Start Cooking Smart
                    <MoveRight className="ml-2 w-5 h-5" />
                </Button>
                </motion.div>
            </div>

            {/* Robot Image Section */}
            <div className="relative w-full aspect-square max-w-[700px] mx-auto hidden lg:flex items-center justify-center flex-shrink-0">
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                        type: "spring", stiffness: 100, damping: 20, delay: 0.8,
                        y: { repeat: Infinity, repeatType: "mirror", duration: 4, ease: "easeInOut" as Easing }
                    }}
                    whileInView={{ y: [0, -10, 0] }}
                    viewport={{ once: false, amount: 0.8 }}
                    className="relative w-full h-full pointer-events-none z-10"
                >
                    <Image
                        src="/assets/robot-chef-hero.png"
                        alt="Friendly AI Chef serving dish"
                        fill
                        sizes="(max-width: 1024px) 0vw, 900px" // Corrected sizes attribute
                        className="object-contain drop-shadow-xl"
                    />
                </motion.div>


            </div>
        </div>
      </section>

      {/* Generate Options Section - Cards with engaging hover and scroll animations */}
      <section className="py-24 bg-white px-6 md:px-16" id="generate-options" ref={generateOptionsRef}>
        <div className="max-w-7xl mx-auto mb-16 text-center">
            <h2 className={`${lexend.variable} font-lexend text-4xl font-bold mb-4 text-[#2F1B12]`}>Explore Your Culinary Journey</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose how you want ChefAI to inspire your next meal.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            className="relative flex flex-col justify-between border border-orange-200 rounded-2xl p-10 shadow-xl bg-gradient-to-br from-white to-orange-50/50 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <h3 className={`${lexend.variable} font-lexend text-2xl font-bold mb-4 text-[#2F1B12]`}> Generate Recipe using AI</h3>
            <p className="text-base text-gray-700 mb-6">Let AI suggest a dish based on your taste, dietary needs, or current cravings. Discover new culinary horizons effortlessly.</p>
            <Button className="bg-[#FF7A59] hover:bg-[#e66549] text-white text-md px-6 py-3 rounded-full shadow-md self-start transform group-hover:scale-[1.02] transition-transform duration-200">Try It Now</Button>

            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center opacity-70 transform group-hover:rotate-12 transition-transform duration-300">
                <Sparkles className="w-12 h-12 text-[#FF7A59]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            className="relative flex flex-col justify-between border border-orange-200 rounded-2xl p-10 shadow-xl bg-gradient-to-br from-white to-orange-50/50 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <h3 className={`${lexend.variable} font-lexend text-2xl font-bold mb-4 text-[#2F1B12]`}> Generate using Ingredients</h3>
            <p className="text-base text-gray-700 mb-6">Input the ingredients you have on hand, and ChefAI will craft creative and delicious recipes, minimizing food waste.</p>
           <Button
              onClick={() => router.push('/generate')} 
              className="bg-[#FF7A59] hover:bg-[#e66549] text-white text-md px-6 py-3 rounded-full shadow-md self-start transform group-hover:scale-[1.02] transition-transform duration-200"
            >
              Get Cooking
            </Button>


            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center opacity-70 transform group-hover:-rotate-12 transition-transform duration-300">
                <ClipboardList className="w-12 h-12 text-[#FF7A59]" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-[#FFE9DA] px-6 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`${lexend.variable} font-lexend text-4xl font-bold mb-10 text-[#2F1B12]`}>How ChefAI Transforms Your Kitchen</h2>
          <ol className="text-left list-none space-y-8 text-base text-gray-800">
            <motion.li
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-200"
            >
                <div className="flex-shrink-0 w-12 h-12 bg-[#FF7A59] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">1</div>
                <p className="flex-grow text-lg">
                    <strong className="text-[#FF7A59]">Intelligent Input:</strong> Tell ChefAI your ingredients, dietary needs, or culinary aspirations.
                </p>
            </motion.li>
            <motion.li
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-200"
            >
                <div className="flex-shrink-0 w-12 h-12 bg-[#FF7A59] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">2</div>
                <p className="flex-grow text-lg">
                    <strong className="text-[#FF7A59]">Instant Culinary Creation:</strong> Our AI engine instantly crafts unique, delicious recipes with clear, step-by-step instructions.
                </p>
            </motion.li>
            <motion.li
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-200"
            >
                <div className="flex-shrink-0 w-12 h-12 bg-[#FF7A59] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">3</div>
                <p className="flex-grow text-lg">
                    <strong className="text-[#FF7A59]">Cook with Confidence:</strong> Follow the easy guide and savor your personalized dish. Gourmet cooking is now simple for everyone!
                </p>
            </motion.li>
          </ol>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-600 py-10 bg-white border-t border-orange-100">
        Made with <span className="text-red-500">❤️</span> by Team ChefAI — 2025 Internship Project
      </footer>
    </main>
  );
}
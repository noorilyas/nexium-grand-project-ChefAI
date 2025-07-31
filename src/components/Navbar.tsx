// src/components/Navbar.tsx
'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Inter, Lexend } from 'next/font/google';
import { MenuIcon, HomeIcon, Lightbulb, ChefHat, History, LogOut, LogIn } from 'lucide-react'; // Added more icons

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-lexend' });

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthButtonClick = async () => {
    if (isLoggedIn) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
      router.push('/');
    } else {
      router.push('/login');
    }
    setIsMenuOpen(false); // Close menu on auth action
  };

  const handleNavLinkClick = (path: string) => {
    // This part should also consider hash links if your Navbar links to sections on the same page.
    // For now, I'm keeping it as a direct push, but be aware of this if you have #links in your Navbar.
    router.push(path);
    setIsMenuOpen(false); // Close menu after clicking a link
  };

  return (
    <header className="w-full flex items-center justify-between py-4 shadow-lg bg-white/80 backdrop-blur-sm fixed top-0 z-50 border-b border-orange-100">
      <div className="container mx-auto flex items-center justify-between px-6 md:px-16">
        {/* Logo - clickable to homepage */}
        <Image
          src="/assets/logo.PNG"
          alt="ChefAI logo"
          width={160}
          height={90}
          className="object-contain cursor-pointer"
          onClick={() => handleNavLinkClick('/')}
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a
              href="/#generate-options"
              className="hover:text-[#FF7A59] transition-colors duration-200"
              onClick={(e) => { e.preventDefault(); handleNavLinkClick('/#generate-options'); }}
            >
              Features
            </a>
          <a
            href="/#how-it-works"
            className="hover:text-[#FF7A59] transition-colors duration-200"
            onClick={(e) => { e.preventDefault(); handleNavLinkClick('/#how-it-works'); }}
          >
            How It Works
          </a>
          {isLoggedIn && (
            <a
              href="/history"
              className="hover:text-[#FF7A59] transition-colors duration-200"
              onClick={(e) => { e.preventDefault(); handleNavLinkClick('/history'); }}
            >
              History
            </a>
          )}
        </nav>

        {/* Mobile Menu Button (Hamburger) */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6 text-[#333]" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className={`w-[280px] sm:w-[320px] bg-gradient-to-br from-white to-orange-50 flex flex-col py-8 px-6 shadow-2xl ${inter.variable} ${lexend.variable}`}
          >
            <SheetHeader className="text-left mb-8">
              <Image
                src="/assets/logo.PNG" // Assuming you want the logo inside the sheet header
                alt="ChefAI logo"
                width={120}
                height={70}
                className="object-contain mb-2"
              />
              <SheetTitle className="text-3xl font-extrabold text-[#333] font-lexend">
                ChefAI Menu
              </SheetTitle>
              <SheetDescription className="text-base text-gray-600">
                Your culinary assistant.
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-6 text-xl font-medium flex-grow">
              <a
                href="/"
                className="flex items-center gap-3 text-gray-700 hover:text-[#FF7A59] transition-colors duration-200 py-2 border-b border-gray-100"
                onClick={(e) => { e.preventDefault(); handleNavLinkClick('/'); }}
              >
                <HomeIcon className="h-5 w-5" /> Home
              </a>
                <a
                  href="/#generate-options"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#FF7A59] transition-colors duration-200 py-2 border-b border-gray-100"
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('/#generate-options'); }}
                >
                  <Lightbulb className="h-5 w-5" /> Features
                </a>
              <a
                href="/#how-it-works"
                className="flex items-center gap-3 text-gray-700 hover:text-[#FF7A59] transition-colors duration-200 py-2 border-b border-gray-100"
                onClick={(e) => { e.preventDefault(); handleNavLinkClick('/#how-it-works'); }}
              >
                <ChefHat className="h-5 w-5" /> How It Works
              </a>
              {isLoggedIn && (
                <a
                  href="/history"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#FF7A59] transition-colors duration-200 py-2 border-b border-gray-100"
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('/history'); }}
                >
                  <History className="h-5 w-5" /> History
                </a>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <Button
                onClick={handleAuthButtonClick}
                className="w-full bg-[#FF7A59] hover:bg-[#e66549] text-white text-base px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoggedIn ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                {isLoggedIn ? 'Logout' : 'Login'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Login/Logout Button (hidden on mobile, handled in Sheet for mobile) */}
        <Button
          onClick={handleAuthButtonClick}
          // Changed md:block to md:flex and added items-center and gap-2
          className="bg-[#FF7A59] hover:bg-[#e66549] text-white text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hidden md:flex items-center gap-2"
        >
          {isLoggedIn ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          {isLoggedIn ? 'Logout' : 'Login'}
        </Button>
      </div>
    </header>
  );
}
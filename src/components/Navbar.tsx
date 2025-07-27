// src/components/Navbar.tsx
'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Inter, Lexend } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-lexend' });

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  };

  return (
    <header className="w-full flex items-center justify-between py-4 shadow-lg bg-white/80 backdrop-blur-sm fixed top-0 z-50 border-b border-orange-100">
      {/* This is the crucial change: container for content */}
      <div className="container mx-auto flex items-center justify-between px-6 md:px-16">
        <Image src="/assets/logo.PNG" alt="ChefAI logo" width={160} height={90} className="object-contain" />
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="/#features" className="hover:text-[#FF7A59] transition-colors duration-200">Features</a>
          <a href="/#how-it-works" className="hover:text-[#FF7A59] transition-colors duration-200">How It Works</a>
          {isLoggedIn && <a href="/history" className="hover:text-[#FF7A59] transition-colors duration-200">History</a>}
        </nav>
        <Button
          onClick={handleAuthButtonClick}
          className="bg-[#FF7A59] hover:bg-[#e66549] text-white text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isLoggedIn ? 'Logout' : 'Login'}
        </Button>
      </div>
    </header>
  );
}
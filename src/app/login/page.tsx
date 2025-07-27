
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image';
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";  
import { Mail, CheckCircle, XCircle } from 'lucide-react'; // Icons for email, success, error
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabaseClient'; 

import { Inter, Lexend } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-lexend' });

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Ensure email is not empty
    if (!email) {
      setMessage('Please enter your email address.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`, 
        },
      });

      if (error) {
        throw error;
      }

      setMessage('Magic link sent! Check your email to log in.');
      setMessageType('success');
      setEmail(''); // Clear email field on success
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      setMessage(`Login failed: ${error.message || 'An unexpected error occurred.'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const navigateToHome = () => {
    router.push('/');
  };

  return (
    <div className={`${inter.variable} font-inter min-h-screen flex items-center justify-center bg-[#FFF8F3] text-[#2F1B12] overflow-hidden relative`}>
      {/* Background blobs - copied from homepage for consistency */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FF7A59]/15 to-[#FFC2B3]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -z-20 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#FFE2D1]/25 to-[#FFD5C0]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -z-20 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-r from-[#FF7A59]/10 to-[#FFC2B3]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-20 animate-blob animation-delay-4000" />
      <div className="absolute -bottom-1/4 left-1/2 w-80 h-80 bg-gradient-to-tr from-[#FF7A59]/15 to-[#FFC2B3]/0 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -z-20 animate-blob animation-delay-6000" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl border border-orange-100 max-w-md w-full text-center"
      >
        <Image src="/assets/logo.PNG" alt="ChefAI logo" width={180} height={60} className="object-contain mx-auto mb-8" />
        <h1 className={`${lexend.variable} font-lexend text-3xl md:text-4xl font-bold mb-6 text-[#2F1B12]`}>
          Welcome Back!
        </h1>
        <p className="text-gray-700 mb-8 text-md">
          Enter your email to receive a magic link and securely log in or sign up.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200 text-[#2F1B12] placeholder-gray-500"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FF7A59] hover:bg-[#e66549] text-white text-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            disabled={loading}
          >
            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
          </Button>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mt-6 p-3 rounded-lg flex items-center justify-center gap-2 ${
              messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {messageType === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {message}
          </motion.div>
        )}

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8"
        >
            <Button
                variant="link" 
                onClick={navigateToHome}
                className="text-orange-600 hover:text-orange-800 transition-colors duration-200"
            >
                Back to Home
            </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
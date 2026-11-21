"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Compass, Search } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 relative flex flex-col items-center justify-center py-12 bg-maroon-deep overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none w-full h-full">
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gold/5 blur-[100px]"
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-maroon/20 blur-[120px]"
          />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 w-full flex flex-col items-center justify-center text-center">
          {/* 404 Text Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-full flex justify-center"
          >
            <motion.h1 
              className="font-display leading-none tracking-tighter text-transparent bg-clip-text"
              style={{
                fontSize: "clamp(120px, 20vw, 300px)",
                backgroundImage: "linear-gradient(180deg, var(--gold) 0%, rgba(255,255,255,0) 150%)",
                WebkitTextStroke: "1px rgba(255, 255, 255, 0.1)",
              }}
              initial={{ scale: 0.9, filter: "blur(10px)" }}
              animate={{ scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
              404
            </motion.h1>
            
            {/* Floating Compass Icon */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/20"
            >
              <Compass className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48" strokeWidth={0.5} />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="max-w-xl w-full mx-auto space-y-6 sm:space-y-8 mt-4 relative z-20"
          >
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-display text-cream">
                Lost in the threads
              </h2>
              <p className="text-cream/60 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                The collection or piece you are looking for has been moved, removed, or never existed in our atelier.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center gap-2 bg-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition hover:bg-gold-soft min-w-[200px] justify-center"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Return Home
                </motion.div>
              </Link>
              
              <Link href="/shop">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 border border-cream/20 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition hover:border-gold hover:text-gold min-w-[200px] justify-center bg-white/5 backdrop-blur-sm"
                >
                  <Search className="w-4 h-4" />
                  Browse Shop
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />
      </main>

      <Footer />
    </div>
  );
}

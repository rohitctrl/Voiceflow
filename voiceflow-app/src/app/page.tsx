'use client'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Mic, 
  Shield, 
  Sparkles, 
  Upload, 
  Star,
  ArrowRight,
  Play,
  Volume2,
  BrainCircuit,
  Layers3
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
}

const fadeInScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/30 to-cyan-600/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            rotate: [0, -180, -360],
            x: [-200, 200, -200],
            y: [-100, 100, -100]
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 pt-20 pb-32">
        <motion.div 
          className="text-center max-w-5xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInScale} className="mb-8">
            <motion.span 
              className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium mb-6 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0 4px 20px rgba(59, 130, 246, 0.3)", "0 8px 25px rgba(147, 51, 234, 0.4)", "0 4px 20px rgba(59, 130, 246, 0.3)"],
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              ✨ Powered by OpenAI Whisper & Claude AI
            </motion.span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 relative"
          >
            <motion.span 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent relative inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
              VoiceFlow
              {/* Glowing effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-20 blur-xl -z-10"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 font-medium mb-6"
          >
            From thought to text in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">
              seconds
            </span>
          </motion.p>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your voice notes into organized, searchable text with cutting-edge AI. 
            Perfect transcription, intelligent summaries, and seamless organization—all in one beautiful interface.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
              >
                <Link href="/auth/signin">
                  {/* Animated background shine */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                  <Mic className="mr-3 h-6 w-6 group-hover:animate-pulse relative z-10" />
                  <span className="relative z-10">Start Recording</span>
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-2 border-slate-300 hover:border-blue-500 px-8 py-6 text-lg font-semibold rounded-2xl backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300 group relative overflow-hidden"
              >
                <Link href="#features">
                  <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Watch Demo</span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Interactive Demo Card */}
          <motion.div 
            variants={fadeInScale}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              whileHover={{ 
                scale: 1.02, 
                rotateY: 2,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-900/70 backdrop-blur-xl relative">
                {/* Glowing border effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{
                    background: [
                      "linear-gradient(45deg, transparent, transparent)",
                      "linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
                      "linear-gradient(45deg, transparent, transparent)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="aspect-video relative rounded-3xl overflow-hidden">
                  {/* Enhanced Animated Waveform Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                    {/* Multiple waveform layers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-white/80 rounded-full"
                          animate={{
                            height: [
                              10 + Math.sin(i * 0.5) * 20, 
                              30 + Math.sin(i * 0.3) * 40, 
                              10 + Math.sin(i * 0.5) * 20
                            ],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{
                            duration: 1.5 + (i % 3) * 0.5,
                            repeat: Infinity,
                            delay: i * 0.05,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Pulse rings */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-32 h-32 border-2 border-white/30 rounded-full"
                          animate={{
                            scale: [0.5, 2, 0.5],
                            opacity: [0.8, 0, 0.8]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 1,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                  
                  {/* Enhanced Overlay Content */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <motion.div 
                      className="text-center text-white"
                      variants={floatingAnimation}
                      animate="animate"
                    >
                      <motion.div 
                        className="bg-white/20 backdrop-blur-md rounded-full p-6 mb-6 inline-block"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Volume2 className="h-12 w-12" />
                      </motion.div>
                      <motion.h3 
                        className="text-2xl font-bold mb-2"
                        animate={{
                          textShadow: [
                            "0 0 0px rgba(255,255,255,0)",
                            "0 0 20px rgba(255,255,255,0.5)",
                            "0 0 0px rgba(255,255,255,0)"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        See VoiceFlow in Action
                      </motion.h3>
                      <p className="text-lg opacity-90">Real-time transcription with AI processing</p>
                      
                      {/* Play button overlay */}
                      <motion.div
                        className="mt-4"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
                          <Play className="mr-2 h-4 w-4" />
                          Click to Preview
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Powerful{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Features
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Everything you need to capture, transcribe, and organize your thoughts with unprecedented efficiency
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Real-time Recording */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-900 group hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <Mic className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Real-time Recording
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    High-quality voice recording with live waveform visualization and intuitive controls for professional results
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* AI Transcription */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-slate-900 group hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: -10 }}
                  >
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    AI Transcription
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    OpenAI Whisper-powered transcription with 99%+ accuracy and support for multiple languages and formats
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Smart Processing */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-slate-900 group hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Smart Processing
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Claude AI automatically cleans, summarizes, and extracts key insights from your transcripts with intelligent formatting
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* File Upload */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-slate-900 group hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: -10 }}
                  >
                    <Upload className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Universal Upload
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Drag & drop support for MP3, WAV, M4A, WebM, OPUS, and OGG files with real-time progress tracking and batch processing
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Organization */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-slate-900 group hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <Layers3 className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Smart Organization
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Advanced search, filtering, and export capabilities with automatic tagging, categorization, and metadata extraction
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-gradient-to-br from-white to-red-50/50 dark:from-slate-800 dark:to-slate-900 group hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: -10 }}
                  >
                    <Shield className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Enterprise Security
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    End-to-end encryption with Google/GitHub OAuth authentication and comprehensive privacy controls for complete peace of mind
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-4 gap-8 text-center text-white"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <motion.div 
                className="text-5xl font-bold mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                99%
              </motion.div>
              <div className="text-xl opacity-90">Accuracy Rate</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <motion.div 
                className="text-5xl font-bold mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                10K+
              </motion.div>
              <div className="text-xl opacity-90">Happy Users</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <motion.div 
                className="text-5xl font-bold mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                1M+
              </motion.div>
              <div className="text-xl opacity-90">Hours Transcribed</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <motion.div 
                className="text-5xl font-bold mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                50+
              </motion.div>
              <div className="text-xl opacity-90">Languages Supported</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Thousands
              </span>
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { name: "Sarah Johnson", role: "Content Creator", text: "VoiceFlow has revolutionized how I capture ideas. The AI summaries are incredibly accurate!" },
              { name: "Mike Chen", role: "Researcher", text: "The transcription quality is unmatched. I can focus on my interviews without worrying about notes." },
              { name: "Elena Rodriguez", role: "Journalist", text: "From voice memo to published article in minutes. This tool is a game-changer for my workflow." }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Transform
              </span>
              {" "}Your Voice?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who are already transforming their voice notes into organized, searchable content with VoiceFlow
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-12 py-8 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
              >
                <Link href="/auth/signin">
                  <Mic className="mr-4 h-7 w-7 group-hover:animate-pulse" />
                  Start Recording for Free
                  <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            <p className="text-slate-400 mt-6">No credit card required • 100% free to start</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
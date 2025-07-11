'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Inter } from 'next/font/google';
import { FiMoon, FiSun, FiMenu, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Aurora from "@/components/Aurora";

const inter = Inter({ subsets: ['latin'] });

interface Testimonial {
  name: string;
  quote: string;
  image: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface TypewriterTextProps {
  text: string;
  delay?: number;
}

const features: Feature[] = [
  {
    icon: '🌙',
    title: 'Always Dark Mode',
    description: 'Comfortable for eyes, day or night.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description: 'Your thoughts stay only with you.',
  },
  {
    icon: '🔔',
    title: 'Smart Reminders',
    description: 'Never miss a moment to reflect.',
  },
  {
    icon: '🌌',
    title: 'Mood Tracker',
    description: 'Visualize your emotional journey.',
  },
];

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    quote: 'This app has transformed how I document my daily life. The interface is beautiful and intuitive.',
    image: '/avatars/sarah.jpg',
  },
  {
    name: 'Michael Chen',
    quote: 'The best journaling experience I\'ve ever had. The animations make writing feel magical.',
    image: '/avatars/michael.jpg',
  },
  {
    name: 'Emma Davis',
    quote: 'I love how my entries come to life with the beautiful animations and transitions.',
    image: '/avatars/emma.jpg',
  },
];

const journalEntries = [
  {
    title: 'Morning Reflection',
    content: 'Today I felt... at peace with the world. The gentle morning light streaming through my window reminded me of life\'s simple pleasures.',
    mood: 'Peaceful',
    date: 'May 15, 2024',
    time: '8:30 AM',
    weather: '☀️ Sunny',
    location: 'Home'
  },
  {
    title: 'Evening Thoughts',
    content: 'The moonlight reminded me of quiet joy. As I write these words, I\'m grateful for the stillness that surrounds me.',
    mood: 'Grateful',
    date: 'May 14, 2024',
    time: '9:15 PM',
    weather: '🌙 Clear',
    location: 'Garden'
  },
  {
    title: 'Daily Meditation',
    content: 'Learning to be still is a journey. Each day brings new opportunities to find peace within.',
    mood: 'Mindful',
    date: 'May 13, 2024',
    time: '7:00 AM',
    weather: '🌅 Dawn',
    location: 'Meditation Room'
  }
];

const HorizontalTypewriter = ({ text, delay = 0 }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, Math.random() * 50 + 30);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span className="inline-block">{displayText}</span>;
};

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currentEntry, setCurrentEntry] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  
  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const ySpring = useSpring(y, springConfig);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [0, 15, 0]);
  const featuresY = useTransform(scrollYProgress, [0.3, 0.7], [0, -100]);
  const testimonialsY = useTransform(scrollYProgress, [0.5, 0.8], [0, -100]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const entryTimer = setInterval(() => {
      setCurrentEntry((prev) => (prev + 1) % journalEntries.length);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(entryTimer);
    };
  }, []);

  const handleStartJournaling = () => {
    router.push('/signup');
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black flex flex-col items-center justify-center"
      >
        <motion.h1
          initial={{ letterSpacing: '0.5em' }}
          animate={{ letterSpacing: '0.2em' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="text-4xl font-bold text-white mb-4 gradient-text"
        >
          Sanctuary Journal
        </motion.h1>
        <motion.div
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-gray-400 loading-dots"
        >
          Loading
        </motion.div>
      </motion.div>
    );
  }

  return (
    <main className={`min-h-screen text-white ${inter.className} relative`} style={{ background: 'black' }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora colorStops={["#FF69B4", "#3A29FF", "#A259FF", "#A259FF"]} amplitude={1.0} blend={0.5} />
      </div>
      <div className="relative z-10">
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 w-full z-50 bg-transparent border-b-4 border-fuchsia-400 shadow-2xl backdrop-blur-lg rounded-b-2xl"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold gradient-text"
              >
                Sanctuary
              </motion.h1>

              <div className="hidden md:flex items-center space-x-8">
                {['Home', 'Features', 'Preview', 'Testimonials'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    whileHover={{ scale: 1.05 }}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 glass rounded-full text-white hover-glow transition-all"
                >
                  Sign Up
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full glass"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </motion.button>
            </div>

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: isMenuOpen ? 'auto' : 0,
                opacity: isMenuOpen ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {['Home', 'Features', 'Preview', 'Testimonials'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </motion.a>
                ))}
                <div className="flex flex-col space-y-4 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      router.push('/login');
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      router.push('/signup');
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 glass rounded-full text-white hover-glow transition-all"
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.nav>

        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <motion.div 
            style={{ scale, opacity, rotateX }}
            className="container mx-auto px-6 text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="text-6xl md:text-7xl font-bold gradient-text leading-tight pb-2"
                >
                  Your Digital
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="text-6xl md:text-7xl font-bold gradient-text leading-tight pb-2"
                >
                  <HorizontalTypewriter text="Sanctuary" />
                </motion.div>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl text-gray-300 mb-8 mt-4"
            >
              Capture your thoughts, dreams, and memories beautifully.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartJournaling}
              className="px-8 py-4 glass rounded-full text-white hover-glow transition-all border border-white/90 shadow-[0_0_24px_6px_rgba(255,255,255,0.32)]"
            >
              Start Journaling
            </motion.button>
          </motion.div>
        </section>

        <section id="preview" className="py-20">
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-center mb-12 gradient-text"
            >
              Experience Your Journal
            </motion.h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="w-full max-w-2xl mx-auto">
                  <div className="relative">
                    <div className="aspect-[16/10] glass rounded-t-xl overflow-hidden relative border-4 border-[rgba(255,255,255,0.35)] shadow-[0_4px_32px_0_rgba(162,89,255,0.32)]">
                      <div className="h-8 bg-black/80 flex items-center px-4">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-pink-400" />
                        </div>
                        <div className="flex-1 text-center text-xs text-gray-400">
                          Sanctuary Journal
                        </div>
                      </div>
                      
                      <div className="p-6 h-[calc(100%-2rem)]">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-semibold gradient-text">{journalEntries[currentEntry].title}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-400">{journalEntries[currentEntry].date}</span>
                              <span className="text-sm text-gray-400">{journalEntries[currentEntry].time}</span>
                              <span className="text-sm text-gray-400">{journalEntries[currentEntry].weather}</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm glass">{journalEntries[currentEntry].mood}</span>
                        </div>
                        <div className="mb-4">
                          <span className="text-sm text-gray-400">{journalEntries[currentEntry].location}</span>
                        </div>
                        <TypewriterText text={journalEntries[currentEntry].content} />
                      </div>
                    </div>
                    
                    <div className="h-4 bg-gray-800 rounded-b-xl" />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-800 rounded-b-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="w-72 mx-auto">
                  <div className="relative">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    </div>

                    <div className="aspect-[9/19.5] glass rounded-[3rem] overflow-hidden relative border-4 border-[rgba(255,255,255,0.35)] shadow-[0_4px_32px_0_rgba(162,89,255,0.32)]">
                      <div className="h-8 bg-black/80 flex items-center justify-between px-6">
                        <span className="text-xs text-white">9:41</span>
                        <div className="flex space-x-2">
                          <span className="text-xs text-white">📶</span>
                          <span className="text-xs text-white">📡</span>
                          <span className="text-xs text-white">🔋</span>
                        </div>
                      </div>

                      <div className="p-4 h-[calc(100%-2rem)] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold gradient-text">{journalEntries[currentEntry].title}</h3>
                          <span className="text-xs text-gray-400">{journalEntries[currentEntry].time}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="px-2 py-1 rounded-full text-xs glass">{journalEntries[currentEntry].mood}</span>
                          <span className="text-xs text-gray-400">{journalEntries[currentEntry].weather}</span>
                        </div>
                        <div className="mb-4">
                          <span className="text-xs text-gray-400">{journalEntries[currentEntry].location}</span>
                        </div>
                        <TypewriterText text={journalEntries[currentEntry].content} />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/80 flex items-center justify-around px-6">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <span className="text-xl">📝</span>
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <span className="text-xl">📊</span>
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <span className="text-xl">⚙️</span>
                        </button>
                      </div>
                    </div>

                    <div className="absolute top-1/4 -right-1 w-1 h-16 bg-gray-800 rounded-l-lg" />
                    <div className="absolute top-1/3 -right-1 w-1 h-8 bg-gray-800 rounded-l-lg" />
                    <div className="absolute top-1/2 -right-1 w-1 h-16 bg-gray-800 rounded-l-lg" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20">
          <motion.div 
            style={{ y: testimonialsY }}
            className="container mx-auto px-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-center mb-12 gradient-text"
            >
              What Our Users Say
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="glass rounded-xl p-6 hover-glow"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mr-4 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold gradient-text">{testimonial.name}</h3>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300">{testimonial.quote}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="features" className="py-20">
          <motion.div 
            style={{ y: featuresY }}
            className="container mx-auto px-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-center mb-12 gradient-text"
            >
              Premium Features
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="glass rounded-xl p-6 hover-glow perspective-1000"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 gradient-text">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 md:hidden glass z-50"
        >
          <div className="flex justify-around items-center p-4">
            {['Home', 'Features', 'Preview', 'Testimonials'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                whileTap={{ scale: 0.95 }}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <footer className="py-12">
          <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center space-x-8 mb-8">
              {['About', 'Contact', 'Privacy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            <p className="text-gray-500">✨ <span className="footer-glow">Made under the stars</span></p>
          </div>
        </footer>
      </div>
    </main>
  );
}

const TypewriterText = ({ text, delay = 0 }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, Math.random() * 100 + 50); // Random typing speed
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <p className="text-gray-300">{displayText}</p>;
};

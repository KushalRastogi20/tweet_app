"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSection, setVisibleSection] = useState("hero");

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
      transition: {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotating testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    // Intersection Observer for section visibility
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handleGetStarted = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      if (!isLoggedIn) {
        router.push("/login");
      } else {
        router.push("/feed");
      }
      setIsLoading(false);
    }, 1000);
  }, [isLoggedIn, router]);

  const handleEmailSubmit = useCallback((e) => {
    e.preventDefault();
    if (email) {
      setNotification("Thanks for subscribing! We'll keep you updated.");
      setEmail("");
      setTimeout(() => setNotification(""), 3000);
    }
  }, [email]);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMenuOpen(false);
  }, []);

  // Data arrays
  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "👩‍🎨",
      testimonial: "This platform has completely changed how I connect with my audience. The interface is intuitive and the features are exactly what creators need.",
      rating: 5,
      company: "CreativeStudio",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      role: "Tech Entrepreneur",
      avatar: "👨‍💼",
      testimonial: "Finally, a social platform that prioritizes meaningful conversations over noise. The AI-powered recommendations are spot on!",
      rating: 5,
      company: "TechFlow Inc",
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      role: "Digital Artist",
      avatar: "👩‍🎨",
      testimonial: "The design is beautiful and the platform is lightning fast. It's become my go-to place for sharing my work and connecting with fellow artists.",
      rating: 5,
      company: "ArtSpace Gallery",
    },
    {
      id: 4,
      name: "David Kim",
      role: "Influencer",
      avatar: "👨‍🚀",
      testimonial: "The analytics dashboard is incredible. I can track my engagement and growth like never before. Highly recommended!",
      rating: 5,
      company: "SocialGrow",
    },
    {
      id: 5,
      name: "Maya Patel",
      role: "Brand Manager",
      avatar: "👩‍💼",
      testimonial: "Managing multiple brand accounts has never been easier. The scheduling features and team collaboration tools are game-changers.",
      rating: 5,
      company: "BrandMaster",
    },
  ];

  const features = [
    {
      icon: "🚀",
      title: "Lightning Fast Performance",
      description: "Experience blazing-fast performance with our optimized infrastructure, CDN distribution, and real-time updates that keep you connected instantly.",
      gradient: "from-blue-500 to-cyan-500",
      details: ["99.9% uptime guarantee", "Global CDN network", "Real-time synchronization"],
    },
    {
      icon: "🔒",
      title: "Enterprise Security",
      description: "Your data is protected with military-grade encryption, two-factor authentication, and compliance with GDPR, CCPA, and SOC 2 standards.",
      gradient: "from-green-500 to-emerald-500",
      details: ["End-to-end encryption", "SOC 2 compliant", "GDPR & CCPA ready"],
    },
    {
      icon: "🎨",
      title: "Beautiful & Intuitive",
      description: "Enjoy a clean, modern interface designed by award-winning UI/UX experts for the best user experience across all devices and platforms.",
      gradient: "from-purple-500 to-pink-500",
      details: ["Award-winning design", "Dark/light themes", "Accessibility focused"],
    },
    {
      icon: "📱",
      title: "Mobile-First Design",
      description: "Seamlessly switch between devices with our fully responsive progressive web app that works offline and syncs across all your devices.",
      gradient: "from-orange-500 to-red-500",
      details: ["Progressive Web App", "Offline functionality", "Cross-device sync"],
    },
    {
      icon: "⚡",
      title: "Real-time Collaboration",
      description: "Stay connected with instant notifications, live updates, real-time messaging, and collaborative features that bring teams together.",
      gradient: "from-yellow-500 to-orange-500",
      details: ["Live notifications", "Team workspaces", "Real-time messaging"],
    },
    {
      icon: "🤖",
      title: "AI-Powered Intelligence",
      description: "Smart algorithms powered by machine learning help you discover relevant content, optimize posting times, and connect with your ideal audience.",
      gradient: "from-indigo-500 to-purple-500",
      details: ["Smart recommendations", "Optimal timing", "Audience insights"],
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Get detailed insights into your performance with comprehensive analytics, audience demographics, engagement metrics, and growth tracking.",
      gradient: "from-teal-500 to-blue-500",
      details: ["Detailed metrics", "Growth tracking", "Audience insights"],
    },
    {
      icon: "🌐",
      title: "Global Reach",
      description: "Connect with users worldwide through multi-language support, international payment processing, and localized content delivery.",
      gradient: "from-rose-500 to-pink-500",
      details: ["50+ languages", "Global payments", "Local CDN nodes"],
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 1,000 followers",
        "Basic analytics",
        "Standard support",
        "Mobile app access",
        "Basic customization",
      ],
      cta: "Get Started",
      popular: false,
      gradient: "from-gray-500 to-gray-600",
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Great for growing creators and small businesses",
      features: [
        "Unlimited followers",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "Team collaboration",
        "API access",
        "Advanced automation",
      ],
      cta: "Start Free Trial",
      popular: true,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large organizations and agencies",
      features: [
        "Everything in Pro",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment",
        "Advanced security",
        "Custom training",
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: "👥", suffix: "" },
    { number: "50K+", label: "Posts Shared", icon: "📝", suffix: "" },
    { number: "99.9%", label: "Uptime", icon: "⚡", suffix: "" },
    { number: "150+", label: "Countries", icon: "🌍", suffix: "" },
  ];

  const navItems = [
    { label: "Home", href: "hero" },
    { label: "Features", href: "features" },
    { label: "Pricing", href: "pricing" },
    { label: "Testimonials", href: "testimonials" },
    { label: "Contact", href: "contact" },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Cursor Follower */}
      <div 
        className="fixed w-4 h-4 bg-pink-500 rounded-full pointer-events-none z-40 mix-blend-difference transition-transform duration-150"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: `scale(${isLoading ? 2 : 1})`,
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection("hero")}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl text-gray-900">TweetApp</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-pink-500 ${
                    visibleSection === item.href ? "text-pink-500" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                disabled={isLoading}
                className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  isLoggedIn ? "Dashboard" : "Get Started"
                )}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="space-y-1">
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-2 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleGetStarted}
                  className="block w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 py-2 rounded-lg font-medium mt-4"
                >
                  {isLoggedIn ? "Dashboard" : "Get Started"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Hero Section */}
      <section id="hero" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />
          <motion.div 
            className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 4 }}
          />
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px] animate-pulse" />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center"
          style={{ opacity, scale }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Status Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white text-sm font-medium mb-8 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse" />
            <span className="group-hover:scale-105 transition-transform">
              {isLoggedIn ? "Welcome back! 🎉" : "Join 10,000+ active users 🚀"}
            </span>
          </motion.div>

          {/* Main Heading with Typewriter Effect */}
          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white mb-8 leading-tight"
            variants={itemVariants}
          >
            Connect.{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Share.
            </motion.span>{" "}
            <motion.span 
              className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Inspire.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl leading-relaxed"
            variants={itemVariants}
          >
            Join thousands of creators, entrepreneurs, and innovators sharing their stories on the most engaging social platform designed for authentic conversations, meaningful connections, and limitless creativity.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 mb-20"
            variants={itemVariants}
          >
            <motion.button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 disabled:opacity-50 min-w-[250px]"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    {isLoggedIn ? "Go to Dashboard" : "Start Your Journey"}
                    <svg 
                      className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.button 
              onClick={() => scrollToSection("features")}
              className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl hover:bg-white/20 min-w-[250px]"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Features
              <svg 
                className="ml-3 w-6 h-6 group-hover:rotate-45 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Enhanced Stats Section */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 max-w-4xl w-full"
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center group cursor-pointer"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {stat.icon}
                </div>
                <motion.div 
                  className="text-4xl sm:text-5xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-300 text-sm font-medium tracking-wider uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Action Hint with Enhanced Animation */}
          <motion.div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 1 }}
          >
            <motion.div 
              className="flex flex-col items-center text-white/60 cursor-pointer group"
              onClick={() => scrollToSection("features")}
              whileHover={{ y: -5 }}
            >
              <span className="text-sm mb-3 group-hover:text-white transition-colors">Discover More</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="group-hover:text-pink-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: Enhanced Features Section */}
      <section id="features" className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 font-medium text-sm mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              ✨ Powerful Features
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                Platform
              </span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the next generation of social networking with cutting-edge features designed for modern creators, businesses, and communities seeking authentic connections.
            </p>
          </motion.div>

          {/* Feature Tabs */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {["All", "Performance", "Security", "Design", "Analytics"].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === index
                    ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.slice(0, 8).map((feature, index) => (
              <motion.div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <motion.div 
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Feature Details */}
                <div className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {detail}
                    </div>
                  ))}
                </div>

                {/* Hover Effect */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => scrollToSection("pricing")}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore All Features
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: Pricing Section */}
      <section id="pricing" className="py-32 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include our core features with varying limits and advanced capabilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative bg-white rounded-3xl shadow-lg border-2 transition-all duration-300 overflow-hidden ${
                  plan.popular 
                    ? "border-pink-500 scale-105 shadow-2xl" 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={ { delay: index * 0.2 }}
                whileHover={{ y: plan.popular ? 0 : -5 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-center py-2 text-sm font-bold">
                    ⭐ Most Popular
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-6`}>
                    <span className="text-2xl text-white font-bold">
                      {plan.name.charAt(0)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-600 ml-2">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGetStarted}
                  >
                    {plan.cta}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Money Back Guarantee */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-6 bg-green-50 rounded-2xl px-8 py-4">
              <div className="text-3xl">💰</div>
              <div>
                <h4 className="font-bold text-green-800">30-Day Money-Back Guarantee</h4>
                <p className="text-green-600">Not satisfied? Get a full refund, no questions asked.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: Enhanced Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Thousands</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our amazing community has to say about their experience.
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 mb-8">
                  <div className="text-6xl mb-6">{testimonials[currentTestimonial].avatar}</div>
                  <blockquote className="text-2xl text-white leading-relaxed italic mb-8">
                    "{testimonials[currentTestimonial].testimonial}"
                  </blockquote>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-white">
                    <h4 className="font-bold text-lg">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-300">{testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-pink-500 scale-125"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Company Logos */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-center text-gray-400 mb-8">Trusted by leading companies worldwide</p>
            <div className="flex justify-center items-center space-x-12 opacity-50">
              {["🏢", "🚀", "💡", "🎨", "⚡", "🌟"].map((icon, index) => (
                <motion.div
                  key={index}
                  className="text-4xl filter grayscale hover:grayscale-0 transition-all duration-300"
                  whileHover={{ scale: 1.2 }}
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: Contact/Newsletter Section */}
      <section id="contact" className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 font-medium text-sm mb-6">
                📧 Stay Connected
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Social Experience</span>?
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join our newsletter to get the latest updates, exclusive features, and insider tips from our community of creators and innovators.
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-2xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300"
                    required
                  />
                  <motion.button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Subscribe Now
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500">
                  🔒 We respect your privacy. Unsubscribe at any time.
                </p>
              </form>

              {/* Benefits */}
              <div className="space-y-4">
                {[
                  "🚀 Early access to new features",
                  "📊 Exclusive analytics insights",
                  "🎯 Personalized growth tips",
                  "🎁 Special offers and discounts",
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="mr-3 text-lg">{benefit.split(" ")[0]}</span>
                    <span>{benefit.substring(2)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl p-8 text-white shadow-2xl">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Get Started Today</h3>
                    <p className="opacity-90">Join thousands of satisfied users</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span>Active Users</span>
                      <span className="font-bold">10,000+</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span>Posts Shared</span>
                      <span className="font-bold">50,000+</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span>Satisfaction Rate</span>
                      <span className="font-bold">99.9%</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-pink-400 rounded-full opacity-60"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Final CTA Section */}
          <motion.div
            className="text-center mt-32 pt-16 border-t border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Don't Wait. Your Community is Waiting.
            </h3>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Start building meaningful connections today with our powerful platform designed for the next generation of social networking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                onClick={handleGetStarted}
                className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Free Today"}
                <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
              
              <motion.button
                onClick={() => scrollToSection("features")}
                className="inline-flex items-center px-12 py-5 bg-white text-gray-900 font-bold rounded-2xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 text-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
                <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No setup fees
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                30-day free trial
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                24/7 support
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl">TweetApp</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Connecting creators, entrepreneurs, and communities through meaningful conversations and authentic relationships.
              </p>
              <div className="flex space-x-4">
                {["📘", "🐦", "📸", "💼", "📺"].map((icon, index) => (
                  <button
                    key={index}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TweetApp. All rights reserved. Built with ❤️ for creators everywhere.</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .bg-grid-white\/\[0\.05\] {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        
        .bg-grid-white\/\[0\.02\] {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}

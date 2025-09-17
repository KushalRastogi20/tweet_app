"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { verifyJWt } from "@/middleware/auth";
const AuthPage = () => {
  // State Management
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const router = useRouter();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  // Data Arrays
  const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany",
    "France", "Japan", "South Korea", "Singapore", "Netherlands", "Sweden",
    "Norway", "Denmark", "Switzerland", "New Zealand", "India", "Brazil",
    "Mexico", "Italy", "Spain", "Other"
  ];

  const occupations = [
    "Software Engineer", "Designer", "Product Manager", "Marketing Specialist",
    "Data Scientist", "Teacher", "Doctor", "Lawyer", "Entrepreneur", "Student",
    "Consultant", "Sales Representative", "Writer", "Artist", "Photographer",
    "Musician", "Chef", "Architect", "Engineer", "Other"
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "UX Designer",
      company: "TechCorp",
      avatar: "👩‍🎨",
      text: "TweetApp has revolutionized how I connect with my design community. The interface is intuitive and the networking opportunities are endless.",
      rating: 5
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      company: "StartupXYZ",
      avatar: "👨‍💻",
      text: "As a developer, I appreciate the clean architecture and smooth user experience. It's become my go-to platform for tech discussions.",
      rating: 5
    },
    {
      id: 3,
      name: "Elena Kowalski",
      role: "Marketing Director",
      company: "BrandFlow",
      avatar: "👩‍💼",
      text: "The analytics and engagement tools are phenomenal. I've grown my professional network by 300% in just three months.",
      rating: 5
    },
    {
      id: 4,
      name: "David Kim",
      role: "Entrepreneur",
      company: "InnovateLab",
      avatar: "👨‍🚀",
      text: "TweetApp helped me find co-founders, investors, and mentors. It's an essential tool for any serious entrepreneur.",
      rating: 5
    }
  ];

  const stats = [
    { label: "Active Users", value: "2.5M+", icon: "👥", color: "from-blue-400 to-blue-600" },
    { label: "Daily Posts", value: "850K+", icon: "📝", color: "from-green-400 to-green-600" },
    { label: "Countries", value: "195", icon: "🌍", color: "from-purple-400 to-purple-600" },
    { label: "User Rating", value: "4.9★", icon: "⭐", color: "from-yellow-400 to-yellow-600" }
  ];

  // Effects and Lifecycle
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth");
        const data = await response.data;
        if (data.isAuth) {
          router.push("/feed")
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    }
    checkAuth();
    setMounted(true);

    // Time updater
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Testimonial rotator
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    // Mouse tracker
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(timeInterval);
      clearInterval(testimonialInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Password strength checker
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Form validation
  useEffect(() => {
    const errors = {};

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (password && password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!isLogin && password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!isLogin && firstName && firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!isLogin && lastName && lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    if (!isLogin && username && username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [email, password, confirmPassword, firstName, lastName, username, isLogin]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Utility Functions
  const handleInputChange = useCallback((field, value) => {
    // Clear typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout for typing indicator
    const newTimeout = setTimeout(() => {
      setFocusedField("");
    }, 2000);
    setTypingTimeout(newTimeout);

    // Update field value
    switch (field) {
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'username': setUsername(value); break;
      case 'phoneNumber': setPhoneNumber(value); break;
      case 'dateOfBirth': setDateOfBirth(value); break;
      case 'gender': setGender(value); break;
      case 'country': setCountry(value); break;
      case 'city': setCity(value); break;
      case 'occupation': setOccupation(value); break;
      case 'bio': setBio(value); break;
      default: break;
    }
  }, [typingTimeout]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "bg-gray-300";
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-blue-500";
      case 5: return "bg-green-500";
      default: return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return "Enter password";
      case 1: return "Very weak";
      case 2: return "Weak";
      case 3: return "Fair";
      case 4: return "Good";
      case 5: return "Strong";
      default: return "";
    }
  };

  // Form Handlers
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Please fix the form errors before submitting");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await api.post("/user/login",
        {
          email,
          password
        },

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // const { token, user } = await response.json();
        // localStorage.setItem("token", token);
        // localStorage.setItem("user", JSON.stringify(user));

        setSuccess("Welcome back! Redirecting to your dashboard...");
        setShowSuccessModal(true);

        setTimeout(() => {
          router.push("/feed");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Please fix the form errors before submitting");
      return;
    }

    // if (!acceptTerms) {
    //   setError("You must accept the Terms of Service to continue");
    //   return;
    // }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('username', username);
      formData.append('phoneNumber', phoneNumber);
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('gender', gender);
      formData.append('country', country);
      formData.append('city', city);
      formData.append('occupation', occupation);
      formData.append('bio', bio);
      formData.append('acceptMarketing', acceptMarketing);

      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      // const response = await fetch("/api/user/register", {
      //   method: "POST",
      //   body: formData,
      // });
      const response = await api.post("/user/register",
        {
          email,
          password,

          firstName,
          lastName,
          username,
          phoneNumber,
          dateOfBirth,
          gender,
          country,
          city,
          occupation,
          bio,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (response.status === 201) {
        setSuccess("Account created successfully! Please check your email to verify your account.");
        setShowSuccessModal(true);

        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setUsername("");
        setPhoneNumber("");
        setDateOfBirth("");
        setGender("");
        setCountry("");
        setCity("");
        setOccupation("");
        setBio("");
        setProfilePicture(null);
        setAcceptTerms(false);
        setAcceptMarketing(false);

        setTimeout(() => {
          setIsLogin(true);
          setCurrentStep(1);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Connection error. Please check your internet and try again.");
    } finally {
      router.push("/feed");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);

    try {
      // Simulate social login delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(`${provider} login successful! Redirecting...`);
      setTimeout(() => {
        router.push("/feed");
      }, 1500);
    } catch (error) {
      setError(`${provider} login failed. Please try again.`);
    } finally {
      setSocialLoading("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }

      setProfilePicture(file);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render Step Content
  const renderSignupStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Personal Information</h3>
              <p className="text-sm text-slate-600">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Name *</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  onFocus={() => setFocusedField('firstName')}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.firstName ? 'border-red-300' : 'border-slate-300'
                    }`}
                  required
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Last Name *</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  onFocus={() => setFocusedField('lastName')}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.lastName ? 'border-red-300' : 'border-slate-300'
                    }`}
                  required
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Username *</label>
              <input
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                onFocus={() => setFocusedField('username')}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.username ? 'border-red-300' : 'border-slate-300'
                  }`}
                required
              />
              {formErrors.username && (
                <p className="text-xs text-red-600">{formErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address *</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.email ? 'border-red-300' : 'border-slate-300'
                  }`}
                required
              />
              {formErrors.email && (
                <p className="text-xs text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  onFocus={() => setFocusedField('phoneNumber')}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  onFocus={() => setFocusedField('dateOfBirth')}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Security & Location</h3>
              <p className="text-sm text-slate-600">Set up your password and location</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.password ? 'border-red-300' : 'border-slate-300'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Password strength:</span>
                    <span className="font-medium">{getPasswordStrengthText()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {formErrors.password && (
                <p className="text-xs text-red-600">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-xs text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                onFocus={() => setFocusedField('gender')}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Country</label>
                <select
                  value={country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  onFocus={() => setFocusedField('country')}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onFocus={() => setFocusedField('city')}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Profile & Preferences</h3>
              <p className="text-sm text-slate-600">Complete your profile setup</p>
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Profile Picture</label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                      <img
                        src={URL.createObjectURL(profilePicture)}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-white">👤</span>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Choose Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Occupation</label>
              <select
                value={occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                onFocus={() => setFocusedField('occupation')}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800"
              >
                <option value="">Select Occupation</option>
                {occupations.map((occupation) => (
                  <option key={occupation} value={occupation}>{occupation}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <textarea
                placeholder="Tell us about yourself... (optional)"
                value={bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                onFocus={() => setFocusedField('bio')}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 resize-none"
                maxLength={300}
              />
              <div className="text-right text-xs text-slate-500">{bio.length}/300</div>
            </div>

            {/* Terms and Marketing */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                  required
                />
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
                    Privacy Policy
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={acceptMarketing}
                  onChange={(e) => setAcceptMarketing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="text-sm text-slate-600">
                  I would like to receive marketing communications, product updates, and special offers via email.
                </span>
              </label>
            </div>

            {/* Success Preview */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <h4 className="font-semibold text-green-800">You're almost done!</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                After creating your account, you'll receive a verification email to activate your profile.
              </p>
              <div className="text-xs text-green-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>Email verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>👤</span>
                  <span>Complete profile setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🚀</span>
                  <span>Start connecting with others</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Dynamic Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
        }}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Success!</h3>
            <p className="text-slate-600">{success}</p>
          </div>
        </div>
      )}

      {/* Left Panel - Branding & Info */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Animated Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-2xl font-bold">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">TweetApp</h1>
                <p className="text-sm opacity-80">Connect • Share • Inspire</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Join the Future of
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Social Networking
                </span>
              </h2>
              <p className="text-lg opacity-90 leading-relaxed">
                Connect with millions of creators, professionals, and innovators. Share your stories, build meaningful relationships, and grow your network in our vibrant global community.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial Carousel */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-xl">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                  <div className="text-sm opacity-80">
                    {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
              <p className="text-sm opacity-90 italic mb-4">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="flex space-x-1">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>

            {/* Live Clock */}
            <div className="text-center opacity-80">
              <p className="text-sm">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs">
                {currentTime.toLocaleTimeString('en-US')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border max-w-sm transform transition-all duration-300 ${error
          ? "bg-red-500/90 text-white border-red-400/50 animate-bounce"
          : "bg-green-500/90 text-white border-green-400/50"
          }`}>
          <div className="flex items-center space-x-3">
            <div className="text-xl">{error ? "❌" : "✅"}</div>
            <div>
              <div className="font-medium text-sm">{error ? "Error" : "Success"}</div>
              <div className="text-sm opacity-90">{error || success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Right Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Form Container */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="text-center">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold text-slate-800">TweetApp</span>
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-slate-600">
                  {isLogin
                    ? "Please sign in to continue"
                    : "Join our amazing community today"
                  }
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="mt-8 relative">
                <div className="flex bg-white rounded-2xl p-2 shadow-inner border border-slate-200">
                  <div
                    className={`absolute top-2 bottom-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg transition-all duration-500 ease-out ${isLogin ? 'left-2 right-1/2 mr-1' : 'right-2 left-1/2 ml-1'
                      }`}
                  ></div>
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setCurrentStep(1);
                      setError("");
                      setSuccess("");
                    }}
                    className={`relative flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${isLogin ? "text-white" : "text-slate-600 hover:text-slate-800"
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      setCurrentStep(1);
                      setError("");
                      setSuccess("");
                    }}
                    className={`relative flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${!isLogin ? "text-white" : "text-slate-600 hover:text-slate-800"
                      }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Step Indicator for Signup */}
              {!isLogin && (
                <div className="flex justify-center space-x-2 mt-6">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300 ${step < currentStep
                        ? "bg-green-500 text-white"
                        : step === currentStep
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : "bg-slate-200 text-slate-500"
                        }`}
                    >
                      {step < currentStep ? "✓" : step}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Content */}
            <div className="p-8" ref={formRef}>
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
                {isLogin ? (
                  // Login Form
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.email ? 'border-red-300' : 'border-slate-300'
                          }`}
                        required
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${formErrors.password ? 'border-red-300' : 'border-slate-300'
                            }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="text-xs text-red-600">{formErrors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                        />
                        <span className="text-sm text-slate-600">Remember me for 30 days</span>
                      </label>
                      <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                ) : (
                  // Signup Form Steps
                  renderSignupStep()
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  {isLogin ? (
                    <button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Signing you in...</span>
                        </>
                      ) : (
                        <span>Sign In to Your Account</span>
                      )}
                    </button>
                  ) : (
                    <div className="flex space-x-4">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
                        >
                          Previous
                        </button>
                      )}

                      <button
                        type={currentStep === 3 ? "submit" : "button"}
                        onClick={currentStep < 3 ? nextStep : undefined}
                        disabled={isLoading || (currentStep === 3 && (!isFormValid || !acceptTerms))}
                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Creating your account...</span>
                          </>
                        ) : (
                          <span>{currentStep === 3 ? "Create My Account" : `Next Step (${currentStep}/3)`}</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Social Login - Only for Sign In */}
              {isLogin && (
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-slate-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      { name: "Google", icon: "🔍", bgColor: "bg-red-500 hover:bg-red-600" },
                      { name: "Facebook", icon: "📘", bgColor: "bg-blue-500 hover:bg-blue-600" },
                      { name: "Twitter", icon: "🐦", bgColor: "bg-sky-500 hover:bg-sky-600" }
                    ].map((provider) => (
                      <button
                        key={provider.name}
                        type="button"
                        onClick={() => handleSocialLogin(provider.name)}
                        disabled={socialLoading === provider.name}
                        className={`w-full py-3 px-4 ${provider.bgColor} text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center justify-center text-lg`}
                      >
                        {socialLoading === provider.name ? (
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          provider.icon
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-600 mb-4">
                  {isLogin ? "New to TweetApp?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setCurrentStep(1);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                  >
                    {isLogin ? "Create an account" : "Sign in here"}
                  </button>
                </p>

                <div className="flex justify-center space-x-6 text-xs text-slate-400 mb-4">
                  <a href="#" className="hover:text-slate-600 transition-colors">Help Center</a>
                  <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
                </div>

                <p className="text-xs text-slate-400">
                  © 2025 TweetApp. Designed with ❤️ for creators worldwide.
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-slate-400">
              <span>🔒</span>
              <span>Your data is protected with bank-level security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

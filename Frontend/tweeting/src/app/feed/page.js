"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";

const Feed = () => {
  // Core State Management
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [username, setUsername] = useState("Guest");
  const [user, setUser] = useState(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState("home");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewTweetModal, setShowNewTweetModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Tweet Features
  const [selectedTweet, setSelectedTweet] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [likedTweets, setLikedTweets] = useState(new Set());
  const [retweetedTweets, setRetweetedTweets] = useState(new Set());
  const [bookmarkedTweets, setBookmarkedTweets] = useState(new Set());
  const [followingUsers, setFollowingUsers] = useState(new Set());
  
  // Advanced Features
  const [tweetImages, setTweetImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Performance & UX
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [readTweets, setReadTweets] = useState(new Set());
  const [tweetAnalytics, setTweetAnalytics] = useState({});
  
  const router = useRouter();
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const tweetContainerRef = useRef(null);
  const observerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Emoji data
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "🎉", "🎊", "🎈", "🎁", "🎀", "🎂", "🍰", "🧁", "🍭", "🍬",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
    "🔥", "💯", "✨", "🌟", "⭐", "🌙", "☀️", "🌈", "🌸", "🌺"
  ];

  // Trending topics data
  const defaultTrendingTopics = [
    { tag: "#TechNews", tweets: "45.2K" },
    { tag: "#WebDevelopment", tweets: "32.8K" },
    { tag: "#AI", tweets: "28.5K" },
    { tag: "#Startup", tweets: "21.3K" },
    { tag: "#Design", tweets: "19.7K" },
    { tag: "#Programming", tweets: "18.9K" },
    { tag: "#Innovation", tweets: "16.4K" },
    { tag: "#Digital", tweets: "15.2K" },
    { tag: "#Future", tweets: "13.8K" },
    { tag: "#Technology", tweets: "12.6K" }
  ];

  // Utility Functions
  const formatTimeAgo = (date) => {
    const now = new Date();
    const tweetDate = new Date(date);
    const diffInSeconds = Math.floor((now - tweetDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return tweetDate.toLocaleDateString();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const generateRandomStats = () => ({
    likes: Math.floor(Math.random() * 1000) + 1,
    retweets: Math.floor(Math.random() * 500) + 1,
    replies: Math.floor(Math.random() * 200) + 1,
    views: Math.floor(Math.random() * 10000) + 100
  });

  const detectHashtags = (text) => {
    return text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  };

  const detectMentions = (text) => {
    return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  };

  const detectLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="link">$1</a>');
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUsername("Guest");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await res.json();
        setUser(userData);
        setUsername(userData.username || "Guest");
        setFollowingUsers(new Set(userData.following || []));
        setLikedTweets(new Set(userData.likedTweets || []));
        setBookmarkedTweets(new Set(userData.bookmarkedTweets || []));
        
        // Set up notifications
        const mockNotifications = [
          { id: 1, type: "like", user: "alice_dev", content: "liked your tweet", time: new Date(Date.now() - 300000) },
          { id: 2, type: "follow", user: "tech_guru", content: "started following you", time: new Date(Date.now() - 600000) },
          { id: 3, type: "retweet", user: "design_master", content: "retweeted your post", time: new Date(Date.now() - 900000) },
          { id: 4, type: "reply", user: "code_ninja", content: "replied to your tweet", time: new Date(Date.now() - 1200000) }
        ];
        setNotifications(mockNotifications);

      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername("Guest");
      }
    };

    fetchUserData();
  }, []);

  // Fetch tweets with enhanced error handling
  const fetchTweets = useCallback(async (pageNum = 1, retryAttempt = 0) => {
    try {
      const res = await api(`/tweets/fetch?page=${pageNum}&limit=10`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();

      if (!Array.isArray(data)) {
        // Generate mock data if API fails
        const mockTweets = Array.from({ length: 20 }, (_, index) => ({
          _id: `mock_${pageNum}_${index}`,
          content: [
            "Just finished an amazing coding session! 🚀 Working on a new React project with some incredible features. Can't wait to share it with the community! #ReactJS #WebDev",
            "Beautiful sunset today 🌅 Sometimes it's important to step away from the screen and appreciate the world around us. Nature is the best inspiration for creativity! #sunset #nature",
            "Coffee + Code = Perfect Morning ☕ Starting the day with a fresh cup and diving into some challenging algorithms. What's your favorite way to start coding sessions?",
            "Excited to announce our new product launch! 🎉 We've been working on this for months and finally ready to share it with the world. Innovation never stops! #startup #tech",
            "Learning something new every day keeps the mind sharp 🧠 Today diving deep into machine learning concepts. The future is incredibly exciting! #AI #MachineLearning",
            "Great meeting with the team today! 👥 Collaboration and communication are key to building amazing products. Grateful for such talented colleagues! #teamwork",
            "Weekend project: building a personal dashboard 📊 Sometimes the best learning happens when you're solving your own problems. Code, iterate, improve! #sideproject",
            "Reading an incredible book on design principles 📚 Good design isn't just about how it looks, but how it works. Function and form in perfect harmony! #design #UX",
            "Debugging can be frustrating but so rewarding when you find the solution 🐛➡️✅ Every bug is a learning opportunity in disguise! #debugging #programming",
            "Grateful for this amazing developer community 💙 The support, knowledge sharing, and collaboration here is unmatched. We're building the future together! #community"
          ][index % 10],
          user: {
            username: [
              "techEnthusiast", "designGuru", "codeNinja", "startupFounder", "mlExpert",
              "fullStackDev", "uxDesigner", "productManager", "devOpsEngineer", "dataScientist"
            ][index % 10],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
            verified: Math.random() > 0.7,
            followers: Math.floor(Math.random() * 100000) + 1000
          },
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 1,
          retweets: Math.floor(Math.random() * 200) + 1,
          replies: Math.floor(Math.random() * 100) + 1,
          views: Math.floor(Math.random() * 5000) + 100,
          images: Math.random() > 0.7 ? [`https://picsum.photos/400/300?random=${index}`] : [],
          hashtags: ["#tech", "#coding", "#design", "#startup", "#ai"].filter(() => Math.random() > 0.6)
        }));
        
        return mockTweets;
      }

      // Enhance real data with additional properties
      const enhancedData = data.map(tweet => ({
        ...tweet,
        ...generateRandomStats(),
        views: generateRandomStats().views,
        hashtags: tweet.content.match(/#\w+/g) || [],
        mentions: tweet.content.match(/@\w+/g) || []
      }));

      return enhancedData;
    } catch (error) {
      console.error("Error fetching tweets:", error);
      
      if (retryAttempt < 3) {
        setTimeout(() => {
          fetchTweets(pageNum, retryAttempt + 1);
        }, 1000 * (retryAttempt + 1));
        return [];
      }
      
      setError("Unable to load tweets. Please check your connection.");
      return [];
    }
  }, []);

  // Initial tweet loading
  useEffect(() => {
    const loadInitialTweets = async () => {
      setLoading(true);
      const initialTweets = await fetchTweets(1);
      setTweets(initialTweets);
      setLoading(false);
      
      // Set up trending topics
      setTrendingTopics(defaultTrendingTopics);
      
      // Mock suggested users
      const mockSuggestedUsers = [
        { id: 1, username: "elonmusk", name: "Elon Musk", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elon", verified: true, followers: "100M" },
        { id: 2, username: "sundarpichai", name: "Sundar Pichai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sundar", verified: true, followers: "5.2M" },
        { id: 3, username: "satyanadella", name: "Satya Nadella", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=satya", verified: true, followers: "3.8M" },
        { id: 4, username: "tim_cook", name: "Tim Cook", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tim", verified: true, followers: "12.9M" },
        { id: 5, username: "jeffbezos", name: "Jeff Bezos", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jeff", verified: true, followers: "4.1M" }
      ];
      setSuggestedUsers(mockSuggestedUsers);
    };

    loadInitialTweets();
  }, [fetchTweets]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const loadMoreTweets = async () => {
            const newTweets = await fetchTweets(page + 1);
            if (newTweets.length > 0) {
              setTweets(prev => {
                const existingIds = new Set(prev.map(t => t._id));
                const uniqueNewTweets = newTweets.filter(t => !existingIds.has(t._id));
                return [...prev, ...uniqueNewTweets];
              });
              setPage(prev => prev + 1);
            } else {
              setHasMore(false);
            }
          };
          loadMoreTweets();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchTweets, hasMore, loading, page]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => setLastActivityTime(Date.now());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Tweet submission
  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && tweetImages.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to post tweets");
      return;
    }

    setPostLoading(true);
    setTypingIndicator(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      
      tweetImages.forEach((image, index) => {
        formData.append('images', image);
      });
      
      if (audioBlob) {
        formData.append('audio', audioBlob, 'voice-note.webm');
      }

      const res = await api.post("/tweet/create", 
       
        formData,
  );

      if (res.ok) {
        const { tweet } = await res.json();
        const enhancedTweet = {
          ...tweet,
          ...generateRandomStats(),
          user: user || { username, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` }
        };
        
        setTweets(prev => [enhancedTweet, ...prev]);
        setContent("");
        setTweetImages([]);
        setAudioBlob(null);
        setSuccess("Tweet posted successfully!");
        setShowNewTweetModal(false);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error posting tweet");
      }
    } catch (error) {
      console.error("Tweet submission error:", error);
      setError("Something went wrong while posting the tweet");
    } finally {
      setPostLoading(false);
      setTypingIndicator(false);
    }
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + tweetImages.length > 4) {
      setError("Maximum 4 images allowed");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please upload only image files");
        return false;
      }
      return true;
    });

    setTweetImages(prev => [...prev, ...validFiles]);
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setError("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Tweet interactions
  const handleLike = async (tweetId) => {
    const isLiked = likedTweets.has(tweetId);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/auth/tweets/${tweetId}/${isLiked ? 'unlike' : 'like'}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const newLikedTweets = new Set(likedTweets);
        if (isLiked) {
          newLikedTweets.delete(tweetId);
        } else {
          newLikedTweets.add(tweetId);
        }
        setLikedTweets(newLikedTweets);
        
        // Update tweet likes count
        setTweets(prev => prev.map(tweet => 
          tweet._id === tweetId 
            ? { ...tweet, likes: tweet.likes + (isLiked ? -1 : 1) }
            : tweet
        ));
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleRetweet = async (tweetId) => {
    const isRetweeted = retweetedTweets.has(tweetId);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/auth/tweets/${tweetId}/${isRetweeted ? 'unretweet' : 'retweet'}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const newRetweetedTweets = new Set(retweetedTweets);
        if (isRetweeted) {
          newRetweetedTweets.delete(tweetId);
        } else {
          newRetweetedTweets.add(tweetId);
        }
        setRetweetedTweets(newRetweetedTweets);
        
        // Update tweet retweets count
        setTweets(prev => prev.map(tweet => 
          tweet._id === tweetId 
            ? { ...tweet, retweets: tweet.retweets + (isRetweeted ? -1 : 1) }
            : tweet
        ));
      }
    } catch (error) {
      console.error("Retweet error:", error);
    }
  };

  const handleBookmark = async (tweetId) => {
    const isBookmarked = bookmarkedTweets.has(tweetId);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/auth/tweets/${tweetId}/${isBookmarked ? 'unbookmark' : 'bookmark'}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const newBookmarkedTweets = new Set(bookmarkedTweets);
        if (isBookmarked) {
          newBookmarkedTweets.delete(tweetId);
        } else {
          newBookmarkedTweets.add(tweetId);
        }
        setBookmarkedTweets(newBookmarkedTweets);
        setSuccess(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  const handleReply = (tweet) => {
    setSelectedTweet(tweet);
    setShowReplyModal(true);
  };

  const submitReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/auth/tweets/${selectedTweet._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        setSuccess("Reply posted successfully!");
        setReplyContent("");
        setShowReplyModal(false);
        
        // Update replies count
        setTweets(prev => prev.map(tweet => 
          tweet._id === selectedTweet._id 
            ? { ...tweet, replies: tweet.replies + 1 }
            : tweet
        ));
      }
    } catch (error) {
      console.error("Reply error:", error);
      setError("Failed to post reply");
    }
  };

  // Follow/Unfollow user
  const handleFollow = async (userId) => {
    const isFollowing = followingUsers.has(userId);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/auth/users/${userId}/${isFollowing ? 'unfollow' : 'follow'}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const newFollowingUsers = new Set(followingUsers);
        if (isFollowing) {
          newFollowingUsers.delete(userId);
        } else {
          newFollowingUsers.add(userId);
        }
        setFollowingUsers(newFollowingUsers);
        setSuccess(isFollowing ? "Unfollowed user" : "Following user");
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/auth/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results);
      } else {
        // Mock search results
        const mockResults = tweets.filter(tweet => 
          tweet.content.toLowerCase().includes(query.toLowerCase()) ||
          tweet.user.username.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(mockResults);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Memoized components for performance
  const memoizedTweets = useMemo(() => {
    return tweets.map((tweet) => (
      <div key={tweet._id} className={`tweet-card ${darkMode ? 'dark' : ''} ${readTweets.has(tweet._id) ? 'read' : ''}`}>
        {/* Tweet Header */}
        <div className="tweet-header">
          <div className="user-info">
            <img 
              src={tweet.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.user?.username}`} 
              alt={tweet.user?.username}
              className="user-avatar"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.user?.username}`;
              }}
            />
            <div className="user-details">
              <div className="user-name-row">
                <span className="username">{tweet.user?.username}</span>
                {tweet.user?.verified && <span className="verified-badge">✓</span>}
                <span className="tweet-time">• {formatTimeAgo(tweet.createdAt)}</span>
              </div>
              {tweet.user?.followers && (
                <span className="follower-count">{formatNumber(tweet.user.followers)} followers</span>
              )}
            </div>
          </div>
          
          <div className="tweet-menu">
            <button 
              className="menu-button"
              onClick={() => handleBookmark(tweet._id)}
            >
              {bookmarkedTweets.has(tweet._id) ? "🔖" : "📑"}
            </button>
          </div>
        </div>

        {/* Tweet Content */}
        <div className="tweet-content">
          <div 
            className="tweet-text"
            dangerouslySetInnerHTML={{
              __html: detectLinks(detectMentions(detectHashtags(tweet.content)))
            }}
          />
          
          {/* Tweet Images */}
          {tweet.images && tweet.images.length > 0 && (
            <div className={`tweet-images grid-${Math.min(tweet.images.length, 4)}`}>
              {tweet.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="Tweet image"
                  className="tweet-image"
                  onClick={() => {
                    setSelectedImage(image);
                    setShowImageModal(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* Tweet Hashtags */}
          {tweet.hashtags && tweet.hashtags.length > 0 && (
            <div className="tweet-hashtags">
              {tweet.hashtags.map((hashtag, index) => (
                <span key={index} className="hashtag-pill">{hashtag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tweet Stats */}
        <div className="tweet-stats">
          <span className="stat-item">
            <span className="stat-icon">👁️</span>
            {formatNumber(tweet.views || 0)}
          </span>
        </div>

        {/* Tweet Actions */}
        <div className="tweet-actions">
          <button 
            className={`action-button reply ${selectedTweet?._id === tweet._id ? 'active' : ''}`}
            onClick={() => handleReply(tweet)}
          >
            <span className="action-icon">💬</span>
            <span className="action-count">{formatNumber(tweet.replies || 0)}</span>
          </button>

          <button 
            className={`action-button retweet ${retweetedTweets.has(tweet._id) ? 'active' : ''}`}
            onClick={() => handleRetweet(tweet._id)}
          >
            <span className="action-icon">🔄</span>
            <span className="action-count">{formatNumber(tweet.retweets || 0)}</span>
          </button>

          <button 
            className={`action-button like ${likedTweets.has(tweet._id) ? 'active' : ''}`}
            onClick={() => handleLike(tweet._id)}
          >
            <span className="action-icon">{likedTweets.has(tweet._id) ? '❤️' : '🤍'}</span>
            <span className="action-count">{formatNumber(tweet.likes || 0)}</span>
          </button>

          <button 
            className="action-button share"
            onClick={() => {
              navigator.share?.({ 
                title: `Tweet by ${tweet.user?.username}`, 
                text: tweet.content,
                url: window.location.href 
              }) || navigator.clipboard.writeText(`${tweet.content} - ${window.location.href}`);
              setSuccess("Link copied to clipboard!");
            }}
          >
            <span className="action-icon">📤</span>
          </button>
        </div>
      </div>
    ));
  }, [tweets, likedTweets, retweetedTweets, bookmarkedTweets, readTweets, darkMode]);

  if (loading && tweets.length === 0) {
    return (
      <div className={`loading-container ${darkMode ? 'dark' : ''}`}>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading your feed...</p>
      </div>
    );
  }

  return (
    <div className={`feed-container ${darkMode ? 'dark' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <span>🔴 You're offline. Some features may not be available.</span>
        </div>
      )}

      {/* Status Messages */}
      {(error || success) && (
        <div className={`status-message ${error ? 'error' : 'success'}`}>
          <div className="status-content">
            <span className="status-icon">{error ? '❌' : '✅'}</span>
            <span className="status-text">{error || success}</span>
            <button 
              className="status-close"
              onClick={() => {
                setError("");
                setSuccess("");
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">T</div>
            {!sidebarCollapsed && <span className="app-name">TweetApp</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Profile Section */}
        <div className="user-profile-sidebar">
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
            alt="User" 
            className="user-avatar-sidebar"
          />
          {!sidebarCollapsed && (
            <div className="user-info-sidebar">
              <h3 className="username-sidebar">{username}</h3>
              <p className="user-stats">
                {user?.followers || Math.floor(Math.random() * 1000)} followers • {user?.following || Math.floor(Math.random() * 500)} following
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <button 
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <span className="nav-icon">🏠</span>
              {!sidebarCollapsed && <span className="nav-label">Home</span>}
            </button>

            <button 
              className={`nav-item ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              <span className="nav-icon">🔍</span>
              {!sidebarCollapsed && <span className="nav-label">Explore</span>}
            </button>

            <button 
              className={`nav-item ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="nav-icon">🔔</span>
              {!sidebarCollapsed && <span className="nav-label">Notifications</span>}
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>

            <button 
              className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <span className="nav-icon">💬</span>
              {!sidebarCollapsed && <span className="nav-label">Messages</span>}
            </button>

            <button 
              className={`nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              <span className="nav-icon">🔖</span>
              {!sidebarCollapsed && <span className="nav-label">Bookmarks</span>}
            </button>

            <button 
              className="nav-item"
              onClick={() => setShowProfileModal(true)}
            >
              <span className="nav-icon">👤</span>
              {!sidebarCollapsed && <span className="nav-label">Profile</span>}
            </button>
          </div>

          <div className="nav-section">
            <button 
              className="nav-item"
              onClick={() => setShowSettingsModal(true)}
            >
              <span className="nav-icon">⚙️</span>
              {!sidebarCollapsed && <span className="nav-label">Settings</span>}
            </button>

            <button 
              className="nav-item logout"
              onClick={handleLogout}
            >
              <span className="nav-icon">🚪</span>
              {!sidebarCollapsed && <span className="nav-label">Logout</span>}
            </button>
          </div>
        </nav>

        {/* Tweet Button */}
        <button 
          className={`tweet-button-sidebar ${sidebarCollapsed ? 'icon-only' : ''}`}
          onClick={() => setShowNewTweetModal(true)}
        >
          <span className="tweet-icon">✍️</span>
          {!sidebarCollapsed && <span className="tweet-text">Tweet</span>}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header */}
        <div className="main-header">
          <div className="header-content">
            <h2 className="header-title">
              {activeTab === 'home' && 'Home'}
              {activeTab === 'explore' && 'Explore'}
              {activeTab === 'messages' && 'Messages'}
              {activeTab === 'bookmarks' && 'Bookmarks'}
            </h2>
            
            {/* Search Bar */}
            <div className="search-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tweets, users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => setShowSearch(true)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
              
              {showSearch && searchQuery && (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 5).map((result) => (
                      <div key={result._id} className="search-result-item">
                        <img 
                          src={result.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user?.username}`}
                          alt={result.user?.username}
                          className="search-result-avatar"
                        />
                        <div className="search-result-content">
                          <span className="search-result-username">{result.user?.username}</span>
                          <p className="search-result-text">{result.content.substring(0, 100)}...</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-search-results">No results found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tweet Compose Form */}
        {activeTab === 'home' && (
          <div className="compose-tweet">
            <form onSubmit={handleTweetSubmit} className="tweet-form">
              <div className="compose-header">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                  alt="Your avatar"
                  className="compose-avatar"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening?"
                  className="compose-textarea"
                  maxLength={280}
                />
              </div>

              {/* Image Previews */}
              {tweetImages.length > 0 && (
                <div className="image-previews">
                  {tweetImages.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt="Preview"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => setTweetImages(prev => prev.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Preview */}
              {audioBlob && (
                <div className="audio-preview">
                  <audio ref={audioRef} controls src={URL.createObjectURL(audioBlob)} />
                  <button
                    type="button"
                    className="remove-audio"
                    onClick={() => setAudioBlob(null)}
                  >
                    Remove audio
                  </button>
                </div>
              )}

              <div className="compose-actions">
                <div className="media-buttons">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />
                  
                  <button
                    type="button"
                    className="media-button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Add images"
                  >
                    📷
                  </button>

                  <button
                    type="button"
                    className={`media-button ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    title={isRecording ? "Stop recording" : "Record voice note"}
                  >
                    {isRecording ? '⏹️' : '🎤'}
                  </button>

                  <button
                    type="button"
                    className="media-button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Add emoji"
                  >
                    😊
                  </button>
                </div>

                <div className="tweet-controls">
                  <div className="character-count">
                    <span className={content.length > 260 ? 'warning' : content.length > 240 ? 'caution' : ''}>
                      {280 - content.length}
                    </span>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="tweet-submit-button"
                    disabled={postLoading || (!content.trim() && tweetImages.length === 0)}
                  >
                    {postLoading ? (
                      <div className="button-spinner"></div>
                    ) : (
                      'Tweet'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="emoji-picker">
                <div className="emoji-grid">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      className="emoji-button"
                      onClick={() => {
                        setContent(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tweets Feed */}
        <div className="tweets-feed" ref={tweetContainerRef}>
          {activeTab === 'home' && (
            <div className="tweets-container">
              {tweets.length === 0 ? (
                <div className="empty-feed">
                  <div className="empty-icon">📝</div>
                  <h3>No tweets yet</h3>
                  <p>Start following people or post your first tweet!</p>
                </div>
              ) : (
                <>
                  {memoizedTweets}
                  
                  {/* Loading More Indicator */}
                  {hasMore && (
                    <div ref={observerRef} className="load-more-indicator">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <p>Loading more tweets...</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Explore Tab */}
          {activeTab === 'explore' && (
            <div className="explore-content">
              <h3>Trending Topics</h3>
              <div className="trending-topics">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="trending-item">
                    <span className="trending-tag">{topic.tag}</span>
                    <span className="trending-count">{topic.tweets} tweets</span>
                  </div>
                ))}
              </div>

              <h3>Suggested Users</h3>
              <div className="suggested-users">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="suggested-user">
                    <img src={user.avatar} alt={user.username} className="suggested-avatar" />
                    <div className="suggested-info">
                      <div className="suggested-name">
                        <span className="suggested-username">{user.username}</span>
                        {user.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <span className="suggested-followers">{user.followers} followers</span>
                    </div>
                    <button 
                      className={`follow-button ${followingUsers.has(user.id) ? 'following' : ''}`}
                      onClick={() => handleFollow(user.id)}
                    >
                      {followingUsers.has(user.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="bookmarks-content">
              <h3>Your Bookmarks</h3>
              {Array.from(bookmarkedTweets).length === 0 ? (
                <div className="empty-bookmarks">
                  <div className="empty-icon">🔖</div>
                  <h3>No bookmarks yet</h3>
                  <p>Bookmark tweets to read them later</p>
                </div>
              ) : (
                <div className="bookmarked-tweets">
                  {tweets
                    .filter(tweet => bookmarkedTweets.has(tweet._id))
                    .map(tweet => (
                      <div key={tweet._id} className="bookmarked-tweet">
                        {/* Render bookmarked tweet similar to regular tweet */}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        {/* What's Happening */}
        <div className="sidebar-widget">
          <h3 className="widget-title">What's happening</h3>
          <div className="trending-news">
            {[
              { title: "React 19 Released", category: "Technology", tweets: "15.2K" },
              { title: "AI Revolution", category: "Tech News", tweets: "8.7K" },
              { title: "Climate Summit 2025", category: "World News", tweets: "12.1K" },
              { title: "Space Mission Launch", category: "Science", tweets: "6.4K" }
            ].map((news, index) => (
              <div key={index} className="news-item">
                <span className="news-category">{news.category}</span>
                <h4 className="news-title">{news.title}</h4>
                <span className="news-tweets">{news.tweets} Tweets</span>
              </div>
            ))}
          </div>
        </div>

        {/* Who to Follow */}
        <div className="sidebar-widget">
          <h3 className="widget-title">Who to follow</h3>
          <div className="follow-suggestions">
            {suggestedUsers.slice(0, 3).map((user) => (
              <div key={user.id} className="follow-suggestion">
                <img src={user.avatar} alt={user.username} className="suggestion-avatar" />
                <div className="suggestion-info">
                  <div className="suggestion-name">
                    <span className="suggestion-username">{user.username}</span>
                    {user.verified && <span className="verified-badge">✓</span>}
                  </div>
                  <span className="suggestion-handle">@{user.username}</span>
                </div>
                <button 
                  className={`mini-follow-button ${followingUsers.has(user.id) ? 'following' : ''}`}
                  onClick={() => handleFollow(user.id)}
                >
                  {followingUsers.has(user.id) ? '✓' : '+'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
            <a href="#">Accessibility</a>
            <a href="#">Ads info</a>
          </div>
          <p className="copyright">© 2025 TweetApp, Inc.</p>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button 
              className="close-notifications"
              onClick={() => setShowNotifications(false)}
            >
              ×
            </button>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notifications-icon">🔔</span>
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-icon">
                    {notification.type === 'like' && '❤️'}
                    {notification.type === 'retweet' && '🔄'}
                    {notification.type === 'follow' && '👤'}
                    {notification.type === 'reply' && '💬'}
                  </div>
                  <div className="notification-content">
                    <p>
                      <strong>{notification.user}</strong> {notification.content}
                    </p>
                    <span className="notification-time">{formatTimeAgo(notification.time)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Profile</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-info">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                  alt="Profile"
                  className="profile-modal-avatar"
                />
                <div className="profile-details">
                  <h3>{user?.name || username}</h3>
                  <p>@{username}</p>
                  <div className="profile-stats">
                    <span><strong>{user?.following || 0}</strong> Following</span>
                    <span><strong>{user?.followers || 0}</strong> Followers</span>
                    <span><strong>{tweets.filter(t => t.user?.username === username).length}</strong> Tweets</span>
                  </div>
                </div>
              </div>
              <div className="profile-bio">
                <p>{user?.bio || "Welcome to my profile!"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="modal-close" onClick={() => setShowSettingsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="settings-section">
                <h3>Appearance</h3>
                <div className="setting-item">
                  <label className="setting-label">
                    <span>Dark Mode</span>
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={toggleDarkMode}
                      className="setting-toggle"
                    />
                  </label>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Privacy</h3>
                <div className="setting-item">
                  <label className="setting-label">
                    <span>Private Account</span>
                    <input
                      type="checkbox"
                      className="setting-toggle"
                    />
                  </label>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Notifications</h3>
                <div className="setting-item">
                  <label className="setting-label">
                    <span>Push Notifications</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="setting-toggle"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedTweet && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content reply-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reply to {selectedTweet.user?.username}</h2>
              <button className="modal-close" onClick={() => setShowReplyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="original-tweet">
                <div className="tweet-user">
                  <img 
                    src={selectedTweet.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTweet.user?.username}`}
                    alt={selectedTweet.user?.username}
                    className="reply-user-avatar"
                  />
                  <span className="reply-username">{selectedTweet.user?.username}</span>
                </div>
                <p className="reply-original-content">{selectedTweet.content}</p>
              </div>
              
              <div className="reply-compose">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                  alt="Your avatar"
                  className="reply-compose-avatar"
                />
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Tweet your reply"
                  className="reply-textarea"
                  maxLength={280}
                />
              </div>
              
              <div className="reply-actions">
                <div className="reply-character-count">
                  {280 - replyContent.length}
                </div>
                <button 
                  className="reply-submit-button"
                  onClick={submitReply}
                  disabled={!replyContent.trim()}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="modal-overlay image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-content">
            <button className="image-modal-close" onClick={() => setShowImageModal(false)}>×</button>
            <img src={selectedImage} alt="Full size" className="modal-image" />
          </div>
        </div>
      )}

      <style jsx>{`
        .feed-container {
          display: grid;
          grid-template-columns: 250px 1fr 300px;
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          transition: all 0.3s ease;
        }

        .feed-container.dark {
          background-color: #0f172a;
          color: #f1f5f9;
        }

        .feed-container.sidebar-collapsed {
          grid-template-columns: 70px 1fr 300px;
        }

        .offline-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ef4444;
          color: white;
          padding: 0.5rem;
          text-align: center;
          z-index: 1000;
          font-size: 0.875rem;
        }

        .status-message {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1000;
          border-radius: 0.75rem;
          shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          animation: slideIn 0.3s ease;
        }

        .status-message.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .status-message.success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .status-content {
          display: flex;
          align-items: center;
          padding: 1rem;
          gap: 0.75rem;
        }

        .status-icon {
          font-size: 1.25rem;
        }

        .status-text {
          flex: 1;
          font-weight: 500;
        }

        .status-close {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .status-close:hover {
          opacity: 1;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Sidebar Styles */
        .sidebar {
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 1rem;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          transition: all 0.3s ease;
        }

        .dark .sidebar {
          background: #1e293b;
          border-color: #334155;
        }

        .sidebar.collapsed {
          padding: 1rem 0.5rem;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .app-name {
          font-weight: 700;
          font-size: 1.25rem;
          color: #1e293b;
        }

        .dark .app-name {
          color: #f1f5f9;
        }

        .sidebar-toggle {
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dark .sidebar-toggle {
          border-color: #334155;
          color: #f1f5f9;
        }

        .sidebar-toggle:hover {
          background: #f1f5f9;
        }

        .dark .sidebar-toggle:hover {
          background: #334155;
        }

        .user-profile-sidebar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 1rem;
          margin-bottom: 2rem;
        }

        .dark .user-profile-sidebar {
          background: #334155;
        }

        .user-avatar-sidebar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-info-sidebar {
          flex: 1;
          min-width: 0;
        }

        .username-sidebar {
          font-weight: 600;
          font-size: 1rem;
          margin: 0;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dark .username-sidebar {
          color: #f1f5f9;
        }

        .user-stats {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          position: relative;
          font-size: 1rem;
          color: #475569;
        }

        .dark .nav-item {
          color: #cbd5e1;
        }

        .nav-item:hover {
          background: #f1f5f9;
        }

        .dark .nav-item:hover {
          background: #334155;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .nav-item.logout {
          color: #ef4444;
          margin-top: 1rem;
        }

        .nav-item.logout:hover {
          background: #fef2f2;
        }

        .dark .nav-item.logout:hover {
          background: #450a0a;
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 1.5rem;
          text-align: center;
        }

        .nav-label {
          font-weight: 500;
        }

        .notification-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.75rem;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.75rem;
          min-width: 1.25rem;
          text-align: center;
        }

        .tweet-button-sidebar {
          margin-top: 2rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 2rem;
          padding: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .tweet-button-sidebar:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
        }

        .tweet-button-sidebar.icon-only {
          padding: 1rem;
          border-radius: 50%;
          width: 56px;
          height: 56px;
        }

        .tweet-icon {
          font-size: 1.25rem;
        }

        /* Main Content Styles */
        .main-content {
          border-right: 1px solid #e2e8f0;
          background: white;
          min-height: 100vh;
        }

        .dark .main-content {
          background: #1e293b;
          border-color: #334155;
        }

        .main-header {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #e2e8f0;
          z-index: 10;
          padding: 1rem 1.5rem;
        }

        .dark .main-header {
          background: rgba(30, 41, 59, 0.8);
          border-color: #334155;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .dark .header-title {
          color: #f1f5f9;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 2rem;
          background: #f8fafc;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .dark .search-input {
          background: #334155;
          border-color: #475569;
          color: #f1f5f9;
        }

        .search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 1rem;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 20;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 0.25rem;
        }

        .dark .search-results {
          background: #334155;
          border-color: #475569;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .search-result-item:hover {
          background: #f8fafc;
        }

        .dark .search-result-item:hover {
          background: #475569;
        }

        .search-result-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .search-result-content {
          flex: 1;
          min-width: 0;
        }

        .search-result-username {
          font-weight: 600;
          color: #1e293b;
          display: block;
        }

        .dark .search-result-username {
          color: #f1f5f9;
        }

        .search-result-text {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .no-search-results {
          padding: 1rem;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
        }

        /* Compose Tweet Styles */
        .compose-tweet {
          border-bottom: 1px solid #e2e8f0;
          background: white;
          padding: 1.5rem;
        }

        .dark .compose-tweet {
          background: #1e293b;
          border-color: #334155;
        }

        .tweet-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .compose-header {
          display: flex;
          gap: 1rem;
        }

        .compose-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .compose-textarea {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1.25rem;
          resize: none;
          background: transparent;
          color: #1e293b;
          placeholder-color: #64748b;
          min-height: 120px;
          line-height: 1.5;
        }

        .dark .compose-textarea {
          color: #f1f5f9;
        }

        .image-previews {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-left: 60px;
        }

        .image-preview {
          position: relative;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .audio-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 60px;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .dark .audio-preview {
          background: #334155;
        }

        .remove-audio {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .compose-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 60px;
        }

        .media-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .media-button {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
          transition: background 0.2s;
        }

        .media-button:hover {
          background: #f1f5f9;
        }

        .dark .media-button:hover {
          background: #334155;
        }

        .media-button.recording {
          background: #ef4444;
          color: white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .tweet-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .character-count {
          font-size: 0.875rem;
          color: #64748b;
        }

        .character-count .warning {
          color: #ef4444;
        }

        .character-count .caution {
          color: #f59e0b;
        }

        .tweet-submit-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
        }

        .tweet-submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tweet-submit-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .emoji-picker {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          margin-left: 60px;
        }

        .dark .emoji-picker {
          background: #334155;
          border-color: #475569;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 0.25rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .emoji-button {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 0.25rem;
          cursor: pointer;
          font-size: 1.25rem;
          transition: background 0.2s;
        }

        .emoji-button:hover {
          background: #f1f5f9;
        }

        .dark .emoji-button:hover {
          background: #475569;
        }

        /* Tweet Card Styles */
        .tweets-container {
          min-height: 400px;
        }

        .tweet-card {
          border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem;
          background: white;
          transition: background 0.2s;
        }

        .dark .tweet-card {
          background: #1e293b;
          border-color: #334155;
        }

        .tweet-card:hover {
          background: #f8fafc;
        }

        .dark .tweet-card:hover {
          background: #334155;
        }

        .tweet-card.read {
          opacity: 0.8;
        }

        .tweet-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .user-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-details {
          flex: 1;
        }

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .username {
          font-weight: 600;
          color: #1e293b;
        }

        .dark .username {
          color: #f1f5f9;
        }

        .verified-badge {
          color: #3b82f6;
          font-size: 0.875rem;
        }

        .tweet-time {
          color: #64748b;
          font-size: 0.875rem;
        }

        .follower-count {
          color: #64748b;
          font-size: 0.75rem;
          display: block;
          margin-top: 0.125rem;
        }

        .tweet-menu {
          display: flex;
          align-items: center;
        }

        .menu-button {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .menu-button:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .dark .menu-button:hover {
          background: #334155;
          color: #f1f5f9;
        }

        .tweet-content {
          margin-left: 60px;
          margin-bottom: 0.75rem;
        }

        .tweet-text {
          font-size: 1rem;
          line-height: 1.5;
          color: #1e293b;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .dark .tweet-text {
          color: #f1f5f9;
        }

        .tweet-text :global(.hashtag) {
          color: #3b82f6;
          text-decoration: none;
        }

        .tweet-text :global(.mention) {
          color: #3b82f6;
          text-decoration: none;
        }

        .tweet-text :global(.link) {
          color: #3b82f6;
          text-decoration: none;
        }

        .tweet-text :global(.link:hover) {
          text-decoration: underline;
        }

        .tweet-images {
          margin-top: 0.75rem;
          border-radius: 1rem;
          overflow: hidden;
          display: grid;
          gap: 2px;
        }

        .tweet-images.grid-1 {
          grid-template-columns: 1fr;
        }

        .tweet-images.grid-2 {
          grid-template-columns: 1fr 1fr;
        }

        .tweet-images.grid-3 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .tweet-images.grid-3 .tweet-image:first-child {
          grid-row: 1 / -1;
        }

        .tweet-images.grid-4 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .tweet-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .tweet-image:hover {
          transform: scale(1.02);
        }

        .tweet-hashtags {
          margin-top: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .hashtag-pill {
          background: #e0e7ff;
          color: #3730a3;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
        }

        .dark .hashtag-pill {
          background: #312e81;
          color: #c7d2fe;
        }

        .tweet-stats {
          margin-left: 60px;
          margin-bottom: 0.75rem;
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        .stat-icon {
          font-size: 1rem;
        }

        .tweet-actions {
          margin-left: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 400px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 2rem;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .action-button:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .action-button.like:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .action-button.like.active {
          color: #ef4444;
        }

        .action-button.retweet:hover {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .action-button.retweet.active {
          color: #22c55e;
        }

        .action-button.reply:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .action-icon {
          font-size: 1.125rem;
        }

        .action-count {
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Loading States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f8fafc;
        }

        .dark .loading-container {
          background: #0f172a;
        }

        .loading-spinner {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 1rem;
        }

        .spinner-ring {
          position: absolute;
          border: 4px solid transparent;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-ring:nth-child(1) {
          width: 80px;
          height: 80px;
          animation-delay: 0s;
        }

        .spinner-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          animation-delay: -0.3s;
        }

        .spinner-ring:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          animation-delay: -0.6s;
        }

        .loading-text {
          font-size: 1.125rem;
          color: #64748b;
          font-weight: 500;
        }

        .load-more-indicator {
          padding: 2rem;
          text-align: center;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          background: #6366f1;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        .loading-dots span:nth-child(3) { animation-delay: 0s; }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        /* Empty States */
        .empty-feed, .empty-bookmarks, .no-notifications {
          padding: 4rem 2rem;
          text-align: center;
          color: #64748b;
        }

        .empty-icon, .no-notifications-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-feed h3, .empty-bookmarks h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }

        .dark .empty-feed h3, .dark .empty-bookmarks h3 {
          color: #f1f5f9;
        }

        /* Right Sidebar */
        .right-sidebar {
          padding: 1rem;
          background: #f8fafc;
          overflow-y: auto;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .dark .right-sidebar {
          background: #0f172a;
        }

        .sidebar-widget {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
        }

        .dark .sidebar-widget {
          background: #1e293b;
          border-color: #334155;
        }

        .widget-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: #1e293b;
        }

        .dark .widget-title {
          color: #f1f5f9;
        }

        .trending-news, .trending-topics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .news-item, .trending-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }

        .news-item:hover, .trending-item:hover {
          background: #f1f5f9;
        }

        .dark .news-item:hover, .dark .trending-item:hover {
          background: #334155;
        }

        .news-category {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 500;
        }

        .news-title {
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .dark .news-title {
          color: #f1f5f9;
        }

        .news-tweets, .trending-count {
          font-size: 0.875rem;
          color: #64748b;
        }

        .trending-tag {
          font-weight: 600;
          color: #1e293b;
        }

        .dark .trending-tag {
          color: #f1f5f9;
        }

        .follow-suggestions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .follow-suggestion, .suggested-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.75rem;
          transition: background 0.2s;
        }

        .follow-suggestion:hover, .suggested-user:hover {
          background: #f1f5f9;
        }

        .dark .follow-suggestion:hover, .dark .suggested-user:hover {
          background: #334155;
        }

        .suggestion-avatar, .suggested-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .suggestion-info, .suggested-info {
          flex: 1;
          min-width: 0;
        }

        .suggestion-name, .suggested-name {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .suggestion-username, .suggested-username {
          font-weight: 600;
          color: #1e293b;
        }

        .dark .suggestion-username, .dark .suggested-username {
          color: #f1f5f9;
        }

        .suggestion-handle {
          font-size: 0.875rem;
          color: #64748b;
        }

        .suggested-followers {
          font-size: 0.875rem;
          color: #64748b;
        }

        .mini-follow-button, .follow-button {
          background: #1e293b;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .mini-follow-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dark .mini-follow-button, .dark .follow-button {
          background: #f1f5f9;
          color: #1e293b;
        }

        .mini-follow-button:hover, .follow-button:hover {
          background: #334155;
        }

        .dark .mini-follow-button:hover, .dark .follow-button:hover {
          background: #e2e8f0;
        }

        .mini-follow-button.following, .follow-button.following {
          background: #22c55e;
          color: white;
        }

        .mini-follow-button.following:hover, .follow-button.following:hover {
          background: #16a34a;
        }

        .sidebar-footer {
          margin-top: 2rem;
          padding: 1rem;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1rem;
          margin-bottom: 1rem;
        }

        .footer-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.75rem;
        }

        .footer-links a:hover {
          color: #1e293b;
        }

        .dark .footer-links a:hover {
          color: #f1f5f9;
        }

        .copyright {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        /* Notifications Dropdown */
        .notifications-dropdown {
          position: fixed;
          top: 60px;
          left: 260px;
          width: 320px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          z-index: 100;
          max-height: 400px;
          overflow: hidden;
        }

        .dark .notifications-dropdown {
          background: #1e293b;
          border-color: #334155;
        }

        .notifications-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .dark .notifications-header {
          border-color: #334155;
        }

        .notifications-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .dark .notifications-header h3 {
          color: #f1f5f9;
        }

        .close-notifications {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .close-notifications:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .dark .close-notifications:hover {
          background: #334155;
          color: #f1f5f9;
        }

        .notifications-list {
          max-height: 320px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .dark .notification-item {
          border-color: #334155;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .dark .notification-item:hover {
          background: #334155;
        }

        .notification-icon {
          font-size: 1.25rem;
          margin-top: 0.125rem;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content p {
          margin: 0 0 0.25rem 0;
          color: #1e293b;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .dark .notification-content p {
          color: #f1f5f9;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease;
        }

        .dark .modal-content {
          background: #1e293b;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .dark .modal-header {
          border-color: #334155;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .dark .modal-header h2 {
          color: #f1f5f9;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .dark .modal-close:hover {
          background: #334155;
          color: #f1f5f9;
        }

        .modal-body {
          padding: 1.5rem;
        }

        /* Profile Modal */
        .profile-modal {
          max-width: 600px;
        }

        .profile-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .profile-modal-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-details h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .dark .profile-details h3 {
          color: #f1f5f9;
        }

        .profile-details p {
          margin: 0 0 0.75rem 0;
          color: #64748b;
        }

        .profile-stats {
          display: flex;
          gap: 1rem;
        }

        .profile-stats span {
          font-size: 0.875rem;
          color: #64748b;
        }

        .profile-bio {
          color: #1e293b;
          line-height: 1.5;
        }

        .dark .profile-bio {
          color: #f1f5f9;
        }

        /* Settings Modal */
        .settings-modal {
          max-width: 600px;
        }

        .settings-section {
          margin-bottom: 2rem;
        }

        .settings-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
        }

        .dark .settings-section h3 {
          color: #f1f5f9;
        }

        .setting-item {
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .dark .setting-item {
          border-color: #334155;
        }

        .setting-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .setting-label span {
          color: #1e293b;
          font-weight: 500;
        }

        .dark .setting-label span {
          color: #f1f5f9;
        }

        .setting-toggle {
          appearance: none;
          width: 44px;
          height: 24px;
          background: #cbd5e1;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }

        .setting-toggle::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .setting-toggle:checked {
          background: #6366f1;
        }

        .setting-toggle:checked::before {
          transform: translateX(20px);
        }

        /* Reply Modal */
        .reply-modal {
          max-width: 600px;
        }

        .original-tweet {
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .dark .original-tweet {
          border-color: #334155;
        }

        .tweet-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .reply-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .reply-username {
          font-weight: 600;
          color: #1e293b;
        }

        .dark .reply-username {
          color: #f1f5f9;
        }

        .reply-original-content {
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .reply-compose {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .reply-compose-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .reply-textarea {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.75rem;
          resize: vertical;
          min-height: 100px;
          font-size: 1rem;
          color: #1e293b;
        }

        .dark .reply-textarea {
          background: #334155;
          border-color: #475569;
          color: #f1f5f9;
        }

        .reply-textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .reply-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .reply-character-count {
          font-size: 0.875rem;
          color: #64748b;
        }

        .reply-submit-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reply-submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reply-submit-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
        }

        /* Image Modal */
        .image-modal-overlay {
          background: rgba(0, 0, 0, 0.9);
          padding: 2rem;
        }

        .image-modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-modal-close {
          position: absolute;
          top: -3rem;
          right: 0;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .image-modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 0.5rem;
        }

        /* Explore Content */
        .explore-content {
          padding: 1.5rem;
        }

        .explore-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: #1e293b;
        }

        .dark .explore-content h3 {
          color: #f1f5f9;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .feed-container {
            grid-template-columns: 70px 1fr;
          }
          
          .right-sidebar {
            display: none;
          }
          
          .sidebar {
            padding: 1rem 0.5rem;
          }
          
          .sidebar-collapsed {
            padding: 1rem 0.5rem;
          }
        }

        @media (max-width: 768px) {
          .feed-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          
          .sidebar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: auto;
            padding: 0;
            background: white;
            border-top: 1px solid #e2e8f0;
            border-right: none;
            z-index: 100;
          }
          
          .dark .sidebar {
            background: #1e293b;
            border-color: #334155;
          }
          
          .sidebar-header, .user-profile-sidebar, .tweet-button-sidebar {
            display: none;
          }
          
          .sidebar-nav {
            flex-direction: row;
            padding: 0.5rem;
            justify-content: space-around;
          }
          
          .nav-section {
            flex-direction: row;
            gap: 0;
          }
          
          .nav-item {
            flex-direction: column;
            padding: 0.5rem;
            gap: 0.25rem;
            min-width: 60px;
          }
          
          .nav-label {
            font-size: 0.75rem;
          }
          
          .main-content {
            padding-bottom: 80px;
          }
          
          .modal-content {
            margin: 1rem;
            max-width: calc(100vw - 2rem);
          }
          
          .notifications-dropdown {
            left: 1rem;
            right: 1rem;
            width: auto;
          }
          
          .tweet-actions {
            margin-left: 0;
          }
          
          .tweet-content {
            margin-left: 0;
          }
          
          .tweet-stats {
            margin-left: 0;
          }
          
          .compose-actions {
            padding-left: 0;
          }
          
          .image-previews {
            margin-left: 0;
          }
          
          .audio-preview {
            margin-left: 0;
          }
          
          .emoji-picker {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Feed;

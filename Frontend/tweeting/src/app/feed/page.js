"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";

const ModernGlassFeed = () => {
  // State Management
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
  const [activeTab, setActiveTab] = useState("home");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [likedTweets, setLikedTweets] = useState(new Set());
  const [retweetedTweets, setRetweetedTweets] = useState(new Set());
  const [bookmarkedTweets, setBookmarkedTweets] = useState(new Set());
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [tweetImages, setTweetImages] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [readTweets, setReadTweets] = useState(new Set());

  const router = useRouter();
  const fileInputRef = useRef(null);
  const tweetContainerRef = useRef(null);
  const observerRef = useRef(null);
  const searchInputRef = useRef(null);

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
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const generateRandomStats = () => ({
    likes: Math.floor(Math.random() * 1000) + 1,
    retweets: Math.floor(Math.random() * 500) + 1,
    replies: Math.floor(Math.random() * 200) + 1,
    views: Math.floor(Math.random() * 10000) + 100
  });

  const detectHashtags = (text) => text?.replace(/#(\w+)/g, '<span class="text-blue-500 hover:underline font-medium cursor-pointer">#$1</span>');
  const detectMentions = (text) => text?.replace(/@(\w+)/g, '<span class="text-blue-500 hover:underline font-medium cursor-pointer">@$1</span>');
  const detectLinks = (text) => text?.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');

  // Fetch user data
  useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Use Axios api instance instead of fetch
      const res = await api.get("/auth", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Axios automatically parses JSON, response is in res.data
      const userData = res.data;

      setUser(userData);
      setUsername(userData.username || "Guest");
      setFollowingUsers(new Set(userData.following || []));
      setLikedTweets(new Set(userData.likedTweets || []));
      setBookmarkedTweets(new Set(userData.bookmarkedTweets || []));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchUserData();
}, []);


  // Fetch tweets
  const fetchTweets = useCallback(async (pageNum = 1) => {
    try {
      const res = await api.get(`/tweets/allTweets?page=${pageNum}&limit=10`);
      console.log(res);
      const data = res.data.tweet;
      return data?.map(tweet => ({ ...tweet, hashtags: tweet.content.match(/#\w+/g) || [], mentions: tweet.content.match(/@\w+/g) || [], ...generateRandomStats() }));
    } catch (error) {
      console.error('Error fetching tweets:', error);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitialTweets = async () => {
      setLoading(true);
      const initialTweets = await fetchTweets(1);
      setTweets(initialTweets);
      setLoading(false);
      setTrendingTopics([
        { tag: '#TechNews', tweets: '45.2K' },
        { tag: '#WebDev', tweets: '32.8K' },
        { tag: '#AI', tweets: '28.5K' },
        { tag: '#Startup', tweets: '21.3K' }
      ]);
      setSuggestedUsers([
        { id: 1, username: 'elonmusk', name: 'Elon Musk', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elon', verified: true, followers: '100M' },
        { id: 2, username: 'sundarpichai', name: 'Sundar Pichai', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sundar', verified: true, followers: '5.2M' }
      ]);
    };
    loadInitialTweets();
  }, [fetchTweets]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const loadMore = async () => {
          const newTweets = await fetchTweets(page + 1);
          if (newTweets?.length > 0) {
            setTweets(prev => [...prev, ...newTweets]);
            setPage(prev => prev + 1);
          } else {
            setHasMore(false);
          }
        };
        loadMore();
      }
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchTweets, hasMore, loading, page]);

  // Dark mode & online status
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add('dark');
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(''); setSuccess(''); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Tweet submission
  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && tweetImages?.length === 0) return;

    const token = localStorage.getItem('token');
    const auth = await api.get('/auth');
    if (!auth.data.isAuth) {
      setError('Please log in to post tweets');
      router.push('/login');
      return;
    }

    setPostLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      tweetImages.forEach(image => formData.append('images', image));

      const res = await api.post('/tweets/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201) {
        const enhancedTweet = { ...res.data, ...generateRandomStats(), user: { username, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` }};
        setTweets(prev => [enhancedTweet, ...(prev || [])]);
        setContent('');
        setTweetImages([]);
        setSuccess('Tweet posted successfully!');
      }
    } catch (error) {
      setError('Error posting tweet');
    } finally {
      setPostLoading(false);
    }
  };

  // Image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files?.length + tweetImages?.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024 && file.type.startsWith('image/'));
    setTweetImages(prev => [...prev, ...validFiles]);
  };

  // Tweet interactions
  const handleLike = async (tweetId) => {
    const isLiked = likedTweets.has(tweetId);
    const newLikedTweets = new Set(likedTweets);
    isLiked ? newLikedTweets.delete(tweetId) : newLikedTweets.add(tweetId);
    setLikedTweets(newLikedTweets);
    setTweets(prev => prev?.map(tweet => tweet._id === tweetId ? { ...tweet, likes: tweet.likes + (isLiked ? -1 : 1) } : tweet));
  };

  const handleRetweet = async (tweetId) => {
    const isRetweeted = retweetedTweets.has(tweetId);
    const newRetweetedTweets = new Set(retweetedTweets);
    isRetweeted ? newRetweetedTweets.delete(tweetId) : newRetweetedTweets.add(tweetId);
    setRetweetedTweets(newRetweetedTweets);
    setTweets(prev => prev?.map(tweet => tweet._id === tweetId ? { ...tweet, retweets: tweet.retweets + (isRetweeted ? -1 : 1) } : tweet));
  };

  const handleBookmark = async (tweetId) => {
    const isBookmarked = bookmarkedTweets.has(tweetId);
    const newBookmarkedTweets = new Set(bookmarkedTweets);
    isBookmarked ? newBookmarkedTweets.delete(tweetId) : newBookmarkedTweets.add(tweetId);
    setBookmarkedTweets(newBookmarkedTweets);
    setSuccess(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleFollow = async (userId) => {
    const isFollowing = followingUsers.has(userId);
    const newFollowingUsers = new Set(followingUsers);
    isFollowing ? newFollowingUsers.delete(userId) : newFollowingUsers.add(userId);
    setFollowingUsers(newFollowingUsers);
    setSuccess(isFollowing ? 'Unfollowed user' : 'Following user');
  };

  const handleReply = (tweet) => { setSelectedTweet(tweet); setShowReplyModal(true); };
  const submitReply = async () => {
    if (!replyContent.trim()) return;
    setSuccess('Reply posted successfully!');
    setReplyContent('');
    setShowReplyModal(false);
    setTweets(prev => prev?.map(tweet => tweet._id === selectedTweet._id ? { ...tweet, replies: tweet.replies + 1 } : tweet));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    newDarkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Memoized tweets
  const memoizedTweets = useMemo(() => {
    return tweets?.map((tweet) => (
      <div key={tweet._id} className={`relative mb-4 p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group ${darkMode ? 'bg-slate-800/30 border-slate-700/30' : ''} ${readTweets.has(tweet._id) ? 'opacity-70' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
        
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="relative">
              <img src={tweet.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.user?.username}`} alt={tweet.user?.username} className="w-12 h-12 rounded-full object-cover border-2 border-white/20 transition-all duration-300 hover:border-blue-500/50 hover:scale-105" />
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-pulse"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{tweet.user?.name || tweet.user?.username}</h3>
                {tweet.user?.verified && (
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <span>@{tweet.user?.username}</span>
                <span>·</span>
                <time className="hover:underline cursor-help" title={new Date(tweet.createdAt).toLocaleString()}>{formatTimeAgo(tweet.createdAt)}</time>
              </div>
            </div>
          </div>

          <button className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-110" onClick={() => handleBookmark(tweet._id)}>
            <svg className={`w-5 h-5 transition-colors ${bookmarkedTweets.has(tweet._id) ? 'text-blue-500 fill-current' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        </div>

        <div className="relative mb-4">
          <div className="text-gray-900 dark:text-white text-base leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: detectLinks(detectMentions(detectHashtags(tweet.content))) }} />

          {tweet.images && tweet.images?.length > 0 && (
            <div className={`mt-4 grid gap-1 rounded-2xl overflow-hidden ${tweet.images?.length === 1 ? 'grid-cols-1' : tweet.images?.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
              {tweet.images.slice(0, 4)?.map((image, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <img src={image} alt={`Tweet image ${index + 1}`} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" onClick={() => { setSelectedImage(image); setShowImageModal(true); }} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {tweet.images?.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold">+{tweet.images?.length - 4}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tweet.hashtags && tweet.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tweet.hashtags.slice(0, 5)?.map((hashtag, index) => (
                <button key={index} className="px-3 py-1 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 text-blue-500 text-sm rounded-full hover:bg-blue-500/20 transition-colors duration-200">{hashtag}</button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex items-center mb-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{formatNumber(tweet.views || Math.floor(Math.random() * 10000) + 100)}</span>
          </div>
        </div>

        <div className="relative flex justify-between max-w-md">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105 ${selectedTweet?._id === tweet._id ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'bg-white/5 hover:bg-blue-500/10 text-gray-500 hover:text-blue-500 border border-white/10'}`} onClick={() => handleReply(tweet)}>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 8l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{formatNumber(tweet.replies || 0)}</span>
          </button>

          <button className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105 ${retweetedTweets.has(tweet._id) ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-white/5 hover:bg-green-500/10 text-gray-500 hover:text-green-500 border border-white/10'}`} onClick={() => handleRetweet(tweet._id)}>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414L6 2.586 2.293 6.293a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414L14 17.414l3.707-3.707a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
            <span className="text-sm font-medium">{formatNumber(tweet.retweets || 0)}</span>
          </button>

          <button className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105 ${likedTweets.has(tweet._id) ? 'bg-pink-500/20 text-pink-500 border border-pink-500/30' : 'bg-white/5 hover:bg-pink-500/10 text-gray-500 hover:text-pink-500 border border-white/10'}`} onClick={() => handleLike(tweet._id)}>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{formatNumber(tweet.likes || 0)}</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-blue-500/10 text-gray-500 hover:text-blue-500 border border-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-105" onClick={() => { navigator.share?.({ title: `Tweet by ${tweet.user?.username}`, text: tweet.content, url: window.location.href }) || navigator.clipboard.writeText(`${tweet.content} - ${window.location.href}`); setSuccess("Link copied!"); }}>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>
        </div>
      </div>
    ));
  }, [tweets, likedTweets, retweetedTweets, bookmarkedTweets, readTweets, darkMode, selectedTweet]);

  // Loading state
  if (loading && tweets?.length === 0) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 ${darkMode ? 'dark' : ''}`}>
        <div className="relative p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
          <div className="relative flex flex-col items-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Loading your feed</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${darkMode ? 'dark' : ''}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)` }}></div>
        {[...Array(20)]?.map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}></div>
        ))}
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-2xl backdrop-blur-xl shadow-xl border max-w-sm ${error ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-green-500/10 border-green-500/30 text-green-600'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{error ? '⚠️' : '✅'}</span>
              <span className="font-medium">{error || success}</span>
              <button onClick={() => { setError(''); setSuccess(''); }} className="ml-auto text-lg hover:scale-110 transition-transform">×</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto p-4">
        {/* Left Sidebar */}
        <div className={`col-span-12 lg:col-span-3 xl:col-span-2 ${sidebarCollapsed ? 'lg:col-span-1' : ''}`}>
          <div className="sticky top-6">
            <div className="relative p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
              
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">T</div>
                    {!sidebarCollapsed && <span className="font-bold text-xl text-gray-900 dark:text-white">TweetApp</span>}
                  </div>
                  <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">{sidebarCollapsed ? '→' : '←'}</button>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{username}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.followers || Math.floor(Math.random() * 1000)} followers</p>
                    </div>
                  )}
                </div>

                <nav className="space-y-2">
                  {[
                    { tab: 'home', icon: '🏠', label: 'Home' },
                    { tab: 'explore', icon: '🔍', label: 'Explore' },
                    { tab: 'bookmarks', icon: '🔖', label: 'Bookmarks' }
                  ]?.map((item) => (
                    <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105 ${activeTab === item.tab ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 border border-blue-500/30' : 'hover:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
                      <span className="text-xl">{item.icon}</span>
                      {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                    </button>
                  ))}
                </nav>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all duration-200">
                    <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
                    {!sidebarCollapsed && <span className="font-medium">Theme</span>}
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-red-600 transition-all duration-200">
                    <span className="text-xl">🚪</span>
                    {!sidebarCollapsed && <span className="font-medium">Logout</span>}
                  </button>
                </div>

                <button onClick={() => setActiveTab('compose')} className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 ${sidebarCollapsed ? 'p-4' : 'py-4 px-6'}`}>
                  {sidebarCollapsed ? <span className="text-xl">✍️</span> : <span>Tweet</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-7">
          <div className="space-y-6">
            {/* Header */}
            <div className="sticky top-6 z-10">
              <div className="relative p-4 rounded-3xl backdrop-blur-xl bg-white/80 border border-white/30 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
                <div className="relative flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'home' ? 'Home' : activeTab === 'explore' ? 'Explore' : activeTab === 'bookmarks' ? 'Bookmarks' : 'Compose'}
                  </h2>
                  <div className="relative flex-1 max-w-sm ml-4">
                    <input ref={searchInputRef} type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tweet Compose */}
            {(activeTab === 'home' || activeTab === 'compose') && (
              <div className="relative p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                <form onSubmit={handleTweetSubmit} className="relative space-y-4">
                  <div className="flex gap-4">
                    <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="Your avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 flex-shrink-0" />
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's happening?" className="flex-1 bg-transparent text-xl text-gray-900 dark:text-white placeholder-gray-500 resize-none outline-none min-h-[120px]" maxLength={280} />
                  </div>

                  {tweetImages?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 ml-16">
                      {tweetImages?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                          <button type="button" className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black/80 transition-colors" onClick={() => setTweetImages(prev => prev.filter((_, i) => i !== index))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between ml-16">
                    <div className="flex items-center gap-4">
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                      <button type="button" className="p-3 rounded-full bg-white/10 hover:bg-blue-500/20 text-blue-500 transition-colors border border-white/20" onClick={() => fileInputRef.current?.click()}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`text-sm font-medium ${content?.length > 260 ? 'text-red-500' : content?.length > 240 ? 'text-yellow-500' : 'text-gray-500'}`}>{280 - content?.length}</div>
                      <button type="submit" disabled={postLoading || (!content.trim() && tweetImages?.length === 0)} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {postLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Tweet'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Content Based on Active Tab */}
            <div ref={tweetContainerRef}>
              {activeTab === 'home' && (
                <div>
                  {tweets?.length === 0 ? (
                    <div className="relative p-12 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl text-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                      <div className="relative">
                        <div className="text-6xl mb-6 opacity-60 animate-bounce">✨</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your feed awaits</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">Follow interesting people or share your thoughts to get started!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {memoizedTweets}
                      {hasMore && (
                        <div ref={observerRef} className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading more tweets...</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'explore' && (
                <div className="space-y-6">
                  <div className="relative p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🔥</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trending</h3>
                      </div>
                      <div className="space-y-3">
                        {trendingTopics?.map((topic, index) => (
                          <div key={index} className="p-4 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="flex justify-between">
                              <span className="text-lg font-semibold text-blue-500">{topic.tag}</span>
                              <span className="text-sm text-gray-500">{topic.tweets} tweets</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">👥</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Who to follow</h3>
                      </div>
                      <div className="space-y-4">
                        {suggestedUsers?.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900 dark:text-white">{user.username}</span>
                                  {user.verified && <svg className="w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                                </div>
                                <span className="text-sm text-gray-500">{user.followers} followers</span>
                              </div>
                            </div>
                            <button className={`px-6 py-2 rounded-2xl font-semibold transition-all hover:scale-105 ${followingUsers.has(user.id) ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-blue-500 text-white shadow-lg'}`} onClick={() => handleFollow(user.id)}>
                              {followingUsers.has(user.id) ? 'Following' : 'Follow'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="relative p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔖</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bookmarks</h3>
                      </div>
                      <span className="text-sm px-4 py-2 bg-blue-500/20 text-blue-600 rounded-full">{bookmarkedTweets.size} saved</span>
                    </div>
                    {bookmarkedTweets.size === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-6 opacity-60">📚</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No bookmarks yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">Bookmark tweets to save them for later</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tweets.filter(tweet => bookmarkedTweets.has(tweet._id))?.map(tweet => (
                          <div key={tweet._id} className="p-4 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 relative">
                            <div className="absolute top-4 right-4 text-blue-500">🔖</div>
                            <div className="pr-8">
                              <div className="flex items-center gap-3 mb-3">
                                <img src={tweet.user?.avatar} alt={tweet.user?.username} className="w-10 h-10 rounded-full" />
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">@{tweet.user?.username}</span>
                                  <span className="text-sm text-gray-500 ml-2">{formatTimeAgo(tweet.createdAt)}</span>
                                </div>
                              </div>
                              <p className="text-gray-900 dark:text-white">{tweet.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block col-span-3">
          <div className="sticky top-6 space-y-6">
            <div className="relative p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What's happening</h3>
                <div className="space-y-3">
                  {[
                    { title: 'React 19 Released', category: 'Technology', tweets: '15.2K' },
                    { title: 'AI Revolution', category: 'Tech News', tweets: '8.7K' }
                  ]?.map((news, index) => (
                    <div key={index} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-sm text-gray-500">{news.category}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{news.title}</h4>
                      <span className="text-sm text-gray-500">{news.tweets} Tweets</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Who to follow</h3>
                <div className="space-y-3">
                  {suggestedUsers.slice(0, 3)?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">{user.username}</span>
                            {user.verified && <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                          </div>
                          <span className="text-xs text-gray-500">@{user.username}</span>
                        </div>
                      </div>
                      <button className={`w-8 h-8 rounded-full text-white font-bold text-sm transition-all hover:scale-110 ${followingUsers.has(user.id) ? 'bg-green-500' : 'bg-blue-500'}`} onClick={() => handleFollow(user.id)}>
                        {followingUsers.has(user.id) ? '✓' : '+'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedTweet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReplyModal(false)}>
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl backdrop-blur-xl bg-white/90 border border-white/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reply to @{selectedTweet.user?.username}</h2>
                <button onClick={() => setShowReplyModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg">×</button>
              </div>
              
              <div className="flex gap-3 mb-4 p-4 bg-gray-50 rounded-2xl">
                <img src={selectedTweet.user?.avatar} alt={selectedTweet.user?.username} className="w-10 h-10 rounded-full" />
                <div>
                  <span className="font-semibold text-gray-900">@{selectedTweet.user?.username}</span>
                  <p className="text-gray-700 mt-1">{selectedTweet.content}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="Your avatar" className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Tweet your reply" className="w-full bg-transparent text-lg resize-none outline-none min-h-[100px] text-gray-900" maxLength={280} />
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">{280 - replyContent?.length}</div>
                    <button onClick={submitReply} disabled={!replyContent.trim()} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-full">
            <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl hover:bg-white/30 transition-colors z-10">×</button>
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernGlassFeed;

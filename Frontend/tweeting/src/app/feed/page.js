"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css"; 

const Feed = () => {
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); 
  const [username, setUsername] = useState("Guest");
  const router = useRouter();

  // Fetch user data to get the username
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

        if (userData && userData.username) {
          setUsername(userData.username); 
        } else {
          setUsername("Guest");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername("Guest"); 
      }
    };

    fetchUserData(); 
  }, []);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const res = await fetch(`http://localhost:5000/auth/tweets?page=${page}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Failed to fetch tweets");
        }

        setTweets((prevTweets) => {
          const existingIds = new Set(prevTweets.map((tweet) => tweet._id));
          const newTweets = data.filter((tweet) => !existingIds.has(tweet._id));
          return [...prevTweets, ...newTweets];
        });
      } catch (error) {
        setError("Error fetching tweets");
      } finally {
        setLoading(false);
      }
    };

    fetchTweets(); 
  }, [page]);

  // Handle tweet submission
  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/auth/tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const { tweet } = await res.json();
        setTweets((prevTweets) => [tweet, ...prevTweets]);
        setContent(""); 
      } else {
        setError("Error posting tweet");
      }
    } catch (error) {
      setError("Something went wrong while posting the tweet");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); 
    router.push("/login"); 
  };

  // Infinite scroll functionality
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setPage((prevPage) => prevPage + 1); // Load more tweets
    }
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.feedContainer}>
      <div className={styles.userProfile}>
        <img src="/path/to/user/image.jpg" alt="User" className={styles.userImage} />
        <h3 className={styles.username}>{username}</h3> {/* Dynamic username */}
      </div>
      <nav className={styles.navbar}>
        <h3>Profile</h3>
        <h3>Settings</h3>
        <h3 onClick={handleLogout} className={styles.logout}>Logout</h3>
      </nav>

      <div className={styles.mainContent} onScroll={handleScroll}>
        <form onSubmit={handleTweetSubmit} className={styles.tweetForm}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            rows="3"
            className={styles.textarea}
            required
          />
          <button type="submit" className={styles.tweetButton}>Tweet</button>
        </form>

        <div className={styles.tweetsContainer}>
          {tweets.length === 0 ? (
            <p className={styles.noTweets}>No tweets yet</p>
          ) : (
            tweets.map((tweet) => (
              <div key={tweet._id} className={styles.tweet}>
                <p className={styles.tweetContent}>
                  <strong>{tweet.user?.username}:</strong> {tweet.content}
                </p>
                <p className={styles.tweetDate}>
                  <small>{new Date(tweet.createdAt).toLocaleString()}</small>
                </p>
              </div>

            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;

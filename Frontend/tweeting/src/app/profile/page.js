"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/userProfile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 200) {
          const data = await res.json();
          setUser(data);
        } else {
          setError("Failed to load profile");
          router.push("/login");
        }
      } catch (error) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.profileContainer}>
      <h2>Profile Page</h2>
      {user && (
        <div className={styles.profileContent}>
          <div className={styles.profileImageContainer}>
            <img
              src={`http://localhost:5000/${user.image}`} // Ensure this links correctly
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
          <div className={styles.profileDetails}>
            <p><strong>Name:</strong> {user.name}</p>
            {user.username ? (
              <>
                <p><strong>Username:</strong> {user.username}</p>
              </>
            ) : (
              <>
                <p>Your profile is incomplete!</p>
                <button
                  onClick={() => {
                    router.push("/completeProfile");
                  }}
                >
                  Complete Profile
                </button>
              
              </>
            )}
          </div>
        </div>
      )}
        <button
                  onClick={() => {
                    router.push("/editProfile");
                  }}
                >
                  Edit Profile
                </button>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
        className={styles.logoutButton}
      >
        Logout
      </button>

    </div>
  );
};

export default Profile;
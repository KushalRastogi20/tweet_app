"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../page.module.css"; // Importing CSS module styles

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }

    const fetchData = async () => {
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
          setError("Failed to load data");
          router.push("/login");
        }
      } catch (error) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
  <main className={styles.profilebody}>
    <div className={styles.profileContainer}>
      <h2 className={styles.h2}>Profile Page</h2>
      {user && (
        <div className={styles.profileDetails}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
      <button
        className={styles.logoutButton}
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
      >
        Logout
      </button>
    </div>
    </main>
  );
};

export default Profile;

"use client"; // Use client-side rendering

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css"; // Assuming this holds your styles

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch user profile data on component mount
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login"); // Redirect if no token

      try {
        const res = await fetch("http://localhost:5000/auth/userProfile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUsername(data.username);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("username", username);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/auth/edit-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setError("");
      } else {
        setError(data.message);
        setSuccess("");
      }
    } catch (error) {
      setError("Error updating profile");
      setSuccess("");
    }
  };

  return (
    <div className={styles.editProfileContainer}>
      <h1>Edit Profile</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;

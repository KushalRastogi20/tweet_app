"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

const CompleteProfile = () => {
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleProfileCompletion = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("image", image); // Append the image file

    try {
      const token = localStorage.getItem("token"); // Get the stored token
      const res = await fetch("http://localhost:5000/auth/complete-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Add the JWT token to the request
        },
        body: formData, // Send the form data (image and username)
      });

      if (res.status === 200) {
        router.push("/profile"); // Redirect to profile page after successful completion
      } else {
        setError("Profile completion failed.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.completeProfileContainer}>
      <h2>Complete Your Profile</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleProfileCompletion} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <button type="submit">Complete Profile</button>
      </form>
    </div>
  );
};

export default CompleteProfile;

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css"; // Import your CSS module

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.status === 200) {
        const { token } = await res.json();
        localStorage.setItem("token", token); // Store the token in localStorage
        router.push("/profile"); // Redirect to profile after registration
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.registerWrapper}>
      <h2 className={styles.registerTitle}>Register</h2>
      {error && <p className={styles.registerError}>{error}</p>}
      <form className={styles.registerForm} onSubmit={handleRegister}>
        <input
          className={styles.registerInput}
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className={styles.registerInput}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.registerInput}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className={styles.registerButton} type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;

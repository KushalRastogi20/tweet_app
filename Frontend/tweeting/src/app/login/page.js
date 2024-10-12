"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css"; // Import your CSS module

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 200) {
        const { token } = await res.json();
        localStorage.setItem("token", token); // Store the token in localStorage
        router.push("/profile"); // Redirect to profile after login
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <h2 className={styles.loginTitle}>Login</h2>
      {error && <p className={styles.loginError}>{error}</p>}
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <input
          className={styles.loginInput}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.loginInput}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className={styles.loginButton} type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

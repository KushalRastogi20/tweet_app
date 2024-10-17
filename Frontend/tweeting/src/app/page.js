"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setisLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setisLoggedIn(true);
    }
  }, []);
  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push("/feed");
    }
  };
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Welcome to Our Tweeting Platform</h1>
      <p className={styles.homeSubtitle}>
        Connect with your peers and share your thoughts.
      </p>
      <div className={styles.buttonContainer}>
        <button className={styles.homeButton} onClick={handleClick}>Get Started</button>
        <button className={styles.homeButton}>Learn More</button>
      </div>
    </div>
  );
}

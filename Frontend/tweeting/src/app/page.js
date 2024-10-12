"use client"
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return(

    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Welcome to Our Tweeting Platform</h1>
      <p className={styles.homeSubtitle}>Connect with your peers and share your thoughts.</p>
      <div className={styles.buttonContainer}>
        <button className={styles.homeButton}>Get Started</button>
        <button className={styles.homeButton}>Learn More</button>
      </div>
    </div>
  );
};


  

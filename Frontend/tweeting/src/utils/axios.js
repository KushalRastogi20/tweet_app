import axios from "axios";

const api = axios.create({
  // baseURL: "/api", // points to Next.js API
  baseURL: "https://tweet-app-beige.vercel.app/api",
  withCredentials: true, // if you use cookies
});

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "/api", // points to Next.js API
  withCredentials: true, // if you use cookies
});

export default api;

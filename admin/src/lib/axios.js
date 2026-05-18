import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // by adding this field browser will send the cookies to server automatically, on every single req
});
//This is just creating a customized HTTP client
// “Every request should automatically use this backend URL and send cookies.”
export default axiosInstance;

// When you later do:
// axiosInstance.get("/auth/me")
// Axios sends:
// GET https://your-api.com/auth/me
// through the internet/browser.
// And because we set withCredentials: true, 
// the browser will also include any cookies 
// that are relevant to https://your-api.com in that request. 
// This is how the client can maintain an authenticated session with the server.


// What it actually does
// 1. axios.create(...)

// This creates a custom version of axios.

// Instead of writing this every time:

// axios.get("https://myapi.com/users")
// axios.post("https://myapi.com/login")

// You now get:

// axiosInstance.get("/users")
// axiosInstance.post("/login")

// It automatically adds the base URL.


// | Feature  | Axios          | Express              |
// | -------- | -------------- | -------------------- |
// | Runs on  | Frontend       | Backend              |
// | Role     | Sends requests | Handles requests     |
// | Talks to | API/server     | Frontend + DB        |
// | Type     | HTTP client    | Web server framework |

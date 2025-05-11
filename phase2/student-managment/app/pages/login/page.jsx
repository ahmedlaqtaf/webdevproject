"use client";
import "../../styles/login.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { signIn } from "next-auth/react";

export default function Page() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const username = e.target.id.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("id_token="))
          ?.split("=")[1];

        if (!cookie) {
          setError("No token found");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(cookie);

        if (decoded.role === "admin") router.push("/pages/dashboard");
        else if (decoded.role === "instructor") router.push("/pages/dashboard");
        else if (decoded.role === "student") router.push("/pages/dashboard");
        else router.push("/");
      } else {
        setError("Incorrect Username/Password");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-container">
      <h1>Welcome to Qatar University's CSE Registration System</h1>
      <div>
        <form id="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <p>Sign in</p>
            <label htmlFor="id">
              <p>Username:</p>
            </label>
            <input
              type="text"
              id="id"
              name="id"
              required
              placeholder="e.g. std1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <p>Password:</p>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="e.g. 123"
            />
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <div className="form-group">
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
          </div>
          <div className="github-login">
            <button
              type="button"
              className="github-button"
              onClick={() =>
                signIn("github", {
                  callbackUrl: "/pages/dashboard",
                  prompt: "login",
                })
              }
            >
              <img src="/Github-logo.png" width="40" height="40" alt="GitHub" />
              <span>Sign in with GitHub</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

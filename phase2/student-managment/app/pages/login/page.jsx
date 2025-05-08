"use client";
import "../../styles/login.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function Page() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const username = e.target.id.value;
    const password = e.target.password.value;

    const res = await fetch("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("id_token="))
        ?.split("=")[1];

      if (!cookie) {
        setError("No token found");
        return;
      }

      const decoded = jwtDecode(cookie);

      if (decoded.role === "admin") router.push("/pages/dashboard/admin");
      else if (decoded.role === "instructor")
        router.push("/pages/dashboard/instructor");
      else if (decoded.role === "student")
        router.push("/pages/dashboard/student");
      else router.push("/");
    } else {
      setError("Incorrect Username/Password");
    }
  }

  return (
    <main>
      <h1>Welcome to Qatar University's CS Registration System</h1>
      <div>
        <form id="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <p>Sign in</p>
            <label htmlFor="id">
              <p>Username:</p>
            </label>
            <input
              type="id"
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
          <div className="form-group">
            <button type="submit">Sign in</button>
          </div>
          <p id="indicator">Incorrect Email/Password</p>
          <div className="github-login">
            <button
              onClick={() => signIn("github", { callbackUrl: "/pages/" })}
            >
              <img
                src="/assets/Github-logo.png"
                width="40"
                height="40"
                alt="GitHub"
                padding="5"
              />
              <span>Sign in with GitHub</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

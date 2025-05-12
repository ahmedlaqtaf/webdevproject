"use client";
import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import "../../app/styles/navigation.css";

const handleLogout = () => {
  signOut({ callbackUrl: "/" });
};

export default function NavBar() {
  return (
    <header>
      <nav>
        <div className="nav-links">
          <Link href="/pages/dashboard" className="react-link">
            Dashboard
          </Link>
          <Link href="/pages/courses" className="react-link">
            Courses
          </Link>
        </div>
        <button className="log-out-btn" onClick={handleLogout}>
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M27,3V29a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V27H7v1H25V4H7V7H5V3A1,1,0,0,1,6,2H26A1,1,0,0,1,27,3ZM10.71,20.29,7.41,17H18V15H7.41l3.3-3.29L9.29,10.29l-5,5a1,1,0,0,0,0,1.42l5,5Z"
              fill="#000"
            />
          </svg>
        </button>
      </nav>
    </header>
  );
}

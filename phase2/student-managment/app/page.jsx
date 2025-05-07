import Link from "next/link";
export default function HomePage() {
  return (
    <div>
      <header className="header">
        <h1 id="pageTitle">Student Management System</h1>
        <span className="user-role">Guest</span>
      </header>

      <div className="nav-tabs">
        <Link className="nav-tab" href="/pages/dashboard">
          Dashboard
        </Link>
        <Link className="nav-tab" href="/register">
          Register
        </Link>
        <Link className="nav-tab" href="/login">
          Login
        </Link>
        <Link className="nav-tab" href="/api/courses">
          Courses API
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Welcome</h2>
        </div>
        <div className="card-body">
          <p>
            This is a university student management platform for managing
            courses, instructors, enrollments, and performance statistics.
          </p>
          <p>Use the navigation tabs to access various parts of the system.</p>
        </div>
      </div>
    </div>
  );
}

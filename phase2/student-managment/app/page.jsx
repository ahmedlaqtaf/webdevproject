"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  return router.push("/pages/login");
}
// home page not dashboard
// export default function HomePage() {
//   return (
//     <div>
//       <header className="header">
//         <h1 id="pageTitle">Student Management System</h1>
//         <span className="user-role">Guest</span>
//       </header>

//       <div className="nav-tabs">
//         <Link className="nav-tab" href="/pages/dashboard">
//           Dashboard
//         </Link>
//         <Link className="nav-tab" href="/pages/register">
//           Register
//         </Link>
//         <Link className="nav-tab" href="/pages/login">
//           Login
//         </Link>
//         <Link className="nav-tab" href="">
//           Statistics
//         </Link>
//       </div>

//       <div className="card">
//         <div className="card-header">
//           <h2 className="card-title">Welcome</h2>
//         </div>
//         <div className="card-body">
//           <p>
//             This is a university student management platform for managing
//             courses, instructors, enrollments, and performance statistics.
//           </p>
//           <p>Use the navigation tabs to access various parts of the system.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

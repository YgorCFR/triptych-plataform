"use client";

import { logout } from "@/app/helpers/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        logout();
    }

    return (
        <nav style={styles.navbar}>
            <ul style={styles.navList}>
                <li style={styles.navItem}>
                    <Link href="/"></Link>
                </li>
                <li style={styles.navItem}>
                    <Link href="/dashboard">Dashboard</Link>
                </li>
                {isAuthenticated ? (
                    <li style={styles.navItem}>
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Logout
                        </button>
                    </li>
                ) : (
                    <li style={styles.navItem}>
                        <Link href="/login">Login</Link>
                    </li>
                )

                }
            </ul>
        </nav>
    )
}

const styles = {
    navbar: {
      backgroundColor: '#333',
      padding: '10px',
    },
    navList: {
      listStyleType: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      gap: '15px',
    },
    navItem: {
      color: '#fff',
    },
    logoutButton: {
      backgroundColor: "transparent",
      border: "none",
      color: "#fff",
      cursor: "pointer",
      textDecoration: "underline",
    },
  };

export default Navbar;
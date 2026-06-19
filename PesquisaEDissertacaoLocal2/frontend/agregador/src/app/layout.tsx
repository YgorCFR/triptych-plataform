"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { getVerifyToken } from "./api/get";
import { clearLocalStorage, isAuthenticated } from "./helpers/auth";
import { NextScript } from "next/document";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Agregador",
//   description: "O agregador de trabalhos",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  useEffect(() => {
    async function verifyServerAuth() {
      let isServerAuthenticated = await getVerifyToken(window.localStorage.getItem("token"));
      return { "authenticated": isServerAuthenticated};
    }

    verifyServerAuth().then((res) => {
      if (!res.authenticated || !isAuthenticated()) {
        clearLocalStorage();
        router.push("/login");
      } else {
        setIsLoggedIn(true);
      }
    })

    typeof document !== 'undefined' ? require('bootstrap/dist/js/bootstrap.bundle.min.js') : null;
  }, [router, isLoggedIn]);
  
  return (  
    <html lang="en"> 
     <head>
      
     <link as="style"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
    <link as="style"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          rel="stylesheet"
        />
     </head>
      <body className={inter.className} suppressHydrationWarning={true}>
          
          <div id="root">
            { isLoggedIn ?  (<Navbar />) : <></>}
            <main>{children}</main>
          </div>
          {/* Add modal root */}
          <div id="modal-root"></div>
        </body>
    </html>
  );
}

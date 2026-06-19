'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthenticated } from './helpers/auth';
import { getVerifyToken } from './api/get';

 
export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    async function verifyServerAuth() {
      let isServerAuthenticated = await getVerifyToken(window.localStorage.getItem("token"));
      return { "authenticated": isServerAuthenticated};
    }

    verifyServerAuth().then((res) => {
      if (!res.authenticated || !isAuthenticated()) {
        router.push("/login");
      }
    })
  }, [router]);
  
  return <Link href="/dashboard">Dashboard</Link>
}
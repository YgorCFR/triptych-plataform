'use client';

import { useRouter } from "next/navigation";

export async function isAuthenticated() {
    
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        return !!token;
    }

    return false;
}

export function logout() {

    if (typeof window !== "undefined") {
        clearLocalStorage();
        window.location.reload();
    }
}

export function clearLocalStorage() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("isLogged");
        localStorage.removeItem("isLoggedRefresh");
    }
}
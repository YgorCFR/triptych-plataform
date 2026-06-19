'use client'

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import handler from "../api/login";

export default function Login() {
    const [email, setEmail] = useState<any>("");
    const [password, setPassword] = useState<any>("");
    const [error, setError] = useState<any>(null);
    const route = useRouter();

    async function handleSubmit (event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        setError(null);
        const response = await handler(formData);

        if (response.status == "success") {
            const data = response.data;
            localStorage.setItem("token", data.access_token);
            window.localStorage.setItem("isLogged", "true");  
            window.localStorage.setItem("isLoggedRefresh", "1");  
            route.push("/dashboard");                
        } else {
            console.log(response.data);
            setError("User or password are invalid");
        }
    };

    async function registerProfile(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        route.push("/register");
    }

    return (
        <div className="container text-center" style={{ width: "25%", marginTop: "10%" }}>
            <form className="text-center container mb-2" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="row text-start">
                <label className="form-label w-100">
                    Email: 
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control w-100"
                    />
                </label>
                </div>
                <div className="row text-start">
                <label className="form-label w-100 mb-2">
                    Password:
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control w-100 mb-2"
                    />
                </label>
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div>
                    <button type="submit" className="btn btn-primary w-100 mb-2">
                        Login
                    </button>
                </div>
                <div>
                    <button onClick={registerProfile} className="btn btn-secondary w-100 mb-2">
                        Register
                    </button>
                </div>
            </form>
            </div>
    );
}
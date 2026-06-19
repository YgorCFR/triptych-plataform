import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function handler(formData: FormData): Promise<any> {

    const loginData = {
        email: (formData.get("email") as string) || "",
        password: (formData.get("password") as string) || ""
    };

    console.log(loginData);
    try {
        const response = await fetch("http://localhost:8000/backend/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                username: loginData?.email,
                password: loginData.password
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { "data": data, "status": "success", "code": 200};
        } else {
            return { "data": null, "status": "error", "code": 401};
            
        }
    } catch (error) {
        return { "data": `${error}`, "status": "error", "code": 500};
    }
    
}
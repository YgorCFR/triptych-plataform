'use client'
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CallbackOsfComponent() {
  const searchParams = useSearchParams(); 
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  let codeFromUrl = searchParams.get("code");
  
  useEffect(() => {
    console.log(codeFromUrl);
    const callAPI = async() => {
        try{
            console.log(codeFromUrl);
            let response = await fetch('http://localhost:8000/backend/osf_token_callback', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({'code': codeFromUrl})
            });
            let data = await response.json();
            return data;
        } catch (err) {
            console.log(err);
        }
    };

    callAPI().then((data) => {
      console.log(data);
      window.localStorage.setItem("osf_application_token", data.access_token);
      console.log(data.access_token);
      setData(data.access_token);
      setLoading(false);
    });
    redirect('/dashboard');
  }, []);
  
  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>

  return (
    <p>
      {data}
    </p>
  )
}

export default function Page() {
  return (
  <Suspense fallback={<p>Loading...</p>}>
    <CallbackOsfComponent />
  </Suspense>
  )
}
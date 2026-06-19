"use server";
import { NextResponse } from "next/server";

export async function getDeposition(id: string | undefined , access_token: string | null) {

    const timeout = 5000; // Timeout in milliseconds (e.g., 5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
     console.log("Token para acessar api: ", access_token);
     console.log("URL a ser acessada: ", `https://zenodo.org/api/deposit/depositions/${id}`);
     let response: any = await fetch(`https://zenodo.org/api/deposit/depositions/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + access_token
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId);

      return await response.json();
       
    } catch (e) {
      
      console.error(e);
      return NextResponse.json({status: "fail", error: e});
    }
  }

export async function getOsfCurrentUser(access_token: string | null) {
    try {
        console.log("Token para acessar api: ", access_token);
        let response: any = await fetch('https://api.osf.io/v2/users/me/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        })
        .catch((e) => console.error(e));

        return await response.json();
    } catch (e) {
        console.error(e);
        return NextResponse.json({status: "fail", error: e});
    }
}

export async function getVerifyToken(access_token: string | null) {
    try {
        console.log("Verifying current api token: ", access_token);
        let response: any = await fetch("http://localhost:8000/backend/validate-token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            },
            body : JSON.stringify({
            })
        })
        .catch((e) => console.error(e));
        return await response.ok;
    } catch (e) {
        console.error(e);
        return NextResponse.json({status: "fail", error: e});
    }

}

export async function getTopics(user_token: string | null) {
    try {
        console.log("Verifying the user session token: ", user_token);
        let response: any = await fetch("http://localhost:8000/backend/list_topics", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user_token
            }
        })
        .catch((e) => console.error(e));

        return await response.json();
    } catch (e) {
        console.error(e);
        return NextResponse.json({status: "fail", error: e});
    }
}

export async function getUserMe(user_token: string | null) {
    try {
        console.log("Verifying the user session token: ", user_token);
        let response: any = await fetch("http://localhost:8000/backend/users/me", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user_token
            }
        })
        .catch((e) => console.error(e));

        return await response.json();
    } catch (e) {
        console.error(e);
        return NextResponse.json({status: "fail", error: e});
    }
}

export async function registerUser(user: FormData) {
    try {
      console.log("Creating a user");
      console.log({
        username: user.get("usuario"),
        password: user.get("password"),
        email: user.get("email")
      });
      let response: any = await fetch("http://localhost:8000/backend/users/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.get("usuario"),
          password: user.get("password"),
          email: user.get("email")
        })
      })
      .catch((e) => console.error(e));

      if (response.ok) {
        const data = await response.json();
        return { "data": data, "status": "success", "code": 200};
      } else {
          return { "data": null, "status": "error", "code": 401};          
      }

    } catch (error) {
      console.error(error);
      return { "data": `${error}`, "status": "error", "code": 500};
    }
}

export async function listGeneralProjects(token: string) {
    try {
      const response = await fetch("http://localhost:8000/backend/list_projects", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Error: ", errorData.detail);
      }
    } catch (error) {
      console.error("Erro inesperado ocorreu: ", error);
    }
  }

export async function getGeneralProject(token: string, project_id: string) {
    try {
        const response = await fetch(`http://localhost:8000/backend/get_project/${project_id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
    
        if (response.ok) {
          const result = await response.json();
          console.log(result.message);
          return result;
        } else {
          const errorData = await response.json();
          console.error("Error: ", errorData.detail);
        }
      } catch (error) {
        console.error("Erro inesperado ocorreu: ", error);
    }
}
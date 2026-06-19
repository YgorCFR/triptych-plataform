"use server";
import axios, { AxiosResponse } from "axios";
import { NextResponse } from "next/server";

export async function listDepositions(access_token: string | null) {

    try {
     console.log("Token para acessar api: ", access_token);
     let response: any = await fetch('https://zenodo.org/api/deposit/depositions', {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + access_token
        }
      })
      .catch((e) => console.error(e));
      
      return await response.json();
       
    } catch (e) {
      console.error(e);
      return NextResponse.json({status: "fail", error: e});
    }
  }

export async function listNodes(access_token: string | null, id: any) {
    try {
        console.log("Token para acessar api: ", access_token);
        let response: any = await fetch(`https://api.osf.io/v2/users/${id}/nodes/`, {
           method: 'GET',
           headers: {
              'Content-Type' : 'application/json',
              'Authorization' : 'Bearer ' + access_token
           } 
        })
        .catch((e) => console.error(e));

        return await response.json();
    } catch (e) {
        console.error(e);
        return NextResponse.json({status: "fail", error: e});
    }

}

export async function listNodeFiles(access_token: string | null, id: any) {
  try{
      console.log("Token para acessar api:", access_token);
      let response: any = await fetch(`https://api.osf.io/v2/nodes/${id}/files/osfstorage/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
      })
      .catch((e) => console.error(e))
      
      return await response.json()
  } catch (e) {
      console.error(e);
      return NextResponse.json({status: "fail", error: e});
  }
}
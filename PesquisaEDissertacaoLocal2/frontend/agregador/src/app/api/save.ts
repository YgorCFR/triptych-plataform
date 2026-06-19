"use server";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const flexibleFileTypes: string[] = [
  "application/json",
  "avro",
  "text/xml",
  "parquet",
  "text/csv",
  "text/plain"
];

const CHUNK_SIZE = 50 * 1024 * 1024;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function saveDeposition(formData: FormData, access_token: string | null) {

  try {
    console.log(formData);
    console.log(access_token);
    let response: any = await fetch('https://zenodo.org/api/deposit/depositions', {
      method: 'POST',
      headers: {
          'Content-Type' : 'application/json',
          'Authorization' : 'Bearer ' + access_token
      },
      body: JSON.stringify({"metadata": {
        "title": formData.get("title"),
        "upload_type": formData?.get("type") == undefined ? formData.get("type") : 'dataset',
        "description": formData.get("description")
      }})
    })
    
    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      return result;
    } else {
      console.log('erro');
      const errorData = await response.json();
      console.error("Error: ", errorData.detail);
    }

  } catch (e) {
    console.log('erro');
    console.error(e);
    return {
      zenodo : {
        id: ''
      }
    }
  }
}


export async function saveFile(formData: FormData, fileSize: any, fileType: any, access_token: string | null, id: string | undefined) {
  console.log(formData); 
  try {
    console.log(formData); 
    const file = formData.get("file") as File;
    console.log(flexibleFileTypes.includes(fileType));
    console.log(fileSize);
    if (flexibleFileTypes.includes(fileType)) {
      if (fileSize > 94371840) {
        console.log("OK");
        const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, fileSize);

          const chunk = file.slice(start, end);
          const fileChunk = new File(
            [chunk],
            `${file.name.split('.')[0]}-${("0000" + chunkIndex).slice(-4)}.${fileType}`,
            { type: fileType, lastModified: Date.now() }
          ) 
          const formDataChunk = new FormData();

          formDataChunk.append('file', fileChunk);
          await fetch(`https://zenodo.org/api/deposit/depositions/${id}/files`, {
            method: 'POST',
            headers: {
              'Authorization' : 'Bearer ' + access_token
            },
            body: formDataChunk   
          })
          
          await sleep(2000); 

        }
        return true;
      } 
    }

    
    const fd = new FormData();
    fd.append("file", file);
    let response: any = await fetch(`https://zenodo.org/api/deposit/depositions/${id}/files`, {
      method: 'POST',
      headers: {
        'Authorization' : 'Bearer ' + access_token
      },
      body: fd   
   })
    .then((res) => res.json())
    .catch((e) => console.error(e));

  } catch (e) {
    console.error(e);
    return NextResponse.json({status: "fail", error: e});
  }
}

export async function createOsfNode(formData: FormData, access_token: string | null) {
  try {
    console.log(formData);
    let content = JSON.stringify(
      {"data": {
           "type": "nodes",
           "attributes": {
             "title": formData.get("title"),
             "category": formData?.get("type") == undefined ? formData.get("type") : 'project',
             "description": formData.get("description")
           }
       }})
    console.log(content);
    let response = await fetch(`https://api.osf.io/v2/nodes/`, 
        { 
          method: 'POST',
          headers: {
            'Content-Type' : 'application/json', 
            'Authorization': 'Bearer ' + access_token
          },
          body: content
        }
    )
    
    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      return result;
    } else {
      const errorData = await response.json();
      console.error("Error: ", errorData.detail);
    }

  } catch (e) {
    console.error(e);
    return NextResponse.json({status: "fail", error: e});
  }
}

export async function saveOsfFile(formData: FormData, fileSize: any, fileType: any, access_token: string | null, id: string | undefined) {
  try {
    console.log(formData);
    const file = formData.get("file") as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(buffer);
    const fd = new FormData();
    fd.append("file", file);
    let response: any = await fetch(`https://files.osf.io/v1/resources/${id}/providers/osfstorage/?kind=file&name=${file.name}`, 
        { 
          method: 'PUT',
          headers: {
             'Authorization': 'Bearer ' + access_token
          },
          body: buffer
        }
    )
    .then((res) => { res.json()})
    .catch((e) => console.error(e));
  } catch (e) {
    console.error(e);
    return NextResponse.json({status: "fail", error: e});
  }
}



export async function createOsfFolder(access_token: string | null, id: string | undefined) {
  try {
    console.log(id);
    let response: any = await fetch(`https://files.osf.io/v1/resources/${id}/providers/osfstorage/?kind=folder&name=foo-folder`, 
        { 
          method: 'PUT',
          headers: {
             'Authorization': 'Bearer ' + access_token
          }
        }
    )
    .then((res) => res.json())
    .catch((e) => console.error(e));
  } catch (e) {
    console.error(e);
    return NextResponse.json({status: "fail", error: e});
  }
}

export async function createGeneralProject(project: FormData, token: string) {
  console.log(project);

  try {
    const response = await fetch("http://localhost:8000/backend/create_project", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: project
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

export async function updateGeneralProject(project: FormData, token: string, id: string) {
  console.log(project);

  try {
    const response = await fetch(`http://localhost:8000/backend/update_project/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: project
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

export async function createAxivArticle(formData: FormData) {
  try {
    console.log(formData);
    const file = formData.get("file") as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const requestBody = JSON.stringify(
      {
        fileName: fileName,
        file: arrayBufferToBase64(buffer),
        username: formData.get("user"),
        password: formData.get("password"),
        archive: formData.get("archive"),
        subject: formData.get("subject"),
        title: formData.get("title"),
        authors: formData.get("authors"),
        abstract: formData.get("abstract")
      }
    )

    let response: any = await fetch(`http://localhost:8000/backend/arxiv_upload_article`, 
        { 
          method: 'POST',
          body: requestBody
        }
    )
    
    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      return { "data": result, "status": "success", "code": 200};
    } else {
      const errorData = await response.json();
      console.error("Error: ", errorData.detail);
      return { "data": `${errorData.detail}`, "status": "error", "code": 400};
    }
  
  } catch (e) {
    console.error(e);
    return { "data": `${e}`, "status": "error", "code": 500};
  }
}

export async function translateContent(formData: FormData, token: string) {
    const requestBody = JSON.stringify({
        content: {
          titulo: formData.get("title"),
          assunto: formData.get("abstract")
        }
    });

    console.log(requestBody);
    console.log(token);

    let response: any = await fetch(`http://localhost:8000/backend/translate`,
      {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: requestBody
      }
    )

    if (response.ok) {
      
      const result = await response.json();
      console.log(result.message);
      return { "data": result, "status": "success", "code": 200};
    
    } else {
    
      const errorData = await response.json();
      console.error("Error: ", errorData.detail);
      return { "data": `${errorData.detail}`, "status": "error", "code": 400};
    
    }
}

// Function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


// // simulate a file from a input
// const file = new File(['a'.repeat(1000000)], 'test.txt')

// const chunkSize = 40000
// const url = 'https://httpbin.org/post'

// for (let start = 0; start < file.size; start += chunkSize) {
//   const chunk = file.slice(start, start + chunkSize)
//   const fd = new FormData()
//   fd.set('data', chunk)
  
//   await fetch(url, { method: 'post', body: fd }).then(res => res.text())
// }
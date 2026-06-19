"use client";

import { getDeposition, getGeneralProject } from "@/app/api/get";
import { listNodeFiles } from "@/app/api/list";
import { saveFile, saveOsfFile } from "@/app/api/save";
import { groupByPrefix, mergeFilesArrays, organizeFilesListInArrayDownloads } from "@/app/helpers/helper";
import MarkdownViewer from "@/components/MarkdownViewer";
import { useSearchParams } from "next/navigation";
import React, { createContext, Suspense, useEffect, useRef, useState } from "react";
import InfoGeralEditProject from "./edit/page";
import { InfoGeralUploadFileContext } from "./context/InfoGeralUploadFileContext";
import Link from "next/link";

function getFileExtension (filename: any) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop() || '' : '';
};

function splitFiles(inputFile: File): FormData[] {
    const chunkSize = 50 * 1024 * 1024;
    const totalChunks = Math.ceil(inputFile.size / chunkSize);
    const fileType = getFileExtension(inputFile.name);
    let arrayFormDataChunk: FormData[] = Array<FormData>();

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(inputFile.size, start + chunkSize);
        const chunk = inputFile.slice(start, end);

        const chunkFile = new File([chunk], `${inputFile.name.split('.')[0]}-${("0000" + chunkIndex).slice(-4)}.${fileType}`, {
            type: fileType,
            lastModified: Date.now()
        })

        console.log(chunkFile.size);

        const formDataChunk = new FormData();
        formDataChunk.append('file', chunkFile);
        arrayFormDataChunk.push(formDataChunk);
    }
    return arrayFormDataChunk;
}

function InfoGeralUploadFile() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id')?.toString();
    const name = searchParams.get('name')?.toString();
    const fileInput =  useRef<HTMLInputElement>(null);
    const [editPageTransferData, setEditPageTransferData] = useState<any>();
    const [showEditPage, setShowEditPage] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFileIsEmpty, setIsFileIsEmpty] = useState(true); 
    const [isGeneralProjectEmpty, setIsGeneralProjectEmpty] = useState(true);
    const [generalProject, setGeneralGetProject] = useState<any>();
    const [files, setFiles] = useState<any>();
    const [tags, setTags] = useState([{ key: "", value: "" }]);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    

    async function handleShowEditPage(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        if (event.currentTarget.value == "false") {
            setShowEditPage(true);
        } else {
            setShowEditPage(false);
        }
    }

    async function downloadFile(
        event: React.MouseEvent<HTMLButtonElement>,
        platform: string,
        filename: string
    ) {
        event.preventDefault();
        let eventValue = event.currentTarget.value;
        if (eventValue) {
            if (platform == "zenodo") {
                let token = window.localStorage.getItem("zenodo_application_token" );
                let downloadLinks = eventValue.replace(" ", "").split(",");
                for (let downloadLink of downloadLinks) {
                    // Fetch the content from the URL
                    const response = await fetch(downloadLink, {headers: {
                        'Authorization' : 'Bearer ' + token
                    }});

                    // Check if the response is okay (status 200-299)
                    if (!response.ok) {
                    throw new Error(`Failed to fetch the file: ${response.statusText}`);
                    }

                    // Convert the response to a blob
                    const blob = await response.blob();

                    // Create a temporary URL for the blob
                    const blobUrl = window.URL.createObjectURL(blob);

                    // Create an anchor element and trigger the download
                    const anchor = document.createElement('a');
                    anchor.href = blobUrl;
                    if (platform == 'zenodo') {
                        const contentList = downloadLink.split("/")
                        const sizeContentList = contentList.length
                        anchor.download = contentList[sizeContentList - 2];
                    }
                    // Append the anchor to the document
                    document.body.appendChild(anchor);
                    anchor.click();

                    // Clean up the URL and remove the anchor
                    window.URL.revokeObjectURL(blobUrl);
                    document.body.removeChild(anchor);
                }  
            } 
            if (platform == "osf") {
                let downloadLinks = eventValue.replace(" ", "").split(",");
                console.log(downloadLinks);
                for (let downloadLink of downloadLinks) {
                   // Create an anchor element
                    const anchor = document.createElement('a');
                    // Set the href to the download link
                    anchor.href = downloadLink;
                    // Open the link in a new tab or window
                    anchor.target = '_blank';
                    // Optional: Set the download attribute to specify the file name
                    if (filename) {
                        anchor.download = filename;
                    }
                    // Append the anchor to the document body
                    document.body.appendChild(anchor);
                    // Programmatically click the anchor to trigger the download
                    anchor.click();
                    // Remove the anchor from the document
                    document.body.removeChild(anchor);
                }
            }     
        }

    }

    async function uploadFile(
        event: React.FormEvent<HTMLFormElement>
    ) {
        
        event.preventDefault();
        setIsLoadingFile(true);

        let osfId: any = id?.split(":")[0]; 
        let zenodoId: any = id?.split(":")[1];

        if (fileInput.current && fileInput.current.files?.[0]) {

            const formData = new FormData();
            const file = fileInput.current.files[0];
            formData.append("file", file);
            console.log(file);
            const fileSize = file.size;
            
            let arrayFormDataChunk = splitFiles(file);

            for (let formDataChunk of arrayFormDataChunk) {
                console.log(formDataChunk);
                await Promise.all([
                    osfId && osfId.length > 0 ?
                        await fetch(`http://localhost:8000/backend/upload_file_in_chunks`, {
                            method: 'POST',
                            headers: {
                                'authorization' : 'Bearer ' + window.localStorage.getItem("osf_application_token"),
                                'type':  'osf',
                                'id': osfId
                            },
                            body: formDataChunk   
                        })
                    : null
                ,
                    zenodoId && zenodoId.length > 0 ?
                        await fetch(`http://localhost:8000/backend/upload_file_in_chunks`, {
                            method: 'POST',
                            headers: {
                                'authorization' : 'Bearer ' + window.localStorage.getItem("zenodo_application_token"),
                                'type':  'zenodo',
                                'id': zenodoId
                            },
                            body: formDataChunk   
                        })
                    : null
                ])
            }
        }

        setIsLoadingFile(false);
        window.location.reload();
     

        // await fetch(`http://localhost:8000/backend/upload_file_in_chunks`, {
        //     method: 'POST',
        //     headers: {
        //     'Authorization' : 'Bearer ' + window.localStorage.getItem("zenodo_application_token")
        //     },
        //     body: formData   
        // })
        // .catch((e) => console.error(e));
        
        //zenodoId?.length > 0 ? saveFile(formData, fileSize, fileType, window.localStorage.getItem("zenodo_application_token"), zenodoId) : null;
        //osfId?.length > 0 ? saveOsfFile(formData, fileSize, fileType, window.localStorage.getItem("osf_application_token"), osfId) : null;
        
    }

    useEffect( () => {
        
        async function initializeFilesLists() {
            return id;
        }

        async function callGetOsfFilesFromNode(nodeId: any) {
            const apiToken = window.localStorage.getItem("osf_application_token");
            console.log(nodeId);
            if (nodeId != undefined && nodeId?.length > 0) {
                let response: any = await fetch(`https://api.osf.io/v2/nodes/${nodeId}/files/osfstorage/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiToken
                    }
                  })
                  .catch((e) => console.error(e));  
                const responseListNodeFiles: any =  await response.json();
                let responseListNodeFilesData =  responseListNodeFiles.data;
                let nodeFilesData = responseListNodeFilesData != undefined ? responseListNodeFilesData.map((responseListNodeFilesData: any) => {
                        return {
                            id: responseListNodeFilesData.id,
                            filename: responseListNodeFilesData.attributes.name,
                            filesize: responseListNodeFilesData.attributes.size,
                            fileplatform: 'osf',
                            download: responseListNodeFilesData.links.download
                        }
                }) : [];
                return nodeFilesData;
            } else {
                return [];
            }
        }

        async function callGetZenodoFilesFromNode(depositionId: any) {
            const apitToken = window.localStorage.getItem("zenodo_application_token");
            console.log(depositionId);
            if (depositionId != undefined && depositionId?.length > 0) {
                console.log({
                    id: depositionId,
                    token: apitToken
                })
                console.log("Realizando requisição ao Zenodo.");
                // const responseListDepositionFiles = await getDeposition(depositionId, apitToken);
                const responseListDepositionFilesRes = await fetch(`https://zenodo.org/api/deposit/depositions/${depositionId}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${apitToken}` 
                    }
                });
                const responseListDepositionFiles: any = await responseListDepositionFilesRes.json();
                console.log(responseListDepositionFiles);
                let responseListDepositionFilesList = responseListDepositionFiles.files;
                let depositionFiles = responseListDepositionFilesList != undefined ? responseListDepositionFilesList.map((responseListDepositionFilesList: any) => {
                    return {
                        id: responseListDepositionFilesList.id,
                        filename: responseListDepositionFilesList.filename,
                        filesize: responseListDepositionFilesList.filesize,
                        fileplatform: 'zenodo',
                        download: responseListDepositionFilesList.links.download
                    }
                }) : [];
                return depositionFiles;
            } else {
                return [];
            }
        }

        async function callGEtGeneralProject(project_id: any) {
            const token = window.localStorage.getItem("token") ?? "";
            const responseGeneralProject = await getGeneralProject(token, project_id)
            return responseGeneralProject;
        }

        initializeFilesLists().then(async (identifier) => {
            // Zenodo id
            let zenodoId = identifier?.split(":")[1];
            // OSF id
            let osfId = identifier?.split(":")[0]; 
            // Internal id
            let internalId = identifier?.split(":")[2];
            console.log(internalId);
            // Retrieving data
            let osfData = await callGetOsfFilesFromNode(osfId);
            let zenodoData = await callGetZenodoFilesFromNode(zenodoId);
            // Merge two lists
            let filesData = await mergeFilesArrays(osfData, zenodoData);
            console.log(filesData);
            let gFilesData = await groupByPrefix(filesData, 'filename');
            let outGFilesData = await organizeFilesListInArrayDownloads(gFilesData);
            let generalGetProject = await callGEtGeneralProject(internalId);
            // Set General Projects
            console.log(generalGetProject);
            // 
            if (generalGetProject?.tags) setTags(generalGetProject?.tags);
            setGeneralGetProject(generalGetProject);
            setIsGeneralProjectEmpty(generalGetProject ? false : true);
            console.log(outGFilesData);
            // Set files
            setFiles(outGFilesData);
            // Set isFilesEmpty
            setIsFileIsEmpty(outGFilesData.length > 0 ? false : true);
            // Set isLoading to false
            setIsLoading(false);
            // Set Edit Transfer Data
            setEditPageTransferData(generalGetProject);

        } )
    }, []);

    return (
        <div className="container">
            {showEditPage ? <></> : (<div className="platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
              <form className="flex flex-col gap-4" onSubmit={uploadFile}>
                <label>
                  <span>Upload a file</span>
                  <input className="form-control" type="file" name="file" ref={fileInput} />
                </label>
                <button className="btn btn-primary" type="submit">
                  Submit
                </button>
              </form>
              {isLoadingFile ? (<p>Uploading file...</p>) : (<></>)}
            </div>)}
            {showEditPage ? <></> : (<div className="platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
                    {isLoading ? (<div>Loading...</div>) : (
                        
                        <div>
                            <h2>Projeto: {name}</h2>
                            {isFileIsEmpty ? (<div>No files</div>) : (
                                <table className="table table-hover table-striped table-sm" border={1}>
                                    <thead>
                                        <tr>
                                            <th scope="col">Name</th>
                                            <th scope="col">Size</th>
                                            <th scope="col">OSF</th>
                                            <th scope="col">Zenodo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {files.map((r: any, index: any) => (
                                        <tr key={index}>
                                        <td>{r.filename}</td>
                                        <td>{r.filesize}</td>
                                        <td>{r.download.opcao1 ? <button className="btn btn-primary" value={r.download.opcao1} onClick={(event) => downloadFile(event, 'osf', r.filename)}>Download</button>  : 'No link'}</td>
                                        <td>{r.download.opcao2 ? <button className="btn btn-primary" value={r.download.opcao2} onClick={(event) => downloadFile(event, 'zenodo', r.filename)}>Download</button> : 'No link'}</td>
                                        </tr>    
                                    ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="row">
                                <div className="col-md-12">
                                    <label htmlFor="" className="form-label">Extra attributes (tags)</label>
                                    <table className="table table-hover table-striped table-sm" border={1}>
                                        <thead>
                                            <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Value</th>                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tags.map((tag, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {tag.key}
                                                        </td>
                                                        <td>{tag.value}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
            </div>)}
            <div>
                <button className="btn btn-primary" value={showEditPage as any} onClick={handleShowEditPage}>{
                       showEditPage ? "Cancelar edição" :  "Editar projeto"
                }</button>
            </div>
            {showEditPage ? <></> :  (<div className="platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
                    {isGeneralProjectEmpty ? (<div>Loading...</div>) : (
                        <div>
                                Creation: 
                                <p>{generalProject.created_at}</p>
                                Description:
                                <div className="col-md-12">
                                    <div className="card">
                                        <div className="card-header"><h5>Markdown Preview:</h5></div>
                                        <div className="card-body">
                                            <div style={{ border: '1px solid #ddd', padding: '10px', marginTop: '10px', background: 'white' }}>
                                                <MarkdownViewer  content={generalProject.descricao} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    )
                    }
            </div>)}
            <div>
                { showEditPage ? (
                <InfoGeralUploadFileContext.Provider value={editPageTransferData}>
                    <InfoGeralEditProject />
                </InfoGeralUploadFileContext.Provider>) : <></>}
            </div>
        </div>
    )
}



export default function Page() {
    return (
        <Suspense fallback={
            <Link href="/general" />
        }>
            <InfoGeralUploadFile /> 
        </Suspense>
    )
}
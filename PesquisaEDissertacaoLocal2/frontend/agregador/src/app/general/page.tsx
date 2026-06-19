"use client";

import React, { useEffect, useRef, useState } from "react";
import { getOsfCurrentUser, getTopics, getUserMe, listGeneralProjects } from "../api/get";
import { listDepositions, listNodes } from "../api/list";
import Link from "next/link";
import { mergeArrays, removeDuplicatesByMultipleKeys } from "../helpers/helper";
import { createGeneralProject, createOsfNode, saveDeposition } from "../api/save";
import ProjectForm, { mapaDestinoProjeto } from "./project_form";
import ProjectProfileForm from "./project_form";
import ReactMarkdown from 'react-markdown';
import MarkdownViewer from "@/components/MarkdownViewer";

export default function InfoGeral() {
    
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<any>();
    const [userMe, setUserMe] = useState<any>();
    const [userMeIsSet, setUserMeIsSet] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<any>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [listTopics, setListTopics] = useState<any>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(true);
    const [markdownInput, setMarkdownInput] = useState('');
    const [topicInput, setTopicInput] = useState<any>('');
    const titleInput = useRef<HTMLInputElement>(null);
    const typeInput = useRef<HTMLInputElement>(null);
    const descriptionInput = useRef<HTMLTextAreaElement>(null);
    const [perfilProjeto, setPerfilProjeto] = useState<any>(null);
    const [filterText, setFilterText] = useState("");
    const [isLoadingRequest, setIsLoadingRequest] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [tags, setTags] = useState([{ key: "", value: "" }]);
    const [criarProjeto, setCriarProjeto] = useState(false);

    const mudarPerfil = (perfil: any) => {
        console.log(perfil);
        setPerfilProjeto(perfil);
    }

    // Handle change in input fields
    function handleInputChange(index: number, type: "key" | "value", value: string)  {
        const updatedTags = [...tags];
        updatedTags[index][type] = value;
        setTags(updatedTags);
    }

    // Add a new tag field
    function handleAddField() {
        setTags([...tags, { key: "", value: "" }]);
    }

    // Remove a tag field
    function handleRemoveField(index: number) {
        const updatedTags = tags.filter((_, i) => i !== index);
        setTags(updatedTags);
    }

    function changeTopicValue(inputValue: any ) {
        setTopicInput(inputValue);
    }

    function handleChangeCriarProjeto(flagValue: boolean) {
        setCriarProjeto(flagValue);
    }

    function handleFileChange(
        evt: React.ChangeEvent<HTMLInputElement>
    ) {
        const files = evt.target.files;

        if (files) {
            const newFiles = Array.from(files);
            const newPreviewImages = newFiles.map((file) => URL.createObjectURL(file));
        
            setSelectedFiles((prevFiles: any) => [...prevFiles, ...newFiles]);
            setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviewImages])
        }
    };

    function handleRemoveImage(
        index: number
    ) {
        setSelectedFiles((prevFiles: any) => prevFiles.filter((_: any, i: any) => i !== index));
        setPreviewImages((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    }

    async function createProject(
        evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
        evt.preventDefault();
        
        console.log("Analisando tags...");

        let localTags = await removeDuplicatesByMultipleKeys(tags, ["key", "value"]);

        if (localTags.length == 1) {
            if (localTags[0].key == "" && localTags[0].value == "") {
                localTags = [];
            }
        }

        if (!(titleInput?.current?.value! 
             && markdownInput
             && descriptionInput?.current?.value!
             && (topicInput != '0')
             && selectedFiles.length > 0)
        ) {
            alert('Por favor preencha todos os campos.');
            return false;
        }

        const formData = new FormData();

        setIsLoadingRequest(true);

        let user: any = await getUserMe(window.localStorage.getItem("token"));

        console.log(user);

        let project = {
            nome: titleInput?.current?.value!,
            markdown: markdownInput,
            id_author: user.id,
            id_topico: topicInput,
            id_osf: null,
            id_zenodo: null,
            tags: localTags
        }

        formData.append("title", titleInput?.current?.value!);
        formData.append("type", typeInput?.current?.value!);
        formData.append("description", descriptionInput?.current?.value!);
         
        console.log(selectedFiles);
        console.log(markdownInput);
        console.log(topicInput);
        console.log(perfilProjeto);
        
        const formDataCreateProject = new FormData();
        formDataCreateProject.append("project", JSON.stringify(project));
        
        for (let fileItem of selectedFiles) {
            formDataCreateProject.append("files", fileItem);
        }
        
        if (perfilProjeto == mapaDestinoProjeto[1]) {
            await fetch('https://zenodo.org/api/deposit/depositions', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : 'Bearer ' + window.localStorage.getItem("zenodo_application_token")
                },
                body: JSON.stringify({"metadata": {
                  "title": formData.get("title"),
                  "upload_type": formData?.get("type") == undefined ? formData.get("type") : 'dataset',
                  "description": formData.get("description")
                }})
              }).then(async (zenodoResponse) => {
                let osfResponse: any = await createOsfNode(formData, window.localStorage.getItem("osf_application_token"))
                let zenodoResponseJson = await zenodoResponse.json(); 
                console.log(zenodoResponseJson);
                return {
                    zenodo: zenodoResponseJson,
                    osf: osfResponse
                }

            }).then(async (res) => {
                console.log(res.zenodo.id);
                console.log(res.osf.data.id);
                formDataCreateProject.delete("project");

                let project = {
                    nome: titleInput?.current?.value!,
                    markdown: markdownInput,
                    id_author: user.id,
                    id_topico: topicInput,
                    id_osf: res.osf.data.id,
                    id_zenodo: res.zenodo.id,
                    tags: localTags
                }

                console.log(project);

                formDataCreateProject.append("project", JSON.stringify(project));
                await createGeneralProject(formDataCreateProject, window.localStorage.getItem("token") ?? "").then(() => {
                    setTimeout(() => {
                        
                    }, 2000);
                }).then(() => {
                    setIsLoadingRequest(false);
                    window.location.reload();
                });
                // window.location.reload();
            });
            
        }
        if (perfilProjeto == mapaDestinoProjeto[2]) { 
            saveDeposition(formData, window.localStorage.getItem("zenodo_application_token")).then(async (res) => {
                console.log(res.id);
                formDataCreateProject.delete("project");
                
                project.id_zenodo = res.id;

                formDataCreateProject.append("project", JSON.stringify(project));
                await createGeneralProject(formDataCreateProject, window.localStorage.getItem("token") ?? "").then(() => {
                    setTimeout(() => {
                        
                    }, 2000);
                }).then(() => {
                    setIsLoadingRequest(false);
                    window.location.reload();
                });
                // window.location.reload();
            });
        } 
        if (perfilProjeto == mapaDestinoProjeto[3]) {
            createOsfNode(formData, window.localStorage.getItem("osf_application_token")).then(async (res) => {
                console.log(res.data.id);
                return {
                    osf: res.data.id
                }
                // window.location.reload();
            }).then(async (res: any) => {
                formDataCreateProject.delete("project");
                
                project.id_osf = res.osf;

                formDataCreateProject.append("project", JSON.stringify(project));
                await createGeneralProject(formDataCreateProject, window.localStorage.getItem("token") ?? "").then(() => {
                    setTimeout(() => {
                        
                    }, 2000);
                }).then(() => {
                    setIsLoadingRequest(false);
                    window.location.reload();
                });
            });
        }

        
    }
    useEffect(() => {

        async function callListGeneralProjects() {
            const token = window.localStorage.getItem("token");
            const responseListGeneralProjects = await listGeneralProjects(token ?? "");
            console.log(responseListGeneralProjects);
            return responseListGeneralProjects.map((project: any) => {
                let plataforma = "";

                if (project.id_zenodo.length > 0 && project.id_osf.length > 0) {
                    plataforma = "zenodo/osf"
                } 
                else if (project.id_zenodo.length > 0) {
                    plataforma = "zenodo"
                }
                else if (project.id_osf.length > 0) {
                    plataforma = "osf"
                }
                

                return { 
                    id: `${project.id_osf}:${project.id_zenodo}:${project.id}`,
                    title: project.nome,
                    created: project.created_at,
                    platform: plataforma
                 }
            })
        }

        async function callUserMe() {
            const apiToken = window.localStorage.getItem("osf_application_token");
            const responseUserMe = await getOsfCurrentUser(apiToken);
            console.log(responseUserMe);
            setUserMe(responseUserMe);
            setUserMeIsSet(true);

            return { userMe: responseUserMe, userIsSetCondition: true }
        }

        async function callListNodes(user: any) {
            const userId = user.data.id;
            const apiToken = window.localStorage.getItem("osf_application_token");
            const responseListNodes = await listNodes(apiToken, userId);
            // console.log(responseListNodes);
            // setIsLoading(false);

            return { projects: responseListNodes.data }
        }

        async function callListDepositions() {
            const apiToken = window.localStorage.getItem("zenodo_application_token");
            const responseListDepositions = await listDepositions(apiToken);
            // console.log(responseListDepositions);
            // setIsLoading(false);

            return { projects: responseListDepositions }
        }

        async function callGetTopics() {
            const userToken = window.localStorage.getItem("token");
            const responseGetTopics = await getTopics(userToken);
            setTopicInput('0');

            return responseGetTopics
        }

        callUserMe().then(async (res) => {
            if (res.userIsSetCondition) {
                // let osfProjects = await callListNodes(res.userMe).then((osf) => {
                //     return osf.projects.map((project: any) => {
                //         return { 
                //             id: project.id,
                //             title: project.attributes.title,
                //             created: project.attributes.date_created,
                //             platform: "osf"
                //          }
                //     })
                // });
                // let zenodoProjects = await callListDepositions().then((zenodo) => {
                //     return zenodo.projects.map((project: any) => {
                //         return {
                //             id: project.id.toString(),
                //             title: project.title,
                //             created: project.created,
                //             platform: "zenodo"
                //         }
                //     })
                // });

                let generalProjects = await callListGeneralProjects();

                //let projects = await mergeArrays(osfProjects, zenodoProjects);
                // let projects = [...osfProjects, ...zenodoProjects] 
                setProjects(generalProjects);
                setIsLoading(false);
            }
        }).then(async (res) => {
            await callGetTopics().then((res) => {
                setListTopics(res);
                setIsLoadingTopics(false);
            })
        });
    },[]);

    return (
        <div className="container">
            {criarProjeto ? (<div>
                <button className="btn btn-primary" onClick={() => setCriarProjeto(false)}>Close project creation</button>
                <ProjectProfileForm onPerfilProjetoChange={mudarPerfil}></ProjectProfileForm>
            </div>) : (<button className="btn btn-primary"  onClick={() => setCriarProjeto(true)}>Create project</button>)}
            {perfilProjeto ? (<div className="container platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
              <form className="flex flex-col gap-4">
                <div className="row">  
                    <div className="col-md-12">
                        <label className="form-label">Article title</label>
                        <input className="form-control"  type="text" name="title" ref={titleInput}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <label className="form-label">Short description</label>
                        <textarea className="form-control" 
                        name="description" ref={descriptionInput}></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <label className="form-label" htmlFor="markdown">Long description (Markdown):</label>
                        <textarea
                            id="markdown"
                            className="form-control"
                            value={markdownInput}
                            onChange={(e) => {setMarkdownInput(e.target.value);
                                              
                            }}
                            rows={10}
                            cols={50}
                            placeholder="Enter project description in markdown"
                        />
                    </div>
                </div>
                <div className="row">
                    {isLoadingTopics ? <></> : ( 
                    <div className="col-md-12">
                        <label htmlFor="" className="form-label">Topic</label>
                        <select className="form-select"
                            value={topicInput}
                            onChange={(e) => {
                                changeTopicValue(e.target.value);
                            }}
                            >
                            <option disabled value={'0'}>Select a option...</option>
                            {listTopics.map((topic: any) => (
                                <option value={`${topic.id}`}>{topic.nome_topico}</option>
                            ))}
                        </select>
                    </div>
                   )}
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <label htmlFor="" className="form-label">Load files</label>
                        <input className="form-control" ref={selectedFiles} type="file" multiple accept="image/*" onChange={handleFileChange} />
                        <div className="row">
                            {previewImages.map((imgSrc, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <img src={imgSrc} alt={`preview-${index}`} width="100px" />
                                <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    background: 'red',
                                    color: 'white',
                                    border: 'round',
                                    cursor: 'pointer',
                                }}
                                >
                                X
                                </button>
                            </div>
                            ))}
                        </div>
                    </div>

                </div>
                <div className="row">
                    <div className="col-md-12">
                        <label htmlFor="" className="form-label">Atributos extras (tags)</label>
                        {tags.map((tag, index) => (
                            <div className="row" key={index} style={{ marginBottom: "10px" }}>
                                <div className="col-md-4">
                                <input
                                    type="text"
                                    placeholder="Preencha o nome do seu atributo..."
                                    className="form-control"
                                    value={tag.key}
                                    onChange={(e) => handleInputChange(index, "key", e.target.value)}
                                />
                                </div>
                                <div className="col-md-4">
                                <input
                                    type="text"
                                    placeholder="Preencha o valor do seu atributo..."
                                    className="form-control"
                                    value={tag.value}
                                    onChange={(e) => handleInputChange(index, "value", e.target.value)}
                                />
                                </div>
                                <div className="col-md-4">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleRemoveField(index)}
                                >
                                    Remove
                                </button>
                                </div>
                            </div>
                        ))}

                        <button type="button" className="btn btn-primary" onClick={handleAddField}>
                        Add More
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <button className="btn btn-primary" type="submit" onClick={createProject}>
                    Create Project
                    </button>
                </div>
              </form>
              {/* Markdown preview */}
            <div style={{marginTop: '20px'}}>
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header"><h5>Markdown Preview:</h5></div>
                        <div className="card-body">
                            <div style={{ border: '1px solid #ddd', padding: '10px', marginTop: '10px', background: 'white' }}>
                                <MarkdownViewer  content={markdownInput} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>) : (<></>)}
            {isLoadingRequest ?  (<div>Loading...</div>): (<div>{isLoading  ? (<div>Loading ...</div>) :  
                   (
                    <div className="container platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
                      <h1>Results</h1>

                        {/* Filter Input */}
                        <div style={{ marginBottom: "10px" }}>
                            <label htmlFor="filter" style={{ marginRight: "10px" }}>
                                Filter by Title:
                            </label>
                            <input
                                id="filter"
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Digite o título para filtrar"
                                className="form-control"
                                style={{ width: "300px", display: "inline-block" }}
                            />
                        </div>

                        {/* Table */}
                        <table className="table table-hover table-striped table-sm" border={1}>
                            <thead>
                                <tr>
                                    <th scope="col">Action</th>
                                    <th scope="col">Title</th>
                                    <th scope="col">Created at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects
                                    .filter((project: any) =>
                                        project.title.toLowerCase().includes(filterText.toLowerCase())
                                    )
                                    .map((r: any, index: any) => (
                                        <tr key={index}>
                                            <td>
                                                <Link
                                                    href={{
                                                        pathname: `/general/details`,
                                                        query: { id: r.id, name: r.title },
                                                    }}
                                                >
                                                    Access
                                                </Link>
                                            </td>
                                            <td>{r.title}</td>
                                            <td>{r.created}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                   )
                }</div>)}
        </div>
    )

}
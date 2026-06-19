"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import React, { FormEvent, useRef, useState } from "react";
import { createAxivArticle, translateContent } from "../api/save";
import arxivConstant from "./arxivsubjects";
import Modal from "@/components/Modal";


function UploadForm() {
    const userInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const [titleInput, setTitleInput] = useState<any>(null);
    const authorsInput = useRef<HTMLInputElement>(null);
    const [abstractInput, setAbstractInput] = useState<any>(null);
    const [archiveClassInput, setArchiveClassInput] = useState("default");
    const [subjectClassInput, setSubjectClassInput] = useState("default");
    const [tempAbstractInput, setTempAbstractInput] = useState<any>(null);
    const [tempTitleInput, setTempTitleInput] = useState<any>(null);
    const arxivClassesKeys = Object.keys(arxivConstant);
    const arxivClasses = arxivConstant;
    const [arxivClassesSubjects, setArxivClassesSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [success, setSuccess] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showCriarArtigo, setShowCriarArtigo] = useState(false);
    const [showConfirmarConteudo, setShowConfirmarConteudo] = useState(true);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleConfirmModal = () => {
        setTempAbstractInput(abstractInput);
        setTempTitleInput(titleInput);
        setTitleInput(null);
        setAbstractInput(null);
        setIsConfirmModalOpen(!isConfirmModalOpen);
    }

    async function translateFields(
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
        event.preventDefault();
        const formData = new FormData();
        formData.append("title", tempTitleInput);
        formData.append("abstract", tempAbstractInput);

        setAbstractInput(tempTitleInput);
        setTitleInput(tempAbstractInput);
        console.log(formData);
        console.log(tempTitleInput);
        console.log(tempAbstractInput);

        let token = window.localStorage.getItem("token");
        console.log(token);
        let resposta: any = await translateContent(formData, token || "");
        console.log(resposta);

        if (resposta.status == "success") {
            let conteudo = resposta.data;
            setTempTitleInput(conteudo.titulo);
            setTempAbstractInput(conteudo.assunto);
            setIsConfirmModalOpen(true);
        } else {
            setError(resposta.data);
        }

    }

    async function confirmFieldsTranslation(
        fields: { title: string, abstract: string }
    ) {
        setTitleInput(fields.title);
        setAbstractInput(fields.abstract);
        setShowConfirmarConteudo(false);
        setShowCriarArtigo(true);
        setIsConfirmModalOpen(false);
    }



    async function createArticle(
        evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
        evt.preventDefault();
        setSuccess(false);
        setError(false);
        setIsLoading(true);

        const formData = new FormData();
        formData.append("user", userInput?.current?.value!);
        formData.append("password", passwordInput?.current?.value!);
        formData.append("file", fileInput?.current?.files?.[0]!);
        formData.append("archive", archiveClassInput);
        formData.append("subject", subjectClassInput);
        formData.append("title", titleInput);
        formData.append("authors", authorsInput?.current?.value!);
        formData.append("abstract", abstractInput);        
        let resposta: any = await createAxivArticle(formData);

        if (!(
            userInput?.current?.value! &&
            passwordInput?.current?.value! &&
            fileInput?.current?.files?.[0]! && 
            archiveClassInput &&
            subjectClassInput &&
            titleInput &&
            authorsInput?.current?.value! &&
            abstractInput
        )) {
            alert("É obrigatório preencher todos os campos do formulário.");
            setIsLoading(false);
            return null;
        }

        setIsLoading(false);

        if (resposta.status == "success") {
            setSuccess("Artigo submetido no Arxiv com sucesso!");
        }
        else {
            setError(`Erro ao submeter artigo, por favor, verifique no site da plataforma se o
                 seu do Arxiv possui as permissões necessárias para submeter artigos. ${resposta.data}`);
        }
    }

    function removeParenthesis(input: string) {
        return input.replace(/\s*\(.*?\)\s*/g, '').trim();
    }

    return (
        <div className="container">
            
                
            <div className="container platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
            <button type="button" className="btn btn-primary" 
                                    onClick={toggleModal}>
            Important Information
            </button>
                <Modal isOpen={isModalOpen} onClose={toggleModal}>   
                  <div className="container">
                    <div className="card">
                        <div className="card-header">Step by step</div>
                        <div className="card-body">
                        Follow the steps carefully to have your article submitted.
                                <ul>
                                    <li>1. Write all fields, <b>especially the subject field</b> in English and without special characters.</li>
                                    <li>2. Preferably insert .zip files. The file must be generated according to the step-by-step instructions in the images below:
                                        <div className="row">
                                            <Image alt="test" style={{marginTop: "15px"}} src="/passo2.png" width={1000} height={400} />
                                            <br/>
                                            <Image alt="test" style={{marginTop: "15px"}} src="/passo1.png" width={1000} height={400} />
                                            <br/>
                                            <br />
                                            <Image alt="test" style={{marginTop: "15px"}} src="/passo3.png" width={1000} height={400} />
                                            <br/>
                                            <br />
                                            <Image alt="test" style={{marginTop: "15px"}} src="/passo4.png" width={1000} height={500} />
                                            <br/>
                                            
                                        </div>
                                    </li>
                                    <li>3. After downloading the .zip file, enter your Arxiv username and password, you must be registered on the platform. ref: <a href="https://info.arxiv.org/help/endorsement.html">Visit the documentation page</a> </li>
                                    <li>4. The completed title must be in English, without special characters, or in Portuguese without spaces between words.</li>
                                    <li>5. The subject must be strictly written in English and without special characters.</li>
                                    <li>6. When choosing an area, choose the Area to which your Arxiv user has permissions to post. Preferably, the area you selected when registering.</li>
                                    <li>7. When choosing a sub-area, choose the sub-area to which your Arxiv user has permissions to post. Preferably, the sub-area you selected when registering.</li>
                                    <li>8. arxiv works with a scheme called "Endorsement", that is, its user must be authorized to submit pre-prints. If your submission is not authorized, an error will be returned.</li>
                                    <li>9. To analyze the error that occurs when the message is returned in red and can be checked on the Arxiv page. </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={isConfirmModalOpen} onClose={toggleConfirmModal}>
                    <div className="container">
                        <div className="card">
                            <div className="card-header">Confirmar campos?</div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <textarea value={tempTitleInput} id="" className="form-control"/>
                                    </div>
                                    <div className="col-md-6">
                                        <textarea value={tempAbstractInput} id="" className="form-control"/>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="row">
                                    <div className="col-md-6">
                                        <button className="btn btn-primary" onClick={() => {confirmFieldsTranslation({
                                            title: tempTitleInput,
                                            abstract: tempAbstractInput
                                        })} }>
                                            Confirm
                                        </button>
                                        <button className="btn btn-primary" onClick={toggleConfirmModal}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>

                <h2 className="form-title">Create a pre-print with Arxiv</h2>
                <form className="flex flex-col gap-4">
                    <div className="row">  
                        <div className="col-md-12">
                            <label>Arxiv's usernmae</label>
                            <input className="form-control" type="text" name="title" ref={userInput}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <label>Arxiv's password</label>
                            <input className="form-control" type="password" name="password" ref={passwordInput}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <label>Title</label>
                            <input className="form-control" value={tempTitleInput || ""} type="text" name="title" onChange={(e) => setTempTitleInput(e.target.value)}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <label>Authors</label>
                            <input className="form-control" type="text" name="authors" ref={authorsInput}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <label>Subject</label>
                            <textarea className="form-control" value={tempAbstractInput || ""}name="abstract" onChange={(e) => setTempAbstractInput(e.target.value)}></textarea>
                        </div>
                    </div>
                    
                    <div className="row">
                            <div className="col-md-4">
                                <label>Upload a file</label>
                                <input className="form-control" type="file" name="file" ref={fileInput} />
                        
                            </div>
                            <div className="col-md-4">
                                <label>Area</label>
                                <select
                                    value={archiveClassInput}
                                    onChange={(e) => {
                                        setArchiveClassInput(e.target.value);
                                        setArxivClassesSubjects(arxivClasses[e.target.value]);
                                    }}
                                    className="form-control">
                                    {arxivClassesKeys.map((arxivClass) => (
                                        <option value={arxivClass}>{arxivClass}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label>Sub-Area</label>
                                <select className="form-control"
                                    value={subjectClassInput}
                                    onChange={(e) => {
                                        setSubjectClassInput(e.target.value);
                                    }}
                                    >
                                    {arxivClassesSubjects.map((subject) => (
                                        <option value={removeParenthesis(subject)}>{removeParenthesis(subject)}</option>
                                    ))}
                                </select>
                            </div>
                    </div>
                    {showCriarArtigo ? <button type="submit" className="btn btn-primary" onClick={createArticle}>
                    Create pre-print Article
                    </button> : <></>}
                    {showConfirmarConteudo ? <button type="button" className="btn btn-primary" onClick={translateFields}>
                    Confirm
                    </button> : <></>}
                </form>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{color: "green"}}>{success}</p>}
                {isLoading && <p style={{color: "blue"}}>Loading...</p>}
            </div>
        </div>
    )
}

export default dynamic(() => Promise.resolve(UploadForm), { ssr: false });
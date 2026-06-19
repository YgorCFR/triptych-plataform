"use client";

import { useContext, useState, useRef, useEffect } from "react";

import MarkdownViewer from "@/components/MarkdownViewer";
import { updateGeneralProject } from "@/app/api/save";
import SpinnerModal from "@/components/SpinnerModal";
import { removeDuplicatesByMultipleKeys } from "@/app/helpers/helper";
import { InfoGeralUploadFileContext } from "../context/InfoGeralUploadFileContext";

export default function InfoGeralEditProject() {
    const [markdownInput, setMarkdownInput] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<any>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isLoadingRequest, setIsLoadingRequest] = useState(false);
    const [tags, setTags] = useState([{ key: "", value: "" }]);
    const contextValue = useContext(InfoGeralUploadFileContext);

    useEffect(() => {
        console.log(contextValue);
        setMarkdownInput(contextValue.descricao);
        setTags(contextValue.tags);
    }, []);

    // Create a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

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


    function handleFileChange(
        evt: React.ChangeEvent<HTMLInputElement>
    ) {
        const files = evt.target.files;

        if (files) {
            const newFiles = Array.from(files);
            const newPreviewImages = newFiles.map((file) => URL.createObjectURL(file));

            setSelectedFiles((prevFiles: any) => [...prevFiles, ...newFiles]);
            setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviewImages]);
        }
    }

    function handleRemoveImage(index: number) {
        setSelectedFiles((prevFiles: any) => prevFiles.filter((_: any, i: any) => i !== index));
        setPreviewImages((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    }

    async function editProject(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        evt.preventDefault();
        setIsLoadingRequest(true);
        console.log(evt);
        console.log(selectedFiles);
        console.log(markdownInput);
        console.log(selectedFiles.length);

        console.log("Analisando tags...");

        let localTags = await removeDuplicatesByMultipleKeys(tags, ["key", "value"]);

        if (localTags.length == 1) {
            if (localTags[0].key == "" && localTags[0].value == "") {
                localTags = [];
            }
        }

        const formData = new FormData();

        let project_id = contextValue.id;

        let project: any = {
            nome: contextValue.nome,
            markdown: markdownInput,
            id_author: contextValue.id_autor,
            id_topico: contextValue.id_topico,
            tags: contextValue.tags
        }

        const formDataCreateProject = new FormData();
        
        
        for (let fileItem of selectedFiles) {
            formDataCreateProject.append("files", fileItem);
        }

        
        if (contextValue.hasOwnProperty("images_urls")) {
            if ( JSON.parse(contextValue.images_urls).length > 0 ) {
                project["images_urls"] = contextValue.images_urls;
            }
        }
        
        formDataCreateProject.append("project", JSON.stringify(project));

        await updateGeneralProject(formDataCreateProject, window.localStorage.getItem("token") ?? "", project_id).then(() => {
            setIsLoadingRequest(false);
            window.location.reload();
        });
    }

    return (
        <div className="container platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
            <div className="row" style={{marginTop: "5px", marginBottom: "5px"}}>
                <h2>Edit project {contextValue.nome}</h2>
            </div>
            <form className="flex flex-col gap-4">
                <div className="row" style={{marginTop: "5px", marginBottom: "5px"}}>
                    <div className="col-md-12">
                        <label className="form-label" htmlFor="markdown">Project description (Markdown):</label>
                        <textarea
                            id="markdown"
                            className="form-control"
                            value={markdownInput}
                            onChange={(e) => setMarkdownInput(e.target.value)}
                            rows={10}
                            cols={50}
                            placeholder="Enter project description in markdown"
                        />
                    </div>
                </div>
                <div className="row" style={{marginTop: "5px", marginBottom: "5px"}}>
                    <div className="col-md-12">
                        <input
                            className="form-control"
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                        />
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
                        <label htmlFor="" className="form-label">Extra attributes (tags)</label>
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
                                    Remover
                                </button>
                                </div>
                            </div>
                        ))}

                        <button type="button" className="btn btn-primary" onClick={handleAddField}>
                        Add more
                        </button>
                    </div>
                </div>
                <div className="row" style={{marginTop: "5px", marginBottom: "5px"}}>
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
            </form>
            <button type="submit" onClick={editProject} className="btn btn-primary">
                    Confirm change
            </button>
            <SpinnerModal isOpen={isLoadingRequest}/>
        </div>
    );
}

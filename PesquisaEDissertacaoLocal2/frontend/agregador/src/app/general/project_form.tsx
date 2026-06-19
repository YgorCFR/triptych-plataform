"use client";

import React, { useState } from "react"

type MapaDestinoProjeto = {
    [codigoDestino: number]: string;
}

type ProjectProfileFormProps = {
    onPerfilProjetoChange: (perfil: string) => void;
}

export const mapaDestinoProjeto: MapaDestinoProjeto = {
    1: "Zenodo/OSF",
    2: "Zenodo",
    3: "OSF"
};

const ProjectProfileForm: React.FC<ProjectProfileFormProps> = ({onPerfilProjetoChange}) => {

    const [resposta1Option, setResposta1Option] = useState<string>('option1');
    const [resposta2Option, setResposta2Option] = useState<string>('option2');
    const [resposta3Option, setResposta3Option] = useState<string>('option3');
    const [resposta4Option, setResposta4Option] = useState<string>('option4');
    const [resposta5Option, setResposta5Option] = useState<string>('option5');
    const [resposta6Option, setResposta6Option] = useState<string>('option6');
    const [resposta7Option, setResposta7Option] = useState<string>('option7');
    const [perfilCriacaoProjeto, setPerfilCriacaoProjeto] = useState<any>(null);
    const [confirmaPerfilProjeto, setConfirmaPerfilProjeto] = useState<boolean>(false);
    

    const definirPerfilProjeto = () => {
        onPerfilProjetoChange(perfilCriacaoProjeto);
    }
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event)
        if (event.target.name == "option1") {
            setResposta1Option(event.target.value);
            if (event.target.value == "sim") {
                setResposta2Option("option2");
                setResposta3Option("option3");
                setResposta4Option("option4");
                setResposta5Option("option5");
                setResposta6Option("option6");
                setResposta7Option("option7");
                setPerfilCriacaoProjeto(mapaDestinoProjeto[1]);
                setConfirmaPerfilProjeto(true);
            } else {
                setPerfilCriacaoProjeto(null);
                setConfirmaPerfilProjeto(false);
            }
        }
        else if (event.target.name == "option2") {
            setResposta2Option(event.target.value);
            if (event.target.value == "sim") {
                setResposta3Option("option3");
                setResposta4Option("option4");
                setResposta5Option("option5");
                setResposta6Option("option6");
                setResposta7Option("option7");
                setPerfilCriacaoProjeto(mapaDestinoProjeto[1]);
                setConfirmaPerfilProjeto(true);
            } else {
                setPerfilCriacaoProjeto(null);
                setConfirmaPerfilProjeto(false);
            }
        }
        else if (event.target.name == "option3") {
            setResposta3Option(event.target.value); 
            if (event.target.value == "sim") {
                setResposta5Option("option5");
                setResposta6Option("option6");
                setResposta7Option("option7");
            } 
            setConfirmaPerfilProjeto(false);
            setPerfilCriacaoProjeto(null);
        }
        else if (event.target.name == "option4") {
            setResposta4Option(event.target.value); 
            if (event.target.value == "sim") {
                setPerfilCriacaoProjeto(mapaDestinoProjeto[2]);
            }
            else {
                setPerfilCriacaoProjeto(mapaDestinoProjeto[1]);
            }
            setConfirmaPerfilProjeto(true);
        }
        else if (event.target.name == "option5") {
            setResposta5Option(event.target.value);
            if (event.target.value == "sim") {
                setResposta6Option("option6");
                setResposta7Option("option7");
                setPerfilCriacaoProjeto(mapaDestinoProjeto[3]);
                setConfirmaPerfilProjeto(true);
            } else {
                setPerfilCriacaoProjeto(null);
                setConfirmaPerfilProjeto(false);
            }
        }
        else if (event.target.name == "option6") {
            setResposta6Option(event.target.value);
            if (event.target.value == "sim") {
                setResposta7Option("option7");
                setPerfilCriacaoProjeto(mapaDestinoProjeto[3]);
                setConfirmaPerfilProjeto(true);
            } else {
                setPerfilCriacaoProjeto(null);
                setConfirmaPerfilProjeto(false);
            }
        }
        else if (event.target.name == "option7") {
            setResposta7Option(event.target.value); 
            if (event.target.value == "sim") {
                setPerfilCriacaoProjeto(mapaDestinoProjeto[3]);
            } else {
                setPerfilCriacaoProjeto(mapaDestinoProjeto[1]);
            }
            setConfirmaPerfilProjeto(true);
        }
        
    }
    

    return (
        <div className="platform-default-font-characterist alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color">
            <h3>Answer the questions before creating your project:</h3>
            <form>
                <div>
                    <label className="form-label">1.Would you like to follow the platform's default project storage? (Recommended for general purpose projects such as articles, data sample deposits and documents)</label>
                    
                    <div className="form-check">                    
                            <input
                            className="form-check-input" 
                            name="option1"
                            type="radio"
                            value="sim"
                            checked={resposta1Option == 'sim'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            Yes
                        </label>

                    </div>
                    
                    <div className="form-check">
                            <input
                            className="form-check-input" 
                            name="option1"
                            type="radio"
                            value="nao"
                            checked={resposta1Option == 'nao'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            No
                        </label>
                    </div>
                </div>

                {resposta1Option == "nao" ? (<div className="mb-3">
                    <label className="form-label">2.Is data replication and high availability your top priority? Regardless of how the data is organized?</label>
                    
                    <div className="form-check">                    
                            <input
                            className="form-check-input" 
                            name="option2"
                            type="radio"
                            value="sim"
                            checked={resposta2Option == 'sim'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            Yes
                        </label>

                    </div>
                    
                    <div className="form-check">
                            <input
                            className="form-check-input" 
                            name="option2"
                            type="radio"
                            value="nao"
                            checked={resposta2Option == 'nao'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            No
                        </label>
                    </div>
                </div>) : (<></>)}

                {resposta2Option == "nao" ? (<div className="mb-3">
                    <label className="form-label">3.Will your data be software packaged in .zip? Is integration with github something more important for your project? Do you want to integrate your GitHub code with your data repository?</label>
                    
                    <div className="form-check">                    
                            <input
                            className="form-check-input" 
                            name="option3"
                            type="radio"
                            value="sim"
                            checked={resposta3Option == 'sim'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            Yes
                        </label>

                    </div>
                    
                    <div className="form-check">
                            <input
                            className="form-check-input" 
                            name="option3"
                            type="radio"
                            value="nao"
                            checked={resposta3Option == 'nao'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            No
                        </label>
                    </div>
                </div>) : (<></>)}

                {resposta3Option == "sim" ? (<div className="mb-3">
                    <label className="form-label">3.1.Is your project reproducible code in Jupyter Notebook/ Notebook that suits Data Analysis, Data Science or Machine Learning scenarios? What about environments like Python, Conda environment, Python Package, Julia environment or R script? https://mybinder.readthedocs.io/en/latest/examples/sample_repos.html</label>
                     <div className="form-check">
                                          
                            <input
                            className="form-check-input" 
                            name="option4"
                            type="radio"
                            value="sim"
                            checked={resposta4Option == 'sim'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            Yes
                        </label>
                    </div>
                    <div className="form-check">
                            <input
                            className="form-check-input" 
                            name="option4"
                            type="radio"
                            value="nao"
                            checked={resposta4Option == 'nao'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            No
                        </label>
                    </div>
                </div>) : (<></>)}

                {resposta3Option == "nao" ? (<div className="mb-3">
                    <label className="form-label">4.Your project will contain subprojects in the future so you can organize it as folders
                    or several different subject components in these subfolders?</label>
                    
                    <div className="form-check">                    
                            <input
                            className="form-check-input" 
                            name="option5"
                            type="radio"
                            value="sim"
                            checked={resposta5Option == 'sim'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            Yes
                        </label>

                    </div>
                    
                    <div className="form-check">
                            <input
                            className="form-check-input" 
                            name="option5"
                            type="radio"
                            value="nao"
                            checked={resposta5Option == 'nao'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            No
                        </label>
                    </div>
                </div>) : (<></>)}

                {resposta5Option == "nao" ? (<div className="mb-3">
                    <label className="form-label">5.Do you want to add storage add-ons to your project in the future?
                    Such as Amazon S3, Google Drive, DropBox, BitBucket, figshare, Dataverse.</label>
                    
                    <div className="form-check">                    
                            <input
                            className="form-check-input" 
                            name="option6"
                            type="radio"
                            value="sim"
                            checked={resposta6Option == 'sim'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            Yes
                        </label>

                    </div>
                    
                    <div className="form-check">
                            <input
                            className="form-check-input" 
                            name="option6"
                            type="radio"
                            value="nao"
                            checked={resposta6Option == 'nao'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            No
                        </label>
                    </div>
                </div>) : (<></>)}

                {resposta6Option == "nao" ? (<div className="mb-3">
                    <label className="form-label">6.You want to track changes to your files in your project and statistics
                    How do users interact with their data files?</label>
                    
                    <div className="form-check">                    
                            <input
                            className="form-check-input" 
                            name="option7"
                            type="radio"
                            value="sim"
                            checked={resposta7Option == 'sim'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            Yes
                        </label>

                    </div>
                    
                    <div className="form-check">
                            <input
                            className="form-check-input" 
                            name="option7"
                            type="radio"
                            value="nao"
                            checked={resposta7Option == 'nao'}
                            onChange={handleChange}
                            />
                        <label className="form-check-label">
                            No
                        </label>
                    </div>
                </div>) : (<></>)}
            </form>
            {confirmaPerfilProjeto ? (<div className="mt-4">
                    <button className="btn btn-primary" onClick={definirPerfilProjeto}>Confirmar perfil</button>
                </div>) : (<></>)}
        </div>
    )
}

export default ProjectProfileForm;
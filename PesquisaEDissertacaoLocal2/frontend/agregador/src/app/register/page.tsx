"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import handler from "../api/login";
import universidadesConstant from "./universidades";
import { registerUser } from "../api/get";

export default function Register() {

    const [email, setEmail] = useState<any>("");
    const [password, setPassword] = useState<any>("");
    const [usuario, setUsuario] = useState<any>("");
    
    const [respostaPossuiZenodo, setRespostaPossuiZenodo] = useState<string>('possuiZenodo');
    const [respostaPossuiOSF, setRespostaPossuiOSF] = useState<string>('possuiOSF');
    const [respostaPossuiArXiv, setRespostaPossuiArXiv] = useState<string>('possuiArXiv');
    const [universidadesClassInput, setUniversidadesClassInput] = useState("default");
    const universidadesList: any = universidadesConstant;

    const [error, setError] = useState<any>(null);
    const [success, setSuccess] = useState<any>(null);
    const route = useRouter();

    function handleChange (event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.name == "possuiZenodo") {
            setRespostaPossuiZenodo(event.target.value);
            console.log(event.target.value);
        }
        if (event.target.name == "possuiOSF") {
            setRespostaPossuiOSF(event.target.value);
            console.log(event.target.value);
        }
        if (event.target.name == "possuiArXiv") {
            setRespostaPossuiArXiv(event.target.value);
            console.log(event.target.value);
        }
    }

    async function handleSubmit (event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("usuario", usuario);

        setError(null);

        const response = await registerUser(formData);

        if (response.status == "success") {
            const data = response.data;
            setSuccess("User created with success!");
        } else {
            setError("Error creating user");
        }
    };

    async function registerProfile(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        route.push("/register");
    }

    async function backToLogin(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        route.push("/login");
    }

    return (
        <div className="container text-center" style={{ width: "25%", marginTop: "10%" }}>
            <form className="text-start container mb-2" onSubmit={handleSubmit}>
                <h2 className="text-center">Register</h2>
                <div className="row" >
                    {/* <label>1. Você possui conta no Zenodo?</label>
                    <br/> */}
                    {/* <div className="form-check">
                        <label>
                        
                            <input 
                            className="form-check-input"
                            name="possuiZenodo"
                            type="radio"
                            value="sim"
                            checked={respostaPossuiZenodo == 'sim'}
                            onChange={handleChange}
                            />
                            Sim
                        </label>
                    </div>
                    <div className="form-check">
                        <label>
                            <input 
                            className="form-check-input"
                            name="possuiZenodo"
                            type="radio"
                            value="nao"
                            checked={respostaPossuiZenodo == 'nao'}
                            onChange={handleChange}
                            />
                            Não
                        </label>
                    </div>
                </div>
                <div className="row" >
                    <label>2. Você possui conta no OSF?</label>
                    <br/>
                    <div className="form-check">
                        <label>
                        
                            <input 
                            className="form-check-input"
                            name="possuiOSF"
                            type="radio"
                            value="sim"
                            checked={respostaPossuiOSF == 'sim'}
                            onChange={handleChange}
                            />
                            Sim
                        </label>
                    </div>
                    <div className="form-check">
                        <label>
                            <input 
                            className="form-check-input"
                            name="possuiOSF"
                            type="radio"
                            value="nao"
                            checked={respostaPossuiOSF == 'nao'}
                            onChange={handleChange}
                            />
                            Não
                        </label>
                    </div>
                </div>
                <div className="row" >
                    <label>3. Você possui conta no ArXiv?</label>
                    <br/>
                    <div className="form-check">
                        <label>
                        
                            <input 
                            className="form-check-input"
                            name="possuiArXiv"
                            type="radio"
                            value="sim"
                            checked={respostaPossuiArXiv == 'sim'}
                            onChange={handleChange}
                            />
                            Sim
                        </label>
                    </div>
                    <div className="form-check">
                        <label>
                            <input 
                            className="form-check-input"
                            name="possuiArXiv"
                            type="radio"
                            value="nao"
                            checked={respostaPossuiArXiv == 'nao'}
                            onChange={handleChange}
                            />
                            Não
                        </label>
                    </div>
                </div> */}
                <div className="row">
                    <label htmlFor="" className="form-label">
                        Username:
                    </label>
                    <input type="input" className="form-control" 
                     onChange={(e) => setUsuario(e.target.value) }/>
                </div>
                <div className="row">
                    <label htmlFor="" className="form-label">
                        Email:
                    </label>
                    <input type="text" className="form-control"
                      onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="row">
                    <label htmlFor="" className="form-label">
                        Password:
                    </label>
                    <input type="password" className="form-control" 
                      onChange={(e) => setPassword(e.target.value)} />
                </div>
                {/* <div className="row">
                    <label>Universidade:</label>
                    <select className="form-select"
                        value={universidadesClassInput}
                        onChange={(e) => {
                            setUniversidadesClassInput(e.target.value);
                        }}
                        >
                        {universidadesList['universidades'].map((universidade) => (
                            <option value={`${universidade.name}`}>{`${universidade.name} (${universidade.acronym})` }</option>
                        ))}
                    </select>
                </div>
                <div className="row text-start">
                <label className="form-label w-100">
                    Sobre: 
                    <textarea
                    type="text"
                    className="form-control"
                    rows="3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                </label>
                </div>
                <div className="row text-start">
                <label className="form-label w-100">
                    Areas: 
                    <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control w-100"
                    />
                </label>
                </div> */}
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{color: "green"}}>{success}</p>}
                <div>
                    <button type="submit" className="btn btn-primary w-100 mb-2">
                        Register
                    </button>
                </div>
                <div>
                    <button onClick={backToLogin} className="btn btn-secondary w-100 mb-2">
                        Back
                    </button>
                </div>
            </form>
            </div>
    );
}
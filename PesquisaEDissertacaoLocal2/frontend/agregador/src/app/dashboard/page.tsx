'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/Modal';

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default function Page() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
      if (localStorage.getItem("isLogged") == "true" && localStorage.getItem("isLoggedRefresh") == "1") {
        localStorage.setItem("isLoggedRefresh", "2")
        window.location.reload();
      }
    }, []);

    const toggleModal = () => {
      setIsModalOpen(!isModalOpen);
    };

    return (
        <div className='text-center container mb-2 platform-default-font-characterist'> 

              <div className='col-md-12'>
                <div className='col-md-12 alinhamento-texto-explicativo alinhamento-texto-explicativo-bloco platform-default-bg-color' >
                <div className='row justify-content-center'>
                <Modal isOpen={isModalOpen} onClose={toggleModal}>
                    <div className="container">
                        <div className="card">
                              <div className="card-header">
                                Important information
                              </div>
                              <div className="card-body">
                                <div className='row texto-explicativo-corpo'>
                                  <p>ResearcherWarehouse is a tool that serves as a way of supporting researchers
                                    to submit your research material to more than one public data repository, such as media files,
                                    document files and other formats. 
                                    For the best experience, please follow the instructions in the cards below.</p>
                                </div>
                                <p>Follow the steps carefully.</p>
                                <ul>
                                  <li>1. Create an account on Zenodo.</li>
                                  <li>2. Create an account on OSF.</li>
                                  <li>3. Before accessing the system, click on "Login with Zenodo" to log into the Zenodo system and use the features integrated with the platform.</li>
                                  <li>4. Before accessing the system, click on "Login with OSF" to log into the OSF system and use the features integrated with the platform.</li>
                                </ul>
                              </div>
                        </div>
                    </div>
              </Modal>
              </div> 
                  <div className='row' >
                  <h3 className='texto-explicativo-titulo' >Welcome to ResearcherWarehouse!</h3>
                  <div className="row" style={{marginBottom: "2px"}}>
                      <div className="col-md-4">
                            <button type="button" 
                                    className="btn btn-primary" 
                                    onClick={toggleModal}>
                              
                                  Important information
                            </button>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header">Login with Zenodo</div>
                          <div className="card-body">
                            <div className="card-text">
                              <div className="row">
                                <p>                  Zenodo is an open repository platform for sharing, publishing and preserving scientific data, articles and other academic materials.</p>
                              </div>
                              <div className="row">
                                <button className='btn btn-primary' style={{"--bs-btn-bg": "#0454ac", "--bs-btn-hover-bg": "#3c6ea5" } as React.CSSProperties}><a className='link-light link-offset-2 link-underline link-underline-opacity-0' target="_blank" href="https://zenodo.org/oauth/authorize?scope=deposit:write+deposit:actions&state=CHANGEME&redirect_uri=https://researchwarehouse-c03443898ff7.herokuapp.com/callback&response_type=code&client_id=JdJNIXJMAgrqmW83L4mKWcPAJ1JlK1zadGzi49fN">
                                Login With Zenodo
                                </a></button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header">Login with OSF</div>
                          <div className="card-body">
                            <div className="card-text">
                              <div className="row">
                                <p>
                                OSF (Open Science Framework) is an open source collaborative platform for managing, sharing and reproducing scientific research at various stages of the process.</p>
                              </div>
                              <div className="row">
                                <button className='btn btn-dark'>
                                <a className='link-light link-offset-2 link-underline link-underline-opacity-0' target="_blank" href="https://accounts.osf.io/oauth2/authorize?response_type=code&client_id=ddfc9e519dcb4ee6961ad70865192e41&redirect_uri=https://researchwarehouse-c03443898ff7.herokuapp.com/callbackosf&scope=osf.full_read%20osf.full_write&state=CHANGEME">
                                Login with OSF
                                </a></button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                  </div>
                    
                  {/* <div className='row texto-explicativo-corpo texto-explicativo-subbloco'>
                  <div className='col-md-10'>

                    </div> 
                  <div className='col-md-2'>
                      
                    </div>
                  </div> */}
                </div>
            </div>
            <div className='row justify-content-center'>
              <div className='col-md-6'>
                {/* <div className='accordion' id="accordionExample">
                  <div className='accordion-item'>
                      <h5 className='text-start texto-explicativo-titulo-card' id="headingOne">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Gerenciador de Projetos
                          </button>
                      </h5>
                  </div>
                      <div className='card-body platform-default-bg-color'>
                        <p className='card-text texto-explicativo-corpo-card'>
                          Permite acessar a lista de projetos criados, criar novos projetos, editar projetos existentes e
                          fazer upload e download de arquivos de diversos tipos de mídia aos projetos.
                        </p>
                        
                      </div>
                </div>
              </div> */}
                  <div className='accordion' id='gerenciadorProjetos'>

                      <div className='accordion-item'>
                          <h5 className='accordion-header' id='gerenciadorProjetosTitulo'>
                              <button className="accordion-button" 
                                      type="button" data-bs-toggle="collapse" 
                                      data-bs-target="#collapseGerProjetos" 
                                      aria-expanded="true" 
                                      aria-controls="collapseGerProjetos">
                                Project Management
                              </button>
                          </h5>
                          <div id="collapseGerProjetos" className="accordion-collapse collapse show" aria-labelledby="gerenciadorProjetosTitulo" data-bs-parent="#gerenciadorProjetos">
                            <div className="accordion-body">
                            <div className='row'>
                                <div className="class-md-12">
                                    <p>Allows you to access the list of created projects, create new projects, edit existing projects and
                                    upload and download files of different types of media to projects.</p>
                                </div>
                            </div>  
                            <div className="row">
                              <button className='btn btn-secondary'>
                                <Link className='link-light link-offset-2 link-underline link-underline-opacity-0' href="/general">
                                Access project management</Link>
                              </button>
                            </div>                            
                            </div>
                          </div>
                      </div>

                  </div>
              </div>
              <div className='col-md-6'>

                <div className='row'>
                  
                    <div className='accordion' id='gerenciadorArtigos'>

                      <div className='accordion-item'>
                          <h5 className='accordion-header' id='gerenciadorArtigosTitulo'>
                              <button className="accordion-button" 
                                      type="button" data-bs-toggle="collapse" 
                                      data-bs-target="#collapseGerArtigos" 
                                      aria-expanded="true" 
                                      aria-controls="collapseGerArtigos">
                                
                                  Create new article with Arxiv
                              </button>
                          </h5>
                          <div id="collapseGerArtigos" className="accordion-collapse collapse show" aria-labelledby="gerenciadorArtigosTitulo" data-bs-parent="#gerenciadorArtigos">
                            <div className="accordion-body">
                              <div className="row">
                                <div className="col-md-12">
                                    <p>Allows you to create articles on Arxiv in "pre-print" style. Approval of the article will depend on the platform's curators. It is important for successful use,
                                    have an account on Arxiv and also permission to publish articles on the platform.
                                    </p>
                                </div>
                              </div>
                              <div className="row">
                                  <button className='btn btn-danger'
                                    style={{"--bs-btn-bg": "#b81c1c", "--bs-btn-hover-bg": "#b54c4c" } as React.CSSProperties}>
                                    <Link className='link-light link-offset-2 link-underline link-underline-opacity-0' href="/arxiv_upload">Create a new article with Arxiv</Link>
                                  </button>
                              </div>
                            </div>
                          </div>
                      </div>

                      </div>
                          
                </div>
              </div>
            </div>
              
          </div>

          <style jsx>{`
              .btn-btn-custom-zenodo:hover {
                  opacity: 0.3
              }
          `}</style>
        </div>
    );
}


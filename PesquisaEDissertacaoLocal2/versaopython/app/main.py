from typing import Annotated
import requests
import time
import os
import json
import base64
import backoff
import io
import app.models as models
import app.database as database
import app.schemas as schemas
import app.auth as auth
import openai
import re
import uvicorn

from sqlalchemy import and_
from dotenv import load_dotenv
from datetime import datetime, timezone
from fastapi import Body, FastAPI, File, Form, Header, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import case
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC

OSF_TOKEN = "RcSucfqTr5rtKZWE13NsLV6Tfh4uzsIh53tAfP2UvGPQiI69EHLsWsBr2cVMvZiVmdPPHm" # os.getenv("OSF_TOKEN")
PROJECT_NAME = "agregador-node"  # os.getenv("PROJECT_NAME")
OSF_API_URL = "https://api.osf.io/v2/"
OSF_STORAGE_URL = "https://files.osf.io/v1/resources/{project_id}/providers/osfstorage/"
MARITACA_AI_KEY="108239131433042298382_f8366ab654af6eae"
MARITACA_AI_API="researchwarehouse"

app = FastAPI()

origins = ["*"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
 
class TokenRequest(BaseModel):
    code: str

class InternalTranslateContent(BaseModel):
    titulo: str
    assunto: str

class TranslateRequest(BaseModel):
    content: InternalTranslateContent


@app.get("/")
async def root():
    return { "message": "Hello server" }



@app.post("/backend/users/", response_class=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if username or email already exists
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = auth.get_password_hash(user.password)
    
    # Create new user
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return JSONResponse(content={"message": "User created"}, status_code=201)

@app.post("/backend/validate-token")
def validate_token(token: str = Depends(oauth2_scheme)):
    payload = auth.verify_token(token)
    return JSONResponse(content={"message": "Token is valid"})

@app.post("/backend/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos.")
    access_token = auth.create_access_token(data={"sub": user.email})
    return JSONResponse(content={"access_token": access_token, "token_type": "bearer"}, status_code=200)

@app.post("/backend/users/me", response_model=schemas.UserResponse, status_code=200)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms={auth.ALGORITHM})
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.get('/backend/list_topics')
def list_topics(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms={auth.ALGORITHM})
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    

    list_topics = db.query(models.Topico).all()

    return list_topics

@app.get('/backend/get_project/{project_id}')
def get_project(project_id: int,
                token: str = Depends(oauth2_scheme), 
                db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms={auth.ALGORITHM})
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    projeto = db.query(models.Projeto).filter(models.Projeto.id == project_id).first()

    return projeto


@app.get('/backend/list_projects')
def list_projects(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms={auth.ALGORITHM})
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_id = db.query(models.User).filter(models.User.email == username).first().id
    
    case_user_is_the_author = case(
        (models.Projeto.id_autor == user_id, True),
        else_=False
    ).label('pode_alterar')

    projetos = (
        db.query(models.Projeto, case_user_is_the_author)
        .filter(case_user_is_the_author == True)  
        .all()
    )

    # Payload de retorno
    payload_retorno = []

    for projeto in projetos:
        payload_retorno_item = {}
        payload_retorno_item['id'] = projeto[0].id
        payload_retorno_item['nome'] = projeto[0].nome 
        payload_retorno_item['descricao'] = projeto[0].descricao
        payload_retorno_item['id_autor'] = projeto[0].id_autor
        payload_retorno_item['created_at'] = projeto[0].created_at
        payload_retorno_item['updated_at'] = projeto[0].updated_at
        payload_retorno_item['images_urls'] = projeto[0].images_urls
        payload_retorno_item['id_topico'] = projeto[0].id_topico
        payload_retorno_item['id_osf'] = projeto[0].id_osf
        payload_retorno_item['id_zenodo'] = projeto[0].id_zenodo 
        payload_retorno_item['pode_alterar'] = projeto[1]
        payload_retorno.append(payload_retorno_item)

    return payload_retorno

@backoff.on_exception(backoff.expo, Exception,
                        max_tries=3,
                        max_time=300)
# Helper function to create a project if it doesn't exist
def create_or_get_project():
    headers = {
        'Authorization': f'Bearer {OSF_TOKEN}'
    }
    
    # List all projects for the current user
    response = requests.get(f"{OSF_API_URL}users/me/nodes/", headers=headers)
    if response.status_code == 200:
        projects = response.json()['data']
        # Check if a project with the given name exists
        for project in projects:
            if project['attributes']['title'] == PROJECT_NAME:
                return project['id']
    
    # If project does not exist, create it
    project_data = {
        "data": {
            "type": "nodes",
            "attributes": {
                "title": PROJECT_NAME,
                "category": "project",
                "public": True
            }
        }
    }
    response = requests.post(f"{OSF_API_URL}nodes/", headers=headers, json=project_data)
    if response.status_code == 201:
        return response.json()['data']['id']
    else:
        raise Exception(f"Failed to create project: {response.text}")

def fetch_all_results(url, headers):
    results = []
    final_status_code = 0
    while url:
        response = requests.get(url, headers=headers)
        final_status_code = response.status_code
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        results.extend(data['data'])  # Add current page results to the list
        url = data['links'].get('next')  # Get the next page URL, if available
    return results, final_status_code


@backoff.on_exception(backoff.expo, Exception,
                        max_tries=3,
                        max_time=300)
# Helper function to create a directory if it doesn't exist
def create_or_get_directory(project_id, user_project_name):
    headers = {
        'Authorization': f'Bearer {OSF_TOKEN}'
    }

    user_project_name = user_project_name.replace(" ","").replace(".", "_")
    
    # List all directories inside OSF storage
    
    response, status = fetch_all_results(f"{OSF_API_URL}nodes/{project_id}/files/osfstorage/?page[size]=100", headers=headers)
    if status == 200:
        directories = response
        for directory in directories:
            if directory['attributes']['name'] == user_project_name and directory['attributes']['kind'] == 'folder':
                directory_upload_url = directory['links']['upload']

                if "?kind=file&name=" not in directory_upload_url:
                    directory_upload_url = f"{directory_upload_url}?kind=file"

                return directory_upload_url
    
    response = requests.put(f"{OSF_STORAGE_URL.format(project_id=project_id)}?kind=folder&name={user_project_name}", headers=headers)
    if response.status_code == 201:
        directory_upload_url = response.json()['data']['links']['upload']
        return directory_upload_url
    else:
        raise Exception(f"Failed to create directory: {response.text}")
    

@backoff.on_exception(backoff.expo, Exception,
                        max_tries=3,
                        max_time=300)
# Function to upload file to OSF and return the download URL
def upload_to_osf(file_bytes, project_id, directory_upload_url, filename):
    headers = {
        'Authorization': f'Bearer {OSF_TOKEN}'
    }
    files = {
        'file': file_bytes
    }
    request_url = directory_upload_url + "&name=" + filename
    response = requests.put(request_url, headers=headers, data=file_bytes)
    if response.status_code == 201 or response.status_code == 409:
        osf_file_data = response.json()
        download_url = osf_file_data['data']['links']['download']
        return download_url
    elif response.status_code == 409:
        response = requests.put(request_url, headers=headers, data=file_bytes)
        if response.status_code == 201:
            osf_file_data = response.json()
            download_url = osf_file_data['data']['links']['download']
            return download_url
    else:
        print(f"Failed to upload. Status code: {response.status_code}, Response: {response.text}")
        raise Exception(f"Failed to upload. Status code: {response.status_code}, Response: {response.text}")

@app.put('/backend/update_project/{project_id}')
def update_project(project_id: int,
                project: str = Form(...),
                files: List[UploadFile] = File(None),
                token: str = Depends(oauth2_scheme), 
                db: Session = Depends(database.get_db)):
    des_project = json.loads(project)

    if not files:
        files = []

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms={auth.ALGORITHM})
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    projeto = db.query(models.Projeto).filter(models.Projeto.id == project_id).first()

    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado.")
    
    download_urls = []

    for idx, file in enumerate(files):
        file_content = file.file.read()
        project_id = create_or_get_project()
        directory_upload_url = create_or_get_directory(project_id=project_id, user_project_name=f"{username}-{des_project['nome']}")
        download_url = upload_to_osf(file_bytes=file_content, project_id=project_id, directory_upload_url=directory_upload_url, filename=file.filename)
        download_urls.append(download_url)
        des_project['markdown'] = des_project['markdown'].replace(f"<IMG{idx + 1}>", download_url)

    if len(files) > 0:
        if "images_urls" in des_project:
            des_project["images_urls"] = json.loads(des_project["images_urls"])  +  download_urls            
        else:
            des_project["images_urls"] = download_urls


    projeto.descricao = des_project["markdown"]
    projeto.tags = des_project["tags"]
    
    if 'images_urls' in des_project:
        projeto.images_urls = json.dumps(des_project['images_urls'])
    
    projeto.updated_at = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

    db.commit()
    db.refresh(projeto)

    return projeto

@app.post('/backend/create_project')
def create_project(token: str = Depends(oauth2_scheme),
                   project: str = Form(...),
                   files: List[UploadFile] = File(...),
                   db: Session = Depends(database.get_db)):
    print("..")
    des_project = json.loads(project)

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms={auth.ALGORITHM})
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    download_urls = []

    for idx, file in enumerate(files):
        file_content = file.file.read()
        project_id = create_or_get_project()
        directory_upload_url = create_or_get_directory(project_id=project_id, user_project_name=f"{username}-{des_project['nome']}")
        download_url = upload_to_osf(file_bytes=file_content, project_id=project_id, directory_upload_url=directory_upload_url, filename=file.filename)
        download_urls.append(download_url)
        des_project['markdown'] = des_project['markdown'].replace(f"<IMG{idx + 1}>", download_url)

    if len(files) > 0:
        des_project["images_url"] = download_urls
    
    existing_project_id = db.query(models.Projeto).filter(
        and_( models.Projeto.id_autor == int(des_project['id_author']),
              str(models.Projeto.nome).lower() == str(des_project['nome']).lower()   
        )).first()

    if not existing_project_id:
        project_db = models.Projeto(nome=des_project['nome'],
                                    descricao=des_project['markdown'],
                                    id_autor=des_project['id_author'],
                                    images_urls=json.dumps(des_project['images_url']),
                                    id_topico=des_project['id_topico'],
                                    id_osf=des_project.get("id_osf", None),
                                    id_zenodo=des_project.get("id_zenodo", None),
                                    tags=des_project.get("tags", None))

        db.add(project_db)
        db.commit()
        db.refresh(project_db)
        return JSONResponse(content={"message": "Project created"}, status_code=201)
    else:
        return JSONResponse(content={"message": f"A project with name {des_project['nome']} already exists!"}, status_code=400)
    

@app.post('/backend/zenodo_token_callback')
async def zenodo_callback(token_request: TokenRequest):
    # Codigo recebido do token
    code = token_request.code
    # Montando payload de requisicao
    payload = {
        'client_id': 'JdJNIXJMAgrqmW83L4mKWcPAJ1JlK1zadGzi49fN',
        'client_secret': 'v8jfn2ATlHQMXevjxZsHpcryt03lqooVi3ZIQpwXzIwFgdTXz5bcwStC5t6A',
        'grant_type': 'authorization_code',
        'code' : code,
        'redirect_uri': 'https://researchwarehouse-c03443898ff7.herokuapp.com/callback'
    }
    time.sleep(4)
    # Realizando requisicao para o oauth
    response = requests.post("https://zenodo.org/oauth/token",data=payload)
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        return {"access_token": access_token }
    

@app.post('/backend/osf_token_callback')
async def osf_callback(token_request: TokenRequest):
    # Codigo recebido do token
    code = token_request.code
    # Montando payload de requisicao
    payload = {
        'client_id': 'ddfc9e519dcb4ee6961ad70865192e41',
        'client_secret': 'UyCvkosMsyBXqJZP0YmC8e6sACB25sXVYHJ1oAB4',
        'grant_type': 'authorization_code',
        'code' : code,
        'redirect_uri': 'https://researchwarehouse-c03443898ff7.herokuapp.com/callbackosf'
    }
    # Realizando requisicao para o oauth
    response = requests.post("https://accounts.osf.io/oauth2/token",data=payload)
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        return {"access_token": access_token }

def base64_to_bytes(base64_str):
    return base64.b64decode(base64_str)

@app.post('/backend/upload_file_in_chunks')
@backoff.on_exception(backoff.expo, Exception,
                        max_tries=8,
                        max_time=100)
async def upload_file_in_chunks(file: UploadFile = File(...),
                                authorization: str = Header(...),
                                type: str = Header(...),
                                id: str = Header(...)):
    try:
        # Validate the incoming data
        if file:
            file_content = file.file.read()
            if type == "zenodo":
                print("Upload Zenodo")

                upload_file_name = file.filename.replace(" ", "")

                upload_response = requests.post(
                    f"https://zenodo.org/api/deposit/depositions/{id}/files",
                    headers={"Authorization": authorization},
                    files={ 'file':  (upload_file_name, file_content) }
                )

                upload_response.raise_for_status()

                response = requests.get(f'https://zenodo.org/api/deposit/depositions/{id}', headers={"Authorization": authorization})
                response.raise_for_status()  # Raise an exception for HTTP errors

                data = response.json()
                files = data.get('files', [])
                
                total_space_used = sum(file.get('filesize', 0) for file in files)



                print(f"Total space used: {(int(total_space_used) / 1024) / 1024} MB used")
                print(f"Space left: {(50 * 1024) - (int(total_space_used) / 1024) / 1024} MB")
                print(f"Total files: {len(files)}")
                print(f"Files left: {100 - int(len(files))}")

                print("Upload Zenodo concluido")

                return {"message": f"File '{file}' uploaded to Zenodo successfully"}
            if type == "osf":
                print("Upload OSF")
                # response = requests.put(
                #     f"https://files.osf.io/v1/resources/{id}/providers/osfstorage/?kind=folder&name={file.filename}",
                #     headers={"Authorization": authorization}
                # )

                # print(response.raise_for_status())

                upload_response = requests.put( 
                    f"https://files.osf.io/v1/resources/{id}/providers/osfstorage/?kind=file&name={file.filename.replace(' ', '').replace('text/csv', 'csv')}",
                    headers={"Authorization": authorization},
                    data=file_content
                )

                print(upload_response.raise_for_status())
                print("Upload OSF concluido.")
            
                return {"message": f"File '{file}' uploaded to OSF successfully"}
            
    except Exception as ex:
        print(f"An exception occurred: {ex}")

@app.post('/backend/translate')
def traduzir_formulario(token: str = Depends(oauth2_scheme), body: TranslateRequest = Body(...)):
    
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms={auth.ALGORITHM})
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        client = openai.OpenAI(
            api_key=MARITACA_AI_KEY,
            base_url="https://chat.maritaca.ai/api"
        )
        response = client.chat.completions.create(
            model="sabia-3",
            messages=[
                {
                    "role": "user",
                    "content": f"""
                    Dado o conteúdo a seguir:
                    # START
                    {body.content}
                    # END
                     - Traduza o conteúdo de português para inglês. 
                     - Retornando o resultado em formato json.
                     - O formato deve preservar o nome original dos atributos json.
                     - Apenas o valor dos atributos deve ser traduzido para inglês.
                     - Retire caracteres especiais.
                     - Retire erros de ortografia.
                     - Retire espaços em branco que ultrapasse o tamanho de 1 em espaçamento.
                    """
                }
            ],
            max_tokens=8000
        )
        print(response)
        resultado = response.choices[0].message.content
        resultado = re.sub(r'^```json\s*|\s*```$', '', resultado.strip())
        resultado_formatado = resultado.encode().decode('unicode_escape')
        resultado_dicionario = json.loads(resultado_formatado)
        return resultado_dicionario
    except Exception as ex:
        raise ex

@app.post('/backend/arxiv_upload_article')
async def arxiv_upload_article(body: str = Body()):
    deserialized_body = json.loads(body)
    file_bytes = base64_to_bytes(deserialized_body["file"])
    file_name = deserialized_body["fileName"]
    file_path = f"tmp/{file_name}"
    try:
        if not os.path.exists("tmp"):       
            # if the demo_folder directory is not present  
            # then create it. 
            os.makedirs("tmp") 

        with open(file_path, 'wb') as file:
            file.write(file_bytes)

        chrome_options = Options()
        chrome_options.add_argument("--disable-extensions")
        ##############
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.page_load_strategy = 'eager'

        
        # Define paths
        chrome_binary_path = os.path.join("app", "chrome-linux64", "chrome")
        chromedriver_path =  os.path.join("app", "chromedriver-linux64", "chromedriver") 

        # Define your arXiv credentials and file paths
        ARXIV_USERNAME = deserialized_body["username"]
        ARXIV_PASSWORD = deserialized_body["password"]
        ARXIV_ARCHIVE = deserialized_body["archive"]
        ARXIV_SUBJECT = deserialized_body["subject"]
        ARXIV_TITLE = deserialized_body["title"]
        ARXIV_AUTHORS = deserialized_body["authors"]
        ARXIV_ABSTRACT = deserialized_body["abstract"]
        PAPER_FILE_PATH = file_path 

        # Initialize the WebDriver (e.g., Chrome)
        # c_service = webdriver.ChromeService(chromedriver_path)
        # chrome_options.binary_location = chrome_binary_path
        driver = webdriver.Chrome(options=chrome_options)
        
        # Navigate to arXiv login page
        driver.get("https://arxiv.org/login")

        # Log in to arXiv
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username")))
        driver.find_element(By.NAME, "username").send_keys(ARXIV_USERNAME)
        driver.find_element(By.NAME, "password").send_keys(ARXIV_PASSWORD)
        driver.find_element(By.NAME, "password").send_keys(Keys.RETURN)

        # Wait for login to complete and navigate to the submission page
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.LINK_TEXT, "START NEW SUBMISSION")))
        driver.find_element(By.LINK_TEXT, "START NEW SUBMISSION").click()

        driver.find_element(By.NAME,"agree_terms_conditions").click()
        driver.execute_script("$('.modal__content').scrollTop(100000)")
        driver.find_element(By.ID, "accept-terms").click()

        driver.find_element(By.CSS_SELECTOR, "input[type='checkbox'][name='userinfo']").click()
        driver.find_element(By.CSS_SELECTOR, "input[type='radio'][name='is_author'][value='1']").click()
        driver.find_element(By.CSS_SELECTOR, "input[type='radio'][name='license'][value='http://creativecommons.org/licenses/by/4.0/']").click()
        driver.find_element(By.XPATH, f"//select[@name='archive']/option[text()='{ARXIV_ARCHIVE}']").click() 
        time.sleep(1)
        driver.find_element(By.XPATH, f"//select[@name='subject_class']/option[text()='{ARXIV_SUBJECT}']").click()
        # Fill in submission forms (this step might need to be adjusted based on the actual form structure)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "commit")))
        driver.find_element(By.NAME, "commit").click()


        # Upload paper file
        driver.find_element(By.ID, "fileinput").send_keys(os.path.abspath(PAPER_FILE_PATH))
        driver.find_element(By.NAME, "uploadButton").click()

        # Wait for file to upload and proceed through additional steps
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "sub-process-button")))
        time.sleep(1)
        driver.find_element(By.CSS_SELECTOR, "input[type='submit'][value='Continue: Process Files']").click()
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "sub-process-button")))
        driver.find_element(By.CLASS_NAME, "sub-process-button").click()
        # Complete metadata form (example for title and abstract)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "title")))
        driver.find_element(By.NAME, "title").send_keys(ARXIV_TITLE)
        driver.find_element(By.NAME, "authors").send_keys(ARXIV_AUTHORS)
        driver.find_element(By.NAME, "abstract").send_keys(ARXIV_ABSTRACT)
        driver.find_element(By.CLASS_NAME, "sub-process-button").click()
        url = driver.current_url
        # WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "viewpdf")))
        driver.find_element(By.ID, "viewpdf").click()
        print(driver.window_handles)
        time.sleep(1)
        driver.switch_to.window(driver.window_handles[0])
        driver.refresh()
        time.sleep(1)
        # Confirm and submit the paper
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "Submit")))
        time.sleep(0.5)
        driver.find_element(By.NAME, "Submit").click()

        print("Submission process completed.")
        if os.path.exists(file_path):
            os.remove(file_path)
        return {
            "message": "Submission process completed."
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"An error occurred: {e}")
        raise e


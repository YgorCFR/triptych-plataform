from typing import Annotated
import requests
import time
import os

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


def arxiv_upload_article():
    try:
        chrome_options = Options()
        chrome_options.add_argument("--disable-extensions")
        ##############
        # chrome_options.add_argument("--no-sandbox")
        # chrome_options.add_argument("--headless=new")
        # chrome_options.add_argument("--disable-dev-shm-usage")
        # chrome_options.page_load_strategy = 'eager'

        
        # Define paths
        chrome_binary_path = os.path.join("chrome-linux64", "chrome")
        chromedriver_path = os.path.join("chromedriver-linux64", "chromedriver") 

        # Define your arXiv credentials and file paths
        ARXIV_USERNAME = 'ycfroli'
        ARXIV_PASSWORD = 'W7H3Y6QD'
        PAPER_FILE_PATH = os.path.abspath('ResenhaEticosParaAprendizadoDeMaquinaConfiavel.zip')

        # Initialize the WebDriver (e.g., Chrome)
        c_service = webdriver.ChromeService(chromedriver_path)
        chrome_options.binary_location = chrome_binary_path
        driver = webdriver.Chrome(service=c_service, options=chrome_options)
        
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
        driver.find_element(By.XPATH, "//select[@name='archive']/option[text()='Computer Science']").click()
        time.sleep(1)
        driver.find_element(By.XPATH, "//select[@name='subject_class']/option[text()='Software Engineering']").click()
        # Fill in submission forms (this step might need to be adjusted based on the actual form structure)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "commit")))
        driver.find_element(By.NAME, "commit").click()


        # Upload paper file
        driver.find_element(By.ID, "fileinput").send_keys(PAPER_FILE_PATH)
        driver.find_element(By.NAME, "uploadButton").click()

        # Wait for file to upload and proceed through additional steps
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "sub-process-button")))
        time.sleep(1)
        driver.find_element(By.CSS_SELECTOR, "input[type='submit'][value='Continue: Process Files']").click()
        driver.find_element(By.CLASS_NAME, "sub-process-button").click()
        # Complete metadata form (example for title and abstract)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "title")))
        driver.find_element(By.NAME, "title").send_keys("Resenha requisitos eticos para aprendizado de maquina confiavel")
        driver.find_element(By.NAME, "authors").send_keys("Ygor")
        driver.find_element(By.NAME, "abstract").send_keys("The notable growth of artificial intelligence technologies has directly influenced the way of coexistence between people in society, such as the way in which products are consumed entertainment, the creation of jobs in the job market, the way education is applied, in interactions with everyday activities such as debt payments and the accession of goods materials. The scenario presented implies benefits and harms. In the field of benefits, it is possible highlight aspects such as: cost optimization, time savings, greater satisfaction with entertainment products and material goods and improved life expectancy. In the field of harm, it is possible to point out: the manipulation of information, the lack of ethics in the use of technologies, inequality in the targeting of artificial intelligence technology to certain audiences, unemployment and invasion of privacy.")
        driver.find_element(By.CLASS_NAME, "sub-process-button").click()
        url = driver.current_url
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
    except Exception as e:
        print(f"An error occurred: {e}")
        raise e


if __name__ == "__main__":
    arxiv_upload_article()
    

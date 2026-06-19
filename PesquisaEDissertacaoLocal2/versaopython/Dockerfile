FROM python:3.9-slim
COPY ./start.sh /start.sh
RUN chmod +x /start.sh
RUN apt-get update && apt-get install -y wget unzip chromium-driver
COPY ./app /app
RUN chmod -R 777 /app/chrome-linux64
RUN chmod -R 777 /app/chromedriver-linux64
RUN pip install -r /app/requirements.txt
CMD ["./start.sh"]
#/bin/bash

echo "Instalando o chrome file"
meta_data=$(curl https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json)
sudo apt install jq -y
wget $(echo "$meta_data" | jq -r '.channels.Stable.downloads.chrome[0].url')
echo "Instalacao do chrome file concluida"
echo "Instalando dependencias do chrome file"
sudo apt install ca-certificates fonts-liberation \
    libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 \
    libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
    libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
    libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils -y
echo "Instalacao de dependencias do chrome file, concluidas"
echo "Realizando a descompactacao do chrome file"
unzip chrome-linux64.zip
echo "Descompactacao do chrome file concluida"
echo "Instalando o chromedriver"
meta_data=$(curl https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json)
wget $(echo "$meta_data" | jq -r '.channels.Stable.downloads.chromedriver[0].url')
echo "Descompactando o chromedriver"
unzip chromedriver-linux64.zip
echo "Descompactacao do chromedriver concluida"




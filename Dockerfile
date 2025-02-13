# Usar uma imagem oficial do Node.js
FROM node:18

# Definir diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar arquivos para o contêiner
COPY package.json package-lock.json* ./
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Comando de entrada
CMD ["npm", "start"]

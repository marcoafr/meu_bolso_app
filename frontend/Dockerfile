# Etapa 1: Usar uma imagem base leve
FROM node:18-alpine

# Etapa 2: Configurar diretório de trabalho
WORKDIR /app

# Etapa 3: Copiar arquivos e instalar dependências
COPY package*.json ./
RUN npm install
RUN npm install @mui/material @mui/icons-material @emotion/react @emotion/styled react-router-dom react-color @nivo/bar @nivo/pie @nivo/line

# Etapa 4: Copiar o restante do código
COPY . .

# Etapa 5: Rodar o servidor de desenvolvimento do Vite
CMD ["npm", "run", "dev"]

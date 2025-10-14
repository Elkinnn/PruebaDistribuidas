FROM node:22

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos del servicio
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno
ENV VITE_API_URL=http://localhost:3002

EXPOSE 3003
# Comando de inicio
CMD ["npm", "run", "dev","--", "--host", "0.0.0.0"]
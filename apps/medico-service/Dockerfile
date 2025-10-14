FROM node:22

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos del servicio
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno
# ENV PORT=3000
# ENV MYSQL_HOST=host
# ENV MYSQL_DB=hospital_service
# ENV MYSQL_PORT=3306
# ENV MYSQL_USER=root
# ENV MYSQL_PASSWORD=password
# ENV JWT_SECRET=Secret123
# ENV TS_NODE_TRANSPILE_ONLY=true

EXPOSE 3000
# Comando de inicio
CMD ["npm", "run", "dev"]

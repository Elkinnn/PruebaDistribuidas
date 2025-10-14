FROM node:22

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos del servicio
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno
ENV NODE_ENV=development
ENV PORT=3001
ENV DATABASE_URL=mysql_db
ENV DB_HOST=mysql_host
ENV DB_PORT=3306
ENV DB_NAME=hospital_service
ENV DB_USER=root
ENV DB_PASSWORD=
ENV JWT_SECRET=your-super-secret-jwt-key-here
ENV JWT_EXPIRES_IN=24h

EXPOSE 3001
# Comando de inicio
CMD ["npm", "run", "dev"]

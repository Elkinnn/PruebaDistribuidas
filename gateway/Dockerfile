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
ENV ADMIN_SERVICE_URL=admin_url
ENV MEDICO_SERVICE_URL=medico_url
ENV FRONTEND_URL=frontend_url
ENV JWT_SECRET=your-super-secret-jwt-key-here
ENV JWT_EXPIRES_IN=24h

EXPOSE 3002
# Comando de inicio
CMD ["npm", "run", "dev"]

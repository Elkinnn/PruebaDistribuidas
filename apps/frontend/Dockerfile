FROM node:22 AS builder

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos del servicio
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para build
ARG VITE_API_URL=https://api-gateway.lemonsand-4de94d70.eastus2.azurecontainerapps.io
ENV VITE_API_URL=$VITE_API_URL

# Build de producción
RUN npm run build

# Stage de producción con servidor estático
FROM node:22-alpine

WORKDIR /usr/src/app

# Instalar serve para servir archivos estáticos
RUN npm install -g serve

# Copiar archivos build desde el builder
COPY --from=builder /usr/src/app/build ./build

EXPOSE 3003

# Servir archivos estáticos con serve
# -s: servidor de archivos estáticos (SPA mode)
# -l: puerto de escucha
# -n: no mostrar la lista de archivos
# --cors: habilitar CORS para todos los orígenes (necesario para development)
CMD ["serve", "-s", "build", "-l", "3003", "--cors"]
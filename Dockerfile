# Usamos una imagen oficial de Node.js como base
FROM node:18-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# ¡IMPORTANTE! Copiamos PRIMERO los package.json del backend para optimizar la caché de Docker
COPY backend/package*.json ./

# Instalamos las dependencias
RUN npm install --production

# Ahora copiamos el resto de los archivos
COPY backend/ ./
COPY frontend/ ./frontend/

# Exponemos el puerto
EXPOSE 3000

# El comando final para ejecutar
CMD [ "node", "src/server.js" ]

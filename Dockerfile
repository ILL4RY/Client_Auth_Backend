# Etapa de build
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Instalar dependencias de sistema para compilación
RUN apk add --no-cache python3 make g++

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de dev (para TypeScript y Prisma)
RUN npm install

# Copiar el proyecto
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /usr/src/app

# Solo dependencias de producción
COPY package*.json ./
RUN npm install --only=production

# Copiar dist y Prisma Client
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "start"]

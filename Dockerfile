# Etapa única (alpine) com toolchain para compilar C e build do TypeScript
FROM node:20-alpine

# Instala toolchain para C
RUN apk add --no-cache build-base

# Diretório de trabalho
WORKDIR /app

# Copia manifests primeiro (aproveita cache). Se existir package-lock.json, ele vem junto.
COPY package*.json tsconfig.json ./

# Instala dependências (sem exigir lockfile)
RUN npm install

# Copia fontes
COPY src ./src
COPY c ./c

# Compila o binário C
RUN gcc -O2 -Wall -Wextra -o /usr/local/bin/xorbin c/xor.c

# Compila TypeScript
RUN npm run build

# Porta
EXPOSE 3000

# Execução
CMD ["node", "dist/index.js"]
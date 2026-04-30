# -------- Build stage --------
FROM node:20-slim AS build
WORKDIR /app

# Copiamos solo el package.json primero para aprovechar cache de capas.
# (No copiamos package-lock.json: estaba corrupto y npm install lo regenera.)
COPY package.json ./

# Sin --silent, para que cualquier error sea visible en el log de build.
RUN npm install --no-audit --no-fund --loglevel=verbose

COPY . .
RUN npm run build:prod

# -------- Runtime stage --------
FROM nginx:alpine
COPY --from=build /app/dist/sabores-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

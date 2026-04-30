/**
 * Script ejecutado antes del build de producción.
 * Lee la variable de entorno API_URL (definida en Vercel)
 * y la escribe en environment.prod.ts para que Angular la use.
 */
const fs   = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.warn('⚠️  API_URL no definida — usando fallback http://localhost:8080/api');
}

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl || 'http://localhost:8080/api'}'
};
`;

const targetPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(targetPath, content, 'utf8');
console.log(`✅  environment.prod.ts → apiUrl: ${apiUrl || 'http://localhost:8080/api'}`);

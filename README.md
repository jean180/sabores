# 🌿 Sabores — Aplicación de recetas

Stack: Angular 18 · Spring Boot 3.3 · MySQL 8 · Docker Compose

---

## 🚀 Arranque rápido con Docker

```bash
# 1. Clonar o descomprimir el proyecto
cd sabores

# 2. Copiar variables de entorno
cp .env.example .env
# Edita .env y cambia las contraseñas antes de usar en producción

# 3. Levantar todos los servicios
docker compose up --build

# 4. Abrir en el navegador
# Frontend:  http://localhost
# API REST:  http://localhost:8080/api
```

Los tres servicios arrancan en orden: MySQL → Backend (espera a que MySQL esté sano) → Frontend.
Flyway ejecuta las migraciones automáticamente al arrancar el backend.

---

## 🛠 Desarrollo local (sin Docker)

### Backend
```bash
cd backend

# Requisitos: Java 21, Maven 3.9+, MySQL 8 corriendo localmente

# Crear base de datos
mysql -u root -p -e "CREATE DATABASE sabores_db; CREATE USER 'sabores_user'@'localhost' IDENTIFIED BY 'sabores_pass'; GRANT ALL ON sabores_db.* TO 'sabores_user'@'localhost';"

# Arrancar
mvn spring-boot:run
# API disponible en http://localhost:8080/api
```

### Frontend
```bash
cd frontend

# Requisitos: Node 20+
npm install
npm start
# App disponible en http://localhost:4200
```

---

## 📁 Estructura del proyecto

```
sabores/
├── backend/
│   ├── src/main/java/com/sabores/
│   │   ├── config/          # SecurityConfig, CORS
│   │   ├── controller/      # AuthController, RecipeController, PantryController...
│   │   ├── dto/             # Request y Response records
│   │   ├── entity/          # Entidades JPA
│   │   ├── exception/       # GlobalExceptionHandler
│   │   ├── repository/      # Spring Data JPA repos
│   │   ├── security/        # JwtService, JwtAuthenticationFilter
│   │   └── service/         # Lógica de negocio
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/    # Flyway: V1__init_schema, V2__seed_categories
├── frontend/
│   └── src/app/
│       ├── core/
│       │   ├── guards/      # authGuard, guestGuard
│       │   ├── interceptors/# authInterceptor (JWT)
│       │   ├── models/      # Interfaces TypeScript
│       │   └── services/    # AuthService, RecipeService, PantryService...
│       ├── features/
│       │   ├── auth/        # Login, Register
│       │   ├── recipes/     # RecipeList, RecipeDetail, RecipeForm
│       │   ├── pantry/      # PantryComponent
│       │   ├── planner/     # PlannerComponent
│       │   └── favorites/   # FavoritesComponent
│       └── shared/
│           └── components/  # NavbarComponent, RecipeCardComponent
├── docker-compose.yml
└── .env.example
```

---

## 🔌 Endpoints principales de la API

| Método | Endpoint                    | Auth | Descripción                        |
|--------|-----------------------------|------|------------------------------------|
| POST   | /auth/register              | No   | Registro de usuario                |
| POST   | /auth/login                 | No   | Login → devuelve JWT               |
| GET    | /recipes                    | No   | Listar/buscar recetas              |
| GET    | /recipes/{id}               | No   | Detalle de receta                  |
| POST   | /recipes                    | Sí   | Crear receta                       |
| PUT    | /recipes/{id}               | Sí   | Editar receta (solo autor)         |
| DELETE | /recipes/{id}               | Sí   | Eliminar receta (solo autor)       |
| GET    | /pantry                     | Sí   | Despensa + sugerencias             |
| POST   | /pantry                     | Sí   | Añadir/actualizar ingrediente      |
| DELETE | /pantry/{ingredientId}      | Sí   | Eliminar de la despensa            |
| GET    | /favorites                  | Sí   | Mis favoritos                      |
| POST   | /favorites/{id}/toggle      | Sí   | Marcar/desmarcar favorito          |
| GET    | /meal-plan/week?from=       | Sí   | Plan semanal                       |
| POST   | /meal-plan                  | Sí   | Añadir al planificador             |
| DELETE | /meal-plan?date=&mealType=  | Sí   | Eliminar del planificador          |
| GET    | /categories                 | No   | Listar categorías                  |
| GET    | /ingredients?q=             | No   | Buscar ingredientes                |

---

## 🎨 Paleta de colores (verde fresco)

| Variable CSS            | Valor     | Uso                  |
|-------------------------|-----------|----------------------|
| `--color-primary`       | `#2D6A4F` | Botones, nav, título |
| `--color-primary-dk`    | `#1B4332` | Hover, headings      |
| `--color-primary-lt`    | `#52B788` | Acentos, badges      |
| `--color-bg`            | `#F0FAF4` | Fondo de página      |
| `--color-surface`       | `#ffffff` | Tarjetas             |
| `--color-border`        | `#E9F5EE` | Bordes sutiles       |

---

## 🔐 Seguridad

- Contraseñas hasheadas con **BCrypt**
- Autenticación stateless con **JWT** (24h de validez)
- Rutas protegidas en frontend con `authGuard`
- CORS configurado por variable de entorno
- Roles `USER` y `ADMIN` con `@EnableMethodSecurity`

---

## 📦 Variables de entorno (.env)

| Variable             | Descripción                        | Default           |
|----------------------|------------------------------------|-------------------|
| `DB_NAME`            | Nombre de la base de datos         | sabores_db        |
| `DB_USER`            | Usuario MySQL                      | sabores_user      |
| `DB_PASSWORD`        | Contraseña MySQL                   | sabores_pass      |
| `MYSQL_ROOT_PASSWORD`| Contraseña root MySQL              | root_secret       |
| `JWT_SECRET`         | Clave secreta Base64 para JWT      | (valor por defecto dev) |
| `CORS_ORIGINS`       | Orígenes permitidos (coma-sep.)    | http://localhost:4200 |

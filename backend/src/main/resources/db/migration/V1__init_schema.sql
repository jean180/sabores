-- V1__init_schema.sql
-- Esquema inicial de la base de datos Sabores

CREATE TABLE users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(150)        NOT NULL UNIQUE,
    password   VARCHAR(255)        NOT NULL,
    role       ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    icon VARCHAR(10)
);

CREATE TABLE recipes (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200)                                 NOT NULL,
    description  TEXT,
    image_url    VARCHAR(500),
    prep_time    INT                                          NOT NULL COMMENT 'Minutos',
    servings     INT                                          NOT NULL DEFAULT 4,
    difficulty   ENUM('EASY','MEDIUM','HARD')                NOT NULL DEFAULT 'EASY',
    is_public    BOOLEAN                                      NOT NULL DEFAULT TRUE,
    user_id      BIGINT                                       NOT NULL,
    category_id  BIGINT,
    created_at   TIMESTAMP                                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP                                    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipe_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_recipe_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE ingredients (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE recipe_ingredients (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id     BIGINT         NOT NULL,
    ingredient_id BIGINT         NOT NULL,
    quantity      DECIMAL(10, 2) NOT NULL,
    unit          VARCHAR(50)    NOT NULL,
    CONSTRAINT fk_ri_recipe     FOREIGN KEY (recipe_id)     REFERENCES recipes(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ri_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    UNIQUE KEY uq_recipe_ingredient (recipe_id, ingredient_id)
);

CREATE TABLE recipe_steps (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id   BIGINT NOT NULL,
    step_number INT    NOT NULL,
    description TEXT   NOT NULL,
    CONSTRAINT fk_step_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY uq_recipe_step (recipe_id, step_number)
);

CREATE TABLE favorites (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT    NOT NULL,
    recipe_id  BIGINT    NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_fav_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY uq_favorite (user_id, recipe_id)
);

CREATE TABLE pantry (
    id            BIGINT         AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT         NOT NULL,
    ingredient_id BIGINT         NOT NULL,
    quantity      DECIMAL(10, 2),
    unit          VARCHAR(50),
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pantry_user       FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_pantry_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    UNIQUE KEY uq_pantry_item (user_id, ingredient_id)
);

CREATE TABLE meal_plan (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    recipe_id  BIGINT NOT NULL,
    plan_date  DATE   NOT NULL,
    meal_type  ENUM('BREAKFAST','LUNCH','DINNER','SNACK') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_plan_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY uq_meal_slot (user_id, plan_date, meal_type)
);

-- Índices de rendimiento
CREATE INDEX idx_recipes_user     ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category_id);
CREATE INDEX idx_meal_plan_user   ON meal_plan(user_id, plan_date);
CREATE INDEX idx_pantry_user      ON pantry(user_id);

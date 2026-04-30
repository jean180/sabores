CREATE TABLE ratings (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT   NOT NULL,
    recipe_id  BIGINT   NOT NULL,
    score      TINYINT  NOT NULL,
    comment    TEXT,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uq_user_recipe_rating (user_id, recipe_id),
    INDEX idx_rating_recipe (recipe_id),
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

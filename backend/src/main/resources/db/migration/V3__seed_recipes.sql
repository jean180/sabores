-- V3__seed_recipes.sql
-- Usuario semilla (chef@sabores.com / password) + 15 recetas con ingredientes y pasos

-- =====================================================================
-- 1. USUARIO SEMILLA  (contraseña: password)
-- =====================================================================
INSERT IGNORE INTO users (name, email, password, role) VALUES (
  'Chef Sabores', 'chef@sabores.com',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'ADMIN'
);

-- =====================================================================
-- 2. INGREDIENTES
-- =====================================================================
INSERT IGNORE INTO ingredients (name) VALUES
  ('aceite de oliva'), ('aguacate'), ('ajo'), ('almendra'), ('anchoa'),
  ('arroz'), ('azafrán'), ('azúcar'), ('azúcar moreno'),
  ('brócoli'), ('caldo de pescado'), ('caldo de pollo'), ('caldo de verduras'),
  ('canela'), ('carne picada de ternera'), ('cebolla'), ('cebolleta'),
  ('champiñones'), ('curry'), ('espinacas'),
  ('gambas'), ('garbanzo'), ('harina'), ('huevo'),
  ('jamón serrano'), ('laurel'), ('leche'), ('lechuga'), ('lenteja'), ('limón'),
  ('maicena'), ('mantequilla'), ('merluza'), ('nata'), ('nuez moscada'),
  ('orégano'), ('pan de molde'), ('pan rallado'), ('panceta'),
  ('pasta espagueti'), ('pasta penne'), ('patata'), ('pepino'), ('perejil'),
  ('pimienta'), ('pimentón dulce'), ('pimentón picante'),
  ('pimiento rojo'), ('pimiento verde'), ('pollo'), ('puerro'),
  ('queso manchego'), ('queso parmesano'), ('romero'), ('sal'), ('salmón'),
  ('tomate'), ('tomillo'), ('vainilla'), ('vinagre'), ('vino blanco'),
  ('yogur'), ('zanahoria');

-- =====================================================================
-- 3. RECETAS  (sin variables de usuario: se usan subqueries directas)
-- =====================================================================

-- 1. TORTILLA DE PATATAS
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Tortilla de patatas',
  'El plato más icónico de la cocina española. Jugosa por dentro y dorada por fuera, perfecta a cualquier hora del día.',
  30, 4, 'EASY', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Desayuno')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'patata')        iid, 500  qty, 'g'           unit
   UNION ALL
   SELECT (SELECT id FROM ingredients WHERE name = 'huevo'),          6,      'unidades'
   UNION ALL
   SELECT (SELECT id FROM ingredients WHERE name = 'cebolla'),        1,      'unidad'
   UNION ALL
   SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),100,    'ml'
   UNION ALL
   SELECT (SELECT id FROM ingredients WHERE name = 'sal'),            1,      'cucharadita') t
WHERE r.title = 'Tortilla de patatas'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Pelar y cortar las patatas en rodajas finas de unos 3mm. Picar la cebolla en juliana.' `desc`
   UNION ALL SELECT 2, 'Freír las patatas con la cebolla en aceite a fuego medio-bajo 20 minutos hasta que estén tiernas. Escurrir bien.'
   UNION ALL SELECT 3, 'Batir los huevos con sal. Añadir las patatas y cebolla escurridas. Dejar reposar 5 minutos.'
   UNION ALL SELECT 4, 'Cuajar en sartén con poco aceite a fuego medio-bajo 3-4 min por lado. Dar la vuelta con un plato.'
   UNION ALL SELECT 5, 'Debe quedar jugosa por dentro. Reposar 5 minutos antes de servir.') s
WHERE r.title = 'Tortilla de patatas'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 2. GAZPACHO ANDALUZ
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Gazpacho andaluz',
  'Refrescante sopa fría de tomate con verduras frescas. Ideal para los días de calor, nutritivo y muy fácil de preparar.',
  20, 4, 'EASY', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Sopas')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'tomate')         iid, 1000 qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pepino'),       1,      'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimiento rojo'),0.5,    'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),          1,      'diente'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),50,   'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'vinagre'),      2,      'cucharadas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),          1,      'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pan de molde'), 50,     'g') t
WHERE r.title = 'Gazpacho andaluz'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Lavar y trocear todos los vegetales. Remojar el pan en agua fría 5 minutos y escurrir.' `desc`
   UNION ALL SELECT 2, 'Triturar todo con batidora de vaso 2-3 minutos hasta obtener textura muy suave.'
   UNION ALL SELECT 3, 'Colar por colador fino para eliminar pieles y semillas. Ajustar de sal y vinagre.'
   UNION ALL SELECT 4, 'Refrigerar al menos 2 horas. Servir muy frío con dados de pepino y tomate como guarnición.') s
WHERE r.title = 'Gazpacho andaluz'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 3. PASTA A LA CARBONARA
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Pasta a la carbonara',
  'La auténtica receta italiana: sin nata, solo panceta, huevo y parmesano. Cremosa y absolutamente irresistible.',
  30, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Pasta')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'pasta espagueti') iid, 400 qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'panceta'),      150,    'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'huevo'),          4,    'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'queso parmesano'),80,   'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),       1,    'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),            1,    'cucharadita') t
WHERE r.title = 'Pasta a la carbonara'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Cocer la pasta en agua con sal hasta al dente. Reservar un vaso del agua de cocción.' `desc`
   UNION ALL SELECT 2, 'Dorar la panceta en dados en sartén sin aceite hasta que esté crujiente. Reservar.'
   UNION ALL SELECT 3, 'Batir los huevos con la mitad del parmesano rallado y abundante pimienta negra.'
   UNION ALL SELECT 4, 'Mezclar la pasta caliente con la panceta fuera del fuego. Añadir la mezcla de huevo y remover con energía.'
   UNION ALL SELECT 5, 'Añadir agua de cocción poco a poco hasta conseguir salsa cremosa. No calentar el huevo directamente.'
   UNION ALL SELECT 6, 'Servir inmediatamente con el resto del parmesano y más pimienta negra.') s
WHERE r.title = 'Pasta a la carbonara'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 4. POLLO AL HORNO CON PATATAS
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Pollo al horno con patatas',
  'Clásico asado de pollo jugoso con patatas crujientes y hierbas aromáticas. Perfecto para una comida familiar.',
  90, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Carnes')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'pollo')          iid, 1200 qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'patata'),      600,    'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),           4,    'dientes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),50,  'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'romero'),        2,    'ramas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'tomillo'),       2,    'ramas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),           1,    'cucharada'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),      1,    'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'limón'),         1,    'unidad') t
WHERE r.title = 'Pollo al horno con patatas'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Precalentar el horno a 200°C con calor arriba y abajo.' `desc`
   UNION ALL SELECT 2, 'Cortar patatas en gajos, mezclar con aceite, sal, pimienta y hierbas. Extender en bandeja.'
   UNION ALL SELECT 3, 'Salar el pollo por dentro y por fuera. Frotar con aceite, ajo machacado y zumo de medio limón. Colocar sobre las patatas.'
   UNION ALL SELECT 4, 'Hornear 45 minutos. Dar la vuelta al pollo y regar con los jugos de la bandeja.'
   UNION ALL SELECT 5, 'Hornear 30-40 minutos más hasta que la piel esté dorada y crujiente.'
   UNION ALL SELECT 6, 'Reposar 10 minutos cubierto con papel de aluminio antes de servir.') s
WHERE r.title = 'Pollo al horno con patatas'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 5. SALMÓN AL HORNO
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Salmón al horno con limón y ajo',
  'Filetes de salmón marinados con limón, ajo y perejil, horneados en su punto. Saludable y listo en 25 minutos.',
  25, 2, 'EASY', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Pescados')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'salmón')          iid, 400  qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'limón'),         1,      'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),           2,      'dientes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),30,    'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'perejil'),       1,      'manojo'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),           1,      'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),      0.5,    'cucharadita') t
WHERE r.title = 'Salmón al horno con limón y ajo'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Precalentar el horno a 200°C. Preparar una bandeja con papel de horno.' `desc`
   UNION ALL SELECT 2, 'Mezclar aceite, zumo de medio limón, ajo laminado, sal y pimienta. Marinar el salmón 10 minutos.'
   UNION ALL SELECT 3, 'Hornear 15-18 minutos según el grosor, hasta que el salmón se desmigue fácilmente.'
   UNION ALL SELECT 4, 'Servir con perejil fresco picado y rodajas del limón restante.') s
WHERE r.title = 'Salmón al horno con limón y ajo'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 6. LENTEJAS ESTOFADAS
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Lentejas estofadas',
  'Reconfortante estofado de lentejas con verduras al estilo tradicional. Nutritivo, económico y lleno de sabor.',
  60, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Sopas')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'lenteja')        iid, 400  qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'zanahoria'),     2,      'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'patata'),        2,      'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'cebolla'),       1,      'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),           3,      'dientes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimiento rojo'), 1,      'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'tomate'),        2,      'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),50,    'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimentón dulce'),1,      'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'laurel'),        2,      'hojas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),           1,      'cucharadita') t
WHERE r.title = 'Lentejas estofadas'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Enjuagar las lentejas con agua fría.' `desc`
   UNION ALL SELECT 2, 'Sofreír cebolla y ajo en aceite a fuego medio hasta que estén transparentes (8 min).'
   UNION ALL SELECT 3, 'Añadir el pimiento y sofreír 5 minutos. Incorporar el tomate y el pimentón. Cocinar 3 minutos.'
   UNION ALL SELECT 4, 'Añadir lentejas, zanahoria en rodajas, patata en dados y laurel. Cubrir con agua (aprox. 1 litro). Salar.'
   UNION ALL SELECT 5, 'Llevar a ebullición, bajar el fuego y cocer tapado 35-40 minutos hasta que todo esté tierno.'
   UNION ALL SELECT 6, 'Retirar el laurel, ajustar de sal y consistencia. Servir caliente.') s
WHERE r.title = 'Lentejas estofadas'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 7. PASTA BOLOÑESA
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Pasta boloñesa',
  'Salsa boloñesa clásica con carne picada, verduras y tomate cocinada a fuego lento para un sabor profundo.',
  45, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Pasta')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'pasta penne')             iid, 400  qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'carne picada de ternera'), 500, 'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'cebolla'),              1,      'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),                  2,      'dientes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'tomate'),             400,      'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'zanahoria'),            1,      'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),     40,      'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'vino blanco'),        100,      'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'orégano'),              1,      'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),                  1,      'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),            0.5,     'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'queso parmesano'),     50,      'g') t
WHERE r.title = 'Pasta boloñesa'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Picar cebolla, ajo y zanahoria finamente. Sofreír en aceite a fuego medio 8-10 minutos.' `desc`
   UNION ALL SELECT 2, 'Subir el fuego y añadir la carne picada. Dorar removiendo para que quede suelta.'
   UNION ALL SELECT 3, 'Verter el vino blanco y dejar evaporar el alcohol durante 2 minutos.'
   UNION ALL SELECT 4, 'Añadir el tomate, orégano, sal y pimienta. Cocer a fuego lento 25-30 minutos.'
   UNION ALL SELECT 5, 'Cocer la pasta en agua con sal. Escurrir reservando un poco del agua de cocción.'
   UNION ALL SELECT 6, 'Mezclar la pasta con la salsa. Servir con parmesano rallado por encima.') s
WHERE r.title = 'Pasta boloñesa'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 8. TOSTADAS CON AGUACATE
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Tostadas con aguacate',
  'El desayuno saludable por excelencia: tostadas crujientes con aguacate cremoso, tomate fresco y un toque de limón.',
  10, 2, 'EASY', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Desayuno')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'pan de molde')   iid, 4    qty, 'rebanadas'   unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aguacate'),    2,      'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'limón'),       0.5,    'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'tomate'),      1,      'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),         0.5,    'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),    0.25,   'cucharadita') t
WHERE r.title = 'Tostadas con aguacate'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Tostar el pan hasta que esté bien dorado y crujiente.' `desc`
   UNION ALL SELECT 2, 'Aplastar el aguacate con un tenedor y mezclar con zumo de limón, sal y pimienta.'
   UNION ALL SELECT 3, 'Untar el aguacate sobre las tostadas. Añadir rodajas finas de tomate y servir inmediatamente.') s
WHERE r.title = 'Tostadas con aguacate'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 9. CREMA CATALANA
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Crema catalana',
  'El postre tradicional catalán: natillas aromáticas con infusión de limón y canela, rematadas con azúcar caramelizado.',
  30, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Postre')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'leche')           iid, 500  qty, 'ml'          unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'nata'),        200,    'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'huevo'),         4,    'yemas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'azúcar'),      120,    'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'maicena'),      20,    'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'limón'),        0.5,   'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'canela'),        1,    'rama') t
WHERE r.title = 'Crema catalana'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Calentar leche con nata, cáscara de limón y canela hasta hervir. Retirar e infusionar 10 minutos.' `desc`
   UNION ALL SELECT 2, 'Batir las yemas con 100g de azúcar hasta blanquear. Añadir la maicena y mezclar.'
   UNION ALL SELECT 3, 'Colar la leche tibia y añadirla poco a poco a las yemas sin parar de batir.'
   UNION ALL SELECT 4, 'Cocer a fuego medio-bajo removiendo 8-10 minutos hasta que espese y nape la cuchara.'
   UNION ALL SELECT 5, 'Repartir en cazuelitas, cubrir con film y refrigerar mínimo 2 horas.'
   UNION ALL SELECT 6, 'Antes de servir, espolvorear azúcar y quemar con soplete hasta formar caramelo crujiente.') s
WHERE r.title = 'Crema catalana'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 10. ENSALADA CÉSAR CON POLLO
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Ensalada César con pollo',
  'La ensalada más famosa del mundo: lechuga crujiente, pollo a la plancha, picatostes y salsa César con anchoas.',
  20, 2, 'EASY', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Almuerzo')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'lechuga')         iid, 1    qty, 'unidad'      unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pollo'),       300,    'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pan de molde'),  2,    'rebanadas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'queso parmesano'),50,  'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),           1,    'diente'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),60,  'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'anchoa'),        4,    'filetes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'limón'),         0.5,  'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),           0.5,  'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),      0.25, 'cucharadita') t
WHERE r.title = 'Ensalada César con pollo'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Salpimentar el pollo y asarlo a la plancha con aceite. Cortar en tiras y reservar.' `desc`
   UNION ALL SELECT 2, 'Cortar el pan en dados y dorar en sartén con aceite y ajo hasta conseguir picatostes crujientes.'
   UNION ALL SELECT 3, 'Salsa: machacar las anchoas con ajo hasta pasta. Mezclar con aceite, limón, sal y pimienta.'
   UNION ALL SELECT 4, 'Trocear la lechuga y mezclar con la salsa. Añadir el pollo y los picatostes.'
   UNION ALL SELECT 5, 'Terminar con virutas de parmesano y servir inmediatamente.') s
WHERE r.title = 'Ensalada César con pollo'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 11. CROQUETAS DE JAMÓN
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Croquetas de jamón serrano',
  'Bechamel cremosa con jamón serrano, rebozadas y fritas hasta conseguir una corteza dorada y crujiente irresistible.',
  60, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Snack')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'jamón serrano')   iid, 150  qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'harina'),       80,     'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'mantequilla'),  60,     'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'leche'),       500,     'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'huevo'),         2,     'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pan rallado'), 150,     'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),500,  'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),          0.5,    'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),     0.25,   'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'nuez moscada'), 0.25,   'cucharadita') t
WHERE r.title = 'Croquetas de jamón serrano'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Picar el jamón muy fino. Derretir la mantequilla en cazuela a fuego medio.' `desc`
   UNION ALL SELECT 2, 'Añadir la harina y rehogar removiendo 2 minutos para que pierda el sabor a crudo.'
   UNION ALL SELECT 3, 'Incorporar la leche caliente poco a poco sin parar de remover. Añadir jamón, sal, pimienta y nuez moscada.'
   UNION ALL SELECT 4, 'Cocer a fuego medio-bajo 10-12 minutos hasta que la bechamel sea muy espesa y se despegue de las paredes.'
   UNION ALL SELECT 5, 'Extender en fuente, cubrir con film tocando la superficie y refrigerar mínimo 3 horas.'
   UNION ALL SELECT 6, 'Formar croquetas, pasar por huevo batido y pan rallado. Freír en aceite a 180°C hasta dorar.') s
WHERE r.title = 'Croquetas de jamón serrano'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 12. ARROZ CON LECHE
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Arroz con leche',
  'El postre de la abuela: arroz cremoso cocinado lentamente en leche con canela y limón, espolvoreado con canela molida.',
  40, 4, 'EASY', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Postre')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'arroz')           iid, 150  qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'leche'),      1000,    'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'azúcar'),      100,    'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'limón'),       0.5,    'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'canela'),        1,    'rama'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'mantequilla'),  20,    'g'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),          0.25,  'cucharadita') t
WHERE r.title = 'Arroz con leche'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Calentar la leche con cáscara de limón, canela en rama y una pizca de sal hasta hervir.' `desc`
   UNION ALL SELECT 2, 'Añadir el arroz sin lavar (el almidón da cremosidad). Bajar el fuego al mínimo.'
   UNION ALL SELECT 3, 'Cocer a fuego muy lento 30-35 minutos, removiendo frecuentemente para que no se pegue.'
   UNION ALL SELECT 4, 'Añadir el azúcar y la mantequilla. Remover y cocer 5 minutos más.'
   UNION ALL SELECT 5, 'Retirar la cáscara de limón y la canela. Repartir en boles y espolvorear canela molida.') s
WHERE r.title = 'Arroz con leche'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 13. MERLUZA EN SALSA VERDE
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Merluza en salsa verde',
  'Receta vasca tradicional: lomos de merluza en una delicada salsa verde de ajo, perejil y caldo de pescado.',
  30, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Pescados')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'merluza')         iid, 800  qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),           4,     'dientes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'perejil'),       1,     'manojo'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),60,   'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'caldo de pescado'),250, 'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'harina'),        2,     'cucharadas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),           1,     'cucharadita') t
WHERE r.title = 'Merluza en salsa verde'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Salar los lomos de merluza y dejar reposar 10 minutos. Enharinarlos ligeramente.' `desc`
   UNION ALL SELECT 2, 'Calentar aceite en cazuela baja. Dorar el ajo laminado a fuego medio-bajo sin que se queme.'
   UNION ALL SELECT 3, 'Dorar los lomos de merluza 2 minutos por lado y retirar. Reservar.'
   UNION ALL SELECT 4, 'En el mismo aceite, tostar una cucharada de harina. Añadir el caldo poco a poco removiendo.'
   UNION ALL SELECT 5, 'Añadir el perejil picado y devolver la merluza. Cocer tapado a fuego suave 8-10 minutos moviendo la cazuela en círculos para ligar la salsa.') s
WHERE r.title = 'Merluza en salsa verde'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 14. SOFRITO DE VERDURAS
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Sofrito de verduras',
  'Base aromática mediterránea: pimientos, cebolla, ajo y tomate pochados lentamente en aceite de oliva. Versátil y delicioso.',
  25, 4, 'EASY', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Vegetariano')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'pimiento rojo')   iid, 2    qty, 'unidades'    unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimiento verde'),  2,   'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'cebolla'),         2,   'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'tomate'),          4,   'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),             3,   'dientes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'), 60,  'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),             1,   'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'pimienta'),        0.5, 'cucharadita') t
WHERE r.title = 'Sofrito de verduras'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Picar la cebolla en juliana, el ajo en láminas, los pimientos en tiras y el tomate en dados.' `desc`
   UNION ALL SELECT 2, 'Calentar el aceite a fuego medio-bajo. Pochar cebolla y ajo con una pizca de sal 10 minutos hasta transparentar.'
   UNION ALL SELECT 3, 'Añadir los pimientos y sofreír 10 minutos más hasta que estén tiernos.'
   UNION ALL SELECT 4, 'Incorporar el tomate y cocer a fuego medio 15 minutos hasta que reduzca y concentre.'
   UNION ALL SELECT 5, 'Ajustar de sal y pimienta. Servir como plato principal, guarnición o base para arroces y carnes.') s
WHERE r.title = 'Sofrito de verduras'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

-- 15. POLLO AL CURRY CON ARROZ
INSERT INTO recipes (title, description, prep_time, servings, difficulty, is_public, user_id, category_id)
VALUES (
  'Pollo al curry con arroz',
  'Suculento pollo en salsa de curry cremosa con tomate y cebolla. Exótico, aromático y muy fácil de preparar.',
  40, 4, 'MEDIUM', TRUE,
  (SELECT id FROM users WHERE email = 'chef@sabores.com'),
  (SELECT id FROM categories WHERE name = 'Carnes')
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, t.iid, t.qty, t.unit
FROM recipes r,
  (SELECT (SELECT id FROM ingredients WHERE name = 'pollo')           iid, 700  qty, 'g'           unit
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'cebolla'),       1,     'unidad'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'ajo'),           3,     'dientes'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'tomate'),        2,     'unidades'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'nata'),        200,     'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'curry'),         2,     'cucharadas'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'aceite de oliva'),40,   'ml'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'sal'),           1,     'cucharadita'
   UNION ALL SELECT (SELECT id FROM ingredients WHERE name = 'arroz'),       300,     'g') t
WHERE r.title = 'Pollo al curry con arroz'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

INSERT INTO recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.num, s.desc FROM recipes r,
  (SELECT 1 num, 'Cortar el pollo en dados medianos y salpimentar.' `desc`
   UNION ALL SELECT 2, 'Dorar el pollo en aceite caliente a fuego alto hasta sellar. Retirar y reservar.'
   UNION ALL SELECT 3, 'Sofreír cebolla y ajo picados hasta pochar. Añadir el curry y tostar 1 minuto removiendo.'
   UNION ALL SELECT 4, 'Incorporar el tomate y cocer 5 minutos. Añadir el pollo reservado y la nata.'
   UNION ALL SELECT 5, 'Cocer a fuego medio 15-20 minutos hasta que el pollo esté tierno y la salsa haya reducido.'
   UNION ALL SELECT 6, 'Cocer el arroz aparte en agua con sal. Servir el pollo al curry sobre el arroz.') s
WHERE r.title = 'Pollo al curry con arroz'
  AND r.user_id = (SELECT id FROM users WHERE email = 'chef@sabores.com');

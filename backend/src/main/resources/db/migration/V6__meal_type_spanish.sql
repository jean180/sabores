-- Ampliar el ENUM para aceptar temporalmente ambos conjuntos de valores
ALTER TABLE meal_plan
  MODIFY COLUMN meal_type ENUM('BREAKFAST','ALMUERZO','LUNCH','SNACK','DINNER',
                                'DESAYUNO','COMIDA','MERIENDA','CENA') NOT NULL;

-- Migrar datos existentes a los nuevos valores en castellano
UPDATE meal_plan SET meal_type = 'DESAYUNO'  WHERE meal_type = 'BREAKFAST';
UPDATE meal_plan SET meal_type = 'COMIDA'    WHERE meal_type = 'LUNCH';
UPDATE meal_plan SET meal_type = 'MERIENDA'  WHERE meal_type = 'SNACK';
UPDATE meal_plan SET meal_type = 'CENA'      WHERE meal_type = 'DINNER';

-- Dejar solo los valores en castellano
ALTER TABLE meal_plan
  MODIFY COLUMN meal_type ENUM('DESAYUNO','ALMUERZO','COMIDA','MERIENDA','CENA') NOT NULL;

ALTER TABLE ingredients ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'OTROS';

UPDATE ingredients SET category = 'VERDURAS' WHERE name IN (
  'aguacate','ajo','brócoli','cebolla','cebolleta','champiñones',
  'espinacas','lechuga','patata','pepino','pimiento rojo','pimiento verde',
  'puerro','tomate','zanahoria'
);

UPDATE ingredients SET category = 'FRUTAS' WHERE name IN ('limón');

UPDATE ingredients SET category = 'CARNES' WHERE name IN (
  'carne picada de ternera','jamón serrano','panceta','pollo'
);

UPDATE ingredients SET category = 'PESCADOS' WHERE name IN (
  'anchoa','gambas','merluza','salmón'
);

UPDATE ingredients SET category = 'LACTEOS' WHERE name IN (
  'huevo','leche','mantequilla','nata','queso manchego','queso parmesano',
  'yemas','yogur'
);

UPDATE ingredients SET category = 'CEREALES' WHERE name IN (
  'arroz','harina','maicena','pan de molde','pan rallado',
  'pasta espagueti','pasta penne'
);

UPDATE ingredients SET category = 'LEGUMBRES' WHERE name IN ('garbanzo','lenteja');

UPDATE ingredients SET category = 'CONDIMENTOS' WHERE name IN (
  'aceite de oliva','almendra','azafrán','azúcar','azúcar moreno','canela',
  'curry','laurel','nuez moscada','orégano','perejil','pimentón dulce',
  'pimentón picante','pimienta','romero','sal','tomillo','vainilla','vinagre'
);

UPDATE ingredients SET category = 'CALDOS' WHERE name IN (
  'caldo de pescado','caldo de pollo','caldo de verduras','vino blanco'
);

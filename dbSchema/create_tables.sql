CREATE TABLE users (username VARCHAR(10) UNIQUE NOT NULL,
                            password VARCHAR(10) NOT NULL
                            );


CREATE TABLE object_templates (ID SERIAL PRIMARY KEY,
                            Name VARCHAR(100) NOT NULL,
                            GC NUMERIC(10, 3) NOT NULL,
                            Weight NUMERIC(10, 3) NOT NULL,
                            type object_type NOT NULL
                            );


CREATE TABLE expeditions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  current_cycle_number int NOT NULL DEFAULT 1;
);

ALTER TABLE expeditions
ADD COLUMN total_gold_cost NUMERIC(12, 2) NOT NULL DEFAULT 0;

CREATE TABLE object_instances (
  id SERIAL PRIMARY KEY,
  expedition_id INTEGER REFERENCES expeditions(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES object_templates(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  modifier NUMERIC(10, 2) NOT NULL DEFAULT 1,
  notes TEXT
  cycle_number INTEGER NOT NULL DEFAULT 1;
);

CREATE TABLE active_supplies (
template_id INTEGER REFERENCES object_templates(id),
expedition_id INTEGER REFERENCES expeditions(id) ON DELETE CASCADE,
quantity INTEGER NOT NULL DEFAULT 0,
type ration_type NOT NULL,
PRIMARY KEY (template_id, expedition_id)
);

CREATE VIEW object_instance_details AS
SELECT 
  oi.id,
  oi.expedition_id,
  oi.template_id,
  oi.quantity,
  oi.modifier,
  oi.notes,
  ot.GC,
  ot.Weight,
  ot.Name,
  ot.type,
  (ot.GC * oi.modifier * oi.quantity) AS total_cost
FROM 
  object_instances oi
JOIN 
  object_templates ot ON oi.template_id = ot.id;

CREATE TABLE expedition_logs (
  id SERIAL PRIMARY KEY,
  expedition_id INTEGER REFERENCES expeditions(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  cycle_days INTEGER NOT NULL,
  log_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cycle_number INT
);

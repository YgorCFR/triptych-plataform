CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,  -- Add the email column
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile (
   id SERIAL PRIMARY KEY,
   possui_zenodo INTEGER NULL,
   possui_osf INTEGER NULL,
   possui_arxiv INTEGER NULL,
   universidade TEXT NULL,
   sobre TEXT NULL,
   areas TEXT NULL,
   user_id INTEGER NOT NULL,
   CONSTRAINT fk_user_profile FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS topico (
  id SERIAL PRIMARY KEY,
  nome_topico VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS topicos_interesse (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL,
  topico_id INTEGER NOT NULL,
  CONSTRAINT fk_topicointeresse_topico FOREIGN KEY(topico_id) REFERENCES  topico(id),
  CONSTRAINT fk_topicointeresse_profile FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE IF NOT EXISTS projeto (
   id SERIAL PRIMARY KEY,
   nome VARCHAR NOT NULL,
   descricao TEXT NULL,
   id_autor INTEGER NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NULL,
   images_urls TEXT NULL,
   id_topico INTEGER NOT NULL,
   id_osf VARCHAR NULL,
   id_zenodo VARCHAR NULL,
   tags JSON,
   CONSTRAINT fk_topico_projeto FOREIGN KEY(id_topico) REFERENCES topico(id),
   CONSTRAINT fk_users_projeto FOREIGN KEY(id_autor) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS membros_projeto (
   id SERIAL PRIMARY KEY,
   id_usuario INTEGER NOT NULL,
   id_projeto INTEGER NOT NULL,
   CONSTRAINT fk_membro_usuario FOREIGN KEY(id_usuario) REFERENCES users(id),
   CONSTRAINT fk_membro_projeto FOREIGN KEY(id_projeto) REFERENCES projeto(id)
);



-- Insert predefined user (optional)
INSERT INTO users (username, email, hashed_password) VALUES ('admin', 'admin@example.com', 'hashed_admin_password');
INSERT INTO topico (nome_topico) VALUES ('Engenharia de Software');
INSERT INTO topico (nome_topico) VALUES ('Grafos');
INSERT INTO topico (nome_topico) VALUES ('Aprendizado de Maquina');
INSERT INTO topico (nome_topico) VALUES ('Estatistica');
INSERT INTO topico (nome_topico) VALUES ('Matematica');
INSERT INTO topico (nome_topico) VALUES ('BigData');

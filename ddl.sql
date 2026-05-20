-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema facial-tcc
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS facial-tcc ;

-- -----------------------------------------------------
-- Schema facial-tcc
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS facial-tcc DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE facial-tcc ;

-- -----------------------------------------------------
-- Table facial-tcc.turmas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS facial-tcc.turmas (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(45) NOT NULL,
  PRIMARY KEY (id))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table facial-tcc.alunos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS facial-tcc.alunos (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  matricula VARCHAR(255) NOT NULL,
  rfid VARCHAR(255) NOT NULL,
  foto VARCHAR(255) NOT NULL,
  telefone VARCHAR(45) NOT NULL,
  nome_responsavel VARCHAR(45) NOT NULL,
  turmas_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX fk_alunos_turmas1_idx (turmas_id ASC) VISIBLE,
  CONSTRAINT fk_alunos_turmas1
    FOREIGN KEY (turmas_id)
    REFERENCES facial-tcc.turmas (id))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table facial-tcc.professores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS facial-tcc.professores (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  rfid VARCHAR(255) NOT NULL,
  foto VARCHAR(255) NOT NULL,
  telefone VARCHAR(45) NOT NULL,
  PRIMARY KEY (id))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table facial-tcc.registros_acessos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS facial-tcc.registros_acessos (
  id INT NOT NULL AUTO_INCREMENT,
  tipo_identificacao ENUM('rfid', 'facial') NOT NULL,
  data_hora DATETIME NOT NULL,
  tipo_acesso ENUM('entrada', 'saida') NOT NULL,
  alunos_id INT NULL DEFAULT NULL,
  professores_id INT NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX fk_registros_acessos_alunos_idx (alunos_id ASC) VISIBLE,
  INDEX fk_registros_acessos_professores1_idx (professores_id ASC) VISIBLE,
  CONSTRAINT fk_registros_acessos_alunos
    FOREIGN KEY (alunos_id)
    REFERENCES facial-tcc.alunos (id),
  CONSTRAINT fk_registros_acessos_professores1
    FOREIGN KEY (professores_id)
    REFERENCES facial-tcc.professores (id))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table facial-tcc.turmas_has_professores
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS facial-tcc.turmas_has_professores (
  turmas_id INT NOT NULL,
  professores_id INT NOT NULL,
  PRIMARY KEY (turmas_id, professores_id),
  INDEX fk_turmas_has_professores_professores1_idx (professores_id ASC) VISIBLE,
  INDEX fk_turmas_has_professores_turmas1_idx (turmas_id ASC) VISIBLE,
  CONSTRAINT fk_turmas_has_professores_professores1
    FOREIGN KEY (professores_id)
    REFERENCES facial-tcc.professores (id),
  CONSTRAINT fk_turmas_has_professores_turmas1
    FOREIGN KEY (turmas_id)
    REFERENCES facial-tcc.turmas (id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
-- =========================================================
-- BASE DE DATOS
-- Sistema DYGS - Evaluación Docente
-- =========================================================

CREATE DATABASE IF NOT EXISTS sistema_dygs;
USE sistema_dygs;


-- =========================================================
-- ELIMINAR TABLAS ANTERIORES
-- Se eliminan en este orden por las llaves foráneas
-- =========================================================

DROP TABLE IF EXISTS evaluaciones;
DROP TABLE IF EXISTS inscripciones;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS materias;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS alumnos;
DROP TABLE IF EXISTS usuarios;


-- =========================================================
-- 1. TABLA USUARIOS
-- Contiene los datos necesarios para iniciar sesión
-- =========================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    perfil ENUM(
        'alumno',
        'coordinador',
        'docente',
        'admin'
    ) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. TABLA ALUMNOS
-- Información específica de los usuarios tipo alumno
-- =========================================================

CREATE TABLE alumnos (
    id_alumno INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    carrera VARCHAR(100),
    grupo VARCHAR(20),

    UNIQUE (usuario_id),

    CONSTRAINT fk_alumno_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================================
-- 3. TABLA DOCENTES
-- Información específica de los profesores
-- usuario_id puede ser NULL si el profesor todavía
-- no tiene una cuenta para entrar al sistema
-- =========================================================

CREATE TABLE docentes (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nombre VARCHAR(100) NOT NULL,

    UNIQUE (usuario_id),

    CONSTRAINT fk_docente_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================================================
-- 4. TABLA MATERIAS
-- Catálogo general de materias
-- =========================================================

CREATE TABLE materias (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- 5. TABLA CURSOS
-- Relaciona una materia con un profesor
--
-- Ejemplo:
-- Cálculo + Profesor Andrés + Grupo A + 2026-2
-- =========================================================

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,
    id_docente INT NOT NULL,
    grupo VARCHAR(20) NOT NULL,
    periodo VARCHAR(50) NOT NULL,

    CONSTRAINT fk_curso_materia
        FOREIGN KEY (id_materia)
        REFERENCES materias(id_materia)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_curso_docente
        FOREIGN KEY (id_docente)
        REFERENCES docentes(id_docente)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    UNIQUE (
        id_materia,
        id_docente,
        grupo,
        periodo
    )
);


-- =========================================================
-- 6. TABLA INSCRIPCIONES
-- Indica qué cursos tiene inscritos cada alumno
--
-- Esta tabla permitirá que cada alumno vea solamente
-- sus materias y profesores correspondientes.
-- =========================================================

CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_curso INT NOT NULL,

    UNIQUE (id_alumno, id_curso),

    CONSTRAINT fk_inscripcion_alumno
        FOREIGN KEY (id_alumno)
        REFERENCES alumnos(id_alumno)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_inscripcion_curso
        FOREIGN KEY (id_curso)
        REFERENCES cursos(id_curso)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================================
-- 7. TABLA EVALUACIONES
--
-- Ya no guardamos:
-- alumno_cuenta
-- docente
-- materia
--
-- porque toda esa información se puede conocer mediante
-- id_inscripcion.
-- =========================================================

CREATE TABLE evaluaciones (
    id_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
    id_inscripcion INT NOT NULL,

    q1 DECIMAL(3,1) NOT NULL,
    q2 DECIMAL(3,1) NOT NULL,
    q3 DECIMAL(3,1) NOT NULL,
    q4 DECIMAL(3,1) NOT NULL,
    q5 DECIMAL(3,1) NOT NULL,

    promedio DECIMAL(4,2) NOT NULL,

    fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Un alumno solamente puede evaluar una vez
    -- cada inscripción/curso.
    UNIQUE (id_inscripcion),

    CONSTRAINT fk_evaluacion_inscripcion
        FOREIGN KEY (id_inscripcion)
        REFERENCES inscripciones(id_inscripcion)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================================
-- DATOS DE PRUEBA
-- =========================================================


-- =========================================================
-- 8. USUARIOS
--
-- Dos alumnos
-- Cuatro docentes
-- Un coordinador
-- Un administrador
-- =========================================================

INSERT INTO usuarios (cuenta, password, perfil)
VALUES
('12345678', '123456', 'alumno'),
('87654321', '123456', 'alumno'),

('andres@uvm.edu', '123456', 'docente'),
('jorge@uvm.edu', '123456', 'docente'),
('jose@uvm.edu', '123456', 'docente'),
('julio@uvm.edu', '123456', 'docente'),

('coord@uvm.edu', 'coord123', 'coordinador'),
('admin@uvm.edu', 'admin123', 'admin');


-- =========================================================
-- 9. ALUMNOS
-- =========================================================

INSERT INTO alumnos (
    usuario_id,
    nombre,
    carrera,
    grupo
)
SELECT
    id,
    'Alumno Uno',
    'Ingeniería',
    'Grupo A'
FROM usuarios
WHERE cuenta = '12345678';


INSERT INTO alumnos (
    usuario_id,
    nombre,
    carrera,
    grupo
)
SELECT
    id,
    'Alumno Dos',
    'Ingeniería',
    'Grupo B'
FROM usuarios
WHERE cuenta = '87654321';


-- =========================================================
-- 10. DOCENTES
-- =========================================================

INSERT INTO docentes (usuario_id, nombre)
SELECT id, 'Profesor Andrés'
FROM usuarios
WHERE cuenta = 'andres@uvm.edu';


INSERT INTO docentes (usuario_id, nombre)
SELECT id, 'Profesor Jorge'
FROM usuarios
WHERE cuenta = 'jorge@uvm.edu';


INSERT INTO docentes (usuario_id, nombre)
SELECT id, 'Profesor José'
FROM usuarios
WHERE cuenta = 'jose@uvm.edu';


INSERT INTO docentes (usuario_id, nombre)
SELECT id, 'Profesor Julio'
FROM usuarios
WHERE cuenta = 'julio@uvm.edu';


-- =========================================================
-- 11. MATERIAS
-- =========================================================

INSERT INTO materias (nombre)
VALUES
('Cálculo'),
('Estadística'),
('Estática'),
('Mecánica');


-- =========================================================
-- 12. CURSOS
--
-- Cada curso representa:
-- materia + profesor + grupo + periodo
-- =========================================================


-- Cálculo - Profesor Andrés - Grupo A
INSERT INTO cursos (
    id_materia,
    id_docente,
    grupo,
    periodo
)
SELECT
    m.id_materia,
    d.id_docente,
    'Grupo A',
    '2026-2'
FROM materias m
JOIN docentes d
WHERE m.nombre = 'Cálculo'
AND d.nombre = 'Profesor Andrés';


-- Estadística - Profesor Jorge - Grupo A
INSERT INTO cursos (
    id_materia,
    id_docente,
    grupo,
    periodo
)
SELECT
    m.id_materia,
    d.id_docente,
    'Grupo A',
    '2026-2'
FROM materias m
JOIN docentes d
WHERE m.nombre = 'Estadística'
AND d.nombre = 'Profesor Jorge';


-- Estática - Profesor José - Grupo B
INSERT INTO cursos (
    id_materia,
    id_docente,
    grupo,
    periodo
)
SELECT
    m.id_materia,
    d.id_docente,
    'Grupo B',
    '2026-2'
FROM materias m
JOIN docentes d
WHERE m.nombre = 'Estática'
AND d.nombre = 'Profesor José';


-- Mecánica - Profesor Julio - Grupo B
INSERT INTO cursos (
    id_materia,
    id_docente,
    grupo,
    periodo
)
SELECT
    m.id_materia,
    d.id_docente,
    'Grupo B',
    '2026-2'
FROM materias m
JOIN docentes d
WHERE m.nombre = 'Mecánica'
AND d.nombre = 'Profesor Julio';


-- =========================================================
-- 13. INSCRIPCIONES DEL ALUMNO 1
--
-- Cuenta: 12345678
--
-- Cálculo       - Profesor Andrés
-- Estadística   - Profesor Jorge
-- =========================================================


-- Alumno 1 -> Cálculo
INSERT INTO inscripciones (
    id_alumno,
    id_curso
)
SELECT
    a.id_alumno,
    c.id_curso
FROM alumnos a
JOIN usuarios u
    ON u.id = a.usuario_id
JOIN cursos c
JOIN materias m
    ON m.id_materia = c.id_materia
WHERE u.cuenta = '12345678'
AND m.nombre = 'Cálculo';


-- Alumno 1 -> Estadística
INSERT INTO inscripciones (
    id_alumno,
    id_curso
)
SELECT
    a.id_alumno,
    c.id_curso
FROM alumnos a
JOIN usuarios u
    ON u.id = a.usuario_id
JOIN cursos c
JOIN materias m
    ON m.id_materia = c.id_materia
WHERE u.cuenta = '12345678'
AND m.nombre = 'Estadística';


-- =========================================================
-- 14. INSCRIPCIONES DEL ALUMNO 2
--
-- Cuenta: 87654321
--
-- Estática   - Profesor José
-- Mecánica   - Profesor Julio
-- =========================================================


-- Alumno 2 -> Estática
INSERT INTO inscripciones (
    id_alumno,
    id_curso
)
SELECT
    a.id_alumno,
    c.id_curso
FROM alumnos a
JOIN usuarios u
    ON u.id = a.usuario_id
JOIN cursos c
JOIN materias m
    ON m.id_materia = c.id_materia
WHERE u.cuenta = '87654321'
AND m.nombre = 'Estática';


-- Alumno 2 -> Mecánica
INSERT INTO inscripciones (
    id_alumno,
    id_curso
)
SELECT
    a.id_alumno,
    c.id_curso
FROM alumnos a
JOIN usuarios u
    ON u.id = a.usuario_id
JOIN cursos c
JOIN materias m
    ON m.id_materia = c.id_materia
WHERE u.cuenta = '87654321'
AND m.nombre = 'Mecánica';


-- =========================================================
-- CONSULTAS DE PRUEBA
-- =========================================================


-- =========================================================
-- 15. VER TODOS LOS USUARIOS
-- =========================================================

SELECT *
FROM usuarios;


-- =========================================================
-- 16. VER TODOS LOS ALUMNOS
-- =========================================================

SELECT *
FROM alumnos;


-- =========================================================
-- 17. VER TODOS LOS DOCENTES
-- =========================================================

SELECT *
FROM docentes;


-- =========================================================
-- 18. VER TODOS LOS CURSOS
-- =========================================================

SELECT
    c.id_curso,
    m.nombre AS materia,
    d.nombre AS docente,
    c.grupo,
    c.periodo
FROM cursos c

INNER JOIN materias m
    ON m.id_materia = c.id_materia

INNER JOIN docentes d
    ON d.id_docente = c.id_docente;


-- =========================================================
-- 19. VER TODAS LAS INSCRIPCIONES
-- =========================================================

SELECT
    i.id_inscripcion,
    u.cuenta,
    a.nombre AS alumno,
    m.nombre AS materia,
    d.nombre AS docente,
    c.grupo,
    c.periodo
FROM inscripciones i

INNER JOIN alumnos a
    ON a.id_alumno = i.id_alumno

INNER JOIN usuarios u
    ON u.id = a.usuario_id

INNER JOIN cursos c
    ON c.id_curso = i.id_curso

INNER JOIN materias m
    ON m.id_materia = c.id_materia

INNER JOIN docentes d
    ON d.id_docente = c.id_docente

ORDER BY a.id_alumno, c.id_curso;


-- =========================================================
-- 20. CONSULTA PRINCIPAL
-- MATERIAS DEL ALUMNO 1
-- =========================================================

SELECT
    i.id_inscripcion,
    c.id_curso,
    u.cuenta,
    a.nombre AS alumno,
    m.nombre AS materia,
    d.nombre AS docente,
    c.grupo,
    c.periodo
FROM usuarios u

INNER JOIN alumnos a
    ON a.usuario_id = u.id

INNER JOIN inscripciones i
    ON i.id_alumno = a.id_alumno

INNER JOIN cursos c
    ON c.id_curso = i.id_curso

INNER JOIN materias m
    ON m.id_materia = c.id_materia

INNER JOIN docentes d
    ON d.id_docente = c.id_docente

WHERE u.cuenta = '12345678';


-- =========================================================
-- 21. CONSULTA PRINCIPAL
-- MATERIAS DEL ALUMNO 2
-- =========================================================

SELECT
    i.id_inscripcion,
    c.id_curso,
    u.cuenta,
    a.nombre AS alumno,
    m.nombre AS materia,
    d.nombre AS docente,
    c.grupo,
    c.periodo
FROM usuarios u

INNER JOIN alumnos a
    ON a.usuario_id = u.id

INNER JOIN inscripciones i
    ON i.id_alumno = a.id_alumno

INNER JOIN cursos c
    ON c.id_curso = i.id_curso

INNER JOIN materias m
    ON m.id_materia = c.id_materia

INNER JOIN docentes d
    ON d.id_docente = c.id_docente

WHERE u.cuenta = '87654321';
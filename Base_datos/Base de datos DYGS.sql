-- Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS sistema_dygs;
USE sistema_dygs;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cuenta VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    perfil ENUM('alumno', 'coordinador', 'docente', 'admin') NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Evaluaciones Docentes
CREATE TABLE IF NOT EXISTS evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_cuenta VARCHAR(50) NOT NULL,
    docente VARCHAR(100) NOT NULL,
    materia VARCHAR(100) NOT NULL,
    q1 DECIMAL(3,1),
    q2 DECIMAL(3,1),
    q3 DECIMAL(3,1),
    q4 DECIMAL(3,1),
    q5 DECIMAL(3,1),
    promedio DECIMAL(4,2),
    carrera VARCHAR(50) DEFAULT 'Ingeniería',
    grupo VARCHAR(10) DEFAULT 'Grupo A',
    fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Registros iniciales
INSERT INTO usuarios (cuenta, password, perfil) VALUES 
('12345678', '123456', 'alumno'),
('admin@uvm.edu', 'admin123', 'admin'),
('coord@uvm.edu', 'coord123', 'coordinador')
ON DUPLICATE KEY UPDATE cuenta=cuenta;

SELECT * FROM sistema_dygs.usuarios;


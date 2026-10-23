require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());


// =========================================================
// CONEXIÓN A MYSQL
// =========================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});


db.connect((err) => {

    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('Conexión exitosa a la base de datos MySQL (sistema_dygs)');
    }

});


// =========================================================
// REGISTRO DE USUARIO
// =========================================================

app.post('/api/registro', (req, res) => {

    const { cuenta, password, perfil } = req.body;

    const query = `
        INSERT INTO usuarios (cuenta, password, perfil)
        VALUES (?, ?, ?)
    `;

    db.query(query, [cuenta, password, perfil], (err, result) => {

        if (err) {

            console.error('Error al registrar:', err);

            return res.status(500).json({
                error: 'Error al registrar usuario en la base de datos'
            });

        }

        res.json({
            message: '¡Usuario registrado con éxito!'
        });

    });

});


// =========================================================
// LOGIN
// =========================================================

app.post('/api/login', (req, res) => {

    const { cuenta, password, perfil } = req.body;

    const query = `
        SELECT id, cuenta, perfil
        FROM usuarios
        WHERE cuenta = ?
        AND password = ?
        AND perfil = ?
    `;

    db.query(
        query,
        [cuenta, password, perfil],
        (err, results) => {

            if (err) {

                console.error('Error en login:', err);

                return res.status(500).json({
                    error: 'Error en el servidor'
                });

            }

            if (results.length > 0) {

                const usuario = results[0];

                res.json({
                    message: 'Login exitoso',

                    usuario: {
                        id: usuario.id,
                        cuenta: usuario.cuenta,
                        perfil: usuario.perfil
                    }
                });

            } else {

                res.status(401).json({
                    message: 'Credenciales o perfil incorrectos'
                });

            }

        }
    );

});


// =========================================================
// OBTENER CURSOS DEL ALUMNO
// =========================================================
//
// Ejemplo:
// GET /api/alumnos/12345678/cursos
//
// Devuelve solamente las materias y docentes
// correspondientes a ese alumno.
//
// =========================================================

app.get('/api/alumnos/:cuenta/cursos', (req, res) => {

    const cuenta = req.params.cuenta;

    const query = `
        SELECT
            i.id_inscripcion,
            c.id_curso,
            m.id_materia,
            m.nombre AS materia,
            d.id_docente,
            d.nombre AS docente,
            c.grupo,
            c.periodo,

            CASE
                WHEN e.id_evaluacion IS NULL
                    THEN 'Pendiente'
                ELSE 'Completado'
            END AS estatus

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

        LEFT JOIN evaluaciones e
            ON e.id_inscripcion = i.id_inscripcion

        WHERE u.cuenta = ?
        AND u.perfil = 'alumno'

        ORDER BY m.nombre
    `;


    db.query(query, [cuenta], (err, results) => {

        if (err) {

            console.error(
                'Error obteniendo cursos del alumno:',
                err
            );

            return res.status(500).json({
                error: 'Error al obtener los cursos del alumno'
            });

        }


        res.json(results);

    });

});


// =========================================================
// CAMBIAR CONTRASEÑA
// =========================================================

app.post('/api/cambiar-password', (req, res) => {

    const {
        cuenta,
        passwordActual,
        passwordNueva
    } = req.body;


    const queryCheck = `
        SELECT id
        FROM usuarios
        WHERE cuenta = ?
        AND password = ?
    `;


    db.query(
        queryCheck,
        [cuenta, passwordActual],
        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    error: 'Error en el servidor'
                });

            }


            if (results.length === 0) {

                return res.status(401).json({
                    error: 'Contraseña actual incorrecta'
                });

            }


            const queryUpdate = `
                UPDATE usuarios
                SET password = ?
                WHERE cuenta = ?
            `;


            db.query(
                queryUpdate,
                [passwordNueva, cuenta],
                (err, result) => {

                    if (err) {

                        console.error(
                            'Error actualizando contraseña:',
                            err
                        );

                        return res.status(500).json({
                            error: 'Error al actualizar contraseña'
                        });

                    }


                    res.json({
                        message: 'Contraseña actualizada con éxito'
                    });

                }
            );

        }
    );

});


// =========================================================
// GUARDAR EVALUACIÓN
// =========================================================
//
// Ahora recibimos id_inscripcion en lugar de:
// alumno_cuenta
// docente
// materia
//
// =========================================================

app.post('/api/guardar-evaluacion', (req, res) => {

    const {
        id_inscripcion,
        q1,
        q2,
        q3,
        q4,
        q5
    } = req.body;


    // -----------------------------------------------------
    // Validar que llegaron todos los datos
    // -----------------------------------------------------

    if (
        !id_inscripcion ||
        q1 === undefined ||
        q2 === undefined ||
        q3 === undefined ||
        q4 === undefined ||
        q5 === undefined
    ) {

        return res.status(400).json({
            error: 'Faltan datos para guardar la evaluación'
        });

    }


    // -----------------------------------------------------
    // Calcular promedio en el servidor
    // -----------------------------------------------------

    const promedio =
        (
            Number(q1) +
            Number(q2) +
            Number(q3) +
            Number(q4) +
            Number(q5)
        ) / 5;


    // -----------------------------------------------------
    // Primero verificamos que la inscripción exista
    // -----------------------------------------------------

    const queryInscripcion = `
        SELECT id_inscripcion
        FROM inscripciones
        WHERE id_inscripcion = ?
    `;


    db.query(
        queryInscripcion,
        [id_inscripcion],
        (err, results) => {

            if (err) {

                console.error(
                    'Error verificando inscripción:',
                    err
                );

                return res.status(500).json({
                    error: 'Error verificando la inscripción'
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    error: 'La inscripción indicada no existe'
                });

            }


            // -------------------------------------------------
            // Guardar evaluación
            // -------------------------------------------------

            const queryEvaluacion = `
                INSERT INTO evaluaciones (
                    id_inscripcion,
                    q1,
                    q2,
                    q3,
                    q4,
                    q5,
                    promedio
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;


            db.query(
                queryEvaluacion,
                [
                    id_inscripcion,
                    q1,
                    q2,
                    q3,
                    q4,
                    q5,
                    promedio
                ],
                (err, result) => {

                    if (err) {

                        // -----------------------------------------
                        // Código 1062 = registro duplicado
                        // -----------------------------------------

                        if (err.code === 'ER_DUP_ENTRY') {

                            return res.status(409).json({
                                error: 'Esta materia ya fue evaluada'
                            });

                        }


                        console.error(
                            'Error al guardar evaluación:',
                            err
                        );


                        return res.status(500).json({
                            error: 'Error al guardar la evaluación'
                        });

                    }


                    res.json({

                        message:
                            'Evaluación guardada con éxito',

                        id_evaluacion:
                            result.insertId,

                        promedio:
                            promedio.toFixed(2)

                    });

                }
            );

        }
    );

});


// =========================================================
// INICIAR SERVIDOR
// =========================================================

app.listen(3000, () => {

    console.log(
        'Servidor corriendo en http://localhost:3000'
    );

});
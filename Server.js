const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Adrisanagui',
    database: 'sistema_dygs'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('Conexión exitosa a la base de datos MySQL (sistema_dygs)');
    }
});

// Endpoint de Registro
app.post('/api/registro', (req, res) => {
    const { cuenta, password, perfil } = req.body;
    const query = 'INSERT INTO usuarios (cuenta, password, perfil) VALUES (?, ?, ?)';
    
    db.query(query, [cuenta, password, perfil], (err, result) => {
        if (err) {
            console.error('Error al registrar:', err);
            return res.status(500).json({ error: 'Error al registrar usuario en la base de datos' });
        }
        res.json({ message: '¡Usuario registrado con éxito!' });
    });
});

// Endpoint de Login
app.post('/api/login', (req, res) => {
    const { cuenta, password, perfil } = req.body;
    const query = 'SELECT * FROM usuarios WHERE cuenta = ? AND password = ? AND perfil = ?';
    
    db.query(query, [cuenta, password, perfil], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.length > 0) {
            res.json({ message: 'Login exitoso' });
        } else {
            res.status(401).json({ message: 'Credenciales o perfil incorrectos' });
        }
    });
});

// Endpoint de Cambiar Contraseña
app.post('/api/cambiar-password', (req, res) => {
    const { cuenta, passwordActual, passwordNueva } = req.body;
    const queryCheck = 'SELECT * FROM usuarios WHERE cuenta = ? AND password = ?';

    db.query(queryCheck, [cuenta, passwordActual], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        const queryUpdate = 'UPDATE usuarios SET password = ? WHERE cuenta = ?';
        db.query(queryUpdate, [passwordNueva, cuenta], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar contraseña' });
            }
            res.json({ message: 'Contraseña actualizada con éxito' });
        });
    });
});

// Endpoint de Guardar Evaluación
app.post('/api/guardar-evaluacion', (req, res) => {
    const { alumno_cuenta, docente, materia, q1, q2, q3, q4, q5, promedio } = req.body;
    const query = 'INSERT INTO evaluaciones (alumno_cuenta, docente, materia, q1, q2, q3, q4, q5, promedio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [alumno_cuenta, docente, materia, q1, q2, q3, q4, q5, promedio], (err, result) => {
        if (err) {
            console.error('Error al guardar evaluación:', err);
            return res.status(500).json({ error: 'Error al guardar evaluación' });
        }
        res.json({ message: 'Evaluación guardada con éxito' });
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});



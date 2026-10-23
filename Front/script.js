const API_URL = 'http://localhost:3000/api';
let usuarioActual = '';
let docenteActual = '';
let materiaActual = '';
let inscripcionActual = null;


function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

async function login() {
  const cuenta = document.getElementById('userInput').value;
  const password = document.getElementById('passInput').value;
  const perfil = document.getElementById('roleSelect').value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuenta, password, perfil })
    });

    const data = await response.json();

    if (response.ok) {

        usuarioActual = cuenta;

        alert('¡Inicio de sesión validado correctamente en la Base de Datos MySQL!');

        document.getElementById('nav-menu').style.display = 'flex';

        // Ocultamos primero todas las opciones
        document.getElementById('btn-nav-alumno').style.display = 'none';
        document.getElementById('btn-nav-coord').style.display = 'none';
        document.getElementById('btn-nav-ind').style.display = 'none';


        if (perfil === 'alumno') {

            document.getElementById('btn-nav-alumno').style.display = 'inline-block';

            showScreen('screen-alumno');

            // Obtener materias y docentes del alumno
            cargarCursosAlumno();


        } else if (perfil === 'coordinador') {

            document.getElementById('btn-nav-coord').style.display = 'inline-block';
            document.getElementById('btn-nav-ind').style.display = 'inline-block';

            showScreen('screen-coordinacion');


        } else if (perfil === 'docente') {

            document.getElementById('btn-nav-ind').style.display = 'inline-block';

            showScreen('screen-indicadores');


        } else if (perfil === 'admin') {

            document.getElementById('btn-nav-alumno').style.display = 'inline-block';
            document.getElementById('btn-nav-coord').style.display = 'inline-block';
            document.getElementById('btn-nav-ind').style.display = 'inline-block';

            showScreen('screen-coordinacion');
        }

    } else {

        alert(data.message || 'Credenciales o perfil incorrectos');

    }
  } catch (err) {
    alert('No se pudo conectar con el servidor Backend/MySQL. Verifica que "node server.js" esté corriendo.');
  }
}


async function cargarCursosAlumno() {

    try {

        const response = await fetch(
            `${API_URL}/alumnos/${usuarioActual}/cursos`
        );

        if (!response.ok) {
            throw new Error('No se pudieron obtener los cursos');
        }

        const cursos = await response.json();

        const tbody = document.getElementById('tabla-docentes-body');

        // Limpiar la tabla antes de cargar datos
        tbody.innerHTML = '';


        // Si el alumno no tiene materias
        if (cursos.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No tienes materias asignadas actualmente.
                    </td>
                </tr>
            `;

            return;
        }


        // Crear una fila por cada curso
        cursos.forEach(curso => {

            const fila = document.createElement('tr');


            // -----------------------------------------
            // MATERIA
            // -----------------------------------------

            const tdMateria = document.createElement('td');

            tdMateria.textContent = curso.materia;


            // -----------------------------------------
            // DOCENTE
            // -----------------------------------------

            const tdDocente = document.createElement('td');

            tdDocente.textContent = curso.docente;


            // -----------------------------------------
            // ESTATUS
            // -----------------------------------------

            const tdEstatus = document.createElement('td');

            const badge = document.createElement('span');

            badge.textContent = curso.estatus;


            if (curso.estatus === 'Completado') {

                badge.className = 'badge badge-success';

            } else {

                badge.className = 'badge badge-warning';

            }


            tdEstatus.appendChild(badge);


            // -----------------------------------------
            // BOTÓN
            // -----------------------------------------

            const tdAccion = document.createElement('td');

            const boton = document.createElement('button');

            boton.className = 'btn';

            boton.style.width = 'auto';
            boton.style.padding = '5px 10px';


            if (curso.estatus === 'Completado') {

                boton.textContent = 'Completado';

                boton.disabled = true;

            } else {

                boton.textContent = 'Evaluar';

                boton.onclick = function () {

                    openEvaluation(
                        curso.id_inscripcion,
                        curso.docente,
                        curso.materia
                    );

                };

            }


            tdAccion.appendChild(boton);


            // -----------------------------------------
            // AGREGAR COLUMNAS A LA FILA
            // -----------------------------------------

            fila.appendChild(tdMateria);
            fila.appendChild(tdDocente);
            fila.appendChild(tdEstatus);
            fila.appendChild(tdAccion);


            // -----------------------------------------
            // AGREGAR FILA A LA TABLA
            // -----------------------------------------

            tbody.appendChild(fila);

        });


        actualizarProgreso(cursos);


    } catch (error) {

        console.error(
            'Error cargando los cursos:',
            error
        );

        alert(
            'No se pudieron cargar las materias del alumno.'
        );

    }

}



async function registrarUsuario() {
  const cuenta = document.getElementById('regUser').value;
  const password = document.getElementById('regPass').value;
  const perfil = document.getElementById('regRole').value;

  try {
    const response = await fetch(`${API_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuenta, password, perfil })
    });

    const data = await response.json();

    if (response.ok) {
      alert('¡Usuario registrado e insertado con éxito en MySQL!');
      showScreen('screen-login');
    } else {
      alert(data.error || 'Error al registrar usuario.');
    }
  } catch (err) {
    alert('Error de conexión con el servidor.');
  }
}

async function cambiarPass() {
  const cuenta = document.getElementById('changeUser').value;
  const passwordActual = document.getElementById('changePassOld').value;
  const passwordNueva = document.getElementById('changePassNew').value;

  try {
    const response = await fetch(`${API_URL}/cambiar-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuenta, passwordActual, passwordNueva })
    });

    const data = await response.json();

    if (response.ok) {
      alert('¡Contraseña actualizada con éxito en la Base de Datos MySQL!');
      showScreen('screen-login');
    } else {
      alert(data.error || 'Error al actualizar contraseña.');
    }
  } catch (err) {
    alert('Error de conexión con el servidor.');
  }
}


function openEvaluation(idInscripcion, docente, materia) {

    inscripcionActual = idInscripcion;
    docenteActual = docente;
    materiaActual = materia;

    const card = document.getElementById('eval-form-card');

    document.getElementById('eval-title').innerText =
        'Evaluando a: ' +
        docente +
        ' (' +
        materia +
        ')';

    card.style.display = 'block';

    card.scrollIntoView({
        behavior: 'smooth'
    });

}



async function submitEvaluation() {

    const q1 = parseFloat(
        document.querySelector('input[name="q1"]:checked').value
    );

    const q2 = parseFloat(
        document.querySelector('input[name="q2"]:checked').value
    );

    const q3 = parseFloat(
        document.querySelector('input[name="q3"]:checked').value
    );

    const q4 = parseFloat(
        document.querySelector('input[name="q4"]:checked').value
    );

    const q5 = parseFloat(
        document.querySelector('input[name="q5"]:checked').value
    );


    try {

        const response = await fetch(
            `${API_URL}/guardar-evaluacion`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    id_inscripcion: inscripcionActual,

                    q1,
                    q2,
                    q3,
                    q4,
                    q5

                })
            }
        );


        const data = await response.json();


        if (response.ok) {

            alert(
                '¡Evaluación registrada exitosamente en MySQL!'
            );


            // Ocultar cuestionario
            document.getElementById(
                'eval-form-card'
            ).style.display = 'none';


            // Limpiar respuestas anteriores
            document.getElementById(
                'form-evaluacion'
            ).reset();


            // Volver a consultar MySQL
            await cargarCursosAlumno();


            // Limpiar variables
            inscripcionActual = null;
            docenteActual = '';
            materiaActual = '';


        } else {

            alert(
                data.error ||
                'Error al guardar la evaluación'
            );

        }


    } catch (error) {

        console.error(
            'Error guardando evaluación:',
            error
        );

        alert(
            'Error guardando la evaluación en el servidor.'
        );

    }

}


function updateDashboardMetrics() {
  const carrera = document.getElementById('filterCarrera').value;
  const grupo = document.getElementById('filterGrupo').value;

  let total = 500;
  let realizadas = 2100;
  let esperadas = 2500;

  if(carrera === 'ingenieria') {
    total = 300; esperadas = 1500; realizadas = 1350;
  } else if(carrera === 'administracion') {
    total = 200; esperadas = 1000; realizadas = 750;
  }

  if(grupo === 'grupoA') {
    total = Math.round(total * 0.6);
    esperadas = Math.round(esperadas * 0.6);
    realizadas = Math.round(realizadas * 0.6);
  } else if(grupo === 'grupoB') {
    total = Math.round(total * 0.4);
    esperadas = Math.round(esperadas * 0.4);
    realizadas = Math.round(realizadas * 0.4);
  }

  const pendientes = esperadas - realizadas;
  const pct = Math.round((realizadas / esperadas) * 100);

  document.getElementById('dash-tot-alumnos').innerText = total;
  document.getElementById('dash-eval-esp').innerText = esperadas.toLocaleString();
  document.getElementById('dash-eval-real').innerText = realizadas.toLocaleString();
  document.getElementById('dash-eval-pen').innerText = pendientes.toLocaleString();
  document.getElementById('dash-porcentaje').innerText = pct + '%';
}


function logout() {
  document.getElementById('nav-menu').style.display = 'none';
  showScreen('screen-login');
}


function actualizarProgreso(cursos) {

    const total = cursos.length;

    const completados = cursos.filter(
        curso => curso.estatus === 'Completado'
    ).length;


    let porcentaje = 0;


    if (total > 0) {

        porcentaje = Math.round(
            (completados / total) * 100
        );

    }


    const fill = document.getElementById(
        'progress-fill'
    );


    fill.style.width = porcentaje + '%';

    fill.innerText =
        porcentaje + '% Completado';


    const estatusTexto = document.getElementById(
        'estatus-texto'
    );


    if (total === 0) {

        estatusTexto.innerText =
            'No tienes evaluaciones asignadas.';

    } else if (completados === total) {

        estatusTexto.innerText =
            'Todas las evaluaciones del ciclo lectivo actual han sido completadas.';

    } else {

        const pendientes = total - completados;

        estatusTexto.innerText =
            `Tienes ${pendientes} evaluación(es) pendiente(s).`;

    }

}
    const API_URL = 'http://localhost:3000/api';
    let usuarioActual = '';
    let docenteActual = '';
    let materiaActual = '';

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

            // Mostrar el menú
            document.getElementById('nav-menu').style.display = 'flex';

            // Primero ocultamos todas las opciones
            document.getElementById('btn-nav-alumno').style.display = 'none';
            document.getElementById('btn-nav-coord').style.display = 'none';
            document.getElementById('btn-nav-ind').style.display = 'none';

            // Mostrar opciones dependiendo del perfil
            if (perfil === 'alumno') {

                document.getElementById('btn-nav-alumno').style.display = 'inline-block';
                showScreen('screen-alumno');

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

    function openEvaluation(docente, materia) {
      docenteActual = docente;
      materiaActual = materia;
      const card = document.getElementById('eval-form-card');
      document.getElementById('eval-title').innerText = 'Evaluando a: ' + docente + ' (' + materia + ')';
      card.style.display = 'block';
      card.scrollIntoView({ behavior: 'smooth' });
    }

    async function submitEvaluation() {
      const q1 = parseFloat(document.querySelector('input[name="q1"]:checked').value);
      const q2 = parseFloat(document.querySelector('input[name="q2"]:checked').value);
      const q3 = parseFloat(document.querySelector('input[name="q3"]:checked').value);
      const q4 = parseFloat(document.querySelector('input[name="q4"]:checked').value);
      const q5 = parseFloat(document.querySelector('input[name="q5"]:checked').value);
      
      const promedio = (q1 + q2 + q3 + q4 + q5) / 5;

      try {
        const response = await fetch(`${API_URL}/guardar-evaluacion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alumno_cuenta: usuarioActual || '12345678',
            docente: docenteActual,
            materia: materiaActual,
            q1, q2, q3, q4, q5,
            promedio
          })
        });

        if (response.ok) {
          alert('¡Evaluación registrada exitosamente en MySQL!');
          document.getElementById('eval-form-card').style.display = 'none';

          const fill = document.getElementById('progress-fill');
          fill.style.width = '100%';
          fill.innerText = '100% Completado';

          document.getElementById('estatus-texto').innerText = 'Todas las evaluaciones del ciclo lectivo actual han sido completadas.';

          const badge = document.getElementById('badge-redes');
          badge.className = 'badge badge-success';
          badge.innerText = 'Completado';

          const btn = document.getElementById('btn-redes');
          btn.disabled = true;
          btn.innerText = 'Completado';
          btn.style.backgroundColor = '#6c757d';
        }
      } catch (err) {
        alert('Error guardando la evaluación en el servidor.');
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
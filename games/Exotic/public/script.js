const socket = io();

// Billetera Unificada y Variables Globales
let user = { loginName: '', exotic_name: '', avatar: '😈', monedas: 0, gemas: 0, items: [], esAdmin: false };
let salaActual = '';
let currentTemp = 0; 
let esMiTurno = false;
let retoActualText = "";
let catalogoGlobal = [];

// 🔥 NUEVAS VARIABLES PARA CONTROLAR LOS NIVELES 🔥
let modoJuegoActual = 'grupo'; 
let ultimoNivelElegido = 0; 

window.show = (id) => { document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); document.getElementById(id).classList.add('active'); };
window.cambiarSeccion = (idSeccion, elementoEnlace) => { 
    document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active-sec')); 
    document.getElementById(idSeccion).classList.add('active-sec'); 
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active')); 
    if(elementoEnlace) elementoEnlace.classList.add('active'); 
};

// =========================================================
// 🔥 MÚSICA Y CONFIGURACIÓN 🔥
// =========================================================
const bgMusic = document.getElementById('exotic-music');
const volSlider = document.getElementById('volumen-slider');

if (volSlider) {
    volSlider.addEventListener('input', (e) => {
        const vol = e.target.value / 100;
        if(bgMusic) bgMusic.volume = vol;
        localStorage.setItem('exotic_volume', vol);
    });
}

function iniciarMusica() {
    if (bgMusic) {
        const savedVol = localStorage.getItem('exotic_volume') || 0.3;
        bgMusic.volume = parseFloat(savedVol);
        if (volSlider) volSlider.value = savedVol * 100;
        bgMusic.play().catch(e => console.log("Navegador bloqueó autoplay de música."));
    }
}

window.abrirConfig = function() { document.getElementById('config-modal').classList.remove('hidden'); };
window.cerrarConfig = function() { document.getElementById('config-modal').classList.add('hidden'); };

// =========================================================
// 🔥 LIBRITO DE REGLAS Y AUTH 🔥
// =========================================================
window.abrirReglasLibrito = function() { document.getElementById('rules-modal').classList.remove('hidden'); };
window.cerrarReglasLibrito = function() { document.getElementById('rules-modal').classList.add('hidden'); };

window.mostrarAdvertencia = function() { document.getElementById('age-modal').classList.remove('hidden'); };

window.aceptarEdad = function() {
    document.getElementById('age-modal').classList.add('hidden');
    iniciarMusica();
    
    let u = localStorage.getItem('usuario') || localStorage.getItem('toxic_user');
    let p = localStorage.getItem('pass') || localStorage.getItem('toxic_pass');
    
    if (u && p) { 
        socket.emit('login', { usuario: u, pass: p }); 
    } else { 
        document.getElementById('box-jugar').classList.add('hidden');
        document.getElementById('box-login-fallback').classList.remove('hidden');
    }
};

window.loginManual = function() {
    const nombre = document.getElementById('l-user').value.trim();
    const pass = document.getElementById('l-pass').value;
    if(!nombre || !pass) return alert("Ingresa tu usuario original.");
    localStorage.setItem('usuario', nombre); localStorage.setItem('pass', pass);
    socket.emit('login', { usuario: nombre, pass: pass });
};

socket.on('loginExitoso', (data) => {
    user = { 
        loginName: data.usuario, exotic_name: data.exotic_name || data.usuario, avatar: data.avatar || '😈', 
        monedas: data.coins || 0, gemas: data.toxic || 0, items: data.items ? data.items.split(',') : [], esAdmin: data.esAdmin || false
    };
    
    document.getElementById('welcome-name').innerText = user.exotic_name;
    document.getElementById('profile-name-display').innerText = user.exotic_name;
    document.getElementById('profile-login-id').innerText = user.loginName; 
    
    if(data.avatar) { document.getElementById('user-av').innerText = user.avatar; document.getElementById('display-profile-avatar').innerText = user.avatar; }
    if(user.esAdmin) { document.getElementById('nav-admin').classList.remove('hidden'); }
    
    actualizarStatsUI(); show('view-dash'); socket.emit('pedirDatosFama'); 
});

socket.on('errorLogin', (msg) => { 
    alert("Error de sesión. Tus credenciales expiraron o son incorrectas."); 
    localStorage.removeItem('usuario');
    localStorage.removeItem('pass');
    localStorage.removeItem('toxic_user');
    localStorage.removeItem('toxic_pass');
    window.location.href = '/'; 
});

function actualizarStatsUI() { 
    if(document.getElementById('user-coins')) document.getElementById('user-coins').innerText = user.monedas; 
    if(document.getElementById('user-gems')) document.getElementById('user-gems').innerText = user.gemas; 
    if(document.getElementById('profile-coins-display2')) document.getElementById('profile-coins-display2').innerText = user.monedas; 
    if(document.getElementById('profile-gems-display2')) document.getElementById('profile-gems-display2').innerText = user.gemas; 
}
socket.on('saldoActualizado', (data) => { user.monedas = data.coins; user.gemas = data.toxic; actualizarStatsUI(); });
socket.on('notificacion', (msg) => { alert(msg); });

// =========================================================
// 🔥 EDICIÓN DE PERFIL 
// =========================================================
window.abrirModalEditar = function() {
    document.getElementById('edit-name-input').value = user.exotic_name;
    document.getElementById('edit-avatar-input').value = user.avatar;
    cargarAvataresDisponibles();
    document.getElementById('edit-profile-modal').classList.remove('hidden');
};

function cargarAvataresDisponibles() {
    const grid = document.getElementById('avatar-selection-grid');
    if(!grid) return;

    const avataresDisponibles = catalogoGlobal.filter(item => item.tipo === 'avatar' && user.items.includes(item.id));
    let opciones = `<div class="avatar-option ${user.avatar === '😈' ? 'avatar-option-selected' : ''}" onclick="seleccionarAvatar('😈', this)">😈</div>`;
    opciones += avataresDisponibles.map(item => {
        const isSelected = user.avatar === item.icon ? 'avatar-option-selected' : '';
        return `<div class="avatar-option ${isSelected}" onclick="seleccionarAvatar('${item.icon}', this)">${item.icon}</div>`;
    }).join('');
    
    grid.innerHTML = opciones;
}

window.seleccionarAvatar = function(icono, elemento) {
    document.getElementById('edit-avatar-input').value = icono;
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('avatar-option-selected'));
    elemento.classList.add('avatar-option-selected');
};

window.guardarPerfil = function() {
    const nuevoAvatar = document.getElementById('edit-avatar-input').value.trim() || user.avatar;
    const nuevoAlias = document.getElementById('edit-name-input').value.trim() || user.exotic_name;
    socket.emit('actualizarPerfilExotic', { nombre: nuevoAlias, avatar: nuevoAvatar });
};

socket.on('perfilExoticoActualizado', (data) => {
    user.exotic_name = data.nombre; user.avatar = data.avatar;
    document.getElementById('welcome-name').innerText = user.exotic_name;
    document.getElementById('profile-name-display').innerText = user.exotic_name;
    document.getElementById('user-av').innerText = user.avatar; 
    document.getElementById('display-profile-avatar').innerText = user.avatar;
    document.getElementById('edit-profile-modal').classList.add('hidden');
    alert("¡Identidad actualizada exitosamente!");
});

// =========================================================
// 🔥 TIENDA UNIFICADA 🔥
// =========================================================
socket.on('datosCatalogo', (cat) => { catalogoGlobal = cat; renderizarTienda(); });
function renderizarTienda() {
    const grid = document.getElementById('tienda-grid');
    if(!grid || catalogoGlobal.length === 0) return;
    grid.innerHTML = catalogoGlobal.filter(i => i.tipo === 'avatar' || i.tipo === 'marco').map(item => {
        const loTengo = user.items.includes(item.id);
        const monedaIcon = item.moneda === 'coins' ? '🪙' : (item.moneda === 'toxic' ? '💎' : '🎁');
        const colorCosto = item.moneda === 'toxic' ? '#ff0055' : '#ffd700';
        return `<div class="game-card" style="padding: 15px; border: 1px solid ${loTengo ? 'green' : '#3d001a'}; display:flex; flex-direction:column; justify-content:space-between; align-items:center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">${item.icon}</div><h4 style="margin-bottom: 5px;">${item.nombre}</h4>
            <p style="color: ${colorCosto}; font-weight: bold; margin-bottom: 15px;">${item.precio > 0 ? item.precio + ' ' + monedaIcon : 'Gratis'}</p>
            ${loTengo ? `<button class="ghost-btn" style="color: green; border-color: green;" disabled>Obtenido ✔️</button>` : `<button class="main-btn" onclick="comprarItem('${item.id}')">Comprar</button>`}
        </div>`;
    }).join('');
}
window.comprarItem = function(id) { socket.emit('comprarItem', id); };

// =========================================================
// 🔥 LÓGICA DE SALAS Y JUEGO 🔥
// =========================================================
window.crear = function(modo) { unirseSala(Math.random().toString(36).substring(7).toUpperCase(), modo); };
window.unirse = function() { const c = document.getElementById('code-input').value.toUpperCase(); if(c) unirseSala(c, null); };

function unirseSala(codigo, modo) {
    salaActual = codigo;
    ultimoNivelElegido = 0; // Resetear la memoria de botones al entrar a una sala nueva
    socket.emit('entrarSalaExotic', { codigo, modo, usuario: user });
    document.getElementById('room-code').innerText = codigo;
    show('view-lobby');
}

window.abandonarSala = function() { socket.emit('salirSalaExotic'); salaActual = ''; show('view-dash'); };
window.addManual = function() { const nombre = document.getElementById('manual-name').value.trim(); if(nombre) { socket.emit('agregarJugadorManualExotic', { codigo: salaActual, nombre }); document.getElementById('manual-name').value = ''; } };
window.enviarQueja = function() { const q = document.getElementById('lobby-queja').value.trim(); if(q) { socket.emit('nuevaQuejaGrupo', { codigo: salaActual, texto: q }); alert("Queja enviada al buzón anónimo 🤫"); document.getElementById('lobby-queja').value = ''; } };

// 🔥 EL FIX DE TURNOS Y BOTONES 🔥
window.iniciar = function() { 
    show('view-game'); 
    socket.emit('siguienteTurnoExotic', salaActual); 
};

window.nextTurn = function() {
    document.getElementById('box-decision').classList.add('hidden'); 
    document.getElementById('btn-after-punish').classList.add('hidden'); 
    
    let boxRegla = document.getElementById('box-crear-regla');
    if(boxRegla) boxRegla.classList.add('hidden');
    
    socket.emit('siguienteTurnoExotic', salaActual);
};

window.ask = function(nivelDificultad) { 
    document.getElementById('card-text').innerText = "Cargando Reto..."; 
    document.getElementById('box-controls').style.display = 'none'; 
    socket.emit('pedirRetoExotic', { codigo: salaActual, nivel: nivelDificultad }); 
};

window.pedirCastigo = function() { 
    socket.emit('pedirCastigoExotic', { codigo: salaActual, usuario: user.loginName }); 
    document.getElementById('box-decision').classList.add('hidden'); 
    document.getElementById('btn-after-punish').classList.remove('hidden'); 
};

window.activarRuleta = function() { 
    document.getElementById('box-ruleta').classList.add('hidden'); 
    socket.emit('girarRuletaDiablo', salaActual); 
};

window.intentarSoborno = function() { 
    if(user.monedas < 200) return alert("No tienes suficientes monedas (Cuesta 200 🪙)."); 
    socket.emit('pedirListaSoborno', salaActual); 
};

socket.on('mostrarModalSoborno', (jugadores) => {
    const lista = document.getElementById('lista-sobornables');
    lista.innerHTML = jugadores.map(j => `<button class="main-btn" style="background:#4b0082;" onclick="ejecutarSoborno('${j.nombre}')">${j.exotic_name || j.nombre}</button>`).join('');
    document.getElementById('soborno-modal').classList.remove('hidden');
});

window.ejecutarSoborno = function(target) { 
    socket.emit('ejecutarSoborno', { codigo: salaActual, de: user.loginName, para: target, reto: retoActualText }); 
    document.getElementById('soborno-modal').classList.add('hidden'); 
    document.getElementById('box-decision').classList.add('hidden'); 
};

window.enviarRegla = function() { 
    const regla = document.getElementById('input-nueva-regla').value.trim(); 
    if(regla) { 
        socket.emit('imponerRegla', { codigo: salaActual, texto: regla }); 
        
        let boxRegla = document.getElementById('box-crear-regla');
        if(boxRegla) boxRegla.classList.add('hidden'); 
        
        document.getElementById('btn-after-punish').classList.remove('hidden'); 
    } 
};

socket.on('actualizarSalaExotic', (sala) => {
    modoJuegoActual = sala.modo; // Guardamos el modo (parejas o grupo)
    
    const list = document.getElementById('player-list');
    if(list) list.innerHTML = sala.jugadores.map(j => `<div class="p-row"><span>${j.avatar || '👤'}</span> ${j.exotic_name || j.nombre}</div>`).join('');
    const btnStart = document.getElementById('btn-start'); 
    if(btnStart && sala.jugadores.length > 1) btnStart.classList.remove('hidden');
    
    let buzonContainer = document.getElementById('buzon-container');
    if(sala.modo === 'grupo' && buzonContainer) buzonContainer.classList.remove('hidden');
});

socket.on('cambioDeTurnoExotic', ({ actor, pacto, regla }) => {
    esMiTurno = (actor.nombre === user.loginName || actor.tipo === 'manual');
    
    document.getElementById('turn-display').innerText = `Turno de: ${actor.exotic_name || actor.nombre}`;
    
    document.getElementById('card-text').innerText = "PREPÁRATE"; 
    document.getElementById('card-text').classList.remove('ruleta-animacion'); 
    document.getElementById('target-text').innerText = ""; 
    document.getElementById('card-icon').innerText = "🔥";
    document.getElementById('box-decision').classList.add('hidden'); 
    document.getElementById('btn-after-punish').classList.add('hidden'); 
    
    let boxRegla = document.getElementById('box-crear-regla');
    if(boxRegla) boxRegla.classList.add('hidden');
    
    if (esMiTurno) {
        if (currentTemp >= 100) { 
            document.getElementById('box-controls').style.display = 'none'; 
            document.getElementById('box-ruleta').classList.remove('hidden'); 
        } else { 
            document.getElementById('box-controls').style.display = 'flex'; 
            document.getElementById('box-ruleta').classList.add('hidden'); 
            
            // 🔥 LÓGICA PARA BLOQUEAR EL BOTÓN REPETIDO SOLO EN PAREJAS 🔥
            const btnF = document.querySelector('.btn-facil');
            const btnM = document.querySelector('.btn-medio');
            const btnE = document.querySelector('.btn-exotic');
            
            // 1. Restaurar todos los botones primero (para que se vean normales)
            if(btnF) { btnF.disabled = false; btnF.style.opacity = '1'; }
            if(btnM) { btnM.disabled = false; btnM.style.opacity = '1'; }
            if(btnE) { btnE.disabled = false; btnE.style.opacity = '1'; }

            // 2. Si estamos en parejas y ya se jugó al menos un turno, bloquear el último usado
            if (modoJuegoActual === 'parejas' && ultimoNivelElegido !== 0) {
                if (ultimoNivelElegido === 1 && btnF) { 
                    btnF.disabled = true; 
                    btnF.style.opacity = '0.3'; 
                }
                else if (ultimoNivelElegido === 2 && btnM) { 
                    btnM.disabled = true; 
                    btnM.style.opacity = '0.3'; 
                }
                else if (ultimoNivelElegido === 3 && btnE) { 
                    btnE.disabled = true; 
                    btnE.style.opacity = '0.3'; 
                }
            }
        }
    } else {
        document.getElementById('box-controls').style.display = 'none'; 
        document.getElementById('box-ruleta').classList.add('hidden'); 
        document.getElementById('card-text').innerText = "Esperando que el jugador elija...";
    }
    
    let pactoAlert = document.getElementById('pacto-alert');
    if(pactoAlert) {
        if(pacto && pacto.length > 0) { pactoAlert.classList.remove('hidden'); document.getElementById('pacto-nombres').innerText = pacto.join(' y '); } else { pactoAlert.classList.add('hidden'); }
    }
    
    let reglaAlert = document.getElementById('regla-alert');
    if(reglaAlert) {
        if(regla && regla.turnos > 0) { reglaAlert.classList.remove('hidden'); document.getElementById('regla-texto').innerText = regla.texto; document.getElementById('regla-turnos').innerText = regla.turnos; } else { reglaAlert.classList.add('hidden'); }
    }
});

socket.on('eventoEspecialGrupo', ({ tipo, texto }) => {
    document.getElementById('box-controls').style.display = 'none'; 
    document.getElementById('card-text').innerText = texto; 
    document.getElementById('card-text').classList.add('ruleta-animacion'); 
    document.getElementById('target-text').innerText = tipo === 'duelo' ? "⚔️ ¡DUELO! ⚔️" : "🤫 ¡CHISME ANÓNIMO! 🤫"; 
    document.getElementById('card-icon').innerText = tipo === 'duelo' ? "⚔️" : "✉️"; 
    document.getElementById('btn-after-punish').classList.remove('hidden'); 
});

socket.on('resultadoRetoExotic', ({ texto, victima, nivel }) => {
    retoActualText = texto;
    ultimoNivelElegido = nivel; // 🔥 GUARDAMOS EL NIVEL QUE SE ACABA DE JUGAR 🔥
    
    document.getElementById('card-text').classList.remove('ruleta-animacion'); 
    document.getElementById('card-text').innerText = texto; 
    document.getElementById('target-text').innerText = `PARA: ${victima}`; 
    document.getElementById('card-icon').innerText = "😈"; 
    document.getElementById('box-decision').classList.remove('hidden'); 
});

socket.on('mostrarCastigoExotic', (txt) => { document.getElementById('card-text').innerText = txt; document.getElementById('target-text').innerText = "💀 CASTIGO 💀"; document.getElementById('card-icon').innerText = "🍷"; });
socket.on('actualizarTemperatura', (temp) => { currentTemp = temp; const bar = document.getElementById('heat-bar'); const val = document.getElementById('heat-value'); if (bar && val) { bar.style.width = temp + '%'; val.innerText = temp + '%'; if (temp >= 100) bar.classList.add('heat-max'); else bar.classList.remove('heat-max'); } });
socket.on('iniciarRuleta', () => { document.getElementById('card-text').innerText = "🎰 GIRANDO LA RULETA... 🎰"; document.getElementById('card-text').classList.add('ruleta-animacion'); document.getElementById('target-text').innerText = "Nadie está a salvo..."; document.getElementById('card-icon').innerText = "⏳"; document.getElementById('box-decision').classList.add('hidden'); });

// =========================================================
// 🔥 CREACIÓN DE RETOS Y MODERACIÓN (ADMIN)
// =========================================================
window.enviarRetoFama = function() {
    const texto = document.getElementById('fama-reto').value.trim(); const shots = document.getElementById('fama-shots').value; const modoSeleccionado = document.getElementById('fama-modo').value; 
    if(!texto) return alert("Escribe un reto.");
    socket.emit('proponerRetoComunidad', { autor: user.exotic_name || user.loginName, texto: texto, shots: parseInt(shots), modo: modoSeleccionado });
    document.getElementById('fama-reto').value = '';
};

socket.on('retoAprobadoNotificacion', (autorDelReto) => { if (user.exotic_name === autorDelReto || user.loginName === autorDelReto) { alert("✅ ¡Felicidades! Un Admin acaba de aprobar tu reto."); } });

socket.on('actualizarDatosFama', (data) => {
    const listComunidad = document.getElementById('lista-retos-comunidad');
    if (listComunidad) { listComunidad.innerHTML = data.retos.map(r => `<div class="social-post" style="border: 1px solid #4a0025; background: #1a000d; margin-bottom: 15px;"><div class="social-post-header" style="display:flex; justify-content: space-between;"><span style="color: var(--accent); font-weight: bold;">👤 ${r.autor}</span> <span style="color: var(--text-muted); font-size: 0.8rem;">[Para: ${r.modo.toUpperCase()}]</span></div><div class="social-post-text" style="color: var(--text-main); font-style: normal; margin-top: 15px; font-size: 1.15rem;">"${r.texto}"</div><div style="margin-top:10px; text-align:right;"><span style="color: var(--gold-btn); font-weight: bold; background: #3d001a; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem;">Castigo: ${r.shots} Shots 🍷</span></div></div>`).join(''); }
    const rPartidas = document.getElementById('ranking-partidas'); if(rPartidas) { rPartidas.innerHTML = data.topPartidas.map((p, i) => `<div class="p-row"><b>#${i+1} ${p.exotic_name || p.usuario}</b> <span style="float:right; color:var(--accent);">${p.partidas} Salas</span></div>`).join(''); }
    const rRetos = document.getElementById('ranking-retos'); if(rRetos) { rRetos.innerHTML = data.topRetos.map((r, i) => `<div class="p-row"><b>#${i+1} ${r.exotic_name || r.usuario}</b> <span style="float:right; color:var(--accent);">${r.retos_creados} Retos</span></div>`).join(''); }
});

socket.on('listaRetosPendientes', (retos) => {
    const contenedor = document.getElementById('admin-retos-list'); if(!contenedor) return;
    if (retos.length === 0) { contenedor.innerHTML = "<p style='color:var(--text-muted);'>No hay retos pendientes en este momento.</p>"; return; }
    contenedor.innerHTML = retos.map(r => `<div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px solid #4a0025;"><p style="color: var(--gold-btn); font-size: 0.9rem; margin-bottom: 5px;">Autor: ${r.autor} | Modo: ${r.modo.toUpperCase()} | Castigo: ${r.shots} Shots</p><p style="color: white; font-size: 1.1rem; margin-bottom: 15px;">"${r.texto}"</p><div style="display: flex; gap: 10px;"><button class="main-btn" style="background: green; padding: 8px;" onclick="accionAdmin(${r.id}, 'aprobar')">✔️ Aprobar</button><button class="main-btn" style="background: #800000; padding: 8px;" onclick="accionAdmin(${r.id}, 'rechazar')">✖ Rechazar</button></div></div>`).join('');
});

window.accionAdmin = function(id, accion) { socket.emit('accionRetoPendiente', { id, accion }); };

window.addEventListener('load', () => {
    let u = localStorage.getItem('usuario') || localStorage.getItem('toxic_user');
    let p = localStorage.getItem('pass') || localStorage.getItem('toxic_pass');
    
    if (u && p) {
        socket.emit('login', { usuario: u, pass: p });
    }
});
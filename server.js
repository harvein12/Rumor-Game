const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const db = new sqlite3.Database('./toxic_v2.db');

// --- BASE DE DATOS DE RETOS (45 EN TOTAL) ---
const RETOS_AMIGOS = [
    "Inventa una anécdota vergonzosa que le pasó en una fiesta.",
    "Di qué es lo más ridículo que hace cuando cree que nadie lo ve.",
    "Inventa un apodo vergonzoso que su mamá le dice de cariño.",
    "Di por qué lo echaron de un centro comercial la semana pasada.",
    "Inventa una fobia absurda que tiene en secreto (ej. a las cucharas).",
    "Cuenta sobre su peor cita romántica a ciegas.",
    "Di qué es lo peor que ha cocinado y a quién intoxicó.",
    "Inventa una mentira ridícula que dijo para no ir a trabajar o a clases.",
    "Di qué canción canta a todo pulmón en la ducha llorando.",
    "Cuenta la vez que se cayó en público y fingió que no pasó nada.",
    "Inventa un talento inútil del que siempre presume.",
    "Di qué objeto infantil o peluche aún guarda en su cama.",
    "Cuenta la vez que intentó coquetear y salió terriblemente mal.",
    "Inventa cuál es su búsqueda más extraña en el historial de Google.",
    "Di qué excusa barata usa siempre para no pagar su parte de la cuenta."
];

const RETOS_PERSONALES = [
    "Escribe sobre un gusto culposo muy extraño que tiene esta persona.",
    "Inventa un fetiche raro que no quiere que nadie sepa.",
    "Di a quién le dio 'Me gusta' por accidente en Instagram a las 3 AM.",
    "Cuenta qué mensaje humillante le envió a su ex estando borracho/a.",
    "Inventa un defecto físico imaginario que siempre intenta ocultar.",
    "Di qué mentira gigante pone siempre en su perfil de Tinder/citas.",
    "Cuenta sobre la vez que lo/la rechazaron de la forma más cruel posible.",
    "Inventa un secreto enorme que le oculta a sus padres.",
    "Di qué es lo más narcisista que hace frente al espejo cada mañana.",
    "Cuenta un rumor gracioso sobre su higiene personal.",
    "Inventa qué hace realmente en internet cuando dice que 'se va a dormir'.",
    "Di por qué motivo lo/la dejaron en visto la última vez.",
    "Cuenta una historia de infidelidad falsa pero que suene muy creíble.",
    "Inventa qué es lo más tóxico y celoso que le ha hecho a una pareja.",
    "Di de qué se arrepiente profundamente (totalmente falso pero gracioso)."
];

const RETOS_SECRETOS = [
    "Di algo malo que haya hecho y que tú sepas (o inventa lo peor).",
    "Inventa a qué amigo traicionó por la espalda recientemente.",
    "Cuenta un secreto financiero oscuro o de dinero robado.",
    "Di el motivo REAL por el que terminó su última relación.",
    "Inventa un plan malévolo que tiene en contra de alguien de esta sala.",
    "Cuenta qué secreto ajeno y grave reveló sin ningún remordimiento.",
    "Di a quién odia en secreto de este grupo y por qué.",
    "Inventa un delito menor que haya cometido y logrado ocultar.",
    "Cuenta qué hace realmente cuando dice que 'está muy ocupado/a'.",
    "Di por qué la gente no debería confiar realmente en él/ella.",
    "Inventa una doble vida perturbadora que lleva en cuentas anónimas.",
    "Cuenta cómo saboteó el éxito de otra persona por pura envidia.",
    "Di qué objeto valioso rompió en una casa ajena y le echó la culpa a otro.",
    "Inventa una historia turbia de su pasado que nadie conoce.",
    "Cuenta un rumor tan fuerte y oscuro que podría arruinar su reputación."
];

const CATALOGO = [
    { id: 'base_1', icon: '👤', precio: 0, moneda: 'gratis', nombre: 'Default', tipo: 'avatar' },
    { id: 'c_poop', icon: '💩', precio: 10, moneda: 'coins', nombre: 'Caca', tipo: 'avatar' },
    { id: 'c_fox',   icon: '🦊', precio: 50, moneda: 'coins', nombre: 'Zorro', tipo: 'avatar' },
    { id: 'c_ghost', icon: '👻', precio: 80, moneda: 'coins', nombre: 'Fantasma', tipo: 'avatar' },
    { id: 'c_robot', icon: '🤖', precio: 100, moneda: 'coins', nombre: 'Bot', tipo: 'avatar' },
    { id: 'c_diablo',icon: '😈', precio: 120, moneda: 'coins', nombre: 'Diablito', tipo: 'avatar' },
    { id: 'c_luna',  icon: '🌚', precio: 150, moneda: 'coins', nombre: 'Luna Turbia', tipo: 'avatar' },
    { id: 'c_fuego', icon: '🔥', precio: 200, moneda: 'coins', nombre: 'Fueguito', tipo: 'avatar' },
    { id: 'c_alien', icon: '👽', precio: 200, moneda: 'coins', nombre: 'Alien', tipo: 'avatar' },
    { id: 'c_duraz', icon: '🍑', precio: 250, moneda: 'coins', nombre: 'Duraznito', tipo: 'avatar' },
    { id: 'c_beren', icon: '🍆', precio: 300, moneda: 'coins', nombre: 'Berenjena', tipo: 'avatar' },
    { id: 'c_ninja', icon: '🥷', precio: 300, moneda: 'coins', nombre: 'Shinobi', tipo: 'avatar' }, 
    { id: 'c_calor', icon: '🥵', precio: 350, moneda: 'coins', nombre: 'Hot', tipo: 'avatar' },
    { id: 'c_beso',  icon: '💋', precio: 400, moneda: 'coins', nombre: 'Besito', tipo: 'avatar' },
    { id: 'c_rico',  icon: '🤑', precio: 500, moneda: 'coins', nombre: 'Ricachón', tipo: 'avatar' },

    { id: 't_snake', icon: '🐍', precio: 50, moneda: 'toxic', nombre: 'Víbora', tipo: 'avatar' },
    { id: 't_king',  icon: '👑', precio: 100, moneda: 'toxic', nombre: 'King', tipo: 'avatar' },
    { id: 't_escorp',icon: '🦂', precio: 150, moneda: 'toxic', nombre: 'Escorpión', tipo: 'avatar' },
    { id: 't_skull', icon: '💀', precio: 200, moneda: 'toxic', nombre: 'Skull', tipo: 'avatar' },
    { id: 't_marc',  icon: '👾', precio: 250, moneda: 'toxic', nombre: 'Marciano', tipo: 'avatar' },
    { id: 't_clown', icon: '🤡', precio: 300, moneda: 'toxic', nombre: 'Clown', tipo: 'avatar' },
    { id: 't_moon',  icon: '🚀', precio: 350, moneda: 'toxic', nombre: 'To The Moon', tipo: 'avatar' },
    { id: 't_luci',  icon: '👿', precio: 400, moneda: 'toxic', nombre: 'Lucifer', tipo: 'avatar' },
    { id: 't_vamp',  icon: '🦇', precio: 450, moneda: 'toxic', nombre: 'Vampiro', tipo: 'avatar' },
    { id: 't_cens',  icon: '🔞', precio: 500, moneda: 'toxic', nombre: 'Censurado', tipo: 'avatar' },
    { id: 't_dragon',icon: '🐉', precio: 500, moneda: 'toxic', nombre: 'Dragón', tipo: 'avatar' },
    { id: 't_sugar', icon: '💍', precio: 600, moneda: 'toxic', nombre: 'Sugar', tipo: 'avatar' },
    { id: 't_millo', icon: '💸', precio: 700, moneda: 'toxic', nombre: 'Millonario', tipo: 'avatar' },
    { id: 't_diam',  icon: '💎', precio: 800, moneda: 'toxic', nombre: 'Diamante', tipo: 'avatar' },
    { id: 't_brain', icon: '🧠', precio: 900, moneda: 'toxic', nombre: 'Big Brain', tipo: 'avatar' },
    { id: 't_ojo',   icon: '👁️', precio: 1000, moneda: 'toxic', nombre: 'Illuminati', tipo: 'avatar' },

    { id: 'tit_corazon', icon: '💬', precio: 300, moneda: 'coins', nombre: 'El Rompecorazones', tipo: 'titulo' },
    { id: 'tit_sugar',   icon: '💬', precio: 500, moneda: 'coins', nombre: 'Buscando Sugar', tipo: 'titulo' },
    { id: 'tit_mentira', icon: '💬', precio: 400, moneda: 'coins', nombre: 'Mentiroso de nacimiento', tipo: 'titulo' },
    { id: 'tit_toxico',  icon: '💬', precio: 100, moneda: 'toxic', nombre: 'Tóxico', tipo: 'titulo' },
    { id: 'tit_gordas',  icon: '💬', precio: 150, moneda: 'toxic', nombre: 'Me gustan las gordas', tipo: 'titulo' },
    { id: 'tit_nomenor', icon: '💬', precio: 200, moneda: 'toxic', nombre: 'No menores', tipo: 'titulo' },

    { id: 'm_neon', icon: '🖼️', precio: 300, moneda: 'coins', nombre: 'Marco Neón', tipo: 'marco', clase: 'marco-neon' },
    { id: 'm_fuego', icon: '🔥', precio: 500, moneda: 'coins', nombre: 'Marco Fuego', tipo: 'marco', clase: 'marco-fuego' },
    { id: 'm_toxico', icon: '☣️', precio: 150, moneda: 'toxic', nombre: 'Marco Tóxico', tipo: 'marco', clase: 'marco-toxico' },
    { id: 'm_oro', icon: '👑', precio: 300, moneda: 'toxic', nombre: 'Marco Oro', tipo: 'marco', clase: 'marco-oro' }
];

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (usuario TEXT PRIMARY KEY, email TEXT, pass TEXT, victorias INTEGER DEFAULT 0, avatar TEXT DEFAULT '👤', avatar_type TEXT DEFAULT 'emoji', coins INTEGER DEFAULT 0, toxic INTEGER DEFAULT 0, items TEXT DEFAULT 'base_1', vip INTEGER DEFAULT 0, titulo TEXT DEFAULT '', marco TEXT DEFAULT '')`);
    db.run("ALTER TABLE usuarios ADD COLUMN vip INTEGER DEFAULT 0", (err) => {});
    db.run("ALTER TABLE usuarios ADD COLUMN titulo TEXT DEFAULT ''", (err) => {});
    db.run("ALTER TABLE usuarios ADD COLUMN marco TEXT DEFAULT ''", (err) => {}); 
    db.run(`CREATE TABLE IF NOT EXISTS amigos (id INTEGER PRIMARY KEY AUTOINCREMENT, de TEXT, para TEXT, estado TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS historial (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT, resultado TEXT, fecha TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS soporte (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT, email TEXT, mensaje TEXT, respuesta TEXT, fecha TEXT)`);
    
    const todos = CATALOGO.map(i => i.id).join(',');
    db.run(`INSERT OR IGNORE INTO usuarios (usuario, email, pass, victorias, avatar, coins, toxic, items, vip, titulo, marco) VALUES ('admin', 'admin@toxic.com', '123456', 999, '👑', 99999, 99999, '${todos}', 1, 'Administrador', 'marco-oro')`);
    db.run(`INSERT OR IGNORE INTO usuarios (usuario, email, pass, victorias, avatar, coins, toxic, items, vip, titulo, marco) VALUES ('soporte1', 'soporte@toxic.com', '123456', 0, '🛡️', 0, 0, '${todos}', 1, 'Soporte Técnico', 'marco-neon')`);
});

let salas = {}; let usuariosConectados = {}; let usuariosOnline = {};

io.on('connection', (socket) => {
    let miUsuario = null; let miSalaID = null; let soyEspectador = false;

    socket.on('registro', (data) => {
        if (!data.usuario || !data.pass || !data.email) return socket.emit('errorLogin', '⚠️ Faltan datos.');
        const userTrimmed = String(data.usuario).trim();
        db.get("SELECT email FROM usuarios WHERE email = ?", [data.email], (err, row) => {
            if (row) return socket.emit('errorLogin', '⚠️ Este correo ya está registrado.');
            db.get("SELECT usuario FROM usuarios WHERE LOWER(usuario) = LOWER(?)", [userTrimmed], (err2, row2) => {
                if (row2) return socket.emit('errorLogin', '⚠️ El nombre ya está en uso. Elige otro.');
                const query = `INSERT INTO usuarios (usuario, email, pass, coins, toxic, avatar, avatar_type, items, vip, titulo, marco) VALUES (?, ?, ?, 0, 0, '👤', 'emoji', 'base_1', 0, '', '')`;
                db.run(query, [userTrimmed, data.email, data.pass], function(err3) {
                    if (err3) socket.emit('errorLogin', '⚠️ Error al crear la cuenta.'); 
                    else iniciarSesion(socket, userTrimmed);
                });
            });
        });
    });

    socket.on('login', (data) => {
        const userTrimmed = String(data.usuario).trim();
        db.get("SELECT * FROM usuarios WHERE LOWER(usuario) = LOWER(?)", [userTrimmed], (err, row) => {
            if (!row || row.pass !== data.pass) socket.emit('errorLogin', '⚠️ Datos incorrectos.'); 
            else iniciarSesion(socket, row.usuario);
        });
    });

    socket.on('loginGoogle', (data) => {
        db.get("SELECT * FROM usuarios WHERE email = ?", [data.email], (err, row) => {
            if (row) {
                iniciarSesion(socket, row.usuario);
            } else {
                let baseName = data.nombre.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
                let randomNum = Math.floor(Math.random() * 9999);
                let newUsername = baseName + randomNum; 
                let avatarUrl = data.foto || '👤';
                let avatarType = data.foto ? 'url' : 'emoji';

                const query = `INSERT INTO usuarios (usuario, email, pass, coins, toxic, avatar, avatar_type, items, vip, titulo, marco) VALUES (?, ?, ?, 0, 0, ?, ?, 'base_1', 0, '', '')`;
                db.run(query, [newUsername, data.email, 'login_google_sso', avatarUrl, avatarType], function(err) {
                    if (err) socket.emit('errorLogin', '⚠️ Error creando cuenta de Google.'); 
                    else iniciarSesion(socket, newUsername);
                });
            }
        });
    });

    socket.on('reconectarGoogle', (email) => {
        db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
            if (row) iniciarSesion(socket, row.usuario);
        });
    });

    function iniciarSesion(socket, usuario) {
        miUsuario = usuario; usuariosConectados[socket.id] = usuario; usuariosOnline[usuario] = socket.id;
        let salaReconectar = Object.values(salas).find(s => s.jugadores.some(j => j.nombre === usuario));
        const esAdmin = (usuario === 'soporte1' || usuario === 'admin');
        
        db.get("SELECT * FROM usuarios WHERE usuario = ?", [usuario], (err, row) => {
            db.all("SELECT resultado, fecha FROM historial WHERE usuario = ? ORDER BY id DESC LIMIT 10", [usuario], (eh, history) => {
                socket.emit('loginExitoso', { ...row, historial: history || [], esAdmin: esAdmin });
                socket.emit('datosCatalogo', CATALOGO);

                if (salaReconectar) {
                    miSalaID = salaReconectar.id;
                    socket.join(salaReconectar.id);
                    let j = salaReconectar.jugadores.find(x => x.nombre === usuario);
                    if (j) j.id = socket.id; 
                    
                    socket.emit('entradoEnSala', { nombreSala: salaReconectar.nombre, codigo: salaReconectar.id, meta: salaReconectar.metaPuntos, rol: 'jugador', privada: !!salaReconectar.pass });
                    
                    if (salaReconectar.juegoEnCurso) {
                        socket.emit('actualizarPuntajesPartida', salaReconectar.puntajesPartida);
                        let victima = salaReconectar.jugadores.find(jug => jug.nombre === salaReconectar.victimaNombre);
                        
                        if (salaReconectar.timerVotacion && salaReconectar.rumores.length >= salaReconectar.jugadores.length - 1) {
                            const rumoresParaVotar = salaReconectar.rumores.map(r => ({ texto: r.texto, originalIndex: salaReconectar.rumores.indexOf(r), autor: r.autorMuestra }));
                            socket.emit('faseVotacion', { rumores: rumoresParaVotar, decisorNombre: salaReconectar.victimaNombre, tiempo: 30 });
                        } else if (victima) {
                            let esAbog = j.nombre === salaReconectar.abogadoNombre;
                            let msj = `RUMOR SOBRE ${victima.nombre}`;
                            let retoPicante = "";
                            if (salaReconectar.metaPuntos == 200) retoPicante = "<br><span style='font-size:12px; color:var(--accent-gold);'>🔥 RETO: Inventa una anécdota vergonzosa en una fiesta.</span>";
                            if (salaReconectar.metaPuntos == 300) retoPicante = "<br><span style='font-size:12px; color:var(--accent-gold);'>🌶️ RETO: Escribe sobre un gusto culposo de esta persona.</span>";
                            if (salaReconectar.metaPuntos == 400) retoPicante = "<br><span style='font-size:12px; color:var(--accent-gold);'>😈 RETO PICANTE: Di algo malo que haya hecho y que tú sepas.</span>";

                            let esVictima = String(j.nombre).trim().toLowerCase() === String(victima.nombre).trim().toLowerCase();

                            if (esVictima) msj = "👑 ERES EL ELEGIDO (+20 PTS)";
                            else if (esAbog) msj = `😈 ABOGADO DEL DIABLO <br><span style="font-size:12px; color:#ff4757;">¡Inventa algo bueno sobre <b style="color:var(--accent-gold); text-transform:uppercase;">${victima.nombre}</b>! Si te elige, AMBOS PIERDEN 40 pts. Si no, AMBOS GANAN 40 pts.</span>`;
                            else msj += retoPicante;

                            socket.emit('faseEscritura', { msj: msj, esVictima: esVictima, esAbogado: esAbog, turno: salaReconectar.turnoActual, nombreVictima: victima.nombre });
                        }
                    }
                }
            });
        });
    }

    socket.on('adminActualizarUsuario', (data) => {
        if (miUsuario !== 'soporte1' && miUsuario !== 'admin') return;
        db.get("SELECT * FROM usuarios WHERE usuario = ?", [data.usuario], (err, row) => {
            if (!row) return socket.emit('notificacion', '❌ Usuario no encontrado.');
            db.run("UPDATE usuarios SET vip = ?, coins = coins + ?, toxic = toxic + ? WHERE usuario = ?", [data.vip ? 1 : 0, parseInt(data.coins) || 0, parseInt(data.toxic) || 0, data.usuario], (err) => {
                if (!err) {
                    socket.emit('notificacion', `✅ Cuenta de ${data.usuario} actualizada.`);
                    if (usuariosOnline[data.usuario]) {
                        const targetSocket = usuariosOnline[data.usuario];
                        db.get("SELECT * FROM usuarios WHERE usuario = ?", [data.usuario], (e, upRow) => {
                            io.to(targetSocket).emit('saldoActualizado', { coins: upRow.coins, toxic: upRow.toxic, vip: upRow.vip });
                            io.to(targetSocket).emit('notificacion', '💎 Tu cuenta ha sido actualizada por un Administrador.');
                        });
                    }
                }
            });
        });
    });

    socket.on('enviarSoporte', (data) => { 
        const usr = miUsuario || 'No_Logueado';
        const fecha = new Date().toLocaleString(); 
        db.run("INSERT INTO soporte (usuario, email, mensaje, fecha) VALUES (?, ?, ?, ?)", [usr, data.email, data.mensaje, fecha], (err) => { 
            if(!err) { socket.emit('notificacion', '✅ Ticket enviado.'); if(usuariosOnline['soporte1']) io.to(usuariosOnline['soporte1']).emit('notificacion', '🔔 Nuevo Ticket Recibido'); } 
            else socket.emit('notificacion', '❌ Error al guardar ticket.'); 
        }); 
    });
    
    socket.on('obtenerMisTickets', () => { if(miUsuario) db.all("SELECT * FROM soporte WHERE usuario = ? ORDER BY id DESC", [miUsuario], (err, rows) => { socket.emit('misTickets', rows || []); }); });
    socket.on('obtenerTicketsAdmin', () => { if(miUsuario === 'soporte1' || miUsuario === 'admin') db.all("SELECT * FROM soporte ORDER BY id DESC", [], (err, rows) => { socket.emit('listaTicketsAdmin', rows || []); }); });
    socket.on('adminResponderTicket', (data) => { if(miUsuario !== 'soporte1' && miUsuario !== 'admin') return; db.run("UPDATE soporte SET respuesta = ? WHERE id = ?", [data.respuesta, data.id], function(err) { if(!err) { socket.emit('notificacion', 'Respuesta enviada.'); db.all("SELECT * FROM soporte ORDER BY id DESC", [], (err, rows) => { socket.emit('listaTicketsAdmin', rows || []); }); db.get("SELECT usuario FROM soporte WHERE id = ?", [data.id], (e, row) => { if(row && usuariosOnline[row.usuario]) { const sUser = usuariosOnline[row.usuario]; io.to(sUser).emit('notificacion', '💬 Soporte ha respondido tu ticket.'); db.all("SELECT * FROM soporte WHERE usuario = ? ORDER BY id DESC", [row.usuario], (e2, rowsUser) => { io.to(sUser).emit('misTickets', rowsUser || []); }); } }); } }); });

    socket.on('obtenerSalas', () => { const lista = Object.keys(salas).map(id => ({ id: id, nombre: salas[id].nombre, privada: !!salas[id].pass, jugadores: salas[id].jugadores.length, espectadores: salas[id].espectadores.length, enCurso: salas[id].juegoEnCurso, meta: salas[id].metaPuntos })); socket.emit('listaSalas', lista); });
    
    socket.on('crearSala', (data) => { 
        if (!miUsuario) return;
        const idSala = 'sala_' + Math.random().toString(36).substr(2, 6); const meta = parseInt(data.meta) || 200; 
        salas[idSala] = { 
            id: idSala, nombre: data.nombre || `Sala de ${miUsuario}`, pass: data.clave || null, metaPuntos: meta, 
            jugadores: [], espectadores: [], juegoEnCurso: false, rumores: [], victimaNombre: null, abogadoNombre: null, 
            puntajesPartida: {}, turnoActual: 0, timerVotacion: null, estadisticas: {}, votosAudiencia: {},
            mejorRumorPartida: { texto: '', autor: '', pts: 0 } 
        }; 
        unirseASala(socket, idSala, data.clave, 'jugador'); 
    });

    socket.on('unirseSala', (data) => unirseASala(socket, data.id, data.clave, data.rol));

    function unirseASala(socket, idSala, clave, rol = 'jugador') {
        if (!miUsuario) return socket.emit('notificacion', '⚠️ Tu sesión expiró. Recarga la página para continuar.');
        
        const sala = salas[idSala];
        if (!sala) return socket.emit('notificacion', 'Sala no existe.');
        if (sala.pass && sala.pass !== clave) return socket.emit('notificacion', 'Clave incorrecta.');
        if (rol === 'jugador' && sala.jugadores.length >= 8 && !sala.jugadores.find(j => j.nombre === miUsuario)) { return socket.emit('notificacion', 'La sala está llena (Máx 8). Entra como espectador 👁️.'); }
        if (sala.juegoEnCurso && rol === 'jugador' && !sala.jugadores.find(j => j.nombre === miUsuario)) { return socket.emit('notificacion', 'Partida en curso. Entra como espectador 👁️.'); }
        
        if (miSalaID && miSalaID !== idSala) salirDeSala(socket, false);

        db.get("SELECT * FROM usuarios WHERE usuario = ?", [miUsuario], (err, row) => {
            if (!row) return socket.emit('notificacion', '⚠️ Error cargando tu perfil. Reinicia la app.');

            miSalaID = idSala; socket.join(idSala);
            let esNuevo = false;
            
            if (rol === 'espectador') {
                soyEspectador = true;
                if (!sala.espectadores.find(e => e.nombre === miUsuario)) sala.espectadores.push({ id: socket.id, nombre: miUsuario });
                socket.emit('entradoEnSala', { nombreSala: sala.nombre, codigo: idSala, meta: sala.metaPuntos, rol: 'espectador', privada: !!sala.pass });
            } else {
                soyEspectador = false;
                const index = sala.jugadores.findIndex(p => p.nombre === miUsuario);
                if (index !== -1) { 
                    sala.jugadores[index].id = socket.id; 
                    sala.jugadores[index].avatar = row.avatar || '👤'; 
                    sala.jugadores[index].avatarType = row.avatar_type || 'emoji'; 
                    sala.jugadores[index].vip = row.vip || 0; 
                    sala.jugadores[index].titulo = row.titulo || ''; 
                    sala.jugadores[index].marco = row.marco || ''; 
                } else { 
                    sala.jugadores.push({ 
                        id: socket.id, 
                        nombre: miUsuario, 
                        victorias: row.victorias || 0, 
                        avatar: row.avatar || '👤', 
                        avatarType: row.avatar_type || 'emoji', 
                        vip: row.vip || 0, 
                        titulo: row.titulo || '', 
                        marco: row.marco || '' 
                    }); 
                    esNuevo = true; 
                }
                if (!sala.puntajesPartida[miUsuario]) sala.puntajesPartida[miUsuario] = 0;
                if (!sala.estadisticas[miUsuario]) sala.estadisticas[miUsuario] = { ganados: 0, victima: 0 };
                
                socket.emit('entradoEnSala', { nombreSala: sala.nombre, codigo: idSala, meta: sala.metaPuntos, rol: 'jugador', privada: !!sala.pass });
            }

            io.to(idSala).emit('actualizarSala', sala.jugadores, sala.espectadores.length); 
            io.emit('actualizarListaSalas');
            if (esNuevo && row.vip === 1 && rol === 'jugador') { io.to(idSala).emit('vipEntro', { nombre: miUsuario }); }
        });
    }

    socket.on('salirSala', () => salirDeSala(socket, false));

    function salirDeSala(socket, desconexionForzada = false) {
        if (!miSalaID || !salas[miSalaID]) { if(!desconexionForzada) socket.emit('vueltoAlDashboard'); return; }
        const sala = salas[miSalaID];
        
        if (sala.juegoEnCurso && desconexionForzada && !soyEspectador) {
            const j = sala.jugadores.find(x => x.id === socket.id);
            if (j) j.id = 'desconectado';
            miSalaID = null;
            return;
        }

        const eraLider = sala.jugadores.length > 0 && sala.jugadores[0].id === socket.id;
        sala.jugadores = sala.jugadores.filter(j => j.id !== socket.id);
        sala.espectadores = sala.espectadores.filter(e => e.id !== socket.id);
        socket.leave(miSalaID); 
        if(!desconexionForzada) socket.emit('vueltoAlDashboard'); 
        
        if (sala.jugadores.length === 0) {
            if (sala.timerVotacion) clearTimeout(sala.timerVotacion);
            delete salas[miSalaID];
        } else { 
            if (eraLider) io.to(miSalaID).emit('notificacion', `👑 Nuevo líder: ${sala.jugadores[0].nombre}`); 
            io.to(miSalaID).emit('actualizarSala', sala.jugadores, sala.espectadores.length); 
        }
        miSalaID = null; soyEspectador = false; io.emit('actualizarListaSalas'); 
    }

    socket.on('enviarMensajeChat', (texto) => {
        if (!miSalaID || !miUsuario) return;
        const sala = salas[miSalaID]; if (!sala) return;
        const jugador = sala.jugadores.find(j => j.nombre === miUsuario) || sala.espectadores.find(e => e.nombre === miUsuario);
        if (jugador) {
            let isVip = false;
            if(!soyEspectador) { const jVip = sala.jugadores.find(j => j.nombre === miUsuario); if(jVip && jVip.vip === 1) isVip = true; }
            const textoSeguro = String(texto).replace(/</g, "&lt;").replace(/>/g, "&gt;");
            if(textoSeguro.trim().length > 0) { io.to(miSalaID).emit('nuevoMensajeChat', { autor: jugador.nombre, texto: textoSeguro, vip: isVip ? 1 : 0 }); }
        }
    });

    socket.on('invitarAmigo', (nombreAmigo) => { if (!miUsuario || !miSalaID || !salas[miSalaID]) return; const targetSocket = usuariosOnline[nombreAmigo]; if (targetSocket) { io.to(targetSocket).emit('invitacionRecibida', { salaId: miSalaID, salaNombre: salas[miSalaID].nombre, host: miUsuario, pass: salas[miSalaID].pass }); socket.emit('notificacion', `📩 Invitación enviada a ${nombreAmigo}`); } else { socket.emit('notificacion', '⚠️ El usuario no está conectado.'); } });

    socket.on('iniciarJuego', () => {
        const sala = salas[miSalaID];
        if(!sala || sala.jugadores.length < 4) return socket.emit('notificacion', 'Mínimo 4 jugadores activos.');
        sala.jugadores.forEach(j => { sala.puntajesPartida[j.nombre] = 0; sala.estadisticas[j.nombre] = { ganados: 0, victima: 0 }; });
        sala.turnoActual = 0; sala.juegoEnCurso = true;
        sala.mejorRumorPartida = { texto: '', autor: '', pts: 0 };
        iniciarRonda(sala);
    });

    function iniciarRonda(sala) {
        if (!sala || sala.jugadores.length < 4) return;
        sala.rumores = []; sala.votosAudiencia = {}; 
        if (sala.timerVotacion) clearTimeout(sala.timerVotacion);
        
        const indiceElegido = sala.turnoActual % sala.jugadores.length;
        const victima = sala.jugadores[indiceElegido];
        if (!victima) { sala.turnoActual++; return iniciarRonda(sala); }

        const posiblesAbogados = sala.jugadores.filter(j => j.id !== victima.id);
        if(posiblesAbogados.length > 0) {
            const abogado = posiblesAbogados[Math.floor(Math.random() * posiblesAbogados.length)];
            sala.abogadoNombre = abogado.nombre;
        } else { sala.abogadoNombre = null; }

        sala.victimaNombre = victima.nombre;
        sala.puntajesPartida[victima.nombre] += 20;
        sala.estadisticas[victima.nombre].victima++; 
        db.run("UPDATE usuarios SET coins = coins + 20 WHERE usuario = ?", [victima.nombre]);

        if (sala.puntajesPartida[victima.nombre] >= sala.metaPuntos) { declararVictoriaFinal(sala, victima.nombre); return; }

        io.to(sala.id).emit('actualizarPuntajesPartida', sala.puntajesPartida);
        
        let retoAleatorio = "";
        if (sala.metaPuntos == 200) retoAleatorio = RETOS_AMIGOS[Math.floor(Math.random() * RETOS_AMIGOS.length)];
        else if (sala.metaPuntos == 300) retoAleatorio = RETOS_PERSONALES[Math.floor(Math.random() * RETOS_PERSONALES.length)];
        else if (sala.metaPuntos == 400) retoAleatorio = RETOS_SECRETOS[Math.floor(Math.random() * RETOS_SECRETOS.length)];

        let retoPicante = `<br><span style='font-size:13px; color:var(--accent-gold); display:block; margin-top:8px;'>🔥 <b>RETO:</b> ${retoAleatorio}</span>`;

        sala.jugadores.forEach(j => { 
            let esAbog = j.nombre === sala.abogadoNombre;
            let esVictima = String(j.nombre).trim().toLowerCase() === String(victima.nombre).trim().toLowerCase();
            
            let msj = `RUMOR SOBRE ${victima.nombre}`;
            
            if (esVictima) msj = "👑 ERES EL ELEGIDO (+20 PTS)";
            else if (esAbog) msj = `😈 ABOGADO DEL DIABLO <br><span style="font-size:12px; color:#ff4757;">¡Inventa algo bueno sobre <b style="color:var(--accent-gold); text-transform:uppercase;">${victima.nombre}</b>! Si te elige, AMBOS PIERDEN 40 pts. Si no, AMBOS GANAN 40 pts.</span>`;
            else msj += retoPicante;
            
            io.to(j.id).emit('faseEscritura', { msj: msj, esVictima: esVictima, esAbogado: esAbog, turno: sala.turnoActual, nombreVictima: victima.nombre }); 
        });
        sala.espectadores.forEach(e => { io.to(e.id).emit('faseEscritura', { msj: `RUMOR SOBRE ${victima.nombre}`, esVictima: false, esAbogado: false, turno: sala.turnoActual, nombreVictima: victima.nombre }); });

        io.emit('actualizarListaSalas');
    }

    socket.on('enviarRumor', (data) => {
        const sala = salas[miSalaID];
        if(!sala || soyEspectador) return; 
        const autor = sala.jugadores.find(j => j.id === socket.id);
        
        if(autor && !sala.rumores.find(r => r.autorNombre === autor.nombre)) {
            let textoReal = typeof data === 'object' ? data.texto : data;
            let usaEscudo = typeof data === 'object' ? data.escudo : false;
            let usaDoble = typeof data === 'object' ? data.dobleFilo : false;
            let usaReto = typeof data === 'object' ? data.aceptaReto : false;

            db.get("SELECT coins, toxic FROM usuarios WHERE usuario = ?", [autor.nombre], (err, row) => {
                let costoCoins = usaEscudo ? 50 : 0; let costoToxic = usaDoble ? 10 : 0;
                if (row.coins < costoCoins || row.toxic < costoToxic) { socket.emit('notificacion', '❌ No tienes saldo suficiente para esos Power-Ups.'); usaEscudo = false; usaDoble = false; costoCoins = 0; costoToxic = 0; }
                
                db.run("UPDATE usuarios SET coins = coins - ?, toxic = toxic - ?, coins = coins + 5 WHERE usuario = ?", [costoCoins, costoToxic, autor.nombre], () => {
                    db.get("SELECT coins, toxic, vip FROM usuarios WHERE usuario = ?", [autor.nombre], (e, upRow) => socket.emit('saldoActualizado', upRow));
                    
                    sala.rumores.push({ autorNombre: autor.nombre, texto: String(textoReal), autorMuestra: usaEscudo ? "Anónimo (Escudo)" : autor.nombre, dobleFilo: usaDoble, aceptaReto: usaReto });
                    sala.puntajesPartida[autor.nombre] += 5; 
                    io.to(sala.id).emit('actualizarPuntajesPartida', sala.puntajesPartida);

                    io.to(miSalaID).emit('rumorRecibido', { recibidos: sala.rumores.length, total: sala.jugadores.length - 1 });

                    if(sala.rumores.length >= sala.jugadores.length - 1) {
                        const rumoresParaVotar = sala.rumores.map(r => ({ texto: r.texto, originalIndex: sala.rumores.indexOf(r), autor: r.autorMuestra })).sort(() => Math.random() - 0.5);
                        io.to(miSalaID).emit('faseVotacion', { rumores: rumoresParaVotar, decisorNombre: sala.victimaNombre, tiempo: 30 });
                        sala.timerVotacion = setTimeout(() => { castigarElegido(sala); }, 30000);
                    }
                });
            });
        }
    });

    socket.on('votoAudiencia', (originalIndex) => { const sala = salas[miSalaID]; if(!sala || !sala.juegoEnCurso || !soyEspectador) return; if(!sala.votosAudiencia[originalIndex]) sala.votosAudiencia[originalIndex] = 0; sala.votosAudiencia[originalIndex]++; io.to(miSalaID).emit('audienciaVotoActualizado', sala.votosAudiencia); });

    function castigarElegido(sala) {
        const victima = sala.jugadores.find(j => j.nombre === sala.victimaNombre);
        if (victima) {
            sala.puntajesPartida[victima.nombre] -= 20;
            io.to(sala.id).emit('tiempoAgotado');
            io.to(sala.id).emit('notificacion', `⌛ Tiempo agotado. ${victima.nombre} pierde 20 puntos.`);
            io.to(sala.id).emit('actualizarPuntajesPartida', sala.puntajesPartida);
            sala.turnoActual++; setTimeout(() => { if(salas[sala.id] && sala.juegoEnCurso) iniciarRonda(sala); }, 3000);
        }
    }

    socket.on('elegirGanador', (originalIndex) => {
        const sala = salas[miSalaID];
        if(!sala || soyEspectador) return;
        
        const soyYoLaVictima = String(miUsuario).trim().toLowerCase() === String(sala.victimaNombre).trim().toLowerCase();
        if(!soyYoLaVictima) return;
        
        if (sala.timerVotacion) clearTimeout(sala.timerVotacion);

        const ganador = sala.rumores[originalIndex];
        if (ganador) {
            let ptsGanados = ganador.dobleFilo ? 40 : 20;
            const nombreReal = ganador.autorNombre;
            let msjEspecial = "";

            if (nombreReal === sala.abogadoNombre) {
                sala.puntajesPartida[sala.victimaNombre] -= 40;
                sala.puntajesPartida[sala.abogadoNombre] -= 40;
                ptsGanados = -40; 
                msjEspecial = "😈 ¡LA VÍCTIMA CAYÓ EN LA TRAMPA DEL ABOGADO! Ambos pierden 40 puntos.";
            } else {
                if (sala.abogadoNombre && sala.puntajesPartida[sala.abogadoNombre] !== undefined) {
                    sala.puntajesPartida[sala.victimaNombre] += 40;
                    sala.puntajesPartida[sala.abogadoNombre] += 40;
                    msjEspecial = "👼 La víctima evadió al Abogado. ¡Ambos ganan 40 puntos extra!";
                }
                
                if (ganador.aceptaReto) {
                    ptsGanados += 10;
                    msjEspecial += " 🔥 ¡El ganador completó el reto de la sala (+10 pts extra)!";
                }

                sala.puntajesPartida[nombreReal] += ptsGanados;
                sala.estadisticas[nombreReal].ganados++; 
                db.run("UPDATE usuarios SET coins = coins + ? WHERE usuario = ?", [ptsGanados, nombreReal]);
            }

            if (!sala.mejorRumorPartida.texto || ptsGanados >= sala.mejorRumorPartida.pts) {
                sala.mejorRumorPartida = { texto: ganador.texto, autor: nombreReal, pts: ptsGanados };
            }
            
            let hayGanadorFinal = null;
            Object.keys(sala.puntajesPartida).forEach(n => { if (sala.puntajesPartida[n] >= sala.metaPuntos) hayGanadorFinal = n; });

            if (hayGanadorFinal) { declararVictoriaFinal(sala, hayGanadorFinal); } 
            else { io.to(sala.id).emit('resultadoRonda', { ganador: "Anónimo", texto: ganador.texto, puntajes: sala.puntajesPartida, pts: ptsGanados, msjEspecial: msjEspecial }); sala.turnoActual++; setTimeout(() => { if(salas[sala.id] && sala.juegoEnCurso) iniciarRonda(sala); }, 6000); }
        }
    });

    function declararVictoriaFinal(sala, nombreGanador) {
        const fecha = new Date().toLocaleDateString();
        let elToxico = { nombre: "Nadie", valor: -1 }; let blancoFacil = { nombre: "Nadie", valor: -1 };
        Object.keys(sala.estadisticas).forEach(n => { if(sala.estadisticas[n].ganados > elToxico.valor) { elToxico = { nombre: n, valor: sala.estadisticas[n].ganados }; } if(sala.estadisticas[n].victima > blancoFacil.valor) { blancoFacil = { nombre: n, valor: sala.estadisticas[n].victima }; } });

        sala.jugadores.forEach(j => { const res = j.nombre === nombreGanador ? "VICTORIA SUPREMA" : "DERROTA"; db.run("INSERT INTO historial (usuario, resultado, fecha) VALUES (?, ?, ?)", [j.nombre, res, fecha]); });
        db.run("UPDATE usuarios SET victorias = victorias + 1, coins = coins + 300 WHERE usuario = ?", [nombreGanador], () => { if(usuariosOnline[nombreGanador]) { db.get("SELECT coins, toxic, vip FROM usuarios WHERE usuario = ?", [nombreGanador], (e, row) => { io.to(usuariosOnline[nombreGanador]).emit('saldoActualizado', row); io.to(usuariosOnline[nombreGanador]).emit('notificacion', '🏆 ¡Has ganado 300 Coins por tu victoria!'); }); } });
        
        io.to(sala.id).emit('finDePartidaTotal', { 
            ganador: nombreGanador, meta: sala.metaPuntos, 
            titulos: { toxico: elToxico.nombre, victima: blancoFacil.nombre },
            mejorRumor: sala.mejorRumorPartida 
        });
        
        sala.juegoEnCurso = false; 
        io.emit('actualizarListaSalas');
    }

    socket.on('lobbyReaction', (e) => { if(miSalaID) io.to(miSalaID).emit('gameReaction', { id: socket.id, emoji: e }); });
    
    socket.on('comprarItem', (id) => { if(!miUsuario) return; const item = CATALOGO.find(i=>i.id===id); db.get("SELECT coins,toxic,items FROM usuarios WHERE usuario=?", [miUsuario], (e,r)=>{ if(r.items.split(',').includes(id)) return socket.emit('notificacion','Ya lo tienes.'); if(item.moneda==='coins' && r.coins<item.precio) return socket.emit('notificacion','Faltan Coins'); if(item.moneda==='toxic' && r.toxic<item.precio) return socket.emit('notificacion','Faltan Toxic'); let q = item.moneda==='coins' ? "UPDATE usuarios SET coins=coins-?, items=items||','||? WHERE usuario=?" : "UPDATE usuarios SET toxic=toxic-?, items=items||','||? WHERE usuario=?"; db.run(q, [item.precio, id, miUsuario], ()=>{ socket.emit('notificacion',`✅ Comprado: ${item.nombre}`); db.get("SELECT * FROM usuarios WHERE usuario=?",[miUsuario],(e,up)=>socket.emit('loginExitoso',up)); }); }); });
    socket.on('cambiarAvatar', (d) => { if(!miUsuario) return; db.run("UPDATE usuarios SET avatar=?, avatar_type=? WHERE usuario=?",[d.valor,d.tipo,miUsuario],()=>{ if(miSalaID && salas[miSalaID]) { const p = salas[miSalaID].jugadores.find(j=>j.nombre===miUsuario); if(p) { p.avatar=d.valor; p.avatarType=d.tipo; io.to(miSalaID).emit('actualizarSala',salas[miSalaID].jugadores, salas[miSalaID].espectadores.length); } } socket.emit('avatarActualizado', d); }); });
    socket.on('cambiarTitulo', (t) => { if(!miUsuario) return; db.run("UPDATE usuarios SET titulo=? WHERE usuario=?", [t, miUsuario], () => { if(miSalaID && salas[miSalaID]) { const p = salas[miSalaID].jugadores.find(j=>j.nombre===miUsuario); if(p) { p.titulo = t; io.to(miSalaID).emit('actualizarSala', salas[miSalaID].jugadores, salas[miSalaID].espectadores.length); } } socket.emit('notificacion', '🏷️ Título equipado.'); }); });
    socket.on('cambiarMarco', (m) => { if(!miUsuario) return; db.run("UPDATE usuarios SET marco=? WHERE usuario=?", [m, miUsuario], () => { if(miSalaID && salas[miSalaID]) { const p = salas[miSalaID].jugadores.find(j=>j.nombre===miUsuario); if(p) { p.marco = m; io.to(miSalaID).emit('actualizarSala', salas[miSalaID].jugadores, salas[miSalaID].espectadores.length); } } socket.emit('notificacion', '🖼️ Marco equipado.'); }); });

    socket.on('cargarSocial', () => { if(!miUsuario) return; db.all(`SELECT id, de, para FROM amigos WHERE (de=? OR para=?) AND estado='aceptado'`, [miUsuario, miUsuario], (err, rows) => { const amigosList = rows.map(r => { const nombreAmigo = r.de === miUsuario ? r.para : r.de; return { id: r.id, nombre: nombreAmigo, online: !!usuariosOnline[nombreAmigo] }; }); db.all(`SELECT id, de FROM amigos WHERE para=? AND estado='pendiente'`, [miUsuario], (err2, reqs) => { socket.emit('socialData', { amigos: amigosList, solicitudes: reqs || [] }); }); }); });
    socket.on('buscarPersona', (b) => { if(!miUsuario) return; db.all("SELECT usuario FROM usuarios WHERE usuario LIKE ? AND usuario != ? LIMIT 5", [`%${b}%`, miUsuario], (err, rows) => { socket.emit('resultadoBusquedaSocial', rows || []); }); });
    socket.on('enviarSolicitudAmistad', (d) => { if(!miUsuario) return; db.get("SELECT * FROM amigos WHERE (de=? AND para=?) OR (de=? AND para=?)", [miUsuario, d, d, miUsuario], (err, row) => { if(row) return socket.emit('notificacion', 'Ya existe relación.'); db.run("INSERT INTO amigos (de, para, estado) VALUES (?, ?, 'pendiente')", [miUsuario, d], () => { socket.emit('notificacion', `Solicitud enviada a ${d}`); socket.emit('refrescarSocial'); if(usuariosOnline[d]) { io.to(usuariosOnline[d]).emit('notificacion', `Solicitud de ${miUsuario}`); io.to(usuariosOnline[d]).emit('refrescarSocial'); } }); }); });
    socket.on('responderSolicitud', (d) => { db.get("SELECT de, para FROM amigos WHERE id=?", [d.id], (err, row) => { if(!row) return; const otroUsuario = row.de === miUsuario ? row.para : row.de; if(d.accion === 'aceptar') { db.run("UPDATE amigos SET estado='aceptado' WHERE id=?", [d.id], () => { socket.emit('notificacion', '¡Nuevo amigo!'); socket.emit('refrescarSocial'); if(usuariosOnline[otroUsuario]) io.to(usuariosOnline[otroUsuario]).emit('refrescarSocial'); }); } else { db.run("DELETE FROM amigos WHERE id=?", [d.id], () => { socket.emit('refrescarSocial'); if(usuariosOnline[otroUsuario]) io.to(usuariosOnline[otroUsuario]).emit('refrescarSocial'); }); } }); });
    socket.on('eliminarAmigo', (n) => { db.run("DELETE FROM amigos WHERE (de=? AND para=?) OR (de=? AND para=?)", [miUsuario, n, n, miUsuario], () => { socket.emit('notificacion', 'Eliminado.'); socket.emit('refrescarSocial'); if(usuariosOnline[n]) io.to(usuariosOnline[n]).emit('refrescarSocial'); }); });
    
    socket.on('disconnect', () => { 
        salirDeSala(socket, true); 
        delete usuariosConectados[socket.id]; 
        if(miUsuario) delete usuariosOnline[miUsuario]; 
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT,'0.0.0.0', () => console.log(`🔥 SERVIDOR ACTIVO EN EL PUERTO: ${PORT}`));
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.json());

// 🔗 RUTAS ESTÁTICAS
app.use(express.static(path.join(__dirname, 'games', 'Rumor Game', 'public')));
app.use('/exotic', express.static(path.join(__dirname, 'games', 'Exotic', 'public')));

const db = new sqlite3.Database('./toxic_v2.db');

// ============================================================================
// 💾 CONSTANTES GLOBALES
// ============================================================================
const RETOS_AMIGOS = ["Inventa una anécdota vergonzosa que le pasó en una fiesta.", "Di qué es lo más ridículo que hace cuando cree que nadie lo ve.", "Inventa un apodo vergonzoso que su mamá le dice de cariño.", "Di por qué lo echaron de un centro comercial la semana pasada.", "Inventa una fobia absurda que tiene en secreto.", "Cuenta sobre su peor cita romántica a ciegas.", "Di qué es lo peor que ha cocinado y a quién intoxicó.", "Inventa una mentira ridícula que dijo para no ir a trabajar.", "Di qué canción canta a todo pulmón en la ducha llorando.", "Cuenta la vez que se cayó en público y fingió que no pasó nada.", "Inventa un talento inútil del que siempre presume.", "Di qué objeto infantil o peluche aún guarda en su cama.", "Cuenta la vez que intentó coquetear y salió terriblemente mal.", "Inventa cuál es su búsqueda más extraña en el historial de Google.", "Di qué excusa barata usa siempre para no pagar su parte."];
const RETOS_PERSONALES = ["Escribe sobre un gusto culposo muy extraño que tiene esta persona.", "Inventa un fetiche raro que no quiere que nadie sepa.", "Di a quién le dio 'Me gusta' por accidente en Instagram a las 3 AM.", "Cuenta qué mensaje humillante le envió a su ex estando borracho/a.", "Inventa un defecto físico imaginario que siempre intenta ocultar.", "Di qué mentira gigante pone siempre en su perfil de citas.", "Cuenta sobre la vez que lo/la rechazaron de la forma más cruel posible.", "Inventa un secreto enorme que le oculta a sus padres.", "Di qué es lo más narcisista que hace frente al espejo.", "Cuenta un rumor gracioso sobre su higiene personal.", "Inventa qué hace realmente cuando dice que 'se va a dormir'.", "Di por qué motivo lo/la dejaron en visto la última vez.", "Cuenta una historia de infidelidad falsa pero que suene muy creíble.", "Inventa qué es lo más tóxico y celoso que le ha hecho a una pareja.", "Di de qué se arrepiente profundamente."];
const RETOS_SECRETOS = ["Di algo malo que haya hecho y que tú sepas.", "Inventa a qué amigo traicionó por la espalda recientemente.", "Cuenta un secreto financiero oscuro o de dinero robado.", "Di el motivo REAL por el que terminó su última relación.", "Inventa un plan malévolo que tiene en contra de alguien de esta sala.", "Cuenta qué secreto ajeno y grave reveló sin ningún remordimiento.", "Di a quién odia en secreto de este grupo y por qué.", "Inventa un delito menor que haya cometido y logrado ocultar.", "Cuenta qué hace realmente cuando dice que 'está muy ocupado/a'.", "Di por qué la gente no debería confiar realmente en él/ella.", "Inventa una doble vida perturbadora que lleva en cuentas anónimas.", "Cuenta cómo saboteó el éxito de otra persona por pura envidia.", "Di qué objeto valioso rompió en una casa ajena y le echó la culpa a otro.", "Inventa una historia turbia de su pasado que nadie conoce.", "Cuenta un rumor tan fuerte y oscuro que podría arruinar su reputación."];

const EVENTOS_GRUPO = [
    { tipo: 'duelo', texto: "⚔️ DUELO DE MIRADAS: Elige a un oponente. El primero en parpadear toma 2 shots o se quita 1 prenda." },
    { tipo: 'duelo', texto: "⚔️ PIEDRA, PAPEL O TIJERA DE LA MUERTE: Al mejor de 3 con la persona a tu derecha. El perdedor cumple el próximo reto sin rechistar." },
    { tipo: 'escenario', texto: "🚪 ESCENARIO: Ve al baño con la persona a tu izquierda durante 1 minuto. Regresen con una prenda de ropa intercambiada." }
];
const RETOS_RULETA = [
    "🔥 DIABLO: Quítate una prenda de ropa ahora mismo.",
    "💋 LASCIVIA: Dale un beso en el cuello a la persona a tu derecha.",
    "📱 EXPOSICIÓN: El grupo elige a quién le envías un mensaje comprometedor.",
    "👅 TENTACIÓN: Chupa un hielo de forma sugerente por 15 segundos.",
    "😈 SUMISIÓN: Véndate los ojos y recibe un beso sorpresa del grupo.",
    "💃 LUJURIA: Hazle un lap dance de 30 segundos a quien elija el grupo."
];

const CATALOGO = [
    { id: 'base_1', icon: '👤', precio: 0, moneda: 'gratis', nombre: 'Default', tipo: 'avatar' },
    { id: 'c_poop', icon: '💩', precio: 10, moneda: 'coins', nombre: 'Caca', tipo: 'avatar' },
    { id: 'c_fox',   icon: '🦊', precio: 50, moneda: 'coins', nombre: 'Zorro', tipo: 'avatar' },
    { id: 'c_alien', icon: '👽', precio: 200, moneda: 'coins', nombre: 'Alien', tipo: 'avatar' },
    { id: 'c_ninja', icon: '🥷', precio: 300, moneda: 'coins', nombre: 'Shinobi', tipo: 'avatar' }, 
    { id: 'c_rico',  icon: '🤑', precio: 500, moneda: 'coins', nombre: 'Ricachón', tipo: 'avatar' },
    { id: 't_skull', icon: '💀', precio: 200, moneda: 'toxic', nombre: 'Skull', tipo: 'avatar' },
    { id: 't_clown', icon: '🤡', precio: 300, moneda: 'toxic', nombre: 'Clown', tipo: 'avatar' },
    { id: 't_cens',  icon: '🔞', precio: 500, moneda: 'toxic', nombre: 'Censurado', tipo: 'avatar' },
    { id: 't_millo', icon: '💸', precio: 700, moneda: 'toxic', nombre: 'Millonario', tipo: 'avatar' },
    { id: 't_ojo',   icon: '👁️', precio: 1000, moneda: 'toxic', nombre: 'Illuminati', tipo: 'avatar' },
    { id: 'tit_corazon', icon: '💬', precio: 300, moneda: 'coins', nombre: 'El Rompecorazones', tipo: 'titulo' },
    { id: 'tit_mentira', icon: '💬', precio: 400, moneda: 'coins', nombre: 'Mentiroso', tipo: 'titulo' },
    { id: 'tit_toxico',  icon: '💬', precio: 100, moneda: 'toxic', nombre: 'Tóxico', tipo: 'titulo' },
    { id: 'tit_gordas',  icon: '💬', precio: 150, moneda: 'toxic', nombre: 'Me gustan las gordas', tipo: 'titulo' },
    { id: 'm_neon', icon: '🖼️', precio: 300, moneda: 'coins', nombre: 'Marco Neón', tipo: 'marco', clase: 'marco-neon' },
    { id: 'm_fuego', icon: '🔥', precio: 500, moneda: 'coins', nombre: 'Marco Fuego', tipo: 'marco', clase: 'marco-fuego' },
    { id: 'm_toxico', icon: '☣️', precio: 150, moneda: 'toxic', nombre: 'Marco Tóxico', tipo: 'marco', clase: 'marco-toxico' },
    { id: 'm_oro', icon: '👑', precio: 300, moneda: 'toxic', nombre: 'Marco Oro', tipo: 'marco', clase: 'marco-oro' },
    { id: 'e_rayos', icon: '⚡', precio: 500, moneda: 'coins', nombre: 'Entrada Rayos', tipo: 'entrada' },
    { id: 'e_explo', icon: '💥', precio: 150, moneda: 'toxic', nombre: 'Entrada Explosión', tipo: 'entrada' },
    { id: 'm_legend', icon: '🌟', precio: 99999, moneda: 'pase', nombre: 'Marco Legendario', tipo: 'marco', clase: 'marco-legend' },
    { id: 'tit_dios', icon: '💬', precio: 99999, moneda: 'pase', nombre: 'Dios Tóxico', tipo: 'titulo', clase: 'titulo-brillante' }
];

// ============================================================================
// 🗄️ BASE DE DATOS Y TABLAS
// ============================================================================
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (usuario TEXT PRIMARY KEY, email TEXT, pass TEXT, victorias INTEGER DEFAULT 0, avatar TEXT DEFAULT '👤', avatar_type TEXT DEFAULT 'emoji', coins INTEGER DEFAULT 0, toxic INTEGER DEFAULT 0, items TEXT DEFAULT 'base_1', vip INTEGER DEFAULT 0, titulo TEXT DEFAULT '', marco TEXT DEFAULT '', entrada TEXT DEFAULT '', xp INTEGER DEFAULT 0, misiones TEXT DEFAULT '{}', exotic_name TEXT DEFAULT '')`);
    db.run(`CREATE TABLE IF NOT EXISTS amigos (id INTEGER PRIMARY KEY AUTOINCREMENT, de TEXT, para TEXT, estado TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS historial (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT, resultado TEXT, fecha TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS soporte (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT, email TEXT, mensaje TEXT, respuesta TEXT, fecha TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS retos_personales (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT, texto TEXT)`);
    
    // Tablas de Exotic Game
    db.run(`CREATE TABLE IF NOT EXISTS retos (id INTEGER PRIMARY KEY AUTOINCREMENT, texto TEXT, nivel INTEGER, modo TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS castigos (id INTEGER PRIMARY KEY AUTOINCREMENT, texto TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS retos_comunidad (id INTEGER PRIMARY KEY AUTOINCREMENT, autor TEXT, texto TEXT, shots INTEGER, modo TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS salon_fama (usuario TEXT PRIMARY KEY, partidas INTEGER DEFAULT 0, retos_creados INTEGER DEFAULT 0, exotic_name TEXT DEFAULT '')`);
    db.run(`CREATE TABLE IF NOT EXISTS retos_pendientes (id INTEGER PRIMARY KEY AUTOINCREMENT, autor TEXT, texto TEXT, shots INTEGER, modo TEXT)`);

    db.run(`ALTER TABLE usuarios ADD COLUMN exotic_name TEXT DEFAULT ''`, (err) => {}); 

    // Inyección de Retos Oficiales
    db.get("SELECT COUNT(*) as count FROM retos", (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO retos (texto, nivel, modo) VALUES (?, ?, ?)");
            const p1 = ["Besa a tu pareja en el cuello por 10 segundos ininterrumpidos.", "Dile a tu pareja qué es lo que más te excita de su cuerpo mirando a sus ojos.", "Susúrrale al oído exactamente qué le harías si no hubiera reglas esta noche.", "Muerde suavemente el lóbulo de la oreja de tu pareja.", "Dale un beso francés (con lengua) de 15 segundos sin usar las manos.", "Acaricia la entrepierna de tu pareja sobre la ropa por 10 segundos.", "Lame sus labios lentamente de un lado a otro.", "Quítale una prenda a tu pareja usando solo los dientes.", "Hazle un chupetón suave en un lugar donde nadie más lo vea.", "Cierra los ojos y adivina qué parte de tu cuerpo está tocando tu pareja.", "Dale un beso en la zona más sensible que conozcas de él/ella.", "Baila de forma sensual o haz un mini striptease por 30 segundos.", "Deja que tu pareja te vende los ojos y te dé a probar algo de la nevera.", "Confiesa una fantasía sexual que nunca le has contado a nadie.", "Recorre su mandíbula con tu nariz respirando profundo.", "Dale un masaje en los hombros que vaya bajando lentamente hacia la espalda."]; p1.forEach(r => stmt.run(r, 1, 'parejas'));
            const p2 = ["Siéntate en las piernas de tu pareja mirando hacia él/ella por los próximos 2 turnos.", "Mete la mano por debajo de su camisa y acaricia su pecho o espalda.", "Dale un beso húmedo bajando desde el ombligo hasta la línea de su ropa interior.", "Frota tu cuerpo contra el de tu pareja al ritmo de una canción sensual.", "Chupa y muerde suavemente los dedos de la mano de tu pareja uno por uno.", "Confiesa en qué lugar público y prohibido te gustaría hacerlo con él/ella.", "Deja que tu pareja te bese el cuello hasta dejarte una marca visible.", "Bésense apasionadamente mientras se acarician intensamente por 1 minuto.", "Simula un orgasmo mirándolo/a a los ojos.", "Deja que tu pareja elija una pose sexual y quédate en esa posición 1 minuto.", "Hazle sexo oral simulado (sobre la ropa) durante 20 segundos.", "Susurra la palabra más sucia y vulgar que se te ocurra en su oído.", "Muerde su labio inferior y tira de él suavemente mientras lo miras.", "Acaricia sus muslos por debajo de la mesa o sábana hasta tu próximo turno.", "Tómate un shot del cuerpo de tu pareja (Body shot).", "Besa su abdomen y ve bajando lentamente sin tocar su zona íntima.", "Dile cuál ha sido el mejor sexo que han tenido juntos y por qué."]; p2.forEach(r => stmt.run(r, 2, 'parejas'));
            const p3 = ["Quítate la ropa interior sin quitarte los pantalones/falda y dásela en la mano.", "Hazle un striptease completo quedándote solo en ropa interior.", "Deja que tu pareja te vende los ojos y use un cubito de hielo por todo tu cuerpo.", "Vayan al baño o a un lugar privado por 2 minutos exactos, no pueden salir arreglados.", "Tómale una foto sugerente a tu pareja (sin mostrar la cara) y ponla de fondo de pantalla hasta mañana.", "Haz que tu pareja llegue al clímax usando solo tus manos (vayan a otro cuarto si hay gente).", "Dile paso a paso, con lujo de detalles, cómo quieres que te folle esta noche.", "Deja que tu pareja te grabe con el celular diciendo algo muy sucio.", "Simula tu posición sexual favorita con tu pareja en medio del cuarto.", "Tócate a ti mismo/a frente a tu pareja durante 1 minuto completo.", "Deja que tu pareja te domine: tiene control físico total sobre ti por 2 minutos.", "Envía un mensaje de voz gimiendo a un chat que tu pareja elija (sin decir que es un juego).", "Besa apasionadamente a tu pareja mientras tu mano está dentro de su pantalón.", "Graben un video corto de 10 segundos besándose de la forma más caliente posible.", "Quítate una prenda vital (camisa o pantalón) y quédate así el resto de la partida.", "Intercambien ropa interior por el resto de la noche.", "Deja que tu pareja te vende los ojos y te estimule con un objeto sorpresa."]; p3.forEach(r => stmt.run(r, 3, 'parejas'));
            const g1 = ["Dale un beso en el cachete muy cerca de la boca a la persona más atractiva del grupo.", "Tócale el cabello a {victima} de forma seductora.", "Haz un contacto visual intenso (sin reírte ni hablar) con {victima} por 30 segundos.", "Siéntate en las piernas de {victima} por un turno completo.", "Deja que {victima} te dé de beber de su vaso usando sus manos.", "Confiesa en voz alta quién del grupo crees que es el más salvaje en la cama.", "Susúrrale a {victima} una mentira sucia.", "Dale un masaje en los hombros a {victima} por 1 minuto.", "Adivina el color de ropa interior de {victima}. Si fallas, tomas un shot.", "Elige a alguien del grupo para que te abrace por la espalda por 1 minuto.", "Describe el cuerpo de alguien del grupo sin decir su nombre, los demás deben adivinar.", "Lame tus propios labios de forma lenta mirando fijamente a {victima}.", "Deja que {victima} huela tu cuello de cerca.", "Confiesa cuál es el fetiche más raro que has buscado en internet.", "Elige a dos personas del grupo para que se den un beso en la mejilla a 1 milímetro de la boca.", "Señala quién del grupo tiene el mejor trasero."]; g1.forEach(r => stmt.run(r, 1, 'grupo'));
            const g2 = ["Dale un beso en el cuello a {victima} por 5 segundos.", "Hazle un lap dance (baile en las piernas) a {victima} por 30 segundos.", "Deja que {victima} te muerda suavemente la oreja.", "Pasa un cubito de hielo por el pecho/escote de {victima} usando solo tu boca.", "Intercambia una prenda de ropa con {victima} ahora mismo.", "Tómate un body shot (chupar sal/tequila) del abdomen o cuello de {victima}.", "Besa la comisura de los labios de {victima} con los ojos cerrados.", "Confiesa con quién de este grupo tendrías una aventura de una sola noche.", "El grupo te venda los ojos y alguien misterioso (elegido en silencio) te da un beso.", "Acaricia el muslo de {victima} por debajo de la mesa durante los próximos 2 turnos.", "Dale una nalgada a {victima} con la fuerza que el grupo decida.", "Muestra al grupo la última foto sugerente/nude que enviaste o recibiste (puedes tapar la cara).", "Haz que {victima} te quite una prenda usando solo la boca.", "Simula un orgasmo muy sonoro durante 10 segundos frente a todos.", "Tócate a ti mismo/a sobre la ropa de forma sensual por 20 segundos mirándolos.", "Confiesa si alguna vez has tenido fantasías con alguien presente en la sala.", "Muestra la orilla de tu ropa interior al grupo."]; g2.forEach(r => stmt.run(r, 2, 'grupo'));
            const g3 = ["Dale un beso francés (con lengua) de 10 segundos a {victima}.", "Quítate la camisa o blusa y juega así por los próximos 3 turnos.", "Ve al baño a solas con {victima}, quédense allí 2 minutos y regresen desarreglados.", "Deja que {victima} meta la mano en tu pantalón o falda por 10 segundos cronometrados.", "Hazle sexo oral simulado (frotando sobre la ropa) a {victima} durante 15 segundos.", "Chupa los dedos de la mano de {victima} uno por uno metiéndolos en tu boca.", "Tócate el pecho/senos por debajo de la ropa frente a todos durante 15 segundos.", "Deja que {victima} te chupe o muerda un pezón (por encima de la ropa si prefieren).", "Quítate la ropa interior ahora mismo y ponla en medio de la mesa.", "Bésate apasionadamente con alguien de tu mismo sexo (o sexo opuesto si eres gay) del grupo.", "Confiesa en voz alta la cosa más ilegal, inmoral o asquerosa que has hecho en la cama.", "Deja que {victima} te vende los ojos y te toque donde quiera por 30 segundos.", "Gime el nombre de {victima} lo más fuerte y real posible.", "Acuéstate en el suelo y deja que {victima} simule tener sexo contigo encima por 15 segundos.", "Besa el abdomen de {victima} bajando hasta casi tocar su zona íntima.", "El grupo elige a dos personas (incluyéndote o no) para que se encierren en el clóset a oscuras por 1 minuto.", "Chupa el lóbulo de la oreja de {victima} mientras le agarras la nuca con fuerza."]; g3.forEach(r => stmt.run(r, 3, 'grupo'));
            stmt.finalize();

            const stmtC = db.prepare("INSERT INTO castigos (texto) VALUES (?)");
            const castigos = ["Quítate una prenda de ropa.", "Bebe un fondo blanco (shot completo).", "Deja que revisen tu galería de fotos por 30 segundos.", "Baila sin música de forma sexy por 1 minuto.", "Confiesa tu fantasía sexual más oscura.", "Toma un shot del ombligo de la persona a tu derecha."];
            castigos.forEach(c => stmtC.run(c));
            stmtC.finalize();
        }
    });

    const todos = CATALOGO.map(i => i.id).join(',');
    db.run(`INSERT OR IGNORE INTO usuarios (usuario, email, pass, victorias, avatar, coins, toxic, items, vip, titulo, marco, entrada) VALUES ('admin', 'admin@toxic.com', '123456', 999, '👑', 99999, 99999, '${todos}', 1, 'Administrador', 'marco-oro', 'e_explo')`);
});

// ============================================================================
// 🔌 APIS DE RUMOR & GOOGLE LOGIN
// ============================================================================
app.post('/api/registro', (req, res) => {
    const { nombre, password, avatar } = req.body;
    if (!nombre || !password) return res.json({ success: false, msg: "Datos incompletos" });
    
    db.get("SELECT * FROM usuarios WHERE LOWER(usuario) = LOWER(?)", [nombre], (err, row) => {
        if (row) return res.json({ success: false, msg: "El nombre ya está en uso" });
        const mis = JSON.stringify({ victorias: {count:0, max:3, xp:100}, comodines: {count:0, max:5, xp:50}, rumores: {count:0, max:10, xp:150} });
        db.run("INSERT INTO usuarios (usuario, email, pass, avatar, misiones, items) VALUES (?, ?, ?, ?, ?, 'base_1')", 
            [nombre, nombre+"@rumor.com", password, avatar || '👤', mis], (err) => {
            if(err) return res.json({ success: false, msg: "Error al registrar" });
            res.json({ success: true });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { nombre, password } = req.body;
    db.get("SELECT * FROM usuarios WHERE LOWER(usuario) = LOWER(?) AND pass = ?", [nombre, password], (err, row) => {
        if (row) res.json({ success: true, user: { nombre: row.usuario, avatar: row.avatar, monedas: row.coins, toxic: row.toxic } });
        else res.json({ success: false, msg: "Datos incorrectos" });
    });
});

app.post('/api/guardar-reto', (req, res) => {
    const { usuario, texto } = req.body;
    db.run('INSERT INTO retos_personales (usuario, texto) VALUES (?, ?)', [usuario, texto], (err) => {
        if (err) res.json({ success: false }); else res.json({ success: true });
    });
});

app.post('/api/mis-retos', (req, res) => {
    const { usuario } = req.body;
    db.all('SELECT texto FROM retos_personales WHERE usuario = ?', [usuario], (err, rows) => {
        if (err) res.json({ success: false }); else res.json({ success: true, retos: rows.map(r => r.texto) });
    });
});

// 🔥 APIS DE GOOGLE 🔥
app.post('/api/google-login', (req, res) => {
    const { email } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (row) {
            res.json({ exists: true, user: { nombre: row.usuario } });
        } else {
            res.json({ exists: false });
        }
    });
});

app.post('/api/google-register', (req, res) => {
    const { email, nombre, avatar } = req.body;
    db.get("SELECT * FROM usuarios WHERE LOWER(usuario) = LOWER(?)", [nombre], (err, row) => {
        if (row) return res.json({ success: false, msg: "Ese nombre ya está en uso. Elige otro." });
        
        const mis = JSON.stringify({ victorias: {count:0, max:3, xp:100}, comodines: {count:0, max:5, xp:50}, rumores: {count:0, max:10, xp:150} });
        db.run("INSERT INTO usuarios (usuario, email, pass, avatar, misiones, items) VALUES (?, ?, 'google', ?, ?, 'base_1')", 
            [nombre, email, '👤', mis], (err) => {
            if(err) return res.json({ success: false, msg: "Error al registrar" });
            res.json({ success: true });
        });
    });
});

let salas = {}; let usuariosConectados = {}; let usuariosOnline = {};

// ============================================================================
// 🔌 SOCKETS COMPARTIDOS
// ============================================================================
io.on('connection', (socket) => {
    let miUsuario = null; let miSalaID = null; let soyEspectador = false;

    socket.on('login', (data) => {
        const userTrimmed = String(data.usuario).trim();
        db.get("SELECT * FROM usuarios WHERE LOWER(usuario) = LOWER(?) AND pass = ?", [userTrimmed, data.pass], (err, row) => {
            if (!row) return socket.emit('errorLogin', 'Datos incorrectos.'); 
            iniciarSesion(socket, row.usuario);
        });
    });

    socket.on('registro', (data) => {
        const userTrimmed = String(data.usuario).trim();
        db.get("SELECT email FROM usuarios WHERE LOWER(usuario) = LOWER(?)", [userTrimmed], (err, row) => {
            if (row) return socket.emit('errorLogin', 'El usuario ya existe');
            const mis = JSON.stringify({ victorias: {count:0, max:3, xp:100}, comodines: {count:0, max:5, xp:50}, rumores: {count:0, max:10, xp:150} });
            db.run(`INSERT INTO usuarios (usuario, email, pass, coins, misiones, items, avatar) VALUES (?, ?, ?, 500, ?, 'base_1', '👤')`, [userTrimmed, data.email, data.pass, mis], (err) => {
                if(!err) iniciarSesion(socket, userTrimmed);
            });
        });
    });

    function iniciarSesion(socket, usuario) {
        miUsuario = usuario; usuariosConectados[socket.id] = usuario; usuariosOnline[usuario] = socket.id;
        const esAdmin = (usuario === 'soporte1' || usuario === 'admin');

        db.get("SELECT * FROM usuarios WHERE usuario = ?", [usuario], (err, row) => {
            socket.emit('loginExitoso', { ...row, misionesObj: {}, historial: [], esAdmin: esAdmin });
            socket.emit('datosCatalogo', CATALOGO);
        });
    }

    socket.on('comprarItem', (id) => { 
        if(!miUsuario) return; 
        const item = CATALOGO.find(i=>i.id===id); 
        db.get("SELECT coins,toxic,items FROM usuarios WHERE usuario=?", [miUsuario], (e,r)=>{ 
            if(r.items.split(',').includes(id)) return socket.emit('notificacion','Ya lo tienes.'); 
            if(item.moneda==='coins' && r.coins<item.precio) return socket.emit('notificacion','Faltan Coins 🪙'); 
            if(item.moneda==='toxic' && r.toxic<item.precio) return socket.emit('notificacion','Faltan Gemas Tóxicas 💎'); 
            
            let q = item.moneda==='coins' ? "UPDATE usuarios SET coins=coins-?, items=items||','||? WHERE usuario=?" : "UPDATE usuarios SET toxic=toxic-?, items=items||','||? WHERE usuario=?"; 
            db.run(q, [item.precio, id, miUsuario], ()=>{ 
                socket.emit('notificacion',`✅ Comprado: ${item.nombre}`); 
                db.get("SELECT * FROM usuarios WHERE usuario=?",[miUsuario],(e,up)=>{ 
                    socket.emit('loginExitoso', {...up, esAdmin: (miUsuario === 'admin' || miUsuario === 'soporte1')}); 
                }); 
            }); 
        }); 
    });


    // ============================================================================
    // 🔥 LÓGICA EXOTIC GAME 🔥
    // ============================================================================
    socket.on('pedirRetosPendientes', () => {
        if (miUsuario !== 'admin' && miUsuario !== 'soporte1') return;
        db.all("SELECT * FROM retos_pendientes", [], (err, rows) => { socket.emit('listaRetosPendientes', rows || []); });
    });

    socket.on('accionRetoPendiente', (data) => {
        if (miUsuario !== 'admin' && miUsuario !== 'soporte1') return;
        const { id, accion } = data;
        db.get("SELECT * FROM retos_pendientes WHERE id = ?", [id], (err, row) => {
            if(!row) return;
            if(accion === 'aprobar') {
                db.run("INSERT INTO retos_comunidad (autor, texto, shots, modo) VALUES (?, ?, ?, ?)", [row.autor, row.texto, row.shots, row.modo], () => {
                    db.run("INSERT INTO retos (texto, nivel, modo) VALUES (?, 3, ?)", [row.texto, row.modo]);
                    db.run("INSERT INTO salon_fama (usuario, partidas, retos_creados, exotic_name) VALUES (?, 0, 1, ?) ON CONFLICT(usuario) DO UPDATE SET retos_creados = retos_creados + 1, exotic_name = ?", [row.autor, row.autor, row.autor], () => { actualizarDatosFama(); });
                    db.run("DELETE FROM retos_pendientes WHERE id = ?", [id]);
                    socket.emit('notificacion', '✅ Reto aprobado.');
                    io.emit('retoAprobadoNotificacion', row.autor); 
                    db.all("SELECT * FROM retos_pendientes", [], (err, rows) => { socket.emit('listaRetosPendientes', rows || []); });
                });
            } else {
                db.run("DELETE FROM retos_pendientes WHERE id = ?", [id], () => {
                    socket.emit('notificacion', '❌ Reto eliminado.');
                    db.all("SELECT * FROM retos_pendientes", [], (err, rows) => { socket.emit('listaRetosPendientes', rows || []); });
                });
            }
        });
    });

    function actualizarDatosFama() {
        db.all("SELECT autor, texto, shots, modo FROM retos_comunidad ORDER BY id DESC LIMIT 20", (err, retos) => {
            db.all("SELECT usuario, partidas, exotic_name FROM salon_fama ORDER BY partidas DESC LIMIT 10", (err, topPartidas) => {
                db.all("SELECT usuario, retos_creados, exotic_name FROM salon_fama ORDER BY retos_creados DESC LIMIT 10", (err, topRetos) => {
                    io.emit('actualizarDatosFama', { retos: retos || [], topPartidas: topPartidas || [], topRetos: topRetos || [] });
                });
            });
        });
    }
    socket.on('pedirDatosFama', actualizarDatosFama);

    socket.on('actualizarPerfilExotic', (data) => {
        if(miUsuario) {
            db.run("UPDATE usuarios SET exotic_name = ?, avatar = ? WHERE usuario = ?", [data.nombre, data.avatar, miUsuario], () => {
                db.run("UPDATE salon_fama SET exotic_name = ? WHERE usuario = ?", [data.nombre, miUsuario]);
                socket.emit('perfilExoticoActualizado', { nombre: data.nombre, avatar: data.avatar });
                actualizarDatosFama();
            });
        }
    });

    socket.on('proponerRetoComunidad', (data) => {
        db.run("INSERT INTO retos_pendientes (autor, texto, shots, modo) VALUES (?, ?, ?, ?)", [data.autor, data.texto, data.shots, data.modo], () => {
            socket.emit('notificacion', '⏳ Tu reto fue enviado y está esperando aprobación.');
            if(usuariosOnline['admin']) io.to(usuariosOnline['admin']).emit('notificacion', '🔔 Tienes un nuevo reto pendiente en Exotic.');
        });
    });

    socket.on('entrarSalaExotic', ({ codigo, modo, usuario }) => {
        socket.join(codigo); miSalaID = codigo;
        if (!salas[codigo]) salas[codigo] = { tipoJuego: 'exotic', modo: modo || 'grupo', jugadores: [], turno: null, temperatura: 0, quejas: [], pacto: [], reglaGlobal: { texto: "", turnos: 0 } };
        
        const existe = salas[codigo].jugadores.find(j => j.nombre === usuario.loginName);
        if (!existe) salas[codigo].jugadores.push({ nombre: usuario.loginName, exotic_name: usuario.exotic_name || usuario.loginName, avatar: usuario.avatar, socketId: socket.id });
        else { existe.socketId = socket.id; existe.exotic_name = usuario.exotic_name || usuario.loginName; }

        if (usuario.loginName) {
            db.run("INSERT INTO salon_fama (usuario, partidas, retos_creados, exotic_name) VALUES (?, 1, 0, ?) ON CONFLICT(usuario) DO UPDATE SET partidas = partidas + 1, exotic_name = ?", [usuario.loginName, usuario.exotic_name || usuario.loginName, usuario.exotic_name || usuario.loginName], () => { actualizarDatosFama(); });
        }
        io.to(codigo).emit('actualizarSalaExotic', salas[codigo]);
        io.to(codigo).emit('actualizarTemperatura', salas[codigo].temperatura);
    });

    socket.on('agregarJugadorManualExotic', ({ codigo, nombre }) => {
        if (salas[codigo] && !salas[codigo].jugadores.find(j => j.nombre === nombre)) {
            salas[codigo].jugadores.push({ nombre: nombre, exotic_name: nombre, avatar: '👤', socketId: null, tipo: 'manual' });
            io.to(codigo).emit('actualizarSalaExotic', salas[codigo]);
        }
    });

    socket.on('nuevaQuejaGrupo', ({ codigo, texto }) => { if(salas[codigo]) salas[codigo].quejas.push(texto); });

    socket.on('siguienteTurnoExotic', (codigo) => {
        const sala = salas[codigo];
        if (!sala || sala.jugadores.length === 0) return;

        if(sala.reglaGlobal.turnos > 0) sala.reglaGlobal.turnos--;

        if(sala.modo === 'grupo' && sala.jugadores.length >= 4 && sala.pacto.length === 0) {
            let j1 = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)].exotic_name;
            let j2 = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)].exotic_name;
            if(j1 !== j2) sala.pacto = [j1, j2];
        }

        if (sala.modo === 'grupo' && Math.random() < 0.15) {
            if (sala.quejas.length > 0 && Math.random() < 0.5) {
                let q = sala.quejas.splice(Math.floor(Math.random()*sala.quejas.length), 1)[0];
                io.to(codigo).emit('eventoEspecialGrupo', { tipo: 'queja', texto: `🤫 ANÓNIMO DICE: "${q}" \n\nTienen 10 segs para señalar al culpable. Si adivinan, él toma. Si no, todos toman.` });
                return;
            } else {
                let ev = EVENTOS_GRUPO[Math.floor(Math.random() * EVENTOS_GRUPO.length)];
                io.to(codigo).emit('eventoEspecialGrupo', { tipo: ev.tipo, texto: ev.texto });
                return;
            }
        }

        const nuevoActor = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)];
        sala.turno = nuevoActor;
        io.to(codigo).emit('cambioDeTurnoExotic', { actor: nuevoActor, pacto: sala.pacto, regla: sala.reglaGlobal });
    });

    // 🔥 AQUI ESTÁ EL BLINDAJE CONTRA EL ERROR NULL 🔥
    socket.on('pedirRetoExotic', ({ codigo, nivel }) => {
        const sala = salas[codigo];
        if (!sala) return;
        
        if(nivel === 3) sala.temperatura += 25;
        if(nivel === 2) sala.temperatura += 10;
        if(sala.temperatura > 100) sala.temperatura = 100;
        io.to(codigo).emit('actualizarTemperatura', sala.temperatura);

        db.get('SELECT texto FROM retos WHERE nivel = ? AND modo = ? ORDER BY RANDOM() LIMIT 1', [nivel, sala.modo], (err, dbReto) => {
            let texto = dbReto ? dbReto.texto : "Toma un shot.";
            let victima = "Tu Pareja";
            
            if (sala.modo === 'grupo' && sala.jugadores.length > 1) {
                const turnoActual = sala.turno ? sala.turno.nombre : null; // Escudo activado
                const posibles = sala.jugadores.filter(j => j.nombre !== turnoActual);
                
                if(posibles.length > 0) {
                    let victimaObj = posibles[Math.floor(Math.random() * posibles.length)];
                    victima = victimaObj.exotic_name || victimaObj.nombre;
                }
                texto = texto.replace(/{victima}/g, victima);
            }
            
            io.to(codigo).emit('resultadoRetoExotic', { texto, victima, nivel: nivel });
        });
    });

    socket.on('pedirListaSoborno', (codigo) => {
        const s = salas[codigo];
        if(s) socket.emit('mostrarModalSoborno', s.jugadores.filter(j => j.nombre !== miUsuario));
    });

    socket.on('ejecutarSoborno', ({ codigo, de, para, reto }) => {
        db.run("UPDATE usuarios SET coins = coins - 200 WHERE usuario = ?", [de]);
        io.to(codigo).emit('resultadoRetoExotic', { texto: `💸 SOBORNO PAGADO: ` + reto, victima: "A cumplir...", nivel: 1 });
        if(salas[codigo]) {
            let v = salas[codigo].jugadores.find(j=>j.nombre === para);
            if(v) salas[codigo].turno = v;
            io.to(codigo).emit('cambioDeTurnoExotic', { actor: v, pacto: salas[codigo].pacto, regla: salas[codigo].reglaGlobal });
        }
    });

    socket.on('imponerRegla', ({ codigo, texto }) => {
        if(salas[codigo]) salas[codigo].reglaGlobal = { texto: texto, turnos: 3 };
        io.to(codigo).emit('cambioDeTurnoExotic', { actor: salas[codigo].turno, pacto: salas[codigo].pacto, regla: salas[codigo].reglaGlobal });
    });

    socket.on('pedirCastigoExotic', ({ codigo, usuario }) => {
        const sala = salas[codigo];
        if(sala) { sala.temperatura -= 15; if(sala.temperatura < 0) sala.temperatura = 0; io.to(codigo).emit('actualizarTemperatura', sala.temperatura); }

        db.get('SELECT texto FROM castigos ORDER BY RANDOM() LIMIT 1', (err, c) => {
            io.to(codigo).emit('mostrarCastigoExotic', c ? c.texto : "¡Toma un shot!");
        });
    });

    socket.on('girarRuletaDiablo', (codigo) => {
        const sala = salas[codigo]; if (!sala) return;
        sala.temperatura = 0; io.to(codigo).emit('actualizarTemperatura', sala.temperatura);
        io.to(codigo).emit('iniciarRuleta');
        setTimeout(() => {
            const reto = RETOS_RULETA[Math.floor(Math.random() * RETOS_RULETA.length)];
            io.to(codigo).emit('resultadoRetoExotic', { texto: reto, victima: "TODA LA SALA ESCUCHA", nivel: 4 });
        }, 4000);
    });

    socket.on('salirSalaExotic', () => {
        if (miSalaID && salas[miSalaID]) {
            salas[miSalaID].jugadores = salas[miSalaID].jugadores.filter(j => j.socketId !== socket.id);
            if (salas[miSalaID].jugadores.length === 0) delete salas[miSalaID];
        }
        miSalaID = null;
    });

    // ============================================================================
    // 🧠 RUMOR TOXIC (PARTIDAS)
    // ============================================================================
    socket.on('crearSala', (data) => { 
        if (!miUsuario) return;
        const idSala = 'sala_' + Math.random().toString(36).substr(2, 6); const meta = parseInt(data.meta) || 200; 
        salas[idSala] = { 
            id: idSala, nombre: data.nombre || `Sala de ${miUsuario}`, pass: data.clave || null, metaPuntos: meta, 
            tipoJuego: 'rumor', jugadores: [], espectadores: [], juegoEnCurso: false, rumores: [], 
            victimaNombre: null, abogadoNombre: null, puntajesPartida: {}, turnoActual: 0, timerVotacion: null, 
            estadisticas: {}, votosAudiencia: {}, mejorRumorPartida: { texto: '', autor: '', pts: 0 }
        }; 
        unirseASalaRumor(socket, idSala, data.clave, 'jugador'); 
    });

    socket.on('unirseSala', (data) => unirseASalaRumor(socket, data.id, data.clave, data.rol));

    function unirseASalaRumor(socket, idSala, clave, rol) {
        if (!miUsuario) return socket.emit('notificacion', 'Tu sesión expiró.');
        const sala = salas[idSala];
        if (!sala) return socket.emit('notificacion', 'Sala no existe.');
        miSalaID = idSala; socket.join(idSala);
        
        db.get("SELECT * FROM usuarios WHERE usuario = ?", [miUsuario], (err, row) => {
            if(rol === 'espectador') {
                soyEspectador = true;
                if (!sala.espectadores.find(e => e.nombre === miUsuario)) sala.espectadores.push({ id: socket.id, nombre: miUsuario });
            } else {
                soyEspectador = false;
                const index = sala.jugadores.findIndex(p => p.nombre === miUsuario);
                if (index !== -1) sala.jugadores[index].id = socket.id; 
                else sala.jugadores.push({ id: socket.id, nombre: miUsuario, avatar: row.avatar, vip: row.vip });
                if (!sala.puntajesPartida[miUsuario]) sala.puntajesPartida[miUsuario] = 0;
            }
            socket.emit('entradoEnSala', { nombreSala: sala.nombre, codigo: idSala, meta: sala.metaPuntos, rol: rol, tipoJuego: sala.tipoJuego });
            io.to(idSala).emit('actualizarSala', sala.jugadores, sala.espectadores.length); 
        });
    }

    socket.on('iniciarJuego', () => {
        const sala = salas[miSalaID];
        if(!sala || sala.tipoJuego !== 'rumor') return;
        if(sala.jugadores.length < 4) return socket.emit('notificacion', 'Mínimo 4 jugadores activos.');
        sala.juegoEnCurso = true;
        sala.jugadores.forEach(j => { sala.puntajesPartida[j.nombre] = 0; sala.estadisticas[j.nombre] = { ganados: 0, victima: 0 }; });
        sala.turnoActual = 0; 
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
            let msj = `RUMOR SOBRE ${victima.nombre}`;
            
            if (j.nombre === victima.nombre) msj = "👑 ERES EL ELEGIDO (+20 PTS)";
            else if (esAbog) msj = `😈 ABOGADO DEL DIABLO <br><span style="font-size:12px; color:#ff4757;">¡Inventa algo bueno sobre <b style="color:var(--accent-gold); text-transform:uppercase;">${victima.nombre}</b>! Si te elige, AMBOS PIERDEN 40 pts. Si no, AMBOS GANAN 40 pts.</span>`;
            else msj += retoPicante;
            
            io.to(j.id).emit('faseEscritura', { msj: msj, esVictima: j.nombre === victima.nombre, esAbogado: esAbog, turno: sala.turnoActual, nombreVictima: victima.nombre }); 
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
            
            db.run("UPDATE usuarios SET coins = coins + 5 WHERE usuario = ?", [autor.nombre], () => {
                db.get("SELECT coins, toxic, vip FROM usuarios WHERE usuario = ?", [autor.nombre], (e, upRow) => socket.emit('saldoActualizado', upRow));
                sala.rumores.push({ autorNombre: autor.nombre, texto: String(textoReal), autorMuestra: autor.nombre, dobleFilo: false, aceptaReto: false });
                sala.puntajesPartida[autor.nombre] += 5; 
                io.to(sala.id).emit('actualizarPuntajesPartida', sala.puntajesPartida);
                io.to(miSalaID).emit('rumorRecibido', { recibidos: sala.rumores.length, total: sala.jugadores.length - 1 });

                if(sala.rumores.length >= sala.jugadores.length - 1) {
                    const rumoresParaVotar = sala.rumores.map(r => ({ texto: r.texto, originalIndex: sala.rumores.indexOf(r), autor: r.autorMuestra })).sort(() => Math.random() - 0.5);
                    io.to(miSalaID).emit('faseVotacion', { rumores: rumoresParaVotar, decisorNombre: sala.victimaNombre, tiempo: 30 });
                    sala.timerVotacion = setTimeout(() => { castigarElegido(sala); }, 30000);
                }
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
            let ptsGanados = 20;
            const nombreReal = ganador.autorNombre;
            let msjEspecial = "";

            if (nombreReal === sala.abogadoNombre) {
                sala.puntajesPartida[sala.victimaNombre] -= 40;
                sala.puntajesPartida[sala.abogadoNombre] -= 40;
                db.run("UPDATE usuarios SET coins = coins - 40 WHERE usuario = ?", [sala.victimaNombre]);
                db.run("UPDATE usuarios SET coins = coins - 40 WHERE usuario = ?", [sala.abogadoNombre]);
                ptsGanados = -40; msjEspecial = "😈 ¡CAYÓ EN LA TRAMPA! La Víctima y el Abogado pierden 40 puntos.";
            } else {
                if (sala.abogadoNombre && sala.puntajesPartida[sala.abogadoNombre] !== undefined) {
                    sala.puntajesPartida[sala.victimaNombre] += 40;
                    sala.puntajesPartida[sala.abogadoNombre] += 40;
                    db.run("UPDATE usuarios SET coins = coins + 40 WHERE usuario = ?", [sala.victimaNombre]);
                    db.run("UPDATE usuarios SET coins = coins + 40 WHERE usuario = ?", [sala.abogadoNombre]);
                    msjEspecial = "👼 ¡EVADIÓ LA TRAMPA! La Víctima y el Abogado ganan 40 puntos extra.";
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
        
        io.to(sala.id).emit('finDePartidaTotal', { ganador: nombreGanador, meta: sala.metaPuntos, titulos: { toxico: elToxico.nombre, victima: blancoFacil.nombre }, mejorRumor: sala.mejorRumorPartida });
        sala.juegoEnCurso = false; io.emit('actualizarListaSalas');
    }

    socket.on('salirSala', () => {
        if (!miSalaID || !salas[miSalaID]) return;
        socket.leave(miSalaID);
        salas[miSalaID].jugadores = salas[miSalaID].jugadores.filter(j => j.id !== socket.id);
        if (salas[miSalaID].jugadores.length === 0) delete salas[miSalaID];
        miSalaID = null;
        socket.emit('vueltoAlDashboard');
    });

    socket.on('disconnect', () => { delete usuariosConectados[socket.id]; if(miUsuario) delete usuariosOnline[miUsuario]; });
});

// ============================================================================
// 🌐 ENRUTAMIENTO GENERAL
// ============================================================================
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'games', 'Rumor Game', 'public', 'index.html')); });
app.get('/exotic', (req, res) => { res.sendFile(path.join(__dirname, 'games', 'Exotic', 'public', 'index.html')); });

app.use((req, res, next) => {
    if (req.method !== 'GET' || req.url.startsWith('/socket.io') || req.url.startsWith('/api') || req.url.includes('.')) return next();
    res.sendFile(path.join(__dirname, 'games', 'Rumor Game', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`🔥 SERVIDOR RUMOR + EXOTIC ACTIVO EN PUERTO: ${PORT}`));
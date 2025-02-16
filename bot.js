const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

// ⚠️ Cambia esto a `true` si quieres que el bot solo te responda a ti
const MODO_PRUEBA_PERSONAL = false;

// Tu número de WhatsApp en formato internacional (sin "+", pero con código de país)
// Ejemplo: "+51 987654321" → "51987654321@c.us"
const NUMERO_PROPIETARIO = "51935711810@c.us";

// Estados de usuarios y última interacción
let estados = {};
let ultimosMensajes = {};

// Tiempo para volver a mostrar el mensaje de bienvenida (en días)
const DIAS_ESPERA_BIENVENIDA = 3;

client.on('qr', qr => {
    console.log('📱 Escanea este QR con tu WhatsApp para conectar el bot:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot de WhatsApp está listo y conectado.');
});

client.on('message', async message => {
    const chatId = message.from;

    // Ignorar mensajes de estados y grupos
    if (message.type === 'status' || message.from.includes('@g.us') || message.from.includes('broadcast')) {
        console.log(`🚫 Mensaje ignorado de estado/broadcast/grupo: ${message.body}`);
        return;
    }

    // 🛠 Solo responderte a ti si está activado el modo de prueba
    if (MODO_PRUEBA_PERSONAL && chatId !== NUMERO_PROPIETARIO) {
        console.log(`⚠️ MODO PRUEBA ACTIVADO: Ignorando mensaje de ${chatId}`);
        return;
    }

    console.log(`📩 Mensaje recibido de ${message.from}: ${message.body}`);

    let texto = message.body.trim().toLowerCase();

    // Verificar si el usuario ha interactuado recientemente
    let ultimaInteraccion = ultimosMensajes[chatId] || 0;
    let tiempoActual = Date.now();
    let diferenciaDias = (tiempoActual - ultimaInteraccion) / (1000 * 60 * 60 * 24);

    // Si es la primera vez o han pasado más de DIAS_ESPERA_BIENVENIDA, mostrar el mensaje de bienvenida
    if (!estados[chatId] || diferenciaDias >= DIAS_ESPERA_BIENVENIDA) {
        await client.sendMessage(chatId,
            "🎓 *¡Bienvenido al asistente de Maestrías de la Facultad de Educación!* 🤖\n" +
            "Seleccione la maestría que le interesa respondiendo con el número:\n" +
            "1️⃣ Didáctica de la Comunicación\n" +
            "2️⃣ Didáctica de la Matemática\n" +
            "🌀 Escriba *volver* en cualquier momento para regresar o *inicio* para empezar de nuevo."
        );
        estados[chatId] = { paso: 1 };
        ultimosMensajes[chatId] = tiempoActual;
        return;
    }

    let paso = estados[chatId].paso;

    // Reiniciar conversación
    if (texto === "inicio") {
        delete estados[chatId];
        await client.sendMessage(chatId, "🔄 Se ha reiniciado la conversación. Escriba *hola* para comenzar.");
        return;
    }

    // Volver al paso anterior con restricción
    if (texto === "volver") {
        if (paso > 1) {
            estados[chatId].paso -= 1;
            await client.sendMessage(chatId, "⏪ Has regresado al paso anterior. Continuemos...");
        } else {
            await client.sendMessage(chatId, "⚠️ Ya estás en el inicio. Usa *inicio* para comenzar de nuevo.");
        }
        return;
    }

    switch (paso) {
        case 1:
            if (texto === "1") {
                estados[chatId].maestria = "Didáctica de la Comunicación";
            } else if (texto === "2") {
                estados[chatId].maestria = "Didáctica de la Matemática";
            } else {
                await client.sendMessage(chatId, "❌ Opción inválida. Responda con 1 o 2.");
                return;
            }
            await client.sendMessage(chatId,
                `📘 Ha seleccionado la maestría en *${estados[chatId].maestria}*.\n` +
                "¿Qué información desea saber?\n" +
                "1️⃣ Requisitos\n" +
                "2️⃣ Costos\n" +
                "3️⃣ Modalidad de estudio\n" +
                "🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo."
            );
            estados[chatId].paso = 2;
            break;

        case 2:
            if (texto === "1") {
                await client.sendMessage(chatId,
                    "📑 *Requisitos para la maestría:*\n" +
                    "- Título profesional\n" +
                    "- Copia de DNI/Pasaporte\n" +
                    "- CV actualizado\n" +
                    "- Pago de matrícula\n" +
                    "🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo."
                );
            } else if (texto === "2") {
                await client.sendMessage(chatId,
                    "💰 *Costos de la maestría:*\n" +
                    "- Inscripción: S/. 250\n" +
                    "- Costo por ciclo: S/. 3,500\n" +
                    "- Duración: 4 ciclos\n" +
                    "🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo."
                );
            } else if (texto === "3") {
                await client.sendMessage(chatId,
                    "🎓 *Modalidad de estudio:*\n" +
                    "- Clases virtuales y presenciales\n" +
                    "- Horarios flexibles para profesionales\n" +
                    "🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo."
                );
            } else {
                await client.sendMessage(chatId, "❌ Opción inválida. Responda con 1, 2 o 3.");
                return;
            }
            estados[chatId].paso = 3;
            break;

        case 3:
            if (texto === "1") {
                await client.sendMessage(chatId,
                    "📌 Puede visitar nuestra página web para más información: https://posgrado.universidad.edu.pe\n" +
                    "También puede escribirnos al correo 📧 info@universidad.edu.pe\n" +
                    "🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo."
                );
            } else if (texto === "2") {
                await client.sendMessage(chatId, "😊 ¡Gracias por su consulta! Estamos para ayudarle.");
                delete estados[chatId]; // Finalizar conversación
            } else {
                await client.sendMessage(chatId, "❌ Opción inválida. Responda con 1 o 2.");
                return;
            }
            break;
    }
});

// Iniciar bot
client.initialize();

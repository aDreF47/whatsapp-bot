const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

const NUMERO_PROPIETARIO = "51935711810@c.us";
const MODO_PRUEBA_PERSONAL = false;
let estados = {};
let ultimosMensajes = {};
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

    if (message.type === 'status' || message.from.includes('@g.us') || message.from.includes('broadcast')) {
        console.log(`🚫 Mensaje ignorado de estado/broadcast/grupo: ${message.body}`);
        return;
    }

    if (MODO_PRUEBA_PERSONAL && chatId !== NUMERO_PROPIETARIO) {
        console.log(`⚠️ MODO PRUEBA ACTIVADO: Ignorando mensaje de ${chatId}`);
        return;
    }

    console.log(`📩 Mensaje recibido de ${message.from}: ${message.body}`);

    let texto = message.body.trim().toLowerCase();
    let ultimaInteraccion = ultimosMensajes[chatId] || 0;
    let tiempoActual = Date.now();
    let diferenciaDias = (tiempoActual - ultimaInteraccion) / (1000 * 60 * 60 * 24);

    if (!estados[chatId] || diferenciaDias >= DIAS_ESPERA_BIENVENIDA) {
        try {
            await client.sendMessage(chatId,
                "🎓 *¡Bienvenido al asistente de Maestrías de la Facultad de Educación!* 🤖\n" +
                "Seleccione la maestría que le interesa respondiendo con el número:\n" +
                "1️⃣ Didáctica de la Comunicación\n" +
                "2️⃣ Didáctica de la Matemática\n" +
                "🌀 Escriba *volver* en cualquier momento para regresar o *inicio* para empezar de nuevo."
            );
        } catch (error) {
            console.error("❌ Error al enviar mensaje de bienvenida:", error);
        }

        estados[chatId] = { paso: 1 };
        ultimosMensajes[chatId] = tiempoActual;
        return;
    }

    let paso = estados[chatId].paso;

    if (texto === "inicio") {
        delete estados[chatId];
        try {
            await client.sendMessage(chatId, "🔄 Se ha reiniciado la conversación. Escriba *hola* para comenzar.");
        } catch (error) {
            console.error("❌ Error al reiniciar la conversación:", error);
        }
        return;
    }

    if (texto === "volver") {
        if (paso > 1) {
            estados[chatId].paso -= 1;
            try {
                await client.sendMessage(chatId, "⏪ Has regresado al paso anterior. Continuemos...");
            } catch (error) {
                console.error("❌ Error al retroceder de paso:", error);
            }
        } else {
            try {
                await client.sendMessage(chatId, "⚠️ Ya estás en el inicio. Usa *inicio* para comenzar de nuevo.");
            } catch (error) {
                console.error("❌ Error en el mensaje de restricción:", error);
            }
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
                try {
                    await client.sendMessage(chatId, "❌ Opción inválida. Responda con 1 o 2.");
                } catch (error) {
                    console.error("❌ Error al validar opción:", error);
                }
                return;
            }
            try {
                await client.sendMessage(chatId,
                    `📘 Ha seleccionado la maestría en *${estados[chatId].maestria}*.\n` +
                    "¿Qué información desea saber?\n" +
                    "1️⃣ Requisitos\n" +
                    "2️⃣ Costos\n" +
                    "3️⃣ Modalidad de estudio\n" +
                    "🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo."
                );
            } catch (error) {
                console.error("❌ Error al enviar opciones de maestría:", error);
            }
            estados[chatId].paso = 2;
            break;

        case 2:
            let respuestas = {
                "1": "📑 *Requisitos para la maestría:*\n- Título profesional\n- Copia de DNI/Pasaporte\n- CV actualizado\n- Pago de matrícula",
                "2": "💰 *Costos de la maestría:*\n- Inscripción: S/. 250\n- Costo por ciclo: S/. 3,500\n- Duración: 4 ciclos",
                "3": "🎓 *Modalidad de estudio:*\n- Clases virtuales y presenciales\n- Horarios flexibles para profesionales"
            };
        
            if (respuestas[texto]) {
                try {
                    await client.sendMessage(chatId, respuestas[texto] + "\n\n🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo.");
                } catch (error) {
                    console.error("❌ Error al enviar respuesta:", error);
                }
        
                // Ahora preguntar si desea más información
                try {
                    await client.sendMessage(chatId,
                        "📢 *¿Desea más información?*\n" +
                        "1️⃣ Sí, más detalles\n" +
                        "2️⃣ No, gracias"
                    );
                } catch (error) {
                    console.error("❌ Error al enviar la pregunta de más información:", error);
                }
        
                estados[chatId].paso = 3;
            } else {
                try {
                    await client.sendMessage(chatId, "❌ Opción inválida. Responda con 1, 2 o 3.");
                } catch (error) {
                    console.error("❌ Error en validación:", error);
                }
            }
            break;
        
        case 3:
            if (texto === "1") { // Si el usuario desea más información
                try {
                    await client.sendMessage(chatId,
                        "📌 Puede visitar nuestra página web para más información: https://posgradoeducacion.unmsm.edu.pe/programas/maestrias\n" +
                        "📧 También puede escribirnos al correo: upg.educacion@unmsm.edu.pe\n" +
                        "☎️ O llamarnos al número: +51 987654321\n\n" +
                        "🌀 Escriba *volver* para regresar o *inicio* para empezar de nuevo."
                    );
                } catch (error) {
                    console.error("❌ Error al enviar detalles adicionales:", error);
                }
            } else if (texto === "2") { // Si el usuario ya no desea más información
                try {
                    await client.sendMessage(chatId, "😊 ¡Gracias por su consulta! Estamos para ayudarle.");
                } catch (error) {
                    console.error("❌ Error al finalizar la conversación:", error);
                }
                delete estados[chatId]; // Finalizar la conversación
            } else {
                try {
                    await client.sendMessage(chatId, "❌ Opción inválida. Responda con 1 o 2.");
                } catch (error) {
                    console.error("❌ Error en validación de opciones finales:", error);
                }
            }
            break;
            
    }
});

// Reiniciar en caso de desconexión
client.on('disconnected', (reason) => {
    console.log(`⚠️ Cliente desconectado. Razón: ${reason}`);
    console.log("🔄 Reiniciando cliente...");
    client.initialize();
});

// Iniciar bot
client.initialize();

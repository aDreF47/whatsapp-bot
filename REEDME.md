
---

### 📌 **README.md**  
```markdown
# 🤖 Bot de WhatsApp con `whatsapp-web.js` y `PM2`

Este bot de WhatsApp responde automáticamente a consultas sobre programas de **maestría y posgrado**. Utiliza `whatsapp-web.js` y se ejecuta de forma permanente con `PM2`.

---

## 📌 1. Requisitos
Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- **[Node.js](https://nodejs.org/)** (versión LTS recomendada)
- **[Git](https://git-scm.com/)** (opcional, pero recomendado)
- **WhatsApp en tu teléfono** para escanear el código QR

---

## 📌 2. Instalación

### 1️⃣ **Crear la carpeta del proyecto**
```powershell
mkdir whatsapp-bot
cd whatsapp-bot
```

### 2️⃣ **Inicializar el proyecto**
```powershell
npm init -y
```

### 3️⃣ **Instalar dependencias**
```powershell
npm install whatsapp-web.js qrcode-terminal
```

**(Opcional) Si aparecen advertencias, ejecuta:**
```powershell
npm audit fix --force
```

---

## 📌 3. Configurar el bot

### 1️⃣ **Crear el archivo `bot.js`**
En la carpeta `whatsapp-bot`, crea un archivo `bot.js` y copia el siguiente código:

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('📱 Escanea este QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot de WhatsApp está listo y conectado.');
});

client.on('message', async message => {
    console.log(`📩 Mensaje recibido: ${message.body}`);

    let texto = message.body.toLowerCase();

    if (texto.includes('maestría') || texto.includes('posgrado')) {
        message.reply('🎓 ¡Hola! Ofrecemos programas de posgrado en diferentes áreas. ¿En qué maestría estás interesado?');
    } 
    else if (texto.includes('requisitos')) {
        message.reply('📋 Para inscribirte en un programa de maestría, necesitas:\n- Título profesional\n- DNI o pasaporte\n- CV actualizado\n- Pago de matrícula\n\nSi necesitas más información, dime "contacto".');
    } 
    else if (texto.includes('contacto')) {
        message.reply('📞 Puedes contactarnos al WhatsApp +51 987654321 o al correo info@universidad.edu.pe');
    } 
    else if (texto.includes('costos') || texto.includes('precio')) {
        message.reply('💰 Los costos varían según el programa. ¿En qué especialidad estás interesado?');
    } 
    else {
        message.reply('🤖 No entendí tu mensaje. Puedes preguntar sobre "maestría", "posgrado", "requisitos" o "costos".');
    }
});

client.initialize();
```

---

## 📌 4. Ejecutar el bot

Ejecuta el bot por primera vez:
```powershell
node bot.js
```

📌 **Escanea el código QR** con tu WhatsApp.  
✅ Una vez escaneado, el bot responderá automáticamente a los mensajes.  

---

## 📌 5. Mantener el bot funcionando 24/7 con `PM2`

### 1️⃣ **Instalar `PM2`**
```powershell
npm install -g pm2
```

### 2️⃣ **Ejecutar el bot en segundo plano**
```powershell
pm2 start bot.js --name whatsapp-bot
```

### 3️⃣ **Verificar que el bot está corriendo**
```powershell
pm2 list
```

Si aparece `whatsapp-bot` con estado `online`, significa que está funcionando correctamente.

### 4️⃣ **Ver logs del bot**
Si quieres ver los mensajes que el bot recibe y responde:
```powershell
pm2 logs whatsapp-bot
```
Para salir de los logs, presiona `CTRL + C`.

---
### 5️⃣ **Hacer que el bot se inicie automáticamente después de reiniciar la PC**
Como pm2 startup no funciona en Windows, podemos usar una tarea programada.
🔹 1. Crear un script de inicio

1️⃣ Abre Bloc de notas y copia este código:
```powersblovk de notas (start_pm2.bat)
@echo off
pm2 resurrect
```

2️⃣ Guarda el archivo como start_pm2.bat en la carpeta C:\Users\nando\whatsapp-bot.

🔹 2. Agregar PM2 al inicio con el Programador de Tareas

1️⃣ Presiona Win + R, escribe taskschd.msc y presiona Enter.
2️⃣ En el Programador de tareas, haz clic en Crear tarea...
3️⃣ En la pestaña General:

Nombre: Iniciar PM2

Marcar la opción: Ejecutar con los privilegios más altos
4️⃣ En la pestaña Disparadores, haz clic en Nuevo:

Elegir: Al iniciar sesión
5️⃣ En la pestaña Acciones, haz clic en Nueva... y selecciona:

Iniciar un programa

En Programa o script, selecciona el archivo start_pm2.bat
6️⃣ Guarda la tarea y reinicia la PC para probar.

🔹 3. Verificar si funciona

Después de reiniciar, abre PowerShell y ejecuta:
```powershell
@echo off
pm2 resu
```
Si tu bot aparece en estado online, significa que ahora se ejecuta automáticamente al iniciar Windows. 🚀
---

## 📌 6. Administrar el bot con `PM2`

✔ **Para detener el bot temporalmente:**
```powershell
pm2 stop whatsapp-bot
```

✔ **Para reiniciar el bot:**
```powershell
pm2 restart whatsapp-bot
```

✔ **Para eliminar el bot por completo:**
```powershell
pm2 delete whatsapp-bot
```

---

## 📌 7. Solución de problemas

2️⃣ Verifica la política de ejecución actual
En la terminal de PowerShell, ejecuta:
```powershell
Get-ExecutionPolicy
```
Si devuelve Restricted, significa que los scripts están bloqueados.

1️⃣ **Si `PM2` no se ejecuta en PowerShell**  
Ejecuta este comando en el direcotior del proyecto para permitir scripts en Windows:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Luego intenta ejecutar `pm2 start bot.js` nuevamente.

2️⃣ **Si necesitas volver a escanear el código QR**  
Borra la sesión guardada y reinicia el bot:
```powershell
rm -rf .wwebjs_auth
node bot.js
```
---

## 📌 8. ¿Qué sigue? 🚀

Ahora que el bot está funcionando, puedes mejorarlo añadiendo:
- 📂 **Envío de archivos o imágenes** automáticamente.
- 📅 **Mensajes programados** con `setTimeout` o `cron`.
- 🔗 **Conexión con una base de datos** para personalizar respuestas.
- 🧠 **Integración con IA** (como ChatGPT) para respuestas más avanzadas.

📌 **¿Necesitas ayuda para mejorar el bot?** ¡Contáctame! 🚀
```

---

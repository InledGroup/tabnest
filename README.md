# <img src="public/tabnest.png" width="40" height="40" align="center" /> TabNest

<p align="center">
  <img src="public/tabnest-bg.png" width="100%" alt="TabNest Preview" />
</p>

<p align="center">
  <strong>TabNest</strong> es una extensión de navegador (Chrome, Edge, Firefox) que transforma tu página de "Nueva Pestaña" en un centro de control multimedia y productivo con estética <strong>Glassmorphism (Efecto Cristal)</strong>.
</p>

<p align="center">
  <a href="#-características">Características</a> •
  <a href="#-instalación">Instalación</a> •
  <a href="#-tecnologías">Tecnologías</a> •
  <a href="#-legal">Legal</a>
</p>

---

## 🚀 Características

### 📺 TV y Radio en Vivo
- **Sintonizador TDT:** Acceso a más de 600 canales de TV y 900 emisoras de radio gracias a [TDTChannels](https://www.tdtchannels.com/).
- **Guía de Programación (EPG):** Consulta qué están echando "Ahora" y "A continuación" directamente en las tarjetas.
- **Reproductor Integrado:** Soporte nativo para m3u8 (HLS) y modo iframe para webs oficiales.

### 📰 Feed de Noticias
- **Scroll Infinito:** Carga dinámica de noticias de los principales medios (El País, ABC, El Mundo, etc.).
- **RSS Personalizable:** Añade tus propias URLs de feeds RSS para estar siempre informado.
- **Visual:** Noticias con imágenes de portada y extractos legibles.

### 🔖 Súper Marcadores
- **Colección Ready-to-use:** Más de 100 marcadores predeterminados organizados en 29 categorías (IA, Correo, Diseño, etc.).
- **Personalización Total:** Crea tus propias carpetas con colores y emojis personalizados desde el teclado.
- **Vista de Acordeón:** Mantén tu panel limpio desplegando solo lo que necesitas.

### 🎨 Personalización y Estética
- **Diseño Fluent:** Inspirado en el sistema visual de Microsoft, con transparencias, desenfoques y sombras 3D.
- **Fondos Dinámicos:** Galería de fondos incluida con opción de subida local o por URL y rotación automática.
- **Multi-idioma:** Interfaz disponible íntegramente en **Español** e **Inglés**.

---

## 🛠 Instalación

Actualmente, puedes instalar TabNest siguiendo estos pasos (Modo Desarrollador):

1. **Descarga:** Ve a la sección de [Releases](https://github.com/tu-usuario/tabnest/releases) y descarga el archivo `tabnest-extension.zip`.
2. **Descomprime:** Extrae el contenido en una carpeta en tu ordenador.
3. **Navegador:** 
   - Abre Chrome o Edge y ve a `chrome://extensions`.
   - Activa el **"Modo de desarrollador"** (esquina superior derecha).
   - Haz clic en **"Cargar descomprimida"** (Load unpacked).
   - Selecciona la carpeta donde extrajiste el contenido.
4. **¡Listo!:** Abre una nueva pestaña y disfruta de TabNest.

---

## 💻 Tecnologías

Este proyecto utiliza un stack moderno para asegurar rendimiento y fluidez:

- **React 19 + TypeScript:** Lógica de componentes robusta.
- **Vite:** Build ultra-rápido.
- **Tailwind CSS 4:** Estilizado moderno y responsive.
- **Framer Motion:** Animaciones fluidas y transiciones de estado.
- **hls.js:** Motor de reproducción para streaming de video.
- **Lucide React:** Set de iconos minimalista.

---

## ⚖️ Legal

TabNest es una herramienta técnica que facilita el acceso a contenidos públicos.

- **Contenidos:** No alojamos ni retransmitimos ninguna señal. Los datos de TV/Radio provienen de TDTChannels.
- **Privacidad:** No recopilamos datos. Todo se almacena localmente en tu navegador (`chrome.storage` / `browser.storage`).
- **Código Abierto:** Proyecto desarrollado para la comunidad.

---

<p align="center">
  Desarrollado con ❤️ para <a href="https://inled.es">inled.es</a>
</p>

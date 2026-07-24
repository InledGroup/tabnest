import type { Bookmark, Folder } from '../hooks/useBookmarks';

interface DropItem {
    text: string;
    url: string;
    shortcut?: string;
}

const dropdownData: Record<string, DropItem[]> = {
    dropdown1: [
        { text: "Gmail", url: "https://mail.google.com/", shortcut: "gm" },
        { text: "Outlook", url: "https://outlook.live.com/mail/0/", shortcut: "ol" },
        { text: "Yahoo! Mail", url: "https://es.mail.yahoo.com" },
        { text: "AOL Mail", url: "https://login.aol.com/?src=mail" },
        { text: "Proton Mail", url: "https://mail.proton.me/", shortcut: "pm" },
        { text: "iCloud Mail", url: "https://www.icloud.com/mail/" },
        { text: "App de correo predeterminada de tu sistema", url: "mailto:" }
    ],
    dropdown2: [
        { text: "Documentos de Google", url: "https://docs.google.com/document/u/0/", shortcut: "gd" },
        { text: "Word", url: "https://m365.cloud.microsoft/launch/word?auth=1", shortcut: "wd" },
        { text: "WPS Docs", url: "https://docs.wps.com/launch/docs" },
        { text: "Proton Docs", url: "https://docs.proton.me/" },
        { text: "iCloud Pages", url: "https://www.icloud.com/pages/" }
    ],
    dropdown3: [
        { text: "Presentaciones de Google", url: "https://docs.google.com/presentation/u/0/", shortcut: "gp" },
        { text: "PowerPoint", url: "https://m365.cloud.microsoft/launch/powerpoint?auth=1", shortcut: "pp" },
        { text: "WPS Slides", url: "https://docs.wps.com/launch/slides" },
        { text: "Canva", url: "https://www.canva.com/", shortcut: "cv" },
        { text: "Adobe Express", url: "https://new.express.adobe.com/" },
        { text: "Genially", url: "https://genially.com/es/" },
        { text: "Prezi", url: "https://prezi.com/es/" },
        { text: "iCloud Keynote", url: "https://www.icloud.com/keynote/" }
    ],
    dropdown4: [
        { text: "Hojas de cálculo de Google", url: "https://docs.google.com/spreadsheets/u/0/", shortcut: "gs" },
        { text: "Excel", url: "https://m365.cloud.microsoft/launch/excel?auth=1", shortcut: "ex" },
        { text: "WPS Sheets", url: "https://docs.wps.com/launch/sheets" },
        { text: "iCloud Numbers", url: "https://www.icloud.com/numbers/" }
    ],
    dropdown5: [
        { text: "Formularios de Google", url: "https://docs.google.com/forms/u/0/", shortcut: "gf" },
        { text: "Microsoft Forms", url: "https://forms.office.com/" },
        { text: "WPS Forms", url: "https://docs.wps.com/launch/forms" }
    ],
    dropdown6: [
        { text: "Google Drive", url: "https://drive.google.com/drive/", shortcut: "dr" },
        { text: "OneDrive", url: "https://onedrive.live.com/", shortcut: "od" },
        { text: "Dropbox", url: "https://www.dropbox.com/es_ES/" },
        { text: "WPS Drive", url: "https://docs.wps.com/drive?lang=es-ES" },
        { text: "Proton Drive", url: "https://drive.proton.me/" },
        { text: "iCloud Drive", url: "https://www.icloud.com/iclouddrive/" }
    ],
    dropdown7: [
        { text: "ChatGPT", url: "https://chatgpt.com", shortcut: "cg" },
        { text: "Perplexity", url: "https://www.perplexity.ai/", shortcut: "px" },
        { text: "Claude de Anthropic", url: "https://claude.ai/", shortcut: "cl" },
        { text: "Microsoft Copilot", url: "https://copilot.microsoft.com/", shortcut: "co" },
        { text: "Gemini", url: "https://gemini.google.com/", shortcut: "ge" },
        { text: "Deepseek", url: "https://chat.deepseek.com/", shortcut: "ds" },
        { text: "Kimi AI", url: "https://kimi.ai/" },
        { text: "Qwen ML", url: "https://chat.qwen.ai/" },
        { text: "Mistral", url: "https://chat.mistral.ai/chat" },
        { text: "Groq", url: "https://groq.com/" },
        { text: "Grok", url: "https://grok.com/" },
        { text: "Adobe Firefly", url: "https://firefly.adobe.com/" },
        { text: "Komo AI", url: "https://komo.ai/" },
        { text: "DuckDuckGo AI", url: "https://duck.ai" },
        { text: "Elicit", url: "https://elicit.com/" },
        { text: "Phind", url: "https://www.phind.com/search?home=true" },
        { text: "Microsoft Designer", url: "https://designer.microsoft.com/" },
        { text: "Hugging Face", url: "https://huggingface.co/" },
        { text: "Notebook LM", url: "https://notebooklm.google.com/" }
    ],
    dropdown8: [
        { text: "Productos de Google", url: "https://about.google/products/" },
        { text: "Productos de Microsoft", url: "https://www.microsoft.com/es-es/microsoft-products-and-apps/" },
        { text: "Aplicaciones y páginas de Adobe", url: "https://www.adobe.com/apps" }
    ],
    dropdown10: [
        { text: "Google Maps", url: "https://www.google.com/maps?authuser=0", shortcut: "gm" },
        { text: "Bing Maps", url: "https://www.bing.com/maps?" },
        { text: "Open Street Map", url: "https://www.openstreetmap.org/#map=" }
    ],
    dropdown11: [
        { text: "Play Store", url: "https://play.google.com", shortcut: "ps" },
        { text: "App Store", url: "https://www.apple.com/app-store/" },
        { text: "Chrome Web Store", url: "https://chromewebstore.google.com/" },
        { text: "Add-Ons de Mozilla", url: "https://addons.mozilla.org/es/firefox/" }
    ],
    dropdown12: [
        { text: "Google Meet", url: "https://meet.google.com/", shortcut: "gm" },
        { text: "Microsoft Teams", url: "https://teams.live.com/v2/", shortcut: "tm" },
        { text: "Skype", url: " https://web.skype.com/" },
        { text: "Zoom", url: "https://zoom.us/es", shortcut: "zm" },
        { text: "Jitsi Meet", url: "https://meet.jit.si/" },
        { text: "Brave Talk", url: "https://talk.brave.com/" }
    ],
    dropdown13: [
        { text: "Google Calendar", url: "https://calendar.google.com/", shortcut: "gc" },
        { text: "Calendario de Outlook", url: "https://outlook.live.com/calendar/" },
        { text: "Proton Calendar", url: "https://calendar.proton.me/" },
        { text: "iCloud Calendar", url: "https://www.icloud.com/calendar/" }
    ],
    dropdown14: [
        { text: "WhatsApp Web", url: "https://web.whatsapp.com/", shortcut: "wa" },
        { text: "Telegram Web", url: "https://web.telegram.org/a/", shortcut: "tg" },
        { text: "Google Chat", url: "https://calendar.google.com/" }
    ],
    dropdown15: [
        { text: "YouTube", url: "https://www.youtube.com/", shortcut: "yt" },
        { text: "TikTok", url: "https://www.tiktok.com/es/", shortcut: "tt" },
        { text: "Vimeo", url: "https://vimeo.com/es/" }
    ],
    dropdown16: [
        { text: "YouTube Music", url: "https://music.youtube.com/", shortcut: "ym" },
        { text: "Spotify", url: "https://www.spotify.com/", shortcut: "sk" },
        { text: "Deezer", url: "https://www.deezer.com/" },
        { text: "Apple Music", url: "https://music.apple.com/es/new" }
    ],
    dropdown17: [
        { text: "Google News", url: "https://news.google.com/", shortcut: "gn" },
        { text: "Microsoft Start", url: "https://www.bing.com/news/" },
        { text: "MSN", url: "https://www.msn.com/es-es" },
        { text: "El País", url: "https://elpais.com/" },
        { text: "El Mundo", url: "https://www.elmundo.es/" },
        { text: "ABC", url: "https://www.abc.es/" },
        { text: "La Razón", url: "https://www.larazon.es/" },
        { text: "Libertad Digital", url: "https://www.libertaddigital.com/" },
        { text: "El Debate", url: "https://www.eldebate.com/" }
    ],
    dropdown18: [
        { text: "TDT Channels", url: "https://play.tdtchannels.com/television/", shortcut: "td" },
        { text: "Tivify", url: "https://www.tivify.tv/inicio" },
        { text: "RTVE", url: "https://www.rtve.es/play/", shortcut: "rt" },
        { text: "Atresplayer", url: "https://www.atresplayer.com/" },
        { text: "Mediaset", url: "https://www.mitele.es/directo/" }
    ],
    dropdown19: [
        { text: "RadioPlayer", url: "https://radioplayerespana.es/player.php", shortcut: "rp" },
        { text: "RNE", url: "https://www.rtve.es/play/radio/rne/" },
        { text: "COPE", url: "https://www.cope.es/" },
        { text: "Onda Cero", url: "https://www.ondacero.es/" },
        { text: "Radio María", url: "https://radiomaria.es/" },
        { text: "esRadio", url: "https://esradio.libertaddigital.com/directo.html" },
        { text: "Cadena SER", url: "https://cadenaser.com/" },
        { text: "Europa FM", url: "https://www.europafm.com/" },
        { text: "Melodía FM", url: "https://www.melodia-fm.com/" },
        { text: "Kiss FM", url: "https://www.kissfm.es/player/" },
        { text: "Los 40", url: "https://los40.com/" },
        { text: "Radio Clásica", url: "https://www.rtve.es/radio/radioclasica/" }
    ],
    dropdown20: [
        { text: "LinkedIn", url: "https://www.linkedin.com/", shortcut: "li" },
        { text: "Facebook", url: "https://www.facebook.com/", shortcut: "fb" },
        { text: "X", url: "https://x.com/", shortcut: "x" },
        { text: "Bluesky", url: "https://bsky.app/", shortcut: "bs" },
        { text: "Instagram", url: "https://www.instagram.com/", shortcut: "ig" },
        { text: "Stack Overflow", url: "https://stackoverflow.com/" },
        { text: "Forocoches", url: "https://forocoches.com/foro/" },
        { text: "Reddit", url: "https://www.reddit.com/", shortcut: "re" }
    ],
    dropdown22: [
        { text: "RAE", url: "https://dle.rae.es/", shortcut: "ra" }
    ],
    dropdown24: [
        { text: "Imágenes de Google ", url: "https://www.google.com/imghp?hl=es&tab=ri&ogbl", shortcut: "gi" },
        { text: "Bing", url: "https://www.bing.com/images/feed?form=Z9LH" },
        { text: "Pinterest", url: "https://www.pinterest.es/" }
    ],
    dropdown25: [
        { text: "SpeedTest", url: "https://www.speedtest.net/es", shortcut: "st" }
    ],
    dropdown26: [
        { text: "VirusTotal", url: "https://www.virustotal.com/gui/home/upload", shortcut: "vt" }
    ],
    dropdown27: [
        { text: "Traductor de Google", url: "https://translate.google.com/?sl=es&tl=en&op=translate", shortcut: "gt" },
        { text: "Traductor de Microsoft", url: "https://www.bing.com/translator?ref=TThis&text=&from=en&to=es" },
        { text: "Reverso", url: "https://www.reverso.net/traducci%C3%B3n-texto" },
        { text: "Deepl", url: "https://www.deepl.com/es/translator", shortcut: "dl" }
    ],
    dropdown29: [
        { text: "inled.es", url: "http://inled.es", shortcut: "il" },
        { text: "TEA Friendly", url: "https://teafriendly.inled.es" },
        { text: "DSIGN", url: "https://inled.es/dsign" }
    ],
    dropdown30: [
        { text: "LifeAt", url: "https://lifeat.io", shortcut: "la" }
    ],
    dropdown31: [
        { text: "Clipchamp", url: "https://app.clipchamp.com/", shortcut: "cc" },
        { text: "Capcut", url: "https://www.capcut.com/my-edit" }
    ],
    dropdown32: [
        { text: "Wordpress", url: "https://wordpress.com/es/" },
        { text: "Wix", url: "https://manage.wix.com/dashboard/" }
    ],
    dropdown34: [
        { text: "IlovePDF", url: "https://www.ilovepdf.com/es", shortcut: "lp" },
        { text: "WPS PDF Tools", url: "https://pdf.wps.com/" }
    ],
};

const folderConfig: Record<string, { title: string, color: string, emoji: string, shortcut: string }> = {
    dropdown1:  { title: 'Correo',        color: '#ef4444', emoji: '📧', shortcut: 'e' },
    dropdown2:  { title: 'Documentos',    color: '#3b82f6', emoji: '📝', shortcut: 'd' },
    dropdown3:  { title: 'Presentaciones', color: '#f59e0b', emoji: '📊', shortcut: 'p' },
    dropdown4:  { title: 'Hojas de cálculo', color: '#10b981', emoji: '📈', shortcut: 's' },
    dropdown5:  { title: 'Formularios',   color: '#8b5cf6', emoji: '📋', shortcut: 'f' },
    dropdown6:  { title: 'Nube',          color: '#6366f1', emoji: '☁️', shortcut: 'c' },
    dropdown7:  { title: 'IA',            color: '#ec4899', emoji: '🤖', shortcut: 'a' },
    dropdown8:  { title: 'Productos',     color: '#14b8a6', emoji: '📦', shortcut: 'pd' },
    dropdown10: { title: 'Mapas',         color: '#ef4444', emoji: '📍', shortcut: 'm' },
    dropdown11: { title: 'Tiendas',       color: '#3b82f6', emoji: '🛍️', shortcut: 'as' },
    dropdown12: { title: 'Reuniones',     color: '#f59e0b', emoji: '🎥', shortcut: 'mt' },
    dropdown13: { title: 'Calendario',    color: '#10b981', emoji: '📅', shortcut: 'ca' },
    dropdown14: { title: 'Mensajería',    color: '#8b5cf6', emoji: '💬', shortcut: 'ms' },
    dropdown15: { title: 'Vídeo',         color: '#6366f1', emoji: '📺', shortcut: 'v' },
    dropdown16: { title: 'Música',        color: '#ec4899', emoji: '🎵', shortcut: 'mu' },
    dropdown17: { title: 'Noticias',      color: '#14b8a6', emoji: '📰', shortcut: 'n' },
    dropdown18: { title: 'TV Online',     color: '#ef4444', emoji: '📡', shortcut: 'tv' },
    dropdown19: { title: 'Radio',         color: '#3b82f6', emoji: '📻', shortcut: 'r' },
    dropdown20: { title: 'Social',        color: '#f59e0b', emoji: '🌟', shortcut: 'so' },
    dropdown22: { title: 'Diccionario',   color: '#10b981', emoji: '📖', shortcut: 'di' },
    dropdown24: { title: 'Imágenes',      color: '#8b5cf6', emoji: '🖼️', shortcut: 'im' },
    dropdown25: { title: 'Velocidad',     color: '#6366f1', emoji: '⚡', shortcut: 'sp' },
    dropdown26: { title: 'Seguridad',     color: '#ec4899', emoji: '🛡️', shortcut: 'se' },
    dropdown27: { title: 'Traductor',     color: '#14b8a6', emoji: '🌐', shortcut: 'tr' },
    dropdown29: { title: 'Proyectos',     color: '#ef4444', emoji: '🚀', shortcut: 'pj' },
    dropdown30: { title: 'LifeAt',        color: '#3b82f6', emoji: '🏠', shortcut: 'la' },
    dropdown31: { title: 'Edición',       color: '#f59e0b', emoji: '🎬', shortcut: 'ed' },
    dropdown32: { title: 'Web Dev',       color: '#10b981', emoji: '💻', shortcut: 'wd' },
    dropdown34: { title: 'PDF',           color: '#8b5cf6', emoji: '📄', shortcut: 'pf' },
};

export const DEFAULT_FOLDERS: Folder[] = Object.keys(dropdownData).map(key => ({
    id: `def-${key}`,
    title: folderConfig[key]?.title || key,
    color: folderConfig[key]?.color || '#3b82f6',
    emoji: folderConfig[key]?.emoji || '📂',
    shortcut: folderConfig[key]?.shortcut || ''
}));

export const DEFAULT_BOOKMARKS: Bookmark[] = Object.keys(dropdownData).flatMap(key => 
    dropdownData[key].map((item, idx) => ({
        id: `def-${key}-b${idx}`,
        title: item.text,
        url: item.url,
        parentId: `def-${key}`,
        shortcut: item.shortcut || ''
    }))
);

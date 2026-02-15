import type { Bookmark, Folder } from '../hooks/useBookmarks';

const dropdownData: Record<string, { text: string, url: string }[]> = {
    dropdown1: [
        { text: "Gmail", url: "https://mail.google.com/" },
        { text: "Outlook", url: "https://outlook.live.com/mail/0/" },
        { text: "Yahoo! Mail", url: "https://es.mail.yahoo.com" },
        { text: "AOL Mail", url: "https://login.aol.com/?src=mail" },
        { text: "Proton Mail", url: "https://mail.proton.me/" },
        { text: "iCloud Mail", url: "https://www.icloud.com/mail/" },
        { text: "App de correo predeterminada de tu sistema", url: "mailto:" }
    ],
    dropdown2: [
        { text: "Documentos de Google", url: "https://docs.google.com/document/u/0/" },
        { text: "Word", url: "https://m365.cloud.microsoft/launch/word?auth=1" },
        { text: "WPS Docs", url: "https://docs.wps.com/launch/docs" },
        { text: "Proton Docs", url: "https://docs.proton.me/" },
        { text: "iCloud Pages", url: "https://www.icloud.com/pages/" }
    ],
    dropdown3: [
        { text: "Presentaciones de Google", url: "https://docs.google.com/presentation/u/0/" },
        { text: "PowerPoint", url: "https://m365.cloud.microsoft/launch/powerpoint?auth=1" },
        { text: "WPS Slides", url: "https://docs.wps.com/launch/slides" },
        { text: "Canva", url: "https://www.canva.com/" },
        { text: "Adobe Express", url: "https://new.express.adobe.com/" },
        { text: "Genially", url: "https://genially.com/es/" },
        { text: "Prezi", url: "https://prezi.com/es/" },
        { text: "iCloud Keynote", url: "https://www.icloud.com/keynote/" }
    ],
    dropdown4: [
        { text: "Hojas de cálculo de Google", url: "https://docs.google.com/spreadsheets/u/0/" },
        { text: "Excel", url: "https://m365.cloud.microsoft/launch/excel?auth=1" },
        { text: "WPS Sheets", url: "https://docs.wps.com/launch/sheets" },
        { text: "iCloud Numbers", url: "https://www.icloud.com/numbers/" }
    ],
    dropdown5: [
        { text: "Formularios de Google", url: "https://docs.google.com/forms/u/0/" },
        { text: "Microsoft Forms", url: "https://forms.office.com/" },
        { text: "WPS Forms", url: "https://docs.wps.com/launch/forms" }
    ],
    dropdown6: [
        { text: "Google Drive", url: "https://drive.google.com/drive/" },
        { text: "OneDrive", url: "https://onedrive.live.com/" },
        { text: "Dropbox", url: "https://www.dropbox.com/es_ES/" },
        { text: "WPS Drive", url: "https://docs.wps.com/drive?lang=es-ES" },
        { text: "Proton Drive", url: "https://drive.proton.me/" },
        { text: "iCloud Drive", url: "https://www.icloud.com/iclouddrive/" }
    ],
    dropdown7: [
        { text: "ChatGPT", url: "https://chatgpt.com" },
        { text: "Perplexity", url: "https://www.perplexity.ai/" },
        { text: "Claude de Anthropic", url: "https://claude.ai/" },
        { text: "Microsoft Copilot", url: "https://copilot.microsoft.com/" },
        { text: "Gemini", url: "https://gemini.google.com/" },
        { text: "Deepseek", url: "https://chat.deepseek.com/" },
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
        { text: "Google Maps", url: "https://www.google.com/maps?authuser=0" },
        { text: "Bing Maps", url: "https://www.bing.com/maps?" },
        { text: "Open Street Map", url: "https://www.openstreetmap.org/#map=" }
    ],
    dropdown11: [
        { text: "Play Store", url: "https://play.google.com" },
        { text: "App Store", url: "https://www.apple.com/app-store/" },
        { text: "Chrome Web Store", url: "https://chromewebstore.google.com/" },
        { text: "Add-Ons de Mozilla", url: "https://addons.mozilla.org/es/firefox/" }
    ],
    dropdown12: [
        { text: "Google Meet", url: "https://meet.google.com/" },
        { text: "Microsoft Teams", url: "https://teams.live.com/v2/" },
        { text: "Skype", url: " https://web.skype.com/" },
        { text: "Zoom", url: "https://zoom.us/es" },
        { text: "Jitsi Meet", url: "https://meet.jit.si/" },
        { text: "Brave Talk", url: "https://talk.brave.com/" }
    ],
    dropdown13: [
        { text: "Google Calendar", url: "https://calendar.google.com/" },
        { text: "Calendario de Outlook", url: "https://outlook.live.com/calendar/" },
        { text: "Proton Calendar", url: "https://calendar.proton.me/" },
        { text: "iCloud Calendar", url: "https://www.icloud.com/calendar/" }
    ],
    dropdown14: [
        { text: "WhatsApp Web", url: "https://web.whatsapp.com/" },
        { text: "Telegram Web", url: "https://web.telegram.org/a/" },
        { text: "Google Chat", url: "https://calendar.google.com/" }
    ],
    dropdown15: [
        { text: "YouTube", url: "https://www.youtube.com/" },
        { text: "TikTok", url: "https://www.tiktok.com/es/" },
        { text: "Vimeo", url: "https://vimeo.com/es/" }
    ],
    dropdown16: [
        { text: "YouTube Music", url: "https://music.youtube.com/" },
        { text: "Spotify", url: "https://www.spotify.com/" },
        { text: "Deezer", url: "https://www.deezer.com/" },
        { text: "Apple Music", url: "https://music.apple.com/es/new" }
    ],
    dropdown17: [
        { text: "Google News", url: "https://news.google.com/" },
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
        { text: "TDT Channels", url: "https://play.tdtchannels.com/television/" },
        { text: "Tivify", url: "https://www.tivify.tv/inicio" },
        { text: "RTVE", url: "https://www.rtve.es/play/" },
        { text: "Atresplayer", url: "https://www.atresplayer.com/" },
        { text: "Mediaset", url: "https://www.mitele.es/directo/" }
    ],
    dropdown19: [
        { text: "RadioPlayer", url: "https://radioplayerespana.es/player.php" },
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
        { text: "LinkedIn", url: "https://www.linkedin.com/" },
        { text: "Facebook", url: "https://www.facebook.com/" },
        { text: "X", url: "https://x.com/" },
        { text: "Bluesky", url: "https://bsky.app/" },
        { text: "Instagram", url: "https://www.instagram.com/" },
        { text: "Stack Overflow", url: "https://stackoverflow.com/" },
        { text: "Forocoches", url: "https://forocoches.com/foro/" },
        { text: "Reddit", url: "https://www.reddit.com/" }
    ],
    dropdown22: [
        { text: "RAE", url: "https://dle.rae.es/" }
    ],
    dropdown24: [
        { text: "Imágenes de Google ", url: "https://www.google.com/imghp?hl=es&tab=ri&ogbl" },
        { text: "Bing", url: "https://www.bing.com/images/feed?form=Z9LH" },
        { text: "Pinterest", url: "https://www.pinterest.es/" }
    ],
    dropdown25: [
        { text: "SpeedTest", url: "https://www.speedtest.net/es" }
    ],
    dropdown26: [
        { text: "VirusTotal", url: "https://www.virustotal.com/gui/home/upload" }
    ],
    dropdown27: [
        { text: "Traductor de Google", url: "https://translate.google.com/?sl=es&tl=en&op=translate" },
        { text: "Traductor de Microsoft", url: "https://www.bing.com/translator?ref=TThis&text=&from=en&to=es" },
        { text: "Reverso", url: "https://www.reverso.net/traducci%C3%B3n-texto" },
        { text: "Deepl", url: "https://www.deepl.com/es/translator" }
    ],
    dropdown29: [
        { text: "inled.es", url: "http://inled.es" },
        { text: "TEA Friendly", url: "https://teafriendly.inled.es" },
        { text: "DSIGN", url: "https://inled.es/dsign" }
    ],
    dropdown30: [
        { text: "LifeAt", url: "https://lifeat.io" }
    ],
    dropdown31: [
        { text: "Clipchamp", url: "https://app.clipchamp.com/" },
        { text: "Capcut", url: "https://www.capcut.com/my-edit" }
    ],
    dropdown32: [
        { text: "Wordpress", url: "https://wordpress.com/es/" },
        { text: "Wix", url: "https://manage.wix.com/dashboard/" }
    ],
    dropdown34: [
        { text: "IlovePDF", url: "https://www.ilovepdf.com/es" },
        { text: "WPS PDF Tools", url: "https://pdf.wps.com/" }
    ],
};

const folderConfig: Record<string, { title: string, color: string, emoji: string }> = {
    dropdown1: { title: 'Email', color: '#ef4444', emoji: '📧' },
    dropdown2: { title: 'Documents', color: '#3b82f6', emoji: '📝' },
    dropdown3: { title: 'Presentations', color: '#f59e0b', emoji: '📊' },
    dropdown4: { title: 'Spreadsheets', color: '#10b981', emoji: '📈' },
    dropdown5: { title: 'Forms', color: '#8b5cf6', emoji: '📋' },
    dropdown6: { title: 'Cloud', color: '#6366f1', emoji: '☁️' },
    dropdown7: { title: 'AI', color: '#ec4899', emoji: '🤖' },
    dropdown8: { title: 'Products', color: '#14b8a6', emoji: '📦' },
    dropdown10: { title: 'Maps', color: '#ef4444', emoji: '📍' },
    dropdown11: { title: 'App Stores', color: '#3b82f6', emoji: '🛍️' },
    dropdown12: { title: 'Meetings', color: '#f59e0b', emoji: '🎥' },
    dropdown13: { title: 'Calendar', color: '#10b981', emoji: '📅' },
    dropdown14: { title: 'Messaging', color: '#8b5cf6', emoji: '💬' },
    dropdown15: { title: 'Video', color: '#6366f1', emoji: '📺' },
    dropdown16: { title: 'Music', color: '#ec4899', emoji: '🎵' },
    dropdown17: { title: 'News', color: '#14b8a6', emoji: '📰' },
    dropdown18: { title: 'Online TV', color: '#ef4444', emoji: '📡' },
    dropdown19: { title: 'Radio', color: '#3b82f6', emoji: '📻' },
    dropdown20: { title: 'Social', color: '#f59e0b', emoji: '🌟' },
    dropdown22: { title: 'Dictionary', color: '#10b981', emoji: '📖' },
    dropdown24: { title: 'Images', color: '#8b5cf6', emoji: '🖼️' },
    dropdown25: { title: 'Speed', color: '#6366f1', emoji: '⚡' },
    dropdown26: { title: 'Security', color: '#ec4899', emoji: '🛡️' },
    dropdown27: { title: 'Translator', color: '#14b8a6', emoji: '🌐' },
    dropdown29: { title: 'Projects', color: '#ef4444', emoji: '🚀' },
    dropdown30: { title: 'LifeAt', color: '#3b82f6', emoji: '🏠' },
    dropdown31: { title: 'Editing', color: '#f59e0b', emoji: '🎬' },
    dropdown32: { title: 'Web Dev', color: '#10b981', emoji: '💻' },
    dropdown34: { title: 'PDF', color: '#8b5cf6', emoji: '📄' },
};

export const DEFAULT_FOLDERS: Folder[] = Object.keys(dropdownData).map(key => ({
    id: `def-${key}`,
    title: folderConfig[key]?.title || key,
    color: folderConfig[key]?.color || '#3b82f6',
    emoji: folderConfig[key]?.emoji || '📂'
}));

export const DEFAULT_BOOKMARKS: Bookmark[] = Object.keys(dropdownData).flatMap(key => 
    dropdownData[key].map((item, idx) => ({
        id: `def-${key}-b${idx}`,
        title: item.text,
        url: item.url,
        parentId: `def-${key}`
    }))
);

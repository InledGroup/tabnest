/**
 * Regla DNR que permite embeber webs de terceros dentro del visor de canales
 * (iframe de la propia extensión) eliminando X-Frame-Options / CSP frame-ancestors.
 *
 * Issue #2: la regla vive aquí y no en rules.json estático para poder acotarla con
 * `initiatorDomains: [<id de la extensión>]`. Así sólo los marcos que abre TabNest
 * pierden esas cabeceras; el resto de la navegación del usuario las conserva.
 */
const RULE_ID = 1;

type DNR = typeof chrome.declarativeNetRequest;

const getDNR = (): DNR | undefined => {
  const api = (globalThis as { chrome?: { declarativeNetRequest?: DNR } }).chrome
    ?.declarativeNetRequest;
  return api;
};

export const ensureViewerFrameRule = async (): Promise<void> => {
  const dnr = getDNR();
  if (!dnr?.updateSessionRules || !chrome?.runtime?.id) return;

  const rule = {
    id: RULE_ID,
    priority: 1,
    action: {
      type: 'modifyHeaders' as const,
      responseHeaders: [
        { header: 'X-Frame-Options', operation: 'remove' as const },
        { header: 'Frame-Options', operation: 'remove' as const },
        { header: 'Content-Security-Policy', operation: 'remove' as const },
      ],
    },
    condition: {
      // El dominio inicial de chrome-extension://<id>/ es el propio id de la extensión.
      initiatorDomains: [chrome.runtime.id],
      resourceTypes: ['sub_frame' as const],
    },
  };

  try {
    const existing = await dnr.getSessionRules();
    // Las eliminaciones se aplican antes que las adiciones, así que reemplazar la
    // regla en la misma llamada es seguro (y la deja siempre con la última versión).
    const staleIds = existing
      .filter(r => r.id === RULE_ID || (r.condition?.initiatorDomains ?? []).includes(chrome.runtime.id))
      .map(r => r.id);

    await dnr.updateSessionRules({
      removeRuleIds: staleIds,
      addRules: [rule],
    });
  } catch {
    // Sin permisos DNR (u otro navegador) el visor sigue funcionando si la web lo permite.
  }
};

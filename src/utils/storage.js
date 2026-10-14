/**
 * Resilient localStorage helper that handles QuotaExceededError gracefully
 * by cleaning up legacy/redundant keys and stripping heavy base64 images from history.
 */

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`LocalStorage quota exceeded for key "${key}". Cleaning up legacy cache...`, err);

    // 1. Remove obsolete / duplicate keys
    const obsoleteKeys = [
      'dit_chat_messages_v3',
      'dit_chat_messages_v2',
      'dit_chat_messages_v1',
      'deepseek_api_key',
      'deepseek_model',
      'dit_report_state_v1'
    ];
    obsoleteKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    // 2. Try setting again
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err2) {
      // 3. If key is sessions list, prune to last 2 sessions without heavy images
      if (key === 'dit_report_sessions_v1') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const light = parsed.slice(0, 3).map(s => ({
              ...s,
              reportData: stripHeavyImages(s.reportData)
            }));
            localStorage.setItem(key, JSON.stringify(light));
            return true;
          }
        } catch (e3) {
          console.warn('Could not save light sessions:', e3);
        }
      }
      return false;
    }
  }
}

export function stripHeavyImages(reportData) {
  if (!reportData || !reportData.chapters) return reportData;
  return {
    ...reportData,
    chapters: reportData.chapters.map(c => ({
      ...c,
      sections: (c.sections || []).map(s => {
        if (s.image && s.image.length > 500) {
          return { ...s, image: '' };
        }
        return s;
      })
    }))
  };
}

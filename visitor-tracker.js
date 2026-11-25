/* Entelaqtak visitor analytics: pseudonymous sessions sent through a protected Edge Function. */
(() => {
  'use strict';
  const cfg = window.ENTELAQTAK_CONFIG;
  if (!cfg?.url || !cfg?.publishableKey) return;

  const start = () => {
    if (window.__entelaqtakVisitorTrackerStarted || !window.supabase?.createClient) return;
    window.__entelaqtakVisitorTrackerStarted = true;

    const client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'sb-dbetanrnhdabuachxdhc-auth-token'
      }
    });
    const ID_KEY = 'entelaqtak-visitor-session-v2';
    const TOKEN_KEY = 'entelaqtak-visitor-secret-v2';
    const randomHex = (bytes) => {
      const data = new Uint8Array(bytes);
      crypto.getRandomValues(data);
      return Array.from(data, b => b.toString(16).padStart(2, '0')).join('');
    };

    let sessionId;
    let sessionToken;
    try {
      sessionId = localStorage.getItem(ID_KEY);
      sessionToken = localStorage.getItem(TOKEN_KEY);
      if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId) || !sessionToken || !/^[0-9a-f]{64}$/i.test(sessionToken)) {
        sessionId = crypto.randomUUID();
        sessionToken = randomHex(32);
        localStorage.setItem(ID_KEY, sessionId);
        localStorage.setItem(TOKEN_KEY, sessionToken);
      }
    } catch (_) {
      sessionId = crypto.randomUUID();
      sessionToken = randomHex(32);
    }

    let closed = false;
    let inFlight = false;
    const baseUrl = String(cfg.url).replace(/\/$/, '');
    const page = () => (location.pathname + location.search).slice(0, 500);

    async function heartbeat(ended = false) {
      if ((closed && !ended) || inFlight) return;
      inFlight = true;
      try {
        const { data: authData, error: authError } = await client.auth.getSession();
        if (authError) throw authError;
        const accessToken = authData?.session?.access_token;
        const headers = {
          'Content-Type': 'application/json',
          apikey: cfg.publishableKey
        };
        if (accessToken) headers.Authorization = 'Bearer ' + accessToken;

        const response = await fetch(baseUrl + '/functions/v1/visitor-heartbeat', {
          method: 'POST',
          headers,
          cache: 'no-store',
          credentials: 'omit',
          keepalive: Boolean(ended),
          body: JSON.stringify({
            sessionId,
            sessionToken,
            pagePath: page(),
            userAgent: (navigator.userAgent || '').slice(0, 500),
            referrer: (document.referrer || '').slice(0, 1000),
            ended: Boolean(ended)
          })
        });
        if (!response.ok) throw new Error('Visitor heartbeat failed: ' + response.status);
      } catch (_) {
        // Analytics failures must never interrupt the workspace.
      } finally {
        inFlight = false;
      }
    }

    heartbeat();
    const timer = setInterval(() => heartbeat(), 30000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') heartbeat();
    });
    window.addEventListener('pagehide', () => {
      closed = true;
      clearInterval(timer);
      heartbeat(true);
    }, { once: true });
  };

  if (window.supabase?.createClient) start();
  else {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    script.onerror = () => { script.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js'; };
    script.onload = start;
    script.async = true;
    document.head.appendChild(script);
  }
})();

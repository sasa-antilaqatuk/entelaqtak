import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set([
  "https://sasa-antilaqatuk.github.io",
  "https://hfpokf2-boop.github.io",
]);

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  };
}

function reply(body: unknown, status: number, origin: string, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function getServerHeaders(): Record<string, string> {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    const keys = JSON.parse(raw);
    if (typeof keys?.default === "string" && keys.default) {
      return { apikey: keys.default };
    }
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return legacy
    ? { apikey: legacy, Authorization: "Bearer " + legacy }
    : {};
}

function verifyPublishableKey(apiKey: string): boolean {
  if (!apiKey) return false;
  const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!raw) return true;
  try {
    const keys = JSON.parse(raw);
    return apiKey === keys.default;
  } catch {
    return false;
  }
}

async function hmacHex(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (!allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405, origin);

  const apiKey = req.headers.get("apikey") ?? "";
  if (!verifyPublishableKey(apiKey)) {
    return reply({ error: "تعذر التحقق من إعداد الاتصال." }, 401, origin);
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return reply({ error: "تعذر قراءة بيانات الجلسة." }, 400, origin);
  }
  if (new TextEncoder().encode(rawBody).byteLength > 8000) {
    return reply({ error: "حجم بيانات الجلسة أكبر من الحد المسموح." }, 413, origin);
  }

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: "صيغة بيانات الجلسة غير صحيحة." }, 400, origin);
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken : "";
  const sessionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!sessionIdPattern.test(sessionId) || !/^[0-9a-f]{64}$/i.test(sessionToken)) {
    return reply({ error: "بيانات الجلسة غير صالحة." }, 400, origin);
  }

  const authorization = req.headers.get("authorization");
  let userId: string | null = null;
  let visitorEmail: string | null = null;
  const projectUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  if (!projectUrl) return reply({ error: "خدمة الجلسات غير مهيأة." }, 503, origin);

  if (authorization) {
    if (!authorization.startsWith("Bearer ")) {
      return reply({ error: "صيغة جلسة الحساب غير صحيحة." }, 401, origin);
    }
    try {
      const userResponse = await fetch(projectUrl + "/auth/v1/user", {
        method: "GET",
        headers: { apikey: apiKey, Authorization: authorization },
      });
      const user = await userResponse.json().catch(() => ({}));
      if (!userResponse.ok || typeof user?.id !== "string") {
        return reply({ error: "انتهت جلسة الحساب." }, 401, origin);
      }
      userId = user.id;
      if (
        typeof user.email === "string" &&
        user.email.length <= 254 &&
        !user.email.toLowerCase().endsWith("@accounts.entelaqtak.invalid")
      ) {
        visitorEmail = user.email;
      }
    } catch {
      return reply({ error: "تعذر التحقق من جلسة الحساب." }, 503, origin);
    }
  }

  let serverHeaders: Record<string, string>;
  try {
    serverHeaders = getServerHeaders();
  } catch {
    return reply({ error: "إعدادات حماية الجلسات غير مكتملة." }, 503, origin);
  }
  if (!serverHeaders.apikey) return reply({ error: "خدمة الجلسات غير مهيأة على الخادم." }, 503, origin);

  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  try {
    const identityHash = await hmacHex("visitor-heartbeat-ip:" + ip, serverHeaders.apikey);
    const quotaResponse = await fetch(projectUrl + "/rest/v1/rpc/consume_visitor_rate_limit", {
      method: "POST",
      headers: {
        ...serverHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_identity_hash: identityHash }),
    });
    const quota = await quotaResponse.json().catch(() => null);
    if (!quotaResponse.ok || !quota || typeof quota.allowed !== "boolean") {
      console.error("Visitor heartbeat rate-limit check failed", quotaResponse.status);
      return reply({ error: "تعذر التحقق من معدل الجلسة." }, 503, origin);
    }
    if (!quota.allowed) {
      const retryAfter = Math.max(1, Number(quota.retry_after) || 900);
      return reply(
        { error: "تم تجاوز معدل تحديث الجلسة. حاول لاحقًا." },
        429,
        origin,
        { "Retry-After": String(retryAfter) },
      );
    }
  } catch {
    return reply({ error: "تعذر الاتصال بخدمة حماية الجلسات." }, 503, origin);
  }

  const pagePath = typeof body.pagePath === "string" ? body.pagePath.slice(0, 500) : "/";
  const userAgent = typeof body.userAgent === "string" ? body.userAgent.slice(0, 500) : "";
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 1000) : "";
  const ended = body.ended === true;

  try {
    const response = await fetch(projectUrl + "/rest/v1/rpc/heartbeat_visitor_session", {
      method: "POST",
      headers: {
        ...serverHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_session_id: sessionId,
        p_session_token: sessionToken,
        p_user_id: userId,
        p_visitor_email: visitorEmail,
        p_page_path: pagePath,
        p_user_agent: userAgent,
        p_referrer: referrer,
        p_ended: ended,
      }),
    });
    if (!response.ok) {
      console.warn("Visitor heartbeat storage failed", response.status);
      return reply({ error: "تعذر حفظ نبضة الجلسة." }, 502, origin);
    }
    return reply({ ok: true }, 200, origin);
  } catch {
    return reply({ error: "تعذر الاتصال بخدمة حفظ الجلسة." }, 502, origin);
  }
});
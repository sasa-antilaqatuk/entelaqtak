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
      // New sb_secret keys are API keys, not JWTs: never send them as Bearer tokens.
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

function normalizedUsername(value: unknown): string {
  if (typeof value !== "string") throw new Error("اكتب اسم المستخدم.");
  const username = value.normalize("NFKC").trim().toLowerCase();
  const length = [...username].length;
  if (
    length < 3 ||
    length > 24 ||
    !/^[\p{L}\p{N}][\p{L}\p{N}._-]{1,22}[\p{L}\p{N}]$/u.test(username) ||
    /[._-]{2}/u.test(username)
  ) {
    throw new Error("اسم المستخدم يجب أن يكون من 3 إلى 24 حرفًا أو رقمًا، ويمكن استخدام النقطة والشرطة والشرطة السفلية بينهما.");
  }
  return username;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (!allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405, origin);

  if (!verifyPublishableKey(req.headers.get("apikey") ?? "")) {
    return reply({ error: "تعذر التحقق من إعداد الاتصال." }, 401, origin);
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return reply({ error: "تعذر قراءة بيانات الحساب." }, 400, origin);
  }
  if (new TextEncoder().encode(rawBody).byteLength > 4000) {
    return reply({ error: "حجم بيانات الحساب أكبر من الحد المسموح." }, 413, origin);
  }

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: "صيغة بيانات الحساب غير صحيحة." }, 400, origin);
  }

  let username = "";
  try {
    username = normalizedUsername(body.username);
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "اسم المستخدم غير صالح." }, 400, origin);
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8 || password.length > 128) {
    return reply({ error: "كلمة المرور يجب أن تكون من 8 إلى 128 حرفًا." }, 400, origin);
  }

  const projectUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  let serverHeaders: Record<string, string>;
  try {
    serverHeaders = getServerHeaders();
  } catch {
    return reply({ error: "إعدادات خدمة الحساب غير مكتملة." }, 503, origin);
  }
  if (!projectUrl || !serverHeaders.apikey) {
    return reply({ error: "خدمة إنشاء الحساب غير مهيأة على الخادم." }, 503, origin);
  }

  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  try {
    const identityHash = await hmacHex("username-signup-ip:" + ip, serverHeaders.apikey);
    const quotaResponse = await fetch(projectUrl + "/rest/v1/rpc/consume_signup_rate_limit", {
      method: "POST",
      headers: {
        ...serverHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_identity_hash: identityHash }),
    });
    const quota = await quotaResponse.json().catch(() => null);
    if (!quotaResponse.ok || !quota || typeof quota.allowed !== "boolean") {
      console.error("Username signup rate-limit check failed", quotaResponse.status);
      return reply({ error: "تعذر التحقق من محاولات إنشاء الحساب. حاول بعد قليل." }, 503, origin);
    }
    if (!quota.allowed) {
      const retryAfter = Math.max(1, Number(quota.retry_after) || 3600);
      return reply(
        { error: "تم تجاوز عدد محاولات إنشاء الحساب. حاول بعد " + Math.ceil(retryAfter / 60) + " دقيقة." },
        429,
        origin,
        { "Retry-After": String(retryAfter) },
      );
    }
  } catch {
    return reply({ error: "تعذر الاتصال بخدمة حماية الحسابات." }, 503, origin);
  }

  const usernameDigest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("entelaqtak.username.v1:" + username),
  );
  const token = Array.from(new Uint8Array(usernameDigest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
  const syntheticEmail = "u" + token + "@accounts.entelaqtak.invalid";

  try {
    const response = await fetch(projectUrl + "/auth/v1/admin/users", {
      method: "POST",
      headers: {
        ...serverHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: syntheticEmail,
        password,
        email_confirm: true,
        user_metadata: { username, display_name: username },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 409 || response.status === 422) {
        return reply({ error: "اسم المستخدم مستخدم بالفعل أو غير متاح. جرّب اسمًا آخر." }, 409, origin);
      }
      console.error("Username account creation failed", response.status, error?.code ?? "unknown");
      return reply({ error: "تعذر إنشاء الحساب الآن. راجع البيانات وحاول مرة أخرى." }, 502, origin);
    }

    return reply({ created: true, username }, 201, origin);
  } catch {
    return reply({ error: "تعذر الاتصال بخدمة إنشاء الحساب." }, 502, origin);
  }
});
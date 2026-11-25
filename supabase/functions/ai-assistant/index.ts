import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedTools = new Set(["ideas", "script", "content_pack", "titles", "seo", "repurpose", "assistant", "project_assistant", "research", "fact_check"]);
const allowedOrigins = new Set([
  "https://sasa-antilaqatuk.github.io",
  "https://hfpokf2-boop.github.io",
]);
const trackedTools = new Set(["ideas", "script", "content_pack", "titles", "seo", "repurpose", "assistant", "project_assistant", "research", "fact_check"]);

const instructions: Record<string, string> = {
  ideas: "اقترح أفكارًا مبتكرة ومتنوعة تناسب المجال والمنصة والجمهور. لكل فكرة اكتب عنوانًا وزاوية تناول وخطافًا. تجنب تكرار الفكرة نفسها.",
  script: "اكتب مسودة سكريبت عربية طبيعية فيها خطاف افتتاحي وتمهيد ومحاور واضحة وأمثلة قابلة للتحقق وخاتمة مع سؤال للجمهور. لا تخترع حقائق.",
  content_pack: [
    "أنشئ حزمة محتوى احترافية متكاملة ومخصصة بدقة لبيانات المستخدم، وليست قالبًا عامًا.",
    "أخرج JSON صالحًا فقط دون Markdown أو code fences أو أي نص خارج JSON. استخدم المفاتيح التالية حرفيًا:",
    "{\"hook\":\"خطاف افتتاحي قوي\",\"titles\":[\"5 عناوين مختلفة وصادقة\"],\"script\":\"سكريبت كامل مناسب للمنصة والمدة والنبرة\",\"description\":\"وصف نشر طبيعي\",\"keywords\":\"كلمات مفتاحية وهاشتاجات\",\"thumbnail\":\"تصور بصري عملي للصورة المصغرة مع نص قصير وتكوين\",\"shots\":\"قائمة لقطات مرتبة\",\"shorts\":[{\"title\":\"عنوان النسخة القصيرة\",\"hook\":\"خطاف\",\"script\":\"سكريبت قصير مستقل\",\"caption\":\"كابشن\"}],\"communityPost\":\"منشور مجتمع يفتح نقاشًا\",\"pinnedComment\":\"تعليق مثبت مفيد\",\"cta\":\"دعوة تفاعل طبيعية\",\"editorNotes\":\"ملاحظات مونتاج وإيقاع ودعم بصري\",\"factWarnings\":[\"نقاط تحتاج تحققًا أو مصدرًا\"]}",
    "أنتج 3 عناصر داخل shorts بالضبط، لكل واحدة زاوية مختلفة، مع احترام المنصة والمدة.",
    "اجعل السكريبت متوازنًا: خطاف، وعد واضح للمشاهد، انتقالات طبيعية، محاور مترابطة، وخاتمة. تجنب تكرار الخطاف داخل كل محور.",
    "لا تختلق تواريخ أو أرقامًا أو أسماء أو اقتباسات أو مصادر. عند غياب الأدلة، استخدم صياغة حذرة وضع الادعاء ضمن factWarnings.",
    "لا تستخدم وعودًا مضللة أو حشو كلمات مفتاحية أو هاشتاجات غير مرتبطة. احترم حقل avoid وأي قيود يذكرها المستخدم.",
    "اجعل قيم JSON صحيحة، واهرب علامات الاقتباس والأسطر الجديدة وفق معيار JSON."
  ].join("\n"),
  titles: "اقترح عناوين جذابة وواضحة وغير مضللة، ثم وصفًا لتصميم صورة مصغرة يعبر فعلًا عن المحتوى.",
  seo: "اكتب وصفًا طبيعيًا وكلمات مفتاحية مرتبطة فعلًا بالموضوع وهاشتاجات محدودة. لا تدّعِ أنها ترند أو ذات حجم بحث مثبت.",
  repurpose: "حوّل المادة إلى الصيغة والمنصة المطلوبة مع الحفاظ على الحقائق والمعنى. لا تضف ادعاءات غير موجودة في المصدر.",
  assistant: "حلّل ملف صانع المحتوى والأفكار والحزم ومؤشرات الأداء المقدمة. أعطِ توصيات عملية مرتبة حسب الأولوية، واشرح سبب كل توصية بالاستناد إلى البيانات المتاحة. لا تخترع أرقامًا أو نتائج أو ترندات.",
  project_assistant: [
    "أنت مساعد شخصي داخل مشروع واحد في استوديو إنتاج المحتوى، وتعمل كزميل تحرير وتخطيط ومونتاج.",
    "تحدث بالعربية المصرية البيضاء بشكل طبيعي ومباشر، ما لم يطلب المستخدم لغة أو نبرة أخرى.",
    "اقرأ كائن project بوصفه بيانات المشروع الحالية، وhistory بوصفه آخر رسائل المحادثة، وأجب عن message مباشرة.",
    "اجعل إجاباتك مرتبطة بموضوع المشروع ومنصته وجمهوره ومدته والمرحلة التي وصل إليها، واستفد من البحث والتحقق والسكريبت وملاحظات المونتاج والنشر الموجودة.",
    "لا تخترع وقائع أو أرقامًا أو أسماء أو مصادر. ميّز بوضوح بين ما هو موجود داخل بيانات المشروع وبين اقتراحك التحريري.",
    "قد تحتوي attachments على بيانات أسماء وأنواع فقط، بينما readableAttachmentText يحتوي فقط على النص الذي تم تمريره فعلًا. لا تدّع قراءة صورة أو فيديو أو ملف PDF أو Word أو أي مرفق لا يوجد نصه هنا.",
    "إذا كان الادعاء يحتاج تحققًا حديثًا أو مصدرًا، قل ذلك بوضوح ووجّه المستخدم لتشغيل غرفة البحث أو مدقق الحقائق داخل المشروع؛ لا تصنع مصادر من عندك.",
    "عند طلب تعديل السكريبت، قدّم نصًا جاهزًا للنسخ مع الحفاظ على الحقائق المثبتة، ووضّح ما الذي تغيّر باختصار.",
    "لا تدّع أنك عدّلت المشروع أو حفظت شيئًا بنفسك؛ المستخدم يراجع وينقل التعديلات إلى حقول المشروع.",
    "اجعل الرد عمليًا وموجزًا بما يناسب السؤال، ولا تكرر ملخص المشروع كاملًا في كل رسالة."
  ].join("\n"),
  research: "أنت باحث محتوى. استخدم البحث على الويب إلزاميًا للعثور على معلومات حديثة حول الموضوع والمنطقة المحددة. لخّص 5 إلى 8 زوايا محتوى قابلة للتنفيذ، وميّز بين الخبر المؤكد والرأي والاتجاه المحتمل. اذكر تاريخ النشر وتاريخ الحدث عند توفرهما. لا تصف موضوعًا بأنه ترند أو عالي البحث دون بيانات حجم بحث فعلية. اختم بمصادر واضحة.",
  fact_check: "تحقق من الادعاء المحدد باستخدام البحث على الويب إلزاميًا. أعطِ حكمًا: صحيح، صحيح جزئيًا، مضلل، غير مثبت، أو خطأ. اشرح ما تدعمه المصادر وما لا تدعمه، واذكر تاريخ المعلومات وحدود التحقق. لا تستنتج أكثر مما تسمح به المصادر، واستخدم عدة مصادر مستقلة عند الإمكان.",
};

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  };
}

function reply(
  body: unknown,
  status = 200,
  origin = "https://sasa-antilaqatuk.github.io",
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

async function hashKey(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}


async function resolveUser(
  authorization: string | null,
  apiKey: string,
  origin: string,
): Promise<{ userId: string | null; error: Response | null }> {
  if (!authorization) return { userId: null, error: null };
  if (!authorization.startsWith("Bearer ")) {
    return { userId: null, error: reply({ error: "صيغة جلسة الحساب غير صحيحة." }, 401, origin) };
  }

  const projectUrl = Deno.env.get("SUPABASE_URL");
  if (!projectUrl || !apiKey) {
    return { userId: null, error: reply({ error: "تعذر التحقق من جلسة الحساب حاليًا." }, 503, origin) };
  }

  try {
    const response = await fetch(projectUrl.replace(/\/$/, "") + "/auth/v1/user", {
      method: "GET",
      headers: { apikey: apiKey, Authorization: authorization },
    });
    const user = await response.json().catch(() => ({}));
    if (!response.ok || typeof user?.id !== "string") {
      return { userId: null, error: reply({ error: "انتهت جلسة الحساب. سجّل الدخول مرة أخرى ثم أعد المحاولة." }, 401, origin) };
    }
    return { userId: user.id, error: null };
  } catch {
    return { userId: null, error: reply({ error: "تعذر التحقق من جلسة الحساب بسبب مشكلة اتصال." }, 503, origin) };
  }
}


async function recordUsage(
  projectUrl: string | undefined,
  apiKey: string,
  authorization: string | null,
  userId: string | null,
  tool: string,
  inputChars: number,
) {
  if (!projectUrl || !authorization || !userId || !trackedTools.has(tool)) return;
  try {
    const response = await fetch(projectUrl.replace(/\/$/, "") + "/rest/v1/ai_usage", {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: authorization,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ user_id: userId, tool, input_chars: inputChars }),
    });
    if (!response.ok) console.warn("AI usage logging failed", response.status);
  } catch {
    console.warn("AI usage logging unavailable");
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (!allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405, origin);

  const apiKey = req.headers.get("apikey") ?? "";
  const publishableKeysRaw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (publishableKeysRaw) {
    try {
      const keys = JSON.parse(publishableKeysRaw);
      if (apiKey !== keys.default) return reply({ error: "تعذر التحقق من إعداد الاتصال." }, 401, origin);
    } catch {
      return reply({ error: "إعدادات الاتصال بالخادم غير مكتملة." }, 503, origin);
    }
  }

  const authorization = req.headers.get("authorization");
  const auth = await resolveUser(authorization, apiKey, origin);
  if (auth.error) return auth.error;

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return reply({ error: "تعذر قراءة بيانات الطلب." }, 400, origin);
  }
  if (new TextEncoder().encode(rawBody).byteLength > 24000) {
    return reply({ error: "حجم الطلب أكبر من الحد المسموح." }, 413, origin);
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return reply({ error: "صيغة الطلب غير صحيحة." }, 400, origin);
  }

  const tool = typeof body?.tool === "string" ? body.tool : "";
  const payload = body?.payload;
  if (!allowedTools.has(tool)) return reply({ error: "الأداة المطلوبة غير مدعومة." }, 400, origin);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return reply({ error: "بيانات الطلب غير صحيحة." }, 400, origin);
  }

  const serialized = JSON.stringify(payload);
  const inputChars = serialized.length;
  if (inputChars < 2 || inputChars > 12000 || new TextEncoder().encode(serialized).byteLength > 24000) {
    return reply({ error: "حجم المدخلات يجب ألا يتجاوز 12,000 حرف." }, 400, origin);
  }

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAiKey) return reply({ error: "الخدمة تحتاج إعداد مفتاح الذكاء الاصطناعي على الخادم." }, 503, origin);
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  // Registered accounts are limited independently; anonymous visitors share a network-level limit.
  const rateIdentities = auth.userId ? ["user:" + auth.userId] : ["ip:" + ip];
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  let serverKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  let useLegacyServiceRole = true;
  if (secretKeysRaw) {
    try { const keys = JSON.parse(secretKeysRaw); if (typeof keys?.default === "string") { serverKey = keys.default; useLegacyServiceRole = false; } }
    catch { return reply({ error: "تعذر تحميل إعداد الحماية من الخادم." }, 503, origin); }
  }
  if (!projectUrl || !serverKey) return reply({ error: "إعداد حدود الاستخدام الآمنة غير مكتمل على الخادم." }, 503, origin);
  for (const rateIdentity of rateIdentities) {
    const rateKey = await hashKey(rateIdentity, serverKey);
    try {
      const quotaResponse = await fetch(projectUrl.replace(/\/$/, "") + "/rest/v1/rpc/consume_ai_rate_limit", {
        method: "POST", headers: { apikey: serverKey, ...(useLegacyServiceRole ? { Authorization: "Bearer " + serverKey } : {}), "Content-Type": "application/json" },
        body: JSON.stringify({ p_identity_hash: rateKey }),
      });
      const quota = await quotaResponse.json().catch(() => null);
      if (!quotaResponse.ok || !quota || typeof quota.allowed !== "boolean") {
        console.error("Persistent AI rate limit failed", quotaResponse.status);
        return reply({ error: "تعذر التحقق من حد الاستخدام. حاول بعد قليل." }, 503, origin);
      }
      if (!quota.allowed) {
        const retryAfter = Math.max(1, Number(quota.retry_after) || 900);
        return reply({ error: "وصلت للحد المؤقت من طلبات المساعد. حاول بعد " + Math.ceil(retryAfter / 60) + " دقيقة." }, 429, origin,
          { "Retry-After": String(retryAfter), "X-RateLimit-Limit": String(quota.limit ?? 5), "X-RateLimit-Remaining": "0" });
      }
    } catch { return reply({ error: "تعذر الاتصال بخدمة حماية الاستخدام. حاول مرة أخرى." }, 503, origin); }
  }

  const isResearch = tool === "research" || tool === "fact_check";
  const model = isResearch ? (Deno.env.get("OPENAI_RESEARCH_MODEL")?.trim() || "gpt-6-astra") : (Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-6-luna");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + openAiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        instructions: [
          "أنت مساعد متخصص لصناع المحتوى باللغة العربية.",
          "اكتب بلغة طبيعية واضحة، وكن دقيقًا ولا تختلق معلومات أو أرقامًا أو مصادر.",
          "التزم ببيانات المستخدم ولا تضف وعودًا مضللة أو عناوين كاذبة.",
          instructions[tool],
          "قدّم الإجابة في أقسام قصيرة وواضحة قابلة للتحرير.",
        ].join("\n"),
        input: serialized,
        max_output_tokens: isResearch ? 3200 : (tool === "content_pack" ? 3600 : (tool === "project_assistant" ? 2200 : 1800)),
        ...(isResearch ? { tools: [{ type: "web_search", search_context_size: "medium" }], tool_choice: "required", include: ["web_search_call.action.sources"] } : {}),
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("OpenAI API error", response.status, result?.error?.type ?? "unknown");
      if (response.status === 429) {
        const quotaCode = String(result?.error?.code ?? "");
        const quotaType = String(result?.error?.type ?? "");
        const billingQuotaCodes = new Set([
          "insufficient_quota",
          "credit_balance_exhausted",
          "organization_usage_limit_exceeded",
          "organization_spend_limit_exceeded",
          "project_spend_limit_exceeded",
        ]);
        if (quotaType === "insufficient_quota" || billingQuotaCodes.has(quotaCode)) {
          return reply(
            { error: "توليد المحتوى متوقف مؤقتًا لأن رصيد أو حد الإنفاق المخصص لخدمة الذكاء الاصطناعي غير كافٍ. بياناتك المحفوظة آمنة؛ أبلغ إدارة الموقع لتحديث رصيد API." },
            503,
            origin,
          );
        }
        return reply({ error: "خدمة الذكاء الاصطناعي مشغولة مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى." }, 429, origin);
      }
      return reply(
        { error: response.status === 401 ? "تعذر التحقق من مفتاح الخدمة المحفوظ على الخادم." : "تعذر توليد المحتوى حاليًا. حاول مرة أخرى." },
        502,
        origin,
      );
    }

    const text = typeof result.output_text === "string"
      ? result.output_text.trim()
      : (result.output ?? [])
          .flatMap((item: any) => Array.isArray(item.content) ? item.content : [])
          .filter((part: any) => part.type === "output_text" && typeof part.text === "string")
          .map((part: any) => part.text)
          .join("\n")
          .trim();

    if (!text) return reply({ error: "لم يصل نص من خدمة الذكاء الاصطناعي." }, 502, origin);

    await recordUsage(projectUrl, apiKey, authorization, auth.userId, tool, inputChars);
    const sourceMap = new Map<string, { title: string; url: string }>();
    for (const item of (result.output ?? [])) {
      if (item?.type === "web_search_call" && Array.isArray(item?.action?.sources)) {
        for (const source of item.action.sources) {
          const url = typeof source?.url === "string" ? source.url : "";
          if (url.startsWith("https://")) {
            let title = typeof source?.title === "string" ? source.title : "";
            if (!title) { try { title = new URL(url).hostname; } catch { title = url; } }
            sourceMap.set(url, { title, url });
          }
        }
      }
      for (const part of (Array.isArray(item?.content) ? item.content : [])) {
        for (const annotation of (Array.isArray(part?.annotations) ? part.annotations : [])) {
          const citation = annotation?.url_citation;
          const url = typeof citation?.url === "string" ? citation.url : "";
          if (url.startsWith("https://")) {
            let title = typeof citation?.title === "string" ? citation.title : "";
            if (!title) { try { title = new URL(url).hostname; } catch { title = url; } }
            sourceMap.set(url, { title, url });
          }
        }
      }
    }
    const sources = Array.from(sourceMap.values()).slice(0, 12);
    return reply({ text, model: result.model ?? model, sources, searched: isResearch }, 200, origin,
      { "X-RateLimit-Limit": "5" });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return reply({ error: "استغرق التوليد وقتًا أطول من اللازم. حاول مرة أخرى." }, 504, origin);
    }
    console.error("ai-assistant failed", error instanceof Error ? error.message : "unknown");
    return reply({ error: "حدث خطأ غير متوقع أثناء توليد المحتوى." }, 500, origin);
  } finally {
    clearTimeout(timer);
  }
});
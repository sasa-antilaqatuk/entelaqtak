/* Entelaqtak Production Studio — project-based creator workflow */
(() => {
  'use strict';
  window.__entelaqtakProductionStudioStatus = 'initializing';
  try {
  const app = window.EntelaqtakApp;
  const main = document.querySelector('.main');
  if (!app || !main) {
    window.__entelaqtakProductionStudioStatus = 'dependencies-missing';
    console.error('Production Studio could not start: workspace app or main container is missing.');
    return;
  }
  if (window.__entelaqtakProductionStudioBooted) return;
  window.__entelaqtakProductionStudioBooted = true;

  const $ = (id, scope = document) => scope.querySelector('#' + id);
  const safe = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10);
  };
  const uid = () => 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  const stages = [
    {id:'brief',label:'المشروع',hint:'حدد تفاصيل الفيديو',icon:'01'},
    {id:'research',label:'البحث',hint:'مصادر وحقائق',icon:'02'},
    {id:'script',label:'السكريبت',hint:'اكتب وراجع',icon:'03'},
    {id:'edit',label:'المونتاج',hint:'خطة مشاهد وصوت',icon:'04'},
    {id:'publish',label:'النشر',hint:'جهّز الحزمة النهائية',icon:'05'}
  ];
  let activeId = '';
  try { activeId = localStorage.getItem('entelaqtak-active-production-v1') || ''; } catch (_) {}
  const state = app.getState();
  if (!Array.isArray(state.productionProjects)) state.productionProjects = [];

  const nav = document.querySelector('#nav');
  if (nav && !nav.querySelector('[data-view="production"]')) {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.view = 'production';
    b.innerHTML = '<i>🎬</i>استوديو الإنتاج';
    nav.appendChild(b);
    b.addEventListener('click', () => app.go('production'));
  }
  // Navigation is delegated through the current application router in workspace.html.

  const existingView = document.getElementById('view-production');
  const view = existingView || document.createElement('section');
  view.classList.add('view');
  view.id = 'view-production';
  view.setAttribute('aria-label','استوديو إنتاج المحتوى');
  if (!view.isConnected) {
    const footer = main.querySelector('footer');
    if (footer) main.insertBefore(view, footer); else main.appendChild(view);
  }

  function projects() {
    const list = app.getState().productionProjects;
    return Array.isArray(list) ? list.filter(p => p && p.kind === 'production_project') : [];
  }
  function activeProject() {
    return projects().find(p => String(p.id) === String(activeId)) || null;
  }
  function persist(project, notify) {
    const data = app.getState();
    if (!Array.isArray(data.productionProjects)) data.productionProjects = [];
    project.updatedAt = new Date().toISOString();
    try { localStorage.setItem('entelaqtak-active-production-v1', String(project.id)); } catch (_) {}
    const index = data.productionProjects.findIndex(p => String(p.id) === String(project.id));
    if (index >= 0) data.productionProjects[index] = project;
    else data.productionProjects.unshift(project);
    app.save();
    if (notify) app.toast('تم حفظ المشروع ومزامنة تعديلاته حسب اتصال حسابك.');
  }
  function sourceLinks(list) {
    if (!Array.isArray(list) || !list.length) return '<div class="prod-empty-note">لسه مفيش روابط مصادر محفوظة.</div>';
    return '<div class="prod-sources">' + list.map(source => {
      const url = String(source.url || '');
      if (!/^https:\/\/[^ ]+/i.test(url)) return '';
      let title = String(source.title || '');
      if (!title) { try { title = new URL(url).hostname; } catch (_) { title = url; } }
      return '<a href="' + safe(url) + '" target="_blank" rel="noopener noreferrer"><span>↗</span>' + safe(title) + '</a>';
    }).join('') + '</div>';
  }
  function checklist(project) {
    const labels = [
      ['hook','الافتتاحية والخطاف واضحين'],
      ['facts','الحقائق والأسماء والتواريخ اتراجعت'],
      ['audio','الصوت والموسيقى والمؤثرات اتراجعوا'],
      ['thumb','الصورة المصغّرة والعنوان متناسقين'],
      ['seo','الوصف والكلمات المفتاحية جاهزين'],
      ['cta','الدعوة للتفاعل موجودة'],
      ['export','النسخة النهائية اتصدّرت واتحفظت']
    ];
    const checks = project.checklist || {};
    return labels.map(([key,label]) =>
      '<label class="prod-check"><input type="checkbox" data-check="' + key + '"' + (checks[key] ? ' checked' : '') + '><span>' + label + '</span></label>'
    ).join('');
  }
  function listMarkup() {
    const list = projects().slice().sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    return list.length ? list.map(p =>
      '<button type="button" class="prod-project-item ' + (String(p.id) === String(activeId) ? 'is-active' : '') + '" data-pick="' + safe(p.id) + '">' +
        '<span class="prod-project-icon">▶</span><span class="prod-project-info"><strong>' + safe(p.topic || 'مشروع بدون عنوان') + '</strong><small>' + safe(p.platform || 'YouTube') + ' · ' + safe(stageName(p.stage)) + '</small></span>' +
        '<span class="prod-project-arrow">←</span></button>'
    ).join('') : '<div class="prod-empty-note">لسه مفيش مشاريع. ابدأ أول مشروع من النموذج.</div>';
  }
  function stageName(id) {
    const item = stages.find(x => x.id === id);
    return item ? item.label : 'المشروع';
  }
  function stageBar(project) {
    const current = Math.max(0, stages.findIndex(x => x.id === project.stage));
    return '<div class="prod-stagebar">' + stages.map((s,i) =>
      '<button type="button" class="prod-stage ' + (s.id === project.stage ? 'is-current' : (i < current ? 'is-done' : '')) + '" data-stage="' + s.id + '">' +
      '<span class="prod-stage-no">' + (i < current ? '✓' : s.icon) + '</span><span><b>' + s.label + '</b><small>' + s.hint + '</small></span></button>'
    ).join('') + '</div>';
  }
  function renderBlank() {
    view.innerHTML = '<div class="prod-head"><div><span class="eyebrow">CREATOR PRODUCTION OS</span><h1>استوديو الإنتاج <span>🎬</span></h1><p>مشروع واحد يجمع البحث والسكريبت والمونتاج والتجهيز للنشر.</p></div><span class="prod-live"><i></i> مساحة عملك محفوظة</span></div>' +
      '<div class="prod-layout"><aside class="prod-library"><div class="prod-library-top"><div><span class="prod-kicker">PROJECT LIBRARY</span><h2>مشاريعك</h2></div><strong>' + projects().length + '</strong></div><div class="prod-project-list">' + listMarkup() + '</div><div class="prod-library-foot">مشاريعك محفوظة في مساحة انطلاقتك، وتدخل ضمن النسخ الاحتياطية والمزامنة.</div></aside>' +
      '<div class="prod-create-wrap"><div class="prod-create-hero"><span class="prod-kicker">ابدأ من هنا</span><h2>خلّي فكرتك مشروع إنتاج كامل.</h2><p>اكتب الأساسيات مرة واحدة. بعد كده هتتنقل بين مراحل المشروع وتكمل من نفس المكان.</p><div class="prod-path-mini"><span>فكرة</span><i>←</i><span>بحث</span><i>←</i><span>سكريبت</span><i>←</i><span>مونتاج</span><i>←</i><span>نشر</span></div></div>' +
      '<div class="prod-form-card"><div class="prod-form-title"><span>＋</span><div><h3>إنشاء مشروع جديد</h3><p>مش لازم تكون كل التفاصيل جاهزة دلوقتي.</p></div></div>' +
      '<div class="prod-fields"><label>موضوع الفيديو<input id="prodTopic" maxlength="500" placeholder="مثال: القصة الكاملة وراء انهيار البرازيل"></label>' +
      '<label>مجال المحتوى<select id="prodNiche"><option>رياضة</option><option>ترفيه وقصص</option><option>تقنية</option><option>تعليم وشروحات</option><option>مراجعات وتجارب</option><option>أعمال</option><option>مجال آخر</option></select></label>' +
      '<label>المنصة<select id="prodPlatform"><option>YouTube</option><option>YouTube Shorts</option><option>TikTok</option><option>Instagram Reels</option><option>Facebook</option><option>Podcast</option></select></label>' +
      '<label>مدة المحتوى<select id="prodDuration"><option>8–10 دقائق</option><option>5–8 دقائق</option><option>12–15 دقيقة</option><option>15–20 دقيقة</option><option>30–60 ثانية</option><option>60–90 ثانية</option></select></label>' +
      '<label>الجمهور المستهدف<input id="prodAudience" maxlength="240" placeholder="مثال: جمهور كرة القدم العربي"></label>' +
      '<label>أسلوب التقديم<select id="prodTone"><option>قصصي مشوّق</option><option>وثائقي</option><option>تحليلي</option><option>كوميدي</option><option>تعليمي مباشر</option><option>حماسي</option></select></label></div>' +
      '<button class="prod-primary" type="button" data-action="create">إنشاء مساحة المشروع <span>←</span></button>' +
      '<p class="prod-privacy">لن يتم نشر أي شيء تلقائيًا. أنت تتحكم في النصوص والمواعيد وكل خطوة قبل النشر.</p></div></div></div>';
  }
  function renderStage(project) {
    if (project.stage === 'brief') {
      return '<div class="prod-panel-grid"><article class="prod-panel"><div class="prod-panel-heading"><div><span class="prod-kicker">PROJECT BRIEF</span><h2>بطاقة المشروع</h2><p>عدّل التفاصيل الأساسية قبل بدء البحث.</p></div><span class="prod-icon">01</span></div>' +
        '<div class="prod-fields"><label>موضوع الفيديو<input data-field="topic" maxlength="500" value="' + safe(project.topic) + '"></label><label>المجال<input data-field="niche" maxlength="120" value="' + safe(project.niche) + '"></label>' +
        '<label>المنصة<select data-field="platform">' + ['YouTube','YouTube Shorts','TikTok','Instagram Reels','Facebook','Podcast'].map(v => '<option' + (project.platform === v ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></label>' +
        '<label>الجمهور<input data-field="audience" maxlength="240" value="' + safe(project.audience) + '"></label>' +
        '<label>المدة<input data-field="duration" maxlength="80" value="' + safe(project.duration) + '"></label><label>الأسلوب<input data-field="tone" maxlength="100" value="' + safe(project.tone) + '"></label></div>' +
        '<div class="prod-actions"><button class="prod-primary" type="button" data-action="save">حفظ تفاصيل المشروع</button><button class="prod-secondary" type="button" data-action="next">الانتقال للبحث ←</button></div></article>' +
        '<article class="prod-panel prod-side-panel"><span class="prod-kicker">PRODUCTION MAP</span><h3>المراحل الخمس</h3><div class="prod-vertical-steps">' + stages.map((s,i) => '<div class="prod-vertical-step"><b>' + s.icon + '</b><span><strong>' + s.label + '</strong><small>' + s.hint + '</small></span></div>').join('') + '</div><div class="prod-tip">ابدأ بالأساسيات، واحفظ المشروع في أي وقت. تقدر ترجع لأي مرحلة وتعدّلها بدون ما تبدأ من جديد.</div></article></div>';
    }
    if (project.stage === 'research') {
      return '<div class="prod-panel-grid"><article class="prod-panel"><div class="prod-panel-heading"><div><span class="prod-kicker">RESEARCH ROOM</span><h2>غرفة البحث والتحقق</h2><p>اجمع المعلومات والمصادر قبل كتابة أي معلومة في السكريبت.</p></div><span class="prod-icon">02</span></div>' +
        '<div class="prod-callout">البحث يستخدم الويب عند تشغيله ويعرض المصادر التي رجع إليها. راجع المصدر الأصلي وتاريخ المعلومة قبل اعتمادها.</div>' +
        '<button class="prod-primary" type="button" data-ai="research">ابحث عن الموضوع بمصادر مباشرة ✦</button>' +
        '<div class="prod-output-block"><div class="prod-output-title"><b>نتيجة البحث</b><button type="button" class="prod-mini" data-action="copy" data-value="researchText">نسخ البحث</button></div><textarea data-field="researchText" rows="12" placeholder="ملخص البحث والزوايا المقترحة هتظهر هنا...">' + safe(project.researchText) + '</textarea>' + sourceLinks(project.researchSources) + '</div>' +
        '<div class="prod-divider"></div><h3>مدقق الحقائق داخل المشروع</h3><p class="prod-muted">اكتب ادعاء محددًا تريد التحقق منه قبل إدخاله في الفيديو.</p><textarea data-field="factClaim" rows="3" placeholder="مثال: المنتخب البرازيلي فاز بكأس العالم خمس مرات.">' + safe(project.factClaim) + '</textarea>' +
        '<button class="prod-secondary" type="button" data-ai="fact">تحقق من الادعاء بالمصادر</button><div class="prod-output-block"><div class="prod-output-title"><b>نتيجة التحقق</b><button type="button" class="prod-mini" data-action="copy" data-value="factText">نسخ النتيجة</button></div><textarea data-field="factText" rows="7" placeholder="حكم التحقق والتوضيح هيظهروا هنا...">' + safe(project.factText) + '</textarea>' + sourceLinks(project.factSources) + '</div>' +
        '<div class="prod-actions"><button class="prod-secondary" type="button" data-action="back">السابق</button><button class="prod-primary" type="button" data-action="next">اعتماد البحث والانتقال للسكريبت ←</button></div></article>' +
        '<article class="prod-panel prod-side-panel"><span class="prod-kicker">SOURCE CONTROL</span><h3>قبل ما تعتمد معلومة</h3><div class="prod-checklist-static"><p>✓ افصل بين تاريخ الحدث وتاريخ نشر الخبر.</p><p>✓ راجع الأرقام والأسماء من المصدر الأصلي.</p><p>✓ لا تحوّل الرأي أو التوقع إلى حقيقة.</p><p>✓ احتفظ برابط المصدر مع المعلومة.</p></div><div class="prod-tip">البحث يساعدك، لكنه لا يلغي المراجعة البشرية. السكريبت النهائي مسؤوليتك قبل النشر.</div></article></div>';
    }
    if (project.stage === 'script') {
      return '<div class="prod-panel"><div class="prod-panel-heading"><div><span class="prod-kicker">SCRIPT ROOM</span><h2>غرفة كتابة السكريبت</h2><p>اكتب بالذكاء الاصطناعي ثم عدّل النص بصوتك قبل التسجيل.</p></div><span class="prod-icon">03</span></div>' +
        '<div class="prod-callout">المصادر ونتائج التحقق من المرحلة السابقة تدخل ضمن سياق إعداد السكريبت.</div><div class="prod-actions"><button class="prod-primary" type="button" data-ai="script">اكتب السكريبت بالذكاء الاصطناعي ✦</button><button class="prod-secondary" type="button" data-action="copy" data-value="script">نسخ السكريبت</button></div>' +
        '<textarea class="prod-editor prod-script-editor" data-field="script" rows="22" placeholder="اكتب أو الصق السكريبت هنا...">' + safe(project.script) + '</textarea><div class="prod-editor-foot"><span>' + (project.script || '').length + ' حرف</span><button class="prod-mini" data-action="save" type="button">حفظ التعديلات</button></div>' +
        '<section class="prod-script-coach"><div class="prod-script-coach-head"><div><span class="prod-kicker">SCRIPT QUALITY LAB</span><h3>مراجع السكريبت الذكي</h3><p>راجع قوة الخطاف والإيقاع والبناء قبل ما تروح للمونتاج.</p></div><span class="prod-script-coach-mark">✦</span></div>' +
        '<div class="prod-actions"><button class="prod-primary" type="button" data-ai="script_review">قيّم السكريبت بعمق ✦</button><button class="prod-secondary" type="button" data-action="copy" data-value="scriptReview">نسخ تقرير المراجعة</button></div>' +
        '<textarea class="prod-editor prod-review-editor" data-field="scriptReview" rows="10" placeholder="تقرير المراجعة سيظهر هنا: التقييم، نقاط القوة، نقاط الضعف، وأهم التعديلات المقترحة...">' + safe(project.scriptReview || '') + '</textarea>' +
        '<div class="prod-script-coach-foot"><span>التقييم تحريرّي إرشادي، وليس توقعًا للمشاهدات أو ضمانًا للانتشار.</span><button class="prod-secondary" type="button" data-ai="script_rewrite">حسّن السكريبت بناءً على التقرير ↻</button></div>' +
        (project.scriptPrevious ? '<button class="prod-mini prod-restore-script" type="button" data-action="restore-script">استعادة النسخة السابقة من السكريبت</button>' : '') + '</section>' +
        '<div class="prod-actions prod-bottom-actions"><button class="prod-secondary" type="button" data-action="back">السابق</button><button class="prod-primary" type="button" data-action="next">انتقل لخطة المونتاج ←</button></div></div>';
    }
    if (project.stage === 'edit') {
      return '<div class="prod-panel"><div class="prod-panel-heading"><div><span class="prod-kicker">EDITING ROOM</span><h2>غرفة المونتاج والإخراج</h2><p>حوّل السكريبت إلى خطة تنفيذ: صورة، تعليق صوتي، مؤثرات، وانتقالات.</p></div><span class="prod-icon">04</span></div>' +
        '<div class="prod-callout">دي خطة مونتاج مكتوبة قابلة للتنفيذ في Premiere أو CapCut، وليست تعديلًا تلقائيًا لملف الفيديو.</div>' +
        '<div class="prod-actions"><button class="prod-primary" type="button" data-ai="edit">أنشئ خطة مونتاج مفصلة ✦</button><button class="prod-secondary" type="button" data-action="copy" data-value="editPlan">نسخ خطة المونتاج</button></div>' +
        '<textarea class="prod-editor" data-field="editPlan" rows="22" placeholder="هنا هتظهر خطة المشاهد والتوقيتات والتعليق الصوتي وSFX والانتقالات...">' + safe(project.editPlan) + '</textarea>' +
        '<div class="prod-check-section"><div class="prod-output-title"><b>قائمة مراجعة المونتاج</b><span class="prod-muted">علّم على كل خطوة بعد تنفيذها</span></div><div class="prod-checkgrid">' + checklist(project) + '</div></div>' +
        '<div class="prod-actions prod-bottom-actions"><button class="prod-secondary" type="button" data-action="back">السابق</button><button class="prod-primary" type="button" data-action="next">انتقل لتجهيز النشر ←</button></div></div>';
    }
    return '<div class="prod-panel"><div class="prod-panel-heading"><div><span class="prod-kicker">PUBLISH DESK</span><h2>مكتب التجهيز للنشر</h2><p>جهّز بيانات الفيديو النهائية، وراجع كل شيء قبل إضافة موعد النشر.</p></div><span class="prod-icon">05</span></div>' +
      '<div class="prod-actions"><button class="prod-primary" type="button" data-ai="publish">جهّز حزمة النشر بالذكاء الاصطناعي ✦</button><button class="prod-secondary" type="button" data-action="copy" data-value="publishPack">نسخ حزمة النشر</button></div>' +
      '<textarea class="prod-editor" data-field="publishPack" rows="10" placeholder="اقتراحات العناوين والوصف والهاشتاجات والصورة المصغرة...">' + safe(project.publishPack) + '</textarea>' +
      '<div class="prod-fields"><label>العنوان النهائي<input data-field="publishTitle" maxlength="300" value="' + safe(project.publishTitle) + '" placeholder="اكتب عنوان الفيديو النهائي"></label>' +
      '<label>موعد النشر<input data-field="publishDate" type="date" value="' + safe(project.publishDate || '') + '"></label>' +
      '<label class="prod-field-wide">الوصف<textarea data-field="publishDescription" rows="5" placeholder="وصف الفيديو...">' + safe(project.publishDescription) + '</textarea></label>' +
      '<label class="prod-field-wide">الكلمات المفتاحية والهاشتاجات<textarea data-field="publishKeywords" rows="3" placeholder="كلمات مفتاحية وهاشتاجات...">' + safe(project.publishKeywords) + '</textarea></label>' +
      '<label class="prod-field-wide">برومبت الصورة المصغّرة<input data-field="thumbnailPrompt" maxlength="4000" value="' + safe(project.thumbnailPrompt) + '" placeholder="وصف الصورة المصغّرة المقترحة"></label></div>' +
      '<div class="prod-actions"><button class="prod-secondary" type="button" data-action="save">حفظ بيانات النشر</button><button class="prod-primary" type="button" data-action="calendar">إضافة موعد النشر للتقويم</button><button class="prod-secondary" type="button" data-action="export">تصدير ملف المشروع</button></div>' +
      '<div class="prod-divider"></div><div class="prod-output-title"><b>المراجعة النهائية قبل النشر</b><span class="prod-muted">قائمة مستقلة للمشروع</span></div><div class="prod-checkgrid">' + checklist(project) + '</div>' +
      '<div class="prod-project-danger"><button class="prod-danger" type="button" data-action="delete">حذف المشروع</button><span>الحذف يزيل هذا المشروع فقط من مساحة العمل.</span></div></div>';
  }
  function renderProject() {
    const p = activeProject();
    if (!p) { renderBlank(); return; }
    const current = Math.max(0, stages.findIndex(x => x.id === p.stage));
    view.innerHTML = '<div class="prod-head"><div><span class="eyebrow">YOUR PRODUCTION SPACE</span><h1>' + safe(p.topic) + '</h1><p>' + safe(p.platform) + ' · ' + safe(p.duration) + ' · آخر تعديل ' + safe(new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString('ar-EG')) + '</p></div><div class="prod-head-actions"><button class="prod-secondary" type="button" data-action="export">تصدير المشروع</button><button class="prod-secondary" type="button" data-action="all-projects">كل المشاريع</button></div></div>' +
      '<div class="prod-project-banner"><div><span class="prod-kicker">PRODUCTION PROGRESS</span><strong>' + (current + 1) + ' <small>/ 5</small></strong><span class="prod-project-banner-title">' + stageName(p.stage) + '</span></div><div class="prod-progress"><span style="width:' + ((current + 1) * 20) + '%"></span></div><div class="prod-banner-meta"><span>' + safe(p.niche) + '</span><span>' + safe(p.audience || 'الجمهور غير محدد') + '</span></div></div>' +
      stageBar(p) + '<div class="prod-current-stage">' + renderStage(p) + '</div>';
  }
  function render() {
    if (!activeProject() && activeId) activeId = '';
    renderProject();
  }
  function createProject() {
    const topic = $('prodTopic', view)?.value.trim();
    if (!topic) return app.toast('اكتب موضوع المشروع الأول.');
    const p = {
      id:uid(),kind:'production_project',topic:topic,
      niche:$('prodNiche',view).value,platform:$('prodPlatform',view).value,
      audience:$('prodAudience',view).value.trim(),duration:$('prodDuration',view).value,
      tone:$('prodTone',view).value,stage:'brief',
      researchText:'',researchSources:[],factClaim:'',factText:'',factSources:[],
      script:'',scriptReview:'',scriptPrevious:'',editPlan:'',publishPack:'',publishTitle:'',publishDescription:'',
      publishKeywords:'',thumbnailPrompt:'',publishDate:'',checklist:{},attachments:[],
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
    };
    activeId = p.id;
    persist(p,false);
    render();
    app.toast('اتعمل مشروعك. ابدأ بتأكيد التفاصيل ثم انتقل للبحث.');
  }
  function readProjectField(element) {
    const p = activeProject();
    if (!p) return;
    const key = element.dataset.field;
    if (!key) return;
    p[key] = element.value;
  }
  function getFieldText(p,key) { return String(p[key] || ''); }
  function copyText(value) {
    const text = String(value || '');
    if (!text) return app.toast('مفيش محتوى للنسخ لسه.');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => app.toast('تم النسخ.')).catch(() => fallbackCopy(text));
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const box = document.createElement('textarea');
    box.value = text; document.body.appendChild(box); box.select();
    try { document.execCommand('copy'); app.toast('تم النسخ.'); } catch (_) { app.toast('تعذر النسخ من المتصفح.'); }
    box.remove();
  }
  function downloadProject(p) {
    const payload = {
      app:'انطلاقتك',type:'production_project',exportedAt:new Date().toISOString(),
      project:p
    };
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;a.download='entelaqtak-production-'+String(p.topic||'project').replace(/[^\w\u0600-\u06FF-]+/g,'-').slice(0,50)+'.json';
    a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  function downloadText(p,key) {
    const block = [
      'مشروع انطلاقتك: '+p.topic,
      'المنصة: '+p.platform+' | المدة: '+p.duration+' | المجال: '+p.niche,
      '',
      '=== البحث ===',p.researchText,
      '',
      '=== مصادر البحث ===',(p.researchSources||[]).map(x=>x.title+' — '+x.url).join('\n'),
      '',
      '=== تدقيق الحقائق ===',p.factClaim,p.factText,
      '',
      '=== السكريبت ===',p.script,
      '',
      '=== مراجعة جودة السكريبت ===',p.scriptReview || '',
      '',
      '=== النسخة السابقة من السكريبت ===',p.scriptPrevious || '',
      '',
      '=== خطة المونتاج ===',p.editPlan,
      '',
      '=== حزمة النشر ===',p.publishPack,
      'العنوان: '+p.publishTitle,
      'الوصف: '+p.publishDescription,
      'الكلمات: '+p.publishKeywords,
      'برومبت الصورة: '+p.thumbnailPrompt
    ].join('\n');
    const blob = new Blob(['\uFEFF'+block],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='entelaqtak-production-notes.txt';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  async function runAI(task,button) {
    const p = activeProject();
    if (!p) return;
    if (!p.topic.trim()) return app.toast('اكتب موضوع المشروع أولًا.');
    const old = button.textContent;
    button.disabled = true; button.textContent = 'جاري العمل...';
    try {
      let result, payload;
      if (task === 'research') {
        payload = {topic:p.topic,niche:p.niche,platform:p.platform,audience:p.audience,region:'مصر',request:'ابحث عن هذا الموضوع لصناعة فيديو عربي. أريد 6 إلى 8 نقاط مرتبة زمنيًا إذا كان الموضوع تاريخيًا، وتفريقًا واضحًا بين الوقائع المؤكدة والآراء، وزوايا سرد، وأسماء وتواريخ تستحق التحقق. لا تستخدم مصادر غير واضحة.'};
        result = await app.callAI('research',payload,{fullResponse:true});
        p.researchText = result.text || '';
        p.researchSources = Array.isArray(result.sources) ? result.sources.filter(x => x && typeof x.url === 'string' && x.url.startsWith('https://')).slice(0,12) : [];
        p.stage = 'research';
      } else if (task === 'fact') {
        const claim = p.factClaim.trim();
        if (!claim) throw new Error('اكتب الادعاء الذي تريد التحقق منه.');
        payload = {claim,topic:p.topic,region:'مصر',context:p.researchText.slice(0,5000)};
        result = await app.callAI('fact_check',payload,{fullResponse:true});
        p.factText = result.text || '';
        p.factSources = Array.isArray(result.sources) ? result.sources.filter(x => x && typeof x.url === 'string' && x.url.startsWith('https://')).slice(0,12) : [];
        p.stage = 'research';
      } else if (task === 'script') {
        payload = {topic:p.topic,duration:p.duration,style:p.tone,audience:p.audience,points:('ملاحظات البحث:\n'+p.researchText+'\nنتيجة التحقق:\n'+p.factText).slice(0,8500),request:'اكتب سكريبتًا عربيًا كاملًا مناسبًا للمدة، بمقدمة خطافة، وتسلسل منطقي، وانتقالات بين المحاور، وخاتمة ودعوة للتفاعل. لا تضف معلومة غير مدعومة بالمراجع.'};
        result = await app.callAI('script',payload);
        p.script = result;
        p.stage = 'script';
      } else if (task === 'script_review') {
        if (!String(p.script || '').trim()) throw new Error('اكتب السكريبت أو ولّده أولًا قبل التقييم.');
        payload = {
          topic:p.topic, platform:p.platform, duration:p.duration, tone:p.tone, audience:p.audience,
          script:String(p.script).slice(0,8200),
          research:String(p.researchText || '').slice(0,900),
          factCheck:String(p.factText || '').slice(0,700),
          request:[
            'أنت محرر سكريبتات فيديو عربي محترف. نفّذ مراجعة تحريرية دقيقة للنص، لا تعِد كتابة السكريبت.',
            'ابدأ بتقييم إجمالي من 100، ثم قيّم من 10: قوة أول 15 ثانية، وضوح الوعد للمشاهد، البناء والتسلسل، الاحتفاظ والإيقاع، طبيعية اللغة، وقوة الخاتمة.',
            'بعد الدرجات اذكر: أقوى 3 نقاط، أضعف 3 نقاط مع أمثلة مقتبسة قصيرة من النص، مواضع الحشو أو التكرار، أماكن الانتقال الضعيف، وأهم 5 تعديلات مرتبة حسب الأولوية.',
            'افحص الادعاءات الواقعية مقارنة بسياق البحث والتحقق المرفق فقط. لا تؤكد معلومة بلا دليل؛ صنّف ما يحتاج مصدرًا إضافيًا بوضوح.',
            'اقترح مثالًا بديلًا أقوى للخطاف، ومثالًا واحدًا لتحسين انتقال ضعيف، من غير اختلاق حقائق.',
            'اكتب بلغة عربية مصرية واضحة. لا تدّعِ توقع عدد المشاهدات أو ضمان الانتشار؛ التقييم تحريري إرشادي وليس تنبؤًا بالأداء.'
          ].join('\\n')
        };
        result = await app.callAI('assistant',payload);
        p.scriptReview = result;
        p.stage = 'script';
      } else if (task === 'script_rewrite') {
        if (!String(p.script || '').trim()) throw new Error('اكتب السكريبت أولًا.');
        if (!String(p.scriptReview || '').trim()) throw new Error('نفّذ مراجعة السكريبت أولًا عشان التحسين يبني على ملاحظات واضحة.');
        payload = {
          topic:p.topic, platform:p.platform, duration:p.duration, tone:p.tone, audience:p.audience,
          script:String(p.script).slice(0,7600),
          review:String(p.scriptReview).slice(0,2500),
          research:String(p.researchText || '').slice(0,700),
          factCheck:String(p.factText || '').slice(0,500),
          request:[
            'أعد كتابة السكريبت كاملًا في نسخة محسّنة، وطبّق الملاحظات التحريرية ذات الأولوية الواردة في تقرير المراجعة.',
            'حافظ على الموضوع والجمهور والمنصة والمدة والأسلوب المحدد، وقوّ الخطاف والتسلسل والانتقالات والإيقاع والخاتمة.',
            'لا تضف أسماء أو تواريخ أو أرقامًا أو اقتباسات أو وقائع جديدة. التزم بسياق البحث والتحقق؛ وعند وجود معلومة غير مدعومة استخدم صياغة حذرة أو ضع [يحتاج مصدر] بدل اختلاقها.',
            'أخرج السكريبت النهائي فقط، جاهزًا للقراءة والتسجيل، من دون درجات أو مقدمة عن عملك.'
          ].join('\\n')
        };
        const previousScript = p.script;
        result = await app.callAI('assistant',payload);
        p.scriptPrevious = previousScript;
        p.script = result;
        p.stage = 'script';
      } else if (task === 'edit') {
        payload = {topic:p.topic,platform:p.platform,duration:p.duration,tone:p.tone,script:p.script.slice(0,9000),request:'حوّل السكريبت إلى خطة مونتاج تنفيذية دقيقة. أخرج جدولًا زمنيًا متسلسلًا فيه: الزمن أو مدة اللقطة، جملة التعليق الصوتي المرتبطة، الصورة أو الفيديو المطلوب، حركة الكاميرا أو الزوم، النص على الشاشة، SFX، الموسيقى، الانتقال، وملاحظات التنفيذ. افصل قائمة المؤثرات الصوتية SFX في النهاية، وقائمة المواد البصرية التي يجب جمعها. لا تخترع روابط تحميل أو تدّعي أنك شاهدت ملفات غير مرفقة.'};
        result = await app.callAI('assistant',payload);
        p.editPlan = result;
        p.stage = 'edit';
      } else if (task === 'publish') {
        payload = {topic:p.topic,niche:p.niche,platform:p.platform,audience:p.audience,tone:p.tone,duration:p.duration,script:p.script.slice(0,8500),request:'جهّز حزمة ما قبل النشر لهذا السكريبت فقط: 5 عناوين دقيقة غير مضللة، وصف مناسب للمنصة، كلمات مفتاحية وهاشتاجات محدودة، فكرة صورة مصغرة وبرومبت بصري احترافي. لا تعِد كتابة السكريبت كاملًا، ولا تدّعِ أرقام بحث أو ترند غير موثقة.'};
        result = await app.callAI('content_pack',payload);
        p.publishPack = result;
        p.stage = 'publish';
      }
      persist(p,false);
      render();
      app.toast('تم حفظ نتيجة المرحلة داخل المشروع.');
    } catch (error) {
      console.error('Production AI task failed:',error);
      app.toast(error.message || 'تعذر تنفيذ المهمة. جرّب مرة أخرى.');
    } finally {
      button.disabled = false; button.textContent = old;
    }
  }

  view.addEventListener('click', async event => {
    const aiButton = event.target.closest('[data-ai]');
    if (aiButton) { await runAI(aiButton.dataset.ai,aiButton); return; }
    const stageButton = event.target.closest('[data-stage]');
    if (stageButton) {
      const p=activeProject(); if(!p)return;
      p.stage=stageButton.dataset.stage;persist(p,false);render();return;
    }
    const pickButton = event.target.closest('[data-pick]');
    if (pickButton) { activeId=pickButton.dataset.pick; try{localStorage.setItem('entelaqtak-active-production-v1',activeId);}catch(_){} render(); return; }
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action, p=activeProject();
    if (action==='create') { createProject(); return; }
    if (action==='all-projects') { activeId='';try{localStorage.removeItem('entelaqtak-active-production-v1');}catch(_){}render();return; }
    if (!p) return;
    if (action==='save') { persist(p,true);return; }
    if (action==='next' || action==='back') {
      const index=stages.findIndex(x=>x.id===p.stage);
      p.stage=stages[Math.max(0,Math.min(stages.length-1,index+(action==='next'?1:-1)))].id;
      persist(p,false);render();return;
    }
    if (action==='copy') { copyText(getFieldText(p,button.dataset.value));return; }
    if (action==='restore-script') {
      if (!p.scriptPrevious) return app.toast('مفيش نسخة سابقة محفوظة.');
      const current = p.script;
      p.script = p.scriptPrevious;
      p.scriptPrevious = current;
      persist(p,false);
      render();
      app.toast('تم استعادة النسخة السابقة. تقدر تبدّل بين النسختين من نفس الزر.');
      return;
    }
    if (action==='export') { downloadProject(p);return; }
    if (action==='calendar') {
      const date=p.publishDate;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return app.toast('حدد تاريخ النشر أولًا.');
      const data=app.getState();
      if (!Array.isArray(data.posts)) data.posts=[];
      const title=(p.publishTitle||p.topic).trim();
      const exists=data.posts.some(x=>x.productionProjectId===p.id);
      if (!exists) data.posts.push({id:uid(),title,date,platform:p.platform,status:'plan',productionProjectId:p.id});
      else data.posts=data.posts.map(x=>x.productionProjectId===p.id?{...x,title,date,platform:p.platform}:x);
      persist(p,false);app.save();app.go('calendar');app.toast('اتضاف موعد المشروع لتقويم النشر. راجع الموعد قبل النشر.');return;
    }
    if (action==='delete') {
      if (!confirm('تحذف المشروع ده بكل البحث والسكريبت وخطة المونتاج؟ سيتم حذف الملفات السحابية المرفقة به أيضًا.')) return;
      const trigger=event.target.closest('[data-action="delete"]');
      if(trigger)trigger.disabled=true;
      const removeProject=()=>{const data=app.getState();data.productionProjects=data.productionProjects.filter(x=>String(x.id)!==String(p.id));activeId='';try{localStorage.removeItem('entelaqtak-active-production-v1');}catch(_){}app.save();render();app.toast('تم حذف المشروع ومرفقاته.');};
      const cleanup=window.EntelaqtakProjectAssets?.deleteProjectFiles;
      if(cleanup)cleanup(p).then(removeProject).catch(error=>{if(trigger)trigger.disabled=false;app.toast(error?.message||'تعذر حذف الملفات السحابية؛ المشروع لم يُحذف.');});
      else removeProject();
      return;
    }
  });

  view.addEventListener('change', event => {
    const p=activeProject();if(!p)return;
    const field=event.target.closest('[data-field]');
    if(field){readProjectField(field);persist(p,false);return;}
    const check=event.target.closest('[data-check]');
    if(check){if(!p.checklist)p.checklist={};p.checklist[check.dataset.check]=check.checked;persist(p,false);}
  });
  view.addEventListener('input', event => {
    const p=activeProject();if(!p)return;
    const field=event.target.closest('[data-field]');
    if(field) readProjectField(field);
  });

  app.openProductionProject = function(id) {
    const project = projects().find(item => String(item.id) === String(id));
    if (!project) return false;
    activeId = String(project.id);
    try { localStorage.setItem('entelaqtak-active-production-v1', activeId); } catch (_) {}
    render();
    return true;
  };

  const oldGo=app.go;
  app.addViews.add('production');
  app.go = function(id) {
    oldGo(id);
    if (id === 'production') {
      // The core router runs before deferred feature modules. Re-activate the
      // production view explicitly so a saved initial route cannot leave Home visible.
      document.querySelectorAll('.view').forEach(item => {
        item.classList.toggle('active', item === view);
      });
      view.classList.add('active');
      const title = document.getElementById('pageTitle');
      if (title) title.textContent = 'استوديو الإنتاج';
      render();
    }
  };
  render();
  // Restore a previously selected Production Studio after this deferred module
  // creates its view; the initial router may have run before the view existed.
  try {
    if (localStorage.getItem('entelaqtak-last-view-v1') === 'production') {
      app.go('production');
    }
  } catch (_) {}
  window.__entelaqtakProductionStudioStatus = 'ready';
  window.dispatchEvent(new CustomEvent('entelaqtak:production-ready'));
  } catch (error) {
    window.__entelaqtakProductionStudioStatus = 'error';
    console.error('Production Studio initialization failed:', error);
    const main = document.querySelector('.main');
    if (!main) return;
    let view = document.getElementById('view-production');
    if (!view) {
      view = document.createElement('section');
      view.id = 'view-production';
      const footer = main.querySelector('footer');
      if (footer) main.insertBefore(view, footer); else main.appendChild(view);
    }
    view.className = 'view active prod-init-error';
    view.setAttribute('role','alert');
    view.innerHTML = '<div style="max-width:760px;margin:34px auto;padding:26px;border:1px solid #365477;border-radius:18px;background:linear-gradient(145deg,#14243a,#0d1727);color:#edf4ff;text-align:center"><div style="font-size:32px;margin-bottom:12px">⚠</div><h2 style="margin:0 0 10px">تعذر تشغيل استوديو الإنتاج</h2><p style="color:#a9bdd6;line-height:1.9;margin:0 0 18px">حصل خطأ أثناء تجهيز الاستوديو، لكن باقي مساحة العمل لم تتأثر. أعد تحميل الصفحة للمحاولة مرة أخرى.</p><button type="button" id="prodInitRetry" style="padding:10px 18px;border:1px solid #3b82f6;border-radius:10px;background:#2563eb;color:#fff;font-weight:800">إعادة المحاولة</button><small style="display:block;margin-top:12px;color:#7188a5">رمز المشكلة: PROD-INIT</small></div>';
    document.querySelectorAll('.view').forEach(item => item.classList.toggle('active', item === view));
    const title = document.getElementById('pageTitle');
    if (title) title.textContent = 'استوديو الإنتاج';
    document.getElementById('prodInitRetry')?.addEventListener('click', () => window.location.reload());
  }
})();
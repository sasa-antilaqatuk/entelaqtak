/* Entelaqtak Projects Hub v1 — one searchable home for every production project. */
(() => {
  'use strict';
  const app = window.EntelaqtakApp;
  const main = document.querySelector('.main');
  const nav = document.getElementById('nav');
  if (!app || !main || !nav || window.__entelaqtakProjectsHubReady) return;
  window.__entelaqtakProjectsHubReady = true;

  const $ = (selector, root=document) => root.querySelector(selector);
  const safe = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
  const stages = [
    { id:'brief', label:'تفاصيل المشروع', short:'التفاصيل', hint:'حدد الفكرة والجمهور' },
    { id:'research', label:'البحث والمصادر', short:'البحث', hint:'اجمع المعلومات وراجعها' },
    { id:'script', label:'السكريبت', short:'السكريبت', hint:'اكتب النص وراجعه' },
    { id:'edit', label:'خطة المونتاج', short:'المونتاج', hint:'جهز المشاهد والصوت' },
    { id:'publish', label:'النشر', short:'النشر', hint:'جهز الحزمة النهائية' }
  ];
  const projectList = () => {
    const list = app.getState().productionProjects;
    return Array.isArray(list) ? list.filter(item => item && item.kind === 'production_project') : [];
  };
  const stageIndex = project => Math.max(0, stages.findIndex(item => item.id === project.stage));
  const projectDate = project => {
    const raw = project.updatedAt || project.createdAt;
    if (!raw) return 'جديد';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? 'جديد' : date.toLocaleDateString('ar-EG', {day:'numeric',month:'short',year:'numeric'});
  };
  const progress = project => Math.round(((stageIndex(project) + 1) / stages.length) * 100);
  const getId = () => 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);

  app.addViews.add('projects');

  let view = document.getElementById('view-projects');
  if (!view) {
    view = document.createElement('section');
    view.className = 'view';
    view.id = 'view-projects';
    view.setAttribute('aria-label', 'مركز مشاريعي');
    const footer = main.querySelector('footer');
    if (footer) main.insertBefore(view, footer);
    else main.appendChild(view);
  }

  let navButton = nav.querySelector('[data-view="projects"]');
  if (!navButton) {
    navButton = document.createElement('button');
    navButton.type = 'button';
    navButton.dataset.view = 'projects';
    navButton.innerHTML = '<i>▦</i><span>مشاريعي</span>';
    nav.appendChild(navButton);
  }
  navButton.addEventListener('click', () => app.go('projects'));

  let searchTerm = '';
  let activeFilter = 'all';

  function openProject(id, stage) {
    const project = projectList().find(item => String(item.id) === String(id));
    if (!project) {
      app.toast('المشروع ده مش موجود في مساحة العمل.');
      render();
      return;
    }
    project.stage = stages.some(item => item.id === stage) ? stage : (project.stage || 'brief');
    project.updatedAt = new Date().toISOString();
    app.save();
    if (typeof app.openProductionProject === 'function') app.openProductionProject(project.id);
    app.go('production');
  }

  function createProject(form) {
    const data = new FormData(form);
    const topic = String(data.get('topic') || '').trim();
    if (!topic) {
      app.toast('اكتب اسم أو موضوع المشروع الأول.');
      $('[name="topic"]', form)?.focus();
      return;
    }
    const stamp = new Date().toISOString();
    const project = {
      id:getId(),
      kind:'production_project',
      topic:topic.slice(0,500),
      niche:String(data.get('niche') || '').trim().slice(0,120),
      platform:String(data.get('platform') || 'YouTube'),
      audience:String(data.get('audience') || '').trim().slice(0,500),
      duration:String(data.get('duration') || '8–10 دقائق'),
      tone:String(data.get('tone') || 'وثائقي وتحليلي'),
      stage:'brief',
      researchText:'',
      researchSources:[],
      factClaim:'',
      factText:'',
      factSources:[],
      script:'',
      scriptReview:'',
      scriptPrevious:'',
      editPlan:'',
      publishPack:'',
      publishTitle:'',
      publishDescription:'',
      publishKeywords:'',
      thumbnailPrompt:'',
      publishDate:'',
      checklist:{},
      attachments:[],
      createdAt:stamp,
      updatedAt:stamp
    };
    const state = app.getState();
    if (!Array.isArray(state.productionProjects)) state.productionProjects = [];
    state.productionProjects.unshift(project);
    app.save();
    app.toast('اتعمل مشروع جديد واتحفظ في مساحة عملك.');
    openProject(project.id, 'brief');
  }

  function projectCard(project) {
    const step = stageIndex(project);
    const percent = progress(project);
    const scriptReady = String(project.script || '').trim().length > 0;
    const researchReady = String(project.researchText || '').trim().length > 0;
    const editReady = String(project.editPlan || '').trim().length > 0;
    const stage = stages[step];
    const haystack = [project.topic,project.niche,project.platform,project.audience,stage.label].join(' ').toLocaleLowerCase('ar');
    const filterHidden = (searchTerm && !haystack.includes(searchTerm)) ||
      (activeFilter === 'active' && step === stages.length - 1 && String(project.publishPack || '').trim()) ||
      (activeFilter === 'not-started' && (step !== 0 || researchReady || scriptReady || editReady)) ||
      (activeFilter === 'ready' && !(String(project.publishPack || '').trim() || String(project.publishTitle || '').trim()));
    return '<article class="ph-project-card" data-project-card="' + safe(project.id) + '" data-search="' + safe(haystack) + '" ' + (filterHidden ? 'hidden' : '') + '>' +
      '<div class="ph-card-top"><span class="ph-card-icon">🎬</span><span class="ph-card-stage">' + safe(stage.short) + '</span><button type="button" class="ph-card-menu" data-ph-action="duplicate" data-id="' + safe(project.id) + '" aria-label="نسخ المشروع" title="عمل نسخة">⋯</button></div>' +
      '<h3>' + safe(project.topic || 'مشروع بدون عنوان') + '</h3>' +
      '<p class="ph-card-meta">' + safe(project.platform || 'YouTube') + ' <span>•</span> ' + safe(project.duration || 'المدة غير محددة') + '</p>' +
      '<div class="ph-progress-head"><span>تقدم المشروع</span><strong>' + percent + '%</strong></div><div class="ph-progress"><span style="width:' + percent + '%"></span></div>' +
      '<div class="ph-card-stats"><span class="' + (researchReady ? 'is-done' : '') + '">بحث ' + (researchReady ? '✓' : '—') + '</span><span class="' + (scriptReady ? 'is-done' : '') + '">سكريبت ' + (scriptReady ? '✓' : '—') + '</span><span class="' + (editReady ? 'is-done' : '') + '">مونتاج ' + (editReady ? '✓' : '—') + '</span><span>مرفقات ' + (Array.isArray(project.attachments) ? project.attachments.length : 0) + '</span></div>' +
      '<div class="ph-card-bottom"><span>آخر تعديل: ' + safe(projectDate(project)) + '</span><button type="button" class="ph-open-btn" data-ph-action="open" data-id="' + safe(project.id) + '">افتح المشروع <span>←</span></button></div>' +
      '<div class="ph-stage-actions">' + stages.map(item => '<button type="button" data-ph-action="stage" data-stage="' + item.id + '" data-id="' + safe(project.id) + '" class="' + (item.id === project.stage ? 'is-current' : '') + '">' + safe(item.short) + '</button>').join('') + '</div>' +
      '<div class="ph-card-tools"><button type="button" data-ph-action="export" data-id="' + safe(project.id) + '">تصدير نسخة</button><button type="button" class="is-danger" data-ph-action="delete" data-id="' + safe(project.id) + '">حذف</button></div>' +
    '</article>';
  }

  function render() {
    const projects = projectList().slice().sort((a,b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
    const completed = projects.filter(project => project.stage === 'publish' && (String(project.publishPack || '').trim() || String(project.publishTitle || '').trim())).length;
    const scripts = projects.filter(project => String(project.script || '').trim()).length;
    const researched = projects.filter(project => String(project.researchText || '').trim()).length;
    view.innerHTML =
      '<div class="ph-head"><div><span class="ph-kicker">ENTELAQTAK · PROJECT CONTROL</span><h1>مركز مشاريعي <span>▦</span></h1><p>كل فيديو في مساحة مستقلة؛ من الفكرة والبحث لحد السكريبت والمونتاج والنشر.</p></div><div class="ph-head-actions"><a href="./script-studio.html">🎙️ SASA Script Studio</a><button type="button" class="ph-new-top" data-ph-scroll-create>＋ مشروع جديد</button></div></div>' +
      '<div class="ph-stat-grid"><div class="ph-stat"><span>إجمالي المشاريع</span><strong>' + projects.length + '</strong><small>مشروعات محفوظة</small></div><div class="ph-stat"><span>مشاريع فيها بحث</span><strong>' + researched + '</strong><small>مصادر ومعلومات</small></div><div class="ph-stat"><span>سكريبتات جاهزة</span><strong>' + scripts + '</strong><small>نصوص مكتوبة</small></div><div class="ph-stat"><span>جاهزة للنشر</span><strong>' + completed + '</strong><small>حزم مكتملة</small></div></div>' +
      '<div class="ph-main-grid"><section class="ph-library"><div class="ph-section-head"><div><span class="ph-kicker">YOUR WORKSPACE</span><h2>كل مشاريعك</h2><p>اختار المشروع وكمّل من آخر مرحلة وصلت لها.</p></div><span class="ph-count">' + projects.length + ' مشروع</span></div>' +
      '<div class="ph-toolbar"><label class="ph-search"><span>⌕</span><input id="phSearch" type="search" value="' + safe(searchTerm) + '" placeholder="ابحث باسم المشروع أو المنصة..." aria-label="ابحث في المشاريع"></label><div class="ph-filters"><button type="button" data-ph-filter="all" class="' + (activeFilter === 'all' ? 'is-active' : '') + '">الكل</button><button type="button" data-ph-filter="active" class="' + (activeFilter === 'active' ? 'is-active' : '') + '">قيد التنفيذ</button><button type="button" data-ph-filter="not-started" class="' + (activeFilter === 'not-started' ? 'is-active' : '') + '">لسه بادئة</button><button type="button" data-ph-filter="ready" class="' + (activeFilter === 'ready' ? 'is-active' : '') + '">جاهزة</button></div></div>' +
      '<div class="ph-project-grid" id="phProjectGrid">' + (projects.length ? projects.map(projectCard).join('') : '<div class="ph-empty"><span>✦</span><h3>ابدأ أول مشروع ليك</h3><p>أنشئ مساحة تجمع البحث والسكريبت وخطة المونتاج وحزمة النشر في مكان واحد.</p><button type="button" data-ph-scroll-create>＋ أنشئ أول مشروع</button></div>') + '<div class="ph-no-results" id="phNoResults" ' + (projects.length ? 'hidden' : '') + '>مش لاقيين مشروع مطابق للبحث. جرّب كلمة تانية.</div></div>' +
      '</section><aside class="ph-create-panel" id="phCreatePanel"><div class="ph-create-icon">✦</div><span class="ph-kicker">START SOMETHING GREAT</span><h2>مشروع محتوى جديد</h2><p>اكتب التفاصيل الأساسية، وانطلاقتك هتجهز لك مساحة شغل كاملة.</p><form id="phCreateForm"><label>موضوع أو اسم المشروع<input name="topic" maxlength="500" placeholder="مثلاً: مين قتل البرازيل؟" required></label><label>المنصة<select name="platform"><option>YouTube</option><option>YouTube Shorts</option><option>TikTok</option><option>Instagram Reels</option><option>Facebook</option><option>أخرى</option></select></label><label>المدة المستهدفة<select name="duration"><option>8–10 دقائق</option><option>5–7 دقائق</option><option>10–15 دقيقة</option><option>30–60 ثانية</option><option>أقل من 30 ثانية</option><option>غير محددة</option></select></label><label>مجال المحتوى<input name="niche" maxlength="120" placeholder="ترفيهي، رياضي، وثائقي..."></label><label>الجمهور المستهدف<input name="audience" maxlength="500" placeholder="مين هيتفرج على المحتوى؟"></label><label>أسلوب التقديم<select name="tone"><option>وثائقي وتحليلي</option><option>ترفيهي</option><option>كوميدي</option><option>حماسي</option><option>تعليمي مباشر</option><option>عامية بيضاء</option></select></label><button type="submit" class="ph-create-submit">إنشاء المشروع وابدأ الشغل <span>←</span></button></form><div class="ph-cloud-note"><span>☁</span><div><b>حفظ تلقائي</b><small>المشروع يدخل ضمن حفظ مساحة العمل. ومع تسجيل الدخول تتم مزامنته مع حسابك.</small></div></div></aside></div>';
    const input = $('#phSearch', view);
    if (input) {
      input.addEventListener('input', () => {
        searchTerm = input.value.trim().toLocaleLowerCase('ar');
        applyFilters();
      });
    }
  }

  function applyFilters() {
    const cards = Array.from(view.querySelectorAll('[data-project-card]'));
    cards.forEach(card => {
      const text = (card.dataset.search || '').toLocaleLowerCase('ar');
      const project = projectList().find(item => String(item.id) === card.dataset.projectCard);
      let hidden = !!(searchTerm && !text.includes(searchTerm));
      if (project && activeFilter === 'active') hidden = hidden || (project.stage === 'publish' && (String(project.publishPack || '').trim() || String(project.publishTitle || '').trim()));
      if (project && activeFilter === 'not-started') hidden = hidden || (stageIndex(project) !== 0 || String(project.researchText || '').trim() || String(project.script || '').trim() || String(project.editPlan || '').trim());
      if (project && activeFilter === 'ready') hidden = hidden || !(String(project.publishPack || '').trim() || String(project.publishTitle || '').trim());
      card.hidden = hidden;
    });
    const noResults = $('#phNoResults', view);
    if (noResults) noResults.hidden = cards.length === 0 || cards.some(card => !card.hidden);
  }

  view.addEventListener('submit', event => {
    if (event.target.id !== 'phCreateForm') return;
    event.preventDefault();
    createProject(event.target);
  });
  view.addEventListener('click', event => {
    const scrollButton = event.target.closest('[data-ph-scroll-create]');
    if (scrollButton) {
      $('#phCreatePanel', view)?.scrollIntoView({behavior:'smooth',block:'start'});
      $('[name="topic"]', view)?.focus({preventScroll:true});
      return;
    }
    const filter = event.target.closest('[data-ph-filter]');
    if (filter) {
      activeFilter = filter.dataset.phFilter || 'all';
      view.querySelectorAll('[data-ph-filter]').forEach(button => button.classList.toggle('is-active', button === filter));
      applyFilters();
      return;
    }
    const button = event.target.closest('[data-ph-action]');
    if (!button) return;
    const id = button.dataset.id;
    const project = projectList().find(item => String(item.id) === String(id));
    if (!project) return;
    const action = button.dataset.phAction;
    if (action === 'open') { openProject(id, project.stage); return; }
    if (action === 'stage') { openProject(id, button.dataset.stage); return; }
    if (action === 'duplicate') {
      const copy = JSON.parse(JSON.stringify(project));
      copy.id = getId();
      copy.topic = String(project.topic || 'مشروع') + ' — نسخة';
      copy.attachments = (Array.isArray(project.attachments) ? project.attachments : []).filter(item => item && item.kind === 'library').map(item => ({...item,id:getId()}));
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      app.getState().productionProjects.unshift(copy);
      app.save();
      app.toast('اتعملت نسخة مستقلة من المشروع بكل محتوياته.');
      render();
      return;
    }
    if (action === 'delete') {
      if (!confirm('تحذف المشروع ده بكل البحث والسكريبت وخطة المونتاج؟ سيتم حذف الملفات السحابية المرفقة به أيضًا.')) return;
      button.disabled = true;
      const removeProject = () => {
        const state = app.getState();
        state.productionProjects = state.productionProjects.filter(item => String(item.id) !== String(id));
        try { if (localStorage.getItem('entelaqtak-active-production-v1') === String(id)) localStorage.removeItem('entelaqtak-active-production-v1'); } catch (_) {}
        app.save();
        app.toast('تم حذف المشروع ومرفقاته.');
        render();
      };
      const cleanup = window.EntelaqtakProjectAssets?.deleteProjectFiles;
      if (cleanup) cleanup(project).then(removeProject).catch(error => { button.disabled = false; app.toast(error?.message || 'تعذر حذف الملفات السحابية؛ المشروع لم يُحذف.'); });
      else removeProject();
      return;
    }
    if (action === 'export') {
      const payload = {app:'انطلاقتك',type:'production_project',exportedAt:new Date().toISOString(),project};
      const blob = new Blob(['\uFEFF' + JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'entelaqtak-project-' + String(project.topic || 'project').replace(/[^\w\u0600-\u06FF-]+/g,'-').slice(0,48) + '.json';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url),1200);
    }
  });

  const previousGo = app.go;
  app.go = function(id) {
    previousGo(id);
    if (id === 'projects') {
      document.querySelectorAll('.view').forEach(item => item.classList.toggle('active', item === view));
      view.classList.add('active');
      const title = document.getElementById('pageTitle');
      if (title) title.textContent = 'مركز مشاريعي';
      render();
    }
  };

  render();
  try {
    if (localStorage.getItem('entelaqtak-last-view-v1') === 'projects') app.go('projects');
  } catch (_) {}
  window.EntelaqtakProjects = {refresh:render,open:openProject};
})();

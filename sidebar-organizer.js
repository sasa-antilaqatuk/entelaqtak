/* Entelaqtak Navigation Organizer v5 — one always-visible menu with an accessible compact-screen drawer. */
(() => {
  'use strict';

  const nav = document.getElementById('nav');
  const sidebar = document.getElementById('workspaceSidebar') || nav?.closest('.sidebar');
  if (!nav || !sidebar || nav.dataset.organizedV5 === 'true') return;
  nav.dataset.organizedV5 = 'true';

  const sections = [
    { id:'discover', title:'الأفكار والبحث', items:[
      ['ideas','أفكار المحتوى','✧'],['trends','رادار الموضوعات','◎'],['brain','عقل المحتوى الذكي','✦']
    ]},
    { id:'create', title:'صناعة المحتوى', items:[
      ['projects','مشاريعي','▦'],['production','استوديو الإنتاج','▶'],['studio','استوديو المحتوى','✍'],['script','كاتب السكريبت','▤'],['repurpose','إعادة تدوير المحتوى','♻']
    ], external:[['./script-studio.html','SASA Script Studio','🎙️']]},
    { id:'design', title:'التصميم والتحسين', items:[
      ['titles','العناوين والصورة','▣'],['thumbnail','مصمم الصور المصغّرة','▧'],['seo','مساعد SEO','⌕'],
      ['video','مصنع الفيديوهات','▷'],['brand','هوية المحتوى','◈'],['lab','مختبر العناوين','⚗']
    ]},
    { id:'publish', title:'النشر وقياس الأداء', items:[
      ['calendar','تقويم النشر','▦'],['analytics','متابعة الأداء','▥']
    ]},
    { id:'learn', title:'التعلّم والتطوير', items:[
      ['guide','دليل الاستخدام','؟'],['challenge','تحدي 30 يوم','♜'],['academy','أكاديمية انطلاقتك','★']
    ]},
    { id:'account', title:'الحساب والمساعدة', items:[
      ['connections','ربط المنصات','◉'],['support','الدعم والمساعدة','?'],['settings','الإعدادات والبيانات','⚙']
    ]},
    { id:'library', title:'المكتبة والملفات', items:[
      ['library','مكتبتي والملفات','▤']
    ]}
  ];

  const buttons = new Map(
    Array.from(nav.querySelectorAll('button[data-view]')).map(button => [button.dataset.view, button])
  );
  if (!buttons.size) return;

  const known = new Set(['home', ...sections.flatMap(section => section.items.map(item => item[0]))]);
  const extras = Array.from(buttons.values()).filter(button => !known.has(button.dataset.view));
  if (extras.length) {
    sections.push({
      id:'extra',
      title:'أدوات إضافية',
      items:extras.map(button => [
        button.dataset.view,
        button.dataset.navLabel || button.textContent.trim(),
        button.querySelector('i')?.textContent || '✦'
      ])
    });
  }

  function decorate(button, label, glyph) {
    let icon = button.querySelector('i.nav-icon') || button.querySelector('i');
    if (!icon) icon = document.createElement('i');
    icon.textContent = glyph;
    icon.setAttribute('aria-hidden', 'true');
    icon.classList.add('nav-icon');

    const labelElement = document.createElement('span');
    labelElement.className = 'nav-label';
    labelElement.textContent = label;

    button.type = 'button';
    button.dataset.navLabel = label;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.replaceChildren(icon, labelElement);
    button.classList.add('nav-item-organized');
  }

  for (const section of sections) {
    section.items = section.items.filter(([id]) => buttons.has(id));
    section.items.forEach(([id, label, glyph]) => decorate(buttons.get(id), label, glyph));
  }
  if (buttons.has('home')) decorate(buttons.get('home'), 'الرئيسية', '⌂');

  function makeSection(section, fragment) {
    const available = section.items.filter(([id]) => buttons.has(id));
    if (!available.length) return;

    const group = document.createElement('section');
    group.className = 'nav-section';
    group.dataset.navSection = section.id;

    const heading = document.createElement('div');
    heading.className = 'nav-section-title';
    heading.setAttribute('role', 'heading');
    heading.setAttribute('aria-level', '3');

    const title = document.createElement('span');
    title.textContent = section.title;
    const count = document.createElement('small');
    count.textContent = String(available.length);
    count.setAttribute('aria-label', available.length + ' أدوات');
    heading.append(title, count);

    const items = document.createElement('div');
    items.className = 'nav-section-items';
    available.forEach(([id]) => items.appendChild(buttons.get(id)));
    (section.external || []).forEach(([href, label, glyph]) => {
      const link = document.createElement('a');
      link.className = 'nav-external';
      link.href = href;
      link.title = label;
      link.setAttribute('aria-label', label);
      const icon = document.createElement('i');
      icon.className = 'nav-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = glyph;
      const text = document.createElement('span');
      text.className = 'nav-label';
      text.textContent = label;
      link.append(icon, text);
      items.appendChild(link);
    });
    group.append(heading, items);
    fragment.appendChild(group);
  }

  function syncActiveState() {
    buttons.forEach(button => {
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function buildNavigation() {
    nav.className = 'nav nav-organized-desktop';
    nav.setAttribute('aria-label', 'أقسام وأدوات مساحة العمل');
    const fragment = document.createDocumentFragment();

    if (buttons.has('home')) {
      decorate(buttons.get('home'), 'الرئيسية', '⌂');
      const homeSection = document.createElement('section');
      homeSection.className = 'nav-section nav-home-shortcut';
      homeSection.dataset.navSection = 'home';
      const homeItems = document.createElement('div');
      homeItems.className = 'nav-section-items';
      homeItems.appendChild(buttons.get('home'));
      homeSection.appendChild(homeItems);
      fragment.appendChild(homeSection);
    }

    sections.forEach(section => makeSection(section, fragment));
    nav.replaceChildren(fragment);
    syncActiveState();
  }

  const sidebarToggle = document.getElementById('sidebarOpenBtn');
  const sidebarClose = document.getElementById('sidebarCloseBtn');
  if (!sidebarToggle) {
    buildNavigation();
    return;
  }

  const compactMedia = window.matchMedia('(max-width: 1100px)');
  const isCompactLayout = () => compactMedia.matches;
  let sidebarBackdrop = document.querySelector('.sidebar-drawer-backdrop');

  if (!sidebarBackdrop) {
    sidebarBackdrop = document.createElement('button');
    sidebarBackdrop.type = 'button';
    sidebarBackdrop.className = 'sidebar-drawer-backdrop';
    sidebarBackdrop.setAttribute('aria-label', 'إغلاق القائمة الجانبية');
    document.body.appendChild(sidebarBackdrop);
  }

  let drawerOpen = false;

  function getDrawerFocusables() {
    return Array.from(sidebar.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(element => element.getClientRects().length > 0 && !element.closest('[hidden]'));
  }

  function setDrawerState(open, focusTarget = 'none') {
    const compact = isCompactLayout();
    const wasOpen = drawerOpen;
    drawerOpen = compact && Boolean(open);

    document.documentElement.classList.add('sidebar-js-ready');
    sidebar.classList.toggle('is-drawer-open', drawerOpen);
    sidebarBackdrop.hidden = !drawerOpen;
    sidebar.setAttribute('aria-hidden', String(compact && !drawerOpen));
    if ('inert' in sidebar) sidebar.inert = compact && !drawerOpen;

    document.body.classList.toggle('sidebar-drawer-open', drawerOpen);
    sidebarToggle.setAttribute('aria-expanded', String(drawerOpen));

    if (drawerOpen && focusTarget === 'drawer') {
      const active = sidebar.querySelector('button[data-view].active');
      try { active?.scrollIntoView({ block:'nearest', inline:'nearest' }); } catch (_) {}
      (sidebarClose || getDrawerFocusables()[0])?.focus({ preventScroll:true });
    } else if (!drawerOpen && wasOpen && focusTarget === 'toggle') {
      sidebarToggle.focus({ preventScroll:true });
    }
  }

  sidebarToggle.addEventListener('click', () => {
    if (!isCompactLayout()) return;
    setDrawerState(!drawerOpen, drawerOpen ? 'toggle' : 'drawer');
  });

  sidebarClose?.addEventListener('click', () => setDrawerState(false, 'toggle'));
  sidebarBackdrop.addEventListener('click', () => setDrawerState(false, 'toggle'));

  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-view]');
    const externalLink = event.target.closest('a.nav-external');
    if (((button && nav.contains(button)) || (externalLink && nav.contains(externalLink))) && isCompactLayout()) {
      setDrawerState(false, 'toggle');
    }
  });

  sidebar.addEventListener('click', event => {
    const shortcut = event.target.closest('[data-go]');
    if (shortcut && sidebar.contains(shortcut) && isCompactLayout()) {
      setDrawerState(false, 'toggle');
    }
  });

  document.addEventListener('keydown', event => {
    if (!drawerOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setDrawerState(false, 'toggle');
      return;
    }

    if (event.key !== 'Tab') return;
    const focusables = getDrawerFocusables();
    if (!focusables.length) {
      event.preventDefault();
      sidebarClose?.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });

  const handleBreakpointChange = () => setDrawerState(false);
  if (typeof compactMedia.addEventListener === 'function') {
    compactMedia.addEventListener('change', handleBreakpointChange);
  } else if (typeof compactMedia.addListener === 'function') {
    compactMedia.addListener(handleBreakpointChange);
  }

  const activeObserver = new MutationObserver(syncActiveState);
  buttons.forEach(button => activeObserver.observe(button, {
    attributes:true,
    attributeFilter:['class']
  }));

  buildNavigation();

  // Keep the standalone SASA Script Studio shortcut visible even if the
  // navigation sections are rebuilt or reordered by another script.
  function ensureSasaStudioShortcut() {
    const createSection = nav.querySelector('[data-nav-section="create"] .nav-section-items');
    if (!createSection || createSection.querySelector('a[href="./script-studio.html"]')) return;
    const link = document.createElement('a');
    link.className = 'nav-external';
    link.href = './script-studio.html';
    link.title = 'SASA Script Studio';
    link.setAttribute('aria-label', 'SASA Script Studio');
    const icon = document.createElement('i');
    icon.className = 'nav-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '🎙️';
    const label = document.createElement('span');
    label.className = 'nav-label';
    label.textContent = 'SASA Script Studio';
    link.append(icon, label);
    createSection.appendChild(link);
  }
  ensureSasaStudioShortcut();
  setDrawerState(false);
})();
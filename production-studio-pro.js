/* Entelaqtak Production Studio PRO — workflow safeguards and creator utilities */
(() => {
  'use strict';
  const app = window.EntelaqtakApp;
  if (!app || window.__entelaqtakProductionPro) return;
  window.__entelaqtakProductionPro = true;
  const $ = (s, root=document) => root.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let saveTimer = 0;
  let saveLabel = 'تم الحفظ';
  let lastSaved = Date.now();

  function getProject() {
    const id = (() => { try { return localStorage.getItem('entelaqtak-active-production-v1'); } catch (_) { return ''; } })();
    const list = app.getState().productionProjects || [];
    return list.find(p => p && p.id === id && p.kind === 'production_project') || null;
  }
  function statsMarkup(p) {
    const checks = p.checklist || {};
    const total = ['hook','facts','audio','thumb','seo','cta','export'].filter(k => checks[k]).length;
    const words = String(p.script || '').trim().split(/\s+/).filter(Boolean).length;
    const mins = words ? Math.max(1, Math.ceil(words / 130)) : 0;
    const stage = ({brief:'المشروع',research:'البحث',script:'السكريبت',edit:'المونتاج',publish:'النشر'})[p.stage] || 'المشروع';
    return '<section class="prod-pro-overview" aria-label="ملخص المشروع">' +
      '<div class="prod-pro-stat"><span>المرحلة الحالية</span><strong>' + stage + '</strong><small>من 5 مراحل إنتاج</small></div>' +
      '<div class="prod-pro-stat"><span>تقدم المشروع</span><strong>' + (Math.max(0,['brief','research','script','edit','publish'].indexOf(p.stage))+1)*20 + '%</strong><div class="prod-pro-meter"><i style="width:' + (Math.max(0,['brief','research','script','edit','publish'].indexOf(p.stage))+1)*20 + '%"></i></div></div>' +
      '<div class="prod-pro-stat"><span>كلمات السكريبت</span><strong>' + words.toLocaleString('ar-EG') + '</strong><small>' + (mins ? 'قراءة/تعليق تقريبي: ' + mins + ' دقيقة' : 'ابدأ كتابة السكريبت') + '</small></div>' +
      '<div class="prod-pro-stat"><span>مراجعة ما قبل النشر</span><strong>' + total + ' / 7</strong><small>خطوات مكتملة</small></div>' +
      '</section>';
  }
  function inject() {
    const view = $('#view-production');
    if (!view) return;
    const library = $('.prod-library', view);
    if (library && !$('.prod-pro-search', library)) {
      const search = document.createElement('label');
      search.className = 'prod-pro-search';
      search.innerHTML = '<span>⌕</span><input type="search" placeholder="ابحث في مشاريعك..." aria-label="ابحث في مشاريع الإنتاج">';
      const list = $('.prod-project-list', library);
      if (list) library.insertBefore(search, list);
      search.querySelector('input').addEventListener('input', e => {
        const q = e.target.value.trim().toLocaleLowerCase();
        $('.prod-project-list', library)?.querySelectorAll('[data-pick]').forEach(item => {
          item.hidden = !item.textContent.toLocaleLowerCase().includes(q);
        });
      });
    }
    const banner = $('.prod-project-banner', view);
    const p = getProject();
    if (banner && p && !$('.prod-pro-overview', view)) banner.insertAdjacentHTML('afterend', statsMarkup(p));
    const actions = $('.prod-head-actions', view);
    if (actions && p && !actions.querySelector('[data-pro-action="duplicate"]')) {
      actions.insertAdjacentHTML('beforeend',
        '<button class="prod-secondary" type="button" data-pro-action="duplicate">نسخ المشروع</button>' +
        '<button class="prod-secondary" type="button" data-pro-action="notes">تصدير ملف نصي</button>');
    }
    const script = $('[data-field="script"]', view);
    if (script && !$('.prod-pro-editor-meta', view)) {
      const meta = document.createElement('div');
      meta.className = 'prod-pro-editor-meta';
      meta.setAttribute('aria-live','polite');
      script.insertAdjacentElement('afterend', meta);
      const update = () => {
        const words = script.value.trim().split(/\s+/).filter(Boolean).length;
        const chars = script.value.length;
        meta.textContent = words.toLocaleString('ar-EG') + ' كلمة · ' + chars.toLocaleString('ar-EG') + ' حرف · مدة تعليق تقديرية ' + (words ? Math.max(1, Math.ceil(words/130)) + ' دقيقة' : '—');
      };
      script.addEventListener('input', update);
      update();
    }
    if (p && !$('.prod-pro-save-status', view)) {
      const head = $('.prod-head', view);
      if (head) {
        const status = document.createElement('span');
        status.className = 'prod-pro-save-status';
        status.textContent = saveLabel;
        head.appendChild(status);
      }
    }
  }
  function scheduleSave() {
    saveLabel = 'جاري حفظ التعديلات…';
    document.querySelectorAll('.prod-pro-save-status').forEach(n => n.textContent = saveLabel);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        app.save();
        lastSaved = Date.now();
        saveLabel = '✓ تم الحفظ تلقائيًا';
      } catch (error) {
        saveLabel = 'تعذر الحفظ — جرّب الحفظ اليدوي';
        console.error('Production autosave failed:', error);
      }
      document.querySelectorAll('.prod-pro-save-status').forEach(n => n.textContent = saveLabel);
    }, 650);
  }
  function downloadNotes(p) {
    const rows = [
      'مشروع انطلاقتك: ' + p.topic, 'المنصة: ' + p.platform, 'المدة: ' + p.duration, 'المجال: ' + p.niche, '',
      '=== البحث ===', p.researchText || '', '=== تدقيق الحقائق ===', p.factClaim || '', p.factText || '',
      '=== السكريبت ===', p.script || '',
      '=== مراجعة جودة السكريبت ===', p.scriptReview || '',
      '=== النسخة السابقة من السكريبت ===', p.scriptPrevious || '',
      '=== خطة المونتاج ===', p.editPlan || '',
      '=== حزمة النشر ===', p.publishPack || '', 'العنوان: ' + (p.publishTitle || ''),
      'الوصف: ' + (p.publishDescription || ''), 'الكلمات المفتاحية: ' + (p.publishKeywords || ''),
      'برومبت الصورة المصغرة: ' + (p.thumbnailPrompt || '')
    ].join('\n');
    const blob = new Blob(['\uFEFF' + rows], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'entelaqtak-' + String(p.topic || 'production').replace(/[^\w\u0600-\u06FF-]+/g,'-').slice(0,45) + '.txt';
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.addEventListener('input', event => {
    if (!event.target.closest('#view-production [data-field]')) return;
    scheduleSave();
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-pro-action]');
    if (!button) return;
    const p = getProject();
    if (!p) return;
    if (button.dataset.proAction === 'notes') { downloadNotes(p); return; }
    if (button.dataset.proAction === 'duplicate') {
      const copy = JSON.parse(JSON.stringify(p));
      copy.id = 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
      copy.topic = (p.topic || 'مشروع') + ' — نسخة';
      copy.attachments = (Array.isArray(p.attachments) ? p.attachments : []).filter(item => item && item.kind === 'library').map(item => ({...item,id:'asset-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)}));
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      app.getState().productionProjects.unshift(copy);
      app.save();
      try { localStorage.setItem('entelaqtak-active-production-v1', copy.id); } catch (_) {}
      const nav = $('[data-view="production"]');
      nav?.click();
      app.toast('اتعملت نسخة مستقلة. مرفقات الملفات الأصلية لم تُنسخ لتجنب تكرار التخزين.');
    }
  });
  window.addEventListener('pagehide', () => {
    if (saveTimer) { clearTimeout(saveTimer); try { app.save(); } catch (_) {} }
  });
  const observer = new MutationObserver(() => inject());
  const start = () => {
    const view = $('#view-production');
    if (view) { observer.observe(view, {childList:true,subtree:true}); inject(); }
    else setTimeout(start, 250);
  };
  start();
})();

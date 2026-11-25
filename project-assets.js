/* Entelaqtak Project Assets v1 — private files and reusable library references per project. */
(() => {
  'use strict';
  const app = window.EntelaqtakApp;
  if (!app || window.__entelaqtakProjectAssetsReady) return;
  window.__entelaqtakProjectAssetsReady = true;

  const BUCKET = 'entelaqtak-project-assets';
  const MAX_BYTES = 25 * 1024 * 1024;
  const MAX_FILES = 12;
  const view = document.getElementById('view-production');
  if (!view) return;

  const safe = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
  const uid = () => 'asset-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9);
  const niceName = value => String(value || 'project-file').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'-').slice(0,120) || 'project-file';
  const formatBytes = value => {
    const bytes = Math.max(0, Number(value) || 0);
    if (bytes < 1024) return bytes + ' بايت';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };
  const iconFor = mime => {
    if (/^image\//i.test(mime)) return '🖼️';
    if (/^audio\//i.test(mime)) return '🎧';
    if (/^video\//i.test(mime)) return '🎬';
    if (mime === 'application/pdf') return '📕';
    if (mime.includes('word') || mime.includes('document')) return '📝';
    if (mime === 'text/plain') return '📄';
    if (mime === 'application/zip') return '🗜️';
    return '📎';
  };
  const currentUser = () => app.getCurrentUser?.() || null;
  const client = () => app.getSupabaseClient?.() || null;
  const projectList = () => {
    const rows = app.getState().productionProjects;
    return Array.isArray(rows) ? rows.filter(row => row && row.kind === 'production_project') : [];
  };
  const projectById = id => projectList().find(row => String(row.id) === String(id)) || null;
  const activeProject = () => {
    let id = '';
    try { id = localStorage.getItem('entelaqtak-active-production-v1') || ''; } catch (_) {}
    return projectById(id);
  };
  const ensureAttachments = project => {
    if (!Array.isArray(project.attachments)) project.attachments = [];
    return project.attachments;
  };
  const getLibraryChoices = () => {
    const state = app.getState();
    const choices = [];
    (Array.isArray(state.scriptTemplates) ? state.scriptTemplates : []).forEach(item => {
      const text = String(item.content || '').trim();
      if (text) choices.push({
        key:'template|' + String(item.id),
        sourceType:'template',
        sourceId:String(item.id),
        name:String(item.name || 'قالب سكريبت'),
        text:text
      });
    });
    (Array.isArray(state.packs) ? state.packs : []).forEach(item => {
      const text = [
        item.hook ? 'الافتتاحية:\n' + item.hook : '',
        item.script ? 'السكريبت:\n' + item.script : '',
        item.shots ? 'خطة اللقطات:\n' + item.shots : '',
        item.description ? 'الوصف:\n' + item.description : '',
        item.keywords ? 'الكلمات المفتاحية:\n' + item.keywords : ''
      ].filter(Boolean).join('\n\n').trim();
      if (text) choices.push({
        key:'pack|' + String(item.id),
        sourceType:'pack',
        sourceId:String(item.id),
        name:String(item.topic || 'حزمة محتوى'),
        text:text
      });
    });
    (Array.isArray(state.ideas) ? state.ideas : []).forEach(item => {
      const text = [
        item.angle ? 'زاوية الفكرة:\n' + item.angle : '',
        item.detail ? 'التفاصيل:\n' + item.detail : '',
        item.audience ? 'الجمهور:\n' + item.audience : '',
        item.platform ? 'المنصة:\n' + item.platform : ''
      ].filter(Boolean).join('\n\n').trim();
      if (text) choices.push({
        key:'idea|' + String(item.id),
        sourceType:'idea',
        sourceId:String(item.id),
        name:String(item.title || 'فكرة محتوى'),
        text:text
      });
    });
    return choices;
  };
  const mimeFromFile = file => {
    let mime = String(file.type || '').toLowerCase();
    if (mime === 'image/jpg') mime = 'image/jpeg';
    if (mime && mime !== 'application/octet-stream') return mime;
    const ext = String(file.name || '').split('.').pop().toLowerCase();
    const map = {
      jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',
      mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',aac:'audio/aac',ogg:'audio/ogg',
      mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',
      pdf:'application/pdf',txt:'text/plain',doc:'application/msword',
      docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',zip:'application/zip'
    };
    return map[ext] || mime;
  };
  const allowedMime = new Set([
    'image/jpeg','image/png','image/webp','image/gif',
    'audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/ogg',
    'video/mp4','video/webm','video/quicktime',
    'application/pdf','text/plain','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip'
  ]);

  function panelMarkup(project) {
    const attachments = ensureAttachments(project);
    const choices = getLibraryChoices();
    const fileCount = attachments.filter(item => item.kind === 'file').length;
    const libraryCount = attachments.filter(item => item.kind === 'library').length;
    const choicesMarkup = choices.length
      ? choices.map(item => '<option value="' + safe(item.key) + '">' + safe(item.name) + ' · ' + safe(({template:'قالب',pack:'حزمة',idea:'فكرة'})[item.sourceType]) + '</option>').join('')
      : '<option value="">مكتبتك لسه مفيهاش سكريبتات أو أفكار محفوظة</option>';
    const list = attachments.length ? attachments.map(item => {
      const isFile = item.kind === 'file';
      const mime = String(item.mime || 'application/octet-stream');
      return '<article class="pa-item" data-pa-item="' + safe(item.id) + '">' +
        '<span class="pa-item-icon">' + (isFile ? iconFor(mime) : '📚') + '</span>' +
        '<div class="pa-item-info"><strong>' + safe(item.name || (isFile ? 'ملف بدون اسم' : 'عنصر من المكتبة')) + '</strong>' +
        '<small>' + (isFile ? safe(formatBytes(item.size)) + ' · ' + safe(mime) : safe(({template:'قالب سكريبت',pack:'حزمة محتوى',idea:'فكرة محفوظة'})[item.sourceType] || 'من المكتبة') + ' · نسخة مرتبطة بالمشروع') + '</small></div>' +
        '<div class="pa-item-actions">' +
        (isFile
          ? '<button type="button" data-pa-action="preview" data-id="' + safe(item.id) + '">معاينة</button><button type="button" data-pa-action="download" data-id="' + safe(item.id) + '">تنزيل</button>'
          : '<button type="button" data-pa-action="insert" data-id="' + safe(item.id) + '">إدراج في السكريبت</button><button type="button" data-pa-action="copy" data-id="' + safe(item.id) + '">نسخ</button>') +
        '<button type="button" class="pa-remove" data-pa-action="remove" data-id="' + safe(item.id) + '">إزالة</button></div></article>';
    }).join('') : '<div class="pa-empty">مفيش مرفقات للمشروع لسه. ارفع ملفاتك أو اربط عنصر محفوظ من مكتبتك.</div>';
    const hasThumb = !!window.EntelaqtakThumbnailFiles?.hasSavedSource?.();
    return '<section class="pa-panel" id="projectAssetsPanel" data-project-id="' + safe(project.id) + '">' +
      '<div class="pa-heading"><div><span class="pa-kicker">PROJECT LIBRARY · FILES & REFERENCES</span><h2>مكتبة ملفات المشروع <span>📁</span></h2><p>اجمع السكريبتات والصور والصوت والفيديو والمستندات الخاصة بالفيديو ده في مكان واحد.</p></div>' +
      '<div class="pa-counts"><b>' + fileCount + ' ملفات</b><b>' + libraryCount + ' مراجع</b></div></div>' +
      '<div class="pa-tools-grid"><div class="pa-tool-card"><div class="pa-tool-heading"><span>⬆️</span><div><strong>ارفع ملفات المشروع</strong><small>صور · صوت · فيديو · PDF · Word · TXT · ZIP</small></div></div>' +
      '<label class="pa-upload-label" for="paFileInput">اختار ملفات من جهازك<input id="paFileInput" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg,video/mp4,video/webm,video/quicktime,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"></label>' +
      '<small class="pa-hint">الحد الأقصى للملف الواحد 25 MB. الملفات خاصة بحسابك وليست روابط عامة.</small>' +
      (hasThumb ? '<button type="button" class="pa-secondary" data-pa-action="thumbnail-source">رفع الصورة الأصلية من مصمم الصور المصغّرة</button>' : '') +
      '<div class="pa-status" id="paStatus" role="status" aria-live="polite">تقدر ترفع أكثر من ملف مرة واحدة.</div></div>' +
      '<div class="pa-tool-card"><div class="pa-tool-heading"><span>📚</span><div><strong>اربط عنصر من مكتبتك</strong><small>قوالب السكريبت · الحزم · الأفكار المحفوظة</small></div></div>' +
      '<select id="paLibrarySelect" class="pa-library-select" ' + (choices.length ? '' : 'disabled') + '><option value="">اختار عنصر محفوظ...</option>' + choicesMarkup + '</select>' +
      '<button type="button" class="pa-primary" data-pa-action="attach-library" ' + (choices.length ? '' : 'disabled') + '>إضافة العنصر للمشروع</button>' +
      '<small class="pa-hint">هنحفظ نسخة من المحتوى داخل المشروع، حتى لو اتغير العنصر الأصلي بعد كده.</small></div></div>' +
      '<div class="pa-list-head"><div><h3>مرفقات المشروع</h3><small>العناصر المرتبطة بالمشروع ده فقط</small></div><span>' + attachments.length + ' عنصر</span></div>' +
      '<div class="pa-items">' + list + '</div>' +
      '<dialog class="pa-preview-dialog"><div class="pa-preview-head"><strong>معاينة الملف</strong><button type="button" data-pa-action="close-preview" aria-label="إغلاق المعاينة">×</button></div><div class="pa-preview-body"></div></dialog>' +
      '</section>';
  }

  function renderPanel() {
    const project = activeProject();
    const stageHost = view.querySelector('.prod-current-stage');
    const old = document.getElementById('projectAssetsPanel');
    if (!project || !stageHost) {
      old?.remove();
      return;
    }
    if (old && old.dataset.projectId !== String(project.id)) old.remove();
    let panel = document.getElementById('projectAssetsPanel');
    if (!panel) {
      panel = document.createElement('div');
      stageHost.insertAdjacentElement('afterend', panel);
    }
    panel.outerHTML = panelMarkup(project);
    const newPanel = document.getElementById('projectAssetsPanel');
    if (newPanel) newPanel.dataset.projectId = String(project.id);
  }

  function setStatus(message, isError=false) {
    const status = document.getElementById('paStatus');
    if (status) {
      status.textContent = message;
      status.classList.toggle('is-error', !!isError);
    }
  }

  function requireStorageAccess() {
    const user = currentUser();
    const supabase = client();
    if (!user || !supabase) {
      throw new Error('رفع الملفات السحابية يحتاج تسجيل الدخول إلى حسابك أولًا.');
    }
    return {user,supabase};
  }

  async function uploadOne(project, file, extra={}) {
    const {user,supabase} = requireStorageAccess();
    if (extra.sourceType === 'thumbnail-source' && ensureAttachments(project).some(item => item.kind === 'file' && item.sourceType === 'thumbnail-source')) throw new Error('الصورة الأصلية لمصمم الصور مرتبطة بالمشروع بالفعل.');
    if (!file || !file.size) throw new Error('الملف فارغ أو غير صالح.');
    if (file.size > MAX_BYTES) throw new Error('الملف "' + file.name + '" أكبر من الحد المسموح (25 MB).');
    const mime = mimeFromFile(file);
    if (!allowedMime.has(mime)) throw new Error('نوع الملف غير مدعوم: ' + (file.type || file.name));
    if (!Array.isArray(project.attachments)) project.attachments = [];
    if (project.attachments.length >= 100) throw new Error('وصل المشروع للحد الأقصى وهو 100 مرفق.');
    const fileId = uid();
    const name = niceName(file.name || 'project-file');
    const path = user.id + '/' + project.id + '/' + fileId + '-' + name;
    const {data,error} = await supabase.storage.from(BUCKET).upload(path,file,{
      cacheControl:'3600',
      upsert:false,
      contentType:mime
    });
    if (error) throw error;
    const attachment = {
      id:fileId,
      kind:'file',
      name:String(file.name || name).slice(0,180),
      mime:mime,
      size:file.size,
      path:data?.path || path,
      createdAt:new Date().toISOString(),
      sourceType:extra.sourceType || '',
      sourceId:extra.sourceId || ''
    };
    project.attachments.push(attachment);
    project.updatedAt = new Date().toISOString();
    app.save();
    return attachment;
  }

  async function uploadFiles(files, extra={}) {
    const project = activeProject();
    if (!project) throw new Error('افتح مشروع إنتاج الأول.');
    requireStorageAccess();
    if (files.length > MAX_FILES) throw new Error('ارفع 12 ملف كحد أقصى في المرة الواحدة.');
    const input = document.getElementById('paFileInput');
    if (input) input.disabled = true;
    let saved = 0;
    try {
      for (const file of files) {
        setStatus('جارٍ رفع ' + (saved + 1) + ' من ' + files.length + ': ' + file.name);
        await uploadOne(project,file,extra);
        saved++;
      }
      app.toast('تم رفع الملفات وربطها بالمشروع.');
    } finally {
      renderPanel();
      const freshInput = document.getElementById('paFileInput');
      if (freshInput) freshInput.disabled = false;
    }
    setStatus('تم رفع ' + saved + ' ملف وحفظه داخل المشروع.');
    return saved;
  }

  function findAttachment(project, id) {
    return ensureAttachments(project).find(item => String(item.id) === String(id)) || null;
  }
  function assertOwnedPath(project, attachment, user) {
    const path = String(attachment?.path || '');
    const expectedPrefix = user.id + '/' + String(project.id) + '/';
    if (!path.startsWith(expectedPrefix) || path.includes('..')) {
      throw new Error('مسار الملف لا يطابق ملكية حسابك أو المشروع.');
    }
    return path;
  }
  async function getFileBlob(projectId, attachmentId) {
    const project = projectById(projectId);
    if (!project) throw new Error('المشروع غير موجود.');
    const attachment = findAttachment(project,attachmentId);
    if (!attachment || attachment.kind !== 'file') throw new Error('الملف غير موجود داخل المشروع.');
    const {user,supabase} = requireStorageAccess();
    const path = assertOwnedPath(project,attachment,user);
    const {data,error} = await supabase.storage.from(BUCKET).download(path);
    if (error) throw error;
    if (!(data instanceof Blob)) throw new Error('تعذر قراءة محتوى الملف.');
    return {blob:data,attachment,project};
  }
  function downloadBlob(blob,name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'project-file';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  async function downloadAttachment(projectId, attachmentId) {
    const result = await getFileBlob(projectId,attachmentId);
    downloadBlob(result.blob,result.attachment.name);
    return true;
  }
  async function previewAttachment(projectId, attachmentId) {
    const result = await getFileBlob(projectId,attachmentId);
    const panel = document.getElementById('projectAssetsPanel');
    const dialog = panel?.querySelector('.pa-preview-dialog');
    const body = dialog?.querySelector('.pa-preview-body');
    if (!dialog || !body) throw new Error('افتح المشروع لمعاينة مرفقاته.');
    const url = URL.createObjectURL(result.blob);
    dialog.dataset.objectUrl = url;
    body.replaceChildren();
    const mime = result.attachment.mime || '';
    let node;
    if (mime.startsWith('image/')) {
      node = document.createElement('img');
      node.alt = result.attachment.name;
      node.src = url;
    } else if (mime.startsWith('video/')) {
      node = document.createElement('video');
      node.controls = true;
      node.src = url;
    } else if (mime.startsWith('audio/')) {
      node = document.createElement('audio');
      node.controls = true;
      node.src = url;
    } else if (mime === 'application/pdf') {
      node = document.createElement('iframe');
      node.title = result.attachment.name;
      node.src = url;
    } else if (mime === 'text/plain') {
      node = document.createElement('pre');
      node.textContent = await result.blob.text();
    } else {
      URL.revokeObjectURL(url);
      throw new Error('المعاينة غير متاحة لهذا النوع. استخدم زر التنزيل.');
    }
    body.appendChild(node);
    dialog.addEventListener('close',()=> {
      if (dialog.dataset.objectUrl) URL.revokeObjectURL(dialog.dataset.objectUrl);
      dialog.dataset.objectUrl = '';
      body.replaceChildren();
    },{once:true});
    dialog.showModal();
  }

  async function removeAttachment(projectId, attachmentId) {
    const project = projectById(projectId);
    if (!project) throw new Error('المشروع غير موجود.');
    const attachment = findAttachment(project,attachmentId);
    if (!attachment) return false;
    if (attachment.kind === 'file') {
      const {user,supabase} = requireStorageAccess();
      const path = assertOwnedPath(project,attachment,user);
      const {error} = await supabase.storage.from(BUCKET).remove([path]);
      if (error) throw error;
    }
    project.attachments = project.attachments.filter(item => String(item.id) !== String(attachmentId));
    project.updatedAt = new Date().toISOString();
    app.save();
    return true;
  }

  async function deleteProjectFiles(project) {
    const files = ensureAttachments(project).filter(item => item.kind === 'file' && item.path);
    if (!files.length) return true;
    const {user,supabase} = requireStorageAccess();
    const paths = files.map(item => assertOwnedPath(project,item,user));
    const {error} = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;
    return true;
  }

  function attachLibrary(project, key) {
    const source = getLibraryChoices().find(item => item.key === key);
    if (!source) throw new Error('العنصر المحدد لم يعد موجودًا في مكتبتك.');
    ensureAttachments(project);
    if (project.attachments.some(item => item.kind === 'library' && item.sourceType === source.sourceType && item.sourceId === source.sourceId)) {
      app.toast('العنصر ده مرتبط بالمشروع بالفعل.');
      return false;
    }
    if (project.attachments.length >= 100) throw new Error('وصل المشروع للحد الأقصى وهو 100 مرفق.');
    project.attachments.push({
      id:uid(),
      kind:'library',
      sourceType:source.sourceType,
      sourceId:source.sourceId,
      name:source.name.slice(0,180),
      text:source.text.slice(0,12000),
      mime:'text/plain',
      size:source.text.length,
      createdAt:new Date().toISOString()
    });
    project.updatedAt = new Date().toISOString();
    app.save();
    app.toast('اتربط عنصر المكتبة بالمشروع.');
    renderPanel();
    return true;
  }

  async function copyText(text) {
    const value = String(text || '');
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      app.toast('تم نسخ المحتوى.');
    } catch (_) {
      const input = document.createElement('textarea');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      app.toast('تم نسخ المحتوى.');
    }
  }

  view.addEventListener('change', async event => {
    if (event.target.id === 'paFileInput') {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (!files.length) return;
      try { await uploadFiles(files); }
      catch (error) { setStatus(error?.message || 'تعذر رفع الملفات.',true); app.toast(error?.message || 'تعذر رفع الملفات.'); }
      return;
    }
  });

  view.addEventListener('click', async event => {
    const button = event.target.closest('[data-pa-action]');
    if (!button) return;
    const action = button.dataset.paAction;
    const project = activeProject();
    if (action === 'close-preview') {
      const dialog = button.closest('dialog');
      if (dialog?.open) dialog.close();
      return;
    }
    if (action === 'thumbnail-source') {
      try {
        const source = await window.EntelaqtakThumbnailFiles?.getSourceBlob?.();
        if (!source?.blob) throw new Error('الصورة الأصلية غير متاحة على هذا الجهاز.');
        const file = new File([source.blob],source.name || 'thumbnail-source.jpg',{type:source.type || source.blob.type || 'image/jpeg'});
        await uploadFiles([file],{sourceType:'thumbnail-source',sourceId:'thumbnail-source'});
      } catch (error) { setStatus(error?.message || 'تعذر رفع الصورة الأصلية.',true); app.toast(error?.message || 'تعذر رفع الصورة الأصلية.'); }
      return;
    }
    if (!project) return;
    if (action === 'attach-library') {
      const select = document.getElementById('paLibrarySelect');
      try { attachLibrary(project,select?.value || ''); }
      catch (error) { app.toast(error?.message || 'تعذر ربط العنصر.'); }
      return;
    }
    const id = button.dataset.id;
    const attachment = findAttachment(project,id);
    if (!attachment) return;
    if (action === 'copy' || action === 'insert') {
      if (action === 'copy') { await copyText(attachment.text); return; }
      const content = String(attachment.text || '').trim();
      if (!content) return app.toast('مفيش محتوى لإدراجه.');
      project.script = (String(project.script || '').trim() ? String(project.script).trim() + '\n\n' : '') + '— ' + attachment.name + ' —\n' + content;
      project.stage = 'script';
      project.updatedAt = new Date().toISOString();
      app.save();
      app.openProductionProject?.(project.id);
      app.go('production');
      app.toast('اتضاف المحتوى للسكريبت. راجعه وعدّله قبل الاستخدام.');
      return;
    }
    if (action === 'download' || action === 'preview') {
      button.disabled = true;
      try {
        if (action === 'download') await downloadAttachment(project.id,id);
        else await previewAttachment(project.id,id);
      } catch (error) { app.toast(error?.message || 'تعذر فتح الملف.'); }
      finally { button.disabled = false; }
      return;
    }
    if (action === 'remove') {
      if (!confirm('تزيل المرفق من المشروع؟' + (attachment.kind === 'file' ? ' سيتم حذف الملف من التخزين السحابي لهذا الحساب.' : ' سيبقى العنصر الأصلي في المكتبة.'))) return;
      button.disabled = true;
      try {
        await removeAttachment(project.id,id);
        renderPanel();
        app.toast('تمت إزالة المرفق.');
      } catch (error) {
        button.disabled = false;
        app.toast(error?.message || 'تعذر إزالة المرفق.');
      }
    }
  });

  const observer = new MutationObserver(() => {
    if (!document.getElementById('projectAssetsPanel')) renderPanel();
  });
  observer.observe(view,{childList:true,subtree:true});
  renderPanel();

  window.EntelaqtakProjectAssets = {
    deleteProjectFiles,
    downloadAttachment,
    refresh:renderPanel
  };
})();

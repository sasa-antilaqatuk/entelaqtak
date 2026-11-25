/* Project-aware assistant for Entelaqtak Production Studio. */
(() => {
  'use strict';
  const app = window.EntelaqtakApp;
  const view = document.getElementById('view-production');
  if (!app || !view || window.__entelaqtakProjectAssistantReady) return;
  window.__entelaqtakProjectAssistantReady = true;
  const MAX_MESSAGES = 14;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = (value, max=500) => String(value == null ? '' : value).trim().slice(0,max);
  const FIELD_RULES = Object.freeze({
    script:{label:'السكريبت',max:9000},
    scriptReview:{label:'مراجعة السكريبت',max:5000},
    researchText:{label:'نتيجة البحث',max:8000},
    factClaim:{label:'الادعاء المراد التحقق منه',max:1200},
    factText:{label:'نتيجة التحقق',max:7000},
    editPlan:{label:'خطة المونتاج',max:9000},
    publishPack:{label:'حزمة النشر',max:9000},
    publishTitle:{label:'عنوان النشر',max:300},
    publishDescription:{label:'وصف النشر',max:3000},
    publishKeywords:{label:'الكلمات المفتاحية',max:1500},
    thumbnailPrompt:{label:'برومبت الصورة المصغّرة',max:3000}
  });
  function normalizeProposal(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const field=String(value.field || '');
    const rule=FIELD_RULES[field];
    if (!rule || typeof value.content !== 'string') return null;
    const content=value.content.trim();
    if (!content || content.length > rule.max) return null;
    return {
      field,
      fieldLabel:rule.label,
      title:clean(value.title || 'تعديل مقترح',100),
      reason:clean(value.reason || 'تحسين مقترح بناءً على بيانات المشروع.',260),
      content
    };
  }
  const projectList = () => {
    const list = app.getState().productionProjects;
    return Array.isArray(list) ? list.filter(item => item && item.kind === 'production_project') : [];
  };
  const activeProject = () => {
    let id = '';
    try { id = localStorage.getItem('entelaqtak-active-production-v1') || ''; } catch (_) {}
    return projectList().find(item => String(item.id) === String(id)) || null;
  };
  const attachmentsOf = project => Array.isArray(project.attachments) ? project.attachments : [];
  const conversationOf = project => {
    if (!Array.isArray(project.aiConversation)) project.aiConversation = [];
    project.aiConversation = project.aiConversation.filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string').slice(-MAX_MESSAGES);
    return project.aiConversation;
  };
  const stamp = () => new Date().toISOString();
  function panelMarkup(project) {
    const attachments = attachmentsOf(project);
    const readable = attachments.filter(item => item && ((item.kind === 'library' && String(item.text || '').trim()) || (item.kind === 'file' && item.mime === 'text/plain'))).length;
    return '<div class="paa-head">' +
      '<div class="paa-brand"><span class="paa-mark">✦</span><div><span class="paa-kicker">PROJECT INTELLIGENCE</span><h2>مساعد المشروع الذكي</h2><p>فاهم تفاصيل المشروع ومكمل معاك من آخر نقطة</p></div></div>' +
      '<div class="paa-head-actions"><span class="paa-context-badge">سياق المشروع مفعّل</span><button type="button" class="paa-clear" data-paa-action="clear">مسح المحادثة</button></div></div>' +
      '<div class="paa-context-row"><span>📌 ' + esc(clean(project.topic,80) || 'موضوع المشروع') + '</span><span>📚 ' + attachments.length + ' مرفق</span><span>📄 ' + readable + ' مصدر نصي قابل للقراءة</span></div>' +
      '<div class="paa-suggestions" aria-label="أسئلة مقترحة">' +
      '<button type="button" data-paa-suggest="راجع السكريبت وحدد أقوى 3 نقاط وأضعف 3 نقاط مع حلول عملية.">راجع السكريبت</button>' +
      '<button type="button" data-paa-suggest="أعد كتابة السكريبت كاملًا بنسخة محسنة، وجهّز التعديل كاقتراح قابل للتطبيق داخل حقل السكريبت.">حسّن وطبّق السكريبت</button>' +
      '<button type="button" data-paa-suggest="اقترح زاوية سرد أقوى لنفس الموضوع من غير إضافة حقائق غير موجودة.">زاوية سرد أقوى</button>' +
      '<button type="button" data-paa-suggest="استخرج المعلومات التي ما زالت تحتاج إلى مصدر أو تحقق من بيانات المشروع.">معلومات تحتاج تحقق</button>' +
      '<button type="button" data-paa-suggest="حوّل حالة المشروع الحالية إلى خطوات تنفيذية مرتبة حسب الأولوية.">الخطوة التالية</button></div>' +
      '<div class="paa-thread" data-paa-thread role="log" aria-live="polite" aria-label="محادثة مساعد المشروع"></div>' +
      '<div class="paa-status" data-paa-status role="status">المساعد يستخدم بيانات هذا المشروع فقط، ولا يغيّر السكريبت تلقائيًا.</div>' +
      '<form class="paa-form" data-paa-form><textarea data-paa-input rows="3" maxlength="1200" placeholder="اسأل عن المشروع، اطلب تعديل جزء من السكريبت، أو ناقش فكرة..."></textarea>' +
      '<div class="paa-form-foot"><span>Enter للإرسال · Shift + Enter لسطر جديد</span><button type="submit" class="paa-send">إرسال <span>➤</span></button></div></form>' +
      '<div class="paa-footnote">المحادثة محفوظة داخل المشروع. النصوص المرفقة تدخل في السياق، أما الصور والفيديو وPDF وWord فتظهر للمساعد بأسمائها ونوعها فقط.</div>';
  }
  function proposalMarkup(message,index) {
    const proposal=normalizeProposal(message.proposal);
    if(!proposal)return '';
    const preview=proposal.content.slice(0,520);
    const applied=!!(message.appliedAt && !message.restoredAt);
    const restored=!!message.restoredAt;
    return '<section class="paa-proposal"><div class="paa-proposal-top"><span>✦ تعديل جاهز للتطبيق</span><b>'+esc(proposal.fieldLabel)+'</b></div>' +
      '<h4>'+esc(proposal.title || 'تعديل مقترح')+'</h4><p>'+esc(proposal.reason)+'</p>' +
      '<pre>'+esc(preview)+(proposal.content.length>preview.length?'…':'')+'</pre>' +
      (applied
        ? '<div class="paa-proposal-actions"><span class="paa-applied">تم تطبيق التعديل ✓</span><button type="button" class="paa-undo" data-paa-undo="'+index+'">استعادة النسخة السابقة</button></div>'
        : restored
          ? '<div class="paa-proposal-actions"><span class="paa-restored">تم التراجع عن التعديل</span><button type="button" class="paa-apply" data-paa-apply="'+index+'">إعادة تطبيق التعديل</button></div>'
          : '<div class="paa-proposal-actions"><span>لن يتغير المشروع قبل موافقتك</span><button type="button" class="paa-apply" data-paa-apply="'+index+'">موافقة وتطبيق التعديل</button></div>') +
      '</section>';
  }
  function renderThread(panel,project) {
    const thread=panel.querySelector('[data-paa-thread]');
    if(!thread)return;
    const messages=conversationOf(project);
    const signature=JSON.stringify(messages.map(item=>[item.role,item.content,item.proposal?.field,item.proposal?.content,item.appliedAt,item.restoredAt]));
    if(panel.dataset.threadSignature===signature)return;
    if(!messages.length){
      thread.innerHTML='<div class="paa-welcome"><span>✦</span><b>أهلًا بيك في مساعد المشروع</b><p>اسألني عن الفكرة أو البحث أو السكريبت أو المونتاج أو النشر. هراجع المعلومات المحفوظة في المشروع قبل ما أرد.</p></div>';
      panel.dataset.threadSignature=signature;
      return;
    }
    thread.innerHTML=messages.map((message,index)=>
      '<article class="paa-message paa-'+message.role+'"><div class="paa-message-top"><b>'+(message.role==='user'?'أنت':'مساعد المشروع')+'</b><button type="button" data-paa-copy="'+index+'">نسخ</button></div><div class="paa-message-text">'+esc(message.content)+'</div>' +
      (message.role==='assistant'?proposalMarkup(message,index):'')+'</article>'
    ).join('');
    panel.dataset.threadSignature=signature;
    thread.scrollTop=thread.scrollHeight;
  }
  function syncPanel() {
    const project=activeProject(),stageHost=view.querySelector('.prod-current-stage');
    let panel=document.getElementById('projectAssistantPanel');
    if(!project||!stageHost){panel?.remove();return;}
    if(panel&&panel.dataset.projectId!==String(project.id)){panel.remove();panel=null;}
    if(!panel){
      panel=document.createElement('section');
      panel.id='projectAssistantPanel';
      panel.className='paa-panel';
      panel.dataset.projectId=String(project.id);
      const anchor=document.getElementById('projectAssetsPanel')||stageHost;
      anchor.insertAdjacentElement('afterend',panel);
      panel.innerHTML=panelMarkup(project);
    }
    renderThread(panel,project);
  }
  async function collectContext(project) {
    const attachments=attachmentsOf(project),readable=[];
    for(const item of attachments){
      if(!item||readable.length>=3)continue;
      if(item.kind==='library'&&String(item.text||'').trim()){
        readable.push({name:clean(item.name,90),source:'مكتبة الموقع',text:clean(item.text,340)});
      }else if(item.kind==='file'&&item.mime==='text/plain'){
        const reader=window.EntelaqtakProjectAssets?.readTextAttachment;
        if(typeof reader==='function'){
          try{
            const text=await reader(project.id,item.id,340);
            if(text)readable.push({name:clean(item.name,90),source:'ملف نصي مرفق',text:clean(text,340)});
          }catch(error){console.warn('Project assistant could not read a text attachment:',item.name,error);}
        }
      }
    }
    const files=attachments.slice(0,7).map(item=>({
      name:clean(item.name,90),
      type:item.kind==='file'?clean(item.mime||'ملف',60):'عنصر نصي من المكتبة',
      contentIncluded:!!(item.kind==='library'&&String(item.text||'').trim())||!!(item.kind==='file'&&item.mime==='text/plain'&&readable.some(entry=>entry.name===clean(item.name,90)))
    }));
    return {project:{
      topic:clean(project.topic,180),niche:clean(project.niche,60),platform:clean(project.platform,50),
      audience:clean(project.audience,120),duration:clean(project.duration,40),tone:clean(project.tone,80),stage:clean(project.stage,30),
      research:clean(project.researchText,700),
      researchSources:(Array.isArray(project.researchSources)?project.researchSources:[]).slice(0,3).map(item=>({title:clean(item?.title,80),url:clean(item?.url,140)})),
      factClaim:clean(project.factClaim,160),factCheck:clean(project.factText,400),
      factSources:(Array.isArray(project.factSources)?project.factSources:[]).slice(0,3).map(item=>({title:clean(item?.title,80),url:clean(item?.url,140)})),
      script:clean(project.script,1650),scriptReview:clean(project.scriptReview,380),previousScript:clean(project.scriptPrevious,230),
      editPlan:clean(project.editPlan,420),publishPack:clean(project.publishPack,420),
      publishing:{title:clean(project.publishTitle,100),description:clean(project.publishDescription,150),keywords:clean(project.publishKeywords,140),thumbnailPrompt:clean(project.thumbnailPrompt,160)},
      checklist:project.checklist&&typeof project.checklist==='object'?project.checklist:{},
      attachments:files,readableAttachmentText:readable
    }};
  }
  function buildPayload(projectContext,project,message) {
    const messages=conversationOf(project);
    const history=messages.slice(0,-1).slice(-4).map(item=>({role:item.role,content:clean(item.content,520)}));
    const payload={project:projectContext.project,history:history,message:clean(message,1200)};
    while(JSON.stringify(payload).length>11400&&payload.history.length)payload.history.shift();
    if(JSON.stringify(payload).length>11400){
      payload.project.script=clean(payload.project.script,850);
      payload.project.research=clean(payload.project.research,360);
      payload.project.readableAttachmentText=payload.project.readableAttachmentText.slice(0,1);
      payload.project.editPlan=clean(payload.project.editPlan,220);
    }
    if(JSON.stringify(payload).length>12000)throw new Error('سياق المشروع كبير جدًا. اختصر السكريبت أو أزل بعض المرفقات النصية ثم حاول مرة أخرى.');
    return payload;
  }
  function saveProject(project){project.updatedAt=stamp();app.save();}
  async function sendMessage(project,panel,form) {
    const input=form.querySelector('[data-paa-input]'),button=form.querySelector('.paa-send'),status=panel.querySelector('[data-paa-status]');
    const question=clean(input?.value,1200);
    if(!question){app.toast('اكتب سؤالك الأول.');return;}
    const conversation=conversationOf(project);
    conversation.push({role:'user',content:question,createdAt:stamp()});
    project.aiConversation=conversation.slice(-MAX_MESSAGES);
    saveProject(project);renderThread(panel,project);
    input.value='';input.disabled=true;button.disabled=true;button.textContent='جاري التفكير...';
    if(status)status.textContent='براجع سياق المشروع وبجهّز الرد...';
    try{
      const projectContext=await collectContext(project),payload=buildPayload(projectContext,project,question);
      const response=await app.callAI('project_assistant',payload,{fullResponse:true});
      const answer=typeof response?.text==='string'?response.text:'';
      const proposal=normalizeProposal(response?.proposal);
      if(!answer.trim())throw new Error('المساعد رجع ردًا فارغًا. حاول مرة أخرى.');
      const currentConversation=conversationOf(project);
      currentConversation.push({role:'assistant',content:clean(answer,5000),proposal:proposal?{field:proposal.field,title:proposal.title,reason:proposal.reason,content:proposal.content}:null,createdAt:stamp()});
      project.aiConversation=currentConversation.slice(-MAX_MESSAGES);saveProject(project);
      if(panel.dataset.projectId===String(project.id)){
        renderThread(panel,project);
        if(status)status.textContent='تم الرد باستخدام بيانات المشروع المتاحة.';
      }
    }catch(error){
      console.error('Project assistant failed:',error);
      if(status)status.textContent=error?.message||'تعذر الحصول على رد. حاول مرة أخرى.';
      app.toast(error?.message||'تعذر تشغيل مساعد المشروع.');
    }finally{
      input.disabled=false;button.disabled=false;button.innerHTML='إرسال <span>➤</span>';input.focus();
    }
  }
  function rerenderProject(project) {
    if (typeof app.openProductionProject === 'function') app.openProductionProject(project.id);
    syncPanel();
  }
  function applyProposal(project,message,index) {
    const proposal=normalizeProposal(message?.proposal);
    if (!proposal) { app.toast('التعديل المقترح غير صالح أو غير مدعوم.'); return; }
    if (message.appliedAt && !message.restoredAt) { app.toast('التعديل مطبّق بالفعل.'); return; }
    const before=String(project[proposal.field] == null ? '' : project[proposal.field]);
    if (before===proposal.content) { app.toast('المحتوى الحالي مطابق للتعديل المقترح بالفعل.'); return; }
    if (!confirm('تطبيق "'+proposal.title+'" على حقل '+proposal.fieldLabel+'؟\nسيتم حفظ النسخة الحالية لتقدر ترجع لها.')) return;
    const record={
      id:'aih-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),
      field:proposal.field,
      label:proposal.fieldLabel,
      title:proposal.title,
      before,
      after:proposal.content,
      createdAt:stamp()
    };
    if(!Array.isArray(project.aiFieldHistory))project.aiFieldHistory=[];
    project.aiFieldHistory.push(record);
    project.aiFieldHistory=project.aiFieldHistory.slice(-8);
    project[proposal.field]=proposal.content;
    if(proposal.field==='script')project.scriptPrevious=before;
    message.appliedAt=record.createdAt;
    message.historyId=record.id;
    message.restoredAt='';
    saveProject(project);
    rerenderProject(project);
    app.toast('تم تطبيق التعديل وحفظ النسخة السابقة.');
  }
  function undoProposal(project,message) {
    const history=Array.isArray(project.aiFieldHistory)?project.aiFieldHistory:[];
    const record=history.find(item=>item && item.id===message?.historyId);
    if(!record || !FIELD_RULES[record.field]) { app.toast('مش لاقي النسخة السابقة المرتبطة بالتعديل ده.'); return; }
    const current=String(project[record.field] == null ? '' : project[record.field]);
    if(current!==record.after) {
      app.toast('الحقل اتعدل بعد تطبيق الاقتراح. لن أستبدل التعديل الأحدث تلقائيًا.');
      return;
    }
    if(!confirm('استعادة النسخة السابقة من "'+record.label+'"؟'))return;
    project[record.field]=record.before;
    if(record.field==='script')project.scriptPrevious=record.after;
    record.restoredAt=stamp();
    message.restoredAt=record.restoredAt;
    saveProject(project);
    rerenderProject(project);
    app.toast('تمت استعادة النسخة السابقة بنجاح.');
  }
  async function copyText(value) {
    const text=String(value||'');if(!text)return;
    try{await navigator.clipboard.writeText(text);app.toast('تم نسخ الرسالة.');}
    catch(_){
      const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();
      try{document.execCommand('copy');app.toast('تم نسخ الرسالة.');}catch(__){app.toast('تعذر النسخ من المتصفح.');}
      area.remove();
    }
  }
  view.addEventListener('submit',event=>{
    const form=event.target.closest('[data-paa-form]');if(!form)return;
    event.preventDefault();
    const project=activeProject(),panel=document.getElementById('projectAssistantPanel');
    if(!project||!panel||panel.dataset.projectId!==String(project.id))return;
    sendMessage(project,panel,form);
  });
  view.addEventListener('keydown',event=>{
    const input=event.target.closest('[data-paa-input]');
    if(!input||event.key!=='Enter'||event.shiftKey)return;
    event.preventDefault();input.closest('form')?.requestSubmit();
  });
  view.addEventListener('click',event=>{
    const apply=event.target.closest('[data-paa-apply]');
    if(apply){
      const project=activeProject(),message=project&&conversationOf(project)[Number(apply.dataset.paaApply)];
      if(project&&message)applyProposal(project,message,Number(apply.dataset.paaApply));
      return;
    }
    const undo=event.target.closest('[data-paa-undo]');
    if(undo){
      const project=activeProject(),message=project&&conversationOf(project)[Number(undo.dataset.paaUndo)];
      if(project&&message)undoProposal(project,message);
      return;
    }
    const suggest=event.target.closest('[data-paa-suggest]');
    if(suggest){
      const input=document.getElementById('projectAssistantPanel')?.querySelector('[data-paa-input]');
      if(input){input.value=suggest.dataset.paaSuggest||'';input.focus();}
      return;
    }
    const copyButton=event.target.closest('[data-paa-copy]');
    if(copyButton){
      const project=activeProject(),message=project&&conversationOf(project)[Number(copyButton.dataset.paaCopy)];
      if(message)copyText(message.content);
      return;
    }
    const action=event.target.closest('[data-paa-action]');
    if(action?.dataset.paaAction==='clear'){
      const project=activeProject();if(!project)return;
      if(!confirm('تمسح محادثة المساعد الخاصة بالمشروع ده؟'))return;
      project.aiConversation=[];saveProject(project);syncPanel();app.toast('تم مسح محادثة المشروع.');
    }
  });
  const observer=new MutationObserver(syncPanel);
  observer.observe(view,{childList:true,subtree:true});
  syncPanel();
  window.addEventListener('entelaqtak:production-ready',syncPanel);
  window.EntelaqtakProjectAssistant={refresh:syncPanel};
})();
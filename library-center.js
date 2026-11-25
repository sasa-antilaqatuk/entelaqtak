/* Entelaqtak Library Center — one place for saved work and local files. */
(() => {
  'use strict';
  const app = window.EntelaqtakApp;
  const main = document.querySelector('main.main');
  const nav = document.getElementById('nav');
  if (!app || !main || document.getElementById('view-library')) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const safeFile = value => String(value || 'entelaqtak-file').replace(/[^\w\u0600-\u06FF.-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || 'entelaqtak-file';
  const fmtDate = value => {
    if (!value) return 'تاريخ الحفظ غير محدد';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 'تاريخ الحفظ غير محدد' : d.toLocaleDateString('ar-EG',{year:'numeric',month:'short',day:'numeric'});
  };
  const readJson = key => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  };
  const readSnapshots = () => {
    const value = readJson('entelaqtak-snapshots-v1');
    return Array.isArray(value) ? value.filter(item => item && item.data && typeof item.data === 'object') : [];
  };
  const download = (filename, content, type='application/json;charset=utf-8') => {
    const blob = new Blob([content],{type});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href=url; link.download=filename; link.style.display='none';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  };

  if (nav && !nav.querySelector('[data-view="library"]')) {
    const button = document.createElement('button');
    button.type='button'; button.dataset.view='library';
    button.innerHTML='<i aria-hidden="true">▤</i>مكتبتي والملفات';
    button.addEventListener('click',()=>app.go('library'));
    const settings=nav.querySelector('[data-view="settings"]');
    if (settings) nav.insertBefore(button,settings); else nav.appendChild(button);
  }
  app.addViews?.add('library');

  const view=document.createElement('section');
  view.className='view';
  view.id='view-library';
  view.setAttribute('aria-label','مكتبتي والملفات المحفوظة');
  const footer=main.querySelector('footer');
  if (footer) main.insertBefore(view,footer); else main.appendChild(view);

  const style=document.createElement('style');
  style.id='library-center-styles';
  style.textContent='#view-library{--lib-line:#2a3b58;--lib-muted:#9eacc2;min-width:0}\n'+
  '.library-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px;border:1px solid #2b4265;border-radius:18px;background:radial-gradient(400px 200px at 0 0,#2563eb20,transparent 70%),linear-gradient(130deg,#111d32,#101827);margin-bottom:14px}\n'+
  '.library-hero h1{font-size:clamp(22px,3vw,31px);margin:5px 0 7px}\n'+
  '.library-hero p{max-width:680px;color:#aebbd0;font-size:11px;line-height:1.9;margin:0}\n'+
  '.library-hero-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}\n'+
  '.library-hero-actions button,.library-filter,.library-card button{border:1px solid #354968;border-radius:10px;background:#17243a;color:#e7eefb;padding:9px 12px;font:700 10px Tahoma,Arial,sans-serif;cursor:pointer}\n'+
  '.library-hero-actions button.primary{background:linear-gradient(120deg,#2563eb,#3b82f6);border-color:#3b82f6;color:white}\n'+
  '.library-hero-actions button:hover,.library-filter:hover,.library-card button:hover{border-color:#60a5fa;background:#1d3150}\n'+
  '.library-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:14px}\n'+
  '.library-stat{padding:13px;border:1px solid var(--lib-line);border-radius:13px;background:#111b2c}\n'+
  '.library-stat b{display:block;font-size:22px;color:#f5f8ff;line-height:1.3}\n'+
  '.library-stat span{display:block;margin-top:3px;color:var(--lib-muted);font-size:9px}\n'+
  '.library-toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:12px;border:1px solid var(--lib-line);border-radius:14px;background:#101a2a;margin-bottom:14px}\n'+
  '.library-search{flex:1 1 220px;min-width:160px;height:39px;padding:0 12px;border:1px solid #334765;border-radius:10px;background:#0b1423;color:#f2f6ff;font:11px Tahoma,Arial,sans-serif}\n'+
  '.library-filters{display:flex;gap:6px;flex-wrap:wrap}\n'+
  '.library-filter{padding:8px 10px;background:#111c2d;color:#b8c5d9}\n'+
  '.library-filter.active{border-color:#3b82f6;background:#1c3b69;color:white}\n'+
  '.library-groups{display:grid;gap:13px}\n'+
  '.library-group{padding:15px;border:1px solid var(--lib-line);border-radius:15px;background:linear-gradient(145deg,#111b2b,#101827);min-width:0}\n'+
  '.library-group-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px}\n'+
  '.library-group-head h2{font-size:14px;margin:0;color:#f0f5ff}\n'+
  '.library-group-head p{font-size:9px;color:var(--lib-muted);margin:3px 0 0}\n'+
  '.library-count{display:grid;place-items:center;min-width:28px;height:26px;padding:0 7px;border:1px solid #31517d;border-radius:8px;background:#1b3760;color:#dbeafe;font-size:10px;font-weight:800}\n'+
  '.library-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}\n'+
  '.library-card{min-width:0;padding:13px;border:1px solid #2b3d59;border-radius:12px;background:#0d1727}\n'+
  '.library-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}\n'+
  '.library-card h3{font-size:12px;line-height:1.6;margin:0;color:#f0f5ff;overflow-wrap:anywhere}\n'+
  '.library-card p{font-size:10px;line-height:1.8;color:#aab9d0;margin:6px 0 0;overflow-wrap:anywhere}\n'+
  '.library-card-meta{display:flex;gap:6px;flex-wrap:wrap;color:#8193b0;font-size:9px;margin-top:7px}\n'+
  '.library-card-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px}\n'+
  '.library-card button{padding:7px 10px;font-size:9px}\n'+
  '.library-card button.open{background:#1d4ed8;border-color:#2563eb;color:white}\n'+
  '.library-empty{padding:16px;border:1px dashed #344968;border-radius:11px;color:#9baac1;background:#0c1625;font-size:10px;line-height:1.8}\n'+
  '.library-note{margin-top:12px;color:#8191a9;font-size:9px;line-height:1.9}\n'+
  '@media(max-width:760px){.library-hero{display:block;padding:16px}.library-hero-actions{justify-content:flex-start;margin-top:12px}.library-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.library-cards{grid-template-columns:1fr}.library-toolbar{align-items:stretch}.library-filters{overflow-x:auto;flex-wrap:nowrap;padding-bottom:3px}.library-filter{white-space:nowrap}}';
  document.head.appendChild(style);

  let activeFilter='all';
  let searchTerm='';

  function getCollections(){
    const state=app.getState();
    const thumbProject=readJson('entelaqtak-thumbnail-project-v2');
    const thumbFiles=window.EntelaqtakThumbnailFiles?.getMeta?.() || readJson('entelaqtak-thumbnail-source-meta-v1');
    const snapshots=readSnapshots().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    return [
      {type:'production',title:'مشاريع الإنتاج',hint:'مشاريع البحث والسكريبت والمونتاج والنشر',items:(Array.isArray(state.productionProjects)?state.productionProjects:[]).filter(x=>x&&x.kind==='production_project').slice().sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))),empty:'أي مشروع تحفظه من استوديو الإنتاج هيظهر هنا تلقائيًا.'},
      {type:'project-assets',title:'مرفقات المشاريع',hint:'الملفات والمراجع المرتبطة بكل مشروع إنتاج',items:(Array.isArray(state.productionProjects)?state.productionProjects:[]).filter(x=>x&&x.kind==='production_project').flatMap(project=>(Array.isArray(project.attachments)?project.attachments:[]).map(asset=>({...asset,id:String(project.id)+'::'+String(asset.id),attachmentId:String(asset.id),projectId:String(project.id),projectTitle:String(project.topic||'مشروع بدون عنوان')}))),empty:'ارفع ملفات من داخل أي مشروع أو اربط عنصرًا محفوظًا من مكتبتك.'},
      {type:'packs',title:'حزم المحتوى',hint:'السكريبت والعناوين والوصف وخطة اللقطات',items:Array.isArray(state.packs)?state.packs.slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))):[],empty:'لسه مفيش حزم محفوظة. أنشئ حزمة من استوديو المحتوى واحفظها.'},
      {type:'ideas',title:'أفكار المحتوى',hint:'كل الأفكار التي حفظتها من مولّد الأفكار',items:Array.isArray(state.ideas)?state.ideas.slice().reverse():[],empty:'الأفكار التي تحفظها من مولّد الأفكار ستظهر هنا.'},
      {type:'templates',title:'قوالب السكريبت',hint:'مسوداتك الجاهزة لإعادة الاستخدام',items:Array.isArray(state.scriptTemplates)?state.scriptTemplates.slice().reverse():[],empty:'احفظ سكريبتًا كقالب من أداة كاتب السكريبت ليظهر هنا.'},
      {type:'posts',title:'مواعيد النشر',hint:'المحتوى المخطط والمحتوى المنشور',items:Array.isArray(state.posts)?state.posts.slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))):[],empty:'لا توجد مواعيد نشر محفوظة حتى الآن.'},
      {type:'metrics',title:'سجلات الأداء',hint:'الأرقام التي أدخلتها يدويًا لمتابعة النتائج',items:Array.isArray(state.metrics)?state.metrics.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))):[],empty:'لا توجد سجلات أداء محفوظة حتى الآن.'},
      {type:'thumbnail',title:'مشروع الصورة المصغّرة',hint:'إعدادات آخر تصميم محفوظ في المتصفح',items:thumbProject&&thumbProject.state?[{id:'thumbnail-project',savedAt:thumbProject.savedAt,state:thumbProject.state}]:[],empty:'لم يتم حفظ إعدادات مشروع صورة مصغّرة بعد.'},
      {type:'thumbnail-file',title:'ملفات الصور',hint:'الصورة الأصلية المحفوظة لمصمم الصور المصغّرة',items:thumbFiles?[{id:'thumbnail-source',...thumbFiles}]:[],empty:'لا يوجد ملف صورة محفوظ. الصور الجديدة ستحفظ هنا بعد رفعها داخل مصمم الصور المصغّرة.'},
      {type:'backups',title:'النسخ الاحتياطية التلقائية',hint:'نسخ استرداد محلية محفوظة على هذا الجهاز',items:snapshots,empty:'ستظهر هنا النسخ الاحتياطية التي ينشئها الموقع تلقائيًا.'}
    ];
  }

  function detailFor(type,item){
    if(type==='production')return [item.platform,item.duration,({brief:'المشروع',research:'البحث',script:'السكريبت',edit:'المونتاج',publish:'النشر'})[item.stage]||'المشروع'].filter(Boolean).join(' · ');
    if(type==='project-assets')return [item.projectTitle,item.kind==='file'?(Math.max(1,Math.round((Number(item.size)||0)/1024))+' KB'):'عنصر مكتبة مرتبط'].filter(Boolean).join(' · ');
    if(type==='packs')return [item.platform,item.niche,item.createdAt?fmtDate(item.createdAt):''].filter(Boolean).join(' · ');
    if(type==='ideas')return [item.niche,item.platform,item.audience].filter(Boolean).join(' · ');
    if(type==='templates')return item.createdAt?fmtDate(item.createdAt):'قالب محفوظ';
    if(type==='posts')return [item.date,item.platform,item.status==='done'?'تم النشر':item.status==='progress'?'قيد التجهيز':'مخطط'].filter(Boolean).join(' · ');
    if(type==='metrics')return [item.date,Number(item.views||0).toLocaleString('en-US')+' مشاهدة'].join(' · ');
    if(type==='thumbnail')return 'تم حفظ إعدادات التصميم في هذا المتصفح';
    if(type==='thumbnail-file')return [item.name,item.size?Math.max(1,Math.round(item.size/1024))+' KB':''].filter(Boolean).join(' · ');
    if(type==='backups')return [fmtDate(item.createdAt),item.reason||'نسخة تلقائية'].filter(Boolean).join(' · ');
    return '';
  }

  function titleFor(type,item){
    if(type==='production')return item.topic||'مشروع بدون عنوان';
    if(type==='project-assets')return item.name||'مرفق مشروع';
    if(type==='packs')return item.topic||'حزمة بدون عنوان';
    if(type==='ideas')return item.title||'فكرة محفوظة';
    if(type==='templates')return item.name||'قالب سكريبت';
    if(type==='posts'||type==='metrics')return item.title||'محتوى بدون عنوان';
    if(type==='thumbnail')return item.state?.thumbTitle||'مشروع الصورة المصغّرة';
    if(type==='thumbnail-file')return item.name||'ملف الصورة الأصلية';
    if(type==='backups')return 'نسخة احتياطية';
    return 'عنصر محفوظ';
  }

  function textFor(type,item){
    if(type==='production')return [item.script,item.researchText,item.editPlan,item.publishPack].filter(Boolean).join('\n\n').slice(0,260);
    if(type==='project-assets')return item.kind==='file'?'ملف خاص محفوظ في التخزين السحابي · '+String(item.mime||''):String(item.text||'').slice(0,240);
    if(type==='packs')return [item.hook,item.script,item.description].filter(Boolean).join(' — ').slice(0,260);
    if(type==='ideas')return String(item.detail||item.angle||'').slice(0,240);
    if(type==='templates')return String(item.content||'').slice(0,240);
    if(type==='posts')return String(item.description||'').slice(0,220);
    if(type==='metrics')return 'الإعجابات: '+Number(item.likes||0)+' · التعليقات: '+Number(item.comments||0)+' · المشاركات: '+Number(item.shares||0);
    if(type==='thumbnail')return 'يمكنك فتح التصميم وتعديل النص والخلفية والقص ثم تصدير النتيجة.';
    if(type==='thumbnail-file')return 'ملف الصورة محفوظ محليًا على هذا الجهاز ويمكن تنزيله من هنا.';
    if(type==='backups')return 'نسخة محلية لاستعادة مساحة العمل عند الحاجة.';
    return '';
  }

  function card(type,item){
    const id=String(item.id??'');
    const attrs='data-library-open="'+esc(type)+'" data-library-id="'+esc(id)+'"';
    const exportAttrs='data-library-export="'+esc(type)+'" data-library-id="'+esc(id)+'"';
    return '<article class="library-card"><div class="library-card-top"><h3>'+esc(titleFor(type,item))+'</h3></div><p>'+esc(textFor(type,item)||'محفوظ في مكتبتك. افتحه للمتابعة أو حمّل نسخة مستقلة.')+'</p><div class="library-card-meta">'+esc(detailFor(type,item))+'</div><div class="library-card-actions"><button class="open" type="button" '+attrs+'>فتح</button><button type="button" '+exportAttrs+'>تنزيل نسخة</button></div></article>';
  }

  function render(){
    const collections=getCollections();
    const totals=collections.reduce((sum,group)=>sum+group.items.length,0);
    const state=app.getState();
    const groups=collections.filter(group=>activeFilter==='all'||activeFilter===group.type).map(group=>{
      const filtered=group.items.filter(item=>{
        if(!searchTerm)return true;
        return [titleFor(group.type,item),textFor(group.type,item),detailFor(group.type,item)].join(' ').toLocaleLowerCase('ar').includes(searchTerm);
      });
      return '<section class="library-group" data-library-group="'+esc(group.type)+'"><div class="library-group-head"><div><h2>'+esc(group.title)+'</h2><p>'+esc(group.hint)+'</p></div><span class="library-count">'+filtered.length+'</span></div>'+(filtered.length?'<div class="library-cards">'+filtered.map(item=>card(group.type,item)).join('')+'</div>':'<div class="library-empty">'+(searchTerm?'مفيش ملفات مطابقة للبحث داخل القسم ده.':esc(group.empty))+'</div>')+'</section>';
    }).join('');
    const productionCount=(Array.isArray(state.productionProjects)?state.productionProjects:[]).filter(x=>x&&x.kind==='production_project').length;
    view.innerHTML='<div class="library-hero"><div><span class="eyebrow">YOUR LIBRARY · ALL FILES</span><h1>مكتبتي والملفات</h1><p>كل أفكارك وحزمك ومشاريع الإنتاج والقوالب ومواعيد النشر والنسخ الاحتياطية في مكان واحد. العناصر هنا للعرض والتنزيل والفتح؛ لا يتم حذف أي ملف تلقائيًا.</p></div><div class="library-hero-actions"><button class="primary" type="button" data-library-export-all>تصدير كل ملفاتي</button><button type="button" data-library-refresh>تحديث المكتبة</button></div></div><div class="library-stats"><div class="library-stat"><b>'+state.ideas.length+'</b><span>أفكار محفوظة</span></div><div class="library-stat"><b>'+state.packs.length+'</b><span>حزم محتوى</span></div><div class="library-stat"><b>'+productionCount+'</b><span>مشاريع إنتاج</span></div><div class="library-stat"><b>'+totals+'</b><span>عناصر وملفات متاحة</span></div></div><div class="library-toolbar"><input class="library-search" id="librarySearch" type="search" value="'+esc(searchTerm)+'" placeholder="ابحث باسم المشروع أو الفكرة أو الملف..." aria-label="ابحث في مكتبتي"><div class="library-filters"><button class="library-filter '+(activeFilter==='all'?'active':'')+'" type="button" data-library-filter="all">الكل</button><button class="library-filter '+(activeFilter==='production'?'active':'')+'" type="button" data-library-filter="production">مشاريع الإنتاج</button><button class="library-filter '+(activeFilter==='project-assets'?'active':'')+'" type="button" data-library-filter="project-assets">مرفقات المشاريع</button><button class="library-filter '+(activeFilter==='packs'?'active':'')+'" type="button" data-library-filter="packs">الحزم</button><button class="library-filter '+(activeFilter==='ideas'?'active':'')+'" type="button" data-library-filter="ideas">الأفكار</button><button class="library-filter '+(activeFilter==='templates'?'active':'')+'" type="button" data-library-filter="templates">القوالب</button><button class="library-filter '+(activeFilter==='thumbnail-file'?'active':'')+'" type="button" data-library-filter="thumbnail-file">الصور</button><button class="library-filter '+(activeFilter==='backups'?'active':'')+'" type="button" data-library-filter="backups">النسخ الاحتياطية</button></div></div><div class="library-groups">'+groups+'</div><p class="library-note">المشاريع والحزم والأفكار والقوالب ومواعيد النشر محفوظة مع مساحة العمل. الملفات المرفوعة من المشاريع تُحفظ في مساحة خاصة بالحساب، والصورة الأصلية لمصمم الصور يمكن رفعها إلى المشروع من داخله.</p>';
  }

  function exportItem(type,id){
    const groups=getCollections();
    const group=groups.find(x=>x.type===type);
    const item=group?.items.find(x=>String(x.id??'')===String(id)) || group?.items[0];
    if(!item)return app.toast('العنصر لم يعد موجودًا في المكتبة.');
    if(type==='project-assets'){
      if(item.kind==='file'){
        const task=window.EntelaqtakProjectAssets?.downloadAttachment?.(item.projectId,item.attachmentId);
        if(task&&typeof task.catch==='function')task.catch(error=>app.toast(error?.message||'تعذر تنزيل الملف.'));
        else app.toast('افتح المشروع لتنزيل الملف.');
        return;
      }
      download('entelaqtak-'+safeFile(titleFor(type,item))+'.txt',String(item.text||''),'text/plain;charset=utf-8');
      return;
    }
    if(type==='thumbnail-file'){
      if(window.EntelaqtakThumbnailFiles?.downloadSource){window.EntelaqtakThumbnailFiles.downloadSource();return;}
      return app.toast('ملف الصورة غير متاح في هذا المتصفح.');
    }
    const payload={app:'انطلاقتك',type,exportedAt:new Date().toISOString(),item};
    download('entelaqtak-'+safeFile(titleFor(type,item))+'.json',JSON.stringify(payload,null,2));
  }

  function openItem(type,id){
    const groups=getCollections();
    const group=groups.find(x=>x.type===type);
    const item=group?.items.find(x=>String(x.id??'')===String(id)) || group?.items[0];
    if(!item)return app.toast('العنصر غير موجود حاليًا.');
    if(type==='project-assets'){
      const opened=app.openProductionProject?.(String(item.projectId));
      if(!opened){app.toast('تعذر فتح المشروع المرتبط بالمرفق.');return;}
      app.go('production');return;
    }
    if(type==='production'){
      const opened=app.openProductionProject?.(String(item.id));
      if(!opened){app.toast('تعذر فتح المشروع مباشرة. افتح استوديو الإنتاج ثم اختره من قائمة المشاريع.');app.go('production');return;}
      app.go('production');return;
    }
    if(type==='packs'){if(app.openContentPack?.(String(item.id)))return;app.go('studio');return;}
    if(type==='templates'){if(app.openScriptTemplate?.(String(item.id)))return;app.go('script');return;}
    if(type==='ideas'){app.go('ideas');return;}
    if(type==='posts'){app.go('calendar');return;}
    if(type==='metrics'){app.go('analytics');return;}
    if(type==='thumbnail'){app.go('thumbnail');return;}
    if(type==='thumbnail-file'){app.go('thumbnail');return;}
    if(type==='backups'){app.go('settings');return;}
  }

  view.addEventListener('click',event=>{
    const filter=event.target.closest('[data-library-filter]');
    if(filter){activeFilter=filter.dataset.libraryFilter;render();return;}
    if(event.target.closest('[data-library-refresh]')){render();app.toast('تم تحديث المكتبة من بيانات مساحة العمل.');return;}
    if(event.target.closest('[data-library-export-all]')){
      const s=app.getState();
      const payload={app:'انطلاقتك',exportedAt:new Date().toISOString(),workspace:s,thumbnailProject:readJson('entelaqtak-thumbnail-project-v2'),autoSnapshots:readSnapshots()};
      download('entelaqtak-all-files-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(payload,null,2));
      return;
    }
    const exportButton=event.target.closest('[data-library-export]');
    if(exportButton){exportItem(exportButton.dataset.libraryExport,exportButton.dataset.libraryId);return;}
    const openButton=event.target.closest('[data-library-open]');
    if(openButton){openItem(openButton.dataset.libraryOpen,openButton.dataset.libraryId);}
  });
  view.addEventListener('input',event=>{
    if(event.target.id==='librarySearch'){searchTerm=event.target.value.trim().toLocaleLowerCase('ar');renderGroupsOnly();}
  });
  function renderGroupsOnly(){
    const host=view.querySelector('.library-groups');
    if(!host)return;
    const collections=getCollections();
    const groups=collections.filter(group=>activeFilter==='all'||activeFilter===group.type).map(group=>{
      const filtered=group.items.filter(item=>[titleFor(group.type,item),textFor(group.type,item),detailFor(group.type,item)].join(' ').toLocaleLowerCase('ar').includes(searchTerm));
      return '<section class="library-group" data-library-group="'+esc(group.type)+'"><div class="library-group-head"><div><h2>'+esc(group.title)+'</h2><p>'+esc(group.hint)+'</p></div><span class="library-count">'+filtered.length+'</span></div>'+(filtered.length?'<div class="library-cards">'+filtered.map(item=>card(group.type,item)).join('')+'</div>':'<div class="library-empty">'+(searchTerm?'مفيش ملفات مطابقة للبحث داخل القسم ده.':esc(group.empty))+'</div>')+'</section>';
    }).join('');
    host.innerHTML=groups;
  }
  const oldGo=app.go;
  app.go=function(id){
    oldGo(id);
    if(id==='library'){
      const title=document.getElementById('pageTitle');
      if(title)title.textContent='مكتبتي والملفات';
      render();
    }
  };
  app.refreshLibrary=render;
  render();
})();
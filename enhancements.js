(()=>{'use strict';
const app=window.EntelaqtakApp;
if(!app)return;
const $=id=>document.getElementById(id);
const all=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const notify=message=>app.toast(message);
const main=document.querySelector('main.main');
const footer=main&&main.querySelector('.footer');
const nav=$('nav');
const enhancementStyle=document.createElement('style');
enhancementStyle.textContent=".enhance-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:99px;padding:7px 10px;background:#ffffff08;color:var(--muted);font-size:10px;white-space:nowrap}.enhance-pill.offline{color:#ffd38a;border-color:#9b713b;background:#9b713b18}.enhance-pill.online{color:#8ce0bd;border-color:#3b8a6d;background:#3b8a6d18}.enhance-pill[hidden]{display:none}.enhance-card{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:17px;margin-top:14px;min-width:0}.enhance-card h3{font-size:14px;margin:0 0 6px}.enhance-muted{font-size:10px;color:var(--muted);line-height:1.8;margin:0 0 12px}.enhance-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.enhance-actions button,.enhance-actions a{border:1px solid var(--line);border-radius:9px;padding:8px 11px;background:#ffffff09;color:var(--text);font:inherit;font-size:10px;text-decoration:none}.enhance-actions button.primary{background:var(--accent);color:#111;border-color:transparent;font-weight:700}.enhance-actions button:disabled{opacity:.45;cursor:not-allowed}.snapshot-list{display:grid;gap:8px}.snapshot-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border:1px solid var(--line);border-radius:11px;background:#ffffff05}.snapshot-row strong{display:block;font-size:11px}.snapshot-row small{display:block;color:var(--muted);font-size:9px;margin-top:3px}.snapshot-row .enhance-actions{margin:0}.snapshot-row .enhance-actions button{padding:6px 8px}.health-list{display:grid;gap:7px}.health-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:9px;font-size:10px}.health-row span:last-child{color:var(--muted);text-align:left}.thumbnail-layout{display:grid;grid-template-columns:minmax(250px,.8fr) minmax(0,1.2fr);gap:14px}.thumbnail-preview{min-width:0;padding:10px;border:1px solid var(--line);border-radius:14px;background:#0a1222;align-self:start}.thumbnail-preview canvas{display:block;width:100%;height:auto;border-radius:8px;background:#121a2b}.thumbnail-meta{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:9px;margin-top:8px}.thumbnail-help{font-size:10px;color:var(--muted);line-height:1.8}.analytics-enhanced canvas{display:block;width:100%;height:250px}.analytics-top-posts{display:grid;gap:7px;margin-top:12px}.analytics-top-post{display:flex;justify-content:space-between;gap:10px;padding:9px;border:1px solid var(--line);border-radius:9px;font-size:10px}.analytics-top-post span:last-child{color:var(--accent2);white-space:nowrap}.seo-search-preview{max-width:720px;padding:15px;border-radius:12px;background:#fff;color:#202124;direction:rtl;text-align:right}.seo-search-preview strong{display:block;color:#1a0dab;font-size:18px;font-weight:500;line-height:1.5}.seo-search-preview small{display:block;color:#5f6368;font-size:11px;direction:ltr;text-align:left;overflow-wrap:anywhere}.seo-search-preview p{color:#4d5156;font-size:12px;line-height:1.7;margin:6px 0 0}@media(max-width:760px){.thumbnail-layout{grid-template-columns:1fr}.snapshot-row{align-items:flex-start;flex-direction:column}.snapshot-row .enhance-actions{width:100%}.snapshot-row .enhance-actions button{flex:1}.enhance-pill{font-size:9px}}";
document.head.appendChild(enhancementStyle);
const thumbProStyle=document.createElement('style');
thumbProStyle.textContent="/* Thumbnail studio PRO */\n.thumb-studio{display:grid;gap:13px;min-width:0}\n.thumb-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin:5px 0 3px}\n.thumb-heading h1{font-size:clamp(22px,3vw,31px);margin:5px 0 2px;letter-spacing:-.4px}\n.thumb-heading h1 span{font-size:10px;vertical-align:middle;letter-spacing:1px;padding:5px 8px;border:1px solid #2563EB66;border-radius:99px;color:#BFDBFE;background:#2563EB1a}\n.thumb-heading p{font-size:11px;color:var(--muted);margin:0}\n.thumb-heading-meta{display:flex;align-items:center;gap:8px;white-space:nowrap;color:#a9b6cc;font-size:9px;padding:8px 10px;border:1px solid var(--line);border-radius:99px;background:#ffffff06}\n.thumb-heading-meta b{color:#e6eaff;font-variant-numeric:tabular-nums}\n.thumb-live-dot{width:7px;height:7px;border-radius:50%;background:#65d6a5;box-shadow:0 0 9px #65d6a5}\n.thumb-workbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 13px;border:1px solid rgba(153,171,214,.18);border-radius:15px;background:linear-gradient(110deg,#1b2742,#151f35);box-shadow:0 9px 26px #03081744}\n.thumb-workbar-left{display:flex;align-items:center;gap:10px;min-width:0}\n.thumb-workbar-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:linear-gradient(145deg,#1D4ED8,#38BDF8);color:#12192a;font-size:20px}\n.thumb-workbar-left strong,.thumb-workbar-left small{display:block}\n.thumb-workbar-left strong{font-size:11px}\n.thumb-workbar-left small{font-size:9px;color:var(--muted)}\n.thumb-workbar-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.thumb-workbar-actions button,.thumb-export-actions button,.thumb-inspector-actions button{border:1px solid var(--line);border-radius:9px;padding:7px 10px;color:var(--text);background:#ffffff08;font:inherit;font-size:9px;cursor:pointer;transition:.15s}\n.thumb-workbar-actions button:hover,.thumb-export-actions button:hover,.thumb-inspector-actions button:hover{border-color:#2563EBa6;background:#2563EB1b}\n.thumb-workbar-actions button:disabled{opacity:.3;cursor:not-allowed}\n.thumb-workbar-actions #thumbSaveProject,.thumb-export-actions button:first-child,.thumb-inspector-actions button:first-child{background:linear-gradient(110deg,#a99cff,#66dfc8);border-color:transparent;color:#111a2b;font-weight:900}\n.thumb-workspace{display:grid;grid-template-columns:minmax(280px,350px) minmax(0,1fr);gap:13px;align-items:start}\n.thumb-inspector{min-width:0;max-height:calc(100vh - 180px);overflow:auto;padding:13px;border:1px solid rgba(153,171,214,.18);border-radius:17px;background:linear-gradient(160deg,#1b2742,#111a2e);scrollbar-width:thin;scrollbar-color:#475878 transparent}\n.thumb-inspector-head{display:flex;justify-content:space-between;align-items:center;margin:0 2px 12px}\n.thumb-inspector-head strong{font-size:12px}\n.thumb-inspector-head span{font-size:8px;letter-spacing:1px;color:#7f91b2}\n.thumb-presets{padding:0 0 12px;border-bottom:1px solid rgba(153,171,214,.14)}\n.thumb-section-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 1px 9px}\n.thumb-section-title b{font-size:10px}\n.thumb-section-title small{font-size:8px;color:var(--muted)}\n.thumb-template-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}\n.thumb-template-grid button{min-width:0;display:grid;gap:4px;text-align:right;padding:7px;border:1px solid rgba(153,171,214,.15);border-radius:10px;background:#0f192d;color:#dbe4f2;cursor:pointer}\n.thumb-template-grid button:hover{border-color:#2563EBa6;transform:translateY(-1px)}\n.thumb-template-grid button.selected{border-color:#2563EB;background:linear-gradient(145deg,#2563EB25,#38BDF80c);box-shadow:inset 0 0 0 1px #2563EB44}\n.thumb-template-grid b{font-size:9px}\n.thumb-template-grid small{font-size:8px;color:#91a0ba}\n.thumb-template-swatch{height:32px;border-radius:6px;position:relative;overflow:hidden;background:#202b46}\n.thumb-template-swatch:after{content:\"\";position:absolute;inset:13px 7px 5px 7px;border-radius:2px;background:#fff;box-shadow:0 -6px 0 -2px rgba(255,255,255,.65)}\n.thumb-template-swatch.creator{background:linear-gradient(120deg,#33264e,#f5b942)}\n.thumb-template-swatch.tutorial{background:linear-gradient(120deg,#053e52,#39d6bd)}\n.thumb-template-swatch.gaming{background:linear-gradient(120deg,#240e32,#ff4f9a)}\n.thumb-template-swatch.podcast{background:linear-gradient(120deg,#102c3b,#69a9ff)}\n.thumb-template-swatch.minimal{background:linear-gradient(120deg,#dbe7ec,#9db8b5)}\n.thumb-template-swatch.news{background:linear-gradient(120deg,#4a1f35,#ff654f)}\n.thumb-accordion{border-bottom:1px solid rgba(153,171,214,.14);padding:0 0 2px}\n.thumb-accordion summary{display:flex;align-items:center;gap:8px;list-style:none;cursor:pointer;padding:12px 2px;font-size:10px;font-weight:800;color:#e8edfa}\n.thumb-accordion summary::-webkit-details-marker{display:none}\n.thumb-accordion summary>span{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#2563EB26;color:#c7bdff;font-size:9px}\n.thumb-accordion summary small{margin-right:auto;color:#7185a7;font-size:7px;letter-spacing:.8px}\n.thumb-accordion summary:after{content:\"＋\";color:#8d9bb4;font-size:13px}\n.thumb-accordion[open] summary:after{content:\"−\"}\n.thumb-controls{padding:0 1px 11px}\n.thumb-controls .field{margin-bottom:9px;gap:4px}\n.thumb-controls .field label,.thumb-controls label{font-size:9px;color:#c3cde0}\n.thumb-controls .field input:not([type=color]):not([type=file]),.thumb-controls .field select,.thumb-controls .field textarea{padding:8px 9px;font-size:10px;border-radius:8px;background:#0d172a;border-color:#34435f}\n.thumb-controls .field textarea{min-height:54px}\n.thumb-controls input[type=color]{width:100%;height:35px;padding:3px;border:1px solid #354563;border-radius:8px;background:#0d172a}\n.thumb-control-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}\n.thumb-range-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:7px 0 2px}\n.thumb-range-row label{font-size:9px;color:#c3cde0}\n.thumb-range-row output{font-size:9px;color:#8ee2d1;font-variant-numeric:tabular-nums}\n.thumb-range{width:100%;accent-color:#2563EB;height:16px;cursor:pointer}\n.thumb-upload{display:grid;place-items:center;gap:4px;padding:13px 9px;margin-bottom:10px;border:1px dashed #64749a;border-radius:11px;background:linear-gradient(120deg,#2563EB14,#38BDF80c);cursor:pointer;text-align:center}\n.thumb-upload>span{display:grid;place-items:center;width:27px;height:27px;border-radius:9px;background:#2563EB33;color:#d0c8ff;font-size:19px}\n.thumb-upload b{font-size:10px;color:#edf1fb}\n.thumb-upload small{font-size:8px;color:#8f9eb7}\n.thumb-upload input{width:100%;max-width:215px;font-size:8px;color:#aab7cc}\n.thumb-secondary-btn{width:100%;padding:8px 7px;border:1px solid var(--line);border-radius:8px;background:#ffffff08;color:#dce5f2;font-size:9px}\n.thumb-text-btn{border:0;background:transparent;color:#ff9da9;font-size:9px;padding:5px 0;cursor:pointer}\n.thumbnail-help{font-size:9px;color:#8798b3;line-height:1.8;margin:6px 0}\n.thumb-inspector-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding-top:12px}\n.thumb-stage{min-width:0;padding:13px;border:1px solid rgba(153,171,214,.18);border-radius:17px;background:linear-gradient(160deg,#1b2742,#10182b);box-shadow:0 14px 35px #03081744}\n.thumb-stage-top,.thumb-stage-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px}\n.thumb-stage-top{margin:1px 1px 12px}\n.thumb-stage-top strong,.thumb-stage-top small{display:block}\n.thumb-stage-top strong{font-size:11px}\n.thumb-stage-top small{font-size:9px;color:var(--muted);margin-top:2px}\n.thumb-status{padding:5px 8px;border:1px solid #38BDF833;border-radius:99px;color:#85e2cb;background:#38BDF80c;font-size:8px;white-space:nowrap}\n.thumb-canvas-wrap{position:relative;overflow:hidden;border:1px solid #50617e;border-radius:11px;background:repeating-conic-gradient(#1a2640 0% 25%,#111b30 0% 50%) 50%/24px 24px;box-shadow:0 18px 40px #02061166;touch-action:pan-y}\n.thumb-canvas-wrap canvas{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;cursor:grab}\n.thumb-canvas-wrap.dragging{touch-action:none}.thumb-canvas-wrap.dragging canvas{cursor:grabbing}\n.thumb-canvas-wrap.file-over{outline:3px solid #38BDF8;outline-offset:3px}\n.thumb-canvas-hint{position:absolute;left:12px;bottom:11px;padding:6px 9px;border:1px solid #ffffff22;border-radius:7px;background:#081221a8;color:#d5e0f1;font-size:8px;pointer-events:none}\n.thumb-stage-bottom{padding:11px 2px;border-bottom:1px solid rgba(153,171,214,.14)}\n.thumb-stage-bottom div{display:grid;gap:2px}\n.thumb-stage-bottom b{font-size:9px;color:#e9effa}\n.thumb-stage-bottom span{font-size:8px;color:#8999b5}\n.thumb-export-panel{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 2px 1px}\n.thumb-export-panel strong,.thumb-export-panel small{display:block}\n.thumb-export-panel strong{font-size:10px}\n.thumb-export-panel small{font-size:8px;color:var(--muted);margin-top:3px}\n.thumb-export-actions{display:flex;gap:7px}\n.thumb-studio-foot{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#7f91ad;font-size:8px;padding:0 3px}\n.thumb-studio-foot span:first-child{color:#93cfc4}\n@media(max-width:1050px){.thumb-workspace{grid-template-columns:minmax(260px,310px) minmax(0,1fr)}.thumb-inspector{max-height:none}}\n@media(max-width:760px){\n .thumb-heading{align-items:flex-start;flex-direction:column}\n .thumb-heading-meta{align-self:flex-start}\n .thumb-workbar{align-items:flex-start;flex-direction:column}\n .thumb-workbar-actions{width:100%}\n .thumb-workbar-actions button{flex:1}\n .thumb-workspace{grid-template-columns:1fr}\n .thumb-inspector{order:2;max-height:none}\n .thumb-stage{order:1;padding:9px}\n .thumb-template-grid{grid-template-columns:repeat(3,minmax(0,1fr))}\n .thumb-export-panel{align-items:flex-start;flex-direction:column}\n .thumb-export-actions{width:100%}\n .thumb-export-actions button{flex:1}\n .thumb-studio-foot{font-size:7px}\n}\n@media(max-width:430px){.thumb-control-grid{grid-template-columns:1fr 1fr}.thumb-template-grid button{padding:6px}.thumb-template-grid small{font-size:7px}.thumb-inspector-actions{grid-template-columns:1fr}.thumb-workbar-actions button{font-size:8px;padding:7px 6px}}\n";
document.head.appendChild(thumbProStyle);


// Network state and install prompt
const topActions=document.querySelector('.topactions');
const networkBadge=document.createElement('span');
networkBadge.id='networkStateBadge';
networkBadge.className='enhance-pill';
networkBadge.setAttribute('role','status');
networkBadge.setAttribute('aria-live','polite');
if(topActions)topActions.insertBefore(networkBadge,topActions.firstChild);
function renderNetwork(){
 const online=navigator.onLine!==false;
 networkBadge.className='enhance-pill '+(online?'online':'offline');
 networkBadge.textContent=online?'● متصل بالإنترنت':'● تعمل دون اتصال';
}
window.addEventListener('online',renderNetwork);
window.addEventListener('offline',renderNetwork);
renderNetwork();
let installEvent=null;
const installButton=document.createElement('button');
installButton.type='button';
installButton.className='enhance-pill';
installButton.textContent='تثبيت التطبيق';
installButton.hidden=true;
if(topActions)topActions.insertBefore(installButton,networkBadge.nextSibling);
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();
 installEvent=event;
 installButton.hidden=false;
});
installButton.addEventListener('click',async()=>{
 if(!installEvent)return;
 installEvent.prompt();
 try{
  const choice=await installEvent.userChoice;
  if(choice&&choice.outcome==='accepted')notify('تم بدء تثبيت انطلاقتك.');
 }catch(error){notify('تعذر فتح نافذة التثبيت من المتصفح.');}
 installEvent=null;
 installButton.hidden=true;
});
window.addEventListener('appinstalled',()=>{installButton.hidden=true;notify('تم تثبيت التطبيق على جهازك.');});
if(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)installButton.hidden=true;

// Offline application shell
if('serviceWorker' in navigator&&location.protocol==='https:'){
 let hadController=!!navigator.serviceWorker.controller;
 let reloadQueued=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(!hadController){hadController=true;return;}
  if(reloadQueued)return;
  reloadQueued=true;
  window.location.reload();
 });
 navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).then(registration=>{
  registration.update().catch(()=>{});
  renderDiagnostics();
 }).catch(error=>{
  console.warn('Service worker registration failed',error);
  renderDiagnostics();
 });
}

// Local, capped recovery snapshots. These remain on this device only.
const SNAPSHOT_KEY='entelaqtak-snapshots-v1';
const MAX_SNAPSHOTS=3;
const MAX_SNAPSHOT_CHARS=260000;
const SNAPSHOT_INTERVAL=6*60*60*1000;
function readSnapshots(){
 try{
  const value=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'[]');
  return Array.isArray(value)?value.filter(item=>item&&item.data&&typeof item.data==='object'):[];
 }catch(error){return[];}
}
function writeSnapshots(items){
 try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(items.slice(0,MAX_SNAPSHOTS)));return true;}
 catch(error){console.warn('Snapshot storage full',error);return false;}
}
function storeSnapshot(reason,force){
 let current;
 try{current=JSON.stringify(app.getState());}catch(error){return false;}
 if(!current||current.length<30||current.length>MAX_SNAPSHOT_CHARS){
  if(force)notify('النسخة كبيرة جدًا للحفظ التلقائي؛ استخدم تصدير JSON.');
  return false;
 }
 const items=readSnapshots().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
 if(items[0]&&JSON.stringify(items[0].data)===current)return false;
 const now=Date.now();
 if(!force&&items[0]&&now-(items[0].createdAt||0)<SNAPSHOT_INTERVAL)return false;
 const entry={id:'snap-'+now,createdAt:now,reason:String(reason||'نسخة تلقائية'),data:JSON.parse(current)};
 items.unshift(entry);
 const saved=writeSnapshots(items);
 if(saved)renderSnapshots();
 return saved;
}
function downloadFile(name,content,type){
 const blob=new Blob([content],{type:type||'application/octet-stream'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;anchor.download=name;anchor.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function formatDate(timestamp){
 try{return new Date(timestamp).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'});}
 catch(error){return new Date(timestamp).toLocaleString();}
}
function renderSnapshots(){
 const host=$('snapshotList');
 if(!host)return;
 const items=readSnapshots().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
 if(!items.length){host.className='snapshot-list';host.innerHTML='<div class="enhance-muted">لم تُنشأ نسخ تلقائية بعد. ستُحفظ نسخة عند وجود تغييرات مناسبة، وقبل الاستيراد أو المسح.</div>';return;}
 host.className='snapshot-list';
 host.innerHTML=items.map(item=>{
  const size=Math.max(1,Math.round(JSON.stringify(item.data).length/1024));
  return '<div class="snapshot-row"><div><strong>'+escapeHTML(item.reason)+'</strong><small>'+escapeHTML(formatDate(item.createdAt))+' · '+size+' KB</small></div><div class="enhance-actions"><button type="button" data-snapshot-export="'+escapeHTML(item.id)+'">تحميل</button><button type="button" data-snapshot-restore="'+escapeHTML(item.id)+'">استعادة</button><button type="button" data-snapshot-delete="'+escapeHTML(item.id)+'">حذف</button></div></div>';
 }).join('');
 all('[data-snapshot-export]',host).forEach(button=>button.addEventListener('click',()=>{
  const item=readSnapshots().find(x=>x.id===button.dataset.snapshotExport);
  if(item)downloadFile('entelaqtak-recovery-'+item.createdAt+'.json',JSON.stringify({app:'انطلاقتك',createdAt:new Date(item.createdAt).toISOString(),data:item.data},null,2),'application/json');
 }));
 all('[data-snapshot-restore]',host).forEach(button=>button.addEventListener('click',()=>{
  const item=readSnapshots().find(x=>x.id===button.dataset.snapshotRestore);
  if(!item)return;
  if(!confirm('سيتم استبدال بيانات العمل الحالية بهذه النسخة. أنشئ نسخة JSON من بياناتك الحالية أولًا عند الحاجة. متابعة؟'))return;
  try{localStorage.setItem('entelaqtak-v1',JSON.stringify(item.data));localStorage.setItem('entelaqtak-cloud-dirty-owner-v1','__local__');location.reload();}
  catch(error){notify('تعذرت استعادة النسخة بسبب مساحة التخزين.');}
 }));
 all('[data-snapshot-delete]',host).forEach(button=>button.addEventListener('click',()=>{
  if(!confirm('حذف النسخة الاحتياطية المحددة؟'))return;
  writeSnapshots(readSnapshots().filter(x=>x.id!==button.dataset.snapshotDelete));
  renderSnapshots();
 }));
}
function addSettingsCard(){
 const settings=$('view-settings');
 const grid=settings&&settings.querySelector('.grid2');
 if(!grid)return;
 if(!$('enhancedRecoveryCard')){
  const card=document.createElement('div');
  card.className='card';
  card.id='enhancedRecoveryCard';
  card.innerHTML='<h2>استعادة تلقائية</h2><p class="muted">نسخ احتياطية محلية محدودة على هذا الجهاز، مع نسخة قبل الاستيراد أو مسح البيانات. لا تغادر النسخ هذا المتصفح.</p><div id="snapshotList" class="snapshot-list"></div><div class="enhance-actions"><button type="button" class="primary" id="snapshotNow">إنشاء نسخة الآن</button></div>';
  grid.appendChild(card);
  $('snapshotNow').addEventListener('click',()=>{
   if(storeSnapshot('نسخة يدوية',true))notify('تم إنشاء النسخة الاحتياطية على هذا الجهاز.');
   else notify('لا توجد تغييرات جديدة أو تعذر حفظ النسخة.');
  });
  renderSnapshots();
 }
 if(!$('enhancedHealthCard')){
  const card=document.createElement('div');
  card.className='card';
  card.id='enhancedHealthCard';
  card.innerHTML='<h2>فحص صحة المنصة والتشخيص الذكي</h2><p class="muted">اختبارات فعلية لملفات الموقع ومسارات الأدوات والتخزين والمزامنة والتشغيل. لا يتم إرسال بيانات مشاريعك أو استهلاك رصيد الذكاء الاصطناعي.</p><div id="enhancedHealthList" class="health-list"></div><div class="enhance-actions"><button type="button" id="refreshHealth">تشغيل الفحص الشامل</button><button type="button" id="copyHealth" class="primary">نسخ تقرير فني</button><a href="https://github.com/sasa-antilaqatuk/entelaqtak/issues" target="_blank" rel="noopener noreferrer">الإبلاغ عن مشكلة</a></div>';
  grid.appendChild(card);
  $('refreshHealth').addEventListener('click',()=>{const button=$('refreshHealth');button.disabled=true;button.textContent='جارٍ الفحص...';renderDiagnostics().catch(error=>{addDiagnosticError('فشل الفحص',error&&error.message,'');const host=$('enhancedHealthList');if(host)host.textContent='تعذر إكمال الفحص. أعد المحاولة أو انسخ تقرير الأخطاء.';button.disabled=false;button.textContent='إعادة المحاولة';});});
  $('copyHealth').addEventListener('click',copyDiagnostics);
  renderDiagnostics();
 }
}
const diagnosticRuntimeErrors=[];
let lastDiagnosticReport=null;
function addDiagnosticError(kind,message,file){
 const clean=value=>String(value||"").replace(/https?:\/\/\S+/g,"[رابط]").replace(/\s+/g," ").slice(0,180);
 diagnosticRuntimeErrors.unshift({kind:clean(kind),message:clean(message),file:clean(file).split("/").pop(),time:new Date().toISOString()});
 if(diagnosticRuntimeErrors.length>15)diagnosticRuntimeErrors.length=15;
}
window.addEventListener("error",event=>{
 if(event&&event.target&&event.target!==window){
  const target=event.target;
  if(target.tagName==="SCRIPT"||target.tagName==="LINK"){
   addDiagnosticError("فشل تحميل ملف",target.src||target.href||target.tagName,"");
  }
  return;
 }
 addDiagnosticError("خطأ JavaScript",event&&event.message,event&&event.filename);
});
window.addEventListener("unhandledrejection",event=>{
 const reason=event&&event.reason;
 addDiagnosticError("رفض Promise",reason&&reason.message?reason.message:String(reason||"رفض غير معروف"),"");
});
function diagnosticStorageCheck(){
 try{
  const key="entelaqtak-health-check-"+Date.now();
  localStorage.setItem(key,"ok");
  const ok=localStorage.getItem(key)==="ok";
  localStorage.removeItem(key);
  const raw=localStorage.getItem("entelaqtak-v1")||"";
  let dataValid=true,recordCount=0;
  if(raw){
   try{
    const data=JSON.parse(raw);
    dataValid=!!data&&typeof data==="object"&&!Array.isArray(data);
    if(dataValid)recordCount=["ideas","packs","productionProjects","posts","metrics"].reduce((n,name)=>n+(Array.isArray(data[name])?data[name].length:0),0);
   }catch(_){dataValid=false;}
  }
  return {ok:ok&&dataValid,bytes:new Blob([raw]).size,recordCount,dataValid};
 }catch(error){return {ok:false,error:error&&error.name||"StorageError",bytes:0,recordCount:0,dataValid:false};}
}
function diagnosticRouteCheck(){
 const nav=$("nav"),buttons=nav?Array.from(nav.querySelectorAll("[data-view]")):[];
 const missing=buttons.map(button=>button.dataset.view).filter((id,index,list)=>id&&list.indexOf(id)===index&&!$("view-"+id));
 return {total:buttons.length,missing};
}
function diagnosticIndexedDBCheck(){
 return new Promise(resolve=>{
  if(!window.indexedDB){resolve({ok:false,detail:"غير مدعوم"});return;}
  let settled=false;
  const finish=value=>{if(settled)return;settled=true;resolve(value);};
  const timer=setTimeout(()=>finish({ok:false,detail:"انتهت مهلة الفحص"}),7000);
  try{
   const request=indexedDB.open("entelaqtak-files-v1",1);
   request.onupgradeneeded=()=>{
    const db=request.result;
    if(!db.objectStoreNames.contains("assets"))db.createObjectStore("assets");
   };
   request.onsuccess=()=>{const db=request.result;db.close();clearTimeout(timer);finish({ok:true,detail:"متاح"});};
   request.onerror=()=>{clearTimeout(timer);finish({ok:false,detail:request.error&&request.error.name||"تعذر الفتح"});};
   request.onblocked=()=>{clearTimeout(timer);finish({ok:false,detail:"قاعدة البيانات مشغولة"});};
  }catch(error){clearTimeout(timer);finish({ok:false,detail:error&&error.name||"تعذر الفتح"});}
 });
}
async function diagnosticAssetCheck(){
 const assets=["creator-suite.js","enhancements.js","platform-hub.js","production-studio.js","production-studio-pro.js","library-center.js","sidebar-organizer.js","language.js","control-center.js","service-worker.js","design-system.css","responsive-system.css","sidebar-system.css"];
 const results=await Promise.all(assets.map(async path=>{
  let timer=null;
  try{
   const controller=new AbortController();
   timer=setTimeout(()=>controller.abort(),8000);
   let response=await fetch(new URL("./"+path,document.baseURI).href,{method:"HEAD",cache:"no-store",credentials:"same-origin",signal:controller.signal});
   if(response.status===405||response.status===501){
    response=await fetch(new URL("./"+path,document.baseURI).href,{method:"GET",headers:{Range:"bytes=0-0"},cache:"no-store",credentials:"same-origin",signal:controller.signal});
    if(response.body&&response.body.cancel)response.body.cancel();
   }
   return {path,ok:response.ok,status:response.status};
  }catch(error){return {path,ok:false,status:error&&error.name==="AbortError"?"timeout":"network"};}
  finally{if(timer)clearTimeout(timer);}
 }));
 return results;
}
async function diagnosticServiceWorkerCheck(){
 if(!("serviceWorker" in navigator))return {ok:false,detail:"المتصفح لا يدعم Service Worker"};
 try{
  const registration=await navigator.serviceWorker.getRegistration("./");
  if(!registration)return {ok:false,detail:"لم يتم تسجيل عامل الخدمة بعد"};
  const active=!!registration.active;
  return {ok:active,detail:active?(navigator.serviceWorker.controller?"نشط ويتحكم في الصفحة":"نشط؛ قد يحتاج أول تحميل لإعادة الفتح"):"التسجيل موجود لكن العامل غير نشط"};
 }catch(error){return {ok:false,detail:error&&error.name||"تعذر الفحص"};}
}
function diagnosticLevel(ok,warning){return ok?"ok":warning?"warn":"bad";}
async function renderDiagnostics(){
 const host=$("enhancedHealthList");
 if(!host)return null;
 host.innerHTML='<div class="health-row"><span>الفحص الشامل</span><span>جارٍ فحص ملفات الموقع والخدمات...</span></div>';
 const storage=diagnosticStorageCheck();
 const routes=diagnosticRouteCheck();
 const [assets,indexed,worker,storageEstimate,cacheNames]=await Promise.all([
  diagnosticAssetCheck(),
  diagnosticIndexedDBCheck(),
  diagnosticServiceWorkerCheck(),
  navigator.storage&&navigator.storage.estimate?navigator.storage.estimate().catch(()=>null):Promise.resolve(null),
  window.caches&&caches.keys?caches.keys().catch(()=>[]):Promise.resolve([])
 ]);
 const failedAssets=assets.filter(item=>!item.ok);
 const config=window.ENTELAQTAK_CONFIG||{};
 const runtimeCount=diagnosticRuntimeErrors.length;
 const syncText=$("accountSync")?$("accountSync").textContent.trim():"غير متاحة";
 const checks=[
  {name:"الاتصال بالإنترنت",detail:navigator.onLine===false?"الجهاز غير متصل":"متصل",level:navigator.onLine===false?"warn":"ok"},
  {name:"الحفظ المحلي",detail:storage.ok?"يعمل — "+(storage.bytes/1024).toFixed(1)+" KB من بيانات مساحة العمل":("تعذر الفحص أو البيانات غير سليمة: "+(storage.error||"راجع مساحة التخزين")),level:storage.ok?"ok":"bad"},
  {name:"سلامة بيانات المشاريع",detail:storage.dataValid?"بنية البيانات قابلة للقراءة — "+storage.recordCount+" عنصر محفوظ":"تعذر قراءة بيانات مساحة العمل أو صيغة JSON غير سليمة",level:storage.dataValid?"ok":"bad"},
  {name:"قاعدة ملفات الصور",detail:indexed.detail,level:indexed.ok?"ok":"warn"},
  {name:"ملفات الموقع الأساسية",detail:failedAssets.length?"تعذر الوصول إلى "+failedAssets.length+" من "+assets.length+" ملفًا: "+failedAssets.map(item=>item.path).join("، "):"كل الملفات الأساسية متاحة ("+assets.length+"/"+assets.length+")",level:failedAssets.length?"bad":"ok"},
  {name:"سلامة مسارات الأدوات",detail:routes.missing.length?"مسارات بلا صفحة: "+routes.missing.join("، "):"كل أزرار التنقل لها صفحة — "+routes.total+" مسارًا",level:routes.missing.length?"bad":"ok"},
  {name:"التشغيل دون إنترنت",detail:worker.detail,level:worker.ok?"ok":"warn"},
  {name:"التخزين المؤقت",detail:cacheNames.length?cacheNames.length+" مساحة تخزين مؤقتة":"لا توجد مساحة تخزين مؤقت ظاهرة",level:cacheNames.length?"ok":"warn"},
  {name:"مساحة المتصفح",detail:storageEstimate&&Number.isFinite(storageEstimate.quota)?"استخدام تقريبي "+(storageEstimate.usage/1024/1024).toFixed(1)+" / "+(storageEstimate.quota/1024/1024).toFixed(0)+" MB":"المتصفح لا يعرض تقدير المساحة",level:storageEstimate?"ok":"warn"},
  {name:"إعداد الذكاء الاصطناعي",detail:config.url&&config.publishableKey?"الإعداد موجود؛ لم يُرسل طلب مدفوع أثناء الفحص":"إعداد الاتصال غير مكتمل",level:config.url&&config.publishableKey?"ok":"bad"},
  {name:"اتصال المزامنة",detail:syncText||"لا توجد حالة معروضة",level:/خطأ|فشل|تعذر|غير متصل/i.test(syncText)?"warn":"ok"},
  {name:"أخطاء وقت التشغيل",detail:runtimeCount?runtimeCount+" خطأ/أخطاء مسجلة في الجلسة":"لم يتم رصد أخطاء منذ بدء المراقبة",level:runtimeCount?"warn":"ok"},
  {name:"السياق الآمن",detail:window.isSecureContext?"HTTPS / سياق آمن":"الموقع ليس في سياق آمن",level:window.isSecureContext?"ok":"warn"}
 ];
 const bad=checks.filter(item=>item.level==="bad").length;
 const warn=checks.filter(item=>item.level==="warn").length;
 const passed=checks.length-bad-warn;
 const overall=bad?"يحتاج إصلاحًا":warn?"يحتاج مراجعة":"سليم حسب الاختبارات المتاحة";
 const stamp=new Date().toLocaleString("ar-EG");
 lastDiagnosticReport={generatedAt:new Date().toISOString(),overall,passed,warn,bad,checks,failedAssets,runtimeErrors:diagnosticRuntimeErrors.slice(0,10)};
 const styleId="entelaqtak-diagnostic-style";
 if(!$(styleId)){
  const style=document.createElement("style");style.id=styleId;
  style.textContent=".health-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 13px;margin:0 0 10px;border:1px solid var(--line);border-radius:12px;background:#ffffff07}.health-summary strong{font-size:12px}.health-summary span{font-size:10px;color:var(--muted)}.health-row{gap:10px}.health-row>span:first-child{font-weight:700}.health-row>span:last-child{max-width:68%;text-align:left;overflow-wrap:anywhere}.health-status{display:inline-flex;align-items:center;gap:5px}.health-status.health-ok{color:#65d6a5!important}.health-status.health-warn{color:#f4c66b!important}.health-status.health-bad{color:#ff8997!important}.health-summary.health-bad{border-color:#ff899755}.health-summary.health-warn{border-color:#f4c66b55}.health-summary.health-ok{border-color:#65d6a555}@media(max-width:520px){.health-row{align-items:flex-start;flex-direction:column}.health-row>span:last-child{max-width:100%;text-align:right}}";
  document.head.appendChild(style);
 }
 host.innerHTML='<div class="health-summary health-'+(bad?"bad":warn?"warn":"ok")+'"><strong>حالة المنصة: '+escapeHTML(overall)+'</strong><span>'+passed+' ناجح · '+warn+' تنبيه · '+bad+' مشكلة</span></div>'+
  checks.map(item=>'<div class="health-row" data-level="'+item.level+'"><span>'+escapeHTML(item.name)+'</span><span class="health-status health-'+item.level+'">'+(item.level==="ok"?"✓":item.level==="warn"?"!":"×")+' '+escapeHTML(item.detail)+'</span></div>').join("")+
  '<p class="muted" style="font-size:9px;margin:9px 2px 0">آخر فحص: '+escapeHTML(stamp)+' · الفحص لا يرسل محتوى مشاريعك ولا ينفذ طلب ذكاء اصطناعي مدفوع.</p>';
 const refresh=$("refreshHealth");
 if(refresh){refresh.disabled=false;refresh.textContent="إعادة تشغيل الفحص الشامل";}
 return lastDiagnosticReport;
}
async function copyDiagnostics(){
 const report=lastDiagnosticReport||await renderDiagnostics();
 if(!report){notify("تعذر تجهيز التقرير الفني.");return;}
 const lines=[
  "انطلاقتك — تقرير فحص المنصة",
  "وقت الفحص: "+report.generatedAt,
  "النتيجة: "+report.overall,
  "النتائج: "+report.passed+" ناجح، "+report.warn+" تنبيه، "+report.bad+" مشكلة",
  "المتصفح: "+navigator.userAgent,
  "العنوان: "+location.origin+location.pathname,
  "",
  ...report.checks.map(item=>"["+item.level.toUpperCase()+"] "+item.name+": "+item.detail),
  "",
  "آخر أخطاء الجلسة:",
  ...(report.runtimeErrors.length?report.runtimeErrors.map(item=>item.kind+": "+item.message+" ("+item.file+")"):["لا توجد أخطاء مرصودة"])
 ];
 const content=lines.join("\n");
 try{
  if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(content);
  else{
   const area=document.createElement("textarea");area.value=content;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();
   const copied=document.execCommand("copy");area.remove();if(!copied)throw new Error("copy unavailable");
  }
  notify("تم نسخ تقرير الفحص الفني.");
 }catch(error){notify("تعذر النسخ تلقائيًا؛ أعد المحاولة من متصفح يدعم النسخ.");}
}
addSettingsCard();
window.addEventListener("load",()=>{setTimeout(()=>renderDiagnostics().catch(error=>addDiagnosticError("فشل الفحص التلقائي",error&&error.message,"")),700);},{once:true});
// Observe the same-page local workspace writes so core tools receive recovery snapshots too.
const nativeStorageSetItem=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){
 const result=nativeStorageSetItem.call(this,key,value);
 if(this===localStorage&&key==='entelaqtak-v1'){
  const schedule=()=>storeSnapshot('نسخة تلقائية',false);
  if(typeof queueMicrotask==='function')queueMicrotask(schedule);
  else setTimeout(schedule,0);
 }
 return result;
};
storeSnapshot('نسخة تلقائية',false);
document.addEventListener('click',event=>{
 const clear=event.target&&event.target.closest&&event.target.closest('#clearAllData');
 if(clear)storeSnapshot('قبل مسح البيانات',true);
},true);
document.addEventListener('change',event=>{
 const target=event.target;
 if(target&&(target.id==='settingsImportFile'||target.id==='importFile')&&target.files&&target.files.length)storeSnapshot('قبل استيراد نسخة',true);
},true);
window.addEventListener('pagehide',()=>storeSnapshot('نسخة تلقائية',false));
if(typeof app.save==='function'){
 const originalSave=app.save;
 app.save=function(){
  const result=originalSave.apply(this,arguments);
  storeSnapshot('نسخة تلقائية',false);
  if($('view-analytics')&&$('view-analytics').classList.contains('active'))renderAnalytics();
  return result;
 };
}

// Pro thumbnail studio: editable text layers, photo crop controls, presets, history and exports.
app.addViews&&app.addViews.add('thumbnail');
if(nav&&!nav.querySelector('[data-view="thumbnail"]')){
 const button=document.createElement('button');
 button.type='button';
 button.dataset.view='thumbnail';
 button.innerHTML='<i aria-hidden="true">▧</i>مصمم الصور المصغرة';
 const before=nav.querySelector('[data-view="analytics"]');
 if(before)nav.insertBefore(button,before);else nav.appendChild(button);
 button.addEventListener('click',()=>app.go('thumbnail'));
}
const thumbnailSection=document.createElement('section');
thumbnailSection.className='view';
thumbnailSection.id='view-thumbnail';
thumbnailSection.innerHTML='<div class="thumb-studio"><div class="thumb-heading"><div><span class="eyebrow">ENTELAQTAK CREATIVE LAB · 01</span><h1>مصمم الصور المصغّرة <span>PRO</span></h1><p>استوديو تصميم كامل لصورة توقف التمرير — عدّل كل طبقة وشاهد النتيجة فورًا.</p></div><div class="thumb-heading-meta"><span class="thumb-live-dot"></span>معاينة مباشرة <b>1280 × 720</b></div></div><div class="thumb-workbar"><div class="thumb-workbar-left"><span class="thumb-workbar-icon">▧</span><div><strong>مشروع صورة مصغّرة</strong><small>كل التعديلات محلية على جهازك</small></div></div><div class="thumb-workbar-actions"><button type="button" id="thumbUndo" title="تراجع">↶</button><button type="button" id="thumbRedo" title="إعادة">↷</button><button type="button" id="thumbSaveProject">حفظ المشروع</button><button type="button" id="thumbExportProject">تصدير الإعدادات</button></div></div><div class="thumb-workspace"><aside class="thumb-inspector"><div class="thumb-inspector-head"><strong>لوحة التصميم</strong><span>EDIT PANEL</span></div><div class="thumb-presets"><div class="thumb-section-title"><b>ابدأ بقالب احترافي</b><small>اختار ستايل وعدّله براحتك</small></div><div class="thumb-template-grid"><button type="button" data-thumb-template="creator"><i class="thumb-template-swatch creator"></i><b>صانع محتوى</b><small>واضح وجريء</small></button><button type="button" data-thumb-template="tutorial"><i class="thumb-template-swatch tutorial"></i><b>شرح وتعليم</b><small>منظم ومشرق</small></button><button type="button" data-thumb-template="gaming"><i class="thumb-template-swatch gaming"></i><b>ألعاب</b><small>طاقة وتباين</small></button><button type="button" data-thumb-template="podcast"><i class="thumb-template-swatch podcast"></i><b>بودكاست</b><small>هادئ واحترافي</small></button><button type="button" data-thumb-template="minimal"><i class="thumb-template-swatch minimal"></i><b>Minimal</b><small>بسيط وأنيق</small></button><button type="button" data-thumb-template="news"><i class="thumb-template-swatch news"></i><b>أخبار وترند</b><small>عنوان ملفت</small></button></div></div><details class="thumb-accordion" open><summary><span>01</span> النص والطبقات <small>TEXT LAYERS</small></summary><div class="thumb-controls"><div class="field"><label for="thumbTitle">العنوان الرئيسي</label><textarea id="thumbTitle" maxlength="110" rows="2" placeholder="مثال: السر اللي محدش قالك عليه"></textarea></div><div class="field"><label for="thumbSubtitle">سطر توضيحي</label><input id="thumbSubtitle" maxlength="75" placeholder="مثال: دليل عملي للمبتدئين"></div><div class="field"><label for="thumbBadge">شارة صغيرة</label><input id="thumbBadge" maxlength="25" placeholder="مثال: جديد · خطوة بخطوة"></div><div class="field"><label for="thumbBrand">اسم القناة / العلامة</label><input id="thumbBrand" maxlength="28" value="ENTELAQTAK"></div><div class="thumb-control-grid"><div class="field"><label for="thumbFont">نوع الخط</label><select id="thumbFont"><option value="Tahoma">Tahoma عربي</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Impact">Impact</option></select></div><div class="field"><label for="thumbAlign">محاذاة العنوان</label><select id="thumbAlign"><option value="right">يمين</option><option value="center">منتصف</option><option value="left">يسار</option></select></div></div><div class="thumb-range-row"><label for="thumbFontSize">حجم العنوان</label><output id="thumbFontSizeValue">88</output></div><input class="thumb-range" id="thumbFontSize" type="range" min="48" max="124" value="88"><div class="thumb-control-grid"><div class="field"><label for="thumbTextColor">لون العنوان</label><input id="thumbTextColor" type="color" value="#ffffff"></div><div class="field"><label for="thumbOutlineColor">لون الحدود</label><input id="thumbOutlineColor" type="color" value="#10182c"></div></div><div class="thumb-range-row"><label for="thumbOutline">سُمك حدود النص</label><output id="thumbOutlineValue">4</output></div><input class="thumb-range" id="thumbOutline" type="range" min="0" max="14" value="4"><div class="thumb-range-row"><label for="thumbTitleY">موضع العنوان رأسيًا</label><output id="thumbTitleYValue">370</output></div><input class="thumb-range" id="thumbTitleY" type="range" min="190" max="560" value="370"><div class="thumb-control-grid"><div class="field"><label for="thumbBadgeColor">لون الشارة</label><input id="thumbBadgeColor" type="color" value="#2563EB"></div><div class="field"><label for="thumbSticker">عنصر تعبيري</label><select id="thumbSticker"><option value="">بدون</option><option value="🔥">🔥 نار</option><option value="🎯">🎯 هدف</option><option value="💡">💡 فكرة</option><option value="🚀">🚀 انطلاق</option><option value="👑">👑 تاج</option><option value="⚡">⚡ طاقة</option><option value="🎬">🎬 فيديو</option></select></div></div></div></details><details class="thumb-accordion" open><summary><span>02</span> الصورة الرئيسية <small>IMAGE & CROP</small></summary><div class="thumb-controls"><label class="thumb-upload" for="thumbImage"><span>＋</span><b>ارفع صورتك هنا</b><small>JPG · PNG · WEBP — حتى 12MB</small><input id="thumbImage" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><div class="thumb-control-grid"><div class="field"><label for="thumbFit">طريقة الملاءمة</label><select id="thumbFit"><option value="cover">ملء الإطار</option><option value="contain">إظهار الصورة كاملة</option></select></div><div class="field"><label for="thumbImageReset">إدارة الصورة</label><button type="button" class="thumb-secondary-btn" id="thumbImageReset">إعادة ضبط القص</button></div></div><div class="thumb-range-row"><label for="thumbZoom">تكبير الصورة</label><output id="thumbZoomValue">100%</output></div><input class="thumb-range" id="thumbZoom" type="range" min="50" max="250" value="100"><div class="thumb-range-row"><label for="thumbImageX">تحريك أفقي</label><output id="thumbImageXValue">0</output></div><input class="thumb-range" id="thumbImageX" type="range" min="-640" max="640" value="0"><div class="thumb-range-row"><label for="thumbImageY">تحريك رأسي</label><output id="thumbImageYValue">0</output></div><input class="thumb-range" id="thumbImageY" type="range" min="-360" max="360" value="0"><div class="thumb-range-row"><label for="thumbBrightness">سطوع الصورة</label><output id="thumbBrightnessValue">100%</output></div><input class="thumb-range" id="thumbBrightness" type="range" min="50" max="150" value="100"><p class="thumbnail-help">تقدر تسحب الصورة مباشرة داخل المعاينة لتحريكها، أو تستخدم أشرطة التحكم للضبط الدقيق.</p><button type="button" id="clearThumbnailImage" class="thumb-text-btn">إزالة الصورة</button></div></details><details class="thumb-accordion" open><summary><span>03</span> الخلفية والألوان <small>ART DIRECTION</small></summary><div class="thumb-controls"><div class="thumb-control-grid"><div class="field"><label for="thumbBgStyle">ستايل الخلفية</label><select id="thumbBgStyle"><option value="midnight">Midnight</option><option value="ocean">Ocean</option><option value="sunset">Sunset</option><option value="forest">Forest</option><option value="paper">Light Studio</option></select></div><div class="field"><label for="thumbDecor">الزخارف</label><select id="thumbDecor"><option value="glow">توهج ضوئي</option><option value="rays">أشعة</option><option value="grid">شبكة</option><option value="slashes">خطوط مائلة</option><option value="none">بدون زخارف</option></select></div></div><div class="thumb-control-grid"><div class="field"><label for="thumbAccent">اللون الأساسي</label><input id="thumbAccent" type="color" value="#2563EB"></div><div class="field"><label for="thumbOverlay">تعتيم الصورة</label><input id="thumbOverlay" type="range" min="0" max="85" value="34" class="thumb-range"></div></div><p class="thumbnail-help">اسحب الصورة أو غيّر الألوان والخلفية، وستتحدث المعاينة تلقائيًا.</p></div></details><div class="thumb-inspector-actions"><button type="button" id="drawThumbnail">تحديث المعاينة</button><button type="button" id="thumbFromTitles">جلب عنوان من مولّد العناوين</button></div></aside><div class="thumb-stage"><div class="thumb-stage-top"><div><strong>منطقة المعاينة</strong><small>اسحب الصورة لتغيير مكانها · النتيجة النهائية 16:9</small></div><span id="thumbStatus" class="thumb-status">جاهز للتصميم</span></div><div class="thumb-canvas-wrap" id="thumbCanvasWrap"><canvas id="thumbnailCanvas" width="1280" height="720" role="img" aria-label="معاينة صورة مصغرة بمقاس 1280 في 720"></canvas><div class="thumb-canvas-hint" id="thumbCanvasHint">ارفع صورة لتبدأ — أو اختر قالبًا جاهزًا</div></div><div class="thumb-stage-bottom"><div><b>1280 × 720</b><span>16:9 · YouTube Thumbnail</span></div><div><b id="thumbFileEstimate">PNG عالي الجودة</b><span>جاهز للتصدير</span></div></div><div class="thumb-export-panel"><div><strong>تصدير التصميم</strong><small>حمّل الصورة النهائية بجودة عالية</small></div><div class="thumb-export-actions"><button type="button" id="downloadThumbnail">تحميل PNG</button><button type="button" id="downloadThumbnailJpg">تحميل JPG</button></div></div></div></div><div class="thumb-studio-foot"><span>✦ الصورة تُنشأ داخل متصفحك ولا يتم رفعها إلى خادم.</span><span>استخدم صورًا تملك حق استخدامها.</span></div></div>';
if(footer)footer.insertAdjacentElement('beforebegin',thumbnailSection);
const thumbCanvas=$('thumbnailCanvas');
const thumbCtx=thumbCanvas&&thumbCanvas.getContext('2d');
const thumbProjectKey='entelaqtak-thumbnail-project-v2';
const THUMB_FILE_DB='entelaqtak-files-v1',THUMB_FILE_STORE='assets',THUMB_FILE_KEY='thumbnail-source',THUMB_FILE_META='entelaqtak-thumbnail-source-meta-v1';
function openThumbFileDb(){
 if(!window.indexedDB)return Promise.reject(new Error('تخزين الملفات غير مدعوم في هذا المتصفح.'));
 return new Promise((resolve,reject)=>{
  const request=window.indexedDB.open(THUMB_FILE_DB,1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(THUMB_FILE_STORE))db.createObjectStore(THUMB_FILE_STORE);};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('تعذر فتح مكتبة الملفات.'));
 });
}
function saveThumbSource(file){
 return openThumbFileDb().then(db=>new Promise((resolve,reject)=>{
  const record={blob:file,name:String(file.name||'thumbnail-source'),type:String(file.type||'image/jpeg'),size:Number(file.size)||0,savedAt:new Date().toISOString()};
  const tx=db.transaction(THUMB_FILE_STORE,'readwrite');
  tx.objectStore(THUMB_FILE_STORE).put(record,THUMB_FILE_KEY);
  tx.oncomplete=()=>{db.close();const meta={name:record.name,type:record.type,size:record.size,savedAt:record.savedAt};try{localStorage.setItem(THUMB_FILE_META,JSON.stringify(meta));}catch(_){}resolve(meta);};
  tx.onerror=()=>{db.close();reject(tx.error||new Error('تعذر حفظ ملف الصورة.'));};
  tx.onabort=()=>{db.close();reject(tx.error||new Error('تم إيقاف حفظ ملف الصورة.'));};
 }));
}
function getThumbSource(){
 return openThumbFileDb().then(db=>new Promise((resolve,reject)=>{
  const tx=db.transaction(THUMB_FILE_STORE,'readonly');
  const request=tx.objectStore(THUMB_FILE_STORE).get(THUMB_FILE_KEY);
  request.onsuccess=()=>{const result=request.result;db.close();resolve(result||null);};
  request.onerror=()=>{db.close();reject(request.error||new Error('تعذر قراءة ملف الصورة.'));};
 })).catch(()=>null);
}
function getThumbSourceMeta(){
 try{return JSON.parse(localStorage.getItem(THUMB_FILE_META)||'null');}catch(_){return null;}
}
function deleteThumbSource(){
 return openThumbFileDb().then(db=>new Promise((resolve,reject)=>{
  const tx=db.transaction(THUMB_FILE_STORE,'readwrite');
  tx.objectStore(THUMB_FILE_STORE).delete(THUMB_FILE_KEY);
  tx.oncomplete=()=>{db.close();try{localStorage.removeItem(THUMB_FILE_META);}catch(_){}resolve(true);};
  tx.onerror=()=>{db.close();reject(tx.error||new Error('تعذر حذف ملف الصورة.'));};
 })).catch(()=>{try{localStorage.removeItem(THUMB_FILE_META);}catch(_){}return false;});
}
function downloadThumbSource(){
 getThumbSource().then(record=>{
  if(!record?.blob){notify('ملف الصورة الأصلية غير محفوظ على هذا الجهاز.');return;}
  const url=URL.createObjectURL(record.blob),a=document.createElement('a');
  a.href=url;a.download=record.name||'entelaqtak-thumbnail-source';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
 }).catch(()=>notify('تعذر الوصول إلى ملف الصورة.'));
}
window.EntelaqtakThumbnailFiles={getMeta:getThumbSourceMeta,downloadSource:downloadThumbSource,hasSavedSource:()=>!!getThumbSourceMeta(),getSourceBlob:async()=>{const record=await getThumbSource();return record?.blob?{blob:record.blob,name:String(record.name||'thumbnail-source.jpg'),type:String(record.type||record.blob.type||'image/jpeg'),size:Number(record.size)||record.blob.size||0}:null;}};
let thumbImage=null,thumbObjectUrl=null,thumbHistory=[],thumbHistoryIndex=-1,thumbHistoryTimer=null,thumbDrag=null;
const thumbControlIds=['thumbTitle','thumbSubtitle','thumbBadge','thumbBrand','thumbFont','thumbAlign','thumbFontSize','thumbTextColor','thumbOutlineColor','thumbOutline','thumbTitleY','thumbBadgeColor','thumbSticker','thumbFit','thumbZoom','thumbImageX','thumbImageY','thumbBrightness','thumbBgStyle','thumbDecor','thumbAccent','thumbOverlay'];
function thumbState(){
 const state={};
 thumbControlIds.forEach(id=>{const el=$(id);if(el)state[id]=el.value;});
 return state;
}
function applyThumbState(state){
 if(!state||typeof state!=='object')return;
 thumbControlIds.forEach(id=>{const el=$(id);if(el&&state[id]!==undefined)el.value=state[id];});
 updateThumbOutputs();
 drawThumbnail();
}
function updateThumbOutputs(){
 const pairs={thumbFontSize:'',thumbOutline:'',thumbTitleY:'',thumbZoom:'%',thumbImageX:'',thumbImageY:'',thumbBrightness:'%'};
 Object.keys(pairs).forEach(id=>{
  const output=$(id+'Value'),el=$(id);
  if(output&&el)output.textContent=String(el.value)+pairs[id];
 });
}
function updateThumbHistoryButtons(){
 const undo=$('thumbUndo'),redo=$('thumbRedo');
 if(undo)undo.disabled=thumbHistoryIndex<=0;
 if(redo)redo.disabled=thumbHistoryIndex<0||thumbHistoryIndex>=thumbHistory.length-1;
}
function pushThumbHistory(){
 const state=thumbState(),serialized=JSON.stringify(state);
 if(thumbHistoryIndex>=0&&JSON.stringify(thumbHistory[thumbHistoryIndex])===serialized)return;
 thumbHistory=thumbHistory.slice(0,thumbHistoryIndex+1);
 thumbHistory.push(state);
 if(thumbHistory.length>35)thumbHistory.shift();
 thumbHistoryIndex=thumbHistory.length-1;
 updateThumbHistoryButtons();
}
function scheduleThumbHistory(){
 clearTimeout(thumbHistoryTimer);
 thumbHistoryTimer=setTimeout(pushThumbHistory,450);
}
function thumbRoundedRect(ctx,x,y,w,h,r){
 const radius=Math.min(r,w/2,h/2);
 ctx.beginPath();
 if(typeof ctx.roundRect==='function'){ctx.roundRect(x,y,w,h,radius);return;}
 ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);ctx.closePath();
}
function wrapCanvasText(context,text,maxWidth,maxLines){
 const words=String(text||'').trim().split(/\s+/).filter(Boolean),lines=[];
 let line='';
 words.forEach(word=>{
  const next=line?line+' '+word:word;
  if(context.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;
 });
 if(line)lines.push(line);
 if(lines.length>maxLines){
  const result=lines.slice(0,maxLines);
  result[maxLines-1]=result[maxLines-1].replace(/[،,؛;:.\s]+$/,'')+'…';
  return result;
 }
 return lines;
}
function drawThumbBackground(ctx,w,h,accent){
 const palettes={
  midnight:['#11172a','#27264b','#101c32'],
  ocean:['#062b40','#12627a','#10192e'],
  sunset:['#4a1f35','#a64c42','#1a1831'],
  forest:['#0d342e','#276b55','#101e2d'],
  paper:['#dbe7ec','#f5f0e5','#bac8d2']
 };
 const colors=palettes[$('thumbBgStyle').value]||palettes.midnight;
 const gradient=ctx.createLinearGradient(0,0,w,h);
 gradient.addColorStop(0,colors[0]);gradient.addColorStop(.52,colors[1]);gradient.addColorStop(1,colors[2]);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 if(!thumbImage){
  const radial=ctx.createRadialGradient(w*.18,h*.88,8,w*.18,h*.88,w*.68);
  radial.addColorStop(0,accent+'88');radial.addColorStop(1,accent+'00');
  ctx.fillStyle=radial;ctx.fillRect(0,0,w,h);
 }
}
function drawThumbDecor(ctx,w,h,accent){
 const type=$('thumbDecor').value;
 ctx.save();
 if(type==='glow'){
  const glow=ctx.createRadialGradient(w*.82,h*.12,8,w*.82,h*.12,w*.48);
  glow.addColorStop(0,accent+'66');glow.addColorStop(1,accent+'00');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=2;
  [85,120,155].forEach(rad=>{ctx.beginPath();ctx.arc(w*.84,h*.12,rad,0,Math.PI*2);ctx.stroke();});
 }else if(type==='rays'){
  ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=18;
  for(let i=-500;i<w+500;i+=125){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i-360,h);ctx.stroke();}
 }else if(type==='grid'){
  ctx.strokeStyle='rgba(255,255,255,.09)';ctx.lineWidth=2;
  for(let x=0;x<=w;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<=h;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
 }else if(type==='slashes'){
  ctx.fillStyle=accent+'38';
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(w*.72+i*78,0);ctx.lineTo(w*.88+i*78,0);ctx.lineTo(w*.5+i*78,h);ctx.lineTo(w*.34+i*78,h);ctx.closePath();ctx.fill();}
 }
 ctx.restore();
}
function drawThumbImage(ctx,w,h){
 if(!thumbImage)return;
 const fit=$('thumbFit').value,zoom=Number($('thumbZoom').value)/100;
 const base=fit==='contain'?Math.min(w/thumbImage.width,h/thumbImage.height):Math.max(w/thumbImage.width,h/thumbImage.height);
 const scale=base*zoom,dw=thumbImage.width*scale,dh=thumbImage.height*scale;
 const dx=(w-dw)/2+Number($('thumbImageX').value),dy=(h-dh)/2+Number($('thumbImageY').value);
 ctx.save();
 ctx.filter='brightness('+Number($('thumbBrightness').value)+'%)';
 ctx.drawImage(thumbImage,dx,dy,dw,dh);
 ctx.restore();
}
function drawThumbText(ctx,w,h){
 const font=$('thumbFont').value||'Tahoma';
 const align=$('thumbAlign').value||'right';
 const x=align==='right'?w-88:align==='left'?88:w/2;
 const maxWidth=w-180;
 const title=$('thumbTitle').value.trim()||'عنوان الفيديو هنا';
 let size=Number($('thumbFontSize').value)||88;
 const color=$('thumbTextColor').value||'#ffffff';
 const outlineColor=$('thumbOutlineColor').value||'#10182c';
 const outline=Number($('thumbOutline').value)||0;
 let lines=[];
 ctx.save();ctx.direction='rtl';ctx.textAlign=align;ctx.lineJoin='round';
 while(size>42){
  ctx.font='900 '+size+'px '+font+', Tahoma, Arial, sans-serif';
  lines=wrapCanvasText(ctx,title,maxWidth,3);
  if(lines.every(line=>ctx.measureText(line).width<=maxWidth))break;
  size-=2;
 }
 ctx.font='900 '+size+'px '+font+', Tahoma, Arial, sans-serif';
 const lineHeight=size*1.16;
 const startY=Number($('thumbTitleY').value)||370;
 const outlineW=outline;
 ctx.shadowColor='rgba(0,0,0,.52)';ctx.shadowBlur=18;ctx.shadowOffsetX=4;ctx.shadowOffsetY=6;
 lines.forEach((line,index)=>{
  const y=startY+index*lineHeight;
  if(outlineW>0){ctx.lineWidth=outlineW*2;ctx.strokeStyle=outlineColor;ctx.strokeText(line,x,y,maxWidth);}
  ctx.fillStyle=color;ctx.fillText(line,x,y,maxWidth);
 });
 ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
 const subtitle=$('thumbSubtitle').value.trim();
 if(subtitle){
  const subY=Math.min(h-112,startY+lines.length*lineHeight+35);
  ctx.font='700 31px '+font+', Tahoma, Arial, sans-serif';ctx.fillStyle=$('thumbAccent').value;
  ctx.fillText(subtitle,x,subY,maxWidth);
 }
 ctx.restore();
}
function drawThumbBadge(ctx,w){
 const text=$('thumbBadge').value.trim();
 if(!text)return;
 ctx.save();ctx.direction='rtl';ctx.font='bold 25px Tahoma, Arial, sans-serif';
 const padX=24,padY=13,textWidth=ctx.measureText(text).width;
 const boxW=textWidth+padX*2,boxH=54,x=w-82-boxW,y=54;
 thumbRoundedRect(ctx,x,y,boxW,boxH,16);
 ctx.fillStyle=$('thumbBadgeColor').value||$('thumbAccent').value;ctx.fill();
 ctx.fillStyle='#10182c';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(text,x+boxW/2,y+boxH/2+1);
 ctx.restore();
}
function drawThumbnail(){
 if(!thumbCtx)return;
 const ctx=thumbCtx,w=thumbCanvas.width,h=thumbCanvas.height;
 const accent=$('thumbAccent').value||'#2563EB';
 ctx.clearRect(0,0,w,h);
 drawThumbBackground(ctx,w,h,accent);
 drawThumbImage(ctx,w,h);
 const overlay=Number($('thumbOverlay').value)/100;
 if(overlay>0){
  const shade=ctx.createLinearGradient(0,0,w,h);
  shade.addColorStop(0,'rgba(4,8,20,'+(overlay*.35)+')');
  shade.addColorStop(.58,'rgba(4,8,20,'+(overlay*.82)+')');
  shade.addColorStop(1,'rgba(4,8,20,'+Math.min(.92,overlay+0.12)+')');
  ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 }
 drawThumbDecor(ctx,w,h,accent);
 if($('thumbBgStyle').value==='paper'){
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(0,0,w,h);
 }
 drawThumbBadge(ctx,w);
 const sticker=$('thumbSticker').value;
 if(sticker){
  ctx.save();ctx.font='100px Tahoma, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=18;ctx.fillText(sticker,150,190);ctx.restore();
 }
 drawThumbText(ctx,w,h);
 const brand=$('thumbBrand').value.trim();
 if(brand){
  ctx.save();ctx.direction='ltr';ctx.textAlign='left';ctx.font='bold 22px Arial, sans-serif';
  ctx.fillStyle='rgba(255,255,255,.82)';ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=7;
  ctx.fillText(brand,68,h-42);ctx.restore();
 }
 const hint=$('thumbCanvasHint');
 if(hint)hint.style.display=thumbImage?'none':'block';
 updateThumbOutputs();
 const status=$('thumbStatus');
 if(status)status.textContent='المعاينة محدثة';
}
function readThumbImage(file,persistSource=true){
 if(!file)return;
 if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){notify('اختر صورة PNG أو JPG أو WEBP صالحة.');return;}
 if(file.size>12*1024*1024){notify('حجم الصورة يجب ألا يتجاوز 12 ميجابايت.');return;}
 const url=URL.createObjectURL(file),image=new Image();
 image.onload=()=>{
  if(thumbObjectUrl)URL.revokeObjectURL(thumbObjectUrl);
  thumbObjectUrl=url;thumbImage=image;
  $('thumbImageX').value='0';$('thumbImageY').value='0';$('thumbZoom').value='100';
  drawThumbnail();pushThumbHistory();saveThumbProject(false);
  if(persistSource){
   saveThumbSource(file).then(()=>notify('تمت إضافة الصورة وحفظ الملف الأصلي في مكتبة الملفات. اسحبها لضبط موضعها.'))
    .catch(()=>notify('تمت إضافة الصورة للمعاينة، لكن تعذر حفظ الملف الأصلي على هذا الجهاز.'));
  }
 };
 image.onerror=()=>{URL.revokeObjectURL(url);notify('تعذر فتح الصورة المحددة.');};
 image.src=url;
}
function saveThumbProject(notifyUser=true){
 try{
  localStorage.setItem(thumbProjectKey,JSON.stringify({version:2,savedAt:new Date().toISOString(),state:thumbState()}));
  if(notifyUser)notify('تم حفظ إعدادات التصميم على هذا الجهاز.');
 }catch(error){notify('تعذر الحفظ المحلي. صدّر إعدادات التصميم كملف JSON.');}
}
function exportThumbProject(){
 const data={app:'انطلاقتك',type:'thumbnail-project',version:2,savedAt:new Date().toISOString(),state:thumbState()};
 downloadFile('entelaqtak-thumbnail-project.json',JSON.stringify(data,null,2),'application/json');
}
function downloadThumbImage(type){
 drawThumbnail();
 const mime=type==='jpg'?'image/jpeg':'image/png';
 const filename=type==='jpg'?'entelaqtak-thumbnail.jpg':'entelaqtak-thumbnail.png';
 thumbCanvas.toBlob(blob=>{
  if(!blob){notify('تعذر إنشاء ملف الصورة.');return;}
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=filename;anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
  const label=$('thumbFileEstimate');if(label)label.textContent=type==='jpg'?'JPG · جودة 94%':'PNG · جودة كاملة';
  notify('تم تجهيز الصورة وتحميلها.');
 },mime,type==='jpg'?.94:undefined);
}
function applyThumbTemplate(name){
 const presets={
  creator:{accent:'#f5b942',bg:'midnight',decor:'glow',overlay:42,align:'right',badge:'#f5b942',sticker:'🚀'},
  tutorial:{accent:'#39d6bd',bg:'ocean',decor:'grid',overlay:30,align:'right',badge:'#39d6bd',sticker:'💡'},
  gaming:{accent:'#ff4f9a',bg:'midnight',decor:'rays',overlay:46,align:'left',badge:'#ff4f9a',sticker:'⚡'},
  podcast:{accent:'#69a9ff',bg:'forest',decor:'glow',overlay:35,align:'center',badge:'#69a9ff',sticker:'🎙️'},
  minimal:{accent:'#d3e6e5',bg:'paper',decor:'none',overlay:10,align:'center',badge:'#d3e6e5',sticker:'',text:'#172a35',outline:'#f5f0e5'},
  news:{accent:'#ff654f',bg:'sunset',decor:'slashes',overlay:48,align:'right',badge:'#ff654f',sticker:'🔥',text:'#ffffff',outline:'#311723'}
 };
 const preset=presets[name];if(!preset)return;
 all('[data-thumb-template]').forEach(button=>button.classList.toggle('selected',button.dataset.thumbTemplate===name));
 $('thumbAccent').value=preset.accent;$('thumbBgStyle').value=preset.bg;$('thumbDecor').value=preset.decor;
 $('thumbOverlay').value=String(preset.overlay);$('thumbAlign').value=preset.align;
 $('thumbBadgeColor').value=preset.badge;$('thumbSticker').value=preset.sticker;
 $('thumbTextColor').value=preset.text||'#ffffff';$('thumbOutlineColor').value=preset.outline||'#10182c';
 if(!$('thumbBadge').value.trim())$('thumbBadge').value=name==='news'?'عاجل':name==='tutorial'?'شرح خطوة بخطوة':name==='podcast'?'حلقة جديدة':name==='gaming'?'تحدي جديد':'معلومة مهمة';
 drawThumbnail();pushThumbHistory();notify('تم تطبيق القالب. عدّل النص والصورة كما تحب.');
}
if(thumbCanvas){
 const controlEls=thumbControlIds.map(id=>$(id)).filter(Boolean);
 controlEls.forEach(el=>{
  el.addEventListener('input',()=>{drawThumbnail();scheduleThumbHistory();});
  el.addEventListener('change',()=>{drawThumbnail();pushThumbHistory();});
 });
 $('thumbImage').addEventListener('change',event=>{
  const file=event.target.files&&event.target.files[0];if(file)readThumbImage(file);
 });
 $('clearThumbnailImage').addEventListener('click',()=>{
  thumbImage=null;if(thumbObjectUrl)URL.revokeObjectURL(thumbObjectUrl);
  thumbObjectUrl=null;$('thumbImage').value='';deleteThumbSource();drawThumbnail();pushThumbHistory();saveThumbProject(false);
 });
 $('thumbImageReset').addEventListener('click',()=>{
  $('thumbZoom').value='100';$('thumbImageX').value='0';$('thumbImageY').value='0';$('thumbFit').value='cover';
  drawThumbnail();pushThumbHistory();
 });
 $('drawThumbnail').addEventListener('click',drawThumbnail);
 $('downloadThumbnail').addEventListener('click',()=>downloadThumbImage('png'));
 $('downloadThumbnailJpg').addEventListener('click',()=>downloadThumbImage('jpg'));
 $('thumbSaveProject').addEventListener('click',saveThumbProject);
 $('thumbExportProject').addEventListener('click',exportThumbProject);
 all('[data-thumb-template]').forEach(button=>button.addEventListener('click',()=>applyThumbTemplate(button.dataset.thumbTemplate)));
 $('thumbUndo').addEventListener('click',()=>{
  if(thumbHistoryIndex<=0)return;
  thumbHistoryIndex--;applyThumbState(thumbHistory[thumbHistoryIndex]);updateThumbHistoryButtons();
 });
 $('thumbRedo').addEventListener('click',()=>{
  if(thumbHistoryIndex>=thumbHistory.length-1)return;
  thumbHistoryIndex++;applyThumbState(thumbHistory[thumbHistoryIndex]);updateThumbHistoryButtons();
 });
 $('thumbFromTitles').addEventListener('click',()=>{
  const result=$('titlesResult'),text=result?result.textContent.trim():'';
  if(!text||text.includes('ستظهر')||text.includes('اكتب')){notify('ولّد العناوين أولًا من أداة العناوين.');return;}
  $('thumbTitle').value=text.split(/\n/).map(line=>line.replace(/^\s*(?:\d+[\).:-]?|[-•])\s*/,'').trim()).find(Boolean)||text.slice(0,100);
  app.go('thumbnail');drawThumbnail();pushThumbHistory();
 });
 const savedProject=(()=>{try{return JSON.parse(localStorage.getItem(thumbProjectKey)||'null');}catch(error){return null;}})();
 if(savedProject&&savedProject.version===2&&savedProject.state)applyThumbState(savedProject.state);
 drawThumbnail();pushThumbHistory();
 getThumbSource().then(record=>{
  if(!record?.blob)return;
  const file=typeof File==='function'?new File([record.blob],record.name||'thumbnail-source',{type:record.type||record.blob.type||'image/jpeg'}):record.blob;
  readThumbImage(file,false);
 }).catch(()=>{});
 const wrap=$('thumbCanvasWrap');
 if(wrap){
  wrap.addEventListener('pointerdown',event=>{
   if(!thumbImage)return;
   const rect=thumbCanvas.getBoundingClientRect(),scaleX=thumbCanvas.width/rect.width,scaleY=thumbCanvas.height/rect.height;
   thumbDrag={x:event.clientX,y:event.clientY,imageX:Number($('thumbImageX').value),imageY:Number($('thumbImageY').value),scaleX:scaleX,scaleY:scaleY};
   wrap.classList.add('dragging');wrap.setPointerCapture&&wrap.setPointerCapture(event.pointerId);
  });
  wrap.addEventListener('pointermove',event=>{
   if(!thumbDrag)return;
   $('thumbImageX').value=String(Math.max(-640,Math.min(640,Math.round(thumbDrag.imageX+(event.clientX-thumbDrag.x)*thumbDrag.scaleX))));
   $('thumbImageY').value=String(Math.max(-360,Math.min(360,Math.round(thumbDrag.imageY+(event.clientY-thumbDrag.y)*thumbDrag.scaleY))));
   drawThumbnail();
  });
  const stopDrag=()=>{if(!thumbDrag)return;thumbDrag=null;wrap.classList.remove('dragging');pushThumbHistory();};
  wrap.addEventListener('pointerup',stopDrag);wrap.addEventListener('pointercancel',stopDrag);
  wrap.addEventListener('dragover',event=>{event.preventDefault();wrap.classList.add('file-over');});
  wrap.addEventListener('dragleave',()=>wrap.classList.remove('file-over'));
  wrap.addEventListener('drop',event=>{
   event.preventDefault();wrap.classList.remove('file-over');
   const file=event.dataTransfer&&event.dataTransfer.files&&event.dataTransfer.files[0];
   if(file)readThumbImage(file);
  });
 }
 drawThumbnail();
}

// Analytics report: charts and CSV from the performance records the user entered.
const analyticsView=$('view-analytics');
if(analyticsView&&!$('enhancedAnalytics')){
 const card=document.createElement('div');
 card.className='enhance-card analytics-enhanced';
 card.id='enhancedAnalytics';
 card.innerHTML='<div class="sectionrow" style="margin-top:0"><div><h3>اتجاه المشاهدات المسجلة</h3><p class="enhance-muted">ملخص محلي من الأرقام التي أدخلتها يدويًا، وليس اتصالًا مباشرًا بمنصات التواصل.</p></div><button type="button" id="exportMetricsCsv" class="mini">تصدير CSV</button></div><canvas id="metricsChart" width="1000" height="300" role="img" aria-label="رسم بياني لتغير المشاهدات المسجلة"></canvas><div id="analyticsTopPosts" class="analytics-top-posts"></div>';
 const stats=analyticsView.querySelector('.stats');
 if(stats)stats.insertAdjacentElement('afterend',card);else analyticsView.appendChild(card);
 $('exportMetricsCsv').addEventListener('click',()=>{
  const metrics=(app.getState().metrics||[]);
  if(!metrics.length){notify('لا توجد سجلات لتصديرها.');return;}
  const columns=['title','date','views','likes','comments','shares'];
  const csv='\uFEFF'+[columns.join(','),...metrics.map(item=>columns.map(key=>'"'+String(item[key]??'').replace(/"/g,'""')+'"').join(','))].join('\r\n');
  downloadFile('entelaqtak-analytics.csv',csv,'text/csv;charset=utf-8');
 });
}
function renderAnalytics(){
 const canvas=$('metricsChart');
 if(!canvas)return;
 const metrics=(app.getState().metrics||[]).filter(item=>item&&item.date);
 const byDate=new Map();
 metrics.forEach(item=>{
  const key=item.date;
  byDate.set(key,(byDate.get(key)||0)+Math.max(0,Number(item.views)||0));
 });
 const values=Array.from(byDate.entries()).sort((a,b)=>a[0].localeCompare(b[0])).slice(-14);
 const rect=canvas.getBoundingClientRect();
 const dpr=Math.min(window.devicePixelRatio||1,2);
 const width=Math.max(320,Math.round((rect.width||900)*dpr));
 const height=Math.round(250*dpr);
 canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,width,height);
 const pad={left:54*dpr,right:20*dpr,top:18*dpr,bottom:38*dpr};
 const plotW=width-pad.left-pad.right,plotH=height-pad.top-pad.bottom;
 const max=Math.max(1,...values.map(item=>item[1]));
 ctx.font=(10*dpr)+'px Tahoma, Arial';
 ctx.textAlign='right';ctx.direction='rtl';
 for(let i=0;i<=4;i++){
  const y=pad.top+plotH*i/4;
  ctx.strokeStyle='rgba(160,175,205,.18)';ctx.lineWidth=1*dpr;
  ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(width-pad.right,y);ctx.stroke();
  ctx.fillStyle='#9eacc3';ctx.fillText(Math.round(max*(1-i/4)).toLocaleString('en-US'),pad.left-7*dpr,y+3*dpr);
 }
 if(!values.length){
  ctx.textAlign='center';ctx.fillStyle='#9eacc3';
  ctx.fillText('أضف نتائج منشور لعرض الرسم البياني',width/2,height/2);
 }else{
  const gap=values.length>1?plotW/(values.length-1):0;
  const points=values.map((item,index)=>({x:pad.left+(values.length>1?gap*index:plotW/2),y:pad.top+plotH-(item[1]/max)*plotH,label:item[0].slice(5)}));
  ctx.strokeStyle='#38BDF8';ctx.lineWidth=3*dpr;ctx.beginPath();
  points.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.stroke();
  points.forEach(point=>{
   ctx.fillStyle='#2563EB';ctx.beginPath();ctx.arc(point.x,point.y,4*dpr,0,Math.PI*2);ctx.fill();
  });
  const labelStep=Math.max(1,Math.ceil(points.length/7));
  ctx.fillStyle='#9eacc3';ctx.textAlign='center';ctx.direction='ltr';ctx.font=(9*dpr)+'px Arial';
  points.forEach((point,index)=>{if(index%labelStep===0||index===points.length-1)ctx.fillText(point.label,point.x,height-12*dpr);});
 }
 const top=metrics.slice().sort((a,b)=>(Number(b.views)||0)-(Number(a.views)||0)).slice(0,5);
 const host=$('analyticsTopPosts');
 if(host)host.innerHTML=top.length?'<h4 style="font-size:11px;margin:7px 0">أعلى المنشورات مشاهدة في سجلاتك</h4>'+top.map(item=>'<div class="analytics-top-post"><span>'+escapeHTML(item.title||'منشور بدون عنوان')+'</span><span>'+Math.max(0,Number(item.views)||0).toLocaleString('en-US')+' مشاهدة</span></div>').join(''):'<p class="enhance-muted">لا توجد سجلات أداء حتى الآن.</p>';
}
if(typeof app.go==='function'){
 const originalGo=app.go;
 app.go=function(id){
  const result=originalGo.apply(this,arguments);
  if(id==='analytics')renderAnalytics();
  if(id==='thumbnail')drawThumbnail();
  if(id==='settings'){renderSnapshots();renderDiagnostics();}
  return result;
 };
}
if($('addMetric'))$('addMetric').addEventListener('click',()=>setTimeout(renderAnalytics,0));
window.addEventListener('resize',()=>{if(analyticsView&&analyticsView.classList.contains('active'))renderAnalytics();});
if(analyticsView)renderAnalytics();

// Search-result preview for the SEO description already generated by the app.
const seoView=$('view-seo');
if(seoView&&!$('enhancedSeoPreview')){
 const panel=document.createElement('div');
 panel.className='enhance-card';
 panel.id='enhancedSeoPreview';
 panel.innerHTML='<h3>معاينة نتيجة البحث</h3><p class="enhance-muted">راجع شكل العنوان والوصف قبل نسخ البيانات إلى المنصة. هذه معاينة شكلية وليست ترتيبًا أو نتيجة بحث فعلية.</p><div class="seo-search-preview"><small>https://sasa-antilaqatuk.github.io/entelaqtak/</small><strong id="seoPreviewTitle">عنوان المحتوى سيظهر هنا</strong><p id="seoPreviewDescription">اكتب الموضوع والوصف لمعاينة النتيجة.</p></div><p id="seoPreviewCount" class="enhance-muted" style="margin-top:9px">0 / 160 حرفًا في الوصف</p>';
 seoView.appendChild(panel);
 const updatePreview=()=>{
  const title=$('seoTopic')?$('seoTopic').value.trim():'';
  const description=$('seoDescription')?$('seoDescription').value.trim():'';
  $('seoPreviewTitle').textContent=title||'عنوان المحتوى سيظهر هنا';
  $('seoPreviewDescription').textContent=description||'اكتب الموضوع والوصف لمعاينة النتيجة.';
  $('seoPreviewCount').textContent=description.length+' / 160 حرفًا في الوصف';
 };
 ['seoTopic','seoDescription'].forEach(id=>{if($(id))$(id).addEventListener('input',updatePreview);});
 updatePreview();
}
renderSnapshots();
})();
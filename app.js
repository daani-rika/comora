function productEmoji(p){return p.e||'📦'}

// ===== демо-дані (у реальному застосунку — з бази) =====
const day=86400000, today=()=>new Date(new Date().toDateString());
const off=n=>{const d=today();d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
let P=[
 {id:1,n:'Гречка',e:'🌾',u:'кг',seg:1,normP:2,use:.7,life:540,codes:{1:'4820000100011',.8:'4820000100028',.9:'4820000100035'}},
 {id:2,n:'Рис',e:'🍚',u:'кг',seg:1,normP:3,use:.8,life:540,codes:{1:'4820000200018'}},
 {id:3,n:'Чечевиця',e:'🫘',u:'кг',seg:.25,normP:3,use:.5,life:365,codes:{.4:'4820000300015'}},
 {id:4,n:'Вівсянка',e:'🥣',u:'кг',seg:1,normP:3,use:1,life:365,codes:{.5:'4820000400012'}},
 {id:5,n:'Макарони',e:'🍝',u:'кг',seg:1,normP:4,use:1,life:730,codes:{.5:'4820000500019'}},
 {id:6,n:'Олія',e:'🫒',u:'л',seg:1,normP:2,use:.7,life:365,codes:{1:'4820000600016'}}];
let B=[
 {p:1,s:.8,x:off(12),q:1,loc:'Ящик 1'},{p:1,s:.7,x:off(95),q:1,loc:'Ящик 1'},{p:1,s:.9,x:off(210),q:1,loc:'Буфет'},{p:1,s:1,x:off(240),q:4,loc:'Буфет'},
 {p:2,s:1,x:off(80),q:3,loc:'Ящик 1'},{p:3,s:.4,x:off(45),q:1,loc:'Полиця 2'},{p:4,s:.5,x:off(-5),q:2,loc:'Полиця 2'},
 {p:5,s:.5,x:off(300),q:4,loc:'Буфет'},{p:6,s:1,x:off(24),q:1,loc:'Буфет'},
 {p:7,s:.185,x:off(500),q:3,loc:'Полиця 2'},{p:8,s:3,x:off(700),q:1,loc:'Антресоль'}];
let LOCS=['Ящик 1','Полиця 2','Буфет','Антресоль'];
let CATS=['Крупи','Олії','Консерви','Миючі'];
P.push({id:7,n:'Тунець',e:'🥫',u:'кг',seg:.185,normP:3,use:.37,life:1095,codes:{.185:'4820000700013'}},{id:8,n:'Порошок',e:'🧴',u:'кг',seg:3,normP:2,use:2,life:1095,codes:{3:'4820000800010'}});
const CAT0={1:'Крупи',2:'Крупи',3:'Крупи',4:'Крупи',5:'Крупи',6:'Олії',7:'Консерви',8:'Миючі'};
P.forEach(p=>{if(!p.cat)p.cat=CAT0[p.id]||''});
const DEMO={1:{g:700,people:1,months:3},2:{g:800,people:2,months:2},3:{g:500,people:1,months:3,pack:400},4:{g:1000,people:1,months:2},5:{g:1000,people:1,months:2,pack:500},6:{g:700,people:1,months:3},7:{g:370,people:1,months:2},8:{g:2000,people:1,months:2}};
function recalc(p){p.use=p.g/1000;const days=Math.min(p.months*30,p.life);p.capped=p.months*30>p.life;p.target=p.use*p.people*days/30;p.seg=p.pack/1000;p.calc=Math.max(1,Math.ceil(p.target/p.seg-1e-9));p.normP=p.ov||p.calc}
function mk(p){const d=DEMO[p.id]||{};p.g=p.g||d.g||Math.round((p.use||.5)*1000);p.people=p.people||d.people||1;p.months=p.months||d.months||3;p.pack=p.pack||d.pack||Math.round((p.seg||1)*1000);recalc(p)}
P.forEach(mk);
let filterCat=null,filterSt=new Set(),open=new Set(),snap=null;
const $=s=>document.querySelector(s);
const nf=n=>String(+n.toFixed(2)).replace('.',',');
const size=(s,u)=>u==='шт.'?nf(s)+' шт.':u==='кг'?(s<1?Math.round(s*1000)+' г':nf(s)+' кг'):(s<1?Math.round(s*1000)+' мл':nf(s)+' л');
const amt=(v,u)=>nf(v)+' '+u;
const daysTo=x=>Math.round((new Date(x)-today())/day);
const lvl=d=>d<=30?'red':d<=60?'amb':'ok';
const dtxt=d=>d<0?`прострочено ${-d} дн.`:d===0?'сьогодні остання доба':`ще ${d} дн.`;
const ukd=x=>new Date(x).toLocaleDateString('uk-UA',{day:'numeric',month:'short',year:'numeric'});
const pk=n=>n%10===1&&n%100!==11?'пачка':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'пачки':'пачок';

function info(p){
  const bs=B.filter(b=>b.p===p.id&&b.q>0).sort((a,b)=>(daysTo(a.x)<0?0:1)-(daysTo(b.x)<0?0:1)||(a.k||'').localeCompare(b.k||'')||a.x.localeCompare(b.x));
  const total=bs.reduce((a,b)=>a+b.s*b.q,0), packs=bs.reduce((a,b)=>a+b.q,0);
  const n=packs;
  return {bs,total,packs,n,low:n<p.normP/2,excess:n>p.normP,locs:[...new Set(bs.map(b=>b.loc).filter(Boolean))]};
}
function render(){
  persistState();
  const q=$('#q').value.trim().toLowerCase();
  let items=P.map(p=>({p,i:info(p)}));
  const cnt={low:items.filter(x=>x.i.low).length,excess:items.filter(x=>x.i.excess).length};
  const cats=CATS.filter(c=>P.some(p=>p.cat===c));
  $('#chips').innerHTML=`<button data-f="all" aria-pressed="${!filterCat&&!filterSt.size}">Усі</button>`+(cats.length>1?cats.map(c=>`<button data-fc="${esc(c)}" aria-pressed="${filterCat===c}">${esc(c)}</button>`).join('')+'<span class="sep"></span>':'')+[['low','Закінчується'],['excess','Зайве']].map(([k,t])=>`<button data-fs2="${k}" aria-pressed="${filterSt.has(k)}">${t}<b>${cnt[k]}</b></button>`).join('');
  items=items.filter(x=>(!q||x.p.n.toLowerCase().includes(q))&&(!filterCat||x.p.cat===filterCat)&&[...filterSt].every(k=>k==='low'?x.i.low:x.i.excess));
  items.sort((a,b)=>a.p.n.localeCompare(b.p.n));
  $('#list').innerHTML=items.map(({p,i})=>{
    const n=i.n,slots=Math.max(p.normP,n);
    const pills=Array.from({length:slots},(_,k)=>`<span class="pl ${k>=n?'e':k>=p.normP?'x':''}"></span>`).join('');
    const months=i.total/(p.use*p.people);
    const sub=i.total&&p.use===0?"Витрату не задано":i.total?`~${String(+months.toFixed(1)).replace('.',',')} міс. / ${p.people} ос.`:'немає в коморі';
    return `<article class="card"><div class="cl"><div class="ch"><span class="ico">${productEmoji(p)}</span><div class="chm"><div class="chr"><div class="nm">${typeof CLOUD!=='undefined'&&CLOUD?`<button class="name-edit" data-edit-product="${p.id}" aria-label="Редагувати продукт ${esc(p.n)}">${esc(p.n)}<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 16 12-12 4 4L8 20H4Zm9-9 4 4"/></svg></button>`:esc(p.n)}</div><div class="sup">${sub}</div></div>${i.locs.length?`<div class="loc">${i.locs.map(esc).join(' · ')}</div>`:''}</div></div><div class="pills">${pills}</div></div>
    <div class="qb"><button class="qa" data-op="add|${p.id}" aria-label="Додати"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button><button class="qt" data-op="take|${p.id}" aria-label="Взяти"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg></button></div></article>`}).join('')||'<div class="empty">Нічого не знайдено</div>';
}

// ===== дії =====
function toast(msg,undo){
  const t=$('#toast');t.hidden=false;t.innerHTML=`<span>${msg}</span>${undo?'<button id="undo">Скасувати</button>':''}`;
  if(undo)$('#undo').onclick=()=>{B=JSON.parse(undo);t.hidden=true;render()};
  clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,6000);
}
function take(pid,s,n,x){ // x задано — конкретна партія, інакше найстаріші (FEFO)
  const before=JSON.stringify(B);
  let left=n;
  B.filter(b=>b.p===pid&&b.s===s&&b.q>0&&(!x||b.x===x)).sort((a,b)=>a.x.localeCompare(b.x))
   .forEach(b=>{const t=Math.min(b.q,left);b.q-=t;left-=t});
  B=B.filter(b=>b.q>0);
  const p=P.find(p=>p.id===pid);
  toast(`Взято ${n} × ${size(s,p.u)} · ${esc(p.n)}`,before);render();
}
function add(pid,s,n,x,k){
  const before=JSON.stringify(B),p=P.find(p=>p.id===pid);
  const g=B.find(b=>b.p===pid&&b.s===s&&b.x===x);
  g?g.q+=n:B.push({p:pid,s,x,q:n,k});
  toast(`Додано ${n} × ${size(s,p.u)} · ${esc(p.n)}`,before);render();
}
const close=()=>{if(typeof clearMobileDraft==='function')clearMobileDraft();if(typeof cancelCatalog==='function')cancelCatalog();$('#ov').hidden=true;S.back=false;stopCam()};
const show=h=>{$('#sheet').innerHTML=h;$('#sheet').className='sheet';$('#ov').hidden=false};

// ===== аркуш продукту: взяти / додати =====
let S={};
const plus=(k,n)=>new Date(new Date(k).getTime()+n*day).toISOString().slice(0,10);
function opSheet(pid,mode,code){
  if(typeof cancelCatalog==='function')cancelCatalog();
  const p=P.find(p=>p.id===pid), i=info(p);
  let s=1;if(mode==='take'&&i.bs.length&&!i.bs.some(b=>b.s===1))s=i.bs[0].s;
  if(code){const f=Object.entries(p.codes).find(([,c])=>c===code);if(f)s=+f[0];else if(p.barcodeSizes?.[code])s=p.barcodeSizes[code]}
  S={pid,mode,n:1,s,k:off(0),x:plus(off(0),p.life),xm:false};
  if(mode==='add'){S.stage=code?'card':'start';if(code)S.f={s,n:1,x:'',code,name:pname(p,s)}}
  drawOp();
  if(typeof CLOUD!=='undefined'&&CLOUD&&mode==='take')cloudLoadPhotos();
}
const IC={
 scan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8V5h3M17 4h3v3M20 16v3h-3M7 20H4v-3M7 9v6M11 9v6M15 9v6"/></svg>',
 cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 kb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16"/></svg>',
 up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 15l7-7 7 7"/></svg>',
 dn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 9l7 7 7-7"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'};
function drawOp(){
  const p=P.find(p=>p.id===S.pid),i=info(p),add=S.mode==='add';
  return add?drawAdd(p,i):drawTake(p,i);
  p.ph=p.ph||{};
  const stock=[...new Set(i.bs.map(b=>b.s))];
  const sizes=(add?[...new Set([1,...Object.keys(p.codes).map(Number),...stock,S.s])]:stock).sort((a,b)=>b-a);
  const avail=i.bs.filter(b=>b.s===S.s).reduce((a,b)=>a+b.q,0);
  const after=i.packs+(add?S.n:-Math.min(S.n,avail));
  const thumb=s=>p.ph[s]?`<img src="${p.ph[s]}" style="width:100%;height:100%;object-fit:cover;border-radius:5px">`:size(s,p.u);
  const rows=i.bs.map(b=>{const d=daysTo(b.x);return `<div class="b"><div class="pk">${thumb(b.s)}</div><div class="t"><b>${b.q>1?b.q+' × ':''}${size(b.s,p.u)}</b><span class="d ${d<=30?'red':'sub'}">${ukd(b.x)} · ${dtxt(d)}</span><div class="sub">${p.codes[b.s]?'Код '+p.codes[b.s]:'Без штрих-коду'}</div></div>${add?'':`<button data-eat="${p.id}|${b.s}|${b.x}">Взяти</button>`}</div>`}).join('')||'<p class="sub">Порожньо</p>';
  show(`<div class="top3"><div><h2>${esc(p.n)}</h2><div class="cnt">${i.packs} → <b>${after}</b> ${pk(after)}</div></div>
  <div class="ib">${add?`<button data-scan aria-label="Сканувати штрих-код">${IC.scan}</button><label class="ibtn" aria-label="Фото упаковки">${p.ph[S.s]?`<img src="${p.ph[S.s]}" style="width:26px;height:26px;object-fit:cover;border-radius:4px">`:IC.cam}<input type="file" id="ph" accept="image/*" capture="environment" hidden></label>`:''}<button data-dt aria-pressed="${!!S.dt}" aria-label="Пачки в коморі">${IC.list}</button><button data-close aria-label="Закрити">✕</button></div></div>
  <div class="seg"><button data-mode="take" aria-pressed="${!add}">Взяти</button><button data-mode="add" aria-pressed="${add}">Додати</button></div>
  ${!add&&!stock.length?'<p class="sub">У коморі нічого немає.</p>':`<div class="line"><div class="sz">${sizes.map(s=>`<button data-sz="${s}" aria-pressed="${s===S.s}">${size(s,p.u)}</button>`).join('')}${add?'<button data-sz="new">інший</button>':''}</div>
  <div class="step"><button data-n="-1" aria-label="Менше" ${S.n<=1?'disabled':''}>${IC.dn}</button><output>${S.n}</output><button data-n="1" aria-label="Більше" ${!add&&S.n>=avail?'disabled':''}>${IC.up}</button></div></div>`}
  ${add?`<label class="fld" style="display:block;margin-top:10px">Придатне до<input type="date" id="x" value="${S.x}"></label>`:''}
  ${S.dt?`<div class="panel">${add?`<div class="two"><label class="fld">Куплено<input type="date" id="k" value="${S.k}" max="${off(0)}"></label><label class="fld">Штрих-код<input id="cd" inputmode="numeric" placeholder="вручну" value="${S.cd??p.codes[S.s]??''}"></label></div><button data-code style="width:100%;min-height:40px;margin-bottom:6px">Зберегти штрих-код</button>`:''}${rows}</div>`:''}
  <button class="pri" style="width:100%;min-height:50px;margin-top:10px" data-go ${!add&&!avail?'disabled':''}>Підтвердити</button>`);
  $('#sheet').className='sheet '+(add?'add':'take');
}

// ===== сторінка «Взяти»: картка на кожну пачку =====
const PEOPLE=1;
const GR={1:['#a0713f','#4e3320'],2:['#8596a0','#3c4a52'],3:['#c4652f','#6b2f14'],4:['#ad9473','#5a4a35'],5:['#cc9c30','#6e5214'],6:['#85922f','#3d4516'],7:['#4f7a8f','#22404f'],8:['#6f8fc9','#2d4a80']};
const NM={'1|1':'Крупа гречана Ситий двір ядриця'};
const pname=(p,s)=>NM[p.id+'|'+s]||p.n;
const my=x=>new Date(x).toLocaleDateString('uk-UA',{month:'short',year:'numeric'}).replace(/\s?р\.$/,'');
const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],
G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],
R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'],
PAR=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
function ean(c){if(!/^\d{13}$/.test(c))return null;const d=[...c].map(Number);let b='101';
  for(let k=0;k<6;k++)b+=(PAR[d[0]][k]==='L'?L:G)[d[k+1]];b+='01010';for(let k=7;k<13;k++)b+=R[d[k]];return b+'101'}
const BAR='<svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2"><path d="M4 5v14M8 5v14M11 5v14M15 5v14M18 5v14M21 5v14"/></svg>';
function drawTake(p,i){
  p.ph=p.ph||{};
  if(!S.tp)S.tp=i.bs.flatMap(b=>Array.from({length:Math.ceil(b.q)},()=>({id:b.id,photo_file_id:b.photo_file_id,s:b.s,x:b.x,loc:b.loc||'',k:b.k,photo:b.photo,code:b.code||'',name:b.name,done:0})));
  const cards=S.tp.map((t,k)=>{
    const ph=t.photo,g=GR[p.id]||['#6b7f77','#33403b'],old=daysTo(t.x)<=30;
    return `<div class="pc ${t.done?'done':''}" data-tk="${k}" style="${ph?`background-image:url('${ph}')`:`background:linear-gradient(160deg,${g[0]},${g[1]})`}">
    <button class="bc" data-bc="${k}" aria-label="Штрих-код">${BAR}</button>${t.loc?`<span class="lc">${esc(t.loc)}</span>`:''}
    <div class="pt"><b class="pn">${esc(t.name||pname(p,t.s))}</b><div class="pm"><b>${size(t.s,p.u)}</b><span class="${old?'old':''}">${my(t.x)}</span></div></div>
    ${t.done?'<div class="dn">Взято</div>':''}</div>`}).join('');
  show(`<div class="top3"><h2 class="th"><span style="color:var(--red)">Взяти</span> • ${esc(p.n)} • <b>${i.packs}</b> <span class="sub">${pk(i.packs)}</span></h2>
  <div class="ib"><button data-close aria-label="Закрити">✕</button></div></div>
  ${S.tp.length?`<div class="pgrid">${cards}</div>`:'<p class="sub">У коморі нічого немає.</p>'}`);
  $('#sheet').className='sheet take';
}
function bcSheet(k){
  const p=P.find(p=>p.id===S.pid),t=S.tp[k],c=t.code||'',e=c&&ean(c);
  show(`<div class="top3"><h2>Штрих-код</h2><div class="ib"><button data-back aria-label="Назад">✕</button></div></div>
  <p class="sub">${esc(t.name||pname(p,t.s))} · ${size(t.s,p.u)}</p>
  ${e?`<div style="background:#fff;padding:12px;border-radius:6px"><svg viewBox="0 0 95 50" preserveAspectRatio="none" style="width:100%;height:90px;display:block"><path fill="#000" d="${[...e].map((v,n)=>v==='1'?`M${n} 0h1v50h-1z`:'').join('')}"/></svg><div class="bcn">${c}</div></div>`:`${c?`<div class="bcn">${esc(c)}</div>`:'<p class="sub">Штрих-коду ще немає.</p>'}`}
  <button class="pri" style="width:100%;min-height:50px;margin-top:12px" data-bcscan="${k}">Сканувати</button>`);
}

// ===== сторінка «Додати»: лінійна картка на фасовку =====
IC.bar='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5v14M8 5v14M11 5v14M15 5v14M18 5v14M21 5v14"/></svg>';
const MN=['січень','лютий','березень','квітень','травень','червень','липень','серпень','вересень','жовтень','листопад','грудень'];
IC.cal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 11h16M9 4v4M15 4v4"/></svg>';
const esc=t=>String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function drawAdd(p,i){
  p.ph=p.ph||{};
  const f=S.f,card=S.stage==='card'&&f,tot=i.packs+(card?f.n:0),ph=card?f.photo:null;
  const cam=`<label class="ibtn" aria-label="Сфотографувати пачку">${ph?`<img src="${ph}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:5px">`:IC.cam}<input type="file" id="ph0" accept="image/*" capture="environment" hidden></label>`;
  const head=`<div class="top3"><h2 class="th"><span style="color:var(--green)">Додати</span> • ${esc(p.n)} • <b>${card?`${i.packs} → ${tot}`:i.packs}</b>${card?'':` <span class="sub">${pk(tot)}</span>`}</h2><div class="ib">${card?cam:''}<button data-close aria-label="Закрити">✕</button></div></div>`;
  if(!card){
    show(head+`<div class="start"><button class="pri" data-scan>${IC.bar}Сканувати</button><button class="wide" data-manual>+ Додати вручну</button></div>`);
    $('#sheet').className='sheet add';return;
  }
  if(f.loc===undefined)f.loc=p.lastLoc||'';
  if(!f.x){f.estimated=true;const b=new Date(plus(off(0),p.life));f.x=new Date(Date.UTC(b.getUTCFullYear(),b.getUTCMonth()+1,0)).toISOString().slice(0,10)}
  const sizes=[...new Set([1,...Object.keys(p.codes).map(Number),...i.bs.map(b=>b.s),f.s])].sort((a,b)=>b-a);
  const d=new Date(f.x),yy=d.getUTCFullYear(),yrs=Array.from({length:today().getFullYear()+21-1900},(_,k)=>1900+k);if(!yrs.includes(yy))yrs.push(yy);
  const locs=[...new Set([...LOCS,...B.map(b=>b.loc).filter(Boolean)])];
  const chips=S.sz?`<div class="sz" style="margin:0">${sizes.map(s=>`<button data-fs="${s}" aria-pressed="${s===f.s}">${size(s,p.u)}</button>`).join('')}${S.addSz?'':'<button data-nsz>інша</button>'}</div>${S.addSz?`<div class="tools"><input id="nsz" inputmode="decimal" placeholder="Розмір, ${p.u}"><button data-nszok>OK</button></div>`:''}`:'';
  show(head+`<div class="ac3 col">
  <textarea class="nmt" rows="1" data-fn placeholder="Назва">${esc(f.name)}</textarea>
  <div class="rowbs">${S.addSz?`<div class="tools" style="margin:0;flex:1"><input id="nsz" inputmode="decimal" placeholder="Розмір, ${p.u}" autocomplete="off"><button data-nszok>OK</button></div>`:`<span class="wsw"><span class="wvalue" aria-hidden="true">${size(f.s,p.u)}</span><select id="wsel" class="wsel" aria-label="Розмір пачки">${sizes.map(s=>`<option value="${s}" ${s===f.s?'selected':''}>${size(s,p.u)}</option>`).join('')}<option value="__new">Інший…</option></select><small>▾</small></span>`}
  <div class="seg2 stp"><button data-ra="x|-1" aria-label="Менше" ${f.n<2?'disabled':''}>${IC.dn}</button><output>${f.n}</output><button data-ra="x|1" aria-label="Більше">${IC.up}</button></div></div>
  <div class="frow"><span class="fl">Придатне до</span><select id="mm" class="msel" aria-label="Місяць">${MN.map((m,k)=>`<option value="${k}" ${k===d.getUTCMonth()?'selected':''}>${m}</option>`).join('')}</select><select id="yy" class="msel ysel" aria-label="Рік">${yrs.map(y=>`<option ${y===yy?'selected':''}>${y}</option>`).join('')}</select></div>
  <div class="frow"><span class="fl">Де лежить</span><select id="lsel" class="msel" aria-label="Де лежить"><option value="" ${!S.addLoc&&!f.loc?'selected':''}>Не вказано</option>${locs.map(l=>`<option value="${esc(l)}" ${!S.addLoc&&f.loc===l?'selected':''}>${esc(l)}</option>`).join('')}<option value="__new" ${S.addLoc?'selected':''}>＋ Нове місце…</option></select></div>
  ${S.addLoc?`<div class="tools locedit"><input id="nloc" maxlength="100" placeholder="Нове місце" autocomplete="off" value="${esc(S.locDraft||'')}"><button data-nlocok>OK</button></div>`:''}
  </div>${ph?`<img class="bigph" src="${ph}" alt="">`:''}
  <button class="pri" style="width:100%;min-height:50px;margin-top:12px" data-go>Підтвердити</button>`);
  $('#sheet').className='sheet add';
  const nt=$('.nmt');if(nt){nt.style.height='auto';nt.style.height=nt.scrollHeight+'px'}
  const ni=$('#nsz')||$('#nloc');if(ni)ni.focus();
}
function goAdd(){
  const p=P.find(p=>p.id===S.pid),f=S.f,before=JSON.stringify(B),x=f.x||plus(off(0),p.life);
  if(f.code){p.codes[f.s]=f.code;p.barcodeSizes={...p.barcodeSizes,[f.code]:f.s}}else if(!(f.s in p.codes))p.codes[f.s]='';
  const loc=f.loc||'';if(loc&&!LOCS.includes(loc))LOCS.push(loc);p.lastLoc=loc;
  const g=B.find(b=>b.p===S.pid&&b.s===f.s&&b.x===x&&(b.loc||'')===loc);g?g.q+=f.n:B.push({p:S.pid,s:f.s,x,q:f.n,k:off(0),loc});
  toast(`Додано ${f.n} ${pk(f.n)} · ${esc(p.n)}`,before);render();
}

// ===== сканер =====
let scanSession=0, scanner=null, cameraWork=Promise.resolve(), torchOn=false;
function stopCam(){
  scanSession++;
  const old=scanner;scanner=null;
  cameraWork=cameraWork.catch(()=>{}).then(async()=>{
    if(old){try{if(old.isScanning)await old.stop();old.clear()}catch(_){}}
  });
  return cameraWork;
}
function scanSheet(mode){
  stopCam();
  if(!S.back)S={mode:mode||'add'};
  show(`<div class="row"><h2>Сканувати штрих-код</h2><button data-close style="border:0" aria-label="Закрити">✕</button></div>
  <div class="cam" id="cam"></div><p id="scanStatus" class="scan-status" role="status">Запит доступу до камери…</p>
  <div class="scan-tools"><button id="torch" hidden aria-pressed="false">Ліхтарик</button><button id="retryScan" hidden>Увімкнути камеру</button><label>Фото штрих-коду<input id="barcodePhoto" type="file" accept="image/*" capture="environment" hidden></label>${S.back?'<button id="scanBack">Назад</button>':''}</div>
  <input id="code" inputmode="numeric" autocomplete="off" placeholder="або введіть код вручну" aria-label="Штрих-код">
  <button class="pri" style="width:100%;margin-top:8px" data-lookup>Знайти</button>${typeof recentBarcodeHtml==='function'?recentBarcodeHtml():''}`);
  if(typeof saveMobileDraft==='function')saveMobileDraft({scanner:true});
  $('#retryScan').onclick=startScanner;
  if($('#scanBack'))$('#scanBack').onclick=async()=>{await stopCam();S.back=false;drawOp()};
  $('#torch').onclick=async()=>{
    const button=$('#torch'),current=scanner;
    try{await current.applyVideoConstraints({advanced:[{torch:!torchOn}]});torchOn=!torchOn;button.setAttribute('aria-pressed',String(torchOn))}
    catch(_){toast('Ліхтарик недоступний на цій камері')}
  };
  $('#barcodePhoto').onchange=e=>scanPhoto(e.target.files?.[0]);
  startScanner();
}
function cameraMessage(error){
  const text=String(error?.name||error||'');
  if(/NotAllowed|Permission|denied/i.test(text))return 'Дозвольте доступ до камери в налаштуваннях браузера або введіть код вручну.';
  if(/NotFound|DevicesNotFound/i.test(text))return 'Камеру не знайдено. Виберіть фото штрих-коду або введіть код вручну.';
  if(/NotReadable|TrackStart/i.test(text))return 'Камера зайнята іншим застосунком. Закрийте його та спробуйте ще раз.';
  return 'Не вдалося увімкнути камеру. Спробуйте ще раз, виберіть фото або введіть код вручну.';
}
async function startScanner(){
  await stopCam();
  const token=scanSession,host=$('#cam');
  if(!host||$('#ov').hidden)return;
  const status=$('#scanStatus');$('#retryScan').hidden=true;$('#torch').hidden=true;
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){status.textContent='Для камери відкрийте сайт через HTTPS (або localhost на комп’ютері). Фото та ручне введення доступні нижче.';return}
  if(!window.Html5Qrcode){status.textContent='Бібліотека сканера не завантажилася. Оновіть сторінку.';return}
  host.innerHTML='';
  const current=new Html5Qrcode('cam',{formatsToSupport:[Html5QrcodeSupportedFormats.EAN_13,Html5QrcodeSupportedFormats.EAN_8,Html5QrcodeSupportedFormats.UPC_A,Html5QrcodeSupportedFormats.UPC_E,Html5QrcodeSupportedFormats.CODE_128,Html5QrcodeSupportedFormats.CODE_39,Html5QrcodeSupportedFormats.ITF],verbose:false});
  scanner=current;let found=false;
  // Serialize teardown after a pending permission/start request as well.
  const starting=current.start({facingMode:'environment'},{fps:5,videoConstraints:{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480}}},code=>{
    if(found||token!==scanSession)return;found=true;lookup(code);
  },()=>{});
  cameraWork=starting.catch(()=>{});
  try{
    await starting;
    if(token!==scanSession||!host.isConnected){if(current.isScanning)await current.stop();return}
    status.textContent='Наведіть камеру на штрих-код упаковки.';
    torchOn=false;
    try{$('#torch').hidden=!current.getRunningTrackCapabilities().torch}catch(_){}
  }catch(error){if(token===scanSession&&status.isConnected){status.textContent=cameraMessage(error);$('#retryScan').hidden=false}}
}
async function scanPhoto(file){
  if(!file)return;
  await stopCam();const token=scanSession;
  const status=$('#scanStatus');if(!status)return;
  status.textContent='Зчитую штрих-код із фото…';
  let reader,bitmap;
  try{
    if(!window.Html5Qrcode)throw Error('Бібліотека недоступна');
    if(typeof createImageBitmap==='function'){
      try{
        bitmap=await createImageBitmap(file,{resizeWidth:1280,resizeQuality:'high',imageOrientation:'from-image'});
        const c=document.createElement('canvas'),scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);
        const blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.85));if(blob)file=new File([blob],'barcode.jpg',{type:'image/jpeg'});
        c.width=c.height=0;bitmap.close();bitmap=null;
      }catch(_){}
    }
    if(token!==scanSession)return;
    $('#cam').innerHTML='';reader=new Html5Qrcode('cam');
    const code=await reader.scanFile(file,true);reader.clear();
    if(token===scanSession)await lookup(code);
  }catch(_){if(token===scanSession){status.textContent='Код не знайдено на фото. Спробуйте ближче, без відблисків, або введіть номер вручну.';$('#retryScan').hidden=false}}
  finally{bitmap?.close?.();try{reader?.clear()}catch(_){}}
}
async function lookup(raw){
  const code=String(raw||'').trim();
  if(!/^\d{8,14}$/.test(code)&&!(/^[A-Za-z0-9._-]{4,80}$/.test(code))){toast('Введіть номер штрих-коду');return}
  // Permission prompts may still be pending: manual lookup must remain usable.
  stopCam();
  const context={...S,f:S.f?{...S.f}:undefined,tile:S.tp?.[S.bindTake]};
  for(const p of P){
    const f=Object.entries(p.codes).find(([,c])=>c===code),sz=f?+f[0]:p.barcodeSizes?.[code];
    if(sz){
      if(context.back&&context.mode==='take'&&context.bindTake!==undefined){
        if(p.id!==context.pid||sz!==context.tile?.s){toast('Код належить іншому продукту або фасовці.');S.back=false;return bcSheet(context.bindTake)}
        if(typeof CLOUD!=='undefined'&&CLOUD)return cloudBind(code);
        context.tile.code=code;S.back=false;persistState();return bcSheet(context.bindTake);
      }
      const same=p.id===context.pid;
      opSheet(p.id,'add',code);
      if(same&&context.f){
        Object.assign(S.f,context.f,{s:sz,code,name:p.names?.[code]||context.f.name||pname(p,sz)});
        if(context.f.code&&context.f.code!==code&&!context.f.photoChanged){S.f.photo='';S.f.photo_file_id=''}
        drawOp();
      }
      if(typeof rememberBarcode==='function')rememberBarcode(p,code,sz);
      if(context.pid&&!same)toast('За штрих-кодом: '+esc(p.n));
      return;
    }
  }
  return catalogLookup(code,context);
}
async function attachPhoto(file){
  if(!S.f||!file)return;
  const form=S.f;
  if(file.size>25*1024*1024){toast('Фото завелике. Виберіть файл до 25 МБ');return}
  if(typeof saveMobileDraft==='function')saveMobileDraft();
  form.photoBusy=true;drawOp();
  let url,image;
  try{
    await stopCam();
    // Decode to a bounded bitmap where supported instead of holding a full camera image.
    if(typeof createImageBitmap==='function'){
      try{image=await createImageBitmap(file,{resizeWidth:400,resizeQuality:'medium',imageOrientation:'from-image'})}catch(_){}
    }
    if(!image){url=URL.createObjectURL(file);image=new Image();image.src=url;await image.decode()}
    const photo=compactPhoto(image);
    if(S.f!==form||$('#ov').hidden)return;
    form.photo=photo;form.photo_file_id='';form.photoChanged=true;
  }catch(_){toast('Не вдалося відкрити фото. Виберіть JPEG, PNG або інше підтримуване зображення.')}
  finally{form.photoBusy=false;image?.close?.();if(url){image.src='';URL.revokeObjectURL(url)}if(S.f===form&&!$('#ov').hidden)drawOp()}
}
function compactPhoto(image){
  const canvas=document.createElement('canvas');
  let edge=400;
  for(let pass=0;pass<5;pass++){
    const scale=Math.min(1,edge/Math.max(image.width,image.height));
    canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    for(const quality of [.72,.6,.48,.36]){
      const photo=canvas.toDataURL('image/jpeg',quality);
      if(!photo.startsWith('data:image/jpeg;base64,'))throw Error('JPEG not supported');
      const raw=photo.slice(photo.indexOf(',')+1);
      const bytes=raw.length*3/4-(raw.endsWith('==')?2:raw.endsWith('=')?1:0);
      if(bytes<=40*1024)return photo;
    }
    edge=Math.round(edge*.8);
  }
  throw Error('Photo compression failed');
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    stopCam();
    if($('#scanStatus')){
      $('#scanStatus').textContent='Камеру призупинено. Натисніть «Увімкнути камеру», щоб продовжити.';
      $('#retryScan').hidden=false;$('#torch').hidden=true;
    }
  }
});
window.addEventListener('pagehide',()=>stopCam());

function createSheet(code){
  show(`<div class="row"><h2>Новий продукт</h2><button data-close style="border:0">✕</button></div>
  <div class="lbl">Назва</div><input id="nn" placeholder="напр. Пшоно">
  <div class="lbl">Категорія</div><select id="ncat" class="sel">${CATS.map(c=>`<option>${esc(c)}</option>`).join('')}</select><input id="ncat2" placeholder="або нова категорія" style="margin-top:6px">
  <label class="lbl" for="nu">Одиниця</label><select id="nu"><option value="kg">Кілограми</option><option value="l">Літри</option><option value="pcs">Штуки</option></select><div class="lbl">Розмір пачки в обраній одиниці</div><input id="ns" inputmode="decimal" value="1">
  <div class="lbl">Цільова норма, кг або л</div><input id="nm" inputmode="decimal" value="2">
  
  <button class="pri" style="width:100%;min-height:54px" data-save="${code}">Створити і додати пачку</button>`);
}

// ===== події =====
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-tk],[data-nx]');if(!t){if(e.target.id==='ov')close();return}
  const D=t.dataset;
  if(D.tab){const n=D.tab==='n';document.querySelectorAll('.tabs button').forEach(b=>b.toggleAttribute('aria-current',b.dataset.tab===D.tab));
    $('#list').hidden=n;$('#tools').hidden=n;$('#bScan').hidden=n;$('#norms').hidden=!n;if(n)renderNorms()}
  else if('gear' in D)show('<div class="row"><h2>Налаштування</h2><button data-close style="border:0" aria-label="Закрити">✕</button></div><p class="sub">Тут будуть налаштування застосунку.</p>');
  else if(D.nx!==undefined){if(!e.target.closest('.nres'))t.closest('.nrow').classList.toggle('open')}
  else if(D.catok!==undefined){saveCat(+D.catok)}
  else if(D.rst){const p=P.find(p=>String(p.id)===String(D.rst));p.ov=null;recalc(p);updRes(p);render()}
  else if(D.f){filterCat=null;filterSt.clear();render()}
  else if(D.fc!==undefined){filterCat=filterCat===D.fc?null:D.fc;render()}
  else if(D.fs2){const on=filterSt.has(D.fs2);filterSt.clear();if(!on)filterSt.add(D.fs2);render()}
  else if(D.op){const[m,id]=D.op.split('|');const p=P.find(p=>String(p.id)===String(id));opSheet(resolveProductId(id),m==='auto'?(info(p).packs?'take':'add'):m)}
  else if(D.eat){const[id,s,x]=D.eat.split('|');take(resolveProductId(id),+s,1,x);if(!$('#ov').hidden)drawOp()}
  else if('close' in D)close();
  else if('scan' in D){S.back=true;scanSheet()}
  else if('ml' in D){S.ml=!S.ml;drawOp()}
  else if('dt' in D){S.dt=!S.dt;drawOp()}
  else if(D.loc!==undefined){S.f.loc=S.f.loc===D.loc?'':D.loc;drawOp()}
  else if('newloc' in D){S.addLoc=true;drawOp()}
  else if('nlocok' in D){const v=($('#nloc').value||'').trim();if(v){if(!LOCS.includes(v))LOCS.push(v);S.f.loc=v;S.addLoc=false;drawOp()}else{S.addLoc=false;drawOp()}}
  else if('manual' in D){const p=P.find(p=>p.id===S.pid);S.stage='card';S.f={s:1,n:1,x:'',code:'',name:pname(p,1)};drawOp()}
  else if('wt' in D){S.sz=!S.sz;S.addSz=false;drawOp()}
  else if(D.fs!==undefined){const p=P.find(p=>p.id===S.pid);S.f.s=+D.fs;S.f.name=pname(p,S.f.s);S.sz=false;drawOp()}
  else if('dp' in D){S.dp=!S.dp;drawOp()}
  else if('dpok' in D){const m=+$('#mm').value,y=+$('#yy').value;S.f.x=new Date(Date.UTC(y,m+1,0)).toISOString().slice(0,10);S.dp=false;drawOp()}
  else if(D.ra){S.f.n=Math.max(1,S.f.n+ +D.ra.split('|')[1]);drawOp()}
  else if(D.rsc!==undefined){S.s=S.rows[+D.rsc].s;S.back=true;scanSheet()}
  else if('nsz' in D){S.addSz=true;drawOp()}
  else if('nszok' in D){const v=parseFloat(($('#nsz').value||'').replace(',','.'));if(v>0){const p=P.find(p=>p.id===S.pid);S.f.s=v;S.f.name=pname(p,v);S.addSz=false;S.sz=false;drawOp()}else{S.addSz=false;drawOp()}}
  else if(D.tk!==undefined){const p=P.find(p=>p.id===S.pid),t=S.tp[+D.tk];
    if(!t.done){const g=B.find(b=>b.p===p.id&&b.s===t.s&&b.x===t.x&&(b.loc||'')===t.loc&&b.q>0);if(g){g.q--;B=B.filter(b=>b.q>0);t.done=1}}
    else{const g=B.find(b=>b.p===p.id&&b.s===t.s&&b.x===t.x&&(b.loc||'')===t.loc);g?g.q++:B.push({p:p.id,s:t.s,x:t.x,q:1,k:t.k||off(0),photo:t.photo,code:t.code,name:t.name,loc:t.loc});t.done=0}
    render();drawOp()}
  else if(D.bc!==undefined)bcSheet(+D.bc);
  else if('back' in D)drawOp();
  else if(D.bcscan!==undefined){S.bindTake=+D.bcscan;S.s=S.tp[S.bindTake].s;S.back=true;scanSheet()}
  else if(D.mode){S.mode=D.mode;S.n=1;S.tp=null;S.rows=null;S.addSz=false;S.stage='start';S.f=null;S.dp=false;S.sz=false;if(D.mode==='take'){const p=P.find(p=>p.id===S.pid),st=[...new Set(info(p).bs.map(b=>b.s))];if(st.length&&!st.includes(S.s))S.s=st.includes(1)?1:st[0]}drawOp()}
  else if(D.sz){if(D.sz==='new'){const v=parseFloat((prompt('Розмір пачки (кг або л):')||'').replace(',','.'));if(v>0){const p=P.find(p=>p.id===S.pid);p.codes[v]=p.codes[v]||'';S.s=v}}else S.s=+D.sz;S.n=1;S.cd=undefined;drawOp()}
  else if(D.n){const av=B.filter(b=>b.p===S.pid&&b.s===S.s).reduce((a,b)=>a+b.q,0);S.n=Math.max(1,Math.min(S.mode==='take'?Math.max(1,av):99,S.n+ +D.n));drawOp()}
  else if(D.k!==undefined){S.k=off(-D.k);if(!S.xm)S.x=plus(S.k,P.find(p=>p.id===S.pid).life);drawOp()}
  else if('code' in D){const c=(S.cd||'').trim();if(c){P.find(p=>p.id===S.pid).codes[S.s]=c;toast('Штрих-код збережено')}}
  else if('go' in D){if(S.addLoc){const v=(S.locDraft||'').trim();if(!v){$('#nloc').focus();return}S.f.loc=v;S.addLoc=false;}goAdd();close()}
  else if('lookup' in D)lookup($('#code').value.trim());
  else if(D.demo)lookup(D.demo);
  else if(D.link){const[id,c]=D.link.split('|');const p=P.find(p=>String(p.id)===String(id));opSheet(resolveProductId(id),'add');S.stage='card';S.f={s:1,n:1,x:'',code:c,name:pname(p,1)};drawOp()}
  else if(D.create)createSheet(D.create);
  else if(D.save){const n=$('#nn').value.trim();if(!n)return;const cat=($('#ncat2').value.trim()||$('#ncat').value||'');if(cat&&!CATS.includes(cat))CATS.push(cat);const s=parseFloat($('#ns').value.replace(',','.'))||1,nm=parseFloat($('#nm').value.replace(',','.'))||2;
    const p={id:Date.now(),n,e:'📦',u:'кг',seg:s,normP:Math.max(1,Math.round(nm/s)),use:nm/3,life:365,cat,codes:{[s]:D.save}};mk(p);P.push(p);render();opSheet(p.id,'add',D.save)}
});
document.addEventListener('input',e=>{if(e.target.classList&&e.target.classList.contains('ei'))e.target.style.width=Math.max(2,e.target.value.length+1)+'ch';if(e.target.dataset.ne!==undefined){const[id,k]=e.target.dataset.ne.split('|'),p=P.find(p=>String(p.id)===String(id)),v=parseFloat(e.target.value.replace(',','.'));if(v>0){if(k==='packs'){const n=Math.max(1,Math.round(v));p.ov=n===p.calc?null:n}else p[k]=v;recalc(p);updRes(p);render()}return}
  if(e.target.id==='nloc')S.locDraft=e.target.value;if(e.target.id==='cd')S.cd=e.target.value;if(e.target.dataset.fn!==undefined){e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px';S.f.name=e.target.value;NM[S.pid+'|'+S.f.s]=e.target.value}});
document.addEventListener('change',e=>{
  const id=e.target.id;
  if(id==='wsel'){if(e.target.value==='__new')S.addSz=true;else{const p=P.find(p=>p.id===S.pid);S.f.s=+e.target.value;S.f.name=pname(p,S.f.s);S.addSz=false}drawOp();return}
  if(id==='lsel'){if(e.target.value==='__new'){S.addLoc=true;S.locDraft='';drawOp()}else{S.f.loc=e.target.value;S.addLoc=false;S.locDraft='';drawOp()}return}
  if(id==='mm'||id==='yy'){S.f.x=new Date(Date.UTC(+$('#yy').value,+$('#mm').value+1,0)).toISOString().slice(0,10);S.f.estimated=false;return}
  if(e.target.dataset.cat!==undefined){const p=P.find(p=>String(p.id)===String(e.target.dataset.cat)),box=e.target.closest('.nf-cat').querySelector('.catnew');if(e.target.value==='__new'){box.hidden=false;box.querySelector('input').focus()}else{p.cat=e.target.value;box.hidden=true;render()}return}
  if(e.target.dataset.dt!==undefined){S.rows[+e.target.dataset.dt].x=e.target.value;return}
  if(id==='k'&&e.target.value){S.k=e.target.value;if(!S.xm)S.x=plus(S.k,P.find(p=>p.id===S.pid).life);drawOp()}
  else if(id==='x'&&e.target.value){S.x=e.target.value;S.xm=true;drawOp()}
  else if(id.startsWith('ph')&&e.target.files?.[0])attachPhoto(e.target.files[0]);
});
const NF=(n,d=1)=>String(+(+n).toFixed(d)).replace('.',',');
const FL=[['g','На 1 особу за місяць'],['people','Осіб'],['months','Запас на, міс.'],['life','Придатне, днів'],['pack','Пачка']];
function rsHtml(p){const u=p.u;return (p.ov?`<button class="lnk2" data-rst="${p.id}" aria-label="Скинути до розрахунку: ${p.calc}">↺ ${p.calc}</button>`:`≈ ${NF(p.target,2)} ${u}`)}
function updRes(p){const r=$('#res'+p.id);if(!r)return;const ep=r.querySelector('.ep');if(document.activeElement!==ep)ep.value=p.normP;ep.classList.toggle('man',!!p.ov);r.querySelector('.rr span').textContent=pk(p.normP);r.querySelector('.rs').innerHTML=rsHtml(p)}
function saveCat(id){const p=P.find(p=>p.id===id),field=document.querySelector('[data-catinput="'+id+'"]'),name=field.value.trim();if(!name||name==='__new')return;const cat=CATS.find(c=>c.toLowerCase()===name.toLowerCase())||name;if(!CATS.includes(cat))CATS.push(cat);p.cat=cat;document.querySelectorAll('[data-cat]').forEach(sel=>{const item=P.find(x=>x.id===+sel.dataset.cat);const pending=sel.value==='__new'&&item.id!==id;const opts=[...new Set([...CATS,item.cat].filter(Boolean))];sel.replaceChildren(...opts.map(c=>new Option(c,c)),new Option('Інша…','__new'));sel.value=pending?'__new':item.cat});field.closest('.catnew').hidden=true;field.value='';render()}
function renderNorms(){
  const un=p=>p.u==='шт.'?'шт.':p.u==='л'?'мл':'г';
  const nf=(p,k,l)=>`<label class="nf nf-${k}"><span class="nl">${l}</span><span class="nbox"><input class="ei" data-ne="${p.id}|${k}" inputmode="decimal" value="${NF(p[k]/(p.u==='шт.'&&['g','pack'].includes(k)?1000:1),2)}" style="width:${Math.max(2,NF(p[k]/(p.u==='шт.'&&['g','pack'].includes(k)?1000:1),2).length+1)}ch">${k==='g'||k==='pack'?`<span class="un">${un(p)}</span>`:k==='life'?'<span class="un">дн.</span>':''}</span></label>`;
  $('#norms').innerHTML=(typeof CLOUD!=='undefined'&&CLOUD?'<div class="norm-product-tools"><button data-new-product>＋ Додати продукт</button></div>':'')+`
  <div class="nt2"><div class="nrow nhead"><span>Продукт</span><span>Категорія</span>${FL.map(f=>`<span>${f[1]}</span>`).join('')}<span>Тримати, пачок</span></div>`+
  P.map(p=>`<div class="nrow"><div class="nhd" data-nx="${p.id}"><div class="nname"><span class="product-emoji">${productEmoji(p)}</span> ${typeof CLOUD!=='undefined'&&CLOUD?`<input class="product-name-input" data-name-product="${p.id}" value="${esc(p.n)}" maxlength="100" aria-label="Назва продукту ${esc(p.n)}">`:esc(p.n)}</div><div class="nres" id="res${p.id}"><div class="rr"><input class="ep ${p.ov?'man':''}" data-ne="${p.id}|packs" inputmode="numeric" value="${p.normP}" aria-label="Пачок"><div class="rw"><span>${pk(p.normP)}</span><div class="rs">${rsHtml(p)}</div></div></div></div><span class="nchev" aria-hidden="true">▾</span></div><div class="nf nf-cat"><span class="nl">Категорія</span><select class="esel" aria-label="Категорія ${esc(p.n)}" data-cat="${p.id}"><option value="" ${!p.cat?'selected':''}>Без категорії</option>${[...new Set([...CATS,p.cat].filter(Boolean))].map(c=>`<option value="${esc(c)}" ${c===p.cat?'selected':''}>${esc(c)}</option>`).join('')}<option value="__new">Інша…</option></select><div class="catnew" hidden><input aria-label="Нова категорія" placeholder="Нова категорія" maxlength="100" data-catinput="${p.id}"><button data-catok="${p.id}">OK</button></div></div>${FL.map(f=>nf(p,f[0],f[1])).join('')}</div>`).join('')+'</div>';
  if(typeof restoreExpandedRows==='function')restoreExpandedRows();
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.catinput!==undefined){e.preventDefault();saveCat(+e.target.dataset.catinput)}if(e.key==='Enter'&&e.target.id==='code')lookup(e.target.value.trim());if(e.key==='Enter'&&e.target.id==='nloc')document.querySelector('[data-nlocok]').click();if(e.key==='Enter'&&e.target.id==='nsz')document.querySelector('[data-nszok]').click()});
document.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches('.ep,.ei')){const t=e.target;setTimeout(()=>{try{t.select();t.setSelectionRange(0,99)}catch(_){}},0)}});
document.addEventListener('focusout',e=>{const t=e.target;if(t.dataset&&t.dataset.ne!==undefined){const[id,k]=t.dataset.ne.split('|'),p=P.find(p=>String(p.id)===String(id));if(p){t.value=k==='packs'?p.normP:NF(p[k]/(p.u==='шт.'&&['g','pack'].includes(k)?1000:1),2);if(k!=='packs')t.style.width=Math.max(2,t.value.length+1)+'ch'}}});
$('#q').oninput=render;
$('#bScan').onclick=()=>{S={};scanSheet('add')};

// Separate storage for the redesigned local frontend; legacy data is untouched.
let localDb=null,storageReady=false;
function persistState(){
  if(typeof CLOUD!=='undefined'&&CLOUD)return;
  if(!storageReady||!localDb)return;
  try{
    const tx=localDb.transaction('state','readwrite');
    tx.objectStore('state').put({version:1,P,B,NM,CATS,LOCS},'pantry');
    tx.onabort=()=>toast('Не вдалося зберегти зміни на пристрої. Перевірте вільне місце.');
  }catch(_){toast('Не вдалося зберегти зміни на пристрої.')}
}
async function initLocalState(){
  if(typeof CLOUD!=='undefined'&&CLOUD)return initConnectedState();
  try{
    localDb=await new Promise((resolve,reject)=>{
      const req=indexedDB.open('komora-redesign-local',1);
      req.onupgradeneeded=()=>req.result.createObjectStore('state');
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    });
    const state=await new Promise((resolve,reject)=>{
      const req=localDb.transaction('state').objectStore('state').get('pantry');
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    });
    if(state?.version===1&&Array.isArray(state.P)&&Array.isArray(state.B)){
      P=state.P;B=state.B;CATS=state.CATS||[...new Set(P.map(p=>p.cat).filter(Boolean))];LOCS=state.LOCS||[...new Set(B.map(b=>b.loc).filter(Boolean))];Object.assign(NM,state.NM||{});P.forEach(mk);
    }
  }catch(_){toast('Сховище браузера недоступне: зміни збережуться лише до закриття сторінки.')}
  storageReady=true;render();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});


// Public product lookup. No pantry data, PIN or package photos are sent to OFF.
const catalogCache=new Map();
let catalogSequence=0,catalogController=null,catalogContext=null,catalogCurrent=null;
const CATALOG_FIELDS='code,product_name,product_name_uk,product_name_en,generic_name,generic_name_uk,brands,quantity,product_quantity,product_quantity_unit,image_front_small_url,image_front_url';
function catalogText(value,max=200){return typeof value==='string'?value.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):''}
function catalogQuantity(product){
  const units={g:['kg',.001],kg:['kg',1],mg:['kg',.000001],ml:['l',.001],cl:['l',.01],l:['l',1],'г':['kg',.001],'кг':['kg',1],'мл':['l',.001],'л':['l',1],'шт':['pcs',1],pcs:['pcs',1]};
  let value=Number(String(product.product_quantity??'').replace(',','.')),unit=String(product.product_quantity_unit||'').toLowerCase();
  if(!(value>0)||!units[unit]){
    const match=catalogText(product.quantity).toLowerCase().replace(/℮/g,'').trim().match(/^(?:(\d+)\s*[x×*]\s*)?(\d+(?:[.,]\d+)?)\s*(kg|g|mg|ml|cl|l|кг|г|мл|л|шт\.?|pcs)\s*$/);
    if(!match)return null;
    value=Number(match[2].replace(',','.'))*Number(match[1]||1);unit=match[3].replace('.','');
  }
  if(!units[unit])return null;
  const weight=Math.round(value*units[unit][1]*1e6)/1e6;
  return weight>0&&weight<=1000000?{weight,unit:units[unit][0]}:null;
}
function safeCatalogImage(raw){
  try{const url=new URL(raw);return url.protocol==='https:'&&['images.openfoodfacts.org','static.openfoodfacts.org'].includes(url.hostname)?url.href:''}catch(_){return ''}
}
function normalizeCatalog(product,code){
  if(!product||typeof product!=='object')return null;
  const name=catalogText(product.product_name_uk||product.generic_name_uk||product.product_name||product.product_name_en||product.generic_name);
  if(!name)return null;
  return {code,name,brands:catalogText(product.brands,100),quantity:catalogText(product.quantity,80),size:catalogQuantity(product),image:safeCatalogImage(product.image_front_small_url||product.image_front_url),source:'https://world.openfoodfacts.org/product/'+encodeURIComponent(code)};
}
function cancelCatalog(){catalogSequence++;catalogController?.abort();catalogController=null;}
async function findCatalog(code){
  if(!/^\d{8,14}$/.test(code))return null;
  const key='komora-off-v1:'+code,now=Date.now();
  let cached=catalogCache.get(code);
  if(!cached){try{cached=JSON.parse(localStorage.getItem(key)||'null')}catch(_){}}
  if(cached&&cached.until>now)return cached.result;
  // Direct browser reads: stay below OFF's product-read limit, also across tabs.
  let recent=[];try{recent=JSON.parse(localStorage.getItem('komora-off-reads')||'[]')}catch(_){}
  recent=Array.isArray(recent)?recent.filter(t=>Number.isFinite(t)&&now-t<60000):[];
  if(recent.length>=10||(recent.length&&now-recent.at(-1)<4000))throw Error('RATE');
  try{localStorage.setItem('komora-off-reads',JSON.stringify([...recent,now]))}catch(_){}
  catalogController=new AbortController();const controller=catalogController,timer=setTimeout(()=>controller.abort(),9000);
  const url=new URL('https://world.openfoodfacts.org/api/v3/product/'+encodeURIComponent(code)+'.json');
  url.searchParams.set('fields',CATALOG_FIELDS);url.searchParams.set('lc','uk');
  url.searchParams.set('User-Agent','Komora/1.0 (https://daani-rika.github.io/comora/)');
  try{
    const response=await fetch(url.href,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
    if(response.status===429||response.status===503)throw Error('RATE');
    if(!response.ok&&response.status!==404)throw Error('NETWORK');
    const data=await response.json();
    if(data.status==='failure'&&response.status!==404)throw Error('NETWORK');
    const result=response.status===404||data.status===0?null:normalizeCatalog(data.product,code);
    cached={until:now+(result?86400000:300000),result};catalogCache.set(code,cached);
    try{localStorage.setItem(key,JSON.stringify(cached))}catch(_){}
    return result;
  }finally{clearTimeout(timer);if(catalogController===controller)catalogController=null;}
}
function catalogUnit(p){return ({'кг':'kg','л':'l','шт.':'pcs'})[p.u]||'kg'}
function suggestedCatalogProduct(result){
  if(!result)return '';
  const normalized=text=>text.toLocaleLowerCase('uk').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const title=' '+normalized(result.name)+' ';
  const matches=P.filter(p=>title.includes(' '+normalized(p.n)+' ')&&(!result.size||catalogUnit(p)===result.size.unit));
  return matches.length===1?String(matches[0].id):'';
}
async function catalogLookup(code,context){
  cancelCatalog();const token=catalogSequence;catalogContext=context;
  show(`<div class="row"><h2>Шукаю товар…</h2><button data-close aria-label="Закрити">✕</button></div><p class="bcn">${esc(code)}</p><button id="catalogManual" style="width:100%">Вибрати вручну</button>`);
  $('#catalogManual').onclick=()=>{cancelCatalog();showCatalogChoice(code,null,'manual')};
  try{const result=await findCatalog(code);if(token!==catalogSequence||$('#ov').hidden)return;showCatalogChoice(code,result,result?'found':'missing')}
  catch(error){if(token!==catalogSequence||$('#ov').hidden)return;showCatalogChoice(code,null,error.message==='RATE'?'rate':'offline')}
}
function showCatalogChoice(code,result,state){
  catalogCurrent=result;
  const context=catalogContext||{},selected=P.find(p=>String(p.id)===String(context.pid)),suggested=selected?String(selected.id):suggestedCatalogProduct(result);
  const heading={found:'Знайдено товар',missing:'Код не знайдено',offline:'Каталог недоступний',rate:'Пошук тимчасово обмежено',manual:'Новий штрих-код'}[state];
  show(`<form id="catalogForm"><div class="row"><h2>${heading}</h2><button type="button" data-close aria-label="Закрити">✕</button></div>
  <p class="bcn">${esc(code)}</p>
  ${result?.image?`<img class="catalog-photo" src="${esc(result.image)}" alt="Упаковка з каталогу" referrerpolicy="no-referrer">`:''}
  ${result?`<div class="catalog-source"><a href="${esc(result.source)}" target="_blank" rel="noopener noreferrer">Open Food Facts</a>${result.brands?` · ${esc(result.brands)}`:''}${result.image?' · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">Фото CC BY-SA</a>':''}</div>`:''}
  <label class="editor-field">Продукт у коморі<select id="catalogProduct" required><option value="">Оберіть продукт</option>${P.slice().sort((a,b)=>a.n.localeCompare(b.n,'uk')).map(p=>`<option value="${esc(p.id)}" ${String(p.id)===suggested?'selected':''}>${esc(p.n)}</option>`).join('')}</select></label>
  <label class="editor-field">Назва на упаковці<input id="catalogName" maxlength="200" value="${esc(result?.name||context.f?.name||selected?.n||'')}" placeholder="Назва продукту"></label>
  <div class="two"><label class="editor-field">Вага / об’єм пачки<input id="catalogWeight" inputmode="decimal" required value="${result?.size?.weight||context.f?.s||selected?.seg||''}" placeholder="${esc(result?.quantity||'Наприклад, 0,9')}"></label>
  <label class="editor-field">Одиниця<select id="catalogUnit">${[['kg','Кілограми'],['l','Літри'],['pcs','Штуки']].map(([u,t])=>`<option value="${u}" ${u===(result?.size?.unit||(selected?catalogUnit(selected):'kg'))?'selected':''}>${t}</option>`).join('')}</select></label></div>
  <p id="catalogError" class="catalog-error" role="status"></p>
  <button class="pri" id="catalogConfirm" type="submit" style="width:100%">${context.mode==='take'?'Прив’язати код':'Підтвердити товар'}</button>
  <button id="catalogNorms" type="button" class="catalog-norms">Норми та розрахунки</button></form>`);
  $('#catalogProduct').onchange=()=>{
    const p=P.find(p=>String(p.id)===$('#catalogProduct').value);if(!p)return;
    if(!$('#catalogName').value.trim())$('#catalogName').value=p.n;
    if(!result?.size)$('#catalogUnit').value=catalogUnit(p);
    $('#catalogError').textContent='';
  };
  $('#catalogNorms').onclick=()=>{cancelCatalog();close();if(typeof setActiveTab==='function')setActiveTab('n');else document.querySelector('[data-tab="n"]').click()};
  $('#catalogForm').onsubmit=e=>{e.preventDefault();confirmCatalog(code,result,context)};
  if(typeof saveMobileDraft==='function')saveMobileDraft();
  if(result?.image)prefetchCatalogPhoto(result);
}
const catalogPhotoJobs=new Map();
function prefetchCatalogPhoto(result){
  if(!result?.image)return Promise.resolve('');
  if(!catalogPhotoJobs.has(result.image)){
    if(catalogPhotoJobs.size>=8)catalogPhotoJobs.delete(catalogPhotoJobs.keys().next().value);
    catalogPhotoJobs.set(result.image,catalogPhoto(result));
  }
  return catalogPhotoJobs.get(result.image);
}
async function catalogPhoto(result){
  if(!result?.image)return '';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
  let url;
  try{
    const response=await fetch(result.image,{credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!response.ok)throw Error('image');const blob=await response.blob();if(blob.size>4*1024*1024)throw Error('image');
    url=URL.createObjectURL(blob);const image=new Image();image.src=url;await image.decode();return compactPhoto(image);
  }catch(_){return ''}finally{clearTimeout(timer);if(url)URL.revokeObjectURL(url)}
}
async function confirmCatalog(code,result,context){
  const p=P.find(p=>String(p.id)===$('#catalogProduct').value),weight=Number($('#catalogWeight').value.replace(',','.')),unit=$('#catalogUnit').value;
  if(!p||!(weight>0)||weight>1000000){$('#catalogError').textContent='Оберіть продукт і вкажіть вагу пачки.';return}
  if(catalogUnit(p)!==unit){$('#catalogError').textContent='Одиниця має збігатися з продуктом у коморі.';return}
  if(context.mode==='take'&&(p.id!==context.pid||weight!==context.tile?.s)){$('#catalogError').textContent='Цей товар не відповідає обраній пачці.';return}
  const name=$('#catalogName').value.trim()||p.n,token=catalogSequence,form=$('#catalogForm');
  $('#catalogConfirm').disabled=true;
  const same=p.id===context.pid,reusePhoto=same&&(!context.f?.code||context.f.code===code||context.f.photoChanged),photo=reusePhoto&&context.f?.photo?context.f.photo:await prefetchCatalogPhoto(result);
  if(token!==catalogSequence||$('#ov').hidden||$('#catalogForm')!==form)return;
  if(context.mode==='take'){
    S=context;S.back=true;
    if(typeof CLOUD!=='undefined'&&CLOUD)await cloudBind(code);
    else{S.tp[S.bindTake].code=code;p.codes[weight]=code;p.barcodeSizes={...p.barcodeSizes,[code]:weight};persistState();S.back=false;bcSheet(S.bindTake)}
    return;
  }
  opSheet(p.id,'add');
  S.stage='card';S.f={...(same?context.f:{}),s:weight,n:same?(context.f?.n||1):1,x:same?(context.f?.x||''):'',code,name,photo,catalogSource:result?.source||''};
  if(!reusePhoto){S.f.photo_file_id='';S.f.photoChanged=false}
  drawOp();
}

const WEB_APP_URL='https://script.google.com/macros/s/AKfycbyfWCBX8_1EwDEVUs3yikBx6KPU3k-F1VYXzOBcSTJj0twxwN6hs5cjXiVfpqo32gQ2/exec';
const CLOUD=!new URLSearchParams(location.search).has('demo');
// Keep this pantry's original storage namespace when replacing its deployment.
// Saved login, UI preferences and in-flight request IDs must survive a URL change.
const CLOUD_KEY='komora-cloud-v2:AKfycbynGGRQY2DmrbHzpX77Is_bftrgM6rrZa7o8Dbcbyyi7OHWYXl_lwp-yyNR7mB-LYr_sQ:';
let cloudPin='',cloudRevision=-1,cloudBusy=false,cloudOnline=false,cloudLast=null,cloudPending=null,cloudPendingOptions=null,cloudEpoch=0,cloudPolling=false;
let normTimer,undoTimer,retryTimer,cloudAuthenticating=false;
let cloudQueue=[];
const queuedOptions=new Map(),recentOperations=new Map();
const normDrafts=new Map(),cloudPhotos=new Map(),photoJobs=new Map();
const uiPrefs=readUiPrefs();
let uiRestored=false,uiScrollTimer;
function resolveProductId(id){return P.find(p=>String(p.id)===String(id))?.id??id}
function stored(key){try{return localStorage.getItem(CLOUD_KEY+key)}catch(_){return null}}
function storeValue(key,value){localStorage.setItem(CLOUD_KEY+key,value)}
function forget(key){try{localStorage.removeItem(CLOUD_KEY+key)}catch(_){}}
function cloudStatus(message){const el=$('#syncText');if(el)el.textContent=message;}
function readUiPrefs(){
  let value;try{value=JSON.parse(stored('ui')||'null')}catch(_){}
  return {tab:value?.tab==='n'?'n':'p',expanded:Array.isArray(value?.expanded)?value.expanded.filter(x=>typeof x==='string'):[],query:typeof value?.query==='string'?value.query:'',category:typeof value?.category==='string'?value.category:null,statuses:Array.isArray(value?.statuses)?value.statuses.filter(x=>['low','excess','expired'].includes(x)):[],filter:['all','low','excess'].includes(value?.filter)?value.filter:'all',scroll:value?.scroll&&typeof value.scroll==='object'?value.scroll:{}};
}
function saveUiPrefs(){try{storeValue('ui',JSON.stringify(uiPrefs))}catch(_){}}
function rememberExpandedRows(){uiPrefs.expanded=[...document.querySelectorAll('.nrow.open [data-nx]')].map(el=>String(el.dataset.nx));saveUiPrefs();}
function restoreExpandedRows(){
  if(typeof CLOUD==='undefined'||!CLOUD)return;
  document.querySelectorAll('.nrow:not(.nhead)').forEach(row=>{const id=row.querySelector('[data-nx]')?.dataset.nx;row.classList.toggle('open',uiPrefs.expanded.includes(String(id)));});
}
function setActiveTab(tab,{remember=true,restoreScroll=true}={}){
  tab=tab==='n'?'n':'p';
  if(remember){uiPrefs.scroll[uiPrefs.tab]=window.scrollY;uiPrefs.tab=tab;saveUiPrefs();}
  document.querySelectorAll('.tabs button').forEach(button=>{if(button.dataset.tab===tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
  const norms=tab==='n';$('#list').hidden=norms;$('#tools').hidden=norms;$('#bScan').hidden=norms;$('#norms').hidden=!norms;
  if(norms){renderNorms();restoreExpandedRows();}
  if(restoreScroll)requestAnimationFrame(()=>window.scrollTo(0,Math.max(0,Number(uiPrefs.scroll[tab])||0)));
}
function restoreSavedUi(){
  $('#q').value=uiPrefs.query;filterCat=uiPrefs.category;filterSt=new Set(uiPrefs.statuses.length?uiPrefs.statuses:uiPrefs.filter==='all'?[]:[uiPrefs.filter]);setActiveTab(uiPrefs.tab,{remember:false});uiRestored=true;
}
function cloudControls(){
  document.querySelectorAll('[data-go],[data-save],[data-ne],[data-rst]').forEach(el=>el.disabled=false);
  if($('#cloudLogout'))$('#cloudLogout').disabled=false;
}
function saveQueue(){storeValue('queue',JSON.stringify(cloudQueue));cloudPending=cloudQueue[0]?.request||null;}
function queueStatus(){
  if(cloudQueue.length)cloudStatus((cloudOnline?'Зберігаю у фоні':'Немає зв’язку · збережу пізніше')+' · '+cloudQueue.length);
  else cloudStatus(cloudOnline?'Збережено · спільна комора':'Немає зв’язку · останні дані');
}
function loadQueue(){
  try{cloudQueue=JSON.parse(stored('queue')||'[]');if(!Array.isArray(cloudQueue))cloudQueue=[];}catch(_){cloudQueue=[];}
  if(!cloudQueue.length){try{const old=JSON.parse(stored('pending')||'null');if(old){cloudQueue=[{request:old,sent:true}];saveQueue();forget('pending');}}catch(_){}}
  cloudQueue.forEach(entry=>recentOperations.set(entry.request.request_id,entry));
  cloudPending=cloudQueue[0]?.request||null;
}
function optimisticFields(fields){
  const p=P.find(p=>p.id===fields.product_id);
  if(fields.action==='add'){
    if(!p||B.some(b=>b.id===fields.batch_id))return;
    const raw=cloudLast?.state?.Products.find(x=>x.product_id===p.id);
    B.push({id:fields.batch_id,p:p.id,s:fields.pack_weight_kg,q:fields.packs_qty,k:fields.added_date||off(0),x:fields.expiry_date||plus(fields.added_date||off(0),p.life-Number(raw?.store_buffer_days||0)),loc:fields.storage_location||'',code:fields.barcode||'',name:fields.pack_name||'',photo:fields.photo_base64||cloudPhotos.get(fields.photo_file_id)||'',photo_file_id:fields.photo_file_id||''});
    if(fields.barcode&&fields.save_barcode){p.codes[fields.pack_weight_kg]=fields.barcode;p.barcodeSizes[fields.barcode]=fields.pack_weight_kg;p.names={...p.names,[fields.barcode]:fields.pack_name||p.n};}
  }else if(fields.action==='take'){
    const b=B.find(b=>b.id===fields.batch_id);if(b)b.q=Math.max(0,b.q-fields.packs_qty);
  }else if(fields.action==='edit'){
    const b=B.find(b=>b.id===fields.batch_id);if(b){
      Object.assign(b,{q:fields.packs_qty,s:fields.pack_weight_kg,k:fields.added_date,x:fields.expiry_date,estimated:fields.is_estimated_expiry,loc:fields.storage_location??b.loc,name:fields.pack_name??b.name,code:fields.barcode??b.code});
      if(fields.photo_base64){b.photo=fields.photo_base64;b.photo_file_id='';b.own_photo_file_id=''}
      if(fields.remove_photo){b.photo='';b.photo_file_id='';b.own_photo_file_id=''}
    }
  }else if(fields.action==='product_settings'){
    const product=p||{id:fields.product_id,codes:{},barcodeSizes:{},names:{}};
    Object.assign(product,{cat:fields.category??p?.cat??'',n:fields.name??p?.n,e:fields.emoji??p?.e??'📦',u:({kg:'кг',l:'л',pcs:'шт.'})[fields.unit]||p?.u||'кг',g:fields.monthly_usage_kg*1000,people:fields.people_count,months:fields.target_months,pack:fields.default_pack_weight*1000,life:fields.default_shelf_life_days,ov:fields.norm_packs_override});
    recalc(product);if(!p)P.push(product);
  }else if(fields.action==='barcode'&&p){
    p.codes[fields.pack_weight_kg]=fields.barcode;p.barcodeSizes[fields.barcode]=fields.pack_weight_kg;
    const b=B.find(b=>b.id===fields.batch_id);if(b)b.code=fields.barcode;
  }
}
// Resolve legacy batches without photo IDs by exact, nonempty barcode only.
// Never infer a barcode from product or weight: several brands may share a size.
function shareBarcodePhotos(products,batches,tiles=[],pid){
  const candidates=new Map(),refs=new Map(),images=new Map(),key=(id,code)=>JSON.stringify([String(id),String(code)]);
  const own=b=>b.own_photo_file_id===undefined?b.photo_file_id:b.own_photo_file_id;
  const add=(pid,code,id)=>{if(!code||!id)return;const k=key(pid,code);if(!candidates.has(k))candidates.set(k,new Set());candidates.get(k).add(id)};
  products.forEach(p=>Object.entries(p.photoRefs||{}).forEach(([code,id])=>add(p.id,code,id)));
  batches.forEach(b=>{add(b.p,b.code,own(b));if(b.photo&&b.photo_file_id)images.set(b.photo_file_id,b.photo)});
  candidates.forEach((ids,k)=>{if(ids.size===1)refs.set(k,[...ids][0])});
  products.forEach(p=>{const result={};candidates.forEach((_,k)=>{const [pid,code]=JSON.parse(k);if(pid===String(p.id)&&refs.has(k))result[code]=refs.get(k)});p.photoRefs=result});
  const assign=(item,id)=>{
    if(!id)return;
    const previous=item.photo_file_id;
    if(!previous&&item.photo)return; // An optimistic upload has no Drive ID yet.
    item.photo_file_id=id;item.photo=cloudPhotos.get(id)||images.get(id)||(previous===id?item.photo:'')||'';
  };
  batches.forEach(b=>assign(b,own(b)||(b.code?refs.get(key(b.p,b.code)):'')));
  const byId=new Map(batches.map(b=>[b.id,b]));
  tiles.forEach(t=>{const b=byId.get(t.id);if(b)t.code=b.code||'';assign(t,b?b.photo_file_id:t.photo_file_id||(t.code?refs.get(key(pid,t.code)):''))});
}
function projectQueue(){
  if(!cloudLast)return;
  P=cloudLast.frontend.P.map(p=>({...p,codes:{...p.codes},barcodeSizes:{...p.barcodeSizes}}));
  const rawBatches=new Map((cloudLast.state?.Batches||[]).map(b=>[b.batch_id,b]));
  B=cloudLast.frontend.B.map(b=>{
    const raw=rawBatches.get(b.id),own=raw?raw.photo_file_id||'':b.photo_file_id||'';
    return {...b,code:raw?String(raw.barcode||''):b.code||'',own_photo_file_id:own,photo_file_id:own,photo:cloudPhotos.get(own)||''};
  });
  cloudQueue.forEach(entry=>{
    const f=entry.request;
    if(f.action==='undo'){
      const target=entry.inverse;
      if(target?.request.action==='add'){const b=B.find(b=>b.id===target.request.batch_id);if(b)b.q=Math.max(0,b.q-target.request.packs_qty);}
      if(target?.request.action==='take'&&target.batchBefore){const b=B.find(b=>b.id===target.batchBefore.id);if(b)b.q+=target.request.packs_qty;else B.push({...target.batchBefore,q:target.request.packs_qty});}
      if(target?.request.action==='edit'&&target.batchBefore){const index=B.findIndex(b=>b.id===target.batchBefore.id);if(index>=0)B[index]={...target.batchBefore};}
      if(target?.request.action==='product_settings'&&target.productBefore){const i=P.findIndex(p=>p.id===target.productBefore.id);if(i>=0)P[i]={...target.productBefore};}
    }else optimisticFields(f);
  });
  for(const fields of normDrafts.values())optimisticFields(fields);
  CATS=[...new Set([...(cloudLast.frontend.CATS||[]),...P.map(p=>p.cat)].filter(Boolean))];
  LOCS=[...new Set([...(cloudLast.frontend.LOCS||[]),...B.map(b=>b.loc)].filter(Boolean))];
  P.forEach(p=>{p.lastLoc=B.filter(b=>b.p===p.id&&b.loc).sort((a,b)=>(b.k||'').localeCompare(a.k||''))[0]?.loc||''});
  P.forEach(p=>{p.photoRefs={...p.photoRefs};B.filter(b=>b.p===p.id&&b.code&&b.photo_file_id).forEach(b=>{if(!p.photoRefs[b.code])p.photoRefs[b.code]=b.photo_file_id});});
  shareBarcodePhotos(P,B);
}
async function cloudRequest(fields,pin=cloudPin){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),35000);
  try{
    const response=await fetch(WEB_APP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...fields,pin}),redirect:'follow',cache:'no-store',credentials:'omit',signal:controller.signal});
    const data=await response.json();
    if(!data||typeof data.ok!=='boolean')throw Error('Некоректна відповідь сервера');
    if(!data.ok){const error=Error(data.error||'Не вдалося виконати дію');error.code=data.code;throw error;}
    return data;
  }finally{clearTimeout(timer)}
}
function cloudApply(reply,{keepTake=false,paint=true}={}){
  if(reply.api_version!==2||!reply.frontend||!Array.isArray(reply.frontend.P)||!Array.isArray(reply.frontend.B))throw Error('Потрібна актуальна версія сервера API v2.');
  if(reply.revision<cloudRevision)return;
  cloudLast=reply;cloudRevision=reply.revision;
  projectQueue();
  Object.keys(NM).forEach(k=>delete NM[k]);
  P.forEach(p=>Object.entries(p.codes).forEach(([size,code])=>{if(p.names?.[code])NM[p.id+'|'+size]=p.names[code]}));
  try{storeValue('cache',JSON.stringify(reply))}catch(_){}
  if(!keepTake)S.tp=null;
  if(paint)cloudPaint(keepTake);
}
function cloudPaint(keepTake=false){
  render();
  if(!$('#norms').hidden&&!document.activeElement?.closest?.('#norms')){
    renderNorms();restoreExpandedRows();
  }
  if(!$('#ov').hidden&&S.pid&&P.some(p=>p.id===S.pid)&&$('#sheet').classList.contains('take')){
    if(!keepTake)S.tp=null;drawOp();cloudLoadPhotos();
  }
  cloudControls();
}
function cloudSessionVisible(visible){
  $('#cloudLogin').hidden=visible;
  if($('#cloudBoot'))$('#cloudBoot').hidden=true;
  for(const selector of ['header','main','#bScan'])$(selector).hidden=!visible;
  if(visible&&!uiRestored)restoreSavedUi();
  if(visible)$('#bScan').hidden=!$('#norms').hidden;
}
function cloudLoginMessage(message){$('#loginError').textContent=message;}
async function cloudLogin(pin,{allowCache=false}={}){
  if(cloudAuthenticating)return;
  if(!/^\d{4}$/.test(pin)){cloudLoginMessage('Введіть чотири цифри PIN.');return}
  cloudAuthenticating=true;const epoch=++cloudEpoch;$('#loginSubmit').disabled=true;cloudLoginMessage('Підключаюся…');
  try{
    const reply=await cloudRequest({action:'snapshot'},pin);if(epoch!==cloudEpoch)return;
    cloudPin=pin;cloudOnline=true;
    if(cloudQueue[0]?.sent&&cloudLast)cloudRevision=reply.revision;else cloudApply(reply,{paint:false});
    try{storeValue('pin',pin)}catch(_){}
    cloudSessionVisible(true);cloudLoginMessage('');queueStatus();cloudPaint(true);
  }catch(error){
    if(error.code==='AUTH'){forget('pin');cloudPin='';cloudSessionVisible(false);cloudLoginMessage('Неправильний PIN. Спробуйте ще раз.');}
    else if(allowCache&&!error.code&&stored('cache')){
      try{cloudPin=pin;cloudApply(JSON.parse(stored('cache')),{paint:false});cloudOnline=false;cloudSessionVisible(true);cloudPaint(true);queueStatus();}
      catch(_){cloudLoginMessage('Не вдалося підключитися. Перевірте інтернет і спробуйте ще раз.');}
    }else{cloudSessionVisible(false);cloudLoginMessage(error.code?error.message:'Не вдалося підключитися. Перевірте інтернет або відкрийте сторінку у Chrome / Edge.');}
  }finally{if(epoch===cloudEpoch){cloudAuthenticating=false;$('#loginSubmit').disabled=false;cloudControls();}}
  if(cloudQueue.length&&cloudOnline)cloudSendPending();
}
async function cloudRefresh(){
  if(!cloudPin||cloudBusy||cloudAuthenticating||cloudPolling)return;
  if(cloudQueue.length)return cloudSendPending();
  if(normDrafts.size)return flushNorms();
  cloudPolling=true;const epoch=cloudEpoch;
  try{
    const version=await cloudRequest({action:'revision'});
    if(epoch!==cloudEpoch||cloudBusy)return;
    if(version.revision!==cloudRevision){
      const reply=await cloudRequest({action:'snapshot'});if(epoch!==cloudEpoch||cloudBusy)return;cloudApply(reply);
    }
    cloudOnline=true;cloudStatus('Збережено · спільна комора');
  }catch(error){
    if(epoch!==cloudEpoch)return;
    cloudOnline=false;
    if(error.code==='AUTH'){cloudLogout();cloudLoginMessage('PIN змінено. Увійдіть знову.');}
    else queueStatus();
  }finally{cloudPolling=false;cloudControls()}
}
function cloudCanChange(){
  return !!cloudPin&&!!cloudLast;
}
function cloudUndoToast(message,target){
  clearTimeout(undoTimer);const box=$('#toast');box.hidden=false;
  box.innerHTML=`<span>${esc(message)}</span><button id="cloudUndo">Скасувати</button>`;
  $('#cloudUndo').onclick=()=>{if(cloudCanChange()){box.hidden=true;cloudMutate({action:'undo',target_id:target},{message:'Дію скасовано',undo:false,after(){S.tp=null;if(!$('#ov').hidden&&S.mode==='take')drawOp()}})}};
  undoTimer=setTimeout(()=>box.hidden=true,5000);
}
async function cloudMutate(fields,options={}){
  if(!cloudCanChange())return false;
  if(fields.action==='add'&&!fields.batch_id)fields={...fields,batch_id:crypto.randomUUID()};
  const request={...fields,request_id:crypto.randomUUID()};
  const beforeBatch=B.find(b=>b.id===fields.batch_id),beforeProduct=P.find(p=>p.id===fields.product_id);
  const entry={request,sent:false,batchBefore:beforeBatch?JSON.parse(JSON.stringify(beforeBatch)):null,productBefore:beforeProduct?JSON.parse(JSON.stringify(beforeProduct)):null};
  if(fields.action==='undo'){const target=recentOperations.get(fields.target_id);if(target)entry.inverse={request:target.request,batchBefore:target.batchBefore,productBefore:target.productBefore};}
  cloudQueue.push(entry);
  try{saveQueue()}catch(_){cloudQueue.pop();cloudPending=cloudQueue[0]?.request||null;toast('Браузер не може зберегти запит. Зміни не надіслано.');return false}
  recentOperations.set(request.request_id,JSON.parse(JSON.stringify(entry)));queuedOptions.set(request.request_id,options);
  while(recentOperations.size>50)recentOperations.delete(recentOperations.keys().next().value);
  options.optimistic?.();projectQueue();options.enqueued?.(request.request_id);cloudPaint(true);queueStatus();
  if(options.undo!==false)cloudUndoToast(options.message||'Зміну додано',request.request_id);else if(options.message)toast(options.message);
  cloudSendPending();return true;
}
function canRebase(entry,reply){
  const f=entry.request,p=reply.frontend.P.find(p=>p.id===f.product_id),batch=reply.frontend.B.find(b=>b.id===f.batch_id);
  if(f.action==='add')return !!p&&!batch;
  if(f.action==='take')return !!batch&&batch.q>=f.packs_qty&&(!entry.batchBefore||(batch.s===entry.batchBefore.s&&batch.p===entry.batchBefore.p&&batch.x===entry.batchBefore.x&&(batch.loc||'')===(entry.batchBefore.loc||'')));
  if(f.action==='barcode')return !!p&&(!f.batch_id||!!batch)&&!reply.state.Barcodes.some(b=>String(b.barcode)===f.barcode&&b.product_id!==f.product_id);
  if(f.action==='edit')return !!batch&&!!entry.batchBefore&&['id','p','s','q','x','k','loc','code','photo_file_id'].every(key=>(batch[key]||'')===(entry.batchBefore[key]||''));
  if(f.action==='product_settings'){
    if(!entry.productBefore)return !p&&!reply.frontend.P.some(p=>p.n.toLowerCase()===f.name.toLowerCase());
    return !!p&&JSON.stringify(settingsPayload(p))===JSON.stringify(settingsPayload(entry.productBefore));
  }
  return false;
}
async function cloudSendPending(){
  if(cloudBusy||cloudAuthenticating||!cloudPin||!cloudQueue.length)return false;
  clearTimeout(retryTimer);const epoch=cloudEpoch;cloudBusy=true;
  try{
    while(cloudQueue.length&&cloudPin&&epoch===cloudEpoch){
      const entry=cloudQueue[0],request=entry.request;
      if(!entry.sent){request.revision=cloudRevision;entry.sent=true;saveQueue();}
      try{
        const reply=await cloudRequest(request);if(epoch!==cloudEpoch)return false;
        if(request.photo_base64&&typeof cachePhoto==='function'){
          const file=reply.frontend.B.find(b=>b.id===request.batch_id)?.photo_file_id;if(file)cachePhoto(file,request.photo_base64);
        }
        cloudQueue.shift();saveQueue();cloudOnline=true;
        cloudApply(reply,{keepTake:true});
        queuedOptions.get(request.request_id)?.after?.(reply,request.request_id);queuedOptions.delete(request.request_id);
      }catch(error){
        if(epoch!==cloudEpoch)return false;
        if(error.code==='CONFLICT'){
          const reply=await cloudRequest({action:'snapshot'});if(epoch!==cloudEpoch)return false;
          if((entry.rebases||0)<3&&canRebase(entry,reply)){
            entry.rebases=(entry.rebases||0)+1;request.revision=reply.revision;saveQueue();cloudApply(reply,{keepTake:true});continue;
          }
          cloudQueue.shift();saveQueue();queuedOptions.delete(request.request_id);cloudApply(reply);toast('Дані цієї пачки або норми змінилися на іншому пристрої. Перевірте їх і повторіть дію.');
        }else if(error.code==='AUTH'){
          cloudOnline=false;forget('pin');cloudPin='';cloudSessionVisible(false);cloudLoginMessage('PIN змінено. Увійдіть знову — черга змін збережена.');break;
        }else if(error.code&&error.code!=='SERVER'){
          cloudQueue.shift();saveQueue();queuedOptions.delete(request.request_id);projectQueue();S.tp=null;cloudPaint();toast(esc(error.message));
        }else{cloudOnline=false;break;}
      }
      queueStatus();
    }
    return !cloudQueue.length;
  }catch(_){cloudOnline=false;return false;}
  finally{if(epoch===cloudEpoch){cloudBusy=false;queueStatus();cloudControls();if(cloudQueue.length&&cloudPin)retryTimer=setTimeout(()=>cloudSendPending(),10000)}}
}
function cloudLogout(){
  flushNorms();++cloudEpoch;cloudBusy=false;cloudAuthenticating=false;clearTimeout(retryTimer);forget('pin');cloudPin='';cloudOnline=false;cloudLast=null;cloudRevision=-1;
  P=[];B=[];uiRestored=false;cloudPhotos.clear();close();cloudSessionVisible(false);$('#cloudPin').value='';cloudLoginMessage('');
}
function settingsPayload(p){return {action:'product_settings',product_id:p.id,name:p.n,category:p.cat||'',emoji:p.e,unit:({'кг':'kg','л':'l','шт.':'pcs'})[p.u],monthly_usage_kg:p.g/1000,people_count:p.people,target_months:p.months,default_pack_weight:p.pack/1000,default_shelf_life_days:p.life,norm_packs_override:p.ov||null};}
function productEditor(id){
  const p=P.find(p=>p.id===id),hasStock=p&&info(p).packs>0;
  S={editorId:id||'',mode:'editor'};
  const unit=p?({'кг':'kg','л':'l','шт.':'pcs'})[p.u]:'kg';
  show(`<form id="productForm"><div class="top3"><h2>${p?'Редагувати продукт':'Новий продукт'}</h2><button type="button" data-close aria-label="Закрити">✕</button></div>
  <label class="editor-field">Назва<input id="productName" required maxlength="100" value="${esc(p?.n||'')}" placeholder="Наприклад, Олія соняшникова"></label>
  <label class="editor-field">Категорія<input id="productCategory" maxlength="100" list="categoryOptions" value="${esc(p?.cat||'')}"><datalist id="categoryOptions">${CATS.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></label>
  <div class="two"><label class="editor-field">Емодзі<input id="productEmoji" maxlength="16" required value="${esc(p?.e||'📦')}"></label>
  <label class="editor-field">Одиниця<select id="productUnit" ${hasStock?'disabled':''}>${[['kg','Кілограми'],['l','Літри'],['pcs','Штуки']].map(([v,t])=>`<option value="${v}" ${unit===v?'selected':''}>${t}</option>`).join('')}</select></label></div>
  <label class="editor-field">Типова фасовка, кг / л / шт.<input id="productPack" type="number" inputmode="decimal" min="0.000001" step="any" value="${p?p.pack/1000:1}" required></label>
  <button class="pri" type="submit" style="width:100%">${p?'Зберегти зміни':'Додати продукт'}</button></form>`);
  $('#productForm').onsubmit=async e=>{
    e.preventDefault();if(!cloudCanChange())return;
    const productId=p?.id||crypto.randomUUID(),name=$('#productName').value.trim(),emoji=$('#productEmoji').value.trim(),pack=Number($('#productPack').value.replace(',','.'));
    if(!name||!emoji||!(pack>0)){toast('Перевірте назву, емодзі та фасовку.');return}
    const current=P.find(item=>item.id===productId)||p;
    const fields=current?settingsPayload(current):{action:'product_settings',product_id:productId,monthly_usage_kg:0,people_count:1,target_months:3,default_shelf_life_days:365,store_buffer_days:0,norm_packs_override:null};
    if($('#productCategory').value.trim()!==(p?.cat||'')&&!cloudSupportsV5()){toast('Оновіть Apps Script для збереження категорій.');return}
    Object.assign(fields,{category:$('#productCategory').value.trim(),name,emoji,unit:$('#productUnit').value,default_pack_weight:pack});
    await cloudMutate(fields,{message:p?'Продукт оновлено':'Продукт додано',enqueued(){close()}});
  };
}
function cloudSupportsV5(){return cloudLast?.features?.includes('categories_locations')===true}
function cloudSetCategory(id,value){
  if(!cloudSupportsV5()){toast('Оновіть Apps Script для збереження категорій.');renderNorms();return}
  const p=P.find(p=>String(p.id)===String(id)),name=value.trim();if(!p||name==='__new'||name.length>100)return;
  p.cat=CATS.find(c=>c.toLowerCase()===name.toLowerCase())||name;
  CATS=[...new Set([...CATS,p.cat].filter(Boolean))];queueNorm(p);render();renderNorms();
}
function queueNorm(p){normDrafts.set(p.id,settingsPayload(p));cloudStatus('Є незбережені зміни норм…');clearTimeout(normTimer);normTimer=setTimeout(flushNorms,650);}
async function flushNorms(){
  clearTimeout(normTimer);
  for(const [id,fields] of [...normDrafts]){normDrafts.delete(id);cloudMutate(fields,{message:'Норми оновлено'});}
}
async function cloudAdd(){
  if(!cloudCanChange())return;
  await flushNorms();
  const form=S.f,p=P.find(p=>p.id===S.pid);if(!form||!p||form.submitting)return;
  if(form.photoBusy){toast('Фото ще стискається. Зачекайте мить.');return}
  if(S.addLoc){const loc=(S.locDraft||'').trim();if(!loc){$('#nloc').focus();return}form.loc=loc;}
  if((form.loc||'')&&!cloudSupportsV5()){toast('Оновіть Apps Script для збереження місця.');return}
  const batchId=form.batch_id||crypto.randomUUID(),code=form.code||'',photoId=form.photoChanged?'':form.photo_file_id||(typeof barcodePhotoRef==='function'?barcodePhotoRef(p,code):''),fields={action:'add',product_id:p.id,batch_id:batchId,packs_qty:form.n,pack_weight_kg:form.s,added_date:off(0),barcode:code,save_barcode:true,storage_location:form.loc||'',is_estimated_expiry:!!form.estimated,pack_name:form.name,expiry_date:form.x||undefined,photo_file_id:photoId||undefined,photo_base64:photoId?undefined:form.photo||undefined};
  form.batch_id=batchId;form.submitting=true;if(typeof saveMobileDraft==='function')saveMobileDraft();
  if(code&&typeof rememberBarcode==='function')rememberBarcode(p,code,form.s);
  const accepted=await cloudMutate(fields,{message:`Додано ${form.n} ${pk(form.n)} · ${p.n}`,enqueued(){if(S.f===form)close()}});
  if(!accepted)form.submitting=false;
}
async function cloudTake(index){
  if(!cloudCanChange())return;
  const tile=S.tp?.[index];if(!tile)return;
  if(tile.done){
    if(!tile.operation_id){toast('Цю дію вже не можна скасувати тут.');return}
    await cloudMutate({action:'undo',target_id:tile.operation_id},{message:'Пачку повернуто',undo:false,enqueued(){tile.done=0;tile.operation_id=null;if(S.tp?.includes(tile))drawOp()}});return;
  }
  const batch=B.find(b=>b.id===tile.id&&b.q>0);if(!batch){toast('Цієї пачки вже немає. Оновіть дані.');return}
  const qty=Math.min(1,batch.q);
  await cloudMutate({action:'take',product_id:S.pid,batch_id:tile.id,packs_qty:qty},{message:'Пачку взято',enqueued(id){tile.done=1;tile.operation_id=id;if(S.tp?.includes(tile))drawOp()}});
}
async function cloudBind(code){
  if(!cloudCanChange())return;
  const index=S.bindTake,tile=S.tp?.[index];if(!tile)return;
  await cloudMutate({action:'barcode',product_id:S.pid,batch_id:tile.id,barcode:code,pack_weight_kg:tile.s,pack_name:tile.name||''},{message:'Штрих-код збережено',enqueued(){tile.code=code;S.back=false;bcSheet(index)}});
}
async function cloudCreate(code){
  if(!cloudCanChange())return;
  const name=$('#nn').value.trim(),weight=Number($('#ns').value.replace(',','.')),norm=Number($('#nm').value.replace(',','.')),unit=$('#nu')?.value||'kg';
  if(!name||!(weight>0)||!(norm>0)){toast('Перевірте назву, фасовку та норму.');return}
  const id=crypto.randomUUID();
  await cloudMutate({action:'product_settings',product_id:id,name,unit,emoji:'📦',monthly_usage_kg:norm/3,people_count:1,target_months:3,default_pack_weight:weight,default_shelf_life_days:365,store_buffer_days:0,norm_packs_override:Math.max(1,Math.ceil(norm/weight))},{undo:false,message:'Продукт створено. Тепер підтвердьте додавання пачки.',enqueued(){opSheet(id,'add',code);S.f.s=weight;S.f.code=code;drawOp()}});
}
async function cloudLoadPhotos(){
  if(!CLOUD||!S.tp||!cloudOnline)return;
  const sessionPin=cloudPin;
  const files=[...new Set(S.tp.map(t=>t.photo_file_id).filter(Boolean))];
  for(const file of files){
    if(cloudPhotos.has(file))continue;
    try{
      if(!photoJobs.has(file))photoJobs.set(file,cloudRequest({action:'photo',file_id:file}).then(r=>r.photo));
      const photo=await photoJobs.get(file);if(sessionPin!==cloudPin)return;cloudPhotos.set(file,photo);
      B.filter(b=>b.photo_file_id===file).forEach(b=>b.photo=photo);
      S.tp?.filter(t=>t.photo_file_id===file).forEach(t=>t.photo=photo);
      if(!$('#ov').hidden&&$('#sheet').classList.contains('take'))drawOp();
    }catch(_){cloudStatus('Не вдалося завантажити фото · решта даних доступна');}
    finally{photoJobs.delete(file)}
  }
}
function installCloudEvents(){
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.dataset.catinput!==undefined){e.preventDefault();e.stopImmediatePropagation();cloudSetCategory(e.target.dataset.catinput,e.target.value)}
  },true);
  document.addEventListener('click',e=>{
    if(e.target.matches?.('[data-name-product]')){e.stopImmediatePropagation();return;}
    const normRow=e.target.closest('.nrow:not(.nhead)');
    if(normRow&&matchMedia('(max-width:760px)').matches&&!e.target.closest('input,select,textarea,button,a,label')){
      normRow.classList.toggle('open');rememberExpandedRows();e.stopImmediatePropagation();return;
    }
    const button=e.target.closest('button,[data-tk]');if(!button)return;
    const d=button.dataset;
    if(d.tab){e.preventDefault();e.stopImmediatePropagation();setActiveTab(d.tab);return;}
    if(d.f||d.fc!==undefined||d.fs2){
      e.preventDefault();e.stopImmediatePropagation();
      if(d.f){filterCat=null;filterSt.clear()}else if(d.fc!==undefined)filterCat=filterCat===d.fc?null:d.fc;
      else{const on=filterSt.has(d.fs2);filterSt.clear();if(!on)filterSt.add(d.fs2)}
      if(filterSt.has('expired')&&filterCat&&!P.some(p=>p.cat===filterCat&&info(p).bs.some(b=>daysTo(b.x)<0)))filterCat=null;
      uiPrefs.category=filterCat;uiPrefs.statuses=[...filterSt];uiPrefs.filter='all';saveUiPrefs();render();return;
    }
    if(d.catok!==undefined){e.preventDefault();e.stopImmediatePropagation();const input=document.querySelector('[data-catinput="'+CSS.escape(d.catok)+'"]');cloudSetCategory(d.catok,input.value);return;}
    if('editProduct'in d||'newProduct'in d){e.preventDefault();e.stopImmediatePropagation();productEditor(d.editProduct||'');return;}
    if('go'in d||'tk'in d||'save'in d||'rst'in d){
      e.preventDefault();e.stopImmediatePropagation();
      if('go'in d)cloudAdd();else if('tk'in d)cloudTake(Number(d.tk));else if('save'in d)cloudCreate(d.save);
      else if(cloudCanChange()){const p=P.find(p=>String(p.id)===String(d.rst));p.ov=null;recalc(p);updRes(p);render();queueNorm(p)}
    }
    // Existing prototype-only mutation paths are never allowed in shared mode.
    else if('eat'in d||'code'in d){e.preventDefault();e.stopImmediatePropagation();toast('Виберіть конкретну пачку у вікні «Взяти».');}
  },true);
  document.addEventListener('input',e=>{
    const input=e.target;
    if(input.dataset.nameProduct!==undefined){
      e.stopImmediatePropagation();const p=P.find(p=>p.id===input.dataset.nameProduct),name=input.value.trim();
      if(p&&name&&name.length<=100){p.n=name;render();queueNorm(p);}return;
    }
    if(input.dataset.ne===undefined)return;
    e.stopImmediatePropagation();
    const [id,key]=input.dataset.ne.split('|'),p=P.find(p=>String(p.id)===id);
    if(!p)return;
    let value=Number(input.value.replace(',','.'));if(!input.value.trim()||!Number.isFinite(value)||value<0||(key!=='g'&&value===0))return;
    if(p.u==='шт.'&&(key==='g'||key==='pack'))value*=1000;
    if(key==='packs'){const n=Math.max(1,Math.round(value));p.ov=n===p.calc?null:n;}else p[key]=value;
    recalc(p);updRes(p);render();queueNorm(p);
    if(input.classList.contains('ei'))input.style.width=Math.max(2,input.value.length+1)+'ch';
  },true);
  document.addEventListener('change',e=>{
    if(e.target.dataset.cat===undefined)return;
    e.stopImmediatePropagation();const select=e.target,box=select.closest('.nf-cat').querySelector('.catnew');
    if(select.value==='__new'){box.hidden=false;box.querySelector('input').focus();return}
    box.hidden=true;cloudSetCategory(select.dataset.cat,select.value);
  },true);
  document.addEventListener('focusout',e=>{if(e.target.dataset.ne!==undefined||e.target.dataset.nameProduct!==undefined)flushNorms()});
  $('#q').addEventListener('input',()=>{uiPrefs.query=$('#q').value;saveUiPrefs();});
  window.addEventListener('scroll',()=>{clearTimeout(uiScrollTimer);uiScrollTimer=setTimeout(()=>{uiPrefs.scroll[uiPrefs.tab]=window.scrollY;saveUiPrefs();},120)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)cloudRefresh();else flushNorms()});
  window.addEventListener('online',()=>cloudRefresh());
  window.addEventListener('offline',()=>{cloudOnline=false;queueStatus()});
  window.addEventListener('beforeunload',()=>{uiPrefs.scroll[uiPrefs.tab]=window.scrollY;saveUiPrefs();flushNorms()});
  setInterval(()=>{if(!document.hidden)cloudRefresh()},30000);
}
async function initConnectedState(){
  P=[];B=[];
  document.body.insertAdjacentHTML('afterbegin',`<div id="cloudBoot" class="cloud-login" role="status" hidden>Відкриваю комору…</div><section id="cloudLogin" class="cloud-login"><form id="pinForm" class="pin-card"><h1>Моя комора</h1><label for="cloudPin">PIN-код</label><input id="cloudPin" type="password" inputmode="numeric" autocomplete="off" pattern="[0-9]{4}" maxlength="4" required aria-describedby="loginError"><p id="loginError" role="status"></p><button id="loginSubmit" class="pri" type="submit">Увійти</button></form></section>`);
  $('header .wrap').insertAdjacentHTML('afterbegin',`<div class="sync-bar"><span id="syncText" role="status">Підключення…</span><button id="cloudLogout">Вийти</button></div>`);
  cloudSessionVisible(false);installCloudEvents();
  $('#pinForm').onsubmit=e=>{e.preventDefault();cloudLogin($('#cloudPin').value)};
  $('#cloudLogout').onclick=cloudLogout;
  loadQueue();
  restoreSavedSession();
}
function restoreSavedSession(){
  const pin=stored('pin');
  if(pin){
    $('#cloudLogin').hidden=true;if($('#cloudBoot'))$('#cloudBoot').hidden=false;
    try{
      const cache=JSON.parse(stored('cache')||'null');
      if(cache){cloudPin=pin;cloudApply(cache,{paint:false});cloudOnline=navigator.onLine!==false;cloudSessionVisible(true);cloudPaint(true);cloudStatus('Оновлюю дані у фоні…');}
    }catch(_){}
    cloudLogin(pin,{allowCache:true});
  }
}

// Device-only drafts and thumbnails; never store the PIN in a draft or a photo key.
const DEVICE_KEY=typeof CLOUD!=='undefined'&&CLOUD?CLOUD_KEY:'komora-demo:';
let draftRestored=false,draftWarning=false,mediaDbPromise;
function clearMobileDraft(){try{localStorage.removeItem(DEVICE_KEY+'draft')}catch(_){}}
function saveMobileDraft(extra={}){
  try{
    if($('#ov').hidden||!S.pid||!['add','batch-edit'].includes(S.mode))return;
    const draft={version:1,pid:S.pid,mode:S.mode,stage:S.stage,f:S.f?{...S.f,photoBusy:false,submitting:false}:undefined,...extra};
    if($('#catalogForm')){
      draft.catalog={code:catalogCurrent?.code||$('#sheet .bcn')?.textContent||'',result:catalogCurrent,context:catalogContext,
        values:Object.fromEntries(['catalogProduct','catalogName','catalogWeight','catalogUnit'].map(id=>[id,$('#'+id)?.value||'']))};
    }
    if(S.mode==='batch-edit')draft.edit={id:S.editBatchId,photo:S.editPhoto||'',removePhoto:!!S.removeBatchPhoto,replaceShared:!!$('#batchReplaceShared')?.checked,values:Object.fromEntries(['batchName','batchQty','batchWeight','batchAdded','batchExpiry','batchLocation','batchBarcode'].map(id=>[id,$('#'+id)?.value||'']))};
    localStorage.setItem(DEVICE_KEY+'draft',JSON.stringify(draft));
  }catch(_){if(!draftWarning){draftWarning=true;toast('Не вдалося зберегти чернетку на пристрої.')}}
}
function restoreMobileDraft(){
  if(draftRestored||!P.length)return;draftRestored=true;
  let draft;try{draft=JSON.parse(localStorage.getItem(DEVICE_KEY+'draft')||'null')}catch(_){}
  if(draft?.version!==1||!P.some(p=>String(p.id)===String(draft.pid)))return;
  if(draft.f?.batch_id&&(B.some(b=>b.id===draft.f.batch_id)||typeof cloudQueue!=='undefined'&&cloudQueue.some(entry=>entry.request.batch_id===draft.f.batch_id))){clearMobileDraft();return}
  if(draft.mode==='batch-edit'){
    if(B.some(b=>b.id===draft.edit?.id)){
      batchEditor(draft.edit.id);for(const [id,value] of Object.entries(draft.edit.values||{})){if($('#'+id))$('#'+id).value=value}
      if(draft.edit.x)$('#batchExpiry').value=draft.edit.x;if(draft.edit.loc!==undefined)$('#batchLocation').value=draft.edit.loc;
      $('#batchReplaceShared').checked=!!draft.edit.replaceShared;
      $('.shared-photo-choice').hidden=!$('#batchBarcode').value.trim();
      S.editPhoto=draft.edit.photo||'';S.removeBatchPhoto=!!draft.edit.removePhoto;
      if(S.editPhoto){$('#batchPhotoPreview').src=S.editPhoto;$('#batchPhotoPreview').hidden=false}
      else if(S.removeBatchPhoto)$('#batchPhotoPreview').hidden=true;
      saveMobileDraft();
    }
    return;
  }
  S={pid:resolveProductId(draft.pid),mode:'add',stage:draft.f?'card':'start',f:draft.f};
  if(draft.catalog){
    catalogContext={...draft.catalog.context,pid:S.pid,mode:'add',f:draft.f};
    showCatalogChoice(draft.catalog.code,draft.catalog.result,'manual');
    for(const [id,value] of Object.entries(draft.catalog.values||{})){if($('#'+id))$('#'+id).value=value}
    saveMobileDraft();
  }else drawOp();
}
function mediaDb(){
  if(!mediaDbPromise)mediaDbPromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open('komora-device-thumbnails',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('photos');
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
  return mediaDbPromise;
}
async function cachedPhoto(id){
  try{const db=await mediaDb();return await new Promise(resolve=>{const r=db.transaction('photos').objectStore('photos').get(DEVICE_KEY+id);r.onsuccess=()=>resolve(r.result?.data||'');r.onerror=()=>resolve('')})}catch(_){return ''}
}
async function cachePhoto(id,data){
  if(!id||!data)return;
  cloudPhotos.set(id,data);
  try{const db=await mediaDb();await new Promise((resolve,reject)=>{
    const tx=db.transaction('photos','readwrite'),store=tx.objectStore('photos');store.put({data,at:Date.now()},DEVICE_KEY+id);
    const all=store.getAllKeys();all.onsuccess=()=>{const keys=all.result.filter(k=>String(k).startsWith(DEVICE_KEY));for(const key of keys.slice(0,Math.max(0,keys.length-80)))if(key!==DEVICE_KEY+id)store.delete(key)};
    tx.oncomplete=resolve;tx.onabort=reject;
  })}catch(_){}
}
function barcodePhotoRef(p,code){
  if(!code)return '';
  const ids=new Set([p?.photoRefs?.[code],...B.filter(b=>b.p===p?.id&&b.code===code).map(b=>b.own_photo_file_id===undefined?b.photo_file_id:b.own_photo_file_id)].filter(Boolean));
  return ids.size===1?[...ids][0]:'';
}
async function loadAddPhoto(){
  const form=S.f,p=P.find(p=>p.id===S.pid);if(!form||form.photo||!form.code)return;
  const id=barcodePhotoRef(p,form.code);if(!id)return;
  form.photo_file_id=id;
  let photo=cloudPhotos.get(id)||await cachedPhoto(id);
  if(!photo&&typeof CLOUD!=='undefined'&&CLOUD&&cloudOnline){
    try{if(!photoJobs.has(id))photoJobs.set(id,cloudRequest({action:'photo',file_id:id}).then(r=>r.photo).finally(()=>photoJobs.delete(id)));photo=await photoJobs.get(id);await cachePhoto(id,photo)}catch(_){}
  }
  if(photo&&S.f===form&&S.mode==='add'&&!$('#ov').hidden&&!form.photo){form.photo=photo;drawOp()}
}
// Three independent reads at a time; warm thumbnails use IndexedDB without a server trip.
async function cloudLoadPhotos(){
  if(!CLOUD||!S.tp)return;
  const pin=cloudPin,pid=S.pid,files=[...new Set(S.tp.map(t=>t.photo_file_id).filter(Boolean))];
  let next=0;
  const load=async id=>{
    try{
      let photo=cloudPhotos.get(id)||await cachedPhoto(id);
      if(!photo&&cloudOnline){
        if(!photoJobs.has(id))photoJobs.set(id,cloudRequest({action:'photo',file_id:id}).then(r=>r.photo).finally(()=>photoJobs.delete(id)));
        photo=await photoJobs.get(id);
      }
      if(!photo||pin!==cloudPin)return;await cachePhoto(id,photo);
      B.filter(b=>b.photo_file_id===id).forEach(b=>b.photo=photo);
      if(S.pid!==pid||S.mode!=='take')return;
      S.tp?.filter(t=>t.photo_file_id===id).forEach(t=>t.photo=photo);
      if(!$('#ov').hidden)drawOp();
    }catch(_){}
  };
  await Promise.all(Array.from({length:Math.min(3,files.length)},async()=>{while(next<files.length)await load(files[next++])}));
}
function rememberBarcode(p,code,s){
  try{
    let list=JSON.parse(localStorage.getItem(DEVICE_KEY+'recent-codes')||'[]');
    list=[{pid:p.id,code,s,at:Date.now()},...list.filter(x=>x.code!==code)].slice(0,12);
    localStorage.setItem(DEVICE_KEY+'recent-codes',JSON.stringify(list));
  }catch(_){}
}
function recentBarcodeItems(){
  let list=[];try{list=JSON.parse(localStorage.getItem(DEVICE_KEY+'recent-codes')||'[]')}catch(_){}
  const entries=[...list,...B.slice().sort((a,b)=>(b.k||'').localeCompare(a.k||'')).filter(b=>b.code).map(b=>({pid:b.p,code:b.code,s:b.s}))];
  for(const p of P)for(const [code,s] of Object.entries(p.barcodeSizes||{}))entries.push({pid:p.id,code,s});
  const seen=new Set();return entries.filter(item=>{const p=P.find(p=>p.id===item.pid);if(!p||S.pid&&p.id!==S.pid||seen.has(item.code))return false;seen.add(item.code);return true}).slice(0,8);
}
function recentBarcodeHtml(){
  const items=recentBarcodeItems();if(!items.length)return '';
  return '<div class="recent-codes"><div class="lbl">Недавні</div>'+items.map(item=>{const p=P.find(p=>p.id===item.pid);return `<button data-recent-code="${esc(item.code)}"><b>${esc(p.names?.[item.code]||p.n)}</b><span>${size(item.s,p.u)} · ${esc(item.code)}</span></button>`}).join('')+'</div>';
}
function batchEditor(id){
  const b=B.find(b=>b.id===id),p=P.find(p=>p.id===b?.p);if(!b||!p)return;
  stopCam();S={pid:p.id,mode:'batch-edit',editBatchId:id,editPhoto:'',removeBatchPhoto:false};
  show(`<form id="batchForm"><div class="top3"><h2>Редагувати пачку</h2><button type="button" data-batch-back aria-label="Назад">✕</button></div>
    <p>${esc(p.n)}</p>${b.q>1?`<p class="sub">Партія: ${nf(b.q)} ${pk(b.q)}. Зміни стосуються всієї партії.</p>`:''}
    <label class="editor-field">Назва на упаковці<input id="batchName" maxlength="200" required value="${esc(b.name||p.n)}"></label>
    <div class="two"><label class="editor-field">Кількість пачок<input id="batchQty" type="number" min="0.000001" step="any" inputmode="decimal" required value="${b.q}"></label>
    <label class="editor-field">Пачка, ${esc(p.u)}<input id="batchWeight" type="number" min="0.000001" step="any" inputmode="decimal" required value="${b.s}"></label></div>
    <div class="two"><label class="editor-field">Дата додавання<input id="batchAdded" type="date" required value="${b.k}"></label>
    <label class="editor-field">Придатне до<input id="batchExpiry" type="date" required value="${b.x}"></label></div>
    <label class="editor-field">Де лежить<input id="batchLocation" maxlength="100" list="batchPlaces" value="${esc(b.loc||'')}"><datalist id="batchPlaces">${LOCS.map(loc=>`<option value="${esc(loc)}">`).join('')}</datalist></label>
    <label class="editor-field">Штрих-код<input id="batchBarcode" maxlength="80" value="${esc(b.code||'')}" placeholder="Не вказано"></label><button id="batchClearCode" type="button">Прибрати штрих-код</button>
    <div class="batch-photo-tools"><label class="photo-choice">Камера<input id="batchPhoto" type="file" accept="image/*" capture="environment" hidden></label><label class="photo-choice">Вибрати фото<input id="batchPhotoGallery" type="file" accept="image/*" hidden></label></div>
    <img id="batchPhotoPreview" class="batch-photo-preview" ${b.photo?`src="${b.photo}"`:'hidden'} alt="Фото пачки"><p id="batchPhotoStatus" role="status" class="scan-status"></p>
    <label class="shared-photo-choice" ${b.code?'':'hidden'}><input id="batchReplaceShared" type="checkbox">Замінити фото в усіх пачках цього штрих-коду</label>
    <button class="pri" type="submit" style="width:100%">Зберегти</button></form>`);
  $('#batchClearCode').onclick=()=>{$('#batchBarcode').value='';$('#batchReplaceShared').checked=false;$('.shared-photo-choice').hidden=true;saveMobileDraft()};
  $('#batchBarcode').oninput=()=>{$('.shared-photo-choice').hidden=!$('#batchBarcode').value.trim()};
  const form=$('#batchForm');
  const attach=async file=>{
    if(!file)return;if(file.size>25*1024*1024){toast('Фото завелике. Виберіть файл до 25 МБ.');return}
    const session=S;session.photoBusy=true;$('#batchPhotoStatus').textContent='Стискаю фото…';saveMobileDraft();let bitmap,url;
    try{
      if(typeof createImageBitmap==='function'){try{bitmap=await createImageBitmap(file,{resizeWidth:400,resizeQuality:'medium',imageOrientation:'from-image'})}catch(_){}}
      if(!bitmap){url=URL.createObjectURL(file);bitmap=new Image();bitmap.src=url;await bitmap.decode()}
      const photo=compactPhoto(bitmap);if(S!==session||$('#batchForm')!==form)return;
      S.editPhoto=photo;S.removeBatchPhoto=false;$('#batchPhotoPreview').src=photo;$('#batchPhotoPreview').hidden=false;$('#batchPhotoStatus').textContent='';saveMobileDraft();
    }catch(_){if(S===session)$('#batchPhotoStatus').textContent='Не вдалося відкрити фото.'}
    finally{session.photoBusy=false;bitmap?.close?.();if(url){bitmap.src='';URL.revokeObjectURL(url)}}
  };
  $('#batchPhoto').onchange=e=>attach(e.target.files?.[0]);$('#batchPhotoGallery').onchange=e=>attach(e.target.files?.[0]);
  $('#batchForm').onsubmit=async e=>{
    e.preventDefault();if(S.photoBusy){toast('Фото ще стискається. Зачекайте мить.');return}if(S.submitting)return;
    const expiry=$('#batchExpiry').value,loc=$('#batchLocation').value.trim(),name=$('#batchName').value.trim(),qty=Number($('#batchQty').value.replace(',','.')),weight=Number($('#batchWeight').value.replace(',','.')),added=$('#batchAdded').value,code=$('#batchBarcode').value.trim();
    if(!expiry||!added||!name||!(qty>0)||!(weight>0)){toast('Перевірте поля партії.');return}
    const current=B.find(item=>item.id===id);if(!current){toast('Цієї партії вже немає.');return}
    if(CLOUD&&S.editPhoto&&code&&!cloudLast?.features?.includes('safe_barcode_photos')){toast('Оновіть Apps Script для заміни фото без перезапису інших пачок.');return}
    const session=S;session.submitting=true;
    if(CLOUD){const accepted=await cloudMutate({action:'edit',product_id:p.id,batch_id:id,packs_qty:qty,pack_weight_kg:weight,pack_name:name,added_date:added,expiry_date:expiry,is_estimated_expiry:expiry===current.x?!!current.estimated:false,storage_location:loc,barcode:code,photo_base64:S.editPhoto||undefined,remove_photo:!!S.removeBatchPhoto,replace_barcode_photo:$('#batchReplaceShared').checked},{message:'Пачку оновлено',enqueued(){clearMobileDraft();opSheet(p.id,'take')}});if(!accepted)session.submitting=false;}
    else{Object.assign(current,{q:qty,s:weight,name,k:added,x:expiry,loc,code,estimated:false,...(S.editPhoto?{photo:S.editPhoto}:{}),...(S.removeBatchPhoto?{photo:''}:{})});clearMobileDraft();render();opSheet(p.id,'take')}
  };
  saveMobileDraft();
}
const originalDrawOp=drawOp;
drawOp=function(){
  originalDrawOp();
  if(S.mode==='add'&&S.f){
    if(S.f.photoBusy)$('#sheet').insertAdjacentHTML('beforeend','<p class="scan-status" role="status">Стискаю фото…</p>');
    if(S.f.code&&!S.f.photo&&!S.f.photoBusy)loadAddPhoto();
  }
  saveMobileDraft();
};
const originalCloudPaint=cloudPaint;
cloudPaint=function(...args){originalCloudPaint(...args);restoreMobileDraft()};

// Expiry is attached to a batch, independently of its stock norm or category.
function render(){
  persistState();const q=$('#q').value.trim().toLocaleLowerCase('uk'),expired=filterSt.has('expired');
  let items=P.map(p=>({p,i:info(p)}));items.forEach(item=>item.i.expired=item.i.bs.some(b=>daysTo(b.x)<0));
  const count=Object.fromEntries(['low','excess','expired'].map(k=>[k,items.filter(item=>item.i[k]).length]));
  const cats=CATS.filter(c=>items.some(item=>item.p.cat===c&&(!expired||item.i.expired)));
  $('#chips').innerHTML=`<button data-f="all" aria-pressed="${!filterCat&&!filterSt.size}">Усі</button>`+
    cats.map(c=>`<button data-fc="${esc(c)}" aria-pressed="${filterCat===c}">${esc(c)}</button>`).join('')+
    '<span class="sep"></span>'+[['low','Закінчується'],['excess','Зайве'],['expired','Прострочене']].map(([k,t])=>`<button data-fs2="${k}" aria-pressed="${filterSt.has(k)}">${t}<b>${count[k]}</b></button>`).join('');
  items=items.filter(({p,i})=>(!q||p.n.toLocaleLowerCase('uk').includes(q))&&(!filterCat||p.cat===filterCat)&&[...filterSt].every(k=>i[k]));
  items.sort((a,b)=>a.p.n.localeCompare(b.p.n,'uk'));
  $('#list').innerHTML=items.map(({p,i})=>{
    const expiredPacks=i.bs.filter(b=>daysTo(b.x)<0).reduce((sum,b)=>sum+b.q,0),slots=Math.max(p.normP,i.n);
    const pills=Array.from({length:slots},(_,k)=>`<span class="pl ${k>=i.n?'e':k>=p.normP?'x':''} ${k<expiredPacks?'expired-pill':''}"></span>`).join('');
    const months=i.total/(p.use*p.people),sub=!i.total?'немає в коморі':p.use===0?'Витрату не задано':`~${String(+months.toFixed(1)).replace('.',',')} міс. / ${p.people} ос.`;
    return `<article class="card ${i.expired?'has-expired':''}"><div class="cl"><div class="ch"><span class="ico">${productEmoji(p)}</span><div class="chm"><div class="chr"><div class="nm"><button class="name-edit" data-edit-product="${p.id}" aria-label="Редагувати продукт ${esc(p.n)}">${esc(p.n)}<span aria-hidden="true">✎</span></button></div><div class="sup">${sub}</div></div>${i.locs.length?`<div class="loc">${i.locs.map(esc).join(' · ')}</div>`:''}</div></div><div class="pills">${pills}</div></div><div class="qb"><button class="qa" data-op="add|${p.id}" aria-label="Додати"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button><button class="qt" data-op="take|${p.id}" aria-label="Взяти"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg></button></div></article>`;
  }).join('')||'<div class="empty">Нічого не знайдено</div>';
}
const originalDrawTake=drawTake;
drawTake=function(p,i){
  shareBarcodePhotos(P,B,S.tp||[],p.id);
  originalDrawTake(p,i);
  document.querySelectorAll('.pc[data-tk]').forEach(card=>{
    const tile=S.tp[Number(card.dataset.tk)],expired=daysTo(tile.x)<0;
    card.classList.toggle('expired',expired);card.tabIndex=0;card.setAttribute('role','button');
    card.setAttribute('aria-label',`${tile.name||p.n}, ${size(tile.s,p.u)}, ${expired?'прострочено, ':''}${tile.x}${tile.loc?', '+tile.loc:''}`);
    card.title='Утримуйте або натисніть правою кнопкою для редагування';
    if(expired)card.insertAdjacentHTML('beforeend','<span class="expired-badge">Прострочено</span>');
  });
};
let holdTimer,holdStart,suppressTakeUntil=0;
function cancelHold(){clearTimeout(holdTimer);holdTimer=null}
document.addEventListener('pointerdown',e=>{
  const card=e.target.closest('.pc[data-tk]');if(!card||e.target.closest('button')||e.button!==0)return;
  const tile=S.tp?.[Number(card.dataset.tk)];if(!tile?.id||tile.done)return;
  holdStart={x:e.clientX,y:e.clientY};cancelHold();holdTimer=setTimeout(()=>{suppressTakeUntil=Date.now()+1200;batchEditor(tile.id)},550);
});
document.addEventListener('pointermove',e=>{if(holdStart&&Math.hypot(e.clientX-holdStart.x,e.clientY-holdStart.y)>10)cancelHold()},{passive:true});
for(const name of ['pointerup','pointercancel','scroll'])document.addEventListener(name,cancelHold,{passive:true,capture:true});
document.addEventListener('contextmenu',e=>{
  const card=e.target.closest('.pc[data-tk]');if(!card)return;e.preventDefault();cancelHold();const tile=S.tp?.[Number(card.dataset.tk)];if(tile?.id&&!tile.done){suppressTakeUntil=Date.now()+1200;batchEditor(tile.id)}
});
document.addEventListener('click',e=>{
  const card=e.target.closest('.pc[data-tk]');
  if(card&&Date.now()<suppressTakeUntil){e.preventDefault();e.stopImmediatePropagation();return}
  const recent=e.target.closest('[data-recent-code]');
  if(recent){e.preventDefault();e.stopImmediatePropagation();lookup(recent.dataset.recentCode);return}
  if(e.target.closest('[data-batch-back]')){clearMobileDraft();opSheet(S.pid,'take');return}
  saveMobileDraft();
},true);
document.addEventListener('keydown',e=>{
  const card=e.target.closest('.pc[data-tk]');if(!card||e.target.closest('button'))return;
  if(e.key==='F10'&&e.shiftKey||e.key.toLowerCase()==='e'){e.preventDefault();batchEditor(S.tp[Number(card.dataset.tk)].id)}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click()}
});
for(const name of ['input','change'])document.addEventListener(name,()=>saveMobileDraft());
window.addEventListener('pagehide',()=>saveMobileDraft());
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveMobileDraft()});

initLocalState();

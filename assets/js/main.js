/*! Мебель Анри — скрипты сайта. Разработка: студия Сайтика */
document.documentElement.classList.add('js');
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const fmt=n=>Math.round(n).toLocaleString('ru-RU').replace(/,/g,' ')+' ₽';
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  const motionOK=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePtr=matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* split headings into words (keeps <em>) */
  function splitWords(el){
    let i=0;
    (function walk(node){
      [...node.childNodes].forEach(n=>{
        if(n.nodeType===3){
          const frag=document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part=>{
            if(!part)return;
            if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(' '));return}
            const w=document.createElement('span');w.className='w';
            const s=document.createElement('span');s.textContent=part;s.style.setProperty('--i',i++);
            w.appendChild(s);frag.appendChild(w);
          });
          n.replaceWith(frag);
        }else if(n.nodeType===1)walk(n);
      });
    })(el);
  }
  if(motionOK){$$('h1.split, main h2').forEach(h=>{h.classList.add('split');splitWords(h)})}

  /* intro doors (once per visit) */
  let heroDelay=0;
  let seen=false;try{seen=sessionStorage.getItem('anri_intro')==='1'}catch(e){}
  if(motionOK&&!seen){
    const intro=$('#intro');intro.hidden=false;heroDelay=1150;
    try{sessionStorage.setItem('anri_intro','1')}catch(e){}
    setTimeout(()=>intro.classList.add('open'),650);
    setTimeout(()=>intro.remove(),2100);
  }else{const i=$('#intro');i&&i.remove()}

  /* hero sequence */
  if(motionOK){
    const h1=$('.hero h1'),media=$('.hero-media');
    h1.style.setProperty('--d',heroDelay+'ms');media.style.setProperty('--d',(heroDelay+150)+'ms');
    h1.classList.add('go');media.classList.add('go');
    setTimeout(()=>$$('[data-count]').forEach(el=>{
      const to=+el.dataset.count,t0=performance.now(),dur=1600;
      (function tick(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=Math.round(to*e).toLocaleString('ru-RU').replace(/,/g,' ');if(k<1)requestAnimationFrame(tick)})(t0);
    }),heroDelay+400);
  }

  /* reveal headings & images on scroll */
  if(motionOK&&'IntersectionObserver' in window){
    $$('.dir, .iris-stage, .show-grid .ph, .review-grid, .calc-media, .g-item').forEach(el=>el.classList.add('img-rv'));
    const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('go');e.target.classList.remove('pre');io2.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});
    $$('main h2.split, .img-rv').forEach(el=>{
      if(el.getBoundingClientRect().top>innerHeight){if(el.classList.contains('img-rv'))el.classList.add('pre');io2.observe(el)}
    });
  }

  /* scroll: progress + hero parallax */
  const prog=$('#prog'),heroMain=$('.hero-media .main');let ticking=false;
  function onScroll(){
    const h=document.documentElement,max=h.scrollHeight-innerHeight;
    prog.style.transform='scaleX('+(max>0?scrollY/max:0)+')';
    if(motionOK&&scrollY<innerHeight*1.2)heroMain.style.transform='translateY('+(scrollY*0.12)+'px)';
    ticking=false;
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();

  /* desktop: cursor ring, magnetic buttons, tilt */
  if(finePtr&&motionOK){
    const cur=$('#cursor');let mx=-100,my=-100,cx=-100,cy=-100;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.classList.add('on')},{passive:true});
    document.addEventListener('mouseleave',()=>cur.classList.remove('on'));
    (function loop(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;cur.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(loop)})();
    $$('.g-item, .iris-stage, .dir, .rv-tile').forEach(el=>{el.addEventListener('mouseenter',()=>cur.classList.add('big'));el.addEventListener('mouseleave',()=>cur.classList.remove('big'))});
    $$('.btn').forEach(b=>{
      b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});
      b.addEventListener('mouseleave',()=>b.style.transform='');
    });
    $$('.g-item, .dir').forEach(el=>{
      el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateY('+(x*7)+'deg) rotateX('+(-y*7)+'deg)'});
      el.addEventListener('mouseleave',()=>el.style.transform='');
    });
  }

  /* reveal: content visible at rest; only elements below the fold get a gentle entrance */
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
    $$('.rv').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pre');io.observe(el)}});
    setTimeout(()=>$$('.rv.pre').forEach(el=>{if(el.getBoundingClientRect().top<innerHeight)el.classList.remove('pre')}),1200);
  }

  /* Iris thumbs */
  const main=$('#irisMain');
  $$('.thumbs button').forEach(b=>b.addEventListener('click',()=>{
    $$('.thumbs button').forEach(x=>x.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');
    main.style.opacity=0;
    setTimeout(()=>{main.src=b.dataset.src;main.alt=b.dataset.alt;main.style.opacity=1},180);
  }));

  /* calculator */
  const len=$('#len'),out=$('#lenOut'),total=$('#total');
  function calc(){const v=parseFloat(len.value);out.textContent=v.toFixed(1).replace('.',',')+' м';total.textContent=fmt(v*45000)}
  len.addEventListener('input',calc);calc();
  $('#calcCta').addEventListener('click',()=>{
    const shape=$('input[name=shape]:checked').value;
    $('#fWhat').value='Кухня на заказ';
    $('#fMsg').value='Кухня '+shape+', длина '+out.textContent+', ориентир '+total.textContent;
  });
  $$('[data-interest]').forEach(a=>a.addEventListener('click',()=>{$('#fWhat').value=a.dataset.interest}));

  /* gallery filter + lightbox */
  const items=$$('#gallery .g-item');
  $$('.filters button').forEach(b=>b.addEventListener('click',()=>{
    $$('.filters button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');
    items.forEach(it=>it.hidden=!(b.dataset.f==='all'||it.dataset.c===b.dataset.f));
  }));
  const lb=$('#lb'),lbImg=$('#lbImg'),lbCap=$('#lbCap'),lbCount=$('#lbCount');
  let list=[],idx=0,lastFocus=null;
  function show(){const it=list[idx];lbImg.src=it.src;lbImg.alt=it.alt;lbCap.textContent=it.cap;lbCount.textContent=(idx+1)+' / '+list.length}
  function open(arr,i){list=arr;idx=i;lastFocus=document.activeElement;show();lb.hidden=false;document.body.style.overflow='hidden';$('#lbClose').focus()}
  function close(){lb.hidden=true;document.body.style.overflow='';lastFocus&&lastFocus.focus()}
  items.forEach(it=>{it.tabIndex=0;it.setAttribute('role','button');
    const go=()=>{const vis=items.filter(x=>!x.hidden).map(x=>({src:x.querySelector('img').src,alt:x.querySelector('img').alt,cap:x.querySelector('figcaption').textContent}));
      open(vis,items.filter(x=>!x.hidden).indexOf(it))};
    it.addEventListener('click',go);it.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
  });
  $('#irisZoom').addEventListener('click',()=>{const t=$$('.thumbs button');open(t.map(b=>({src:b.dataset.src,alt:b.dataset.alt,cap:b.dataset.alt})),t.findIndex(b=>b.getAttribute('aria-pressed')==='true'))});
  const tiles=$$('.rv-tile');tiles.forEach((t,i)=>t.addEventListener('click',()=>open(tiles.map(x=>({src:x.querySelector('img').src,alt:x.querySelector('img').alt,cap:x.dataset.cap})),i)));
  $('#lbClose').onclick=close;
  $('#lbPrev').onclick=()=>{idx=(idx-1+list.length)%list.length;show()};
  $('#lbNext').onclick=()=>{idx=(idx+1)%list.length;show()};
  lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb-img'))close()});
  let tx=null;lb.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
  lb.addEventListener('touchend',e=>{if(tx===null)return;const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)(d<0?$('#lbNext'):$('#lbPrev')).click();tx=null});
  document.addEventListener('keydown',e=>{
    if(!lb.hidden){if(e.key==='Escape')close();if(e.key==='ArrowRight')$('#lbNext').click();if(e.key==='ArrowLeft')$('#lbPrev').click()}
    if(!legal.hidden&&e.key==='Escape'){closeLegal();e.stopImmediatePropagation()}
  });

  /* legal modal */
  const legal=$('#legal'),body=$('#legalBody');let legalFocus=null;
  function tab(name){$$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===name));body.innerHTML=$('#doc-'+name).innerHTML;body.scrollTop=0;body.setAttribute('aria-labelledby','t-'+name)}
  function openLegal(name){legalFocus=document.activeElement;tab(name);legal.hidden=false;document.body.style.overflow='hidden';$('#legalClose').focus()}
  function closeLegal(){legal.hidden=true;document.body.style.overflow='';legalFocus&&legalFocus.focus()}
  $$('[data-legal]').forEach(b=>b.addEventListener('click',()=>openLegal(b.dataset.legal)));
  $$('.tabs button').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
  $('#legalClose').onclick=closeLegal;
  legal.addEventListener('click',e=>{if(e.target===legal)closeLegal()});

  /* cookie */
  const ck=$('#cookie');
  if(!store.get('anri_cookie'))ck.hidden=false;
  $('#cookieAll').onclick=()=>{store.set('anri_cookie','all');ck.hidden=true};
  $('#cookieMin').onclick=()=>{store.set('anri_cookie','min');ck.hidden=true};

  /* phone mask + form */
  const ph=$('#fPhone');
  [[ph,'#phoneErr'],[$('#qPhone'),'#qPhoneErr']].forEach(([inp,err])=>inp.addEventListener('input',()=>{
    let d=inp.value.replace(/\D/g,'');if(d.startsWith('8'))d='7'+d.slice(1);if(d&&!d.startsWith('7'))d='7'+d;d=d.slice(0,11);
    let r='';if(d.length>0)r='+7';if(d.length>1)r+=' ('+d.slice(1,4);if(d.length>=4)r+=')';if(d.length>4)r+=' '+d.slice(4,7);if(d.length>7)r+='-'+d.slice(7,9);if(d.length>9)r+='-'+d.slice(9,11);
    inp.value=r;$(err).hidden=true;
  }));
  /* quiz */
  const quiz=$('#quiz'),qf=$('#quizForm'),qBar=$('#qBar'),qBack=$('#qBack'),qNext=$('#qNext'),qNav=$('#qNav');
  let step=1,quizFocus=null;
  function qRender(){
    $$('.q-step',qf).forEach(s=>s.hidden=+s.dataset.step!==step);
    qBar.style.width=Math.min(step,4)*25+'%';
    qBack.style.visibility=step>1&&step<5?'visible':'hidden';
    qNav.hidden=step===5;
    qNext.textContent=step===4?'Получить расчёт':'Далее';
    qNext.disabled=step<4&&!qf.querySelector('input[name=q'+step+']:checked');
    qNext.style.opacity=qNext.disabled?.45:1;
  }
  function openQuiz(){quizFocus=document.activeElement;step=1;qRender();quiz.hidden=false;document.body.style.overflow='hidden';$('#quizClose').focus()}
  function closeQuiz(){quiz.hidden=true;document.body.style.overflow='';quizFocus&&quizFocus.focus()}
  $$('[data-quiz]').forEach(b=>b.addEventListener('click',openQuiz));
  $('#quizClose').onclick=closeQuiz;
  quiz.addEventListener('click',e=>{if(e.target===quiz)closeQuiz()});
  document.addEventListener('keydown',e=>{if(!quiz.hidden&&e.key==='Escape'&&legal.hidden)closeQuiz()});
  qf.addEventListener('change',e=>{
    if(e.target.name&&/^q[123]$/.test(e.target.name)){qRender();setTimeout(()=>{if(step<4){step++;qRender()}},260)}
  });
  qBack.onclick=()=>{if(step>1){step--;qRender()}};
  qf.addEventListener('submit',e=>{
    e.preventDefault();
    if(step<4){if(!qNext.disabled){step++;qRender()}return}
    const qp=$('#qPhone'),okP=qp.value.replace(/\D/g,'').length===11,okA=$('#qAgree').checked;
    $('#qPhoneErr').hidden=okP;$('#qAgreeErr').hidden=okA;
    if(!okP){qp.focus();return}if(!okA)return;
    const v=n=>(qf.querySelector('input[name='+n+']:checked')||{}).value||'—';
    $('#qSummary').textContent=v('q1')+' · '+v('q2')+' · '+v('q3')+' · связь: '+v('q4');
    step=5;qRender();
  });

  $('#leadForm').addEventListener('submit',e=>{
    e.preventDefault();
    const okPhone=ph.value.replace(/\D/g,'').length===11, okAgree=$('#fAgree').checked;
    $('#phoneErr').hidden=okPhone;$('#agreeErr').hidden=okAgree;
    if(!okPhone){ph.focus();return}
    if(!okAgree)return;
    $('#formFields').hidden=true;$('#formOk').hidden=false;
  });
})();

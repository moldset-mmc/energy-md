'use strict';
(() => {
  const assetRoot = new URL('.', document.currentScript.src);
  const requested = new URLSearchParams(location.search).get('lang');
  let remembered;
  try { remembered = localStorage.getItem('energy-md-language'); } catch {}
  const lang = ['ru', 'ro'].includes(requested) ? requested : remembered === 'ro' ? 'ro' : 'ru';
  window.ENERGY_LANG = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('energy-md-language', lang); } catch {}
  const shell = {
    'К содержимому':'La conținut','Energy MD — главная':'Energy MD — acasă',
    'АТЛАС КОМПАНИЙ':'ATLASUL COMPANIILOR','Главная навигация':'Navigație principală',
    'Компании':'Companii','Направления':'Sectoare','Дневной приоритет':'Prioritate diurnă',
    'Реестр ASP':'Registrul ASP','Поиск и вопросы':'Căutare și întrebări','Методика':'Metodologie',
    'Источники и документы':'Surse și documente','Документы':'Documente',
    'Загружаем атлас компаний…':'Se încarcă atlasul companiilor…',
    'Предприятия и организации Республики Молдова.':'Întreprinderi și organizații din Republica Moldova.',
    'Проверка 17.10.2026 · ASP и CNED.':'Verificare 17.10.2026 · ASP și CNED.',
    'Источники ↗':'Surse ↗','Потребление CNED ↗':'Consum CNED ↗',
    'Кандидаты для проверки.':'Candidați pentru verificare.',
    'Потребление не подтверждено счетами.':'Consumul nu este confirmat prin facturi.',
    'Меню':'Meniu','Меню ☰':'Meniu ☰','Язык сайта':'Limba site-ului',
    'Атлас предприятий Молдовы: направления, источники, контакты и вопросы для поиска потребителей электроэнергии от 30 000 MDL в месяц.':'Atlasul întreprinderilor din Moldova: sectoare, surse, contacte și întrebări pentru identificarea consumatorilor de electricitate de la 30 000 MDL pe lună.'
  };
  if (lang === 'ro') {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for(let node; (node=walker.nextNode());) {
      const key=node.nodeValue.trim();
      if(shell[key])node.nodeValue=node.nodeValue.replace(key,shell[key]);
    }
    document.querySelectorAll('[aria-label],meta[name="description"]').forEach(el=>{
      for(const attribute of ['aria-label','content']) {
        const value=el.getAttribute(attribute);
        if(shell[value])el.setAttribute(attribute,shell[value]);
      }
    });
  }
  const menu=document.querySelector('.menu-toggle');
  menu.addEventListener('click',()=>{
    const open=menu.getAttribute('aria-expanded')!=='true';
    menu.setAttribute('aria-expanded',String(open));
    document.querySelector('.site-header').classList.toggle('menu-open',open);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){
      menu.click();menu.focus();
    }
  });
  const localizeLinks=()=>document.querySelectorAll('a[href]').forEach(a=>{
    const raw=a.getAttribute('href');
    if(!raw||raw.startsWith('#')||a.hasAttribute('download'))return;
    const url=new URL(raw,location.href);
    if(url.origin===location.origin&&url.pathname.startsWith(assetRoot.pathname)&&!url.pathname.includes('/files/')&&!/\.[a-z0-9]+$/i.test(url.pathname)){
      url.searchParams.set('lang',lang);
      if(a.href!==url.href)a.href=url.href;
    }
  });
  localizeLinks();
  new MutationObserver(localizeLinks).observe(document.querySelector('#main'),{childList:true,subtree:true});
  document.querySelectorAll('[data-language]').forEach(button=>{
    const target=button.dataset.language;
    button.setAttribute('aria-pressed',String(target===lang));
    button.addEventListener('click',()=>{
      if(target===lang)return;
      const state={path:location.pathname,fields:{}};
      document.querySelectorAll('main input[id],main select[id],main textarea[id]').forEach(el=>{
        state.fields[el.id]={value:el.value,checked:el.checked};
      });
      const prompt=document.querySelector('#prompt-text');
      state.edited=prompt&&prompt.value!==prompt.dataset.generated;
      if(state.fields['research-lang']?.value===lang)state.fields['research-lang'].value=target;
      try {sessionStorage.setItem('energy-md-ui-state',JSON.stringify(state));}catch{}
      const url=new URL(location.href);url.searchParams.set('lang',target);location.assign(url.href);
    });
  });
  window.energyReady=()=>{
    let state;
    try {state=JSON.parse(sessionStorage.getItem('energy-md-ui-state')||'null');sessionStorage.removeItem('energy-md-ui-state');}catch{}
    if(state?.path===location.pathname){
      for(const [id,saved] of Object.entries(state.fields)){
        const el=document.getElementById(id);
        if(el&&id!=='prompt-text'){el.value=saved.value;el.checked=saved.checked;}
      }
      const prompt=document.querySelector('#prompt-text');
      if(state.edited&&prompt)prompt.value=state.fields['prompt-text'].value;
      const trigger=document.querySelector('#research-company')||document.querySelector('#q')||document.querySelector('#directory-q');
      trigger?.dispatchEvent(new Event(trigger.tagName==='SELECT'?'change':'input',{bubbles:true}));
    }
    localizeLinks();
  };
  function load(file){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(file,assetRoot).href;script.onload=resolve;script.onerror=reject;document.head.append(script);});}
  load('prompts.js').then(()=>load(lang==='ro'?'app.ro.js':'app.js')).catch(()=>{
    document.querySelector('.loading').textContent=lang==='ro'?'Încărcarea a eșuat. Reîncărcați pagina.':'Загрузка не удалась. Обновите страницу.';
  });
})();

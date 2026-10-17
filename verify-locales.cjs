const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=process.argv[2]||'dist',base=root==='pages-build'?'/energy-md':'';
const datasets={ru:JSON.parse(fs.readFileSync(root+'/data.json')),ro:JSON.parse(fs.readFileSync(root+'/data.ro.json'))};
let fragments=0,prompts=0;
for(const locale of ['ru','ro']){
 let csvBlob;class TestURL extends URL {static createObjectURL(blob){csvBlob=blob;return 'blob:test';} static revokeObjectURL(){}}
 const fields={};for(const id of ['q','sector-filter','priority-filter','day-filter','sort-filter','finance-only','wave-only','saved-only','result-count','export-csv','company-results','toast','research-company','research-sector','research-task','research-lang','research-sources','research-extra','prompt-text','prompt-status','search-shortcuts','build-prompt','copy-prompt'])fields['#'+id]={value:'',checked:false,dataset:{},innerHTML:'',textContent:'',listeners:{},addEventListener(event,callback){this.listeners[event]=callback;},classList:{add(){},remove(){}}};
 const ctx=vm.createContext({window:{ENERGY_LANG:locale},document:{querySelector:s=>fields[s],querySelectorAll:()=>[],createElement:()=>({click(){},remove(){}}),body:{append(){}}},location:{pathname:base+'/research/',search:''},history:{replaceState(){}},URL:TestURL,URLSearchParams,Blob,console,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return '[]';}}});
 vm.runInContext(fs.readFileSync(root+'/prompts.js','utf8'),ctx);
 vm.runInContext(fs.readFileSync(root+(locale==='ro'?'/app.ro.js':'/app.js'),'utf8').replace(/start\(\);\s*$/,''),ctx);
 vm.runInContext('DATASETS='+JSON.stringify(datasets)+';DATA=DATASETS[UI_LANG];',ctx);
 const run=code=>vm.runInContext(code,ctx);
 fields['#research-sources'].value='both';run('initResearch()');
 assert.equal(fields['#research-lang'].value,locale);
 for(const company of datasets[locale].companies){
  const html=run(`companyPage(getCompany('${company.id}'))`);assert(!html.includes('undefined'));if(locale==='ro')assert(!/[А-Яа-яЁё]/.test(html),company.id);fragments++;
  for(const task of ['full','expand','finance','contact','load','interview'])for(const lang of ['ru','ro','both']){
   fields['#research-company'].value=company.id;fields['#research-task'].value=task;fields['#research-lang'].value=lang;
   const prompt=run('makePrompt()');assert(prompt.includes('30 000 MDL'));assert(!prompt.includes('undefined'));
   if(lang==='ro'){assert(!/[А-Яа-яЁё]/.test(prompt),company.id+' / '+task);assert(prompt.includes('Răspunde în română'));}
   if(lang==='ru')assert(prompt.includes('Ответ дай по-русски'));
   if(lang==='both')assert(prompt.includes('Ответ дай по-русски')&&prompt.includes('Răspunde în română'));
   assert(prompt.includes(datasets[lang==='ro'?'ro':'ru'].companies.find(c=>c.id===company.id).name));prompts++;
  }
 }
 const htmls=['home','catalog','sectors','wave','research','method','sources','universeIntro'].map(f=>run(f+'()'));
 run('exportCSV()');assert(csvBlob instanceof Blob);csvBlob.text().then(csv=>{assert(csv.includes(locale==='ro'?'Companie':'Компания'));if(locale==='ro')assert(!/[А-Яа-яЁё]/.test(csv));});
 for(const s of datasets[locale].sectors)htmls.push(run(`sectorPage(DATA.sectors.find(s=>s.id==='${s.id}'))`));
 for(const type of ['registry','public'])htmls.push(run(`directoryPageHTML('${type}')`));
 for(const html of htmls){assert(!html.includes('undefined'));if(locale==='ro')assert(!/[А-Яа-яЁё]/.test(html),'Untranslated page');for(const m of html.matchAll(/href="([^"#?]+)[^"]*"/g))if(m[1].startsWith('/'))assert(fs.existsSync(path.join(root,m[1].replace(base,''))),'Missing '+m[1]);fragments++;}
 fields['#research-company'].value='E01';fields['#research-task'].value='full';fields['#research-lang'].value='ru';run('buildPrompt()');
 fields['#research-lang'].value='ro';fields['#research-lang'].listeners.change();assert(fields['#prompt-text'].value.startsWith('Sarcină:'));
 fields['#prompt-text'].value='MY CUSTOM DRAFT';fields['#research-lang'].value='ru';fields['#research-lang'].listeners.change();assert.equal(fields['#prompt-text'].value,'MY CUSTOM DRAFT');assert(fields['#prompt-status'].textContent.includes(locale==='ru'?'Настройки изменены':'Setările s-au schimbat'));
 run('buildPrompt()');assert(fields['#prompt-text'].value.startsWith('Задача:'));
 for(const source of ['ro','ru','both','all']){fields['#research-sources'].value=source;run('buildSearchLinks()');const urls=[...fields['#search-shortcuts'].innerHTML.matchAll(/href="([^"]+)"/g)].map(x=>new URL(x[1]).searchParams.get('q'));assert.equal(urls.length,{ro:2,ru:2,both:4,all:6}[source]);if(source==='ro')assert(urls.every(x=>!/[А-Яа-яЁё]/.test(x)));if(source==='ru')assert(urls.every(x=>/Молдова/.test(x)));}
 fields['#sort-filter'].value='day';fields['#q'].value='mobila';run('filterCatalog()');const without=run('filtered.length');fields['#q'].value='mobilă';run('filterCatalog()');assert.equal(run('filtered.length'),without);assert(without>0);
 run('exportCSV()');assert(csvBlob instanceof Blob);csvBlob.text().then(csv=>{assert(csv.includes(locale==='ro'?'Companie':'Компания'));if(locale==='ro')assert(!/[А-Яа-яЁё]/.test(csv));});
 for(const s of datasets[locale].sectors){fields['#q'].value='';fields['#sector-filter'].value=s.id;run('filterCatalog()');assert.equal(run('filtered.length'),s.count);}
}
function checkFacts(ru,ro,key=''){
 if(Array.isArray(ru)){assert.equal(ru.length,ro.length);ru.forEach((v,i)=>checkFacts(v,ro[i],key));}
 else if(ru&&typeof ru==='object'){assert.deepEqual(Object.keys(ru),Object.keys(ro));for(const k of Object.keys(ru))checkFacts(ru[k],ro[k],k);}
 else if(typeof ru!=='string'||!/[А-Яа-яЁё]/.test(ru))assert.equal(ru,ro,'Changed fact '+key);
 else {assert(!/[А-Яа-яЁё]/.test(ro),'Untranslated '+key);assert.deepEqual((ru.match(/\d+(?:[.,:]\d+)*/g)||[]).sort(),(ro.match(/\d+(?:[.,:]\d+)*/g)||[]).sort(),'Changed numbers '+key);}
}
checkFacts(datasets.ru,datasets.ro);
console.log(JSON.stringify({passed:true,root,languages:2,renderedFragments:fragments,companyTaskLanguageCombinations:prompts,checks:['translated content','IDs/numbers/source parity','all sector filters','diacritic-insensitive search','live query language changes','manual draft preservation','source-language search links','internal links']}));

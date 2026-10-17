const fs=require('fs'), vm=require('vm'), assert=require('assert'), path=require('path');
const data=JSON.parse(fs.readFileSync('dist/data.json','utf8'));
const fields={};let clipboard='';let exported=null;
const document={querySelector:s=>fields[s],querySelectorAll:()=>[],createElement:()=>({click(){},remove(){},select(){},style:{}}),body:{append(){}},addEventListener(){}};
const context=vm.createContext({window:{ENERGY_LANG:'ru'},document,location:{pathname:'/catalog/',search:''},history:{replaceState(){}},URL,URLSearchParams,Blob,console,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return '[]'},setItem(){}},navigator:{clipboard:{async writeText(s){clipboard=s;}}}});
vm.runInContext(fs.readFileSync('dist/prompts.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/app.js','utf8').replace(/start\(\);\s*$/,''),context);
vm.runInContext('DATA='+JSON.stringify(data)+';DATASETS={ru:DATA,ro:'+fs.readFileSync('dist/data.ro.json','utf8')+'};',context);
const run=s=>vm.runInContext(s,context);
function field(value=''){return {value,dataset:{},checked:false,innerHTML:'',disabled:false,classList:{add(){},remove(){}}};}
for(const id of ['q','sector-filter','priority-filter','day-filter','sort-filter','finance-only','wave-only','saved-only','result-count','export-csv','company-results','toast','research-company','research-sector','research-task','research-lang','research-sources','prompt-status','research-extra','prompt-text','search-shortcuts']) fields['#'+id]=field();
fields['#research-lang'].value='ru';fields['#research-sources'].value='both';fields['#research-lang'].selectedOptions=[{text:'Русский и румынский'}];fields['#sort-filter'].value='id';
run('filterCatalog()');assert.equal(run('filtered.length'),data.companies.length);
fields['#finance-only'].checked=true;run('filterCatalog()');assert.equal(run('filtered.length'),25);
fields['#wave-only'].checked=true;run('filterCatalog()');assert.equal(run('filtered.length'),data.companies.filter(c=>c.wave&&c.finance).length);
fields['#finance-only'].checked=false;run('filterCatalog()');assert.equal(run('filtered.length'),20);
fields['#wave-only'].checked=false;
for(const sector of data.sectors){fields['#sector-filter'].value=sector.id;run('filterCatalog()');assert.equal(run('filtered.length'),sector.count);}
fields['#sector-filter'].value='';fields['#q'].value='1014606002907';run('filterCatalog()');assert.equal(run('filtered.length'),1);
fields['#q'].value='__нет_такой_компании__';run('filterCatalog()');assert.equal(run('filtered.length'),0);assert(fields['#company-results'].innerHTML.includes('пока нет компаний'));assert(fields['#export-csv'].disabled);
fields['#q'].value='';fields['#saved-only'].checked=true;run("saved=new Set(['E01','E38']);filterCatalog()");assert.equal(run('filtered.length'),2);fields['#saved-only'].checked=false;
fields['#sort-filter'].value='revenue';run('filterCatalog()');assert.equal(run('filtered[0].name'),'Rogob');
let rendered=[];let prompts=0;
for(const company of data.companies){const html=run(`companyPage(getCompany('${company.id}'))`);assert(html.includes(company.id));assert(html.includes('НЕ ПРОВЕРЕНО'));rendered.push(html);for(const task of ['full','expand','finance','contact','load','interview']){fields['#research-company'].value=company.id;fields['#research-sector'].value=data.sectors.find(s=>s.name===company.sector).id;fields['#research-task'].value=task;const result=run('makePrompt()');assert(result.includes(company.name));assert(result.includes('30 000 MDL'));assert(result.includes('НЕ ПРОВЕРЕНО'));assert(!result.includes('undefined'));prompts++;}}
for(const s of data.sectors)rendered.push(run(`sectorPage(DATA.sectors.find(s=>s.id==='${s.id}'))`));
for(const fn of ['home','catalog','sectors','wave','research','method','sources'])rendered.push(run(fn+'()'));
for(const kind of ['registry','public'])rendered.push(run(`directoryPageHTML('${kind}')`));rendered.push(run('universeIntro()'));
const routes=new Set();let sourceLinks=0;
for(const html of rendered){assert(!html.includes('undefined'));for(const m of html.matchAll(/href="([^"#?]+)[^"]*"/g)){const link=m[1];if(link.startsWith('/')){const file=path.join('dist',link);assert(fs.existsSync(file),`Missing internal link ${link}`);routes.add(link);}else if(/^https?:/.test(link))sourceLinks++;}}
assert.equal(rendered.length,data.companies.length+data.sectors.length+10);assert.equal(prompts,data.companies.length*6);
for(const ext of ['xlsx','pdf']){const name=ext==='xlsx'?'Energy-Industry':'Energy-Analysis';const expected={'xlsx': 'b2dc5b232e3b1415a0dc25fa0cd87b57831d327b0e46742140bbb95a0765d960', 'pdf': '849d53d92d62a2392863c98d768da6b260b1ac82a5d492f8a5102a7739bef40f'};assert.equal(require('crypto').createHash('sha256').update(fs.readFileSync('dist/files/'+name+'.'+ext)).digest('hex'),expected[ext]);}
fields['#day-filter'].value='signal';run('filterCatalog()');assert.equal(run('filtered.length'),16);
for(const kind of Object.keys(data.dayLabels)){fields['#day-filter'].value=kind;run('filterCatalog()');assert.equal(run('filtered.length'),data.companies.filter(c=>c.day.kind===kind).length);}
fields['#day-filter'].value='';fields['#sort-filter'].value='day';run('filterCatalog()');assert.equal(run('filtered[0].day.kind'),'factory');
const registry=JSON.parse(fs.readFileSync('dist/registry.json','utf8')),pub=JSON.parse(fs.readFileSync('dist/public-energy.json','utf8'));run('REGISTRY='+JSON.stringify(registry)+';PUBLIC_ENERGY='+JSON.stringify(pub)+';');
assert.equal(new Set(registry.rows.map(r=>r[0])).size,42531);
assert.equal(run("directoryFilter('registry','1004600038666').length"),1);
assert.equal(run("directoryFilter('public','','','',10000).length"),428);
for(const row of pub.rows){const n=row.months.filter(x=>typeof x==='number');assert(Math.abs(row.average-n.reduce((a,b)=>a+b,0)/n.length)<0.011);}
for(const id of ['directory-prev','directory-next','directory-export','directory-page','directory-count','directory-table'])fields['#'+id]=field();
run("directoryRows=directoryFilter('registry');directoryPage=99999;renderDirectory('registry')");assert(fields['#directory-next'].disabled);assert(fields['#directory-table'].innerHTML.includes('<table'));
run("directoryRows=directoryFilter('public','','','',10000);directoryPage=0;renderDirectory('public')");assert(fields['#directory-prev'].disabled);assert(fields['#directory-table'].innerHTML.includes('строка'));
assert(!registry.columns.includes('founders'));assert(!registry.columns.includes('managers'));
const output={passed:true,pages:data.companies.length+data.sectors.length+9,renderedFragments:rendered.length,companyTaskCombinations:prompts,internalLinkTargets:routes.size,sourceLinkOccurrences:sourceLinks,filters:'all / finance / wave / combined / 27 sectors / daytime / directory pagination / IDNO / empty / favorites / revenue sort',originalDownloads:'byte-identical',browserQA:'see QA-NOTES.md for live browser checks'};
fs.writeFileSync('/tmp/energy-site-validation.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output));

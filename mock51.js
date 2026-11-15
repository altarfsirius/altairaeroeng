const { chromium } = require('playwright');
const jwt='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:'u1',email:'a@x',exp:4102444800,role:'authenticated'})).toString('base64url')+'.sig';
const bodies=[];const PRJ='22222222-2222-2222-2222-222222222222';const ORIGIN_LOG=[];
const DATA={
 app_settings:[{key:'polaris',value:{base_url:'https://polaris.example',notes:'x'}},{key:'email',value:{notes:'only a note'}},{key:'calendar',value:{enabled:true}}],
 parties:[{id:'pa1',name:'Lessee Air',kinds:['customer'],org_id:'o1'}],
 projects:[{id:PRJ,org_id:'o1',ref:'PRJ-0001',title:'APM lease project',kind:'other',status:'active',source:'apm',created_by:'u1',owner_id:'u1'}],
 fin_transactions:[{id:'t1',ref:'TX-00001',nature:'actual',direction:'expense',category:'freight',txn_date:'2026-10-01',description:'Freight',amount:250,currency:'USD',status:'draft',project_id:PRJ,created_by:'u2',owner_id:'u2'}],
 v_project_finance:[{project_id:PRJ,ref:'PRJ-0001',title:'APM lease project',status:'active',health:'ok',progress_pct:50,revenue_actual:8000,revenue_projected:9000,cost_actual:5000,cost_projected:6000,profit_projected:3000,margin_projected_pct:33.3,roi_projected_pct:50,bep_revenue:7000,budget_cost_used_pct:80}],
 v_fin_monthly:[{month:'2026-10-01',income_actual:8000,expense_actual:4500,income_forecast_w:0,expense_forecast_w:0,net_total:3500,cumulative_net:3500}],
 quotations:[],finance_calcs:[],notion_links:[]
};
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext(); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.protocol==='file:')return route.continue();
  if(u.hostname==='cdnjs.cloudflare.com'&&/html2pdf/.test(u.pathname))return route.fulfill({status:200,contentType:'application/javascript',body:"window.__pdf=[];window.html2pdf=()=>({o:null,set(o){this.o=o;return this},from(b){this.b=b;return this},save(){window.__pdf.push({h:this.b.ownerDocument.documentElement.outerHTML,n:this.o.filename,pb:this.o.pagebreak&&this.o.pagebreak.mode});return Promise.resolve()}});"});
  if(!u.hostname.endsWith('supabase.co'))return route.abort();
  const path=u.pathname,m=route.request().method();
  const J=(o,s=200)=>route.fulfill({status:s,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});
  if(path.includes('/auth/v1/token'))return J({access_token:jwt,refresh_token:'r',expires_in:3600,token_type:'bearer',user:{id:'u1',email:'a@x'}});
  if(path.includes('/rpc/my_access'))return J({status:'active',needs_setup:false,user_id:'u1',email:'a@x',display_name:'Admin',org_id:'o1',org_name:'Org',is_admin:true,scope:'org',roles:['approver'],modules:{home:'view',sourcing:'approve',quality:'approve',reports:'approve',library:'approve',projects:'approve',assets:'approve',comms:'approve',partners:'approve',supplychain:'approve',finance:'approve'}});
  if(path.includes('/rpc/fin_base_currency'))return J('IDR');
  if(path.includes('/rpc/altair_directory'))return J([{user_id:'u1',display_name:'Admin'},{user_id:'u2',display_name:'Budi'}]);
  if(path.includes('/rpc/evidence_log')){bodies.push('EVLOG '+route.request().postData());return J('EV-000007');}
  if(path.includes('/rpc/evidence_verify')){const k=JSON.parse(route.request().postData()).p_key;return J(k==='none'?[]:[{ev_no:'EV-000007',entity:'projects',record_id:PRJ,record_ref:'PRJ-00001',title:'ATR 72 supply',doc_hash:global.__hash||'0'.repeat(64),app_version:'1.21.0',printed_at:'2026-10-20T08:00:00Z',printed_by_name:'Admin'}]);}
  if(path.includes('/rpc/related_records'))return J([{direction:'from',relation:'project',entity:'purchase_orders',id:'p1',ref:'PO-00001',title:'Brakes',status:'approved'},{direction:'from',relation:'project',entity:'fin_transactions',id:'t2',ref:'TX-00002',title:'Quotation',status:'open'}]);
  if(path.includes('/rpc/life_policy')){return J({"source":"polaris-one","fetched_at":"2026-11-03T15:00:00Z","note":null,"areas":[{"id":"a-2","name":"Aviation","default":false,"active":true},{"id":"a-1","name":"2nd Work","default":true,"active":true},{"id":"a-9","name":"Old area","default":false,"active":false}],"by_area":{"a-1":4,"a-2":2,"Freelance":1}});}
  if(path.includes('/rpc/pol_link_candidates')){bodies.push('POST '+path+' '+route.request().postData());return J({current:null,linked_to_polaris:true,items:[{level:2,id:'bbbbbbbb-0000-0000-0000-000000000001',ref:'ACT-00001',title:'Planned in Polaris One',status:'not_started',same_project:'true'}]});}
  if(path.includes('/rpc/pol_sources_list')){return J([]);}
  if(path.includes('/rpc/pol_link_status')){return J({linked:false});}
  if(path.includes('/rpc/pol_failed_list')){return J([]);}
  if(path.includes('/rpc/pol_auto_status')){return J(null);}
  if(path.includes('/rpc/notion_link_save')){const b=JSON.parse(route.request().postData());global.__saved=b;DATA.notion_links=[{register_key:b.p_key,table_name:b.p_table,fixed:b.p_fixed,database_id:b.p_database_id,mapping:b.p_mapping,columns:b.p_columns,enabled:b.p_enabled,last_sync_at:null}];return J(null);}
  if(path.includes('/functions/v1/notion-sync')){const b=JSON.parse(route.request().postData());bodies.push('NS '+JSON.stringify(b));
   if(b.action==='status')return J({ok:true,token_set:true});
   if(b.action==='check')return J({ok:true,database_id:'a'.repeat(32),title:'Parts DB',columns:[{name:'Name',type:'title'},{name:'ALTAIR ID',type:'rich_text'},{name:'Part no',type:'rich_text'},{name:'Notes',type:'rich_text'}]});
   if(b.action==='preview')return J({ok:true,rows:3,new:2,changed:1,unchanged:0});
   if(b.action==='sync'){global.__syncs=(global.__syncs||0)+1;return J(global.__syncs===1?{ok:true,done:20,created:20,updated:0,failed:0,remaining:5}:{ok:true,done:5,created:5,updated:0,failed:0,remaining:0});}}
  if(m!=='GET'){bodies.push(m+' '+path+(u.search||'')+' '+route.request().postData());return J(path.includes('/finance_calcs')?[{id:'c1',ref:'FC-1'}]:path.includes('/rpc/')?'11111111-1111-1111-1111-111111111111':[{id:'n1'}]);}
  const t=path.split('/').pop();
  if(t==='projects'&&u.searchParams.get('id'))return J(DATA.projects);
  if(t==='fin_transactions'){const n=u.searchParams.get('nature');return J(DATA.fin_transactions.filter(r=>!n||r.nature===n.replace('eq.','')));}
  if(DATA[t])return J(DATA[t]);
  return J([]);
 });

 await p.goto('file:///home/claude/work/altair/index.html'); await p.waitForTimeout(500);
 await p.fill('#s_email','a@x'); await p.fill('#s_pw','pw');
 await p.click('[data-act="s_connect"], [data-act="s_signin"]').catch(async()=>{await p.keyboard.press('Enter')});
 await p.waitForTimeout(1500);
 const main=()=>p.$eval('#main, main, #content',e=>e.innerText).catch(()=>'?');
 const go=async r=>{await p.evaluate(r=>{const all=[...document.querySelectorAll(`[data-route="${r}"]`)];all[all.length-1]&&all[all.length-1].click()},r);await p.waitForTimeout(800);return main()};
 let pass=0,fail=0;const chk=(l,c)=>{c?pass++:(fail++,console.log('FAIL',l))};
 chk('version 1.49.0',(await p.content()).includes('content="1.49.0"'));
 await p.setViewportSize({width:390,height:844});
 let t=await go('s_connections');
 chk('Notion card in Connections',/Notion/.test(t)&&/Mirror ALTAIR databases/.test(t));
 await p.evaluate(()=>{[...document.querySelectorAll('.cxc')].find(x=>/Notion/.test(x.innerText)).querySelector('button').click()});await p.waitForTimeout(800);
 const q=s=>p.$$eval(s,x=>x.length);
 chk('modal opens',await q('#nxo .nxm')===1);
 const tabs=await p.$$eval('.nxt b',x=>x.map(y=>y.innerText));
 console.log(tabs.length,'tabs',tabs.slice(0,4));
 chk('tabs for ALTAIR databases (>=40)',tabs.length>=40);
 chk('no Polaris-owned tabs',!tabs.some(x=>/^Activities|^Actions/.test(x)));
 chk('heading text',/Own database, own mapping/.test(await p.innerText('.nxm')));
 chk('three segments',(await p.$$eval('.nxs',x=>x.map(y=>y.innerText))).join('|')==='Connect & check|Mapping|Preview & sync');
 chk('token line shows set',/token is set/.test(await p.innerText('.nxm')));
 chk('no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1&&document.querySelector('.nxm').scrollWidth<=window.innerWidth+1));
 await p.screenshot({path:'/tmp/nx_connect.png'});
 // choose Assets module + first db
 await p.click('.nxc:has-text("Assets")');await p.waitForTimeout(200);
 const first=await p.$eval('.nxt.on b',x=>x.innerText);
 await p.fill('#nxdb','https://www.notion.so/ws/Parts-0123456789abcdef0123456789abcdef?v=1');
 await p.click('[data-n="check"]');await p.waitForTimeout(500);
 chk('check shows columns',/4 columns found/.test(await p.innerText('.nxm')));
 await p.click('[data-n="tab"][data-v="mapping"]');await p.waitForTimeout(200);
 const mt=await p.innerText('.nxm');
 chk('mapping note',/Matched by name\. Change a row/.test(mt));
 const sels=await p.$$eval('select[data-n="map"]',x=>x.map(s=>s.options[s.selectedIndex].text));
 console.log(first,sels.slice(0,6));
 chk('title row automatic: Name',sels.some(x=>x==='Automatic: Name'));
 await p.screenshot({path:'/tmp/nx_mapping.png'});
 await p.click('[data-n="tab"][data-v="connect"]');await p.waitForTimeout(150);
 await p.check('#nxen');
 await p.click('[data-n="save"]');await p.waitForTimeout(600);
 chk('save sent mapping with title',global.__saved&&Object.values(global.__saved.p_mapping).some(m=>m.kind==='title'&&m.col==='Name'));
 chk('save sent 32-hex id',global.__saved&&global.__saved.p_database_id==='0123456789abcdef0123456789abcdef');
 chk('saved enabled',global.__saved&&global.__saved.p_enabled===true);
 chk('ALTAIR ID mapped',global.__saved&&global.__saved.p_mapping.__id&&global.__saved.p_mapping.__id.col==='ALTAIR ID');
 chk('no money field mapped by default',global.__saved&&!Object.keys(global.__saved.p_mapping).some(k=>/price|cost|amount|value/i.test(k)));
 await p.click('[data-n="tab"][data-v="sync"]');await p.waitForTimeout(200);
 chk('How it syncs card',/How it syncs/.test(await p.innerText('.nxm'))&&/Manual and automatic/.test(await p.innerText('.nxm'))&&/5 minutes/.test(await p.innerText('.nxm')));
 await p.click('[data-n="preview"]');await p.waitForTimeout(400);
 chk('preview counts',/3 records: 2 new, 1 changed, 0 unchanged/.test(await p.innerText('.nxm')));
 await p.click('[data-n="sync"]');await p.waitForTimeout(1500);
 chk('sync loops until nothing remains',global.__syncs===2&&/25 created/.test(await p.innerText('.nxm')));
 await p.selectOption('select[data-n="mode"]','manual');await p.waitForTimeout(400);
 chk('mode saved to app_settings',bodies.some(x=>/app_settings/.test(x)&&/"mode":"manual"/.test(x)));
 await p.screenshot({path:'/tmp/nx_sync.png'});
 await p.click('.nxf [data-n="close"]');await p.waitForTimeout(200);
 chk('modal closes',await q('#nxo')===0);
 await p.setViewportSize({width:1200,height:800});
 await p.evaluate(()=>{[...document.querySelectorAll('.cxc')].find(x=>/Notion/.test(x.innerText)).querySelector('button').click()});await p.waitForTimeout(500);
 await p.screenshot({path:'/tmp/nx_desktop.png'});
 chk('no page errors',errs.length===0);
 console.log('PASS',pass,'FAIL',fail,errs.slice(0,3));
 await b.close();
})();

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('typescript');
function load(file,mocks={}){const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const m={exports:{}};vm.runInNewContext(code,{exports:m.exports,require:n=>n in mocks?mocks[n]:require(n),Request,Response,Buffer,URL,TextDecoder,Uint8Array,console,process});return m.exports;}
(async()=>{
let passed=0;const check=(condition)=>{assert.ok(condition);passed++;};
const requests=load('src/shared/server/request.ts');
const password=load('src/features/auth/server/password.ts');
const hash=await password.hashPassword('correct horse battery staple');
check(hash.startsWith('scrypt-v1:'));check(await password.verifyPassword('correct horse battery staple',hash));check(!await password.verifyPassword('wrong password',hash));check(!await password.verifyPassword('anything','broken'));
const {scryptSync}=require('node:crypto');const salt='a'.repeat(32);check(await password.verifyPassword('legacy',`${salt}:${scryptSync('legacy',salt,64).toString('hex')}`));
const make=(body,origin='https://test.example',type='application/json')=>new Request('https://test.example/api/auth/login',{method:'POST',headers:{origin,'content-type':type},body});
for(const body of ['null','[]','{','1','"x"']){try{await requests.readJson(make(body));throw Error('accepted');}catch(e){check(e.status===400);}}
try{await requests.readJson(make(JSON.stringify({v:'x'.repeat(17000)})));throw Error('accepted');}catch(e){check(e.status===413);}
try{requests.requireOrigin(make('{}','https://attacker.example'));throw Error('accepted');}catch(e){check(e.status===403);}
requests.requireOrigin(new Request('http://localhost:3127/api/predict',{method:'POST',headers:{host:'127.0.0.1:3127',origin:'http://127.0.0.1:3127'}}));check(true);
let calls=0,attempts=1;
const {authHandler}=load('src/features/auth/server/handler.ts',{'server-only':{},'@/shared/server/database':{ensureSchema:async()=>{},query:async sql=>{calls++;return sql.includes('RETURNING attempts')?[{attempts}]:[];}},'@/shared/server/request':requests,'@/entities/user/server/session':{createSession:async()=>{throw Error('must not authenticate');},deleteSession:async()=>{}},'@/entities/user':{positions:['Аналитик']},'./password':password});
for(const [body,status] of [['null',400],['{',400],[JSON.stringify({email:'bad',password:'x'}),400],[JSON.stringify({email:'a@b.co',password:'wrong'}),401]])check((await authHandler(make(body),'login')).status===status);
check((await authHandler(make('{}','https://attacker.example'),'login')).status===403);
attempts=41;check((await authHandler(make(JSON.stringify({email:'a@b.co',password:'wrong'})),'login')).status===429);
const prediction=load('src/entities/flight/model/prediction.ts');
const route={route:'MOW-AER',base_price:8000,cost_per_passenger:3000,price_sensitivity:.1,price_min:1000,price_max:20000};
const forecast={seats:900,base:[600,650,700,750,800,850,900,950,1000]};
const endpoint=load('app/api/predict/route.ts',{'@/shared/server/request':requests,'@/entities/user/server/session':{getUser:async()=>({id:'test'})},'@/entities/flight/server/data':{readData:async()=>({routes:[route],getForecast:(_,date)=>date==='2026-06-01'?forecast:undefined})},'@/entities/flight/model/prediction':prediction});
const predictRequest=body=>new Request('https://test.example/api/predict',{method:'POST',headers:{origin:'https://test.example','content-type':'application/json'},body:JSON.stringify(body)});
const input={route:'MOW-AER',date:'2026-06-01',price:8000};
for(const [extra,status] of [[{q:.9},200],[{q:.15},400],[{q:'0.9'},400],[{route:'unknown'},404],[{date:'2026-08-01'},404],[{price:0},422]])check((await endpoint.POST(predictRequest({...input,...extra}))).status===status);
const result=await (await endpoint.POST(predictRequest({...input,q:.9}))).json();check(result.desired===1000&&result.bought===900);
console.log(`Security regression checks passed: ${passed}`);
})().catch(e=>{console.error(e);process.exitCode=1;});

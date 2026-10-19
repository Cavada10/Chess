const $=q=>document.querySelector(q),esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
/* ---------- MOTORE DI SCACCHI ---------- */
const DR=[[1,0],[-1,0],[0,1],[0,-1]],DG=[[1,1],[1,-1],[-1,1],[-1,-1]],NN=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]],PV={p:100,n:320,b:330,r:500,q:900,k:0};
const init=()=>({b:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'.replace(/\d/g,n=>' '.repeat(n)).replace(/\//g,'').split('').map(x=>x==' '?'':x),t:'w',c:'KQkq',ep:-1,hm:0});
function atk(b,sq,by){const r=sq>>3,c=sq&7,u=by=='w',g=(r,c)=>r<0||r>7||c<0||c>7?null:b[r*8+c],pr=u?r+1:r-1;
 if(g(pr,c-1)==(u?'P':'p')||g(pr,c+1)==(u?'P':'p'))return 1;
 for(const[a,d]of NN)if(g(r+a,c+d)==(u?'N':'n'))return 1;
 for(const[a,d]of DR.concat(DG))if(g(r+a,c+d)==(u?'K':'k'))return 1;
 for(const[ds,x1]of[[DR,'r'],[DG,'b']])for(const[a,d]of ds)for(let i=1;;i++){const x=g(r+a*i,c+d*i);if(x===null)break;if(x){const l=x.toLowerCase();if((x<'a')==u&&(l==x1||l=='q'))return 1;break}}
 return 0}
function gen(s){const{b,t}=s,m=[],w=t=='w',o=w?'b':'w';
 for(let i=0;i<64;i++){const p=b[i];if(!p||(p<'a')!=w)continue;const r=i>>3,c=i&7,k=p.toLowerCase();
  const add=(r2,c2)=>{if(r2<0||r2>7||c2<0||c2>7)return 0;const j=r2*8+c2,q=b[j];if(q&&(q<'a')==w)return 0;m.push({f:i,t:j});return q?0:1};
  if(k=='p'){const d=w?-1:1,st=w?6:1,push=(j,x)=>{if((j>>3)==(w?0:7))for(const q of'qrbn')m.push({f:i,t:j,p:q,...x});else m.push({f:i,t:j,...x})};
   if(!b[i+d*8]){push(i+d*8,{});if(r==st&&!b[i+d*16])m.push({f:i,t:i+d*16,dp:1})}
   for(const dc of[-1,1]){const c2=c+dc;if(c2<0||c2>7)continue;const j=i+d*8+dc,q=b[j];if(q&&(q<'a')!=w)push(j,{});else if(j==s.ep)push(j,{e:1})}}
  else if(k=='n')for(const[a,d]of NN)add(r+a,c+d);
  else if(k=='k'){for(const[a,d]of DR.concat(DG))add(r+a,c+d);const B=w?56:0;
   if(i==B+4&&!atk(b,i,o)){if(s.c.includes(w?'K':'k')&&!b[B+5]&&!b[B+6]&&!atk(b,B+5,o)&&!atk(b,B+6,o))m.push({f:i,t:B+6,cs:1});
    if(s.c.includes(w?'Q':'q')&&!b[B+1]&&!b[B+2]&&!b[B+3]&&!atk(b,B+3,o)&&!atk(b,B+2,o))m.push({f:i,t:B+2,cs:2})}}
  else for(const[a,d]of k=='r'?DR:k=='b'?DG:DR.concat(DG))for(let n=1;add(r+a*n,c+d*n);n++);}
 return m}
function mk(s,m){const b=s.b.slice(),p=b[m.f],w=s.t=='w';let c=s.c,ep=-1;
 b[m.t]=m.p?(w?m.p.toUpperCase():m.p):p;b[m.f]='';if(m.e)b[m.t+(w?8:-8)]='';if(m.dp)ep=(m.f+m.t)/2;
 if(m.cs==1){b[m.t-1]=b[m.t+1];b[m.t+1]=''}if(m.cs==2){b[m.t+1]=b[m.t-2];b[m.t-2]=''}
 for(const[sq,r]of[[60,'KQ'],[4,'kq'],[63,'K'],[56,'Q'],[7,'k'],[0,'q']])if(m.f==sq||m.t==sq)for(const x of r)c=c.replace(x,'');
 return{b,t:w?'b':'w',c,ep,hm:(p.toLowerCase()=='p'||s.b[m.t])?0:s.hm+1}}
const inChk=s=>atk(s.b,s.b.indexOf(s.t=='w'?'K':'k'),s.t=='w'?'b':'w');
const leg=s=>{const o=s.t=='w'?'b':'w',K=s.t=='w'?'K':'k';return gen(s).filter(m=>{const n=mk(s,m);return!atk(n.b,n.b.indexOf(K),o)})};
function san(s,m,L){const p=s.b[m.f],k=p.toUpperCase(),f='abcdefgh'[m.f&7],sq=x=>'abcdefgh'[x&7]+(8-(x>>3));let o;
 if(m.cs)o=m.cs==1?'O-O':'O-O-O';else{const cap=s.b[m.t]||m.e;
  if(k=='P')o=(cap?f+'x':'')+sq(m.t)+(m.p?'='+m.p.toUpperCase():'');
  else{const am=L.filter(x=>x!=m&&s.b[x.f]==p&&x.t==m.t);let d='';if(am.length)d=am.some(x=>(x.f&7)==(m.f&7))?(am.some(x=>(x.f>>3)==(m.f>>3))?sq(m.f):8-(m.f>>3)):f;o=k+d+(cap?'x':'')+sq(m.t)}}
 const n=mk(s,m);return o+(inChk(n)?(leg(n).length?'+':'#'):'')}
const insuf=b=>{const p=b.filter(x=>x&&x.toLowerCase()!='k');return!p.length||(p.length==1&&'nb'.includes(p[0].toLowerCase()))};
function replay(sans){let s=init();const S=[s],M=[];for(const t of sans){const L=leg(s),k=t.replace(/[+#!?]/g,'').replace(/0/g,'O'),m=L.find(m=>san(s,m,L).replace(/[+#]/g,'')==k);if(!m)throw Error('mossa non valida: '+t);M.push(m);s=mk(s,m);S.push(s)}return{S,M}}
/* valutazione e ricerca alpha-beta (gira nel browser, senza limiti d'uso) */
function ev(s){let e=0;for(let i=0;i<64;i++){const p=s.b[i];if(!p)continue;const w=p<'a',k=p.toLowerCase(),r=i>>3,c=i&7,cd=7-Math.abs(c-3.5)-Math.abs(r-3.5);let v=PV[k];
 if(k=='p')v+=(w?6-r:r-1)*9+cd*2;else if(k=='n'||k=='b')v+=cd*6;else if(k=='k')v-=cd*4*(s.b.filter(x=>x).length>14?1:-1);e+=w?v:-v}return s.t=='w'?e:-e}
const sc=(s,m)=>(s.b[m.t]||m.e?PV[(s.b[m.t]||'p').toLowerCase()]*10-PV[s.b[m.f].toLowerCase()]:0)+(m.p?800:0),ord=s=>(x,y)=>sc(s,y)-sc(s,x);
function qs(s,a,b,d){const e=ev(s);if(d<=0||e>=b)return e;if(e>a)a=e;for(const m of leg(s).filter(m=>s.b[m.t]||m.e).sort(ord(s))){const v=-qs(mk(s,m),-b,-a,d-1);if(v>=b)return v;if(v>a)a=v}return a}
function srch(s,d,a,b){if(d<=0)return qs(s,a,b,4);const L=leg(s);if(!L.length)return inChk(s)?-9999-d:0;if(s.hm>=100)return 0;let best=-1e5;
 for(const m of L.sort(ord(s))){const v=-srch(mk(s,m),d-1,-b,-a);if(v>best)best=v;if(v>a)a=v;if(a>=b)break}return best}
const root=(s,d)=>leg(s).map(m=>{const n=mk(s,m),L=leg(n),v=!L.length?(inChk(n)?1500:0):-srch(n,d-1,-1e5,1e5);return{m,v:Math.max(-1500,Math.min(1500,v))}});
/* ---------- DATI ACCOUNT (localStorage) ---------- */
let D;try{D=JSON.parse(localStorage.cc)}catch(e){}D=D||{name:'Giocatore',elo:800,games:[],friends:[],daily:{}};
const save=()=>{try{localStorage.cc=JSON.stringify(D)}catch(e){}};
const BOTS=[{n:'Nelson',e:400,d:1,z:300},{n:'Martina',e:800,d:1,z:120},{n:'Giorgio',e:1200,d:2,z:60},{n:'Elena',e:1600,d:2,z:15},{n:'Marco',e:2000,d:3,z:0}];
const GL=Object.fromEntries('k♚,q♛,r♜,b♝,n♞,p♟'.split(',').map(x=>[x[0],x[1]+'\uFE0E']));
const dk=()=>new Date().toISOString().slice(0,10),dn=()=>Math.floor(Date.now()/864e5),CL=['Migliore','Ottima','Buona','Imprecisione','Errore','Svarione'],CC=['#81b64c','#96bc4b','#a3a3a3','#f7c631','#e58f2a','#ca3431'];
/* ---------- SCACCHIERA E PARTITA ---------- */
let G=null,flip=0,V=null,sel=-1,R=null;
function draw(s,last=[],sl=-1,tg=[]){const ck=inChk(s)?s.b.indexOf(s.t=='w'?'K':'k'):-1;let h='';
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){const i=flip?63-(r*8+c):r*8+c,p=s.b[i];
  h+=`<div class="sq ${((i>>3)+(i&7))%2?'d':'l'}${last.includes(i)||i==sl?' h':''}${tg.includes(i)?' t':''}${i==ck?' c':''}" data-i="${i}">${p?`<span class="${p<'a'?'w':'k'}">${GL[p.toLowerCase()]}</span>`:''}</div>`}
 $('#bd').innerHTML=h}
const redraw=()=>G?draw(G.s,G.last):draw(init());
function start(opp,me,mode){G={s:init(),H:[],S:[],me,opp,mode,over:0,last:[]};V=null;sel=-1;flip=me=='b';draw(G.s);log();if(mode=='bot'&&me=='b')setTimeout(bot,300)}
function log(){const m=$('#mv'),g=$('#msg');if(!m||!G)return;m.innerHTML=G.S.map((x,i)=>(i%2?'':`<b>${(i>>1)+1}.</b> `)+x).join(' ');if(!G.over)g.textContent=`Contro ${G.opp.n}${G.opp.e?' ('+G.opp.e+')':''} · muove il ${G.s.t=='w'?'Bianco':'Nero'}`}
$('#bd').onclick=e=>{const q=e.target.closest('.sq');if(!q||!G||G.over||V)return;const i=+q.dataset.i,s=G.s;if(G.mode=='bot'&&s.t!=G.me)return;
 const L=leg(s),m=sel>=0&&L.find(m=>m.f==sel&&m.t==i&&(!m.p||m.p=='q'));
 if(m){sel=-1;play(m)}else{sel=s.b[i]&&(s.b[i]<'a')==(s.t=='w')?i:-1;draw(s,G.last,sel,L.filter(m=>m.f==sel).map(m=>m.t))}};
function play(m){const s=G.s,L=leg(s);G.S.push(san(s,m,L));G.H.push(s);G.s=mk(s,m);G.last=[m.f,m.t];draw(G.s,G.last);log();
 let r=0;if(!leg(G.s).length)r=inChk(G.s)?(s.t=='w'?'1-0':'0-1'):'1/2-1/2';else if(G.s.hm>=100||insuf(G.s.b))r='1/2-1/2';
 if(r)return fin(r);if(G.mode=='bot'&&G.s.t!=G.me)setTimeout(bot,250)}
function bot(){if(!G||G.over)return;const o=G.opp,sc=root(G.s,o.d).map(x=>({m:x.m,v:x.v+Math.random()*o.z}));play(sc.reduce((a,x)=>x.v>a.v?x:a).m)}
function fin(r){G.over=1;let t=r=='1/2-1/2'?'Patta':(r=='1-0'?'Il Bianco':'Il Nero')+' vince';
 if(G.mode=='bot'){const pt=r=='1/2-1/2'?.5:((r=='1-0')==(G.me=='w')?1:0),ex=1/(1+10**((G.opp.e-D.elo)/400)),old=D.elo;D.elo=Math.round(D.elo+32*(pt-ex));
  D.games.push({s:G.S,r,me:G.me,o:G.opp.n,oe:G.opp.e,d:dk(),e:D.elo});if(G.daily)D.daily[dk()]=pt;save();t+=` · rating ${old} → ${D.elo}`;hdr()}
 $('#msg')&&($('#msg').textContent=t+' ('+r+')')}
const res=()=>G&&!G.over&&fin(G.mode=='bot'?(G.me=='w'?'0-1':'1-0'):(G.s.t=='w'?'0-1':'1-0'));
const flp=()=>{flip=!flip;V?draw(V):redraw()};
function und(){if(!G||G.over||!G.H.length)return;const n=G.mode=='bot'&&G.s.t==G.me?2:1;for(let i=0;i<n&&G.H.length;i++){G.s=G.H.pop();G.S.pop()}G.last=[];draw(G.s);log();if(G.mode=='bot'&&G.s.t!=G.me)setTimeout(bot,250)}
/* ---------- PANNELLI ---------- */
const P={};
P.gioca=()=>`<div class=card><h3>Gioca contro un bot</h3>${BOTS.map((b,i)=>`<button onclick="go(${i})">${b.n} · ${b.e}</button>`).join(' ')}
<p>Colore: <select id=col><option value=w>Bianco<option value=b>Nero</select></p><button onclick="start({n:'Ospite',e:0},'w','local');tab('gioca')">2 giocatori (stesso dispositivo)</button></div>
<div class=card><div id=msg>Scegli un avversario per iniziare.</div><div id=mv></div><p><button onclick=flp()>Gira</button> <button onclick=und()>Annulla mossa</button> <button onclick=res()>Abbandona</button></p></div>`;
P.sfide=()=>{const n=dn(),b=BOTS[n%5],d=D.daily[dk()];return`<div class=card><h3>Sfida del giorno (${dk()})</h3><p>Batti ${b.n} (${b.e}) con il ${n%2?'Nero':'Bianco'}. ${d!=null?'Completata: '+d+' punti.':'Non ancora giocata.'}</p><button class=g onclick=daily()>Accetta la sfida</button></div>
<div class=card><h3>Sfide agli amici</h3><p>Apri la scheda Amici e premi Sfida: giochi contro un bot tarato sul rating del tuo amico.</p></div>`};
P.amici=()=>`<div class=card><h3>Aggiungi un amico</h3><input id=fn placeholder="Nome utente" maxlength=20> <button class=g onclick=addF()>Aggiungi</button></div>
<div class=card><h3>Classifica amici</h3>${[...D.friends,{n:D.name+' (tu)',e:D.elo,me:1}].sort((a,b)=>b.e-a.e).map(f=>`<div class=row><span>${f.me?'⭐':f.on?'🟢':'⚪'} ${esc(f.n)} · ${f.e}</span>${f.me?'':`<span><button onclick="chF(${f.id})">Sfida</button><button onclick="rmF(${f.id})" aria-label=Rimuovi>✕</button></span>`}</div>`).join('')}</div>`;
P.stat=()=>{const g=D.games,dr=g.filter(x=>x.r=='1/2-1/2').length,w=g.filter(x=>x.r!='1/2-1/2'&&(x.r=='1-0')==(x.me=='w')).length,pts=[800,...g.map(x=>x.e)],mx=Math.max(...pts),mn=Math.min(...pts);
 const path=pts.map((v,i)=>`${i?'L':'M'}${i*300/Math.max(1,pts.length-1)},${70-(v-mn)/(mx-mn||1)*60}`).join('');
 return`<div class=card><h3>Statistiche</h3><div class=grid><div><b>${D.elo}</b>Rating</div><div><b>${w}</b>Vinte</div><div><b>${dr}</b>Patte</div><div><b>${g.length-w-dr}</b>Perse</div></div>
<p>Vittorie: ${g.length?Math.round(w/g.length*100):0}%</p><svg viewBox="0 0 300 80"><path d="${path}" fill=none stroke="#81b64c" stroke-width=2 /></svg></div>
<div class=card><h3>Ultime partite</h3>${g.slice(-10).reverse().map((x,i)=>`<div class=row><span>${x.d} · ${esc(x.o)} · ${x.r}</span><button onclick="rvG(${g.length-1-i})">Rivedi</button></div>`).join('')||'Nessuna partita: gioca contro un bot.'}</div>`};
P.rev=()=>`<div class=card><h3>Revisione partite</h3><p>Motore locale, gratuito e senza limiti di analisi.</p><p>Profondità <input type=range id=dp min=1 max=4 value=3 style="width:120px"></p>
<select id=gs>${D.games.map((x,i)=>`<option value=${i}>${x.d} · vs ${esc(x.o)} (${x.r})`).join('')||'<option>Nessuna partita salvata'}</select> <button class=g onclick=rvSel()>Analizza</button>
<p>Oppure incolla un PGN:</p><textarea id=pg></textarea><button onclick=rvPgn()>Analizza PGN</button></div><div class=card id=rs>Scegli una partita da analizzare.</div>`;
P.prof=()=>`<div class=card><h3>Profilo</h3><input id=nm value="${esc(D.name)}" maxlength=20> <button class=g onclick="D.name=$('#nm').value||'Giocatore';save();hdr()">Salva nome</button>
<p>Esporta o importa il tuo account (JSON) per usarlo su un altro dispositivo.</p><textarea id=ex>${esc(JSON.stringify(D))}</textarea>
<button onclick="try{D=JSON.parse($('#ex').value);save();hdr();tab('prof')}catch(e){alert('JSON non valido')}">Importa</button> <button onclick="if(confirm('Cancellare tutti i dati?')){localStorage.removeItem('cc');location.reload()}">Azzera</button></div>`;
const TABS={gioca:'Gioca',sfide:'Sfide',amici:'Amici',stat:'Statistiche',rev:'Revisione',prof:'Profilo'};
function tab(n){if(n!='rev'){V=null;redraw()}$('#pn').innerHTML=P[n]();$('#nav').innerHTML=Object.entries(TABS).map(([k,v])=>`<button class="${k==n?'on':''}" onclick="tab('${k}')">${v}</button>`).join('');log()}
const hdr=()=>$('#me').textContent=`${D.name} · ${D.elo}`;
const go=i=>{start(BOTS[i],$('#col').value,'bot');log()};
function daily(){const n=dn();start(BOTS[n%5],n%2?'b':'w','bot');G.daily=1;tab('gioca')}
function addF(){const n=$('#fn').value.trim();if(!n)return;D.friends.push({id:Date.now(),n,e:Math.max(400,Math.min(2200,Math.round(D.elo+(Math.random()-.5)*600))),on:Math.random()>.5});save();tab('amici')}
const rmF=id=>{D.friends=D.friends.filter(f=>f.id!=id);save();tab('amici')};
function chF(id){const f=D.friends.find(x=>x.id==id),b=BOTS.reduce((a,x)=>Math.abs(x.e-f.e)<Math.abs(a.e-f.e)?x:a);start({...b,n:f.n,e:f.e},Math.random()>.5?'w':'b','bot');tab('gioca')}
/* ---------- REVISIONE ---------- */
const rvG=i=>{tab('rev');$('#gs').value=i;analyze(D.games[i].s)},rvSel=()=>{const g=D.games[+$('#gs').value];g&&analyze(g.s)};
const rvPgn=()=>analyze($('#pg').value.replace(/\[[^\]]*\]/g,'').replace(/\{[^}]*\}/g,'').replace(/\([^)]*\)/g,'').replace(/\$\d+/g,'').replace(/\d+\.(\.\.)?/g,' ').split(/\s+/).filter(x=>x&&!/^(1-0|0-1|1\/2-1\/2|\*)$/.test(x)));
async function analyze(sans){let X;try{X=replay(sans)}catch(e){return $('#rs').textContent='PGN non valido: '+e.message}
 const{S,M}=X,dp=+$('#dp').value,ev_=[],cl=[],bs=[],ls={w:[],b:[]};
 for(let i=0;i<M.length;i++){$('#rs').textContent=`Analisi in corso: mossa ${i+1} di ${M.length}…`;await new Promise(r=>setTimeout(r,5));
  const s=S[i],r=root(s,dp),bt=r.reduce((a,x)=>x.v>a.v?x:a),pm=r.find(x=>x.m.f==M[i].f&&x.m.t==M[i].t&&x.m.p==M[i].p),l=bt.v-pm.v;
  ev_.push(bt.v*(s.t=='w'?1:-1));bs.push(san(s,bt.m,leg(s)));ls[s.t].push(Math.min(l,500));cl.push(l<=0?0:l<=25?1:l<=60?2:l<=120?3:l<=250?4:5)}
 R={S,M,sans,ev:ev_,cl,bs};const acc=a=>a.length?Math.round(100*Math.exp(-a.reduce((x,y)=>x+y,0)/a.length/120)):100,w=300/Math.max(1,M.length);
 $('#rs').innerHTML=`<h3>Risultato</h3><div class=grid style="grid-template-columns:1fr 1fr"><div><b>${acc(ls.w)}%</b>Precisione Bianco</div><div><b>${acc(ls.b)}%</b>Precisione Nero</div></div>
<svg viewBox="0 0 300 80">${ev_.map((e,i)=>{const h=Math.max(-600,Math.min(600,e))/600*38;return`<rect onclick="showPly(${i})" x=${i*w} y=${h>0?40-h:40} width=${Math.max(w-.5,1)} height=${Math.abs(h)+.5} fill="${h>0?'#ddd':'#666'}"/>`}).join('')}</svg>
<p id=bst>Tocca una mossa per vedere il giudizio.</p><div>${sans.map((x,i)=>`${i%2?'':`<b>${(i>>1)+1}.</b>`}<span class=mvb style="color:${CC[cl[i]]}" onclick="showPly(${i})">${esc(x)}</span>`).join(' ')}</div>
<p>Legenda: ${CL.map((x,i)=>`<span style="color:${CC[i]}">${x}</span>`).join(', ')}</p>`}
function showPly(i){V=R.S[i+1];sel=-1;draw(V,[R.M[i].f,R.M[i].t]);$('#bst').innerHTML=`<b style="color:${CC[R.cl[i]]}">${esc(R.sans[i])}: ${CL[R.cl[i]]}</b> · migliore: ${esc(R.bs[i])} · valutazione ${(R.ev[i]/100).toFixed(1)}`}
hdr();tab('gioca');draw(init());

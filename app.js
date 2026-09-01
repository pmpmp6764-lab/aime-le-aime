const STICKERS=["安","好喔","才沒有","真的假的","有夠累","笑死","蛤","先這樣","吃飯沒","在忙"];
const JOBS=["醫師","護理師","教師","COSPLAY","設計師","活動主持人","調酒師","演員","公關"];
const RELS=[["friend","朋友"],["childhood","青梅竹馬"],["dating","熱戀中"]];
const S={screen:"setup",myName:"我",theirName:"小雨",job:"醫師",relation:"dating",messages:[],typing:false,media:null,mediaKind:null,wall:null};

function pick(a){return a[Math.floor(Math.random()*a.length)]}
function hit(t,ks){return ks.some(k=>t.includes(k))}
function reply(raw){
  const t=raw.trim(), r=S.relation, job=S.job||"上班族";
  if(!t) return "蛤？你要說什麼";
  if(hit(t,["舔","性","床","裸","色色","做愛"])) return "這個先不要啦。我們就當聊天就好。";
  if(hit(t,["晚安","睡"])) return pick(["晚安喔","去睡啦，明天再講"]);
  if(hit(t,["早安"])) return pick(["早啊，吃了沒","這麼早。咖啡了沒"]);
  if(t==="安"||hit(t,["安安","hi","HI","嗨","哈囉"])) return pick(["安","安安","安，有事嗎"]);
  if(hit(t,["在嗎","在嘛"])) return pick(["在啊","在，有事嗎"]);
  if(hit(t,["工作","上班","職業","COSPLAY","漫展","值班"])) return pick(["對啊我是"+job,"今天班有夠長，晚點回你"]);
  if(hit(t,["想你","喜歡你","愛你"])) {
    if(r==="friend") return "想太多。我們是朋友";
    return pick(["才沒有想你。誰准你突然講這個","你很煩耶。好啦有想"]);
  }
  if(hit(t,["真的假的"])) return "啥";
  if(hit(t,["笑死"])) return pick(["笑死","你好煩 笑死"]);
  if(hit(t,["作業","報告","教授","上課"])) return pick(["報告寫了沒 我都還沒","教授有夠機車"]);
  if(hit(t,["先這樣","掰"])) return pick(["好喔，到了跟我說","先這樣啦"]);
  if(hit(t,["吃","餓","便當"])) return pick(["吃飽沒","你想吃什麼"]);
  if(hit(t,["累","忙"])) return pick(["有夠累喔，先去休息","好喔，忙完再回我"]);
  if(hit(t,["視訊","通話"])) return pick(["好啊，你開我就接","等一下，我先整理一下"]);
  return pick(["是喔","然後呢","這樣喔","好喔","哈哈好","可以啊","好啦好啦"]);
}
function hi(){
  const rel=RELS.find(x=>x[0]===S.relation)[1];
  const text=S.relation==="dating"?"安安，剛下班。你吃飯了沒":S.relation==="childhood"?"安安，好久不見喔。你在幹嘛":"安安";
  S.messages=[{who:"sys",text:"與 "+S.theirName+" 的對話　"+S.job+"　"+rel},{who:"them",text:text}];
}
function fileUrl(f){return URL.createObjectURL(f)}
function send(text){
  const t=(text||"").trim(); if(!t||S.typing) return;
  S.messages.push({who:"me",text:t}); S.typing=true; draw();
  setTimeout(()=>{S.messages.push({who:"them",text:reply(t)});S.typing=false;draw()},700);
}
function sendSticker(label){
  if(S.typing) return;
  S.messages.push({who:"me",kind:"sticker",text:label}); S.typing=true; draw();
  setTimeout(()=>{S.messages.push({who:"them",text:label==="真的假的"?"啥":"是喔"});S.typing=false;draw()},700);
}
function sendImg(url){
  if(S.typing) return;
  S.messages.push({who:"me",kind:"image",image:url,text:""}); S.typing=true; draw();
  setTimeout(()=>{S.messages.push({who:"them",text:pick(["這張怎樣 好看欸","你在哪拍的"])});S.typing=false;draw()},700);
}
function $(id){return document.getElementById(id)}
function draw(){
  const app=$("app");
  if(S.screen==="setup"){
    app.innerHTML=`<header class="top"><b>曖了曖了</b><span class="muted">離線網頁版</span></header>
    <main class="pad">
      <p class="muted">國語日常。選職業跟關係後開始。解壓後請用 Chrome 或 Edge 開 index.html。</p>
      <label>你的名字</label><input id="me" type="text" value="${esc(S.myName)}"/>
      <label>對方名字</label><input id="them" type="text" value="${esc(S.theirName)}"/>
      <label>對方職業</label><input id="job" type="text" value="${esc(S.job)}"/>
      <div class="chips">${JOBS.map(j=>`<button class="chip ${S.job===j?"on":""}" data-job="${j}">${j}</button>`).join("")}</div>
      <label>你們的關係</label>
      <div class="rels">${RELS.map(([k,v])=>`<button class="rel ${S.relation===k?"on":""}" data-rel="${k}">${v}</button>`).join("")}</div>
      <label>對方形象</label>
      <div class="up" id="up">${S.media? (S.mediaKind==="video"?`<video src="${S.media}" autoplay muted loop playsinline></video>`:`<img src="${S.media}" alt="">`):"點這裡上傳照片或短影片"}</div>
      <button class="btn" id="go">開始聊天</button>
    </main>`;
    app.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{S.job=b.dataset.job;draw()});
    app.querySelectorAll("[data-rel]").forEach(b=>b.onclick=()=>{S.relation=b.dataset.rel;draw()});
    $("me").oninput=e=>S.myName=e.target.value;
    $("them").oninput=e=>S.theirName=e.target.value;
    $("job").oninput=e=>S.job=e.target.value;
    $("up").onclick=()=>{const i=document.createElement("input");i.type="file";i.accept="image/*,video/*";i.onchange=()=>{const f=i.files[0];if(!f)return;S.media=fileUrl(f);S.mediaKind=f.type.startsWith("video/")?"video":"img";draw()};i.click()};
    $("go").onclick=()=>{hi();S.screen="chat";draw()};
    return;
  }
  if(S.screen==="call"){
    const media=S.mediaKind==="video"?`<video class="fill" src="${S.media}" autoplay muted loop playsinline></video>`:S.media?`<img class="fill" src="${S.media}" alt="">`:"";
    app.innerHTML=`<div class="call">${media}<div class="shade"></div><div class="ui">
      <div class="top">${esc(S.theirName)} · 視訊中也可以打字</div>
      <div class="logs" id="logs"></div>
      <form class="composer" id="cf"><input id="cin" placeholder="視訊中傳訊…" autocomplete="off"/><button class="send" type="submit">傳送</button></form>
      <div class="hangwrap"><button class="hang" id="hang" type="button">掛斷</button></div>
    </div></div>`;
    fillLogs($("logs"));
    $("cf").onsubmit=e=>{e.preventDefault();send($("cin").value);};
    $("hang").onclick=()=>{S.screen="chat";S.messages.push({who:"sys",text:"通話已結束"});draw()};
    $("cin").focus();
    return;
  }
  app.innerHTML=`<header class="top"><b>曖了曖了</b><span class="muted">離線網頁版</span></header>
  <div class="chat">
    <div class="chatbar">
      <button class="icon" id="back" type="button">←</button>
      <div class="av">${S.media&&S.mediaKind==="img"?`<img src="${S.media}" alt="">`:esc(S.theirName).slice(0,1)}</div>
      <div style="flex:1;min-width:0"><b>${esc(S.theirName)}</b><div class="muted">${S.typing?"輸入中…":"在線上"} · ${esc(S.job)}</div></div>
      <button class="icon" id="wall" type="button">背景</button>
      <button class="icon" id="vid" type="button">視訊</button>
    </div>
    <div class="stage">
      ${S.wall?`<img class="wall" src="${S.wall}" alt=""><div class="dim"></div>`:""}
      <div class="logs" id="logs"></div>
    </div>
    <div class="tray" id="tray" hidden>${STICKERS.map(s=>`<button class="sticker" data-s="${s}" type="button">${s}</button>`).join("")}</div>
    <form class="composer" id="cf">
      <button class="icon" id="smile" type="button">☺</button>
      <button class="icon" id="imgb" type="button">＋</button>
      <input id="cin" placeholder="Aa" autocomplete="off"/>
      <button class="send" type="submit">傳送</button>
    </form>
  </div>`;
  fillLogs($("logs"));
  $("back").onclick=()=>{S.screen="setup";draw()};
  $("vid").onclick=()=>{S.screen="call";draw()};
  $("smile").onclick=()=>{const t=$("tray"); t.hidden=!t.hidden};
  $("tray").querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>sendSticker(b.dataset.s));
  $("cf").onsubmit=e=>{e.preventDefault();send($("cin").value)};
  $("imgb").onclick=()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=()=>{if(i.files[0])sendImg(fileUrl(i.files[0]))};i.click()};
  $("wall").onclick=()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=()=>{if(i.files[0]){S.wall=fileUrl(i.files[0]);draw()}};i.click()};
  $("cin").focus();
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&","<":"<",">":">","\"":""","'":"&#39;"}[c]))}
function fillLogs(box){
  box.innerHTML=S.messages.map(m=>{
    if(m.who==="sys") return `<p class="sys"><span>${esc(m.text)}</span></p>`;
    const inner=m.kind==="sticker"?`<div class="sticker">${esc(m.text)}</div>`:m.kind==="image"?`<img class="pic" src="${m.image}" alt="">`:`<div class="bub">${esc(m.text)}</div>`;
    return `<div class="row ${m.who}">${m.who==="them"?`<div class="av">${esc(S.theirName).slice(0,1)}</div>`:""}<div>${inner}</div></div>`;
  }).join("")+(S.typing?`<p class="sys"><span>輸入中…</span></p>`:"");
  box.scrollTop=box.scrollHeight;
}
draw();

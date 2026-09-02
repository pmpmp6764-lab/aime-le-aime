const STICKERS=["安","好喔","才沒有","真的假的","有夠累","笑死","蛤","先這樣","吃飯沒","在忙"];
const JOBS=["醫師","護理師","教師","COSPLAY","設計師","活動主持人","調酒師","演員","公關"];
const RELS=[["friend","朋友"],["childhood","青梅竹馬"],["dating","熱戀中"]];
const VOICES=[["loli","1. 嗲嗲聲蘿莉音"],["onee","2. 御姐音"],["teen","3. 青春少女音"]];
const PERS=[["soft","1. 柔弱依賴"],["cute","2. 大方可愛"],["warm","3. 非常熱情"]];
const S={
  screen:"setup",myName:"我",theirName:"小雨",job:"醫師",relation:"dating",
  voice:"teen",personality:"cute",voiceOn:true,incoming:false,turns:0,
  messages:[],typing:false,media:null,mediaKind:null,myMedia:null,myKind:null,wall:null
};

function pick(a){return a[Math.floor(Math.random()*a.length)]}
function hit(t,ks){return ks.some(k=>t.includes(k))}
function esc(s){
  return String(s).replace(/[&<>"']/g,function(c){
    if(c==="&") return "\u0026amp;";
    if(c==="<") return "\u0026lt;";
    if(c===">") return "\u0026gt;";
    if(c==='"') return "\u0026quot;";
    return "\u0026#39;";
  });
}
function speak(text){
  if(!S.voiceOn||!window.speechSynthesis) return;
  var u=new SpeechSynthesisUtterance(String(text).slice(0,160));
  u.lang="zh-TW";
  var list=speechSynthesis.getVoices();
  var v=list.filter(function(x){return (x.lang||"").toLowerCase().indexOf("zh-tw")===0})[0]
    ||list.filter(function(x){return (x.lang||"").toLowerCase().indexOf("zh")===0})[0];
  if(v) u.voice=v;
  if(S.voice==="loli"){u.pitch=1.45;u.rate=1.02}
  else if(S.voice==="onee"){u.pitch=0.88;u.rate=0.92}
  else {u.pitch=1.12;u.rate=1}
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function face(url,kind,name,cls){
  if(url&&kind==="video") return '<video class="'+cls+'" src="'+url+'" muted loop autoplay playsinline></video>';
  if(url) return '<img class="'+cls+'" src="'+url+'" alt="">';
  return '<div class="'+cls+' av-fallback">'+esc(name).slice(0,1)+"</div>";
}
function reply(raw){
  var t=raw.trim(), r=S.relation, job=S.job||"上班族", p=S.personality;
  if(!t) return p==="soft"?"嗯…你要說什麼":p==="warm"?"講啊，我在聽":"蛤？你要說什麼";
  if(hit(t,["舔","性","床","裸","色色","做愛"])) return "這個先不要啦。我們就當聊天就好。";
  if(hit(t,["晚安","睡"])) return r==="dating"?pick(["晚安喔。想你","去睡啦，明天視訊"]):pick(["晚安喔","去睡啦"]);
  if(hit(t,["早安"])) return pick(["早啊，吃了沒","這麼早"]);
  if(t==="安"||hit(t,["安安","hi","HI","嗨","哈囉"])) return pick(["安","安安","安，有事嗎"]);
  if(hit(t,["在嗎","在嘛"])) return pick(["在啊","在，有事嗎"]);
  if(hit(t,["想你","喜歡你","愛你","寶貝","抱抱","親親"])) {
    if(r==="friend") return "想太多。我們是朋友";
    if(r==="dating") return pick(["想你啊","抱抱。想看你","寶貝你很會講。接一下視訊好不好"]);
    return pick(["才沒有想你。好啦有一點點"]);
  }
  if(hit(t,["真的假的"])) return "啥";
  if(hit(t,["視訊","通話","看你"])) return r==="dating"?pick(["想看你，接一下嘛","快接，我想看你"]):pick(["好啊，你開我就接"]);
  if(hit(t,["吃","餓"])) return r==="dating"?pick(["寶貝你吃飽沒","你想吃什麼"]):pick(["吃飽沒","你想吃什麼"]);
  if(hit(t,["累","忙"])) return pick(["有夠累喔，先去休息","好喔，忙完再回我"]);
  if(r==="dating") return pick(["想你了","抱抱。今天好想你","要不要視訊，想看你","寶貝你在幹嘛"]);
  return pick(["是喔","然後呢","這樣喔","好喔","哈哈好","可以啊"]);
}
function hi(){
  var rel=RELS.filter(function(x){return x[0]===S.relation})[0][1];
  var text="安安";
  if(S.relation==="dating"){
    text=S.personality==="soft"?"你在嗎…想看你。可以視訊嗎":S.personality==="warm"?"安安！想你了啦。快接視訊":"安安，剛下班。想你了。要不要視訊一下";
  } else if(S.relation==="childhood") text="安安，好久不見喔。你在幹嘛";
  S.messages=[{who:"sys",text:"與 "+S.theirName+" 的對話　"+S.job+"　"+rel},{who:"them",text:text}];
  S.turns=0; S.incoming=false;
  if(S.relation==="dating") setTimeout(function(){ if(S.screen==="chat"){ S.incoming=true; draw(); } },2200);
}
function fileUrl(f){return URL.createObjectURL(f)}
function afterReply(text){
  S.turns+=1;
  if(S.screen==="chat"&&S.relation==="dating"&&(text.indexOf("視訊")>=0||S.turns%4===0)){
    S.incoming=true;
    if(text.indexOf("視訊")<0) text+="\n想看你，接一下嘛";
  }
  S.messages.push({who:"them",text:text}); S.typing=false; draw(); speak(text);
}
function send(text){
  var t=(text||"").trim(); if(!t||S.typing) return;
  if(S.incoming&&/好啊|好呀|可以|接|開/.test(t)){
    S.messages.push({who:"me",text:t}); S.incoming=false; S.screen="call"; draw(); return;
  }
  S.messages.push({who:"me",text:t}); S.typing=true; draw();
  setTimeout(function(){ afterReply(reply(t)); },700);
}
function sendSticker(label){
  if(S.typing) return;
  S.messages.push({who:"me",kind:"sticker",text:label}); S.typing=true; draw();
  setTimeout(function(){ afterReply(label==="真的假的"?"啥":"是喔"); },700);
}
function sendImg(url){
  if(S.typing) return;
  S.messages.push({who:"me",kind:"image",image:url,text:""}); S.typing=true; draw();
  setTimeout(function(){ afterReply(pick(["這張怎樣 好看欸","你在哪拍的"])); },700);
}
function $(id){return document.getElementById(id)}
function inviteHtml(){
  if(!S.incoming||S.screen==="call") return "";
  return '<div class="invite"><div class="invcard">'+
    '<p class="gold">LINE 視訊來電</p>'+
    face(S.media,S.mediaKind,S.theirName,"invav")+
    "<b>"+esc(S.theirName)+"</b><p>想看你，要不要接？</p>"+
    '<div class="invbtns"><button class="hang" id="no">掛斷</button><button class="btn" id="yes" style="width:auto;padding:0 24px;margin:0">接聽</button></div>'+
  "</div></div>";
}
function draw(){
  var app=$("app"); if(!app) return;
  if(S.screen==="setup"){
    app.innerHTML='<header class="top"><b>曖了曖了LIVE <span class="gold">(獨享版)</span></b><span class="muted">遊戲視窗</span></header>'+
    '<main class="pad">'+
      '<p class="muted">上傳形象、選語音跟個性後開始。</p>'+
      '<div class="two">'+
        '<div><label>你的形象</label><div class="up" id="upme">'+(S.myMedia?face(S.myMedia,S.myKind,S.myName,"fill"):"點這裡上傳你的照片或短影片")+"</div></div>"+
        '<div><label>對方形象</label><div class="up" id="up">'+(S.media?face(S.media,S.mediaKind,S.theirName,"fill"):"點這裡上傳對方的照片或短影片")+"</div></div>"+
      "</div>"+
      '<label>你的名字</label><input id="me" type="text" value="'+esc(S.myName)+'"/>'+
      '<label>對方名字</label><input id="them" type="text" value="'+esc(S.theirName)+'"/>'+
      '<label>對方職業</label><input id="job" type="text" value="'+esc(S.job)+'"/>'+
      '<div class="chips">'+JOBS.map(function(j){return '<button class="chip '+(S.job===j?"on":"")+'" data-job="'+j+'">'+j+"</button>"}).join("")+"</div>"+
      "<label>你們的關係</label>"+
      '<div class="rels">'+RELS.map(function(x){return '<button class="rel '+(S.relation===x[0]?"on":"")+'" data-rel="'+x[0]+'">'+x[1]+"</button>"}).join("")+"</div>"+
      "<label>語音朗讀</label>"+
      '<button class="rel '+(S.voiceOn?"on":"")+'" id="von">'+(S.voiceOn?"語音朗讀：開":"語音朗讀：關")+"</button>"+
      "<label>女主語音</label>"+
      '<div class="rels">'+VOICES.map(function(x){return '<button class="rel '+(S.voice===x[0]?"on":"")+'" data-voice="'+x[0]+'">'+x[1]+"</button>"}).join("")+"</div>"+
      "<label>個性</label>"+
      '<div class="rels">'+PERS.map(function(x){return '<button class="rel '+(S.personality===x[0]?"on":"")+'" data-p="'+x[0]+'">'+x[1]+"</button>"}).join("")+"</div>"+
      '<button class="btn" id="go">開始聊天</button>'+
    "</main>";
    app.querySelectorAll("[data-job]").forEach(function(b){b.onclick=function(){S.job=b.getAttribute("data-job");draw()}});
    app.querySelectorAll("[data-rel]").forEach(function(b){b.onclick=function(){S.relation=b.getAttribute("data-rel");draw()}});
    app.querySelectorAll("[data-voice]").forEach(function(b){b.onclick=function(){S.voice=b.getAttribute("data-voice");draw()}});
    app.querySelectorAll("[data-p]").forEach(function(b){b.onclick=function(){S.personality=b.getAttribute("data-p");draw()}});
    $("von").onclick=function(){S.voiceOn=!S.voiceOn;draw()};
    $("me").oninput=function(e){S.myName=e.target.value};
    $("them").oninput=function(e){S.theirName=e.target.value};
    $("job").oninput=function(e){S.job=e.target.value};
    function pickFile(who){
      var i=document.createElement("input"); i.type="file"; i.accept="image/*,video/*";
      i.onchange=function(){var f=i.files[0]; if(!f)return; var k=f.type.indexOf("video/")===0?"video":"img";
        if(who==="me"){S.myMedia=fileUrl(f);S.myKind=k} else {S.media=fileUrl(f);S.mediaKind=k} draw()};
      i.click();
    }
    $("up").onclick=function(){pickFile("them")};
    $("upme").onclick=function(){pickFile("me")};
    $("go").onclick=function(){hi();S.screen="chat";draw()};
    return;
  }
  if(S.screen==="call"){
    var media=S.mediaKind==="video"?'<video class="fill" src="'+S.media+'" autoplay muted loop playsinline></video>':S.media?'<img class="fill" src="'+S.media+'" alt="">':face(null,null,S.theirName,"invav");
    app.innerHTML='<div class="call">'+media+'<div class="shade"></div><div class="ui">'+
      '<div class="top">'+esc(S.theirName)+" · 視訊中也可以打字</div>"+
      '<div class="logs" id="logs"></div>'+
      '<form class="composer" id="cf"><textarea id="cin" rows="1" placeholder="視訊中傳訊…"></textarea><button class="send" type="submit">傳送</button></form>'+
      '<div class="hangwrap"><button class="hang" id="hang" type="button">掛斷</button></div>'+
    "</div></div>";
    fillLogs($("logs"));
    $("cf").onsubmit=function(e){e.preventDefault();send($("cin").value);};
    $("hang").onclick=function(){S.screen="chat";S.incoming=false;S.messages.push({who:"sys",text:"通話已結束"});draw()};
    $("cin").focus();
    return;
  }
  app.innerHTML='<header class="top"><b>曖了曖了LIVE <span class="gold">(獨享版)</span></b><span class="muted">遊戲視窗</span></header>'+
  '<div class="chat">'+
    '<div class="chatbar">'+
      '<button class="icon" id="back" type="button">←</button>'+
      face(S.media,S.mediaKind,S.theirName,"av")+
      '<div style="flex:1;min-width:0"><b>'+esc(S.theirName)+'</b><div class="muted">'+(S.typing?"輸入中…":"在線上")+" · "+esc(S.job)+"</div></div>"+
      '<button class="icon '+(S.voiceOn?"on":"")+'" id="vo" type="button">'+(S.voiceOn?"語音開":"語音關")+"</button>"+
      '<button class="icon" id="wall" type="button">背景</button>'+
      '<button class="icon" id="vid" type="button">視訊</button>'+
    "</div>"+
    '<div class="stage">'+(S.wall?'<img class="wall" src="'+S.wall+'" alt=""><div class="dim"></div>':"")+'<div class="logs" id="logs"></div></div>'+
    '<div class="tray" id="tray" hidden>'+STICKERS.map(function(s){return '<button class="sticker" data-s="'+s+'" type="button">'+s+"</button>"}).join("")+"</div>"+
    '<form class="composer" id="cf">'+
      '<button class="icon" id="smile" type="button">☺</button>'+
      '<button class="icon" id="imgb" type="button">＋</button>'+
      '<textarea id="cin" rows="1" placeholder="輸入訊息…"></textarea>'+
      '<button class="send" type="submit">傳送</button>'+
    "</form></div>"+inviteHtml();
  fillLogs($("logs"));
  $("back").onclick=function(){S.screen="setup";draw()};
  $("vid").onclick=function(){S.screen="call";S.incoming=false;draw()};
  $("vo").onclick=function(){S.voiceOn=!S.voiceOn;draw()};
  $("smile").onclick=function(){var t=$("tray"); t.hidden=!t.hidden};
  $("tray").querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){sendSticker(b.getAttribute("data-s"))}});
  $("cf").onsubmit=function(e){e.preventDefault();send($("cin").value)};
  $("cin").onkeydown=function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send($("cin").value)}};
  $("imgb").onclick=function(){var i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=function(){if(i.files[0])sendImg(fileUrl(i.files[0]))};i.click()};
  $("wall").onclick=function(){var i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=function(){if(i.files[0]){S.wall=fileUrl(i.files[0]);draw()}};i.click()};
  if($("yes")) $("yes").onclick=function(){S.incoming=false;S.screen="call";draw()};
  if($("no")) $("no").onclick=function(){S.incoming=false;S.messages.push({who:"sys",text:"你拒絕了視訊"},{who:"them",text:"好喔，那先聊天"});draw()};
  $("cin").focus();
}
function fillLogs(box){
  box.innerHTML=S.messages.map(function(m){
    if(m.who==="sys") return '<p class="sys"><span>'+esc(m.text)+"</span></p>";
    var inner=m.kind==="sticker"?'<div class="sticker">'+esc(m.text)+"</div>":m.kind==="image"?'<img class="pic" src="'+m.image+'" alt="">':'<div class="bub">'+esc(m.text).replace(/\n/g,"<br>")+"</div>";
    return '<div class="row '+m.who+'">'+(m.who==="them"?face(S.media,S.mediaKind,S.theirName,"av"):"")+"<div>"+inner+"</div></div>";
  }).join("")+(S.typing?'<p class="sys"><span>輸入中…</span></p>':"");
  box.scrollTop=box.scrollHeight;
}
try{draw()}catch(e){document.getElementById("app").innerHTML="<p style='padding:24px'>開啟失敗</p>"}

var curMode=null;
/* 主题切换 */
function toggleTheme(){
  var html=document.documentElement;
  var cur=html.getAttribute("data-theme");
  if(cur==="light"){html.removeAttribute("data-theme");localStorage.setItem("sc_theme","dark");document.getElementById("thBtn").textContent="🌙";}
  else{html.setAttribute("data-theme","light");localStorage.setItem("sc_theme","light");document.getElementById("thBtn").textContent="☀️";}
}
/* 主题/动画 持久化初始化 */
(function(){
  if(localStorage.getItem("sc_theme")==="light"){document.documentElement.setAttribute("data-theme","light");var tb=document.getElementById("thBtn");if(tb)tb.textContent="☀️";}
  if(localStorage.getItem("sc_anim")==="off"){
    var ab=document.getElementById("animBtn");if(ab)ab.textContent="💤";
    var sc0=document.getElementById("stars");if(sc0)sc0.style.display="none";
    if(window.__starSetEnabled)window.__starSetEnabled(false);
    document.body.classList.add("no-anim");
  }
})();
ov();
function toggleAnim(){
  var ab=document.getElementById("animBtn");
  if(localStorage.getItem("sc_anim")==="off"){
    localStorage.setItem("sc_anim","on");if(ab)ab.textContent="✨";
    var sc1=document.getElementById("stars");if(sc1)sc1.style.display="";
    if(window.__starSetEnabled)window.__starSetEnabled(true);
    document.body.classList.remove("no-anim");
  }else{
    localStorage.setItem("sc_anim","off");if(ab)ab.textContent="💤";
    var sc2=document.getElementById("stars");if(sc2)sc2.style.display="none";
    if(window.__starSetEnabled)window.__starSetEnabled(false);
    document.body.classList.add("no-anim");
  }
}
/* 音效 (Web Audio 合成, 无需音频文件) */
function snd(){
  try{
    var AC=window.__ac||(window.__ac=new (window.AudioContext||window.webkitAudioContext)());
    if(AC.state==="suspended")AC.resume();
    var o=AC.createOscillator(),g=AC.createGain();
    o.type="sine";o.frequency.setValueAtTime(800,AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(2000,AC.currentTime+0.08);
    g.gain.setValueAtTime(0.32,AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.18);
    o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+0.2);
    var o2=AC.createOscillator(),g2=AC.createGain();
    o2.type="sine";o2.frequency.setValueAtTime(240,AC.currentTime);
    o2.frequency.exponentialRampToValueAtTime(110,AC.currentTime+0.12);
    g2.gain.setValueAtTime(0.2,AC.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.16);
    o2.connect(g2);g2.connect(AC.destination);o2.start();o2.stop(AC.currentTime+0.2);
  }catch(e){}
}
function ac(){try{var a=window.__ac||(window.__ac=new (window.AudioContext||window.webkitAudioContext)());if(a.state==="suspended")a.resume();return a;}catch(e){return null;}}
function tick(){try{var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain();o.type="triangle";o.frequency.value=1800;g.gain.setValueAtTime(0.05,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.03);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.04);}catch(e){}}
function ding(){try{var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.setValueAtTime(1046,a.currentTime);o.frequency.exponentialRampToValueAtTime(1568,a.currentTime+0.08);g.gain.setValueAtTime(0.12,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.2);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.22);}catch(e){}}
function click(){try{var a=ac();if(!a)return;var t=a.currentTime;
    // FM 调频合成 → 玻璃/金属的不谐和泛音 (真实玻璃声关键)
    var base=2300+Math.random()*700,c=a.createOscillator(),m=a.createOscillator(),mg=a.createGain(),g=a.createGain();
    c.type="sine";c.frequency.value=base;m.type="sine";m.frequency.value=base*1.618;mg.gain.value=base*0.5;
    m.connect(mg);mg.connect(c.frequency);
    g.gain.setValueAtTime(0.14,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    c.connect(g);g.connect(a.destination);c.start(t);m.start(t);c.stop(t+0.11);m.stop(t+0.11);
    var b=a.createBuffer(1,Math.floor(a.sampleRate*0.005),a.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);var n=a.createBufferSource();n.buffer=b;var ng=a.createGain();ng.gain.setValueAtTime(0.06,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.008);n.connect(ng);ng.connect(a.destination);n.start(t);
  }catch(e){}}
function whoosh(){try{var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.setValueAtTime(400,a.currentTime);o.frequency.exponentialRampToValueAtTime(1800,a.currentTime+0.15);g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.2);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.22);}catch(e){}}
function chime(){try{var a=ac();if(!a)return;[[1319,0],[1760,0.1]].forEach(function(n){var o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.value=n[0];g.gain.setValueAtTime(0.12,a.currentTime+n[1]);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+n[1]+0.2);o.connect(g);g.connect(a.destination);o.start(a.currentTime+n[1]);o.stop(a.currentTime+n[1]+0.25);});}catch(e){}}
function err(){try{var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.setValueAtTime(180,a.currentTime);o.frequency.exponentialRampToValueAtTime(110,a.currentTime+0.18);g.gain.setValueAtTime(0.12,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.28);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.32);}catch(e){}}
function swish(){try{var a=ac();if(!a)return;var o=a.createOscillator(),g=a.createGain();o.type="triangle";o.frequency.setValueAtTime(1100,a.currentTime);o.frequency.exponentialRampToValueAtTime(400,a.currentTime+0.12);g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.16);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.18);}catch(e){}}
(function(){
  var logo=document.querySelector(".logo"),title=document.getElementById("title"),busy=false;
  if(logo)logo.addEventListener("click",function(){
    if(busy)return;busy=true;
    snd();
    var vEl=document.getElementById("logoVer");
    if(vEl&&window.__ver)vEl.textContent=window.__ver;
    logo.classList.add("flip");
    logo.classList.remove("pop");void logo.offsetWidth;logo.classList.add("pop");
    setTimeout(function(){logo.classList.remove("pop")},700);
    if(title){
      var chs=title.querySelectorAll(".ch");
      for(var j=0;j<chs.length;j++)chs[j].style.animation="none";
      void title.offsetWidth;
      for(var k=0;k<chs.length;k++)chs[k].style.animation="chWave .6s cubic-bezier(.34,1.56,.64,1) "+(k*0.05)+"s";
    }
    var rect=logo.getBoundingClientRect();
    var cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    for(var i=0;i<18;i++){
      var s=document.createElement("div");s.className="lburst";
      var sz=(6+Math.random()*10).toFixed(1);s.style.width=sz+"px";s.style.height=sz+"px";
      s.style.left=cx+"px";s.style.top=cy+"px";
      var a=Math.random()*Math.PI*2,sp=45+Math.random()*90;
      s.style.setProperty("--dx",(Math.cos(a)*sp).toFixed(0)+"px");
      s.style.setProperty("--dy",(Math.sin(a)*sp-45).toFixed(0)+"px");
      s.style.setProperty("--rot",(Math.random()*360-180).toFixed(0)+"deg");
      s.style.animationDuration=(0.5+Math.random()*0.6).toFixed(2)+"s";
      s.style.animationDelay=(Math.random()*0.08).toFixed(2)+"s";
      document.body.appendChild(s);
      (function(el){setTimeout(function(){el.remove()},1400)})(s);
    }
    setTimeout(function(){logo.classList.remove("flip");busy=false;},2000);
  });
})();
/* 星光系统 */
(function(){
  var container=document.getElementById("stars");
  var count=50;
  var PAL=["#ffffff","#ffffff","#f0f4ff","#dbe4ff","#c7d2fe","#a5b4fc","#9d8cff"];
  function rnd(a,b){return a+Math.random()*(b-a);}
  function makeStar(){
    var s=document.createElement("div");
    var r=rnd(0.8,2.4);
    s.style.width=s.style.height=r+"px";
    s.style.color=PAL[Math.floor(Math.random()*PAL.length)];
    s.style.setProperty("--sx",rnd(0,window.innerWidth)+"px");
    s.style.setProperty("--sy",rnd(0,window.innerHeight)+"px");
    s.style.setProperty("--dx",rnd(-10,10)+"px");
    s.style.setProperty("--dy",rnd(-8,8)+"px");
    s.style.setProperty("--ex",rnd(-window.innerWidth*1.5,window.innerWidth*1.5)+"px");
    s.style.setProperty("--ey",rnd(-window.innerHeight*1.5,window.innerHeight*1.5)+"px");
    s.style.setProperty("--dur",rnd(1.2,4)+"s");
    s.style.setProperty("--delay",(-rnd(0,5))+"s");
    s.style.setProperty("--o1",rnd(0.6,1));
    s.style.setProperty("--o2",rnd(0.05,0.25));
    var b=Math.random();
    s.className="star "+(b<0.3?"star-glint":(b<0.7?"star-twinkle":(b<0.88?"star-drift":"star-still")));
    container.appendChild(s);
  }
  for(var i=0;i<count;i++)makeStar();
  window.__starApplyMode=function(){};window.__starApplyTab=function(){};
  window.__starEscape=function(){document.body.classList.remove("stars-return");document.body.classList.add("stars-escape");};
  window.__starReturn=function(){document.body.classList.remove("stars-escape");document.body.classList.add("stars-return");setTimeout(function(){document.body.classList.remove("stars-return");},1000);};
  window.__starReset=function(){document.body.classList.remove("stars-escape","stars-return");};
  window.__starSetEnabled=function(on){document.body.classList.toggle("stars-off",!on);};
  window.__starPause=function(){};window.__starResume=function(){};
})();
/* 流星 (右上→左下, 极快滑过 + 细长亮拖尾跟随) */
(function(){
  var box=document.getElementById("stars");if(!box)return;
  for(var i=0;i<1;i++){
    var m=document.createElement("div");m.className="meteor";
    var dur=6+Math.random()*5;
    m.style.top=(Math.random()*25)+"vh";
    m.style.left=(90+Math.random()*25)+"vw";
    m.style.setProperty("--dur",dur+"s");
    m.style.setProperty("--delay",(-Math.random()*dur)+"s");
    m.style.setProperty("--dist",(135+Math.random()*35)+"vw");
    m.innerHTML='<i class="m-head"></i>';
    box.appendChild(m);
  }
})();
/* 水波纹 */
(function(){
  function addRipple(e){
    var el=e.currentTarget,rect=el.getBoundingClientRect(),size=Math.max(rect.width,rect.height);
    var x=e.clientX-rect.left-size/2,y=e.clientY-rect.top-size/2;
    var r=document.createElement("span");r.className="ripple";
    r.style.width=r.style.height=size+"px";r.style.left=x+"px";r.style.top=y+"px";
    el.appendChild(r);setTimeout(function(){r.remove()},650);
  }
  document.querySelectorAll(".tab,.sm,.stats .b,.mode-btn,.btn-go,.theme-btn,.wl-item").forEach(function(el){el.addEventListener("click",function(e){if(!el.classList.contains("no-tick"))click();addRipple(e);});});
})();
window.onerror=function(m,s,l){try{var t=document.getElementById("toast");if(t){t.textContent="⛔ 页面错误 #"+l;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove("show")},5000);}}catch(e){}};
function tt(m){var t=document.getElementById("toast");t.textContent=m;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove("show")},2200)}
document.querySelectorAll(".tab").forEach(function(t){t.addEventListener("click",function(){
  document.querySelectorAll(".tab").forEach(function(x){x.classList.remove("active")});
  document.querySelectorAll(".page").forEach(function(x){x.classList.remove("on")});
  t.classList.add("active");document.getElementById("p-"+t.dataset.p).classList.add("on");
  if(window.__starApplyTab)__starApplyTab(t.dataset.p);
  if(t.dataset.p==="stats"){if(typeof loadChart==="function")loadChart();if(window.__waterResume)window.__waterResume();}
  else{if(window.__waterPause)window.__waterPause();}

})});
function setGoText(t){
  var o=document.getElementById("goOld"),n=document.getElementById("goNew"),w=document.getElementById("goBtn");
  if(!o||!n||!w)return;
  if(n.textContent)o.textContent=n.textContent;
  n.textContent=t;
  w.classList.remove("go-anim");
  void w.offsetWidth;
  w.classList.add("go-anim");
}
function selectMode(m){
  if(m===curMode)return;curMode=m;
  document.querySelectorAll(".mode-btn").forEach(function(b){b.classList.remove("active")});
  var hint=document.getElementById("modeHint"),go=document.getElementById("goBtn");
  var nt,nc,nh;
  if(m===1){document.querySelector(".mode-btn.test").classList.add("active");nt="▶ 开始试运行";nc="btn-go go-test";nh="✅ 已选择：试运行模式（只扫描，不删除）";}
  else{document.querySelector(".mode-btn.clean").classList.add("active");nt="▶ 立即清理";nc="btn-go go-clean";nh="⚠️ 已选择：清理模式（将删除缓存文件）";}
  go.className=nc;
  hint.textContent=nh;go.style.display="block";document.getElementById("res").style.display="none";
  setGoText(nt);
  if(window.__starApplyMode)__starApplyMode(m);
}
function tk(url){if(!window.WT)return url;return url+(url.indexOf("?")>=0?"&":"?")+"token="+encodeURIComponent(window.WT);}
function fs(k){k=Number(k)||0;if(k>=1048576)return(k/1048576).toFixed(1)+"G";if(k>=1024)return(k/1024).toFixed(1)+"M";return k+"K"}
function ft(ts){if(!ts||ts=="0")return"从未";var d=new Date(Number(ts)*1000);return d.toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}
async function ov(){
  try{
    var d=await(await fetch("/cgi-bin/status.cgi")).json();
    document.getElementById("lastClean").textContent=ft(d.last_clean);
    document.getElementById("totalFreed").textContent=fs(d.total_freed);
    setTraffic(d.locked);
    var nc=document.getElementById("nextClean");if(nc)nc.textContent=d.next_clean?("下次清理: "+ft(d.next_clean)):"下次清理: --";
    // 存储清爽度
    if(d.storage_total){
      var pct=Math.min(100,Math.max(0,Math.round(d.storage_free/d.storage_total*100)));window.__waterPct=pct;
      document.getElementById("stPct").textContent=pct+"%";
      document.getElementById("stUsed").textContent=fs(d.storage_total-d.storage_free);
      document.getElementById("stFree").textContent=fs(d.storage_free);
      document.getElementById("stTotal").textContent=fs(d.storage_total);
    }
    // 模块状态
    var mv=document.getElementById("msVer");
    if(mv){
      mv.textContent=d.version||"-";window.__ver=d.version||"v1.0-b3";
      var md=document.getElementById("msDaemon");md.textContent=d.daemon?"● 运行中":"○ 已停止";md.className=d.daemon?"on":"off";
      var mw=document.getElementById("msWeb");mw.textContent=d.web?"● 正常":"○ 未运行";mw.className=d.web?"on":"off";
      document.getElementById("msLast").textContent=ft(d.last_clean);
      document.getElementById("msNext").textContent=d.next_clean?ft(d.next_clean):"--";
    }
  }catch(e){}
}
async function run(){
  if(curMode===null){tt("请先选择清理模式");return}
  var go=document.getElementById("goBtn");go.disabled=true;whoosh();var t0=Date.now();
  var mw=document.querySelector("#p-clean .mode-wrap");
  var ca=document.getElementById("cleanAnim");
  var card=document.getElementById("p-clean");
  if(card)card.classList.add("cleaning");
  var caText=document.getElementById("caText");
  if(caText)caText.textContent=(curMode===1)?"🔍 正在扫描垃圾…":"🧹 正在清扫垃圾…";
  var caw=document.getElementById("cleanAnimWrap");
  setTimeout(function(){if(caw)caw.classList.add("show");if(ca)ca.classList.add("show");},280);
  setTimeout(function(){if(mw)mw.style.display="none";if(go)go.style.display="none";},330);
  document.getElementById("res").style.display="none";
  var dry=(curMode===1);setTraffic(true);
  if(dry){document.body.classList.add("scan-wait");}else{if(window.__starEscape)__starEscape();}
  try{
    var d=await(await fetch(tk("/cgi-bin/clean.cgi?dry="+(dry?"1":"0")))).json();
    var ok=d&&d.ok!==false;
    if(ok){
      if(window.__starReturn)__starReturn();
      setGoText((dry?"🔍 试运行完成 ":"✅ 清理完成 ⚡ ")+((Date.now()-t0)/1000).toFixed(2)+"s");chime();
  if(!dry)freshBurst();
      var h="<div style=\"font-size:13px;font-weight:700;color:"+(dry?"var(--warn)":"var(--lime1)")+"\" class=\""+(dry?"":"lime-g")+"\">"+(dry?"📋 可清理明细（以下目录）":"🗑️ 清理明细")+"</div>";
      var items=[];
      if(d.items&&d.items.length){
        d.items.forEach(function(i){
          if(i.type==="skip"||i.type==="none")return;
          var fk=Number(i.freed_kb)||0;
          items.push({path:i.path,fk:fk});
        });
      }
      if(!dry)h+="<div style=\"text-align:center;margin:8px 0 4px 0\"><span class=\"lime-num\" style=\"font-size:26px;font-weight:800;line-height:1.2\">"+fs(d.freed_kb)+"</span><div style=\"font-size:10px;color:var(--t2);margin-top:2px\">⚡ 耗时 "+((Date.now()-t0)/1000).toFixed(2)+"s</div></div>";
      var res=document.getElementById("res");
      res.style.display="block";res.innerHTML=h;res.classList.remove("res-in");void res.offsetWidth;res.classList.add("res-in");
      if(dry){var e=document.getElementById("estBox");if(e){e.style.display="block";document.getElementById("estTxt").textContent="预计可释放 "+fs(d.freed_kb);}}
      if(!items.length){var ne=document.createElement("div");ne.className="res-item";ne.style.cssText="text-align:center;padding:16px;color:var(--t2);font-size:12px";ne.innerHTML=dry?"<span class=\"lime-g\">🍋 无可清理垃圾</span>":"<span class=\"lime-g\">🍋 已清理干净，暂无垃圾</span>";res.appendChild(ne);}
      items.forEach(function(it,idx){
          if(idx>=25)return;
          var d2=document.createElement("div");
          d2.className="res-item";
          d2.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 2px;border-bottom:1px solid var(--border);font-size:11px";
          d2.innerHTML="<span style=\"flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\">"+esc(it.path)+"</span><span class=\""+(it.fk>0?"lime-g":"")+"\" style=\"color:"+(it.fk>0?"var(--lime1)":"var(--t2)")+"\">"+(it.fk>0?"+"+fs(it.fk):"0")+"</span>";
          res.appendChild(d2);
      });
      if(items.length>25){
        var more=document.createElement("div");
        more.style.cssText="text-align:center;padding:10px;color:var(--t2);font-size:11px";
        more.textContent="… 共 "+items.length+" 项";
        res.appendChild(more);
      }
    }else{setGoText("❌ 失败");if(window.__starReset)__starReset();err();tt("清理返回异常");}
    setTraffic(false);ov();loadLog();
  }catch(e){setGoText("❌ 失败");if(window.__starReset)__starReset();err();tt("失败: "+(e.message||""));}
  finally{document.body.classList.remove("scan-wait");go.disabled=false;setTraffic(false);if(mw)mw.style.display="flex";if(go)go.style.display="block";if(ca)ca.classList.remove("show");if(caw)caw.classList.remove("show");if(card)card.classList.remove("cleaning");setTimeout(function(){setGoText("▶ 开始执行")},1200)}
}
/* 清理历史图表 */
async function loadChart(){
  try{
    var d=await(await fetch("/cgi-bin/history.cgi")).json();
    var days=d.days||[];
    var list=document.getElementById("dayList");list.innerHTML="";
    if(!days.length){list.innerHTML="<div class=\"lime-g\" style=\"text-align:center;padding:20px;font-size:12px\">🍋 暂无数据</div>";return;}
    var total=0,maxV=0;
    days.forEach(function(x){var v=Number(x.freed_kb)||0;total+=v;if(v>maxV)maxV=v;});
    if(maxV<1)maxV=1;
    var avg=days.length?Math.round(total/days.length):0;
    var n=days.length;
    // 统一单位: 按最大值自动选 KB/MB/GB
    var unit="KB",dv=1;
    if(maxV>=1048576){unit="GB";dv=1048576;}
    else if(maxV>=1024){unit="MB";dv=1024;}
    function fmt(v){var f=v/dv;return f>=100?Math.round(f):(f>=10?f.toFixed(1):f.toFixed(2));}
    var CW=360,CH=180,PD=40;
    var px=[];days.forEach(function(x,i){px.push(PD+(CW-PD-10)*(i/((n>1)?n-1:1)));});
    var py=days.map(function(x){return CH-PD-(x.freed_kb/maxV)*(CH-PD*2);});
    var mi=0;days.forEach(function(x,i){if((Number(x.freed_kb)||0)>(Number(days[mi].freed_kb)||0))mi=i;});
    var pts=px.map(function(x,i){return x.toFixed(1)+","+py[i].toFixed(1);}).join(" ");
    var svg="<svg viewBox=\"0 0 "+CW+" "+CH+"\" class=\"linechart\" aria-hidden=\"true\">";
    svg+="<defs><linearGradient id=\"lcGrad\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0%\" stop-color=\"var(--lime1)\"/><stop offset=\"100%\" stop-color=\"var(--lime2)\"/></linearGradient></defs>";
    // 单位角标 (一次性)
    svg+="<text x=\""+(CW-8)+"\" y=\"14\" text-anchor=\"end\" class=\"lc-unit\">单位: "+unit+"/天</text>";
    // Y 轴 5 档圆整刻度
    var ticks=[1,0.75,0.5,0.25,0];
    for(var t=0;t<ticks.length;t++){
      var r=ticks[t];
      var gy=(PD+(1-r)*(CH-PD*2)).toFixed(1);
      var gv=Math.round(maxV*r);
      svg+="<line x1=\""+PD+"\" y1=\""+gy+"\" x2=\""+(CW-10)+"\" y2=\""+gy+"\" stroke=\"var(--border)\" stroke-width=\"1\" stroke-dasharray=\"2,3\"/>";
      svg+="<text x=\""+(PD-6)+"\" y=\""+(gy+3)+"\" text-anchor=\"end\" class=\"lc-label\">"+fmt(gv)+"</text>";
    }
    svg+="<polygon points=\""+PD+","+(CH-PD)+" "+pts+" "+px[n-1].toFixed(1)+","+(CH-PD)+"\" fill=\"url(#lcGrad)\" opacity=\".22\"/>";
    svg+="<polyline points=\""+pts+"\" fill=\"none\" stroke=\"url(#lcGrad)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>";
    var step=Math.ceil(n/8);
    days.forEach(function(x,i){
      var isMax=(i===mi);
      svg+="<circle cx=\""+px[i].toFixed(1)+"\" cy=\""+py[i].toFixed(1)+"\" r=\""+(isMax?5:3)+"\" fill=\""+(isMax?"#fbbf24":"var(--lime1)")+"\" stroke=\"var(--bg)\" stroke-width=\"1.5\"/>";
      if(n<=8||i%step===0||isMax) svg+="<text x=\""+px[i].toFixed(1)+"\" y=\""+(py[i]-7).toFixed(1)+"\" text-anchor=\"middle\" class=\"lc-val"+(isMax?" lc-val-max":"")+"\">"+fmt(x.freed_kb)+"</text>";
      if(n<=8||i%step===0||i===n-1) svg+="<text x=\""+px[i].toFixed(1)+"\" y=\""+(CH-8)+"\" text-anchor=\"middle\" class=\"lc-label\">"+x.date.slice(5)+"</text>";
    });
    svg+="</svg>";
    list.innerHTML=svg;
    // 统计行 (统一单位, 单位仅一次)
    var st=document.createElement("div");st.className="lc-stats";
    st.innerHTML="<span>峰值 <b class=\"lime-g\">"+fmt(maxV)+" "+unit+"</b>/天</span><span>平均 <b class=\"lime-g\">"+fmt(avg)+" "+unit+"</b>/天</span><span>共 <b class=\"lime-g\">"+n+"</b> 天</span>";
    list.appendChild(st);
  }catch(e){document.getElementById("dayList").innerHTML="<div style=\"text-align:center;color:var(--t2);padding:20px;font-size:12px\">加载失败</div>";}
}
/* 白名单可视化 */
var WL_ITEMS=[
  {path:"/cache",label:"系统根缓存",icon:"🗂️",group:"系统缓存"},
  {path:"/data/cache",label:"系统数据缓存",icon:"🗂️",group:"系统缓存"},
  {path:"/data/system/package_cache",label:"包管理器缓存",icon:"🗂️",group:"系统缓存"},
  {path:"/data/system/app_icons",label:"应用图标缓存",icon:"🗂️",group:"系统缓存"},
  {path:"/data/system/sync",label:"同步缓存",icon:"🗂️",group:"系统缓存"},
  {path:"/data/log",label:"系统日志 (保留7天)",icon:"📄",group:"日志与报告"},
  {path:"/data/anr",label:"ANR 报告 (保留7天)",icon:"📄",group:"日志与报告"},
  {path:"/data/tombstones",label:"崩溃记录 (保留7天)",icon:"📄",group:"日志与报告"},
  {path:"/data/system/dropbox",label:"系统报告 (保留7天)",icon:"📄",group:"日志与报告"},
  {path:"/sdcard/DCIM/.thumbnails",label:"相册缩略图",icon:"🖼️",group:"应用与媒体"},
  {path:"/sdcard/Pictures/.thumbnails",label:"图片缩略图",icon:"🖼️",group:"应用与媒体"},
  {path:"/sdcard/Android/data/*/cache",label:"所有应用缓存",icon:"📱",group:"应用与媒体"},
  {path:"/sdcard/Android/data/*/files/Cache",label:"应用 files/Cache",icon:"📱",group:"应用与媒体"},
  {path:"/sdcard/.FileManagerRecycler",label:"文件管理器回收站",icon:"🗑️",group:"回收站"},
  {path:"/sdcard/.MediaTrash",label:"媒体回收站",icon:"🗑️",group:"回收站"}
];
async function loadWhitelist(){
  var list=document.getElementById("wlList");list.innerHTML="";
  var excluded=[];
  try{
    var r=await getCfg();
    (r.lines||[]).forEach(function(line){
      if(line.indexOf("EXCLUDE_DIR=")===0){var p=line.substring(12).trim();if(p)excluded.push(p);}
    });
  }catch(e){}
  var groups={};
  WL_ITEMS.forEach(function(it){ (groups[it.group]=groups[it.group]||[]).push(it); });
  Object.keys(groups).forEach(function(g){
    var gd=document.createElement("div");gd.className="wl-group";
    gd.innerHTML="<span>"+g+"</span><span class=\"wl-g-count\">"+groups[g].length+" 项</span>";
    list.appendChild(gd);
    groups[g].forEach(function(item){
      var prot=excluded.indexOf(item.path)!==-1;
      var div=document.createElement("div");div.className="wl-item"+(prot?" on":"");
      div.innerHTML="<span class=\"wl-icon\">"+(item.icon||"🗂️")+"</span><span class=\"wl-text\"><span class=\"wl-label\">"+esc(item.label)+"</span><code>"+esc(item.path)+"</code></span><label class=\"wl-switch\"><input type=\"checkbox\" "+(prot?"checked":"")+" onchange=\"wlChange(this)\" data-path=\""+esc(item.path)+"\"><span class=\"wl-slider\"></span></label>";
      list.appendChild(div);
    });
  });
}
function wlChange(cb){
  var it=cb.closest(".wl-item");if(it)it.classList.toggle("on",cb.checked);
  document.getElementById("wlMsg").textContent="⚠️ 已修改，点击保存生效";
}
function wlAll(on){
  document.querySelectorAll("#wlList input[type=checkbox]").forEach(function(cb){cb.checked=!!on;});
  document.querySelectorAll("#wlList .wl-item").forEach(function(el){var c=el.querySelector("input");if(c)el.classList.toggle("on",c.checked);});
  document.getElementById("wlMsg").textContent="⚠️ 已修改，点击保存生效";
}
async function saveWhitelist(){
  var prot=[];
  document.querySelectorAll("#wlList input:checked").forEach(function(cb){prot.push(cb.dataset.path);});
  var keepLines=[], keepAdd=[];
  try{
    var r=await getCfg(true);
    (r.lines||[]).forEach(function(line){
      if(line.indexOf("ADD_DIR=")===0)keepAdd.push(line);
      else if(line.indexOf("EXCLUDE_DIR=")!==0)keepLines.push(line);
    });
  }catch(e){}
  var lines=keepLines.slice();
  keepAdd.forEach(function(l){lines.push(l);});
  prot.forEach(function(p){lines.push("EXCLUDE_DIR="+p);});
  try{
    var d=await(await fetch(tk("/cgi-bin/config.cgi?mode=write"),{method:"POST",body:lines.join("\n")})).json();
    if(d.ok){__cfgCache=null;document.getElementById("wlMsg").textContent="✅ 白名单已保存";chime();tt("白名单已保存");}
    else{document.getElementById("wlMsg").textContent="✗ 保存失败";}
  }catch(e){tt("保存失败");}
}
/* 钟表 */
var clockH=null,clockM=null,clockDrag=null,clockTouched=false;
function initClock(){
  var face=document.getElementById("clockFace");if(!face)return;
  var ns="";
  for(var i=0;i<24;i++){
    var a=i*15-90;
    var x=(120+Math.cos(a*Math.PI/180)*101).toFixed(1),y=(120+Math.sin(a*Math.PI/180)*101).toFixed(1);
    var x2=(120+Math.cos(a*Math.PI/180)*90).toFixed(1),y2=(120+Math.sin(a*Math.PI/180)*90).toFixed(1);
    ns+='<circle class="clock-tick" id="tk'+i+'" cx="'+x+'" cy="'+y+'" r="'+(i%3===0?4:2.5)+'"/>';
    ns+='<text class="clock-num" x="'+x2+'" y="'+y2+'">'+i+'</text>';
  }
  face.innerHTML+=ns;
  ns='<line class="clock-h" id="clockH" x1="120" y1="120" x2="120" y2="65"/>'+'<line class="clock-m" id="clockM" x1="120" y1="120" x2="120" y2="35"/>'+'<circle class="clock-dot" cx="120" cy="120" r="5"/>';
  face.innerHTML+=ns;
  if(clockH==null)setClockTime(new Date().getHours(),new Date().getMinutes());
  var box=document.getElementById("clockBox");
  box.addEventListener("pointerdown",function(e){clockDrag='?';});
  box.addEventListener("pointermove",onClockMove);
  box.addEventListener("pointerup",function(){if(clockDrag&&clockDrag!=="?")ding();clockDrag=null;});
  box.addEventListener("pointerleave",function(){clockDrag=null;});
}
var __hRot=0,__mRot=0;
function setClockTime(h,m){
  if(h==null||m==null)return;
  clockH=((Math.round(h)%24)+24)%24;clockM=((Math.round(m)%60)+60)%60;
  var el=document.getElementById("clockTime");
  if(el)el.textContent=(clockH<10?'0':'')+clockH+':'+(clockM<10?'0':'')+clockM;
  var hr=(clockH+clockM/60)*15, mr=clockM*6;
  while(hr-__hRot>180)hr-=360; while(hr-__hRot<-180)hr+=360;
  while(mr-__mRot>180)mr-=360; while(mr-__mRot<-180)mr+=360;
  __hRot=hr; __mRot=mr;
  var h=document.getElementById("clockH");
  if(h){h.style.transformOrigin="120px 120px";h.style.transform="rotate("+hr+"deg)";}
  var m=document.getElementById("clockM");
  if(m){m.style.transformOrigin="120px 120px";m.style.transform="rotate("+mr+"deg)";}
  for(var i=0;i<24;i++){var t=document.getElementById("tk"+i);if(t)t.setAttribute("class",i===clockH?"clock-tick active":"clock-tick");}
}
function onClockMove(e){
  if(!clockDrag)return;
  var box=document.getElementById("clockBox"),rect=box.getBoundingClientRect();
  var cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  var dx=e.clientX-cx,dy=e.clientY-cy;
  var r=Math.sqrt(dx*dx+dy*dy),scale=rect.width/240;
  var a=Math.atan2(dy,dx)*180/Math.PI+90;if(a<0)a+=360;
  if(clockDrag==='?')clockDrag=(r/scale<72)?'h':'m';
  clockTouched=true;
  if(clockDrag==='h'){
    var th=Math.round(a/15)%24,dh=th-clockH;
    if(dh>12)dh-=24;else if(dh<-12)dh+=24;
    if(dh){tick();setClockTime((clockH+dh+24)%24,clockM);}
  }else{
    var tm=Math.round(a/6)%60,dm=tm-clockM;
    if(dm>30)dm-=60;else if(dm<-30)dm+=60;
    if(dm){tick();setClockTime(clockH,(clockM+dm+60)%60);}
  }
}
function getClockTime(){return clockH!=null?(clockH<10?'0':'')+clockH+':'+(clockM<10?'0':'')+clockM:'';}
async function loadSchedule(){
  try{
    var r=await getCfg();
    var t="",h="";
    (r.lines||[]).forEach(function(l){
      if(l.indexOf("CLEAN_TIME=")===0)t=l.substring(11).trim();
      if(l.indexOf("CLEAN_HOURS=")===0)h=l.substring(12).trim();
    });
    if(t){var sp=t.split(":");setClockTime(parseInt(sp[0])||0,parseInt(sp[1])||0);clockTouched=true;}
    var sel=document.getElementById("ctHours");if(h)sel.value=h;
  }catch(e){}
}
async function saveSchedule(){
  var t=getClockTime(),h=document.getElementById("ctHours").value;
  if(!((t&&clockTouched)||h)){tt("请先拖动钟表或选择间隔");return;}
  try{
    var r=await getCfg(true);
    var keep=(r.lines||[]).filter(function(l){return l.indexOf("CLEAN_TIME=")!==0&&l.indexOf("CLEAN_HOURS=")!==0;});
    if(t&&clockTouched)keep.push("CLEAN_TIME="+t);
    if(h)keep.push("CLEAN_HOURS="+h);
    var d=await(await fetch(tk("/cgi-bin/config.cgi?mode=write"),{method:"POST",body:keep.join("\n")})).json();
    if(d.ok){__cfgCache=null;document.getElementById("cfgMsg").textContent="⏰ 定时设置已保存";chime();tt("定时设置已保存");}
    else{document.getElementById("cfgMsg").textContent="✗ 保存失败";}
  }catch(e){tt("保存失败");}
}
async function clearSchedule(){
  clockTouched=false;
  try{
    var r=await getCfg(true);
    var keep=(r.lines||[]).filter(function(l){return l.indexOf("CLEAN_TIME=")!==0;});
    var d=await(await fetch(tk("/cgi-bin/config.cgi?mode=write"),{method:"POST",body:keep.join("\n")})).json();
    if(d.ok){__cfgCache=null;document.getElementById("cfgMsg").textContent="已清除每日定时，按间隔清理";swish();tt("已清除每日定时");}
    else{document.getElementById("cfgMsg").textContent="✗ 清除失败";}
    loadSchedule();
  }catch(e){tt("清除失败");}
}
var __cfgCache=null;
async function getCfg(f){if(!f&&__cfgCache)return __cfgCache;var d=await(await fetch("/cgi-bin/config.cgi?mode=read")).json();__cfgCache=d;return d;}
async function loadCfg(){try{var d=await getCfg();document.getElementById("cfg").value=(d.lines||[]).join("\n");window.WT="";(d.lines||[]).forEach(function(l){if(l.indexOf("WEB_TOKEN=")===0)window.WT=l.substring(10).trim();});}catch(e){}}
async function saveCfg(){
  var c=document.getElementById("cfg").value;
  try{var d=await(await fetch(tk("/cgi-bin/config.cgi?mode=write"),{method:"POST",body:c})).json();
    document.getElementById("cfgMsg").textContent=d.ok?"✓ 保存成功":"✗ 失败";if(d.ok){__cfgCache=null;chime();tt("配置已保存");}
  }catch(e){tt("保存失败")}
}
async function backupCfg(){
  try{var r=await fetch("/cgi-bin/config.cgi?mode=backup");var t=await r.text();
    var blob=new Blob([t],{type:"text/plain;charset=utf-8"});var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download="sjc_config_"+new Date().toISOString().slice(0,10)+".conf";
    document.body.appendChild(a);a.click();a.remove();tt("📤 配置已备份");
  }catch(e){tt("备份失败")}
}
function restoreCfg(){
  var txt=prompt("粘贴备份的配置内容:","");if(txt===null)return;
  fetch(tk("/cgi-bin/config.cgi?mode=restore"),{method:"POST",body:txt}).then(function(r){return r.json();}).then(function(d){
    if(d.ok){tt("✅ 配置已恢复");loadCfg();}else{tt("恢复失败: "+(d.error||""));}
  }).catch(function(){tt("恢复失败");});
}
async function loadLog(){
  var n=document.getElementById("ln").value;
  var lt=document.getElementById("ltype");var t=lt?lt.value:"";
  var lq=document.getElementById("lq");var q=lq?lq.value.trim():"";
  var url="/cgi-bin/log.cgi?mode="+((t||q)?"filter":"lines")+"&n="+n+(t?"&type="+t:"")+(q?"&q="+encodeURIComponent(q):"");
  try{
    var d=await(await fetch(url)).json();
    document.getElementById("logView").innerHTML=hl(d.content||"");
  }catch(e){document.getElementById("logView").innerHTML="<span class='log-err'>加载失败</span>"}
  try{var d2=await(await fetch("/cgi-bin/log.cgi?mode=stats")).json();
    document.getElementById("logN").textContent=d2.total_clean||0;
    document.getElementById("logF").textContent=fs(d2.total_freed);
    document.getElementById("logS").textContent=fs(d2.size);
    var w=document.getElementById("logW"),e=document.getElementById("logE");
    if(w)w.textContent=(d2.warns||0);if(e)e.textContent=(d2.errors||0);
  }catch(e2){}
}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function fmtKB(k){k=Number(k)||0;if(k>=1048576)return(k/1048576).toFixed(1)+"G";if(k>=1024)return(k/1024).toFixed(1)+"M";return k+"K";}
function relTime(ts){if(!ts)return"";var d=(Date.now()-ts)/1000;if(d<60)return"刚刚";if(d<3600)return Math.floor(d/60)+"分钟前";if(d<86400)return Math.floor(d/3600)+"小时前";return Math.floor(d/86400)+"天前";}
function logSummary(c){
  var lines=(c||"").split("\n");
  for(var i=lines.length-1;i>=0;i--){
    var m=lines[i].match(/DONE\|mode=([a-z]+)\|items=([0-9]+)\|freed_kb=([0-9]+)\|time=([0-9]+)s/);
    if(m)return '<div class="log-summary">最近清理: <b class="'+(m[1]==="test"?"log-warn":"lime-g")+'">'+(m[1]==="test"?"试运行":"清理")+'</b> · '+m[2]+' 项 · 释放 <b class="lime-g">'+fmtKB(m[3])+'</b> · '+m[4]+'s</div>';
  }
  return "";
}
function hl(c){
  if(!c)return '<div style="color:var(--t2);padding:10px;text-align:center">(暂无日志)</div>';
  var out=c.split("\n").map(function(raw){
    var rel="",timeStr="",l=raw;
    var m=l.match(/^\[([0-9-]+ [0-9:]+)\]/);
    if(m){
      var ts=new Date(m[1].replace(/-/g,"/")).getTime();
      rel='<span class="log-rel">'+relTime(ts)+'</span>';
      timeStr='<span class="log-time">'+m[1]+'</span>';
      l=l.substring(m[0].length);
    }
    var cls="",body=esc(l);
    if(l.indexOf("ERR|")===0){cls="log-err";body='🛑 '+esc(l.substring(4));}
    else if(l.indexOf("WARN|")===0){cls="log-warn";body='⚠️ '+esc(l.substring(5));}
    else if(l.indexOf("DONE|")===0){
      cls="log-done";
      var mm=l.match(/^DONE\|mode=([a-z]+)\|items=([0-9]+)\|freed_kb=([0-9]+)\|time=([0-9]+)s/);
      body=mm?'✅ '+(mm[1]==="test"?"试运行完成":"清理完成")+' · '+mm[2]+'项 · 释放 '+fmtKB(mm[3])+' · '+mm[4]+'s':esc(l);
    }
    else if(l.indexOf("CLEAN|")===0){
      cls="log-clean";
      var mm=l.match(/^CLEAN\|([0-9]+)\|([^|]*)\|([0-9]+)\|([0-9]+)/);
      if(mm){var fk=Number(mm[3])-Number(mm[4]);body='🧹 '+esc(mm[2])+' · 释放 '+fmtKB(Math.max(0,fk))+' ('+fmtKB(mm[3])+'→'+fmtKB(mm[4])+')';}
    }
    else if(l.indexOf("SCAN|")===0){
      cls="log-phase";
      var mm=l.match(/^SCAN\|([0-9]+)\|([^|]*)\|([0-9]+)/);
      if(mm)body='🔎 '+esc(mm[2])+' · '+fmtKB(mm[3]);
    }
    else if(l.indexOf("PHASE|")===0){
      cls="log-phase";
      var mm=l.match(/^PHASE\|([^|]*)\|([0-9]+)s/);
      if(mm)body='⏱ '+mm[1]+' · '+mm[2]+'s';
    }
    else if(l.indexOf("DEEP|")===0){
      cls="log-phase";
      var mm=l.match(/^DEEP\|([^|]*)\|?(.*)/);
      if(mm)body='🔍 深扫 '+mm[1]+(mm[2]?' · '+esc(mm[2]):'');
    }
    else if(l.indexOf("CONFIG|")===0){cls="log-ctx";body='⚙️ '+esc(l.substring(7));}
    else if(l.indexOf("SCANINFO|")===0){cls="log-ctx";body='📊 '+esc(l.substring(9));}
    else if(l.indexOf("STORAGE|")===0){cls="log-ctx";var mm=l.match(/free_kb=([0-9]+)/);if(mm)body='💾 可用 '+fmtKB(mm[1]);}
    else if(l.indexOf("CTX|")===0){cls="log-ctx";body='ℹ️ '+esc(l.substring(4));}
    else if(l.indexOf("START|")===0){cls="log-done";body='▶ '+esc(l.substring(6));}
    else if(l.indexOf("SKIP|")===0){cls="log-skip";}
    return '<div class="log-line '+cls+'">'+timeStr+rel+' '+body+'</div>';
  });
  return logSummary(c)+'<div class="log-lines">'+out.join("")+'</div>';
}
async function copyLog(){
  try{
    var d=await(await fetch("/cgi-bin/log.cgi?mode=lines&n=500")).json();
    var t=d.content||"";
    if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){tt("📋 已复制");},function(){fbCopy(t);});}
    else fbCopy(t);
  }catch(e){tt("复制失败")}
}
function fbCopy(t){
  var ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy");tt("📋 已复制");}catch(e){tt("复制失败");}
  ta.remove();
}
async function exportDiag(){
  try{
    var r=await fetch("/cgi-bin/diag.cgi");
    var t=await r.text();
    var blob=new Blob([t],{type:"text/plain;charset=utf-8"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="sjc_diag_"+new Date().toISOString().slice(0,10)+".txt";
    document.body.appendChild(a);a.click();a.remove();
    tt("📦 诊断已导出");
  }catch(e){tt("导出失败")}
}
async function clearLog(){
  if(!confirm("确定清空日志？"))return;
  try{var d=await(await fetch(tk("/cgi-bin/log.cgi?mode=clear"))).json();swish();tt(d.msg||"已清空");loadLog();}catch(e){}
}
function setTraffic(locked){
  var r=document.getElementById("tlRed"),g=document.getElementById("tlGreen"),lbl=document.getElementById("lockLbl");
  if(locked){r.classList.add("on");g.classList.remove("on");lbl.textContent="忙";}
  else{g.classList.add("on");r.classList.remove("on");lbl.textContent="空闲";}
}
setTraffic(false);ov();loadCfg();loadLog();loadChart();loadWhitelist();loadSchedule();initClock();
var _iv=setInterval(function(){if(!document.hidden)ov()},10000);
document.addEventListener("visibilitychange",function(){if(document.hidden){if(window.__starPause)window.__starPause();}else{if(window.__starResume)window.__starResume();ov();}});
/* 青柠光斑生成器: DOM API 构建 SVG(零innerHTML依赖) · 随机/不重叠 */
(function(){
  var LIME_MIN=96,LIME_MAX=190,limes=[];
  var NS="http://www.w3.org/2000/svg";
  function rand(a,b){return a+Math.random()*(b-a);}
  function overlaps(x,y,r){
    for(var i=0;i<limes.length;i++){
      var l=limes[i],dx=l.x-x,dy=l.y-y,min=l.r+r;
      if(dx*dx+dy*dy < min*min)return true;
    }
    return false;
  }
  function el(name,attrs){
    var e=document.createElementNS(NS,name);
    if(attrs)for(var k in attrs)e.setAttribute(k,attrs[k]);
    return e;
  }
function makeSlice(uid){
  var g=el("g");
  g.appendChild(el("circle",{"cx":"60","cy":"60","r":"58","fill":"url(#lr"+uid+")"}));
  for(var b=0;b<9;b++){
    var ba=b*40+15, bx=60+Math.cos(ba*Math.PI/180)*52, by=60+Math.sin(ba*Math.PI/180)*52;
    g.appendChild(el("circle",{"cx":bx.toFixed(1),"cy":by.toFixed(1),"r":"3","fill":"rgba(40,50,120,.2)"}));
    g.appendChild(el("circle",{"cx":(bx-1.5).toFixed(1),"cy":(by-1.5).toFixed(1),"r":"1.3","fill":"rgba(150,165,240,.35)"}));
  }
  g.appendChild(el("circle",{"cx":"60","cy":"60","r":"47","fill":"#dbe4ff"}));
  g.appendChild(el("circle",{"cx":"60","cy":"60","r":"41","fill":"url(#lf2"+uid+")"}));
  for(var k=0;k<8;k++){
    var a1=k*45,a2=(k+1)*45;
    var x2=60+41*Math.sin(a2*Math.PI/180), y2=60-41*Math.cos(a2*Math.PI/180);
    g.appendChild(el("path",{"d":"M60 60 L60 19 A41 41 0 0 1 "+x2.toFixed(1)+" "+y2.toFixed(1)+" Z","transform":"rotate("+a1+" 60 60)","fill":"rgba(180,195,245,.5)"}));
  }
  for(var k2=0;k2<8;k2++){
    var mx=60+40*Math.sin((k2*45+22.5)*Math.PI/180), my=60-40*Math.cos((k2*45+22.5)*Math.PI/180);
    g.appendChild(el("path",{"d":"M60 60 L"+mx.toFixed(1)+" "+my.toFixed(1),"stroke":"rgba(255,255,255,.6)","stroke-width":".8","fill":"none"}));
  }
  g.appendChild(el("circle",{"cx":"60","cy":"60","r":"4","fill":"#e0e7ff","stroke":"rgba(90,100,200,.4)","stroke-width":".6"}));
  g.appendChild(el("path",{"d":"M22 38 A44 44 0 0 1 45 16","fill":"none","stroke":"rgba(255,255,255,.32)","stroke-width":"5","stroke-linecap":"round","opacity":".45"}));
  return g;
}
  function makeDefs(uid){
    var d=el("defs");
    function grad(id,cx,cy,r,stops){var g=el("radialGradient",{"id":id,"cx":cx,"cy":cy,"r":r});for(var i=0;i<stops.length;i++){var s=el("stop",{"offset":stops[i][0],"stop-color":stops[i][1]});g.appendChild(s);}d.appendChild(g);}
    grad("lh"+uid,"50%","50%","50%",[["0%","rgba(150,165,240,.68)"],["35%","rgba(120,135,235,.36)"],["65%","rgba(100,115,225,.13)"],["100%","rgba(100,115,225,0)"]]);
    grad("lp"+uid,"50%","50%","50%",[["82%","#5b6fd0"],["94%","#3a4aa8"],["100%","#253070"]]);
    grad("lf"+uid,"46%","42%","58%",[["0%","#e0e7ff"],["28%","#c7d2fe"],["58%","#a5b4fc"],["88%","#8fa2e0"],["100%","#6d82d0"]]);
    grad("ls"+uid,"36%","32%","58%",[["0%","rgba(255,255,255,.45)"],["40%","rgba(255,255,255,.12)"],["100%","rgba(255,255,255,0)"]]);
    grad("lr"+uid,"50%","50%","55%",[["0%","#a5b4fc"],["60%","#8fa2e0"],["100%","#5b6fd0"]]);
    grad("lf2"+uid,"50%","50%","50%",[["0%","#e0e7ff"],["100%","#c7d2fe"]]);
    var f1=el("filter",{"id":"lb"+uid,"x":"-80%","y":"-80%","width":"260%","height":"260%"});f1.appendChild(el("feGaussianBlur",{"stdDeviation":"5"}));d.appendChild(f1);
    var f2=el("filter",{"id":"lsf"+uid,"x":"-60%","y":"-60%","width":"220%","height":"220%"});f2.appendChild(el("feGaussianBlur",{"stdDeviation":"1.5"}));d.appendChild(f2);
    return d;
  }
  function buildLime(uid){
    var svg=el("svg",{"viewBox":"0 0 120 120","class":"lime-svg"});
    svg.appendChild(makeDefs(uid));
    var aura=el("g",{"filter":"url(#lb"+uid+")","opacity":"1","class":"lime-aura"});aura.appendChild(makeSlice(uid));
    var body=el("g",{"filter":"url(#lsf"+uid+")","opacity":".95"});body.appendChild(makeSlice(uid));
    svg.appendChild(aura);svg.appendChild(body);
    return svg;
  }
  function placeLimes(){
    var glow=document.querySelector(".glow");
    if(!glow)return;
    glow.querySelectorAll(".lime-wrap").forEach(function(el){el.remove();});
    limes=[];return;
    var W=window.innerWidth||document.documentElement.clientWidth||360;
    var H=window.innerHeight||document.documentElement.clientHeight||640;
    var light=document.documentElement.getAttribute("data-theme")==="light";
    var count=Math.max(2,Math.min(4,Math.round(W*H/400000)));
    var tries=0;
    while(limes.length<count && tries<500){
      tries++;
      var d=rand(LIME_MIN,LIME_MAX),r=d/2;
      var x=rand(-r*0.3,W+r*0.3),y=rand(-r*0.3,H+r*0.3);
      if(overlaps(x,y,r))continue;
      limes.push({x:x,y:y,r:r});
      var w=document.createElement("div");
      w.className="lime-wrap";
      w.style.left=Math.round(x-r)+"px";
      w.style.top=Math.round(y-r)+"px";
      w.style.width=Math.round(d)+"px";
      w.style.height=Math.round(d)+"px";
      w.style.opacity=((light?0.42:1)*rand(.34,.62)).toFixed(2);
      var svg=buildLime(limes.length);
      svg.style.animationDuration=rand(22,38).toFixed(1)+"s";
      svg.style.animationDelay="-"+Math.floor(rand(0,38))+"s";
      w.appendChild(svg);
      w.style.animationDuration=(10+Math.random()*6).toFixed(1)+"s";w.style.animationDelay="-"+Math.floor(Math.random()*10)+"s";
      glow.appendChild(w);
    }
  }
  placeLimes();
  window.addEventListener("resize",function(){placeLimes();});
  window.__limeReset=placeLimes;
})();
/* 青柠气泡粒子: 已删除 (背景常驻小绿泡泡) */
(function(){
  window.__bubbleReset=function(){};
  return; /* 背景青柠气泡已删 */
  var bubbles=[],W=0,H=0,MAX=40,running=false;
  function spawn(){
    if(bubbles.length>=MAX||document.body.classList.contains("no-anim"))return;
    W=window.innerWidth||400;H=window.innerHeight||800;
    var b=document.createElement("div");
    b.className="bubble";
    var sz=2+Math.random()*3.5;
    b.style.width=sz.toFixed(1)+"px";b.style.height=sz.toFixed(1)+"px";
    b.style.left=(Math.random()*W)+"px";
    b.style.bottom="-30px";b.style.opacity="0";
    document.body.appendChild(b);
    bubbles.push({el:b,baseX:parseFloat(b.style.left),y:-30,rise:H+80,speed:20+Math.random()*25,phase:Math.random()*6.28,sway:0.8+Math.random()*1.2,ttl:0,popping:false});
  }
  function tick(){
    var dt=1/60;
    for(var i=bubbles.length-1;i>=0;i--){
      var d=bubbles[i];d.ttl+=dt;
      var dur=d.rise/d.speed;
      if(d.ttl>=dur){d.el.remove();bubbles.splice(i,1);continue;}
      var t=d.ttl/dur;
      d.el.style.bottom=(-30+d.rise*t)+"px";
      var wob=Math.sin(d.ttl*2.5+d.phase)*d.sway*(1-t*0.3);
      d.el.style.left=(d.baseX+wob)+"px";
      d.el.style.opacity=Math.min(.6,t*5)*(1-t*0.7);
      if(!d.popping&&Math.random()<0.0015){d.popping=true;d.el.style.transition="transform .15s,opacity .15s";d.el.style.transform="scale(1.8)";d.el.style.opacity="0";var _e=d.el;setTimeout(function(){_e.remove()},200);bubbles.splice(i,1);}
    }
    if(running)requestAnimationFrame(tick);
  }
  function reset(){
    for(var i=0;i<bubbles.length;i++){bubbles[i].el.remove();}bubbles=[];
    for(var i=0;i<12;i++)setTimeout(spawn,i*120);
    running=true;tick();
  }
  setInterval(spawn,180);
  window.addEventListener("resize",function(){W=window.innerWidth||400;H=window.innerHeight||800;});
  window.__bubbleReset=reset;
  reset();
})();
/* ④ 清新时刻: 清理完成迸发青柠粒子 */
function freshBurst(){
  var res=document.getElementById("res"),rect=res?res.getBoundingClientRect():null;
  var cx=rect?(rect.left+rect.width/2):window.innerWidth/2;
  var cy=rect?Math.max(30,rect.top):window.innerHeight*0.3;
  for(var i=0;i<10;i++){
    var s=document.createElement("div");s.className="fburst";
    s.style.left=cx+"px";s.style.top=cy+"px";
    var a=Math.random()*Math.PI*2,sp=25+Math.random()*60;
    s.style.setProperty("--dx",(Math.cos(a)*sp).toFixed(0)+"px");
    s.style.setProperty("--dy",(Math.sin(a)*sp-40).toFixed(0)+"px");
    s.style.animationDuration=(0.7+Math.random()*0.8).toFixed(2)+"s";
    s.style.animationDelay=(Math.random()*0.15).toFixed(2)+"s";
    document.body.appendChild(s);
    (function(el){setTimeout(function(){el.remove();},1700);})(s);
  }
}
var __inPerf=false;
function loadPerf(){
  var el=document.getElementById("perfLive");if(!el)return;
  fetch("/cgi-bin/status.cgi").then(function(r){return r.json();}).then(function(d){
    if(!d||!d.version)return;
    el.innerHTML='版本 <b class="lime-g">'+d.version+'</b> · 已清理 <b>'+(d.total_clean||0)+'</b> 次 · 累计释放 <b class="lime-g">'+fs(d.total_freed)+'</b> · 可用存储 <b class="lime-g">'+fs(d.storage_free)+'</b> · 守护 <b>'+(d.daemon?"运行中":"已停止")+'</b> · Web <b>'+(d.web?"正常":"未运行")+'</b>';
  }).catch(function(){el.textContent="状态读取失败";});
}
function togglePerf(){
  if(!__inPerf){showPerf();}else{backPerf();}
}
function showPerf(){
  __inPerf=true;
  loadPerf();
  var b=document.getElementById("perfBtn");if(b)b.textContent="\u2190";
  document.querySelectorAll(".page").forEach(function(x){x.classList.remove("on");});
  document.getElementById("p-perf").classList.add("on");
  document.querySelectorAll(".tab").forEach(function(x){x.classList.remove("active");});
}
function backPerf(){
  __inPerf=false;
  var b=document.getElementById("perfBtn");if(b)b.textContent="\u26a1";
  document.querySelectorAll(".page").forEach(function(x){x.classList.remove("on");});
  document.getElementById("p-clean").classList.add("on");
  document.querySelectorAll(".tab").forEach(function(x){x.classList.remove("active");});
  document.querySelector(".tab-clean").classList.add("active");
}

/* 水体 Canvas 渲染 v94: 水面立体阴影边 + 相位交错 */
(function(){
  var c=document.getElementById("waterCanvas"),t=0;
  if(!c)return;
  var dpr=window.devicePixelRatio||1;
  c.width=104*dpr;c.height=104*dpr;c.style.width="104px";c.style.height="104px";
  var ctx=c.getContext("2d");ctx.scale(dpr,dpr);
  var w=104,h=104,wf=0,wRaf=null;
  function wy(x,base,tt){return base+Math.sin((x+tt)*0.065)*2.8+Math.sin((x*1.5+tt*0.55)*0.09)*1.4;}
  function draw(){
    wf++;if(wf%2!==0){wRaf=requestAnimationFrame(draw);return;}
    var pct=window.__waterPct||0,waterH=pct/100*h,base=h-waterH;
    ctx.clearRect(0,0,w,h);
    if(pct>0){
      ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,base);
      for(var x=0;x<=w;x+=1)ctx.lineTo(x,wy(x,base,t));
      ctx.lineTo(w,h);ctx.closePath();
      var g=ctx.createLinearGradient(0,base,0,h);
      g.addColorStop(0,"rgba(186,230,253,.95)");g.addColorStop(0.3,"rgba(56,189,248,.9)");
      g.addColorStop(0.7,"rgba(14,165,233,.94)");g.addColorStop(1,"rgba(3,105,161,.98)");
      ctx.fillStyle=g;ctx.fill();
      var t2=t*1.3+2.5;
      ctx.save();ctx.globalAlpha=0.55;
      ctx.beginPath();ctx.moveTo(0,base);
      for(var x=0;x<=w;x+=1)ctx.lineTo(x,base+3+Math.sin((x*0.85+t2)*0.07)*2.5);
      ctx.lineTo(w,base+16);ctx.lineTo(0,base+16);ctx.closePath();
      var g2=ctx.createLinearGradient(0,base,0,base+16);
      g2.addColorStop(0,"rgba(12,74,110,.65)");g2.addColorStop(1,"rgba(12,74,110,0)");
      ctx.fillStyle=g2;ctx.fill();ctx.restore();
      ctx.beginPath();ctx.moveTo(0,base);
      for(var x=0;x<=w;x+=1)ctx.lineTo(x,wy(x,base,t));
      ctx.strokeStyle="rgba(255,255,255,.35)";ctx.lineWidth=1.5;ctx.stroke();
    }
    t+=0.7;wRaf=requestAnimationFrame(draw);
  }
  draw();
  window.__waterPause=function(){if(wRaf){cancelAnimationFrame(wRaf);wRaf=null;}};
  window.__waterResume=function(){if(wRaf)return;draw();};
})();

/* 水缸超小水汽引擎 v114: 摇可乐开盖式, 高密度快浮速 */
(function(){
  var tank=document.getElementById("waterTank");
  if(!tank)return;
  var MAX=40,bubbles=[],running=false,H=104;
  function spawn(){
    if(bubbles.length>=MAX||document.body.classList.contains("no-anim"))return;
    var b=document.createElement("span");
    b.className="wbub";
    var sz=1+Math.random()*2;
    b.style.width=sz+"px";b.style.height=sz+"px";
    b.style.left=(12+Math.random()*80)+"px";
    b.style.bottom="0px";b.style.opacity="0";
    tank.appendChild(b);
    var pct=window.__waterPct||50;
    var rise=Math.max(15,pct/100*H-4);
    bubbles.push({el:b,baseX:parseFloat(b.style.left),y:0,rise:rise,speed:120+Math.random()*80,phase:Math.random()*6.28,sway:0.8+Math.random()*1.5,ttl:0});
  }
  function tick(){
    var dt=1/60;
    for(var i=bubbles.length-1;i>=0;i--){
      var d=bubbles[i];d.ttl+=dt;
      var dur=d.rise/d.speed;
      if(d.ttl>=dur){d.el.remove();bubbles.splice(i,1);continue;}
      var t=d.ttl/dur;
      d.el.style.bottom=(d.rise*t)+"px";
      var wob=Math.sin(d.ttl*8+d.phase)*d.sway;
      d.el.style.left=(d.baseX+wob)+"px";
      var s=1+t*0.4;
      d.el.style.transform="scale("+s.toFixed(3)+")";
      d.el.style.opacity=Math.min(.7,t*8)*(1-t*0.8);
    }
    if(running)requestAnimationFrame(tick);
  }
  for(var i=0;i<12;i++)setTimeout(spawn,i*15);
  setInterval(spawn,80);
  running=true;tick();
})();

/* 水汽粒子: 超大模糊淡白团, 极慢上浮 (v111) */
(function(){
  return; /* 背景水汽气泡已删 */
  var vps=[],MAX=3,W=0,H=0;
  function spawn(){
    if(vps.length>=MAX)return;
    W=window.innerWidth||400;H=window.innerHeight||800;
    var v=document.createElement("div");v.className="vapor";
    var sz=80+Math.random()*120;
    v.style.width=sz+"px";v.style.height=sz+"px";
    v.style.left=(Math.random()*W)+"px";v.style.bottom="-80px";
    document.body.appendChild(v);
    vps.push({el:v,baseX:parseFloat(v.style.left),y:-80,rise:H+160,speed:3+Math.random()*5,phase:Math.random()*6.28,sway:15+Math.random()*25,ttl:0});
  }
  function tick(){
    for(var i=vps.length-1;i>=0;i--){
      var d=vps[i];d.ttl+=1/60;
      var dur=d.rise/d.speed;
      if(d.ttl>=dur){d.el.remove();vps.splice(i,1);continue;}
      var t=d.ttl/dur;
      d.el.style.bottom=(-80+d.rise*t)+"px";
      d.el.style.left=(d.baseX+Math.sin(d.ttl*0.4+d.phase)*d.sway)+"px";
      d.el.style.opacity=Math.min(0.045,t*10)*(1-t);
    }
    requestAnimationFrame(tick);
  }
  for(var i=0;i<3;i++)setTimeout(function(){spawn();},i*1000);
  setInterval(spawn,4000);
  tick();
})();




const START=new Date(2026,7,20,0,0,0).getTime();
const END=new Date(2026,8,12,0,0,0).getTime();
const LIVE_DECIMALS=6,DAY_DECIMALS=4;
const MILESTONES=[5,10,25,50,75,90,95,99,100];
const PHASES=[
{start:new Date(2026,7,20).getTime(),end:new Date(2026,7,24).getTime(),status:"🇸🇰 CREW AWAY // SLOVAKIA TRACK MODE",objective:"WAIT FOR CREW RETURN",next:"ENGINE INSTALL",code:"TRACK"},
{start:new Date(2026,7,24).getTime(),end:new Date(2026,7,29).getTime(),status:"🔧 ENGINE INSTALL // EXHAUST PHASE",objective:"ENGINE → CAR // LONG DP",next:"FIRST START",code:"INSTALL"},
{start:new Date(2026,7,29).getTime(),end:new Date(2026,7,31).getTime(),status:"⚙️ START-UP PREPARATION",objective:"FIRST START // SYSTEM CHECK",next:"1000 KM BREAK-IN",code:"STARTUP"},
{start:new Date(2026,7,31).getTime(),end:new Date(2026,8,3).getTime(),status:"🛣️ BREAK-IN RUNNING",objective:"1000 KM ROAD BREAK-IN",next:"DYNO // DISI TUNE",code:"BREAKIN"},
{start:new Date(2026,8,3).getTime(),end:new Date(2026,8,5).getTime(),status:"📈 DYNO // DISI TUNE",objective:"FINAL OIL // DYNO // CALIBRATION",next:"FINAL CHECKS",code:"DYNO"},
{start:new Date(2026,8,5).getTime(),end:new Date(2026,8,12).getTime(),status:"✅ FINAL CHECKS // PICKUP WINDOW",objective:"WAITING FOR THE CALL 📞",next:"READY TO DRIVE",code:"FINAL"},
{start:new Date(2026,8,12).getTime(),end:new Date(2099,0,1).getTime(),status:"😎 MISSION COMPLETE",objective:"READY TO DRIVE",next:"DRIVE",code:"DONE"}
];
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pad2=n=>String(n).padStart(2,"0"),pad3=n=>String(n).padStart(3,"0"),fmtPct=(v,d)=>v.toFixed(d).replace(".",",");
function formatDuration(ms){ms=Math.max(0,ms);const d=Math.floor(ms/86400000);ms%=86400000;const h=Math.floor(ms/3600000);ms%=3600000;const m=Math.floor(ms/60000);ms%=60000;const s=Math.floor(ms/1000),z=Math.floor(ms%1000);return `${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(z)}`}
function formatDate(d){return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()}`}
function formatDayClock(d){return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} / 24:00:00`}
function findPhase(now){return PHASES.find(p=>now>=p.start&&now<p.end)??PHASES[PHASES.length-1]}
function dayProgress(nowMs){const n=new Date(nowMs),s=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime(),e=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1).getTime();return clamp((nowMs-s)/(e-s),0,1)}
function systemMessage(p){if(p>=100)return"MISSION COMPLETE // READY TO DRIVE 😎";if(p>=99)return"DO NOT TURN OFF YOUR MAZDA";if(p>=95)return"ALMOST HOME";if(p>=90)return"FINAL APPROACH";if(p>=75&&p<76)return"THREE QUARTERS COMPLETE";if(p>=69&&p<70)return"NICE.";if(p>=50&&p<51)return"HALFWAY THERE";if(p>=25&&p<26)return"QUARTER MISSION COMPLETE";if(p>=10&&p<11)return"DOUBLE DIGITS";return"ALL SYSTEMS NOMINAL"}
const radius=46,circ=2*Math.PI*radius,ring=$("dayRingFg");ring.style.strokeDasharray=String(circ);ring.style.strokeDashoffset=String(circ);
function update(){const now=Date.now(),dnow=new Date(now),total=END-START,prog=clamp((now-START)/total,0,1),p=prog*100;$("percent").textContent=`${fmtPct(p,LIVE_DECIMALS)}%`;$("progress").style.width=`${p}%`;$("elapsed").textContent=formatDuration(now-START);$("remaining").textContent=now>=END?"READY 😎":formatDuration(END-now);const totalDays=Math.ceil(total/86400000),missionDay=clamp(Math.floor((now-START)/86400000)+1,1,totalDays);$("day").textContent=`${missionDay} / ${totalDays}`;$("dayDate").textContent=formatDate(dnow);$("dayClock").textContent=formatDayClock(dnow);const dp=dayProgress(now);ring.style.strokeDashoffset=String(circ*(1-dp));$("dayProgressValue").textContent=`${fmtPct(dp*100,DAY_DECIMALS)}%`;const ph=findPhase(now);$("status").textContent=ph.status;$("objective").textContent=`▶ ${ph.objective}`;$("nextPhase").textContent=`→ ${ph.next}`;const pp=ph.code==="DONE"?1:clamp((now-ph.start)/(ph.end-ph.start),0,1);$("phaseProgress").textContent=`${fmtPct(pp*100,4)}%`;if(ph.code==="BREAKIN"){$("breakInCard").hidden=false;$("breakIn").textContent=`${Math.round(1000*pp)} / 1000 KM // ${fmtPct(pp*100,1)}%`}else{$("breakInCard").hidden=true}let nm=100;for(const m of MILESTONES){if(p<m){nm=m;break}}const mt=START+total*(nm/100);$("milestone").textContent=`${nm}% // T− ${formatDuration(mt-now)}`;$("system").textContent=`> ${systemMessage(p)}`}
update();setInterval(update,100);
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}))}

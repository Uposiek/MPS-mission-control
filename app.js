// ==========================================================
// MPS MISSION CONTROL — PWA v2.0
// ==========================================================

const FINAL_START = new Date(2026, 7, 20, 0, 0, 0).getTime();
const TARGET_PICKUP = new Date(2026, 8, 12, 0, 0, 0).getTime();
const LEGACY_START = new Date(2026, 3, 4, 0, 0, 0).getTime();
const EARLIEST_READY = new Date(2026, 8, 5, 0, 0, 0).getTime();

const LIVE_DECIMALS = 6;
const DAY_DECIMALS = 4;

const MILESTONES = [5, 10, 25, 50, 75, 90, 95, 99, 100];
const CELEBRATIONS = [
  { value: 5,   message: "SYSTEMS ONLINE" },
  { value: 10,  message: "DOUBLE DIGITS" },
  { value: 25,  message: "QUARTER MISSION COMPLETE" },
  { value: 50,  message: "HALFWAY THERE" },
  { value: 69,  message: "NICE." },
  { value: 75,  message: "THREE QUARTERS COMPLETE" },
  { value: 90,  message: "FINAL APPROACH" },
  { value: 95,  message: "ALMOST HOME" },
  { value: 99,  message: "DO NOT TURN OFF YOUR MAZDA" },
  { value: 100, message: "MISSION COMPLETE // READY TO DRIVE 😎" }
];

const PHASES = [
  {
    start:new Date(2026,7,20,0,0,0).getTime(),
    end:new Date(2026,7,24,0,0,0).getTime(),
    icon:"🇸🇰", short:"TRACK",
    status:"🇸🇰 CREW AWAY // SLOVAKIA TRACK MODE",
    objective:"WAIT FOR CREW RETURN",
    next:"ENGINE INSTALL",
    code:"TRACK"
  },
  {
    start:new Date(2026,7,24,0,0,0).getTime(),
    end:new Date(2026,7,29,0,0,0).getTime(),
    icon:"🔧", short:"INSTALL",
    status:"🔧 ENGINE INSTALL // EXHAUST PHASE",
    objective:"ENGINE → CAR // LONG DP",
    next:"FIRST START",
    code:"INSTALL"
  },
  {
    start:new Date(2026,7,29,0,0,0).getTime(),
    end:new Date(2026,7,31,0,0,0).getTime(),
    icon:"⚙️", short:"START",
    status:"⚙️ START-UP PREPARATION",
    objective:"FIRST START // SYSTEM CHECK",
    next:"1000 KM BREAK-IN",
    code:"STARTUP"
  },
  {
    start:new Date(2026,7,31,0,0,0).getTime(),
    end:new Date(2026,8,3,0,0,0).getTime(),
    icon:"🛣️", short:"BREAK-IN",
    status:"🛣️ BREAK-IN RUNNING",
    objective:"1000 KM ROAD BREAK-IN",
    next:"DYNO // DISI TUNE",
    code:"BREAKIN"
  },
  {
    start:new Date(2026,8,3,0,0,0).getTime(),
    end:new Date(2026,8,5,0,0,0).getTime(),
    icon:"📈", short:"DYNO",
    status:"📈 DYNO // DISI TUNE",
    objective:"FINAL OIL // DYNO // CALIBRATION",
    next:"FINAL CHECKS",
    code:"DYNO"
  },
  {
    start:new Date(2026,8,5,0,0,0).getTime(),
    end:new Date(2026,8,12,0,0,0).getTime(),
    icon:"✅", short:"FINAL",
    status:"✅ FINAL CHECKS // PICKUP WINDOW",
    objective:"WAITING FOR THE CALL 📞",
    next:"READY TO DRIVE",
    code:"FINAL"
  },
  {
    start:new Date(2026,8,12,0,0,0).getTime(),
    end:new Date(2099,0,1,0,0,0).getTime(),
    icon:"😎", short:"READY",
    status:"😎 MISSION COMPLETE",
    objective:"READY TO DRIVE",
    next:"DRIVE",
    code:"DONE"
  }
];

const MISSION_LOG = [
  { date:"04.04", time:new Date(2026,3,4,0,0,0).getTime(), text:"MPS DELIVERED // REBUILD MISSION START", kind:"actual" },
  { date:"20.08", time:FINAL_START, text:"FINAL STAGE COUNTDOWN ONLINE", kind:"actual" },
  { date:"24.08", time:new Date(2026,7,24,0,0,0).getTime(), text:"CREW RETURN // ENGINE INSTALL WINDOW", kind:"planned" },
  { date:"31.08", time:new Date(2026,7,31,0,0,0).getTime(), text:"1000 KM BREAK-IN WINDOW", kind:"planned" },
  { date:"03.09", time:new Date(2026,8,3,0,0,0).getTime(), text:"DYNO // DISI TUNE WINDOW", kind:"planned" },
  { date:"05.09", time:EARLIEST_READY, text:"EARLIEST POSSIBLE READY DATE", kind:"planned" },
  { date:"12.09", time:TARGET_PICKUP, text:"TARGET PICKUP // MISSION END", kind:"planned" }
];

const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const pad2 = n => String(n).padStart(2,"0");
const pad3 = n => String(n).padStart(3,"0");
const pct = (v,d) => v.toFixed(d).replace(".",",");

function formatDuration(ms, millis=true){
  const negative = ms < 0;
  ms = Math.abs(ms);
  const d=Math.floor(ms/86400000); ms%=86400000;
  const h=Math.floor(ms/3600000); ms%=3600000;
  const m=Math.floor(ms/60000); ms%=60000;
  const s=Math.floor(ms/1000);
  const x=Math.floor(ms%1000);
  const body = millis
    ? `${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(x)}`
    : `${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return negative ? `−${body}` : body;
}

function formatDate(d){
  return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()}`;
}

function formatDayClock(d){
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} / 24:00:00`;
}

function findPhase(now){
  return PHASES.find(p=>now>=p.start && now<p.end) || PHASES[PHASES.length-1];
}

function getDayProgress(nowMs){
  const d=new Date(nowMs);
  const s=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0,0).getTime();
  const e=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,0,0,0,0).getTime();
  return clamp((nowMs-s)/(e-s),0,1);
}

function systemMessage(p){
  if(p>=100)return "MISSION COMPLETE // READY TO DRIVE 😎";
  if(p>=99)return "DO NOT TURN OFF YOUR MAZDA";
  if(p>=95)return "ALMOST HOME";
  if(p>=90)return "FINAL APPROACH";
  if(p>=75 && p<76)return "THREE QUARTERS COMPLETE";
  if(p>=69 && p<70)return "NICE.";
  if(p>=50 && p<51)return "HALFWAY THERE";
  if(p>=25 && p<26)return "QUARTER MISSION COMPLETE";
  if(p>=10 && p<11)return "DOUBLE DIGITS";
  return "ALL SYSTEMS NOMINAL";
}

// DAILY RING
const ringRadius=46;
const ringCircumference=2*Math.PI*ringRadius;
const ring=$("dayRingFg");
ring.style.strokeDasharray=String(ringCircumference);

// PHASE MAP
function renderPhaseMap(){
  $("phaseMap").innerHTML = PHASES.slice(0,-1).map(p => `
    <div class="phaseNode" data-phase="${p.code}">
      <div class="ico">${p.icon}</div>
      <div class="name">${p.short}</div>
    </div>
  `).join("");
}
renderPhaseMap();

function updatePhaseMap(now, currentPhase){
  document.querySelectorAll(".phaseNode").forEach(node=>{
    const p=PHASES.find(x=>x.code===node.dataset.phase);
    node.classList.remove("done","active","future");
    if(currentPhase.code==="DONE" || now>=p.end) node.classList.add("done");
    else if(currentPhase.code===p.code) node.classList.add("active");
    else node.classList.add("future");
  });
  const active=document.querySelector(".phaseNode.active");
  if(active) active.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
}

// MISSION LOG
function renderMissionLog(now){
  $("missionLog").innerHTML = MISSION_LOG.map(entry=>{
    const isFuture=now<entry.time;
    const stateClass=isFuture?"future":entry.kind;
    const tag=entry.kind==="planned" ? "PLAN" : "ACTUAL";
    return `
      <div class="logEntry ${stateClass}">
        <div class="logDate">${entry.date}</div>
        <div class="logDotWrap">
          <div class="logDot"></div>
          <div class="logLine"></div>
        </div>
        <div class="logText">${entry.text}<span class="logTag">${tag}</span></div>
      </div>
    `;
  }).join("");
}
renderMissionLog(Date.now());

// MILESTONE CELEBRATIONS
function celebrationKey(value){ return `mps_celebration_${value}`; }

function maybeCelebrate(percent){
  const reached = CELEBRATIONS.filter(m => percent >= m.value);
  if(!reached.length) return;

  // only the highest reached but unseen milestone
  const unseen = reached.filter(m => localStorage.getItem(celebrationKey(m.value)) !== "1");
  if(!unseen.length) return;

  const milestone = unseen[unseen.length-1];

  // Mark all lower reached milestones as seen so we don't spam old ones later.
  reached.filter(m=>m.value<milestone.value)
    .forEach(m=>localStorage.setItem(celebrationKey(m.value),"1"));

  $("celebrationPct").textContent = `${milestone.value}%`;
  $("celebrationMsg").textContent = milestone.message;
  $("celebration").hidden = false;
  $("celebration").dataset.value = String(milestone.value);
}

$("celebrationClose").addEventListener("click",()=>{
  const value=$("celebration").dataset.value;
  if(value) localStorage.setItem(celebrationKey(value),"1");
  $("celebration").hidden=true;
});

// avoid checking celebration every 100 ms
let celebrationCheckedAt=0;

// UPDATE
function update(){
  const now=Date.now();
  const nowDate=new Date(now);

  // FINAL STAGE
  const total=TARGET_PICKUP-FINAL_START;
  const progress=clamp((now-FINAL_START)/total,0,1);
  const percent=progress*100;

  $("percent").textContent=`${pct(percent,LIVE_DECIMALS)}%`;
  $("progress").style.width=`${percent}%`;
  $("elapsed").textContent=formatDuration(now-FINAL_START);
  $("remaining").textContent=now>=TARGET_PICKUP ? "READY 😎" : formatDuration(TARGET_PICKUP-now);

  // DAY
  const totalDays=Math.ceil(total/86400000);
  const missionDay=clamp(Math.floor((now-FINAL_START)/86400000)+1,1,totalDays);
  $("day").textContent=`${missionDay} / ${totalDays}`;
  $("dayDate").textContent=formatDate(nowDate);
  $("dayClock").textContent=formatDayClock(nowDate);

  const dp=getDayProgress(now);
  ring.style.strokeDashoffset=String(ringCircumference*(1-dp));
  $("dayProgressValue").textContent=`${pct(dp*100,DAY_DECIMALS)}%`;

  // LEGACY
  $("legacyCounter").textContent=formatDuration(now-LEGACY_START);

  // CURRENT PHASE
  const phase=findPhase(now);
  $("status").textContent=phase.status;
  $("objective").textContent=`▶ ${phase.objective}`;
  $("nextPhase").textContent=`→ ${phase.next}`;

  const phaseProgress=phase.code==="DONE"
    ? 1
    : clamp((now-phase.start)/(phase.end-phase.start),0,1);

  $("phaseProgress").textContent=`${pct(phaseProgress*100,4)}%`;
  $("phaseBar").style.width=`${phaseProgress*100}%`;
  updatePhaseMap(now,phase);

  // BREAK-IN
  if(phase.code==="BREAKIN"){
    $("breakInCard").hidden=false;
    const km=Math.round(1000*phaseProgress);
    $("breakIn").textContent=`${km} / 1000 KM`;
    $("breakInPct").textContent=`${pct(phaseProgress*100,1)}%`;
    $("breakInBar").style.width=`${phaseProgress*100}%`;
  }else{
    $("breakInCard").hidden=true;
  }

  // MILESTONE
  let nextMilestone=100;
  for(const m of MILESTONES){
    if(percent<m){nextMilestone=m;break;}
  }
  const milestoneTime=FINAL_START+total*(nextMilestone/100);
  $("milestone").textContent=`${nextMilestone}% // T− ${formatDuration(milestoneTime-now)}`;

  // SCHEDULE BUFFER
  // Before 05.09 we assume earliest-ready 05.09.
  // After 05.09, if mission is still running, "predicted ready" becomes NOW,
  // so the remaining buffer to 12.09 shrinks live.
  const predictedReady = now < EARLIEST_READY ? EARLIEST_READY : now;
  const buffer = TARGET_PICKUP - predictedReady;
  const bufferEl=$("bufferValue");
  bufferEl.classList.remove("warning","danger");

  if(now>=TARGET_PICKUP){
    bufferEl.textContent=`OVERDUE ${formatDuration(now-TARGET_PICKUP,false)}`;
    bufferEl.classList.add("danger");
    $("bufferSub").textContent="TARGET WINDOW EXCEEDED";
  }else{
    bufferEl.textContent=`+${formatDuration(buffer,false)}`;
    if(buffer < 48*3600000) bufferEl.classList.add("danger");
    else if(buffer < 96*3600000) bufferEl.classList.add("warning");
    $("bufferSub").textContent = now < EARLIEST_READY
      ? "RESERVE BETWEEN EARLIEST READY AND TARGET"
      : "LIVE RESERVE LEFT UNTIL TARGET PICKUP";
  }

  // SYSTEM
  $("system").textContent=`> ${systemMessage(percent)}`;

  // refresh log state around date changes / phase changes
  if(now % 60000 < 120) renderMissionLog(now);

  // celebration check max once per second
  if(now-celebrationCheckedAt>1000){
    celebrationCheckedAt=now;
    if($("celebration").hidden) maybeCelebrate(percent);
  }
}

update();
setInterval(update,100);

// PWA SERVICE WORKER
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
  });
}

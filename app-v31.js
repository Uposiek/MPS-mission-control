// ==========================================================
// MPS MISSION CONTROL — PWA v3.0
// Mission + Drive + Service + Log + Settings
// All personal vehicle data stays in localStorage.
// ==========================================================

const KEY = "mpsMissionControlV3";

const DEFAULT_DATA = {
  version: 3,
  settings: {
    rebuildCost: 46000,
    oilTargetKm: 5000,
    oilSoftMaxKm: 6000,
    oilMaxMonths: 8
  },
  pickup: {
    completed: false,
    date: null,
    odo: null
  },
  currentOdo: null,
  oilBaseline: {
    date: null,
    odo: null
  },
  fuel: [],
  odoReadings: [],
  services: []
};

function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

function loadData(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return deepClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);

    return {
      ...deepClone(DEFAULT_DATA),
      ...parsed,
      settings: {...DEFAULT_DATA.settings, ...(parsed.settings || {})},
      pickup: {...DEFAULT_DATA.pickup, ...(parsed.pickup || {})},
      oilBaseline: {...DEFAULT_DATA.oilBaseline, ...(parsed.oilBaseline || {})},
      fuel: Array.isArray(parsed.fuel) ? parsed.fuel : [],
      odoReadings: Array.isArray(parsed.odoReadings) ? parsed.odoReadings : [],
      services: Array.isArray(parsed.services) ? parsed.services : []
    };
  }catch(e){
    return deepClone(DEFAULT_DATA);
  }
}

let DB = loadData();

function saveData(){
  localStorage.setItem(KEY, JSON.stringify(DB));
}

const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const pad2 = n => String(n).padStart(2,"0");
const pad3 = n => String(n).padStart(3,"0");
const pct = (v,d) => Number(v).toFixed(d).replace(".",",");
const fmtNum = (n,d=0) => Number(n).toLocaleString("pl-PL",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtMoney = n => Number(n).toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2});
const msDay = 86400000;

function localDateTimeValue(ms=Date.now()){
  const d = new Date(ms);
  const y=d.getFullYear(),m=pad2(d.getMonth()+1),day=pad2(d.getDate());
  const h=pad2(d.getHours()),min=pad2(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

function parseLocalDateTime(v){
  if(!v) return null;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.getTime() : null;
}

function formatDateTime(ms){
  if(!ms) return "—";
  const d=new Date(ms);
  return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatDate(ms){
  if(!ms) return "—";
  const d=new Date(ms);
  return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()}`;
}

function formatDuration(ms, millis=true){
  const negative = ms < 0;
  ms=Math.abs(ms);
  const d=Math.floor(ms/msDay); ms%=msDay;
  const h=Math.floor(ms/3600000); ms%=3600000;
  const m=Math.floor(ms/60000); ms%=60000;
  const s=Math.floor(ms/1000);
  const x=Math.floor(ms%1000);
  const body=millis
    ? `${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(x)}`
    : `${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return negative ? `−${body}` : body;
}

function addMonths(ms, months){
  const d = new Date(ms);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth()+Number(months));
  const maxDay = new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  d.setDate(Math.min(day,maxDay));
  return d.getTime();
}

function showToast(text){
  const t=$("toast");
  t.textContent=text;
  t.hidden=false;
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>t.hidden=true,1800);
}

function updateCurrentOdo(candidate, dateMs=Date.now(), source="manual"){
  const odo=Number(candidate);
  if(!Number.isFinite(odo) || odo<=0) return;
  if(DB.currentOdo==null || odo>=DB.currentOdo) DB.currentOdo=odo;

  if(source!=="fuel" && source!=="service"){
    DB.odoReadings.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
      date:dateMs,
      odo,
      source
    });
  }
}

function getAllOdoPoints(){
  const pts=[];
  if(DB.pickup.completed && DB.pickup.date && DB.pickup.odo!=null){
    pts.push({date:DB.pickup.date,odo:Number(DB.pickup.odo),source:"pickup"});
  }
  DB.odoReadings.forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:x.source||"odo"}));
  DB.fuel.forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:"fuel"}));
  DB.services.forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:"service"}));
  return pts
    .filter(x=>Number.isFinite(x.date)&&Number.isFinite(x.odo))
    .sort((a,b)=>a.date-b.date);
}

function effectiveCurrentOdo(){
  const pts=getAllOdoPoints();
  const maxPoint = pts.reduce((m,x)=>Math.max(m,x.odo),0);
  return Math.max(Number(DB.currentOdo)||0,maxPoint||0) || null;
}

// ==========================================================
// MISSION STATIC CONFIG
// ==========================================================

const FINAL_START = new Date(2026,7,20,0,0,0).getTime();
const TARGET_PICKUP = new Date(2026,8,12,0,0,0).getTime();
const LEGACY_START = new Date(2026,3,4,0,0,0).getTime();
const EARLIEST_READY = new Date(2026,8,5,0,0,0).getTime();

const LIVE_DECIMALS=6;
const DAY_DECIMALS=4;
const MILESTONES=[5,10,25,50,75,90,95,99,100];

const CELEBRATIONS=[
  {value:5,message:"SYSTEMS ONLINE"},
  {value:10,message:"DOUBLE DIGITS"},
  {value:25,message:"QUARTER MISSION COMPLETE"},
  {value:50,message:"HALFWAY THERE"},
  {value:69,message:"NICE."},
  {value:75,message:"THREE QUARTERS COMPLETE"},
  {value:90,message:"FINAL APPROACH"},
  {value:95,message:"ALMOST HOME"},
  {value:99,message:"DO NOT TURN OFF YOUR MAZDA"},
  {value:100,message:"MISSION COMPLETE // READY TO DRIVE 😎"}
];

const PHASES=[
  {start:new Date(2026,7,20).getTime(),end:new Date(2026,7,24).getTime(),icon:"🇸🇰",short:"TRACK",status:"🇸🇰 CREW AWAY // SLOVAKIA TRACK MODE",objective:"WAIT FOR CREW RETURN",next:"ENGINE INSTALL",code:"TRACK"},
  {start:new Date(2026,7,24).getTime(),end:new Date(2026,7,29).getTime(),icon:"🔧",short:"INSTALL",status:"🔧 ENGINE INSTALL // EXHAUST PHASE",objective:"ENGINE → CAR // LONG DP",next:"FIRST START",code:"INSTALL"},
  {start:new Date(2026,7,29).getTime(),end:new Date(2026,7,31).getTime(),icon:"⚙️",short:"START",status:"⚙️ START-UP PREPARATION",objective:"FIRST START // SYSTEM CHECK",next:"1000 KM BREAK-IN",code:"STARTUP"},
  {start:new Date(2026,7,31).getTime(),end:new Date(2026,8,3).getTime(),icon:"🛣️",short:"BREAK-IN",status:"🛣️ BREAK-IN RUNNING",objective:"1000 KM ROAD BREAK-IN",next:"DYNO // DISI TUNE",code:"BREAKIN"},
  {start:new Date(2026,8,3).getTime(),end:new Date(2026,8,5).getTime(),icon:"📈",short:"DYNO",status:"📈 DYNO // DISI TUNE",objective:"FINAL OIL // DYNO // CALIBRATION",next:"FINAL CHECKS",code:"DYNO"},
  {start:new Date(2026,8,5).getTime(),end:new Date(2026,8,12).getTime(),icon:"✅",short:"FINAL",status:"✅ FINAL CHECKS // PICKUP WINDOW",objective:"WAITING FOR THE CALL 📞",next:"READY TO DRIVE",code:"FINAL"},
  {start:new Date(2026,8,12).getTime(),end:new Date(2099,0,1).getTime(),icon:"😎",short:"READY",status:"😎 MISSION COMPLETE",objective:"READY TO DRIVE",next:"DRIVE",code:"DONE"}
];

const MISSION_LOG=[
  {date:"04.04",time:new Date(2026,3,4).getTime(),text:"MPS DELIVERED // REBUILD MISSION START",kind:"actual"},
  {date:"20.08",time:FINAL_START,text:"FINAL STAGE COUNTDOWN ONLINE",kind:"actual"},
  {date:"24.08",time:new Date(2026,7,24).getTime(),text:"CREW RETURN // ENGINE INSTALL WINDOW",kind:"planned"},
  {date:"31.08",time:new Date(2026,7,31).getTime(),text:"1000 KM BREAK-IN WINDOW",kind:"planned"},
  {date:"03.09",time:new Date(2026,8,3).getTime(),text:"DYNO // DISI TUNE WINDOW",kind:"planned"},
  {date:"05.09",time:EARLIEST_READY,text:"EARLIEST POSSIBLE READY DATE",kind:"planned"},
  {date:"12.09",time:TARGET_PICKUP,text:"TARGET PICKUP // MISSION END",kind:"planned"}
];

function findPhase(now){
  return PHASES.find(p=>now>=p.start&&now<p.end)||PHASES[PHASES.length-1];
}
function dayProgress(nowMs){
  const d=new Date(nowMs);
  const s=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
  const e=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();
  return clamp((nowMs-s)/(e-s),0,1);
}
function systemMessage(p){
  if(p>=100)return"MISSION COMPLETE // READY TO DRIVE 😎";
  if(p>=99)return"DO NOT TURN OFF YOUR MAZDA";
  if(p>=95)return"ALMOST HOME";
  if(p>=90)return"FINAL APPROACH";
  if(p>=75&&p<76)return"THREE QUARTERS COMPLETE";
  if(p>=69&&p<70)return"NICE.";
  if(p>=50&&p<51)return"HALFWAY THERE";
  if(p>=25&&p<26)return"QUARTER MISSION COMPLETE";
  if(p>=10&&p<11)return"DOUBLE DIGITS";
  return"ALL SYSTEMS NOMINAL";
}

const dayRingRadius=46;
const dayRingCirc=2*Math.PI*dayRingRadius;
const dayRing=$("dayRingFg");
dayRing.style.strokeDasharray=String(dayRingCirc);

function renderPhaseMap(){
  $("phaseMap").innerHTML=PHASES.slice(0,-1).map(p=>`
    <div class="phaseNode" data-phase="${p.code}">
      <div class="ico">${p.icon}</div>
      <div class="name">${p.short}</div>
    </div>
  `).join("");
}
renderPhaseMap();

function updatePhaseMap(now,current){
  document.querySelectorAll(".phaseNode").forEach(node=>{
    const p=PHASES.find(x=>x.code===node.dataset.phase);
    node.classList.remove("done","active","future");
    if(current.code==="DONE"||now>=p.end)node.classList.add("done");
    else if(current.code===p.code)node.classList.add("active");
    else node.classList.add("future");
  });
}

function renderMissionLog(now){
  $("missionLog").innerHTML=MISSION_LOG.map(entry=>{
    const future=now<entry.time;
    const cls=future?"future":entry.kind;
    const tag=entry.kind==="planned"?"PLAN":"ACTUAL";
    return `<div class="logEntry ${cls}">
      <div class="logDate">${entry.date}</div>
      <div class="logDotWrap"><div class="logDot"></div><div class="logLine"></div></div>
      <div class="logText">${entry.text}<span class="logTag">${tag}</span></div>
    </div>`;
  }).join("");
}
renderMissionLog(Date.now());

// ==========================================================
// MILESTONE CELEBRATIONS
// ==========================================================

function celebrationKey(v){return `mps_celebration_${v}`;}
let celebrationCheckedAt=0;

function maybeCelebrate(percent){
  const reached=CELEBRATIONS.filter(m=>percent>=m.value);
  const unseen=reached.filter(m=>localStorage.getItem(celebrationKey(m.value))!=="1");
  if(!unseen.length)return;

  const m=unseen[unseen.length-1];
  reached.filter(x=>x.value<m.value).forEach(x=>localStorage.setItem(celebrationKey(x.value),"1"));
  $("celebrationPct").textContent=`${m.value}%`;
  $("celebrationMsg").textContent=m.message;
  $("celebration").dataset.value=String(m.value);
  $("celebration").hidden=false;
}

$("celebrationClose").addEventListener("click",()=>{
  const v=$("celebration").dataset.value;
  if(v)localStorage.setItem(celebrationKey(v),"1");
  $("celebration").hidden=true;
});

// ==========================================================
// MISSION LIVE UPDATE
// ==========================================================

function updateMission(){
  const now=Date.now(),nowDate=new Date(now);
  const total=TARGET_PICKUP-FINAL_START;
  const progress=clamp((now-FINAL_START)/total,0,1);
  const percent=progress*100;

  $("percent").textContent=`${pct(percent,LIVE_DECIMALS)}%`;
  $("progress").style.width=`${percent}%`;
  $("elapsed").textContent=formatDuration(now-FINAL_START);
  $("remaining").textContent=now>=TARGET_PICKUP?"READY 😎":formatDuration(TARGET_PICKUP-now);

  const totalDays=Math.ceil(total/msDay);
  const missionDay=clamp(Math.floor((now-FINAL_START)/msDay)+1,1,totalDays);
  $("day").textContent=`${missionDay} / ${totalDays}`;
  $("dayDate").textContent=formatDate(now);
  $("dayClock").textContent=`${pad2(nowDate.getHours())}:${pad2(nowDate.getMinutes())}:${pad2(nowDate.getSeconds())} / 24:00:00`;

  const dp=dayProgress(now);
  dayRing.style.strokeDashoffset=String(dayRingCirc*(1-dp));
  $("dayProgressValue").textContent=`${pct(dp*100,DAY_DECIMALS)}%`;

  $("legacyCounter").textContent=formatDuration(now-LEGACY_START);

  const phase=findPhase(now);
  $("status").textContent=phase.status;
  $("objective").textContent=`▶ ${phase.objective}`;
  $("nextPhase").textContent=`→ ${phase.next}`;

  const pp=phase.code==="DONE"?1:clamp((now-phase.start)/(phase.end-phase.start),0,1);
  $("phaseProgress").textContent=`${pct(pp*100,4)}%`;
  $("phaseBar").style.width=`${pp*100}%`;
  updatePhaseMap(now,phase);

  if(phase.code==="BREAKIN"){
    $("breakInCard").hidden=false;
    $("breakIn").textContent=`${Math.round(1000*pp)} / 1000 KM`;
    $("breakInPct").textContent=`${pct(pp*100,1)}%`;
    $("breakInBar").style.width=`${pp*100}%`;
  }else $("breakInCard").hidden=true;

  let nm=100;
  for(const m of MILESTONES){if(percent<m){nm=m;break;}}
  const mt=FINAL_START+total*(nm/100);
  $("milestone").textContent=`${nm}% // T− ${formatDuration(mt-now)}`;

  const predictedReady=now<EARLIEST_READY?EARLIEST_READY:now;
  const buffer=TARGET_PICKUP-predictedReady;
  const bufferEl=$("bufferValue");
  bufferEl.classList.remove("warning","danger");
  if(now>=TARGET_PICKUP){
    bufferEl.textContent=`OVERDUE ${formatDuration(now-TARGET_PICKUP,false)}`;
    bufferEl.classList.add("danger");
    $("bufferSub").textContent="TARGET WINDOW EXCEEDED";
  }else{
    bufferEl.textContent=`+${formatDuration(buffer,false)}`;
    if(buffer<48*3600000)bufferEl.classList.add("danger");
    else if(buffer<96*3600000)bufferEl.classList.add("warning");
    $("bufferSub").textContent=now<EARLIEST_READY
      ?"RESERVE BETWEEN EARLIEST READY AND TARGET"
      :"LIVE RESERVE LEFT UNTIL TARGET PICKUP";
  }

  $("system").textContent=`> ${systemMessage(percent)}`;

  if(DB.pickup.completed){
    $("operationsBanner").hidden=false;
    $("operationsBannerValue").textContent=
      `PICKUP ${formatDateTime(DB.pickup.date)} // ${fmtNum(DB.pickup.odo)} KM`;
  }else{
    $("operationsBanner").hidden=true;
  }

  if(now-celebrationCheckedAt>1000){
    celebrationCheckedAt=now;
    if($("celebration").hidden)maybeCelebrate(percent);
  }
}

// ==========================================================
// FUEL CALCULATIONS
// ==========================================================

function sortedFuel(){
  return [...DB.fuel].sort((a,b)=>a.date-b.date || a.odo-b.odo);
}

function fuelIntervals(){
  const fuels=sortedFuel();
  const fullIndices=fuels.map((x,i)=>x.full?i:-1).filter(i=>i>=0);
  const intervals=[];

  for(let k=1;k<fullIndices.length;k++){
    const prevIdx=fullIndices[k-1];
    const currIdx=fullIndices[k];
    const prev=fuels[prevIdx],curr=fuels[currIdx];
    const distance=Number(curr.odo)-Number(prev.odo);
    if(distance<=0)continue;

    let liters=0,cost=0;
    for(let i=prevIdx+1;i<=currIdx;i++){
      liters+=Number(fuels[i].liters)||0;
      cost+=Number(fuels[i].total)||0;
    }
    if(liters<=0)continue;

    intervals.push({
      start:prev,
      end:curr,
      distance,
      liters,
      cost,
      consumption:liters/distance*100,
      cost100:cost/distance*100
    });
  }

  return intervals;
}

function fuelStats(){
  const fuels=sortedFuel();
  const intervals=fuelIntervals();
  const totalLiters=fuels.reduce((s,x)=>s+(Number(x.liters)||0),0);
  const totalSpend=fuels.reduce((s,x)=>s+(Number(x.total)||0),0);
  const avgPrice=totalLiters>0?totalSpend/totalLiters:null;

  let weightedAvg=null,totalIntervalDistance=0,totalIntervalLiters=0,totalIntervalCost=0;
  intervals.forEach(i=>{
    totalIntervalDistance+=i.distance;
    totalIntervalLiters+=i.liters;
    totalIntervalCost+=i.cost;
  });
  if(totalIntervalDistance>0)weightedAvg=totalIntervalLiters/totalIntervalDistance*100;

  const consumptions=intervals.map(i=>i.consumption);
  return {
    fuels,intervals,totalLiters,totalSpend,avgPrice,
    last:intervals.length?intervals[intervals.length-1].consumption:null,
    avg:weightedAvg,
    best:consumptions.length?Math.min(...consumptions):null,
    worst:consumptions.length?Math.max(...consumptions):null,
    cost100:totalIntervalDistance>0?totalIntervalCost/totalIntervalDistance*100:null,
    costKm:totalIntervalDistance>0?totalIntervalCost/totalIntervalDistance:null,
    intervalDistance:totalIntervalDistance
  };
}

function drawFuelChart(intervals){
  const canvas=$("fuelChart");
  const ctx=canvas.getContext("2d");
  const ratio=window.devicePixelRatio||1;
  const cssW=canvas.clientWidth||320;
  const cssH=150;
  canvas.width=cssW*ratio;
  canvas.height=cssH*ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  if(intervals.length<1){
    ctx.fillStyle="#858b94";
    ctx.font="11px ui-monospace";
    ctx.fillText("FULL-TO-FULL DATA WILL APPEAR HERE",10,70);
    return;
  }

  const vals=intervals.slice(-12).map(x=>x.consumption);
  let min=Math.min(...vals),max=Math.max(...vals);
  if(max-min<1){min-=0.5;max+=0.5}
  const left=8,right=8,top=12,bottom=22;
  const w=cssW-left-right,h=cssH-top-bottom;

  ctx.strokeStyle="#30363e";
  ctx.lineWidth=1;
  for(let i=0;i<4;i++){
    const y=top+h*(i/3);
    ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(left+w,y);ctx.stroke();
  }

  ctx.strokeStyle="#39d353";
  ctx.lineWidth=2.5;
  ctx.beginPath();

  vals.forEach((v,i)=>{
    const x=vals.length===1?left+w/2:left+w*(i/(vals.length-1));
    const y=top+h*(1-(v-min)/(max-min));
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.fillStyle="#39d353";
  vals.forEach((v,i)=>{
    const x=vals.length===1?left+w/2:left+w*(i/(vals.length-1));
    const y=top+h*(1-(v-min)/(max-min));
    ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();
  });

  ctx.fillStyle="#858b94";
  ctx.font="9px ui-monospace";
  ctx.fillText(`${fmtNum(max,1)} L/100`,left,9);
  ctx.fillText(`${fmtNum(min,1)} L/100`,left,cssH-5);
}

function renderDrive(){
  const odo=effectiveCurrentOdo();
  const kmSincePickup=(DB.pickup.completed&&odo!=null&&DB.pickup.odo!=null)
    ? Math.max(0,odo-Number(DB.pickup.odo))
    : null;

  $("driveCurrentOdo").textContent=odo!=null?fmtNum(odo):"—";
  $("kmSincePickup").textContent=kmSincePickup!=null?fmtNum(kmSincePickup):"—";

  const fs=fuelStats();
  $("fuelIntervalsBadge").textContent=`${fs.intervals.length} VALID INTERVAL${fs.intervals.length===1?"":"S"}`;
  $("fuelLast").textContent=fs.last!=null?fmtNum(fs.last,2):"—";
  $("fuelAvg").textContent=fs.avg!=null?fmtNum(fs.avg,2):"—";
  $("fuelBest").textContent=fs.best!=null?fmtNum(fs.best,2):"—";
  $("fuelWorst").textContent=fs.worst!=null?fmtNum(fs.worst,2):"—";
  $("avgFuelPrice").textContent=fs.avgPrice!=null?fmtNum(fs.avgPrice,3):"—";
  $("fuelCost100").textContent=fs.cost100!=null?fmtMoney(fs.cost100):"—";
  $("fuelCostKm").textContent=fs.costKm!=null?fmtNum(fs.costKm,3):"—";
  $("totalFuelSpend").textContent=fs.totalSpend>0?fmtMoney(fs.totalSpend):"—";

  const rebuildCost=Number(DB.settings.rebuildCost)||0;
  const serviceSpend=DB.services.reduce((s,x)=>s+(Number(x.cost)||0),0);
  const dist=kmSincePickup||0;
  const rebuildPerKm=dist>0?rebuildCost/dist:null;
  const servicePerKm=dist>0?serviceSpend/dist:null;
  const fuelPerKm=fs.costKm;
  const totalPerKm=(rebuildPerKm||0)+(servicePerKm||0)+(fuelPerKm||0);

  $("rebuildCostKm").textContent=rebuildPerKm!=null?`${fmtNum(rebuildPerKm,2)} PLN`:"—";
  $("costFuelKm2").textContent=fuelPerKm!=null?`${fmtNum(fuelPerKm,3)} PLN`:"—";
  $("serviceCostKm").textContent=servicePerKm!=null?`${fmtNum(servicePerKm,3)} PLN`:"—";
  $("totalCostKm").textContent=dist>0?`${fmtNum(totalPerKm,2)} PLN`:"—";

  renderRecentFuel(fs.fuels);
  requestAnimationFrame(()=>drawFuelChart(fs.intervals));
}

function renderRecentFuel(fuels){
  const el=$("recentFuel");
  const recent=[...fuels].sort((a,b)=>b.date-a.date).slice(0,8);
  if(!recent.length){
    el.className="dataList emptyState";el.textContent="BRAK DANYCH";return;
  }
  el.className="dataList";
  el.innerHTML=recent.map(x=>{
    const price=Number(x.liters)>0?Number(x.total)/Number(x.liters):0;
    return `<div class="dataRow">
      <div>
        <div class="dataMain">${x.full?"⛽ FULL":"⛽ PARTIAL"} // ${fmtNum(x.liters,2)} L</div>
        <div class="dataSub">${formatDateTime(x.date)} // ${fmtNum(x.odo)} KM${x.note?` // ${escapeHtml(x.note)}`:""}</div>
      </div>
      <div class="dataSide">${fmtMoney(x.total)} PLN<div class="dataSub">${fmtNum(price,3)} PLN/L</div></div>
    </div>`;
  }).join("");
}

// ==========================================================
// SERVICE
// ==========================================================

const oilRingRadius=46;
const oilRingCirc=2*Math.PI*oilRingRadius;
const oilRing=$("oilRingFg");
oilRing.style.strokeDasharray=String(oilRingCirc);

function drivingRateKmDay(){
  const pts=getAllOdoPoints();
  if(pts.length<2)return null;

  const now=Date.now();
  const cutoff=now-30*msDay;
  let recent=pts.filter(x=>x.date>=cutoff);

  if(recent.length<2)recent=pts;
  if(recent.length<2)return null;

  // Use first/last chronological point, but ensure odo increased.
  const first=recent[0];
  const last=recent[recent.length-1];
  const days=(last.date-first.date)/msDay;
  const km=last.odo-first.odo;
  if(days<=0||km<=0)return null;
  return km/days;
}

function oilForecast(){
  const baseDate=Number(DB.oilBaseline.date);
  const baseOdo=Number(DB.oilBaseline.odo);
  const current=effectiveCurrentOdo();

  if(!baseDate||!Number.isFinite(baseOdo)||current==null){
    return null;
  }

  const target=Number(DB.settings.oilTargetKm)||5000;
  const softMax=Number(DB.settings.oilSoftMaxKm)||6000;
  const months=Number(DB.settings.oilMaxMonths)||8;

  const kmSince=Math.max(0,current-baseOdo);
  const kmLeft=target-kmSince;
  const softLeft=softMax-kmSince;
  const kmProgress=target>0?kmSince/target:0;

  const timeDue=addMonths(baseDate,months);
  const rate=drivingRateKmDay();

  let distanceDue=null;
  if(rate&&rate>0){
    distanceDue=Date.now()+Math.max(0,kmLeft)/rate*msDay;
  }

  let forecast=timeDue;
  let factor="TIME";
  if(distanceDue!=null&&distanceDue<timeDue){
    forecast=distanceDue;
    factor="DISTANCE";
  }

  return {
    baseDate,baseOdo,current,target,softMax,months,
    kmSince,kmLeft,softLeft,kmProgress,timeDue,rate,distanceDue,forecast,factor
  };
}

function renderService(){
  const f=oilForecast();
  $("oilTargetKm").textContent=`${fmtNum(DB.settings.oilTargetKm)} KM`;
  $("oilTimeMax").textContent=`${fmtNum(DB.settings.oilMaxMonths)} MONTHS`;

  if(!f){
    $("oilLifePct").textContent="—";
    $("oilRingKm").textContent="—";
    $("oilBar").style.width="0%";
    oilRing.style.strokeDashoffset=String(oilRingCirc);
    oilRing.style.stroke="#39d353";
    $("oilKmSince").textContent="—";
    $("oilTimeSince").textContent="—";
    $("oilForecastDate").textContent="—";
    $("oilForecastReason").textContent="ADD PICKUP / OIL BASELINE";
    $("avgKmDay").textContent="—";
    $("projectedYearKm").textContent="—";
    $("kmToOil").textContent="—";
    $("kmToOilSoft").textContent="—";
  }else{
    const usedPct=Math.max(0,f.kmProgress*100);
    $("oilLifePct").textContent=`${fmtNum(usedPct,1)}%`;
    $("oilRingKm").textContent=fmtNum(Math.max(0,f.kmLeft));
    $("oilBar").style.width=`${Math.min(100,usedPct)}%`;

    const ringP=clamp(f.kmProgress,0,1);
    oilRing.style.strokeDashoffset=String(oilRingCirc*(1-ringP));

    let oilColor="#39d353";
    if(usedPct>=100)oilColor="#ff453a";
    else if(usedPct>=80)oilColor="#ff9f35";
    oilRing.style.stroke=oilColor;
    $("oilBar").style.background=oilColor;
    $("oilLifePct").style.color=oilColor;

    $("oilKmSince").textContent=`${fmtNum(f.kmSince)} KM`;
    $("oilTimeSince").textContent=formatDuration(Date.now()-f.baseDate,false);
    $("oilForecastDate").textContent=formatDate(f.forecast);
    $("oilForecastReason").textContent=
      f.factor==="DISTANCE"
      ? `DISTANCE LIMIT FIRST // ${f.rate?fmtNum(f.rate,1):"—"} KM/DAY`
      : "TIME LIMIT FIRST";

    $("avgKmDay").textContent=f.rate?fmtNum(f.rate,1):"—";
    $("projectedYearKm").textContent=f.rate?fmtNum(f.rate*365):"—";
    $("kmToOil").textContent=fmtNum(Math.max(0,f.kmLeft));
    $("kmToOilSoft").textContent=fmtNum(Math.max(0,f.softLeft));
  }

  renderServiceHistory();
}

function renderServiceHistory(){
  const el=$("serviceHistory");
  const arr=[...DB.services].sort((a,b)=>b.date-a.date);
  if(!arr.length){
    el.className="dataList emptyState";el.textContent="BRAK DANYCH";return;
  }
  el.className="dataList";
  el.innerHTML=arr.map(x=>`
    <div class="dataRow">
      <div>
        <div class="dataMain">🔧 ${escapeHtml(x.name||"SERVICE")}${x.setsOil?' <span class="logTag">OIL BASE</span>':""}</div>
        <div class="dataSub">${formatDateTime(x.date)} // ${fmtNum(x.odo)} KM${x.note?` // ${escapeHtml(x.note)}`:""}</div>
      </div>
      <div class="dataSide">${fmtMoney(x.cost||0)} PLN</div>
    </div>
  `).join("");
}

// ==========================================================
// VEHICLE LOG
// ==========================================================

function escapeHtml(s){
  return String(s??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function renderVehicleLog(){
  const events=[];

  if(DB.pickup.completed){
    events.push({
      date:DB.pickup.date,icon:"😎",
      title:"MPS PICKUP // OPERATIONS START",
      sub:`${fmtNum(DB.pickup.odo)} KM`
    });
  }

  DB.fuel.forEach(x=>events.push({
    date:x.date,icon:"⛽",
    title:`${x.full?"FULL TANK":"PARTIAL"} // ${fmtNum(x.liters,2)} L // ${fmtMoney(x.total)} PLN`,
    sub:`${fmtNum(x.odo)} KM${x.note?` // ${escapeHtml(x.note)}`:""}`
  }));

  DB.services.forEach(x=>events.push({
    date:x.date,icon:"🔧",
    title:`${escapeHtml(x.name||"SERVICE")} // ${fmtMoney(x.cost||0)} PLN`,
    sub:`${fmtNum(x.odo)} KM${x.note?` // ${escapeHtml(x.note)}`:""}`
  }));

  DB.odoReadings.forEach(x=>events.push({
    date:x.date,icon:"📍",
    title:"ODOMETER READING",
    sub:`${fmtNum(x.odo)} KM`
  }));

  events.sort((a,b)=>b.date-a.date);
  $("eventCount").textContent=`${events.length} EVENT${events.length===1?"":"S"}`;

  const el=$("vehicleLog");
  if(!events.length){
    el.className="vehicleLog emptyState";
    el.textContent="BRAK DANYCH";
    return;
  }

  el.className="vehicleLog";
  el.innerHTML=events.map(x=>`
    <div class="dataRow">
      <div>
        <div class="dataMain"><span class="eventIcon">${x.icon}</span>${x.title}</div>
        <div class="dataSub">${formatDateTime(x.date)} // ${x.sub}</div>
      </div>
    </div>
  `).join("");
}

// ==========================================================
// SETTINGS / FORMS
// ==========================================================

function syncSettingsUI(){
  $("settingPickupDate").value=DB.pickup.date?localDateTimeValue(DB.pickup.date):"";
  $("settingPickupOdo").value=DB.pickup.odo??"";
  $("settingCurrentOdo").value=effectiveCurrentOdo()??"";
  $("settingRebuildCost").value=DB.settings.rebuildCost??46000;
  $("settingOilTarget").value=DB.settings.oilTargetKm??5000;
  $("settingOilSoftMax").value=DB.settings.oilSoftMaxKm??6000;
  $("settingOilMonths").value=DB.settings.oilMaxMonths??8;
}

function refreshAll(){
  syncSettingsUI();
  renderDrive();
  renderService();
  renderVehicleLog();
}

function openModal(id){
  const m=$(id);
  if(!m)return;
  m.hidden=false;

  const nowVal=localDateTimeValue();
  if(id==="fuelModal"){
    $("fuelDate").value=nowVal;
    $("fuelOdo").value=effectiveCurrentOdo()??"";
    $("fuelLiters").value="";
    $("fuelTotal").value="";
    $("fuelNote").value="";
    $("fuelFull").checked=true;
    updateFuelPricePreview();
  }
  if(id==="odoModal"){
    $("odoDate").value=nowVal;
    $("odoValue").value=effectiveCurrentOdo()??"";
  }
  if(id==="serviceModal"){
    $("serviceDate").value=nowVal;
    $("serviceOdo").value=effectiveCurrentOdo()??"";
    $("serviceName").value="";
    $("serviceCost").value="";
    $("serviceNote").value="";
    $("serviceSetsOil").checked=false;
  }
  if(id==="oilBaselineModal"){
    $("oilBaseDate").value=DB.oilBaseline.date?localDateTimeValue(DB.oilBaseline.date):nowVal;
    $("oilBaseOdo").value=DB.oilBaseline.odo??effectiveCurrentOdo()??"";
  }
}

function closeModal(id){ if($(id))$(id).hidden=true; }

document.querySelectorAll("[data-open-modal]").forEach(btn=>{
  btn.addEventListener("click",()=>openModal(btn.dataset.openModal));
});
document.querySelectorAll("[data-close-modal]").forEach(btn=>{
  btn.addEventListener("click",()=>closeModal(btn.dataset.closeModal));
});

$("completeMissionBtn").addEventListener("click",()=>{
  $("pickupDateInput").value=localDateTimeValue();
  $("pickupOdoInput").value=effectiveCurrentOdo()??"";
  $("pickupOilBaseline").checked=true;
  $("missionCompleteModal").hidden=false;
});

$("confirmPickupBtn").addEventListener("click",()=>{
  const date=parseLocalDateTime($("pickupDateInput").value);
  const odo=Number($("pickupOdoInput").value);
  if(!date||!Number.isFinite(odo)||odo<=0){
    showToast("Podaj datę i prawidłowy przebieg.");
    return;
  }
  DB.pickup={completed:true,date,odo};
  DB.currentOdo=odo;
  DB.odoReadings.push({
    id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
    date,odo,source:"pickup"
  });

  if($("pickupOilBaseline").checked){
    DB.oilBaseline={date,odo};
    DB.services.push({
      id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+1),
      date,odo,name:"FINAL OIL // POST-REBUILD BASELINE",cost:0,note:"Auto-created at pickup",setsOil:true
    });
  }
  saveData();
  closeModal("missionCompleteModal");
  refreshAll();
  showToast("POST-REBUILD OPERATIONS ONLINE 😎");
});

function updateFuelPricePreview(){
  const liters=Number($("fuelLiters").value);
  const total=Number($("fuelTotal").value);
  $("fuelPricePreview").textContent=(liters>0&&total>=0)?`${fmtNum(total/liters,3)} PLN/L`:"—";
}
$("fuelLiters").addEventListener("input",updateFuelPricePreview);
$("fuelTotal").addEventListener("input",updateFuelPricePreview);

$("saveFuelBtn").addEventListener("click",()=>{
  const date=parseLocalDateTime($("fuelDate").value);
  const odo=Number($("fuelOdo").value);
  const liters=Number($("fuelLiters").value);
  const total=Number($("fuelTotal").value);
  if(!date||!Number.isFinite(odo)||odo<=0||!Number.isFinite(liters)||liters<=0||!Number.isFinite(total)||total<0){
    showToast("Sprawdź datę, przebieg, litry i kwotę.");
    return;
  }
  DB.fuel.push({
    id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}_${Math.random()}`,
    date,odo,liters,total,full:$("fuelFull").checked,note:$("fuelNote").value.trim()
  });
  updateCurrentOdo(odo,date,"fuel");
  saveData();
  closeModal("fuelModal");
  refreshAll();
  showToast("Tankowanie zapisane ⛽");
});

$("saveOdoBtn").addEventListener("click",()=>{
  const date=parseLocalDateTime($("odoDate").value);
  const odo=Number($("odoValue").value);
  if(!date||!Number.isFinite(odo)||odo<=0){
    showToast("Podaj datę i przebieg.");
    return;
  }
  updateCurrentOdo(odo,date,"manual");
  saveData();closeModal("odoModal");refreshAll();showToast("Przebieg zapisany.");
});

$("saveServiceBtn").addEventListener("click",()=>{
  const date=parseLocalDateTime($("serviceDate").value);
  const odo=Number($("serviceOdo").value);
  const name=$("serviceName").value.trim();
  const cost=Number($("serviceCost").value||0);
  const setsOil=$("serviceSetsOil").checked;

  if(!date||!Number.isFinite(odo)||odo<=0||!name){
    showToast("Podaj datę, przebieg i nazwę serwisu.");
    return;
  }

  DB.services.push({
    id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}_${Math.random()}`,
    date,odo,name,cost:Number.isFinite(cost)?cost:0,note:$("serviceNote").value.trim(),setsOil
  });
  updateCurrentOdo(odo,date,"service");
  if(setsOil)DB.oilBaseline={date,odo};

  saveData();closeModal("serviceModal");refreshAll();showToast("Serwis zapisany 🔧");
});

$("saveOilBaselineBtn").addEventListener("click",()=>{
  const date=parseLocalDateTime($("oilBaseDate").value);
  const odo=Number($("oilBaseOdo").value);
  if(!date||!Number.isFinite(odo)||odo<=0){
    showToast("Podaj datę i przebieg.");
    return;
  }
  DB.oilBaseline={date,odo};
  saveData();closeModal("oilBaselineModal");refreshAll();showToast("Baza oleju ustawiona.");
});

$("saveBaselineBtn").addEventListener("click",()=>{
  const date=parseLocalDateTime($("settingPickupDate").value);
  const odo=Number($("settingPickupOdo").value);
  const current=Number($("settingCurrentOdo").value);
  const rebuild=Number($("settingRebuildCost").value);

  if(date&&Number.isFinite(odo)&&odo>0){
    DB.pickup={completed:true,date,odo};
  }
  if(Number.isFinite(current)&&current>0)DB.currentOdo=current;
  if(Number.isFinite(rebuild)&&rebuild>=0)DB.settings.rebuildCost=rebuild;

  saveData();refreshAll();showToast("Baseline zapisany.");
});

$("saveOilSettingsBtn").addEventListener("click",()=>{
  const target=Number($("settingOilTarget").value);
  const soft=Number($("settingOilSoftMax").value);
  const months=Number($("settingOilMonths").value);
  if(target<=0||soft<=0||months<=0){
    showToast("Interwały muszą być większe od zera.");
    return;
  }
  DB.settings.oilTargetKm=target;
  DB.settings.oilSoftMaxKm=soft;
  DB.settings.oilMaxMonths=months;
  saveData();refreshAll();showToast("Interwały zapisane.");
});

// ==========================================================
// BACKUP
// ==========================================================

$("exportBackupBtn").addEventListener("click",()=>{
  const payload={
    exportedAt:new Date().toISOString(),
    app:"MPS Mission Control",
    version:3,
    data:DB
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=`MPS_Mission_Control_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  showToast("Backup wygenerowany.");
});

$("importBackupInput").addEventListener("change",async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  try{
    const text=await file.text();
    const parsed=JSON.parse(text);
    const incoming=parsed.data||parsed;
    if(!incoming.settings||!Array.isArray(incoming.fuel)||!Array.isArray(incoming.services)){
      throw new Error("invalid");
    }
    DB={
      ...deepClone(DEFAULT_DATA),
      ...incoming,
      settings:{...DEFAULT_DATA.settings,...(incoming.settings||{})},
      pickup:{...DEFAULT_DATA.pickup,...(incoming.pickup||{})},
      oilBaseline:{...DEFAULT_DATA.oilBaseline,...(incoming.oilBaseline||{})}
    };
    saveData();refreshAll();showToast("Backup zaimportowany.");
  }catch(err){
    showToast("Nieprawidłowy plik backupu.");
  }finally{
    e.target.value="";
  }
});

$("resetDataBtn").addEventListener("click",()=>{
  if(!confirm("Na pewno usunąć wszystkie lokalne dane MPS Mission Control?"))return;
  localStorage.removeItem(KEY);
  DB=deepClone(DEFAULT_DATA);
  saveData();refreshAll();showToast("Dane wyzerowane.");
});

// ==========================================================
// NAV
// ==========================================================

function showScreen(name){
  document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".navBtn").forEach(x=>x.classList.remove("active"));
  $(`screen-${name}`).classList.add("active");
  document.querySelector(`.navBtn[data-screen="${name}"]`)?.classList.add("active");

  if(name==="drive")renderDrive();
  if(name==="service")renderService();
  if(name==="log")renderVehicleLog();
  if(name==="settings")syncSettingsUI();

  window.scrollTo({top:0,behavior:"instant"});
}

document.querySelectorAll(".navBtn").forEach(btn=>{
  btn.addEventListener("click",()=>showScreen(btn.dataset.screen));
});

// ==========================================================
// INITIALIZE
// ==========================================================

syncSettingsUI();
renderDrive();
renderService();
renderVehicleLog();
updateMission();

setInterval(updateMission,100);

// Re-render non-live derived values periodically while app is open.
setInterval(()=>{
  const active=document.querySelector(".screen.active")?.id;
  if(active==="screen-drive")renderDrive();
  if(active==="screen-service")renderService();
},30000);

// PWA
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("./service-worker-v31.js").catch(()=>{});
  });
}

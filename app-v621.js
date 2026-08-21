// ==========================================================
// MPS OPERATING SYSTEM // PWA v6.2.1
// MODE: PROD
// ==========================================================

const APP_MODE = "PROD";
const DB_NAME = "MPSMissionControl_v6";
const CACHE_TAG = "mps-v6-prod-20260821";
const MIGRATE_V3 = true;
const OLD_LOCAL_KEY = "mpsMissionControlV3";

const DEFAULT_DATA = {
  version: 6.2,
  settings: {
    rebuildCost: 46000,
    oilTargetKm: 5000,
    oilSoftMaxKm: 6000,
    oilMaxMonths: 8,
    tankCapacity: 55,
    includeRebuildCost: true
  },
  pickup: { completed:false, date:null, odo:null },
  currentOdo: null,
  oilBaseline: { date:null, odo:null },
  fuel: [],
  odoReadings: [],
  services: [],
  expenses: [],
  maintenance: [],
  oilTopups: [],
  issues: [],
  tyres: [],
  parts: [],
  documents: [],
  buildSheet: [],
  buildMeta: {
    seeded: false,
    depositNet: 20000,
    source: "WORKSHOP LIST 2026"
  }
};

let DB = null;
let IDB = null;
let undoState = null;

const $ = id => document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad2=n=>String(n).padStart(2,"0");
const pad3=n=>String(n).padStart(3,"0");
const fmtNum=(n,d=0)=>Number(n).toLocaleString("pl-PL",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtMoney=n=>Number(n).toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=(v,d)=>Number(v).toFixed(d).replace(".",",");
const msDay=86400000;
const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}_${Math.random().toString(16).slice(2)}`;

function clone(x){return JSON.parse(JSON.stringify(x));}
function mergeDefaults(incoming={}){
  return {
    ...clone(DEFAULT_DATA),
    ...incoming,
    settings:{...DEFAULT_DATA.settings,...(incoming.settings||{})},
    pickup:{...DEFAULT_DATA.pickup,...(incoming.pickup||{})},
    oilBaseline:{...DEFAULT_DATA.oilBaseline,...(incoming.oilBaseline||{})},
    fuel:Array.isArray(incoming.fuel)?incoming.fuel:[],
    odoReadings:Array.isArray(incoming.odoReadings)?incoming.odoReadings:[],
    services:Array.isArray(incoming.services)?incoming.services:[],
    expenses:Array.isArray(incoming.expenses)?incoming.expenses:[],
    maintenance:Array.isArray(incoming.maintenance)?incoming.maintenance:[],
    oilTopups:Array.isArray(incoming.oilTopups)?incoming.oilTopups:[],
    issues:Array.isArray(incoming.issues)?incoming.issues:[],
    tyres:Array.isArray(incoming.tyres)?incoming.tyres:[],
    parts:Array.isArray(incoming.parts)?incoming.parts:[],
    documents:Array.isArray(incoming.documents)?incoming.documents:[],
    buildSheet:Array.isArray(incoming.buildSheet)?incoming.buildSheet:[],
    buildMeta:{...DEFAULT_DATA.buildMeta,...(incoming.buildMeta||{})}
  };
}

// ==========================================================
// 2026 REBUILD BUILD SHEET
// ==========================================================

const REBUILD_2026_SEED = [{"id": "rebuild2026_01", "name": "OEM timing kit (VVT, chain, tensioner, 2 guides)", "category": "TIMING", "netPrice": 2200, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_02", "name": "Valve cover gasket", "category": "SEALS", "netPrice": 95, "kind": "PARTS", "brand": "Elring", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_03", "name": "Crankshaft seal", "category": "SEALS", "netPrice": 38, "kind": "PARTS", "brand": "Elring", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_04", "name": "VVT seal", "category": "SEALS", "netPrice": 120, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_05", "name": "Crank pulley bolt", "category": "ENGINE", "netPrice": 58, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_06", "name": "Valvoline SynPower 5W40 — final oil", "category": "FLUIDS", "netPrice": 260, "kind": "PARTS", "brand": "Valvoline", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_07", "name": "Oil filter x3", "category": "FLUIDS", "netPrice": 100, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_08", "name": "Gearbox oil", "category": "FLUIDS", "netPrice": 270, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_09", "name": "Cleaning materials", "category": "MATERIALS", "netPrice": 200, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_10", "name": "Coolant", "category": "FLUIDS", "netPrice": 90, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_11", "name": "Cylinder head rebuild", "category": "MACHINING", "netPrice": 1500, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_12", "name": "Block sleeving", "category": "MACHINING", "netPrice": 4400, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_13", "name": "Piston machining for forged rods", "category": "MACHINING", "netPrice": 450, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_14", "name": "Forged connecting rods", "category": "ENGINE", "netPrice": 2900, "kind": "PARTS", "brand": "Manley", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_15", "name": "Piston rings", "category": "ENGINE", "netPrice": 550, "kind": "PARTS", "brand": "Rikken", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_16", "name": "Cylinder head bolts", "category": "ENGINE", "netPrice": 450, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_17", "name": "Clutch regeneration", "category": "MACHINING", "netPrice": 1800, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_18", "name": "Crankshaft support bolts", "category": "ENGINE", "netPrice": 350, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_19", "name": "Oil pump", "category": "ENGINE", "netPrice": 950, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_20", "name": "Oil pickup", "category": "ENGINE", "netPrice": 350, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_21", "name": "ACL Race main bearings", "category": "ENGINE", "netPrice": 480, "kind": "PARTS", "brand": "ACL Race", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_22", "name": "Cylinder head gasket", "category": "SEALS", "netPrice": 280, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_23", "name": "Rear crankshaft seal — gearbox side", "category": "SEALS", "netPrice": 145, "kind": "PARTS", "brand": "Elring", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_24", "name": "First-start oil 10W40", "category": "FLUIDS", "netPrice": 130, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_25", "name": "Break-in oil", "category": "FLUIDS", "netPrice": 160, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_26", "name": "A/C recharge", "category": "OTHER", "netPrice": 300, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_27", "name": "Exhaust manifold gasket", "category": "SEALS", "netPrice": 240, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_28", "name": "Power steering fluid", "category": "FLUIDS", "netPrice": 90, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_29", "name": "Oil filter housing gasket", "category": "SEALS", "netPrice": 45, "kind": "PARTS", "brand": "Elring", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_30", "name": "Balance delete kit", "category": "ENGINE", "netPrice": 550, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_31", "name": "ACL Race rod bearings", "category": "ENGINE", "netPrice": 335, "kind": "PARTS", "brand": "ACL Race", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_32", "name": "Injector regeneration", "category": "FUEL", "netPrice": 1450, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_33", "name": "D4D injector washers", "category": "FUEL", "netPrice": 120, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_34", "name": "Breather plate gasket", "category": "SEALS", "netPrice": 90, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_35", "name": "PCV valve gasket", "category": "SEALS", "netPrice": 55, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_36", "name": "Intake manifold gasket", "category": "SEALS", "netPrice": 80, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_37", "name": "Thermostat", "category": "COOLING", "netPrice": 140, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_38", "name": "Oil pump drive", "category": "ENGINE", "netPrice": 480, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_39", "name": "Water pump", "category": "COOLING", "netPrice": 220, "kind": "PARTS", "brand": "Febi", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_40", "name": "Coolant rail gasket", "category": "SEALS", "netPrice": 75, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_41", "name": "HPFP pump gasket", "category": "FUEL", "netPrice": 140, "kind": "PARTS", "brand": "OEM", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_42", "name": "Long downpipe", "category": "EXHAUST", "netPrice": 1500, "kind": "PARTS", "brand": "3\"", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_43", "name": "HPFP internals", "category": "FUEL", "netPrice": 1800, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_44", "name": "3\" intake", "category": "INTAKE", "netPrice": 1900, "kind": "PARTS", "brand": "CorkSport", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_45", "name": "DISI tuning", "category": "TUNING", "netPrice": 2000, "kind": "PARTS", "brand": "DISI Tune", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_46", "name": "Turbocharger", "category": "TURBO", "netPrice": 5000, "kind": "PARTS", "brand": "BNR S2", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_47", "name": "EBCS", "category": "TURBO", "netPrice": 250, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_48", "name": "52 mm oil temperature gauge", "category": "MONITORING", "netPrice": 309, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_49", "name": "Sensor adapter", "category": "MONITORING", "netPrice": 80, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_50", "name": "Break-in fuel", "category": "MATERIALS", "netPrice": 1000, "kind": "PARTS", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_51", "name": "Engine removal, teardown, assembly and installation", "category": "LABOR", "netPrice": 8000, "kind": "LABOR", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_52", "name": "Oil temperature gauge installation", "category": "LABOR", "netPrice": 400, "kind": "LABOR", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}, {"id": "rebuild2026_53", "name": "Wheel alignment", "category": "LABOR", "netPrice": 150, "kind": "LABOR", "brand": "", "status": "ESTIMATE", "source": "WORKSHOP LIST 2026", "note": ""}];

function ensureBuildSheetSeed(){
  if(!DB.buildMeta) DB.buildMeta={seeded:false,depositNet:20000,source:"WORKSHOP LIST 2026"};
  if(!Array.isArray(DB.buildSheet)) DB.buildSheet=[];
  if(!DB.buildMeta.seeded && DB.buildSheet.length===0){
    DB.buildSheet=REBUILD_2026_SEED.map(x=>({...x}));
    DB.buildMeta.seeded=true;
    DB.buildMeta.depositNet=20000;
  }
}

function buildSheetStats(){
  const parts=DB.buildSheet.filter(x=>x.kind!=="LABOR").reduce((s,x)=>s+Number(x.netPrice||0),0);
  const labor=DB.buildSheet.filter(x=>x.kind==="LABOR").reduce((s,x)=>s+Number(x.netPrice||0),0);
  const total=parts+labor;
  const deposit=Number(DB.buildMeta?.depositNet||0);
  return {parts,labor,total,deposit,balance:total-deposit};
}

let buildSheetVisible=false;

// ==========================================================
// INDEXEDDB
// ==========================================================

function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("kv"))db.createObjectStore("kv");
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
function idbGet(key){
  return new Promise((resolve,reject)=>{
    const tx=IDB.transaction("kv","readonly");
    const req=tx.objectStore("kv").get(key);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
function idbPut(key,value){
  return new Promise((resolve,reject)=>{
    const tx=IDB.transaction("kv","readwrite");
    tx.objectStore("kv").put(value,key);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
async function saveData(){ await idbPut("state",DB); }

async function initStorage(){
  IDB=await openDB();
  let stored=await idbGet("state");

  if(!stored && MIGRATE_V3){
    try{
      const old=localStorage.getItem(OLD_LOCAL_KEY);
      if(old){
        stored=JSON.parse(old);
        showToast("Migrating v3 data → IndexedDB...");
      }
    }catch(e){}
  }

  DB=mergeDefaults(stored||{});
  ensureBuildSheetSeed();
  await saveData();
  $("storageInfo").textContent=`Database: ${DB_NAME} // state stored in IndexedDB. ${MIGRATE_V3?"v3 localStorage migration enabled.":"TEST database isolated from production."}`;
}

// ==========================================================
// HELPERS
// ==========================================================

function localDateTimeValue(ms=Date.now()){
  const d=new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function parseLocalDateTime(v){if(!v)return null;const d=new Date(v);return Number.isFinite(d.getTime())?d.getTime():null}
function formatDateTime(ms){if(!ms)return"—";const d=new Date(ms);return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`}
function formatDate(ms){if(!ms)return"—";const d=new Date(ms);return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()}`}
function formatDuration(ms,millis=true){
  const neg=ms<0;ms=Math.abs(ms);
  const d=Math.floor(ms/msDay);ms%=msDay;
  const h=Math.floor(ms/3600000);ms%=3600000;
  const m=Math.floor(ms/60000);ms%=60000;
  const s=Math.floor(ms/1000),x=Math.floor(ms%1000);
  const body=millis?`${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(x)}`:`${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return neg?`−${body}`:body;
}
function addMonths(ms,months){
  const d=new Date(ms),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+Number(months));
  const max=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,max));return d.getTime()
}
function escapeHtml(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function showToast(text,undo=false){
  $("toastText").textContent=text;$("toast").hidden=false;$("toastUndo").hidden=!undo;
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>{$("toast").hidden=true;$("toastUndo").hidden=true},2600)
}
$("toastUndo").addEventListener("click",async()=>{
  if(!undoState)return;
  DB[undoState.collection].push(undoState.item);
  undoState=null;await saveData();refreshAll();showToast("Restored.")
});

function previousMaxOdo(excludeCollection=null,excludeId=null){
  return getAllOdoPoints()
    .filter(x=>!(x.collection===excludeCollection&&x.id===excludeId))
    .reduce((m,x)=>Math.max(m,x.odo),0);
}
function validateOdo(odo,excludeCollection=null,excludeId=null){
  const max=previousMaxOdo(excludeCollection,excludeId);
  if(max&&odo<max){
    return confirm(`⚠ ODO LOWER THAN EXISTING MAX (${fmtNum(max)} km). Save anyway?`);
  }
  return true;
}
function validateFuel(liters,total,odo,full,editId=null){
  if(!validateOdo(odo,"fuel",editId))return false;
  const cap=Number(DB.settings.tankCapacity)||55;
  if(liters>cap+5&&!confirm(`⚠ ${fmtNum(liters,2)} L exceeds configured tank capacity ${fmtNum(cap)} L. Save anyway?`))return false;
  const price=total/liters;
  if((price<4||price>12)&&!confirm(`⚠ Price looks unusual: ${fmtNum(price,3)} PLN/L. Save anyway?`))return false;
  const fuels=sortedFuel().filter(x=>x.id!==editId);
  if(full){
    const prev=[...fuels].reverse().find(x=>x.full&&x.odo<odo);
    if(prev && odo-prev.odo<50 && !confirm(`⚠ Full-to-full interval only ${fmtNum(odo-prev.odo)} km. Save anyway?`))return false;
  }
  return true;
}

function getAllOdoPoints(){
  const pts=[];
  if(DB.pickup.completed&&DB.pickup.date&&DB.pickup.odo!=null)pts.push({date:DB.pickup.date,odo:Number(DB.pickup.odo),source:"pickup",collection:"pickup",id:"pickup"});
  DB.odoReadings.forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:"odo",collection:"odoReadings",id:x.id}));
  DB.fuel.forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:"fuel",collection:"fuel",id:x.id}));
  DB.services.forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:"service",collection:"services",id:x.id}));
  DB.expenses.filter(x=>x.odo).forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:"expense",collection:"expenses",id:x.id}));
  DB.oilTopups.filter(x=>x.odo).forEach(x=>pts.push({date:x.date,odo:Number(x.odo),source:"oil",collection:"oilTopups",id:x.id}));
  return pts.filter(x=>Number.isFinite(x.date)&&Number.isFinite(x.odo)).sort((a,b)=>a.date-b.date);
}
function effectiveCurrentOdo(){
  const maxPoint=getAllOdoPoints().reduce((m,x)=>Math.max(m,x.odo),0);
  return Math.max(Number(DB.currentOdo)||0,maxPoint||0)||null;
}
function updateCurrentOdo(odo){
  odo=Number(odo);if(Number.isFinite(odo)&&odo>0&&(DB.currentOdo==null||odo>DB.currentOdo))DB.currentOdo=odo
}
function drivingRateKmDay(){
  const pts=getAllOdoPoints();if(pts.length<2)return null;
  const cutoff=Date.now()-30*msDay;
  let recent=pts.filter(x=>x.date>=cutoff);
  if(recent.length<2)recent=pts;
  const first=recent[0],last=recent[recent.length-1];
  const days=(last.date-first.date)/msDay,km=last.odo-first.odo;
  return days>0&&km>0?km/days:null
}

// ==========================================================
// MISSION
// ==========================================================

const FINAL_START=new Date(2026,7,20).getTime();
const TARGET_PICKUP=new Date(2026,8,12).getTime();
const LEGACY_START=new Date(2026,3,4).getTime();
const EARLIEST_READY=new Date(2026,8,5).getTime();
const MILESTONES=[5,10,25,50,75,90,95,99,100];
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
function findPhase(now){return PHASES.find(p=>now>=p.start&&now<p.end)||PHASES.at(-1)}
function dayProgress(now){const d=new Date(now),s=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),e=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();return clamp((now-s)/(e-s),0,1)}
function systemMessage(p){if(p>=100)return"MISSION COMPLETE // READY TO DRIVE 😎";if(p>=99)return"DO NOT TURN OFF YOUR MAZDA";if(p>=95)return"ALMOST HOME";if(p>=90)return"FINAL APPROACH";if(p>=69&&p<70)return"NICE.";if(p>=50&&p<51)return"HALFWAY THERE";if(p>=25&&p<26)return"QUARTER MISSION COMPLETE";if(p>=10&&p<11)return"DOUBLE DIGITS";return"ALL SYSTEMS NOMINAL"}

const ringR=46,ringC=2*Math.PI*ringR,dayRing=$("dayRingFg");
dayRing.style.strokeDasharray=String(ringC);
const oilRing=$("oilRingFg");oilRing.style.strokeDasharray=String(ringC);

function renderPhaseMap(){
 $("phaseMap").innerHTML=PHASES.slice(0,-1).map(p=>`<div class="phaseNode" data-phase="${p.code}"><div class="ico">${p.icon}</div><div class="name">${p.short}</div></div>`).join("")
}
function renderMissionLog(now){
 $("missionLog").innerHTML=MISSION_LOG.map(e=>`<div class="logEntry ${now<e.time?"future":e.kind}"><div class="logDate">${e.date}</div><div class="logDotWrap"><div class="logDot"></div><div class="logLine"></div></div><div class="logText">${e.text}<span class="logTag">${e.kind==="planned"?"PLAN":"ACTUAL"}</span></div></div>`).join("")
}
renderPhaseMap();renderMissionLog(Date.now());

function updateMission(){
 const now=Date.now(),d=new Date(now),total=TARGET_PICKUP-FINAL_START,pr=clamp((now-FINAL_START)/total,0,1),p=pr*100;
 $("percent").textContent=`${pct(p,6)}%`;$("progress").style.width=`${p}%`;
 $("elapsed").textContent=formatDuration(now-FINAL_START);$("remaining").textContent=now>=TARGET_PICKUP?"READY 😎":formatDuration(TARGET_PICKUP-now);
 const totalDays=Math.ceil(total/msDay),md=clamp(Math.floor((now-FINAL_START)/msDay)+1,1,totalDays);
 $("day").textContent=`${md} / ${totalDays}`;$("dayDate").textContent=formatDate(now);$("dayClock").textContent=`${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} / 24:00:00`;
 const dp=dayProgress(now);dayRing.style.strokeDashoffset=String(ringC*(1-dp));$("dayProgressValue").textContent=`${pct(dp*100,4)}%`;
 $("legacyCounter").textContent=formatDuration(now-LEGACY_START);
 const ph=findPhase(now),pp=ph.code==="DONE"?1:clamp((now-ph.start)/(ph.end-ph.start),0,1);
 $("status").textContent=ph.status;$("objective").textContent=`▶ ${ph.objective}`;$("nextPhase").textContent=`→ ${ph.next}`;$("phaseProgress").textContent=`${pct(pp*100,4)}%`;$("phaseBar").style.width=`${pp*100}%`;
 document.querySelectorAll(".phaseNode").forEach(n=>{const q=PHASES.find(x=>x.code===n.dataset.phase);n.classList.remove("done","active","future");if(ph.code==="DONE"||now>=q.end)n.classList.add("done");else if(q.code===ph.code)n.classList.add("active");else n.classList.add("future")});
 let nm=100;for(const m of MILESTONES){if(p<m){nm=m;break}}const mt=FINAL_START+total*(nm/100);$("milestone").textContent=`${nm}% // T− ${formatDuration(mt-now)}`;
 const predicted=now<EARLIEST_READY?EARLIEST_READY:now,buffer=TARGET_PICKUP-predicted,b=$("bufferValue");b.classList.remove("warning","danger");
 if(now>=TARGET_PICKUP){b.textContent=`OVERDUE ${formatDuration(now-TARGET_PICKUP,false)}`;b.classList.add("danger");$("bufferSub").textContent="TARGET WINDOW EXCEEDED"}
 else{b.textContent=`+${formatDuration(buffer,false)}`;if(buffer<48*3600000)b.classList.add("danger");else if(buffer<96*3600000)b.classList.add("warning");$("bufferSub").textContent=now<EARLIEST_READY?"RESERVE BETWEEN EARLIEST READY AND TARGET":"LIVE RESERVE LEFT UNTIL TARGET PICKUP"}
 $("system").textContent=`> ${systemMessage(p)}`;
}

// ==========================================================
// FUEL + COSTS
// ==========================================================

function sortedFuel(){return [...DB.fuel].sort((a,b)=>a.date-b.date||a.odo-b.odo)}
function fuelIntervals(){
 const f=sortedFuel(),fullIdx=f.map((x,i)=>x.full?i:-1).filter(i=>i>=0),out=[];
 for(let k=1;k<fullIdx.length;k++){const a=fullIdx[k-1],b=fullIdx[k],prev=f[a],cur=f[b],dist=cur.odo-prev.odo;if(dist<=0)continue;let liters=0,cost=0;for(let i=a+1;i<=b;i++){liters+=Number(f[i].liters)||0;cost+=Number(f[i].total)||0}if(liters>0)out.push({start:prev,end:cur,distance:dist,liters,cost,consumption:liters/dist*100,cost100:cost/dist*100})}
 return out
}
function avgLast(arr,n){const x=arr.slice(-n);if(!x.length)return null;return x.reduce((s,v)=>s+v.consumption,0)/x.length}
function fuelStats(){
 const fuels=sortedFuel(),ints=fuelIntervals(),liters=fuels.reduce((s,x)=>s+Number(x.liters||0),0),spend=fuels.reduce((s,x)=>s+Number(x.total||0),0);
 const dist=ints.reduce((s,x)=>s+x.distance,0),iLit=ints.reduce((s,x)=>s+x.liters,0),iCost=ints.reduce((s,x)=>s+x.cost,0),vals=ints.map(x=>x.consumption),prices=fuels.filter(x=>x.liters>0).map(x=>x.total/x.liters);
 return {fuels,ints,totalSpend:spend,avgPrice:liters?spend/liters:null,last:vals.at(-1)??null,avg:dist?iLit/dist*100:null,last3:avgLast(ints,3),last5:avgLast(ints,5),best:vals.length?Math.min(...vals):null,worst:vals.length?Math.max(...vals):null,cost100:dist?iCost/dist*100:null,costKm:dist?iCost/dist:null,priceMin:prices.length?Math.min(...prices):null,priceMax:prices.length?Math.max(...prices):null}
}
function seasonAvg(months){
 const ints=fuelIntervals().filter(x=>months.includes(new Date(x.end.date).getMonth()+1));if(!ints.length)return null;
 const d=ints.reduce((s,x)=>s+x.distance,0),l=ints.reduce((s,x)=>s+x.liters,0);return d?l/d*100:null
}
function monthStats(){
 const now=new Date(),y=now.getFullYear(),m=now.getMonth(),start=new Date(y,m,1).getTime(),end=new Date(y,m+1,1).getTime();
 const pts=getAllOdoPoints().filter(x=>x.date>=start&&x.date<end),km=pts.length>=2?Math.max(0,pts.at(-1).odo-pts[0].odo):0;
 const fuel=DB.fuel.filter(x=>x.date>=start&&x.date<end).reduce((s,x)=>s+Number(x.total||0),0);
 const service=DB.services.filter(x=>x.date>=start&&x.date<end).reduce((s,x)=>s+Number(x.cost||0),0);
 const other=DB.expenses.filter(x=>x.date>=start&&x.date<end).reduce((s,x)=>s+Number(x.cost||0),0);
 return {km,fuel,other:service+other,total:fuel+service+other}
}
function drawFuelChart(ints){
 const c=$("fuelChart"),ctx=c.getContext("2d"),ratio=devicePixelRatio||1,w=c.clientWidth||320,h=160;c.width=w*ratio;c.height=h*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
 if(!ints.length){ctx.fillStyle="#858b94";ctx.font="11px monospace";ctx.fillText("FULL-TO-FULL DATA WILL APPEAR HERE",10,75);return}
 const vals=ints.slice(-12).map(x=>x.consumption);let mn=Math.min(...vals),mx=Math.max(...vals);if(mx-mn<1){mn-=.5;mx+=.5}const L=8,R=8,T=16,B=24,W=w-L-R,H=h-T-B;
 ctx.strokeStyle="#30363e";ctx.lineWidth=1;for(let i=0;i<4;i++){const y=T+H*i/3;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(L+W,y);ctx.stroke()}
 ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--green").trim();ctx.lineWidth=2.5;ctx.beginPath();
 vals.forEach((v,i)=>{const x=vals.length===1?L+W/2:L+W*i/(vals.length-1),y=T+H*(1-(v-mn)/(mx-mn));i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
 ctx.fillStyle="#39d353";vals.forEach((v,i)=>{const x=vals.length===1?L+W/2:L+W*i/(vals.length-1),y=T+H*(1-(v-mn)/(mx-mn));ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill()});
 ctx.fillStyle="#858b94";ctx.font="9px monospace";ctx.fillText(`${fmtNum(mx,1)} L/100`,L,10);ctx.fillText(`${fmtNum(mn,1)} L/100`,L,h-5)
}

// ==========================================================
// OIL + MAINTENANCE
// ==========================================================

function oilForecast(){
 const bd=Number(DB.oilBaseline.date),bo=Number(DB.oilBaseline.odo),cur=effectiveCurrentOdo();if(!bd||!Number.isFinite(bo)||cur==null)return null;
 const target=Number(DB.settings.oilTargetKm)||5000,soft=Number(DB.settings.oilSoftMaxKm)||6000,months=Number(DB.settings.oilMaxMonths)||8,kmSince=Math.max(0,cur-bo),left=target-kmSince,rate=drivingRateKmDay(),timeDue=addMonths(bd,months),distanceDue=rate&&rate>0?Date.now()+Math.max(0,left)/rate*msDay:null;
 const forecast=distanceDue!=null&&distanceDue<timeDue?distanceDue:timeDue;
 return {bd,bo,cur,target,soft,months,kmSince,left,softLeft:soft-kmSince,rate,timeDue,distanceDue,forecast,factor:distanceDue!=null&&distanceDue<timeDue?"DISTANCE":"TIME",progress:kmSince/target}
}
function maintenanceDue(item){
 const cur=effectiveCurrentOdo(),rate=drivingRateKmDay(),lastO=Number(item.lastOdo),lastD=Number(item.lastDate),kmInt=Number(item.intervalKm)||0,moInt=Number(item.intervalMonths)||0;
 let kmLeft=null,timeDue=null,distanceDue=null;
 if(kmInt>0&&cur!=null&&Number.isFinite(lastO)){kmLeft=kmInt-(cur-lastO);if(rate&&rate>0)distanceDue=Date.now()+Math.max(0,kmLeft)/rate*msDay}
 if(moInt>0&&lastD)timeDue=addMonths(lastD,moInt);
 let due=null,factor="UNKNOWN";
 if(distanceDue!=null&&timeDue!=null){due=Math.min(distanceDue,timeDue);factor=distanceDue<timeDue?"DISTANCE":"TIME"}
 else if(distanceDue!=null){due=distanceDue;factor="DISTANCE"}
 else if(timeDue!=null){due=timeDue;factor="TIME"}
 return {kmLeft,timeDue,distanceDue,due,factor}
}
function upcomingItems(){
 const arr=[];
 const oil=oilForecast();if(oil)arr.push({name:"ENGINE OIL",due:oil.forecast,kmLeft:oil.left,factor:oil.factor,source:"oil"});
 DB.maintenance.filter(x=>x.active!==false).forEach(x=>{const d=maintenanceDue(x);arr.push({name:x.name,due:d.due,kmLeft:d.kmLeft,factor:d.factor,source:"maintenance",item:x})});
 return arr.sort((a,b)=>(a.due??Infinity)-(b.due??Infinity)||((a.kmLeft??Infinity)-(b.kmLeft??Infinity)))
}
function oilTopupStats(){
 const f=oilForecast();if(!f)return {items:[],total:0,rate:null};
 const items=DB.oilTopups.filter(x=>x.date>=f.bd&&x.odo>=f.bo).sort((a,b)=>a.date-b.date),total=items.reduce((s,x)=>s+Number(x.liters||0),0),distance=Math.max(0,f.cur-f.bo);
 return {items,total,rate:distance>0?total/distance*1000:null}
}

// ==========================================================
// TYRES
// ==========================================================

function tyreMileage(t){
 const cur=effectiveCurrentOdo()||0;
 return Number(t.accumulatedKm||0)+(t.active&&t.activeFromOdo!=null?Math.max(0,cur-Number(t.activeFromOdo)):0)
}
async function switchTyre(id){
 const cur=effectiveCurrentOdo();if(cur==null){showToast("Set current odometer first.");return}
 DB.tyres.forEach(t=>{
   if(t.active){t.accumulatedKm=tyreMileage(t);t.active=false;t.activeFromOdo=null}
 });
 const selected=DB.tyres.find(x=>x.id===id);if(selected){selected.active=true;selected.activeFromOdo=cur;selected.lastSwitchDate=Date.now()}
 await saveData();renderGarage();showToast("Active tyre set changed.")
}

// ==========================================================
// GENERIC MODAL
// ==========================================================

let modalContext=null;
function fieldHtml(f,val){
 const v=val??"";
 if(f.type==="select")return `<label class="field"><span>${f.label}</span><select id="mf_${f.key}">${f.options.map(o=>`<option value="${o.value}" ${String(v)===String(o.value)?"selected":""}>${o.label}</option>`).join("")}</select></label>`;
 if(f.type==="textarea")return `<label class="field"><span>${f.label}</span><textarea id="mf_${f.key}" placeholder="${escapeHtml(f.placeholder||"")}">${escapeHtml(v)}</textarea></label>`;
 if(f.type==="checkbox")return `<label class="checkField"><input type="checkbox" id="mf_${f.key}" ${v?"checked":""}><span>${f.label}</span></label>`;
 return `<label class="field"><span>${f.label}</span><input type="${f.type||"text"}" id="mf_${f.key}" value="${escapeHtml(v)}" ${f.step?`step="${f.step}"`:""} ${f.inputmode?`inputmode="${f.inputmode}"`:""} placeholder="${escapeHtml(f.placeholder||"")}"></label>`
}
function openForm(title,sub,fields,values,onSave,context=null){
 modalContext={fields,onSave,context};$("formModalTitle").textContent=title;$("formModalSub").textContent=sub||"";$("formModalBody").innerHTML=fields.map(f=>fieldHtml(f,values?.[f.key])).join("");$("formModal").hidden=false
}
function closeForm(){$("formModal").hidden=true;modalContext=null}
$("formModalCancel").addEventListener("click",closeForm);
$("formModalSave").addEventListener("click",async()=>{
 if(!modalContext)return;const out={};
 for(const f of modalContext.fields){const el=$(`mf_${f.key}`);if(f.type==="checkbox")out[f.key]=el.checked;else if(f.type==="number")out[f.key]=el.value===""?null:Number(el.value);else if(f.type==="datetime-local")out[f.key]=parseLocalDateTime(el.value);else out[f.key]=el.value}
 const ok=await modalContext.onSave(out,modalContext.context);if(ok!==false){closeForm();await saveData();refreshAll()}
});

// ==========================================================
// FORM OPENERS
// ==========================================================

const FUEL_FIELDS=[
 {key:"date",label:"DATE",type:"datetime-local"},
 {key:"odo",label:"ODOMETER [KM]",type:"number",inputmode:"decimal"},
 {key:"liters",label:"LITERS",type:"number",step:"0.01",inputmode:"decimal"},
 {key:"total",label:"TOTAL [PLN]",type:"number",step:"0.01",inputmode:"decimal"},
 {key:"full",label:"FULL TANK",type:"checkbox"},
 {key:"note",label:"STATION / NOTE",type:"text"}
];
const SERVICE_FIELDS=[
 {key:"date",label:"DATE",type:"datetime-local"},{key:"odo",label:"ODOMETER [KM]",type:"number"},{key:"name",label:"SERVICE",type:"text"},
 {key:"cost",label:"COST [PLN]",type:"number",step:"0.01"},{key:"setsOil",label:"SET NEW OIL BASELINE",type:"checkbox"},{key:"note",label:"NOTE",type:"textarea"}
];
const MAINT_FIELDS=[
 {key:"name",label:"ITEM NAME",type:"text"},{key:"category",label:"CATEGORY",type:"select",options:[{value:"engine",label:"ENGINE"},{value:"fluids",label:"FLUIDS"},{value:"brakes",label:"BRAKES"},{value:"filters",label:"FILTERS"},{value:"inspection",label:"INSPECTION"},{value:"other",label:"OTHER"}]},
 {key:"intervalKm",label:"INTERVAL [KM] — 0 = OFF",type:"number"},{key:"intervalMonths",label:"INTERVAL [MONTHS] — 0 = OFF",type:"number"},
 {key:"lastDate",label:"LAST DONE DATE",type:"datetime-local"},{key:"lastOdo",label:"LAST DONE ODO [KM]",type:"number"},{key:"estimatedCost",label:"EST. COST [PLN]",type:"number"},{key:"note",label:"NOTE",type:"textarea"}
];
const ISSUE_FIELDS=[
 {key:"date",label:"FIRST NOTICED",type:"datetime-local"},{key:"odo",label:"ODOMETER [KM]",type:"number"},{key:"title",label:"ISSUE / SYMPTOM",type:"text"},
 {key:"severity",label:"SEVERITY",type:"select",options:[{value:"info",label:"INFO"},{value:"watch",label:"WATCH"},{value:"urgent",label:"URGENT"}]},
 {key:"status",label:"STATUS",type:"select",options:[{value:"open",label:"OPEN"},{value:"observing",label:"OBSERVING"},{value:"resolved",label:"RESOLVED"}]},
 {key:"note",label:"DETAILS / CONDITIONS",type:"textarea"}
];
const TYRE_FIELDS=[
 {key:"name",label:"SET NAME",type:"text"},{key:"season",label:"SEASON",type:"select",options:[{value:"summer",label:"SUMMER"},{value:"winter",label:"WINTER"},{value:"allseason",label:"ALL SEASON"}]},
 {key:"dot",label:"DOT",type:"text"},{key:"tread",label:"TREAD [MM]",type:"number",step:"0.1"},{key:"note",label:"NOTE",type:"textarea"}
];
const PART_FIELDS=[
 {key:"category",label:"CATEGORY",type:"select",options:[{value:"engine",label:"ENGINE"},{value:"turbo",label:"TURBO"},{value:"fuel",label:"FUEL"},{value:"intake",label:"INTAKE"},{value:"exhaust",label:"EXHAUST"},{value:"chassis",label:"CHASSIS"},{value:"spec",label:"SPEC / CONSUMABLE"},{value:"other",label:"OTHER"}]},
 {key:"name",label:"NAME",type:"text"},{key:"value",label:"PART / SPEC / VALUE",type:"text"},{key:"partNumber",label:"PART NUMBER",type:"text"},
 {key:"installedDate",label:"INSTALLED DATE",type:"datetime-local"},{key:"installedOdo",label:"INSTALLED ODO [KM]",type:"number"},{key:"cost",label:"COST [PLN]",type:"number",step:"0.01"},{key:"note",label:"NOTE",type:"textarea"}
];
const BUILD_FIELDS=[
 {key:"name",label:"ITEM NAME",type:"text"},
 {key:"category",label:"CATEGORY",type:"select",options:[
   {value:"TIMING",label:"TIMING"},{value:"ENGINE",label:"ENGINE"},
   {value:"MACHINING",label:"MACHINING / REGENERATION"},{value:"SEALS",label:"SEALS / GASKETS"},
   {value:"FLUIDS",label:"FLUIDS"},{value:"MATERIALS",label:"MATERIALS"},
   {value:"FUEL",label:"FUEL"},{value:"COOLING",label:"COOLING"},
   {value:"TURBO",label:"TURBO"},{value:"INTAKE",label:"INTAKE"},
   {value:"EXHAUST",label:"EXHAUST"},{value:"TUNING",label:"TUNING"},
   {value:"MONITORING",label:"MONITORING"},{value:"LABOR",label:"LABOR"},
   {value:"OTHER",label:"OTHER"}
 ]},
 {key:"kind",label:"TYPE",type:"select",options:[{value:"PARTS",label:"PARTS / MACHINING"},{value:"LABOR",label:"LABOR"}]},
 {key:"brand",label:"BRAND / SPEC",type:"text"},
 {key:"netPrice",label:"NET PRICE [PLN]",type:"number",step:"0.01"},
 {key:"status",label:"STATUS",type:"select",options:[
   {value:"ESTIMATE",label:"ESTIMATE"},{value:"CONFIRMED",label:"CONFIRMED"},
   {value:"INSTALLED",label:"INSTALLED"},{value:"REMOVED",label:"REMOVED"}
 ]},
 {key:"note",label:"NOTE",type:"textarea"}
];

const DOC_FIELDS=[
 {key:"type",label:"TYPE",type:"select",options:[{value:"OC",label:"OC"},{value:"AC",label:"AC"},{value:"INSPECTION",label:"TECH INSPECTION"},{value:"ASSISTANCE",label:"ASSISTANCE"},{value:"OTHER",label:"OTHER"}]},
 {key:"name",label:"NAME / PROVIDER",type:"text"},{key:"expiry",label:"EXPIRY DATE",type:"datetime-local"},{key:"cost",label:"COST [PLN]",type:"number",step:"0.01"},{key:"note",label:"NOTE",type:"textarea"}
];
const EXPENSE_FIELDS=[
 {key:"date",label:"DATE",type:"datetime-local"},{key:"odo",label:"ODOMETER [KM] (OPTIONAL)",type:"number"},{key:"category",label:"CATEGORY",type:"select",options:[{value:"insurance",label:"INSURANCE"},{value:"tyres",label:"TYRES"},{value:"detailing",label:"DETAILING"},{value:"parts",label:"PARTS"},{value:"inspection",label:"INSPECTION"},{value:"other",label:"OTHER"}]},
 {key:"cost",label:"COST [PLN]",type:"number",step:"0.01"},{key:"note",label:"NOTE",type:"textarea"}
];
const OIL_TOPUP_FIELDS=[
 {key:"date",label:"DATE",type:"datetime-local"},{key:"odo",label:"ODOMETER [KM]",type:"number"},{key:"liters",label:"TOP-UP [L] — 0 FOR CHECK ONLY",type:"number",step:"0.05"},
 {key:"level",label:"LEVEL / RESULT",type:"select",options:[{value:"OK",label:"OK / FULL"},{value:"3/4",label:"3/4"},{value:"1/2",label:"1/2"},{value:"LOW",label:"LOW"},{value:"TOPUP",label:"TOPPED UP"}]},{key:"note",label:"NOTE",type:"text"}
];

document.querySelectorAll("[data-open-modal]").forEach(btn=>btn.addEventListener("click",()=>{
 const id=btn.dataset.openModal,now=localDateTimeValue(),odo=effectiveCurrentOdo()||"";
 if(id==="fuelModal")openForm("ADD FUEL","Full-to-full supports partial fills between FULL entries.",FUEL_FIELDS,{date:now,odo,full:true},saveFuel);
 if(id==="odoModal")openForm("ODOMETER READING","Updates current mileage and forecasts.",[{key:"date",label:"DATE",type:"datetime-local"},{key:"odo",label:"ODOMETER [KM]",type:"number"}],{date:now,odo},saveOdo);
 if(id==="expenseModal")openForm("OTHER EXPENSE","Insurance, tyres, detailing, inspection, parts...",EXPENSE_FIELDS,{date:now,odo},saveExpense);
 if(id==="serviceModal")openForm("ADD SERVICE","A service event can reset an oil baseline.",SERVICE_FIELDS,{date:now,odo,setsOil:false},saveService);
 if(id==="maintenanceModal")openForm("MAINTENANCE ITEM","Set km and/or time interval. Leave unused interval at 0.",MAINT_FIELDS,{lastDate:now,lastOdo:odo,intervalKm:0,intervalMonths:0},saveMaintenance);
 if(id==="oilBaselineModal")openForm("OIL BASELINE","Reference point for oil-life calculations.",[{key:"date",label:"DATE",type:"datetime-local"},{key:"odo",label:"ODOMETER [KM]",type:"number"}],{date:DB.oilBaseline.date?localDateTimeValue(DB.oilBaseline.date):now,odo:DB.oilBaseline.odo??odo},saveOilBaseline);
 if(id==="oilTopupModal")openForm("OIL TOP-UP / CHECK","Track top-ups and calculate L/1000 km since oil baseline.",OIL_TOPUP_FIELDS,{date:now,odo,liters:0,level:"OK"},saveOilTopup);
 if(id==="issueModal")openForm("ISSUE / SYMPTOM","Keep a diagnostic timeline.",ISSUE_FIELDS,{date:now,odo,severity:"watch",status:"open"},saveIssue);
 if(id==="tyreModal")openForm("TYRE SET","Mileage is tracked while a set is active.",TYRE_FIELDS,{season:"summer"},saveTyre);
 if(id==="partModal")openForm("PART / SPEC / MOD","Build a searchable database for this exact car.",PART_FIELDS,{category:"spec",installedDate:now,installedOdo:odo,cost:0},savePart);
 if(id==="buildItemModal")openForm("BUILD SHEET ITEM","2026 rebuild record // net values.",BUILD_FIELDS,{category:"ENGINE",kind:"PARTS",status:"ESTIMATE",netPrice:0},saveBuildItem);
 if(id==="documentModal")openForm("DOCUMENT","Track OC/AC/inspection/assistance expiration.",DOC_FIELDS,{type:"OC"},saveDocument);
}));

async function saveFuel(v,ctx){
 if(!v.date||!v.odo||!v.liters||v.total==null){showToast("Missing fuel data.");return false}
 if(!validateFuel(v.liters,v.total,v.odo,v.full,ctx?.id))return false;
 const obj={id:ctx?.id||uid(),date:v.date,odo:Number(v.odo),liters:Number(v.liters),total:Number(v.total),full:!!v.full,note:v.note||""};
 upsert("fuel",obj);updateCurrentOdo(obj.odo);showToast(ctx?"Fuel updated.":"Fuel saved ⛽");return true
}
async function saveOdo(v,ctx){
 if(!v.date||!v.odo){showToast("Missing odometer data.");return false}if(!validateOdo(v.odo,"odoReadings",ctx?.id))return false;
 const obj={id:ctx?.id||uid(),date:v.date,odo:Number(v.odo),source:"manual"};upsert("odoReadings",obj);updateCurrentOdo(obj.odo);showToast("Odometer saved.");return true
}
async function saveExpense(v,ctx){
 if(!v.date||v.cost==null||v.cost<0){showToast("Missing expense data.");return false}
 if(v.odo&& !validateOdo(v.odo,"expenses",ctx?.id))return false;
 const obj={id:ctx?.id||uid(),date:v.date,odo:v.odo?Number(v.odo):null,category:v.category,cost:Number(v.cost),note:v.note||""};upsert("expenses",obj);if(obj.odo)updateCurrentOdo(obj.odo);showToast("Expense saved.");return true
}
async function saveService(v,ctx){
 if(!v.date||!v.odo||!v.name){showToast("Missing service data.");return false}if(!validateOdo(v.odo,"services",ctx?.id))return false;
 const obj={id:ctx?.id||uid(),date:v.date,odo:Number(v.odo),name:v.name,cost:Number(v.cost||0),setsOil:!!v.setsOil,note:v.note||""};upsert("services",obj);updateCurrentOdo(obj.odo);if(obj.setsOil)DB.oilBaseline={date:obj.date,odo:obj.odo};showToast("Service saved 🔧");return true
}
async function saveMaintenance(v,ctx){
 if(!v.name){showToast("Name required.");return false}
 const obj={id:ctx?.id||uid(),name:v.name,category:v.category,intervalKm:Number(v.intervalKm||0),intervalMonths:Number(v.intervalMonths||0),lastDate:v.lastDate||null,lastOdo:v.lastOdo!=null?Number(v.lastOdo):null,estimatedCost:Number(v.estimatedCost||0),note:v.note||"",active:true};upsert("maintenance",obj);showToast("Maintenance item saved.");return true
}
async function saveOilBaseline(v){if(!v.date||!v.odo){showToast("Missing baseline.");return false}DB.oilBaseline={date:v.date,odo:Number(v.odo)};showToast("Oil baseline saved.");return true}
async function saveOilTopup(v,ctx){
 if(!v.date||!v.odo||v.liters==null){showToast("Missing oil check data.");return false}if(!validateOdo(v.odo,"oilTopups",ctx?.id))return false;
 if(v.liters>2&&!confirm(`⚠ Oil top-up ${fmtNum(v.liters,2)} L looks high. Save anyway?`))return false;
 const obj={id:ctx?.id||uid(),date:v.date,odo:Number(v.odo),liters:Number(v.liters||0),level:v.level,note:v.note||""};upsert("oilTopups",obj);updateCurrentOdo(obj.odo);showToast("Oil entry saved.");return true
}
async function saveIssue(v,ctx){
 if(!v.date||!v.title){showToast("Issue title required.");return false}
 const obj={id:ctx?.id||uid(),date:v.date,odo:v.odo?Number(v.odo):null,title:v.title,severity:v.severity,status:v.status,note:v.note||"",resolvedDate:v.status==="resolved"?Date.now():ctx?.resolvedDate||null};upsert("issues",obj);showToast("Issue saved.");return true
}
async function saveTyre(v,ctx){
 if(!v.name){showToast("Tyre set name required.");return false}
 const old=ctx?DB.tyres.find(x=>x.id===ctx.id):null;
 const obj={id:ctx?.id||uid(),name:v.name,season:v.season,dot:v.dot||"",tread:v.tread!=null?Number(v.tread):null,note:v.note||"",active:old?.active||false,activeFromOdo:old?.activeFromOdo??null,accumulatedKm:old?.accumulatedKm||0,lastSwitchDate:old?.lastSwitchDate||null};upsert("tyres",obj);showToast("Tyre set saved.");return true
}
async function savePart(v,ctx){
 if(!v.name){showToast("Name required.");return false}
 const obj={id:ctx?.id||uid(),category:v.category,name:v.name,value:v.value||"",partNumber:v.partNumber||"",installedDate:v.installedDate||null,installedOdo:v.installedOdo?Number(v.installedOdo):null,cost:Number(v.cost||0),note:v.note||""};upsert("parts",obj);showToast("Part/spec saved.");return true
}
async function saveBuildItem(v,ctx){
 if(!v.name){showToast("Name required.");return false}
 if(v.netPrice==null||Number(v.netPrice)<0){showToast("Net price must be >= 0.");return false}
 const obj={
   id:ctx?.id||uid(),name:v.name,category:v.category||"OTHER",
   kind:v.kind||"PARTS",brand:v.brand||"",netPrice:Number(v.netPrice||0),
   status:v.status||"ESTIMATE",source:ctx?.source||"WORKSHOP LIST 2026",note:v.note||""
 };
 upsert("buildSheet",obj);
 DB.buildMeta.seeded=true;
 showToast("Build sheet item saved.");
 return true
}
async function saveDocument(v,ctx){
 if(!v.type||!v.expiry){showToast("Type and expiry required.");return false}
 const obj={id:ctx?.id||uid(),type:v.type,name:v.name||"",expiry:v.expiry,cost:Number(v.cost||0),note:v.note||""};upsert("documents",obj);showToast("Document saved.");return true
}
function upsert(collection,obj){const i=DB[collection].findIndex(x=>x.id===obj.id);if(i>=0)DB[collection][i]=obj;else DB[collection].push(obj)}

function deleteItem(collection,id){
 const idx=DB[collection].findIndex(x=>x.id===id);if(idx<0)return;
 const [item]=DB[collection].splice(idx,1);undoState={collection,item};saveData();refreshAll();showToast("Deleted.",true)
}
function editItem(collection,id){
 const x=DB[collection].find(y=>y.id===id);if(!x)return;
 if(collection==="fuel")openForm("EDIT FUEL","",FUEL_FIELDS,{...x,date:localDateTimeValue(x.date)},saveFuel,x);
 if(collection==="services")openForm("EDIT SERVICE","",SERVICE_FIELDS,{...x,date:localDateTimeValue(x.date)},saveService,x);
 if(collection==="maintenance")openForm("EDIT MAINTENANCE","",MAINT_FIELDS,{...x,lastDate:x.lastDate?localDateTimeValue(x.lastDate):""},saveMaintenance,x);
 if(collection==="oilTopups")openForm("EDIT OIL ENTRY","",OIL_TOPUP_FIELDS,{...x,date:localDateTimeValue(x.date)},saveOilTopup,x);
 if(collection==="issues")openForm("EDIT ISSUE","",ISSUE_FIELDS,{...x,date:localDateTimeValue(x.date)},saveIssue,x);
 if(collection==="tyres")openForm("EDIT TYRE SET","",TYRE_FIELDS,x,saveTyre,x);
 if(collection==="parts")openForm("EDIT PART / SPEC","",PART_FIELDS,{...x,installedDate:x.installedDate?localDateTimeValue(x.installedDate):""},savePart,x);
 if(collection==="buildSheet")openForm("EDIT BUILD SHEET ITEM","2026 rebuild record // net values.",BUILD_FIELDS,x,saveBuildItem,x);
 if(collection==="documents")openForm("EDIT DOCUMENT","",DOC_FIELDS,{...x,expiry:x.expiry?localDateTimeValue(x.expiry):""},saveDocument,x);
 if(collection==="expenses")openForm("EDIT EXPENSE","",EXPENSE_FIELDS,{...x,date:localDateTimeValue(x.date)},saveExpense,x);
}
window.editItem=editItem;window.deleteItem=deleteItem;window.switchTyre=switchTyre;

// ==========================================================
// RENDER DRIVE
// ==========================================================

function renderDrive(){
 const odo=effectiveCurrentOdo(),since=DB.pickup.completed&&odo!=null&&DB.pickup.odo!=null?Math.max(0,odo-DB.pickup.odo):null,fs=fuelStats(),ints=fs.ints;
 $("driveCurrentOdo").textContent=odo!=null?fmtNum(odo):"—";$("kmSincePickup").textContent=since!=null?fmtNum(since):"—";
 $("fuelIntervalsBadge").textContent=`${ints.length} VALID`;$("fuelLast").textContent=fs.last!=null?fmtNum(fs.last,2):"—";$("fuelAvg").textContent=fs.avg!=null?fmtNum(fs.avg,2):"—";$("fuelLast3").textContent=fs.last3!=null?fmtNum(fs.last3,2):"—";$("fuelLast5").textContent=fs.last5!=null?fmtNum(fs.last5,2):"—";$("fuelBest").textContent=fs.best!=null?fmtNum(fs.best,2):"—";$("fuelWorst").textContent=fs.worst!=null?fmtNum(fs.worst,2):"—";
 $("avgFuelPrice").textContent=fs.avgPrice!=null?fmtNum(fs.avgPrice,3):"—";$("fuelPriceRange").textContent=fs.priceMin!=null?`${fmtNum(fs.priceMin,2)} / ${fmtNum(fs.priceMax,2)}`:"—";$("fuelCost100").textContent=fs.cost100!=null?fmtMoney(fs.cost100):"—";$("fuelCostKm").textContent=fs.costKm!=null?fmtNum(fs.costKm,3):"—";
 $("summerAvg").textContent=seasonAvg([6,7,8])!=null?fmtNum(seasonAvg([6,7,8]),2):"—";$("winterAvg").textContent=seasonAvg([12,1,2])!=null?fmtNum(seasonAvg([12,1,2]),2):"—";
 const ms=monthStats();$("monthKm").textContent=fmtNum(ms.km);$("monthFuelSpend").textContent=fmtMoney(ms.fuel);$("monthOtherSpend").textContent=fmtMoney(ms.other);$("monthTotalSpend").textContent=fmtMoney(ms.total);
 $("includeRebuildCost").checked=!!DB.settings.includeRebuildCost;
 const serviceSpend=DB.services.reduce((s,x)=>s+Number(x.cost||0),0)+DB.expenses.reduce((s,x)=>s+Number(x.cost||0),0),dist=since||0,rebuild=Number(DB.settings.rebuildCost)||0;
 const rebuildKm=dist?rebuild/dist:null,otherKm=dist?serviceSpend/dist:null,total=(DB.settings.includeRebuildCost?(rebuildKm||0):0)+(otherKm||0)+(fs.costKm||0);
 $("rebuildCostKm").textContent=rebuildKm!=null?`${fmtNum(rebuildKm,2)} PLN`:"—";$("costFuelKm2").textContent=fs.costKm!=null?`${fmtNum(fs.costKm,3)} PLN`:"—";$("serviceCostKm").textContent=otherKm!=null?`${fmtNum(otherKm,3)} PLN`:"—";$("totalCostKm").textContent=dist?`${fmtNum(total,2)} PLN`:"—";
 renderRecentFuel(fs.fuels);requestAnimationFrame(()=>drawFuelChart(ints));renderSnapshot()
}
$("includeRebuildCost").addEventListener("change",async e=>{DB.settings.includeRebuildCost=e.target.checked;await saveData();renderDrive()});

function renderRecentFuel(fuels){
 const a=[...fuels].sort((a,b)=>b.date-a.date).slice(0,10),el=$("recentFuel");if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>`<div class="dataRow"><div><div class="dataMain">⛽ ${x.full?"FULL":"PARTIAL"} // ${fmtNum(x.liters,2)} L</div><div class="dataSub">${formatDateTime(x.date)} // ${fmtNum(x.odo)} KM${x.note?` // ${escapeHtml(x.note)}`:""}</div></div><div class="dataSide">${fmtMoney(x.total)} PLN<div class="dataSub">${fmtNum(x.total/x.liters,3)} PLN/L</div><div class="rowActions"><button class="miniBtn" onclick="editItem('fuel','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('fuel','${x.id}')">DEL</button></div></div></div>`).join("")
}

// ==========================================================
// RENDER SERVICE
// ==========================================================

function renderService(){
 const f=oilForecast();$("oilTargetKm").textContent=`${fmtNum(DB.settings.oilTargetKm)} KM`;$("oilTimeMax").textContent=`${fmtNum(DB.settings.oilMaxMonths)} MONTHS`;
 if(!f){$("oilLifePct").textContent="—";$("oilRingKm").textContent="—";$("oilBar").style.width="0%";oilRing.style.strokeDashoffset=String(ringC);$("oilKmSince").textContent="—";$("oilTimeSince").textContent="—";$("oilForecastDate").textContent="—";$("oilForecastReason").textContent="ADD PICKUP / OIL BASELINE"}
 else{const u=Math.max(0,f.progress*100),col=u>=100?"#ff453a":u>=80?"#ff9f35":"#39d353";$("oilLifePct").textContent=`${fmtNum(u,1)}%`;$("oilLifePct").style.color=col;$("oilRingKm").textContent=fmtNum(Math.max(0,f.left));$("oilBar").style.width=`${Math.min(100,u)}%`;$("oilBar").style.background=col;oilRing.style.stroke=col;oilRing.style.strokeDashoffset=String(ringC*(1-clamp(f.progress,0,1)));$("oilKmSince").textContent=`${fmtNum(f.kmSince)} KM`;$("oilTimeSince").textContent=formatDuration(Date.now()-f.bd,false);$("oilForecastDate").textContent=formatDate(f.forecast);$("oilForecastReason").textContent=f.factor==="DISTANCE"?`DISTANCE LIMIT FIRST // ${f.rate?fmtNum(f.rate,1):"—"} KM/DAY`:"TIME LIMIT FIRST"}
 const top=oilTopupStats();$("oilTopupBadge").textContent=`${top.items.length} ENTRIES`;$("oilTopupTotal").textContent=top.total?fmtNum(top.total,2):"0,00";$("oilTopupRate").textContent=top.rate!=null?fmtNum(top.rate,3):"—";
 $("oilTopupList").innerHTML=top.items.slice().reverse().slice(0,6).map(x=>`<div class="dataRow"><div><div class="dataMain">🛢 ${fmtNum(x.liters,2)} L // ${x.level}</div><div class="dataSub">${formatDateTime(x.date)} // ${fmtNum(x.odo)} KM${x.note?` // ${escapeHtml(x.note)}`:""}</div></div><div class="rowActions"><button class="miniBtn" onclick="editItem('oilTopups','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('oilTopups','${x.id}')">DEL</button></div></div>`).join("");
 renderUpcoming();renderMaintenance();renderServiceHistory()
}
function renderUpcoming(){
 const a=upcomingItems().slice(0,8),el=$("upcomingList");$("upcomingBadge").textContent=`${a.length} ITEMS`;if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>{const days=x.due!=null?Math.ceil((x.due-Date.now())/msDay):null,cls=days!=null&&days<0?"red":days!=null&&days<14?"orange":"green";return `<div class="dataRow"><div><div class="dataMain">${x.source==="oil"?"🛢":"🔧"} ${escapeHtml(x.name)}</div><div class="dataSub">${x.kmLeft!=null?`${fmtNum(Math.max(0,x.kmLeft))} KM LEFT // `:""}${x.due?`EST. ${formatDate(x.due)} // ${x.factor}`:"NO DATE FORECAST"}</div></div><div class="dataSide ${cls}">${days!=null?(days<0?`${Math.abs(days)}d OVER`:`${days}d`):"—"}</div></div>`}).join("")
}
function renderMaintenance(){
 const el=$("maintenanceList"),a=[...DB.maintenance];if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>{const d=maintenanceDue(x);return `<div class="dataRow"><div><div class="dataMain">🔧 ${escapeHtml(x.name)} <span class="statusPill">${escapeHtml(x.category)}</span></div><div class="dataSub">${x.intervalKm?`${fmtNum(x.intervalKm)} KM`:""}${x.intervalKm&&x.intervalMonths?" / ":""}${x.intervalMonths?`${fmtNum(x.intervalMonths)} MONTHS`:""} // ${d.kmLeft!=null?`${fmtNum(Math.max(0,d.kmLeft))} KM LEFT`:""} ${d.due?`// ${formatDate(d.due)}`:""}</div></div><div class="rowActions"><button class="miniBtn" onclick="editItem('maintenance','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('maintenance','${x.id}')">DEL</button></div></div>`}).join("")
}
function renderServiceHistory(){
 const el=$("serviceHistory"),a=[...DB.services].sort((a,b)=>b.date-a.date);if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>`<div class="dataRow"><div><div class="dataMain">🔧 ${escapeHtml(x.name)}${x.setsOil?' <span class="statusPill green">OIL BASE</span>':""}</div><div class="dataSub">${formatDateTime(x.date)} // ${fmtNum(x.odo)} KM${x.note?` // ${escapeHtml(x.note)}`:""}</div></div><div class="dataSide">${fmtMoney(x.cost||0)} PLN<div class="rowActions"><button class="miniBtn" onclick="editItem('services','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('services','${x.id}')">DEL</button></div></div></div>`).join("")
}

// ==========================================================
// GARAGE
// ==========================================================

function renderGarage(){
 renderIssues();renderTyres();renderBuildSheet();renderParts();renderDocuments()
}
function renderIssues(){
 const open=DB.issues.filter(x=>x.status!=="resolved").length;$("issuesBadge").textContent=`${open} OPEN`;const el=$("issuesList"),a=[...DB.issues].sort((a,b)=>(a.status==="resolved")-(b.status==="resolved")||b.date-a.date);
 if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>{const c=x.severity==="urgent"?"red":x.severity==="watch"?"orange":"green";return `<div class="dataRow"><div><div class="dataMain">⚠ ${escapeHtml(x.title)} <span class="statusPill ${c}">${x.severity.toUpperCase()}</span><span class="statusPill">${x.status.toUpperCase()}</span></div><div class="dataSub">${formatDateTime(x.date)}${x.odo?` // ${fmtNum(x.odo)} KM`:""}${x.note?` // ${escapeHtml(x.note)}`:""}</div></div><div class="rowActions"><button class="miniBtn" onclick="editItem('issues','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('issues','${x.id}')">DEL</button></div></div>`}).join("")
}
function renderTyres(){
 const active=DB.tyres.find(x=>x.active);$("activeTyreBadge").textContent=active?active.name:"NO ACTIVE SET";const el=$("tyreList"),a=[...DB.tyres];
 if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>`<div class="dataRow"><div><div class="dataMain">${x.season==="winter"?"❄️":x.season==="summer"?"☀️":"🛞"} ${escapeHtml(x.name)} ${x.active?'<span class="statusPill green">ACTIVE</span>':""}</div><div class="dataSub">${x.dot?`DOT ${escapeHtml(x.dot)} // `:""}${x.tread!=null?`${fmtNum(x.tread,1)} MM // `:""}${fmtNum(tyreMileage(x))} KM LOGGED${x.note?` // ${escapeHtml(x.note)}`:""}</div></div><div><div class="rowActions">${!x.active?`<button class="miniBtn" onclick="switchTyre('${x.id}')">SWITCH</button>`:""}<button class="miniBtn" onclick="editItem('tyres','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('tyres','${x.id}')">DEL</button></div></div></div>`).join("")
}
function renderBuildSheet(){
 const stats=buildSheetStats();
 $("buildSheetBadge").textContent=`${DB.buildSheet.length} ITEMS`;
 $("buildPartsTotal").textContent=`${fmtMoney(stats.parts)} PLN`;
 $("buildLaborTotal").textContent=`${fmtMoney(stats.labor)} PLN`;
 $("buildTotalNet").textContent=`${fmtMoney(stats.total)} PLN`;
 $("buildDeposit").textContent=`${fmtMoney(stats.deposit)} PLN`;
 $("buildBalance").textContent=`${fmtMoney(stats.balance)} PLN`;

 const q=$("buildSearch").value.trim().toLowerCase();
 const cat=$("buildCategoryFilter").value;
 const status=$("buildStatusFilter").value;

 const rows=DB.buildSheet.filter(x=>{
   const okQ=!q||JSON.stringify(x).toLowerCase().includes(q);
   const okCat=cat==="all"||x.category===cat;
   const okStatus=status==="all"||x.status===status;
   return okQ&&okCat&&okStatus;
 }).sort((a,b)=>{
   if(a.kind!==b.kind) return a.kind==="PARTS"?-1:1;
   if(a.category!==b.category) return a.category.localeCompare(b.category);
   return a.name.localeCompare(b.name);
 });

 const el=$("buildSheetList");
 el.hidden=!buildSheetVisible;
 if(!rows.length){
   el.className="dataList buildSheetList emptyState";
   el.textContent="NO MATCHING ITEMS";
   return;
 }
 el.className="dataList buildSheetList";
 el.innerHTML=rows.map(x=>{
   const statusClass=x.status==="INSTALLED"?"green":x.status==="CONFIRMED"?"green":x.status==="REMOVED"?"red":"";
   return `<div class="dataRow">
     <div>
       <div class="dataMain">▣ ${escapeHtml(x.name)}
         <span class="statusPill">${escapeHtml(x.category)}</span>
         <span class="statusPill ${statusClass}">${escapeHtml(x.status)}</span>
       </div>
       <div class="dataSub">${x.brand?`<span class="buildBrand">${escapeHtml(x.brand)}</span> // `:""}${escapeHtml(x.kind)}${x.note?` // ${escapeHtml(x.note)}`:""}</div>
     </div>
     <div class="dataSide">
       <div class="buildPrice">${fmtMoney(x.netPrice)} PLN NET</div>
       <div class="rowActions">
         <button class="miniBtn" onclick="editItem('buildSheet','${x.id}')">EDIT</button>
         <button class="miniBtn danger" onclick="deleteItem('buildSheet','${x.id}')">DEL</button>
       </div>
     </div>
   </div>`;
 }).join("");
}

$("buildSearch").addEventListener("input",renderBuildSheet);
$("buildCategoryFilter").addEventListener("change",renderBuildSheet);
$("buildStatusFilter").addEventListener("change",renderBuildSheet);

$("toggleBuildSheetBtn").addEventListener("click",()=>{
 buildSheetVisible=!buildSheetVisible;
 $("toggleBuildSheetBtn").textContent=buildSheetVisible?"HIDE BUILD SHEET":"SHOW BUILD SHEET";
 renderBuildSheet();
});

$("markBuildInstalledBtn").addEventListener("click",async()=>{
 if(!confirm("Mark all current build-sheet items as INSTALLED?"))return;
 DB.buildSheet.forEach(x=>{if(x.status!=="REMOVED")x.status="INSTALLED"});
 await saveData();
 renderBuildSheet();
 showToast("Build sheet marked as installed.");
});

$("exportBuildSheetBtn").addEventListener("click",()=>{
 const rows=[["category","kind","name","brand_spec","status","net_pln","source","note"]];
 DB.buildSheet.forEach(x=>rows.push([x.category,x.kind,x.name,x.brand||"",x.status,x.netPrice,x.source||"",x.note||""]));
 rows.push([]);
 const s=buildSheetStats();
 rows.push(["SUMMARY","","PARTS + MACHINING","","","",s.parts,""]);
 rows.push(["SUMMARY","","LABOR","","","",s.labor,""]);
 rows.push(["SUMMARY","","TOTAL NET","","","",s.total,""]);
 rows.push(["SUMMARY","","DEPOSIT","","","",s.deposit,""]);
 rows.push(["SUMMARY","","BALANCE AFTER DEPOSIT","","","",s.balance,""]);
 const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const u=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=u;a.download="MPS_rebuild_2026_build_sheet.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);
});

function renderParts(){
 const q=$("partsSearch").value.trim().toLowerCase(),a=DB.parts.filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q)).sort((a,b)=>(b.installedDate||0)-(a.installedDate||0));$("partsBadge").textContent=`${DB.parts.length} ITEMS`;const el=$("partsList");
 if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>`<div class="dataRow"><div><div class="dataMain">▣ ${escapeHtml(x.name)} <span class="statusPill">${escapeHtml(x.category)}</span></div><div class="dataSub">${x.value?`${escapeHtml(x.value)} // `:""}${x.partNumber?`PN ${escapeHtml(x.partNumber)} // `:""}${x.installedOdo?`${fmtNum(x.installedOdo)} KM // `:""}${x.cost?`${fmtMoney(x.cost)} PLN`:""}${x.note?` // ${escapeHtml(x.note)}`:""}</div></div><div class="rowActions"><button class="miniBtn" onclick="editItem('parts','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('parts','${x.id}')">DEL</button></div></div>`).join("")
}
$("partsSearch").addEventListener("input",renderParts);
function renderDocuments(){
 const a=[...DB.documents].sort((a,b)=>a.expiry-b.expiry);$("documentsBadge").textContent=`${a.length} ACTIVE`;const el=$("documentsList");if(!a.length){el.className="dataList emptyState";el.textContent="BRAK DANYCH";return}
 el.className="dataList";el.innerHTML=a.map(x=>{const days=Math.ceil((x.expiry-Date.now())/msDay),cls=days<0?"red":days<30?"orange":"green";return `<div class="dataRow"><div><div class="dataMain">📄 ${escapeHtml(x.type)} // ${escapeHtml(x.name||"DOCUMENT")}</div><div class="dataSub">EXP. ${formatDate(x.expiry)}${x.note?` // ${escapeHtml(x.note)}`:""}</div></div><div class="dataSide ${cls}">${days<0?`${Math.abs(days)}d OVER`:`${days}d`}<div class="rowActions"><button class="miniBtn" onclick="editItem('documents','${x.id}')">EDIT</button><button class="miniBtn danger" onclick="deleteItem('documents','${x.id}')">DEL</button></div></div></div>`}).join("")
}

// ==========================================================
// SNAPSHOT / LOG
// ==========================================================

function renderSnapshot(){
 const odo=effectiveCurrentOdo(),since=DB.pickup.completed&&odo!=null?Math.max(0,odo-DB.pickup.odo):null,oil=oilForecast(),fs=fuelStats(),issues=DB.issues.filter(x=>x.status!=="resolved").length,up=upcomingItems()[0];
 $("snapshotStatus").textContent=DB.pickup.completed?"POST-REBUILD ACTIVE":"WAITING FOR PICKUP";$("snapOdo").textContent=odo!=null?`${fmtNum(odo)} KM`:"—";$("snapSince").textContent=since!=null?`${fmtNum(since)} KM`:"—";$("snapOil").textContent=oil?`${fmtNum(Math.max(0,oil.left))} KM`:"—";$("snapFuel").textContent=fs.last!=null?`${fmtNum(fs.last,2)} L/100`:"—";$("snapIssues").textContent=String(issues);$("snapNextService").textContent=up?(up.kmLeft!=null?`${fmtNum(Math.max(0,up.kmLeft))} KM`:up.due?formatDate(up.due):"—"):"—"
}

function vehicleEvents(){
 const e=[];
 if(DB.pickup.completed)e.push({type:"pickup",date:DB.pickup.date,icon:"😎",title:"MPS PICKUP // OPERATIONS START",sub:`${fmtNum(DB.pickup.odo)} KM`});
 DB.fuel.forEach(x=>e.push({type:"fuel",date:x.date,icon:"⛽",title:`${x.full?"FULL":"PARTIAL"} // ${fmtNum(x.liters,2)} L // ${fmtMoney(x.total)} PLN`,sub:`${fmtNum(x.odo)} KM ${x.note||""}`}));
 DB.services.forEach(x=>e.push({type:"service",date:x.date,icon:"🔧",title:`${x.name} // ${fmtMoney(x.cost||0)} PLN`,sub:`${fmtNum(x.odo)} KM ${x.note||""}`}));
 DB.odoReadings.forEach(x=>e.push({type:"odo",date:x.date,icon:"📍",title:"ODOMETER READING",sub:`${fmtNum(x.odo)} KM`}));
 DB.issues.forEach(x=>e.push({type:"issue",date:x.date,icon:"⚠",title:`${x.title} // ${x.status.toUpperCase()}`,sub:`${x.odo?fmtNum(x.odo)+" KM ":""}${x.note||""}`}));
 DB.expenses.forEach(x=>e.push({type:"expense",date:x.date,icon:"💸",title:`${x.category.toUpperCase()} // ${fmtMoney(x.cost)} PLN`,sub:`${x.odo?fmtNum(x.odo)+" KM ":""}${x.note||""}`}));
 DB.oilTopups.forEach(x=>e.push({type:"oil",date:x.date,icon:"🛢",title:`OIL ${fmtNum(x.liters,2)} L // ${x.level}`,sub:`${fmtNum(x.odo)} KM ${x.note||""}`}));
 return e.sort((a,b)=>b.date-a.date)
}
function renderVehicleLog(){
 const q=$("logSearch").value.trim().toLowerCase(),type=$("logTypeFilter").value,a=vehicleEvents().filter(x=>(type==="all"||x.type===type)&&(!q||(`${x.title} ${x.sub}`).toLowerCase().includes(q)));$("eventCount").textContent=`${a.length} EVENTS`;const el=$("vehicleLog");
 if(!a.length){el.className="vehicleLog emptyState";el.textContent="BRAK WYNIKÓW";return}
 el.className="vehicleLog";el.innerHTML=a.map(x=>`<div class="dataRow"><div><div class="dataMain"><span>${x.icon}</span> ${escapeHtml(x.title)}</div><div class="dataSub">${formatDateTime(x.date)} // ${escapeHtml(x.sub)}</div></div></div>`).join("")
}
$("logSearch").addEventListener("input",renderVehicleLog);$("logTypeFilter").addEventListener("change",renderVehicleLog);

// ==========================================================
// SETTINGS + PICKUP
// ==========================================================

function syncSettings(){
 $("settingPickupDate").value=DB.pickup.date?localDateTimeValue(DB.pickup.date):"";$("settingPickupOdo").value=DB.pickup.odo??"";$("settingCurrentOdo").value=effectiveCurrentOdo()??"";$("settingRebuildCost").value=DB.settings.rebuildCost;$("settingTankCapacity").value=DB.settings.tankCapacity;$("settingOilTarget").value=DB.settings.oilTargetKm;$("settingOilSoftMax").value=DB.settings.oilSoftMaxKm;$("settingOilMonths").value=DB.settings.oilMaxMonths;
 $("testTools").hidden=APP_MODE!=="TEST"
}
$("saveBaselineBtn").addEventListener("click",async()=>{
 const date=parseLocalDateTime($("settingPickupDate").value),odo=Number($("settingPickupOdo").value),cur=Number($("settingCurrentOdo").value),cost=Number($("settingRebuildCost").value),cap=Number($("settingTankCapacity").value);
 if(date&&odo>0)DB.pickup={completed:true,date,odo};if(cur>0)DB.currentOdo=cur;if(cost>=0)DB.settings.rebuildCost=cost;if(cap>0)DB.settings.tankCapacity=cap;await saveData();refreshAll();showToast("Settings saved.")
});
$("saveOilSettingsBtn").addEventListener("click",async()=>{
 const a=Number($("settingOilTarget").value),b=Number($("settingOilSoftMax").value),c=Number($("settingOilMonths").value);if(a<=0||b<=0||c<=0){showToast("Intervals must be > 0.");return}DB.settings.oilTargetKm=a;DB.settings.oilSoftMaxKm=b;DB.settings.oilMaxMonths=c;await saveData();refreshAll();showToast("Oil settings saved.")
});

$("completeMissionBtn").addEventListener("click",()=>{$("pickupDateInput").value=localDateTimeValue();$("pickupOdoInput").value=effectiveCurrentOdo()??"";$("pickupOilBaseline").checked=true;$("missionCompleteModal").hidden=false});
$("cancelPickupBtn").addEventListener("click",()=>$("missionCompleteModal").hidden=true);
$("confirmPickupBtn").addEventListener("click",async()=>{
 const date=parseLocalDateTime($("pickupDateInput").value),odo=Number($("pickupOdoInput").value);if(!date||odo<=0){showToast("Date and odo required.");return}
 DB.pickup={completed:true,date,odo};DB.currentOdo=odo;DB.odoReadings.push({id:uid(),date,odo,source:"pickup"});
 if($("pickupOilBaseline").checked){DB.oilBaseline={date,odo};DB.services.push({id:uid(),date,odo,name:"FINAL OIL // POST-REBUILD BASELINE",cost:0,setsOil:true,note:"Auto-created at pickup"})}
 await saveData();$("missionCompleteModal").hidden=true;refreshAll();showToast("POST-REBUILD OPERATIONS ONLINE 😎")
});

// ==========================================================
// BACKUP / CSV
// ==========================================================

$("exportBackupBtn").addEventListener("click",()=>{
 const blob=new Blob([JSON.stringify({app:"MPS Operating System",version:6,mode:APP_MODE,exportedAt:new Date().toISOString(),data:DB},null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=`MPS_v6_${APP_MODE}_backup_${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)
});
$("importBackupInput").addEventListener("change",async e=>{
 const f=e.target.files?.[0];if(!f)return;try{const p=JSON.parse(await f.text()),incoming=p.data||p;DB=mergeDefaults(incoming);await saveData();refreshAll();showToast("Backup imported.")}catch(err){showToast("Invalid backup.")}e.target.value=""
});
$("exportCsvBtn").addEventListener("click",()=>{
 const rows=[["date","type","title","details"],...vehicleEvents().slice().reverse().map(x=>[new Date(x.date).toISOString(),x.type,x.title,x.sub])],csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=`MPS_vehicle_log_${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)
});
$("resetDataBtn").addEventListener("click",async()=>{if(!confirm("Delete ALL app data?"))return;DB=clone(DEFAULT_DATA);await saveData();refreshAll();showToast("Database reset.")});

// ==========================================================
// TEST DATA
// ==========================================================

function demoData(){
 const now=Date.now(),pickup=new Date(2026,7,1,12).getTime(),baseOdo=168420;
 return mergeDefaults({
  settings:{...DEFAULT_DATA.settings,rebuildCost:46000},
  pickup:{completed:true,date:pickup,odo:baseOdo},currentOdo:170940,oilBaseline:{date:pickup,odo:baseOdo},
  fuel:[
   {id:uid(),date:new Date(2026,7,1,13).getTime(),odo:168420,liters:49.2,total:338.52,full:true,note:"TEST START"},
   {id:uid(),date:new Date(2026,7,8,18).getTime(),odo:168965,liters:50.1,total:346.19,full:true,note:"Orlen"},
   {id:uid(),date:new Date(2026,7,14,17).getTime(),odo:169492,liters:48.3,total:335.18,full:true,note:"Shell"},
   {id:uid(),date:new Date(2026,7,20,19).getTime(),odo:170020,liters:51.0,total:351.90,full:true,note:"Orlen"},
   {id:uid(),date:now-2*msDay,odo:170620,liters:55.2,total:382.54,full:true,note:"BP"}
  ],
  odoReadings:[{id:uid(),date:now,odo:170940,source:"demo"}],
  services:[
   {id:uid(),date:pickup,odo:baseOdo,name:"FINAL OIL // POST-REBUILD",cost:0,setsOil:true,note:"Valvoline SynPower 5W40"},
   {id:uid(),date:new Date(2026,7,18).getTime(),odo:169850,name:"POST-REBUILD CHECK",cost:350,setsOil:false,note:"Demo"}
  ],
  expenses:[{id:uid(),date:new Date(2026,7,2).getTime(),odo:168500,category:"insurance",cost:2100,note:"AC/OC DEMO"}],
  maintenance:[
   {id:uid(),name:"ENGINE OIL",category:"engine",intervalKm:5000,intervalMonths:8,lastDate:pickup,lastOdo:baseOdo,estimatedCost:450,note:"Demo",active:true},
   {id:uid(),name:"SPARK PLUGS",category:"engine",intervalKm:20000,intervalMonths:24,lastDate:pickup,lastOdo:baseOdo,estimatedCost:500,note:"Example only",active:true},
   {id:uid(),name:"MPS CLINIC CHECK",category:"inspection",intervalKm:10000,intervalMonths:12,lastDate:pickup,lastOdo:baseOdo,estimatedCost:300,note:"Example only",active:true}
  ],
  oilTopups:[
   {id:uid(),date:new Date(2026,7,12).getTime(),odo:169300,liters:.15,level:"TOPUP",note:"Demo"},
   {id:uid(),date:new Date(2026,7,19).getTime(),odo:169950,liters:.10,level:"TOPUP",note:"Demo"}
  ],
  issues:[
   {id:uid(),date:new Date(2026,7,10).getTime(),odo:169100,title:"LIGHT VIBRATION AT IDLE",severity:"watch",status:"observing",note:"Warm engine only",resolvedDate:null},
   {id:uid(),date:new Date(2026,7,5).getTime(),odo:168700,title:"RATTLE FROM TRUNK",severity:"info",status:"resolved",note:"Loose trim",resolvedDate:new Date(2026,7,7).getTime()}
  ],
  tyres:[
   {id:uid(),name:"SUMMER SET",season:"summer",dot:"1225",tread:6.5,note:"Demo",active:true,activeFromOdo:168420,accumulatedKm:0,lastSwitchDate:pickup},
   {id:uid(),name:"WINTER SET",season:"winter",dot:"4024",tread:7.2,note:"Demo",active:false,activeFromOdo:null,accumulatedKm:0,lastSwitchDate:null}
  ],
  parts:[
   {id:uid(),category:"turbo",name:"TURBO",value:"BNR S2",partNumber:"",installedDate:pickup,installedOdo:baseOdo,cost:0,note:"Demo spec"},
   {id:uid(),category:"intake",name:"INTAKE",value:'CorkSport 3" Big MAF',partNumber:"",installedDate:pickup,installedOdo:baseOdo,cost:0,note:"Demo spec"},
   {id:uid(),category:"fuel",name:"HPFP",value:"VIS internals",partNumber:"",installedDate:pickup,installedOdo:baseOdo,cost:0,note:"Demo spec"}
  ],
  documents:[
   {id:uid(),type:"OC",name:"Demo insurer",expiry:new Date(2027,0,15).getTime(),cost:900,note:"Test"},
   {id:uid(),type:"INSPECTION",name:"TECH",expiry:new Date(2027,2,1).getTime(),cost:100,note:"Test"}
  ]
 })
}
$("loadDemoBtn").addEventListener("click",async()=>{if(!confirm("Replace TEST database with demo data?"))return;DB=demoData();await saveData();refreshAll();showToast("Demo data loaded.")});
$("clearTestBtn").addEventListener("click",async()=>{DB=clone(DEFAULT_DATA);await saveData();refreshAll();showToast("Test DB cleared.")});

// ==========================================================
// NAV + REFRESH
// ==========================================================

function showScreen(name){
 document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".navBtn").forEach(x=>x.classList.remove("active"));$(`screen-${name}`).classList.add("active");document.querySelector(`.navBtn[data-screen="${name}"]`)?.classList.add("active");
 if(name==="drive")renderDrive();if(name==="service")renderService();if(name==="garage")renderGarage();if(name==="log")renderVehicleLog();if(name==="settings")syncSettings();window.scrollTo({top:0,behavior:"instant"})
}
document.querySelectorAll(".navBtn").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));

function renderExpenses(){}
function refreshAll(){syncSettings();renderDrive();renderService();renderGarage();renderVehicleLog()}

async function boot(){
 try{
  await initStorage();syncSettings();refreshAll();updateMission();setInterval(updateMission,100);
  setInterval(()=>{const id=document.querySelector(".screen.active")?.id;if(id==="screen-drive")renderDrive();if(id==="screen-service")renderService();if(id==="screen-garage")renderGarage()},30000);
 }catch(e){document.body.innerHTML=`<pre style="padding:20px;color:white">DATABASE ERROR\n${escapeHtml(e?.stack||e)}</pre>`}
}
boot();

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw-v621.js").catch(()=>{}));

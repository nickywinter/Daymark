
const M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const def=[
{name:"Exercise",archived:false,type:"personal"},
{name:"Walk",archived:false,type:"personal"},
{name:"Read",archived:false,type:"personal"},
{name:"Podcast",archived:false,type:"personal"},
{name:"Sleep 7+",archived:false,type:"personal"},
{name:"Cold Shower",archived:false,type:"personal"},
{name:"No Alcohol",archived:false,type:"personal"},
{name:"Plan Day",archived:false,type:"work"}
];

const logDate=new Date(Date.now()-86400000);
const logKey=k(logDate);
let selected=logKey;

let store=JSON.parse(localStorage.getItem("habitV251"))||{};

function k(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")}
function p(key){const [y,m]=key.split("-").map(Number);return new Date(y,m-1,1)}
function fmtDate(d){return d.getDate()+" "+M[d.getMonth()]+" "+d.getFullYear()}
function esc(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function clone(o){return JSON.parse(JSON.stringify(o))}

function ensure(key){
if(store[key]) return;
store[key]={habits:clone(def),days:{},weight:{},moments:{}}
}

ensure(logKey);

function save(){
localStorage.setItem("habitV251",JSON.stringify(store))
}

function data(){
ensure(selected);
return store[selected]
}

function activeToday(h){
const day=logDate.getDay();
const weekend=(day===0||day===6);
if(h.type==="work" && weekend) return false;
return true;
}

function toggleHabit(name,day){
const d=data();
d.days[day]=d.days[day]||[];

d.days[day]=d.days[day].includes(name)
?d.days[day].filter(x=>x!==name)
:[...d.days[day],name];

save();
showToday();
}

function showToday(){

const d=data();
const day=logDate.getDate();

let h=`<div class="card"><strong>Yesterday</strong><br>${fmtDate(logDate)}</div>`;

d.habits.filter(x=>!x.archived && activeToday(x)).forEach(x=>{

const done=d.days[day]?.includes(x.name);

h+=`
<div class="habit" onclick='toggleHabit(${JSON.stringify(x.name)},${day})'>
<div class="dot ${done?"done":""}"></div>
<div>${esc(x.name)}</div>
</div>`;

});

h+=`
<div class="card">
<h3>Weight</h3>
<input type="number" step="0.1" value="${d.weight[day]||""}" onchange="setWeight(this.value,${day})">

<h3>Memorable Moment</h3>
<textarea onchange="setMoment(this.value,${day})">${d.moments[day]||""}</textarea>
</div>`;

document.getElementById("content").innerHTML=h;
}

function setWeight(v,day){
const d=data();
d.weight[day]=v;
save();
}

function setMoment(v,day){
const d=data();
d.moments[day]=v;
save();
}

function showProgress(){

const d=data();
let h=`<div class="card"><h3>Weight Log</h3>`;

const e=Object.keys(d.weight).sort((a,b)=>b-a);

if(!e.length){
h+=`<div class="muted">No weight entries yet.</div>`;
}else{

e.forEach(i=>{
const dt=new Date(logDate);
dt.setDate(Number(i));
h+=`<div class="list-line">${fmtDate(dt)} : ${d.weight[i]} kg</div>`;
});

}

h+=`</div>`;
document.getElementById("content").innerHTML=h;
}

function showLife(){

const d=data();
let h=`<div class="card"><h3>Memorable Moments</h3>`;

const e=Object.keys(d.moments).sort((a,b)=>b-a);

if(!e.length){
h+=`<div class="muted">No memorable moments yet.</div>`;
}else{

e.forEach(i=>{
const dt=new Date(logDate);
dt.setDate(Number(i));
h+=`<div class="list-line"><strong>${fmtDate(dt)}</strong><br>${esc(d.moments[i])}</div>`;
});

}

h+=`</div>`;
document.getElementById("content").innerHTML=h;
}

function archiveHabit(index){
const d=data();
d.habits[index].archived=true;
save();
showSettings();
}

function restoreHabit(index){
const d=data();
d.habits[index].archived=false;
save();
showSettings();
}

function addHabit(){

const name=document.getElementById("newHabit").value.trim();
const type=document.getElementById("habitType").value;

if(!name) return;

const d=data();

d.habits.push({
name:name,
archived:false,
type:type
});

save();
showSettings();
}

function exportData(){
const s="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(store));
const a=document.createElement("a");
a.href=s;
a.download="habit-backup.json";
a.click();
}

function importData(e){

const file=e.target.files[0];
if(!file) return;

const reader=new FileReader();

reader.onload=function(){

store=JSON.parse(reader.result);

ensure(logKey);
save();

alert("Backup imported successfully");
showToday();

};

reader.readAsText(file);
}

function showSettings(){

const d=data();

let h=`<div class="card"><h3>Personal Habits</h3>`;

d.habits.forEach((x,i)=>{
if(!x.archived && x.type!=="work"){
h+=`<div class="row-actions"><div>${esc(x.name)}</div>
<button class="btn archive" onclick="archiveHabit(${i})">Archive</button></div>`;
}
});

h+=`<h3>Work Habits</h3>`;

d.habits.forEach((x,i)=>{
if(!x.archived && x.type==="work"){
h+=`<div class="row-actions"><div>${esc(x.name)}</div>
<button class="btn archive" onclick="archiveHabit(${i})">Archive</button></div>`;
}
});

h+=`<h3>Add Habit</h3>
<input id="newHabit" type="text" placeholder="New habit">

<select id="habitType">
<option value="personal">Personal</option>
<option value="work">Work</option>
</select>

<button class="btn" onclick="addHabit()">Add Habit</button>

<h3>Backup</h3>
<button class="btn secondary" onclick="exportData()">Export Backup</button>
<input type="file" onchange="importData(event)">

<div class="muted">Version 3.1</div>
</div>`;

document.getElementById("content").innerHTML=h;
}

save();
showToday();

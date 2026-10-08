const $=s=>document.querySelector(s);
let reminders=JSON.parse(localStorage.getItem("mytools_reminders")||"[]");
let notified=new Set(JSON.parse(localStorage.getItem("mytools_notified")||"[]"));
let playlist=[],current=0;

function save(){localStorage.setItem("mytools_reminders",JSON.stringify(reminders))}
function fmt(r){
  const d=new Date(r.date+"T"+r.time);
  return d.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})+" • "+r.time+(r.repeat==="daily"?" • setiap hari":"");
}
function render(){
  const list=$("#list"); $("#count").textContent=`${reminders.length} pengingat`;
  if(!reminders.length){list.innerHTML='<div class="empty">Belum ada pengingat. Tambahkan yang pertama 👀</div>';return}
  list.innerHTML=reminders.map(r=>`<div class="reminder ${r.done?"done":""}">
    <button class="check" onclick="toggleDone('${r.id}')">${r.done?"✓":""}</button>
    <div class="rmain"><div class="rtitle">${escapeHtml(r.title)}</div><div class="rtime">${fmt(r)}</div></div>
    <button class="del" onclick="removeReminder('${r.id}')">×</button>
  </div>`).join("");
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
window.toggleDone=id=>{const r=reminders.find(x=>x.id===id);if(r){r.done=!r.done;save();render()}}
window.removeReminder=id=>{reminders=reminders.filter(x=>x.id!==id);save();render()}
$("#add").onclick=()=>{
 const title=$("#title").value.trim(),date=$("#date").value,time=$("#time").value;
 if(!title||!date||!time){alert("Isi judul, tanggal, dan jam dulu.");return}
 reminders.push({id:Date.now().toString(),title,date,time,repeat:$("#repeat").value,done:false});
 save();render();$("#title").value="";
}
$("#clear").onclick=()=>{reminders=reminders.filter(r=>!r.done);save();render()};

async function askNotification(){
 if(!("Notification" in window)){alert("Browser ini tidak mendukung notifikasi.");return}
 const p=await Notification.requestPermission();
 alert(p==="granted"?"Notifikasi aktif 🔔":"Izin notifikasi belum diberikan.");
}
$("#notify").onclick=askNotification;

function checkReminders(){
 const now=new Date(),today=now.toISOString().slice(0,10),hh=String(now.getHours()).padStart(2,"0"),mm=String(now.getMinutes()).padStart(2,"0");
 reminders.forEach(r=>{
   let due=(r.date===today && r.time===`${hh}:${mm}` && !r.done);
   if(r.repeat==="daily"){
     const first=new Date(r.date+"T"+r.time);
     due=now>=first && r.time===`${hh}:${mm}` && !r.done;
   }
   const key=r.id+"-"+today+"-"+r.time;
   if(due&&!notified.has(key)){
     notified.add(key);localStorage.setItem("mytools_notified",JSON.stringify([...notified]));
     if(Notification.permission==="granted") new Notification("⏰ "+r.title,{body:"Pengingat kamu sudah waktunya."});
     else alert("⏰ "+r.title+"\nPengingat kamu sudah waktunya.");
   }
 });
}
setInterval(checkReminders,10000); checkReminders(); render();

$("#theme").onclick=()=>{document.body.classList.toggle("light");$("#theme").textContent=document.body.classList.contains("light")?"☀️":"🌙"};

const audio=$("#audio"),play=$("#play"),song=$("#song");
$("#musicFiles").onchange=e=>{
 playlist=[...e.target.files].map(file=>({name:file.name,url:URL.createObjectURL(file)}));
 current=0;loadSong();
};
function loadSong(){if(!playlist.length){song.textContent="Tambahkan lagu milikmu";return}audio.src=playlist[current].url;song.textContent=playlist[current].name}
play.onclick=()=>{if(!playlist.length)return;if(audio.paused){audio.play();play.textContent="⏸"}else{audio.pause();play.textContent="▶"}}
$("#next").onclick=()=>{if(!playlist.length)return;current=(current+1)%playlist.length;loadSong();audio.play();play.textContent="⏸"}
$("#prev").onclick=()=>{if(!playlist.length)return;current=(current-1+playlist.length)%playlist.length;loadSong();audio.play();play.textContent="⏸"}
audio.onended=()=>$("#next").click();
$("#volume").oninput=e=>audio.volume=e.target.value;

// Isi tanggal hari ini sebagai default
$("#date").value=new Date().toISOString().slice(0,10);

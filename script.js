// ==========================
// JAM DIGITAL
// ==========================

function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  document.getElementById("clock").textContent =
    `${hours}:${minutes}:${seconds}`;

  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"
  ];

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];

  document.getElementById("date").textContent =
    `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

setInterval(updateClock, 1000);
updateClock();


// ==========================
// DATA PENGINGAT
// ==========================

let reminders =
  JSON.parse(localStorage.getItem("reminders")) || [];

function saveReminders() {
  localStorage.setItem(
    "reminders",
    JSON.stringify(reminders)
  );
}


// ==========================
// MENAMPILKAN PENGINGAT
// ==========================

function renderReminders() {
  const list = document.getElementById("reminderList");
  const count = document.getElementById("count");

  count.textContent = reminders.length;

  if (reminders.length === 0) {
    list.innerHTML =
      `<p class="empty">Belum ada pengingat.</p>`;
    return;
  }

  list.innerHTML = "";

  reminders.sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(
      `${b.date} ${b.time}`
    )
  );

  reminders.forEach((reminder) => {

    const item = document.createElement("div");
    item.className = "reminder";

    item.innerHTML = `
      <div class="reminder-info">
        <div class="reminder-name">
          ${escapeHTML(reminder.text)}
        </div>

        <div class="reminder-time">
          📅 ${reminder.date} • ⏰ ${reminder.time}
        </div>
      </div>

      <button class="delete-btn"
        onclick="deleteReminder(${reminder.id})">
        Hapus
      </button>
    `;

    list.appendChild(item);
  });
}


// ==========================
// TAMBAH PENGINGAT
// ==========================

document
  .getElementById("addReminder")
  .addEventListener("click", () => {

    const text =
      document.getElementById("reminderText").value.trim();

    const date =
      document.getElementById("reminderDate").value;

    const time =
      document.getElementById("reminderTime").value;

    if (!text || !date || !time) {
      showPopup(
        "Belum lengkap",
        "Isi nama, tanggal, dan waktu pengingat dulu ya."
      );
      return;
    }

    reminders.push({
      id: Date.now(),
      text,
      date,
      time,
      triggered: false
    });

    saveReminders();
    renderReminders();

    document.getElementById("reminderText").value = "";
    document.getElementById("reminderDate").value = "";
    document.getElementById("reminderTime").value = "";

    showPopup(
      "Berhasil! 🎉",
      "Pengingat sudah disimpan."
    );
  });


// ==========================
// HAPUS
// ==========================

function deleteReminder(id) {
  reminders =
    reminders.filter(reminder => reminder.id !== id);

  saveReminders();
  renderReminders();
}


// ==========================
// CEK PENGINGAT
// ==========================

function checkReminders() {

  const now = new Date();

  const currentDate =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const currentTime =
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  reminders.forEach(reminder => {

    if (
      reminder.date === currentDate &&
      reminder.time === currentTime &&
      !reminder.triggered
    ) {

      reminder.triggered = true;

      showPopup(
        "⏰ Pengingat!",
        reminder.text
      );

      playAlarm();

      if ("Notification" in window &&
          Notification.permission === "granted") {

        new Notification("⏰ PengingatKu", {
          body: reminder.text
        });
      }
    }
  });

  saveReminders();
}

setInterval(checkReminders, 1000);


// ==========================
// SUARA ALARM
// ==========================

function playAlarm() {

  const audioContext =
    new (window.AudioContext ||
      window.webkitAudioContext)();

  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.frequency.value = 800;

  gain.gain.setValueAtTime(
    0.2,
    audioContext.currentTime
  );

  oscillator.start();

  oscillator.stop(
    audioContext.currentTime + 0.8
  );
}


// ==========================
// NOTIFIKASI
// ==========================

if ("Notification" in window) {

  document.addEventListener(
    "click",
    () => {

      if (Notification.permission === "default") {
        Notification.requestPermission();
      }

    },
    { once: true }
  );
}


// ==========================
// POPUP
// ==========================

function showPopup(title, message) {

  document.getElementById("popupTitle")
    .textContent = title;

  document.getElementById("popupMessage")
    .textContent = message;

  document.getElementById("popup")
    .classList.remove("hidden");
}

document
  .getElementById("closePopup")
  .addEventListener("click", () => {

    document.getElementById("popup")
      .classList.add("hidden");

  });


// ==========================
// GIFT
// ==========================

document
  .getElementById("giftBtn")
  .addEventListener("click", () => {

    showPopup(
      "🎁 Surprise!",
      "Semoga harimu menyenangkan! ❤️"
    );

  });


// ==========================
// DARK MODE
// ==========================

const themeBtn =
  document.getElementById("themeBtn");

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀️";
}

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const dark =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "darkMode",
    dark
  );

  themeBtn.textContent =
    dark ? "☀️" : "🌙";
});


// ==========================
// KEAMANAN TEKS
// ==========================

function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// ==========================
// LOAD
// ==========================

renderReminders();

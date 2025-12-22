let cards = [];
let usedCards = JSON.parse(localStorage.getItem("usedCards")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let extraCards = JSON.parse(localStorage.getItem("extraCards")) || [];
let isAnimating = false;

const card = document.getElementById("card");
const textEl = document.getElementById("cardText");
const ownerEl = document.getElementById("cardOwner");

/* ---------------- โหลดการ์ด ---------------- */
fetch("cards.json")
  .then(res => res.json())
  .then(data => {
    cards = [...data, ...extraCards];
  })
  .catch(() => alert("โหลดการ์ดไม่สำเร็จ"));

/* ---------------- จั่วการ์ด ---------------- */
function drawCard() {
  if (isAnimating) return;

  if (usedCards.length === cards.length) {
    alert("การ์ดหมดแล้ว");
    return;
  }

  isAnimating = true;

  const available = cards.filter(c => !usedCards.includes(c.id));
  pendingCard = available[Math.floor(Math.random() * available.length)];

  // ปิดการ์ดก่อน
  card.classList.remove("flipped");
  card.classList.add("waiting");

  setTimeout(() => {
    updateCard(pendingCard);

    card.classList.remove("waiting");
    card.classList.add("flipped");

    usedCards.push(pendingCard.id);
    history.push(pendingCard);

    localStorage.setItem("usedCards", JSON.stringify(usedCards));
    localStorage.setItem("history", JSON.stringify(history));

    isAnimating = false;
  }, 300);
}


/* ---------------- อัปเดตการ์ด ---------------- */
function updateCard(c) {
  textEl.textContent = c.text;

  if (c.owner) {
    ownerEl.textContent = c.owner;
    ownerEl.style.display = "block";
  } else {
    ownerEl.style.display = "none";
  }

  card.classList.remove("challenge", "character");
  card.classList.add(c.type);
}

/* ---------------- รีเซ็ต ---------------- */
document.getElementById("resetBtn").onclick = () => {
  // ลบข้อมูล
  localStorage.removeItem("usedCards");
  localStorage.removeItem("history");

  usedCards = [];
  history = [];

  // รีเซ็ตการ์ดให้หงายหน้า
  card.classList.remove("flipped", "challenge", "character");
  card.classList.add("waiting");

  setTimeout(() => {
    textEl.textContent = "";
    ownerEl.style.display = "none";
    card.classList.remove("waiting");
  }, 300);

  // 🔴 ล้างและซ่อนประวัติบนหน้าจอ
  const box = document.getElementById("historyBox");
  box.innerHTML = "";
  box.classList.add("hidden");
};


/* ---------------- ประวัติ ---------------- */
document.getElementById("historyBtn").onclick = () => {
  const box = document.getElementById("historyBox");
  box.classList.toggle("hidden");

  if (history.length === 0) {
    box.innerHTML = "<p>ยังไม่มีประวัติ</p>";
    return;
  }

  box.innerHTML = history
    .map((c, i) => `
      <p>
        ${i + 1}. 
        ${c.owner ? `<b>${c.owner}</b>: ` : ""}
        ${c.text}
      </p>
    `)
    .join("");
};

/* ---------------- เพิ่มการ์ด ---------------- */
document.getElementById("addBtn").onclick = () => {
  const text = prompt("ใส่คำสั่งการ์ด");
  if (!text) return;

  const owner = prompt("ชื่อเจ้าของ (เว้นว่างได้)");
  const type = confirm("เป็นการ์ด Challenge ไหม?\nOK = Challenge / Cancel = Character")
    ? "challenge"
    : "character";

  const newCard = {
    id: Date.now(),
    text,
    owner: owner || null,
    type,
    custom: true
  };

  cards.push(newCard);
  extraCards.push(newCard);

  localStorage.setItem("extraCards", JSON.stringify(extraCards));

  alert("เพิ่มการ์ดเรียบร้อย 🎉");
};

/* ---------------- ลบการ์ดที่เพิ่มเอง ---------------- */
document.getElementById("deleteBtn").onclick = () => {
  if (extraCards.length === 0) {
    alert("ยังไม่มีการ์ดที่เพิ่มเอง");
    return;
  }

  const list = extraCards
    .map((c, i) => `${i + 1}. ${c.text}`)
    .join("\n");

  const index = prompt(
    "เลือกหมายเลขการ์ดที่ต้องการลบ:\n\n" + list
  );

  const i = Number(index) - 1;
  if (isNaN(i) || !extraCards[i]) return;

  const removed = extraCards.splice(i, 1)[0];

  cards = cards.filter(c => c.id !== removed.id);
  usedCards = usedCards.filter(id => id !== removed.id);
  history = history.filter(c => c.id !== removed.id);

  localStorage.setItem("extraCards", JSON.stringify(extraCards));
  localStorage.setItem("usedCards", JSON.stringify(usedCards));
  localStorage.setItem("history", JSON.stringify(history));

  alert("ลบการ์ดเรียบร้อย 🗑️");
};

/* ---------------- ปุ่มจั่ว ---------------- */
document.getElementById("drawBtn").onclick = drawCard;
card.onclick = drawCard;
let cards = [];
let usedCards = JSON.parse(localStorage.getItem("usedCards")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let extraCards = JSON.parse(localStorage.getItem("extraCards")) || [];
let isAnimating = false;

const card = document.getElementById("card");
const textEl = document.getElementById("cardText");
const ownerEl = document.getElementById("cardOwner");
const wrapper = document.getElementById("cardWrapper");

console.log("script loaded");
/* ---------------- โหลดการ์ด ---------------- */
fetch("cards.json")
  .then(res => res.json())
  .then(data => {
  cards = [...data, ...extraCards];
  updateCardCount(); // ⭐ สำคัญ
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
  const pendingCard = available[Math.floor(Math.random() * available.length)];

  /* 0️⃣ ปิดการ์ดก่อน (ถ้าเปิดอยู่) */
  if (card.classList.contains("flipped")) {
    card.classList.remove("flipped");
  }

  /* 1️⃣ รอ flip ปิดเสร็จ แล้วค่อยเลื่อนออก */
  setTimeout(() => {
    wrapper.classList.remove("center");
    wrapper.classList.add("slide-out");

    /* 2️⃣ ออกจอแล้ว */
    setTimeout(() => {
      /* เปลี่ยนข้อมูลการ์ด */
      updateCard(pendingCard);

      /* บังคับ reflow ให้แน่ใจว่าการ์ดปิด */
      card.offsetHeight;

      /* 3️⃣ วางการ์ดใหม่ไว้นอกจอ (ยังปิด) */
      wrapper.classList.remove("slide-out");
      wrapper.classList.add("slide-in");

      usedCards.push(pendingCard.id);
      history.push(pendingCard);

      localStorage.setItem("usedCards", JSON.stringify(usedCards));
      localStorage.setItem("history", JSON.stringify(history));
      updateCardCount();
      /* 4️⃣ เลื่อนการ์ดใหม่เข้ามา */
      requestAnimationFrame(() => {
        wrapper.classList.remove("slide-in");
        wrapper.classList.add("center");
      });

      /* 5️⃣ ถึงกลางแล้ว → flip เปิด */
      setTimeout(() => {
        card.classList.add("flipped");
        isAnimating = false;
      }, 350);

      
    }, 350); // เวลา slide-out
  }, 350);   // เวลา flip ปิด
}

function updateCardCount() {
  const remain = cards.length - usedCards.length;
  document.getElementById("cardCount").textContent =
    `การ์ดที่เหลือ: ${remain} ใบ`;
}






/* ---------------- อัปเดตการ์ด ---------------- */
function updateCard(c) {
  textEl.textContent = c.text;

  if (c.owner) {
    ownerEl.textContent = `(${c.owner})`;
    ownerEl.style.display = "block";
  } else {
    ownerEl.style.display = "none";
  }

  card.classList.remove("challenge", "character", "joker");
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
  updateCardCount();
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
  if (!cards || cards.length === 0) {
    alert("การ์ดยังโหลดไม่เสร็จ");
    return;
  }

  const text = prompt("ใส่คำสั่งการ์ด");
  if (!text || text.trim() === "") return;

  const owner = prompt("ชื่อเจ้าของ (เว้นว่างได้)");

  const typeChoice = prompt(
    "เลือกชนิดการ์ด:\n1 = Challenge\n2 = Character\n3 = Joker"
  );

  let type;
  if (typeChoice === "1") type = "challenge";
  else if (typeChoice === "2") type = "character";
  else if (typeChoice === "3") type = "joker";
  else {
    alert("ยกเลิกการเพิ่มการ์ด");
    return;
  }

  const newCard = {
    id: Date.now(),
    text: text.trim(),
    owner: owner ? owner.trim() : null,
    type,
    custom: true
  };

  cards.push(newCard);
  extraCards.push(newCard);

  localStorage.setItem("extraCards", JSON.stringify(extraCards));

  alert(`เพิ่มการ์ด ${type.toUpperCase()} เรียบร้อย 🎉`);
};


/* ---------------- ลบการ์ดที่เพิ่มเอง ---------------- */
document.getElementById("deleteBtn").onclick = () => {
  if (extraCards.length === 0) {
    alert("ยังไม่มีการ์ดที่เพิ่มเอง");
    return;
  }

  const list = extraCards
    .map((c, i) =>
      `${i + 1}. [${c.type.toUpperCase()}] ${c.text} ${
        c.owner ? `(เจ้าของ: ${c.owner})` : ""
      }`
    )
    .join("\n");

  const index = prompt(
    "เลือกหมายเลขการ์ดที่ต้องการลบ:\n\n" + list
  );

  const i = Number(index) - 1;
  if (isNaN(i) || !extraCards[i]) {
    alert("ยกเลิกการลบ");
    return;
  }

  const c = extraCards[i];

  const confirmDelete = confirm(
    `ยืนยันการลบการ์ดนี้?\n\n` +
    `[${c.type.toUpperCase()}] ${c.text} ${
      c.owner ? `(เจ้าของ: ${c.owner})` : ""
    }`
  );

  if (!confirmDelete) return;

  /* ลบจริง */
  extraCards.splice(i, 1);
  cards = cards.filter(card => card.id !== c.id);
  usedCards = usedCards.filter(id => id !== c.id);
  history = history.filter(card => card.id !== c.id);

  localStorage.setItem("extraCards", JSON.stringify(extraCards));
  localStorage.setItem("usedCards", JSON.stringify(usedCards));
  localStorage.setItem("history", JSON.stringify(history));

  alert("ลบการ์ดเรียบร้อย 🗑️");
};



/* ---------------- ปุ่มจั่ว ---------------- */
document.getElementById("drawBtn").onclick = drawCard;
card.onclick = drawCard;
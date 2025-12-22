const cards = [
  "ชนแก้วกับคนข้างซ้าย 🍻",
  "เล่าเรื่องฮาที่สุดในปีนี้ 😂",
  "ดื่ม 1 ช็อต 🥃",
  "อวยพรคนในวง 1 คน 💖"
];

const drawBtn = document.getElementById("drawBtn");
const cardDiv = document.getElementById("card");
const cardText = document.getElementById("cardText");

drawBtn.addEventListener("click", () => {
  const random = Math.floor(Math.random() * cards.length);
  cardText.textContent = cards[random];
  cardDiv.classList.remove("hidden");
});

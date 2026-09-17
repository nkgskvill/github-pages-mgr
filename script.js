"use strict";

const sizeKey = "senior-navi-text-size";
const largeButton = document.getElementById("text-large");
const standardButton = document.getElementById("text-standard");
function setTextSize(large, save = true) {
  document.documentElement.classList.toggle("large-text", large);
  largeButton.setAttribute("aria-pressed", String(large));
  standardButton.setAttribute("aria-pressed", String(!large));
  if (save) {
    try { localStorage.setItem(sizeKey, large ? "large" : "standard"); }
    catch { /* 保存できない場合も、このページでは変更できます。 */ }
  }
}
try { setTextSize(localStorage.getItem(sizeKey) === "large", false); }
catch { setTextSize(false, false); }
largeButton.addEventListener("click", () => setTextSize(true));
standardButton.addEventListener("click", () => setTextSize(false));

// 外部画像に依存しない、文字ラベルに添えた装飾用アイコン。
const iconPaths = [
  '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M5 12h4l2-4 2 8 2-4h4"/>',
  '<path d="M21 11a9 9 0 0 1-9 9H4l-3 2 2-6a9 9 0 1 1 18-5Z"/><path d="M7 9h10M7 13h7"/>',
  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h2M13 14h2M7 17h2"/>',
  '<rect x="4" y="3" width="16" height="17" rx="3"/><path d="M4 12h16M9 3v9M15 3v9M7 20v2M17 20v2M7 16h1M16 16h1"/>',
  '<path d="m2 11 10-9 10 9M5 9v12h14V9M9 21v-7h6v7"/>',
  '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4M11 19h2"/>'
];
const categoryButtons = [...document.querySelectorAll("button[data-category]")];
categoryButtons.forEach((button, index) => {
  button.querySelector(".icon").innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${iconPaths[index]}</svg>`;
});

const searchInput = document.getElementById("search-input");
const items = [...document.querySelectorAll("#news-list > li")];
const moreButton = document.getElementById("load-more");
const resultStatus = document.getElementById("result-status");
let selectedCategory = "";
let limit = 6;
const normalize = value => value.normalize("NFKC").toLocaleLowerCase("ja").trim();
function renderNews() {
  const words = normalize(searchInput.value).split(/\s+/).filter(Boolean);
  const matches = items.filter(item => {
    const title = normalize(item.querySelector("summary").textContent);
    return (!selectedCategory || item.dataset.category === selectedCategory)
      && words.every(word => title.includes(word));
  });
  const visible = matches.slice(0, limit);
  items.forEach(item => { item.hidden = !visible.includes(item); });
  categoryButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.category === selectedCategory));
  });
  const scope = selectedCategory || "すべてのカテゴリー";
  resultStatus.textContent = `${scope}：${matches.length}件中${visible.length}件を表示${searchInput.value.trim() ? `（検索：${searchInput.value.trim()}）` : ""}`;
  document.getElementById("empty-message").hidden = matches.length !== 0;
  moreButton.hidden = visible.length >= matches.length;
}
searchInput.addEventListener("input", () => { limit = 6; renderNews(); });
document.getElementById("search-form").addEventListener("submit", event => {
  event.preventDefault();
  limit = 6;
  renderNews();
  document.getElementById("news-heading").focus();
});
categoryButtons.forEach(button => button.addEventListener("click", () => {
  selectedCategory = selectedCategory === button.dataset.category ? "" : button.dataset.category;
  limit = 6;
  renderNews();
}));
document.getElementById("reset-filter").addEventListener("click", () => {
  searchInput.value = "";
  selectedCategory = "";
  limit = 6;
  renderNews();
});
moreButton.addEventListener("click", () => {
  const previouslyVisible = items.filter(item => !item.hidden);
  limit += 6;
  renderNews();
  const firstNewItem = items.find(item => !item.hidden && !previouslyVisible.includes(item));
  if (firstNewItem) firstNewItem.querySelector("summary").focus();
});
function openLinkedDetails() {
  const target = document.getElementById(location.hash.slice(1));
  if (target && target.tagName === "DETAILS") target.open = true;
}
window.addEventListener("hashchange", openLinkedDetails);
openLinkedDetails();
renderNews();
document.querySelectorAll("[data-js]").forEach(element => { element.hidden = false; });

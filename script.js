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

// 新着情報一覧だけで検索を実行します。トップのフォームは一覧へ移動します。
const searchInput = document.getElementById("search-input");
const resultStatus = document.getElementById("result-status");
if (searchInput && resultStatus) {
  const items = [...document.querySelectorAll("#news-list > li")];
  const normalize = value => value.normalize("NFKC").toLocaleLowerCase("ja").trim();
  const readQuery = () => {
    searchInput.value = new URLSearchParams(location.search).get("q") || "";
  };
  function renderNews() {
    const words = normalize(searchInput.value).split(/\s+/).filter(Boolean);
    let count = 0;
    items.forEach(item => {
      const title = normalize(item.querySelector(".news-title").textContent);
      item.hidden = !words.every(word => title.includes(word));
      if (!item.hidden) count++;
    });
    resultStatus.textContent = count + "件のお知らせ" + (searchInput.value.trim() ? "（検索：" + searchInput.value.trim() + "）" : "");
    document.getElementById("empty-message").hidden = count !== 0;
  }
  function saveQuery() {
    const url = new URL(location.href);
    if (searchInput.value.trim()) url.searchParams.set("q", searchInput.value.trim());
    else url.searchParams.delete("q");
    try { history.replaceState(null, "", url); } catch { /* ローカル表示でも検索を利用できます。 */ }
  }
  readQuery();
  renderNews();
  searchInput.addEventListener("input", () => { renderNews(); saveQuery(); });
  document.getElementById("search-form").addEventListener("submit", event => {
    event.preventDefault();
    renderNews();
    saveQuery();
    document.getElementById("news-heading").focus();
  });
  document.getElementById("reset-filter").addEventListener("click", () => {
    searchInput.value = "";
    renderNews();
    saveQuery();
    searchInput.focus();
  });
  window.addEventListener("popstate", () => { readQuery(); renderNews(); });
}
function openLinkedDetails() {
  const target = document.getElementById(location.hash.slice(1));
  if (target && target.tagName === "DETAILS") target.open = true;
}
window.addEventListener("hashchange", openLinkedDetails);
openLinkedDetails();
document.querySelectorAll("[data-js]").forEach(element => { element.hidden = false; });

import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------- 문구 ---------- */
const T = {
  ko: {
    title: "식당 재고 관리", today: "오늘", searchPh: "상품명 검색", lockedNote: "🔒 저장된 기록은 잠김", add: "＋ 새 기록",
    addTitle: "새 기록", editTitle: "기록 수정", saveHint: "저장하면 잠기고, 고치려면 관리자 비밀번호가 필요해요.",
    editHint: "상품명을 고치면 이 상품의 모든 기록에 반영돼요.",
    nameKo: "상품명 (한국어)", nameVi: "상품명 (베트남어) · 자동 번역, 직접 고칠 수 있어요",
    date: "날짜", qty: "수량", in: "입고", out: "출고", stock: "재고", formula: "수량 + 입고 − 출고", note: "비고",
    cancel: "취소", save: "저장", confirm: "확인", edit: "수정", del: "삭제", delQ: "이 기록을 삭제할까요?",
    count: n => `${n}건`, empty: "이 날짜에 기록이 없어요. 아래 ＋ 새 기록으로 추가하세요.", noMatch: "검색 결과가 없어요.",
    edited: "수정됨", needName: "상품명을 입력하세요.", needNum: "수량·입고·출고 중 하나 이상 입력하세요.", neg: "숫자는 0 이상이어야 해요.",
    saved: "저장됨", updated: "수정됨", deleted: "삭제됨",
    translating: "번역 중…", transFail: "자동 번역이 안 됐어요. 직접 입력해 주세요.", transDone: "자동 번역됨 — 틀리면 고쳐 주세요.", known: "등록된 상품이에요.",
    pwEnterTitle: "비밀번호 입력", pwEnterHint: "저장된 기록을 고치거나 지우려면 관리자 또는 서버 비밀번호가 필요해요.", pw: "비밀번호",
    pwSetupTitle: "비밀번호 2개 만들기", pwSetupHint: "기록을 고치거나 지울 때 둘 중 아무거나 쓸 수 있어요. 하나를 잊어도 다른 하나로 바꿀 수 있습니다. (각 4자 이상)",
    pwChange: "비밀번호 변경", pwChangeHint: "바꿀 비밀번호를 고르고, 현재 비밀번호(둘 중 아무거나)를 입력하세요.",
    pwAdmin: "관리자 비밀번호", pwServer: "서버 비밀번호", pwEither: "관리자 또는 서버 비밀번호", pwCurEither: "현재 비밀번호 (둘 중 아무거나)",
    pwNewAdmin: "새 관리자 비밀번호", pwNewServer: "새 서버 비밀번호", pwSame: "두 비밀번호를 서로 다르게 정하세요.",
    pwCur: "현재 비밀번호", pwNew: "새 비밀번호", pwWrong: "비밀번호가 틀렸어요.", pwShort: "4자 이상 입력하세요.", pwSet: "비밀번호를 저장했어요.",
    needSetup: "비밀번호가 아직 없어요. 맨 아래 '비밀번호 변경'을 눌러 먼저 만드세요.",
    tooMany: "시도가 너무 많아요. 잠시 후 다시 시도하세요.",
    adminOn: "🔓 관리자 모드 — 수정·삭제 가능", adminOffBtn: "잠그기",
    connecting: "연결 중…", setup: "firebase-config.js 설정이 아직 안 됐어요. README의 설정 순서를 따라 주세요.",
    offline: "서버에 연결할 수 없어요. 인터넷 연결을 확인하세요.", denied: "권한이 없어 저장하지 못했어요.",
    fail: "저장하지 못했어요. 잠시 후 다시 시도하세요.", prevStock: v => `직전 재고 ${v} 자동 입력`
  },
  vi: {
    title: "Quản lý kho nhà hàng", today: "Hôm nay", searchPh: "Tìm tên hàng", lockedNote: "🔒 Mục đã lưu bị khóa", add: "＋ Thêm mục",
    addTitle: "Thêm mục mới", editTitle: "Sửa mục", saveHint: "Sau khi lưu sẽ bị khóa, muốn sửa phải nhập mật khẩu quản lý.",
    editHint: "Sửa tên hàng sẽ áp dụng cho mọi mục của hàng này.",
    nameKo: "Tên hàng (tiếng Hàn) · tự dịch, có thể sửa", nameVi: "Tên hàng (tiếng Việt)",
    date: "Ngày", qty: "Số lượng", in: "Nhập", out: "Xuất", stock: "Tồn kho", formula: "Số lượng + Nhập − Xuất", note: "Ghi chú",
    cancel: "Hủy", save: "Lưu", confirm: "Xác nhận", edit: "Sửa", del: "Xóa", delQ: "Xóa mục này?",
    count: n => `${n} mục`, empty: "Chưa có dữ liệu cho ngày này. Bấm ＋ Thêm mục bên dưới.", noMatch: "Không tìm thấy.",
    edited: "Đã sửa", needName: "Vui lòng nhập tên hàng.", needNum: "Nhập ít nhất một ô: số lượng, nhập hoặc xuất.", neg: "Số phải từ 0 trở lên.",
    saved: "Đã lưu", updated: "Đã sửa", deleted: "Đã xóa",
    translating: "Đang dịch…", transFail: "Không tự dịch được. Vui lòng nhập tay.", transDone: "Đã tự dịch — sai thì sửa lại nhé.", known: "Hàng đã có sẵn.",
    pwEnterTitle: "Nhập mật khẩu", pwEnterHint: "Cần mật khẩu quản lý hoặc máy chủ để sửa hoặc xóa mục đã lưu.", pw: "Mật khẩu",
    pwSetupTitle: "Tạo 2 mật khẩu", pwSetupHint: "Dùng mật khẩu nào cũng được để sửa/xóa mục. Quên một cái vẫn đổi được bằng cái còn lại. (mỗi cái ít nhất 4 ký tự)",
    pwChange: "Đổi mật khẩu", pwChangeHint: "Chọn mật khẩu cần đổi, rồi nhập mật khẩu hiện tại (cái nào cũng được).",
    pwAdmin: "MK quản lý", pwServer: "MK máy chủ", pwEither: "Mật khẩu quản lý hoặc máy chủ", pwCurEither: "Mật khẩu hiện tại (cái nào cũng được)",
    pwNewAdmin: "Mật khẩu quản lý mới", pwNewServer: "Mật khẩu máy chủ mới", pwSame: "Hai mật khẩu phải khác nhau.",
    pwCur: "Mật khẩu hiện tại", pwNew: "Mật khẩu mới", pwWrong: "Sai mật khẩu.", pwShort: "Nhập ít nhất 4 ký tự.", pwSet: "Đã lưu mật khẩu.",
    needSetup: "Chưa có mật khẩu. Bấm 'Đổi mật khẩu' ở dưới cùng để tạo trước.",
    tooMany: "Thử quá nhiều lần. Vui lòng đợi một lát.",
    adminOn: "🔓 Chế độ quản lý — có thể sửa/xóa", adminOffBtn: "Khóa lại",
    connecting: "Đang kết nối…", setup: "Chưa cấu hình firebase-config.js. Xem hướng dẫn trong README.",
    offline: "Không kết nối được máy chủ. Kiểm tra mạng.", denied: "Không có quyền nên không lưu được.",
    fail: "Không lưu được. Vui lòng thử lại sau.", prevStock: v => `Tự điền tồn kho trước: ${v}`
  }
};

let lang = "ko";
try { const s = localStorage.getItem("inv-lang"); if (s === "vi" || s === "ko") lang = s; } catch (e) {}
const t = k => T[lang][k];
const other = l => (l === "ko" ? "vi" : "ko");
const $ = id => document.getElementById(id);

/* ---------- 유틸 ---------- */
const pad = n => String(n).padStart(2, "0");
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => fmtDate(new Date());
const shift = (s, n) => { const [y, m, d] = s.split("-").map(Number); return fmtDate(new Date(y, m - 1, d + n)); };
const num = v => { const x = parseFloat(v); return isFinite(x) ? x : 0; };
const show = v => (Math.round(v * 100) / 100).toLocaleString();
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = s => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
const isKorean = s => /[\uAC00-\uD7A3\u3131-\u318E]/.test(s);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------- 번역 ---------- */
const transCache = new Map();
async function translate(text, from, to) {
  const key = `${from}>${to}:${norm(text)}`;
  if (transCache.has(key)) return transCache.get(key);
  let out = null;
  try {
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
    if (r.ok) { const j = await r.json(); out = (j[0] || []).map(x => x[0]).join("").trim() || null; }
  } catch (e) {}
  if (!out) {
    try {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
      const j = await r.json();
      if (j.responseStatus === 200 && j.responseData && j.responseData.translatedText) out = j.responseData.translatedText.trim();
    } catch (e) {}
  }
  if (out) transCache.set(key, out);
  return out;
}

/* ---------- 상태 ---------- */
const configured = firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith("여기에");
let db = null, ready = false, isAdmin = false, locks = { admin: null, server: null }, lockLoaded = false;
const hasLock = () => !!(locks.admin || locks.server);
let entries = {};      // 선택 날짜의 기록
let recent = {};       // 최근 기록 (직전 재고 계산용)
let products = {};     // 상품 사전 {pid: {ko, vi}}
let viewDate = todayStr(); $("viewDate").value = viewDate;
let statusKey = configured ? "connecting" : "setup";

function nameOf(e, l = lang) {
  const p = products[e.pid];
  return (p && p[l]) || e[l] || (p && p[other(l)]) || e[other(l)] || "";
}
function findProduct(text) {
  const n = norm(text); if (!n) return null;
  for (const pid in products) { const p = products[pid]; if (norm(p.ko) === n || norm(p.vi) === n) return pid; }
  return null;
}
const stockOf = e => num(e.qty) + num(e.inn) - num(e.out);
function prevStock(pid, date) {
  if (!pid) return null;
  const all = { ...recent, ...entries };
  const c = Object.entries(all).map(([id, e]) => ({ ...e, id }))
    .filter(e => e.pid === pid && e.date <= date)
    .sort((a, b) => a.date === b.date ? (a.createdAt || 0) - (b.createdAt || 0) : a.date < b.date ? -1 : 1);
  return c.length ? stockOf(c[c.length - 1]) : null;
}

/* ---------- 화면 ---------- */
function applyLang() {
  document.documentElement.lang = lang;
  document.title = t("title");
  $("lang-ko").setAttribute("aria-pressed", lang === "ko");
  $("lang-vi").setAttribute("aria-pressed", lang === "vi");
  document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll("[data-tp]").forEach(el => { el.placeholder = t(el.dataset.tp); });
  render(); updateStatus();
}
function setLang(l) { lang = l; try { localStorage.setItem("inv-lang", l); } catch (e) {} applyLang(); }
$("lang-ko").onclick = () => setLang("ko");
$("lang-vi").onclick = () => setLang("vi");

function updateStatus() {
  const el = $("status");
  const key = statusKey === "ok" && lockLoaded && !hasLock() ? "needSetup" : statusKey;
  el.textContent = key === "ok" ? "" : t(key);
  el.className = "status" + (key === "ok" || key === "connecting" ? "" : " warn");
  $("adminBar").classList.toggle("on", isAdmin);
  $("addBtn").disabled = !ready;
}
function toast(msg) { const el = $("toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 2000); }

function render() {
  const q = norm($("search").value);
  const list = Object.entries(entries).map(([id, e]) => ({ ...e, id }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .filter(e => !q || norm(nameOf(e, "ko")).includes(q) || norm(nameOf(e, "vi")).includes(q));
  $("count").textContent = t("count")(list.length);
  $("list").innerHTML = !list.length
    ? `<div class="empty">${esc(q ? t("noMatch") : t("empty"))}</div>`
    : list.map(e => {
        const tm = e.createdAt ? new Date(e.createdAt) : null;
        const main = nameOf(e, lang), sub = nameOf(e, other(lang));
        return `<article class="ticket">
          <div class="t-top"><div class="t-name">${esc(main)}${sub && norm(sub) !== norm(main) ? `<div class="t-sub">${esc(sub)}</div>` : ""}</div>
            <div class="t-stock"><b>${show(stockOf(e))}</b><span>${esc(t("stock"))}</span></div></div>
          <div class="t-flow"><span class="chip">${esc(t("qty"))} ${show(num(e.qty))}</span>
            <span class="chip in">${esc(t("in"))} +${show(num(e.inn))}</span>
            <span class="chip out">${esc(t("out"))} −${show(num(e.out))}</span></div>
          ${e.note ? `<div class="t-note">${esc(e.note)}</div>` : ""}
          <div class="t-foot"><span class="lockbadge">🔒 ${tm ? pad(tm.getHours()) + ":" + pad(tm.getMinutes()) : ""}</span>
            ${e.edited ? `<span class="edited">${esc(t("edited"))}</span>` : ""}<span class="spacer"></span>
            <button data-edit="${esc(e.id)}">${esc(t("edit"))}</button>
            <button class="del" data-del="${esc(e.id)}">${esc(t("del"))}</button></div>
        </article>`;
      }).join("");
}
function fillDatalists(mainLang) {
  const names = l => [...new Set(Object.values(products).map(p => (p[l] || "").trim()).filter(Boolean))].sort();
  $("namesMain").innerHTML = names(mainLang).map(n => `<option value="${esc(n)}">`).join("");
  $("namesSub").innerHTML = names(other(mainLang)).map(n => `<option value="${esc(n)}">`).join("");
}
$("search").oninput = render;
function goDate(d) { viewDate = d; $("viewDate").value = d; subscribeDate(); }
$("viewDate").onchange = e => { if (e.target.value) goDate(e.target.value); };
$("prev").onclick = () => goDate(shift(viewDate, -1));
$("next").onclick = () => goDate(shift(viewDate, 1));
$("todayBtn").onclick = () => goDate(todayStr());

/* ---------- 오류 ---------- */
function errMsg(e) {
  const c = e && e.code || "";
  if (c.includes("permission-denied")) return t("denied");
  if (c.includes("unavailable")) return t("offline");
  return t("fail");
}

/* ---------- 관리자 비밀번호 ---------- */
async function hash(p) {
  const input = "inv-lock::" + p;
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
  } catch (e) { let h = 2166136261; for (const c of input) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return "f" + h.toString(16); }
}
let pwResolve = null, pwMode = "enter", pwWhich = "admin";
function setWhich(w) {
  pwWhich = w;
  $("whichAdmin").setAttribute("aria-pressed", w === "admin");
  $("whichServer").setAttribute("aria-pressed", w === "server");
  if (pwMode === "change") $("pwNewLabel").textContent = t(w === "admin" ? "pwNewAdmin" : "pwNewServer");
  $("pwErr").textContent = "";
}
$("whichAdmin").onclick = () => setWhich("admin");
$("whichServer").onclick = () => setWhich("server");
function askPassword(mode) {
  pwMode = mode;
  ["pwCur", "pwNew", "pwNew2"].forEach(id => ($(id).value = ""));
  $("pwErr").textContent = "";
  const setup = mode === "setup", change = mode === "change";
  $("pwTitle").textContent = t(setup ? "pwSetupTitle" : change ? "pwChange" : "pwEnterTitle");
  $("pwHint").textContent = t(setup ? "pwSetupHint" : change ? "pwChangeHint" : "pwEnterHint");
  $("pwWhich").style.display = change ? "flex" : "none";
  $("pwCurWrap").style.display = setup ? "none" : "block";
  $("pwCurLabel").textContent = t(change ? "pwCurEither" : "pwEither");
  $("pwNewWrap").style.display = setup || change ? "block" : "none";
  $("pwNew2Wrap").style.display = setup ? "block" : "none";
  $("pwNewLabel").textContent = t(setup ? "pwAdmin" : "pwNewAdmin");
  $("pwNew2Label").textContent = t("pwServer");
  if (change) setWhich("admin");
  $("pwOv").classList.add("open");
  setTimeout(() => (setup ? $("pwNew") : $("pwCur")).focus(), 50);
  return new Promise(r => (pwResolve = r));
}
function closePw(v) { $("pwOv").classList.remove("open"); const r = pwResolve; pwResolve = null; r && r(v); }
$("pwCancel").onclick = () => closePw(false);
async function checkEither(p) { const h = await hash(p); return !!p && (h === locks.admin || h === locks.server); }
$("pwOk").onclick = async () => {
  const cur = $("pwCur").value, nw = $("pwNew").value, nw2 = $("pwNew2").value;
  if (pwMode !== "setup" && !(await checkEither(cur))) { $("pwErr").textContent = t("pwWrong"); return; }
  if (pwMode === "enter") { isAdmin = true; bumpIdle(); updateStatus(); return closePw(true); }
  let data;
  if (pwMode === "setup") {
    if (nw.length < 4 || nw2.length < 4) { $("pwErr").textContent = t("pwShort"); return; }
    if (nw === nw2) { $("pwErr").textContent = t("pwSame"); return; }
    data = { admin: await hash(nw), server: await hash(nw2) };
  } else {
    if (nw.length < 4) { $("pwErr").textContent = t("pwShort"); return; }
    const h = await hash(nw);
    const otherHash = pwWhich === "admin" ? locks.server : locks.admin;
    if (h === otherHash) { $("pwErr").textContent = t("pwSame"); return; }
    data = { admin: locks.admin, server: locks.server, [pwWhich]: h };
  }
  $("pwOk").disabled = true;
  try {
    await setDoc(doc(db, "settings", "lock"), { admin: data.admin, server: data.server, updatedAt: Date.now() });
    locks = { admin: data.admin, server: data.server };
    toast(t("pwSet")); updateStatus(); closePw(pwMode === "setup");
  } catch (e) { $("pwErr").textContent = errMsg(e); }
  finally { $("pwOk").disabled = false; }
};
$("pwCur").onkeydown = $("pwNew").onkeydown = $("pwNew2").onkeydown = e => { if (e.key === "Enter") $("pwOk").click(); };
async function requireAdmin() {
  if (isAdmin) return true;
  if (!hasLock()) { if (!(await askPassword("setup"))) return false; isAdmin = true; updateStatus(); return true; }
  return askPassword("enter");
}
function lockAdmin() { isAdmin = false; clearTimeout(idleTimer); updateStatus(); }
$("adminOff").onclick = lockAdmin;
$("settingsBtn").onclick = () => { if (ready) askPassword(hasLock() ? "change" : "setup"); };

/* 관리자 모드는 5분간 아무것도 안 하면 자동으로 잠김 */
let idleTimer = null;
function bumpIdle() { clearTimeout(idleTimer); if (isAdmin) idleTimer = setTimeout(lockAdmin, 5 * 60 * 1000); }
["click", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, bumpIdle, { passive: true }));

/* ---------- 입력 시트 ---------- */
let editing = null, autoQty = false, pickedPid = null, mainLang = "ko", transSeq = 0;
function setTransNote(key, busy) { const el = $("transNote"); el.textContent = key ? t(key) : ""; el.classList.toggle("busy", !!busy); }
function openEntry(item) {
  editing = item || null;
  mainLang = lang;
  $("entryTitle").textContent = t(item ? "editTitle" : "addTitle");
  $("entryHint").textContent = t(item ? "editHint" : "saveHint");
  $("nameMainLabel").textContent = t(mainLang === "ko" ? "nameKo" : "nameVi").split(" · ")[0];
  $("nameSubLabel").textContent = t(mainLang === "ko" ? "nameVi" : "nameKo");
  $("entryErr").textContent = ""; setTransNote(null);
  pickedPid = item ? item.pid : null;
  $("fNameMain").value = item ? nameOf(item, mainLang) : "";
  $("fNameSub").value = item ? nameOf(item, other(mainLang)) : "";
  $("fDate").value = item ? item.date : viewDate;
  $("fQty").value = item ? item.qty : ""; $("fIn").value = item ? item.inn : ""; $("fOut").value = item ? item.out : "";
  $("fNote").value = item ? (item.note || "") : "";
  autoQty = false; calc(); fillDatalists(mainLang);
  $("entryOv").classList.add("open");
  setTimeout(() => $("fNameMain").focus(), 50);
}
function calc() { $("fStock").textContent = show(num($("fQty").value) + num($("fIn").value) - num($("fOut").value)); }
["fQty", "fIn", "fOut"].forEach(id => $(id).addEventListener("input", () => { if (id === "fQty") autoQty = false; calc(); }));

function tryAutoQty() {
  if (editing) return;
  if ($("fQty").value !== "" && !autoQty) return;
  const p = prevStock(pickedPid, $("fDate").value);
  if (p !== null) { $("fQty").value = p; autoQty = true; toast(t("prevStock")(show(p))); }
  else if (autoQty) { $("fQty").value = ""; autoQty = false; }
  calc();
}
/* 한쪽 이름을 입력하면: 등록된 상품이면 반대쪽을 채우고, 아니면 자동 번역 */
async function onNameEntered(which) {
  const srcEl = which === "main" ? $("fNameMain") : $("fNameSub");
  const dstEl = which === "main" ? $("fNameSub") : $("fNameMain");
  const text = srcEl.value.trim();
  if (!text) return;
  const pid = findProduct(text);
  if (pid) {
    const p = products[pid];
    const srcLang = norm(p.ko) === norm(text) ? "ko" : "vi";
    dstEl.value = p[other(srcLang)] || dstEl.value;
    if (editing && pid !== editing.pid) { /* 수정 중엔 다른 상품으로 바꾸지 않음 */ }
    else { pickedPid = pid; setTransNote("known"); tryAutoQty(); }
    return;
  }
  if (!editing) pickedPid = null;
  if (dstEl.value.trim() && dstEl.dataset.auto !== "1") return; // 직접 쓴 번역은 덮어쓰지 않음
  const from = isKorean(text) ? "ko" : "vi";
  const seq = ++transSeq;
  setTransNote("translating", true);
  const res = await translate(text, from, other(from));
  if (seq !== transSeq) return;
  if (res) { dstEl.value = res; dstEl.dataset.auto = "1"; setTransNote("transDone"); }
  else setTransNote("transFail");
}
$("fNameMain").addEventListener("change", () => onNameEntered("main"));
$("fNameSub").addEventListener("change", () => onNameEntered("sub"));
$("fNameSub").addEventListener("input", () => { $("fNameSub").dataset.auto = "0"; });
$("fNameMain").addEventListener("input", () => { $("fNameMain").dataset.auto = "0"; });
$("fDate").addEventListener("change", tryAutoQty);
$("entryCancel").onclick = () => { $("entryOv").classList.remove("open"); };
$("addBtn").onclick = () => openEntry(null);

$("entrySave").onclick = async () => {
  let mainV = $("fNameMain").value.trim(), subV = $("fNameSub").value.trim();
  if (!mainV && !subV) { $("entryErr").textContent = t("needName"); return; }
  const vals = ["fQty", "fIn", "fOut"].map(id => $(id).value);
  if (vals.every(v => v === "")) { $("entryErr").textContent = t("needNum"); return; }
  if (vals.some(v => v !== "" && num(v) < 0)) { $("entryErr").textContent = t("neg"); return; }
  const btn = $("entrySave"); btn.disabled = true;
  try {
    // 번역이 비어 있으면 저장 직전에 한 번 더 시도
    if (!subV || !mainV) {
      const src = mainV || subV, from = isKorean(src) ? "ko" : "vi";
      const res = await translate(src, from, other(from));
      if (!mainV) mainV = res || subV; else subV = res || mainV;
    }
    const names = mainLang === "ko" ? { ko: mainV, vi: subV } : { ko: subV, vi: mainV };
    const [qty, inn, out] = vals.map(num);
    const date = $("fDate").value || viewDate;
    const note = $("fNote").value.trim().slice(0, 300);

    let pid = editing ? editing.pid : (pickedPid || findProduct(names.ko) || findProduct(names.vi));
    if (!pid) {
      pid = newId();
      await setDoc(doc(db, "products", pid), { ko: names.ko, vi: names.vi, createdAt: Date.now() });
    }

    if (editing) {
      const p = products[pid];
      if (p && (p.ko !== names.ko || p.vi !== names.vi)) await updateDoc(doc(db, "products", pid), names);
      await updateDoc(doc(db, "entries", editing.id), { ...names, pid, date, qty, inn, out, note, edited: true, editedAt: Date.now() });
      toast(t("updated"));
    } else {
      await setDoc(doc(db, "entries", newId()), { ...names, pid, date, qty, inn, out, note, edited: false, createdAt: Date.now() });
      toast(t("saved"));
    }
    $("entryOv").classList.remove("open");
    if (editing) lockAdmin();
    if (date !== viewDate) goDate(date);
  } catch (e) { $("entryErr").textContent = errMsg(e); }
  finally { btn.disabled = false; }
};

/* ---------- 수정/삭제 ---------- */
let pendingDel = null;
$("list").onclick = async ev => {
  const b = ev.target.closest("button"); if (!b || !ready) return;
  const id = b.dataset.edit || b.dataset.del; const e = entries[id]; if (!e) return;
  if (!(await requireAdmin())) return;
  if (b.dataset.edit) openEntry({ ...e, id });
  else { pendingDel = id; $("delName").textContent = nameOf(e); $("delOv").classList.add("open"); }
};
$("delCancel").onclick = () => { $("delOv").classList.remove("open"); pendingDel = null; };
$("delOk").onclick = async () => {
  if (!pendingDel) return;
  try { await deleteDoc(doc(db, "entries", pendingDel)); toast(t("deleted")); lockAdmin(); }
  catch (e) { toast(errMsg(e)); }
  $("delOv").classList.remove("open"); pendingDel = null;
};
document.querySelectorAll(".overlay").forEach(ov => ov.addEventListener("click", e => {
  if (e.target !== ov) return;
  if (ov.id === "pwOv") closePw(false); else ov.classList.remove("open");
}));

/* ---------- 실시간 구독 ---------- */
let unsubDate = null, unsubRecent = null, unsubProducts = null;
function subscribeDate() {
  render();
  if (!ready) return;
  if (unsubDate) unsubDate();
  entries = {}; render();
  unsubDate = onSnapshot(query(collection(db, "entries"), where("date", "==", viewDate)), snap => {
    const next = {}; snap.forEach(d => { next[d.id] = d.data(); }); entries = next; render();
  }, e => { statusKey = "offline"; updateStatus(); });
}
function subscribeAll() {
  onSnapshot(doc(db, "settings", "lock"), s => {
    const d = s.exists() ? s.data() : {};
    locks = { admin: d.admin || d.hash || null, server: d.server || null }; lockLoaded = true; updateStatus();
  }, () => {});
  unsubProducts = onSnapshot(collection(db, "products"), snap => {
    const next = {}; snap.forEach(d => { next[d.id] = d.data(); }); products = next; render();
  }, () => {});
  // 직전 재고 자동 입력용: 최근 120일 기록
  unsubRecent = onSnapshot(query(collection(db, "entries"), where("date", ">=", shift(todayStr(), -120))), snap => {
    const next = {}; snap.forEach(d => { next[d.id] = d.data(); }); recent = next;
  }, () => {});
  subscribeDate();
}

/* ---------- 시작 ---------- */
applyLang();
if (configured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  ready = true; statusKey = "ok";
  subscribeAll();
  updateStatus();
}

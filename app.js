(() => {
"use strict";
const C = window.CONFIG, T = window.TOPICS;
const sb = (C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase) ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
const $ = s => document.querySelector(s), app = $("#app");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S = { user: null, profile: null, res: null, favs: new Set(), deferred: null };
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2800); };
const topic = id => T.find(t => t.id == id);
const opts = (arr, sel) => arr.map(v => `<option ${v === sel ? "selected" : ""}>${esc(v)}</option>`).join("");
const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

/* ---------- Dữ liệu ---------- */
async function loadApproved() {
  if (S.res) return S.res;
  if (!sb) return (S.res = DEMO_RESOURCES);
  const { data, error } = await sb.from("resources").select("*, profiles(full_name)").eq("status", "approved").order("created_at", { ascending: false });
  if (error) { toast("Không tải được học liệu: " + error.message); return []; }
  return (S.res = data.map(r => ({ ...r, author_name: r.profiles?.full_name || "Ẩn danh" })));
}
async function loadFavs() {
  if (!S.user) { S.favs = new Set(LS.get("favs", [])); return; }
  const { data } = await sb.from("favorites").select("resource_id"); S.favs = new Set((data || []).map(x => x.resource_id));
}
async function toggleFav(id) {
  if (sb && !S.user) return toast("Hãy đăng nhập để lưu yêu thích.") || (location.hash = "#/login");
  const on = !S.favs.has(id);
  if (on) S.favs.add(id); else S.favs.delete(id);
  if (!sb) LS.set("favs", [...S.favs]);
  else if (on) await sb.from("favorites").insert({ user_id: S.user.id, resource_id: id });
  else await sb.from("favorites").delete().match({ user_id: S.user.id, resource_id: id });
  toast(on ? "Đã lưu vào yêu thích" : "Đã bỏ khỏi yêu thích"); route();
}

/* ---------- Thành phần giao diện ---------- */
function header() {
  const p = location.hash.split("/")[1] || "";
  const link = (h, t) => `<a href="#/${h}" class="${p === h ? "on" : ""}">${t}</a>`;
  const adm = S.profile?.role === "admin";
  $("#top").innerHTML = `<div class="wrap"><a class="brand" href="#/"><img src="icons/icon.svg" alt="">Lời Hay Ý Đúng</a>
  <button class="menu-btn" aria-label="Mở menu" aria-expanded="false" id="mbtn">☰</button>
  <nav class="nav" id="nav">${link("", "Trang chủ")}${link("library", "Kho học liệu")}${link("topics", "Chủ đề giao tiếp")}${link("practice", "Góc thực hành")}${link("community", "Cộng đồng chia sẻ")}${link("about", "Giới thiệu")}
  ${adm ? link("admin", "Quản trị") : ""}
  ${sb && S.user ? link("dashboard", "Tài khoản") + `<button data-act="logout">Đăng xuất</button>` : sb ? `<a href="#/login">Đăng nhập</a><a href="#/register">Đăng ký</a>` : ""}
  <button class="cta" data-act="install">Cài ứng dụng</button></nav></div>`;
  const tab = (h, i, t) => `<a href="#/${h}" class="${p === h ? "on" : ""}"><span>${i}</span>${t}</a>`;
  $("#tabbar").innerHTML = tab("", "🏠", "Trang chủ") + tab("library", "📚", "Học liệu") + tab("practice", "🎯", "Thực hành") + tab("favorites", "⭐", "Yêu thích") + tab(S.user ? "dashboard" : "login", "👤", "Tài khoản");
}
function footer() {
  $("#foot").innerHTML = `<div class="wrap"><div class="cols">
  <div><h3>Lời Hay Ý Đúng</h3><p>Nói lời hay – Chọn ý đúng – Kết nối yêu thương!</p></div>
  <div><h3>Chức năng</h3><ul><li><a href="#/library">Kho học liệu</a></li><li><a href="#/topics">Chủ đề giao tiếp</a></li><li><a href="#/practice">Góc thực hành</a></li><li><a href="#/community">Cộng đồng chia sẻ</a></li></ul></div>
  <div><h3>Thông tin</h3><ul><li><a href="#/about">Giới thiệu và hướng dẫn sử dụng</a></li><li><a href="#/about">Chính sách quyền riêng tư</a></li><li><a href="#/about">Quy định chia sẻ và bản quyền học liệu</a></li></ul></div></div></div>`;
}
const typeOf = r => TYPES[r.type] || ["Học liệu", "📄"];
function card(r) {
  const [tn, ti] = typeOf(r), fav = S.favs.has(r.id);
  return `<article class="card"><div class="thumb" aria-hidden="true">${r.thumbnail_url ? `<img src="${esc(r.thumbnail_url)}" alt="" style="height:100%;max-width:100%;border-radius:12px">` : ti}</div>
  <div class="tags"><span class="tag">${esc(tn)}</span><span class="tag o">${esc(r.subject || "")}</span></div>
  <h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>
  <div class="meta"><span>Chủ đề ${r.topic_id}: ${esc(topic(r.topic_id)?.name || "")}</span></div>
  <div class="meta"><span>✍️ ${esc(r.author_name)}</span><span>👁 ${r.views || 0}</span><span>⬇ ${r.downloads || 0}</span></div>
  <div class="tags"><a class="btn sm" href="#/resource/${r.id}">Xem chi tiết</a><button class="btn sm ghost" data-fav="${r.id}" aria-pressed="${fav}">${fav ? "★ Đã lưu" : "☆ Lưu yêu thích"}</button></div></article>`;
}
const needSb = () => sb ? "" : `<div class="notice"><b>Chế độ demo.</b> Chưa cấu hình Supabase nên đang hiển thị dữ liệu mẫu; đăng nhập, đăng tải và kiểm duyệt bị tắt. Xem README để kết nối.</div>`;

/* ---------- Các trang ---------- */
const V = {};
V.home = async () => {
  const res = (await loadApproved()).slice(0, 6);
  return `<section class="hero"><div class="wrap"><div><p class="slogan">Nói lời hay – Chọn ý đúng – Kết nối yêu thương!</p><h1>Lời Hay Ý Đúng</h1>
  <p>Giao tiếp không chỉ là nói những lời hay mà còn là biết lắng nghe, thấu hiểu và lựa chọn cách ứng xử phù hợp. Hãy cùng Lời Hay Ý Đúng khám phá những tình huống thú vị, luyện tập cách giao tiếp và kết nối yêu thương mỗi ngày!</p>
  <div class="tags"><a class="btn alt" href="#/library">Khám phá học liệu</a><a class="btn ghost" href="#/practice">Bắt đầu luyện tập</a></div></div>
  <div class="bubbles" aria-hidden="true"><div class="bubble">Mình không muốn chơi cùng cậu hôm nay.<small>Bạn Nam</small></div><div class="bubble r">Không sao, hôm khác mình chơi nhé! 💛<small>Lời hay của em</small></div></div></div></section>
  <section class="band"><div class="wrap">${needSb()}<h2>7 chủ đề giao tiếp</h2><div class="grid">${T.map(t => `<a class="card topic" href="#/topic/${t.id}"><div class="ic">${t.icon}</div><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="meta"><span>${(S.res || []).filter(r => r.topic_id == t.id).length} học liệu</span></div><span class="btn sm">Khám phá</span></a>`).join("")}</div></div></section>
  <section class="band"><div class="wrap"><h2>Học liệu nổi bật</h2><div class="grid">${res.map(card).join("") || "<p>Chưa có học liệu được phê duyệt.</p>"}</div></div></section>
  <section class="band"><div class="wrap"><h2>Bắt đầu chỉ với ba bước</h2><div class="steps"><div class="card"><h3>Khám phá và tìm kiếm</h3><p>Tìm theo từ khóa, chủ đề, môn học hoặc dạng học liệu.</p></div><div class="card"><h3>Chọn tài nguyên phù hợp</h3><p>Xem trước, đọc hướng dẫn tổ chức hoạt động.</p></div><div class="card"><h3>Thực hành hoặc dạy học</h3><p>Dùng trong lớp hoặc cho học sinh tự luyện ở Góc thực hành.</p></div></div></div></section>`;
};
V.library = async (q) => {
  const all = await loadApproved(), P = new URLSearchParams(q || "");
  const f = k => P.get(k) || "";
  return `<section class="band"><div class="wrap"><h1>Kho học liệu</h1>${needSb()}
  <div class="filters" id="flt"><label class="f">Tìm kiếm<input id="q" type="search" placeholder="Tên, từ khóa, tình huống…" value="${esc(f("q"))}"></label>
  <label class="f">Môn học<select data-f="subject"><option value="">Tất cả</option>${opts(SUBJECTS, f("subject"))}</select></label>
  <label class="f">Chủ đề<select data-f="topic"><option value="">Tất cả</option>${T.map(t => `<option value="${t.id}" ${f("topic") == t.id ? "selected" : ""}>${t.id}. ${esc(t.name)}</option>`).join("")}</select></label>
  <label class="f">Dạng học liệu<select data-f="type"><option value="">Tất cả</option>${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${f("type") === k ? "selected" : ""}>${v[0]}</option>`).join("")}</select></label>
  <label class="f">Mục đích<select data-f="purpose"><option value="">Tất cả</option>${opts(PURPOSES, f("purpose"))}</select></label>
  <label class="f">Đối tượng<select data-f="audience"><option value="">Tất cả</option>${opts(AUDIENCES, f("audience"))}</select></label>
  <label class="f">Mức độ<select data-f="level"><option value="">Tất cả</option>${opts(LEVELS, f("level"))}</select></label></div>
  <div class="grid" id="list"></div></div></section>`;
};
function filterList() {
  const g = k => (document.querySelector(`[data-f=${k}]`) || {}).value || "";
  const q = ($("#q")?.value || "").trim().toLowerCase();
  const norm = s => String(s || "").toLowerCase();
  const out = (S.res || []).filter(r => (!q || norm(r.title + " " + r.description + " " + (topic(r.topic_id)?.name || "")).includes(q)) &&
    ["subject", "type", "purpose", "audience", "level"].every(k => !g(k) || r[k] === g(k)) && (!g("topic") || r.topic_id == g("topic")));
  $("#list").innerHTML = out.map(card).join("") || `<p>Không có học liệu phù hợp. Hãy thử bỏ bớt bộ lọc.</p>`;
}
V.resource = async (id) => {
  await loadApproved();
  let r = (S.res || []).find(x => x.id === id);
  if (!r && sb) { const { data } = await sb.from("resources").select("*, profiles(full_name)").eq("id", id).maybeSingle(); if (data) r = { ...data, author_name: data.profiles?.full_name }; }
  if (!r) return `<section class="band"><div class="wrap"><h1>Không tìm thấy học liệu</h1><a class="btn" href="#/library">Về kho học liệu</a></div></section>`;
  if (sb && r.status === "approved") sb.rpc("increment_view", { p_id: id });
  const [tn, ti] = typeOf(r); let files = [];
  if (sb) { const { data } = await sb.from("resource_files").select("*").eq("resource_id", id); files = data || []; }
  const dl = r.allow_download && (files.length || r.external_url);
  return `<section class="band"><div class="wrap"><p class="crumb"><a href="#/library">Kho học liệu</a> / ${esc(r.title)}</p>
  <div class="two"><div class="panel"><div class="tags"><span class="tag">${ti} ${esc(tn)}</span><span class="tag o">${esc(r.subject)}</span><span class="tag g">${esc(r.level || "")}</span>${r.status && r.status !== "approved" ? `<span class="tag y">${STATUS[r.status]?.[0]}</span>` : ""}</div>
  <h1>${esc(r.title)}</h1><p>${esc(r.description)}</p>
  <h3>Mục đích và đối tượng</h3><p>${esc(r.purpose || "–")} · dành cho ${esc(r.audience || "–")}</p>
  <h3>Hướng dẫn tổ chức hoạt động</h3><p>${esc(r.usage_guide || "Chưa có hướng dẫn.")}</p>
  <h3>Nguồn và bản quyền</h3><p>Nguồn: ${esc(r.source || "–")}. Giấy phép: ${esc(r.license || "–")}.</p>
  ${r.review_note ? `<div class="fb">Góp ý của quản trị viên: ${esc(r.review_note)}</div>` : ""}</div>
  <aside class="panel"><p><b>Tác giả:</b> ${esc(r.author_name || "–")}</p><p class="meta"><span>👁 ${r.views || 0} lượt xem</span><span>⬇ ${r.downloads || 0} lượt tải</span></p>
  <div style="display:grid;gap:8px">
  ${r.external_url ? `<a class="btn" target="_blank" rel="noopener noreferrer" href="${esc(r.external_url)}">Xem trực tuyến</a>` : ""}
  ${files.map(f => `<button class="btn alt" ${r.allow_download ? "" : "disabled"} data-dl="${esc(f.path)}" data-rid="${r.id}">Tải: ${esc(f.name)}</button>`).join("")}
  ${!files.length && !r.external_url ? `<span class="tag">Chưa có tệp đính kèm</span>` : ""}${!dl && files.length ? `<small>Tác giả chưa cho phép tải xuống.</small>` : ""}
  <button class="btn ghost" data-fav="${r.id}">${S.favs.has(r.id) ? "★ Đã lưu" : "☆ Lưu yêu thích"}</button>
  <button class="btn ghost" data-share="${r.id}">Chia sẻ liên kết</button>
  <button class="btn ghost" data-report="${r.id}">Báo cáo học liệu</button></div></aside></div>
  <h2 style="margin-top:28px">Học liệu liên quan</h2><div class="grid">${(S.res || []).filter(x => x.id !== r.id && x.topic_id === r.topic_id).slice(0, 3).map(card).join("") || "<p>Chưa có học liệu liên quan.</p>"}</div></div></section>`;
};
V.topics = () => `<section class="band"><div class="wrap"><h1>Chủ đề giao tiếp</h1><div class="grid">${T.map(t => `<a class="card topic" href="#/topic/${t.id}"><div class="ic">${t.icon}</div><h3>Chủ đề ${t.id}: ${esc(t.name)}</h3><p>${esc(t.desc)}</p></a>`).join("")}</div></div></section>`;
V.topic = async (id) => {
  const t = topic(id); if (!t) return V.topics(); const res = (await loadApproved()).filter(r => r.topic_id == id);
  const li = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  return `<section class="band"><div class="wrap"><p class="crumb"><a href="#/topics">Chủ đề</a> / ${esc(t.name)}</p><h1>${t.icon} Chủ đề ${t.id}: ${esc(t.name)}</h1><p>${esc(t.desc)}</p>
  <div class="two"><div class="panel"><h3>Mục tiêu rèn luyện</h3><p>${esc(t.goal)}</p><h3>Biểu hiện giao tiếp cần hình thành</h3>${li(t.skills)}</div>
  <div class="panel"><h3>Tình huống thường gặp</h3>${li(t.situations)}<a class="btn alt" href="#/practice/${id}">Luyện tập ngay</a></div></div>
  <h2 style="margin-top:26px">Học liệu liên quan</h2><div class="grid">${res.map(card).join("") || "<p>Chưa có học liệu cho chủ đề này.</p>"}</div></div></section>`;
};
/* Góc thực hành */
const PS = { i: 0, score: 0, done: false, tab: "situ" };
V.practice = (arg) => {
  const tab = ["situ", "role", "self"].includes(arg) ? arg : "situ";
  const nav = `<div class="tabs"><a href="#/practice/situ" class="${tab === "situ" ? "on" : ""}">Tình huống giao tiếp</a><a href="#/practice/role" class="${tab === "role" ? "on" : ""}">Thử tài đóng vai</a><a href="#/practice/self" class="${tab === "self" ? "on" : ""}">Tự đánh giá</a></div>`;
  let body = "";
  if (tab === "situ") {
    if (PS.done) body = `<div class="panel"><h2>Hoàn thành! 🎉</h2><p>Em chọn cách ứng xử phù hợp ${PS.score}/${SCENARIOS.length} tình huống.</p><button class="btn" data-act="restart">Chơi lại</button></div>`;
    else { const s = SCENARIOS[PS.i]; body = `<div class="panel"><p class="meta">Tình huống ${PS.i + 1}/${SCENARIOS.length} · Chủ đề ${s.topic}</p><h2>${esc(s.q)}</h2><div id="opts">${s.opts.map((o, k) => `<button class="opt" data-opt="${k}">${esc(o[0])}</button>`).join("")}</div><div id="fb"></div></div>`; }
  } else if (tab === "role") {
    const c = ROLECARDS[PS.card ?? 0];
    body = `<div class="panel"><h2>${esc(c.title)}</h2><p><b>Bối cảnh:</b> ${esc(c.scene)}</p>${c.roles.map(r => `<div class="role">${esc(r)}</div>`).join("")}<p><b>Nhiệm vụ giao tiếp:</b> ${esc(c.task)}</p><p><b>Gợi ý lời thoại:</b> ${esc(c.hint)}</p><button class="btn alt" data-act="nextcard">Rút thẻ khác</button></div>`;
  } else {
    body = `<div class="panel"><h2>Phiếu tự đánh giá</h2><div id="sc">${SELFCHECK.map((q, i) => `<label class="f" style="margin:10px 0">${esc(q)}<select data-sc="${i}"><option value="">Chọn…</option><option value="2">Luôn luôn</option><option value="1">Thỉnh thoảng</option><option value="0">Chưa</option></select></label>`).join("")}</div><button class="btn" data-act="score">Xem kết quả</button><div id="scr"></div></div>`;
  }
  return `<section class="band"><div class="wrap"><h1>Góc thực hành</h1><p>Không cần đăng ký tài khoản: chọn một tình huống và thử ngay.</p>${nav}${body}</div></section>`;
};
V.favorites = async () => {
  await loadApproved(); await loadFavs();
  if (sb && !S.user) return V.login();
  return `<section class="band"><div class="wrap"><h1>Học liệu yêu thích</h1><div class="grid">${S.res.filter(r => S.favs.has(r.id)).map(card).join("") || "<p>Em chưa lưu học liệu nào. Hãy bấm “Lưu yêu thích” ở thẻ học liệu.</p>"}</div></div></section>`;
};
V.community = async () => {
  const all = await loadApproved(); const authors = [...new Set(all.map(r => r.author_name))];
  return `<section class="band"><div class="wrap"><h1>Cộng đồng chia sẻ</h1><p>Học liệu do giáo viên và sinh viên đóng góp, đã được quản trị viên phê duyệt.</p>${S.user ? `<a class="btn alt" href="#/dashboard/upload">Chia sẻ học liệu của bạn</a>` : sb ? `<a class="btn alt" href="#/login">Đăng nhập để chia sẻ</a>` : ""}
  <h2 style="margin-top:22px">Người đóng góp</h2><div class="tags">${authors.map(a => `<span class="tag">${esc(a)}</span>`).join("")}</div>
  <h2 style="margin-top:22px">Mới nhất</h2><div class="grid">${all.map(card).join("")}</div></div></section>`;
};
V.about = () => `<section class="band"><div class="wrap"><h1>Giới thiệu</h1><div class="panel"><p>Lời Hay Ý Đúng là nền tảng học liệu số hỗ trợ giáo viên, sinh viên ngành Giáo dục tiểu học và học sinh lớp 4 trong việc tìm kiếm, thiết kế, khai thác và thực hành các nội dung giáo dục kỹ năng giao tiếp.</p>
  <h3>Hai chức năng chính</h3><ul><li><b>Kho học liệu số:</b> phân loại theo chủ đề, môn học và hình thức.</li><li><b>Không gian thực hành giao tiếp:</b> học sinh luyện lời nói, thái độ và hành vi trong tình huống gần gũi.</li></ul>
  <h3>Nguyên tắc học liệu</h3><ul><li>Nội dung chính xác, phù hợp học sinh lớp 4.</li><li>Có hướng dẫn sử dụng và nguồn rõ ràng, không vi phạm bản quyền.</li><li>Chỉ học liệu đã được phê duyệt mới hiển thị công khai.</li></ul>
  <h3>Cài ứng dụng lên điện thoại</h3><p><b>Android (Chrome):</b> bấm “Cài ứng dụng” hoặc menu trình duyệt › Cài đặt ứng dụng.<br><b>iPhone (Safari):</b> nút Chia sẻ › Thêm vào màn hình chính › Thêm.</p>
  <h3>Quyền riêng tư và bản quyền</h3><p>Chúng tôi chỉ lưu thông tin cần cho tài khoản và học liệu. Người đăng tải chịu trách nhiệm về nguồn và bản quyền; học liệu vi phạm sẽ bị ẩn.</p></div></div></section>`;
V.login = () => `<section class="band"><div class="wrap" style="max-width:480px"><h1>Đăng nhập</h1>${needSb()}<form class="panel formgrid" id="fLogin"><label class="f full">Email<input name="email" type="email" required autocomplete="email"></label><label class="f full">Mật khẩu<input name="password" type="password" required autocomplete="current-password"></label><button class="btn full">Đăng nhập</button><a href="#" data-act="reset">Quên mật khẩu?</a><a href="#/register">Chưa có tài khoản? Đăng ký</a></form></div></section>`;
V.register = () => `<section class="band"><div class="wrap" style="max-width:480px"><h1>Đăng ký</h1>${needSb()}<form class="panel formgrid" id="fReg"><label class="f full">Họ và tên<input name="name" required></label><label class="f full">Email<input name="email" type="email" required></label><label class="f full">Mật khẩu (từ 8 ký tự)<input name="password" type="password" minlength="8" required autocomplete="new-password"></label><label class="f full">Vai trò<select name="role"><option value="teacher">Giáo viên tiểu học</option><option value="student">Sinh viên Giáo dục tiểu học</option></select></label><label class="f full">Đơn vị công tác / cơ sở đào tạo<input name="org"></label><button class="btn full">Tạo tài khoản</button></form></div></section>`;

/* Khu cá nhân */
V.dashboard = async (tab) => {
  if (!S.user) return V.login();
  tab = tab || "home";
  const tabs = [["home", "Tổng quan"], ["mine", "Học liệu của tôi"], ["upload", "Chia sẻ học liệu"], ["favs", "Yêu thích"], ["notif", "Thông báo"], ["profile", "Hồ sơ"]];
  const nav = `<div class="tabs">${tabs.map(([k, v]) => `<a href="#/dashboard/${k}" class="${tab === k ? "on" : ""}">${v}</a>`).join("")}</div>`;
  const { data: mine = [] } = await sb.from("resources").select("*").eq("author_id", S.user.id).order("created_at", { ascending: false });
  let body = "";
  if (tab === "home") {
    const n = s => mine.filter(r => s.includes(r.status)).length; await loadFavs();
    const { data: nt = [] } = await sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(5);
    body = `<div class="stats">${[["Đã đăng", mine.length], ["Được duyệt", n(["approved"])], ["Chờ duyệt", n(["pending", "reviewing"])], ["Cần chỉnh sửa", n(["revision"])], ["Yêu thích", S.favs.size]].map(([a, b]) => `<div class="stat"><b>${b}</b>${a}</div>`).join("")}</div><h3>Thông báo mới nhất</h3>${notifList(nt)}`;
  } else if (tab === "mine") {
    body = `<div class="tw"><table><thead><tr><th>Tên</th><th>Trạng thái</th><th>Ngày đăng</th><th>👁</th><th>⬇</th><th></th></tr></thead><tbody>${mine.map(r => `<tr><td><a href="#/resource/${r.id}">${esc(r.title)}</a>${r.review_note ? `<br><small>Góp ý: ${esc(r.review_note)}</small>` : ""}</td><td><span class="tag ${STATUS[r.status][1]}">${STATUS[r.status][0]}</span></td><td>${new Date(r.created_at).toLocaleDateString("vi-VN")}</td><td>${r.views}</td><td>${r.downloads}</td><td>
    ${["draft", "revision", "rejected"].includes(r.status) ? `<button class="btn sm" data-submit="${r.id}">Gửi duyệt</button> ` : ""}${["draft", "rejected"].includes(r.status) ? `<button class="btn sm danger" data-del="${r.id}">Xóa</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="6">Chưa có học liệu. <a href="#/dashboard/upload">Chia sẻ học liệu đầu tiên</a>.</td></tr>`}</tbody></table></div>`;
  } else if (tab === "upload") {
    body = `<form class="panel formgrid" id="fUp"><label class="f full">Tên học liệu *<input name="title" required maxlength="150"></label><label class="f full">Mô tả *<textarea name="description" rows="3" required></textarea></label>
    <label class="f">Môn học<select name="subject">${opts(SUBJECTS)}</select></label><label class="f">Chủ đề giao tiếp<select name="topic_id">${T.map(t => `<option value="${t.id}">${t.id}. ${esc(t.name)}</option>`).join("")}</select></label>
    <label class="f">Dạng học liệu<select name="type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join("")}</select></label><label class="f">Mục đích sử dụng<select name="purpose">${opts(PURPOSES)}</select></label>
    <label class="f">Đối tượng<select name="audience">${opts(AUDIENCES)}</select></label><label class="f">Mức độ<select name="level">${opts(LEVELS)}</select></label>
    <label class="f full">Đường dẫn tài nguyên (nếu có)<input name="external_url" type="url" placeholder="https://"></label>
    <label class="f full">Tệp đính kèm (PDF, Word, PowerPoint, ảnh, video; tối đa 50 MB/tệp)<input name="files" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4,.webm"></label>
    <label class="f full">Hướng dẫn sử dụng<textarea name="usage_guide" rows="3"></textarea></label><label class="f">Nguồn tài liệu<input name="source"></label><label class="f">Thông tin bản quyền<input name="license" placeholder="VD: Tự biên soạn, CC BY-NC"></label>
    <label class="f"><span><input type="checkbox" name="allow_download" style="width:auto;min-height:0"> Cho phép tải xuống</span></label><label class="f"><span><input type="checkbox" name="allow_edit" style="width:auto;min-height:0"> Cho phép chỉnh sửa</span></label>
    <div class="full tags"><button class="btn ghost" data-mode="draft">Lưu bản nháp</button><button class="btn" data-mode="pending">Gửi kiểm duyệt</button></div></form>`;
  } else if (tab === "favs") { await loadApproved(); await loadFavs(); body = `<div class="grid">${S.res.filter(r => S.favs.has(r.id)).map(card).join("") || "<p>Chưa có học liệu yêu thích.</p>"}</div>`; }
  else if (tab === "notif") { const { data = [] } = await sb.from("notifications").select("*").order("created_at", { ascending: false }); body = notifList(data); sb.from("notifications").update({ is_read: true }).eq("user_id", S.user.id).eq("is_read", false).then(() => { }); }
  else if (tab === "profile") { const p = S.profile || {}; body = `<form class="panel formgrid" id="fProf"><label class="f">Họ và tên<input name="full_name" value="${esc(p.full_name)}" required></label><label class="f">Email<input value="${esc(p.email)}" disabled></label><label class="f">Vai trò<input value="${p.role === "student" ? "Sinh viên" : p.role === "admin" ? "Quản trị viên" : "Giáo viên"}" disabled></label><label class="f">Đơn vị<input name="organization" value="${esc(p.organization)}"></label><label class="f full">Giới thiệu<textarea name="bio" rows="3">${esc(p.bio)}</textarea></label><button class="btn full">Lưu hồ sơ</button></form>`; }
  return `<section class="band"><div class="wrap"><h1>Khu vực cá nhân</h1>${nav}${body}</div></section>`;
};
const notifList = a => a.length ? a.map(n => `<div class="fb ${n.is_read ? "" : "good"}"><b>${esc(n.title)}</b><br>${esc(n.body)}<br><small>${new Date(n.created_at).toLocaleString("vi-VN")}</small></div>`).join("") : "<p>Chưa có thông báo.</p>";

/* Quản trị */
V.admin = async (tab) => {
  if (S.profile?.role !== "admin") return `<section class="band"><div class="wrap"><h1>Không có quyền truy cập</h1><p>Khu vực này dành cho quản trị viên.</p></div></section>`;
  tab = tab || "review";
  const nav = `<div class="tabs">${[["review", "Kiểm duyệt"], ["res", "Học liệu"], ["users", "Tài khoản"], ["reports", "Báo cáo vi phạm"]].map(([k, v]) => `<a href="#/admin/${k}" class="${tab === k ? "on" : ""}">${v}</a>`).join("")}</div>`;
  const cnt = async (f) => { let q = sb.from("resources").select("*", { count: "exact", head: true }); if (f) q = q.in("status", f); return (await q).count || 0; };
  const [tot, pen, apr, rej, usr, rep] = await Promise.all([cnt(), cnt(["pending", "reviewing"]), cnt(["approved"]), cnt(["rejected"]),
    sb.from("profiles").select("*", { count: "exact", head: true }).then(r => r.count || 0), sb.from("resource_reports").select("*", { count: "exact", head: true }).eq("status", "open").then(r => r.count || 0)]);
  const stats = `<div class="stats">${[["Tài khoản", usr], ["Học liệu", tot], ["Chờ duyệt", pen], ["Đã duyệt", apr], ["Bị từ chối", rej], ["Báo cáo mở", rep]].map(([a, b]) => `<div class="stat"><b>${b}</b>${a}</div>`).join("")}</div>`;
  let body = "";
  if (tab === "review" || tab === "res") {
    let q = sb.from("resources").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(100);
    q = tab === "review" ? q.in("status", ["pending", "reviewing"]) : q;
    const { data = [] } = await q;
    body = `<div class="tw"><table><thead><tr><th>Học liệu</th><th>Tác giả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${data.map(r => `<tr><td><a href="#/resource/${r.id}">${esc(r.title)}</a><br><small>${esc(r.source || "")} · ${esc(r.license || "")}</small></td><td>${esc(r.profiles?.full_name)}</td><td><span class="tag ${STATUS[r.status][1]}">${STATUS[r.status][0]}</span></td><td class="tags">
    ${r.status !== "approved" ? `<button class="btn sm" data-rev="approved" data-id="${r.id}">Phê duyệt</button>` : `<button class="btn sm ghost" data-rev="hidden" data-id="${r.id}">Ẩn</button>`}<button class="btn sm alt" data-rev="revision" data-id="${r.id}">Yêu cầu sửa</button><button class="btn sm danger" data-rev="rejected" data-id="${r.id}">Từ chối</button></td></tr>`).join("") || `<tr><td colspan="4">Không có học liệu nào.</td></tr>`}</tbody></table></div>`;
  } else if (tab === "users") {
    const { data = [] } = await sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    body = `<div class="tw"><table><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead><tbody>${data.map(u => `<tr><td>${esc(u.full_name)}</td><td>${esc(u.email)}</td><td><select data-role="${u.id}" ${u.id === S.user.id ? "disabled" : ""}>${[["teacher", "Giáo viên"], ["student", "Sinh viên"], ["admin", "Quản trị"]].map(([k, v]) => `<option value="${k}" ${u.role === k ? "selected" : ""}>${v}</option>`).join("")}</select></td><td>${u.is_locked ? '<span class="tag r">Đã khóa</span>' : '<span class="tag g">Hoạt động</span>'}</td><td>${u.id !== S.user.id ? `<button class="btn sm ghost" data-lock="${u.id}" data-to="${!u.is_locked}">${u.is_locked ? "Mở khóa" : "Khóa"}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>`;
  } else {
    const { data = [] } = await sb.from("resource_reports").select("*, resources(title)").order("created_at", { ascending: false }).limit(100);
    body = `<div class="tw"><table><thead><tr><th>Học liệu</th><th>Lý do</th><th>Trạng thái</th><th></th></tr></thead><tbody>${data.map(r => `<tr><td><a href="#/resource/${r.resource_id}">${esc(r.resources?.title)}</a></td><td>${esc(r.reason)}</td><td>${r.status}</td><td>${r.status === "open" ? `<button class="btn sm" data-rclose="${r.id}">Đã xử lý</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="4">Không có báo cáo.</td></tr>`}</tbody></table></div>`;
  }
  return `<section class="band"><div class="wrap"><h1>Quản trị</h1>${stats}${nav}${body}</div></section>`;
};

/* ---------- Router ---------- */
async function route() {
  const h = location.hash.replace(/^#\/?/, ""), [path, query] = h.split("?"), [name, ...rest] = path.split("/");
  const key = name || "home"; header(); footer();
  const view = V[key] || V.home; app.innerHTML = `<section class="band"><div class="wrap"><p>Đang tải…</p></div></section>`;
  try { app.innerHTML = await view(key === "library" ? query : rest[0], rest); } catch (e) { console.error(e); app.innerHTML = `<section class="band"><div class="wrap"><h1>Có lỗi xảy ra</h1><p>${esc(e.message)}</p><a class="btn" href="#/">Về trang chủ</a></div></section>`; }
  if (key === "library") filterList();
  if (key === "practice") PS.tab = rest[0];
  window.scrollTo(0, 0);
}

/* ---------- Sự kiện ---------- */
function showInstall() {
  const d = $("#dlg"), ios = /iphone|ipad/i.test(navigator.userAgent);
  d.innerHTML = `<h2>Cài ứng dụng</h2>${ios ? "<ol><li>Mở bằng Safari.</li><li>Nhấn nút Chia sẻ.</li><li>Chọn “Thêm vào màn hình chính”.</li><li>Nhấn Thêm.</li></ol>" : "<ol><li>Mở bằng Chrome.</li><li>Mở menu trình duyệt (⋮).</li><li>Chọn “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”.</li></ol>"}<button class="btn" onclick="this.closest('dialog').close()">Đã hiểu</button>`; d.showModal();
}
async function review(id, decision) {
  let reason = null;
  if (decision !== "approved") { reason = prompt(decision === "revision" ? "Nội dung cần chỉnh sửa:" : "Lý do:"); if (!reason) return; }
  const { error } = await sb.rpc("review_resource", { p_id: id, p_decision: decision, p_reason: reason });
  error ? toast(error.message) : (toast("Đã cập nhật"), S.res = null, route());
}
document.addEventListener("click", async e => {
  const t = e.target.closest("button,a,[data-fav]"); if (!t) return;
  if (t.id === "mbtn") { const n = $("#nav").classList.toggle("open"); t.setAttribute("aria-expanded", n); return; }
  if (t.closest("#nav") && t.tagName === "A") $("#nav").classList.remove("open");
  const d = t.dataset;
  if (d.fav) return toggleFav(d.fav);
  if (d.share) { const u = location.origin + location.pathname + "#/resource/" + d.share; try { if (navigator.share) await navigator.share({ title: document.title, url: u }); else { await navigator.clipboard.writeText(u); toast("Đã sao chép liên kết"); } } catch { } return; }
  if (d.report) { if (!S.user) return toast("Hãy đăng nhập để báo cáo."); const reason = prompt("Vì sao học liệu này không phù hợp?"); if (!reason) return; const { error } = await sb.from("resource_reports").insert({ resource_id: d.report, reporter_id: S.user.id, reason }); return toast(error ? error.message : "Đã gửi báo cáo. Cảm ơn bạn!"); }
  if (d.dl) { const { data, error } = await sb.storage.from(C.BUCKET).createSignedUrl(d.dl, 120, { download: true }); if (error) return toast(error.message); sb.rpc("record_download", { p_id: d.rid }); location.href = data.signedUrl; return; }
  if (d.opt !== undefined) { const s = SCENARIOS[PS.i], o = s.opts[d.opt], ok = o[1] === 1; if (ok) PS.score++;
    document.querySelectorAll(".opt").forEach((b, k) => { b.disabled = true; b.classList.toggle("good", s.opts[k][1] === 1); if (k == d.opt && !ok) b.classList.add("bad"); });
    $("#fb").innerHTML = `<div class="fb ${ok ? "good" : "bad"}"><b>${ok ? "Cách ứng xử phù hợp!" : "Chưa phù hợp lắm."}</b> ${esc(o[2])}${ok ? "" : `<br><b>Gợi ý:</b> ${esc(s.opts.find(x => x[1] === 1)[0])}`}</div><button class="btn" style="margin-top:12px" data-act="next">${PS.i + 1 < SCENARIOS.length ? "Tình huống tiếp theo" : "Xem kết quả"}</button>`; return; }
  if (d.submit) { const { error } = await sb.from("resources").update({ status: "pending" }).eq("id", d.submit); toast(error ? error.message : "Đã gửi kiểm duyệt"); return route(); }
  if (d.del) { if (!confirm("Xóa học liệu này?")) return; const { error } = await sb.from("resources").delete().eq("id", d.del); toast(error ? error.message : "Đã xóa"); return route(); }
  if (d.rev) return review(d.id, d.rev);
  if (d.lock) { const { error } = await sb.from("profiles").update({ is_locked: d.to === "true" }).eq("id", d.lock); toast(error ? error.message : "Đã cập nhật"); return route(); }
  if (d.rclose) { await sb.from("resource_reports").update({ status: "closed" }).eq("id", d.rclose); return route(); }
  switch (d.act) {
    case "install": if (S.deferred) { S.deferred.prompt(); S.deferred = null; } else showInstall(); break;
    case "logout": await sb.auth.signOut(); location.hash = "#/"; break;
    case "next": PS.i++; if (PS.i >= SCENARIOS.length) PS.done = true; route(); break;
    case "restart": Object.assign(PS, { i: 0, score: 0, done: false }); route(); break;
    case "nextcard": PS.card = ((PS.card ?? 0) + 1) % ROLECARDS.length; route(); break;
    case "score": { const v = [...document.querySelectorAll("[data-sc]")].map(s => s.value); if (v.includes("")) return toast("Em hãy trả lời hết các câu nhé.");
      const sum = v.reduce((a, b) => a + +b, 0), good = v.map((x, i) => x == 2 ? null : SELFCHECK[i]).filter(Boolean);
      $("#scr").innerHTML = `<div class="fb good"><b>${sum}/${v.length * 2} điểm.</b> ${sum >= 8 ? "Em giao tiếp rất tốt, hãy tiếp tục phát huy!" : "Em đã có nhiều điểm tốt. Hãy cùng luyện thêm nhé!"}${good.length ? `<br>Em có thể luyện thêm:<ul>${good.map(g => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}</div>`; break; }
    case "reset": e.preventDefault(); { const em = prompt("Nhập email đã đăng ký:"); if (em) { const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname }); toast(error ? error.message : "Đã gửi email khôi phục mật khẩu"); } } break;
  }
});
document.addEventListener("input", e => { if (e.target.id === "q" || e.target.dataset.f) filterList(); });
document.addEventListener("change", async e => {
  if (e.target.dataset.role) { const { error } = await sb.from("profiles").update({ role: e.target.value }).eq("id", e.target.dataset.role); toast(error ? error.message : "Đã đổi vai trò"); }
});
document.addEventListener("submit", async e => {
  const f = e.target, fd = new FormData(f); let btn = e.submitter; if (!sb) { e.preventDefault(); return toast("Cần cấu hình Supabase để dùng tính năng này."); }
  if (!["fLogin", "fReg", "fUp", "fProf"].includes(f.id)) return; e.preventDefault();
  if (f.id === "fLogin") { const { error } = await sb.auth.signInWithPassword({ email: fd.get("email"), password: fd.get("password") }); error ? toast("Sai email hoặc mật khẩu.") : (location.hash = "#/dashboard"); }
  if (f.id === "fReg") { const { data, error } = await sb.auth.signUp({ email: fd.get("email"), password: fd.get("password"), options: { data: { full_name: fd.get("name"), role: fd.get("role"), organization: fd.get("org") }, emailRedirectTo: location.origin + location.pathname } });
    if (error) return toast(error.message); toast(data.session ? "Đăng ký thành công!" : "Hãy kiểm tra email để xác nhận tài khoản."); if (data.session) location.hash = "#/dashboard"; }
  if (f.id === "fProf") { const { error } = await sb.from("profiles").update({ full_name: fd.get("full_name"), organization: fd.get("organization"), bio: fd.get("bio") }).eq("id", S.user.id); toast(error ? error.message : "Đã lưu hồ sơ"); await loadProfile(); }
  if (f.id === "fUp") {
    const mode = btn?.dataset.mode || "draft"; btn && (btn.disabled = true);
    const row = { author_id: S.user.id, status: mode, title: fd.get("title"), description: fd.get("description"), subject: fd.get("subject"), topic_id: +fd.get("topic_id"), type: fd.get("type"), purpose: fd.get("purpose"), audience: fd.get("audience"), level: fd.get("level"), external_url: fd.get("external_url") || null, usage_guide: fd.get("usage_guide"), source: fd.get("source"), license: fd.get("license"), allow_download: !!fd.get("allow_download"), allow_edit: !!fd.get("allow_edit") };
    const { data, error } = await sb.from("resources").insert(row).select().single(); if (error) { btn && (btn.disabled = false); return toast(error.message); }
    for (const file of fd.getAll("files")) {
      if (!file.name) continue; if (file.size > 50 * 1024 * 1024) { toast(file.name + " vượt quá 50 MB, đã bỏ qua."); continue; }
      const path = `${S.user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const up = await sb.storage.from(C.BUCKET).upload(path, file); if (up.error) { toast(up.error.message); continue; }
      await sb.from("resource_files").insert({ resource_id: data.id, path, name: file.name, mime: file.type, size: file.size });
    }
    toast(mode === "pending" ? "Đã gửi kiểm duyệt" : "Đã lưu bản nháp"); location.hash = "#/dashboard/mine";
  }
});

async function loadProfile() {
  if (!sb) return; const { data: { session } } = await sb.auth.getSession(); S.user = session?.user || null; S.profile = null;
  if (S.user) { const { data } = await sb.from("profiles").select("*").eq("id", S.user.id).maybeSingle(); S.profile = data; if (data?.is_locked) { toast("Tài khoản đang bị khóa."); await sb.auth.signOut(); S.user = S.profile = null; } }
  await loadFavs();
}
window.addEventListener("hashchange", route);
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); S.deferred = e; });
window.addEventListener("offline", () => toast("Bạn đang ngoại tuyến. Chỉ nội dung đã lưu mới xem được."));
window.addEventListener("online", () => toast("Đã kết nối lại."));
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").then(reg => {
  reg.addEventListener("updatefound", () => { const w = reg.installing; w?.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) { toast("Có phiên bản mới. Đang cập nhật…"); w.postMessage("SKIP_WAITING"); setTimeout(() => location.reload(), 1200); } }); });
}).catch(() => { });
(async () => { await loadProfile(); if (sb) sb.auth.onAuthStateChange(async (ev) => { if (ev === "SIGNED_IN" || ev === "SIGNED_OUT") { await loadProfile(); route(); } }); await loadApproved(); route(); })();
})();

const seedNews = [
  { id: 1, title: 'Bienvenue sur le nouveau site du CVL', category: 'Information', date: '2026-09-01', excerpt: 'Retrouvez ici toutes les nouvelles, les projets et les activites qui font vivre notre lycee.' },
  { id: 2, title: 'La semaine des talents arrive', category: 'Evenement', date: '2026-09-04', excerpt: 'Musique, dessin, danse, theatre : les inscriptions sont ouvertes pour partager votre talent.' },
  { id: 3, title: 'Le foyer se transforme', category: 'Projet', date: '2026-09-06', excerpt: 'Le CVL imagine avec vous un foyer plus accueillant. Venez donner votre avis sur les prochaines idees.' }
];
const seedSchedule = [
  { id: 1, title: 'Atelier musique', date: '2026-09-07', time: '12h45 - 13h30', location: 'Salle polyvalente', tag: 'Ouvert a tous' },
  { id: 2, title: 'Club jeux de societe', date: '2026-09-09', time: '13h - 14h', location: 'Foyer', tag: 'Projet' },
  { id: 3, title: 'Reunion du CVL', date: '2026-09-11', time: '12h45 - 13h30', location: 'Salle de reunion', tag: 'Elus du CVL' }
];
const storageKey = 'cvl-bezout-news';
const scheduleStorageKey = 'cvl-bezout-schedule';
const credentialsStorageKey = 'cvl-bezout-admin-credentials';
const defaultCredentials = { cpe: ['cpe.CVL.bezout', 'CVLbezout2026'], 'vie-scolaire': ['viesco.CVL.bezout', 'CVLbezout2026'], general: ['CVL.bezout/admin', 'CVLbezout2026'] };
let news = JSON.parse(localStorage.getItem(storageKey) || 'null') || seedNews;
let schedule = JSON.parse(localStorage.getItem(scheduleStorageKey) || 'null') || seedSchedule;
let credentials = JSON.parse(localStorage.getItem(credentialsStorageKey) || 'null') || defaultCredentials;
let currentFilter = 'Tous';
let displayedWeek = new Date('2026-09-07T12:00:00');
let currentRole = '';
const $ = (selector) => document.querySelector(selector);
const formatDate = (value) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
const saveNews = () => localStorage.setItem(storageKey, JSON.stringify(news));
const saveSchedule = () => localStorage.setItem(scheduleStorageKey, JSON.stringify(schedule));
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const fileToDataUrl = (file) => file ? new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, url: reader.result }); reader.onerror = reject; reader.readAsDataURL(file); }) : Promise.resolve(null);

function renderNews() {
  const visible = news.filter((item) => currentFilter === 'Tous' || item.category === currentFilter);
  $('#newsGrid').innerHTML = visible.map((item) => `
    <article class="news-card">${item.image ? `<img class="news-image" src="${item.image.url}" alt="${escapeHtml(item.title)}">` : ''}<div class="news-meta"><span>${escapeHtml(item.category)}</span><span>${formatDate(item.date)}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p>${item.attachment ? `<a class="news-link" href="${item.attachment.url}" download="${escapeHtml(item.attachment.name)}">Telecharger la piece jointe &nbsp;↓</a>` : '<span class="news-link">Actualite du CVL &nbsp;→</span>'}</article>`).join('');
  $('#emptyState').classList.toggle('hidden', visible.length > 0);
}
function renderAdminList() {
  $('#adminList').innerHTML = news.map((item) => `<div class="admin-item"><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category)} · ${formatDate(item.date)}${item.attachment ? ' · piece jointe' : ''}</small></div><div class="admin-actions"><button data-edit="${item.id}">Modifier</button><button data-delete="${item.id}">Supprimer</button></div></div>`).join('');
  $('#scheduleAdminList').innerHTML = schedule.map((item) => `<div class="admin-item"><div><strong>${escapeHtml(item.title)}</strong><small>${formatDate(item.date)} · ${escapeHtml(item.time)} · ${escapeHtml(item.location)}</small></div><div class="admin-actions"><button data-schedule-edit="${item.id}">Modifier</button><button data-schedule-delete="${item.id}">Supprimer</button></div></div>`).join('');
}
function startOfWeek(date) { const result = new Date(date); const day = result.getDay() || 7; result.setDate(result.getDate() - day + 1); result.setHours(12, 0, 0, 0); return result; }
function dateKey(date) { return date.toISOString().slice(0, 10); }
function renderSchedule() {
  const monday = startOfWeek(displayedWeek); const days = Array.from({ length: 5 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
  $('#weekLabel').textContent = `${days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${days[4].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  $('#scheduleGrid').innerHTML = days.map((date) => { const items = schedule.filter((item) => item.date === dateKey(date)); return `<div class="schedule-day"><header><strong>${date.toLocaleDateString('fr-FR', { weekday: 'long' })}</strong><span>${date.getDate()}</span></header>${items.length ? items.map((item) => `<article class="schedule-card"><strong>${escapeHtml(item.title)}</strong><time>${escapeHtml(item.time)}</time><small>${escapeHtml(item.location)}</small><span>${escapeHtml(item.tag)}</span></article>`).join('') : '<p class="schedule-empty">Aucune activite</p>'}</div>`; }).join('');
}
function openAdmin() { $('#adminModal').classList.remove('hidden'); $('#password').focus(); }
function closeAdmin() { $('#adminModal').classList.add('hidden'); }
function showDashboard(role) { currentRole = role; $('#loginView').classList.add('hidden'); $('#adminView').classList.remove('hidden'); $('#adminRoleLabel').textContent = `Espace ${role === 'cpe' ? 'CPE' : role === 'vie-scolaire' ? 'Vie scolaire' : 'administration generale'}`; if (!$('#passwordChangeForm')) { $('#adminView').insertAdjacentHTML('afterbegin', '<form class="password-form" id="passwordChangeForm"><h3 class="admin-section-title">Securite</h3><p class="modal-copy">Modifiez le mot de passe de cet espace administrateur.</p><div class="form-row"><div><label for="newPassword">Nouveau mot de passe</label><input id="newPassword" type="password" minlength="8" required autocomplete="new-password"></div><div><label for="confirmPassword">Confirmation</label><input id="confirmPassword" type="password" minlength="8" required autocomplete="new-password"></div></div><p class="form-error" id="passwordChangeError"></p><div class="form-actions"><button class="primary-button" type="submit">Changer le mot de passe</button></div></form>'); $('#passwordChangeForm').addEventListener('submit', changePassword); } renderAdminList(); }
function changePassword(event) { event.preventDefault(); const newPassword = $('#newPassword').value; const confirmPassword = $('#confirmPassword').value; if (newPassword !== confirmPassword) { $('#passwordChangeError').textContent = 'Les deux mots de passe sont differents.'; return; } credentials[currentRole][1] = newPassword; localStorage.setItem(credentialsStorageKey, JSON.stringify(credentials)); $('#passwordChangeForm').reset(); $('#passwordChangeError').textContent = 'Mot de passe modifie.'; }
function resetForm() { $('#newsForm').reset(); $('#editId').value = ''; $('#cancelEdit').classList.add('hidden'); $('#newsForm button[type="submit"]').textContent = "Publier l'actualite"; }
function resetScheduleForm() { $('#scheduleForm').reset(); $('#scheduleEditId').value = ''; $('#cancelScheduleEdit').classList.add('hidden'); $('#scheduleForm button[type="submit"]').textContent = "Ajouter l'activite"; }

$('#adminOpen').addEventListener('click', openAdmin);
$('#adminClose').addEventListener('click', closeAdmin);
$('#adminModal').addEventListener('click', (event) => { if (event.target.id === 'adminModal') closeAdmin(); });
$('#loginForm').addEventListener('submit', (event) => { event.preventDefault(); const role = $('#adminRole').value; const [expectedUser, expectedPassword] = credentials[role]; if ($('#username').value.trim() === expectedUser && $('#password').value === expectedPassword) { $('#loginError').textContent = ''; showDashboard(role); } else { $('#loginError').textContent = 'Identifiant ou mot de passe incorrect.'; } });
$('#logoutButton').addEventListener('click', () => { resetForm(); resetScheduleForm(); $('#adminView').classList.add('hidden'); $('#loginView').classList.remove('hidden'); $('#username').value = ''; $('#password').value = ''; });
$('#newsForm').addEventListener('submit', async (event) => { event.preventDefault(); const editId = Number($('#editId').value); const previous = news.find((item) => item.id === editId); const [image, attachment] = await Promise.all([fileToDataUrl($('#newsImage').files[0]), fileToDataUrl($('#newsAttachment').files[0])]); const article = { id: editId || Date.now(), title: $('#newsTitle').value.trim(), category: $('#newsCategory').value, date: $('#newsDate').value, excerpt: $('#newsExcerpt').value.trim(), image: image || previous?.image || null, attachment: attachment || previous?.attachment || null }; news = editId ? news.map((item) => item.id === editId ? article : item) : [article, ...news]; saveNews(); renderNews(); renderAdminList(); resetForm(); });
$('#cancelEdit').addEventListener('click', resetForm);
$('#adminList').addEventListener('click', (event) => { const id = Number(event.target.dataset.edit || event.target.dataset.delete); if (!id) return; const item = news.find((entry) => entry.id === id); if (event.target.dataset.delete) { news = news.filter((entry) => entry.id !== id); saveNews(); renderNews(); renderAdminList(); } else if (item) { $('#editId').value = item.id; $('#newsTitle').value = item.title; $('#newsCategory').value = item.category; $('#newsDate').value = item.date; $('#newsExcerpt').value = item.excerpt; $('#cancelEdit').classList.remove('hidden'); $('#newsForm button[type="submit"]').textContent = 'Enregistrer les changements'; } });
document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => { currentFilter = button.dataset.filter; document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button)); renderNews(); }));
$('#scheduleForm').addEventListener('submit', (event) => { event.preventDefault(); const editId = Number($('#scheduleEditId').value); const item = { id: editId || Date.now(), title: $('#scheduleTitle').value.trim(), date: $('#scheduleDate').value, time: $('#scheduleTime').value.trim(), location: $('#scheduleLocation').value.trim(), tag: $('#scheduleTag').value.trim() }; schedule = editId ? schedule.map((entry) => entry.id === editId ? item : entry) : [...schedule, item]; saveSchedule(); renderSchedule(); renderAdminList(); resetScheduleForm(); });
$('#cancelScheduleEdit').addEventListener('click', resetScheduleForm);
$('#scheduleAdminList').addEventListener('click', (event) => { const id = Number(event.target.dataset.scheduleEdit || event.target.dataset.scheduleDelete); if (!id) return; const item = schedule.find((entry) => entry.id === id); if (event.target.dataset.scheduleDelete) { schedule = schedule.filter((entry) => entry.id !== id); saveSchedule(); renderSchedule(); renderAdminList(); } else if (item) { $('#scheduleEditId').value = item.id; $('#scheduleTitle').value = item.title; $('#scheduleDate').value = item.date; $('#scheduleTime').value = item.time; $('#scheduleLocation').value = item.location; $('#scheduleTag').value = item.tag; $('#cancelScheduleEdit').classList.remove('hidden'); $('#scheduleForm button[type="submit"]').textContent = 'Enregistrer les changements'; } });
$('#previousWeek').addEventListener('click', () => { displayedWeek.setDate(displayedWeek.getDate() - 7); renderSchedule(); });
$('#nextWeek').addEventListener('click', () => { displayedWeek.setDate(displayedWeek.getDate() + 7); renderSchedule(); });
renderNews();
renderSchedule();

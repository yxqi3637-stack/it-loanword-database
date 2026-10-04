const form = document.querySelector('#wordForm');
const message = document.querySelector('#formMessage');
const id = new URLSearchParams(location.search).get('id');

if (id) {
  document.querySelector('#formTitle').textContent = '単語の情報を編集';
  fetch(`/api/loanwords/${id}`).then(r => r.json()).then(word => {
    Object.entries(word).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value || ''; });
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const response = await fetch(id ? `/api/loanwords/${id}` : '/api/loanwords', {
    method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) { message.textContent = result.error; return; }
  location.href = 'index.html';
});

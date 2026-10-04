const list = document.querySelector('#wordList');
const message = document.querySelector('#message');
const count = document.querySelector('#count');
const input = document.querySelector('#searchInput');

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

async function loadWords(query = '') {
  const response = await fetch(`/api/loanwords?q=${encodeURIComponent(query)}`);
  const words = await response.json();
  count.textContent = `${words.length} WORDS`;
  message.textContent = words.length ? '' : '該当する単語が見つかりませんでした。';
  list.innerHTML = words.map(word => `
    <article class="word-card">
      <div class="word-head"><div><span class="category">${escapeHtml(word.category)}</span><h3>${escapeHtml(word.japanese)} <small>${escapeHtml(word.english)}</small></h3><p class="chinese">${escapeHtml(word.chinese)}</p></div><div class="actions"><a href="form.html?id=${word.id}">編集</a><button data-delete="${word.id}">削除</button></div></div>
      <div class="compare"><div><b>日本語での意味</b><p>${escapeHtml(word.japanese_meaning)}</p></div><div><b>中国語での意味</b><p>${escapeHtml(word.chinese_meaning)}</p></div></div>
      ${word.example ? `<p class="example"><b>使用例</b> ${escapeHtml(word.example)}</p>` : ''}
    </article>`).join('');
}

document.querySelector('#searchButton').addEventListener('click', () => loadWords(input.value.trim()));
input.addEventListener('keydown', event => { if (event.key === 'Enter') loadWords(input.value.trim()); });
list.addEventListener('click', async event => {
  const id = event.target.dataset.delete;
  if (!id || !confirm('この単語を削除しますか？')) return;
  await fetch(`/api/loanwords/${id}`, { method: 'DELETE' });
  loadWords(input.value.trim());
});
loadWords();

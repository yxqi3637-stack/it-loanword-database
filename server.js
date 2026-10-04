const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new DatabaseSync(path.join(__dirname, 'loanwords.db'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

db.exec(`CREATE TABLE IF NOT EXISTS loanwords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    english TEXT NOT NULL,
    japanese TEXT NOT NULL,
    chinese TEXT NOT NULL,
    category TEXT NOT NULL,
    japanese_meaning TEXT NOT NULL,
    chinese_meaning TEXT NOT NULL,
    example TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

const row = db.prepare('SELECT COUNT(*) AS count FROM loanwords').get();
if (row.count === 0) {
    const insert = db.prepare(`INSERT INTO loanwords
      (english, japanese, chinese, category, japanese_meaning, chinese_meaning, example)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const samples = [
      ['cloud', 'クラウド', '云', 'インターネット', 'インターネット経由で利用するサービスや保存領域。', 'オンライン上のサービスや技術を幅広く表す。', 'クラウドにデータを保存する／云计算服务'],
      ['application', 'アプリ', '应用／APP', 'ソフトウェア', '主にスマートフォンなどで使うソフトウェア。', 'パソコンとスマートフォンのソフトウェアの両方に使われる。', '学習アプリを使う／下载手机APP'],
      ['server', 'サーバー', '服务器', 'ネットワーク', 'データや機能をほかのコンピュータに提供する機器やソフトウェア。', 'ネットワークを通じてデータやサービスを提供する設備。', 'サーバーに接続する／连接服务器'],
      ['account', 'アカウント', '账号／账户', 'サービス', 'Webサービスを利用するための登録情報。', 'サービスの利用者を識別する登録情報。', 'アカウントを作成する／注册账号'],
      ['download', 'ダウンロード', '下载', '操作', 'ネットワーク上のデータを端末に保存すること。', 'インターネット上のデータを端末に保存すること。', '資料をダウンロードする／下载文件']
    ];
    samples.forEach(item => insert.run(...item));
}

app.get('/api/loanwords', (req, res) => {
  const keyword = `%${req.query.q || ''}%`;
  try {
    const rows = db.prepare(`SELECT * FROM loanwords
    WHERE english LIKE ? OR japanese LIKE ? OR chinese LIKE ? OR category LIKE ?
    ORDER BY id DESC`).all(keyword, keyword, keyword, keyword);
    res.json(rows);
  } catch { res.status(500).json({ error: 'データの取得に失敗しました。' }); }
});

app.get('/api/loanwords/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM loanwords WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: '単語が見つかりません。' });
    res.json(row);
  } catch { res.status(500).json({ error: 'データの取得に失敗しました。' }); }
});

app.post('/api/loanwords', (req, res) => {
  const { english, japanese, chinese, category, japanese_meaning, chinese_meaning, example = '' } = req.body;
  if (![english, japanese, chinese, category, japanese_meaning, chinese_meaning].every(Boolean)) {
    return res.status(400).json({ error: '必須項目を入力してください。' });
  }
  try {
    const result = db.prepare(`INSERT INTO loanwords
    (english, japanese, chinese, category, japanese_meaning, chinese_meaning, example)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(english, japanese, chinese, category, japanese_meaning, chinese_meaning, example);
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch { res.status(500).json({ error: '登録に失敗しました。' }); }
});

app.put('/api/loanwords/:id', (req, res) => {
  const { english, japanese, chinese, category, japanese_meaning, chinese_meaning, example = '' } = req.body;
  if (![english, japanese, chinese, category, japanese_meaning, chinese_meaning].every(Boolean)) {
    return res.status(400).json({ error: '必須項目を入力してください。' });
  }
  try {
    const result = db.prepare(`UPDATE loanwords SET english=?, japanese=?, chinese=?, category=?,
      japanese_meaning=?, chinese_meaning=?, example=? WHERE id=?`).run(
      english, japanese, chinese, category, japanese_meaning, chinese_meaning, example, req.params.id);
      if (result.changes === 0) return res.status(404).json({ error: '単語が見つかりません。' });
      res.json({ success: true });
  } catch { res.status(500).json({ error: '更新に失敗しました。' }); }
});

app.delete('/api/loanwords/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM loanwords WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: '削除に失敗しました。' }); }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT} で起動しました。`));

# WR.GG Frontend

このフォルダは WR.GG のフロントエンドアプリを管理する場所です。React + Vite + Tailwind CSS で構成されており、スクレイピング済みの JSON を読み込んで UI を描画します。

---

## 役割

- パッチノート一覧の表示
- チャンピオン変更情報の閲覧
- JSON データの読み込みと状態管理
- GitHub Pages 向けの静的ビルド生成

---

## ディレクトリ構成

```plaintext
wrgg-frontend/
├── public/
│   └── data/                 # スクレイピング済み JSON を配置
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.js
├── README.md
└── .gitignore
```

---

## 必要環境

- Node.js 18 以上
- npm

---

## 開発コマンド

```bash
npm install
npm run dev
```

ローカル開発中は Vite の開発サーバーが起動し、変更が即座に反映されます。

### ビルド

```bash
npm run build
```

### GitHub Pages 向けビルド

```bash
npm run build-docs
```

### デプロイ

```bash
npm run deploy
```

---

## JSON データの扱い

`public/data` 配下に以下のような JSON が置かれている前提です。

- `patch_notes.json`
- `patch_contents.json`
- `champion_data/`
- `AI/`

アプリ側はこれらを fetch もしくは静的参照して画面に表示します。

---

## 実装メモ

- `src/App.tsx` はルーティングやアプリ全体の構造を持つ
- `src/pages/` は画面単位のページ定義を入れる想定
- `src/components/` は再利用可能な UI 部品を配置する想定
- `src/index.css` で Tailwind の初期定義や調整を行う

---

## 開発時の注意

- `public/data` の JSON が存在しない場合、画面が空になることがある
- スクレイピングデータの更新後は、ブラウザで表示結果が変わるので再読込が必要になる
- 運用時にはビルド前に `data` が最新かどうかを確認することを推奨する

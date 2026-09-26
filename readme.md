# WR.GG

Wild Rift のパッチノートやチャンピオン変更を、見やすい形式で確認できる Web アプリです。

- サイト: [WR.GG](https://taiking0905.github.io/wr.gg/#/)
- 対象: League of Legends: Wild Rift
- 目的: パッチノートの確認・比較・検索を簡単にする

---

## 概要

このリポジトリは、Wild Rift の公式パッチノートをスクレイピングして JSON 化し、React で表示する構成です。

主な流れは以下の通りです。

1. Python のスクレイパーが公式ページから更新情報を取得
2. JSON に整形して保存
3. フロントエンドが JSON を読み込んで UI に表示
4. GitHub Pages / docs 配信で公開

---

## 技術スタック

- フロントエンド: React + Vite + Tailwind CSS
- ホスティング: GitHub Pages
- データ取得: Python + BeautifulSoup + requests
- 自動化: GitHub Actions
- API / 連携: Cloudflare Worker + R2 bucket
- データ形式: JSON

---

## 主要構成

```plaintext
wr.gg/
├── .github/
│   └── workflows/
│       └── scrape.yml
├── docs/                     # GitHub Pages 用の公開用ビルド成果物
├── scraper/                  # Python スクレイピング処理
├── workers/                  # Cloudflare Worker / R2 設定
├── wrgg-frontend/            # React アプリ本体
├── .gitignore
├── readme.md
└── .
```

---

## ローカルでの開発

### 1. リポジトリをクローン

```bash
git clone https://github.com/taiking0905/wr.gg.git
cd wr.gg
```

### 2. フロントエンドの起動

```bash
cd wrgg-frontend
npm install
npm run dev
```

開発サーバーを起動した後、ブラウザで表示される URL を確認してください。

### 3. 本番用ビルド

```bash
cd wrgg-frontend
npm run build
```

GitHub Pages の公開向けにビルドした結果は `docs/` 配下に出力される想定です。

---

## スクレイピングの実行

```bash
python -m venv venv
.\venv\Scripts\activate
cd scraper
pip install -r requirements.txt
python patch_scraper.py
```

このプロジェクトでは、GitHub Actions で定期実行する前提で構成しています。更新データは `wrgg-frontend/public/data` に保存され、フロントエンドから読み込まれます。

---

## データの流れ

```text
Wild Rift 公式サイト
       ↓
Python スクレイパー
       ↓
JSON データ生成
       ↓
React フロントエンド
       ↓
GitHub Pages / docs で公開
```

- `scraper/patch_scraper.py` : パッチ情報の一覧と本文を取得
- `scraper/champion_scraper.py` : チャンピオン別データを取得
- `wrgg-frontend/public/data` : JSON の保存先

---

## フォルダ別の説明

- [scraper/README.md](scraper/README.md) : スクレイピング処理とデータ生成の説明
- [wrgg-frontend/README.md](wrgg-frontend/README.md) : React アプリの実行・カスタマイズ方法
- [workers/README.md](workers/README.md) : Cloudflare Worker と R2 の説明
- [docs/README.md](docs/README.md) : 公開用の docs 配下の説明

---

## 注意事項

- `docs/` はビルド成果物のため、ソースコードの編集対象ではありません
- JSON データはスクレイピング結果に依存するため、定期更新が必要です
- GitHub Actions の実行タイミングやスクレイピング対象 URL は、アップデート時に見直してください

---

## ライセンス

このプロジェクトは個人開発用途を前提にしています。必要に応じてライセンスや利用規約を明記してください。


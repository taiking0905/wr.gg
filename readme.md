# WR.GG - Wild Rift Patch Note Viewer
## リンク

[WR.GG](https://taiking0905.github.io/wr.gg/#/)

## 🔍 概要

League of Legends: Wild Rift のパッチノートをスクレイピングし、変更点を見やすく表示するWebアプリです。

---

## 🚀 使用技術

- Vite + Frontend: React + Tailwind CSS
- Hosting: GitHub Pages
- Scraping: Python (GitHub Actionsで定期実行)
- 通知: Discord Webhook
- Data format: JSON

---

## ⚙️ 開発環境構築
## クローン
```bash
git clone https://github.com/taiking0905/wr.gg.git
cd wr.gg
```
## フロントエンド環境構築
```bash
cd wrgg-frontend
npm install
npm run dev  # 開発サーバー起動 
```
## デバック処理 
npm run dev
npm run build-docs

## スクレイピング仕様
Github Actionsを使うことで毎週木曜の24:00に自動でスクレイピングをします。  
```bash
python -m venv venv
.\venv\Scripts\activat
cd scraper
pip install -r requirements.txt

# 📁 ディレクトリ構成

```plaintext
wr.gg/
├── .github/workflows/       # GitHub Actions のワークフロー設定
│   └── scrape.yml
├── data/                    # スクレイピング結果の JSON 保存先
│   └── patch_notes.json（自動生成）
├── scraper/                 # Python スクレイピングスクリプト
│   ├── patch_scraper.py
│   └── requirements.txt
├── wrgg-frontend/           # React + Vite + Tailwind フロントエンド
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── ...
├── .gitignore
└── README.md
```

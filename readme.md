WR.GG/
  ├── src/
  │   ├── renderer/       # フロントエンドの処理
  │   │   ├── index.html  # HTMLファイル
  │   │   ├── renderer.js # フロント用JS（UI関連）
  │   │   ├── styles.css  # CSS（デザイン）
  │   │
  │   ├── preload/        # Preloadスクリプト
  │   │   ├── preload.js  # メインとレンダラーの橋渡し
  │   │
  │   ├── main/           # メインプロセス（Electronの中核）
  │       ├── main.js     # アプリのエントリーポイント
  │       ├── database.js # DB関連処理
  │       ├── scraper.js  # スクレイピング処理
  │       ├── server.js   # APIサーバー
  │
  ├── database.sqlite      # SQLiteのデータベース
  ├── package.json         # Node.jsのパッケージ管理



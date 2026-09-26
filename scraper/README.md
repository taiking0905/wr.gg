# Scraper

このフォルダは、Wild Rift の公式パッチノートやチャンピオンデータを取得して JSON に整形する Python 処理をまとめた場所です。

---

## 役割

- 公式ページから更新情報を取得
- パッチ本文やチャンピオン変更内容を抽出
- `wrgg-frontend/public/data` へ JSON 保存
- GitHub Actions から定期実行される前提で構成

---

## 主要ファイル

### `patch_scraper.py`

- `wildrift.leagueoflegends.com` のパッチノート一覧を取得
- 新しいパッチがあれば JSON に追記
- 各パッチの変更内容を抽出して保存

### `champion_scraper.py`

- チャンピオンごとの統計データを取得
- 期間別に履歴を保存する想定

### `championdata_scraper.py`

- チャンピオン関連の詳細データを収集する補助処理

### `champion_lane.py`

- レーンごとのチャンピオン情報整理に使う補助スクリプト

### `make_ai_input.py`

- AI 向けの入力データを作成する処理
- 差分データを生成して `AI/diff_input.json` などに出力する想定

### `response_ai.py`

- AI 連携や応答生成用のスクリプト

### `delete_champion_data.py`

- 古いデータや不要なチャンピオンデータを削除する補助スクリプト

### `requirements.txt`

- スクレイピングで必要な Python パッケージ一覧

---

## 実行方法

```bash
python -m venv venv
.\venv\Scripts\activate
cd scraper
pip install -r requirements.txt
python patch_scraper.py
```

必要に応じて以下も実行します。

```bash
python champion_scraper.py
python make_ai_input.py
```

---

## 保存先

データは基本的に以下のディレクトリに書き出されます。

```text
wrgg-frontend/public/data/
├── patch_notes.json
├── patch_contents.json
├── champion_data/
├── AI/
└── ...
```

---

## 注意事項

- 公式サイトの HTML 構造が変わると取得ロジックが壊れる可能性がある
- リクエスト数が多い場合、アクセス制限やタイムアウトに注意
- 実行前に `wrgg-frontend/public/data` の構造を確認しておく
- 取得結果をそのまま本番公開前提に扱わず、必要に応じて検証する

---

## GitHub Actions 連携

このスクレイパーは GitHub Actions から定期実行される構成を想定しています。定期処理の設定は `.github/workflows/` に置かれており、更新時にデータの再取得と保存が行われます。

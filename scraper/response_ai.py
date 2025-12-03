from google import genai
import os
import csv
import json
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()
api_key = os.getenv('GEMINI_API')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'wrgg-frontend/public/data/AI')

LATEST_PATH = os.path.join(DATA_DIR, 'latest_input.json')
PREVIOUS_PATH = os.path.join(DATA_DIR, 'previous_input.json')
PATCHNOTE_PATH = os.path.join(DATA_DIR, 'patchnote_input.json')
OUTPUT_CSV = os.path.join(DATA_DIR, 'output_ai.csv')
OUTPUT_JSON = os.path.join(DATA_DIR, 'output_ai.json')

MAX_RETRY = 5
retry_count = 0
success = False

client = genai.Client(api_key=api_key)

# 入力データ読み込み
with open(LATEST_PATH, "r", encoding="utf-8") as f:
    latest = f.read()

with open(PREVIOUS_PATH, "r", encoding="utf-8") as f:
    previous = f.read()

with open(PATCHNOTE_PATH, "r", encoding="utf-8") as f:
    patchnote = f.read()

# Geminiプロンプト
prompt = f"""
あなたはワイルドリフトの統計アナリストです。
以下に最新パッチデータ（LATEST）、前回パッチデータ（PREVIOUS）、
パッチノート（PATCHNOTE）を渡します。そこで見つけた差が激しいものを15件表示してください。


【分析条件】
- 同一チャンピオン・同一ランク内の変化のみ比較（縦比較禁止）
- 勝率 ±1%以上、ピック率/バン率 ±0.5%以上の変化が対象
- 上昇も下降も重要
- ランクの重要度は Master > Challenger > Diamond > Legendary_rank > Emerald とし、重み付けを考慮して評価する。 
- Master、Challenger、Diamondを最優先評価。Legendary_rank、Emeraldは補助としてのみ使用
- 複数レーンで変化している場合は優先
- パッチノートは参考のみ（計算に直接使わない）
- RAG のため、与えたデータ以外は使用禁止

【絶対遵守ルール】
1. 絶対に15件のみ返す。15件より多くても少なくてもダメ。
2. CSV 形式で返すこと
3. ヘッダーは 'champion,reason'
4. ダブルクォートで囲む
5. CSV以外の文章は書かない
6. 出力は必ず 1 から 15 まで番号を振り、15 件を超えないようにする

【出力例】
"ranking","champion","reason"
"1~15の数字",name","日本語で選ばれた理由を書く。データは変化を見やすく。予想もしてよい"

【データ】
LATEST:
{latest}

PREVIOUS:
{previous}

PATCHNOTE:
{patchnote}
"""

while not success and retry_count < MAX_RETRY:
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        raw = response.text.strip()

        # 不要な ```csv などを削除
        if raw.startswith("```csv"):
            raw = raw[len("```csv"):].lstrip()
        if raw.endswith("```"):
            raw = raw[:-3].rstrip()

        # CSV → Dict に変換して行数チェック
        reader = csv.DictReader(raw.splitlines())
        rows = list(reader)

        # フォーマットチェック
        if reader.fieldnames != ["ranking","champion","reason"]:
            raise ValueError("CSV ヘッダーが不正")

        # 件数チェック
        if len(rows) != 15:
            raise ValueError(f"件数が不正: {len(rows)} 件")

        # 成功
        success = True

    except Exception as e:
        print("リクエスト失敗、再試行します:", e)
        retry_count += 1

if not success:
    raise RuntimeError("最大リトライ回数に達しました。Gemini から正しい CSV を取得できませんでした")

# この raw をそのまま CSV として保存
with open(OUTPUT_CSV, 'w', encoding='utf-8') as f:
    f.write(raw)

print("CSV 保存完了:", OUTPUT_CSV)

# CSV → JSON 化
parsed = []
with open(OUTPUT_CSV, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        parsed.append({
            "ranking":row["ranking"].strip(),
            "champion": row["champion"].strip(),
            "reason": row["reason"].strip()
        })

# JSON 保存
with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(parsed, f, ensure_ascii=False, indent=2)

print("JSON 化完了:", OUTPUT_JSON)

import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # github actions でも絶対パス取得
DATA_DIR = os.path.join(BASE_DIR, '..', 'wrgg-frontend/public/data')

# --- チャンピオンデータ関連 ---
CHAMPION_DIR = os.path.join(DATA_DIR, 'champion_data')
OUTPUT_DIR = os.path.join(DATA_DIR, 'AI')
os.makedirs(OUTPUT_DIR, exist_ok=True)

latest_data = {}
previous_data = {}

for file_name in os.listdir(CHAMPION_DIR):
    if not file_name.endswith('.json'):
        continue

    file_path = os.path.join(CHAMPION_DIR, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        champ_data = json.load(f)

    if 'patches' not in champ_data:
        print(f"{file_name} に patches がありません")
        continue

    patches = sorted(champ_data['patches'], key=lambda x: x['updatetime'])
    if len(patches) < 2:
        print(f"{file_name} はパッチが少なすぎます")
        continue

    champion_id = champ_data.get("id", file_name.replace('.json',''))
    previous_data[champion_id] = patches[-2]
    latest_data[champion_id] = patches[-1]

# 出力
with open(os.path.join(OUTPUT_DIR, 'previous_data.json'), 'w', encoding='utf-8') as f:
    json.dump(previous_data, f, ensure_ascii=False, indent=2)

with open(os.path.join(OUTPUT_DIR, 'latest_data.json'), 'w', encoding='utf-8') as f:
    json.dump(latest_data, f, ensure_ascii=False, indent=2)

print("latest_data.json と previous_data.json を作成しました")


# --- パッチノート関連 ---
PATCH_CONTENTS_JSON = os.path.join(DATA_DIR, 'patch_contents.json')  # 最新パッチ名を取得
OUTPUT_JSON = os.path.join(OUTPUT_DIR, 'patchnote_input.json')

# JSON 読み込み
with open(PATCH_CONTENTS_JSON, 'r', encoding='utf-8') as f:
    patch_notes = json.load(f)

# 最新パッチを探す
latest_patch_name = None
latest_date = None

for patch_name, patch_data in patch_notes.items():
    update_date_str = patch_data.get("update_date")
    if update_date_str:
        update_date = datetime.strptime(update_date_str, "%Y/%m/%d")
        if latest_date is None or update_date > latest_date:
            latest_date = update_date
            latest_patch_name = patch_name

if not latest_patch_name:
    raise ValueError("パッチ情報が見つかりませんでした")

# 最新パッチの内容を抽出して保存
latest_patch_data = patch_notes[latest_patch_name]

with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump({latest_patch_name: latest_patch_data}, f, ensure_ascii=False, indent=2)

print(f"最新パッチ {latest_patch_name} を {OUTPUT_JSON} に保存しました")

import os
from modeule import load_json, save_json

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) #githubactionsでの実行を考慮して、絶対パスを取得
DATA_DIR = os.path.join(BASE_DIR, '..', 'wrgg-frontend/public/data')

CHAMPIONS_JSON = os.path.join(DATA_DIR, 'champions.json') # チャンピオン一覧のJSON
CHAMPION_DIR = os.path.join(DATA_DIR,'champion_data')    # チャンピオン個別のディレクトリ

def delete_champion_data():
    for filename in os.listdir(CHAMPION_DIR):
        filepath = os.path.join(CHAMPION_DIR, filename)

        if not filename.endswith(".json"):
            continue

        data = load_json(filepath)

        if not data:
            continue

        patches = data.get("patches", [])

        if len(patches) <= 5:
            continue  # 5件以下ならスキップ

        # update時間で新しい順にソート
        patches_sorted = sorted(
            patches,
            key=lambda x: x.get("updatetime", ""),
            reverse=True
        )

        # 最新5件だけ残す
        trimmed = patches_sorted[:5]

        data["patches"] = trimmed
        save_json(filepath, data)

        print(f"{filename}: {len(patches)} → {len(trimmed)} に削減")

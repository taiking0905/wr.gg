import requests
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) #githubactionsでの実行を考慮して、絶対パスを取得
DATA_DIR = os.path.join(BASE_DIR, '..', 'wrgg-frontend/public/data')

CHAMPIONS_JSON = os.path.join(DATA_DIR, 'champions.json') # チャンピオン一覧のJSON
CHAMPION_DIR = os.path.join(DATA_DIR,'champion_data')    # チャンピオン個別のディレクトリ

def load_json(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def champion_lane():
    champions = load_json(CHAMPIONS_JSON)

    for champ in champions:
        champ_id = champ.get("id")
        champ_file = os.path.join(CHAMPION_DIR, f"{champ_id}.json")
        champ_json = load_json(champ_file)

        lanes = set()
        for entry in champ_json.get("data", []):
            lane = entry.get("lane")
            if lane:
                lanes.add(lane)

        # lanes が空でなければ追加
        if lanes:
            champ["lanes"] = sorted(list(lanes))  # ソートして配列にする

    # champions.json を上書き
    save_json(CHAMPIONS_JSON, champions)
    print("champions.json に lanes を追加しました")

def add_manual_lanes_bulk():
    # 使い方例
    lanes_dict = {
        "Nilah": ["ADC"]
    }
    champions = load_json(CHAMPIONS_JSON)

    for champion_id, lanes in lanes_dict.items():
        # 対象チャンピオンを探す
        target = next((c for c in champions if c.get("id") == champion_id), None)
        if not target:
            print(f"{champion_id} が champions.json に見つかりません")
            continue

        # lanes を追加
        target["lanes"] = sorted(list(set(lanes)))
        print(f"{champion_id} に lanes を追加しました: {target['lanes']}")

    # champions.json を上書き
    save_json(CHAMPIONS_JSON, champions)
    print("複数チャンピオンの lanes 追加が完了しました")




add_manual_lanes_bulk()

def main():
    champion_lane()

if __name__ =="__main__":
    main()

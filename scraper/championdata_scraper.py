import requests
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) #githubactionsでの実行を考慮して、絶対パスを取得
DATA_DIR = os.path.join(BASE_DIR, '..', 'wrgg-frontend/public/data')

CHAMPIONS_JSON = os.path.join(DATA_DIR, 'champions.json')# チャンピオンの名前を保存するJSONファイル
ALL_CHAMPIONS_DATA_JSON = os.path.join(DATA_DIR, 'all_champion_data.json')# チャンピオンの名前を保存するJSONファイル
def load_json(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)



def champion_data_scrape():
    champions = load_json(CHAMPIONS_JSON)

    url_hero_list = "https://game.gtimg.cn/images/lgamem/act/lrlib/js/heroList/hero_list.js"
    res = requests.get(url_hero_list)
    hero_list = res.json()["heroList"]
    name_to_heroId = {info["name"]: hero_id for hero_id, info in hero_list.items()}

    hero_id_map = {}
    for champ in champions:
        name_cn = champ.get("name_cn")
        hero_id = name_to_heroId.get(name_cn)
        if hero_id:
            hero_id_map[hero_id] = champ.get("id")

    url_stats = "https://mlol.qt.qq.com/go/lgame_battle_info/hero_rank_list_v2"
    response = requests.get(url_stats)
    data = response.json()["data"]

    save_dir = os.path.join(DATA_DIR, "champion_data")
    os.makedirs(save_dir, exist_ok=True)
    lane_map = {1: "MID", 2: "TOP", 3: "ADC", 4: "SUP", 5: "JG"}
    rank_map = {0: "Emerald", 1: "Diamond", 2: "Master", 3: "Challenger", 4: "Legendary_rank"}

    # 最新データのみ保持する辞書
    all_champions_data = {}

    for rank_num_str, lanes in data.items():
        rank_num = int(rank_num_str)
        for lane_num_str, champs in lanes.items():
            lane_num = int(lane_num_str)
            for champ in champs:
                hero_id = champ["hero_id"]
                update_time = champ["dtstatdate"]
                update_time = datetime.strptime(update_time, "%Y%m%d").strftime("%Y/%m/%d")
                winrate = float(champ.get("win_rate", 0)) * 100
                pickrate = float(champ.get("appear_rate", 0)) * 100
                banrate = float(champ.get("forbid_rate", 0)) * 100

                champ_id = hero_id_map.get(hero_id, hero_id)
                champ_file = os.path.join(save_dir, f"{champ_id}.json")

                # 個別ファイルは従来通り更新（過去データも保持）
                if os.path.exists(champ_file):
                    champ_data_existing = load_json(champ_file)
                else:
                    champ_data_existing = {
                        "id": champ_id,
                        "name_ja": next((c["name_ja"] for c in champions if c["id"] == champ_id), None),
                        "data": []
                    }

                # updatetime + rank + lane の組み合わせで重複チェック
                if not any(
                    d["updatetime"] == update_time and d["rank"] == rank_map.get(rank_num) and d["lane"] == lane_map.get(lane_num)
                    for d in champ_data_existing["data"]
                ):
                    champ_data_existing["data"].append({
                        "updatetime": update_time,
                        "lane": lane_map.get(lane_num, lane_num),
                        "rank": rank_map.get(rank_num, rank_num),
                        "winrate": winrate,
                        "pickrate": pickrate,
                        "banrate": banrate
                    })

                # 個別ファイル保存
                save_json(champ_file, champ_data_existing)

                # 全体データには rank/lane を問わず最新データを追加
                if champ_id not in all_champions_data:
                    all_champions_data[champ_id] = {
                        "id": champ_id,
                        "name_ja": next((c["name_ja"] for c in champions if c["id"] == champ_id), None),
                        "data": []
                    }

                # 重複チェック（updatetime + rank + lane が同じなら追加しない）
                if not any(
                    d["updatetime"] == update_time and d["rank"] == rank_map.get(rank_num) and d["lane"] == lane_map.get(lane_num)
                    for d in all_champions_data[champ_id]["data"]
                ):
                    all_champions_data[champ_id]["data"].append({
                        "updatetime": update_time,
                        "lane": lane_map.get(lane_num, lane_num),
                        "rank": rank_map.get(rank_num, rank_num),
                        "winrate": winrate,
                        "pickrate": pickrate,
                        "banrate": banrate
                    })

    # 全チャンピオンの最新データをまとめて保存
    save_json(ALL_CHAMPIONS_DATA_JSON, list(all_champions_data.values()))

    print(f"データを{update_time}の更新をしました。")


def main():
    champion_data_scrape()


if __name__ =="__main__":
    main()
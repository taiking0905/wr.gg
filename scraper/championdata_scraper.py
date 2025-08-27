import requests
import json
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__)) #githubactionsでの実行を考慮して、絶対パスを取得
DATA_DIR = os.path.join(BASE_DIR, '..', 'wrgg-frontend/public/data')

CHAMPIONS_JSON = os.path.join(DATA_DIR, 'champions.json')# チャンピオンの名前を保存するJSONファイル

def load_json(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # ====== 1. champion.json と hero_list.js を紐付け ======
    # champion.json の例（実際はファイルから読み込み）
    champion_json = load_json(CHAMPIONS_JSON)
    # hero_list.js を取得
    url_hero_list = "https://game.gtimg.cn/images/lgamem/act/lrlib/js/heroList/hero_list.js"
    res = requests.get(url_hero_list)
    hero_list = res.json()["heroList"]

def champion_data_scrape():
    # name_cn → hero_id 辞書
    name_to_heroId = {info["name"]: hero_id for hero_id, info in hero_list.items()}

    # champion.json に hero_id を追加
    hero_id_map = {}
    for champ in champion_json:
        name_cn = champ.get("name_cn")
        hero_id = name_to_heroId.get(name_cn)

    # ====== 2. 中国版 API から勝率データ取得 ======
    url_stats = "https://mlol.qt.qq.com/go/lgame_battle_info/hero_rank_list_v2"
    response = requests.get(url_stats)
    data = response.json()['data']

    # ====== 3. champions_summary にまとめる ======

    champions_summary = {}

    for rank_num_str, lanes in data.items():
        rank_num = int(rank_num_str)
        for lane_num_str, champs in lanes.items():
            lane_num = int(lane_num_str)
            for champ in champs:
                hero_id = champ['hero_id']
                winrate = float(champ.get('win_rate', 0)) * 100
                pickrate = float(champ.get('appear_rate', 0)) * 100
                banrate = float(champ.get('forbid_rate', 0)) * 100

                champ_id = hero_id_map.get(hero_id, hero_id)
                if champ_id not in champions_summary:
                    champions_summary[champ_id] = []

                champions_summary[champ_id].append({
                    "rank": rank_num,
                    "lane": lane_num,
                    "winrate": winrate,
                    "pickrate": pickrate,
                    "banrate": banrate
                })

    # ====== 4. 保存 ======
    save_dir = os.path.join(DATA_DIR, 'champion_data')
    os.makedirs(save_dir, exist_ok=True)

    for champ_id, stats in champions_summary.items():
        file_path = os.path.join(save_dir, f"{champ_id}.json")
        # JSON形式で保存
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)

    print(f"{len(champions_summary)} 件のチャンピオンデータを {save_dir} に保存しました。")

def main():
    champion_data_scrape()


if __name__ =="__main__":
    main()
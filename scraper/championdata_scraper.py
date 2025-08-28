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



def champion_data_scrape():
    # ====== 1. champion.json と hero_list.js を紐付け ======
    champion_json = load_json(CHAMPIONS_JSON)

    # hero_list.js を取得
    url_hero_list = "https://game.gtimg.cn/images/lgamem/act/lrlib/js/heroList/hero_list.js"
    res = requests.get(url_hero_list)
    hero_list = res.json()["heroList"]

    # name_cn → hero_id 辞書
    name_to_heroId = {info["name"]: hero_id for hero_id, info in hero_list.items()}

    # champion.json に hero_id を追加
    hero_id_map = {}
    champ_name_map = {}
    for champ in champion_json:
        name_cn = champ.get("name_cn")
        hero_id = name_to_heroId.get(name_cn)
        if hero_id:
            hero_id_map[hero_id] = champ.get("id")
            champ_name_map[champ.get("id")] = champ.get("name_ja")

    # ====== 2. 中国版 API から勝率データ取得 ======
    url_stats = "https://mlol.qt.qq.com/go/lgame_battle_info/hero_rank_list_v2"
    response = requests.get(url_stats)
    data = response.json()["data"]

    # ====== 3. champions_summary にまとめる ======

    save_dir = os.path.join(DATA_DIR, 'champion_data')
    os.makedirs(save_dir, exist_ok=True)

    for rank_num_str, lanes in data.items():
        rank_num = int(rank_num_str)
        for lane_num_str, champs in lanes.items():
            lane_num = int(lane_num_str)
            for champ in champs:
                hero_id = champ['hero_id']
                update_time = champ['dtstatdate']
                winrate = float(champ.get('win_rate', 0)) * 100
                pickrate = float(champ.get('appear_rate', 0)) * 100
                banrate = float(champ.get('forbid_rate', 0)) * 100

                champ_id = hero_id_map.get(hero_id, hero_id)
                champ_file = os.path.join(save_dir, f"{champ_id}.json")

                # 既存データをロード or 初期化
                if os.path.exists(champ_file):
                    champ_data = load_json(champ_file)
                else:
                    champ_data = {
                        "id": champ_id,
                        "name_ja": champ_name_map.get(champ_id),
                        "data": []
                    }

                # 既に同じ updatetime があるかチェック
                if any(d["updatetime"] == update_time for d in champ_data["data"]):
                    continue  # 既存ならスキップ

                # 新規データ追加
                champ_data["data"].append({
                    "updatetime": update_time,
                    "lane": lane_num,
                    "rank": rank_num,
                    "winrate": winrate,
                    "pickrate": pickrate,
                    "banrate": banrate
                })

                # 保存
                save_json(champ_file, champ_data)

    print(f"{len(os.listdir(save_dir))} 件のチャンピオンデータを {save_dir} に保存しました。")


def main():
    champion_data_scrape()


if __name__ =="__main__":
    main()
import requests
from bs4 import BeautifulSoup
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import chromedriver_autoinstaller

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

# チャンピオン名の取得と保存
def fetch_champion_names():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    prefs = {"profile.managed_default_content_settings.images": 1}
    options.add_experimental_option("prefs", prefs)

    chromedriver_autoinstaller.install()

    driver = webdriver.Chrome(options=options)

    url = "https://wildrift.leagueoflegends.com/ja-jp/champions/"
    driver.get(url)
    time.sleep(10)  # ページが完全に読み込まれるまで待機
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    #スクレイピング
    # elements = soup.select('div[data-testid="character-card"]')
    elements = soup.select('a[href^="/ja-jp/champions/"][href$="/"]')
    champions = []
    for el in elements:
        href = el.get('href')
        name_div = el.select_one('div[data-testid="card-title"]')
        img_tag = el.select_one('img[data-testid="mediaImage"]')
        if href and name_div and img_tag and name_div.text.strip():
            parts = href.strip('/').split('/')
            champion_name_en = parts[-1]
            champion_name_ja = name_div.text.strip()
            img_url = img_tag.get("src")
            champions.append({
                "id": champion_name_en,
                "name_ja": champion_name_ja,
                "img_url": img_url
            })
        else:
            print(f"⚠️ スキップ: href={href}, name_div={name_div}, img_tag={img_tag}")

    return champions

def katakana_to_hiragana(text):
    return ''.join(
        chr(ord(char) - 0x60) if 'ァ' <= char <= 'ヶ' else char
        for char in text
    )

def update_champion_CN():
    try:
        champions = load_json(CHAMPIONS_JSON)

        # --- 最新パッチのチャンピオン情報を取得 ---
        versions_url = "https://ddragon.leagueoflegends.com/api/versions.json"
        latest_patch = requests.get(versions_url).json()[0]

        champion_url = f"https://ddragon.leagueoflegends.com/cdn/{latest_patch}/data/zh_CN/champion.json"
        champions_data = requests.get(champion_url).json()["data"]

        # --- id -> 中国語名 の辞書作成 ---
        id_to_cn = {champ_id.lower(): info["title"] for champ_id, info in champions_data.items()}

        # --- JSONに name_cn を追加 ---
        for champ in champions:
            champ_id = champ["id"].lower()
            if champ_id in id_to_cn:
                champ["name_cn"] = id_to_cn[champ_id]

        # --- 上書き保存 ---
        save_json(CHAMPIONS_JSON, champions)
        
        return {"success": True}
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return {"success": False, "error": str(e)}

def create_champion_jsons():
    # 保存フォルダを作成
    champion_data_dir = os.path.join(DATA_DIR, "champion_data")
    os.makedirs(champion_data_dir, exist_ok=True)

    # 既存のチャンピオンJSON読み込み
    champions = load_json(CHAMPIONS_JSON)

    for champ in champions:
        champ_id = champ["id"]
        champ_file = os.path.join(champion_data_dir, f"{champ_id}.json")

        initial_data = {
            "id": champ_id,
            "name_ja": champ.get("name_ja"),
            "date": [
                {
                    "date": None, 
                    "lane": None,
                    "rank": None,
                    "winrate": None,
                    "pickrate": None,
                    "banrate": None
                }
            ]
        }

        # ファイルがなければ作成
        if not os.path.exists(champ_file):
            save_json(champ_file, initial_data)




def update_champion_data():
    try:
        champions = fetch_champion_names()  # [{"id":..., "name_ja":...}, ...]

        # 既存JSONの件数をチェックしてスキップ
        try:
            existing = load_json(CHAMPIONS_JSON)
            if len(existing) == len(champions):
                print("既存JSONの件数と一致。更新をスキップします。")
                return {"success": True, "skipped": True}
        except FileNotFoundError:
            # ファイルがなければ無視して進む
            pass

        # ひらがな変換を追加
        for champ in champions:
            champ['kana'] = katakana_to_hiragana(champ['name_ja'])
        
        save_json(CHAMPIONS_JSON, champions)
        print(f"チャンピオン更新があったので修正しました")
        update_champion_CN()
        create_champion_jsons()
        return {"success": True, "skipped": False}
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return {"success": False, "error": str(e)}

def download_image(url, save_path):
    response = requests.get(url)
    response.raise_for_status()  # エラーがあれば例外発生
    with open(save_path, 'wb') as f:
        f.write(response.content)

def download_champion_images():
    champions = load_json(CHAMPIONS_JSON)
    save_dir = os.path.join(DATA_DIR, 'champion_images')
    os.makedirs(save_dir, exist_ok=True)

    for champ in champions:
        champ_id = champ["id"]
        img_url = champ["img_url"]
        save_path = os.path.join(save_dir, f"{champ_id}.png")

        if os.path.exists(save_path):
            continue

        try:
            download_image(img_url, save_path)
            print(f"{champ_id} の画像を保存しました。")
        except Exception as e:
            print(f"{champ_id} の画像取得に失敗しました: {e}")



def main():
    update_champion_data()
    download_champion_images()

if __name__ =="__main__":
    main()
import os
import json
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import chromedriver_autoinstaller


BASE_DIR = os.path.dirname(os.path.abspath(__file__)) #githubactionsでの実行を考慮して、絶対パスを取得
DATA_DIR = os.path.join(BASE_DIR, '..', 'wrgg-frontend/public/data')

PATCH_NOTES_JSON = os.path.join(DATA_DIR, 'patch_notes.json')# パッチノートの情報を保存するJSONファイル
CHAMPIONS_JSON = os.path.join(DATA_DIR, 'champions.json')# チャンピオンの名前を保存するJSONファイル
PATCH_CONTENTS_JSON = os.path.join(DATA_DIR, 'patch_contents.json')# パッチ内容の情報を保存するJSONファイル


def load_json(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# 画像ダウンロード関数
def download_image(url, save_path):
    response = requests.get(url)
    response.raise_for_status()
    with open(save_path, 'wb') as f:
        f.write(response.content)

# スクレイピング
def fetch_patch_notes():
    url = "https://wildrift.leagueoflegends.com/ja-jp/news/tags/patch-notes/"
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    patch_notes = []
    for a in soup.select("a[data-testid='articlefeaturedcard-component']"):
        patch_name_tag = a.select_one("div[data-testid='card-title']")
        patch_name = patch_name_tag.text.strip() if patch_name_tag else ""
        patch_link = "https://wildrift.leagueoflegends.com" + a.get("href", "")
        patch_notes.append({
            "patch_name": patch_name,
            "patch_link": patch_link
        })
    return list(reversed(patch_notes))  # 逆順にして古い順→新しい順に 



def update_patch_data():
    try:
        patch_data = fetch_patch_notes()

        existing_data = load_json(PATCH_NOTES_JSON)
        existing_links = {item["patch_link"] for item in existing_data}

        # 既存にないパッチだけ抽出して追加
        new_patches = [p for p in patch_data if p["patch_link"] not in existing_links]

        if new_patches:
            updated_data = existing_data + new_patches  # 既存の後ろに追加
            save_json(PATCH_NOTES_JSON, updated_data)
            print(f"{len(new_patches)} 件の新しいパッチを追加しました。")
        else:
            print("新しいパッチはありませんでした。")

        print("データの取得と更新が完了しました。")
        return {"success": True}
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return {"success": False, "error": str(e)}


# カタカナをひらがなに変換する関数
def katakana_to_hiragana(text):
    return ''.join(
        chr(ord(char) - 0x60) if 'ァ' <= char <= 'ヶ' else char
        for char in text
    )

# チャンピオン名の取得と保存
def fetch_champion_names():
    url = "https://wildrift.leagueoflegends.com/ja-jp/champions/"
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    elements = soup.select('a.sc-985df63-0.cGQgsO.sc-d043b2-0.bZMlAb')
    champions = []

    for el in elements:
        href = el.get('href')
        name_div = el.select_one('div.sc-ce9b75fd-0.lmZfRs')
        img_tag = el.select_one('img[data-testid="mediaImage"]')

        if href and name_div and name_div.text.strip():
            parts = href.strip('/').split('/')
            champion_name_en = parts[-1]
            champion_name_ja = name_div.text.strip()

            champions.append({
                "id": champion_name_en,
                "name_ja": champion_name_ja,
                "kana": katakana_to_hiragana(champion_name_ja),
                "filename": f"{champion_name_en}.png"  # ← 画像ファイル名のみ保持
            })

    return champions

def get_image_url(img_tag):
    for attr in ['src', 'data-src', 'data-lazy-src']:
        url = img_tag.get(attr)
        if url and not url.startswith('data:'):
            return url
    return None

def update_champion_data():
    options = Options()
    options.add_argument("--headless=new")  
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # 画像を読み込むように設定
    prefs = {"profile.managed_default_content_settings.images": 1}
    options.add_experimental_option("prefs", prefs)
    
    chromedriver_autoinstaller.install()
    driver = webdriver.Chrome(options=options)
    url = "https://wildrift.leagueoflegends.com/ja-jp/champions/"
    driver.get(url)

    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'img[data-testid="mediaImage"][src^="https"]'))
    )


    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    elements = soup.select('a.sc-985df63-0.cGQgsO.sc-d043b2-0.bZMlAb')
    champions = []

    for el in elements:
        href = el.get('href')
        name_div = el.select_one('div.sc-ce9b75fd-0.lmZfRs')
        img_tag = el.select_one('img[data-testid="mediaImage"]')

        if href and name_div and name_div.text.strip():
            parts = href.strip('/').split('/')
            champion_name_en = parts[-1]
            champion_name_ja = name_div.text.strip()

            img_url = get_image_url(img_tag)

            if not img_url:
                print(f"{champion_name_en} の画像が見つからなかったためスキップします。")
                continue

            champions.append({
                "id": champion_name_en,
                "name_ja": champion_name_ja,
                "kana": katakana_to_hiragana(champion_name_ja),
                "image_url": img_url,
                "filename": f"{champion_name_en}.png"
            })

    return champions




def update_patch_contents():
    try:
        raw_champions = fetch_champion_names()  # image_url付き
        save_dir = os.path.join(DATA_DIR, 'champion_images_official')
        os.makedirs(save_dir, exist_ok=True)

        champions_to_save = []  # JSONに保存するためのリスト

        for champ in raw_champions:
            champ_id = champ["id"]
            img_url = champ.get("image_url")
            save_path = os.path.join(save_dir, f"{champ_id}.png")

            if not img_url:
                print(f"{champ_id} の画像URLがありません。スキップ。")
                continue

            if os.path.exists(save_path):
                print(f"{champ_id} の画像は既に保存済みです。")
            else:
                try:
                    download_image(img_url, save_path)
                    print(f"{champ_id} の画像を保存しました。")
                except Exception as e:
                    print(f"{champ_id} の画像保存に失敗: {e}")
                    continue  # ダウンロード失敗時は保存対象から除外

            # image_urlを除いて保存用リストに追加
            champ.pop("image_url", None)
            champions_to_save.append(champ)

        # すべての保存が終わった後にJSONを書き出す
        save_json(CHAMPIONS_JSON, champions_to_save)
        print(f"{len(champions_to_save)} 件のチャンピオンデータを保存しました。")

        return {"success": True}

    except Exception as e:
        print(f"全体処理中にエラー: {e}")
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
        img_url = f"https://www.mobafire.com/images/champion/square/{champ_id}.png"
        save_path = os.path.join(save_dir, f"{champ_id}.png")

        # すでに画像が存在するならスキップ
        if os.path.exists(save_path):
            print(f"{champ_id} の画像は既に存在します。スキップします。")
            continue

        try:
            download_image(img_url, save_path)
            print(f"{champ_id} の画像を保存しました。")
        except Exception as e:
            print(f"{champ_id} の画像取得に失敗しました: {e}")




if __name__ == "__main__":
    update_patch_data()
    update_champion_data()
    update_patch_contents()
    download_champion_images()

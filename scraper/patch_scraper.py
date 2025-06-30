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

PATCH_NOTES_JSON = os.path.join(DATA_DIR, 'patch_notes.json')# パッチノートの情報を保存するJSONファイル
CHAMPIONS_JSON = os.path.join(DATA_DIR, 'champions.json')# チャンピオンの名前を保存するJSONファイル
PATCH_CONTENTS_JSON = os.path.join(DATA_DIR, 'patch_contents.json')# パッチ内容の情報を保存するJSONファイル

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


def load_json(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


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
    print(f"✅ fetch_champion_names: {len(elements)} 件のチャンピオンカードを検出")
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



def update_champion_data():
    try:
        champions = fetch_champion_names()  # [{"id":..., "name_ja":...}, ...]
        print(f"✅ update_champion_data: {len(champions)} 件取得")
        
        # ひらがな変換を追加
        for champ in champions:
            champ['kana'] = katakana_to_hiragana(champ['name_ja'])
        
        save_json(CHAMPIONS_JSON, champions)
        print(f"{len(champions)} 件のチャンピオン名を保存しました。")
        return {"success": True}
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return {"success": False, "error": str(e)}


# パッチ内容のスクレイピング
def fetch_patch_contents_for_patch(patch):
    patch_name = patch.get("patch_name", "")
    patch_link = patch.get("patch_link", "")
    changes = []

    if not patch_link:
        return changes

    try:
        response = requests.get(patch_link)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        container_elems = soup.select(".character-changes-container")

        for container in container_elems:
            champion_name = container.select_one(".character-name")
            champion_name = champion_name.text.strip() if champion_name else ""

            change_elems = container.select(".character-change")

            for change in change_elems:
                ability_title = change.select_one(".character-ability-title")
                change_details = change.select_one(".character-change-body")
                change_details_elem  = change.select_one(".character-change-body ul")

                ability_title_text = ability_title.text.strip() if ability_title else ""
                change_details_html = "".join(str(elem) for elem in change_details_elem) if change_details_elem else ""
                

                changes.append({
                    "champion_name": champion_name,
                    "patch_name": patch_name,
                    "ability_title": ability_title_text,
                    "change_details": change_details_html,
                })

    except Exception as e:
        print(f"Error fetching or parsing patch {patch_name} ({patch_link}): {e}")

    return changes


def update_patch_contents():
    patch_data = load_json(PATCH_NOTES_JSON)
    try:
        existing_contents = load_json(PATCH_CONTENTS_JSON)
        existing_patch_names = {item["patch_name"] for item in existing_contents}

        new_contents = []

        for patch in patch_data:
            if patch["patch_name"] not in existing_patch_names:
                patch_changes = fetch_patch_contents_for_patch(patch)
                new_contents.extend(patch_changes)

        if new_contents:
            updated_contents = existing_contents + new_contents
            save_json(PATCH_CONTENTS_JSON, updated_contents)
            print(f"{len(new_contents)} 件の新しいパッチ内容を追加しました。")
        else:
            print("追加する新しいパッチ内容はありませんでした。")

        return {"success": True}
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
            print(f"{champ_id} の画像は既に存在します。スキップします。")
            continue

        try:
            download_image(img_url, save_path)
            print(f"{champ_id} の画像を保存しました。")
        except Exception as e:
            print(f"{champ_id} の画像取得に失敗しました: {e}")


def main():
    update_patch_data()
    update_champion_data()
    update_patch_contents()
    download_champion_images()

if __name__ =="__main":
    main()
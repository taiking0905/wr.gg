import requests
from bs4 import BeautifulSoup
import json
import os

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
    url = "https://wildrift.leagueoflegends.com/ja-jp/champions/"
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    #スクレイピング
    elements = soup.select('a.sc-985df63-0.cGQgsO.sc-d043b2-0.bZMlAb')
    champions = []
    for el in elements:
        href = el.get('href')
        name_div = el.select_one('div.sc-ce9b75fd-0.lmZfRs')
        if href and name_div and name_div.text.strip():
            parts = href.strip('/').split('/')
            champion_name_en = parts[-1]
            champion_name_ja = name_div.text.strip()
            champions.append({
                "id": champion_name_en,
                "name_ja": champion_name_ja,
            })

    return champions

def katakana_to_hiragana(text):
    return ''.join(
        chr(ord(char) - 0x60) if 'ァ' <= char <= 'ヶ' else char
        for char in text
    )



def update_champion_data():
    try:
        champions = fetch_champion_names()  # [{"id":..., "name_ja":...}, ...]
        
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

                ability_title_text = ability_title.text.strip() if ability_title else ""
                change_details_text = change_details.text.strip() if change_details else ""

                changes.append({
                    "champion_name": champion_name,
                    "patch_name": patch_name,
                    "ability_title": ability_title_text,
                    "change_details": change_details_text,
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



if __name__ == "__main__":
    update_patch_data()
    update_champion_data()
    update_patch_contents()

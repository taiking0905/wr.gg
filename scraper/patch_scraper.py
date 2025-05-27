import requests
from bs4 import BeautifulSoup
import json
import os

PATCH_NOTES_JSON = "../data/patch_notes.json"
CHAMPIONS_JSON = "../data/champions.json"
PATCH_CONTENTS_JSON = "../data/patch_contents.json"

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


def fetch_champion_names():
    url = "https://wildrift.leagueoflegends.com/ja-jp/champions/"
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    champion_names = []
    elements = soup.select('a.sc-985df63-0.cGQgsO.sc-d043b2-0.bZMlAb')
    for el in elements:
        name_div = el.select_one('div.sc-ce9b75fd-0.lmZfRs')
        if name_div and name_div.text.strip():
            champion_names.append(name_div.text.strip())

    return champion_names

def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_champion_data():
    try:
        champion_names = fetch_champion_names()
        save_json(CHAMPIONS_JSON, champion_names)
        print(f"{len(champion_names)} 件のチャンピオン名を保存しました。")
        return {"success": True}
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return {"success": False, "error": str(e)}

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

def load_json(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_json(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_patch_contents(patch_data):
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

    patch_data = load_json("../data/patch_notes.json") 
    update_patch_contents(patch_data)

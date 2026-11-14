import httpx
import json
import os

headers = {'User-Agent': 'KrushiMitraDatasetBot/1.0 (contact: pratyush.rath21@gmail.com)'}

pests = [
    ("Nilaparvata lugens", "brown_planthopper", "Brown planthopper"),
    ("Scirpophaga incertulas", "yellow_stem_borer", "Yellow stem borer"),
    ("Cnaphalocrocis medinalis", "leaf_folder", "Rice leaf folder"),
    ("Dicladispa armigera", "rice_hispa", "Rice hispa"),
    ("Mythimna separata", "rice_armyworm", "Rice armyworm")
]

for taxon, folder, cname in pests:
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch={taxon.replace(' ', '+')}&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata|size|mime&format=json"
    try:
        r = httpx.get(url, headers=headers, timeout=20)
        pages = r.json().get('query', {}).get('pages', {})
        print(f"\n================ {taxon} ({folder}) : {len(pages)} images found ================")
        for pid, p in pages.items():
            title = p.get('title')
            ii = p.get('imageinfo', [{}])[0]
            url_img = ii.get('url')
            mime = ii.get('mime')
            meta = ii.get('extmetadata', {})
            lic = meta.get('LicenseShortName', {}).get('value', 'Unknown')
            artist = meta.get('Artist', {}).get('value', 'Unknown')
            # clean artist html
            artist_clean = artist.replace('<p>', '').replace('</p>', '').replace('<i>', '').replace('</i>', '')[:40]
            print(f"File: {title}")
            print(f"  URL: {url_img}")
            print(f"  Mime: {mime} | License: {lic} | Author: {artist_clean}")
    except Exception as e:
        print(f"Error querying {taxon}: {e}")

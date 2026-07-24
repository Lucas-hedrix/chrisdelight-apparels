import os
import re
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import time

assets_dir = r"C:\Users\Lucas\Documents\chrisApparels\src\assets"

# 1. Cleanup old files
print("Cleaning up old scraped files...")
for f in os.listdir(assets_dir):
    if f.startswith('hoodie_') or f.startswith('tshirt_') or f.startswith('gown_') or f == 'hero_bg.jpg':
        try:
            os.remove(os.path.join(assets_dir, f))
        except:
            pass

headers = {'User-Agent': 'Mozilla/5.0'}

image_urls = []
visited = set()

def fetch_page(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html)
            for img in imgs:
                img = img.replace('&amp;', '&')
                if 'wp-content/uploads' in img and not 'avatar' in img and not 'icon' in img and not 'logotype' in img.lower():
                    # Bypass CDN and get original res
                    clean_url = img.split('?')[0]
                    if clean_url.startswith('https://i0.wp.com/'):
                        clean_url = clean_url.replace('https://i0.wp.com/', 'https://')
                    
                    if clean_url not in visited:
                        visited.add(clean_url)
                        image_urls.append(clean_url)
            
            # find next pages
            links = re.findall(r'href=["\'](https://hingees\.com/product-category/t-shirts/page/[0-9]+/)["\']', html)
            links += re.findall(r'href=["\'](https://hingees\.com/apparel/page/[0-9]+/)["\']', html)
            return list(set(links))
    except Exception as e:
        print(f"Failed {url}: {e}")
        return []

print("Crawling Hingees...")
queue = ["https://hingees.com/product-category/t-shirts/", "https://hingees.com/apparel/"]
pages_visited = set()

while queue and len(image_urls) < 60:
    url = queue.pop(0)
    if url in pages_visited: continue
    pages_visited.add(url)
    print("Fetching", url)
    new_links = fetch_page(url)
    for l in new_links:
        if l not in pages_visited:
            queue.append(l)
    time.sleep(1)

print(f"Found {len(image_urls)} unique high-res product images.")

tshirt_urls = []
cargo_urls = []

for u in image_urls:
    u_lower = u.lower()
    if 'pant' in u_lower or 'sweat' in u_lower or 'jogger' in u_lower or 'bottom' in u_lower:
        cargo_urls.append(u)
    else:
        tshirt_urls.append(u)

# If we don't have enough, just split them
if len(cargo_urls) < 19:
    needed = 19 - len(cargo_urls)
    cargo_urls.extend(tshirt_urls[:needed])
    tshirt_urls = tshirt_urls[needed:]

print(f"Tshirts: {len(tshirt_urls)}, Cargo Pants: {len(cargo_urls)}")

def download(url, filename):
    filepath = os.path.join(assets_dir, filename)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

# Download Tshirts
count = 0
for u in tshirt_urls:
    if count >= 19: break
    if download(u, f"tshirt_{count+1}.jpg"):
        count += 1
while count < 19:
    # duplicate
    source = os.path.join(assets_dir, "tshirt_1.jpg")
    target = os.path.join(assets_dir, f"tshirt_{count+1}.jpg")
    with open(source, 'rb') as f1, open(target, 'wb') as f2:
        f2.write(f1.read())
    count += 1

# Download Cargos
count = 0
for u in cargo_urls:
    if count >= 19: break
    if download(u, f"cargo_{count+1}.jpg"):
        count += 1
while count < 19:
    # duplicate
    source = os.path.join(assets_dir, "cargo_1.jpg")
    target = os.path.join(assets_dir, f"cargo_{count+1}.jpg")
    if os.path.exists(source):
        with open(source, 'rb') as f1, open(target, 'wb') as f2:
            f2.write(f1.read())
    count += 1

# Hero bg
if len(tshirt_urls) > 0:
    download(tshirt_urls[0], "hero_bg.jpg")
else:
    with open(os.path.join(assets_dir, "tshirt_1.jpg"), 'rb') as f1, open(os.path.join(assets_dir, "hero_bg.jpg"), 'wb') as f2:
        f2.write(f1.read())

print("Finished downloading images!")

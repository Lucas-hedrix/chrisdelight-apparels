import os
import re
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import time

assets_dir = r"C:\Users\Lucas\Documents\chrisApparels\src\assets"
base_url = "https://justclothing.com.ng/"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}

visited_urls = set()
urls_to_visit = [base_url, base_url + "shop/", base_url + "product-category/t-shirts/", base_url + "product-category/hoodies/"]
image_urls = set()

print("Crawling for image URLs...")

while urls_to_visit and len(image_urls) < 70:
    url = urls_to_visit.pop(0)
    if url in visited_urls:
        continue
    visited_urls.add(url)
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Find images
            # Look for src, data-src, etc.
            imgs = re.findall(r'(?:src|data-src|data-lazy-src)=["\']([^"\']+\.(?:jpg|jpeg|png|webp))(?:\?[^"\']*)?["\']', html, re.IGNORECASE)
            for img in imgs:
                img_url = urllib.parse.urljoin(url, img)
                # Filter out obvious icons/logos if possible based on path/name
                if 'logo' not in img_url.lower() and 'icon' not in img_url.lower() and 'avatar' not in img_url.lower():
                    image_urls.add(img_url)
            
            # Find more links
            links = re.findall(r'href=["\'](https://justclothing\.com\.ng/[^"\']+)["\']', html)
            for link in links:
                if link not in visited_urls and link not in urls_to_visit:
                    urls_to_visit.append(link)
                    
            print(f"Scraped {url}. Found {len(image_urls)} unique images so far.")
            
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        
    time.sleep(1) # Be nice to the server

print(f"\nFound total {len(image_urls)} candidate images.")

# Now download them
images_needed = {
    'hero_bg': 1,
    'hoodie': 19,
    'tshirt': 19,
    'gown': 19
}

counts = {
    'hero_bg': 0,
    'hoodie': 0,
    'tshirt': 0,
    'gown': 0
}

def get_category_for_img(url, default_cat):
    url_lower = url.lower()
    if 'hoodie' in url_lower: return 'hoodie'
    if 't-shirt' in url_lower or 'shirt' in url_lower: return 'tshirt'
    if 'gown' in url_lower or 'dress' in url_lower: return 'gown'
    return default_cat

downloaded = 0
image_urls_list = list(image_urls)

for img_url in image_urls_list:
    if all(counts[k] >= images_needed[k] for k in counts):
        break
        
    # Decide category
    cat = 'hero_bg' if counts['hero_bg'] < 1 else get_category_for_img(img_url, None)
    
    if cat is None:
        # Assign to whatever needs it
        if counts['tshirt'] < images_needed['tshirt']: cat = 'tshirt'
        elif counts['hoodie'] < images_needed['hoodie']: cat = 'hoodie'
        elif counts['gown'] < images_needed['gown']: cat = 'gown'
        else: continue
        
    if counts[cat] >= images_needed[cat]:
        # Fallback if preferred category is full
        if counts['tshirt'] < images_needed['tshirt']: cat = 'tshirt'
        elif counts['hoodie'] < images_needed['hoodie']: cat = 'hoodie'
        elif counts['gown'] < images_needed['gown']: cat = 'gown'
        else: continue

    idx = counts[cat] + 1
    ext = '.jpg' # Just save everything as jpg for consistency unless we parse it perfectly
    if img_url.lower().endswith('.png'): ext = '.png'
    elif img_url.lower().endswith('.webp'): ext = '.webp'
    
    filename = f"{cat}.jpg" if cat == 'hero_bg' else f"{cat}_{idx}{ext}"
    filepath = os.path.join(assets_dir, filename)
    
    try:
        req = urllib.request.Request(img_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response, open(filepath, 'wb') as out_file:
            data = response.read()
            if len(data) > 10000: # Ignore tiny images (likely icons/thumbnails)
                out_file.write(data)
                counts[cat] += 1
                downloaded += 1
                print(f"Downloaded {filename} ({len(data)} bytes)")
            else:
                print(f"Skipped {img_url} (too small: {len(data)} bytes)")
    except Exception as e:
        print(f"Failed to download {img_url}: {e}")

print(f"\nFinished downloading {downloaded} images.")
for cat, count in counts.items():
    print(f"{cat}: {count}/{images_needed[cat]}")

# If we didn't get enough, just duplicate some to meet the quota so Vite doesn't break
for cat in ['hoodie', 'tshirt', 'gown']:
    while counts[cat] > 0 and counts[cat] < images_needed[cat]:
        source = os.path.join(assets_dir, f"{cat}_1.jpg") # Assuming at least 1 exists
        if not os.path.exists(source): 
            # try to find first existing
            for i in range(1, counts[cat]+1):
                if os.path.exists(os.path.join(assets_dir, f"{cat}_{i}.jpg")):
                    source = os.path.join(assets_dir, f"{cat}_{i}.jpg")
                    break
        target = os.path.join(assets_dir, f"{cat}_{counts[cat]+1}.jpg")
        try:
            with open(source, 'rb') as f_src, open(target, 'wb') as f_dst:
                f_dst.write(f_src.read())
            counts[cat] += 1
            print(f"Duplicated {source} to {target} to meet quota")
        except Exception as e:
            print(f"Failed to duplicate {source}: {e}")
            break


import urllib.request
import re

urls = [
    "https://hingees.com/product-category/t-shirts/",
    "https://hingees.com/product-category/bottoms/",
    "https://hingees.com/apparel/"
]

headers = {'User-Agent': 'Mozilla/5.0'}

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            # Extract product images - WooCommerce usually has <img class="attachment-woocommerce_thumbnail ... src="...">
            imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html)
            # Filter ones that might be products
            product_imgs = [img for img in imgs if 'wp-content/uploads' in img and not 'avatar' in img and not 'icon' in img]
            print(f"{url}: Found {len(product_imgs)} images.")
            for img in product_imgs[:5]:
                print(" -", img)
    except Exception as e:
        print(f"Failed {url}: {e}")

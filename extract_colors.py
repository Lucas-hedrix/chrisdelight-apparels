import os
import math
from PIL import Image

def get_color_name(rgb):
    colors = {
        'Red': (255, 0, 0),
        'Green': (0, 255, 0),
        'Blue': (0, 0, 255),
        'Yellow': (255, 255, 0),
        'Cyan': (0, 255, 255),
        'Magenta': (255, 0, 255),
        'White': (255, 255, 255),
        'Black': (0, 0, 0),
        'Gray': (128, 128, 128),
        'Orange': (255, 165, 0),
        'Pink': (255, 192, 203),
        'Brown': (165, 42, 42),
        'Purple': (128, 0, 128),
        'Navy': (0, 0, 128),
        'Teal': (0, 128, 128),
        'Olive': (128, 128, 0),
        'Maroon': (128, 0, 0)
    }
    
    min_dist = float('inf')
    closest_name = 'Black'
    
    for name, crgb in colors.items():
        dist = math.sqrt(sum((a - b)**2 for a, b in zip(rgb, crgb)))
        if dist < min_dist:
            min_dist = dist
            closest_name = name
            
    return closest_name

assets_dir = r"C:\Users\Lucas\Documents\chrisApparels\src\assets"
all_files = os.listdir(assets_dir)
wrapper_files = sorted([f for f in all_files if f.startswith('IMG_') and f.endswith('.PNG')])

wrapper_colors = {}

for f in wrapper_files:
    path = os.path.join(assets_dir, f)
    try:
        img = Image.open(path)
        img = img.convert("RGBA")
        img = img.resize((100, 100))
        colors = img.getcolors(10000)
        valid_colors = [c for c in colors if c[1][3] > 200]
        
        if not valid_colors:
            wrapper_colors[f] = ['Multicolor']
            continue
            
        valid_colors.sort(key=lambda x: x[0], reverse=True)
        
        bg_colors = []
        for c in valid_colors:
            rgb = c[1][:3]
            # skip large white/transparent backgrounds
            if rgb[0]>240 and rgb[1]>240 and rgb[2]>240:
                continue 
            name = get_color_name(rgb)
            if name not in bg_colors:
                bg_colors.append(name)
            if len(bg_colors) >= 2:
                break
                
        # fallback to white if everything was white
        if not bg_colors:
            bg_colors = ['White']
            
        wrapper_colors[f] = bg_colors
        print(f"{f}: {bg_colors}")
    except Exception as e:
        print(f"Error on {f}: {e}")
        wrapper_colors[f] = ['Multicolor']

rebuild_script = f"""import os

assets_dir = r"C:\\Users\\Lucas\\Documents\\chrisApparels\\src\\assets"
ts_file_path = r"C:\\Users\\Lucas\\Documents\\chrisApparels\\src\\data\\products.ts"

all_files = set(os.listdir(assets_dir))

wrapper_files = sorted([f for f in all_files if f.startswith('IMG_') and f.endswith('.PNG')])

lines = []

for i, f in enumerate(wrapper_files):
    lines.append(f"import img_wrapper_{{i+1}} from '../assets/{{f}}';")

lines.append("")
lines.append("export interface Product {{")
lines.append("  id: string;")
lines.append("  name: string;")
lines.append("  price: number;")
lines.append("  image: string;")
lines.append("  availableSizes: string[];")
lines.append("  availableColors: string[];")
lines.append("  category: string;")
lines.append("}}")
lines.append("")
lines.append("export interface CartItem {{")
lines.append("  id: string;")
lines.append("  product: Product;")
lines.append("  size: string;")
lines.append("  color: string;")
lines.append("  quantity: number;")
lines.append("}}")
lines.append("")

lines.append("export const products: Product[] = [")

id_counter = 1
wrapper_colors_map = {wrapper_colors}

for i, f in enumerate(wrapper_files):
    colors = wrapper_colors_map.get(f, ['Multicolor'])
    colors_str = repr(colors)
    lines.append(f"  {{{{ id: '{{id_counter}}', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_{{i+1}}, availableSizes: ['One Size'], availableColors: {{colors_str}}, category: 'wrapper' }}}},")
    id_counter += 1

lines.append("];")

with open(ts_file_path, "w") as out:
    out.write("\\n".join(lines) + "\\n")

print("Regenerated products.ts with actual extracted colors.")
"""

with open(r"C:\Users\Lucas\Documents\chrisApparels\extract_and_rebuild.py", "w") as f:
    f.write(rebuild_script)

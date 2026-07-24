import os

assets_dir = r"C:\Users\Lucas\Documents\chrisApparels\src\assets"
ts_file_path = r"C:\Users\Lucas\Documents\chrisApparels\src\data\products.ts"

all_files = set(os.listdir(assets_dir))

wrapper_files = sorted([f for f in all_files if f.startswith('IMG_') and f.endswith('.PNG')])

lines = []

for i, f in enumerate(wrapper_files):
    lines.append(f"import img_wrapper_{i+1} from '../assets/{f}';")

lines.append("")
lines.append("export interface Product {")
lines.append("  id: string;")
lines.append("  name: string;")
lines.append("  price: number;")
lines.append("  image: string;")
lines.append("  availableSizes: string[];")
lines.append("  availableColors: string[];")
lines.append("  category: string;")
lines.append("}")
lines.append("")
lines.append("export interface CartItem {")
lines.append("  id: string;")
lines.append("  product: Product;")
lines.append("  size: string;")
lines.append("  color: string;")
lines.append("  quantity: number;")
lines.append("}")
lines.append("")

lines.append("export const products: Product[] = [")

id_counter = 1
wrapper_colors_map = {'IMG_6229.PNG': ['Pink', 'Gray'], 'IMG_6230.PNG': ['Yellow', 'Pink'], 'IMG_6231.PNG': ['White', 'Gray'], 'IMG_6233.PNG': ['Gray', 'Black'], 'IMG_6234.PNG': ['Gray', 'Teal'], 'IMG_6235.PNG': ['Black', 'Brown'], 'IMG_6236.PNG': ['Pink', 'Gray'], 'IMG_6237.PNG': ['Pink', 'White'], 'IMG_6238.PNG': ['Gray', 'White'], 'IMG_6239.PNG': ['Gray', 'White'], 'IMG_6240.PNG': ['Gray', 'Olive'], 'IMG_6241.PNG': ['Gray', 'Pink'], 'IMG_6242.PNG': ['Gray', 'Brown'], 'IMG_6243.PNG': ['Pink', 'Gray'], 'IMG_6244.PNG': ['Pink', 'Gray'], 'IMG_6245.PNG': ['Gray', 'Purple'], 'IMG_6246.PNG': ['Gray', 'Brown'], 'IMG_6247.PNG': ['White', 'Black'], 'IMG_6248.PNG': ['Gray', 'Pink']}

for i, f in enumerate(wrapper_files):
    colors = wrapper_colors_map.get(f, ['Multicolor'])
    colors_str = repr(colors)
    lines.append(f"  {{ id: '{id_counter}', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_{i+1}, availableSizes: ['One Size'], availableColors: {colors_str}, category: 'wrapper' }},")
    id_counter += 1

lines.append("];")

with open(ts_file_path, "w") as out:
    out.write("\n".join(lines) + "\n")

print("Regenerated products.ts with actual extracted colors.")

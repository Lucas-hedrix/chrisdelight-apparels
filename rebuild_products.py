import os

assets_dir = r"C:\Users\Lucas\Documents\chrisApparels\src\assets"
ts_file_path = r"C:\Users\Lucas\Documents\chrisApparels\src\data\products.ts"

all_files = set(os.listdir(assets_dir))

wrapper_files = sorted([f for f in all_files if f.startswith('IMG_') and f.endswith('.PNG')])
tshirt_files = sorted([f for f in all_files if f.startswith('tshirt_')], key=lambda x: int(x.split('_')[1].split('.')[0]))
cargo_files = sorted([f for f in all_files if f.startswith('cargo_')], key=lambda x: int(x.split('_')[1].split('.')[0]))

lines = []

# Generate all imports dynamically
for i, f in enumerate(wrapper_files):
    lines.append(f"import img_wrapper_{i+1} from '../assets/{f}';")
for i, f in enumerate(tshirt_files):
    lines.append(f"import img_tshirt_{i+1} from '../assets/{f}';")
for i, f in enumerate(cargo_files):
    lines.append(f"import img_cargo_{i+1} from '../assets/{f}';")

# Interfaces
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

# Array
lines.append("export const products: Product[] = [")

id_counter = 1

for i, f in enumerate(wrapper_files):
    lines.append(f"  {{ id: '{id_counter}', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_{i+1}, availableSizes: ['One Size'], availableColors: ['Black', 'White'], category: 'wrapper' }},")
    id_counter += 1

# for i, f in enumerate(tshirt_files):
#     lines.append(f"  {{ id: '{id_counter}', name: 'Hingees Premium T-Shirt', price: 40, image: img_tshirt_{i+1}, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White', 'Gray'], category: 't-shirt' }},")
#     id_counter += 1

# for i, f in enumerate(cargo_files):
#     lines.append(f"  {{ id: '{id_counter}', name: 'Hingees Cargo Pants', price: 65, image: img_cargo_{i+1}, availableSizes: ['30', '32', '34', '36'], availableColors: ['Olive', 'Black', 'Khaki'], category: 'cargo-pants' }},")
#     id_counter += 1

lines.append("];")

with open(ts_file_path, "w") as out:
    out.write("\n".join(lines) + "\n")

print("Regenerated products.ts successfully based on existing files.")

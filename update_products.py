import os
import re

product_ts_path = r"C:\Users\Lucas\Documents\chrisApparels\src\data\products.ts"

with open(product_ts_path, 'r') as f:
    content = f.read()

# Add category to Product interface
content = re.sub(r'availableColors: string\[\];\n\}', r"availableColors: string[];\n  category: string;\n}", content)

# Add category to existing items
content = re.sub(r'(availableColors: \[\'Black\', \'White\'\] )\}', r"\1, category: 'wrapper' }", content)

# Generate new imports and products
imports = []
new_products = []
id_counter = 20

categories = ['hoodie', 'tshirt', 'gown']
for cat in categories:
    for i in range(1, 20):
        img_name = f"{cat}_{i}.jpg"
        var_name = f"img_{cat}_{i}"
        imports.append(f"import {var_name} from '../assets/{img_name}';")
        
        name = f"{cat.capitalize()} {i}"
        price = 60 if cat == 'hoodie' else (40 if cat == 'tshirt' else 120)
        
        new_products.append(f"  {{ id: '{id_counter}', name: '{name}', price: {price}, image: {var_name}, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White', 'Gray'], category: '{cat}' }},")
        id_counter += 1

# Insert imports
import_block = "\n".join(imports)
content = content.replace("export interface Product", f"{import_block}\n\nexport interface Product")

# Insert products
products_block = "\n".join(new_products)
content = content.replace("];\n", f"{products_block}\n];\n")

with open(product_ts_path, 'w') as f:
    f.write(content)

print("Updated products.ts")

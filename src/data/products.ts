export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  availableSizes: string[];
  availableColors: string[];
  category: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export const products: Product[] = [
  { 
    id: '1', 
    name: 'Vintage Wash Wrapper', 
    price: 85, 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 
    availableSizes: ['One Size'], 
    availableColors: ['Pink', 'Gray'], 
    category: 'wrapper' 
  },
  { 
    id: '2', 
    name: 'Everyday Essentials Tee', 
    price: 45, 
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 
    availableSizes: ['S', 'M', 'L', 'XL'], 
    availableColors: ['Black', 'White'], 
    category: 't-shirts' 
  },
  { 
    id: '3', 
    name: 'Heavyweight Cargo Pants', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', 
    availableSizes: ['S', 'M', 'L', 'XL'], 
    availableColors: ['Olive', 'Black'], 
    category: 'cargo' 
  },
  { 
    id: '4', 
    name: 'Premium Hoodie', 
    price: 95, 
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 
    availableSizes: ['S', 'M', 'L', 'XL'], 
    availableColors: ['Gray', 'Black'], 
    category: 'hoodies' 
  },
  { 
    id: '5', 
    name: 'Utility Vest', 
    price: 110, 
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', 
    availableSizes: ['M', 'L'], 
    availableColors: ['Black', 'Beige'], 
    category: 'outerwear' 
  },
  { 
    id: '6', 
    name: 'Relaxed Fit Jeans', 
    price: 130, 
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', 
    availableSizes: ['30', '32', '34', '36'], 
    availableColors: ['Light Blue', 'Washed Black'], 
    category: 'denim' 
  },
  { 
    id: '7', 
    name: 'Oversized Graphic Tee', 
    price: 55, 
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', 
    availableSizes: ['S', 'M', 'L', 'XL'], 
    availableColors: ['White', 'Off-White'], 
    category: 't-shirts' 
  },
  { 
    id: '8', 
    name: 'Minimalist Track Pants', 
    price: 75, 
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80', 
    availableSizes: ['S', 'M', 'L'], 
    availableColors: ['Black', 'Navy'], 
    category: 'pants' 
  }
];

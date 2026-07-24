import img_wrapper_1 from '../assets/IMG_6229.PNG';
import img_wrapper_2 from '../assets/IMG_6230.PNG';
import img_wrapper_3 from '../assets/IMG_6231.PNG';
import img_wrapper_4 from '../assets/IMG_6233.PNG';
import img_wrapper_5 from '../assets/IMG_6234.PNG';
import img_wrapper_6 from '../assets/IMG_6235.PNG';
import img_wrapper_7 from '../assets/IMG_6236.PNG';
import img_wrapper_8 from '../assets/IMG_6237.PNG';
import img_wrapper_9 from '../assets/IMG_6238.PNG';
import img_wrapper_10 from '../assets/IMG_6239.PNG';
import img_wrapper_11 from '../assets/IMG_6240.PNG';
import img_wrapper_12 from '../assets/IMG_6241.PNG';
import img_wrapper_13 from '../assets/IMG_6242.PNG';
import img_wrapper_14 from '../assets/IMG_6243.PNG';
import img_wrapper_15 from '../assets/IMG_6244.PNG';
import img_wrapper_16 from '../assets/IMG_6245.PNG';
import img_wrapper_17 from '../assets/IMG_6246.PNG';
import img_wrapper_18 from '../assets/IMG_6247.PNG';
import img_wrapper_19 from '../assets/IMG_6248.PNG';

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
  { id: '1', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_1, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '2', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_2, availableSizes: ['One Size'], availableColors: ['Yellow', 'Pink'], category: 'wrapper' },
  { id: '3', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_3, availableSizes: ['One Size'], availableColors: ['White', 'Gray'], category: 'wrapper' },
  { id: '4', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_4, availableSizes: ['One Size'], availableColors: ['Gray', 'Black'], category: 'wrapper' },
  { id: '5', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_5, availableSizes: ['One Size'], availableColors: ['Gray', 'Teal'], category: 'wrapper' },
  { id: '6', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_6, availableSizes: ['One Size'], availableColors: ['Black', 'Brown'], category: 'wrapper' },
  { id: '7', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_7, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '8', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_8, availableSizes: ['One Size'], availableColors: ['Pink', 'White'], category: 'wrapper' },
  { id: '9', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_9, availableSizes: ['One Size'], availableColors: ['Gray', 'White'], category: 'wrapper' },
  { id: '10', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_10, availableSizes: ['One Size'], availableColors: ['Gray', 'White'], category: 'wrapper' },
  { id: '11', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_11, availableSizes: ['One Size'], availableColors: ['Gray', 'Olive'], category: 'wrapper' },
  { id: '12', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_12, availableSizes: ['One Size'], availableColors: ['Gray', 'Pink'], category: 'wrapper' },
  { id: '13', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_13, availableSizes: ['One Size'], availableColors: ['Gray', 'Brown'], category: 'wrapper' },
  { id: '14', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_14, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '15', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_15, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '16', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_16, availableSizes: ['One Size'], availableColors: ['Gray', 'Purple'], category: 'wrapper' },
  { id: '17', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_17, availableSizes: ['One Size'], availableColors: ['Gray', 'Brown'], category: 'wrapper' },
  { id: '18', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_18, availableSizes: ['One Size'], availableColors: ['White', 'Black'], category: 'wrapper' },
  { id: '19', name: 'Vintage Wash Wrapper', price: 85, image: img_wrapper_19, availableSizes: ['One Size'], availableColors: ['Gray', 'Pink'], category: 'wrapper' },
];

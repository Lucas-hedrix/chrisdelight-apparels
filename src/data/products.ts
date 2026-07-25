import img_1 from '../assets/wrappers/IMG_6229.PNG';
import img_2 from '../assets/wrappers/IMG_6230.PNG';
import img_3 from '../assets/wrappers/IMG_6231.PNG';
import img_4 from '../assets/wrappers/IMG_6233.PNG';
import img_5 from '../assets/wrappers/IMG_6234.PNG';
import img_6 from '../assets/wrappers/IMG_6235.PNG';
import img_7 from '../assets/wrappers/IMG_6236.PNG';
import img_8 from '../assets/wrappers/IMG_6237.PNG';
import img_9 from '../assets/wrappers/IMG_6238.PNG';
import img_10 from '../assets/wrappers/IMG_6239.PNG';
import img_11 from '../assets/wrappers/IMG_6240.PNG';
import img_12 from '../assets/wrappers/IMG_6241.PNG';
import img_13 from '../assets/wrappers/IMG_6242.PNG';
import img_14 from '../assets/wrappers/IMG_6243.PNG';
import img_15 from '../assets/wrappers/IMG_6244.PNG';
import img_16 from '../assets/wrappers/IMG_6245.PNG';
import img_17 from '../assets/wrappers/IMG_6246.PNG';
import img_18 from '../assets/wrappers/IMG_6247.PNG';
import img_19 from '../assets/wrappers/IMG_6248.PNG';
import img_20 from '../assets/Tshirts/T-shirts.jpg';
import img_21 from '../assets/Tshirts/Tshirts.jpg';
import img_22 from '../assets/Tshirts/cargo_15.jpg';
import img_23 from '../assets/Tshirts/tshirt_1.jpg';
import img_24 from '../assets/Tshirts/tshirt_10.jpg';
import img_25 from '../assets/Tshirts/tshirt_12.jpg';
import img_26 from '../assets/Tshirts/tshirt_16.jpg';
import img_27 from '../assets/Tshirts/tshirt_18.jpg';
import img_28 from '../assets/Tshirts/tshirt_2.jpg';
import img_29 from '../assets/Tshirts/tshirt_3.jpg';
import img_30 from '../assets/Tshirts/tshirt_5.jpg';
import img_31 from '../assets/Tshirts/tshirt_7.jpg';
import img_32 from '../assets/Tshirts/tshirt_9.jpg';
import img_33 from '../assets/Pants/cargo_1.jpg';
import img_34 from '../assets/Pants/cargo_10.jpg';
import img_35 from '../assets/Pants/cargo_11.jpg';
import img_36 from '../assets/Pants/cargo_14.jpg';
import img_37 from '../assets/Pants/cargo_4.jpg';
import img_38 from '../assets/Pants/cargo_6.jpg';
import img_39 from '../assets/Pants/cargo_7.jpg';
import img_40 from '../assets/Pants/cargo_8.jpg';
import img_41 from '../assets/Pants/cargo_9.jpg';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  availableSizes: string[];
  availableColors: string[];
  category: string;
  subCategory?: string;
  newArrivalExpiresAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export const products: Product[] = [
  { id: '1', name: 'Vintage Wash Wrapper', price: 85, image: img_1, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '2', name: 'Vintage Wash Wrapper', price: 85, image: img_2, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '3', name: 'Vintage Wash Wrapper', price: 85, image: img_3, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '4', name: 'Vintage Wash Wrapper', price: 85, image: img_4, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '5', name: 'Vintage Wash Wrapper', price: 85, image: img_5, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '6', name: 'Vintage Wash Wrapper', price: 85, image: img_6, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '7', name: 'Vintage Wash Wrapper', price: 85, image: img_7, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '8', name: 'Vintage Wash Wrapper', price: 85, image: img_8, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '9', name: 'Vintage Wash Wrapper', price: 85, image: img_9, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '10', name: 'Vintage Wash Wrapper', price: 85, image: img_10, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '11', name: 'Vintage Wash Wrapper', price: 85, image: img_11, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '12', name: 'Vintage Wash Wrapper', price: 85, image: img_12, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '13', name: 'Vintage Wash Wrapper', price: 85, image: img_13, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '14', name: 'Vintage Wash Wrapper', price: 85, image: img_14, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '15', name: 'Vintage Wash Wrapper', price: 85, image: img_15, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '16', name: 'Vintage Wash Wrapper', price: 85, image: img_16, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '17', name: 'Vintage Wash Wrapper', price: 85, image: img_17, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '18', name: 'Vintage Wash Wrapper', price: 85, image: img_18, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '19', name: 'Vintage Wash Wrapper', price: 85, image: img_19, availableSizes: ['One Size'], availableColors: ['Pink', 'Gray'], category: 'wrapper' },
  { id: '20', name: 'Everyday Essentials Tee', price: 45, image: img_20, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '21', name: 'Everyday Essentials Tee', price: 45, image: img_21, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '22', name: 'Everyday Essentials Tee', price: 45, image: img_22, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '23', name: 'Everyday Essentials Tee', price: 45, image: img_23, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '24', name: 'Everyday Essentials Tee', price: 45, image: img_24, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '25', name: 'Everyday Essentials Tee', price: 45, image: img_25, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '26', name: 'Everyday Essentials Tee', price: 45, image: img_26, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '27', name: 'Everyday Essentials Tee', price: 45, image: img_27, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '28', name: 'Everyday Essentials Tee', price: 45, image: img_28, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '29', name: 'Everyday Essentials Tee', price: 45, image: img_29, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '30', name: 'Everyday Essentials Tee', price: 45, image: img_30, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '31', name: 'Everyday Essentials Tee', price: 45, image: img_31, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '32', name: 'Everyday Essentials Tee', price: 45, image: img_32, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Black', 'White'], category: 't-shirts' },
  { id: '33', name: 'Heavyweight Joggers', price: 120, image: img_33, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '34', name: 'Heavyweight Joggers', price: 120, image: img_34, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '35', name: 'Heavyweight Joggers', price: 120, image: img_35, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '36', name: 'Heavyweight Joggers', price: 120, image: img_36, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '37', name: 'Heavyweight Joggers', price: 120, image: img_37, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '38', name: 'Heavyweight Joggers', price: 120, image: img_38, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '39', name: 'Heavyweight Joggers', price: 120, image: img_39, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '40', name: 'Heavyweight Joggers', price: 120, image: img_40, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
  { id: '41', name: 'Heavyweight Joggers', price: 120, image: img_41, availableSizes: ['S', 'M', 'L', 'XL'], availableColors: ['Olive', 'Black'], category: 'joggers' },
];

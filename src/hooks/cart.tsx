import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
// import { Product } from 'src/pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const jsonProducts = await AsyncStorage.getItem('@GoMP:products');
      setProducts(jsonProducts != null ? JSON.parse(jsonProducts) : '');
    }
    loadProducts();
    // console.log(products);
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.findIndex(
        element => element.id === product.id,
      );

      if (productExists >= 0) {
        products[productExists].quantity += 1;
      } else {
        products.push({ ...product, quantity: 1 });
      }

      setProducts([...products]);

      await AsyncStorage.setItem('@GoMP:products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productExists = products.findIndex(element => element.id === id);

      if (productExists >= 0) {
        products[productExists].quantity += 1;
      }

      setProducts([...products]);

      await AsyncStorage.setItem('@GoMP:products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productExists = products.findIndex(element => element.id === id);

      if (productExists >= 0) {
        if (products[productExists].quantity > 1) {
          products[productExists].quantity -= 1;
          setProducts([...products]);
        } else {
          const newProducts = products.filter(element => element.id !== id);
          setProducts([...newProducts]);
        }
      }
      await AsyncStorage.setItem('@GoMP:products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

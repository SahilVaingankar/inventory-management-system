import { create } from "zustand";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface Store {
  allProducts: Product[] | [];
  filteredProducts: Product[] | [];
  setProducts: (products: Product[]) => void;
  filterSuggestions: (query: string) => void;
  cartPageQuantity: number;
  setCartPageQuantity: (quantity: number) => void;
}

export const useStore = create<Store>((set, get) => ({
  allProducts: [],
  filteredProducts: [],

  setProducts: (products) =>
    set({ allProducts: products, filteredProducts: products }),

  filterSuggestions: (query: string) => {
    const { allProducts } = get();
    const filtered = allProducts.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
    set({ filteredProducts: filtered });
  },

  cartPageQuantity: 1,
  setCartPageQuantity: (quantity) => set({ cartPageQuantity: quantity }),
}));

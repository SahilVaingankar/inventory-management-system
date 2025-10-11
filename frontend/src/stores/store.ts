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
  darkMode: boolean;
  toggleMode: () => void;
  login: boolean;
  setLogin: (state: boolean) => void;
  userData: any;
  setUserData: (state: any) => void;
}

export const useStore = create<Store>((set, get) => ({
  login: false,
  setLogin: (state) => set({ login: state }),

  darkMode:
    localStorage.getItem("darkMode") !== null
      ? localStorage.getItem("darkMode") === "true"
      : window.matchMedia("(prefers-color-scheme: dark)").matches,

  toggleMode: () => {
    set((state) => {
      const newMode = !state.darkMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("darkMode", newMode.toString());
        document.documentElement.classList.toggle("dark", newMode);
      }
      return { darkMode: newMode };
    });
  },

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

  userData: "",
  setUserData: (data) => set({ userData: data }),
}));

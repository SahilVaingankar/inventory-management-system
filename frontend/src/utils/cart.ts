interface CartItems {
  inStock?: boolean;
  name: string;
  price: number;
  quantity?: number;
}

export const addToCart = (item: CartItems, quantity?: number) => {
  const storedCartItems = localStorage.getItem("cartItems");
  const cartItems: CartItems[] = storedCartItems
    ? JSON.parse(storedCartItems)
    : [];

  const itemExists = cartItems.some((cartItem) => cartItem.name === item.name);

  const updatedCart = itemExists
    ? cartItems.map((cartItem) =>
        cartItem.name === item.name
          ? { ...cartItem, quantity: cartItem.quantity! + (quantity || 1) }
          : cartItem
      )
    : [...cartItems, { ...item, quantity: item.quantity ?? (quantity || 1) }];

  localStorage.setItem("cartItems", JSON.stringify(updatedCart));
};

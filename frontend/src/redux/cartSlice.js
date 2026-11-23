import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.productId === item.productId,
      );
      if (existItem) {
        existItem.qty = (Number(existItem.qty) || 0) + (Number(item.qty) || 1);
      } else {
        state.cartItems.push({ ...item, qty: Number(item.qty) || 1 });
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    setCartItemQty: (state, action) => {
      const { productId, qty } = action.payload;
      const item = state.cartItems.find(
        (cartItem) => cartItem.productId === productId,
      );
      if (item && qty > 0) {
        item.qty = qty;
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.productId !== action.payload,
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },
  },
});

export const { addToCart, setCartItemQty, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

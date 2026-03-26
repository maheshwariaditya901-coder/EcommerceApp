import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: [], // array of objects { product, quantity }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const payload = action.payload || {};
            console.log("Action payload", payload);
            const product = payload.product || payload.Product || payload;
            const quantityToAdd = payload.Quantity || payload.quantity || 1;

            const getItemProduct = (item) => item.product || item.Product || item;
            const getItemId = (item) => {
                const itemProduct = getItemProduct(item);
                return item.ProductId || item.productId || itemProduct.Id || itemProduct.id;
            };
            const getItemQty = (item) => item.Quantity || item.quantity || 0;

            const existingItem = state.cartItems.find(item => {
                const itemId = getItemId(item);
                const newId = payload.ProductId || payload.productId || product.Id || product.id;
                return itemId === newId && itemId !== undefined;
            });
            const stock = payload.Stock || payload.stock || product.Stock || product.stock;
            
            if (existingItem) {
                // Respect stock only when stock is available in the payload.
                const existingQty = getItemQty(existingItem);
                if (stock === undefined || existingQty + quantityToAdd <= stock) {
                    if ('Quantity' in existingItem || !('quantity' in existingItem)) {
                        existingItem.Quantity = existingQty + quantityToAdd;
                    }
                    if ('quantity' in existingItem) {
                        existingItem.quantity = existingQty + quantityToAdd;
                    }
                } else {
                    if ('Quantity' in existingItem || !('quantity' in existingItem)) {
                        existingItem.Quantity = stock;
                    }
                    if ('quantity' in existingItem) {
                        existingItem.quantity = stock;
                    }
                }   
            } else {
                state.cartItems.push( payload );
            }
        },
        removeFromCart: (state, action) => {
            const removingId = action.payload;  
            state.cartItems = state.cartItems.filter(item => {
                 
                const itemProduct = item.product || item.Product || item;
                const itemId = item.ProductId || item.productId || itemProduct.Id || itemProduct.id;
                return itemId !== removingId;
            });
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const existingItem = state.cartItems.find(item => {
                const itemProduct = item.product || item.Product || item;
                const itemId = item.ProductId || item.productId || itemProduct.Id || itemProduct.id;
                return itemId === id;
            });
            
            if (existingItem) {
                const itemProduct = existingItem.product || existingItem.Product || existingItem;
                const stock = existingItem.Stock || existingItem.stock || itemProduct.Stock || itemProduct.stock || 0;
                if (quantity > 0 && quantity <= stock) {
                    if ('Quantity' in existingItem || !('quantity' in existingItem)) {
                        existingItem.Quantity = quantity;
                    }
                    if ('quantity' in existingItem) {
                        existingItem.quantity = quantity;
                    }
                }
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
        },
        setCart: (state, action) => {
            // Replaces the whole cart with the payload fetched from the API
            const mergedCart = [];
            action.payload.forEach(incomingItem => {
                const incomingProduct = incomingItem.product || incomingItem.Product || incomingItem;
                const incomingId = incomingItem.ProductId || incomingItem.productId || incomingProduct.Id || incomingProduct.id;
                
                const existing = mergedCart.find(localItem => {
                    const localProduct = localItem.product || localItem.Product || localItem;
                    const localId = localItem.ProductId || localItem.productId || localProduct.Id || localProduct.id;
                    return localId === incomingId && localId !== undefined;
                });

                if (existing) {
                    // Update quantity by summing them
                    const existingQty = existing.Quantity || existing.quantity || 0;
                    const incomingQty = incomingItem.Quantity || incomingItem.quantity || 0;
                    if ('Quantity' in existing || !('quantity' in existing)) {
                        existing.Quantity = existingQty + incomingQty;
                    }
                    if ('quantity' in existing) {
                        existing.quantity = existingQty + incomingQty;
                    }
                } else {
                    mergedCart.push(incomingItem);
                }
            });
            state.cartItems = mergedCart;
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;

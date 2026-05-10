import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: { 
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clerkId: {
        type: String,
        required: true,
        unique: true, // we are making a connection between our clerk dashboard and our database
    },
    items: [cartItemSchema],
});

export const Cart = mongoose.model("Cart", cartSchema);
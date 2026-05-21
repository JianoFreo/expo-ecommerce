import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId, // this is a refrence to the product model
        ref: 'Product',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // this is a reference to the user model
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // this is a reference to the order model
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        default: "",
    },
    images: [{
        type: String,
    }],
    verifiedPurchase: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);
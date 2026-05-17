import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },// the price of the product at the time of the order, because the price of the product can change in the future, but we want to keep the price of the product at the time of the order, so that we can calculate the total price of the order correctly.
    // for example youu ordered a product worth $100, it should show to your history that it is 100 dollars
    // even if the pricec went up because you only paid 100 dollars
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    image: {
        type: String,
        required: true,
    },
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    streetAddress: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clerkId: {
        type: String,
        required: true, // we are making a connection between our clerk dashboard and our database
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        type: shippingAddressSchema,
        required: true,
    },
    paymentResult: {
        id: String,
        status: String,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
        default: 'pending',
    },
    deliveredAt: {
        type: Date,
    },
    shippedAt: {
        type: Date,
    },
}, { timestamps: true });


export const Order = mongoose.model("Order", orderSchema);
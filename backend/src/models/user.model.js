import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    imageURL:{
        type: String,
        default: '',
    },
    clerkId: {
        type: String,
        required: true,
        unique: true, // we are making a connection between our clerk dashboard and our database
    },
    addresses: [],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
}, { timestamps: true });   
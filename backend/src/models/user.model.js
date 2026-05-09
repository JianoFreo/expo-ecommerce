import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
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
    isDefault: {
        type: Boolean,
        default: false,
    },
/* `}, { timestamps: true });` in Mongoose schema options is used to enable timestamps for the
document. When timestamps are set to true, Mongoose will automatically add `createdAt` and
`updatedAt` fields to the document. */
}, { timestamps: true });

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
    addresses: [addressSchema], // this is gonna be an array of address objects, because a user can have multiple addresses, 
    // and we are using the addressSchema to define the structure of each address object in the array
// ==============this relational database in action===============, 
// we are embedding the address schema inside the user schema, so that we can easily access the addresses of a user when we fetch the user data from the database.

    wishlist: [{ // this wish list is gonna be an array of product ids, from the product table [2,31,4,53,1]

        /* This part of the user schema in Mongoose is defining a field named `wishlist` that will
        store an array of ObjectIds referencing documents in the 'Product' collection. */

        // we would make another model for products and we would store the product id in the wishlist array of the user model,
        //  so that we can easily fetch the products that the user has added to their wishlist.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
}, { timestamps: true });   


export const User = mongoose.model('User', userSchema);

// we dont have to export the address schema because we are embedding it inside the user schema, 
// so we can access it through the user model.

// the address schema is not a separate collection in the database, 
// it is just a subdocument of the user document, so we dont need to create a separate model for it.
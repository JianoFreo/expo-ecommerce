import { User } from "../models/user.model.js";
import { Shop } from "../models/shop.model.js";
import { ENV } from "../config/env.js";

export async function getCurrentUserProfile(req, res) {
    try {
        const user = req.user;
        
        // Determine if user is super-admin
        const superAdminEmail = (ENV.ADMIN_EMAIL || 'magtangob65@gmail.com').toLowerCase();
        const isSuperAdmin = (user.email || '').toLowerCase() === superAdminEmail;
        if (isSuperAdmin && user.role !== 'super-admin') {
            user.role = 'super-admin';
            await user.save();
        }

        // Normalize legacy admin role to seller so old migrated sellers keep working.
        if (!isSuperAdmin && user.role === 'admin') {
            user.role = 'seller';
            await user.save();
        }

        // Get user's shop if they are a seller
        let shop = null;
        if (user.role === 'seller') {
            shop = await Shop.findOne({ owner: user._id });
        }

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                imageUrl: user.imageUrl,
                role: user.role,
                clerkId: user.clerkId,
                preferredTheme: user.preferredTheme || 'green',
            },
            shop: shop || null,
        });
    } catch (error) {
        console.error("Error in getCurrentUserProfile controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function promoteToSeller(req, res) {
    try {
        const user = req.user;

        if (user.role === 'super-admin') {
            return res.status(400).json({ error: "Super admin cannot be promoted to seller" });
        }

        const body = req.body || {};
        const fallbackName = user.name ? `${user.name}'s Shop` : 'My Shop';
        const rawShopName = typeof body.shopName === 'string' ? body.shopName.trim() : '';
        const shopName = rawShopName || fallbackName;

        // Update role to seller if needed (idempotent)
        if (user.role !== 'seller') {
            user.role = 'seller';
            await user.save();
        }

        // Ensure seller has a shop
        let shop = await Shop.findOne({ owner: user._id });
        if (!shop) {
            shop = await Shop.create({
                name: shopName,
                description: '',
                owner: user._id,
            });
        }

        res.status(200).json({
            message: "Seller account is ready",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            shop: shop.toObject(),
        });
    } catch (error) {
        console.error("Error in promoteToSeller controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function addAddress(req, res) {
    try {
        const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } =
            req.body;

        const user = req.user;

        if (!fullName || !streetAddress || !city || !state || !zipCode) {
            return res.status(400).json({ error: "Missing required address fields" });
        }

        // if this is set as default, unset all other defaults
        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }
        // user.addresses = [
        //     { city: "Manila", isDefault: true },
        //     { city: "Quezon", isDefault: false }
        // ];

        user.addresses.push({
            label,
            fullName,
            streetAddress,
            city,
            state,
            zipCode,
            phoneNumber,
            isDefault: isDefault || false,
        });

        await user.save();

        res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
    } catch (error) {
        console.error("Error in addAddress controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getAddresses(req, res) {
    try {
        const user = req.user;

        res.status(200).json({ addresses: user.addresses });
    } catch (error) {
        console.error("Error in getAddresses controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateAddress(req, res) {
    try {
        const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } =
            req.body;

        const { addressId } = req.params;

        const user = req.user;
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }

        // if this is set as default, unset all other defaults
        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        address.label = label || address.label;
        address.fullName = fullName || address.fullName;
        address.streetAddress = streetAddress || address.streetAddress;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zipCode = zipCode || address.zipCode;
        address.phoneNumber = phoneNumber || address.phoneNumber;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await user.save();

        res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
    } catch (error) {
        console.error("Error in updateAddress controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteAddress(req, res) {
    try {
        const { addressId } = req.params;
        const user = req.user;

        user.addresses.pull(addressId);
        await user.save();

        res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
    } catch (error) {
        console.error("Error in deleteAddress controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function addToWishlist(req, res) {
    try {
        const { productId } = req.body;
        const user = req.user;

        // check if product is already in the wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ error: "Product already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error in addToWishlist controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function removeFromWishlist(req, res) {
    try {
        const { productId } = req.params;
        const user = req.user;

        // check if product is already in the wishlist
        if (!user.wishlist.includes(productId)) {
            return res.status(400).json({ error: "Product not found in wishlist" });
        }

        user.wishlist.pull(productId);
        await user.save();

        res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error in removeFromWishlist controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getWishlist(req, res) {
    try {
        // we're using populate, bc wishlist is just an array of product ids
        const user = await User.findById(req.user._id).populate("wishlist");

        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        console.error("Error in getWishlist controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateProfile(req, res) {
    try {
        const { name, preferredTheme } = req.body;

        const user = req.user;

        if (!name && !preferredTheme) {
            return res.status(400).json({ error: "Nothing to update" });
        }

        if (name) user.name = name;
        if (preferredTheme) user.preferredTheme = preferredTheme;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                imageUrl: user.imageUrl,
                email: user.email,
                preferredTheme: user.preferredTheme || 'green',
            },
        });
    } catch (error) {
        console.error("Error in updateProfile controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function uploadAvatar(req, res) {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const cloudinary = (await import('../config/cloudinary.js')).default;
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'avatars' });

        const user = req.user;
        user.imageUrl = uploadResult.secure_url;
        await user.save();

        res.status(200).json({ message: 'Avatar uploaded', imageUrl: uploadResult.secure_url });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
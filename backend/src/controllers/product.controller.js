import { Product } from "../models/product.model.js";
import { Shop } from "../models/shop.model.js";
import { User } from "../models/user.model.js";

async function getPlatformStoreShop() {
    let shop = await Shop.findOne({ name: 'Platform Store' }).populate('owner', 'name email');

    if (shop) {
        return shop;
    }

    const adminUser = await User.findOne({ email: 'magtangob65@gmail.com' });
    if (!adminUser) {
        return null;
    }

    shop = await Shop.create({
        name: 'Platform Store',
        description: 'Default marketplace shop for existing products',
        owner: adminUser._id,
    });

    return shop.populate('owner', 'name email');
}

export async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate({ path: 'shop', populate: { path: 'owner', select: 'name email' } });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let normalizedProduct = product.toObject();

        if (!normalizedProduct.shop) {
            const defaultShop = await getPlatformStoreShop();
            normalizedProduct = {
                ...normalizedProduct,
                shop: defaultShop || null,
            };
        }

        res.status(200).json(normalizedProduct);

    } catch (error) {
        console.error("Error in getProductById controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
import { Product } from "../models/product.model.js";
import { getPlatformStoreShop } from "../lib/platformShop.js";
import { productResponse, productsResponse } from "../lib/serializers.js";

export async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate({ path: 'shop', populate: { path: 'owner', select: 'name email imageUrl role' } });
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

        res.status(200).json(productResponse(normalizedProduct));

    } catch (error) {
        console.error("Error in getProductById controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

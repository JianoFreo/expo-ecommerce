import cloudinary from '../config/cloudinary.js';
export async function createProduct(req, res) {
    try {
        const { name, description, price, stock, category } = req.body;

        if (!name || !description || !price || !stock || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }
        if (req.files.length > 3) {
            return res.status(400).json({ message: "Maximum 3 images allowed" });
        }
        const uploadPromises = req.files.map((file) => {
            return cloudinary.uploader.upload(file.path, {
                folder: "products",
            });
        });
        const uploadResults = await Promise.all(uploadPromises);
        // secure_url is the url of the uploaded image in cloudinary
        const imageUrls = uploadResults.map((result) => result.secure_url);
    } catch (error) {
    }
}

export async function getAllProducts(req, res) { }
export async function updateProduct(req, res) { }
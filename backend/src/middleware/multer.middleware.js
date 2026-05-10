import multer from 'multer';
import path from "path"

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        // 1. req
        // The Express request object
        // Same req you use in routes
        // Contains things like:
        // req.body
        // req.user
        // headers, etc.

        // 2. file
        // This is the uploaded file metadata object from Multer.

        // {
        //   fieldname: 'image',
        //   originalname: 'cat.png',
        //   encoding: '7bit',
        //   mimetype: 'image/png',
        //   size: 123456
        // }
        // file.originalname → original file name uploaded by user

        // 3. cb (callback)
        // This is how you return the filename to Multer.
        // Format: cb(error, filename)
        // First argument → error (use null if no error)
        // Second argument → the final filename to save
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

// filefilter: jpeg,jpg,png, webp,
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLocaleLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extname && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg,jpg,png,webp)"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

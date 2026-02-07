import multer from "multer";
import path from "path";
import fs from "fs";

// Factory function to create storage for different entities
const createStorage = (subfolder) => {
    const uploadDir = `uploads/${subfolder}`;
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
        },
    });
};

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

// Export specific uploaders
export const uploadPlayer = multer({ storage: createStorage("players"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
export const uploadTeam = multer({ storage: createStorage("teams"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
export const uploadSponsor = multer({ storage: createStorage("sponsors"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
export const uploadAuction = multer({ storage: createStorage("auctions"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

export const handleUpload = (uploader, fieldName) => {
    return (req, res, next) => {
        const upload = uploader.single(fieldName);

        upload(req, res, (err) => {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ message: "File size too large. Max limit is 5MB." });
                }
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
};

// Default export for backward compatibility (points to player upload)
export default uploadPlayer;

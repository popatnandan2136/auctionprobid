const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const createDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = (folderName) => multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, `../public/uploads/${folderName}`);
        createDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images are allowed (jpeg, jpg, png, gif, webp)"));
    }
};

const upload = multer({
    storage: storage('default'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Helper for specific folders
const uploadAuction = multer({
    storage: storage('auctions'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const handleUpload = (multerInstance, fieldName) => {
    return (req, res, next) => {
        multerInstance.single(fieldName)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
};

module.exports = {
    upload,
    uploadAuction,
    handleUpload
};

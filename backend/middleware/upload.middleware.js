import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

export const handleUpload = (multerInstance, fieldName) => {
    return multerInstance.single(fieldName);
};

export const uploadAuction = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = './uploads/auctions';
            if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
            cb(null, dir);
        },
        filename: (req, file, cb) => { cb(null, `${Date.now()}-${file.originalname}`); }
    })
});

export const uploadTeam = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = './uploads/teams';
            if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
            cb(null, dir);
        },
        filename: (req, file, cb) => { cb(null, `${Date.now()}-${file.originalname}`); }
    })
});

export const uploadPlayer = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = './uploads/players';
            if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
            cb(null, dir);
        },
        filename: (req, file, cb) => { cb(null, `${Date.now()}-${file.originalname}`); }
    })
});

export default upload;

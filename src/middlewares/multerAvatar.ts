// src/middleware/multerAvatar.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const avatarsDir = path.join(__dirname, "../../uploads/avatars");

// Crear carpeta si no existe
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedExt = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExt.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Archivo no permitido. Solo jpeg, jpg, png, webp."));
    }
  },
});

export default uploadAvatar;


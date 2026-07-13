import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getProfile, updateProfile, updatePassword, uploadAvatar } from '../controllers/user.controller';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/:userId', getProfile);
router.put('/:userId/profile', updateProfile);
router.put('/:userId/password', updatePassword);
router.post('/:userId/avatar', upload.single('avatar'), uploadAvatar);

export default router;

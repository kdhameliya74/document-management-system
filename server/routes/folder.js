import express from 'express';
import { createFolder, getFolders } from '../controllers/folderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, createFolder);
router.post('/all', protect, createFolder);


export default router;
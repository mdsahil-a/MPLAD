import express from 'express';
import { getMapData } from '../controllers/mapController.js';

const router = express.Router();

router.get('/', getMapData);

export default router;

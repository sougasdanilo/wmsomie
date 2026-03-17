// src/routes/index.js
import { Router } from 'express';
import * as stockController from '../controllers/stockController.js';
import * as pickingController from '../controllers/pickingController.js';

const router = Router();

router.post('/stock/inbound', stockController.inbound);
router.post('/stock/outbound', stockController.outbound);
router.post('/stock/transfer', stockController.transfer);
router.get('/picking/:orderId', pickingController.createPicking);
export default router;
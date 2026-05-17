import express from 'express';
import { MedicoController } from '../../../controllers/MedicoController.js';
import { MedicoService } from '../../../services/MedicoService.js';
import { notFoundHandler } from '../../../middlewares/notFoundHandler.js';
import { errorHandler } from '../../../middlewares/errorHandler.js';
import medicoRouter from '../../../routes/MedicoRouter.js';

export const buildTestApp = () => {
    const app = express();
    app.use(express.json());

    app.use('/medicos', medicoRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
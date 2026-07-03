import express from "express"
import { ObraSocialController } from "../controllers/ObraSocialController.js"
import { verificarToken } from "../middlewares/authMiddleware.js"

const obraSocialController = new ObraSocialController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => obraSocialController.findAllObraSocial(req, res, next))
    .post(verificarToken, (req, res, next) => obraSocialController.createObraSocial(req, res, next))


router.route('/planes')
    .get((req, res, next) => obraSocialController.findAllPlan(req, res, next))
    .post(verificarToken, (req, res, next) => obraSocialController.createPlan(req, res, next))

router.route('/planes/:id')
    .get((req, res, next) => obraSocialController.findByIdPlan(req, res, next))
    
router.route('/:id')
    .get((req, res, next) => obraSocialController.findByIdObraSocial(req, res, next))
    

router.route('/:id/plan')
    .get((req, res, next) => obraSocialController.findPlanByObraSocial(req, res, next))
    
export default router
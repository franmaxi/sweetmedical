import express from "express"
import { SedeController } from "../controllers/SedeController.js"

const sedeController = new SedeController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => sedeController.findAll(req, res, next))
    .post((req, res, next) => sedeController.create(req, res, next))

    router.route('/:id')
    .get((req, res, next) => sedeController.findById(req, res, next))

export default router
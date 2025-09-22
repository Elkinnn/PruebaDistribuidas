import { Request, Response } from "express";
import VehiculoUseCases from "../../../domain/use-cases/vehiculos";
import { VehiculoMapper } from "../../../infraestructure/mapper/vehiculo.mapper";
import { CustomError } from "../../../domain/errors/error.entity";

export class VehiculoController {
    constructor(
        private readonly usecase = new VehiculoUseCases.CRUD()
    ) {
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const vehiculos = await this.usecase.getAll()
            res.json(vehiculos)
        } catch (error) {
            res.json(error)
        }
    }

    getOne = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const _id = parseInt(id)
            const vehiculo = await this.usecase.get(_id)
            res.json(vehiculo)
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error)
            }
            res.status(500).json(error)
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const entity = new VehiculoMapper().toDomain(req.body)
            const vehiculos = await this.usecase.create(entity)
            res.json(vehiculos)
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error)
                return
            }
            res.status(500).json({ error: error })
        }
    }

    update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const _id = parseInt(id)
            const updated = await this.usecase.update(_id, req.body)
            res.json(updated)
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error)
                return
            }
            res.status(500).json({ error: error })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const _id = parseInt(id)
            const result = await this.usecase.delete(_id)
            res.json(result)
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error)
                return
            }
            res.status(500).json({ error: error })
        }
    }

}
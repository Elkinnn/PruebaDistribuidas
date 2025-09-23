import { Request, Response } from "express";
import { CRUDCitas } from "../../../domain/use-cases/citas/crud.usecase";
import { CustomError } from "../../../domain/errors/error.entity";
import { CitaMapper } from "../../../infraestructure/mapper/cita.mapper";

export class CitaController {
    constructor(
        private readonly usecase = new CRUDCitas()
    ) {
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const Citas = await this.usecase.getAll()
            res.json(Citas)
        } catch (error) {
            res.json(error)
        }
    }

    getOne = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const _id = parseInt(id)
            const Cita = await this.usecase.get(_id)
            res.json(Cita)
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error)
            }
            res.status(500).json(error)
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const entity = new CitaMapper().toDomain(req.body)
            const Citas = await this.usecase.create(entity)
            res.json(Citas)
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error)
                return
            }
            res.status(500).json({ error: error })
        }
    }

    // update = async (req: Request, res: Response) => {
    //     try {
    //         const { id } = req.params
    //         const _id = parseInt(id)
    //         const updated = await this.usecase.update(_id, req.body)
    //         res.json(updated)
    //     } catch (error) {
    //         if (error instanceof CustomError) {
    //             res.status(error.statusCode).json(error)
    //             return
    //         }
    //         res.status(500).json({ error: error })
    //     }
    // }

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
import { Request, Response } from "express";
import { CRUDCitas } from "../../../domain/use-cases/citas/crud.usecase";
import { CustomError } from "../../../domain/errors/error.entity";
import { CitaMapper } from "../../../infraestructure/mapper/cita.mapper";

export class CitaController {
    constructor(
    ) {
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;  // viene del middleware
            const usecase = new CRUDCitas(medico);

            const citas = await usecase.getAll();
            res.json(citas);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    getOne = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const usecase = new CRUDCitas(medico);

            const { id } = req.params;
            const cita = await usecase.get(parseInt(id));
            res.json(cita);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error);
                return;
            }
            res.status(500).json(error);
        }
    }


    update = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico
            const usecase = new CRUDCitas(medico)
            const { id } = req.params
            const _id = parseInt(id)
            const updated = await usecase.update(_id, req.body)
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
            const medico = (req as any).medico
            const usecase = new CRUDCitas(medico)
            const { id } = req.params
            const _id = parseInt(id)
            const result = await usecase.delete(_id)
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
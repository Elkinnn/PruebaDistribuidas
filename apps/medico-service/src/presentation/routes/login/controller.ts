import { Request, Response } from "express";
import { LoginUseCase } from "../../../domain/use-cases/login/login.usecase";
import { CustomError } from "../../../domain/errors/error.entity";

export class LoginController {
    constructor(
    ) {
    }
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const usecase = new LoginUseCase();
            const result = await usecase.JWTlogin(email, password);
            res.status(200).json(result);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            }
            res.status(500).json({ message: "Error interno en login", full: err });
        }
    }
}

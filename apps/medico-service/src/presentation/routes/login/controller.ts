import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { LoginUseCase } from "../../../domain/use-cases/login/login.usecase";
import { CustomError } from "../../../domain/errors/error.entity";
import { Usuario } from "../../../domain/entities/usuario.model";

interface LoginResponse {
    token: string;
    usuario: Usuario;
}

export class LoginController {
    constructor(
        private usecase = new LoginUseCase()
    ) {
    }
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const usuario = await this.usecase.JWTlogin(email, password);
            const payload = {
                id: usuario.id,
                rol: usuario.rol,
                email: usuario.email,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET || "secretKey123", {
                expiresIn: "2h",
            });
            res.status(200).json({ token, usuario });
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            }
            res.status(500).json({ message: "Error interno en login", full: err });
        }
    }

    me = async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) throw new Error("No hay token");
            const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secretKey123");
            const usuario = await this.usecase.me(payload.id);
            res.json(usuario);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            }
            res.status(500).json({ message: "Error interno en login", full: err });
        }
    }

    update = async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) throw new Error("No hay token");
            const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secretKey123");
            const usuario = await this.usecase.updateProfile(payload.id, req.body);
            res.json(usuario);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
            }
            res.status(500).json({ message: "Error al editar el perfil", full: err });
        }
    }
}

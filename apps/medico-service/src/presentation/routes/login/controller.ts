import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { LoginUseCase } from "../../../domain/use-cases/login/login.usecase";
import { CustomError } from "../../../domain/errors/error.entity";
import { Usuario } from "../../../domain/entities/usuario.model";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { MedicoModel } from "../../../data/models/medico.model";
import { MedicoMapper } from "../../../infraestructure/mapper/medico.mapper";
import { EntityRepository } from "../../../domain/repository/repository.entity";
import { Medico } from "../../../domain/entities/medico.entity";

interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        rol: string;
        medicoId?: number;
        nombre?: string;
        apellidos?: string;
        especialidades?: string[];
    };
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
            
            // Obtener información del médico si existe
            let medicoInfo = null;
            if (usuario.medicoId) {
                try {
                    const database = GlobalDatabase.getInstance().database;
                    const datasource = DatasourceFactory.generateRepository(database, MedicoModel);
                    if (datasource) {
                        const medicoRepository = new EntityRepository<Medico>(datasource, new MedicoMapper());
                        medicoInfo = await medicoRepository.findById(usuario.medicoId);
                    }
                } catch (error) {
                    console.log("Error obteniendo info del médico:", error);
                }
            }
            
            const payload = {
                id: usuario.id,
                rol: usuario.rol,
                email: usuario.email,
                medicoId: usuario.medicoId,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET || "secretKey123", {
                expiresIn: "2h",
            });
            
            const response: LoginResponse = {
                token,
                user: {
                    id: usuario.id,
                    email: usuario.email,
                    rol: usuario.rol,
                    medicoId: usuario.medicoId,
                    nombre: medicoInfo?.nombres || "Dr. Usuario",
                    apellidos: medicoInfo?.apellidos || "",
                    especialidades: [] // Se puede implementar después
                }
            };
            
            res.status(200).json(response);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
                return;
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
            
            // Obtener información del médico si existe
            let medicoInfo = null;
            if (usuario.medicoId) {
                try {
                    const database = GlobalDatabase.getInstance().database;
                    const datasource = DatasourceFactory.generateRepository(database, MedicoModel);
                    if (datasource) {
                        const medicoRepository = new EntityRepository<Medico>(datasource, new MedicoMapper());
                        medicoInfo = await medicoRepository.findById(usuario.medicoId);
                    }
                } catch (error) {
                    console.log("Error obteniendo info del médico:", error);
                }
            }
            
            const response = {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                medicoId: usuario.medicoId,
                nombre: medicoInfo?.nombres || "Dr. Usuario",
                apellidos: medicoInfo?.apellidos || "",
                especialidades: [], // Se puede implementar después
                hospital: "Hospital Central", // Se puede obtener de la BD después
                telefono: "",
                direccion: "",
                fechaIngreso: "Fecha de ingreso",
                diasTrabajo: ["Lun", "Mar", "Mié", "Jue", "Vie"],
                horario: "08:00 - 17:00"
            };
            
            res.json(response);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
                return;
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

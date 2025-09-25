import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { GlobalDatabase } from "../../infraestructure/datasource/datasource.global";
import { DatasourceFactory } from "../../infraestructure/datasource/datasource.factory";
import { UsuarioModel } from "../../data/models/usuario.model";
import { UsuarioMapper } from "../../infraestructure/mapper/usuario.mapper";
import { EntityRepository } from "../../domain/repository/repository.entity";
import { CustomError } from "../../domain/errors/error.entity";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new CustomError(401, "No hay token", null);

    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secretKey123");

    const database = GlobalDatabase.getInstance().database;
    const datasource = DatasourceFactory.generateRepository(database, UsuarioModel);
    const repository = new EntityRepository(datasource!, new UsuarioMapper());

    const usuario = await repository.findById(payload.id);
    if (!usuario) throw new CustomError(404, "Médico no encontrado", null);

    (req as any).medico = usuario;

    next();
  } catch (err) {
    res.status(401).json({ message: "Token inválido o expirado", error: err });
  }
};

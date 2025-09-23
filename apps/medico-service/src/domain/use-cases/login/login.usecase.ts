import jwt from "jsonwebtoken";
import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";
import { Usuario } from "../../entities/usuario.model";
import { UsuarioModel } from "../../../data/models/usuario.model";
import { UsuarioMapper } from "../../../infraestructure/mapper/usuario.mapper";

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export class LoginUseCase {
  private readonly repository: EntityRepository<Usuario>;

  constructor() {
    const database = GlobalDatabase.getInstance().database;
    const datasource = DatasourceFactory.generateRepository(database, UsuarioModel);
    if (!datasource) {
      throw new CustomError(400, "Repositorio no implementado", null);
    }
    const mapper = new UsuarioMapper();
    this.repository = new EntityRepository<Usuario>(datasource, mapper);
  }

  public async JWTlogin(email: string, password: string): Promise<LoginResponse> {
    const usuarios = await this.repository.findBy({ email: email });
    if (!usuarios) {
      throw new CustomError(401, "Credenciales inválidas", null);
    }
    if (usuarios.length > 1) {
      throw new CustomError(400, "Credenciales inválidas", null);
    }
    const usuario = usuarios[1]

    if (usuario.password !== password) {
      throw new CustomError(401, "Credenciales inválidas", null);
    }

    const payload = {
      id: usuario.id,
      rol: usuario.rol,
      email: usuario.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretKey123", {
      expiresIn: "2h",
    });

    return { token, usuario };
  }
}

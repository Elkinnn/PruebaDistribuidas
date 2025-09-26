import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";
import { Usuario } from "../../entities/usuario.model";
import { UsuarioModel } from "../../../data/models/usuario.model";
import { UsuarioMapper } from "../../../infraestructure/mapper/usuario.mapper";
import bcrypt from "bcrypt";

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

  public async JWTlogin(email: string, password: string): Promise<Usuario> {
    const usuarios = await this.repository.findBy({ email: email });
    if (!usuarios || usuarios.length != 1) {
      throw new CustomError(400, "Usuario no encontrado", null);
    }
    const usuario = usuarios[0]
    
    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new CustomError(401, "Usuario inactivo", null);
    }
    
    // Verificar que sea un médico
    if (usuario.rol !== "MEDICO") {
      throw new CustomError(401, "Acceso denegado. Solo médicos pueden acceder", null);
    }
    
    // Comparar password hasheado
    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      throw new CustomError(401, "Credenciales inválidas", null);
    }
    
    return usuario
  }

  public async me(id: number): Promise<Usuario> {
    try {
      const usuario = await this.repository.findById(id);
      if (!usuario) {
        throw new CustomError(404, "Usuario no encontrado", null);
      }
      return usuario
    } catch (err) {
      throw new CustomError(401, "Token inválido o expirado", err);
    }
  }

  public async updateProfile(id: number, updateData: Partial<Usuario>): Promise<Usuario> {
    const usuario = await this.repository.findById(id);
    if (!usuario) throw new CustomError(404, "Usuario no encontrado", null);
    const updated = { ...usuario, ...updateData };

    await this.repository.update(updated);
    return updated;
  }
}

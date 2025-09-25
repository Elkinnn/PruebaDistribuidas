import { UsuarioModel } from "../../data/models/usuario.model";
import { Usuario } from "../../domain/entities/usuario.model";
import { IMapper } from "./mapper.abstract";

export class UsuarioMapper extends IMapper<Usuario> {
    public toDomain(model: UsuarioModel): Usuario {
        return new Usuario(
            model.id ?? null,
            model.email,
            model.password,
            model.rol,
            model.activo,
            model.medicoId ? Number(model.medicoId) : undefined
        );
    }

    public toModel(entity: Usuario): UsuarioModel {
        const model = new UsuarioModel();
        model.id = entity.id;
        model.email = entity.email;
        model.password = entity.password;
        model.rol = entity.rol;
        model.activo = entity.activo;
        model.medicoId = entity.medicoId ? String(entity.medicoId) : null;
        return model;
    }
}

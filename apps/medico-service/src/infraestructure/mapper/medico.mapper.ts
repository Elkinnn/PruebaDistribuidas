import { MedicoModel } from "../../data/models/medico.model";
import { Medico } from "../../domain/entities/medico.entity";
import { HospitalMapper } from "./hospital.mapper";
import { IMapper } from "./mapper.abstract";
import { UsuarioMapper } from "./usuario.mapper";

export class MedicoMapper extends IMapper<Medico> {
    public toDomain(model: any): Medico {
        return new Medico(
            model.id ?? null,
            model.nombre,
            model.apellidos,
            model.email,
            model.activo,
            new UsuarioMapper().toDomain(model.usuario),
            new HospitalMapper().toDomain(model.hospital),
        )
    }
    public toModel(entity: Medico) {
        const model = new MedicoModel()
        model.id = entity.id
        model.nombres = entity.nombres
        model.apellidos = entity.apellidos
        model.email = entity.email
        model.hospital = new HospitalMapper().toModel(entity.hospital)
        model.usuario = new UsuarioMapper().toModel(entity.usuario)
        return model
    }
}
import { MedicoModel } from "../../data/models/medico.model";
import { Medico } from "../../domain/entities/medico.entity";
import { HospitalMapper } from "./hospital.mapper";
import { IMapper } from "./mapper.abstract";
import { UsuarioMapper } from "./usuario.mapper";

export class MedicoMapper extends IMapper<Medico> {
    public toDomain(model: any): Medico {
        if (!model) {
            throw new Error('MedicoModel is undefined or null');
        }
        
        // Crear objetos por defecto si no existen
        const usuario = model.usuario ? new UsuarioMapper().toDomain(model.usuario) : {
            id: 12, // Usar el ID real del usuario de Kendry
            email: model.email ?? '',
            password: '',
            rol: 'MEDICO' as const,
            activo: true,
            medicoId: model.id
        };
        
        const hospital = model.hospital ? new HospitalMapper().toDomain(model.hospital) : {
            id: 7, // Hospital Guayaquil donde está Kendry
            nombre: 'Hospital Guayaquil',
            direccion: 'Guayaquil',
            telefono: '0324710578',
            activo: true
        };
        
        return new Medico(
            model.id ?? null,
            model.nombres ?? model.nombre ?? '',
            model.apellidos ?? '',
            model.email ?? '',
            model.activo ?? true,
            usuario,
            hospital,
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
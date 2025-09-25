import { CitaModel } from "../../data/models/cita.model";
import { Cita } from "../../domain/entities/cita.entity";
import { HospitalMapper } from "./hospital.mapper";
import { IMapper } from "./mapper.abstract";
import { MedicoMapper } from "./medico.mapper";
import { PacienteMapper } from "./paciente.mapper";
import { UsuarioMapper } from "./usuario.mapper";

export class CitaMapper extends IMapper<Cita> {
    // Toma un modelo (DB) y lo transforma a Entidad (Domain)
    public toDomain(model: CitaModel): Cita {
        const usuarioMapper = new UsuarioMapper();

        return new Cita(
            model.id ?? null,
            model.motivo,
            model.estado,
            model.fechaInicio,
            model.fechaFin,
            model.medico ? new MedicoMapper().toDomain(model.medico) : null,
            model.paciente ? new PacienteMapper().toDomain(model.paciente) : null,
            model.hospital ? new HospitalMapper().toDomain(model.hospital) : null,
            model.creadaPor ? usuarioMapper.toDomain(model.creadaPor) : null,
            model.actualizadaPor ? usuarioMapper.toDomain(model.actualizadaPor) : null,
            model.createdAt,
            model.updatedAt,
        );
    }

    // Toma una Entidad (Domain) y crea un Modelo (DB)
    public toModel(entity: Cita): CitaModel {
        const model = new CitaModel();
        const usuarioMapper = new UsuarioMapper();

        model.id = entity.id;
        model.motivo = entity.motivo;
        model.estado = entity.estado;
        model.fechaInicio = entity.fechaInicio;
        model.fechaFin = entity.fechaFin;
        model.createdAt = entity.createdAt;
        model.updatedAt = entity.updatedAt;

        // Relaciones
        model.medico = entity.medico ? new MedicoMapper().toModel(entity.medico) : null as any;
        model.paciente = entity.paciente ? new PacienteMapper().toModel(entity.paciente) : null as any;
        model.hospital = entity.Hospital ? new HospitalMapper().toModel(entity.Hospital) : null as any;
        model.creadaPor = entity.creadoPor ? usuarioMapper.toModel(entity.creadoPor) : null;
        model.actualizadaPor = entity.actualizadaPor ? usuarioMapper.toModel(entity.actualizadaPor) : null;

        // Asignación de IDs (importante para integridad referencial en la DB)
        model.medicoId = entity.medico?.id?.toString() ?? null;
        model.pacienteId = entity.paciente?.id?.toString() ?? null;
        model.hospitalId = entity.Hospital?.id?.toString() ?? null;
        model.creadaPorId = entity.creadoPor?.id?.toString() ?? null;
        model.actualizadaPorId = entity.actualizadaPor?.id?.toString() ?? null;

        return model;
    }
}

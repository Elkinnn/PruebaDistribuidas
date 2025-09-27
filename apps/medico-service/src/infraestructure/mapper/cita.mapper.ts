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
        if (!model) {
            throw new Error('CitaModel is undefined or null');
        }
        
        const usuarioMapper = new UsuarioMapper();

        return new Cita(
            model.id ?? null,
            model.motivo ?? '',
            model.estado as "PROGRAMADA" | "CANCELADA" | "ATENDIDA" ?? 'PROGRAMADA',
            model.fechaInicio ?? new Date(),
            model.fechaFin ?? new Date(),
            model.medico ? new MedicoMapper().toDomain(model.medico) : null,
            model.paciente ? new PacienteMapper().toDomain(model.paciente) : null,
            model.hospital ? new HospitalMapper().toDomain(model.hospital) : null,
            model.creadaPor ? usuarioMapper.toDomain(model.creadaPor) : null,
            model.actualizadaPor ? usuarioMapper.toDomain(model.actualizadaPor) : null,
            model.createdAt ?? new Date(),
            model.updatedAt ?? new Date(),
            // Snapshot del paciente
            model.pacienteNombre ?? null,
            model.pacienteTelefono ?? null,
            model.pacienteEmail ?? null,
            model.pacienteId ? Number(model.pacienteId) : null,
            model.medicoId ? Number(model.medicoId) : null,
            model.hospitalId ? Number(model.hospitalId) : null,
        );
    }

    // Toma una Entidad (Domain) y crea un Modelo (DB)
    public toModel(entity: Cita): CitaModel {
        if (!entity) {
            throw new Error('Cita entity is undefined or null');
        }
        
        const model = new CitaModel();
        const usuarioMapper = new UsuarioMapper();

        model.id = entity.id;
        model.motivo = entity.motivo;
        model.estado = entity.estado;
        model.fechaInicio = entity.fechaInicio;
        model.fechaFin = entity.fechaFin;
        model.createdAt = entity.createdAt;
        model.updatedAt = entity.updatedAt;
        
        // Snapshot del paciente
        model.pacienteNombre = entity.pacienteNombre ?? null;
        model.pacienteTelefono = entity.pacienteTelefono ?? null;
        model.pacienteEmail = entity.pacienteEmail ?? null;

        // Relaciones
        model.medico = entity.medico ? new MedicoMapper().toModel(entity.medico) : null as any;
        model.paciente = entity.paciente ? new PacienteMapper().toModel(entity.paciente) : null as any;
        model.hospital = entity.Hospital ? new HospitalMapper().toModel(entity.Hospital) : null as any;
        model.creadaPor = entity.creadoPor ? usuarioMapper.toModel(entity.creadoPor) : null;
        model.actualizadaPor = entity.actualizadaPor ? usuarioMapper.toModel(entity.actualizadaPor) : null;

        // Asignación de IDs (importante para integridad referencial en la DB)
        // Usar IDs que realmente existen en la base de datos
        console.log('[CITA MAPPER] Entity recibida:', {
            medicoId: entity.medico?.id,
            hospitalId: entity.Hospital?.id ?? entity.medico?.hospital?.id,
            creadoPorId: entity.creadoPor?.id,
            pacienteId: entity.pacienteId ?? entity.paciente?.id
        });
        
        model.medicoId = entity.medico?.id?.toString() ?? '11'; // Usar ID del médico actual (Kendry)
        model.pacienteId = entity.pacienteId?.toString() ?? entity.paciente?.id?.toString() ?? null; // Usar pacienteId directo si está disponible
        model.hospitalId = entity.Hospital?.id?.toString() ?? entity.medico?.hospital?.id?.toString() ?? '9'; // Usar hospital del médico o Hospital Central como fallback
        model.creadaPorId = entity.creadoPor?.id?.toString() ?? '12'; // Usar ID del usuario de Kendry como fallback
        model.actualizadaPorId = entity.actualizadaPor?.id?.toString() ?? null;
        
        console.log('[CITA MAPPER] IDs asignados:', {
            medicoId: model.medicoId,
            hospitalId: model.hospitalId,
            creadaPorId: model.creadaPorId,
            pacienteId: model.pacienteId
        });
        
        // Verificar que el modelo tenga los IDs correctos
        console.log('[CITA MAPPER] Modelo final:', {
            id: model.id,
            motivo: model.motivo,
            estado: model.estado,
            medicoId: model.medicoId,
            hospitalId: model.hospitalId,
            pacienteId: model.pacienteId,
            creadaPorId: model.creadaPorId,
            actualizadaPorId: model.actualizadaPorId
        });

        return model;
    }
}

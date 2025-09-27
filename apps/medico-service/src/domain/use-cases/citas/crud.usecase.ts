import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";
import { Cita } from "../../entities/cita.entity";
import { CitaMapper } from "../../../infraestructure/mapper/cita.mapper";
import { CitaModel } from "../../../data/models/cita.model";
import { Medico } from "../../entities/medico.entity";

export class CRUDCitas {
    private readonly repository: EntityRepository<Cita>

    constructor(
        private readonly medico: Medico
    ) {
        const database = GlobalDatabase.getInstance().database
        const datasource = DatasourceFactory.generateRepository(database, CitaModel)
        if (!datasource) {
            throw new CustomError(400, "Repositorio no implementado", null)
        }
        const mapper = new CitaMapper()
        this.repository = new EntityRepository<Cita>(datasource, mapper)
    }
    public async getAll(): Promise<Cita[]> {
        try {
            // Filtrar solo por médico (para que vea todas sus citas, independientemente del hospital)
            const result = await this.repository.findBy({ 
                medicoId: this.medico.id
            } as any, ['paciente', 'hospital', 'medico'])
            return result ?? []
        } catch (error) {
            console.error('[CRUD CITAS] Error en getAll:', error);
            throw new CustomError(500, "Error al cargar las citas", 
                "No se pudieron cargar las citas. Por favor, intente nuevamente o contacte al administrador si el problema persiste.")
        }
    }

    public async get(id: number): Promise<Cita | null> {
        try {
            const result = await this.repository.findBy({
                id: id,
                medico: this.medico
            })
            if (!result || result.length != 1) {
                throw new CustomError(404, "Cita no encontrada", 
                    "La cita solicitada no existe o no pertenece a este médico.")
            }
            return result[0]
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(404, "Cita no encontrada", 
                "No se pudo encontrar la cita solicitada. Verifique que el ID sea correcto.")
        }
    }

    public async create(created: any): Promise<boolean> {
        try {
            console.log('[CRUD CITAS] Creando cita con datos:', created);
            const [result, error] = await this.repository.create(created)
            console.log('[CRUD CITAS] Resultado del repositorio:', result);
            
            if (error) {
                console.error('[CRUD CITAS] Error en repositorio:', error.message);
                throw new CustomError(400, "Error al crear la cita", 
                    "No se pudo crear la cita. Verifique que todos los datos sean correctos y que no haya conflictos de horarios.")
            }
            
            console.log('[CRUD CITAS] Cita creada exitosamente');
            return !!result
        } catch (error) {
            console.error('[CRUD CITAS] Error en creación:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(500, "Error al crear la cita", 
                "Ocurrió un error inesperado al crear la cita. Por favor, intente nuevamente.")
        }
    }

    public async update(id: number, data: Partial<Cita>): Promise<boolean> {
        try {
            const query = await this.repository.findBy({
                id: id,
                medico: this.medico
            });
            if (!query || query.length != 1) {
                throw new CustomError(404, "Cita no encontrada", 
                    "La cita que intenta actualizar no existe o no pertenece a este médico.");
            }
            const toUpdate = query[0]
            console.log('[CRUD CITAS UPDATE] Cita encontrada:', {
                id: toUpdate.id,
                estado: toUpdate.estado,
                motivo: toUpdate.motivo
            });
            // Validaciones de estado con mensajes claros
            if (toUpdate.estado == "ATENDIDA") {
                console.log('[CRUD CITAS UPDATE] Error: No se puede modificar una cita ATENDIDA');
                throw new CustomError(400, "No se puede modificar una cita atendida", 
                    "Una cita que ya ha sido atendida no puede ser modificada.");
            }
            
            if (toUpdate.estado == "CANCELADA") {
                console.log('[CRUD CITAS UPDATE] Error: No se puede modificar una cita CANCELADA');
                throw new CustomError(400, "No se puede modificar una cita cancelada", 
                    "Una cita que ha sido cancelada no puede ser modificada.");
            }
            
            // Solo permitir cambiar estado de PROGRAMADA a ATENDIDA
            if (toUpdate.estado == "PROGRAMADA" && data.estado && data.estado != "ATENDIDA") {
                console.log('[CRUD CITAS UPDATE] Error: Solo se puede cambiar PROGRAMADA a ATENDIDA');
                throw new CustomError(400, "Solo se puede cambiar el estado a ATENDIDA", 
                    "Solo se puede cambiar el estado de una cita programada a ATENDIDA.");
            }
            
            // No permitir cambiar el motivo
            if (data.motivo && data.motivo !== toUpdate.motivo) {
                console.log('[CRUD CITAS UPDATE] Error: No se puede modificar el motivo');
                throw new CustomError(400, "No se puede modificar el motivo", 
                    "El motivo de la cita no puede ser modificado.");
            }
            // No actualizar el motivo (no se puede modificar)
            // toUpdate.motivo = data.motivo ?? toUpdate.motivo;
            
            // Solo actualizar estado y fecha de fin
            if (data.estado) {
                toUpdate.estado = data.estado;
            }
            if (data.fechaFin) {
                toUpdate.fechaFin = data.fechaFin;
            }
            toUpdate.actualizadaPor = this.medico.usuario;
            toUpdate.updatedAt = new Date();
            const result = await this.repository.update(toUpdate);
            if (result instanceof Error) {
                throw new CustomError(400, "Error al actualizar la cita", 
                    "No se pudo guardar los cambios de la cita. Verifique que los datos sean correctos.");
            }
            return result;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(500, "Error al actualizar la cita", 
                "Ocurrió un error inesperado al actualizar la cita. Por favor, intente nuevamente.");
        }
    }


    public async delete(id: number): Promise<boolean> {
        try {
            const deletables = await this.repository.findBy({
                id: id,
                medico: this.medico
            })
            if (!deletables || deletables.length != 1) {
                throw new CustomError(404, "Cita no encontrada", 
                    "La cita que intenta eliminar no existe o no pertenece a este médico.")
            }
            const deleted = deletables[0]
            const result = await this.repository.delete(deleted)
            if (result instanceof Error) {
                throw new CustomError(400, "Error al eliminar la cita", 
                    "No se pudo eliminar la cita. Verifique que no tenga dependencias o contacte al administrador.")
            }
            return result
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(500, "Error al eliminar la cita", 
                "Ocurrió un error inesperado al eliminar la cita. Por favor, intente nuevamente.")
        }
    }
}
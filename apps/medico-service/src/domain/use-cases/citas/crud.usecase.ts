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
            throw new CustomError(400, "Error al cargar los Citas", error)
        }
    }

    public async get(id: number): Promise<Cita | null> {
        try {
            const result = await this.repository.findBy({
                id: id,
                medico: this.medico
            })
            if (!result || result.length != 1) throw new CustomError(400, "Cita invalida", "Cita no encontrada")
            return result[0]
        } catch (error) {
            throw new CustomError(400, "No encontrado", "Cita no encontrado")
        }
    }

    public async create(created: any): Promise<boolean> {
        try {
            console.log('[CRUD CITAS] Creando cita con datos:', created);
            const [result, error] = await this.repository.create(created)
            console.log('[CRUD CITAS] Resultado del repositorio:', result);
            
            if (error) {
                console.error('[CRUD CITAS] Error en repositorio:', error.message);
                throw error
            }
            
            console.log('[CRUD CITAS] Cita creada exitosamente');
            return !!result
        } catch (error) {
            console.error('[CRUD CITAS] Error en creación:', error);
            throw error
        }
    }

    public async update(id: number, data: Partial<Cita>): Promise<boolean> {
        try {
            const query = await this.repository.findBy({
                id: id,
                medico: this.medico
            });
            if (!query || query.length != 1) {
                throw new CustomError(404, "Cita no encontrada", "No encontrada");
            }
            const toUpdate = query[0]
            console.log('[CRUD CITAS UPDATE] Cita encontrada:', {
                id: toUpdate.id,
                estado: toUpdate.estado,
                motivo: toUpdate.motivo
            });
            // Permitir editar citas en cualquier estado, pero con restricciones
            if (toUpdate.estado == "ATENDIDA" && data.estado && data.estado != "ATENDIDA") {
                console.log('[CRUD CITAS UPDATE] Error: No se puede cambiar el estado de una cita ATENDIDA');
                throw new CustomError(404, "Cita NO ACTUALIZABLE", "No se puede cambiar el estado de una cita ya ATENDIDA");
            }
            
            if (toUpdate.estado == "CANCELADA" && data.estado && data.estado != "CANCELADA") {
                console.log('[CRUD CITAS UPDATE] Error: No se puede cambiar el estado de una cita CANCELADA');
                throw new CustomError(404, "Cita NO ACTUALIZABLE", "No se puede cambiar el estado de una cita ya CANCELADA");
            }
            
            // Solo permitir cambiar estado si está PROGRAMADA
            if (toUpdate.estado != "PROGRAMADA" && data.estado && data.estado != toUpdate.estado) {
                console.log(`[CRUD CITAS UPDATE] Error: No se puede cambiar el estado de una cita ${toUpdate.estado}`);
                throw new CustomError(404, "Cita NO ACTUALIZABLE", `No se puede cambiar el estado de una cita que está ${toUpdate.estado}`);
            }
            toUpdate.motivo = data.motivo ?? toUpdate.motivo;
            toUpdate.estado = data.estado ?? toUpdate.estado;
            toUpdate.fechaFin = data.fechaFin ?? toUpdate.fechaFin;
            toUpdate.actualizadaPor = this.medico.usuario;
            toUpdate.updatedAt = new Date();
            const result = await this.repository.update(toUpdate);
            if (result instanceof Error) {
                throw result;
            }
            return result;
        } catch (error) {
            throw error;
        }
    }


    public async delete(id: number): Promise<boolean> {
        try {
            const deletables = await this.repository.findBy({
                id: id,
                medico: this.medico
            })
            if (!deletables || deletables.length != 1) {
                throw new CustomError(404, "Cita no encontrado", "No encontrado")
            }
            const deleted = deletables[0]
            const result = await this.repository.delete(deleted)
            if (result instanceof Error) {
                throw result
            }
            return result
        } catch (error) {
            throw error
        }
    }
}
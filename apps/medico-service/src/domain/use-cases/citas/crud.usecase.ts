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
            console.log(`[CRUD CITAS GETALL] Obteniendo citas para médico: ${this.medico.id}`);
            // Filtrar solo por médico (para que vea todas sus citas, independientemente del hospital)
            const result = await this.repository.findBy({ 
                medicoId: this.medico.id
            } as any, ['paciente', 'hospital', 'medico'])
            
            console.log(`[CRUD CITAS GETALL] Citas encontradas: ${result?.length || 0}`);
            if (result && result.length > 0) {
                result.forEach((cita, index) => {
                    console.log(`[CRUD CITAS GETALL] Cita ${index + 1}: ID=${cita.id}, Estado=${cita.estado}, Motivo=${cita.motivo}`);
                });
            }
            
            return result ?? []
        } catch (error) {
            console.error('[CRUD CITAS GETALL] Error en getAll:', error);
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
                // Solo permitir cambiar la fecha de fin en citas ATENDIDAS
                if (data.estado && data.estado !== "ATENDIDA") {
                    console.log('[CRUD CITAS UPDATE] Error: No se puede cambiar el estado de una cita ATENDIDA');
                    throw new CustomError(400, "No se puede cambiar el estado de una cita atendida", 
                        "Una cita que ya ha sido atendida solo puede tener su fecha de fin modificada.");
                }
                console.log('[CRUD CITAS UPDATE] Permitiendo actualización de fecha de fin en cita ATENDIDA');
            }
            
            if (toUpdate.estado == "CANCELADA") {
                // Solo permitir cambiar la fecha de fin en citas CANCELADAS
                if (data.estado && data.estado !== "CANCELADA") {
                    console.log('[CRUD CITAS UPDATE] Error: No se puede cambiar el estado de una cita CANCELADA');
                    throw new CustomError(400, "No se puede cambiar el estado de una cita cancelada", 
                        "Una cita que ha sido cancelada solo puede tener su fecha de fin modificada.");
                }
                console.log('[CRUD CITAS UPDATE] Permitiendo actualización de fecha de fin en cita CANCELADA');
            }
            
            // Validar cambios de estado solo para citas PROGRAMADAS y solo si se está cambiando el estado
            if (toUpdate.estado == "PROGRAMADA" && data.estado && data.estado !== toUpdate.estado) {
                // Permitir cambiar de PROGRAMADA a ATENDIDA o CANCELADA
                if (data.estado !== "ATENDIDA" && data.estado !== "CANCELADA") {
                    console.log('[CRUD CITAS UPDATE] Error: Estado inválido para cita PROGRAMADA');
                    throw new CustomError(400, "Estado inválido", 
                        "Solo se puede cambiar el estado de una cita programada a ATENDIDA o CANCELADA.");
                }
                console.log(`[CRUD CITAS UPDATE] Cambiando estado de ${toUpdate.estado} a ${data.estado}`);
            }
            
            // No permitir cambiar el motivo
            if (data.motivo && data.motivo !== toUpdate.motivo) {
                console.log('[CRUD CITAS UPDATE] Error: No se puede modificar el motivo');
                throw new CustomError(400, "No se puede modificar el motivo", 
                    "El motivo de la cita no puede ser modificado.");
            }
            // No actualizar el motivo (no se puede modificar)
            // toUpdate.motivo = data.motivo ?? toUpdate.motivo;
            
            // Actualizar campos permitidos
            console.log('[CRUD CITAS UPDATE] Datos recibidos:', data);
            
            // Crear un objeto con solo los campos que queremos actualizar
            const updateFields: any = {};
            
            if (data.estado) {
                updateFields.estado = data.estado;
                console.log(`[CRUD CITAS UPDATE] Actualizando estado a: ${data.estado}`);
            }
            
            if (data.fechaFin) {
                updateFields.fechaFin = data.fechaFin;
                console.log(`[CRUD CITAS UPDATE] Actualizando fecha de fin a: ${data.fechaFin}`);
            }
            
            // Actualizar metadatos
            updateFields.actualizadaPor = this.medico.usuario;
            updateFields.updatedAt = new Date();
            
            console.log('[CRUD CITAS UPDATE] Campos a actualizar:', updateFields);
            
            console.log('[CRUD CITAS UPDATE] Cita a actualizar:', {
                id: toUpdate.id,
                estado: toUpdate.estado,
                fechaFin: toUpdate.fechaFin,
                motivo: toUpdate.motivo
            });
            
            console.log('[CRUD CITAS UPDATE] Enviando campos específicos al repositorio para actualizar...');
            
            // Usar una actualización directa en la base de datos para evitar problemas con entidades
            try {
                const database = GlobalDatabase.getInstance().database;
                if ((database as any).dataSource) {
                    // Construir la query SQL directamente
                    const setClause = [];
                    const values = [];
                    
                    if (updateFields.estado) {
                        setClause.push('`estado` = ?');
                        values.push(updateFields.estado);
                    }
                    
                    if (updateFields.fechaFin) {
                        setClause.push('`fechaFin` = ?');
                        // Asegurar que la fecha se maneje correctamente
                        const fechaFin = new Date(updateFields.fechaFin);
                        console.log('[CRUD CITAS UPDATE] Fecha fin recibida:', updateFields.fechaFin);
                        console.log('[CRUD CITAS UPDATE] Fecha fin como Date:', fechaFin);
                        console.log('[CRUD CITAS UPDATE] Fecha fin como ISO:', fechaFin.toISOString());
                        values.push(fechaFin);
                    }
                    
                    setClause.push('`updatedAt` = ?');
                    values.push(updateFields.updatedAt);
                    
                    if (updateFields.actualizadaPor) {
                        setClause.push('`actualizadaPorId` = ?');
                        values.push(updateFields.actualizadaPor.id);
                    }
                    
                    values.push(toUpdate.id); // Para el WHERE
                    
                    const query = `UPDATE \`cita\` SET ${setClause.join(', ')} WHERE \`id\` = ?`;
                    
                    console.log('[CRUD CITAS UPDATE] Ejecutando query:', query);
                    console.log('[CRUD CITAS UPDATE] Con valores:', values);
                    
                    const result = await (database as any).dataSource.query(query, values);
                    console.log('[CRUD CITAS UPDATE] ✅ Resultado de la query:', result);
                    
                    const result2 = result.affectedRows > 0;
                    console.log('[CRUD CITAS UPDATE] ✅ Cita actualizada exitosamente, filas afectadas:', result.affectedRows);
                    return result2;
                }
            } catch (error) {
                console.error('[CRUD CITAS UPDATE] Error en actualización directa:', error);
                throw new CustomError(400, "Error al actualizar la cita", 
                    "No se pudo guardar los cambios de la cita. Verifique que los datos sean correctos.");
            }
            
            // Si llegamos aquí, hubo un problema con la configuración
            throw new CustomError(500, "Error de configuración", 
                "No se pudo configurar la actualización de la cita.");
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
            console.log(`[CRUD CITAS DELETE] Intentando eliminar cita ID: ${id} para médico: ${this.medico.id}`);
            
            // Primero verificar que la cita existe y pertenece al médico
            const deletables = await this.repository.findBy({
                id: id,
                medico: this.medico
            })
            
            if (!deletables || deletables.length != 1) {
                console.log(`[CRUD CITAS DELETE] Cita no encontrada: ID ${id}, médico ${this.medico.id}`);
                throw new CustomError(404, "Cita no encontrada", 
                    "La cita que intenta eliminar no existe o no pertenece a este médico.")
            }
            
            const citaToDelete = deletables[0];
            console.log(`[CRUD CITAS DELETE] Cita encontrada: ID ${citaToDelete.id}, estado ${citaToDelete.estado}`);
            
            // Usar el método delete del repositorio pero con logging detallado
            console.log(`[CRUD CITAS DELETE] Usando repositorio para eliminar cita ${id}`);
            const result = await this.repository.delete(citaToDelete);
            
            console.log(`[CRUD CITAS DELETE] Resultado del repositorio:`, result);
            
            if (result instanceof Error) {
                console.log(`[CRUD CITAS DELETE] ❌ Error del repositorio:`, result.message);
                throw new CustomError(400, "Error al eliminar la cita", 
                    "No se pudo eliminar la cita. Verifique que no tenga dependencias o contacte al administrador.")
            }
            
            console.log(`[CRUD CITAS DELETE] ✅ Cita ${id} eliminada exitosamente`);
            return result
        } catch (error) {
            console.error(`[CRUD CITAS DELETE ERROR]`, error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(500, "Error al eliminar la cita", 
                "Ocurrió un error inesperado al eliminar la cita. Por favor, intente nuevamente.")
        }
    }
}
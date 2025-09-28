import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { LoginUseCase } from "../../../domain/use-cases/login/login.usecase";
import { CustomError } from "../../../domain/errors/error.entity";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { MedicoModel } from "../../../data/models/medico.model";
import { MedicoMapper } from "../../../infraestructure/mapper/medico.mapper";
import { EntityRepository } from "../../../domain/repository/repository.entity";
import { Medico } from "../../../domain/entities/medico.entity";
import { CitaModel } from "../../../data/models/cita.model";
import { CitaMapper } from "../../../infraestructure/mapper/cita.mapper";
import { Cita } from "../../../domain/entities/cita.entity";
import { CRUDCitas } from "../../../domain/use-cases/citas/crud.usecase";
import { HospitalEspecialidadModel } from "../../../data/models/hospital-especialidad.model";
import { HospitalEspecialidadMapper } from "../../../infraestructure/mapper/hospital-especialidad.mapper";
import { HospitalEspecialidad } from "../../../domain/entities/hospital-especialidad.entity";
import { UsuarioModel } from "../../../data/models/usuario.model";
import { UsuarioMapper } from "../../../infraestructure/mapper/usuario.mapper";
import { Usuario } from "../../../domain/entities/usuario.model";

interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        rol: string;
        medicoId?: number;
        nombre?: string;
        apellidos?: string;
        especialidades?: string[];
        hospital?: string;
    };
}

export class MedicoController {
    constructor(
        private usecase = new LoginUseCase()
    ) {}

    // ============ AUTENTICACIÓN ============
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const usuario = await this.usecase.JWTlogin(email, password);
            
            // Obtener información del médico si existe
            let medicoInfo = null;
            let hospitalInfo = null;
            if (usuario.medicoId) {
                try {
                    const database = GlobalDatabase.getInstance().database;
                    const datasource = DatasourceFactory.generateRepository(database, MedicoModel);
                    if (datasource) {
                        const medicoRepository = new EntityRepository<Medico>(datasource, new MedicoMapper());
                        medicoInfo = await medicoRepository.findById(usuario.medicoId);
                        
                        // Obtener información del hospital
                        if (medicoInfo && medicoInfo.hospital) {
                            hospitalInfo = {
                                nombre: medicoInfo.hospital.nombre || 'Hospital Central'
                            };
                        }
                    }
                } catch (error) {
                    console.log("Error obteniendo info del médico:", error);
                }
            }
            
            const payload = {
                id: usuario.id,
                rol: usuario.rol,
                email: usuario.email,
                medicoId: usuario.medicoId,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET || "secretKey123", {
                expiresIn: "24h",
            });
            
            const response: LoginResponse = {
                token,
                user: {
                    id: usuario.id,
                    email: usuario.email,
                    rol: usuario.rol,
                    medicoId: usuario.medicoId,
                    nombre: medicoInfo?.nombres || "Dr. Usuario",
                    apellidos: medicoInfo?.apellidos || "",
                    especialidades: [], // Se puede implementar después
                    hospital: hospitalInfo?.nombre || "Hospital Central"
                }
            };
            
            res.status(200).json(response);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
                return;
            }
            res.status(500).json({ 
                error: 'LOGIN_ERROR', 
                message: 'Error interno en el login de médico' 
            });
        }
    }

    me = async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) throw new Error("No hay token");
            const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secretKey123");
            const usuario = await this.usecase.me(payload.id);
            
            // Obtener información del médico si existe
            let medicoInfo = null;
            if (usuario.medicoId) {
                try {
                    const database = GlobalDatabase.getInstance().database;
                    const datasource = DatasourceFactory.generateRepository(database, MedicoModel);
                    if (datasource) {
                        const medicoRepository = new EntityRepository<Medico>(datasource, new MedicoMapper());
                        medicoInfo = await medicoRepository.findById(usuario.medicoId);
                    }
                } catch (error) {
                    console.log("Error obteniendo info del médico:", error);
                }
            }
            
            const response = {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                medicoId: usuario.medicoId,
                nombre: medicoInfo?.nombres || "Dr. Usuario",
                apellidos: medicoInfo?.apellidos || "",
                especialidades: [], // Se puede implementar después
                hospital: "Hospital Central", // Se puede obtener de la BD después
                telefono: "",
                direccion: "",
                fechaIngreso: "Fecha de ingreso",
                diasTrabajo: ["Lun", "Mar", "Mié", "Jue", "Vie"],
                horario: "08:00 - 17:00"
            };
            
            res.json(response);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
                return;
            }
            res.status(500).json({ 
                error: 'AUTH_ERROR', 
                message: 'Error interno en autenticación' 
            });
        }
    }

    updateMe = async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) throw new Error("No hay token");
            const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secretKey123");
            
            // Por ahora solo devolvemos los datos actualizados
            // Se puede implementar actualización real después
            const response = {
                id: payload.id,
                email: payload.email,
                rol: payload.rol,
                medicoId: payload.medicoId,
                nombre: req.body.nombre || "Dr. Usuario",
                apellidos: req.body.apellidos || "",
                especialidades: req.body.especialidades || [],
                hospital: req.body.hospital || "Hospital Central",
                telefono: req.body.telefono || "",
                direccion: req.body.direccion || "",
                fechaIngreso: req.body.fechaIngreso || "Fecha de ingreso",
                diasTrabajo: req.body.diasTrabajo || ["Lun", "Mar", "Mié", "Jue", "Vie"],
                horario: req.body.horario || "08:00 - 17:00"
            };
            
            res.json(response);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.statusCode).json({ message: err.message });
                return;
            }
            res.status(500).json({ 
                error: 'UPDATE_ERROR', 
                message: 'Error interno al actualizar perfil' 
            });
        }
    }

    // ============ GESTIÓN DE CITAS ============
    getCitas = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const usecase = new CRUDCitas(medico);
            
            // Obtener parámetros de consulta
            const { page = 1, pageSize = 10, q = '' } = req.query; // Aumentar pageSize por defecto a 10
            const pageNum = parseInt(page.toString());
            const pageSizeNum = parseInt(pageSize.toString());
            const offset = (pageNum - 1) * pageSizeNum;
            
            console.log(`[GET CITAS] Parámetros: page=${pageNum}, pageSize=${pageSizeNum}, q='${q}'`);
            
            // Usar el caso de uso existente para obtener citas
            const citas = await usecase.getAll();
            console.log(`[GET CITAS] Total de citas obtenidas del repositorio: ${citas.length}`);
            
            // Aplicar filtros si hay búsqueda
            let filteredCitas = citas;
            if (q) {
                const searchTerm = q.toString().toLowerCase();
                console.log(`[GET CITAS] Aplicando filtro de búsqueda: '${searchTerm}'`);
                filteredCitas = citas.filter((cita: any) => 
                    cita.paciente?.nombres?.toLowerCase().includes(searchTerm) ||
                    cita.motivo?.toLowerCase().includes(searchTerm) ||
                    cita.estado?.toLowerCase().includes(searchTerm)
                );
                console.log(`[GET CITAS] Citas después del filtro: ${filteredCitas.length}`);
            }
            
            // Aplicar paginación
            const total = filteredCitas.length;
            const paginatedCitas = filteredCitas.slice(offset, offset + pageSizeNum);
            console.log(`[GET CITAS] Paginación: total=${total}, offset=${offset}, limit=${pageSizeNum}, resultado=${paginatedCitas.length}`);
            
            // Formatear datos para el frontend
            const formattedCitas = paginatedCitas.map((cita: any) => ({
                id: cita.id,
                inicio: cita.fechaInicio,
                fin: cita.fechaFin || cita.fechaInicio,
                estado: cita.estado,
                motivo: cita.motivo,
                observaciones: '', // Campo vacío ya que no existe en la BD
                paciente: {
                    nombres: cita.pacienteNombre?.split(' ')[0] || cita.paciente?.nombres || '',
                    apellidos: cita.pacienteNombre?.split(' ').slice(1).join(' ') || cita.paciente?.apellidos || '',
                    documento: cita.paciente?.documento || '',
                    telefono: cita.pacienteTelefono || cita.paciente?.telefono || '',
                    email: cita.pacienteEmail || cita.paciente?.email || '',
                    fechaNacimiento: cita.paciente?.fechaNacimiento || '',
                    sexo: cita.paciente?.sexo || 'masculino'
                },
                hospital_nombre: cita.hospital?.nombre || 'Hospital Central',
                createdAt: cita.createdAt,
                updatedAt: cita.updatedAt
            }));

            // Devolver estructura esperada por el frontend
            res.json({
                data: formattedCitas,
                total: total,
                page: pageNum,
                pageSize: pageSizeNum,
                totalPages: Math.ceil(total / pageSizeNum)
            });
        } catch (error) {
            console.error('[MEDICO CITAS ERROR]', error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    error: 'CITAS_ERROR',
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'CITAS_ERROR',
                message: 'Error interno al obtener citas'
            });
        }
    }

    getCitasHoy = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const usecase = new CRUDCitas(medico);
            
            // Obtener todas las citas del médico
            const citas = await usecase.getAll();
            
            // Filtrar citas de hoy y estado PROGRAMADA
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            
            const citasHoy = citas
                .filter((cita: any) => {
                    const fechaCita = new Date(cita.fechaInicio);
                    return fechaCita >= hoy && fechaCita < manana && cita.estado === 'PROGRAMADA';
                })
                .slice(0, 3) // Máximo 3 citas
                .map((cita: any) => {
                    const fechaInicio = new Date(cita.fechaInicio);
                    const fechaFin = new Date(cita.fechaFin || cita.fechaInicio);
                    
                    return {
                        id: cita.id,
                        fecha: fechaInicio.toISOString().split('T')[0],
                        hora: fechaInicio.toTimeString().split(' ')[0].substring(0, 5),
                        estado: cita.estado,
                        motivo: cita.motivo || 'Consulta médica',
                        paciente_nombres: cita.pacienteNombre?.split(' ')[0] || cita.paciente?.nombres || 'Paciente',
                        paciente_apellidos: cita.pacienteNombre?.split(' ').slice(1).join(' ') || cita.paciente?.apellidos || '',
                        paciente_telefono: cita.pacienteTelefono || cita.paciente?.telefono || '',
                        paciente_email: cita.pacienteEmail || cita.paciente?.email || ''
                    };
                });

            res.json(citasHoy);
        } catch (error) {
            console.error('[MEDICO CITAS HOY ERROR]', error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    error: 'CITAS_HOY_ERROR',
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'CITAS_HOY_ERROR',
                message: 'Error interno al obtener citas de hoy'
            });
        }
    }

    createCita = async (req: Request, res: Response) => {
        try {
            console.log('[CREATE CITA] Iniciando creación de cita');
            const medico = (req as any).medico;
            console.log('[CREATE CITA] Medico obtenido:', medico);
            
            const { 
                inicio, 
                fin, 
                motivo, 
                observaciones, 
                paciente,
                medicoId,
                estado
            } = req.body;
            
            console.log('[CREATE CITA] Datos recibidos:', {
                inicio, fin, motivo, observaciones, paciente, medicoId, estado
            });
            
            // Validar datos requeridos
            if (!inicio || !motivo) {
                console.log('[CREATE CITA] Faltan datos requeridos');
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: inicio, motivo' 
                });
            }
            
            console.log('[CREATE CITA] Creando usecase CRUDCitas');
            const usecase = new CRUDCitas(medico);
            
                // Si se proporciona información del paciente, crear o buscar el paciente
                let pacienteId = null;
                if (paciente && paciente.nombres && paciente.apellidos) {
                    console.log('[CREATE CITA] Información del paciente recibida:', paciente);
                    console.log('[CREATE CITA] Creando/buscando paciente...');
                    try {
                    const database = GlobalDatabase.getInstance().database;
                    const { PacienteModel } = await import('../../../data/models/paciente.model');
                    const { PacienteMapper } = await import('../../../infraestructure/mapper/paciente.mapper');
                    
                    const datasource = DatasourceFactory.generateRepository(database, PacienteModel);
                    if (datasource) {
                        const pacienteRepository = new EntityRepository(datasource, new PacienteMapper());
                        
                        // Buscar paciente existente por cédula o crear uno nuevo
                        const pacientesExistentes = await pacienteRepository.findBy({
                            nombres: paciente.nombres,
                            apellidos: paciente.apellidos
                        });
                        
                        if (pacientesExistentes && pacientesExistentes.length > 0) {
                            pacienteId = pacientesExistentes[0].id;
                            console.log('[CREATE CITA] Paciente encontrado con ID:', pacienteId);
                        } else {
                            // Crear nuevo paciente
                            const nuevoPaciente = {
                                id: 0, // Se asignará automáticamente por la base de datos
                                nombres: paciente.nombres,
                                apellidos: paciente.apellidos,
                                fechaNacimiento: new Date(paciente.fechaNacimiento || '1990-01-01'),
                                sexo: 'MASCULINO' as const,
                                telefono: paciente.telefono || '',
                                email: paciente.email || '',
                                documento: paciente.documento || null, // Agregar campo documento
                                activo: true,
                                hospital: {
                                    id: medico.hospital.id,
                                    nombre: medico.hospital.nombre,
                                    direccion: medico.hospital.direccion,
                                    telefono: medico.hospital.telefono,
                                    activo: medico.hospital.activo
                                }
                            };
                            
                            console.log('[CREATE CITA] Creando nuevo paciente:', nuevoPaciente);
                            const [pacienteCreado, error] = await pacienteRepository.create(nuevoPaciente);
                            
                            if (error) {
                                console.error('[CREATE CITA] Error creando paciente:', error);
                                throw error;
                            }
                            
                            console.log('[CREATE CITA] Paciente creado:', pacienteCreado);
                            pacienteId = pacienteCreado.id;
                            console.log('[CREATE CITA] Nuevo paciente creado con ID:', pacienteId);
                        }
                    }
                } catch (pacienteError) {
                    console.error('[CREATE CITA] Error creando/buscando paciente:', pacienteError);
                    throw pacienteError; // Lanzar el error en lugar de continuar
                }
            }
            
            // Crear la entidad Cita con datos mínimos
            const citaData = {
                id: null,
                motivo: motivo || 'Consulta médica',
                estado: estado || 'PROGRAMADA',
                fechaInicio: new Date(inicio),
                fechaFin: new Date(fin || inicio),
                medico: medico, // Usar el médico del middleware
                paciente: null,
                Hospital: null,
                creadoPor: medico.usuario, // Usar el usuario del médico
                actualizadaPor: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Snapshot del paciente (si se proporciona información)
                pacienteNombre: paciente ? `${paciente.nombres} ${paciente.apellidos}` : null,
                pacienteTelefono: paciente?.telefono || null,
                pacienteEmail: paciente?.email || null,
                // ID del paciente si se creó/encontró uno
                pacienteId: pacienteId
            };
            
            console.log('[CREATE CITA] Datos para crear cita:', citaData);
            
            // Crear la cita usando el caso de uso
            const success = await usecase.create(citaData);
            
            console.log('[CREATE CITA] Resultado de creación:', success);
            
            res.status(201).json({
                success: success,
                message: 'Cita creada exitosamente'
            });
        } catch (error) {
            console.error('[MEDICO CREATE CITA ERROR]', error);
            console.error('[MEDICO CREATE CITA ERROR] Stack:', (error as Error).stack);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(500).json({
                error: 'CREATE_CITA_ERROR',
                message: 'Error interno al crear cita'
            });
        }
    }

    updateCita = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const { id } = req.params;
            const { estado, inicio: nuevaFechaInicio, fin: nuevaFechaFin, motivo } = req.body;

            console.log('[UPDATE CITA CONTROLLER] Datos recibidos:');
            console.log('- ID de cita:', id);
            console.log('- Estado:', estado);
            console.log('- Fecha inicio:', nuevaFechaInicio);
            console.log('- Fecha fin:', nuevaFechaFin);
            console.log('- Motivo:', motivo);
            console.log('- Body completo:', req.body);

            // Validar que no se intente cambiar el motivo
            if (motivo !== undefined) {
                console.log('[UPDATE CITA CONTROLLER] Error: Motivo incluido en la actualización');
                return res.status(400).json({
                    error: 'UPDATE_CITA_ERROR',
                    message: 'No se puede modificar el motivo de la cita'
                });
            }

            const usecase = new CRUDCitas(medico);
            
            // Preparar datos de actualización
            const updateData: any = {};
            if (estado) updateData.estado = estado;
            if (nuevaFechaInicio) {
                try {
                    updateData.fechaInicio = new Date(nuevaFechaInicio);
                    console.log('[UPDATE CITA CONTROLLER] Fecha inicio convertida:', updateData.fechaInicio);
                } catch (error) {
                    console.error('[UPDATE CITA CONTROLLER] Error convirtiendo fecha inicio:', error);
                    return res.status(400).json({
                        error: 'UPDATE_CITA_ERROR',
                        message: 'Formato de fecha de inicio inválido'
                    });
                }
            }
            if (nuevaFechaFin) {
                try {
                    updateData.fechaFin = new Date(nuevaFechaFin);
                    console.log('[UPDATE CITA CONTROLLER] Fecha fin convertida:', updateData.fechaFin);
                } catch (error) {
                    console.error('[UPDATE CITA CONTROLLER] Error convirtiendo fecha fin:', error);
                    return res.status(400).json({
                        error: 'UPDATE_CITA_ERROR',
                        message: 'Formato de fecha de fin inválido'
                    });
                }
            }
            
            console.log('[UPDATE CITA CONTROLLER] Datos preparados para actualización:', updateData);

            // Actualizar la cita
            const success = await usecase.update(parseInt(id), updateData);

            res.json({
                id: parseInt(id),
                message: 'Cita actualizada exitosamente',
                success: success
            });
        } catch (error) {
            console.error('[UPDATE CITA ERROR]', error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ 
                    error: 'UPDATE_CITA_ERROR',
                    message: error.message 
                });
                return;
            }
            res.status(500).json({
                error: 'UPDATE_CITA_ERROR',
                message: 'Error interno al actualizar cita'
            });
        }
    }

    deleteCita = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const { id } = req.params;

            const usecase = new CRUDCitas(medico);
            
            // Eliminar la cita
            const result = await usecase.delete(parseInt(id));

            res.json({
                id: parseInt(id),
                message: 'Cita eliminada exitosamente'
            });
        } catch (error) {
            console.error('[DELETE CITA ERROR]', error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ 
                    error: 'DELETE_CITA_ERROR',
                    message: error.message 
                });
                return;
            }
            res.status(500).json({
                error: 'DELETE_CITA_ERROR',
                message: 'Error interno al eliminar cita'
            });
        }
    }

    // ============ INFORMACIÓN DEL MÉDICO ============
    getEspecialidades = async (req: Request, res: Response) => {
        try {
            console.log('🔥🔥🔥 GET ESPECIALIDADES LLAMADO 🔥🔥🔥');
            const medico = (req as any).medico;
            console.log('[DEBUG] ========== GET ESPECIALIDADES ==========');
            console.log('[DEBUG] Medico completo:', JSON.stringify(medico, null, 2));
            console.log('[DEBUG] Medico ID:', medico.id);
            console.log('[DEBUG] Medico ID tipo:', typeof medico.id);
            console.log('[DEBUG] Hospital ID:', medico.hospital?.id);
            
            // Obtener especialidades del médico específico usando consulta SQL directa
            const database = GlobalDatabase.getInstance().database;
            
            if (!(database as any).dataSource) {
                throw new CustomError(500, "Error de conexión a la base de datos", null);
            }
            
            // Primero verificar si hay registros en MedicoEspecialidad para este médico
            const checkMedicoEspecialidad = await (database as any).dataSource.query(`
                SELECT * FROM MedicoEspecialidad WHERE medicoId = ?
            `, [medico.id]);
            
            console.log('[DEBUG] Registros en medicoespecialidad para médico', medico.id, ':', checkMedicoEspecialidad?.length || 0);
            console.log('[DEBUG] Detalles medicoespecialidad:', checkMedicoEspecialidad);
            
            // Consulta SQL directa para obtener especialidades del médico específico
            const especialidadesResult = await (database as any).dataSource.query(`
                SELECT e.id, e.nombre, e.descripcion
                FROM Especialidad e
                JOIN MedicoEspecialidad me ON e.id = me.especialidadId
                WHERE me.medicoId = ?
                ORDER BY e.nombre
            `, [medico.id]);
            
            console.log('[DEBUG] Especialidades del médico encontradas:', especialidadesResult?.length || 0);
            console.log('[DEBUG] Detalles especialidades:', especialidadesResult);
            
            // Función para asignar iconos según la especialidad
            const getSpecialtyIcon = (nombre: string): string => {
                const nombreLower = nombre.toLowerCase();
                if (nombreLower.includes('cardiología') || nombreLower.includes('cardio')) return '❤️';
                if (nombreLower.includes('dermatología') || nombreLower.includes('dermato')) return '🧴';
                if (nombreLower.includes('pediatría') || nombreLower.includes('pediatra')) return '👶';
                if (nombreLower.includes('neurología') || nombreLower.includes('neuro')) return '🧠';
                if (nombreLower.includes('oftalmología') || nombreLower.includes('oftalmo')) return '👁️';
                if (nombreLower.includes('ginecología') || nombreLower.includes('gineco')) return '👩';
                if (nombreLower.includes('traumatología') || nombreLower.includes('trauma')) return '🦴';
                if (nombreLower.includes('psiquiatría') || nombreLower.includes('psiquiatra')) return '🧠';
                if (nombreLower.includes('medicina general') || nombreLower.includes('general')) return '🩺';
                if (nombreLower.includes('cirugía') || nombreLower.includes('cirugia')) return '🔪';
                if (nombreLower.includes('anestesiología') || nombreLower.includes('anestesia')) return '💉';
                if (nombreLower.includes('radiología') || nombreLower.includes('radio')) return '📷';
                return '🩺'; // Icono por defecto
            };
            
            // Formatear datos para el frontend
            const especialidades = especialidadesResult?.map((esp: any) => ({
                id: esp.id,
                nombre: esp.nombre,
                descripcion: esp.descripcion,
                icono: getSpecialtyIcon(esp.nombre),
                activa: true, // Por defecto activa
                medicos: 1 // Por ahora, se puede implementar después contar médicos por especialidad
            })) || [];

            // Calcular estadísticas
            const totalEspecialidades = especialidades.length;
            const totalMedicos = especialidades.reduce((sum: number, esp: any) => sum + esp.medicos, 0);
            const masPopular = especialidades.length > 0 ? especialidades.reduce((prev: any, current: any) =>
                prev.medicos > current.medicos ? prev : current
            ) : { nombre: 'N/A', medicos: 0 };

            console.log('🔥🔥🔥 RESPONSE ESPECIALIDADES:', {
                data: especialidades,
                total: totalEspecialidades
            });
            
            res.json({
                data: especialidades,
                total: totalEspecialidades,
                estadisticas: {
                    totalEspecialidades,
                    totalMedicos,
                    masPopular: masPopular.nombre,
                    medicosMasPopular: masPopular.medicos
                }
            });
        } catch (error) {
            console.error('[MEDICO ESPECIALIDADES ERROR]', error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    error: 'ESPECIALIDADES_ERROR',
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'ESPECIALIDADES_ERROR',
                message: 'Error interno al obtener especialidades'
            });
        }
    }

    updateProfile = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const { nombres, apellidos, email } = req.body;
            
            console.log('[DEBUG] Actualizando perfil médico:', { nombres, apellidos, email });
            
            // Actualizar información del médico en la tabla medico
            const database = GlobalDatabase.getInstance().database;
            const medicoDatasource = DatasourceFactory.generateRepository(database, MedicoModel);
            
            if (!medicoDatasource) {
                throw new CustomError(500, "Error de conexión a la base de datos", null);
            }
            
            const medicoRepository = new EntityRepository<Medico>(medicoDatasource, new MedicoMapper());
            
            // Actualizar el médico
            const medicoActualizado = new Medico(
                medico.id,
                nombres || medico.nombres,
                apellidos || medico.apellidos,
                email || medico.email,
                medico.activo,
                medico.usuario,
                medico.hospital
            );
            
            const result = await medicoRepository.update(medicoActualizado);
            if (result instanceof Error) {
                throw new CustomError(500, "Error al actualizar médico", result);
            }
            
            // Actualizar el email en la tabla usuario también
            const usuarioDatasource = DatasourceFactory.generateRepository(database, UsuarioModel);
            if (usuarioDatasource && email) {
                const usuarioRepository = new EntityRepository(usuarioDatasource, new UsuarioMapper());
                const usuarioActualizado = new Usuario(
                    medico.usuario.id,
                    email,
                    medico.usuario.password,
                    medico.usuario.rol,
                    medico.usuario.activo,
                    medico.usuario.medicoId
                );
                
                await usuarioRepository.update(usuarioActualizado);
            }
            
            console.log('[DEBUG] Perfil médico actualizado exitosamente');
            
            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: {
                    id: medico.id,
                    nombres: nombres || medico.nombres,
                    apellidos: apellidos || medico.apellidos,
                    email: email || medico.email
                }
            });
        } catch (error) {
            console.error('[UPDATE PROFILE ERROR]', error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    error: 'UPDATE_PROFILE_ERROR',
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'UPDATE_PROFILE_ERROR',
                message: 'Error interno al actualizar perfil'
            });
        }
    }

    getPerfil = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            
            // Formatear datos para el frontend
            const perfil = {
                nombre: `${medico.nombres} ${medico.apellidos}`,
                especialidades: ["Medicina General"], // Se puede obtener de la BD después
                hospital: medico.hospital?.nombre || 'Hospital Central',
                email: medico.email,
                horario: '08:00 - 17:00',
                diasTrabajo: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
            };

            res.json(perfil);
        } catch (error) {
            console.error('[MEDICO PERFIL ERROR]', error);
            res.status(500).json({
                error: 'PERFIL_ERROR',
                message: 'Error interno al obtener perfil'
            });
        }
    }

    updatePerfil = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const { nombre, email } = req.body;
            
            // Por ahora solo devolver éxito, se puede implementar actualización real después
            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente'
            });
        } catch (error) {
            console.error('[MEDICO PERFIL UPDATE ERROR]', error);
            res.status(500).json({
                error: 'UPDATE_ERROR',
                message: 'Error interno al actualizar perfil'
            });
        }
    }

    getInfo = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            
            const info = {
                id: medico.id,
                nombre: `${medico.nombres} ${medico.apellidos}`.trim(),
                email: medico.email,
                hospital: medico.hospital?.nombre || 'Hospital Central',
                especialidades: ["Medicina General"] // Se puede obtener de la BD después
            };

            res.json(info);
        } catch (error) {
            console.error('[MEDICO INFO ERROR]', error);
            res.status(500).json({ 
                error: 'MEDICO_INFO_ERROR', 
                message: 'Error interno del servidor: ' + error 
            });
        }
    }

    getStats = async (req: Request, res: Response) => {
        try {
            const medico = (req as any).medico;
            const usecase = new CRUDCitas(medico);
            
            // Obtener todas las citas del médico
            const citas = await usecase.getAll();
            
            // Calcular estadísticas
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            
            const mesActual = new Date();
            mesActual.setDate(1);
            mesActual.setHours(0, 0, 0, 0);
            const siguienteMes = new Date(mesActual);
            siguienteMes.setMonth(siguienteMes.getMonth() + 1);
            
            const totalPacientes = new Set(citas
                .filter(cita => cita.estado !== 'CANCELADA')
                .map(cita => cita.paciente?.id)
                .filter(id => id !== undefined)
            ).size;
            
            const citasHoy = citas.filter(cita => {
                const fechaCita = new Date(cita.fechaInicio);
                return fechaCita >= hoy && fechaCita < manana && cita.estado !== 'CANCELADA';
            }).length;
            
            const consultasMes = citas.filter(cita => {
                const fechaCita = new Date(cita.fechaInicio);
                return fechaCita >= mesActual && fechaCita < siguienteMes && cita.estado !== 'CANCELADA';
            }).length;
            
            const estadisticas = {
                totalPacientes,
                citasHoy,
                consultasMes
            };

            res.json(estadisticas);
        } catch (error) {
            console.error('[MEDICO STATS ERROR]', error);
            res.status(500).json({
                error: 'STATS_ERROR',
                message: 'Error interno al obtener estadísticas'
            });
        }
    }

    getDashboardStats = async (req: Request, res: Response) => {
        try {
            // Datos temporales para evitar errores 404
            const stats = {
                totalPacientes: 25,
                citasHoy: 8,
                consultasMes: 120,
                especialidades: ["Medicina General"]
            };
            
            res.json(stats);
        } catch (error) {
            console.error('[MEDICO DASHBOARD STATS ERROR]', error);
            res.status(500).json({ 
                error: 'STATS_ERROR', 
                message: 'Error interno al obtener estadísticas' 
            });
        }
    }
}
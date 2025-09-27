import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { GlobalDatabase } from "../../infraestructure/datasource/datasource.global";
import { DatasourceFactory } from "../../infraestructure/datasource/datasource.factory";
import { UsuarioModel } from "../../data/models/usuario.model";
import { UsuarioMapper } from "../../infraestructure/mapper/usuario.mapper";
import { MedicoModel } from "../../data/models/medico.model";
import { MedicoMapper } from "../../infraestructure/mapper/medico.mapper";
import { EntityRepository } from "../../domain/repository/repository.entity";
import { CustomError } from "../../domain/errors/error.entity";
import { Medico } from "../../domain/entities/medico.entity";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new CustomError(401, "No hay token", null);

    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secretKey123");

    const database = GlobalDatabase.getInstance().database;
    const datasource = DatasourceFactory.generateRepository(database, UsuarioModel);
    const repository = new EntityRepository(datasource!, new UsuarioMapper());

    const usuario = await repository.findById(payload.id);
    if (!usuario) throw new CustomError(404, "Usuario no encontrado", null);

    console.log('[AUTH MIDDLEWARE] Usuario encontrado:', {
      id: usuario.id,
      email: usuario.email,
      medicoId: usuario.medicoId,
      rol: usuario.rol
    });

    // Si el usuario tiene medicoId, obtener información del médico
    let medicoInfo = null;
    if (usuario.medicoId) {
      try {
        console.log('[AUTH MIDDLEWARE] Obteniendo info del médico con ID:', usuario.medicoId);
        const medicoDatasource = DatasourceFactory.generateRepository(database, MedicoModel);
        if (medicoDatasource) {
          const medicoRepository = new EntityRepository<Medico>(medicoDatasource, new MedicoMapper());
          medicoInfo = await medicoRepository.findById(usuario.medicoId, ['hospital', 'usuario']);
          console.log('[AUTH MIDDLEWARE] Médico obtenido:', {
            id: medicoInfo?.id,
            nombres: medicoInfo?.nombres,
            apellidos: medicoInfo?.apellidos,
            hospitalId: medicoInfo?.hospital?.id
          });
        }
      } catch (error) {
        console.log("Error obteniendo info del médico en middleware:", error);
        // Si hay error obteniendo el médico, usar solo la información del usuario
        medicoInfo = null;
      }
    } else {
      console.log('[AUTH MIDDLEWARE] Usuario no tiene medicoId asociado');
    }

    // Asignar tanto el usuario como el médico (si existe) al request
    (req as any).usuario = usuario;
    // Si no se pudo obtener la info del médico, crear un objeto médico básico con la info del usuario
    if (!medicoInfo) {
      // Obtener el primer hospital disponible de la base de datos
      let defaultHospital = { id: 1, nombre: 'Hospital Central', direccion: '', telefono: '', activo: true };
      
      try {
        // Intentar obtener un hospital válido de la base de datos usando query directa
        if ((database as any).dataSource) {
          const hospitals = await (database as any).dataSource.query(
            'SELECT id, nombre, direccion, telefono, activo FROM hospital WHERE activo = 1 LIMIT 1'
          );
          if (hospitals && hospitals.length > 0) {
            defaultHospital = {
              id: hospitals[0].id,
              nombre: hospitals[0].nombre || 'Hospital Central',
              direccion: hospitals[0].direccion || '',
              telefono: hospitals[0].telefono || '',
              activo: hospitals[0].activo
            };
            console.log('[AUTH MIDDLEWARE] Usando hospital por defecto:', defaultHospital);
          }
        }
      } catch (error) {
        console.log('[AUTH MIDDLEWARE] Error obteniendo hospital por defecto, usando ID 1:', error);
      }
      
      medicoInfo = {
        id: usuario.medicoId ? parseInt(usuario.medicoId.toString()) : usuario.id,
        nombres: 'Dr.',
        apellidos: 'Usuario',
        email: usuario.email,
        activo: usuario.activo,
        usuario: usuario, // Agregar el usuario real
        hospital: defaultHospital
      };
    }
    (req as any).medico = medicoInfo;

    console.log('[AUTH MIDDLEWARE] Médico asignado al request:', {
      id: medicoInfo.id,
      nombres: medicoInfo.nombres,
      apellidos: medicoInfo.apellidos,
      hospitalId: medicoInfo.hospital?.id
    });

    next();
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    res.status(401).json({ message: "Token inválido o expirado", error: err });
  }
};

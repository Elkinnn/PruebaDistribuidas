const { pool } = require('./db');
const bcrypt = require('bcryptjs');

// Listado con paginación y filtros (hospitalId, q por nombre/apellido/email)
async function list({ page = 1, size = 20, q = '', hospitalId }) {
  const offset = (page - 1) * size;
  const params = { limit: Number(size), offset: Number(offset) };

  const whereParts = [];
  if (hospitalId) {
    whereParts.push('m.hospitalId = :hospitalId');
    params.hospitalId = Number(hospitalId);
  }
  if (q) {
    whereParts.push('(m.nombres LIKE :q OR m.apellidos LIKE :q OR m.email LIKE :q)');
    params.q = `%${q}%`;
  }
  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM medico m
       ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT m.id, m.hospitalId, m.nombres, m.apellidos, m.email, m.activo,
            h.nombre AS hospitalNombre
       FROM medico m
       JOIN hospital h ON h.id = m.hospitalId
       ${where}
   ORDER BY m.apellidos ASC, m.nombres ASC
      LIMIT :limit OFFSET :offset`,
    params
  );

  // Obtener especialidades para cada médico
  const medicosConEspecialidades = await Promise.all(
    rows.map(async (medico) => {
      const [especialidades] = await pool.query(
        `SELECT e.id, e.nombre, e.descripcion
           FROM medicoespecialidad me
           JOIN especialidad e ON e.id = me.especialidadId
          WHERE me.medicoId = :medicoId
       ORDER BY e.nombre ASC`,
        { medicoId: medico.id }
      );
      
      return {
        ...medico,
        especialidades: especialidades
      };
    })
  );

  return { data: medicosConEspecialidades, meta: { page: Number(page), size: Number(size), total } };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT m.id, m.hospitalId, m.nombres, m.apellidos, m.email, m.activo,
            h.nombre AS hospitalNombre
       FROM medico m
       JOIN hospital h ON h.id = m.hospitalId
      WHERE m.id = :id`,
    { id: Number(id) }
  );
  
  if (!rows[0]) return null;
  
  // Obtener especialidades del médico
  const [especialidades] = await pool.query(
    `SELECT e.id, e.nombre, e.descripcion
       FROM medicoespecialidad me
       JOIN especialidad e ON e.id = me.especialidadId
      WHERE me.medicoId = :id
   ORDER BY e.nombre ASC`,
    { id: Number(id) }
  );
  
  return {
    ...rows[0],
    especialidades: especialidades
  };
}

async function create(dto) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Crear el médico
    const [medicoResult] = await conn.query(
      `INSERT INTO medico (hospitalId, nombres, apellidos, email, activo)
       VALUES (:hospitalId, :nombres, :apellidos, :email, COALESCE(:activo, TRUE))`,
      {
        hospitalId: dto.hospitalId,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        email: dto.email,
        activo: dto.activo ?? true
      }
    );

    const medicoId = medicoResult.insertId;

    // 2. Crear el usuario asociado
    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    await conn.query(
      `INSERT INTO usuario (email, password, rol, medicoId, activo)
       VALUES (:email, :password, 'MEDICO', :medicoId, TRUE)`,
      {
        email: dto.email,
        password: passwordHash,
        medicoId: medicoId
      }
    );

    // 3. Asignar especialidades si se proporcionan
    if (dto.especialidades && Array.isArray(dto.especialidades) && dto.especialidades.length > 0) {
      // Verificar que cada especialidad pertenezca al hospital del médico
      for (const especialidadId of dto.especialidades) {
        const [validacion] = await conn.query(
          `SELECT 1 FROM hospitalespecialidad 
           WHERE hospitalId = :hospitalId AND especialidadId = :especialidadId`,
          { hospitalId: dto.hospitalId, especialidadId: Number(especialidadId) }
        );
        
        if (validacion.length === 0) {
          throw new Error(`La especialidad con ID ${especialidadId} no está disponible en el hospital seleccionado`);
        }
        
        await conn.query(
          `INSERT INTO medicoespecialidad (medicoId, especialidadId)
           VALUES (:medicoId, :especialidadId)`,
          { medicoId, especialidadId: Number(especialidadId) }
        );
      }
    }

    await conn.commit();
    return findById(medicoId);
  } catch (e) {
    await conn.rollback();
    
    // UNIQUE (hospitalId, email) en Medico
    if (e && e.code === 'ER_DUP_ENTRY' && e.sqlMessage.includes('uk_medico_hospital_email')) {
      const err = new Error('Ya existe un médico con ese email en ese hospital');
      err.status = 409;
      throw err;
    }
    
    // UNIQUE email en Usuario
    if (e && e.code === 'ER_DUP_ENTRY' && e.sqlMessage.includes('email')) {
      const err = new Error('Ya existe un usuario con ese email');
      err.status = 409;
      throw err;
    }
    
    // FK hospital inexistente
    if (e && e.code === 'ER_NO_REFERENCED_ROW_2') {
      const err = new Error('El hospital indicado no existe');
      err.status = 400;
      throw err;
    }
    
    throw e;
  } finally {
    conn.release();
  }
}

async function update(id, dto) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const fields = [];
    const params = { id: Number(id) };

    if (dto.hospitalId !== undefined) { fields.push('hospitalId = :hospitalId'); params.hospitalId = Number(dto.hospitalId); }
    if (dto.nombres !== undefined)    { fields.push('nombres = :nombres');       params.nombres = dto.nombres; }
    if (dto.apellidos !== undefined)  { fields.push('apellidos = :apellidos');   params.apellidos = dto.apellidos; }
    if (dto.email !== undefined)      { fields.push('email = :email');           params.email = dto.email; }
    if (dto.activo !== undefined)     { fields.push('activo = :activo');         params.activo = dto.activo; }

    if (!fields.length) {
      await conn.rollback();
      return findById(id);
    }

    const setClause = fields.join(', ');
    
    // 1. Actualizar la tabla medico
    const [result] = await conn.query(
      `UPDATE medico SET ${setClause} WHERE id = :id`,
      params
    );
    
    if (result.affectedRows === 0) {
      await conn.rollback();
      return null;
    }

    // 2. Si se actualiza el email, también actualizar la tabla usuario
    if (dto.email !== undefined) {
      await conn.query(
        `UPDATE usuario SET email = :email WHERE medicoId = :id`,
        { email: dto.email, id: Number(id) }
      );
    }

    // 3. Si se actualiza la contraseña, también actualizar en usuario
    if (dto.password !== undefined) {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      await conn.query(
        `UPDATE usuario SET password = :password WHERE medicoId = :id`,
        { password: passwordHash, id: Number(id) }
      );
    }

    // 4. Si se actualiza el estado activo, también actualizar en usuario
    if (dto.activo !== undefined) {
      await conn.query(
        `UPDATE usuario SET activo = :activo WHERE medicoId = :id`,
        { activo: dto.activo, id: Number(id) }
      );
    }

    // 5. Si se actualizan las especialidades, reemplazar todas las asignaciones
    if (dto.especialidades !== undefined) {
      // Eliminar todas las especialidades actuales
      await conn.query(
        `DELETE FROM medicoespecialidad WHERE medicoId = :id`,
        { id: Number(id) }
      );
      
      // Asignar las nuevas especialidades (solo si pertenecen al hospital del médico)
      if (Array.isArray(dto.especialidades) && dto.especialidades.length > 0) {
        // Obtener el hospitalId del médico
        const [medicoData] = await conn.query(
          `SELECT hospitalId FROM medico WHERE id = :id`,
          { id: Number(id) }
        );
        
        if (medicoData.length > 0) {
          const hospitalId = medicoData[0].hospitalId;
          
          // Verificar que cada especialidad pertenezca al hospital del médico
          for (const especialidadId of dto.especialidades) {
            const [validacion] = await conn.query(
              `SELECT 1 FROM hospitalespecialidad 
               WHERE hospitalId = :hospitalId AND especialidadId = :especialidadId`,
              { hospitalId, especialidadId: Number(especialidadId) }
            );
            
            if (validacion.length === 0) {
              throw new Error(`La especialidad con ID ${especialidadId} no está disponible en el hospital del médico`);
            }
            
            await conn.query(
              `INSERT INTO medicoespecialidad (medicoId, especialidadId)
               VALUES (:medicoId, :especialidadId)`,
              { medicoId: Number(id), especialidadId: Number(especialidadId) }
            );
          }
        }
      }
    }

    await conn.commit();
    return findById(id);
  } catch (e) {
    await conn.rollback();
    
    if (e && e.code === 'ER_DUP_ENTRY') {
      if (e.sqlMessage.includes('uk_medico_hospital_email')) {
        const err = new Error('Ya existe un médico con ese email en ese hospital');
        err.status = 409;
        throw err;
      }
      if (e.sqlMessage.includes('email')) {
        const err = new Error('Ya existe un usuario con ese email');
        err.status = 409;
        throw err;
      }
    }
    if (e && e.code === 'ER_NO_REFERENCED_ROW_2') {
      const err = new Error('El hospital indicado no existe');
      err.status = 400;
      throw err;
    }
    throw e;
  } finally {
    conn.release();
  }
}

async function remove(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Eliminar especialidades del médico
    await conn.query(
      `DELETE FROM medicoespecialidad WHERE medicoId = :id`,
      { id: Number(id) }
    );

    // 2. Eliminar usuario asociado
    await conn.query(
      `DELETE FROM usuario WHERE medicoId = :id`,
      { id: Number(id) }
    );

    // 3. Eliminar médico (DELETE físico)
    const [medicoResult] = await conn.query(
      `DELETE FROM medico WHERE id = :id`,
      { id: Number(id) }
    );

    if (medicoResult.affectedRows === 0) {
      await conn.rollback();
      return false;
    }

    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function reactivate(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Reactivar médico
    const [medicoResult] = await conn.query(
      `UPDATE medico SET activo = TRUE WHERE id = :id`,
      { id: Number(id) }
    );

    if (medicoResult.affectedRows === 0) {
      await conn.rollback();
      return false;
    }

    // 2. Reactivar usuario asociado
    await conn.query(
      `UPDATE usuario SET activo = TRUE WHERE medicoId = :id`,
      { id: Number(id) }
    );

    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { list, findById, create, update, remove, reactivate };

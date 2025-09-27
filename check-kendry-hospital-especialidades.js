const mysql = require('mysql2/promise');

async function checkKendryHospitalEspecialidades() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'hospitalservice'
        });

        console.log('=== ESPECIALIDADES DEL HOSPITAL DE KENDRY ===');
        
        // Obtener información del médico Kendry
        const [medico] = await connection.execute(`
            SELECT m.id, m.nombres, m.apellidos, h.id as hospitalId, h.nombre as hospitalNombre 
            FROM medico m 
            JOIN hospital h ON m.hospitalId = h.id 
            WHERE m.email = 'kendry@gmail.com'
        `);
        
        if (medico.length > 0) {
            const kendry = medico[0];
            console.log(`Médico: ${kendry.nombres} ${kendry.apellidos}`);
            console.log(`Hospital: ${kendry.hospitalNombre} (ID: ${kendry.hospitalId})`);
            
            // Obtener especialidades del hospital
            const [especialidades] = await connection.execute(`
                SELECT e.id, e.nombre, e.descripcion, e.icono, e.activa
                FROM especialidad e
                JOIN hospitalespecialidad he ON e.id = he.especialidadId
                WHERE he.hospitalId = ?
                ORDER BY e.nombre
            `, [kendry.hospitalId]);
            
            console.log(`\nEspecialidades del hospital ${kendry.hospitalNombre}:`);
            especialidades.forEach(esp => {
                console.log(`- ${esp.nombre} (ID: ${esp.id})`);
                console.log(`  Descripción: ${esp.descripcion || 'N/A'}`);
                console.log(`  Icono: ${esp.icono || 'N/A'}`);
                console.log(`  Activa: ${esp.activa ? 'Sí' : 'No'}`);
            });
            
            console.log(`\nTotal especialidades: ${especialidades.length}`);
        } else {
            console.log('No se encontró el médico Kendry');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkKendryHospitalEspecialidades();

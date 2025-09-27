const mysql = require('mysql2/promise');

async function testEspecialidades() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'hospitalservice'
        });

        console.log('=== VERIFICANDO DATOS DE ESPECIALIDADES ===');
        
        // Verificar especialidades
        const [especialidades] = await connection.execute('SELECT * FROM especialidad');
        console.log('Especialidades en la BD:');
        especialidades.forEach(esp => console.log(`- ID: ${esp.id}, Nombre: ${esp.nombre}`));
        
        // Verificar hospital-especialidad
        const [hospitalEspecialidades] = await connection.execute('SELECT * FROM hospitalespecialidad');
        console.log('\nRelaciones hospital-especialidad:');
        hospitalEspecialidades.forEach(he => console.log(`- Hospital ID: ${he.hospitalId}, Especialidad ID: ${he.especialidadId}`));
        
        // Verificar hospitales
        const [hospitales] = await connection.execute('SELECT * FROM hospital');
        console.log('\nHospitales en la BD:');
        hospitales.forEach(h => console.log(`- ID: ${h.id}, Nombre: ${h.nombre}`));
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEspecialidades();

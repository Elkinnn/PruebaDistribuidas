const mysql = require('mysql2/promise');

async function checkEspecialidadesDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'hospitalservice'
        });

        console.log('=== VERIFICANDO TABLAS DE ESPECIALIDADES ===');
        
        // Verificar si existe tabla especialidades
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'hospitalservice' 
            AND TABLE_NAME LIKE '%especialidad%'
        `);
        
        console.log('Tablas relacionadas con especialidades:');
        tables.forEach(table => console.log('-', table.TABLE_NAME));
        
        if (tables.length === 0) {
            console.log('No se encontraron tablas de especialidades');
        }
        
        // Verificar si existe tabla hospital_especialidad
        const [hospitalEspecialidadTables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'hospitalservice' 
            AND TABLE_NAME LIKE '%hospital%especialidad%'
        `);
        
        console.log('\nTablas relacionadas con hospital-especialidad:');
        hospitalEspecialidadTables.forEach(table => console.log('-', table.TABLE_NAME));
        
        // Verificar estructura de la tabla especialidad si existe
        if (tables.length > 0) {
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = 'hospitalservice' 
                AND TABLE_NAME = '${tables[0].TABLE_NAME}'
            `);
            
            console.log(`\nEstructura de la tabla ${tables[0].TABLE_NAME}:`);
            columns.forEach(col => console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(not null)'}`));
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkEspecialidadesDB();

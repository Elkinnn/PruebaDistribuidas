const mysql = require('mysql2/promise');

async function verifyProfileUpdate() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'hospitalservice'
        });

        console.log('=== VERIFICANDO ACTUALIZACIÓN EN BD ===');
        
        // Verificar tabla medico
        const [medico] = await connection.execute(`
            SELECT id, nombres, apellidos, email 
            FROM medico 
            WHERE email = 'kendry.nuevo@gmail.com'
        `);
        
        console.log('Tabla medico:');
        if (medico.length > 0) {
            console.log(`- ID: ${medico[0].id}`);
            console.log(`- Nombres: ${medico[0].nombres}`);
            console.log(`- Apellidos: ${medico[0].apellidos}`);
            console.log(`- Email: ${medico[0].email}`);
        } else {
            console.log('- No se encontró el médico con el nuevo email');
        }
        
        // Verificar tabla usuario
        const [usuario] = await connection.execute(`
            SELECT id, email, rol 
            FROM usuario 
            WHERE email = 'kendry.nuevo@gmail.com'
        `);
        
        console.log('\nTabla usuario:');
        if (usuario.length > 0) {
            console.log(`- ID: ${usuario[0].id}`);
            console.log(`- Email: ${usuario[0].email}`);
            console.log(`- Rol: ${usuario[0].rol}`);
        } else {
            console.log('- No se encontró el usuario con el nuevo email');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyProfileUpdate();

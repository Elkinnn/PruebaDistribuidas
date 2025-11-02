// Usar process.env directamente como el servicio de admin
export const envs = {
    PORT: Number(process.env.PORT ?? 3000),
    MYSQL_HOST: process.env.MYSQL_HOST || 'localhost',
    MYSQL_DB: process.env.MYSQL_DB || 'hospitalservice',
    MYSQL_PORT: Number(process.env.MYSQL_PORT) || 3306, 
    MYSQL_USER: process.env.MYSQL_USER || 'root', 
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
    JWT_SECRET: process.env.JWT_SECRET || 'secretKey123',
    MYSQL_SSL: parseBoolean(process.env.MYSQL_SSL, false),
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) {
        return defaultValue;
    }
    const normalized = value.toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
}
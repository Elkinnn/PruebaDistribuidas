# 📚 Documentación de Código con JSDoc

## 🎯 Para Documentar Código JavaScript/TypeScript

### 1. Instalación

```bash
# Instalar JSDoc globalmente
npm install -g jsdoc

# O como dependencia de desarrollo
npm install --save-dev jsdoc
```

### 2. Configuración - jsdoc.json

```json
{
  "source": {
    "include": ["./src/"],
    "includePattern": "\\.(js|jsx)$",
    "excludePattern": "(node_modules/|dist/)"
  },
  "opts": {
    "destination": "./docs/jsdoc/",
    "recurse": true
  },
  "plugins": [
    "plugins/markdown"
  ],
  "templates": {
    "cleverLinks": false,
    "monospaceLinks": false
  }
}
```

### 3. Ejemplo de Documentación

#### Admin Service - src/domain/entities/Especialidad.js
```javascript
/**
 * @fileoverview Entidad Especialidad del dominio
 * @author Tu Nombre
 * @since 1.0.0
 */

/**
 * Clase que representa una especialidad médica
 * @class Especialidad
 * @description Entidad del dominio para especialidades médicas
 */
class Especialidad {
  /**
   * Crea una instancia de Especialidad
   * @param {Object} data - Datos de la especialidad
   * @param {string} data.nombre - Nombre de la especialidad
   * @param {string} [data.descripcion] - Descripción opcional
   * @param {boolean} [data.activa=true] - Estado de la especialidad
   * @throws {Error} Si el nombre es requerido
   * @example
   * const especialidad = new Especialidad({
   *   nombre: 'Cardiología',
   *   descripcion: 'Especialidad en enfermedades del corazón'
   * });
   */
  constructor(data) {
    if (!data.nombre) {
      throw new Error('El nombre de la especialidad es requerido');
    }
    
    this.nombre = data.nombre;
    this.descripcion = data.descripcion || '';
    this.activa = data.activa !== undefined ? data.activa : true;
  }

  /**
   * Valida si la especialidad está activa
   * @returns {boolean} True si está activa
   * @example
   * if (especialidad.isActive()) {
   *   console.log('Especialidad disponible');
   * }
   */
  isActive() {
    return this.activa;
  }
}

module.exports = Especialidad;
```

#### Gateway - src/middleware/proxy.js
```javascript
/**
 * @fileoverview Middleware para proxy de peticiones
 * @author Tu Nombre
 * @since 1.0.0
 */

/**
 * Crea configuración base para proxy
 * @param {string} target - URL del servicio destino
 * @param {Object} [pathRewrite={}] - Reglas de reescritura de path
 * @returns {Object} Configuración del proxy
 * @example
 * const config = createProxyConfig('http://localhost:3001', {
 *   '^/admin': ''
 * });
 */
const createProxyConfig = (target, pathRewrite = {}) => {
  // ... implementación
};

/**
 * Crea configuración especial para archivos binarios (PDFs)
 * @param {string} target - URL del servicio destino
 * @param {Object} [pathRewrite={}] - Reglas de reescritura de path
 * @returns {Object} Configuración del proxy para archivos
 * @example
 * const fileConfig = createFileProxyConfig('http://localhost:3001');
 */
const createFileProxyConfig = (target, pathRewrite = {}) => {
  // ... implementación
};

module.exports = {
  createProxyConfig,
  createFileProxyConfig
};
```

### 4. Generar Documentación

```bash
# Generar documentación
jsdoc -c jsdoc.json

# O con npm script
npm run docs:generate
```

### 5. Scripts en package.json

```json
{
  "scripts": {
    "docs:generate": "jsdoc -c jsdoc.json",
    "docs:serve": "http-server docs/jsdoc -p 8080",
    "docs:clean": "rm -rf docs/jsdoc"
  }
}
```

## 📊 URLs de Documentación

- **JSDoc**: http://localhost:8080
- **Archivos generados**: `./docs/jsdoc/`

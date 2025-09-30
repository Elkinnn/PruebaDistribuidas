# 📚 Documentación de Arquitectura con Mermaid

## 🎯 Para Diagramas de Arquitectura

### 1. Instalación

```bash
# Instalar Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# O como dependencia de desarrollo
npm install --save-dev @mermaid-js/mermaid-cli
```

### 2. Diagrama de Arquitectura General

#### docs/diagrams/architecture.mmd
```mermaid
graph TB
    subgraph "Frontend"
        A[React App<br/>localhost:3003]
    end
    
    subgraph "API Gateway"
        B[Express Gateway<br/>localhost:3000]
    end
    
    subgraph "Microservicios"
        C[Admin Service<br/>localhost:3001]
        D[Medico Service<br/>localhost:3002]
    end
    
    subgraph "Base de Datos"
        E[(MySQL<br/>localhost:3306)]
    end
    
    A -->|HTTP/HTTPS| B
    B -->|Proxy| C
    B -->|Proxy| D
    C -->|TypeORM| E
    D -->|Prisma| E
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#fff3e0
```

### 3. Diagrama de Flujo de Datos

#### docs/diagrams/data-flow.mmd
```mermaid
sequenceDiagram
    participant F as Frontend
    participant G as Gateway
    participant A as Admin Service
    participant DB as MySQL
    
    F->>G: POST /auth/login
    G->>A: Proxy to /auth/login
    A->>DB: Validate credentials
    DB-->>A: User data
    A-->>G: JWT token
    G-->>F: JWT token
    
    F->>G: GET /especialidades
    Note over F,G: With JWT token
    G->>A: Proxy to /especialidades
    A->>DB: Query especialidades
    DB-->>A: Data
    A-->>G: JSON response
    G-->>F: JSON response
```

### 4. Diagrama de Componentes

#### docs/diagrams/components.mmd
```mermaid
graph LR
    subgraph "Frontend Components"
        A[Login Component]
        B[Dashboard Component]
        C[CitaForm Component]
        D[MedicoTable Component]
    end
    
    subgraph "API Layer"
        E[Auth API]
        F[Admin API]
        G[Medico API]
    end
    
    subgraph "Services"
        H[Admin Service]
        I[Medico Service]
    end
    
    A --> E
    B --> F
    C --> G
    D --> F
    
    E --> H
    F --> H
    G --> I
```

### 5. Scripts para Generar Diagramas

#### package.json
```json
{
  "scripts": {
    "docs:diagrams": "mmdc -i docs/diagrams/architecture.mmd -o docs/images/architecture.png",
    "docs:diagrams:all": "mmdc -i docs/diagrams/ -o docs/images/ -e png",
    "docs:serve": "http-server docs -p 8080"
  }
}
```

### 6. Integración con README

#### README.md
```markdown
## 🏗️ Arquitectura

![Arquitectura del Sistema](./docs/images/architecture.png)

## 📊 Flujo de Datos

![Flujo de Datos](./docs/images/data-flow.png)

## 🧩 Componentes

![Componentes](./docs/images/components.png)
```

## 📊 URLs de Documentación

- **Documentación estática**: http://localhost:8080
- **Diagramas**: `./docs/images/`

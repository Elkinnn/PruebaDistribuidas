# 📚 Documentación de Componentes con Storybook

## 🎯 Para Componentes React

### 1. Instalación

```bash
# Instalar Storybook
cd apps/frontend
npx storybook@latest init

# O manualmente
npm install --save-dev @storybook/react @storybook/react-vite
```

### 2. Configuración - .storybook/main.js

```javascript
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-viewport'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};
```

### 3. Ejemplo de Story

#### src/components/ui/Button.stories.jsx
```javascript
import Button from './Button';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Componente de botón reutilizable con diferentes variantes y tamaños.'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Variante del botón'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del botón'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Estado deshabilitado'
    }
  }
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'Botón Primario'
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Botón Secundario'
};

export const Danger = Template.bind({});
Danger.args = {
  variant: 'danger',
  children: 'Botón Peligro'
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  children: 'Botón Deshabilitado'
};
```

#### src/components/cita/CitaForm.stories.jsx
```javascript
import CitaForm from './CitaForm';

export default {
  title: 'Citas/CitaForm',
  component: CitaForm,
  parameters: {
    docs: {
      description: {
        component: 'Formulario para crear y editar citas médicas.'
      }
    }
  }
};

const Template = (args) => <CitaForm {...args} />;

export const CreateCita = Template.bind({});
CreateCita.args = {
  mode: 'create',
  onSubmit: (data) => console.log('Crear cita:', data)
};

export const EditCita = Template.bind({});
EditCita.args = {
  mode: 'edit',
  initialData: {
    paciente: 'Juan Pérez',
    medico: 'Dr. García',
    fecha: '2024-01-15',
    hora: '10:00'
  },
  onSubmit: (data) => console.log('Editar cita:', data)
};
```

### 4. Scripts en package.json

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "docs:storybook": "npm run storybook"
  }
}
```

## 📊 URLs de Documentación

- **Storybook**: http://localhost:6006
- **Build estático**: `./storybook-static/`

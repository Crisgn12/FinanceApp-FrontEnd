# FinanceApp - FrontEnd

## Descripción
Aplicacion para gestionar finanzas personales.

## Requisitos previos
Tener instalado lo siguiente:
- **Node.js** (versión 18.x o superior): Descarga e instala desde [nodejs.org](https://nodejs.org/).

## Pasos para ejecutar el proyecto

1. **Clonar el repositorio**

2. **Abrir una terminal de VS Code**

3. **Ejecutar el siguiente comando para instalar las dependencias**
    ```terminal
    npm install
    ```

4. **Ejecutar el siguiente comando para correr el proyecto**
    ```terminal
    npm run dev
    ```

5. **Abrir la URL que aparece**


## Estructura principal del proyecto
    FinanceApp-Frontend/
    ├── public/                # Archivos estáticos (ej. favicon, imágenes)
    ├── src/                   # Código fuente
    │   ├── components/        # Componentes de React reutilizables como cards y esas cosas
    │       ├── templates/     # Aqui esta el layout que envuelve a la aplicación principal   
    │   ├── pages/             # Componentes de páginas completas para React Router
    │   ├── App.jsx            # Componente principal
    │   ├── index.css          # Estilos globales (Tailwind CSS)
    │   ├── main.jsx           # Punto de entrada de la aplicación
    ├── index.html             # Archivo HTML principal
    ├── package.json           # Dependencias y scripts
    ├── vite.config.js         # Configuración de Vite
    ├── README.md              # Este archivo

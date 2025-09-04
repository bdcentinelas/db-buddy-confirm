# Db Buddy Confirm - Sistema de Gestión Electoral

Un sistema completo para la gestión de movilización electoral con flota vehicular y dirigentes.

## Descripción del Proyecto

Db Buddy Confirm es una aplicación web diseñada para gestionar operaciones de movilización electoral, permitiendo la administración de vehículos, dirigentes y votantes movilizados. La aplicación proporciona un dashboard en tiempo real con métricas clave y funcionalidades avanzadas para coordinar eficientemente las operaciones de campo.

## Características Principales

- **Dashboard en Tiempo Real**: Monitoreo de votantes movilizados, vehículos activos y dirigentes en operación
- **Gestión de Flota Vehicular**: Administración de vehículos con estados (disponible, en viaje, mantenimiento, inactivo)
- **Gestión de Dirigentes**: Creación, edición y asignación de dirigentes a zonas específicas
- **Control de Acceso**: Sistema de autenticación con roles basados en permisos
- **Importación Masiva**: Carga de vehículos desde archivos Excel
- **Interfaz Responsiva**: Diseño optimizado para escritorio y dispositivos móviles
- **Manejo de Estados**: Implementación completa de estados de carga, vacío y error
- **Notificaciones Globales**: Sistema unificado de notificaciones al usuario

## Tecnologías Utilizadas

- **Frontend**: Vite, React 18, TypeScript
- **UI Components**: shadcn/ui con Tailwind CSS
- **Estado**: React Query para manejo de estado del servidor
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Notificaciones**: Sonner (Toast/Snackbar)
- **Gráficos**: Recharts para visualización de datos

## Requisitos del Sistema

- Node.js 18 o superior
- npm o yarn equivalente
- Supabase project (para configuración de base de datos y autenticación)

## Configuración del Entorno de Desarrollo

### 1. Clonación del Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd db-buddy-confirm
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_NAME=Db Buddy Confirm
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_DARK_MODE=false
VITE_ENABLE_ANALYTICS=false
```

### 4. Configuración de la Base de Datos Supabase

#### Opción 1: Importación Automática (Recomendado)

1. **Instala la CLI de Supabase**:
   ```bash
   npm install -g supabase
   ```

2. **Inicia sesión en Supabase**:
   ```bash
   supabase login
   ```

3. **Conecta tu proyecto local**:
   ```bash
   supabase link --project-ref TU_PROJECT_REF
   ```

4. **Ejecuta las migraciones**:
   ```bash
   supabase db push
   ```

#### Opción 2: Importación Manual

1. **Accede al dashboard de Supabase** y selecciona tu proyecto

2. **Ve a la sección SQL Editor** y haz clic en "New query"

3. **Copia y ejecuta el siguiente SQL** para crear las tablas básicas:
   ```sql
   -- Crear tabla de organizaciones
   CREATE TABLE organizations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Crear tabla de perfiles (usuarios)
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
     full_name TEXT NOT NULL,
     email TEXT NOT NULL UNIQUE,
     role TEXT NOT NULL CHECK (role IN ('admin', 'dirigente', 'superadmin')),
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     operating_barrio TEXT,
     dni TEXT,
     address TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Crear tabla de vehículos
   CREATE TABLE vehicles (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     license_plate TEXT NOT NULL UNIQUE,
     description TEXT,
     capacity INTEGER NOT NULL CHECK (capacity > 0),
     status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_viaje', 'en_mantenimiento', 'inactivo')),
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     assigned_dirigente_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Crear tabla de votantes movilizados
   CREATE TABLE mobilized_voters (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     full_name TEXT NOT NULL,
     dni TEXT NOT NULL,
     phone TEXT,
     destination_school TEXT,
     registered_by_dirigente_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Crear políticas de seguridad RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE mobilized_voters ENABLE ROW LEVEL SECURITY;

   -- Crear políticas de aislamiento multi-tenant
   CREATE POLICY "Organizations are isolated" ON profiles
     FOR ALL TO authenticated
     USING (organization_id = auth.jwt() ->> 'organization_id');

   CREATE POLICY "Vehicles are isolated" ON vehicles
     FOR ALL TO authenticated
     USING (organization_id = auth.jwt() ->> 'organization_id');

   CREATE POLICY "Mobilized voters are isolated" ON mobilized_voters
     FOR ALL TO authenticated
     USING (organization_id = auth.jwt() ->> 'organization_id');

   -- Crear función para actualizar updated_at
   CREATE OR REPLACE FUNCTION handle_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   -- Crear triggers para actualizar updated_at
   CREATE TRIGGER handle_profiles_updated_at
     BEFORE UPDATE ON profiles
     FOR EACH ROW
     EXECUTE FUNCTION handle_updated_at();

   CREATE TRIGGER handle_vehicles_updated_at
     BEFORE UPDATE ON vehicles
     FOR EACH ROW
     EXECUTE FUNCTION handle_updated_at();
   ```

4. **Habilita los Edge Functions requeridos**:
   - `create-dirigente`
   - `bulk-import-vehicles`
   - `ask-electoral-assistant`

5. **Configura los secretos para Edge Functions**:
   - En el dashboard de Supabase, ve a Edge Functions
   - Para cada función, agrega el secreto `DEEPSEEK_API_KEY` (para `ask-electoral-assistant`)

### 5. Ejecución del Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la construcción de producción
- `npm run lint`: Ejecuta el análisis de código ESLint
- `npm run type-check`: Ejecuta la verificación de tipos TypeScript

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables de UI
├── contexts/           # Contextos de React para estado global
├── hooks/              # Hooks personalizados
├── integrations/       # Integraciones con servicios externos
├── lib/                # Utilidades y funciones auxiliares
├── pages/              # Páginas de la aplicación
└── types/              # Definiciones de TypeScript
```

## Roles de Usuario

- **Administrador**: Acceso completo a todas las funcionalidades
- **Dirigente**: Gestión de vehículos asignados y registro de votantes
- **Superadministrador**: Configuración global del sistema

## Despliegue para Producción

### 1. Construcción de la Aplicación

```bash
npm run build
```

### 2. Configuración de Variables de Entorno

Asegúrate de que las variables de entorno estén configuradas correctamente en el entorno de producción:

```env
VITE_SUPABASE_URL=https://your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-key
```

### 3. Despliegue en Servidor Estático

La aplicación está lista para ser desplegada en cualquier servicio de hosting estático:

- **Vercel**
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

### 4. Configuración de Dominio Personalizado

1. Configura el dominio en tu proveedor de hosting
2. Actualiza los archivos de configuración si es necesario
3. Verifica que todas las rutas funcionan correctamente

## Buenas Prácticas

- **Manejo de Errores**: La aplicación incluye un Error Boundary global para manejar errores inesperados
- **Accesibilidad**: Los componentes siguen las mejores prácticas de accesibilidad web
- **Rendimiento**: Implementación de código splitting y carga diferida
- **Seguridad**: No se almacenan claves secretas en el código fuente

## Solución de Problemas

### Problemas Comunes

1. **Errores de Construcción**: Asegúrate de tener Node.js 18+ y todas las dependencias instaladas
2. **Problemas de Conexión con Supabase**: Verifica que las variables de entorno estén configuradas correctamente
3. **Permisos de Acceso**: Confirma que los roles de usuario estén configurados correctamente en Supabase

### Soporte

Para reportar problemas o solicitar características, crea un issue en el repositorio del proyecto.

## Licencia

Este proyecto está bajo licencia. Consulta el archivo LICENSE para más detalles.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue las siguientes pautas:

1. Realiza un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Versión

**Versión Actual**: 1.0.0

**Última Actualización**: 2024

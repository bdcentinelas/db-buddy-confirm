# 04_DATABASE_SCHEMA.md

---

`# 04*_DATABASE_*SCHEMA.md: Esquema de la Base de Datos (Supabase/PostgreSQL)

## 1. Visión General

Este documento define el esquema de la base de datos PostgreSQL que se implementará en Supabase. El diseño está centrado en la ****arquitectura multi-tenant****, utilizando ****UUIDs**** como claves primarias para evitar colisiones y ****Políticas de Seguridad a Nivel de Fila (RLS)**** para garantizar un estricto aislamiento de datos entre las diferentes campañas (tenants).

---

## 2. Diagrama de Entidad-Relación (Conceptual)

A continuación, se presenta un diagrama conceptual de las relaciones principales entre las tablas del sistema.

```mermaid
erDiagram
    organizations {
        UUID id PK "Tenant ID"
        TEXT name
    }
    profiles {
        UUID id PK "FK a auth.users"
        UUID organization_id FK
        user_role role
        TEXT full_name
        TEXT dni
    }
    vehicles {
        UUID id PK
        UUID organization_id FK
        UUID assigned_dirigente_id FK "Dirigente a cargo"
        TEXT license_plate
        vehicle_status status
    }
    mobilized_voters {
        UUID id PK
        UUID organization_id FK
        UUID registered_by_dirigente_id FK "Dirigente que registra"
        TEXT full_name
        TEXT dni
        TEXT phone
    }

    organizations ||--o{ profiles : "tiene"
    organizations ||--o{ vehicles : "posee"
    organizations ||--o{ mobilized_voters : "registra en"
    profiles ||--o{ vehicles : "es asignado a"
    profiles ||--o{ mobilized_voters : "registra"`

---

## 3. Definición de Tipos y Tablas

### 3.1. Tipos de Datos Personalizados (ENUMs)

Para mantener la consistencia de los datos, se definirán los siguientes tipos `ENUM`:

SQL

- `- Roles de usuario dentro de una organización
CREATE TYPE user_role AS ENUM ('admin', 'dirigente');
-- Posibles estados de un vehículo
CREATE TYPE vehicle_status AS ENUM ('disponible', 'en_viaje', 'en_mantenimiento', 'inactivo');`

### 3.2. Definición de Tablas

**`organizations`** (Tabla de Tenants)

- Almacena cada campaña electoral como una entidad separada.

| Nombre de Columna | Tipo de Dato | Restricciones / Notas |
| --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY`, `default: gen_random_uuid()` |
| `name` | `text` | `NOT NULL`, Nombre de la campaña/organización. |
| `created_at` | `timestamptz` | `default: now()` |

**`profiles`** (Perfiles de Usuario)

- Extiende la tabla `auth.users` de Supabase para añadir roles y datos específicos de la aplicación.

| Nombre de Columna | Tipo de Dato | Restricciones / Notas |
| --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `organization_id` | `uuid` | `NOT NULL`, `REFERENCES organizations(id) ON DELETE CASCADE`. Vincula al usuario con su tenant. |
| `role` | `user_role` | `NOT NULL`. Define si el usuario es `admin` o `dirigente`. |
| `full_name` | `text` | `NOT NULL` |
| `dni` | `text` | `UNIQUE`. Documento Nacional de Identidad. |
| `address` | `text` |  |
| `operating_barrio` | `text` | Barrio de operación para el `dirigente`. |

**`vehicles`** (Flota Vehicular)

- Almacena la información de cada vehículo de la flota.

| Nombre de Columna | Tipo de Dato | Restricciones / Notas |
| --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY`, `default: gen_random_uuid()` |
| `organization_id` | `uuid` | `NOT NULL`, `REFERENCES organizations(id)`. |
| `assigned_dirigente_id` | `uuid` | `REFERENCES profiles(id) ON DELETE SET NULL`. Dirigente responsable del vehículo. |
| `license_plate` | `text` | `NOT NULL UNIQUE`. Patente del vehículo. |
| `description` | `text` | Modelo, marca, color, etc. |
| `capacity` | `integer` | Capacidad de pasajeros. |
| `status` | `vehicle_status` | `NOT NULL`, `default: 'disponible'`. |
| `created_at` | `timestamptz` | `default: now()` |

**`mobilized_voters`** (Votantes Movilizados)

- Almacena cada registro de una persona transportada. Optimizada para inserciones rápidas.

| Nombre de Columna | Tipo de Dato | Restricciones / Notas |
| --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY`, `default: gen_random_uuid()` |
| `organization_id` | `uuid` | `NOT NULL`, `REFERENCES organizations(id)`. |
| `registered_by_dirigente_id` | `uuid` | `NOT NULL`, `REFERENCES profiles(id)`. Dirigente que realizó el registro. |
| `full_name` | `text` | `NOT NULL`. |
| `dni` | `text` | `NOT NULL`. |
| `phone` | `text` |  |
| `destination_school` | `text` | Escuela o centro de votación de destino. |
| `created_at` | `timestamptz` | `default: now()` |

---

## 4. Políticas de Seguridad a Nivel de Fila (RLS)

Las RLS son **esenciales** para el modelo **multi-tenant**. Se activarán en todas las tablas que contienen `organization_id`.

- **Principio Fundamental:** Ningún usuario podrá ver o modificar datos que no pertenezcan a su `organization_id`.
- **Política para `ADMINISTRADOR`:** Tendrá permisos `SELECT`, `INSERT`, `UPDATE`, `DELETE` sobre las tablas `profiles`, `vehicles` y `mobilized_voters` **únicamente** para las filas que coincidan con su `organization_id`.
- **Política para `DIRIGENTE`:**
    - Podrá realizar `INSERT` en la tabla `mobilized_voters`.
    - Tendrá permisos `SELECT` y `UPDATE` solo en los votantes que él mismo haya registrado (`registered_by_dirigente_id` = `auth.uid()`).
    - Tendrá permiso `SELECT` para ver los vehículos que le han sido asignados (`assigned_dirigente_id` = `auth.uid()`).
    - Tendrá permiso `UPDATE` sobre el campo `status` de sus vehículos asignados.
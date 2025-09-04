# 02_USER_PERSONAS.md

# Perfiles de Usuario del Sistema

Este documento describe los tres arquetipos de usuario que interactuarán con el "Sistema de Gestión de Movilización Electoral". Cada perfil tiene un conjunto distinto de objetivos, tareas, habilidades técnicas y permisos.

---

## 1. DIRIGENTE (Usuario Operativo en Campo)

- **Arquetipo:** "El Ejecutor Rápido"
- **Objetivo Principal:** Registrar la mayor cantidad de votantes movilizados en el menor tiempo posible y reportar el estado de los vehículos a su cargo.
- **Contexto de Uso:** Día de las elecciones, en la calle, bajo presión de tiempo, utilizando principalmente un smartphone con conexión de datos móviles potencialmente intermitente.

### 1.1. Características y Habilidades

- **Nivel Técnico:** Básico. Se siente cómodo con aplicaciones de mensajería (WhatsApp) y redes sociales, pero no necesariamente con herramientas de gestión complejas.
- **Dispositivo Principal:** Smartphone (Android).
- **Necesidades Clave:**
    - Una interfaz **extremadamente simple, rápida y con botones grandes**.
    - Flujos de trabajo optimizados para minimizar clics y escritura.
    - Acceso rápido para registrar un nuevo votante y actualizar el estado de un vehículo.
    - La aplicación debe ser `mobile-first` y funcionar de manera fluida en conexiones lentas.

### 1.2. Tareas Principales

- **Gestión de Votantes:**
    - **Registro Rápido:** Ingresar Nombre, DNI, Teléfono y Barrio de la Escuela de Destino de la persona transportada.
    - **Edición Simple:** Corregir rápidamente cualquier error en los datos de un votante registrado.
- **Gestión de Vehículos:**
    - **Visualización:** Ver la lista de vehículos que tiene asignados.
    - **Actualización de Estado:** Cambiar el estado de un vehículo (ej. "En viaje", "Disponible", "En mantenimiento", "No Trabajo").

### 1.3. Permisos

- **Acceso:** Solo puede ver y gestionar los votantes y vehículos directamente asignados a él por un Administrador.
- **Restricciones:** No tiene acceso a dashboards, métricas globales, gestión de otros dirigentes ni a la configuración de la campaña.

---

## 2. ADMINISTRADOR (Coordinador Regional)

- **Arquetipo:** "El Estratega Táctico"
- **Objetivo Principal:** Tener una visión completa y en tiempo real de la operación de movilización en su región para tomar decisiones estratégicas, reasignar recursos y maximizar la participación.
- **Contexto de Uso:** Generalmente desde una oficina o centro de comando, utilizando una tablet o una laptop. Necesita visualizar grandes cantidades de datos de forma clara.

### 2.1. Características y Habilidades

- **Nivel Técnico:** Intermedio. Cómodo con hojas de cálculo (Excel), dashboards y herramientas de gestión.
- **Dispositivo Principal:** Laptop, PC de escritorio o Tablet.
- **Necesidades Clave:**
    - Un **dashboard de inteligencia electoral** con métricas y visualizaciones claras.
    - Herramientas para la gestión masiva de datos (ej. importación de vehículos desde Excel).
    - Capacidad para crear, editar, buscar y asignar recursos (dirigentes y vehículos) de forma eficiente.
    - Un **asistente de IA** para obtener respuestas rápidas y generar informes sin tener que navegar por menús complejos.

### 2.2. Tareas Principales

- **Gestión de Dirigentes:**
    - **Creación y Administración:** Registrar, buscar perfiles completos de dirigentes (nombre, DNI, barrio de operación, etc.).
    - **Asignación:** Asignar, buscar vehículos específicos a cada dirigente.
- **Gestión de Flota Vehicular:**
    - **Registro:** Alta manual de vehículos individuales o importación masiva desde archivos Excel.
    - **Asignación Estratégica:** Distribuir vehículos por zonas geográficas y dirigentes.
    - **Busqueda:** Buscar Vehículos
- **Monitoreo y Toma de Decisiones:**
    - **Dashboard:** Analizar métricas en tiempo real (votantes movilizados por dirigente/zona, cobertura por barrio).
    - **Alertas:** Identificar zonas/barrios con baja participación.
    - **Redistribución:** Reasignar vehículos dinámicamente según la demanda observada.
- **Asistente de IA:**
    - **Consultas en Lenguaje Natural:** Preguntar al sistema sobre el estado de la movilización (ej. "¿Qué zonas/barrio necesitan más vehículos?").
    - **Generación de Informes:** Solicitar informes personalizados (ej. "Genera un reporte de la última hora").

### 1.3. Permisos

- **Acceso:** Control total sobre todos los datos y operaciones dentro de su instancia (tenant) de la campaña.
- **Restricciones:** No puede ver ni gestionar datos de otras campañas/tenants.

---

## 3. SUPERADMINISTRADOR (Nivel SaaS)

- **Arquetipo:** "El Arquitecto del Sistema"
- **Objetivo Principal:** Gestionar el ciclo de vida de las diferentes instancias de la plataforma para cada campaña electoral, asegurando el correcto funcionamiento, la seguridad y el aislamiento de los datos.
- **Contexto de Uso:** Entorno de administración del sistema, enfocado en la gestión de la infraestructura y los clientes (campañas).

### 3.1. Características y Habilidades

- **Nivel Técnico:** Avanzado. Comprensión de arquitecturas multi-tenant, bases de datos y gestión de sistemas SaaS.
- **Dispositivo Principal:** PC de escritorio o Laptop.
- **Necesidades Clave:**
    - Una interfaz para crear, suspender o eliminar tenants (instancias de campañas).
    - Métricas globales sobre el rendimiento y uso del sistema (sin acceder a datos específicos de votantes).
    - Herramientas para la gestión de licencias y permisos a nivel de organización.

### 3.2. Tareas Principales

- **Gestión Multi-Tenant:**
    - **Creación de Instancias:** Dar de alta a una nueva campaña, creando su entorno de datos aislado.
    - **Administración de Cuentas:** Gestionar las suscripciones y el estado de cada tenant.
- **Monitoreo del Sistema:**
    - **Análisis de Performance:** Supervisar la salud general de la plataforma.
- **Gestión de Accesos:**
    - **Control de Licencias:** Administrar los permisos y accesos para cada organización cliente.

### 1.3. Permisos

- **Acceso:** Total sobre la plataforma a nivel de infraestructura y gestión de tenants.
- **Restricciones:** **No tiene acceso a los datos operativos sensibles** de cada campaña (votantes, dirigentes, etc.), garantizando la privacidad y el aislamiento de datos.
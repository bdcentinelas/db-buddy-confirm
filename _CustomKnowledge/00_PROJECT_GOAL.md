# 00_PROJECT_GOALS.md: Objetivos y Alcance del Proyecto

## 1. Título del Proyecto

Sistema de Gestión de Movilización Electoral

## 2. Visión General y Objetivo Principal

Desarrollar una plataforma web de gestión integral para coordinar y monitorear la movilización de votantes durante el día de las elecciones. El objetivo es optimizar la asignación de recursos de transporte, proporcionar visibilidad en tiempo real del proceso y maximizar la participación electoral a través de una operación eficiente y basada en datos.

## 3. Alcance del Sistema

### 3.1. Modelo de Negocio: SaaS Multi-Tenant

El sistema operará como un Servicio (SaaS) donde múltiples campañas u organizaciones políticas pueden contratar instancias independientes y completamente aisladas de la plataforma. Cada "tenant" (organización) tendrá su propio entorno de datos, con sus propios administradores, dirigentes, vehículos y votantes.

### 3.2. Estructura de Usuarios

El sistema tendrá una arquitectura de tres niveles de usuario para garantizar un control granular y una separación clara de responsabilidades:

- **Superadministrador (Nivel SaaS):** Gestiona la creación y administración de las instancias (tenants) para cada campaña electoral. Tiene acceso a métricas globales de rendimiento del sistema sin acceder a los datos específicos de cada tenant.
- **Administrador (Coordinador Regional):** Es el usuario principal de un tenant específico. Responsable de la configuración de la campaña, la gestión de la flota vehicular, la creación de perfiles de dirigentes y el monitoreo del progreso general a través de un dashboard de inteligencia.
- **Dirigente (Usuario Operativo):** Es el usuario en campo. Su función principal es el registro rápido de votantes movilizados y la gestión operativa de los vehículos que tiene asignados. La interfaz para este rol debe ser simplificada, intuitiva y `mobile-first` para una operación ágil en el día de las elecciones.

### 3.3. Funcionalidades Clave Fuera de Alcance (MVP)

- **Soporte Multi-idioma:** El sistema se desarrollará solo en español.
- **Personalización White-label:** No se permitirá la personalización de la marca por Tenant/campaña en la versión inicial.

## 4. Métricas Clave de Éxito del Proyecto (KPIs)

El éxito del sistema se medirá por su capacidad para:

- **Aumentar la Eficiencia Operativa:** Reducir el tiempo necesario para registrar a un votante y asignar un vehículo.
- **Proporcionar Inteligencia Accionable:** La capacidad de los Administradores para tomar decisiones estratégicas basadas en los datos en tiempo real del dashboard.
- **Garantizar la Fiabilidad:** Mantener un 100% de disponibilidad y respuesta ágil del sistema durante las horas críticas del día electoral.
- **Maximizar la Participación:** El objetivo final es utilizar la plataforma para aumentar la cantidad de votantes movilizados de manera efectiva.
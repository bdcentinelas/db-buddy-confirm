# 03_ARCHITECTURE_AND_TECH_STACK.md

# 03_ARCHITECTURE_AND_TECH_STACK.md: Arquitectura y Stack Tecnológico

## 1. Filosofía de la Arquitectura

La arquitectura del sistema está diseñada sobre cuatro pilares fundamentales para garantizar el éxito de la operación el día de las elecciones:

1. **SaaS Multi-Tenant:** El sistema se construirá como una aplicación de Software como Servicio (SaaS). Cada campaña electoral operará en un "tenant" o instancia independiente, garantizando un aislamiento completo de los datos y la gestión autónoma.
2. **Mobile-First:** La experiencia del usuario `DIRIGENTE` es crítica. Por lo tanto, toda la interfaz de usuario se diseñará y desarrollará con un enfoque `mobile-first`, asegurando una operación ágil y sin fricciones en smartphones.
3. **En Tiempo Real (Real-time):** La toma de decisiones del `ADMINISTRADOR` depende de información actualizada al segundo. El sistema utilizará capacidades de tiempo real para sincronizar los datos desde el campo hasta el dashboard de inteligencia de forma instantánea.
4. **Segura y Aislada:** La seguridad y la privacidad de los datos de cada campaña son primordiales. La arquitectura de la base de datos implementará políticas estrictas para asegurar que ninguna información se cruce entre tenants.

---

## 2. Stack Tecnológico Principal

| Componente | Tecnología / Servicio | Justificación y Notas Clave |
| --- | --- | --- |
| **Frontend** | React (con Vite) + TypeScript | Para una interfaz de usuario moderna, reactiva y escalable, con la seguridad de tipos que ofrece TypeScript. |
| **Estilos (Styling)** | Tailwind CSS | Ideal para un desarrollo rápido y consistente, facilitando la implementación del diseño `mobile-first`. |
| **Backend (BaaS)** | **Supabase** | Solución integral que provee: Base de Datos (PostgreSQL), Autenticación, Almacenamiento, Edge Functions y Realtime. |
| **Inteligencia Artificial** | **DeepSeek AI** | Proveedor de IA explícitamente requerido para potenciar el "Asistente de IA Electoral". |

---

## 3. Arquitectura de Componentes Clave

### 3.1. Frontend (Aplicación React)

- **Responsabilidades:** Renderizar la interfaz de usuario para los tres roles, gestionar el estado de la aplicación y la interacción del usuario.
- **Comunicación:** Se comunicará directamente con la API de Supabase para todas las operaciones de datos (CRUD) y escuchará los cambios en tiempo real a través de los canales de Supabase Realtime.

### 3.2. Backend (Supabase)

- **Base de Datos (PostgreSQL):** Almacenará toda la información operativa: tenants, usuarios, dirigentes, vehículos, votantes, etc.
- **Autenticación:** Gestionará el registro, inicio de sesión y los roles (`DIRIGENTE`, `ADMINISTRADOR`, `SUPERADMINISTRADOR`).
- **Row Level Security (RLS):** Será el mecanismo principal para implementar la arquitectura **multi-tenant**, asegurando que un `ADMINISTRADOR` solo pueda acceder a los datos de su propia campaña.
- **Edge Functions:** Se utilizarán para la lógica de backend segura que no debe exponerse en el cliente. Su uso principal será actuar como un intermediario seguro para las llamadas a la API de DeepSeek AI, almacenando y utilizando las **API Keys de forma segura**.
- **Realtime:** Proveerá la funcionalidad de **sincronización de datos en vivo** para actualizar el dashboard del `ADMINISTRADOR` instantáneamente a medida que los `DIRIGENTES` registran nueva información.

### 3.3. Integración de IA (Asistente Electoral)

El flujo de comunicación con el asistente de IA será el siguiente para garantizar la seguridad de las credenciales:

1. El `ADMINISTRADOR` realiza una consulta en lenguaje natural en la interfaz de chat.
2. El frontend de React realiza una llamada a una **Supabase Edge Function** específica, enviando la consulta del usuario.
3. La Edge Function, que tiene acceso seguro a la API Key de DeepSeek, utiliza el paquete **`@al-sdk/deepseek`** para procesar la consulta.
4. La función puede consultar la base de datos de Supabase para obtener contexto relevante (ej. datos de movilización) antes de enviar la solicitud final a DeepSeek.
5. La respuesta de DeepSeek es devuelta al frontend y mostrada al usuario.

Este patrón asegura que la **API Key de DeepSeek nunca se exponga en el navegador del cliente**.

- **Restricciones:** **No tiene acceso a los datos operativos sensibles** de cada campaña (votantes, dirigentes, etc.), garantizando la privacidad y el aislamiento de datos.
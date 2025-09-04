# 01_QUALITY_METRICS.md

# Framework de Métricas y Evaluación de Calidad

## 1. Propósito

Este documento define los indicadores clave de rendimiento (KPIs), métricas de calidad de código y criterios de aceptación que se utilizarán para evaluar el "Sistema de Gestión de Movilización Electoral". Su objetivo es asegurar que el producto final sea robusto, usable, fiable y cumpla con los objetivos estratégicos del proyecto.

## 2. Métricas de Alto Nivel (KPIs de Negocio)

Estos KPIs miden el impacto directo del sistema en los objetivos de la campaña.

| Métrica | Objetivo | Cómo se Medirá | Herramienta/Método |
| --- | --- | --- | --- |
| **Tasa de Adopción de Dirigentes** | > 95% de los dirigentes activos utilizan la app el día de la elección. | (Nº de dirigentes con > 1000 registros / Nº total de dirigentes) * 100 | Dashboard de Administrador |
| **Tiempo de Registro por Votante** | < 45 segundos de media. | Medición del tiempo entre la apertura del formulario y el registro exitoso. | Logs de la aplicación |
| **Reducción de Tasa de Ausentismo** | Reducir en un 15% comparado con campañas anteriores sin el sistema. | (Nº de votantes movilizados / Nº de votantes esperados) vs. datos históricos. | Dashboard de Inteligencia |
| **Disponibilidad del Sistema** | 99.9% de uptime durante las 24 horas críticas del día electoral. | Monitoreo de disponibilidad del servicio. | Supabase Status / Herramienta de monitoreo externa |

## 3. Métricas de Calidad del Producto

Estas métricas evalúan la calidad intrínseca de la plataforma desde la perspectiva del usuario y técnica.

### 3.1. Usabilidad (Enfoque en el `DIRIGENTE`)

| Métrica | Criterio de Aceptación | Cómo se Medirá |
| --- | --- | --- |
| **Tasa de Éxito de Tareas Clave** | 98% de éxito en la primera tentativa para registrar un votante. | Pruebas de usabilidad monitoreadas. |
| **Puntuación de Usabilidad del Sistema (SUS)** | > 85/100. | Encuesta SUS post-uso a un grupo de dirigentes. |
| **Tasa de Errores de Usuario** | < 2% de errores en el llenado de formularios. | Logs de errores de validación del lado del cliente. |
| **Curva de Aprendizaje** | Un dirigente debe ser capaz de operar la app con < 5 minutos de formación. | Observación directa y feedback cualitativo. |

### 3.2. Rendimiento y Fiabilidad

| Métrica | Criterio de Aceptación | Cómo se Medirá |
| --- | --- | --- |
| **Tiempo de Carga de la App (Inicial)** | < 2 segundos en una conexión 4G. | Lighthouse / WebPageTest. |
| **Latencia de la API** | < 250ms para el 95% de las peticiones (P95). | Logs de Supabase Edge Functions. |
| **Sincronización en Tiempo Real** | < 1 segundo de retraso para la actualización de datos en el dashboard. | Pruebas automatizadas y manuales de latencia de Supabase Realtime. |
| **Consistencia de Datos** | 100% de consistencia entre los datos registrados en campo y la base de datos. | Scripts de validación de datos. |

### 3.3. Calidad de la IA (Asistente Electoral)

| Métrica | Criterio de Aceptación | Cómo se Medirá |
| --- | --- | --- |
| **Precisión de la Respuesta** | 95% de las respuestas son factualmente correctas según los datos del sistema. | Evaluación humana de un set de 100 consultas de prueba. |
| **Relevancia de la Respuesta** | 90% de las respuestas abordan directamente la pregunta del usuario. | Evaluación humana. |
| **Tiempo de Respuesta de la IA** | < 3 segundos de media para generar una respuesta. | Medición del tiempo de la API de DeepSeek. |

## 4. Métricas de Calidad del Código

Estas métricas aseguran la mantenibilidad, escalabilidad y robustez del código fuente.

| Métrica | Criterio de Aceptación | Herramienta |
| --- | --- | --- |
| **Cobertura de Pruebas (TDD)** | > 85% de cobertura para la lógica de negocio crítica. | Jest / Vitest coverage reports. |
| **Adherencia al Linter** | 0 errores de ESLint/Prettier en cada commit. | Husky pre-commit hooks. |
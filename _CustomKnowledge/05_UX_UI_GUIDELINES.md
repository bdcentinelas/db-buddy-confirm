# 05_UX_UI_GUIDELINES.md

# 05_UX_UI_GUIDELINES.md: Guía de Diseño de Experiencia e Interfaz de Usuario

## 1. Principios Fundamentales de UX

Estos son los principios que deben guiar cada decisión de diseño para garantizar una plataforma efectiva y fácil de usar.

1. **Simplicidad Operativa:** La interfaz debe ser extremadamente fácil de aprender y usar, minimizando la carga cognitiva. Cada pantalla debe tener un propósito claro y una acción principal evidente. Este principio es especialmente crítico para el rol del `DIRIGENTE`, que trabajará bajo presión y con conocimientos tecnológicos básicos.
2. **Velocidad y Eficiencia:** El sistema debe ser y sentirse rápido. Los flujos de trabajo deben estar optimizados para completarse con el mínimo número de clics/taps y en el menor tiempo posible. Esto es crucial para la operación ágil requerida el día de la elección.
3. **Claridad y Feedback Visual:** El usuario siempre debe saber qué está pasando. Se deben usar etiquetas claras, mensajes de estado (carga, éxito, error) y confirmaciones visuales para cada acción importante.
4. **Consistencia:** Los componentes, la terminología y los patrones de diseño deben ser consistentes en toda la aplicación. Un botón de "Guardar" debe verse y comportarse igual en todas partes. Esto acelera la curva de aprendizaje y hace que el sistema sea predecible.

---

## 2. Guía de Estilo Visual (UI Kit)

### 2.1. Paleta de Colores

Se utilizará una paleta de colores profesional y accesible que inspire confianza y claridad.

- **Primario (Acciones Principales):** `#2563EB` (Azul Fuerte) - Para botones principales, enlaces y elementos activos.
- **Secundario (Fondos y Contenedores):** `#F1F5F9` (Gris Claro) para modo claro, y `#1E293B` (Gris Oscuro) para modo oscuro.
- **Texto:** `#0F172A` (Casi Negro) para modo claro, y `#F8FAFC` (Casi Blanco) para modo oscuro.
- **Colores Semánticos (Feedback):**
    - **Éxito:** `#16A34A` (Verde)
    - **Advertencia:** `#FBBF24` (Ámbar)
    - **Error:** `#DC2626` (Rojo)
    - **Información:** `#3B82F6` (Azul Suave)

### 2.2. Tipografía

- **Familia de Fuente:** **Inter** (de Google Fonts). Es una fuente sans-serif altamente legible y versátil, ideal para interfaces de usuario.
- **Escala Tipográfica:** Se establecerá una escala clara para la jerarquía visual (ej. `H1: 36px`, `H2: 24px`, `Body: 16px`, `Caption: 12px`).

### 2.3. Iconografía

- **Librería:** **Lucide React**. Ofrece un conjunto de iconos limpios, consistentes y ligeros que se integran perfectamente con React.
- **Estilo:** Utilizar el estilo de línea (outline) por defecto para mantener la simplicidad visual.

### 2.4. Espaciado y Rejilla (Grid)

- Se implementará un **sistema de espaciado basado en una rejilla de 8px**. Todos los márgenes, paddings y tamaños de componentes serán múltiplos de 8 (8px, 16px, 24px, 32px, etc.) para asegurar consistencia y armonía visual.

### 2.5. Bordes y Sombras

- **Bordes Redondeados (Border Radius):** Se usarán bordes sutilmente redondeados (ej. `6px` o `8px`) para dar un aspecto moderno y amigable.
- **Sombras (Shadows):** Se aplicarán sombras suaves y discretas para elevar elementos interactivos como botones y modales, creando una sensación de profundidad.

---

## 3. Pautas Específicas por Rol

### 3.1. Para el DIRIGENTE (Interfaz `Mobile-First`)

- **Layout:** Estrictamente de una sola columna, optimizado para el desplazamiento vertical.
- **Componentes:** Botones grandes y fáciles de presionar (`touch-friendly`), con áreas de toque mínimas de `44x44px`. Campos de formulario de altura generosa.
- **Navegación:** Una barra de navegación inferior (Bottom Tab Bar) con 2 o 3 iconos para las acciones más críticas: "Registrar Votante" y "Mis Vehículos".
- **Formularios:** Diseñados para una entrada de datos ultra-rápida, utilizando teclados numéricos para campos como DNI y teléfono.

### 3.2. Para el ADMINISTRADOR (Dashboard de Escritorio/Tablet)

- **Layout:** Interfaz densa en datos, con un layout de múltiples columnas. Una barra lateral de navegación fija a la izquierda y un área de contenido principal a la derecha.
- **Componentes:**
    - **Tablas de Datos:** Con funcionalidades de ordenación, filtrado y búsqueda.
    - **Visualizaciones:** Gráficos (barras, líneas) y KPIs para el Dashboard de Inteligencia Electoral.
    - **Mapas:** Visualización de la concentración de votantes y cobertura por zona (si aplica).
    - **Chat de IA:** Una interfaz de chat integrada y accesible.
- **Navegación:** Menú lateral persistente para acceder a las secciones: Dashboard, Dirigentes, Flota, Reportes, etc.

---

## 4. Estados de la Interfaz

Es crucial comunicar el estado actual del sistema al usuario en todo momento.

- **Carga (Loading):** Utilizar animaciones de esqueleto (skeleton screens) en lugar de spinners genéricos para mejorar la percepción del rendimiento mientras se cargan los datos.
- **Vacío (Empty):** Cuando una lista o tabla no tiene datos, mostrar un mensaje amigable con un ícono y, si es posible, un botón de llamada a la acción (ej. "Aún no has registrado dirigentes. ¡Crea el primero!").
- **Error:** Mostrar mensajes de error claros, concisos y en lenguaje humano, explicando qué salió mal y cómo solucionarlo, en lugar de códigos de error técnicos.

---
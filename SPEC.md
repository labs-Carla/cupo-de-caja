# SPEC — Cupo de Caja (prototipo)

> **Prototipo para Makers Fellowship.** No es un producto financiero. No presta dinero, no evalúa ni aprueba crédito, no procesa pagos y no tiene backend. Todos los datos son ficticios.

## 1. Problema

Los pequeños comerciantes (tiendas de barrio, papelerías, puestos de comida) suelen llevar sus cuentas en un cuaderno o de memoria. Cuando necesitan capital de trabajo, les cuesta saber **cuánto pueden pagar de cuota sin ahogar la caja** y **cuánto les cuesta realmente** una financiación.

## 2. Propuesta

Cupo de Caja es una experiencia web, pensada primero para móvil, que:

1. Permite registrar **ventas y gastos** del negocio.
2. Construye un **perfil de caja** (ingresos, egresos y flujo neto mensual).
3. Permite **simular un escenario hipotético de financiación** (monto, plazo, tasa) y ver la cuota, el costo total y el plan de pagos.
4. Muestra un **resumen** que compara la cuota simulada con el flujo de caja del negocio, con lenguaje claro.

## 3. Usuario

Comerciante en Colombia, uso principal desde el celular, conocimiento financiero básico. Moneda: **COP**.

## 4. Pantallas

| Pantalla | Contenido |
|---|---|
| **Inicio** | Saludo, aviso de prototipo, métricas del mes (ventas, gastos, flujo neto), accesos rápidos a las demás pantallas. |
| **Perfil de caja** | Nombre y tipo de negocio, ventas y gastos promedio mensuales (se pueden ajustar manualmente), margen de seguridad. Muestra flujo neto y la **cuota de referencia** (porción del flujo que el comerciante está dispuesto a destinar). |
| **Simulador** | Inputs: monto, plazo en meses, tasa efectiva anual (E.A.). Salidas en vivo: tasa mensual equivalente, cuota fija, total pagado, intereses, relación cuota/flujo neto. Tabla de amortización. |
| **Resumen** | Lectura en lenguaje claro del escenario: ¿la cuota cabe en la caja?, semáforo (holgado / ajustado / exigente), desglose capital vs. intereses, recordatorio de limitaciones. |
| **Actividad** | Formulario para registrar venta o gasto (tipo, descripción, monto, fecha, categoría). Lista de movimientos con filtro y opción de eliminar. Los movimientos alimentan las métricas del mes. |

## 5. Cálculos

- **Tasa mensual** a partir de E.A.: `im = (1 + EA)^(1/12) − 1`.
- **Cuota fija (sistema francés)**: `C = P · im / (1 − (1 + im)^−n)`; si `im = 0`, `C = P / n`.
- **Total pagado** = `C · n`; **intereses** = total − P.
- **Amortización**: por mes, interés = saldo · im; abono a capital = C − interés; saldo nuevo = saldo − abono (el último mes se ajusta a 0).
- **Flujo neto mensual** = ventas promedio − gastos promedio.
- **Cuota de referencia** = flujo neto × (1 − margen de seguridad %), mínimo 0.
- **Relación cuota/flujo** = C / flujo neto.
  - ≤ 30 %: *Holgado* · 30–50 %: *Ajustado* · > 50 % o flujo ≤ 0: *Exigente*.
- Métricas del mes en Inicio: suma de ventas y gastos registrados en Actividad para el mes calendario más reciente con movimientos.

Todos los cálculos viven en funciones puras (`src/lib/finance.ts`) con pruebas unitarias.

## 6. Validación de inputs

- Montos: números enteros ≥ 0, con límites razonables (monto simulado 100.000 – 200.000.000 COP).
- Plazo: 1 – 60 meses, entero.
- Tasa E.A.: 0 – 60 %.
- Margen de seguridad: 0 – 90 %.
- Movimientos: descripción obligatoria (máx. 60 caracteres), monto > 0, fecha válida no futura.
- Los errores se muestran junto al campo, en español; los cálculos solo usan valores válidos.

## 7. Diseño

- Estética cálida y profesional: **verde oscuro** (`#0F6B4F`, ver 10.3) como color principal, **fondo marfil** (`#FAF6EC`), acentos terracota/ámbar para advertencias.
- Tipografía del sistema, números tabulares para cifras.
- Mobile-first: navegación inferior en móvil, barra superior en escritorio. Objetivos táctiles ≥ 44 px.
- Formato de moneda con `Intl.NumberFormat('es-CO', { currency: 'COP' })`.

## 8. Arquitectura

- React + TypeScript + Vite. Sin router externo (navegación por estado).
- Estado en un contexto (`AppStateProvider`) persistido en `localStorage`, con datos ficticios iniciales y opción de restablecer.
- Componentes reutilizables: `Card`, `Stat`, `MoneyInput`, `NumberField`, `Button`, `Badge`, `PrototypeBanner`, `NavBar`.
- Pruebas con Vitest para la lógica financiera y de validación.

## 9. Fuera de alcance

Crédito real, estudio de riesgo, aprobación, desembolso, pagos, autenticación, backend, integración con bancos o centrales de riesgo. La app no afirma que Cupo de Caja preste dinero; la simulación es ilustrativa.

## 10. Ampliación según el mockup de referencia (v2)

Revisión contra el mockup «Spec-Driven Development — Cupo de Caja». Se **conserva** todo lo anterior (vista web del comerciante con las 5 pantallas) y se agregan dos vistas, accesibles desde un selector de vista en la cabecera:

**Vistas de la app**

1. **Comerciante (web)** — Inicio, Perfil de caja, Simulador, Resumen, Actividad (secciones 4–6).
2. **WhatsApp (simulado)** — interfaz de chat tipo WhatsApp dentro de un marco de teléfono. Es solo UI; **no hay integración con WhatsApp**.
3. **Panel del aliado** — vista interna del equipo / aliado financiero ficticio.

### 10.1 Flujo de WhatsApp (6 pasos)

| Paso | Contenido | Interacción |
|---|---|---|
| 1. Bienvenida | Cupo de Caja se presenta como plataforma que **ayuda a acceder** a financiación de un aliado (no presta). | Botones rápidos «Sí, empezar» / «Quiero saber más». |
| 2. Solicitud | ¿Cuánto necesitas? ($500.000, $1.000.000, $2.000.000, Otro monto) y ¿para qué? (Comprar inventario, Cubrir gastos, Mejorar el local, Otro). | Selección única; «Otro monto» abre un campo validado (100.000 – 5.000.000). |
| 3. Información del negocio | Tipo de negocio (Tienda, Restaurante, Puesto de mercado, Otro) y ventas diarias (4 rangos). Opción de escribir las ventas manualmente. | Selección única + campo opcional. |
| 4. Oferta simulada | Monto, total a pagar, plazo (8 semanas), cuota semanal, fecha de primera cuota. | «Ver calendario de pagos» (lista de cuotas) y «Quiero continuar». |
| 5. Confirmación | «Tu solicitud fue enviada al aliado financiero (simulado)». Tarjeta «Solicitud en revisión». | La solicitud aparece en el panel del aliado con estado *En revisión*. |
| 6. Seguimiento | Monto, barra de progreso pagado/faltante, próxima cuota y fecha. | «Ver calendario completo», «Registrar venta de hoy» (crea un movimiento en Actividad), «Marcar cuota como pagada (demo)». |

- El chat puede reiniciarse. El estado del seguimiento depende de la decisión simulada en el panel (en revisión / aprobada / rechazada).
- **Cálculo de la oferta**: mismo motor de cuota fija, con periodos semanales: `i_sem = (1 + EA)^(1/52) − 1`, plazo 8 semanas, tasa E.A. ilustrativa configurable (por defecto 26 %). El monto ofrecido es el menor entre lo solicitado y un tope ilustrativo basado en las ventas diarias declaradas (cuota semanal ≤ 25 % de las ventas semanales estimadas).
- **Diferencia con el mockup**: las cifras de ejemplo del mockup ($1.000.000 → $1.120.000 en 8 semanas, cuota $140.000) implican ≈ 290 % E.A., superior a la tasa de usura vigente en Colombia. El prototipo **no copia esas cifras**; las calcula con una tasa configurable y lo documenta.

### 10.2 Panel web del aliado financiero

- Navegación lateral (Solicitudes, Comerciantes, Créditos, Reportes); solo *Solicitudes* está implementada, las demás muestran un aviso «fuera del alcance del prototipo».
- **Lista de solicitudes**: 12 solicitudes ficticias (nombre, negocio, monto, estado), pestañas Todas / En revisión / Aprobadas / Rechazadas con contadores. Tabla en escritorio; tarjetas en móvil. Botón «Nueva solicitud» abre el flujo de WhatsApp.
- **Detalle de solicitud**: nombre y estado; pestañas Resumen / Información del negocio / Ventas / Documentos. Resumen: monto solicitado, tipo de negocio, plazo propuesto, ventas y gastos diarios estimados, cuota sugerida, uso del crédito.
- Botones **Aprobar / Rechazar**: cambian el estado **solo en el navegador** y se rotulan como «decisión simulada». No hay evaluación de riesgo ni desembolso.

### 10.3 Estilo (actualizado)

- Verde oscuro `#0F6B4F` (principal), verde claro `#D1FAE5`, acento amarillo `#FACC15`, fondo **marfil** `#FAF6EC`, blanco y grises. Tipografía Inter (con respaldo del sistema).
- Estados: En revisión (amarillo), Aprobada (verde), Rechazada (rojo suave).

### 10.4 Datos de ejemplo

María López · Restaurante · $1.000.000 · ventas diarias $350.000 · gastos diarios $220.000 · uso: comprar inventario; más 11 solicitudes con nombres y montos variados.

## 11. Criterios de aceptación

- `npm run build` sin errores de TypeScript.
- `npm test` pasa.
- Cambiar cualquier input del simulador o del perfil actualiza cuota, costos, tabla y resumen al instante.
- Registrar o eliminar un movimiento actualiza las métricas de Inicio.
- El aviso de prototipo es visible en todas las pantallas.
- El flujo de WhatsApp se puede completar de principio a fin, y la solicitud confirmada aparece en el panel del aliado.
- Aprobar o rechazar en el panel cambia el estado mostrado en el seguimiento del chat.
- Todo texto que mencione crédito, oferta o aprobación aclara que es simulado.

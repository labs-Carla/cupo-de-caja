# Cupo de Caja · Prototipo

Prototipo funcional para **Makers Fellowship**. Cupo de Caja es una experiencia pensada para pequeños comerciantes en Colombia: registrar ventas y gastos, entender el flujo de caja del negocio, simular un escenario de financiación y comprender su costo y sus pagos.

> ⚠️ **Es un prototipo con datos ficticios.** Cupo de Caja **no presta dinero**, no evalúa ni aprueba créditos, no procesa pagos y no tiene backend. Las ofertas y decisiones que aparecen son simulaciones ilustrativas.

La especificación completa está en [`SPEC.md`](./SPEC.md).

## Qué incluye

La app tiene tres vistas, que se eligen en la cabecera:

**1. Comerciante (web)**
- **Inicio**: métricas del mes (ventas, gastos, flujo), perfil de caja y escenario simulado.
- **Perfil de caja**: ventas y gastos promedio, margen de seguridad, flujo neto y *cuota de referencia*.
- **Simulador**: monto, plazo (meses) y tasa E.A. Muestra la cuota fija, el total pagado, los intereses, la relación cuota/flujo y la tabla de amortización. Todo se recalcula al cambiar un valor.
- **Resumen**: lectura en lenguaje claro (Holgado / Ajustado / Exigente) y el desglose entre capital e intereses.
- **Actividad**: registro validado de ventas y gastos, con filtro y opción de eliminar.

**2. WhatsApp (simulado)**: chat de 6 pasos dentro de un marco de teléfono (Bienvenida → Solicitud → Información del negocio → Oferta simulada → Confirmación → Seguimiento). Es solo interfaz, no hay integración con WhatsApp.

**3. Panel del aliado**: lista de solicitudes con filtros por estado y detalle con pestañas. Los botones Aprobar/Rechazar cambian el estado **solo en el navegador**.

Las vistas están conectadas. Una solicitud confirmada en el chat aparece en el panel. Si se aprueba allí, el chat muestra el seguimiento, y «Registrar venta de hoy» agrega el movimiento a Actividad.

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior (se probó con Node 24.19 y npm 11.17).

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
```

Otros comandos:

```bash
npm test           # pruebas unitarias (Vitest)
npm run lint       # oxlint
npm run build      # verificación de tipos + build de producción en dist/
npm run preview    # sirve el build en http://localhost:4173
```

El botón **Restablecer demo** de la cabecera vuelve a cargar los datos ficticios.

## Cálculos

- Tasa mensual equivalente: `(1 + EA)^(1/12) − 1`. Tasa semanal (chat): `(1 + EA)^(1/52) − 1`.
- Cuota fija (sistema francés): `P·i / (1 − (1+i)^−n)`.
- Flujo neto = ventas − gastos. Cuota de referencia = flujo neto × (1 − margen).
- Oferta del chat: 8 cuotas semanales con una tasa ilustrativa de 26 % E.A. El monto baja si la cuota supera el 25 % de las ventas semanales declaradas (6 días).

La lógica está en `src/lib/` como funciones puras, con pruebas en `*.test.ts`.

**Diferencia con el mockup:** el mockup de referencia usa $1.000.000 → $1.120.000 en 8 semanas (cuota de $140.000). Eso equivale a unos 290 % E.A., muy por encima de la tasa de usura en Colombia. Por eso el prototipo no copia esas cifras y las calcula con una tasa configurable (`OFFER_ASSUMPTIONS` en `src/lib/offer.ts`).

## Estructura

```
src/
  lib/          tipos, cálculos financieros, oferta, validación, formato, datos ficticios (+ tests)
  state/        contexto global persistido en localStorage y valores derivados
  components/   UI reutilizable: Card, Stat, Button, Badge, campos validados, navegación
  screens/      Inicio, Perfil, Simulador, Resumen, Actividad, WhatsApp, PanelAliado
```

## Limitaciones

- Sin backend ni autenticación. Los datos viven en el `localStorage` del navegador y son ficticios.
- No hay crédito real, estudio de riesgo, desembolso ni pagos. «Aprobar», «Rechazar» y «Marcar cuota como pagada» son acciones de demostración.
- No hay integración con WhatsApp. El chat solo acepta respuestas rápidas (no texto libre).
- La simulación no incluye seguros, comisiones, IVA ni otros cargos reales. Las tasas son ilustrativas.
- Las secciones Comerciantes, Créditos y Reportes del panel, y la pestaña Documentos, son marcadores de posición.
- La fuente Inter se carga desde Google Fonts. Sin conexión se usa la fuente del sistema.
- Las pruebas automatizadas cubren la lógica (`src/lib`). No hay pruebas de componentes en el repositorio.

# 🐟 Mojarrita: gestor de tareas

Una app web simple para organizar el trabajo del día a día:

- **Tareas rápidas**: se empiezan y se terminan, sin subtareas.
- **Proyectos**: tienen subtareas que se van tildando y a las que se les pueden sumar más.
- **El balde**: cuando terminás algo, agarrás la tarjeta y la arrastrás al balde gris. En el camino se convierte en una
  mojarrita que se zambulle en el balde.
- **La bitácora**: todo lo que cae al balde queda registrado por día, con cuánto tardaste y un comentario. Se puede
  exportar a Excel.
- **Mails de Outlook**: cada tarea puede tener vinculados uno o más mails (el hilo con el pedido y los parámetros).

Todo queda guardado **en tu navegador** (no hay servidor ni cuentas): tus tareas no salen de tu compu.

## Cómo se usa

| Quiero…                        | Hago…                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Anotar una tarea rápida        | Escribo en “¿Qué hay que hacer?” y Enter.                                                               |
| Crear un proyecto              | Escribo en “Nuevo proyecto…” y Enter. El cursor salta solo a “Agregar subtarea…”.                       |
| Agregar subtareas              | Escribo en “Agregar subtarea…” y Enter (se pueden cargar varias seguidas).                              |
| Tildar / renombrar / borrar    | Clic en el círculo / clic en el texto / la ✕ que aparece al pasar el mouse.                             |
| Medir el tiempo                | ▶ en la tarjeta. Arrancar una tarea pausa la que estaba corriendo.                                      |
| Terminar                       | Arrastro la tarjeta al balde, o toco el ✓ blanco y la mojarrita salta sola. En el celular: mantener apretada la tarjeta y arrastrar. |
| Cargar cuánto tardé            | Aparece solo arriba del balde al terminar (si usé ▶ ya viene completo). También se edita en la bitácora. |
| Me equivoqué                   | “Devolver al agua” (en el aviso del balde o en la bitácora) y la tarea vuelve a la lista.               |
| Ver notas, color, mails        | Clic en la tarjeta abre el detalle. Todo se guarda solo.                                                |
| Ver lo terminado               | Clic en el balde o en “Bitácora”.                                                                       |

El tiempo se puede escribir como `45`, `45 min`, `1h`, `1h 30`, `1:30`, `1,5 hs`, etc.

## Vincular mails de Outlook

Outlook no tiene un botón de “copiar link de este mail” (ni en el Outlook nuevo ni en el clásico), así que Mojarrita
guarda dos cosas por cada mail: el **link** de Outlook en la web (para abrirlo con un clic) y el **asunto** (para
encontrarlo con la búsqueda de Outlook si el link deja de andar, por ejemplo si movés el mail de carpeta).

1. **Outlook en el navegador (recomendado).** Abrí `outlook.office.com` (o `outlook.cloud.microsoft`), hacé clic en el
   mail y copiá la dirección de la barra (`Ctrl+L`, `Ctrl+C`). Después, en Mojarrita, pegá con `Ctrl+V` en cualquier
   parte: te pregunta si crear una tarea nueva con ese mail o sumarlo a una existente.
2. **Botón “🐟 Mail → Mojarrita”.** En la app, botón **Outlook** → arrastrá el botón a la barra de favoritos. Con un
   mail abierto en Outlook web, un clic y se abre Mojarrita con el mail listo para vincular. Si antes seleccionás el
   asunto, lo usa como nombre.
3. **Outlook de escritorio.** Abrí el mismo mail en Outlook web y seguí el paso 1, o guardá solo el asunto (escribilo
   en lugar del link) y usá el botón de copiar para buscarlo en Outlook.

Los links funcionan con tu cuenta: si se los pasás a otra persona, no va a ver tu mail.

## Tus datos

- Se guardan en el `localStorage` del navegador (por dominio). Si usás la app en dos pestañas, se sincronizan.
- Menú **⋯ → Descargar copia de seguridad** baja un `.json` con todo. **Restaurar una copia…** lo vuelve a cargar.
  Conviene hacer una copia de vez en cuando (o antes de cambiar de compu o de navegador).
- Desde la bitácora: **Exportar a Excel (CSV)**.

## Instalarla como app

Es una PWA: en Chrome/Edge, con la app abierta, ícono de instalar en la barra de direcciones (o menú → “Instalar
Mojarrita”). Queda con su propia ventana e ícono, y funciona sin conexión.

## Desarrollo

Requiere Node 22.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests de la lógica (tiempos, mails, bitácora, backups)
npm run build      # genera dist/ (estático, se puede servir desde cualquier lado)
```

Tecnología: React 19 + TypeScript + Vite, [Motion](https://motion.dev) para las animaciones (el pez, el balde, las
salpicaduras) y Zustand para el estado.

Estructura:

```
src/
  components/   Tarjetas, balde, pez (SVG), capa de arrastre, bitácora, ayuda de Outlook…
  store/        tasks.ts (datos que se guardan), pond.ts (estado del arrastre), ui.ts (diálogos y avisos)
  lib/          tiempos, links de mail, backups/CSV, paleta de azules
```

## Publicarla (GitHub Pages)

El workflow `.github/workflows/deploy.yml` corre los tests, compila y publica en GitHub Pages en cada push a `main`
(también se puede lanzar a mano desde la pestaña **Actions**). Para activarlo, una sola vez: **Settings → Pages →
Source: GitHub Actions**. En repos privados, GitHub Pages necesita un plan pago de GitHub (Pro/Team/Enterprise); si no,
`dist/` se puede subir a cualquier hosting estático (Netlify, Cloudflare Pages, un servidor interno…).

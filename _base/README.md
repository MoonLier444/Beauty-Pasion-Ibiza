# Base Template — Web Premium de Alto Standing

Plantilla base para crear webs premium de negocios locales (centros de estética, spa,
hostelería boutique, cosmética, etc.)

## Archivos

| Archivo    | Descripción |
|------------|-------------|
| `base.html` | Estructura HTML semántica completa con placeholders [NOMBRE], [URL], etc. |
| `base.css`  | Sistema CSS completo con variables, animaciones, responsive |
| `base.js`   | Módulos JS: header, menú móvil, hero entrance, scroll reveal, carrusel, nav activo |

## Sistema de animaciones — cómo funciona

Cada elemento recibe un atributo `data-reveal="tipo"`. El JS detecta cuándo
su sección entra en viewport y lo anima automáticamente.

### Tipos de reveal

```html
data-reveal="from-left"    <!-- texto/elementos desde la izquierda -->
data-reveal="from-right"   <!-- texto/elementos desde la derecha -->
data-reveal="from-bottom"  <!-- texto emergiendo hacia arriba -->
data-reveal="scale-in"     <!-- tarjetas/badges con efecto escala -->
data-reveal="clip-right"   <!-- imagen: cortina de derecha a izquierda -->
data-reveal="clip-left"    <!-- imagen: cortina de izquierda a derecha -->
data-reveal="clip-up"      <!-- imagen: cortina de abajo a arriba -->
```

### Delay personalizado

```html
data-reveal-delay="300"    <!-- ms de retraso antes de animar -->
```

### Stagger automático (hijos en secuencia)

```html
<div data-reveal-stagger data-reveal-stagger-delay="400">
  <div class="stagger-child">Item 1 → anima a 400ms</div>
  <div class="stagger-child">Item 2 → anima a 510ms</div>
  <div class="stagger-child">Item 3 → anima a 620ms</div>
</div>
```
El intervalo entre hijos es 110ms (configurable en `STAGGER_STEP` en base.js).

### Hero (carga inicial, no scroll)

```html
data-hero-item data-hero-delay="0"    <!-- primer elemento -->
data-hero-item data-hero-delay="200"  <!-- segundo, con 200ms de retraso -->
```

## Paleta cromática por defecto

```css
--color-sand:        #F5EFE6;   /* Fondo principal */
--color-cream:       #FAF8F4;   /* Fondos secundarios */
--color-sage:        #A8B6A1;   /* Verde salvia */
--color-forest:      #556B57;   /* Verde bosque — CTA */
--color-earth:       #8C756A;   /* Marrón tierra — acentos */
```

Para cambiar la paleta: edita las variables CSS en la sección `:root` de base.css.

## Tipografía

- **Títulos**: Cormorant Garamond (serif editorial)
- **Cuerpo**: Inter (sans-serif moderna)

Cambiar en el `<link>` de Google Fonts del HTML y actualizar `--font-serif`/`--font-sans` en CSS.

## Patrón de sección — receta rápida

```html
<section class="[nombre-seccion]" id="[id]">
  <!-- 1. Eyebrow desde la izquierda -->
  <span class="eyebrow" data-reveal="from-left">CATEGORÍA</span>

  <!-- 2. Título desde abajo, con delay -->
  <h2 class="section-title" data-reveal="from-bottom" data-reveal-delay="120">
    Título<br /><em>en cursiva verde</em>
  </h2>

  <!-- 3. Imagen con cortina -->
  <div class="img-reveal-wrap" data-reveal="clip-right">
    <img src="..." />
  </div>

  <!-- 4. Párrafos escalonados -->
  <p data-reveal="from-bottom" data-reveal-delay="260">Texto 1</p>
  <p data-reveal="from-bottom" data-reveal-delay="380">Texto 2</p>

  <!-- 5. Lista con stagger automático -->
  <div data-reveal-stagger data-reveal-stagger-delay="500">
    <div class="stagger-child">Item A</div>
    <div class="stagger-child">Item B</div>
  </div>
</section>
```

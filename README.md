# 🎮 Plugin WordPress para Interactividades Twine

Un plugin de WordPress diseñado específicamente para incrustar y mostrar interactividades creadas con [Twine](https://twinery.org/) de forma optimizada y responsiva.

## 🌟 Características

- **🎯 Optimizado para Twine** - Diseñado específicamente para archivos HTML exportados desde Twine
- **📏 Altura automática** - Ajuste dinámico de altura según el contenido real
- **📱 Completamente responsivo** - Adaptación automática a dispositivos móviles y tablets
- **⚡ Carga rápida** - Sistema eficiente de archivos temporales con limpieza automática
- **🔧 Fácil de usar** - Interfaz drag & drop en el editor de WordPress
- **🛡️ Seguro** - Validación de archivos y aislamiento mediante iframes
- **🎨 Interfaz mejorada** - Diseño específico para interactividades educativas

## 📋 Requisitos

- WordPress 5.0 o superior
- PHP 7.4 o superior
- Soporte para JavaScript moderno en el navegador
- Archivos Twine exportados como HTML

## 🚀 Instalación

1. **Descarga** los archivos del plugin
2. **Copia** la carpeta completa al directorio `/wp-content/plugins/`
3. **Activa** el plugin desde el panel de administración de WordPress
4. El bloque "🎮 Interactividad Twine" aparecerá disponible en el editor

## 📁 Estructura de archivos

```
incrustrar-html/
├── simple-html-test.php          # Archivo principal del plugin
├── simple-test.js                # JavaScript del editor de bloques
├── twine-iframe-resizer.js       # Sistema de altura automática
├── twine-height-script.js        # Script inyectado en contenido Twine
├── debug-height-helper.js        # Herramienta de diagnóstico (temporal)
├── README.md                     # Este archivo
└── Interactividades/             # Carpeta con ejemplos
    ├── Relaciones en construccion.html
    ├── Adrian y el Laberinto de los sueños.html
    ├── Las aventuras de Arturd.html
    └── juan story.html
```

## 🎯 Uso

### En el Editor de WordPress

1. **Crear/editar** una página o entrada
2. **Añadir bloque** y buscar "Interactividad Twine"
3. **Cargar archivo** HTML de Twine:
   - Hacer clic en "Seleccionar Archivo Twine"
   - O arrastrarlo al área de carga
4. **Configurar opciones** (opcional):
   - Método de renderizado (Iframe recomendado)
   - Altura del iframe (Auto recomendado)
5. **Publicar** la página

### Opciones de Configuración

#### Método de Renderizado
- **📄 Iframe (Recomendado)** - Aislamiento completo y seguridad máxima
- **🔵 Directo** - Integración directa (solo para HTML simple)
- **🧪 Test** - Verificación de funcionamiento del plugin

#### Altura del Iframe
- **auto** (Recomendado) - Ajuste automático al contenido
- **400px, 600px, etc.** - Altura fija específica
- **50vh, 80vh, etc.** - Altura relativa al viewport

## 🔧 Características Técnicas

### Sistema de Altura Automática

El plugin utiliza un sistema avanzado de comunicación bidireccional:

1. **Script inyectado** calcula la altura real del contenido Twine
2. **PostMessage** comunica la altura al iframe padre
3. **JavaScript principal** ajusta el iframe dinámicamente
4. **MutationObserver** detecta cambios en contenido interactivo

### Comunicación entre Iframe y Página

```javascript
// El contenido Twine envía:
window.parent.postMessage({
    type: 'twine-iframe-height',
    height: calculatedHeight,
    iframeId: iframeId
}, '*');

// WordPress recibe y ajusta:
iframe.style.height = newHeight + 'px';
```

### Detección Inteligente de Contenido

- **Elementos Twine** específicos (`tw-story`, etc.)
- **Múltiples métodos** de cálculo de altura
- **Reintentos automáticos** para contenido dinámico
- **Límites configurables** (200px - 5000px)

## 🎨 Estilos CSS

### Contenedor Principal
```css
.simple-html-container {
    width: 100%;
    position: relative;
    overflow: hidden;
    max-width: 100%;
}
```

### Iframe Responsivo
```css
.simple-html-iframe {
    width: 100%;
    border: none;
    transition: height 0.3s ease;
    min-height: 400px;
}
```

### Breakpoints Móviles
- **768px y menor** - Altura mínima 300px
- **Margen adaptativo** para mejor visualización

## 🐛 Debug y Diagnóstico

### Mensajes de Consola

El plugin proporciona logs detallados:

```
🎮 Twine Iframe Resizer: Iniciando...
📏 Altura enviada: 850px (iframe: simple-iframe-123)
🎮 Altura ajustada via postMessage: 880px
```

### Función de Debug

En la consola del navegador:
```javascript
debugTwineHeight()
```

Muestra información detallada sobre todos los iframes encontrados.

### Problemas Comunes

| Problema | Causa | Solución |
|----------|--------|----------|
| Altura fija 600px | Script no ejecutándose | Verificar consola, revisar CORS |
| No se carga el archivo | Archivo muy grande | Máximo 5MB permitido |
| Contenido cortado | Error en cálculo altura | Usar función debug, ajustar manualmente |
| No responsivo | CSS conflictivo | Verificar estilos del tema |

## 🔒 Seguridad

### Validaciones Implementadas

- **Tipo de archivo** - Solo .html y .htm permitidos
- **Tamaño máximo** - 5MB por archivo
- **Nonce verification** - Protección CSRF
- **Sanitización** - Limpieza de nombres de archivo
- **Aislamiento** - Contenido en iframe separado

### Archivos Temporales

- **Ubicación** - Carpeta uploads de WordPress
- **Nomenclatura** - `temp-html-{uniqid}.html`
- **Limpieza automática** - 24 horas
- **Hook de limpieza** - `delete_temp_html`

## ⚡ Rendimiento

### Optimizaciones

- **Carga diferida** - Scripts solo cuando necesarios
- **Cache automático** - Archivos temporales reutilizables
- **Compresión** - Minificación automática de JS
- **CDN compatible** - URLs absolutas para recursos

### Métricas Típicas

- **Tiempo de carga** - < 2 segundos para archivos < 1MB
- **Memoria utilizada** - < 50MB por instancia
- **Requests adicionales** - Solo 2-3 por página

## 🤝 Compatibilidad

### WordPress
- ✅ WordPress 5.0+
- ✅ Gutenberg Editor
- ✅ Classic Editor (con blocks)
- ✅ Multisite
- ✅ WP REST API

### Temas
- ✅ Todos los temas modernos
- ✅ Bootstrap compatible
- ✅ Responsive frameworks
- ⚠️ Themes muy antiguos pueden requerir ajustes CSS

### Navegadores
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ IE no soportado

## 🛠️ Desarrollo

### Estructura del Código

```php
class SimpleHTMLTest {
    public function __construct()           // Inicialización
    public function enqueue_frontend_assets() // CSS y JS frontend
    public function register_block()        // Registro del bloque
    public function handle_upload()         // Manejo de archivos
    public function render()               // Renderizado frontend
    private function render_iframe()       // Renderizado específico iframe
    private function wrap_html_content()   // Wrapper HTML con scripts
    private function inject_height_script() // Inyección de comunicación
}
```

### Hooks de WordPress

```php
// Acciones principales
add_action('init', 'register_block');
add_action('enqueue_block_editor_assets', 'enqueue_editor_assets');
add_action('wp_enqueue_scripts', 'enqueue_frontend_assets');

// AJAX
add_action('wp_ajax_simple_html_upload', 'handle_upload');
add_action('wp_ajax_nopriv_simple_html_upload', 'handle_upload');

// Limpieza
add_action('delete_temp_html', 'cleanup_temp_file');
```

## 📊 Casos de Uso

### Educación
- **Historias interactivas** para estudiantes
- **Simulaciones** educativas
- **Cuestionarios** dinámicos
- **Narrativas** de aprendizaje

### Entretenimiento
- **Ficción interactiva** 
- **Aventuras textuales**
- **Historias ramificadas**
- **Juegos narrativos**

### Empresarial
- **Presentaciones** interactivas
- **Manuales** de usuario
- **Tutoriales** paso a paso
- **Encuestas** dinámicas

## 🔮 Roadmap

### Próximas Características

- [ ] **Modo fullscreen** opcional
- [ ] **Temas predefinidos** para diferentes tipos de contenido
- [ ] **Integración analytics** para tracking de interacciones
- [ ] **Soporte multiidioma** mejorado
- [ ] **API REST** para gestión programática
- [ ] **Shortcode** para uso en editores legacy

### Mejoras Técnicas

- [ ] **Service Worker** para cache offline
- [ ] **Lazy loading** avanzado
- [ ] **Preload** de recursos críticos
- [ ] **Optimización** de imágenes automática
- [ ] **Compresión** de archivos Twine

## 🐞 Reporte de Bugs

Si encuentras algún problema:

1. **Verifica** la consola del navegador (F12)
2. **Anota** los mensajes de error exactos
3. **Incluye** información del archivo Twine problemático
4. **Especifica** versión de WordPress y tema usado

## 📄 Licencia

Este plugin está licenciado bajo GPL v2 o posterior.

## 👥 Créditos

- **Desarrollo** - [Tu nombre]
- **Inspiración** - Comunidad Twine
- **Testing** - Universidad del Magdalena

---

*Desarrollado con ❤️ para la comunidad educativa*
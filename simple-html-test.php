<?php
/**
 * Plugin Name: Incrustar HTML
 * Description: Plugin para cargar e incrustar archivos HTML en WordPress
 * Version: 1.2
 */

if (!defined('ABSPATH')) exit;

class SimpleHTMLTest {
    
    public function __construct() {
        add_action('init', array($this, 'register_block'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_editor_assets'));
        add_action('wp_ajax_simple_html_upload', array($this, 'handle_upload'));
        add_action('wp_ajax_nopriv_simple_html_upload', array($this, 'handle_upload'));
        add_action('wp_head', array($this, 'add_ajax_url'));
        add_action('admin_head', array($this, 'add_ajax_url'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
    }
    
    public function enqueue_editor_assets() {
        wp_enqueue_script(
            'simple-html-test-editor',
            plugin_dir_url(__FILE__) . 'simple-test.js',
            array('wp-blocks', 'wp-element', 'wp-components', 'wp-editor', 'wp-block-editor'),
            time(),
            true
        );
        
        wp_localize_script('simple-html-test-editor', 'simpleHtmlTest', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('simple_test')
        ));
    }
    
    public function enqueue_frontend_assets() {
        // CSS para hacer los iframes responsive y adaptables
        wp_add_inline_style('wp-block-library', '
            .simple-html-container {
                width: 100%;
                position: relative;
                overflow: hidden;
                max-width: 100%;
            }
            .simple-html-iframe {
                width: 100%;
                border: none;
                display: block;
                min-height: 400px;
                max-width: 100%;
                transition: height 0.3s ease;
            }
            .simple-html-iframe.auto-height {
                height: auto !important;
                min-height: 200px;
            }
            .simple-html-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255,255,255,0.9);
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            @media (max-width: 768px) {
                .simple-html-container {
                    margin: 10px 0;
                }
                .simple-html-iframe {
                    min-height: 300px;
                }
            }
        ');
        
        // Script para ajustar altura automáticamente
        wp_add_inline_script('wp-block-library', '
            document.addEventListener("DOMContentLoaded", function() {
                function adjustIframeHeight() {
                    const iframes = document.querySelectorAll(".simple-html-iframe");
                    iframes.forEach(function(iframe) {
                        if (iframe.dataset.height === "auto") {
                            iframe.onload = function() {
                                try {
                                    let contentHeight = iframe.contentWindow.document.body.scrollHeight;
                                    if (contentHeight > 0) {
                                        iframe.style.height = Math.max(contentHeight + 50, 200) + "px";
                                        iframe.classList.add("auto-height");
                                    }
                                } catch (e) {
                                    // Error de CORS - mantener altura por defecto
                                    console.log("No se puede acceder al contenido del iframe (CORS)");
                                }
                            };
                        }
                    });
                }
                adjustIframeHeight();
                // Re-ejecutar cuando se carguen nuevos iframes (para el editor)
                const observer = new MutationObserver(adjustIframeHeight);
                observer.observe(document.body, { childList: true, subtree: true });
            });
        ');
    }
    
    public function add_ajax_url() {
        echo '<script>
            window.ajaxurl = "' . admin_url('admin-ajax.php') . '"; 
            window.testNonce = "' . wp_create_nonce('simple_test') . '";
        </script>';
    }
    
    public function register_block() {
        if (!function_exists('register_block_type')) {
            return;
        }
        
        register_block_type('simple-html/test', array(
            'render_callback' => array($this, 'render'),
            'attributes' => array(
                'content' => array(
                    'type' => 'string', 
                    'default' => ''
                ),
                'method' => array(
                    'type' => 'string', 
                    'default' => 'iframe'
                ),
                'height' => array(
                    'type' => 'string',
                    'default' => 'auto'
                ),
                'responsive' => array(
                    'type' => 'boolean',
                    'default' => true
                )
            )
        ));
    }
    
    public function handle_upload() {
        if (!wp_verify_nonce($_POST['nonce'], 'simple_test')) {
            wp_send_json_error('Error de seguridad');
        }
        
        if (!isset($_FILES['file'])) {
            wp_send_json_error('No se recibió ningún archivo');
        }
        
        $file = $_FILES['file'];
        
        // Validar tipo de archivo
        $allowed_types = array('text/html', 'text/plain');
        if (!in_array($file['type'], $allowed_types)) {
            wp_send_json_error('Solo se permiten archivos HTML');
        }
        
        // Validar tamaño (máximo 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            wp_send_json_error('El archivo es demasiado grande (máximo 5MB)');
        }
        
        $content = file_get_contents($file['tmp_name']);
        
        if ($content === false) {
            wp_send_json_error('Error al leer el archivo');
        }
        
        wp_send_json_success(array(
            'content' => $content,
            'size' => strlen($content),
            'filename' => sanitize_file_name($file['name'])
        ));
    }
    
    public function render($attributes) {
        $content = $attributes['content'];
        $method = isset($attributes['method']) ? $attributes['method'] : 'iframe';
        $height = isset($attributes['height']) ? $attributes['height'] : 'auto';
        $responsive = isset($attributes['responsive']) ? $attributes['responsive'] : true;
        
        if (empty($content)) {
            return '<div style="border:2px dashed #ccc;padding:40px;text-align:center;color:#666;">
                <p style="margin:0;font-size:16px;">📄 No hay contenido HTML cargado</p>
            </div>';
        }
        
        switch ($method) {
            case 'direct':
                return $this->render_direct($content);
            case 'iframe':
                return $this->render_iframe($content, $height, $responsive);
            case 'test':
                return $this->render_test();
            default:
                return $this->render_iframe($content, $height, $responsive);
        }
    }
    
    private function render_test() {
        return '<div style="border:2px solid #4CAF50;padding:30px;background:#f8fff8;border-radius:8px;text-align:center;">
            <h3 style="color:#4CAF50;margin:0 0 15px 0;font-size:18px;">✅ Plugin Funcionando Correctamente</h3>
            <p style="margin:0;color:#666;">El sistema está listo para cargar archivos HTML.</p>
        </div>';
    }
    
    private function render_direct($content) {
        // Sanitizar el contenido manteniendo HTML válido
        $allowed_html = wp_kses_allowed_html('post');
        
        // Agregar elementos HTML adicionales que podrían necesitarse
        $allowed_html['style'] = array();
        $allowed_html['script'] = array('src' => array(), 'type' => array());
        $allowed_html['link'] = array('rel' => array(), 'href' => array(), 'type' => array());
        $allowed_html['meta'] = array('name' => array(), 'content' => array());
        
        $clean_content = wp_kses($content, $allowed_html);
        
        return '<div class="simple-html-container" style="border:1px solid #ddd;padding:20px;border-radius:5px;background:#fff;">
            <div style="margin-bottom:10px;padding:10px;background:#e3f2fd;border-radius:3px;font-size:12px;color:#1976d2;">
                🔵 Contenido HTML integrado directamente
            </div>
            <div style="overflow:auto;">
                ' . $clean_content . '
            </div>
        </div>';
    }
    
    private function render_iframe($content, $height = 'auto', $responsive = true) {
        $id = 'simple-iframe-' . uniqid();
        
        // Crear archivo temporal
        $upload_dir = wp_upload_dir();
        $filename = 'temp-html-' . uniqid() . '.html';
        $filepath = $upload_dir['path'] . '/' . $filename;
        $fileurl = $upload_dir['url'] . '/' . $filename;
        
        // Escribir archivo con contenido completo
        $full_html = $this->wrap_html_content($content);
        file_put_contents($filepath, $full_html);
        
        // Programar eliminación después de 24 horas
        wp_schedule_single_event(time() + (24 * 3600), 'delete_temp_html', array($filepath));
        
        // Determinar altura del iframe
        $iframe_height = $height === 'auto' ? '600px' : $height;
        $auto_height_attr = $height === 'auto' ? 'data-height="auto"' : '';
        $responsive_class = $responsive ? ' responsive-iframe' : '';
        
        return '<div class="simple-html-container' . $responsive_class . '" style="width:100%;position:relative;margin:20px 0;">
            <div style="margin-bottom:10px;padding:10px;background:#fff3e0;border-radius:3px;font-size:12px;color:#f57c00;border-left:4px solid #ff9800;">
                📄 Interactividad Twine - ' . ($height === 'auto' ? 'Altura automática' : 'Altura: ' . $height) . '
            </div>
            <div style="position:relative;width:100%;overflow:hidden;border-radius:5px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <iframe 
                    id="' . esc_attr($id) . '"
                    src="' . esc_url($fileurl) . '" 
                    class="simple-html-iframe"
                    style="width:100%;height:' . esc_attr($iframe_height) . ';border:none;display:block;"
                    ' . $auto_height_attr . '
                    onload="this.style.opacity=1;"
                    frameborder="0"
                    scrolling="auto">
                    <p>Tu navegador no soporta iframes. <a href="' . esc_url($fileurl) . '" target="_blank">Ver contenido</a></p>
                </iframe>
            </div>
        </div>';
    }
    
    private function wrap_html_content($content) {
        // Si el contenido ya tiene estructura HTML completa, devolverlo tal como está
        if (strpos($content, '<html') !== false || strpos($content, '<!DOCTYPE') !== false) {
            return $content;
        }
        
        // Si no, envolverlo en una estructura HTML básica
        return '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contenido HTML</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
        }
        * { 
            box-sizing: border-box; 
        }
    </style>
</head>
<body>
' . $content . '
</body>
</html>';
    }
}

// Hook para eliminar archivos temporales
add_action('delete_temp_html', function($filepath) {
    if (file_exists($filepath)) {
        unlink($filepath);
        error_log('Simple HTML Test: Archivo temporal eliminado - ' . basename($filepath));
    }
});

// Limpiar archivos temporales antiguos al activar el plugin
register_activation_hook(__FILE__, function() {
    $upload_dir = wp_upload_dir();
    $files = glob($upload_dir['path'] . '/temp-html-*.html');
    foreach ($files as $file) {
        if (filemtime($file) < time() - (24 * 3600)) {
            unlink($file);
        }
    }
});

new SimpleHTMLTest();
?>
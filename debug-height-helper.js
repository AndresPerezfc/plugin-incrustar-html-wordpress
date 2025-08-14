/**
 * Debug Helper para problemas de altura en iframes Twine
 * Incluye este archivo temporalmente para diagnosticar problemas
 */

(function() {
    'use strict';
    
    console.log('🔧 Debug Helper para Twine Iframe Height activado');
    
    // Mostrar información sobre iframes encontrados
    function debugIframes() {
        const iframes = document.querySelectorAll('.simple-html-iframe');
        console.log(`🔧 Encontrados ${iframes.length} iframes con clase simple-html-iframe`);
        
        iframes.forEach((iframe, index) => {
            console.log(`🔧 Iframe ${index + 1}:`, {
                id: iframe.id,
                src: iframe.src,
                height: iframe.style.height,
                dataHeight: iframe.dataset.height,
                classes: iframe.className,
                offsetHeight: iframe.offsetHeight,
                scrollHeight: iframe.scrollHeight
            });
        });
    }
    
    // Interceptar mensajes postMessage
    const originalPostMessage = window.postMessage;
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'twine-iframe-height') {
            console.log('🔧 Mensaje postMessage recibido:', event.data);
        }
    });
    
    // Mostrar información cada 2 segundos
    setInterval(debugIframes, 2000);
    
    // Información inicial
    setTimeout(debugIframes, 1000);
    
    // Agregar botón de debug en la consola
    window.debugTwineHeight = function() {
        debugIframes();
        
        // Intentar forzar redimensionamiento
        const iframes = document.querySelectorAll('.simple-html-iframe[data-height="auto"]');
        iframes.forEach(iframe => {
            console.log(`🔧 Forzando redimensionamiento de: ${iframe.id}`);
            iframe.style.height = '200px';
            setTimeout(() => {
                iframe.style.height = '800px';
            }, 500);
        });
    };
    
    console.log('🔧 Usa debugTwineHeight() en la consola para debug manual');
    
})();
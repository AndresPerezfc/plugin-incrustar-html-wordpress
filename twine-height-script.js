/**
 * Script que se inyecta en el contenido de Twine para comunicar la altura
 * Este script se ejecuta dentro del iframe
 */

(function() {
    'use strict';
    
    let lastHeight = 0;
    let resizeTimer = null;
    
    /**
     * Calcula y envía la altura del contenido
     */
    function sendHeight() {
        const height = Math.max(
            document.body.scrollHeight || 0,
            document.body.offsetHeight || 0,
            document.documentElement.clientHeight || 0,
            document.documentElement.scrollHeight || 0,
            document.documentElement.offsetHeight || 0,
            getTwineSpecificHeight()
        );
        
        // Solo enviar si la altura cambió significativamente
        if (Math.abs(height - lastHeight) > 10) {
            lastHeight = height;
            
            const iframeId = getIframeId();
            if (iframeId && window.parent && window.parent !== window) {
                try {
                    window.parent.postMessage({
                        type: 'twine-iframe-height',
                        height: height,
                        iframeId: iframeId,
                        timestamp: Date.now()
                    }, '*');
                    
                    console.log(`📏 Altura enviada: ${height}px (iframe: ${iframeId})`);
                } catch (e) {
                    console.log('Error enviando altura:', e);
                }
            }
        }
    }
    
    /**
     * Obtiene altura específica de elementos Twine
     */
    function getTwineSpecificHeight() {
        // Buscar elementos específicos de Twine
        const twineStory = document.querySelector('tw-story');
        if (twineStory) {
            return Math.max(
                twineStory.scrollHeight || 0,
                twineStory.offsetHeight || 0
            );
        }
        
        // Buscar contenedor principal
        const mainContent = document.querySelector('body > *:last-child');
        if (mainContent) {
            return Math.max(
                mainContent.scrollHeight || 0,
                mainContent.offsetHeight || 0
            );
        }
        
        return 0;
    }
    
    /**
     * Obtiene el ID del iframe desde el contexto
     */
    function getIframeId() {
        try {
            if (window.frameElement && window.frameElement.id) {
                return window.frameElement.id;
            }
        } catch (e) {
            // Error de CORS esperado
        }
        
        // Fallback: buscar en parámetros URL o otros métodos
        const urlParams = new URLSearchParams(window.location.search);
        const iframeId = urlParams.get('iframe_id');
        if (iframeId) {
            return iframeId;
        }
        
        return 'unknown-iframe';
    }
    
    /**
     * Configura observers para detectar cambios
     */
    function setupObservers() {
        // Observer para cambios en el DOM
        const observer = new MutationObserver(function(mutations) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(sendHeight, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Observer para cambios en el tamaño de window
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(sendHeight, 100);
        });
        
        // Observer específico para Twine (cambios de pasaje)
        const twineStory = document.querySelector('tw-story');
        if (twineStory) {
            const twineObserver = new MutationObserver(function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(sendHeight, 150);
            });
            
            twineObserver.observe(twineStory, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
        
        // Enviar altura inicial después de que todo esté cargado
        setTimeout(sendHeight, 100);
        setTimeout(sendHeight, 500);
        setTimeout(sendHeight, 1000);
    }
    
    /**
     * Inicializa el sistema de comunicación de altura
     */
    function init() {
        console.log('📏 Twine Height Script: Iniciando comunicación de altura...');
        
        if (document.readyState === 'complete') {
            setupObservers();
        } else {
            window.addEventListener('load', function() {
                setTimeout(setupObservers, 100);
            });
        }
        
        // También iniciar inmediatamente si el DOM está listo
        if (document.readyState !== 'loading') {
            setupObservers();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(setupObservers, 100);
            });
        }
    }
    
    // Inicializar
    init();
    
})();
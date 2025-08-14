/**
 * Twine Iframe Auto-Resizer
 * Script dedicado para ajustar automáticamente la altura de iframes con contenido Twine
 */

(function() {
    'use strict';
    
    // Configuración
    const CONFIG = {
        minHeight: 200,
        maxHeight: 5000,
        padding: 30,
        timeout: 500,
        retryAttempts: 10
    };
    
    let resizeAttempts = new Map();
    
    /**
     * Función principal para inicializar el resizer
     */
    function initTwineResizer() {
        console.log('🎮 Twine Iframe Resizer: Iniciando...');
        
        // Escuchar mensajes de postMessage
        window.addEventListener('message', handlePostMessage);
        
        // Procesar iframes existentes
        processExistingIframes();
        
        // Observer para nuevos iframes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            const iframes = node.querySelectorAll ? node.querySelectorAll('.simple-html-iframe') : [];
                            if (node.classList && node.classList.contains('simple-html-iframe')) {
                                setupIframe(node);
                            }
                            iframes.forEach(setupIframe);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Maneja mensajes postMessage del iframe
     */
    function handlePostMessage(event) {
        if (!event.data || event.data.type !== 'twine-iframe-height') {
            return;
        }
        
        const iframe = document.getElementById(event.data.iframeId);
        if (!iframe || iframe.dataset.height !== 'auto') {
            return;
        }
        
        const newHeight = Math.max(
            Math.min(event.data.height + CONFIG.padding, CONFIG.maxHeight),
            CONFIG.minHeight
        );
        
        iframe.style.height = newHeight + 'px';
        iframe.classList.add('auto-height');
        
        console.log(`🎮 Altura ajustada via postMessage: ${newHeight}px (iframe: ${event.data.iframeId})`);
    }
    
    /**
     * Procesa iframes existentes en la página
     */
    function processExistingIframes() {
        const iframes = document.querySelectorAll('.simple-html-iframe');
        iframes.forEach(setupIframe);
    }
    
    /**
     * Configura un iframe individual
     */
    function setupIframe(iframe) {
        if (!iframe.dataset.height || iframe.dataset.height !== 'auto') {
            return;
        }
        
        if (iframe.dataset.twineSetup === 'true') {
            return; // Ya configurado
        }
        
        iframe.dataset.twineSetup = 'true';
        console.log(`🎮 Configurando iframe: ${iframe.id}`);
        
        // Intentar acceso directo primero
        iframe.addEventListener('load', function() {
            attemptDirectAccess(iframe);
        });
        
        // Fallback con múltiples intentos
        if (iframe.complete) {
            attemptDirectAccess(iframe);
        }
    }
    
    /**
     * Intenta acceso directo al contenido del iframe
     */
    function attemptDirectAccess(iframe) {
        const iframeId = iframe.id;
        
        if (!resizeAttempts.has(iframeId)) {
            resizeAttempts.set(iframeId, 0);
        }
        
        const attempts = resizeAttempts.get(iframeId);
        
        if (attempts >= CONFIG.retryAttempts) {
            console.log(`🎮 Máximo de intentos alcanzado para: ${iframeId}`);
            return;
        }
        
        resizeAttempts.set(iframeId, attempts + 1);
        
        try {
            // Intentar acceder al documento del iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            if (iframeDoc && iframeDoc.body) {
                const height = calculateContentHeight(iframeDoc);
                
                if (height > 0) {
                    const newHeight = Math.max(
                        Math.min(height + CONFIG.padding, CONFIG.maxHeight),
                        CONFIG.minHeight
                    );
                    
                    iframe.style.height = newHeight + 'px';
                    iframe.classList.add('auto-height');
                    
                    console.log(`🎮 Altura ajustada directamente: ${newHeight}px (iframe: ${iframeId})`);
                    
                    // Observer para cambios en el contenido
                    const contentObserver = new MutationObserver(function() {
                        setTimeout(() => attemptDirectAccess(iframe), 100);
                    });
                    
                    contentObserver.observe(iframeDoc.body, {
                        childList: true,
                        subtree: true,
                        attributes: true
                    });
                    
                    return;
                }
            }
        } catch (e) {
            console.log(`🎮 Acceso directo fallido para ${iframeId}, usando postMessage`);
        }
        
        // Retry después de un tiempo
        setTimeout(() => attemptDirectAccess(iframe), CONFIG.timeout);
    }
    
    /**
     * Calcula la altura real del contenido
     */
    function calculateContentHeight(doc) {
        const body = doc.body;
        const html = doc.documentElement;
        
        if (!body) return 0;
        
        return Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
            // También revisar elementos específicos de Twine
            getTwineStoryHeight(doc)
        );
    }
    
    /**
     * Calcula altura específica para elementos Twine
     */
    function getTwineStoryHeight(doc) {
        const twineStory = doc.querySelector('tw-story');
        if (twineStory) {
            return Math.max(
                twineStory.scrollHeight,
                twineStory.offsetHeight
            );
        }
        return 0;
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTwineResizer);
    } else {
        initTwineResizer();
    }
    
})();
(function(wp) {
    'use strict';
    
    if (!wp || !wp.blocks) {
        console.error('WordPress blocks no está disponible');
        return;
    }
    
    const { registerBlockType } = wp.blocks;
    const { createElement: el, Component } = wp.element;
    const { InspectorControls } = wp.blockEditor || wp.editor || {};
    const { PanelBody, SelectControl, RangeControl, TextControl } = wp.components || {};

    class SimpleHTMLEmbed extends Component {
        constructor(props) {
            super(props);
            this.state = {
                uploading: false,
                error: null,
                success: false,
                filename: ''
            };
            
            // Bind methods
            this.uploadFile = this.uploadFile.bind(this);
        }

        uploadFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Validar tipo de archivo
            if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
                this.setState({ error: 'Por favor selecciona un archivo HTML válido (.html o .htm)' });
                return;
            }

            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.setState({ error: 'El archivo es demasiado grande. Máximo 5MB permitido.' });
                return;
            }

            this.setState({ uploading: true, error: null });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('action', 'simple_html_upload');
            formData.append('nonce', window.simpleHtmlTest?.nonce || window.testNonce || '');

            const ajaxUrl = window.simpleHtmlTest?.ajaxurl || window.ajaxurl || '/wp-admin/admin-ajax.php';

            fetch(ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                this.setState({ uploading: false });
                if (data.success) {
                    this.props.setAttributes({
                        content: data.data.content
                    });
                    this.setState({ 
                        success: true,
                        filename: data.data.filename || file.name
                    });
                } else {
                    this.setState({ error: data.data || 'Error desconocido' });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.setState({ 
                    uploading: false, 
                    error: 'Error de conexión. Verifica tu conexión a internet.' 
                });
            });

            event.target.value = '';
        }

        render() {
            const { attributes, setAttributes } = this.props;
            const { content, method, height } = attributes;
            const { uploading, error, success, filename } = this.state;

            return el('div', { 
                className: 'simple-html-embed-block',
                style: { 
                    border: '2px solid #0073aa', 
                    padding: '20px', 
                    margin: '20px 0',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    position: 'relative'
                } 
            }, [
                // Panel de configuración
                InspectorControls && el(InspectorControls, { key: 'controls' }, [
                    el(PanelBody, { title: 'Configuración de Visualización', key: 'panel' }, [
                        el(SelectControl, {
                            label: 'Método de Renderizado',
                            value: method || 'iframe',
                            onChange: function(value) { setAttributes({ method: value }); },
                            options: [
                                { label: '📄 Iframe (Recomendado)', value: 'iframe' },
                                { label: '🔵 Directo', value: 'direct' },
                                { label: '🧪 Solo Test', value: 'test' }
                            ],
                            help: 'El método Iframe es el más seguro y compatible.'
                        }),
                        method === 'iframe' && el(TextControl, {
                            label: 'Altura del Iframe',
                            value: height || 'auto',
                            onChange: function(value) { setAttributes({ height: value }); },
                            help: 'Ejemplo: 400px, 50vh, auto (recomendado para Twine)',
                            placeholder: 'auto'
                        }),
                        method === 'iframe' && el('div', {
                            style: {
                                marginTop: '10px',
                                padding: '8px',
                                backgroundColor: '#e8f4f8',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#333'
                            }
                        }, '💡 Tip: "auto" ajusta la altura automáticamente al contenido de Twine')
                    ])
                ]),

                // Título del bloque
                el('div', { 
                    style: { 
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: '15px'
                    }
                }, [
                    el('h3', { 
                        style: { 
                            margin: '0', 
                            color: '#0073aa',
                            fontSize: '18px',
                            flex: 1
                        } 
                    }, '🎮 Interactividad Twine'),
                    content && el('span', {
                        style: {
                            background: '#4CAF50',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }
                    }, '✓ Cargado')
                ]),

                // Selector de método (visible)
                el('div', { 
                    style: { 
                        marginBottom: '20px',
                        padding: '15px',
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0'
                    }
                }, [
                    el('label', { 
                        style: { 
                            fontWeight: '600', 
                            display: 'block', 
                            marginBottom: '8px',
                            color: '#333'
                        } 
                    }, 'Método de visualización:'),
                    el('select', {
                        value: method || 'iframe',
                        onChange: function(e) { setAttributes({ method: e.target.value }); },
                        style: { 
                            width: '100%', 
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }
                    }, [
                        el('option', { value: 'iframe' }, '📄 Iframe - Perfecto para Twine (Recomendado)'),
                        el('option', { value: 'direct' }, '🔵 Directo - Solo HTML simple'),
                        el('option', { value: 'test' }, '🧪 Test - Verificar funcionamiento')
                    ])
                ]),

                // Área de carga de archivo
                !content && el('div', { 
                    style: { 
                        textAlign: 'center', 
                        padding: '40px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '2px dashed #ddd',
                        transition: 'all 0.3s ease'
                    },
                    onDragOver: (e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#0073aa';
                        e.currentTarget.style.backgroundColor = '#f0f8ff';
                    },
                    onDragLeave: (e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#ddd';
                        e.currentTarget.style.backgroundColor = '#fff';
                    },
                    onDrop: (e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#ddd';
                        e.currentTarget.style.backgroundColor = '#fff';
                        
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                            const fakeEvent = { target: { files: files } };
                            this.uploadFile(fakeEvent);
                        }
                    }
                }, [
                    el('input', {
                        type: 'file',
                        accept: '.html,.htm',
                        onChange: this.uploadFile,
                        style: { display: 'none' },
                        ref: function(ref) { this.fileInput = ref; }.bind(this)
                    }),
                    
                    uploading ? 
                        el('div', { style: { color: '#0073aa' } }, [
                            el('div', { 
                                style: { 
                                    fontSize: '48px', 
                                    marginBottom: '15px',
                                    animation: 'pulse 1.5s infinite'
                                } 
                            }, '⏳'),
                            el('p', { style: { margin: '0', fontSize: '16px' } }, 'Subiendo archivo...'),
                            el('div', {
                                style: {
                                    width: '200px',
                                    height: '4px',
                                    background: '#e0e0e0',
                                    borderRadius: '2px',
                                    margin: '15px auto 0',
                                    overflow: 'hidden'
                                }
                            }, [
                                el('div', {
                                    style: {
                                        width: '50%',
                                        height: '100%',
                                        background: '#0073aa',
                                        borderRadius: '2px',
                                        animation: 'loading 2s infinite'
                                    }
                                })
                            ])
                        ]) :
                        el('div', {}, [
                            el('div', { 
                                style: { 
                                    fontSize: '64px', 
                                    marginBottom: '20px',
                                    opacity: '0.7'
                                } 
                            }, '📄'),
                            el('h4', { 
                                style: { 
                                    marginBottom: '15px',
                                    color: '#333',
                                    fontSize: '18px'
                                } 
                            }, 'Selecciona tu interactividad Twine'),
                            el('p', { 
                                style: { 
                                    marginBottom: '20px',
                                    color: '#666',
                                    fontSize: '14px'
                                } 
                            }, 'Arrastra y suelta tu archivo .html de Twine aquí, o haz clic para seleccionar'),
                            el('button', {
                                onClick: function() { 
                                if (this.fileInput) this.fileInput.click(); 
                            }.bind(this),
                                style: {
                                    padding: '12px 24px',
                                    backgroundColor: '#0073aa',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'background-color 0.3s ease'
                                },
                                onMouseOver: (e) => e.target.style.backgroundColor = '#005a87',
                                onMouseOut: (e) => e.target.style.backgroundColor = '#0073aa'
                            }, '📁 Seleccionar Archivo Twine (.html)'),
                            el('div', {
                                style: {
                                    fontSize: '12px',
                                    color: '#999',
                                    marginTop: '15px'
                                }
                            }, 'Archivos Twine soportados: .html, .htm (máximo 5MB)')
                        ]),
                    
                    error && el('div', { 
                        style: { 
                            color: '#d63384', 
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f8d7da',
                            borderRadius: '6px',
                            border: '1px solid #f5c6cb'
                        } 
                    }, [
                        el('strong', {}, '⚠️ Error: '),
                        error
                    ])
                ]),

                // Estado del archivo cargado
                content && el('div', { 
                    style: { 
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                    }
                }, [
                    success && el('div', {
                        style: {
                            background: '#d4edda',
                            color: '#155724',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '15px',
                            border: '1px solid #c3e6cb',
                            display: 'flex',
                            alignItems: 'center'
                        }
                    }, [
                        el('span', { style: { marginRight: '8px' } }, '✅'),
                        el('span', {}, `Archivo "${filename}" cargado exitosamente`)
                    ]),
                    
                    el('div', { 
                        style: { 
                            background: '#e3f2fd', 
                            padding: '15px',
                            borderRadius: '6px',
                            marginBottom: '15px',
                            fontSize: '14px'
                        } 
                    }, [
                        el('strong', {}, '📊 Información del archivo:'),
                        el('br'),
                        `Tamaño: ${content.length.toLocaleString()} caracteres`,
                        el('br'),
                        `Método: ${method === 'iframe' ? '📄 Iframe (Twine)' : method === 'direct' ? '🔵 Directo' : '🧪 Test'}`,
                        el('br'),
                        `Altura: ${height === 'auto' ? 'Automática ✨' : height}`
                    ]),
                    
                    el('div', { 
                        style: { 
                            display: 'flex', 
                            gap: '10px',
                            flexWrap: 'wrap'
                        } 
                    }, [
                        el('button', {
                            onClick: function() { 
                                if (this.fileInput) this.fileInput.click(); 
                            }.bind(this),
                            style: { 
                                padding: '10px 16px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }
                        }, '🔄 Cambiar Archivo'),
                        el('button', {
                            onClick: function() {
                                setAttributes({ content: '' });
                                this.setState({ success: false, filename: '' });
                            }.bind(this),
                            style: {
                                padding: '10px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }
                        }, '🗑️ Eliminar'),
                        el('input', {
                            type: 'file',
                            accept: '.html,.htm',
                            onChange: this.uploadFile,
                            style: { display: 'none' },
                            ref: function(ref) { this.fileInput = ref; }.bind(this)
                        })
                    ])
                ])
            ]);
        }
    }

    // Estilos CSS en línea para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
        }
    `;
    document.head.appendChild(style);

    try {
        registerBlockType('simple-html/test', {
            title: '🎮 Interactividad Twine',
            description: 'Incrusta interactividades Twine exportadas como HTML en tu página',
            icon: 'media-text',
            category: 'embed',
            keywords: ['twine', 'interactividad', 'html', 'embed', 'iframe'],
            attributes: {
                content: { 
                    type: 'string', 
                    default: '' 
                },
                method: { 
                    type: 'string', 
                    default: 'iframe' 
                },
                height: {
                    type: 'string',
                    default: 'auto'
                }
            },
            edit: SimpleHTMLEmbed,
            save: function() {
                return null; // Renderizado dinámico en PHP
            }
        });
        
        console.log('✅ Simple HTML Embed: Bloque registrado exitosamente');
        
    } catch (error) {
        console.error('❌ Error registrando bloque Simple HTML Embed:', error);
    }
    
})(window.wp);
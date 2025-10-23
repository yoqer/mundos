// Scripts avanzados para la página de demostración de MundosInfinitos

// Configuración global
const DEMO_CONFIG = {
    animationDuration: 800,
    particleCount: 50,
    autoScrollReveal: true,
    enableParticles: true
};

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeDemo();
    setupScrollReveal();
    if (DEMO_CONFIG.enableParticles) {
        createFloatingParticles();
    }
    setupAdvancedInteractions();
});

// Función principal de inicialización
function initializeDemo() {
    console.log('🌍 MundosInfinitos Demo - Inicializando...');
    
    // Agregar clases de animación
    const heroElements = document.querySelectorAll('.hero h1, .hero .subtitle');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('fade-in-up');
        }, index * 200);
    });
    
    // Animar la característica principal
    setTimeout(() => {
        const mainFeature = document.querySelector('.main-feature');
        if (mainFeature) {
            mainFeature.classList.add('fade-in-up');
        }
    }, 600);
}

// Sistema de revelación por scroll
function setupScrollReveal() {
    if (!DEMO_CONFIG.autoScrollReveal) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    // Observar elementos que deben revelarse
    const revealElements = document.querySelectorAll(
        '.feature-card, .examples-section, .user-content, .trending-section'
    );
    
    revealElements.forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });
}

// Crear partículas flotantes
function createFloatingParticles() {
    const container = document.createElement('div');
    container.className = 'floating-particles';
    document.body.appendChild(container);
    
    for (let i = 0; i < DEMO_CONFIG.particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Posición aleatoria
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
    
    container.appendChild(particle);
    
    // Recrear partícula cuando termine la animación
    particle.addEventListener('animationend', () => {
        particle.remove();
        createParticle(container);
    });
}

// Configurar interacciones avanzadas
function setupAdvancedInteractions() {
    // Efecto de typing en el título principal
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        setupTypingEffect(heroTitle);
    }
    
    // Contador animado para estadísticas
    animateCounters();
    
    // Efectos de hover mejorados
    setupAdvancedHoverEffects();
    
    // Sistema de notificaciones
    setupNotificationSystem();
}

// Efecto de escritura automática
function setupTypingEffect(element) {
    const originalText = element.textContent;
    element.textContent = '';
    
    let i = 0;
    const typeInterval = setInterval(() => {
        element.textContent += originalText.charAt(i);
        i++;
        
        if (i >= originalText.length) {
            clearInterval(typeInterval);
            element.classList.add('pulse-animation');
        }
    }, 100);
}

// Animar contadores numéricos
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current) + '%';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '%';
            }
        };
        
        // Iniciar cuando sea visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Efectos de hover avanzados
function setupAdvancedHoverEffects() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            // Efecto de ondas
            createRippleEffect(e, this);
            
            // Cambiar icono
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// Crear efecto de ondas
function createRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Sistema de notificaciones
function setupNotificationSystem() {
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    };
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    return icons[type] || icons['info'];
}

// Funciones mejoradas para las acciones principales
function openEditor() {
    showNotification('🎨 Abriendo Editor Principal...', 'info');
    
    // Simular carga
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function showImportOptions() {
    const modal = createModal('Opciones de Importación', `
        <div style="text-align: left;">
            <h3>📥 Importar desde:</h3>
            <div class="import-options">
                <div class="import-option" onclick="selectImportOption('editor')">
                    <span class="import-icon">📝</span>
                    <div>
                        <strong>Editor de Texto</strong>
                        <p>Word, Google Docs, Notion</p>
                    </div>
                </div>
                <div class="import-option" onclick="selectImportOption('design')">
                    <span class="import-icon">🎨</span>
                    <div>
                        <strong>Herramientas de Diseño</strong>
                        <p>Figma, Canva, Adobe Creative</p>
                    </div>
                </div>
                <div class="import-option" onclick="selectImportOption('audio')">
                    <span class="import-icon">🎵</span>
                    <div>
                        <strong>Editores de Audio</strong>
                        <p>Audacity, Logic Pro, FL Studio</p>
                    </div>
                </div>
                <div class="import-option" onclick="selectImportOption('video')">
                    <span class="import-icon">🎥</span>
                    <div>
                        <strong>Plataformas de Video</strong>
                        <p>YouTube, Vimeo, TikTok</p>
                    </div>
                </div>
                <div class="import-option" onclick="selectImportOption('cloud')">
                    <span class="import-icon">☁️</span>
                    <div>
                        <strong>Almacenamiento en la Nube</strong>
                        <p>Google Drive, Dropbox, OneDrive</p>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Agregar estilos para las opciones de importación
    const style = document.createElement('style');
    style.textContent = `
        .import-options {
            display: grid;
            gap: 15px;
            margin-top: 20px;
        }
        .import-option {
            display: flex;
            align-items: center;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .import-option:hover {
            border-color: #667eea;
            background: #f7fafc;
            transform: translateX(5px);
        }
        .import-icon {
            font-size: 2rem;
            margin-right: 15px;
        }
        .import-option p {
            margin: 5px 0 0 0;
            color: #718096;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
}

function selectImportOption(type) {
    const options = {
        'editor': 'Editor de Texto',
        'design': 'Herramientas de Diseño',
        'audio': 'Editores de Audio',
        'video': 'Plataformas de Video',
        'cloud': 'Almacenamiento en la Nube'
    };
    
    showNotification(`📥 Configurando importación desde ${options[type]}...`, 'success');
    closeModal();
}

// Crear modal personalizado
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    
    // Agregar estilos del modal
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
        }
        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: modalSlideIn 0.3s ease;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .modal-body {
            padding: 20px;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #718096;
        }
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
    `;
    document.head.appendChild(modalStyles);
    
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.custom-modal');
    if (modal) {
        modal.style.animation = 'modalSlideOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Función mejorada para enviar contenido
function submitContent() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const link = document.getElementById('link').value;
    const type = document.getElementById('type').value;
    
    if (!title || !description || !link) {
        showNotification('⚠️ Por favor, completa todos los campos', 'warning');
        return;
    }
    
    // Validar URL
    try {
        new URL(link);
    } catch {
        showNotification('❌ Por favor, ingresa una URL válida', 'error');
        return;
    }
    
    // Simular envío con loading
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    setTimeout(() => {
        showNotification(`🎉 ¡Creación "${title}" enviada exitosamente!`, 'success');
        
        // Limpiar formulario
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('link').value = '';
        
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        
        // Agregar a ejemplos (simulado)
        addToExamples(title, description, type);
    }, 2000);
}

// Agregar ejemplo dinámicamente
function addToExamples(title, description, type) {
    const examplesGrid = document.querySelector('.examples-grid');
    if (!examplesGrid) return;
    
    const typeIcons = {
        'mundo': '🌎',
        'libro': '📚',
        'juego': '🎮',
        'presentacion': '📊',
        'multimedia': '🎥',
        'avatar': '🎭'
    };
    
    const newExample = document.createElement('div');
    newExample.className = 'example-item';
    newExample.innerHTML = `
        <h4>${typeIcons[type] || '✨'} ${title}</h4>
        <p>${description}</p>
        <small><strong>Por:</strong> Usuario Actual | <strong>Tipo:</strong> ${type}</small>
    `;
    
    newExample.style.opacity = '0';
    newExample.style.transform = 'translateY(20px)';
    
    examplesGrid.appendChild(newExample);
    
    setTimeout(() => {
        newExample.style.transition = 'all 0.5s ease';
        newExample.style.opacity = '1';
        newExample.style.transform = 'translateY(0)';
    }, 100);
}

// Agregar estilos CSS dinámicamente
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes modalSlideOut {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        color: #718096;
    }
`;
document.head.appendChild(dynamicStyles);

console.log('🚀 MundosInfinitos Demo - Scripts cargados exitosamente');

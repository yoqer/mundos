// === UNIFIED FIXES AND EVENT MANAGEMENT ===

document.addEventListener('DOMContentLoaded', () => {
    console.log('Unified fixes script loaded');

    // 1. Centralized Event Listener
    document.body.addEventListener('click', (e) => {
        const target = e.target;

        // Navigation buttons
        if (target.matches('.nav-btn')) {
            const sectionId = target.dataset.section;
            if (sectionId) {
                switchSection(sectionId);
            }
        }

        // Close buttons (X)
        if (target.matches('.close-btn, [data-action="close"]') || target.textContent === '×') {
            e.preventDefault();
            e.stopPropagation();
            const modal = target.closest('.modal, .banner, .interface, .voice-interface, .cookie-consent-banner');
            if (modal) {
                modal.remove();
            } else {
                forceCloseAllFloating();
            }
        }

        // Extension buttons
        if (target.matches('.extension-btn')) {
            const extension = target.dataset.extension;
            const action = target.dataset.action;
            if (window.newExtensionsManager) {
                window.newExtensionsManager.handleExtensionAction(extension, action);
            }
        }

        // Video link buttons
        if (target.matches('.video-link-btn')) {
            const url = target.dataset.url;
            if (url && window.newExtensionsManager) {
                window.newExtensionsManager.openVideoLink(url);
            }
        }
    });

    // 2. Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            forceCloseAllFloating();
        }
    });

    // 3. Improved Section Switching
    window.switchSection = function(sectionId) {
        try {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });

            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.style.display = 'block';
            } else {
                console.warn(`Section with ID '${sectionId}' not found.`);
            }

            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            const targetButton = document.querySelector(`[data-section="${sectionId}"]`);
            if (targetButton) {
                targetButton.classList.add('active');
            }
        } catch (error) {
            console.error('Error switching section:', error);
        }
    };

    // 4. Force Close All Floating Elements
    window.forceCloseAllFloating = function() {
        const selectors = ['.modal', '.banner', '.interface', '.voice-interface', '.cookie-consent-banner', '.instruction-modal', '.import-modal'];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });
        console.log('All floating elements closed.');
    };

    // 5. Initial setup on load
    setTimeout(() => {
        if (document.querySelectorAll('.content-section').length > 0) {
            switchSection('external-platforms'); // Set initial section
        }
        if (typeof NewExtensionsManager !== 'undefined') {
            window.newExtensionsManager = new NewExtensionsManager();
        }
    }, 500);
});


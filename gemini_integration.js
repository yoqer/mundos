async function getGeminiCompletion(prompt) {
    try {
        const response = await fetch("/api/gemini_proxy.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown API error');
        }
        
        return data.completion;
    } catch (error) {
        console.error("Error fetching Gemini completion:", error);
        
        // Mostrar error al usuario de manera amigable
        if (error.message.includes('API key')) {
            showNotification('Error: Clave API de Gemini no configurada correctamente', 'error');
        } else if (error.message.includes('HTTP')) {
            showNotification('Error de conexión con la API de Gemini', 'error');
        } else {
            showNotification('Error al procesar solicitud con Gemini: ' + error.message, 'error');
        }
        
        return null;
    }
}

// Función auxiliar para mostrar notificaciones (si no está definida en groq_integration.js)
if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}


// === EXTENSIÓN DE AGENTES CON PERSONALIZACIÓN ===

class AgentsExtension {
    constructor() {
        this.baseAgents = {
            'z.ai': 'https://chat.z.ai',
            'abacus.ai': 'https://abacus.ai'
        };
        this.userCache = this.loadUserCache();
        this.init();
    }
    
    init() {
        this.addToAvatarSection();
        this.setupEventListeners();
    }
    
    addToAvatarSection() {
        const avatarSection = document.querySelector('#avatars-section, [data-section="avatars"]');
        if (avatarSection) {
            const agentsContainer = document.createElement('div');
            agentsContainer.className = 'extension-container agents-extension';
            agentsContainer.innerHTML = `
                <h3>🤖 Agentes - IA Conversacional</h3>
                <p>Accede a agentes de IA especializados y personaliza tus propios enlaces</p>
                
                <div class="agents-grid">
                    <div class="agent-item">
                        <h4>💬 Z.AI - Chat Inteligente</h4>
                        <p>Chatbot gratuito con GLM-4.5</p>
                        <button class="extension-btn" data-agent="z.ai" data-action="open">
                            Abrir Z.AI
                        </button>
                        <button class="extension-btn" data-agent="z.ai" data-action="import">
                            Importar Conversación
                        </button>
                    </div>
                    
                    <div class="agent-item">
                        <h4>🧠 Abacus.AI - Super Asistente</h4>
                        <p>IA empresarial con ChatLLM y DeepAgent</p>
                        <button class="extension-btn" data-agent="abacus.ai" data-action="open">
                            Abrir Abacus.AI
                        </button>
                        <button class="extension-btn" data-agent="abacus.ai" data-action="import">
                            Importar Resultado
                        </button>
                    </div>
                </div>
                
                <div class="personalization-section">
                    <h4>⚙️ Personalizar Agentes</h4>
                    <button class="extension-btn personalize-btn" data-action="personalize">
                        Añadir Agente Personalizado
                    </button>
                    <div id="custom-agents-list" class="custom-agents-list">
                        ${this.renderCustomAgents()}
                    </div>
                </div>
            `;
            
            avatarSection.appendChild(agentsContainer);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('extension-btn') && e.target.closest('.agents-extension')) {
                const action = e.target.dataset.action;
                const agent = e.target.dataset.agent;
                
                if (action === 'open') {
                    this.openAgent(agent);
                } else if (action === 'import') {
                    this.importFromAgent(agent);
                } else if (action === 'personalize') {
                    this.showPersonalizationModal();
                }
            }
            
            if (e.target.classList.contains('custom-agent-btn')) {
                const action = e.target.dataset.action;
                const agentId = e.target.dataset.agentId;
                
                if (action === 'open-custom') {
                    this.openCustomAgent(agentId);
                } else if (action === 'import-custom') {
                    this.importFromCustomAgent(agentId);
                } else if (action === 'edit-custom') {
                    this.editCustomAgent(agentId);
                } else if (action === 'delete-custom') {
                    this.deleteCustomAgent(agentId);
                }
            }
        });
    }
    
    openAgent(agentKey) {
        const url = this.baseAgents[agentKey];
        if (url) {
            const agentWindow = window.open(url, '_blank', 'width=1200,height=800');
            
            this.showInstructions(`Agente ${agentKey}`, `
                <h4>🤖 Instrucciones para ${agentKey}:</h4>
                <ol>
                    <li>Interactúa con el agente de IA</li>
                    <li>Realiza tus consultas o tareas</li>
                    <li>Copia el resultado o conversación</li>
                    <li>Vuelve aquí para importar al editor</li>
                </ol>
                <p><strong>Funciones disponibles:</strong></p>
                <ul>
                    <li>Conversación inteligente</li>
                    <li>Generación de contenido</li>
                    <li>Análisis y procesamiento</li>
                    <li>Integración con el editor</li>
                </ul>
            `);
        }
    }
    
    importFromAgent(agentKey) {
        const modal = this.createImportModal(`Importar desde ${agentKey}`, `
            <div class="import-form">
                <label>URL de la conversación:</label>
                <input type="url" id="agent-url" placeholder="https://${agentKey}/...">
                
                <label>Conversación/Resultado:</label>
                <textarea id="agent-content" placeholder="Pega aquí la conversación o resultado del agente..."></textarea>
                
                <label>Tipo de contenido:</label>
                <select id="agent-content-type">
                    <option value="conversation">Conversación</option>
                    <option value="analysis">Análisis</option>
                    <option value="generation">Contenido Generado</option>
                    <option value="code">Código</option>
                </select>
                
                <button onclick="this.processAgentImport('${agentKey}')">Importar Contenido</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processAgentImport(agentKey) {
        const url = document.getElementById('agent-url').value;
        const content = document.getElementById('agent-content').value;
        const contentType = document.getElementById('agent-content-type').value;
        
        if (content || url) {
            this.importToEditor({
                source: `Agente ${agentKey}`,
                url: url,
                content: content,
                contentType: contentType,
                type: 'agent-result',
                timestamp: new Date().toISOString()
            });
            
            // Guardar en caché de usuario
            this.saveToUserCache(agentKey, {
                url: url,
                contentType: contentType,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    showPersonalizationModal() {
        const modal = this.createImportModal('Personalizar Agente', `
            <div class="personalization-form">
                <h4>➕ Añadir Nuevo Agente</h4>
                
                <label>Nombre del agente:</label>
                <input type="text" id="custom-agent-name" placeholder="Ej: Mi Agente IA">
                
                <label>URL del agente:</label>
                <input type="url" id="custom-agent-url" placeholder="https://mi-agente.com">
                
                <label>Descripción:</label>
                <textarea id="custom-agent-description" placeholder="Describe las funciones de este agente..."></textarea>
                
                <label>Icono (emoji):</label>
                <input type="text" id="custom-agent-icon" placeholder="🤖" maxlength="2">
                
                <label>Categoría:</label>
                <select id="custom-agent-category">
                    <option value="chat">Chat/Conversación</option>
                    <option value="analysis">Análisis</option>
                    <option value="generation">Generación</option>
                    <option value="coding">Programación</option>
                    <option value="other">Otro</option>
                </select>
                
                <button onclick="this.addCustomAgent()">Añadir Agente</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    addCustomAgent() {
        const name = document.getElementById('custom-agent-name').value;
        const url = document.getElementById('custom-agent-url').value;
        const description = document.getElementById('custom-agent-description').value;
        const icon = document.getElementById('custom-agent-icon').value || '🤖';
        const category = document.getElementById('custom-agent-category').value;
        
        if (name && url) {
            const agentId = this.generateAgentId();
            const customAgent = {
                id: agentId,
                name: name,
                url: url,
                description: description,
                icon: icon,
                category: category,
                created: new Date().toISOString()
            };
            
            this.userCache.customAgents = this.userCache.customAgents || [];
            this.userCache.customAgents.push(customAgent);
            this.saveUserCache();
            
            this.refreshCustomAgentsList();
            this.showSuccess(`Agente "${name}" añadido correctamente`);
            
            // Cerrar modal
            const modal = document.querySelector('.extension-modal');
            if (modal) modal.remove();
        }
    }
    
    openCustomAgent(agentId) {
        const agent = this.findCustomAgent(agentId);
        if (agent) {
            const agentWindow = window.open(agent.url, '_blank', 'width=1200,height=800');
            
            this.showInstructions(agent.name, `
                <h4>${agent.icon} Instrucciones para ${agent.name}:</h4>
                <p><strong>Descripción:</strong> ${agent.description}</p>
                <ol>
                    <li>Interactúa con tu agente personalizado</li>
                    <li>Realiza las tareas específicas</li>
                    <li>Copia el resultado obtenido</li>
                    <li>Vuelve aquí para importar al editor</li>
                </ol>
                <p><strong>URL:</strong> <a href="${agent.url}" target="_blank">${agent.url}</a></p>
            `);
        }
    }
    
    importFromCustomAgent(agentId) {
        const agent = this.findCustomAgent(agentId);
        if (agent) {
            const modal = this.createImportModal(`Importar desde ${agent.name}`, `
                <div class="import-form">
                    <label>URL del resultado:</label>
                    <input type="url" id="custom-agent-url" placeholder="${agent.url}">
                    
                    <label>Contenido generado:</label>
                    <textarea id="custom-agent-content" placeholder="Pega aquí el contenido del agente..."></textarea>
                    
                    <label>Tipo de resultado:</label>
                    <select id="custom-agent-type">
                        <option value="text">Texto</option>
                        <option value="code">Código</option>
                        <option value="analysis">Análisis</option>
                        <option value="data">Datos</option>
                    </select>
                    
                    <button onclick="this.processCustomAgentImport('${agentId}')">Importar</button>
                </div>
            `);
            
            document.body.appendChild(modal);
        }
    }
    
    processCustomAgentImport(agentId) {
        const agent = this.findCustomAgent(agentId);
        const url = document.getElementById('custom-agent-url').value;
        const content = document.getElementById('custom-agent-content').value;
        const type = document.getElementById('custom-agent-type').value;
        
        if (content || url) {
            this.importToEditor({
                source: `${agent.name} (Personalizado)`,
                url: url,
                content: content,
                type: type,
                agentId: agentId,
                timestamp: new Date().toISOString()
            });
            
            // Actualizar estadísticas de uso
            this.updateAgentUsage(agentId);
        }
    }
    
    editCustomAgent(agentId) {
        const agent = this.findCustomAgent(agentId);
        if (agent) {
            const modal = this.createImportModal('Editar Agente', `
                <div class="personalization-form">
                    <h4>✏️ Editar ${agent.name}</h4>
                    
                    <label>Nombre del agente:</label>
                    <input type="text" id="edit-agent-name" value="${agent.name}">
                    
                    <label>URL del agente:</label>
                    <input type="url" id="edit-agent-url" value="${agent.url}">
                    
                    <label>Descripción:</label>
                    <textarea id="edit-agent-description">${agent.description}</textarea>
                    
                    <label>Icono (emoji):</label>
                    <input type="text" id="edit-agent-icon" value="${agent.icon}" maxlength="2">
                    
                    <label>Categoría:</label>
                    <select id="edit-agent-category">
                        <option value="chat" ${agent.category === 'chat' ? 'selected' : ''}>Chat/Conversación</option>
                        <option value="analysis" ${agent.category === 'analysis' ? 'selected' : ''}>Análisis</option>
                        <option value="generation" ${agent.category === 'generation' ? 'selected' : ''}>Generación</option>
                        <option value="coding" ${agent.category === 'coding' ? 'selected' : ''}>Programación</option>
                        <option value="other" ${agent.category === 'other' ? 'selected' : ''}>Otro</option>
                    </select>
                    
                    <button onclick="this.updateCustomAgent('${agentId}')">Actualizar Agente</button>
                </div>
            `);
            
            document.body.appendChild(modal);
        }
    }
    
    updateCustomAgent(agentId) {
        const name = document.getElementById('edit-agent-name').value;
        const url = document.getElementById('edit-agent-url').value;
        const description = document.getElementById('edit-agent-description').value;
        const icon = document.getElementById('edit-agent-icon').value;
        const category = document.getElementById('edit-agent-category').value;
        
        const agentIndex = this.userCache.customAgents.findIndex(a => a.id === agentId);
        if (agentIndex !== -1) {
            this.userCache.customAgents[agentIndex] = {
                ...this.userCache.customAgents[agentIndex],
                name: name,
                url: url,
                description: description,
                icon: icon,
                category: category,
                updated: new Date().toISOString()
            };
            
            this.saveUserCache();
            this.refreshCustomAgentsList();
            this.showSuccess(`Agente "${name}" actualizado correctamente`);
            
            // Cerrar modal
            const modal = document.querySelector('.extension-modal');
            if (modal) modal.remove();
        }
    }
    
    deleteCustomAgent(agentId) {
        if (confirm('¿Estás seguro de que quieres eliminar este agente personalizado?')) {
            this.userCache.customAgents = this.userCache.customAgents.filter(a => a.id !== agentId);
            this.saveUserCache();
            this.refreshCustomAgentsList();
            this.showSuccess('Agente eliminado correctamente');
        }
    }
    
    renderCustomAgents() {
        if (!this.userCache.customAgents || this.userCache.customAgents.length === 0) {
            return '<p class="no-custom-agents">No hay agentes personalizados. ¡Añade tu primer agente!</p>';
        }
        
        return this.userCache.customAgents.map(agent => `
            <div class="custom-agent-item">
                <div class="custom-agent-info">
                    <h5>${agent.icon} ${agent.name}</h5>
                    <p>${agent.description}</p>
                    <small>Categoría: ${agent.category} | Creado: ${new Date(agent.created).toLocaleDateString()}</small>
                </div>
                <div class="custom-agent-actions">
                    <button class="custom-agent-btn" data-agent-id="${agent.id}" data-action="open-custom">Abrir</button>
                    <button class="custom-agent-btn" data-agent-id="${agent.id}" data-action="import-custom">Importar</button>
                    <button class="custom-agent-btn edit-btn" data-agent-id="${agent.id}" data-action="edit-custom">✏️</button>
                    <button class="custom-agent-btn delete-btn" data-agent-id="${agent.id}" data-action="delete-custom">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    refreshCustomAgentsList() {
        const customAgentsList = document.getElementById('custom-agents-list');
        if (customAgentsList) {
            customAgentsList.innerHTML = this.renderCustomAgents();
        }
    }
    
    findCustomAgent(agentId) {
        return this.userCache.customAgents?.find(a => a.id === agentId);
    }
    
    generateAgentId() {
        return 'agent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    updateAgentUsage(agentId) {
        if (!this.userCache.agentUsage) {
            this.userCache.agentUsage = {};
        }
        
        if (!this.userCache.agentUsage[agentId]) {
            this.userCache.agentUsage[agentId] = {
                count: 0,
                lastUsed: null
            };
        }
        
        this.userCache.agentUsage[agentId].count++;
        this.userCache.agentUsage[agentId].lastUsed = new Date().toISOString();
        
        this.saveUserCache();
    }
    
    loadUserCache() {
        try {
            const cached = localStorage.getItem('agentsUserCache');
            return cached ? JSON.parse(cached) : {
                customAgents: [],
                agentUsage: {},
                preferences: {}
            };
        } catch (error) {
            console.error('Error loading user cache:', error);
            return {
                customAgents: [],
                agentUsage: {},
                preferences: {}
            };
        }
    }
    
    saveUserCache() {
        try {
            localStorage.setItem('agentsUserCache', JSON.stringify(this.userCache));
        } catch (error) {
            console.error('Error saving user cache:', error);
        }
    }
    
    saveToUserCache(agentKey, data) {
        if (!this.userCache.recentImports) {
            this.userCache.recentImports = [];
        }
        
        this.userCache.recentImports.unshift({
            agent: agentKey,
            ...data
        });
        
        // Mantener solo los últimos 50 imports
        if (this.userCache.recentImports.length > 50) {
            this.userCache.recentImports = this.userCache.recentImports.slice(0, 50);
        }
        
        this.saveUserCache();
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess(`Contenido importado desde ${data.source}`);
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Inicializar extensión de agentes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.agentsExtension = new AgentsExtension();
    });
} else {
    window.agentsExtension = new AgentsExtension();
}

// Exportar para uso global
window.AgentsExtension = AgentsExtension;


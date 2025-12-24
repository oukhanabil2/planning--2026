// Planning 2026 - Application PWA CORRIGÉE
console.log("✅ Application Planning 2026 chargée !");

// Données de l'application
let agents = [];

// Initialisation
function initApp() {
    console.log("Initialisation de l'application...");
    
    // Charger les agents depuis le localStorage
    loadAgents();
    
    // Initialiser les onglets
    setupTabs();
    
    // Initialiser Service Worker pour PWA
    setupServiceWorker();
    
    // Afficher le dashboard par défaut
    showTab('dashboard');
    
    console.log("✅ Application prête !");
}

// Charger les agents depuis localStorage
function loadAgents() {
    const saved = localStorage.getItem('planning_agents');
    agents = saved ? JSON.parse(saved) : [];
    console.log(`${agents.length} agents chargés`);
}

// Sauvegarder les agents dans localStorage
function saveAgents() {
    localStorage.setItem('planning_agents', JSON.stringify(agents));
    console.log(`${agents.length} agents sauvegardés`);
}

// Configuration des onglets
function setupTabs() {
    console.log("Configuration des onglets...");
    
    // Ajouter les écouteurs d'événements aux boutons d'onglets
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log(`Onglet cliqué: ${tabName}`);
            showTab(tabName);
        });
    });
    
    // Écouteurs pour le planning
    document.getElementById('month-select')?.addEventListener('change', loadPlanning);
    document.getElementById('year-select')?.addEventListener('change', loadPlanning);
    document.getElementById('groupe-select')?.addEventListener('change', loadPlanning);
}

// Afficher un onglet spécifique
function showTab(tabName) {
    console.log(`Affichage de l'onglet: ${tabName}`);
    
    // Cacher tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Désactiver tous les boutons d'onglets
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Afficher l'onglet sélectionné
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activer le bouton correspondant
    document.querySelector(`.nav-tab[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Charger les données de l'onglet
    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'planning':
            loadPlanning();
            break;
        case 'agents':
            loadAgentsList();
            break;
        case 'stats':
            loadStats();
            break;
    }
}

// Mettre à jour le tableau de bord
function updateDashboard() {
    console.log("Mise à jour du dashboard...");
    
    document.getElementById('total-agents').textContent = agents.length;
    
    // Calculer les présents aujourd'hui (simplifié)
    const aujourdhui = new Date();
    const jour = aujourdhui.getDate();
    let presents = 0;
    
    agents.forEach(agent => {
        if (agent.groupe === 'E') {
            presents++; // Groupe E travaille du lundi au samedi
        } else {
            presents++; // Simplification
        }
    });
    
    document.getElementById('present-today').textContent = presents;
    
    // Compter les groupes uniques
    const groupes = [...new Set(agents.map(a => a.groupe))];
    document.getElementById('total-groupes').textContent = groupes.length;
    
    document.getElementById('en-service').textContent = agents.length;
}

// Ajouter un nouvel agent
function addAgent() {
    console.log("Ajout d'un agent...");
    
    const code = document.getElementById('code-agent')?.value.trim().toUpperCase();
    const nom = document.getElementById('nom-agent')?.value.trim();
    const prenom = document.getElementById('prenom-agent')?.value.trim();
    const groupe = document.getElementById('groupe-agent')?.value;
    
    if (!code || !nom || !prenom || !groupe) {
        alert("❌ Tous les champs sont obligatoires !");
        return;
    }
    
    // Vérifier si l'agent existe déjà
    const existeDeja = agents.some(a => a.code === code);
    if (existeDeja) {
        if (!confirm(`Agent ${code} existe déjà. Remplacer ?`)) return;
        agents = agents.filter(a => a.code !== code);
    }
    
    // Ajouter le nouvel agent
    const nouvelAgent = {
        code,
        nom,
        prenom,
        groupe,
        date_entree: '2025-11-01',
        statut: 'actif'
    };
    
    agents.push(nouvelAgent);
    saveAgents();
    
    // Réinitialiser le formulaire
    document.getElementById('code-agent').value = '';
    document.getElementById('nom-agent').value = '';
    document.getElementById('prenom-agent').value = '';
    document.getElementById('groupe-agent').value = '';
    
    alert(`✅ Agent ${code} ajouté avec succès !`);
    showTab('agents');
}

// Charger la liste des agents
function loadAgentsList() {
    console.log("Chargement de la liste des agents...");
    const container = document.getElementById('agents-list');
    
    if (!container) {
        console.error("❌ Élément #agents-list introuvable !");
        return;
    }
    
    if (agents.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <p>Aucun agent enregistré</p>
                <button onclick="showTab('add')" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px;">
                    ➕ Ajouter votre premier agent
                </button>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: grid; gap: 12px;">';
    
    agents.forEach(agent => {
        const groupeColor = getGroupeColor(agent.groupe);
        
        html += `
            <div style="background: white; border-radius: 12px; padding: 16px; border: 2px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="font-size: 16px;">${agent.code}</strong>
                    <span style="background: ${groupeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        Groupe ${agent.groupe}
                    </span>
                </div>
                <div style="font-size: 14px; color: #1e293b;">
                    ${agent.nom} ${agent.prenom}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                    Entré le: ${agent.date_entree}
                </div>
                <button onclick="deleteAgent('${agent.code}')" style="margin-top: 10px; padding: 8px 12px; background: #fef2f2; color: #dc2626; border: 2px solid #fecaca; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Supprimer
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Supprimer un agent
function deleteAgent(code) {
    if (!confirm(`Supprimer l'agent ${code} ?`)) return;
    
    agents = agents.filter(a => a.code !== code);
    saveAgents();
    loadAgentsList();
    updateDashboard();
}

// Charger le planning
function loadPlanning() {
    console.log("Chargement du planning...");
    const container = document.getElementById('planning-result');
    
    if (!container) {
        console.error("❌ Élément #planning-result introuvable !");
        return;
    }
    
    if (agents.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <p>Ajoutez des agents pour voir le planning</p>
                <button onclick="showTab('add')" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px;">
                    ➕ Ajouter des agents
                </button>
            </div>
        `;
        return;
    }
    
    const mois = parseInt(document.getElementById('month-select')?.value || new Date().getMonth() + 1);
    const annee = parseInt(document.getElementById('year-select')?.value || 2026);
    const groupeFiltre = document.getElementById('groupe-select')?.value || 'all';
    
    const agentsFiltres = groupeFiltre === 'all' 
        ? agents 
        : agents.filter(a => a.groupe === groupeFiltre);
    
    const joursMois = new Date(annee, mois, 0).getDate();
    
    let html = `
        <div style="overflow-x: auto; border: 2px solid #e2e8f0; border-radius: 12px; padding: 10px;">
            <table class="planning-table">
                <thead>
                    <tr>
                        <th style="min-width: 150px; position: sticky; left: 0; background: #f8fafc;">Agent / Groupe</th>
    `;
    
    // En-têtes des jours
    for (let jour = 1; jour <= joursMois; jour++) {
        const date = new Date(annee, mois - 1, jour);
        const jourSem = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][date.getDay()];
        const estDimanche = date.getDay() === 0;
        const style = estDimanche ? 'background: #fef2f2; color: #dc2626;' : '';
        
        html += `<th style="${style} min-width: 50px;">${jour}<br><small>${jourSem}</small></th>`;
    }
    
    html += '</tr></thead><tbody>';
    
    // Lignes des agents
    agentsFiltres.forEach(agent => {
        const groupeColor = getGroupeColor(agent.groupe);
        
        html += `
            <tr>
                <td style="text-align: left; padding-left: 15px; background: #f8fafc; position: sticky; left: 0;">
                    <div style="font-weight: 700;">${agent.code}</div>
                    <div style="font-size: 12px; color: #64748b;">${agent.nom.substring(0, 10)}. ${agent.prenom.substring(0, 1)}.</div>
                    <span style="background: ${groupeColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">
                        G ${agent.groupe}
                    </span>
                </td>
        `;
        
        for (let jour = 1; jour <= joursMois; jour++) {
            const shift = calculateShift(agent, jour, mois, annee);
            const shiftClass = `shift-${shift}`;
            
            html += `
                <td>
                    <span class="shift-badge ${shiftClass}">${shift}</span>
                </td>
            `;
        }
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Calculer le shift pour un agent
function calculateShift(agent, jour, mois, annee) {
    const date = new Date(annee, mois - 1, jour);
    const jourSem = date.getDay();
    
    // Dimanche = repos pour tous
    if (jourSem === 0) return 'R';
    
    // Groupe E spécial
    if (agent.groupe === 'E') {
        return (jour % 2 === 0) ? '1' : '2';
    }
    
    // Groupes A-D : rotation 8 jours
    const cycle = ['1', '1', '2', '2', '3', '3', 'R', 'R'];
    const decalages = { 'A': 0, 'B': 2, 'C': 4, 'D': 6 };
    const decalage = decalages[agent.groupe] || 0;
    const index = (jour + decalage) % 8;
    
    return cycle[index];
}

// Obtenir la couleur d'un groupe
function getGroupeColor(groupe) {
    const couleurs = {
        'A': '#3b82f6',
        'B': '#10b981',
        'C': '#8b5cf6',
        'D': '#f59e0b',
        'E': '#ef4444'
    };
    return couleurs[groupe] || '#64748b';
}

// Charger les statistiques
function loadStats() {
    console.log("Chargement des statistiques...");
    const container = document.getElementById('stats-result');
    
    if (!container) return;
    
    if (agents.length === 0) {
        container.innerHTML = '<p style="color: #64748b; text-align: center;">Aucune statistique disponible</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 15px;">';
    
    // Par groupe
    const groupes = {};
    agents.forEach(agent => {
        groupes[agent.groupe] = (groupes[agent.groupe] || 0) + 1;
    });
    
    for (const [groupe, count] of Object.entries(groupes)) {
        const couleur = getGroupeColor(groupe);
        html += `
            <div style="background: white; border-left: 4px solid ${couleur}; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 16px;">Groupe ${groupe}</strong>
                        <div style="font-size: 14px; color: #64748b; margin-top: 4px;">${count} agent${count > 1 ? 's' : ''}</div>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${couleur};">${count}</div>
                </div>
            </div>
        `;
    }
    
    // Total
    html += `
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 14px; opacity: 0.9;">TOTAL AGENTS ACTIFS</div>
            <div style="font-size: 40px; font-weight: 800; margin: 10px 0;">${agents.length}</div>
            <div style="font-size: 12px; opacity: 0.8;">Mis à jour: ${new Date().toLocaleDateString()}</div>
        </div>
    `;
    
    html += '</div>';
    container.innerHTML = html;
}

// Service Worker pour PWA
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('✅ Service Worker enregistré'))
            .catch(err => console.error('❌ Erreur Service Worker:', err));
    }
}

// Fonctions d'export/import
function exportToJSON() {
    const data = {
        agents: agents,
        export_date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning_2026_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Données exportées en JSON !');
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initApp);

// Exposer les fonctions globalement pour les boutons
window.showTab = showTab;
window.addAgent = addAgent;
window.deleteAgent = deleteAgent;
window.exportToJSON = exportToJSON;
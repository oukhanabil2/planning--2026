// Planning 2026 - Application PWA
class PlanningApp {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth() + 1;
        this.init();
    }

    init() {
        this.initDatabase();
        this.initPWA();
        this.initEventListeners();
        this.loadDashboard();
        this.loadPlanning();
        this.loadAgents();
        this.loadStats();
    }

    initDatabase() {
        // Initialiser les collections si elles n'existent pas
        if (!localStorage.getItem('planning_agents')) {
            localStorage.setItem('planning_agents', JSON.stringify([]));
        }
        if (!localStorage.getItem('planning_shifts')) {
            localStorage.setItem('planning_shifts', JSON.stringify({}));
        }
        if (!localStorage.getItem('planning_conges')) {
            localStorage.setItem('planning_conges', JSON.stringify([]));
        }
        if (!localStorage.getItem('planning_feries')) {
            // Jours fériés Maroc 2026
            const feries2026 = [
                { date: '2026-01-01', description: 'Nouvel An' },
                { date: '2026-01-11', description: 'Manifeste Indépendance' },
                { date: '2026-05-01', description: 'Fête du Travail' },
                { date: '2026-07-30', description: 'Fête du Trône' },
                { date: '2026-08-14', description: 'Oued Eddahab' },
                { date: '2026-08-20', description: 'Révolution Roi et Peuple' },
                { date: '2026-08-21', description: 'Fête de la Jeunesse' },
                { date: '2026-11-06', description: 'Marche Verte' },
                { date: '2026-11-18', description: 'Fête de l\'Indépendance' }
            ];
            localStorage.setItem('planning_feries', JSON.stringify(feries2026));
        }
    }

    initPWA() {
        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker enregistré'))
                .catch(err => console.log('SW erreur:', err));
        }

        // Installation PWA
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const installBtn = document.getElementById('install-button');
            installBtn.style.display = 'block';
            
            installBtn.addEventListener('click', () => {
                installBtn.style.display = 'none';
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA installée');
                    }
                    deferredPrompt = null;
                });
            });
        });

        // Vérifier si déjà installée
        window.addEventListener('appinstalled', () => {
            document.getElementById('install-button').style.display = 'none';
        });
    }

    initEventListeners() {
        // Navigation par onglets
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.showTab(tabName);
            });
        });

        // Changement de mois/année pour le planning
        document.getElementById('month-select').addEventListener('change', () => this.loadPlanning());
        document.getElementById('year-select').addEventListener('change', () => this.loadPlanning());
        document.getElementById('groupe-select').addEventListener('change', () => this.loadPlanning());

        // Initialiser les sélecteurs avec l'année 2026 par défaut
        document.getElementById('year-select').value = 2026;
        document.getElementById('month-select').value = this.currentMonth;
    }

    // === GESTION DES AGENTS ===
    getAgents() {
        return JSON.parse(localStorage.getItem('planning_agents') || '[]');
    }

    saveAgents(agents) {
        localStorage.setItem('planning_agents', JSON.stringify(agents));
    }

    addAgent() {
        const code = document.getElementById('code-agent').value.trim().toUpperCase();
        const nom = document.getElementById('nom-agent').value.trim();
        const prenom = document.getElementById('prenom-agent').value.trim();
        const groupe = document.getElementById('groupe-agent').value;

        if (!code || !nom || !prenom || !groupe) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!['A', 'B', 'C', 'D', 'E'].includes(groupe)) {
            alert('Groupe invalide. Utilisez A, B, C, D ou E');
            return;
        }

        const agents = this.getAgents();
        
        // Vérifier si le code existe déjà
        if (agents.find(a => a.code === code)) {
            if (!confirm(`L'agent ${code} existe déjà. Remplacer ?`)) return;
            agents = agents.filter(a => a.code !== code);
        }

        const nouvelAgent = {
            code: code,
            nom: nom,
            prenom: prenom,
            code_groupe: groupe,
            date_entree: '2025-11-01', // Date fixe comme dans votre code Python
            date_sortie: null,
            statut: 'actif'
        };

        agents.push(nouvelAgent);
        this.saveAgents(agents);

        // Réinitialiser le formulaire
        document.getElementById('code-agent').value = '';
        document.getElementById('nom-agent').value = '';
        document.getElementById('prenom-agent').value = '';
        document.getElementById('groupe-agent').value = '';

        alert(`✅ Agent ${code} ajouté avec succès !`);
        this.showTab('agents');
        this.loadAgents();
        this.loadDashboard();
        this.loadPlanning();
    }

    deleteAgent(code) {
        if (!confirm(`Supprimer définitivement l'agent ${code} ?`)) return;
        
        const agents = this.getAgents().filter(a => a.code !== code);
        this.saveAgents(agents);
        this.loadAgents();
        this.loadDashboard();
        this.loadPlanning();
    }

    loadAgents() {
        const agents = this.getAgents();
        const container = document.getElementById('agents-list');
        
        if (agents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 20px;">👥</div>
                    <h3>Aucun agent enregistré</h3>
                    <p>Commencez par ajouter des agents via l'onglet "Ajouter"</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: grid; gap: 12px;">';
        
        agents.forEach(agent => {
            const groupeColor = this.getGroupeColor(agent.code_groupe);
            
            html += `
                <div style="background: white; border-radius: 12px; padding: 16px; border: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <strong style="font-size: 16px;">${agent.code}</strong>
                            <span style="background: ${groupeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                Groupe ${agent.code_groupe}
                            </span>
                        </div>
                        <div style="font-size: 14px; color: var(--dark);">
                            ${agent.nom} ${agent.prenom}
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                            Entré le: ${agent.date_entree}
                        </div>
                    </div>
                    <button onclick="app.deleteAgent('${agent.code}')" style="background: #fef2f2; color: var(--danger); border: 2px solid #fecaca; padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Supprimer
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // === CALCUL DES SHIFTS ===
    calculateShiftForAgent(agent, dateStr) {
        const dateObj = new Date(dateStr);
        const joursFeries = JSON.parse(localStorage.getItem('planning_feries') || '[]');
        
        // Vérifier jour férié
        if (joursFeries.some(f => f.date === dateStr)) {
            return 'F';
        }
        
        // Vérifier congés
        const conges = JSON.parse(localStorage.getItem('planning_conges') || '[]');
        const congeAgent = conges.find(c => c.code_agent === agent.code && 
            dateStr >= c.date_debut && dateStr <= c.date_fin);
        if (congeAgent) {
            return 'C';
        }
        
        // Calcul rotation selon groupe
        const dateEntree = new Date(agent.date_entree);
        const diffJours = Math.floor((dateObj - dateEntree) / (1000 * 60 * 60 * 24));
        
        if (agent.code_groupe === 'E') {
            // Groupe E spécial (5/7)
            const jourSemaine = dateObj.getDay();
            if (jourSemaine === 0) return 'R'; // Dimanche
            
            // Simplifié pour démo
            const agentsGroupeE = this.getAgents().filter(a => a.code_groupe === 'E');
            const index = agentsGroupeE.findIndex(a => a.code === agent.code);
            const semaine = Math.floor(dateObj.getDate() / 7);
            
            if (index % 2 === 0) {
                return (semaine % 2 === 0) ? '1' : '2';
            } else {
                return (semaine % 2 === 0) ? '2' : '1';
            }
        } else {
            // Groupes A-D (rotation 8 jours)
            const cycle = ['1', '1', '2', '2', '3', '3', 'R', 'R'];
            const decalages = { 'A': 0, 'B': 2, 'C': 4, 'D': 6 };
            const decalage = decalages[agent.code_groupe] || 0;
            const indexCycle = (diffJours + decalage) % 8;
            return cycle[indexCycle];
        }
    }

    loadPlanning() {
        const mois = parseInt(document.getElementById('month-select').value);
        const annee = parseInt(document.getElementById('year-select').value);
        const groupeFilter = document.getElementById('groupe-select').value;
        const agents = this.getAgents();
        
        const agentsFiltres = groupeFilter === 'all' 
            ? agents 
            : agents.filter(a => a.code_groupe === groupeFilter);
        
        if (agentsFiltres.length === 0) {
            document.getElementById('planning-result').innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📅</div>
                    <h3>Aucun agent dans ce groupe</h3>
                    <p>Ajoutez des agents ou sélectionnez un autre groupe</p>
                </div>
            `;
            return;
        }
        
        // Calculer jours du mois
        const joursMois = new Date(annee, mois, 0).getDate();
        
        let html = `
            <div style="overflow-x: auto; border: 2px solid #e2e8f0; border-radius: 12px; padding: 10px;">
                <table class="planning-table">
                    <thead>
                        <tr>
                            <th style="min-width: 150px;">Agent / Groupe</th>
        `;
        
        // En-têtes des jours
        for (let jour = 1; jour <= joursMois; jour++) {
            const dateObj = new Date(annee, mois - 1, jour);
            const jourSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][dateObj.getDay()];
            const estDimanche = dateObj.getDay() === 0;
            const style = estDimanche ? 'background: #fef2f2; color: #dc2626;' : '';
            
            html += `
                <th style="${style}">
                    ${jour}<br>
                    <small>${jourSemaine}</small>
                </th>
            `;
        }
        
        html += `</tr></thead><tbody>`;
        
        // Lignes pour chaque agent
        agentsFiltres.forEach(agent => {
            const groupeColor = this.getGroupeColor(agent.code_groupe);
            
            html += `
                <tr>
                    <td style="text-align: left; padding-left: 15px; background: #f8fafc; position: sticky; left: 0;">
                        <div style="font-weight: 700; margin-bottom: 4px;">${agent.code}</div>
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                            ${agent.nom.substring(0, 10)}. ${agent.prenom.substring(0, 1)}.
                        </div>
                        <span style="background: ${groupeColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">
                            G ${agent.code_groupe}
                        </span>
                    </td>
            `;
            
            for (let jour = 1; jour <= joursMois; jour++) {
                const dateStr = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
                const shift = this.calculateShiftForAgent(agent, dateStr);
                const shiftClass = `shift-${shift}`;
                const estDimanche = new Date(annee, mois - 1, jour).getDay() === 0;
                const style = estDimanche ? 'background: #fef2f2;' : '';
                
                html += `
                    <td style="${style}">
                        <span class="shift-badge ${shiftClass}">${shift}</span>
                    </td>
                `;
            }
            
            html += `</tr>`;
        });
        
        html += `</tbody></table></div>`;
        document.getElementById('planning-result').innerHTML = html;
    }

    // === DASHBOARD ===
    loadDashboard() {
        const agents = this.getAgents();
        const aujourdhui = new Date().toISOString().split('T')[0];
        
        // Calculer présents aujourd'hui
        const presentsAujourdhui = agents.filter(agent => {
            const shift = this.calculateShiftForAgent(agent, aujourdhui);
            return ['1', '2', '3'].includes(shift);
        }).length;
        
        // Compter groupes uniques
        const groupesUniques = [...new Set(agents.map(a => a.code_groupe))].length;
        
        // Mettre à jour les stats
        document.getElementById('total-agents').textContent = agents.length;
        document.getElementById('present-today').textContent = presentsAujourdhui;
        document.getElementById('total-groupes').textContent = groupesUniques;
        document.getElementById('en-service').textContent = agents.filter(a => a.statut === 'actif').length;
    }

    // === STATISTIQUES ===
    loadStats() {
        const agents = this.getAgents();
        const mois = parseInt(document.getElementById('month-select').value);
        const annee = parseInt(document.getElementById('year-select').value);
        
        if (agents.length === 0) {
            document.getElementById('stats-result').innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                    Aucune statistique disponible
                </div>
            `;
            return;
        }
        
        // Compter par groupe
        const statsGroupes = {};
        agents.forEach(agent => {
            statsGroupes[agent.code_groupe] = (statsGroupes[agent.code_groupe] || 0) + 1;
        });
        
        let html = '<div style="display: grid; gap: 15px;">';
        
        // Stats par groupe
        for (const [groupe, count] of Object.entries(statsGroupes)) {
            const couleur = this.getGroupeColor(groupe);
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
            <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 14px; opacity: 0.9;">TOTAL AGENTS ACTIFS</div>
                <div style="font-size: 40px; font-weight: 800; margin: 10px 0;">${agents.length}</div>
                <div style="font-size: 12px; opacity: 0.8;">Mis à jour: ${new Date().toLocaleDateString()}</div>
            </div>
        `;
        
        html += '</div>';
        document.getElementById('stats-result').innerHTML = html;
    }

    // === UTILITAIRES ===
    getGroupeColor(groupe) {
        const couleurs = {
            'A': '#3b82f6', // Bleu
            'B': '#10b981', // Vert
            'C': '#8b5cf6', // Violet
            'D': '#f59e0b', // Orange
            'E': '#ef4444'  // Rouge
        };
        return couleurs[groupe] || '#64748b';
    }

    showTab(tabName) {
        // Cacher tous les onglets
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Désactiver tous les boutons
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Afficher l'onglet sélectionné
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Activer le bouton correspondant
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Recharger les données si nécessaire
        if (tabName === 'dashboard') this.loadDashboard();
        if (tabName === 'planning') this.loadPlanning();
        if (tabName === 'agents') this.loadAgents();
        if (tabName === 'stats') this.loadStats();
    }

    // === EXPORT/IMPORT ===
    exportToJSON() {
        const data = {
            agents: this.getAgents(),
            conges: JSON.parse(localStorage.getItem('planning_conges') || '[]'),
            feries: JSON.parse(localStorage.getItem('planning_feries') || '[]'),
            export_date: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = `planning_2026_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        alert('✅ Données exportées en JSON !');
    }

    exportToCSV() {
        const agents = this.getAgents();
        let csv = 'Code,Nom,Prénom,Groupe,Date Entrée,Statut\n';
        
        agents.forEach(agent => {
            csv += `"${agent.code}","${agent.nom}","${agent.prenom}","${agent.code_groupe}","${agent.date_entree}","${agent.statut}"\n`;
        });
        
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planning_agents_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('✅ Données exportées en CSV !');
    }

    exportToExcel() {
        // Pour mobile, on fait un export JSON amélioré
        this.exportToJSON();
    }

    importFromJSON() {
        // Sur mobile, on ne peut pas utiliser input file directement
        // On va plutôt demander de coller le JSON
        const json = prompt('Collez le contenu JSON de sauvegarde :');
        if (json) {
            try {
                const data = JSON.parse(json);
                
                if (data.agents) {
                    localStorage.setItem('planning_agents', JSON.stringify(data.agents));
                }
                if (data.conges) {
                    localStorage.setItem('planning_conges', JSON.stringify(data.conges));
                }
                if (data.feries) {
                    localStorage.setItem('planning_feries', JSON.stringify(data.feries));
                }
                
                alert('✅ Données importées avec succès !');
                location.reload(); // Recharger pour appliquer
            } catch (error) {
                alert('❌ Erreur : JSON invalide');
            }
        }
    }

    clearAllData() {
        if (confirm('⚠️ ATTENTION : Cette action supprimera TOUTES les données. Continuer ?')) {
            localStorage.clear();
            alert('✅ Toutes les données ont été effacées.');
            location.reload();
        }
    }
}

// Initialiser l'application
const app = new PlanningApp();
window.app = app; // Exposer globalement

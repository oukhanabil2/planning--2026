// Planning 2026 - Application PWA avec logique métier complète (version intégrée)
console.log("✅ Application Planning 2026 chargée - Version Logique Métier Intégrée !");

// =========================================================================
// CONSTANTES ET CONFIGURATION
// =========================================================================

const DATE_AFFECTATION_BASE = "2025-11-01";
const JOURS_FRANCAIS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// Jours fériés Maroc 2026 (fixes + automatiques)
const JOURS_FERIES_MAROC_2026 = [
    '2026-01-01',   // Nouvel An
    '2026-01-11',   // Manifeste de l'Indépendance
    '2026-05-01',   // Fête du Travail
    '2026-07-30',   // Fête du Trône
    '2026-08-14',   // Allégeance Oued Eddahab
    '2026-08-20',   // Révolution du Roi et du Peuple
    '2026-08-21',   // Fête de la Jeunesse
    '2026-11-06',   // Marche Verte
    '2026-11-18'    // Fête de l'Indépendance
];

// =========================================================================
// CLASSE PRINCIPALE AVEC LOGIQUE MÉTIER INTÉGRÉE
// =========================================================================

class PlanningMetier {
    constructor() {
        this.agents = [];
        this.planning = {};
        this.congesPeriodes = []; // Changé pour gérer les périodes
        this.joursFeries = [...JOURS_FERIES_MAROC_2026];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.initialiserDonneesTest();
        console.log(`✅ ${this.agents.length} agents initialisés avec logique métier complète`);
    }

    // =========================================================================
    // INITIALISATION DES DONNÉES DE TEST (Similaire à votre Python)
    // =========================================================================

    initialiserDonneesTest() {
        if (this.agents.length === 0) {
            const agentsTest = [
                { code: 'A01', nom: 'Dupont', prenom: 'Alice', groupe: 'A', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
                { code: 'B02', nom: 'Martin', prenom: 'Bob', groupe: 'B', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
                { code: 'C03', nom: 'Lefevre', prenom: 'Carole', groupe: 'C', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
                { code: 'D04', nom: 'Dubois', prenom: 'David', groupe: 'D', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
                { code: 'E01', nom: 'Zahiri', prenom: 'Ahmed', groupe: 'E', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
                { code: 'E02', nom: 'Zarrouk', prenom: 'Benoit', groupe: 'E', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' }
            ];
            
            this.agents = agentsTest;
            this.saveData();
            console.log("📊 Agents de test initialisés avec date d'affectation: " + DATE_AFFECTATION_BASE);
        }
    }

    // =========================================================================
    // GESTION DES DONNÉES
    // =========================================================================

    loadData() {
        // Charger depuis data.js si disponible
        if (window.agentsData && window.agentsData.length > 0) {
            this.agents = window.agentsData;
            console.log(`📥 ${this.agents.length} agents chargés depuis data.js`);
        } else {
            // Sinon depuis localStorage
            const saved = localStorage.getItem('planning_agents');
            this.agents = saved ? JSON.parse(saved) : [];
            console.log(`📥 ${this.agents.length} agents chargés depuis localStorage`);
        }

        // Charger planning
        const planningSaved = localStorage.getItem('planning_shifts');
        this.planning = planningSaved ? JSON.parse(planningSaved) : {};

        // Charger congés par période
        const congesSaved = localStorage.getItem('planning_conges_periodes');
        this.congesPeriodes = congesSaved ? JSON.parse(congesSaved) : [];

        // Charger jours fériés supplémentaires
        const feriesSaved = localStorage.getItem('planning_feries_manuels');
        if (feriesSaved) {
            this.joursFeries = [...JOURS_FERIES_MAROC_2026, ...JSON.parse(feriesSaved)];
        }
    }

    saveData() {
        localStorage.setItem('planning_agents', JSON.stringify(this.agents));
        localStorage.setItem('planning_shifts', JSON.stringify(this.planning));
        localStorage.setItem('planning_conges_periodes', JSON.stringify(this.congesPeriodes));
        
        // Extraire les jours fériés manuels
        const feriesManuels = this.joursFeries.filter(date => 
            !JOURS_FERIES_MAROC_2026.includes(date)
        );
        localStorage.setItem('planning_feries_manuels', JSON.stringify(feriesManuels));
    }

    // =========================================================================
    // LOGIQUE DES CYCLES ET SHIFTS (INTÉGRÉE DE VOTRE PYTHON)
    // =========================================================================

    // Rotation 8 jours pour groupes A-D - EXACTEMENT comme Python
    cycleStandard8Jours(jourCycle) {
        const cycle = ['1', '1', '2', '2', '3', '3', 'R', 'R'];
        return cycle[jourCycle % 8];
    }

    // Décalage par groupe - EXACTEMENT comme Python
    getDecalageGroupe(codeGroupe) {
        switch(codeGroupe.toUpperCase()) {
            case 'A': return 0;
            case 'B': return 2;
            case 'C': return 4;
            case 'D': return 6;
            default: return 0;
        }
    }

    // Cycle spécial groupe E (5/7) - ADAPTÉ DE VOTRE PYTHON
    cycleGroupeE(dateStr, codeAgent) {
        const dateObj = new Date(dateStr);
        const jourSemaine = dateObj.getDay(); // 0=Dimanche, 1=Lundi...
        
        // Weekend = repos (Samedi et Dimanche)
        if (jourSemaine === 0 || jourSemaine === 6) {
            return 'R';
        }
        
        // Filtrer les agents du groupe E actifs
        const agentsGroupeE = this.agents.filter(a => 
            a.groupe === 'E' && a.statut === 'actif'
        ).sort((a, b) => a.code.localeCompare(b.code));
        
        const indexAgent = agentsGroupeE.findIndex(a => a.code === codeAgent);
        
        if (indexAgent === -1) return 'R';
        
        // Calcul du numéro de semaine ISO (comme Python .isocalendar()[1])
        const numSemaine = this.getWeekNumberISO(dateObj);
        const jourPair = (jourSemaine % 2 === 0); // Lundi=1 (impair), Mardi=2 (pair)
        
        // Agent 1 (index 0) : S1 dominant les semaines impaires
        if (indexAgent === 0) {
            if (numSemaine % 2 !== 0) { // Semaine impaire
                return jourPair ? '1' : '2';
            } else { // Semaine paire
                return jourPair ? '2' : '1';
            }
        }
        
        // Agent 2 (index 1) : S2 dominant les semaines impaires
        if (indexAgent === 1) {
            if (numSemaine % 2 !== 0) { // Semaine impaire
                return jourPair ? '2' : '1';
            } else { // Semaine paire
                return jourPair ? '1' : '2';
            }
        }
        
        // Pour les autres agents du groupe E
        return (indexAgent + numSemaine) % 2 === 0 ? '1' : '2';
    }

    // Numéro de semaine ISO (comme Python)
    getWeekNumberISO(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    // Calcul du shift théorique - ADAPTÉ DE VOTRE PYTHON
    getShiftTheorique(codeAgent, dateStr) {
        const agent = this.agents.find(a => a.code === codeAgent);
        if (!agent) return '-';
        
        const date = new Date(dateStr);
        const dateEntree = new Date(agent.date_entree || DATE_AFFECTATION_BASE);
        
        // Vérifier si agent est sorti
        if (agent.date_sortie && date >= new Date(agent.date_sortie)) {
            return '-';
        }
        
        // Vérifier si avant la date d'entrée
        if (date < dateEntree) {
            return '-';
        }
        
        // Groupe E spécial
        if (agent.groupe === 'E') {
            return this.cycleGroupeE(dateStr, codeAgent);
        }
        
        // Groupes A-D : rotation 8 jours avec décalage
        if (['A', 'B', 'C', 'D'].includes(agent.groupe)) {
            const deltaJours = Math.floor((date - dateEntree) / (1000 * 60 * 60 * 24));
            const decalage = this.getDecalageGroupe(agent.groupe);
            const jourCycleDecale = deltaJours + decalage;
            return this.cycleStandard8Jours(jourCycleDecale);
        }
        
        return 'R';
    }

    // =========================================================================
    // GESTION DES CONGÉS PAR PÉRIODE (INTÉGRÉE DE VOTRE PYTHON)
    // =========================================================================

    ajouterCongePeriode(codeAgent, dateDebut, dateFin) {
        const conge = {
            code_agent: codeAgent.toUpperCase(),
            date_debut: dateDebut,
            date_fin: dateFin,
            date_creation: new Date().toISOString().split('T')[0]
        };
        
        // Vérifier que l'agent existe et est actif
        const agent = this.agents.find(a => 
            a.code === codeAgent.toUpperCase() && a.statut === 'actif'
        );
        
        if (!agent) {
            alert(`❌ Agent ${codeAgent} non trouvé ou inactif.`);
            return false;
        }
        
        if (new Date(dateDebut) > new Date(dateFin)) {
            alert('❌ La date de début doit être avant la date de fin.');
            return false;
        }
        
        this.congesPeriodes.push(conge);
        
        // Appliquer les congés jour par jour
        const dateDebutObj = new Date(dateDebut);
        const dateFinObj = new Date(dateFin);
        let joursConges = 0;
        
        for (let d = new Date(dateDebutObj); d <= dateFinObj; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const jourSemaine = d.getDay();
            
            if (jourSemaine === 0) { // Dimanche = repos
                this.planning[`${codeAgent}_${dateStr}`] = 'R';
            } else {
                this.planning[`${codeAgent}_${dateStr}`] = 'C';
                joursConges++;
            }
        }
        
        this.saveData();
        
        alert(`✅ Congé enregistré pour ${codeAgent} du ${dateDebut} au ${dateFin}\n📅 ${joursConges} jour(s) de congé effectif(s) (hors dimanches)`);
        return true;
    }

    supprimerCongePeriode(codeAgent, dateDebut, dateFin) {
        // Supprimer la période
        this.congesPeriodes = this.congesPeriodes.filter(c => 
            !(c.code_agent === codeAgent && 
              c.date_debut === dateDebut && 
              c.date_fin === dateFin)
        );
        
        // Supprimer les shifts de congé dans la période
        const dateDebutObj = new Date(dateDebut);
        const dateFinObj = new Date(dateFin);
        
        for (let d = new Date(dateDebutObj); d <= dateFinObj; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            delete this.planning[`${codeAgent}_${dateStr}`];
        }
        
        this.saveData();
        
        alert(`✅ Congé supprimé pour ${codeAgent}\n🔄 Planning théorique rétabli`);
        return true;
    }

    estEnConge(codeAgent, dateStr) {
        return this.congesPeriodes.some(c => 
            c.code_agent === codeAgent && 
            dateStr >= c.date_debut && 
            dateStr <= c.date_fin
        );
    }

    listerCongesAgent(codeAgent) {
        const conges = this.congesPeriodes.filter(c => c.code_agent === codeAgent);
        
        if (conges.length === 0) {
            return `Aucun congé enregistré pour ${codeAgent}`;
        }
        
        let html = `<h4>Congés de ${codeAgent}</h4><ul>`;
        
        conges.forEach(conge => {
            const duree = Math.floor((new Date(conge.date_fin) - new Date(conge.date_debut)) / (1000*60*60*24)) + 1;
            html += `<li>${conge.date_debut} au ${conge.date_fin} (${duree} jours) - Créé le ${conge.date_creation}</li>`;
        });
        
        html += '</ul>';
        return html;
    }

    // =========================================================================
    // GESTION DES JOURS FÉRIÉS (MAROC + MANUELS)
    // =========================================================================

    estJourFerie(dateStr) {
        return this.joursFeries.includes(dateStr);
    }

    ajouterJourFerieManuel(dateStr, description) {
        if (!this.joursFeries.includes(dateStr)) {
            this.joursFeries.push(dateStr);
            this.saveData();
            alert(`✅ Jour férié ajouté: ${dateStr} (${description})`);
            return true;
        }
        return false;
    }

    supprimerJourFerieManuel(dateStr) {
        const index = this.joursFeries.findIndex(date => date === dateStr);
        if (index !== -1 && !JOURS_FERIES_MAROC_2026.includes(dateStr)) {
            this.joursFeries.splice(index, 1);
            this.saveData();
            alert(`✅ Jour férié ${dateStr} supprimé`);
            return true;
        }
        return false;
    }

    // =========================================================================
    // CALCUL DU SHIFT EFFECTIF (PRIORITÉS COMME VOTRE PYTHON)
    // =========================================================================

    getShiftEffectif(codeAgent, dateStr) {
        // 1. Vérifier d'abord dans le planning manuel
        const key = `${codeAgent}_${dateStr}`;
        if (this.planning[key]) {
            return this.planning[key];
        }
        
        // 2. Vérifier congés (dimanches restent en repos)
        if (this.estEnConge(codeAgent, dateStr)) {
            const date = new Date(dateStr);
            if (date.getDay() === 0) { // Dimanche
                this.planning[key] = 'R';
                this.saveData();
                return 'R';
            }
            this.planning[key] = 'C';
            this.saveData();
            return 'C';
        }
        
        // 3. Vérifier jour férié
        if (this.estJourFerie(dateStr)) {
            this.planning[key] = 'F';
            this.saveData();
            return 'F';
        }
        
        // 4. Calcul théorique
        const shift = this.getShiftTheorique(codeAgent, dateStr);
        this.planning[key] = shift;
        this.saveData();
        return shift;
    }

    // =========================================================================
    // GESTION DES AGENTS (AVEC DATE FIXE COMME VOTRE PYTHON)
    // =========================================================================

    ajouterAgent(code, nom, prenom, groupe) {
        const nouvelAgent = {
            code: code.toUpperCase(),
            nom: nom,
            prenom: prenom,
            groupe: groupe.toUpperCase(),
            date_entree: DATE_AFFECTATION_BASE, // DATE FIXE
            date_sortie: null,
            statut: 'actif'
        };
        
        if (!['A', 'B', 'C', 'D', 'E'].includes(nouvelAgent.groupe)) {
            alert("❌ Code de groupe invalide. Utilisez A, B, C, D ou E.");
            return null;
        }
        
        // Vérifier si existe déjà
        const index = this.agents.findIndex(a => a.code === nouvelAgent.code);
        if (index !== -1) {
            this.agents[index] = nouvelAgent;
        } else {
            this.agents.push(nouvelAgent);
        }
        
        this.saveData();
        return nouvelAgent;
    }

    modifierAgent(codeAgent, nom, prenom, groupe) {
        const index = this.agents.findIndex(a => a.code === codeAgent.toUpperCase());
        
        if (index === -1) {
            alert(`❌ Agent ${codeAgent} non trouvé.`);
            return false;
        }
        
        if (groupe && !['A', 'B', 'C', 'D', 'E'].includes(groupe.toUpperCase())) {
            alert("❌ Code de groupe invalide.");
            return false;
        }
        
        const ancienGroupe = this.agents[index].groupe;
        const ancienneDateEntree = this.agents[index].date_entree;
        
        if (nom) this.agents[index].nom = nom;
        if (prenom) this.agents[index].prenom = prenom;
        if (groupe) this.agents[index].groupe = groupe.toUpperCase();
        
        // Si groupe ou date d'entrée changent, effacer planning théorique
        if (groupe && groupe.toUpperCase() !== ancienGroupe) {
            this.effacerPlanningTheoriqueAgent(codeAgent);
        }
        
        this.saveData();
        return true;
    }

    effacerPlanningTheoriqueAgent(codeAgent) {
        Object.keys(this.planning).forEach(key => {
            if (key.startsWith(`${codeAgent}_`) && 
                !this.congesPeriodes.some(c => {
                    const date = key.split('_')[1];
                    return date >= c.date_debut && date <= c.date_fin;
                })) {
                delete this.planning[key];
            }
        });
        this.saveData();
    }

    supprimerAgent(codeAgent) {
        const agent = this.agents.find(a => a.code === codeAgent.toUpperCase());
        if (agent) {
            agent.date_sortie = new Date().toISOString().split('T')[0];
            agent.statut = 'inactif';
            
            // Effacer planning futur
            const aujourdhui = new Date();
            aujourdhui.setDate(aujourdhui.getDate() + 1); // À partir de demain
            const dateFutur = aujourdhui.toISOString().split('T')[0];
            
            Object.keys(this.planning).forEach(key => {
                if (key.startsWith(`${codeAgent}_`)) {
                    const date = key.split('_')[1];
                    if (date >= dateFutur) {
                        delete this.planning[key];
                    }
                }
            });
            
            this.saveData();
            return true;
        }
        return false;
    }

    // =========================================================================
    // CALCUL DES STATISTIQUES (CORRECT POUR GROUPE E)
    // =========================================================================

    calculerStatistiquesAgent(codeAgent, mois, annee) {
        const agent = this.agents.find(a => a.code === codeAgent);
        if (!agent) return null;
        
        const joursMois = new Date(annee, mois, 0).getDate();
        const stats = {
            '1': 0, '2': 0, '3': 0, 'R': 0, 
            'C': 0, 'M': 0, 'A': 0, 'F': 0, '-': 0
        };
        
        let feriesTravailles = 0;
        let totalShiftsEffectues = 0;
        
        for (let jour = 1; jour <= joursMois; jour++) {
            const dateStr = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
            const shift = this.getShiftEffectif(codeAgent, dateStr);
            
            if (stats[shift] !== undefined) {
                stats[shift] += 1;
                
                if (['1', '2', '3'].includes(shift)) {
                    totalShiftsEffectues += 1;
                    
                    // CORRECTION IMPORTANTE : Logique différente pour groupe E
                    if (this.estJourFerie(dateStr)) {
                        feriesTravailles += 1;
                    }
                }
            }
        }
        
        // CALCUL CORRECT SELON LE GROUPE (comme votre Python)
        let totalOperationnels;
        if (agent.groupe === 'E') {
            // Pour le groupe E : total = shifts normaux (incluent déjà les fériés)
            totalOperationnels = totalShiftsEffectues;
        } else {
            // Pour les autres groupes : total = shifts normaux + fériés (crédit prime)
            totalOperationnels = totalShiftsEffectues + feriesTravailles;
        }
        
        return {
            stats: stats,
            feries_travailles: feriesTravailles,
            total_shifts: totalShiftsEffectues,
            total_operationnels: totalOperationnels,
            groupe: agent.groupe
        };
    }

    // =========================================================================
    // NOUVELLES FONCTIONS : TOTAL JOURS TRAVAILLÉS
    // =========================================================================

    calculerJoursTravaillesAgent(codeAgent, mois, annee) {
        const joursMois = new Date(annee, mois, 0).getDate();
        let joursTravailles = 0;
        
        for (let jour = 1; jour <= joursMois; jour++) {
            const dateStr = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
            const shift = this.getShiftEffectif(codeAgent, dateStr);
            
            if (['1', '2', '3'].includes(shift)) {
                joursTravailles += 1;
            }
        }
        
        return joursTravailles;
    }

    calculerTotalJoursTravaillesGroupe(groupe, mois, annee) {
        const agentsGroupe = this.agents.filter(a => 
            a.groupe === groupe && a.statut === 'actif'
        );
        
        let total = 0;
        agentsGroupe.forEach(agent => {
            total += this.calculerJoursTravaillesAgent(agent.code, mois, annee);
        });
        
        return {
            groupe: groupe,
            total_jours: total,
            nombre_agents: agentsGroupe.length,
            moyenne: agentsGroupe.length > 0 ? (total / agentsGroupe.length).toFixed(1) : 0
        };
    }

    // =========================================================================
    // GESTION DES ABSENCES ET MODIFICATIONS PONCTUELLES
    // =========================================================================

    enregistrerAbsence(codeAgent, dateStr, typeAbsence) {
        if (!['C', 'M', 'A'].includes(typeAbsence.toUpperCase())) {
            alert("❌ Type d'absence invalide. Utilisez C (Congé), M (Maladie) ou A (Autre).");
            return false;
        }
        
        const agent = this.agents.find(a => 
            a.code === codeAgent.toUpperCase() && a.statut === 'actif'
        );
        
        if (!agent) {
            alert(`❌ Agent ${codeAgent} non trouvé ou inactif.`);
            return false;
        }
        
        this.planning[`${codeAgent}_${dateStr}`] = typeAbsence.toUpperCase();
        this.saveData();
        
        alert(`✅ Absence (${typeAbsence}) enregistrée pour ${codeAgent} le ${dateStr}`);
        return true;
    }

    modifierShiftPonctuel(codeAgent, dateStr, nouveauShift) {
        if (!['1', '2', '3', 'R', 'C', 'M', 'A'].includes(nouveauShift)) {
            alert("❌ Shift invalide. Utilisez 1, 2, 3, R, C, M, ou A.");
            return false;
        }
        
        const agent = this.agents.find(a => 
            a.code === codeAgent.toUpperCase() && a.statut === 'actif'
        );
        
        if (!agent) {
            alert(`❌ Agent ${codeAgent} non trouvé ou inactif.`);
            return false;
        }
        
        this.planning[`${codeAgent}_${dateStr}`] = nouveauShift;
        this.saveData();
        
        alert(`✅ Shift de ${codeAgent} modifié en '${nouveauShift}' pour le ${dateStr}`);
        return true;
    }

    echangerShifts(codeAgentA, codeAgentB, dateStr) {
        const shiftA = this.getShiftEffectif(codeAgentA, dateStr);
        const shiftB = this.getShiftEffectif(codeAgentB, dateStr);
        
        if (shiftA === '-' || shiftB === '-') {
            alert("❌ L'un des agents n'est pas planifié à cette date.");
            return false;
        }
        
        if (shiftA === shiftB) {
            alert("⚠️ Les deux agents ont déjà le même shift.");
            return false;
        }
        
        this.planning[`${codeAgentA}_${dateStr}`] = shiftB;
        this.planning[`${codeAgentB}_${dateStr}`] = shiftA;
        this.saveData();
        
        alert(`✅ Échange réussi: ${codeAgentA} → ${shiftB}, ${codeAgentB} → ${shiftA} le ${dateStr}`);
        return true;
    }

    // =========================================================================
    // CALCUL DU PLANNING MENSUEL
    // =========================================================================

    calculerPlanningMensuel(mois, annee, groupeFiltre = 'all') {
        const joursMois = new Date(annee, mois, 0).getDate();
        const agentsFiltres = groupeFiltre === 'all' 
            ? this.agents.filter(a => a.statut === 'actif')
            : this.agents.filter(a => a.groupe === groupeFiltre && a.statut === 'actif');
        
        const planning = {
            mois: mois,
            annee: annee,
            jours: [],
            agents: []
        };
        
        // Générer les jours
        for (let jour = 1; jour <= joursMois; jour++) {
            const date = new Date(annee, mois - 1, jour);
            const dateStr = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
            
            planning.jours.push({
                numero: jour,
                date: dateStr,
                jour_semaine: JOURS_FRANCAIS[date.getDay()],
                ferie: this.estJourFerie(dateStr)
            });
        }
        
        // Générer les shifts pour chaque agent
        agentsFiltres.forEach(agent => {
            const agentPlanning = {
                code: agent.code,
                nom_complet: `${agent.nom} ${agent.prenom}`,
                groupe: agent.groupe,
                shifts: []
            };
            
            for (let jour = 1; jour <= joursMois; jour++) {
                const dateStr = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
                const shift = this.getShiftEffectif(agent.code, dateStr);
                agentPlanning.shifts.push(shift);
            }
            
            planning.agents.push(agentPlanning);
        });
        
        return planning;
    }

    // =========================================================================
    // INTERFACE UTILISATEUR AMÉLIORÉE
    // =========================================================================

    setupEventListeners() {
        // Onglets
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });
        
        // Planning filters
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const groupeSelect = document.getElementById('groupe-select');
        
        if (monthSelect) monthSelect.addEventListener('change', () => this.afficherPlanning());
        if (yearSelect) yearSelect.addEventListener('change', () => this.afficherPlanning());
        if (groupeSelect) groupeSelect.addEventListener('change', () => this.afficherPlanning());
        
        // Formulaire agent
        const agentForm = document.getElementById('agent-form');
        if (agentForm) {
            agentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.ajouterAgentViaFormulaire();
            });
        }
        
        // Formulaire congé
        const congeForm = document.getElementById('conge-form');
        if (congeForm) {
            congeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.ajouterCongeViaFormulaire();
            });
        }
        
        // Initialisation
        document.addEventListener('DOMContentLoaded', () => {
            this.showTab('dashboard');
            this.afficherDashboard();
            this.afficherPlanning();
        });
    }

    showTab(tabName) {
        // Cacher tous les onglets
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Désactiver tous les boutons
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
        
        // Charger les données
        switch(tabName) {
            case 'dashboard':
                this.afficherDashboard();
                break;
            case 'planning':
                this.afficherPlanning();
                break;
            case 'agents':
                this.afficherListeAgents();
                break;
            case 'conges':
                this.afficherGestionConges();
                break;
            case 'stats':
                this.afficherStatistiques();
                break;
            case 'feries':
                this.afficherJoursFeries();
                break;
        }
    }

    afficherDashboard() {
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        const aujourdhui = new Date().toISOString().split('T')[0];
        
        let presentsAujourdhui = 0;
        agentsActifs.forEach(agent => {
            const shift = this.getShiftEffectif(agent.code, aujourdhui);
            if (['1', '2', '3'].includes(shift)) {
                presentsAujourdhui++;
            }
        });
        
        const groupesStats = {};
        agentsActifs.forEach(agent => {
            groupesStats[agent.groupe] = (groupesStats[agent.groupe] || 0) + 1;
        });
        
        const groupesUniques = Object.keys(groupesStats).length;
        
        document.getElementById('total-agents').textContent = agentsActifs.length;
        document.getElementById('present-today').textContent = presentsAujourdhui;
        document.getElementById('total-groupes').textContent = groupesUniques;
        document.getElementById('en-service').textContent = agentsActifs.length;
        
        // Afficher les stats par groupe
        const groupesContainer = document.getElementById('groupes-stats');
        if (groupesContainer) {
            let html = '';
            for (const [groupe, count] of Object.entries(groupesStats)) {
                const couleur = this.getGroupeColor(groupe);
                html += `
                    <div style="background: ${couleur}; color: white; padding: 8px 12px; border-radius: 8px; margin: 5px; display: inline-block;">
                        G${groupe}: ${count}
                    </div>
                `;
            }
            groupesContainer.innerHTML = html;
        }
    }

    afficherPlanning() {
        const mois = parseInt(document.getElementById('month-select')?.value || new Date().getMonth() + 1);
        const annee = parseInt(document.getElementById('year-select')?.value || 2026);
        const groupeFiltre = document.getElementById('groupe-select')?.value || 'all';
        
        const planning = this.calculerPlanningMensuel(mois, annee, groupeFiltre);
        const container = document.getElementById('planning-result');
        
        if (!container) return;
        
        if (planning.agents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3>📊 Planning ${mois}/${annee}</h3>
                    <p>Aucun agent dans ce groupe</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div style="margin-bottom: 20px;">
                <h3>📊 Planning ${mois}/${annee} ${groupeFiltre !== 'all' ? `- Groupe ${groupeFiltre}` : ''}</h3>
            </div>
            <div style="overflow-x: auto;">
                <table class="planning-table">
                    <thead>
                        <tr>
                            <th style="min-width: 150px; position: sticky; left: 0; background: #f8fafc;">Agent / Groupe</th>
        `;
        
        // En-têtes des jours
        planning.jours.forEach(jour => {
            const estDimanche = new Date(jour.date).getDay() === 0;
            const estFerie = jour.ferie;
            let style = estDimanche ? 'background: #fef2f2; color: #dc2626;' : '';
            style += estFerie ? 'background: #fffbeb; color: #d97706;' : '';
            
            html += `<th style="${style} min-width: 50px; font-size: 12px;">
                <div>${jour.numero}</div>
                <div><small>${jour.jour_semaine}</small></div>
                ${estFerie ? '<div style="font-size: 8px; color: #d97706;">FÉRIÉ</div>' : ''}
            </th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        // Lignes des agents
        planning.agents.forEach(agent => {
            const groupeColor = this.getGroupeColor(agent.groupe);
            
            html += `
                <tr>
                    <td style="text-align: left; padding-left: 15px; background: #f8fafc; position: sticky; left: 0;">
                        <div style="font-weight: 700;">${agent.code}</div>
                        <div style="font-size: 12px; color: #64748b;">${agent.nom_complet}</div>
                        <span style="background: ${groupeColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">
                            G ${agent.groupe}
                        </span>
                    </td>
            `;
            
            agent.shifts.forEach((shift, index) => {
                const jourInfo = planning.jours[index];
                const estDimanche = new Date(jourInfo.date).getDay() === 0;
                const estFerie = jourInfo.ferie;
                let style = estDimanche ? 'background: #fef2f2;' : '';
                style += estFerie ? 'background: #fffbeb;' : '';
                const shiftClass = `shift-${shift}`;
                
                html += `
                    <td style="${style}">
                        <span class="shift-badge ${shiftClass}" title="${jourInfo.date}">
                            ${shift === 'F' ? '🎉' : ''}${shift}
                        </span>
                    </td>
                `;
            });
            
            html += '</tr>';
        });
        
        // Légende
        html += `
            </tbody>
            </table>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                <h4>Légende:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    <span class="shift-badge shift-1">1 - Matin</span>
                    <span class="shift-badge shift-2">2 - Après-midi</span>
                    <span class="shift-badge shift-3">3 - Nuit</span>
                    <span class="shift-badge shift-R">R - Repos</span>
                    <span class="shift-badge shift-C">C - Congé</span>
                    <span class="shift-badge shift-F">F - Férié</span>
                    <span class="shift-badge shift-M">M - Maladie</span>
                    <span class="shift-badge shift-A">A - Autre</span>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    afficherListeAgents() {
        const container = document.getElementById('agents-list');
        if (!container) return;
        
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        
        if (agentsActifs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <p>Aucun agent enregistré</p>
                </div>
            `;
            return;
        }
        
        let html = '<div style="display: grid; gap: 12px;">';
        
        agentsActifs.forEach(agent => {
            const groupeColor = this.getGroupeColor(agent.groupe);
            
            html += `
                <div style="background: white; border-radius: 12px; padding: 16px; border: 2px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="font-size: 18px; color: #1e293b;">${agent.code}</strong>
                        <span style="background: ${groupeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            Groupe ${agent.groupe}
                        </span>
                    </div>
                    <div style="font-size: 16px; color: #1e293b; font-weight: 500;">
                        ${agent.nom} ${agent.prenom}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                        <div>📅 Entré le: ${agent.date_entree}</div>
                        ${agent.date_sortie ? `<div style="color: #ef4444;">🚪 Sorti le: ${agent.date_sortie}</div>` : ''}
                    </div>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button onclick="app.afficherStatsAgent('${agent.code}')" 
                                style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; cursor: pointer;">
                            📊 Stats
                        </button>
                        <button onclick="app.listerConges('${agent.code}')" 
                                style="background: #10b981; color: white; padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; cursor: pointer;">
                            📅 Congés
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    afficherGestionConges() {
        const container = document.getElementById('conges-tab');
        if (!container) return;
        
        const html = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3>📅 Gestion des Congés par Période</h3>
                
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4>Ajouter un Congé</h4>
                    <form id="conge-form">
                        <div style="display: grid; gap: 15px; grid-template-columns: 1fr 1fr 1fr;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Code Agent:</label>
                                <select id="conge-agent" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <option value="">Sélectionner un agent</option>
                                    ${this.agents.filter(a => a.statut === 'actif').map(agent => 
                                        `<option value="${agent.code}">${agent.code} - ${agent.nom} ${agent.prenom} (G${agent.groupe})</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Date Début:</label>
                                <input type="date" id="conge-debut" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Date Fin:</label>
                                <input type="date" id="conge-fin" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                        </div>
                        <button type="submit" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin-top: 15px; cursor: pointer;">
                            ✅ Ajouter le Congé
                        </button>
                    </form>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 12px;">
                    <h4>Congés enregistrés</h4>
                    <div id="liste-conges">
                        ${this.afficherListeConges()}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Ajouter l'event listener pour le formulaire
        const form = document.getElementById('conge-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.ajouterCongeViaFormulaire();
            });
        }
    }

    afficherListeConges() {
        if (this.congesPeriodes.length === 0) {
            return '<p style="color: #64748b; text-align: center;">Aucun congé enregistré</p>';
        }
        
        let html = '<div style="display: grid; gap: 10px;">';
        
        this.congesPeriodes.forEach((conge, index) => {
            const agent = this.agents.find(a => a.code === conge.code_agent);
            const duree = Math.floor((new Date(conge.date_fin) - new Date(conge.date_debut)) / (1000*60*60*24)) + 1;
            
            html += `
                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${conge.code_agent}</strong>
                            ${agent ? ` - ${agent.nom} ${agent.prenom}` : ''}
                        </div>
                        <button onclick="app.supprimerCongeViaFormulaire(${index})" 
                                style="background: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                            ❌ Supprimer
                        </button>
                    </div>
                    <div style="font-size: 14px; color: #64748b; margin-top: 5px;">
                        📅 ${conge.date_debut} au ${conge.date_fin} (${duree} jours)
                    </div>
                    <div style="font-size: 12px; color: #94a3b8;">
                        Créé le: ${conge.date_creation}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    ajouterCongeViaFormulaire() {
        const codeAgent = document.getElementById('conge-agent')?.value;
        const dateDebut = document.getElementById('conge-debut')?.value;
        const dateFin = document.getElementById('conge-fin')?.value;
        
        if (!codeAgent || !dateDebut || !dateFin) {
            alert('Tous les champs sont obligatoires');
            return;
        }
        
        if (this.ajouterCongePeriode(codeAgent, dateDebut, dateFin)) {
            // Réinitialiser le formulaire
            document.getElementById('conge-agent').value = '';
            document.getElementById('conge-debut').value = '';
            document.getElementById('conge-fin').value = '';
            
            // Mettre à jour l'affichage
            this.afficherGestionConges();
        }
    }

    supprimerCongeViaFormulaire(index) {
        if (index >= 0 && index < this.congesPeriodes.length) {
            const conge = this.congesPeriodes[index];
            if (confirm(`Supprimer le congé de ${conge.code_agent} du ${conge.date_debut} au ${conge.date_fin} ?`)) {
                this.supprimerCongePeriode(conge.code_agent, conge.date_debut, conge.date_fin);
                this.afficherGestionConges();
            }
        }
    }

    afficherStatistiques() {
        const container = document.getElementById('stats-result');
        if (!container) return;
        
        const mois = parseInt(document.getElementById('month-select')?.value || new Date().getMonth() + 1);
        const annee = parseInt(document.getElementById('year-select')?.value || 2026);
        
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        
        let html = `
            <div style="max-width: 1000px; margin: 0 auto;">
                <h3>📈 Statistiques - ${mois}/${annee}</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        `;
        
        // Stats globales
        let totalOperationnelsGlobal = 0;
        let totalFeriesGlobal = 0;
        const statsGlobales = { '1': 0, '2': 0, '3': 0, 'R': 0, 'C': 0, 'M': 0, 'A': 0, 'F': 0, '-': 0 };
        
        agentsActifs.forEach(agent => {
            const stats = this.calculerStatistiquesAgent(agent.code, mois, annee);
            if (stats) {
                totalOperationnelsGlobal += stats.total_operationnels;
                totalFeriesGlobal += stats.feries_travailles;
                for (const key in stats.stats) {
                    statsGlobales[key] += stats.stats[key];
                }
            }
        });
        
        html += `
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 12px;">
                <h4 style="margin-top: 0;">📊 Statistiques Globales</h4>
                <div style="font-size: 32px; font-weight: 800; text-align: center; margin: 20px 0;">${totalOperationnelsGlobal}</div>
                <div style="text-align: center; font-size: 14px;">Total Shifts Opérationnels</div>
                <div style="margin-top: 15px; font-size: 14px;">
                    <div>🔹 Agents actifs: ${agentsActifs.length}</div>
                    <div>🔹 Jours fériés travaillés: ${totalFeriesGlobal}</div>
                    <div>🔹 Moyenne par agent: ${(totalOperationnelsGlobal / agentsActifs.length).toFixed(1)}</div>
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="margin-top: 0;">📋 Répartition des Shifts</h4>
                <div style="display: grid; gap: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Matin (1):</span>
                        <strong>${statsGlobales['1']}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Après-midi (2):</span>
                        <strong>${statsGlobales['2']}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Nuit (3):</span>
                        <strong>${statsGlobales['3']}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Repos (R):</span>
                        <strong>${statsGlobales['R']}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Congés (C):</span>
                        <strong>${statsGlobales['C']}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Fériés (F):</span>
                        <strong>${statsGlobales['F']}</strong>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h4>📊 Totaux par Groupe</h4>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
        `;
        
        // Stats par groupe
        ['A', 'B', 'C', 'D', 'E'].forEach(groupe => {
            const statsGroupe = this.calculerTotalJoursTravaillesGroupe(groupe, mois, annee);
            const couleur = this.getGroupeColor(groupe);
            
            html += `
                <div style="text-align: center; padding: 15px; background: ${couleur}10; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 800; color: ${couleur};">${statsGroupe.total_jours}</div>
                    <div style="font-size: 14px; color: #64748b;">Groupe ${groupe}</div>
                    <div style="font-size: 12px; color: #94a3b8;">${statsGroupe.nombre_agents} agents</div>
                </div>
            `;
        });
        
        html += `
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 12px;">
            <h4>👤 Statistiques par Agent</h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc;">
                            <th style="padding: 10px; text-align: left;">Agent</th>
                            <th style="padding: 10px; text-align: center;">Groupe</th>
                            <th style="padding: 10px; text-align: center;">Shifts</th>
                            <th style="padding: 10px; text-align: center;">Fériés</th>
                            <th style="padding: 10px; text-align: center;">Total CPA</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Liste détaillée par agent
        agentsActifs.forEach(agent => {
            const stats = this.calculerStatistiquesAgent(agent.code, mois, annee);
            if (stats) {
                const groupeColor = this.getGroupeColor(agent.groupe);
                
                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px;">
                            <strong>${agent.code}</strong><br>
                            <small style="color: #64748b;">${agent.nom} ${agent.prenom}</small>
                        </td>
                        <td style="padding: 10px; text-align: center;">
                            <span style="background: ${groupeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                G${agent.groupe}
                            </span>
                        </td>
                        <td style="padding: 10px; text-align: center;">
                            ${stats.total_shifts}
                        </td>
                        <td style="padding: 10px; text-align: center;">
                            ${stats.feries_travailles}
                        </td>
                        <td style="padding: 10px; text-align: center; font-weight: bold; color: #059669;">
                            ${stats.total_operationnels}
                        </td>
                    </tr>
                `;
            }
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;
        
        container.innerHTML = html;
    }

    afficherJoursFeries() {
        const container = document.getElementById('feries-tab');
        if (!container) return;
        
        let html = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3>🎉 Jours Fériés Maroc 2026</h3>
                
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4>Jours fériés fixes</h4>
                    <div style="display: grid; gap: 10px;">
        `;
        
        // Jours fériés fixes
        const feriesFixes = [
            { date: '2026-01-01', nom: 'Nouvel An' },
            { date: '2026-01-11', nom: 'Manifeste de l\'Indépendance' },
            { date: '2026-05-01', nom: 'Fête du Travail' },
            { date: '2026-07-30', nom: 'Fête du Trône' },
            { date: '2026-08-14', nom: 'Allégeance Oued Eddahab' },
            { date: '2026-08-20', nom: 'Révolution du Roi et du Peuple' },
            { date: '2026-08-21', nom: 'Fête de la Jeunesse' },
            { date: '2026-11-06', nom: 'Marche Verte' },
            { date: '2026-11-18', nom: 'Fête de l\'Indépendance' }
        ];
        
        feriesFixes.forEach(ferie => {
            const dateObj = new Date(ferie.date);
            const jourSemaine = JOURS_FRANCAIS[dateObj.getDay()];
            
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 6px;">
                    <div>
                        <strong>${ferie.date}</strong>
                        <div style="font-size: 14px; color: #64748b;">${jourSemaine} - ${ferie.nom}</div>
                    </div>
                    <span style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        FIXE
                    </span>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 12px;">
                    <h4>Ajouter un jour férié manuel</h4>
                    <div style="display: grid; gap: 15px; grid-template-columns: 1fr 1fr auto;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Date:</label>
                            <input type="date" id="ferie-date" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description:</label>
                            <input type="text" id="ferie-description" placeholder="Ex: Jour férié spécial" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button onclick="app.ajouterFerieManuel()" style="background: #f59e0b; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                                ➕ Ajouter
                            </button>
                        </div>
                    </div>
                    
                    <div id="feries-manuels" style="margin-top: 20px;">
                        ${this.afficherFeriesManuels()}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    afficherFeriesManuels() {
        const feriesManuels = this.joursFeries.filter(date => 
            !JOURS_FERIES_MAROC_2026.includes(date)
        );
        
        if (feriesManuels.length === 0) {
            return '<p style="color: #64748b; text-align: center; margin-top: 20px;">Aucun jour férié manuel ajouté</p>';
        }
        
        let html = '<h4 style="margin-top: 30px;">Jours fériés manuels ajoutés</h4><div style="display: grid; gap: 10px;">';
        
        feriesManuels.forEach(date => {
            const dateObj = new Date(date);
            const jourSemaine = JOURS_FRANCAIS[dateObj.getDay()];
            
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fef3c7; border-radius: 6px;">
                    <div>
                        <strong>${date}</strong>
                        <div style="font-size: 14px; color: #92400e;">${jourSemaine}</div>
                    </div>
                    <button onclick="app.supprimerFerieManuel('${date}')" 
                            style="background: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                        ❌ Supprimer
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    ajouterFerieManuel() {
        const date = document.getElementById('ferie-date')?.value;
        const description = document.getElementById('ferie-description')?.value;
        
        if (!date || !description) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        if (this.ajouterJourFerieManuel(date, description)) {
            // Réinitialiser les champs
            document.getElementById('ferie-date').value = '';
            document.getElementById('ferie-description').value = '';
            
            // Mettre à jour l'affichage
            this.afficherJoursFeries();
        }
    }

    supprimerFerieManuel(date) {
        if (confirm(`Supprimer le jour férié du ${date} ?`)) {
            if (this.supprimerJourFerieManuel(date)) {
                this.afficherJoursFeries();
            }
        }
    }

    // =========================================================================
    // FONCTIONS UTILITAIRES POUR L'INTERFACE
    // =========================================================================

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

    ajouterAgentViaFormulaire() {
        const code = document.getElementById('code-agent')?.value;
        const nom = document.getElementById('nom-agent')?.value;
        const prenom = document.getElementById('prenom-agent')?.value;
        const groupe = document.getElementById('groupe-agent')?.value;
        
        if (!code || !nom || !prenom || !groupe) {
            alert('Tous les champs sont obligatoires');
            return;
        }
        
        if (this.ajouterAgent(code, nom, prenom, groupe)) {
            // Réinitialiser le formulaire
            document.getElementById('code-agent').value = '';
            document.getElementById('nom-agent').value = '';
            document.getElementById('prenom-agent').value = '';
            document.getElementById('groupe-agent').value = '';
            
            alert(`✅ Agent ${code} ajouté avec succès !\nDate d'entrée: ${DATE_AFFECTATION_BASE}`);
            this.showTab('agents');
        }
    }

    afficherStatsAgent(codeAgent) {
        const mois = new Date().getMonth() + 1;
        const annee = new Date().getFullYear();
        
        const stats = this.calculerStatistiquesAgent(codeAgent, mois, annee);
        if (!stats) return;
        
        const agent = this.agents.find(a => a.code === codeAgent);
        
        let html = `
            <div style="background: white; padding: 20px; border-radius: 12px; max-width: 500px; margin: 0 auto;">
                <h3>📊 Statistiques de ${codeAgent}</h3>
                <p>${agent?.nom} ${agent?.prenom} - Groupe ${stats.groupe}</p>
                <p>Période: ${mois}/${annee}</p>
                
                <div style="margin-top: 20px;">
                    <div style="display: grid; gap: 10px;">
        `;
        
        // Afficher les statistiques
        const statsData = [
            ['Matin (1)', stats.stats['1']],
            ['Après-midi (2)', stats.stats['2']],
            ['Nuit (3)', stats.stats['3']],
            ['Repos (R)', stats.stats['R']],
            ['Congés (C)', stats.stats['C']],
            ['Fériés (F)', stats.stats['F']],
            ['Jours fériés travaillés', stats.feries_travailles],
            ['Total shifts effectués', stats.total_shifts],
            ['TOTAL CPA (Shifts opérationnels)', `<strong style="color: #059669;">${stats.total_operationnels}</strong>`]
        ];
        
        statsData.forEach(([label, value]) => {
            html += `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span>${label}:</span>
                    <span>${value}</span>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                <button onclick="this.parentElement.remove()" 
                        style="background: #64748b; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin-top: 20px; cursor: pointer;">
                    Fermer
                </button>
            </div>
        `;
        
        // Afficher dans une modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 1000;
        `;
        modal.innerHTML = html;
        document.body.appendChild(modal);
        
        // Fermer en cliquant en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    listerConges(codeAgent) {
        const html = this.listerCongesAgent(codeAgent);
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 1000;
        `;
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; max-width: 500px; margin: 20px;">
                ${html}
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #64748b; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin-top: 20px; cursor: pointer;">
                    Fermer
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('✅ Service Worker enregistré'))
                .catch(err => console.error('❌ Erreur Service Worker:', err));
        }
    }
}

// =========================================================================
// INITIALISATION DE L'APPLICATION
// =========================================================================

// Créer l'instance globale
window.app = new PlanningMetier();

// Exposer les fonctions globales pour les boutons HTML
window.showTab = (tabName) => window.app.showTab(tabName);
window.addAgent = () => window.app.ajouterAgentViaFormulaire();
window.addConge = () => window.app.ajouterCongeViaFormulaire();
window.deleteConge = (index) => window.app.supprimerCongeViaFormulaire(index);
window.exportToExcel = () => {
    alert('📊 Fonction d\'export Excel à implémenter');
    // À implémenter avec SheetJS ou autre bibliothèque
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.app.showTab('dashboard');
    window.app.afficherDashboard();
});

// =========================================================================
// CSS SUPPLEMENTAIRE POUR LES SHIFTS
// =========================================================================

const style = document.createElement('style');
style.textContent = `
    .shift-badge {
        display: inline-block;
        width: 30px;
        height: 30px;
        border-radius: 6px;
        text-align: center;
        line-height: 30px;
        font-weight: bold;
        font-size: 14px;
        color: white;
    }
    
    .shift-1 { background: #3b82f6; } /* Bleu - Matin */
    .shift-2 { background: #10b981; } /* Vert - Après-midi */
    .shift-3 { background: #8b5cf6; } /* Violet - Nuit */
    .shift-R { background: #64748b; } /* Gris - Repos */
    .shift-C { background: #f59e0b; } /* Orange - Congé */
    .shift-F { background: #d97706; } /* Orange foncé - Férié */
    .shift-M { background: #ef4444; } /* Rouge - Maladie */
    .shift-A { background: #94a3b8; } /* Gris clair - Autre */
    .shift-- { background: #f1f5f9; color: #64748b; border: 1px dashed #cbd5e1; }
    
    .planning-table {
        border-collapse: collapse;
        width: 100%;
        font-size: 12px;
    }
    
    .planning-table th {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 8px;
        text-align: center;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .planning-table td {
        border: 1px solid #e2e8f0;
        padding: 8px;
        text-align: center;
        vertical-align: middle;
    }
    
    .planning-table tr:hover {
        background: #f8fafc;
    }
    
    .nav-tab.active {
        background: #3b82f6;
        color: white;
    }
    
    .tab-content {
        display: none;
        padding: 20px;
        background: #f8fafc;
        border-radius: 12px;
        margin-top: 20px;
    }
    
    .tab-content.active {
        display: block;
    }
`;
document.head.appendChild(style);

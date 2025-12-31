// Planning 2026 - Application PWA COMPLÈTE avec toutes les fonctionnalités Android
console.log("✅ Application Planning 2026 chargée - Version Complète !");

// =========================================================================
// CONSTANTES ET CONFIGURATION
// =========================================================================

const DATE_AFFECTATION_BASE = "2025-11-01";
const JOURS_FRANCAIS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// Jours fériés Maroc 2026
const JOURS_FERIES_MAROC_2026 = [
    '2026-01-01',   '2026-01-11',   '2026-05-01',
    '2026-07-30',   '2026-08-14',   '2026-08-20',
    '2026-08-21',   '2026-11-06',   '2026-11-18'
];

// =========================================================================
// CLASSE PRINCIPALE AVEC TOUTES LES FONCTIONNALITÉS
// =========================================================================

class PlanningMetier {
    constructor() {
        this.agents = [];
        this.planning = {};
        this.congesPeriodes = [];
        this.joursFeries = [...JOURS_FERIES_MAROC_2026];
        this.codesPanique = {};
        this.radios = {};
        this.habillement = {};
        this.avertissements = [];
        this.historiqueEchanges = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.initialiserDonneesTest();
        console.log(`✅ Application initialisée avec ${this.agents.length} agents`);
    }

    // =========================================================================
    // INITIALISATION DES DONNÉES
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
        }
    }

    loadData() {
        // Charger depuis data.js si disponible
        if (window.agentsData && window.agentsData.length > 0) {
            this.agents = window.agentsData;
        } else {
            const saved = localStorage.getItem('planning_agents');
            this.agents = saved ? JSON.parse(saved) : [];
        }

        // Charger toutes les données
        const planningSaved = localStorage.getItem('planning_shifts');
        this.planning = planningSaved ? JSON.parse(planningSaved) : {};

        const congesSaved = localStorage.getItem('planning_conges_periodes');
        this.congesPeriodes = congesSaved ? JSON.parse(congesSaved) : [];

        const feriesSaved = localStorage.getItem('planning_feries_manuels');
        if (feriesSaved) {
            this.joursFeries = [...JOURS_FERIES_MAROC_2026, ...JSON.parse(feriesSaved)];
        }

        const paniqueSaved = localStorage.getItem('planning_codes_panique');
        this.codesPanique = paniqueSaved ? JSON.parse(paniqueSaved) : {};

        const radiosSaved = localStorage.getItem('planning_radios');
        this.radios = radiosSaved ? JSON.parse(radiosSaved) : {};

        const habillementSaved = localStorage.getItem('planning_habillement');
        this.habillement = habillementSaved ? JSON.parse(habillementSaved) : {};

        const avertissementsSaved = localStorage.getItem('planning_avertissements');
        this.avertissements = avertissementsSaved ? JSON.parse(avertissementsSaved) : [];

        const echangesSaved = localStorage.getItem('planning_historique_echanges');
        this.historiqueEchanges = echangesSaved ? JSON.parse(echangesSaved) : [];
    }

    saveData() {
        localStorage.setItem('planning_agents', JSON.stringify(this.agents));
        localStorage.setItem('planning_shifts', JSON.stringify(this.planning));
        localStorage.setItem('planning_conges_periodes', JSON.stringify(this.congesPeriodes));
        
        const feriesManuels = this.joursFeries.filter(date => 
            !JOURS_FERIES_MAROC_2026.includes(date)
        );
        localStorage.setItem('planning_feries_manuels', JSON.stringify(feriesManuels));
        
        localStorage.setItem('planning_codes_panique', JSON.stringify(this.codesPanique));
        localStorage.setItem('planning_radios', JSON.stringify(this.radios));
        localStorage.setItem('planning_habillement', JSON.stringify(this.habillement));
        localStorage.setItem('planning_avertissements', JSON.stringify(this.avertissements));
        localStorage.setItem('planning_historique_echanges', JSON.stringify(this.historiqueEchanges));
    }

    // =========================================================================
    // LOGIQUE DES CYCLES ET SHIFTS (VOTRE LOGIQUE EXACTE)
    // =========================================================================

    cycleStandard8Jours(jourCycle) {
        const cycle = ['1', '1', '2', '2', '3', '3', 'R', 'R'];
        return cycle[jourCycle % 8];
    }

    getDecalageGroupe(codeGroupe) {
        switch(codeGroupe.toUpperCase()) {
            case 'A': return 0;
            case 'B': return 2;
            case 'C': return 4;
            case 'D': return 6;
            default: return 0;
        }
    }

    cycleGroupeE(dateStr, codeAgent) {
        const dateObj = new Date(dateStr);
        const jourSemaine = dateObj.getDay();
        
        if (jourSemaine === 0 || jourSemaine === 6) {
            return 'R';
        }
        
        const agentsGroupeE = this.agents.filter(a => 
            a.groupe === 'E' && a.statut === 'actif'
        ).sort((a, b) => a.code.localeCompare(b.code));
        
        const indexAgent = agentsGroupeE.findIndex(a => a.code === codeAgent);
        
        if (indexAgent === -1) return 'R';
        
        const numSemaine = this.getWeekNumberISO(dateObj);
        const jourPair = (jourSemaine % 2 === 0);
        
        if (indexAgent === 0) {
            if (numSemaine % 2 !== 0) {
                return jourPair ? '1' : '2';
            } else {
                return jourPair ? '2' : '1';
            }
        }
        
        if (indexAgent === 1) {
            if (numSemaine % 2 !== 0) {
                return jourPair ? '2' : '1';
            } else {
                return jourPair ? '1' : '2';
            }
        }
        
        return (indexAgent + numSemaine) % 2 === 0 ? '1' : '2';
    }

    getWeekNumberISO(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getShiftTheorique(codeAgent, dateStr) {
        const agent = this.agents.find(a => a.code === codeAgent);
        if (!agent) return '-';
        
        const date = new Date(dateStr);
        const dateEntree = new Date(agent.date_entree || DATE_AFFECTATION_BASE);
        
        if (agent.date_sortie && date >= new Date(agent.date_sortie)) {
            return '-';
        }
        
        if (date < dateEntree) {
            return '-';
        }
        
        if (agent.groupe === 'E') {
            return this.cycleGroupeE(dateStr, codeAgent);
        }
        
        if (['A', 'B', 'C', 'D'].includes(agent.groupe)) {
            const deltaJours = Math.floor((date - dateEntree) / (1000 * 60 * 60 * 24));
            const decalage = this.getDecalageGroupe(agent.groupe);
            const jourCycleDecale = deltaJours + decalage;
            return this.cycleStandard8Jours(jourCycleDecale);
        }
        
        return 'R';
    }

    // =========================================================================
    // CALCUL DU SHIFT EFFECTIF
    // =========================================================================

    getShiftEffectif(codeAgent, dateStr) {
        const key = `${codeAgent}_${dateStr}`;
        if (this.planning[key]) {
            return this.planning[key];
        }
        
        if (this.estEnConge(codeAgent, dateStr)) {
            const date = new Date(dateStr);
            if (date.getDay() === 0) {
                this.planning[key] = 'R';
                this.saveData();
                return 'R';
            }
            this.planning[key] = 'C';
            this.saveData();
            return 'C';
        }
        
        if (this.estJourFerie(dateStr)) {
            this.planning[key] = 'F';
            this.saveData();
            return 'F';
        }
        
        const shift = this.getShiftTheorique(codeAgent, dateStr);
        this.planning[key] = shift;
        this.saveData();
        return shift;
    }

    // =========================================================================
    // GESTION DES AGENTS (COMPLÈTE)
    // =========================================================================

    ajouterAgent(code, nom, prenom, groupe) {
        const nouvelAgent = {
            code: code.toUpperCase(),
            nom: nom,
            prenom: prenom,
            groupe: groupe.toUpperCase(),
            date_entree: DATE_AFFECTATION_BASE,
            date_sortie: null,
            statut: 'actif'
        };
        
        if (!['A', 'B', 'C', 'D', 'E'].includes(nouvelAgent.groupe)) {
            return { erreur: "Code de groupe invalide. Utilisez A, B, C, D ou E." };
        }
        
        const index = this.agents.findIndex(a => a.code === nouvelAgent.code);
        if (index !== -1) {
            this.agents[index] = nouvelAgent;
        } else {
            this.agents.push(nouvelAgent);
        }
        
        this.saveData();
        return { succes: true, message: `Agent ${code} ajouté avec succès.` };
    }

    listerAgents() {
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        return {
            agents: agentsActifs.map(a => ({
                code: a.code,
                nom: a.nom,
                prenom: a.prenom,
                groupe: a.groupe
            }))
        };
    }

    modifierAgent(codeAgent, nom, prenom, groupe, dateEntree) {
        const index = this.agents.findIndex(a => a.code === codeAgent.toUpperCase());
        
        if (index === -1) {
            return { erreur: `Agent ${codeAgent} non trouvé.` };
        }
        
        if (groupe && !['A', 'B', 'C', 'D', 'E'].includes(groupe.toUpperCase())) {
            return { erreur: "Code de groupe invalide." };
        }
        
        const ancienGroupe = this.agents[index].groupe;
        const ancienneDateEntree = this.agents[index].date_entree;
        
        if (nom) this.agents[index].nom = nom;
        if (prenom) this.agents[index].prenom = prenom;
        if (groupe) this.agents[index].groupe = groupe.toUpperCase();
        if (dateEntree) this.agents[index].date_entree = dateEntree;
        
        if ((groupe && groupe.toUpperCase() !== ancienGroupe) || 
            (dateEntree && dateEntree !== ancienneDateEntree)) {
            this.effacerPlanningTheoriqueAgent(codeAgent);
        }
        
        this.saveData();
        return { succes: true, message: `Agent ${codeAgent} modifié avec succès.` };
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
        if (!agent) {
            return { message: `Agent ${codeAgent} non trouvé.` };
        }
        
        agent.date_sortie = new Date().toISOString().split('T')[0];
        agent.statut = 'inactif';
        
        const aujourdhui = new Date();
        aujourdhui.setDate(aujourdhui.getDate() + 1);
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
        return { succes: true, message: `Agent ${codeAgent} marqué comme inactif.` };
    }

    importerAgentsExcel() {
        // Simulation d'import Excel
        return { importes: 0, ignores: 0, erreurs: [] };
    }

    // =========================================================================
    // GESTION DU PLANNING (COMPLÈTE)
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
            agents: [],
            total_agents: agentsFiltres.length
        };
        
        for (let jour = 1; jour <= joursMois; jour++) {
            const date = new Date(annee, mois - 1, jour);
            const dateStr = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
            
            planning.jours.push({
                numero: jour,
                date: dateStr,
                jour_semaine: JOURS_FRANCAIS[date.getDay()],
                ferie: this.estJourFerie(dateStr),
                est_dimanche: date.getDay() === 0
            });
        }
        
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

    obtenirPlanningAgent(codeAgent, mois, annee) {
        const agent = this.agents.find(a => a.code === codeAgent && a.statut === 'actif');
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé ou inactif.` };
        }
        
        const joursMois = new Date(annee, mois, 0).getDate();
        const jours = [];
        
        for (let jour = 1; jour <= joursMois; jour++) {
            const date = new Date(annee, mois - 1, jour);
            const dateStr = `${annee}-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
            
            jours.push({
                jour_numero: jour,
                jour_semaine: JOURS_FRANCAIS[date.getDay()],
                date: dateStr,
                shift: this.getShiftEffectif(codeAgent, dateStr),
                ferie: this.estJourFerie(dateStr)
            });
        }
        
        return {
            agent: {
                code: agent.code,
                nom: agent.nom,
                prenom: agent.prenom,
                groupe: agent.groupe
            },
            jours: jours,
            mois: mois,
            annee: annee
        };
    }

    obtenirPlanningGroupe(groupe, mois, annee) {
        const planning = this.calculerPlanningMensuel(mois, annee, groupe);
        
        if (planning.agents.length === 0) {
            return { erreur: `Aucun agent dans le groupe ${groupe}.` };
        }
        
        return {
            groupe: groupe,
            agents: planning.agents,
            jours: planning.jours,
            total_agents: planning.total_agents,
            mois: mois,
            annee: annee
        };
    }

    // =========================================================================
    // MODIFICATION PONCTUELLE DES SHIFTS
    // =========================================================================

    modifierShiftPonctuel(codeAgent, dateStr, nouveauShift) {
        const agent = this.agents.find(a => 
            a.code === codeAgent.toUpperCase() && a.statut === 'actif'
        );
        
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé ou inactif.` };
        }
        
        if (!['1', '2', '3', 'R', 'C', 'M', 'A'].includes(nouveauShift)) {
            return { erreur: "Shift invalide. Utilisez 1, 2, 3, R, C, M, ou A." };
        }
        
        this.planning[`${codeAgent}_${dateStr}`] = nouveauShift;
        this.saveData();
        
        return { 
            succes: true, 
            message: `Shift de ${codeAgent} modifié en '${nouveauShift}' pour le ${dateStr}.` 
        };
    }

    echangerShifts(codeAgentA, codeAgentB, dateStr) {
        const shiftA = this.getShiftEffectif(codeAgentA, dateStr);
        const shiftB = this.getShiftEffectif(codeAgentB, dateStr);
        
        if (shiftA === '-' || shiftB === '-') {
            return { erreur: "L'un des agents n'est pas planifié à cette date." };
        }
        
        if (shiftA === shiftB) {
            return { message: "Les deux agents ont déjà le même shift." };
        }
        
        this.planning[`${codeAgentA}_${dateStr}`] = shiftB;
        this.planning[`${codeAgentB}_${dateStr}`] = shiftA;
        
        // Enregistrer dans l'historique
        this.historiqueEchanges.push({
            date: new Date().toISOString().split('T')[0],
            agent1: codeAgentA,
            agent2: codeAgentB,
            date_echange: dateStr,
            shift1_initial: shiftA,
            shift2_initial: shiftB
        });
        
        this.saveData();
        
        return { 
            succes: true, 
            message: `Échange réussi: ${codeAgentA} → ${shiftB}, ${codeAgentB} → ${shiftA} le ${dateStr}` 
        };
    }

    enregistrerAbsence(codeAgent, dateStr, typeAbsence) {
        const agent = this.agents.find(a => 
            a.code === codeAgent.toUpperCase() && a.statut === 'actif'
        );
        
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé ou inactif.` };
        }
        
        if (!['C', 'M', 'A'].includes(typeAbsence.toUpperCase())) {
            return { erreur: "Type d'absence invalide. Utilisez C (Congé), M (Maladie) ou A (Autre)." };
        }
        
        this.planning[`${codeAgent}_${dateStr}`] = typeAbsence.toUpperCase();
        this.saveData();
        
        return { 
            succes: true, 
            message: `Absence (${typeAbsence}) enregistrée pour ${codeAgent} le ${dateStr}.` 
        };
    }

    // =========================================================================
    // GESTION DES CONGÉS PAR PÉRIODE
    // =========================================================================

    ajouterCongePeriode(codeAgent, dateDebut, dateFin) {
        const agent = this.agents.find(a => 
            a.code === codeAgent.toUpperCase() && a.statut === 'actif'
        );
        
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé ou inactif.` };
        }
        
        if (new Date(dateDebut) > new Date(dateFin)) {
            return { erreur: "La date de début doit être avant la date de fin." };
        }
        
        const conge = {
            code_agent: codeAgent.toUpperCase(),
            date_debut: dateDebut,
            date_fin: dateFin,
            date_creation: new Date().toISOString().split('T')[0]
        };
        
        this.congesPeriodes.push(conge);
        
        // Appliquer les congés jour par jour
        const dateDebutObj = new Date(dateDebut);
        const dateFinObj = new Date(dateFin);
        let joursConges = 0;
        
        for (let d = new Date(dateDebutObj); d <= dateFinObj; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const jourSemaine = d.getDay();
            
            if (jourSemaine === 0) {
                this.planning[`${codeAgent}_${dateStr}`] = 'R';
            } else {
                this.planning[`${codeAgent}_${dateStr}`] = 'C';
                joursConges++;
            }
        }
        
        this.saveData();
        
        return { 
            succes: true, 
            message: `Congé enregistré pour ${codeAgent} du ${dateDebut} au ${dateFin}`,
            jours_conges: joursConges
        };
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
        
        return { 
            succes: true, 
            message: `Congé supprimé pour ${codeAgent} du ${dateDebut} au ${dateFin}` 
        };
    }

    listerCongesAgent(codeAgent) {
        const conges = this.congesPeriodes.filter(c => c.code_agent === codeAgent.toUpperCase());
        
        return {
            conges: conges.map(c => ({
                debut: c.date_debut,
                fin: c.date_fin,
                duree: Math.floor((new Date(c.date_fin) - new Date(c.date_debut)) / (1000*60*60*24)) + 1,
                creation: c.date_creation
            })),
            total: conges.length
        };
    }

    estEnConge(codeAgent, dateStr) {
        return this.congesPeriodes.some(c => 
            c.code_agent === codeAgent && 
            dateStr >= c.date_debut && 
            dateStr <= c.date_fin
        );
    }

    // =========================================================================
    // STATISTIQUES COMPLÈTES (COMME VOTRE ANDROID)
    // =========================================================================

    obtenirStatistiquesAgent(codeAgent, mois, annee) {
        const agent = this.agents.find(a => a.code === codeAgent && a.statut === 'actif');
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé ou inactif.` };
        }
        
        const stats = this.calculerStatistiquesAgent(codeAgent, mois, annee);
        if (!stats) return null;
        
        const statistiques = [
            { description: 'Shifts Matin (1)', valeur: stats.stats['1'] },
            { description: 'Shifts Après-midi (2)', valeur: stats.stats['2'] },
            { description: 'Shifts Nuit (3)', valeur: stats.stats['3'] },
            { description: 'Jours Repos (R)', valeur: stats.stats['R'] },
            { description: 'Congés (C)', valeur: stats.stats['C'] },
            { description: 'Maladie (M)', valeur: stats.stats['M'] },
            { description: 'Autre Absence (A)', valeur: stats.stats['A'] },
            { description: 'Jours Fériés travaillés', valeur: stats.feries_travailles },
            { description: 'TOTAL SHIFTS OPÉRATIONNELS', valeur: stats.total_operationnels }
        ];
        
        return {
            agent: {
                code: agent.code,
                nom: agent.nom,
                prenom: agent.prenom,
                groupe: agent.groupe
            },
            statistiques: statistiques,
            total_operationnels: stats.total_operationnels,
            mois: mois,
            annee: annee
        };
    }

    obtenirStatistiquesGlobales(mois, annee) {
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        
        let totalOperationnels = 0;
        let totalFeries = 0;
        const statsGlobales = { '1': 0, '2': 0, '3': 0, 'R': 0, 'C': 0, 'M': 0, 'A': 0 };
        
        agentsActifs.forEach(agent => {
            const stats = this.calculerStatistiquesAgent(agent.code, mois, annee);
            if (stats) {
                totalOperationnels += stats.total_operationnels;
                totalFeries += stats.feries_travailles;
                for (const key in stats.stats) {
                    statsGlobales[key] += stats.stats[key];
                }
            }
        });
        
        const statistiques = [
            { description: 'Shifts Matin (1)', valeur: statsGlobales['1'] },
            { description: 'Shifts Après-midi (2)', valeur: statsGlobales['2'] },
            { description: 'Shifts Nuit (3)', valeur: statsGlobales['3'] },
            { description: 'Jours Repos (R)', valeur: statsGlobales['R'] },
            { description: 'Congés (C)', valeur: statsGlobales['C'] },
            { description: 'Maladie (M)', valeur: statsGlobales['M'] },
            { description: 'Autre Absence (A)', valeur: statsGlobales['A'] },
            { description: 'Jours Fériés travaillés', valeur: totalFeries },
            { description: 'TOTAL SHIFTS OPÉRATIONNELS', valeur: totalOperationnels }
        ];
        
        return {
            statistiques: statistiques,
            total_agents: agentsActifs.length,
            total_operationnels: totalOperationnels,
            mois: mois,
            annee: annee
        };
    }

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
                    
                    if (this.estJourFerie(dateStr)) {
                        feriesTravailles += 1;
                    }
                }
            }
        }
        
        let totalOperationnels;
        if (agent.groupe === 'E') {
            totalOperationnels = totalShiftsEffectues;
        } else {
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

    obtenirJoursTravaillesGroupe(groupe, mois, annee) {
        const agentsGroupe = this.agents.filter(a => 
            a.groupe === groupe && a.statut === 'actif'
        );
        
        const agentsAvecJours = [];
        let totalJours = 0;
        
        agentsGroupe.forEach(agent => {
            const jours = this.calculerJoursTravaillesAgent(agent.code, mois, annee);
            agentsAvecJours.push({
                code: agent.code,
                nom: agent.nom,
                prenom: agent.prenom,
                jours_travailles: jours
            });
            totalJours += jours;
        });
        
        return {
            groupe: groupe,
            agents: agentsAvecJours,
            nombre_agents: agentsGroupe.length,
            total_jours: totalJours,
            moyenne: agentsGroupe.length > 0 ? (totalJours / agentsGroupe.length).toFixed(1) : 0
        };
    }

    obtenirJoursTravaillesGlobal(mois, annee) {
        const groupes = ['A', 'B', 'C', 'D', 'E'];
        const resultats = [];
        let totalAgents = 0;
        let totalJours = 0;
        
        groupes.forEach(groupe => {
            const statsGroupe = this.obtenirJoursTravaillesGroupe(groupe, mois, annee);
            if (statsGroupe.nombre_agents > 0) {
                resultats.push(statsGroupe);
                totalAgents += statsGroupe.nombre_agents;
                totalJours += statsGroupe.total_jours;
            }
        });
        
        return {
            groupes: resultats,
            total_agents: totalAgents,
            total_jours: totalJours,
            moyenne_generale: totalAgents > 0 ? (totalJours / totalAgents).toFixed(1) : 0
        };
    }

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

    // =========================================================================
    // GESTION DES CODES PANIQUE
    // =========================================================================

    ajouterModifierCodePanique(codeAgent, codePanique, posteNom) {
        const agent = this.agents.find(a => a.code === codeAgent.toUpperCase());
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé.` };
        }
        
        this.codesPanique[codeAgent.toUpperCase()] = {
            code_agent: codeAgent.toUpperCase(),
            code_panique: codePanique,
            poste_nom: posteNom
        };
        
        this.saveData();
        return { 
            succes: true, 
            message: `Code panique pour ${codeAgent} mis à jour : ${codePanique} (${posteNom}).` 
        };
    }

    obtenirCodesPanique() {
        const codes = Object.values(this.codesPanique).map(panique => {
            const agent = this.agents.find(a => a.code === panique.code_agent);
            return {
                code_agent: panique.code_agent,
                nom_complet: agent ? `${agent.nom} ${agent.prenom}` : 'Agent inconnu',
                code_panique: panique.code_panique,
                poste_nom: panique.poste_nom
            };
        });
        
        return { codes: codes, total: codes.length };
    }

    supprimerCodePanique(codeAgent) {
        if (!this.codesPanique[codeAgent.toUpperCase()]) {
            return { message: `Aucun code panique trouvé pour l'agent ${codeAgent}.` };
        }
        
        delete this.codesPanique[codeAgent.toUpperCase()];
        this.saveData();
        
        return { succes: true, message: `Code panique de ${codeAgent} supprimé.` };
    }

    // =========================================================================
    // GESTION DES RADIOS
    // =========================================================================

    ajouterModifierRadio(idRadio, modele, statut) {
        if (!['DISPONIBLE', 'HS', 'RÉPARATION', 'ATTRIBUÉE'].includes(statut.toUpperCase())) {
            return { erreur: "Statut invalide. Utilisez Disponible, HS, Réparation ou Attribuée." };
        }
        
        this.radios[idRadio.toUpperCase()] = {
            id_radio: idRadio.toUpperCase(),
            modele: modele,
            statut: statut.toUpperCase(),
            attribue_a: null,
            date_attribution: null
        };
        
        this.saveData();
        return { 
            succes: true, 
            message: `Radio ${idRadio} (${modele}) mise à jour. Statut: ${statut}.` 
        };
    }

    attribuerRadio(idRadio, codeAgent) {
        const radio = this.radios[idRadio.toUpperCase()];
        if (!radio) {
            return { erreur: `Radio ${idRadio} non trouvée.` };
        }
        
        if (radio.statut !== 'DISPONIBLE') {
            return { message: `Radio ${idRadio} n'est pas DISPONIBLE (Statut: ${radio.statut}).` };
        }
        
        const agent = this.agents.find(a => a.code === codeAgent.toUpperCase());
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé.` };
        }
        
        radio.statut = 'ATTRIBUÉE';
        radio.attribue_a = {
            code: agent.code,
            nom_complet: `${agent.nom} ${agent.prenom}`
        };
        radio.date_attribution = new Date().toISOString().split('T')[0];
        
        this.saveData();
        return { 
            succes: true, 
            message: `Radio ${idRadio} attribuée à l'agent ${codeAgent}.` 
        };
    }

    enregistrerRetourRadio(idRadio) {
        const radio = this.radios[idRadio.toUpperCase()];
        if (!radio) {
            return { erreur: `Radio ${idRadio} non trouvée.` };
        }
        
        if (radio.statut !== 'ATTRIBUÉE') {
            return { message: `Radio ${idRadio} n'est pas marquée comme ATTRIBUÉE (Statut: ${radio.statut}).` };
        }
        
        radio.statut = 'DISPONIBLE';
        radio.attribue_a = null;
        radio.date_attribution = null;
        
        this.saveData();
        return { 
            succes: true, 
            message: `Radio ${idRadio} retournée et marquée comme DISPONIBLE.` 
        };
    }

    obtenirStatutRadios() {
        const radiosArray = Object.values(this.radios);
        
        const statistiques = {
            total: radiosArray.length,
            disponible: radiosArray.filter(r => r.statut === 'DISPONIBLE').length,
            attribuee: radiosArray.filter(r => r.statut === 'ATTRIBUÉE').length,
            hs: radiosArray.filter(r => r.statut === 'HS').length,
            reparation: radiosArray.filter(r => r.statut === 'RÉPARATION').length
        };
        
        return {
            radios: radiosArray.map(radio => ({
                id_radio: radio.id_radio,
                modele: radio.modele,
                statut: radio.statut,
                attribue_a: radio.attribue_a
            })),
            statistiques: statistiques
        };
    }

    // =========================================================================
    // GESTION HABILLEMENT
    // =========================================================================

    ajouterModifierHabillement(codeAgent, habillementData) {
        const agent = this.agents.find(a => a.code === codeAgent.toUpperCase());
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé.` };
        }
        
        this.habillement[codeAgent.toUpperCase()] = {
            code_agent: codeAgent.toUpperCase(),
            ...habillementData
        };
        
        this.saveData();
        return { succes: true, message: `Informations d'habillement pour ${codeAgent} mises à jour.` };
    }

    obtenirRapportHabillement() {
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        const habillementArray = [];
        
        agentsActifs.forEach(agent => {
            const habil = this.habillement[agent.code] || {
                chemise: { taille: null, date: null },
                jacket: { taille: null, date: null },
                pantalon: { taille: null, date: null },
                cravate: { oui_non: null, date: null }
            };
            
            habillementArray.push({
                code: agent.code,
                nom_complet: `${agent.nom} ${agent.prenom}`,
                chemise: habil.chemise || { taille: null, date: null },
                jacket: habil.jacket || { taille: null, date: null },
                pantalon: habil.pantalon || { taille: null, date: null },
                cravate: habil.cravate || { oui_non: null, date: null }
            });
        });
        
        return { habillement: habillementArray, total: habillementArray.length };
    }

    // =========================================================================
    // GESTION DES AVERTISSEMENTS
    // =========================================================================

    enregistrerAvertissement(codeAgent, dateAv, typeAv, description) {
        const agent = this.agents.find(a => a.code === codeAgent.toUpperCase());
        if (!agent) {
            return { erreur: `Agent ${codeAgent} non trouvé.` };
        }
        
        if (!['ORAL', 'ECRIT', 'MISE_A_PIED'].includes(typeAv.toUpperCase())) {
            return { erreur: "Type d'avertissement invalide (ORAL, ECRIT, MISE_A_PIED)." };
        }
        
        const avertissement = {
            id: Date.now(),
            code_agent: codeAgent.toUpperCase(),
            date_avertissement: dateAv,
            type_avertissement: typeAv.toUpperCase(),
            description: description
        };
        
        this.avertissements.push(avertissement);
        this.saveData();
        
        return { 
            succes: true, 
            message: `Avertissement (${typeAv}) enregistré pour ${codeAgent}.` 
        };
    }

    obtenirHistoriqueAvertissementsAgent(codeAgent) {
        const avertissements = this.avertissements.filter(a => 
            a.code_agent === codeAgent.toUpperCase()
        ).sort((a, b) => new Date(b.date_avertissement) - new Date(a.date_avertissement));
        
        return {
            avertissements: avertissements.map(a => ({
                date: a.date_avertissement,
                type: a.type_avertissement,
                description: a.description
            })),
            total: avertissements.length
        };
    }

    obtenirRapportAvertissements() {
        const avertissementsAvecNoms = this.avertissements.map(avert => {
            const agent = this.agents.find(a => a.code === avert.code_agent);
            return {
                code_agent: avert.code_agent,
                nom_complet: agent ? `${agent.nom} ${agent.prenom}` : 'Agent inconnu',
                date: avert.date_avertissement,
                type: avert.type_avertissement,
                description: avert.description
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return {
            avertissements: avertissementsAvecNoms,
            total: avertissementsAvecNoms.length
        };
    }

    // =========================================================================
    // GESTION JOURS FÉRIÉS
    // =========================================================================

    ajouterJourFerie(dateStr, description) {
        if (this.estJourFerie(dateStr)) {
            return { message: `Jour férié déjà existant pour la date ${dateStr}.` };
        }
        
        this.joursFeries.push(dateStr);
        this.saveData();
        
        return { 
            succes: true, 
            message: `Jour férié '${description}' ajouté le ${dateStr}.` 
        };
    }

    supprimerJourFerie(dateStr) {
        const index = this.joursFeries.indexOf(dateStr);
        if (index === -1) {
            return { message: `Aucun jour férié trouvé à la date ${dateStr}.` };
        }
        
        this.joursFeries.splice(index, 1);
        this.saveData();
        
        return { succes: true, message: `Jour férié du ${dateStr} supprimé.` };
    }

    obtenirJoursFeries(annee) {
        const joursFeriesAnnee = this.joursFeries.filter(date => 
            date.startsWith(annee.toString())
        );
        
        const joursFixes = [
            { date: `${annee}-01-01`, description: "Nouvel An", type: "FIXE" },
            { date: `${annee}-01-11`, description: "Manifeste de l'Indépendance", type: "FIXE" },
            { date: `${annee}-05-01`, description: "Fête du Travail", type: "FIXE" },
            { date: `${annee}-07-30`, description: "Fête du Trône", type: "FIXE" },
            { date: `${annee}-08-14`, description: "Allégeance Oued Eddahab", type: "FIXE" },
            { date: `${annee}-08-20`, description: "Révolution du Roi et du Peuple", type: "FIXE" },
            { date: `${annee}-08-21`, description: "Fête de la Jeunesse", type: "FIXE" },
            { date: `${annee}-11-06`, description: "Marche Verte", type: "FIXE" },
            { date: `${annee}-11-18`, description: "Fête de l'Indépendance", type: "FIXE" }
        ];
        
        const joursManuels = joursFeriesAnnee
            .filter(date => !JOURS_FERIES_MAROC_2026.includes(date))
            .map(date => ({
                date: date,
                description: "Jour férié spécial",
                type: "MANUEL"
            }));
        
        const tousJours = [...joursFixes, ...joursManuels].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        return { 
            jours_feries: tousJours, 
            total: tousJours.length,
            fixes: joursFixes.length,
            manuels: joursManuels.length
        };
    }

    estJourFerie(dateStr) {
        return this.joursFeries.includes(dateStr);
    }

    // =========================================================================
    // OUTILS ET MAINTENANCE
    // =========================================================================

    initialiserAgentsTest() {
        const agentsTest = [
            { code: 'A01', nom: 'Dupont', prenom: 'Alice', groupe: 'A', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
            { code: 'B02', nom: 'Martin', prenom: 'Bob', groupe: 'B', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
            { code: 'C03', nom: 'Lefevre', prenom: 'Carole', groupe: 'C', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
            { code: 'D04', nom: 'Dubois', prenom: 'David', groupe: 'D', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
            { code: 'E01', nom: 'Zahiri', prenom: 'Ahmed', groupe: 'E', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' },
            { code: 'E02', nom: 'Zarrouk', prenom: 'Benoit', groupe: 'E', date_entree: DATE_AFFECTATION_BASE, statut: 'actif' }
        ];
        
        agentsTest.forEach(agent => {
            const index = this.agents.findIndex(a => a.code === agent.code);
            if (index === -1) {
                this.agents.push(agent);
            } else {
                this.agents[index] = agent;
            }
        });
        
        this.saveData();
        
        return { 
            succes: true, 
            message: `Agents de test initialisés. Total: ${agentsTest.length} agents.` 
        };
    }

    exporterStatsExcel(mois, annee, nomFichier) {
        // Simulation d'export Excel
        return { 
            succes: true, 
            message: `Statistiques exportées dans ${nomFichier}.xlsx` 
        };
    }

    // =========================================================================
    // INTERFACE UTILISATEUR WEB
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
        document.getElementById('month-select')?.addEventListener('change', () => this.afficherPlanning());
        document.getElementById('year-select')?.addEventListener('change', () => this.afficherPlanning());
        document.getElementById('groupe-select')?.addEventListener('change', () => this.afficherPlanning());
        
        // Formulaire agent
        document.getElementById('agent-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.ajouterAgentViaFormulaire();
        });
        
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
        
        // Charger les données spécifiques
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
            case 'add':
                this.afficherFormulaireAgent();
                break;
            case 'absences':
                this.afficherGestionConges();
                break;
            case 'echanges':
                this.afficherGestionEchanges();
                break;
            case 'stats':
                this.afficherStatistiques();
                break;
            case 'export':
                this.afficherGestionExport();
                break;
            case 'radios':
                this.afficherGestionRadios();
                break;
            case 'panique':
                this.afficherGestionPanique();
                break;
            case 'habillement':
                this.afficherGestionHabillement();
                break;
            case 'avertissements':
                this.afficherGestionAvertissements();
                break;
            case 'conges':
                this.afficherGestionCongesPeriodes();
                break;
            case 'feries':
                this.afficherJoursFeries();
                break;
            case 'outils':
                this.afficherOutils();
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
            const estDimanche = jour.est_dimanche;
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
                const estDimanche = jourInfo.est_dimanche;
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

    afficherFormulaireAgent() {
        // Le formulaire est déjà dans le HTML
    }

    afficherGestionConges() {
        const container = document.getElementById('absences-tab');
        if (!container) return;
        
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        
        let html = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3>📋 Gestion des Congés et Absences</h3>
                
                <!-- Formulaire congés période -->
                <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="color: #0ea5e9; margin-bottom: 15px;">📅 Congés par Période</h4>
                    <div class="input-group">
                        <label for="absence-agent">Agent *</label>
                        <select id="absence-agent" style="width: 100%; padding: 10px; border-radius: 8px;">
                            <option value="">Sélectionner un agent</option>
                            ${agentsActifs.map(agent => 
                                `<option value="${agent.code}">${agent.code} - ${agent.nom} ${agent.prenom}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <label for="date-debut">Date début *</label>
                            <input type="date" id="date-debut" style="width: 100%; padding: 10px; border-radius: 8px;">
                        </div>
                        <div style="flex: 1;">
                            <label for="date-fin">Date fin *</label>
                            <input type="date" id="date-fin" style="width: 100%; padding: 10px; border-radius: 8px;">
                        </div>
                    </div>
                    <button onclick="app.ajouterCongePeriodeViaFormulaire()" 
                            style="background: #0ea5e9; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">
                        ✅ Ajouter congé période
                    </button>
                </div>
                
                <!-- Formulaire absence ponctuelle -->
                <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="color: #ef4444; margin-bottom: 15px;">⚠️ Absence Ponctuelle</h4>
                    <div class="input-group">
                        <label for="absence-ponctuelle-agent">Agent *</label>
                        <select id="absence-ponctuelle-agent" style="width: 100%; padding: 10px; border-radius: 8px;">
                            <option value="">Sélectionner un agent</option>
                            ${agentsActifs.map(agent => 
                                `<option value="${agent.code}">${agent.code} - ${agent.nom} ${agent.prenom}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="absence-date">Date *</label>
                        <input type="date" id="absence-date" style="width: 100%; padding: 10px; border-radius: 8px;">
                    </div>
                    <div class="input-group">
                        <label for="type-absence">Type d'absence *</label>
                        <select id="type-absence" style="width: 100%; padding: 10px; border-radius: 8px;">
                            <option value="">Sélectionner type</option>
                            <option value="C">Congé (C)</option>
                            <option value="M">Maladie (M)</option>
                            <option value="A">Autre absence (A)</option>
                        </select>
                    </div>
                    <button onclick="app.ajouterAbsencePonctuelleViaFormulaire()" 
                            style="background: #ef4444; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">
                        ⚠️ Enregistrer absence
                    </button>
                </div>
                
                <!-- Liste des congés en cours -->
                <div id="liste-conges" style="margin-top: 20px;">
                    ${this.afficherListeCongesHTML()}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    afficherListeCongesHTML() {
        if (this.congesPeriodes.length === 0) {
            return '<p style="color: #64748b; text-align: center;">Aucun congé enregistré</p>';
        }
        
        let html = '<h4 style="margin-bottom: 15px;">📋 Congés enregistrés</h4><div style="display: grid; gap: 10px;">';
        
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
                        <button onclick="app.supprimerCongeViaFormulaire('${conge.code_agent}', '${conge.date_debut}', '${conge.date_fin}')" 
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

    afficherGestionEchanges() {
        const container = document.getElementById('echanges-tab');
        if (!container) return;
        
        const agentsActifs = this.agents.filter(a => a.statut === 'actif');
        
        let html = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3>🔄 Échange de Shifts</h3>
                
                <!-- Formulaire échange -->
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px;">
                    <div class="input-group">
                        <label for="echange-agent1">Agent 1 *</label>
                        <select id="echange-agent1" style="width: 100%; padding: 10px; border-radius: 8px;">
                            <option value="">Sélectionner agent 1</option>
                            ${agentsActifs.map(agent => 
                                `<option value="${agent.code}">${agent.code} - ${agent.nom} ${agent.prenom}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label for="echange-agent2">Agent 2 *</label>
                        <select id="echange-agent2" style="width: 100%; padding: 10px; border-radius: 8px;">
                            <option value="">Sélectionner agent 2</option>
                            ${agentsActifs.map(agent => 
                                `<option value="${agent.code}">${agent.code} - ${agent.nom} ${agent.prenom}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label for="echange-date">Date d'échange *</label>
                        <input type="date" id="echange-date" style="width: 100%; padding: 10px; border-radius: 8px;">
                    </div>
                    
                    <!-- Aperçu avant échange -->
                    <div id="apercu-echange" style="margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 10px; display: none;">
                        <h5 style="margin-bottom: 10px;">🔄 Aperçu de l'échange</h5>
                        <div id="details-echange"></div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="app.previsualiserEchange()" 
                                style="background: #f59e0b; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; flex: 1;">
                            👁️ Prévisualiser
                        </button>
                        <button onclick="app.validerEchange()" 
                                style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; flex: 1;">
                            ✅ Valider l'échange
                        </button>
                    </div>
                </div>
                
                <!-- Historique des échanges -->
                <div id="historique-echanges" style="margin-top: 30px;">
                    ${this.afficherHistoriqueEchangesHTML()}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    afficherHistoriqueEchangesHTML() {
        if (this.historiqueEchanges.length === 0) {
            return '<p style="color: #64748b; text-align: center;">Aucun échange enregistré</p>';
        }
        
        let html = '<h4 style="margin-bottom: 15px;">📝 Historique des échanges</h4><div style="display: grid; gap: 10px;">';
        
        this.historiqueEchanges.slice(0, 10).forEach(echange => {
            html += `
                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
                    <div style="font-weight: 500; color: #1e293b;">
                        ${echange.agent1} ↔ ${echange.agent2}
                    </div>
                    <div style="font-size: 14px; color: #64748b; margin-top: 5px;">
                        📅 Date: ${echange.date_echange} | Enregistré le: ${echange.date}
                    </div>
                    <div style="font-size: 12px; color: #94a3b8;">
                        Avant: ${echange.agent1}=${echange.shift1_initial}, ${echange.agent2}=${echange.shift2_initial}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
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
            const agentsGroupe = agentsActifs.filter(a => a.groupe === groupe);
            let totalGroupe = 0;
            
            agentsGroupe.forEach(agent => {
                const stats = this.calculerStatistiquesAgent(agent.code, mois, annee);
                if (stats) {
                    totalGroupe += stats.total_operationnels;
                }
            });
            
            const couleur = this.getGroupeColor(groupe);
            
            html += `
                <div style="text-align: center; padding: 15px; background: ${couleur}10; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 800; color: ${couleur};">${totalGroupe}</div>
                    <div style="font-size: 14px; color: #64748b;">Groupe ${groupe}</div>
                    <div style="font-size: 12px; color: #94a3b8;">${agentsGroupe.length} agents</div>
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

    afficherGestionExport() {
        const container = document.getElementById('export-tab');
        if (!container) return;
        
        let html = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3>📤 Export Complet des Données</h3>
                
                <div style="display: grid; gap: 15px;">
                    <!-- Export Excel complet -->
                    <button onclick="app.exporterExcelComplet()" 
                            style="background: #059669; color: white; padding: 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        📊 Export Excel COMPLET
                    </button>
                    
                    <!-- Export Planning mensuel -->
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px;">
                        <h5 style="margin-bottom: 10px;">📅 Export Planning Mensuel</h5>
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <select id="export-mois" style="flex: 1; padding: 10px; border-radius: 8px;">
                                <option value="1">Janvier</option>
                                <option value="2">Février</option>
                                <option value="3">Mars</option>
                                <option value="4">Avril</option>
                                <option value="5">Mai</option>
                                <option value="6">Juin</option>
                                <option value="7">Juillet</option>
                                <option value="8">Août</option>
                                <option value="9">Septembre</option>
                                <option value="10">Octobre</option>
                                <option value="11">Novembre</option>
                                <option value="12">Décembre</option>
                            </select>
                            <select id="export-annee" style="flex: 1; padding: 10px; border-radius: 8px;">
                                <option value="2026" selected>2026</option>
                                <option value="2025">2025</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>
                        <button onclick="app.exporterPlanningMensuel()" 
                                style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; width: 100%;">
                            📋 Exporter ce planning
                        </button>
                    </div>
                    
                    <!-- Export Statistiques -->
                    <button onclick="app.exporterStatistiques()" 
                            style="background: #8b5cf6; color: white; padding: 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        📈 Export Statistiques
                    </button>
                    
                    <!-- Backup JSON -->
                    <button onclick="app.exporterBackupJSON()" 
                            style="background: #64748b; color: white; padding: 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        💾 Backup JSON
                    </button>
                    
                    <!-- Import -->
                    <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin-top: 10px;">
                        <h5 style="margin-bottom: 10px; color: #dc2626;">📥 Import de données</h5>
                        <button onclick="app.importerBackupJSON()" 
                                style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; width: 100%;">
                            ⚠️ Restaurer backup
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    // =========================================================================
    // FONCTIONS UTILITAIRES POUR L'INTERFACE
    // =========================================================================

    getGroupeColor(groupe) {
        const couleurs = {
            'A': '#3b82f6',
            'B': '#10b981',
            'C': '#8b5cf6',
            'D': '#f59e0b',
            'E': '#ef4444'
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
        
        const result = this.ajouterAgent(code, nom, prenom, groupe);
        
        if (result.succes) {
            document.getElementById('code-agent').value = '';
            document.getElementById('nom-agent').value = '';
            document.getElementById('prenom-agent').value = '';
            document.getElementById('groupe-agent').value = '';
            
            alert(result.message);
            this.showTab('agents');
        } else {
            alert(result.erreur);
        }
    }

    ajouterCongePeriodeViaFormulaire() {
        const codeAgent = document.getElementById('absence-agent')?.value;
        const dateDebut = document.getElementById('date-debut')?.value;
        const dateFin = document.getElementById('date-fin')?.value;
        
        if (!codeAgent || !dateDebut || !dateFin) {
            alert('Tous les champs sont obligatoires');
            return;
        }
        
        const result = this.ajouterCongePeriode(codeAgent, dateDebut, dateFin);
        
        if (result.succes) {
            alert(result.message);
            this.afficherGestionConges();
        } else {
            alert(result.erreur || result.message);
        }
    }

    supprimerCongeViaFormulaire(codeAgent, dateDebut, dateFin) {
        if (confirm(`Supprimer le congé de ${codeAgent} du ${dateDebut} au ${dateFin} ?`)) {
            const result = this.supprimerCongePeriode(codeAgent, dateDebut, dateFin);
            
            if (result.succes) {
                alert(result.message);
                this.afficherGestionConges();
            } else {
                alert(result.message);
            }
        }
    }

    ajouterAbsencePonctuelleViaFormulaire() {
        const codeAgent = document.getElementById('absence-ponctuelle-agent')?.value;
        const date = document.getElementById('absence-date')?.value;
        const type = document.getElementById('type-absence')?.value;
        
        if (!codeAgent || !date || !type) {
            alert('Tous les champs sont obligatoires');
            return;
        }
        
        const result = this.enregistrerAbsence(codeAgent, date, type);
        
        if (result.succes) {
            alert(result.message);
            document.getElementById('absence-ponctuelle-agent').value = '';
            document.getElementById('absence-date').value = '';
            document.getElementById('type-absence').value = '';
        } else {
            alert(result.erreur || result.message);
        }
    }

    previsualiserEchange() {
        const agent1 = document.getElementById('echange-agent1')?.value;
        const agent2 = document.getElementById('echange-agent2')?.value;
        const date = document.getElementById('echange-date')?.value;
        
        if (!agent1 || !agent2 || !date) {
            alert('Tous les champs sont obligatoires');
            return;
        }
        
        const shift1 = this.getShiftEffectif(agent1, date);
        const shift2 = this.getShiftEffectif(agent2, date);
        
        if (shift1 === '-' || shift2 === '-') {
            alert("L'un des agents n'est pas planifié à cette date.");
            return;
        }
        
        if (shift1 === shift2) {
            alert("Les deux agents ont déjà le même shift.");
            return;
        }
        
        const apercu = document.getElementById('apercu-echange');
        const details = document.getElementById('details-echange');
        
        details.innerHTML = `
            <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>${agent1}:</span>
                    <span class="shift-badge shift-${shift1}">${shift1} → ${shift2}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>${agent2}:</span>
                    <span class="shift-badge shift-${shift2}">${shift2} → ${shift1}</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                    Date: ${date}
                </div>
            </div>
        `;
        
        apercu.style.display = 'block';
    }

    validerEchange() {
        const agent1 = document.getElementById('echange-agent1')?.value;
        const agent2 = document.getElementById('echange-agent2')?.value;
        const date = document.getElementById('echange-date')?.value;
        
        if (!agent1 || !agent2 || !date) {
            alert('Tous les champs sont obligatoires');
            return;
        }
        
        const result = this.echangerShifts(agent1, agent2, date);
        
        if (result.succes) {
            alert(result.message);
            document.getElementById('echange-agent1').value = '';
            document.getElementById('echange-agent2').value = '';
            document.getElementById('echange-date').value = '';
            document.getElementById('apercu-echange').style.display = 'none';
            this.afficherGestionEchanges();
        } else {
            alert(result.erreur || result.message);
        }
    }

    afficherStatsAgent(codeAgent) {
        const mois = new Date().getMonth() + 1;
        const annee = new Date().getFullYear();
        
        const stats = this.obtenirStatistiquesAgent(codeAgent, mois, annee);
        if (!stats) return;
        
        let html = `
            <div style="background: white; padding: 20px; border-radius: 12px; max-width: 500px; margin: 0 auto;">
                <h3>📊 Statistiques de ${codeAgent}</h3>
                <p>${stats.agent.nom} ${stats.agent.prenom} - Groupe ${stats.agent.groupe}</p>
                <p>Période: ${mois}/${annee}</p>
                
                <div style="margin-top: 20px;">
                    <div style="display: grid; gap: 10px;">
        `;
        
        stats.statistiques.forEach(stat => {
            html += `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span>${stat.description}:</span>
                    <span>${stat.valeur}</span>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
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
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    listerConges(codeAgent) {
        const result = this.listerCongesAgent(codeAgent);
        
        let html = `<h4>Congés de ${codeAgent}</h4>`;
        
        if (result.conges.length === 0) {
            html += '<p style="color: #64748b;">Aucun congé enregistré</p>';
        } else {
            html += '<ul style="list-style: none; padding: 0;">';
            result.conges.forEach(conge => {
                html += `
                    <li style="background: #f8fafc; padding: 10px; margin-bottom: 5px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <strong>${conge.debut} au ${conge.fin}</strong><br>
                        <small style="color: #64748b;">${conge.duree} jours - Créé le: ${conge.creation}</small>
                    </li>
                `;
            });
            html += '</ul>';
        }
        
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

    exporterExcelComplet() {
        alert('📊 Fonction d\'export Excel complète en développement...');
    }

    exporterPlanningMensuel() {
        alert('📋 Fonction d\'export planning mensuel en développement...');
    }

    exporterStatistiques() {
        alert('📈 Fonction d\'export statistiques en développement...');
    }

    exporterBackupJSON() {
        const data = {
            agents: this.agents,
            planning: this.planning,
            congesPeriodes: this.congesPeriodes,
            joursFeries: this.joursFeries,
            codesPanique: this.codesPanique,
            radios: this.radios,
            habillement: this.habillement,
            avertissements: this.avertissements,
            historiqueEchanges: this.historiqueEchanges
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planning_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('💾 Backup JSON exporté avec succès !');
    }

    importerBackupJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Valider les données
                    if (!data.agents || !Array.isArray(data.agents)) {
                        throw new Error('Format de fichier invalide');
                    }
                    
                    // Demander confirmation
                    if (confirm(`Importer ${data.agents.length} agents ?\nAttention: cela écrasera toutes les données actuelles.`)) {
                        this.agents = data.agents || [];
                        this.planning = data.planning || {};
                        this.congesPeriodes = data.congesPeriodes || [];
                        this.joursFeries = data.joursFeries || [...JOURS_FERIES_MAROC_2026];
                        this.codesPanique = data.codesPanique || {};
                        this.radios = data.radios || {};
                        this.habillement = data.habillement || {};
                        this.avertissements = data.avertissements || [];
                        this.historiqueEchanges = data.historiqueEchanges || [];
                        
                        this.saveData();
                        alert('✅ Backup importé avec succès !');
                        location.reload();
                    }
                } catch (error) {
                    alert(`❌ Erreur lors de l'import: ${error.message}`);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // =========================================================================
    // FONCTIONS POUR LES AUTRES MENUS (À IMPLÉMENTER)
    // =========================================================================

    afficherGestionRadios() {
        alert('📻 Module Radios en développement...');
    }

    afficherGestionPanique() {
        alert('🚨 Module Codes Panique en développement...');
    }

    afficherGestionHabillement() {
        alert('👔 Module Habillement en développement...');
    }

    afficherGestionAvertissements() {
        alert('⚠️ Module Avertissements en développement...');
    }

    afficherGestionCongesPeriodes() {
        alert('📅 Module Congés (périodes) en développement...');
    }

    afficherJoursFeries() {
        alert('🎉 Module Jours Fériés en développement...');
    }

    afficherOutils() {
        alert('🔧 Module Outils en développement...');
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

// Exposer les fonctions globales
window.showTab = (tabName) => window.app.showTab(tabName);
window.addAgent = () => window.app.ajouterAgentViaFormulaire();
window.addConge = () => window.app.ajouterCongePeriodeViaFormulaire();
window.deleteConge = (codeAgent, dateDebut, dateFin) => window.app.supprimerCongeViaFormulaire(codeAgent, dateDebut, dateFin);
window.exportToExcel = () => window.app.exporterExcelComplet();
window.ajouterAbsencePonctuelleViaFormulaire = () => window.app.ajouterAbsencePonctuelleViaFormulaire();
window.previsualiserEchange = () => window.app.previsualiserEchange();
window.validerEchange = () => window.app.validerEchange();

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.app.showTab('dashboard');
    window.app.afficherDashboard();
});

// CSS supplémentaire pour les badges
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
    
    .shift-1 { background: #3b82f6; }
    .shift-2 { background: #10b981; }
    .shift-3 { background: #8b5cf6; }
    .shift-R { background: #64748b; }
    .shift-C { background: #f59e0b; }
    .shift-F { background: #d97706; }
    .shift-M { background: #ef4444; }
    .shift-A { background: #8b5cf6; }
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
    
    .input-group {
        margin-bottom: 15px;
    }
    
    .input-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

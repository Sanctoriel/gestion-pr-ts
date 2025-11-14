// Constante de l'application : Le taux d'intérêt est maintenant de 15%
const TAUX_INTERET = 0.15; // Représente 15%

/**
 * Classe représentant un prêt unique. (Logique du prêt)
 */
class PretPersonnel {
    constructor(id, nomEmprunteur, contact, montantPrincipal, datePret, dateEcheance) {
        this.id = id;
        this.nomEmprunteur = nomEmprunteur;
        this.contact = contact; // Nouveau champ pour le contact
        this.montantPrincipal = parseFloat(montantPrincipal);
        this.datePret = new Date(datePret);
        this.dateEcheance = new Date(dateEcheance);
        this.tauxInteret = TAUX_INTERET;
        this.remboursements = [];
    }

    // --- Méthodes de Calcul (inchangées, mais utilisent le nouveau taux de 15%) ---
    calculerInterets() {
        return this.montantPrincipal * this.tauxInteret;
    }

    calculerTotalDu() {
        return this.montantPrincipal + this.calculerInterets();
    }

    calculerTotalRembourse() {
        return this.remboursements.reduce((total, paiement) => total + paiement.montant, 0);
    }

    calculerSoldeRestant() {
        const totalDu = this.calculerTotalDu();
        const totalRembourse = this.calculerTotalRembourse();
        return Math.max(0, totalDu - totalRembourse);
    }

    getStatut() {
        const solde = this.calculerSoldeRestant();
        if (solde <= 0) {
            return { text: "Payé", class: "statut-paye" };
        }
        const aujourdHui = new Date();
        if (solde > 0 && aujourdHui.getTime() > this.dateEcheance.getTime()) {
            return { text: "Échu", class: "statut-echu" };
        }
        return { text: "En Cours", class: "statut-encours" };
    }
}

// --- Logique d'Application et DOM Manipulation ---

let listePrets = [];
let nextId = 1;

const listePretsBody = document.getElementById('listePretsBody');
const formulaireAjout = document.getElementById('formulaireAjout');
const nouveauPretForm = document.getElementById('nouveauPretForm');
const ouvrirFormulaireBtn = document.getElementById('ouvrirFormulaireBtn');
const closeButtonAjout = formulaireAjout.querySelector('.close-button');

const modalDetails = document.getElementById('modalDetails');
const closeButtonDetails = modalDetails.querySelector('.close-button');
const rembourseForm = document.getElementById('remboursementForm');

// --- Gestion des Modales ---

// Ouvre la modale d'ajout
ouvrirFormulaireBtn.addEventListener('click', () => {
    formulaireAjout.style.display = 'block';
});

// Ferme les modales
closeButtonAjout.addEventListener('click', () => {
    formulaireAjout.style.display = 'none';
    nouveauPretForm.reset();
});

closeButtonDetails.addEventListener('click', () => {
    modalDetails.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === formulaireAjout) {
        formulaireAjout.style.display = 'none';
        nouveauPretForm.reset();
    }
    if (event.target === modalDetails) {
        modalDetails.style.display = 'none';
    }
});


// --- Gestion du Formulaire de Nouveau Prêt ---

nouveauPretForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nom = document.getElementById('nomEmprunteur').value;
    const contact = document.getElementById('contactEmprunteur').value; // Récupération du contact
    const montant = document.getElementById('montantPrincipal').value;
    const datePret = document.getElementById('datePret').value;
    const dateEcheance = document.getElementById('dateEcheance').value;

    const nouveauPret = new PretPersonnel(nextId++, nom, contact, montant, datePret, dateEcheance);
    listePrets.push(nouveauPret);
    
    afficherListePrets();
    
    // Fermeture et réinitialisation du formulaire
    formulaireAjout.style.display = 'none';
    nouveauPretForm.reset();
});

// --- Gestion des Remboursements (Nouveau) ---

rembourseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const pretId = parseInt(document.getElementById('currentPretId').value);
    const montantRemboursement = parseFloat(document.getElementById('montantRemboursement').value);
    
    if (isNaN(montantRemboursement) || montantRemboursement <= 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }

    const pret = listePrets.find(p => p.id === pretId);
    if (pret) {
        // Enregistrement du remboursement
        pret.remboursements.push({ montant: montantRemboursement, date: new Date() });
        
        // Rafraîchir l'affichage
        afficherListePrets();
        voirDetails(pretId); // Ré-afficher les détails avec la mise à jour
        
        document.getElementById('montantRemboursement').value = ''; // Vider le champ
    }
});


// --- Fonctions d'Affichage ---

function afficherListePrets() {
    listePretsBody.innerHTML = ''; 

    if (listePrets.length === 0) {
        listePretsBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Aucun prêt enregistré.</td></tr>`;
        return;
    }

    listePrets.forEach(pret => {
        const totalDu = pret.calculerTotalDu().toFixed(2);
        const soldeRestant = pret.calculerSoldeRestant().toFixed(2);
        const statut = pret.getStatut();

        const row = listePretsBody.insertRow();
        row.innerHTML = `
            <td>${pret.nomEmprunteur}</td>
            <td>${pret.montantPrincipal.toFixed(2)} fcfa</td>
            <td>${totalDu} fcfa</td>
            <td>${pret.dateEcheance.toLocaleDateString('fr-FR')}</td>
            <td>${soldeRestant} fcfa</td>
            <td><span class="${statut.class}">${statut.text}</span></td>
            <td><button class="details-button" onclick="voirDetails(${pret.id})">Détails</button></td>
        `;
    });
}

/**
 * Affiche la modale de détails du prêt et gère l'enregistrement des paiements.
 */
function voirDetails(id) {
    const pret = listePrets.find(p => p.id === id);
    if (!pret) return;

    const totalDu = pret.calculerTotalDu().toFixed(2);
    const interets = pret.calculerInterets().toFixed(2);
    const totalRembourse = pret.calculerTotalRembourse().toFixed(2);
    const soldeRestant = pret.calculerSoldeRestant().toFixed(2);
    const statut = pret.getStatut();

    // Remplissage des informations dans la modale
    document.getElementById('detailNom').textContent = pret.nomEmprunteur;
    document.getElementById('detailContact').textContent = pret.contact;
    document.getElementById('detailPrincipal').textContent = `${pret.montantPrincipal.toFixed(2)} fcfa`;
    document.getElementById('detailTaux').textContent = `${(pret.tauxInteret * 100).toFixed(0)}%`;
    document.getElementById('detailInterets').textContent = `${interets} fca`;
    document.getElementById('detailTotalDu').textContent = `${totalDu} fcfa`;
    document.getElementById('detailEcheance').textContent = pret.dateEcheance.toLocaleDateString('fr-FR');
    document.getElementById('detailStatut').innerHTML = `<span class="${statut.class}">${statut.text}</span>`;
    document.getElementById('detailResteAPayer').textContent = `${soldeRestant} fcfa`;

    // Remplissage de l'historique de remboursement
    const histoList = document.getElementById('historiqueRemboursements');
    histoList.innerHTML = '';
    if (pret.remboursements.length === 0) {
        histoList.innerHTML = '<p style="font-size: 0.9em; color: #6c757d;">Aucun remboursement enregistré.</p>';
    } else {
        pret.remboursements.forEach(remb => {
            const li = document.createElement('li');
            li.textContent = `${remb.date.toLocaleDateString('fr-FR')} : ${remb.montant.toFixed(2)} €`;
            histoList.appendChild(li);
        });
    }

    // Préparation du formulaire de remboursement
    document.getElementById('currentPretId').value = pret.id;
    document.getElementById('montantRemboursement').max = soldeRestant; // Limite max de saisie
    
    // Affichage de la modale
    modalDetails.style.display = 'block';
}

// ... (Toutes les classes et fonctions précédentes restent) ...

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Le tableau `listePrets` est vide ici.
    
    // Ceci garantit que le tableau de bord s'affiche avec le message "Aucun prêt enregistré."
    afficherListePrets();

});
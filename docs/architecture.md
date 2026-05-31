# Architecture MVP catalogue Natagora

## Objectif
Transformer la landing en catalogue dynamique avec creation de promenades via admin minimal.

## Choix techniques
- Backend: API PHP + MySQL (compatible OVH mutualise)
- Front public: pages HTML/JS dynamiques (catalogue et fiche)
- Admin: page HTML/JS minimaliste
- Reservation: mode `link`, `iframe` ou `hybrid` (recommande)

## Domaines fonctionnels
- Familles fixes: `decouverte`, `thematique`, `sur-mesure`
- Produits reservables: `decouverte`, `thematique`
- `sur-mesure`: redirection vers contact
- Une promenade peut posseder plusieurs occurrences (dates)

## Evolutivite prevue
- Ajout futur pages detaillees pour les lieux/reserves
- Ajout i18n possible via tables de traduction
- Ajout auth/admin securise plus tard sans casser l API
- Ajout media manager et upload cible en extension

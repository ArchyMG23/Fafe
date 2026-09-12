# MODE PRODUCTION — ACTIVATION DE LA PERSISTANCE FIREBASE NATIVE

## CONTEXTE CRITIQUE

Avant de chercher à supprimer, remplacer ou recréer la base de données actuelle, il faut comprendre son rôle dans le projet.

L'objectif initial était de faire en sorte que **toutes les données de l'application FAFE soient réellement enregistrées et conservées dans Firebase**, afin de disposer temporairement :

* d'une base de données persistante ;
* d'un stockage fiable des données pendant les tests ;
* d'une sauvegarde réelle de l'état de l'application ;
* d'un système permettant au module CMS intégré de sauvegarder durablement ses modifications ;
* d'une infrastructure permettant de poursuivre les mises à jour du projet sans perdre les données.

Une **base Firebase native/Firestore a maintenant été créée et est disponible**.

Il ne faut donc PLUS chercher à supprimer cette base, la remplacer, la contourner ou recréer une autre structure de données.

La priorité est désormais de **connecter correctement toute l'application à cette base Firebase existante et d'utiliser cette base comme source persistante réelle des données.**

---

# OBJECTIF PRINCIPAL

À partir de maintenant, l'application doit fonctionner avec une logique de **PERSISTANCE RÉELLE**.

Toute donnée créée, modifiée, supprimée ou enregistrée depuis l'application doit être traitée comme une donnée réelle et persistante.

Les données ne doivent plus être conservées uniquement :

* dans React state ;
* dans des variables locales ;
* dans des mocks ;
* dans localStorage lorsque Firestore est approprié ;
* dans des données statiques ;
* dans une simulation de sauvegarde ;
* dans un cache temporaire.

Firestore doit devenir la **source de vérité temporaire de l'application** jusqu'à la fin des tests et de la validation officielle du projet par la PCA.

---

# RÈGLE ABSOLUE

NE SUPPRIME PAS LA BASE FIREBASE EXISTANTE.

NE RECRÉE PAS UNE NOUVELLE BASE.

NE MODIFIE PAS L'ARCHITECTURE DE LA BASE DE MANIÈRE DESTRUCTIVE.

NE RÉINITIALISE PAS LES DONNÉES EXISTANTES.

NE REMPLACE PAS FIREBASE PAR SUPABASE POUR LE MOMENT.

NE REVIENS PAS À DES MOCKS POUR SIMULER LA PERSISTANCE.

Si une configuration Firebase existe déjà dans le projet, inspecte-la et réutilise-la.

Si une collection existe déjà, utilise-la au lieu d'en créer inutilement une deuxième.

Avant toute modification structurelle, vérifie ce qui existe réellement.

---

# ÉTAPE 1 — AUDIT COMPLET DE LA CONNEXION FIREBASE

Commence par analyser le projet actuel.

Identifie précisément :

1. la configuration Firebase ;
2. l'initialisation Firebase ;
3. l'initialisation Firestore ;
4. les fichiers/services responsables des opérations CRUD ;
5. les collections déjà utilisées ;
6. les fonctions de lecture ;
7. les fonctions d'écriture ;
8. les fonctions de modification ;
9. les fonctions de suppression ;
10. les données encore stockées uniquement localement ;
11. les données encore alimentées par des mocks ;
12. les modules qui prétendent sauvegarder alors qu'ils ne persistent pas réellement les données.

Ne modifie rien de destructif pendant cet audit.

---

# ÉTAPE 2 — FIRESTORE COMME SOURCE DE VÉRITÉ

Configure l'application afin que Firestore soit la source persistante principale pour les données métier.

Le principe doit être :

APPLICATION
↓
SERVICES / API FIREBASE
↓
FIRESTORE
↓
DONNÉES PERSISTANTES

Lorsqu'un utilisateur ajoute une donnée :

→ l'application écrit dans Firestore ;
→ Firestore confirme l'opération ;
→ l'interface met à jour son état ;
→ lors d'un refresh de la page, la donnée est relue depuis Firestore ;
→ lors d'une nouvelle session, la donnée est toujours disponible.

Lorsqu'un utilisateur modifie une donnée :

→ la modification est envoyée à Firestore ;
→ la modification est réellement enregistrée ;
→ l'interface reflète la nouvelle valeur ;
→ après actualisation, la nouvelle valeur doit toujours être présente.

Lorsqu'une donnée est supprimée :

→ la suppression est effectuée dans Firestore ;
→ l'interface est mise à jour ;
→ après actualisation, la donnée doit réellement avoir disparu.

---

# ÉTAPE 3 — MODULE CMS

Le module CMS est PRIORITAIRE.

Toutes les modifications effectuées depuis le CMS doivent être persistantes.

Cela concerne notamment :

* textes ;
* titres ;
* descriptions ;
* images ;
* vidéos ;
* liens ;
* boutons ;
* contenus des pages ;
* logo ;
* favicon ;
* icônes ;
* éléments de branding ;
* couleurs ;
* paramètres visuels ;
* contenus FR ;
* contenus EN ;
* sections institutionnelles ;
* contenus des actualités ;
* événements ;
* projets ;
* galerie ;
* informations affichées sur le site.

Lorsqu'un administrateur modifie un élément dans le CMS et clique sur « Enregistrer » :

1. vérifier les données ;
2. envoyer les données à Firestore ;
3. attendre la confirmation réelle de Firestore ;
4. afficher une confirmation de sauvegarde uniquement après réussite ;
5. conserver les données après refresh ;
6. recharger les données depuis Firestore lors de la prochaine ouverture du CMS.

Il est interdit d'afficher « sauvegardé » alors que seule la mémoire locale de l'application a été modifiée.

---

# ÉTAPE 4 — GESTION DES MÉDIAS

Le problème actuel de chargement indéfini des médias doit également être analysé.

Pour chaque média :

* vérifier où son URL est stockée ;
* vérifier si le fichier lui-même est stocké dans Firebase Storage ou ailleurs ;
* vérifier si Firestore contient correctement la référence au média ;
* vérifier les erreurs réseau ;
* vérifier les permissions ;
* vérifier les règles Firebase ;
* gérer correctement les états loading / success / error.

Un chargement qui échoue doit afficher une erreur identifiable et ne doit jamais rester bloqué indéfiniment.

Pour les images ou logos, l'enregistrement de la référence doit être persistant.

---

# ÉTAPE 5 — AUTRES MODULES DE L'APPLICATION

La persistance Firebase ne doit pas être limitée au CMS.

Audite également tous les modules existants de FAFE.

Cela inclut notamment :

### Site institutionnel

* pages ;
* actualités ;
* événements ;
* projets sociaux ;
* galerie ;
* informations de contact ;
* contenus multilingues.

### FAFE Hub

* profils membres ;
* informations de profil ;
* modifications de profil ;
* données des membres ;
* statut du membre ;
* informations d'adhésion.

### Marketplace

* produits ;
* catégories ;
* descriptions ;
* prix ;
* images ;
* stock ;
* statut des produits.

### Commandes

* panier si nécessaire ;
* commandes ;
* informations de commande ;
* statut ;
* historique ;
* évolution du stock après achat.

### Administration

* paramètres ;
* utilisateurs ;
* rôles ;
* droits ;
* données administratives.

Chaque opération d'ajout ou de modification doit être persistante.

---

# ÉTAPE 6 — PROFILS UTILISATEURS

Le problème précédemment identifié concernant les mises à jour de profil doit être corrigé.

Lorsqu'un membre modifie ses informations :

→ validation du formulaire ;
→ écriture Firestore ;
→ confirmation de réussite ;
→ actualisation de l'interface ;
→ lecture depuis Firestore ;
→ persistance après déconnexion/reconnexion et refresh.

Le profil ne doit jamais revenir à son ancienne version simplement parce que la page a été actualisée.

---

# ÉTAPE 7 — ADMINISTRATION ET SUPER ADMIN

Le compte SUPER_ADMIN doit continuer à être traité comme un compte administrateur et non comme un membre normal.

La connexion du SUPER_ADMIN doit permettre l'accès aux interfaces :

/admin

/admin/cms

et aux fonctionnalités administratives prévues.

La persistance Firebase ne doit pas casser le système de rôles.

Vérifier que le rôle réel du compte est correctement lu depuis la source de données utilisée par l'application.

Un SUPER_ADMIN ne doit pas être redirigé automatiquement vers le dashboard membre simplement parce qu'une donnée de profil manque ou parce que Firestore n'a pas encore été correctement interrogé.

---

# ÉTAPE 8 — SUPPRESSION DES MOCKS COMME SOURCE DE VÉRITÉ

Les données mockées peuvent rester temporairement dans le code uniquement lorsqu'elles servent de fallback technique clairement identifié.

Elles ne doivent cependant PLUS être la source principale des données.

Exemple interdit :

Produit ajouté → React state → refresh → produit disparu.

Exemple attendu :

Produit ajouté → Firestore → confirmation → refresh → produit toujours présent.

Même logique pour :

* CMS ;
* membres ;
* profils ;
* produits ;
* commandes ;
* actualités ;
* événements ;
* projets ;
* galerie ;
* paramètres.

---

# ÉTAPE 9 — GESTION DES ERREURS

Chaque opération Firebase doit avoir une vraie gestion d'erreur.

Pour chaque écriture :

try
→ opération Firestore
→ confirmation
→ mise à jour UI

catch
→ journalisation de l'erreur
→ message utilisateur clair
→ ne pas prétendre que la sauvegarde a réussi.

Les erreurs Firebase doivent être suffisamment détaillées pour permettre leur diagnostic pendant la phase de test.

---

# ÉTAPE 10 — VÉRIFICATION DES PERMISSIONS FIREBASE

Vérifie également les règles Firestore et les permissions nécessaires.

L'objectif n'est PAS d'ouvrir inutilement la base au public.

Les règles doivent permettre aux utilisateurs autorisés d'effectuer les opérations prévues par l'application tout en empêchant les accès non autorisés.

Le SUPER_ADMIN doit disposer des droits nécessaires aux opérations administratives.

Les membres doivent uniquement pouvoir modifier les données qui leur appartiennent ou auxquelles leur rôle leur donne accès.

---

# ÉTAPE 11 — TEST DE PERSISTANCE OBLIGATOIRE

Une fonctionnalité ne doit être considérée comme fonctionnelle que si elle survit à un refresh.

Effectue systématiquement les tests suivants :

TEST A
Créer une donnée.
→ vérifier Firestore.
→ actualiser la page.
→ vérifier que la donnée existe toujours.

TEST B
Modifier une donnée.
→ vérifier Firestore.
→ actualiser.
→ vérifier que la modification est toujours présente.

TEST C
Supprimer une donnée.
→ vérifier Firestore.
→ actualiser.
→ vérifier que la donnée reste supprimée.

TEST D
Se déconnecter.
→ se reconnecter.
→ vérifier que les données sont toujours présentes.

TEST E
Modifier une donnée depuis le CMS.
→ fermer le CMS.
→ rouvrir le CMS.
→ vérifier que la modification est toujours présente.

TEST F
Modifier le contenu.
→ ouvrir la partie publique du site.
→ vérifier que le contenu persistant est bien utilisé.

---

# ÉTAPE 12 — NE PAS MIGRER VERS SUPABASE MAINTENANT

La migration éventuelle vers Supabase est une étape FUTURE.

Elle ne doit pas être exécutée maintenant.

Pour la phase actuelle :

FIREBASE / FIRESTORE = BASE PERSISTANTE TEMPORAIRE OFFICIELLE DU PROJET

Cette architecture restera en place jusqu'à :

1. la finalisation des fonctionnalités ;
2. les tests complets ;
3. la démonstration ;
4. la validation du projet par la PCA.

La migration vers une autre infrastructure pourra être étudiée après cette validation.

---

# ÉTAPE 13 — COMPATIBILITÉ AVEC LES MISES À JOUR

Le projet étant actuellement relié à un processus de développement et de mises à jour successives, il est impératif que les nouvelles versions de l'application ne détruisent pas les données existantes.

Une mise à jour du frontend ne doit jamais provoquer :

* suppression des collections ;
* réinitialisation des données ;
* remplacement automatique par les mocks ;
* perte des paramètres CMS ;
* perte des profils ;
* perte des produits ;
* perte des commandes.

Les données doivent être découplées du cycle de déploiement de l'application.

Principe :

MISE À JOUR DU CODE
≠
SUPPRESSION DES DONNÉES

---

# ÉTAPE 14 — CONSERVER LA STRUCTURE ACTUELLE AUTANT QUE POSSIBLE

Il ne s'agit PAS de reconstruire FAFE.

Il s'agit de corriger le projet existant.

Avant de créer une nouvelle architecture, cherche d'abord à utiliser les services, hooks, composants et collections déjà présents.

Évite toute duplication inutile.

Si une fonction Firebase existe déjà mais ne fonctionne pas correctement, corrige-la plutôt que d'en créer une deuxième.

---

# ÉTAPE 15 — RAPPORT FINAL OBLIGATOIRE

Après les corrections, fournis un rapport clair indiquant :

1. Firebase est-il correctement connecté ?
2. Firestore est-il réellement utilisé ?
3. Quelles collections sont utilisées ?
4. Quelles fonctionnalités sont maintenant persistantes ?
5. Le CMS sauvegarde-t-il réellement dans Firestore ?
6. Les médias fonctionnent-ils correctement ?
7. Les profils sont-ils persistants ?
8. Le Marketplace est-il persistant ?
9. Les commandes sont-elles persistantes ?
10. Le SUPER_ADMIN conserve-t-il ses droits ?
11. Les règles Firestore permettent-elles les opérations nécessaires ?
12. Existe-t-il encore des mocks utilisés comme source principale ?
13. Existe-t-il encore des données uniquement stockées localement ?
14. Quels problèmes restent éventuellement à corriger ?

NE DÉCLARE PAS UNE FONCTIONNALITÉ « TERMINÉE » SI ELLE N'A PAS ÉTÉ TESTÉE RÉELLEMENT.

---

# CRITÈRE FINAL DE RÉUSSITE

Le projet doit maintenant être capable de fonctionner comme une véritable application persistante.

Une donnée créée aujourd'hui doit encore être disponible demain.

Une modification effectuée dans le CMS doit rester après actualisation.

Une mise à jour du code ne doit pas supprimer les données.

Les données doivent être stockées dans la base Firebase native existante.

Le CMS doit réellement écrire et lire ces données.

Le frontend doit récupérer les données depuis Firestore au chargement.

Firebase doit donc être considéré comme la **source de vérité persistante temporaire du projet FAFE jusqu'à la validation PCA**.

IMPORTANT :
Ne supprime aucune donnée existante.
Ne supprime pas la base.
Ne recrée pas une autre base.
Ne migre pas vers Supabase.
Ne remplace pas Firestore par des mocks.
Corrige et connecte correctement l'architecture existante à la base Firebase native actuellement créée.

---

# MODE PRODUCTION — CMS UNIFIÉ DE TOUT LE SITE FAFE
ALIGNÉ SUR LE DESIGN ACTUEL, Y COMPRIS LA MARKETPLACE

============================================================
OBJECTIF PRINCIPAL
============================================================

Le CMS actuel de FAFE n'est plus conforme à la version actuelle
du site.

Le frontend a évolué et possède maintenant un nouveau design,
de nouvelles sections, de nouvelles interfaces et une nouvelle
organisation visuelle.

Le CMS doit donc être réaligné sur LA VERSION ACTUELLE ET RÉELLE
DU SITE.

IMPORTANT :

Le CMS ne doit PAS être construit à partir de l'ancien design.

Il doit être construit à partir des composants, pages, sections,
données et fonctionnalités actuellement présents dans le frontend.

Le même principe doit être appliqué à la MARKETPLACE.

Le CMS doit permettre à l'administrateur de gérer l'ensemble
du contenu administrable du site actuel, de la partie
institutionnelle jusqu'à la Marketplace.

============================================================
1. PRINCIPE D'ARCHITECTURE
============================================================

La logique cible est :

                    FIRESTORE
                       ↑ ↓
                     CMS
                       ↑ ↓
              APPLICATION FAFE
                 /          \
                /            \
       SITE INSTITUTIONNEL   MARKETPLACE
                \
                 FAFE HUB

Firestore constitue actuellement la source persistante
temporaire des données du projet jusqu'à la validation PCA.

Le CMS est l'interface d'administration.

Le frontend est l'interface publique.

Ils doivent utiliser les mêmes données persistantes.

============================================================
2. RÈGLE FONDAMENTALE
============================================================

TOUT ÉLÉMENT DU SITE QUI EST PRÉVU POUR ÊTRE ADMINISTRABLE
DOIT ÊTRE GÉRABLE DEPUIS LE CMS.

Cela comprend notamment :

- textes ;
- titres ;
- descriptions ;
- images ;
- vidéos ;
- logos ;
- favicon ;
- icônes ;
- boutons ;
- liens ;
- contenus des cartes ;
- contenus des sections ;
- contenus multilingues ;
- actualités ;
- événements ;
- projets ;
- galerie ;
- entrepreneures ;
- profils ;
- produits ;
- catégories ;
- prix ;
- stocks ;
- commandes ;
- paramètres de présentation ;
- éléments de navigation lorsque prévu.

============================================================
3. MAIS NE PAS TRANSFORMER LE CODE EN CMS
============================================================

ATTENTION :

"CMS complet" ne signifie PAS que chaque propriété technique
du frontend doit devenir un champ administrable.

Ne pas exposer inutilement :

- CSS interne ;
- classes React ;
- structure technique ;
- logique métier ;
- animations internes ;
- responsive breakpoints ;
- calculs ;
- composants techniques ;
- fonctions internes.

Le CMS doit gérer les DONNÉES et les PARAMÈTRES réellement
administrables.

Le design structurel reste dans le frontend.

============================================================
4. SITE INSTITUTIONNEL
============================================================

Le CMS doit correspondre à la version actuelle du site
institutionnel.

Prévoir une organisation claire :

ACCUEIL
- Hero actuel
- sections suivantes réellement présentes
- statistiques
- présentation
- entrepreneures
- appels à l'action
- autres sections réellement présentes

NOUS
- contenu institutionnel
- présentation
- mission
- vision
- valeurs
- équipe si présente
- coordonnées
- autres sections du design actuel

ACTUALITÉS
- articles
- images
- catégories
- dates
- auteurs
- contenus

ÉVÉNEMENTS
- événements
- dates
- lieux
- descriptions
- images
- liens
- statut

PROJETS SOCIAUX
- projets
- descriptions
- images
- objectifs
- statuts
- contenus

GALERIE
- images
- vidéos
- catégories
- titres
- descriptions

DONS
- contenus
- appels à l'action
- informations nécessaires
- liens
- paramètres administrables

REJOINDRE
- contenu
- informations
- formulaires
- appels à l'action

Cette organisation doit être adaptée à la structure réellement
présente dans le nouveau frontend.

============================================================
5. HERO ACTUEL
============================================================

Le nouveau Hero montré dans la référence visuelle doit être
entièrement compatible avec le CMS.

Le CMS doit permettre de gérer :

- badge ;
- titre ;
- description ;
- CTA principal ;
- CTA secondaire ;
- entrepreneures mises en avant ;
- images ;
- noms ;
- activités ;
- secteurs ;
- pays ;
- liens vers profils ;
- ordre d'affichage ;
- activation/désactivation.

Le compteur et les indicateurs du carousel doivent être
calculés automatiquement.

Ils ne doivent pas être saisis manuellement.

============================================================
6. TOUTES LES AUTRES SECTIONS DU NOUVEAU DESIGN
============================================================

Ne pas s'arrêter au Hero.

Analyser TOUTES les pages du frontend actuel.

Pour chaque page :

1. identifier les sections ;
2. identifier les contenus ;
3. identifier les données dynamiques ;
4. identifier les données actuellement codées en dur ;
5. identifier les médias ;
6. identifier les boutons ;
7. identifier les liens ;
8. identifier les éléments administrables ;
9. créer ou adapter les champs CMS correspondants.

Le CMS doit représenter la structure actuelle du site.

============================================================
7. MARKETPLACE — PRIORITÉ ÉGALEMENT IMPORTANTE
============================================================

La MARKETPLACE doit également être entièrement alignée sur
son design actuel.

Le CMS ne doit pas gérer une ancienne version de la Marketplace.

Analyser le frontend réel de la Marketplace et construire
l'administration à partir de celui-ci.

Le CMS doit permettre aux administrateurs autorisés de gérer :

PRODUITS
- nom ;
- description ;
- prix ;
- prix promotionnel si prévu ;
- images ;
- catégorie ;
- stock ;
- disponibilité ;
- statut ;
- ordre d'affichage ;
- informations complémentaires réellement présentes.

CATÉGORIES
- nom ;
- description ;
- image si présente ;
- statut ;
- ordre.

PRODUITS MIS EN AVANT
- sélection ;
- ordre ;
- activation/désactivation.

STOCK
- quantité ;
- disponibilité ;
- statut.

COMMANDES
- liste ;
- détails ;
- produits ;
- quantités ;
- montant ;
- client ;
- statut ;
- date ;
- historique si prévu.

============================================================
8. DESIGN MARKETPLACE
============================================================

Le CMS doit également tenir compte de la structure visuelle
réelle de la Marketplace.

Exemples de paramètres potentiellement administrables :

- bannière ;
- titre ;
- sous-titre ;
- produits mis en avant ;
- catégories visibles ;
- textes ;
- images ;
- appels à l'action ;
- sections promotionnelles.

Mais uniquement si ces éléments existent réellement
dans le frontend actuel.

NE PAS inventer une Marketplace différente.

NE PAS revenir à l'ancien design.

============================================================
9. MARKETPLACE INDÉPENDANTE DU HUB
============================================================

Conserver la règle fonctionnelle suivante :

La Marketplace est indépendante de l'adhésion FAFE.

Un utilisateur doit pouvoir consulter la Marketplace sans
être membre du FAFE Hub.

Le CMS doit donc gérer la Marketplace comme un module
administratif distinct du système d'adhésion.

============================================================
10. CMS ET FIRESTORE
============================================================

Toutes les données administrables doivent être persistantes.

Exemple :

CMS
↓
Firestore
↓
Marketplace
↓
Site public

Lorsqu'un administrateur ajoute un produit :

CMS
→ Firestore
→ produit disponible après actualisation.

Lorsqu'il modifie un produit :

CMS
→ Firestore
→ nouvelle information affichée sur la Marketplace.

Lorsqu'il supprime/désactive un produit :

CMS
→ Firestore
→ modification visible sur la Marketplace.

Même principe pour les contenus institutionnels.

============================================================
11. UNE SEULE SOURCE DE VÉRITÉ
============================================================

Éliminer les incohérences du type :

CMS possède une donnée A
mais frontend affiche une donnée B.

Ou :

CMS possède quatre entrepreneures
mais frontend affiche quatre autres données codées en dur.

Ou :

CMS possède un produit
mais Marketplace utilise une liste mock différente.

Une donnée administrable doit avoir une source de vérité
claire.

La source persistante actuelle est FIRESTORE.

============================================================
12. DONNÉES CODÉES EN DUR
============================================================

Auditer le frontend pour détecter les données qui sont
actuellement codées en dur alors qu'elles devraient être
administrables.

Exemples :

const products = [...]
const entrepreneurs = [...]
const heroData = {...}
const news = [...]
const events = [...]

Si ces données correspondent à du contenu réel administrable,
elles doivent être remplacées par une récupération depuis
Firestore.

Attention :

Ne pas supprimer automatiquement les données codées en dur.

Les utiliser comme référence pour construire ou initialiser
les données persistantes si nécessaire.

============================================================
13. FIRESTORE — NE PAS DÉTRUIRE
============================================================

La base Firebase native actuellement créée doit être conservée.

NE PAS :

- supprimer la base ;
- supprimer les collections sans analyse ;
- recréer une nouvelle base ;
- migrer vers Supabase ;
- réinitialiser Firestore ;
- remplacer Firestore par localStorage ;
- revenir aux mocks.

La base Firebase sert actuellement de base persistante
temporaire jusqu'à la validation PCA.

============================================================
14. PERSISTANCE
============================================================

Chaque opération administrative doit réellement persister.

AJOUT :

CMS
→ validation
→ Firestore
→ confirmation
→ frontend

MODIFICATION :

CMS
→ validation
→ Firestore
→ confirmation
→ frontend

SUPPRESSION :

CMS
→ confirmation
→ Firestore
→ frontend

Après refresh :

les données doivent rester.

Après déconnexion/reconnexion :

les données doivent rester.

Après une nouvelle version du frontend :

les données doivent rester.

============================================================
15. MÉDIAS
============================================================

Tous les médias administrables doivent être correctement
reliés au système de stockage approprié.

Vérifier :

- upload ;
- URL ;
- référence ;
- affichage ;
- remplacement ;
- suppression ;
- chargement ;
- erreurs.

Aucun média ne doit rester bloqué sur un chargement infini.

============================================================
16. MULTILINGUE
============================================================

Le CMS doit respecter le système FR / EN du site actuel.

Chaque contenu réellement multilingue doit pouvoir être
géré dans les deux langues.

Le frontend doit récupérer la bonne langue.

============================================================
17. RÔLES ET SÉCURITÉ
============================================================

Le SUPER_ADMIN doit conserver ses privilèges.

Il doit pouvoir accéder à :

/admin

/admin/cms

et gérer les modules autorisés.

Les administrateurs secondaires ne doivent recevoir que
les permissions prévues.

Les membres normaux ne doivent pas obtenir les droits
administratifs.

============================================================
18. STRUCTURE DU CMS
============================================================

Créer une interface claire.

Exemple :

CMS
│
├── Tableau de bord
│
├── Site
│   ├── Accueil
│   ├── Nous
│   ├── Actualités
│   ├── Événements
│   ├── Projets sociaux
│   ├── Galerie
│   ├── Dons
│   └── Rejoindre
│
├── Entrepreneures
│
├── Membres
│
├── FAFE Hub
│
├── Marketplace
│   ├── Produits
│   ├── Catégories
│   ├── Stock
│   ├── Commandes
│   └── Mise en avant
│
├── Médias
│
├── Branding
│
└── Paramètres

Cette structure doit être adaptée aux modules réellement
présents dans le projet.

============================================================
19. APERÇU
============================================================

Lorsque c'est pertinent, permettre à l'administrateur de
voir un aperçu du résultat avant ou après sauvegarde.

L'objectif est que l'administrateur puisse comprendre :

"Ce que je modifie dans le CMS correspond à ce que je vois
sur le site."

============================================================
20. AUDIT AUTOMATIQUE DU PROJET
============================================================

Avant de modifier le code, produire une cartographie :

PAGE
→ SECTION
→ COMPOSANT
→ DONNÉES
→ SOURCE ACTUELLE
→ CHAMP CMS
→ COLLECTION FIRESTORE

Exemple :

Accueil
→ Hero
→ HeroComponent
→ hero.title
→ hardcoded
→ hero.title
→ home

Marketplace
→ Produits
→ ProductGrid
→ products
→ mockData
→ products
→ products

Cette cartographie permettra de détecter toutes les
désynchronisations.

============================================================
21. NE PAS SUPPRIMER L'ANCIEN SYSTÈME AVANT VALIDATION
============================================================

Les anciennes structures peuvent contenir des données utiles.

Les identifier.

Les comparer avec le nouveau modèle.

Migrer uniquement les données nécessaires.

Ne rien supprimer de manière destructive sans certitude
sur son utilisation.

============================================================
22. TEST GLOBAL
============================================================

Tester au minimum :

SITE :

modifier le Hero
→ sauvegarder
→ refresh
→ vérifier.

modifier une section
→ sauvegarder
→ refresh
→ vérifier.

modifier une actualité
→ sauvegarder
→ vérifier.

modifier un événement
→ sauvegarder
→ vérifier.

modifier un projet
→ sauvegarder
→ vérifier.

modifier une image
→ sauvegarder
→ vérifier.

MARKETPLACE :

ajouter un produit
→ sauvegarder
→ refresh
→ vérifier.

modifier un produit
→ sauvegarder
→ vérifier.

modifier son prix
→ vérifier.

modifier son stock
→ vérifier.

modifier son image
→ vérifier.

désactiver le produit
→ vérifier qu'il n'est plus présenté comme disponible.

COMMANDES :

créer une commande de test
→ vérifier Firestore
→ vérifier le CMS
→ vérifier le statut.

============================================================
23. CRITÈRE FINAL
============================================================

Le résultat final doit respecter cette règle :

LE CMS DOIT ÊTRE LE PANNEAU DE CONTRÔLE DU SITE ACTUEL.

Pas de l'ancien site.

Pas d'une version intermédiaire.

Pas d'une maquette.

Pas de mocks.

Pas d'une ancienne structure.

Le CMS doit contrôler les données administrables du :

SITE INSTITUTIONNEL
+
FAFE HUB
+
MARKETPLACE
+
BRANDING
+
MÉDIAS
+
CONTENUS
+
DONNÉES ADMINISTRATIVES AUTORISÉES

Tout en respectant les rôles et permissions.

============================================================
24. RÉSULTAT ATTENDU
============================================================

Je dois pouvoir ouvrir le CMS et comprendre immédiatement :

"Voici le site que je vois actuellement."

Je dois pouvoir modifier depuis le CMS les contenus
réellement visibles sur le nouveau site.

Je dois pouvoir modifier les produits de la Marketplace
réellement visible.

Je dois pouvoir ajouter mes propres données.

Je dois pouvoir remplacer les données de démonstration.

Je dois pouvoir sauvegarder.

Je dois pouvoir actualiser.

Et mes modifications doivent toujours être présentes.

============================================================
INSTRUCTION FINALE
============================================================

TRAVAILLE SUR LE PROJET EXISTANT.

NE RECONSTRUIS PAS FAFE.

NE RESTAURE PAS L'ANCIEN DESIGN.

NE SUPPRIME PAS FIRESTORE.

NE MIGRE PAS VERS SUPABASE POUR LE MOMENT.

N'UTILISE PAS LES MOCKS COMME SOURCE DE VÉRITÉ.

ANALYSE LE FRONTEND ACTUEL.

IDENTIFIE SON DESIGN RÉEL.

IDENTIFIE SES COMPOSANTS.

IDENTIFIE SES DONNÉES.

ALIGNE LE CMS SUR CE FRONTEND.

ALIGNE LA MARKETPLACE SUR LE MÊME PRINCIPE.

CONNECTE LE TOUT À FIRESTORE.

ET GARANTIS LA PERSISTANCE DES DONNÉES.

AVANT DE CONSIDÉRER LE TRAVAIL TERMINÉ, EFFECTUE UN AUDIT
DE COHÉRENCE ENTRE :

FRONTEND ↔ CMS ↔ FIRESTORE

ET CORRIGE TOUTE INCOHÉRENCE DÉTECTÉE.

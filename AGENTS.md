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

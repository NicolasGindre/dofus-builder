# Tutoriel

**Dofus Minmax** est une application qui calcule les meilleurs builds dans Dofus.  
Elle est divisée en 3 sections :

- **Poids / Min / Max (paramètres)** : Définissez ce que vous souhaitez dans votre build.
- **Sélection d’objets** : Sélectionnez les objets à inclure dans le calcul des combinaisons.
- **Résultats des builds** : Affiche les meilleures combinaisons d’objets calculées.

Le principe est qu’en sélectionnant uniquement les objets les plus intéressants pour les caractéristiques souhaitées, il devient possible de calculer toutes les combinaisons possibles et de trouver les meilleures.

Mon but est que cette application soit la plus complète possible, mais je souhaite aussi que les joueurs plus occasionnels puissent l’utiliser. Voici donc le

## TL;DR :

- Cliquez sur le poids des caractéristiques que vous voulez dans votre build. Ne touchez pas au Min / Max.
- Indiquez votre niveau
- Cliquez sur **« Calculer les meilleurs objets »**
- Cliquez sur **« Sélection rapide »**
- Ajoutez les exos PA / PM / Range si nécessaire
- Cliquez sur **« Calculer les meilleurs builds »**… et attendez
- Comparez les résultats
- Recommencez si nécessaire jusqu’à être satisfait

---

# Utilisation basique

## Paramètres de Poids / Min / Max

Les **poids** servent à calculer la valeur des objets, des panoplies et des builds.  
Chaque caractéristique est multipliée par son poids (0 si le poids n’est pas défini) pour obtenir la valeur finale.

Seules les caractéristiques maximales possibles des objets sont prises en compte.  
Les caractéristiques dérivées comme le tacle, la fuite, l’initiative… sont calculées pour chaque objet et panoplie au chargement. Cela signifie que vous ne devez mettre du poids dans une caractéristique que si vous valorisez son effet de base, pas ses caractéristiques dérivées.  
Par exemple, ne mettez du poids en sagesse que si vous valorisez le bonus d’expérience qu’elle donne. Mettre du poids dans une caractéristique dérivée affecte déjà sa caractéristique d’origine par ricochet.

**Min** est une limite stricte : si la caractéristique finale d’un build est en dessous de la valeur saisie, il sera ignoré (et la valeur du build devient 0).  
**Max** est une limite souple : si une caractéristique dépasse la valeur Max, elle sera plafonnée à cette valeur, ce qui limite naturellement sa contribution à la valeur du build.

Cliquez sur le poids des caractéristiques pour ajouter la valeur par défaut. Ajustez si vous avez une idée de ce que vous souhaitez. Sinon, vous pourrez toujours revenir dessus plus tard. Vous pouvez aussi retirer un poids en double-cliquant dessus.

Les paramètres **Min** pour **PA, PM et Portée** sont les plus importantes si vous savez ce que vous voulez.

Une fois vos poids et limites Min / Max définis, cliquez sur **« Calculer les meilleurs objets »**. N’oubliez pas de définir le niveau souhaité.

---

## Sélection d’objets

Toute la base de données des objets et panoplies est utilisée comme référence à chaque fois que vous cliquez sur **« Calculer les meilleurs objets »**.

Les objets ayant la plus haute valeur pour chaque catégorie sont affichés dans la première colonne.  
Si un objet appartient à une panoplie, il affichera aussi la valeur **« Avec Panoplie »**.  
Survoler un objet affiche ses informations.  
Cliquer sur un objet l’ajoute à la sélection.

Si un objet est en dessous du niveau souhaité, il est ignoré.  
Un objet qui possède une condition n'affecte pas sa valeur. Cependant, si une condition de PA / PM est incompatible avec un paramètre Min, il est ignoré.  
Par exemple définir 11 PA en Min ignorera les objets PA < 11. Définir 12 PA et 6 PM ignorera les objets PA < 12 ou PM < 6.

Les effets spéciaux des objets n’affectent pas leur valeur. Il peut être nécessaire de verrouiller un objet pour obtenir des résultats qui l’utilisent si une grande partie de sa valeur vient d’un effet spécial.

Les panoplies avec le score le plus élevé (fonction expliquée plus bas) sont affichées dans la seconde colonne.  
Survoler une panoplie montre ses bonus et la valeur apportée pour chaque nombre d’objets équipés. Les valeurs affichées sont **incrémentales** : elles montrent la valeur ajoutée pour chaque objet supplémentaire.

Les **20 meilleures panoplies** sont affichées par défaut.  
Si vous sélectionnez un objet appartenant à une panoplie hors du top 20, elle sera quand même affichée en bas de la colonne.  
En cliquant sur **« Sélectionnés »** à côté du top 20, seules les panoplies contenant un objet sélectionné seront affichées.

La troisième colonne montre les objets sélectionnés par catégorie. Toutes les combinaisons possibles parmi cette sélection seront testées.  
En bas de cette colonne, le nombre total de combinaisons est affiché, ainsi que le temps estimé pour les calculer (K = mille, M = million, B = milliard, T = trillion).

L’icône œil fait automatiquement défiler la vue jusqu’à l’objet correspondant dans les autres colonnes.

Chaque objet peut être **verrouillé**, ce qui impose sa présence dans toutes les combinaisons à calculer. Cela peut énormément reduire le nombre de combinaisons. Un seul objet par catégorie peut être verrouillé (deux pour les anneaux, six pour les Dofus).

Le but est de sélectionner autant d’objets et de panoplies intéressants que possible tout en gardant un nombre de combinaisons raisonnable.

Deux approches :

- Utiliser **« Sélection rapide »** : ajoute tous les objets visibles des panoplies visibles + l’objet à la plus haute valeur par catégorie (hors Dofus/Trophées). Plus rapide mais potentiellement moins optimal.
- Sélectionner manuellement les objets et panoplies qui semblent pertinents.

Ensuite, vérifiez le total de combinaisons. Retirez éventuellement les panoplies les moins bonnes si le nombre est trop élevé. Gardez-le sous **100 millions** pour un premier essai. Il n'y a pas de problème particulier à calculer un grand nombre de combinaisons : cela prendra juste plus de temps et chauffera votre machine.

En bas de la première colonne, indiquez si vous prévoyez d’avoir des exos PA/PM/PO dans votre build.

Puis cliquez sur **« Calculer les meilleurs builds »**.

Pendant le calcul, la progression et la vitesse s’affichent.  
Vous pouvez enregistrer la vitesse de traitement pour estimer plus précisément les futurs calculs.

Une fois terminé, les résultats apparaissent dans la section **Builds**.

---

## Builds

Les **500 meilleurs résultats** sont affichés, triés par valeur. Si aucun résultat ne satisfait les paramètres Min ou autres conditions, la liste sera vide.

Si une caractéristique et son poids sont nuls, la caractéristique n’est pas affichée.  
Si une caractéristique est différente de 0 avec un poids nul, elle est affichée en faible opacité, indiquant que sa valeur n’influence pas le build.

Les caractéristiques sont regroupées en 3 ensembles : **Utilité**, **Offensif** et **Défensif**.  
La valeur des caractéristiques de chaque groupe sont additionnées et affichées en haut de chaque groupe.

Une caractéristique dépassant son paramètre Max est plafonnée ; une flèche grise indique la valeur d’origine.  
Une caractéristique infèrieur à son paramètre Min est affichée en rouge et la valeur du build devient 0.

Une des fonctionnalités principales de cette section est de **comparer un build**.  
Les autres builds afficheront les différences par rapport au build comparé. Sont affichés pour chaque build les différences de :

- Valeur du build
- Valeur de chaque groupe de caractéristique
- Caractéristiques
- Objets
- Panoplies

Les **conditions** du build sont affichées sous les caractéristiques. Si une condition est englobée par une autre, elle est supprimée. Ex: PA < 11 et PA < 10 devient juste PA < 10.

Si un build ne respecte pas une conditions de : **Vitalité, Force, Chance, Intelligence, Agilité, Sagesse** → elle est affichée avec un fond jaune.  
S’il ne respecte pas une condition de : **Niveau** ou **bonus de panoplie < 3** → condition affichée sur fond rouge et valeur = 0.  
Toutes les autres conditions (PA, PM, [PA ou PM], Portée, Invocations) se comportent comme un paramètre Max : la caractéristique est plafonnée.

Vous pouvez exporter un build vers **DofusDB** ou **DofusBook**.

Les 500 builds sont recalculés dynamiquement si vous modifiez les paramètres de poids ou Min/Max, le niveau ou les exos.  
Un paramètre Min plus restrictif peut rendre des builds invalides et mettre leur valeur à 0, ayant pour conséquence de les descendre en bas de liste.

Cette fonctionnalité permet d’éviter de relancer de gros calculs pour chaque ajustement mineur.  
Attention cependant : si les paramètres changent fortement, il pourrait être nécessaire de recalculer les meilleurs objets, car des objets plus pertinents pourraient exister, ou de meilleures combinaisons calculées.

---

## Navigation

Chaque colonne dispose de sa propre zone de défilement. En survolant une colonne, le défilement principal est remplacé.  
Pour défiler la page, éloignez le curseur des colonnes ou utilisez la barre de navigation à gauche.

Les infobulles des objets/panoplies deviennent défilables lorsqu’elles sont trop grandes. Le défilement agit alors sur la bulle, pas la page.

Dans les résultats, utilisez **↑** **↓** pour naviguer rapidement et **←** **→** pour changer de page.

---

# Builds sauvegardés

Vous pouvez sauvegarder un build. Ils apparaissent dans la section build à côté de **« Résultats »**.  
Comme les résultats, leurs valeurs sont mises à jour dynamiquement selon les paramètres.

Si un build sauvegardé est identique à un résultat d’une nouvelle recherche, il reprend son nom sauvegardé.

Vous pouvez également choisir un build sauvegardé comme référence de comparaison.

---

# Recherches sauvegardées

Tous les paramètres de recherche sont encodées dans l’URL. Vous pouvez donc copier l’URL, la coller dans un nouvel onglet et la modifier pour comparer deux recherches.

Les builds sauvegardés sont synchronisés entre vos onglets.  
Ainsi vous pouvez effectuer une variante d'une recherche dans un second onglet, sauvegarder un build, puis le comparer dans le premier onglet.

Vous pouvez sauvegarder une recherche dans la barre supérieure. Donnez-lui un nom (ex : **« Panda tank »**). Le titre de la page est mis à jour avec ce nom.  
Si vous modifiez votre recherche, le texte devient orange. Sauvegardez-la à nouveau pour repasser en vert.

Pour charger une recherche, cliquez sur le nom de la recherche en haut à gauche pour faire apparaître toutes les recherches sauvegardées.  
Au chargement de la page, si l’URL correspond exactement à une recherche sauvegardée, elle est chargée automatiquement.

**Attention :** les recherches et builds sauvegardés sont stockés uniquement dans le stockage local du navigateur. Ils peuvent être perdus si vous le videz.

Pour éviter de perdre une recherche : enregistrez l’URL dans vos favoris.  
Pour éviter de perdre un build : exportez-le sur votre site Dofus favori. Vous pouvez aussi exporter un build en tant que nouvelle recherche et sauvegarder son URL dans vos favoris.

La recherche est sauvegardée dans l'historique de votre navigateur lorsque vous :

- Cliquez sur **« Calculer les Meilleurs Objets »** ou **« Calculer les Meilleurs Builds »**
- Créez, Chargez, Sauvegardez ou partagez une recherche

Vous pouvez revenir sur une précédente version de votre recherche en naviguant dans l'historique. Cela conserve les résultats d'une recherche.

---

# Panoplies

## Valeur par objet

Pour calculer la valeur qu’une panoplie apporte à un objet, on calcule la valeur de chaque bonus, puis on la divise par le nombre d’objets nécessaires pour l’obtenir. La meilleure valeur par objet est retenue.  
Elle est affichée sous **« Meilleure valeur par objet »** et ajoutée à chaque objet de la panoplie.

Dans la plupart des cas, cette valeur max correspond à la panoplie complète, mais parfois un palier intermédiaire peut offrir une meilleure moyenne.

## Score

Pour calculer les meilleures panoplies, une fonction de score est utilisée. Il n'est pas obligatoire de la comprendre, mais voici l’explication :

Pour chaque objet de la panoplie, on soustrait la valeur entre cet objet et le meilleur objet de sa catégorie. Cela représente la valeur perdue en n’utilisant pas le meilleur objet. On trie ces pertes de la plus grande à la plus petite.  
Pour chaque bonus de panoplie, on calcule la valeur du bonus moins la valeur perdue par les X premiers objets nécessaires, puis on divise par le nombre total d’objets de la panoplie. On retient la meilleure valeur obtenue. C’est le score final.

L’idée : classer les panoplies selon la valeur maximale qu’elles peuvent apporter, en tenant compte de la perte potentielle liée au fait de ne pas équiper les meilleurs objets de chaque catégorie.

Un score négatif ne signifie pas nécessairement qu’une panoplie est mauvaise : elle peut être indispensable pour satisfaire un paramètre Min (souvent les PA), éviter d'atteindre un paramètre Max, ou satisfaire une condition.

Un point négatif de cette fonction de score est que le meilleur objet d’une catégorie peut être trop cher ou non souhaité. Dans ces cas, une panoplie qui contient un objet de cette catégorie pourrait être sous-classée, même si elle est pertinente.

Il ne faut pas prendre cette fonction de score comme une vérité absolue. Il peut être nécessaire d'ajouter des panoplies avec un score plus faible, ou retirer des panoplies qui n'ont pas de sens en fonction de la recherche.

## Panoplies partiellement sélectionnables

Si une panoplie contient un objet non sélectionnable parce que :

- Un objet dépasse votre niveau
- Un objet avec condition est incompatible avec les paramètres Min
- Un objet est dans une catégorie déjà verrouillée

Les fonction de valeur par objet et de score en prennent compte : seules les combinaisons possibles sont conservées.

Si une seule pièce (ou aucune) est sélectionnable, le score devient **-Infini**, et la panoplie n’est pas affichée.

Après avoir verrouillé un objet, il peut être utile de recalculer les meilleurs objets pour obtenir des scores mis à jour. Cela vous indique : « étant donné les objets que vous avez verrouillés, voici les meilleurs objets et panoplies qui s’adaptent aux emplacements restants ». Vous pouvez même utiliser cette méthode pour construire un build en verrouillant progressivement des objets ou des panoplies puis en recalculant les meilleurs objets à chaque étape.

## Sélection rapide

La **sélection rapide** ajoute tous les objets visibles des panoplies visibles. Si un objet est non sélectionnable (niveau ou Min incompatible), il n’est pas ajouté.

Vous pouvez ajuster la quantité de panoplies affichées (Top 20) pour ajouter plus ou moins d’objets.

La sélection rapide ajoute également l'objet ayant la valeur la plus élevée dans chaque catégorie (2 pour les anneaux).  
La logique : si cet objet est le meilleur de sa catégorie hors panoplie, en choisir un autre apporte à priori moins de valeur. Bien sûr, si les caractéristiques d’un objet interagissent avec des valeurs plafonnées, cela peut avoir un impact important. Mais comme il s’agit d’une sélection rapide, il est préférable de vérifier quels objets ont été ajoutés et d’en ajouter d’autres si vous souhaitez obtenir de meilleurs résultats.

## Panoplie Momore

La panoplie **Momore** est la seule panoplie ayant des conditions. Cela fonctionne comme avec ceux des objets :  
Si vos paramètres Min de PM / Portée / Invocations sont incompatibles avec le bonus de panoplie, les fonctions de score et de valeur par objet en tiendront compte et excluront les combinaisons concernées.

Sinon, la valeur finale du build sera plafonnée en fonction du bonus de panoplie. Si vous voulez comparer des builds contenant cette panoplie, il est recommandé de mettre un poids faible ou nul aux caractéristiques plafonnées par la panoplie.

---

# Dofus / Trophées

Les **Dofus** et **Trophées** peuvent être inclus dans les calculs de combinaison.  
Leur utilité principale est d’évaluer les builds influencés par des caractéristiques naturellement plafonnées (Ocre, Vulbis, Sylvestre…).

## Combinaisons

Il est possible de calculer plusieurs combinaisons, mais attention : le nombre augmente exponentiellement et n’a généralement que peu d’intérêt, à moins d'avoir un besoin particulier. Il est recommandé et plus simple de garder une seule combinaison de Dofus / Trophées par recherche.

- Sélection ≤ 6 → 1 combinaison
- 7 sélectionnés → 7 combinaisons
- 8 sélectionnés → 28 combinaisons
- 9 sélectionnés → 84 combinaisons

Une utilisation possible consiste à comparer différents résultats de builds lorsque vous hésitez sur le dernier, ou les deux derniers emplacements disponibles. Pour cela, vous devez verrouiller les Dofus / Trophées que vous êtes certain d’utiliser, et laisser les quelques autres déverrouillés.

Par exemple, vous pouvez verrouiller 5 Dofus / Trophées et laisser **Turbulent** (+1 PA, –1 PM) ainsi qu’un autre trophée utile à votre build, non verrouillés. Cela ne génèrerait alors que 2 combinaisons, vous permettant de comparer facilement les résultats avec ou sans Turbulent dans une seule recherche.

## Trophées avec bonus de panoplie < 3

Si vous sélectionnez au moins un Trophée avec une condition de bonus de panoplie < 3, alors deux groupes de combinaisons sont créés :

- Groupe 1 : uniquement les Dofus/Trophées classiques
- Groupe 2 : les Trophées **« bonus pano < 3 »** ont priorité

L’idée est de comparer des builds qui ont la condition **« bonus de panoplie < 3 »** avec des builds qui ne l’ont pas. Un build avec une condition aussi contraignante sera moins optimal la plupart du temps. Il est donc logique de vouloir mettre autant de Trophées **« bonus pano < 3 »** que possible dans un build ; ils ont plus de valeur.

Le premier groupe **« classique »** correspond aux combinaisons de Dofus / Trophées **sans** les Trophées bonus de panoplie < 3. Il peut être vide s’il n’y a que des Trophées bonus de panoplie < 3 sélectionnés.

Le second groupe, avec bonus de panoplie < 3, est créé de la manière suivante :

- D’abord, sélectionne les Dofus / Trophées « classiques » verrouillés
- Puis, s’il y a autant ou plus de Trophées bonus de panoplie < 3 que d'emplacements restants => Crée des combinaisons uniquement avec ceux-là => Terminé
- Sinon, rempli les emplacements restants avec tous les Trophées bonus de panoplie < 3
- Ensuite, s’il reste des Trophées classiques non verrouillés => Créer des combinaisons avec ceux-ci dans les emplacements restants => Terminé

La façon la plus simple d’aborder ce groupement est de n’avoir qu’une seule combinaison (6 objets) pour chaque groupe. Pour ce faire, sélectionnez 6 Dofus / Trophées « classiques », vérouillez ceux que vous voulez dans tous les cas, puis sélectionnez **[6 − Dofus / Trophées classiques verrouillés]** Trophées bonus de panoplie < 3.  
Par exemple, si vous sélectionnez 6 Trophées classiques dont 2 verrouillés, ajoutez 4 Trophées bonus de panoplie < 3.

Si vous voulez faire des combinaisons plus complexes, commencez par sélectionner les Dofus / Trophées uniquement, et observez le nombre de combinaisons. Vous pouvez aussi calculer les meilleurs builds uniquement à partir de ceux-ci, sans aucun autre objet, pour vérifier que les combinaisons générées correspondent bien à ce que vous attendez (supprimez alors tout paramètre Min pour obtenir des résultats).

Ce groupement n’a pas lieu si vous verrouillez au moins un Trophée bonus de panoplie < 3. Dans ce cas, toutes les combinaisons sont calculées normalement. Donc si vous voulez simplement explorer des builds avec cette condition, verrouillez un Trophée bonus de panoplie < 3. Ce sera peut-être plus simple si ce mécanisme de regroupement est difficile à appréhender (ce qui est compréhensible).

---

# Comment définir de bons paramètres

## Poids

Les poids par défaut viennent principalement de leur coût en puit, puis adaptés quand ils semblaient trop élevés ou trop faibles. J’ai comparé les familiers et les runes de transcendance pour obtenir des poids plus précis.

Un poids n’a de sens **que par rapport aux autres poids**. Si vous mettez un poids de 1 pour le Tacle et 2 pour les Soins, c’est strictement équivalent à mettre 2 pour le Tacle et 4 pour les Soins. Ce qui compte, c’est le ratio entre les poids.

Une bonne manière de raisonner sur les poids est de mettre un poids de 1 pour une caractéristique, par exemple la Force, puis de parcourir les autres caractéristiques et de se demander : **« Combien de Force vaut cette caractéristique ? Est-ce que je préfère avoir 100 Force ou 20 Tacle ? »**.  
Si c’est équivalent, alors 5 de Force équivaut à 1 Tacle, donc le poids du Tacle est de 5.

Si vous êtes confiant dans un ratio que vous avez défini pour une autre caractéristique, vous pouvez refaire le même processus en prenant cette caractéristique comme base pour trouver d’autres ratios ou vérifier qu’un ratio existant correspond vraiment à ce que vous voulez.

Si vous n’êtes pas sûr de la valeur d’une caractéristique, il vaut mieux laisser son poids vide ou faible. Vous pourrez toujours augmenter son poids et comparer les résultats plus tard.

## Poids offensifs

Le poids de la **Puissance** doit toujours être égal à la somme des poids de Force, Intelligence, Chance et Agilité.  
Le poids des **Dommages** doit toujours être égal à la somme des poids des dommages Neutre, Terre, Feu, Eau et Air.  
L’application les additionnera automatiquement, sauf si vous avez décoché le **« Calcul Automatique des poids »**.

Les dommages **Neutre** devraient probablement être laissés à 0 ou assez bas, car peu de sorts ont une ligne de dommages Neutre et la plupart des objets qui augmentent dommages Terre augmentent également les dommages Neutre, ce qui ferait compter leur valeur deux fois.

Si vous jouez un build **Critique**, le poids des **Dommages critiques** doit toujours être inférieur au poids des Dommages. Si vous avez 100 % de taux de coup critique, les dommages critiques sont équivalents aux dommages normaux, à ceci près qu’ils sont affectés par la Résistance critique.

Le ratio optimal dommages élémentaires / puissance que vous devriez définir peut être calculé précisément en fonction des sorts que vous prévoyez d’utiliser.

Le ratio optimal dommages / puissance suit la formule :  
**100 / dommages moyens de base du sort.**  
Plus les dommages de base du sort sont élevés, moins il faut mettre de poids dans les dommages.

Par exemple, si vous utilisez uniquement le sort Sacrieur **« Décimation »** : il inflige 29 à 32 dommages Terre, soit une moyenne de 30,5. Le ratio serait donc 100 / 30,5 = 3,3.  
Si vous avez un poids de 1 en Force, il faut donc mettre un poids de 3,3 en dommages Terre.

De manière générale, les sorts de base à une ligne de dégâts, sans effet supplémentaire, ont un ratio dommages / puissance :

- Entre 2 et 3 pour les sorts coûtant 4 PA
- Entre 3 et 4 pour les sorts coûtant 3 PA
- Entre 4 et 5 pour les sorts coûtant 2 PA

Les sorts avec des effets supplémentaires ont en général des dommages de base plus faibles et donc un ratio dommages / puissance plus élevé.

Un sort en coup critique voit ses dommages de base multipliés par 1,2 dans la plupart des cas. Le ratio dommages / puissance doit donc être divisé par 1,2 si vous jouez un build Critique.

Calculer le poids du **Taux de coup critique** est un peu plus compliqué. Il est préférable de décider à l’avance si vous voulez jouer Critique, et dans ce cas utiliser un paramètre Min plutôt qu’un poids, ou mettre à la fois un poids élevé et un paramètre Min.

## Poids défensifs

Les poids des **résistances fixes** et des **résistances en pourcentage élémentaires** sont synchronisés si le **« Calcul Automatique des Poids »** est activé.

Le ratio **résistances % / résistances fixes** est proportionnel aux dégâts de l’attaque reçue.  
Il suit cette formule : **ratio résistances % / fixes = dégâts reçus / 100**.

- Si les dégâts reçus sont de 100 ⇒ ratio = 1 ⇒ le poids des résistances élémentaires % doit être égal au poids des résistances fixes.
- Si les dégâts reçus sont de 300 ⇒ ratio = 3 ⇒ le poids des résistances élémentaires % doit être 3 fois celui des résistances fixes (poids par défaut).

La plupart des objets de niveau 200 n’ont pas de résistances fixes, donc il n’est peut-être pas très utile de mettre un poids dans les résistances fixes pour des builds haut niveau.

La somme des poids des **résistances élémentaires en pourcentage** doit être égale à la somme des poids des **résistances mêlée et distance en pourcentage**. Avoir 10 % de résistance dans tous les éléments est équivalent à avoir 10 % de résistance mêlée et à distance.

Cependant, la résistance en pourcentage est une caractéristique d’autant plus forte que sa valeur est élevée. Sans entrer dans les détails, passer de 49 % à 50 % de résistance est quasiment deux fois plus fort que passer de 0 % à 1 %.  
Donc, si vous voulez un build avec beaucoup de résistances élémentaires, vous pouvez mettre plus de poids dans les résistances élémentaires que dans les résistances mêlée / distance, puisqu’elles sont généralement plus difficiles à monter. Mais la somme des poids des résistances élémentaires devrait rester inférieure à deux fois la somme des poids des résistances mêlée / distance dans le pire des cas.

## Min / Max

La valeur de la plupart des caractéristiques n'augmente pas de manière linéaire. Par exemple, la **Prospection** gagne peu de valeur quand elle est très élevée. À l’inverse, les **résistances fixes** et en pourcentage gagnent de plus en plus de valeur.  
De plus, la valeur de certaines caractéristiques dépend d’autres caractéristiques. Notamment, la valeur des **dommages critiques** dépend fortement de la chance de critique, et inversement.

Cela signifie que des builds avec une caractéristique très élevée pourraient éclipser de meilleures options qui auraient une meilleure répartition de caractéristiques. Ou vous pourriez obtenir un build avec 200 dommages critiques mais 0 % de coup critique, ce qui n’a aucun sens.

La manière de limiter ce problème est de définir des paramètres **Min** et/ou **Max**, de sorte que la valeur de la caractéristique reste dans une plage qui ne modifie pas de façon disproportionnée sa valeur (ou la valeur des autres caractéristiques).

## Prérequis avec paramètres Min

Les conditions de **Vitalité, Intelligence, Force, Chance, Agilité et Sagesse** ne sont pas pris en compte dans le calcul du meilleur build, car ces caractéristiques peuvent être fortement augmentées après coup.  
Cependant, si vous voulez absolument utiliser un objet qui a une condition difficile à remplir, vous pouvez verrouiller cet objet et définir un paramètre Min afin de ne montrer que les builds dont il est possible d'atteindre la condition.

Par exemple, pour la **fureur de Gargandyas** qui nécessite au moins 5000 Vitalité au niveau 200.  
Si vous voulez investir au maximum 600 points de caractéristiques (du niveau) en Vitalité, et vous êtes déjà max parcho en vita. Vous pouvez alors définir un Min de 5000 − 600 − 100 = 4300.  
Le seuil inférieur le plus proche est 4200, donc utilisez le. Vous pouvez également utiliser des objets over Vita pour atteindre le seuil.

---

# Minmaxing

Une fois que vous avez défini des poids qui semblent cohérents, vous pouvez lancer un calcul de combinaisons plus large, en ajoutant beaucoup plus d’objets ou de panoplies, au cas où il existerait une combinaison cachée particulièrement intéressante. Gardez à l’esprit que plus la valeur des objets ou panoplies que vous ajoutez est faible, plus la probabilité de trouver un meilleur build est faible.

Le calcul de combinaisons est optimisé très aggressivement, donc si vous êtes prêt à attendre, vous pouvez lui donner un nombre impressionnant d’objets et de panoplies à tester pour votre build.

Si vous arrivez à un point où le calcul prend trop de temps, vous pouvez découper votre recherche en sous-recherches.  
Il est presque garanti que les meilleurs builds d’une recherche contiendront au moins une panoplie. Vous pouvez donc verrouiller une par une les meilleures panoplies pour votre build et lancer des recherches séparement. Ça va exclure toutes les combinaisons sans panoplie dans le build final, mais demande plus de travail.  
Verrouiller deux ou trois objets réduit drastiquement le nombre de combinaisons, ce qui permet d’inclure beaucoup plus d’objets dans la sélection.

Vous pouvez également recalculer les meilleurs objets lorsque vous verrouillez différentes panoplies, et obtenir une sélection plus précise comme expliqué précédemment.

## Minmaxing avec les familiers

Les familiers qui affectent des caractéristiques plafonnées peuvent avoir une grande influence sur le résultat des meilleurs builds. En particulier, les caractéristiques de défense élementaires en pourcentage.

Maximiser ces caractéristiques est intéressant car leur valeur augmente le plus haut elles sont. Mais cela nécessite de calculer beaucoup de combinaisons, car elles sont toutes plafonnées et il existe de nombreux familiers, et même des Dofus / Trophées, qui peuvent les augmenter, multipliant le nombre de combinaisons par rapport à une recherche avec seulement quelques familiers.

Familiers qui augmentent les résistances élémentaires en pourcentage :

**Bwaks, Croum, El Scarador**

- Familiers 50 Puissance + 25 % résistances (5 au total)
- Familiers 50 Puissance + 5 % résistances all (1 au total)

Ces familiers ont une grande valeur si vous voulez aussi de la Puissance dans votre build, et devraient probablement être inclus dans toute recherche de combinaison orientée hautes résistances.

**Volkornes**

- 1 PA + 12 % résistances Volkornes (4 au total)
- 1 PA + 6 % + 6 % résistances Volkornes (6 au total)
- 1 PA + autre caractéristique + 6 % résistances Volkornes (4 au total)

Ils ont légèrement moins de valeur que les familiers précédents, mais le PA qu’ils donnent peut faire une énorme différence et ils offrent des caractéristiques très flexibles.  
Le problème est que vous devez ajouter 14 familiers pour tout calculer, ce qui ferait une très grosse recherche. Ça peut suffire d’ajouter simplement les 4 Volkornes avec une autre caractéristique si vous en avez besoin, d’autant plus que cette autre caractéristique a souvent une valeur plus élevée que 6 % de résistances.

**Muldos**

- 1 PM + 16 % résistances Muldos (4 au total)
- 1 PM + 8 % + 8 % résistances Muldos (6 au total)
- 1 PM + autre caractéristique + 8 % résistances Muldos (4 au total)

Même principe que les Volkornes, sauf que la valeur est légèrement meilleure. Il est généralement facile d’atteindre le plafond de 6 PM, donc je recommande de ne tester ces familiers que si vous incluez des objets qui réduisent les PM ou si vous avez une idée précise en tête.

En plus de ces familiers, je recommande d'inclure un familier sans résistances élémentaires mais qui apporte de la valeur à votre build, pour que ce familier soit sélectionné si un build a déjà toutes ses résistances élémentaires plafonnées.  
Ce familier devrait avoir une valeur plus faible que les familiers résistances, sinon il sera priorisé même si les résistances ne sont pas plafonnées. Si vous avez inclus des Volkornes, il faudrait aussi ajouter un autre familier qui donne des PA pour avoir une meilleure comparaison.

---

# Conclusion

Si utilisée correctement, cette application est capable de trouver le build parfait pour ce que vous voulez, quoi que ce soit. Toutes les combinaisons possibles d’objets et toutes les conditions sont prises en compte.  
La confiance qu'il n'existe pas de meilleur build alternatif dépendra de votre patience à tester toutes les possibilitées.

Bon minmaxing !

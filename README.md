# Plugin Affichage des enfants d'un Workitem EWM

Ce plugin permet d'afficher sous forme d'un tableau les enfants d'un workitem EWM. 
A date il permet d'afficher le type, l'id, le summary, le owner et le statut de l'enfant. 
Il évoluera vers un outil permettant de modifier les enfants directement du parent

## Installation sur le serveur

Dézipper le fichier fr.syncheo.ewm.childitem.presentation_x.x.x.zip

Une fois dézipper, il contient 2 éléments
* un dossier fr.syncheo.ewm.childitem.presentation_updatesite/
* un fichier fr.syncheo.ewm.childitem.presentation_updatesite.ini

Copier le dossier fr.syncheo.ewm.childitem.presentation_updatesite/ dans <RepServeurELMCCM>/server/conf/ccm/sites

Copier le dossier fr.syncheo.ewm.childitem.presentation_updatesite.ini ans <RepServeurELMCCM>/server/conf/ccm/provision_profile

Demandé le rechargement des plugins.

Allez à l'URL  https://<URL_JAZZ_EWM>/ccm/admin?internal=true

Aller dans 

--> Server Reset

Puis cliquer sur le bouton


--> Request Server Reset


Redémarrer le serveur 

## Installer dans l'IHM

Une fois que le plugin a été installé sur le serveur, il faut l'ajouter à l'IHM d'un workitem. Pour ce fait, il faut aller dans la configuration de la zone de projet -> Workitem -> Editor Presentation.

Il faut sélectionner la section adéquat et cliqué sur le + vert. 

Contrairement à l'ajout d'un attribut, il faut cliquer sur le bouton radio Non Attribute Presentation et sélectionner la présentation "Child Workitem Table"

##Configuration du plugin

A date la seule configuration possible est l'ajout d'attribut supplémentaire au tableau. 
Pour ajouter des attributs supplémentaires, il faut utiliser le client eclipse EWM, aller dans le Process Configuration de la zone de projet

puis Project Configuration > Configuration Data > Work Items > Editor Presentation

Dans la section ou a été ajouté la présentation Child Workitem Table. 
Il faut cliquer dessus et ajouter aux Properties:
la key: attributes
la value: le nom des attributs à ajouter séparer par une ,(virgule)









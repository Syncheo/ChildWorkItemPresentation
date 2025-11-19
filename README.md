# Plugin Affichage des enfants d'un Workitem EWM

Ce plugin permet d'afficher sous forme d'un tableau les enfants d'un workitem EWM. 
A date il permet d'afficher le type, l'id, le summary, le owner et le statut de l'enfant. 
Il pourra être configuré pour afficher tous les enfants nécessiare
Il évoluera vers un outil permettant de modifier les enfants directement du parent

## Installation

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




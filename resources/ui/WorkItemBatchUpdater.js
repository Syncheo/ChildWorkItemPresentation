define([
    "dojo/_base/lang",
    "dojo/promise/all",
    // 🎯 Assurez-vous d'importer votre service UpdateWorkitem
    "./UpdateWorkitem" 
], function(lang, all, UpdateWorkitem){

    /**
     * Lance les mises à jour pour tous les Work Items listés dans l'objet de données.
     * @param {object} batchUpdateData L'objet contenant les URIs des WI comme clés
     * @returns {dojo/promise/Promise} Une promesse qui se résout lorsque toutes les mises à jour sont terminées.
     */
    function processBatchUpdates(batchUpdateData) {
        
        var updatePromises = [];
        
        // Parcourir chaque URI de Work Item (clé de l'objet)
        for (var workItemUri in batchUpdateData) {
            if (batchUpdateData.hasOwnProperty(workItemUri)) {
                
                var dataToUpdate = batchUpdateData[workItemUri];

          
                // 3. 🎯 Lancer la mise à jour asynchrone pour ce Work Item
                var updatePromise = UpdateWorkitem.update(dataToUpdate, workItemUri)
                    .then(function(result) {
                        console.log("Mise à jour réussie pour l'élément:", workItemUri);
                        return result; // Retourner le résultat
                    }, function(error) {
                        // Gérer les erreurs spécifiques à cet élément (ex: 412)
                        console.error("ÉCHEC de la mise à jour pour l'élément " + workItemUri + ":", error);
                        // On peut choisir de rejeter la promesse globale ou de la laisser se résoudre partiellement
                        throw error; // Propager l'erreur pour la capturer dans all.then()
                    });
                    
                updatePromises.push(updatePromise);
            }
        }
        
        // 4. 🎯 Utiliser dojo/promise/all pour attendre que TOUTES les promesses soient résolues
        return all(updatePromises);
    }
    
    // Exemple d'export du module (peut être une méthode d'une classe)
    return {
        processBatchUpdates: processBatchUpdates
    };
});
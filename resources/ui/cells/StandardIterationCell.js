/**
 * StandardIterationCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dojo/dom-construct",
	"dojo/Deferred",
	"../helpers/XhrHelpers"
], function (declare, domConstruct, Deferred, XHR) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.StandardIterationCell", null, {

        value: null,
        domNode: null,
		widget: null,

        constructor: function (args) {
            this.value = args.element.value;
        },

        /**
         * Crée un div non-éditable occupant 100% de la cellule
         * @param {HTMLElement} parentTd
         */
        render: function (parentTd) {
			var self = this;
			
			self.domNode = domConstruct.create("div", {
				// Initialiser à vide ou avec un indicateur de chargement
				innerHTML: "", // <-- VALEUR INITIALE VIDE
				style: "width:100%; box-sizing:border-box; padding:2px;"
			}, parentTd);
				
				
			if (this.value) {
				self.fetchInitialIterationName().then(function(categoryName) {
					if (categoryName) {						
						self.domNode.innerHTML = categoryName;
					}
				});
			}
						
						
            return this.domNode;
        },
		
		getFirstTagText: function(element, tagName) {
		    if (!element) return null;
		    var n = element.getElementsByTagName(tagName);
		    return (n && n[0] && n[0].textContent) || null;
		},
		

		fetchInitialIterationName: function() {
		    var self = this;
		    var deferred = new Deferred();
		    
		    // L'URL est stockée dans self.element.value
		    var categoryOslcUrl = self.value; 
		    
		    // Ajouter le paramètre de champ pour obtenir le nom qualifié
		    var fetchUrl = categoryOslcUrl + "?fields=workitem/iteration/name";

		    // Utiliser XHR.oslcXmlGetRequest pour récupérer les détails de cette ressource
		    XHR.oslcXmlGetRequest(fetchUrl).then(
		        function(data) {
		            // La réponse devrait être un fragment XML contenant <qualifiedName>
		            // Ex: <workitem><category><qualifiedName>Projet/Équipe/NomCat</qualifiedName></category></workitem>
		            
		            // Trouver le nœud <qualifiedName>
		            var categoryNode = data.getElementsByTagName("iteration")[0];
		            var qualifiedName = self.getFirstTagText(categoryNode, "name");

		            // Nous ne voulons que la partie après le dernier '/' (le nom court)
		            var shortName = (qualifiedName || "").split("/").pop();
		            
		            deferred.resolve(shortName);
		        },
		        function(err) {
		            console.error("Erreur chargement nom de iteration initial:", err);
		            deferred.resolve(null); // Résoudre à null pour ne pas bloquer l'interface
		        }
		    );

		    return deferred.promise;
		},
				
		destroy: function() {
		    var self = this;
		    if (self.widget && typeof self.widget.destroy === 'function') {
		        self.widget.destroy();
		    }
			if (self.domNode) {
                // Utiliser domConstruct.destroy pour un nettoyage complet (y compris les références)
                domConstruct.destroy(self.domNode);
                self.domNode = null; // Optionnel, mais sécurise la référence
            }
						
		    // Note: Comme CategoryCell n'hérite de rien, inherited(arguments) n'est pas nécessaire.
		}
		
    });
});
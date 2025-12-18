define([
    "dojo/_base/declare",
    "dojo/dom-construct",
	"dojo/_base/lang"
], function (declare, domConstruct, lang) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.LinkCell", null, {

        value: null,
        href: null,
		workitemId: null,
        domNode: null,
		widget: null,

		
		/*
		var args = {
			element: childElemt,
			paContextId: contextIds.paContextId,
			workItemId: contextIds.id,
			contextId: contextIds.contextId,
			onChange: callback
		};
		*/
		
		
        constructor: function (args) {
            this.value = args.element.value;
            this.href = args.element.url || "#";
			this.workitemId = args.contextIds.id;
        },

        /**
         * Crée un lien <a> non-éditable occupant 100% de la cellule.
         * @param {HTMLElement} parentTd
         */
		
		
		render: function (parentTd) {
			var self = this;
			
			// Conteneur propre
			this.domNode = domConstruct.create("div", {
				style: "width:100%; box-sizing:border-box; padding:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
			}, parentTd);
			
			var ResourceLinkClass = lang.getObject("jazz.ui.ResourceLink");

			if (ResourceLinkClass) {
				try{
					
					var anchorNode = domConstruct.create("a", {
		                innerHTML: self.value || "Lien",
		                href: self.href
		            }, this.domNode);
								
					self.widget = new ResourceLinkClass({
					    // Propriétés obligatoires d'après ton inspection :
					    uri: self.href, 
					    label: self.value || "Lien",
					    retainLinkText: true,
					    lazyFetch: true,
					    isExternalContent: false,
					    
					    // L'URL de navigation interne à RTC/EWM
					    // Si tu ne l'as pas, on met l'URI par défaut ou un ancrage
					    presentationUri: "#action=com.ibm.team.workitem.viewWorkItem&id=" + this.workitemId, 
					    
					    // On peut quand même garder la classe pour le style CSS
					    "class": "jazz-ui-ResourceLink"
					}, anchorNode);
					
					self.widget.startup();
					return this.domNode; // SUCCÈS
											  
				} catch (e) {
					console.warn("Échec instanciation ResourceLink, fallback HTML.", e);
				}
			}
			
			// -----------------------------------------------------------
			// TENTATIVE 2 : HTML Pur (Simulation Parfaite)
			// -----------------------------------------------------------
			// Si le widget JS n'est pas accessible, on construit le lien HTML
			// exactement comme EWM le ferait. Le moteur de survol d'EWM
			// détecte souvent ces classes automatiquement.

			domConstruct.create("a", {
				innerHTML: self.value || "Lien",
				href: self.href,

				// C'est cette classe qui déclenche le style et souvent le hover
				"class": "jazz-ui-ResourceLink", 
  
				// Cet attribut est vital pour que le tooltip sache quoi charger
				"data-resource-uri": self.href,  
  
				target: "_blank", // Ouvrir dans un nouvel onglet par sécurité

				// Style de secours pour être sûr que c'est bleu et souligné
				style: {
					color: "#0063C6",
					textDecoration: "underline",
					cursor: "pointer"
				}
			}, this.domNode);
			return this.domNode;
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

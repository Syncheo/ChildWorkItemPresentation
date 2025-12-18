define([
    "dojo/_base/declare",
    "dojo/dom-construct",
	"dojo/Deferred",
	"../XhrHelpers",
	"../JazzHelpers"
], function (declare, domConstruct, Deferred, XHR, JAZZ) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.StandardContributorCell", null, {

        value: null,
        domNode: null,
		widget: null,

        constructor: function (args) {
            this.value = args.value;
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
			
			categoryOslcUrl= categoryOslcUrl.replace("jts", "ccm");
		    
		    // Ajouter le paramètre de champ pour obtenir le nom qualifié
		    var fetchUrl = categoryOslcUrl + "?fields=foundation/contributor/name";

		    // Utiliser XHR.oslcXmlGetRequest pour récupérer les détails de cette ressource
		    XHR.oslcXmlGetRequest(fetchUrl).then(
		        function(data) {
		            // La réponse devrait être un fragment XML contenant <qualifiedName>
		            // Ex: <workitem><category><qualifiedName>Projet/Équipe/NomCat</qualifiedName></category></workitem>
		            
		            // Trouver le nœud <qualifiedName>
		            var categoryNode = data.getElementsByTagName("contributor")[0];
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

		 extractJTSUrl: function(fullUrl) {
		    // 1. Créer une URL object pour un parsing facile (standard dans les navigateurs modernes)
		    var urlParser = new URL(fullUrl);

		    // 2. Extraire l'URL de base (Protocole + Hôte + Port)
		    // Exemple: https://jazz-server:9443
		    var baseUrl = urlParser.protocol + '//' + urlParser.host;

		    // 3. Extraire les segments du chemin
		    // pathSegments[0] sera vide car le chemin commence par '/', 
		    // pathSegments[1] sera le premier segment (ex: 'jts' ou 'ccm')
		    var pathSegments = urlParser.pathname.split('/');
		    
		    // 4. Déterminer le contexte de l'application (ex: 'jts')
		    // Le premier segment non vide après l'hôte (généralement l'indice 1)
		    var appContext = pathSegments[1]; 

		    return baseUrl + "/" + appContext + "/";
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
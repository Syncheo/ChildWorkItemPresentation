/**
 * CategoryCellBox.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
	"dijit/_WidgetBase",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
	"dojo/dom-construct",
	"dojo/Deferred",
	"dojo/on",
	"../XhrHelpers",
	"../JazzHelpers"
], function(declare, _WidgetBase, ComboBox, Memory, 
	domConstruct, Deferred, on, XHR, JAZZ){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.ContributorCell", 
		[_WidgetBase], 
	{
		_elementData: null,      // Les données de l'attribut de l'élément enfant
		contextId: "",      // L'ID de la zone de projet/équipe pour les requêtes
        onChange: null, // Le callback à appeler lors du changement de valeur
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
            this._elementData = args.element || {};
			this.contextId = args.contextId || {} ; // contextId est un objet {value: ...}
            this.onChange = args.onChange || function(){};
        },

        render: function(tdElement){
            var self = this;

			var container = domConstruct.create("div", {
			    style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
			}, tdElement);

			var initialValue = self.element.value || "";

			
            // Store temporaire vide au départ
            var store = new Memory({ data: [] });

            // Création du ComboBox
			self.widget = new ComboBox({
                value: initialValue,
                store: store,
                searchAttr: "name",
                autoComplete: false
			}, container);
						
            self.widget.startup();
			
			self._getValues();

			if (self.element.value) {
			    self.fetchInitialContributorName().then(function(contributorName) {
			        if (contributorName) {
			            // Mettre à jour la valeur affichée du ComboBox avec le nom lisible
			            self.widget.set("value", contributorName, false);
			        }
			    });
			}
			
			self.own(
			    self.widget.on("change", function(newValue) {
					
					var store = self.widget.get("store");

					var selectedItem = store.query({ name: newValue })[0]; 
					var selectedId = null;
					if (selectedItem && selectedItem.id) selectedId = selectedItem.id;
					if (newValue === "") selectedId = ""; 
					self.element.datatype = "resource";
					self.onChange(selectedId, self.element);
					
					self.element.datatype = "resource";	
					// 🎯 Étape 3 : Appeler le callback avec l'ID
					self.onChange(selectedId, self.element);
			    })
			);
        },
		
		_getValues: function() {
			var self = this;
			
			var contributorUrl = JAZZ.getApplicationBaseUrl() + "rpt/repository/foundation?fields=foundation/(" + 
				"projectArea[itemId=" + self.contextId.value + "]/teamMembers/(reportableUrl|userId|name)|" + 
				"teamArea[itemId="+ self.contextId.value + "]/teamMembers/(reportableUrl|userId|name))";
				
			XHR.oslcXmlGetRequest(contributorUrl).then(
				function (data) {
					
					var projectArea = Array.from(data.getElementsByTagName("projectArea") || []);
					var teamArea = Array.from(data.getElementsByTagName("teamArea") || []);
					
					var paMembers = projectArea.reduce(function(acc, pa) {
					    var nodes = Array.from(pa.getElementsByTagName("teamMembers") || []);
					    nodes.forEach(function(pm) {
					        acc.push({
					            id: self.extractJTSUrl(self.getFirstTagText(pm, "reportableUrl")) + "users/" +  self.getFirstTagText(pm, "userId"),
					            name: self.getFirstTagText(pm, "name")
					        });
					    });
					    return acc;
					}, []);
															
					var taMembers = teamArea.reduce(function(acc, ta) {
					    var nodes = Array.from(ta.getElementsByTagName("teamMembers") || []);
					    nodes.forEach(function(tm) {
					        acc.push({
								id: self.extractJTSUrl(self.getFirstTagText(tm, "reportableUrl")) + "users/" +  self.getFirstTagText(tm, "userId"),
					            name: self.getFirstTagText(tm, "name")
					        });
					    });
					    return acc;
					}, []);
									
					var contributors = [].concat(paMembers, taMembers);
												
					var newStore = new Memory({ data: contributors });
					self.widget.set("store", newStore);  
				}, 
				function(err) {
					console.error("Erreur chargement category:", err);
				}
			);	
		},
		
		fetchInitialContributorName: function() {
		    var self = this;
		    var deferred = new Deferred();
		    
		    // L'URL est stockée dans self.element.value
		    var categoryOslcUrl = self.element.value;
			
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
		
		getFirstTagText: function(element, tagName) {
		    if (!element) return null;
		    var n = element.getElementsByTagName(tagName);
		    return (n && n[0] && n[0].textContent) || null;
		},
		
		destroy: function() {
		    var self = this;
		    if (self.widget && typeof self.widget.destroy === 'function') {
		        self.widget.destroy();
		    }
			
			self.inherited(arguments);

		    // Note: Comme CategoryCell n'hérite de rien, inherited(arguments) n'est pas nécessaire.
		}
		
    });

});
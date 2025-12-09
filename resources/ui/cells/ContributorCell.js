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
	"dojo/on",
	"../XhrHelpers",
	"../JazzHelpers"
], function(declare, _WidgetBase, ComboBox, Memory, 
	domConstruct, on, XHR, JAZZ){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.ContributorCell", 
		[_WidgetBase], 
	{
		_elementData: null,      // Les données de l'attribut de l'élément enfant
		_cellContextId: "",      // L'ID de la zone de projet/équipe pour les requêtes
        onChange: null, // Le callback à appeler lors du changement de valeur
		widget: null,


		constructor: function (args) {
            this._elementData = args.element || {};
			this._cellContextId = args.contextId || {} ; // contextId est un objet {value: ...}
            this.onChange = args.onChange || function(){};
        },

        render: function(tdElement){
            var self = this;

			var container = domConstruct.create("div", {
			    style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
			}, tdElement);

			
            // Store temporaire vide au départ
            var store = new Memory({ data: [] });

            // Création du ComboBox
			self.widget = new ComboBox({
			                value: self._elementData.value,
			                store: store,
			                searchAttr: "name",
			                autoComplete: false
			            }, container);
						
            self.widget.startup();
			
			self._getValues();

			self.own(
			    self.widget.on("change", function(newValue) {
					var store = self.widget.get("store");

					// 🎯 Étape 2 : Chercher l'objet complet dans le store en utilisant la valeur (name)
					var selectedItem = store.query({ name: newValue })[0]; 

					var selectedId = null;

					if (selectedItem && selectedItem.id) {
						selectedId = selectedItem.id;
					}

					// Si l'utilisateur efface le champ, l'ID est null/vide
					if (newValue === "") {
						selectedId = ""; 
					}

					// 🎯 Étape 3 : Appeler le callback avec l'ID
					self.onChange(selectedId, self.element);
			    })
			);
        },
		
		_getValues: function() {
			var self = this;
			
			var contributorUrl = JAZZ.getApplicationBaseUrl() + "rpt/repository/foundation?fields=foundation/(" + 
				"projectArea[itemId=" + self._cellContextId.value + "]/teamMembers/(reportableUrl|userId|name)|" + 
				"teamArea[itemId="+ self._cellContextId.value + "]/teamMembers/(reportableUrl|userId|name))";
				
			XHR.oslcXmlGetRequest(contributorUrl).then(
				function (data) {
					
					var projectArea = Array.from(data.getElementsByTagName("projectArea") || []);
					var teamArea = Array.from(data.getElementsByTagName("teamArea") || []);
					
					var paMembers = projectArea.reduce(function(acc, pa) {
					    var nodes = Array.from(pa.getElementsByTagName("teamMembers") || []);
					    nodes.forEach(function(pm) {
					        acc.push({
					            id: extractJTSUrl(self.getFirstTagText(pm, "reportableUrl")) + "users/" +  self.getFirstTagText(pm, "userId"),
					            name: self.getFirstTagText(pm, "name")
					        });
					    });
					    return acc;
					}, []);
															
					var taMembers = teamArea.reduce(function(acc, ta) {
					    var nodes = Array.from(ta.getElementsByTagName("teamMembers") || []);
					    nodes.forEach(function(tm) {
					        acc.push({
								id: extractJTSUrl(self.getFirstTagText(tm, "reportableUrl")) + "users/" +  self.getFirstTagText(tm, "userId"),
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
			
			function extractJTSUrl(fullUrl) {
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
			}
			
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
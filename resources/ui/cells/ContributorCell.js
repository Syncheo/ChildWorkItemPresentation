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
			        // Votre logique de gestion du changement ici
			        self.onChange(newValue, self._elementData);
			    })
			);
        },
		
		_getValues: function() {
			var self = this;
			
			var contributorUrl = JAZZ.getApplicationBaseUrl() + "rpt/repository/foundation?fields=foundation/(" + 
				"projectArea[itemId=" + self._cellContextId.value + "]/teamMembers/(userId|name)|" + 
				"teamArea[itemId="+ self._cellContextId.value + "]/teamMembers/(userId|name))";
				
			XHR.oslcXmlGetRequest(contributorUrl).then(
				function (data) {
					
					var projectArea = Array.from(data.getElementsByTagName("projectArea") || []);
					var teamArea = Array.from(data.getElementsByTagName("teamArea") || []);
					
					
					var paMembers = projectArea.reduce(function(acc, pa) {
					    var nodes = Array.from(pa.getElementsByTagName("teamMembers") || []);
					    nodes.forEach(function(pm) {
					        acc.push({
					            id: self.getFirstTagText(pm, "userId"),
					            name: self.getFirstTagText(pm, "name")
					        });
					    });
					    return acc;
					}, []);
															
					var taMembers = teamArea.reduce(function(acc, ta) {
					    var nodes = Array.from(ta.getElementsByTagName("teamMembers") || []);
					    nodes.forEach(function(tm) {
					        acc.push({
					            id: self.getFirstTagText(tm, "userId"),
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
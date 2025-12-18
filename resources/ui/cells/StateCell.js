/**
 * CategoryCellBox.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
	"dijit/_WidgetBase",
	"../XhrHelpers",
	"../JazzHelpers",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/topic"
], function(declare, ComboBox, Memory, 
	_WidgetBase,
	XHR, JAZZ, domConstruct, on, topic){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.StateCell", [_WidgetBase], {

        element: {},
		workItemId: "",
        onChange: null,  // callback lors du changement
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
		
        constructor: function(args){
			this.element = args.element || {};
			this.workItemId = args.workItemId || {}
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
                value: self.element.value,
                store: store,
                searchAttr: "name",
                autoComplete: false
            }, container);

            self.widget.startup();
			
			self.getValues();

			self.own(
			    self.widget.on("change", function(newValue) {
					// La 'newValue' ici est la chaîne de caractères (le 'name' affiché).
					// // 🎯 Étape 1 : Accéder au store du ComboBox
					
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

					topic.publish("/workitem/state/changed", {
						newActionId: selectedId,
						element: self.element // Peut être utile pour l'identification
					});
					
					self.element.datatype = "resource";
					// 🎯 Étape 3 : Appeler le callback avec l'ID
			        self.onChange(selectedId, self.element);
			    })
			);
        },
		
		getValues: function() {
			var self = this;
			
			var categoryUrl = JAZZ.getApplicationBaseUrl() +
				"service/fr.syncheo.ewm.childitem.server.IGetStatesService" +
				"?workItemId=" + self.workItemId.value;
				
			XHR.oslcJsonGetRequest(categoryUrl).then(
				function (jsonString) {
					
					var jsonObjet = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
					var actionsList = jsonObjet.states
						.map(function(stateObject) {
							if (stateObject.action) {
								return {
									id: stateObject.action.id,
									name: stateObject.action.name
								};
							}
							return null;
						})
						.filter(function(action) {
							return action !== null;
						});
					
						
						var newStore = new Memory({ data: actionsList });
						self.widget.set("store", newStore);  
					}, 
					function(err) {
						console.error("Erreur chargement state:", err);
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
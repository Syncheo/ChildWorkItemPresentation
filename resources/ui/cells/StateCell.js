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
	"dojo/on"
], function(declare, ComboBox, Memory, 
	_WidgetBase,
	XHR, JAZZ, domConstruct, on){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.StateCell", [_WidgetBase], {

        element: {},
		workItemId: "",
        onChange: null,  // callback lors du changement
		widget: null,

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
			        // Votre logique de gestion du changement ici
			        self.onChange(newValue, self.element);
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
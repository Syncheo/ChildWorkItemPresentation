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

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.DeliverableCell", [_WidgetBase], {

        element: {},
		paContextId: "",
        onChange: null,  // callback lors du changement
		widget: null,

        constructor: function(args){
            this.element = args.element || {};
			this.paContextId = args.paContextId || {}
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
			
            // Déclencher le callback onChange
   /*         on(self.widget, "change", function(val){
				self.onChange(val, self.element);
            });*/
        },
		
		getValues: function() {
			var self = this;
			
			var deliverableUrl = JAZZ.getApplicationBaseUrl() + 
				"rpt/repository/workitem?fields=workitem/deliverable[contextId=" + self.paContextId.value + "]/(itemId|name)";
				
			XHR.oslcXmlGetRequest(deliverableUrl).then(
				function (data) {
					var deliverables = Array.from(data.getElementsByTagName("deliverable") || [] );
									
					var devs = deliverables.map(function(d) {
						return {
							id: self.getFirstTagText(d, "itemId"),
							name: self.getFirstTagText(d, "name")
						}
					});

					var newStore = new Memory({ data: devs });
					self.widget.set("store", newStore); 	
				},
				function(err) {
					console.error("Erreur chargement deliverable:", err);
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
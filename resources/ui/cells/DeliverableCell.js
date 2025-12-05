/**
 * CategoryCellBox.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
	"../XhrHelpers",
	"../JazzHelpers",
	"dojo/dom-construct",
	"dojo/on"
], function(declare, ComboBox, Memory, 
	XHR, JAZZ, domConstruct, on){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.DeliverableCell", null, {

        element: {},
		contextId: "",
        onChange: null,  // callback lors du changement

        constructor: function(element, paContextId, onChange){
            this.element = element || {};
			this.paContextId = paContextId.value || ""
            this.onChange = onChange || function(){};
        },

        render: function(tdElement){
            var self = this;

			var container = domConstruct.create("div", {
			    style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
			}, tdElement);

			
            // Store temporaire vide au départ
            var store = new Memory({ data: [] });

            // Création du ComboBox
            var combo = new ComboBox({
                value: self.element.value,
                store: store,
                searchAttr: "name",
                autoComplete: false
            }, container);

            combo.startup();
			
			self.getValues(combo, self.contextId);

            // Déclencher le callback onChange
            on(combo, "change", function(val){
                self.onChange(val, tdElement);

                // Déclencher un événement input pour compatibilité avec EWM Save
                if(combo.focusNode){
                    var event = document.createEvent("HTMLEvents");
                    event.initEvent("input", true, true);
                    combo.focusNode.dispatchEvent(event);
                }
            });
        },
		
		getValues: function(combo, paContextId) {
			var self = this;
			
			var deliverableUrl = JAZZ.getApplicationBaseUrl() + 
				"rpt/repository/workitem?fields=workitem/deliverable[contextId=" + paContextId + "]/(itemId|name)";
				
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
					combo.set("store", newStore); 	
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
		}
    });

});
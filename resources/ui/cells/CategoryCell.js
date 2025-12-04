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
    "dojo/on"
], function(declare, ComboBox, Memory, 
	XHR, JAZZ, on){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.CategoryCellBox", null, {

        element: {},
		paContextId: "",
        onChange: null,  // callback lors du changement

        constructor: function(element, paContextId, onChange){
            this.element = element || {};
			this.paContextId = paContextId || ""
            this.onChange = onChange || function(){};
        },

        render: function(tdElement){
            var self = this;

            // Store temporaire vide au départ
            var store = new Memory({ data: [] });

            // Création du ComboBox
            var combo = new ComboBox({
                value: self.element.value,
                store: store,
                searchAttr: "name",
                autoComplete: false
            }, tdElement);

            combo.startup();
			
			self.getValues();

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
		
		
		getValues: function(paContextId) {
			var categoryUrl = JAZZ.getApplicationBaseUrl() +
										"rpt/repository/workitem?fields=workitem/category[contextId=" + paContextId + "]/(id|name)";
										
			if (paContextId) {
				XHR.oslcXmlGetRequest(categoryUrl).then(
					function (data) {
						var categories = Array.from(data.getElementsByTagName("category") || []);

						var cats = categories.map(function(d) {
							return {
								id: self.getFirstTagText(d, "id"), 
								name: (self.getFirstTagText(d, "name") || "").split("/").pop()
							}
						});
						var storeData = cats.map(function(item){
							return { id: item.id, name: item.name };
						});
						
						var newStore = new Memory({ data: storeData });
						combo.set("store", newStore);  
					}, 
					function(err) {
						console.error("Erreur chargement category:", err);
					}
				);
			}
		}
    });

});
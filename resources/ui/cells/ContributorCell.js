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

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.ContributorCell", null, {

        element: {},
		contextId: "",
        onChange: null,  // callback lors du changement

        constructor: function(element, contextId, onChange){
            this.element = element || {};
			this.contextId = contextId.value || ""
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
		
		getValues: function(combo, contextId) {
			var self = this;
			
			var contributorUrl = JAZZ.getApplicationBaseUrl() + "rpt/repository/foundation?fields=foundation/(" + 
				"projectArea[itemId=" + contextId+ "]/teamMembers/(userId|name)|" + 
				"teamArea[itemId="+ contextId+ "]/teamMembers/(userId|name))";
				
				
			if (paContextId) {
				XHR.oslcXmlGetRequest(contributorUrl).then(
					function (data) {
						
						var projectArea = Array.from(data.getElementsByTagName("projectArea") || []);
						var teamArea = Array.from(data.getElementsByTagName("teamArea") || []);
																	
						var paMembers = projectArea.map(function(pa) {
							var nodes = Array.from(pa.getElementsByTagName("teamMembers") || []);
							return nodes.map(function (tm) {
								return {
									id: self.getFirstTagText(tm, "userId"), 
									name: self.getFirstTagText(tm, "name")
								}
							});
						});
						
						var taMembers = teamArea.map(function(ta) {
							var nodes = Array.from(ta.getElementsByTagName("teamMembers") || []);
							return nodes.map(function (tm) {
								return {
									id: self.getFirstTagText(tm, "userId"), 
									name: self.getFirstTagText(tm, "name")
								}
							});
						});						
																
						
						
						var contributors = [];
						contributors.push(paMembers);
						contributors.push(taMembers);
															
						var newStore = new Memory({ data: contributors });
						combo.set("store", newStore);  
					}, 
					function(err) {
						console.error("Erreur chargement category:", err);
					}
				);
			}
		},
		
		getFirstTagText: function(element, tagName) {
		    if (!element) return null;
		    var n = element.getElementsByTagName(tagName);
		    return (n && n[0] && n[0].textContent) || null;
		}
    });

});
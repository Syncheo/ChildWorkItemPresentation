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

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.CategoryCell", 
		[_WidgetBase], {

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
			
            // Déclencher le callback onChange
/*            on(self.widget, "change", function(val){
                self.onChange(val, self.element);
            });*/
        },
		
		getValues: function() {
			var self = this;
			
			var ccmUrl = JAZZ.getApplicationBaseUrl() 
			var categoryUrl =  ccmUrl +
				"rpt/repository/workitem?fields=workitem/category[contextId=" + self.paContextId.value + "]/(itemId|itemType|name)";
			
			XHR.oslcXmlGetRequest(categoryUrl).then(
				function (data) {
					var categories = Array.from(data.getElementsByTagName("category") || []);
					
					var cats = categories.map(function(d) {
						return {
							id: ccmUrl + "resource/itemOid/" + self.getFirstTagText(d, "itemType") + "/" + self.getFirstTagText(d, "itemId"), 
							name: (self.getFirstTagText(d, "name") || "").split("/").pop()
						}
					});
					
					var storeData = cats.map(function(item){
						return { id: item.id, name: item.name };
					});
						
					var newStore = new Memory({ data: storeData });
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
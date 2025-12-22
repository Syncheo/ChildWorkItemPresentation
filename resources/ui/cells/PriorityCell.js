/**
 * PriorityCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
	"dijit/_WidgetBase",
	"../helpers/XhrHelpers",
	"../helpers/JazzHelpers",
	"dojo/dom-construct"
], function(declare, ComboBox, Memory, 
	_WidgetBase, XHR, JAZZ, domConstruct){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.PriorityCell", 
		[_WidgetBase], {

        element: {},
		url: null,
		paContextId: "",
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
			this.paContextId = args.contextIds.paContextId || {};
			this.url = args.contextIds.url || "";			
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

					self.element.datatype = "resource";					
					// 🎯 Étape 3 : Appeler le callback avec l'ID
					
					self.onChange({
						newValue: selectedId,
						url: self.url, 
						element: self.element
					});					
			    })
			);
        },
		
		getValues: function() {
			var self = this;
			
			var ccmUrl = JAZZ.getApplicationBaseUrl() 
			var categoryUrl =  ccmUrl +
				"rpt/repository/workitem?fields=workitem/projectArea[contextId=" + self.paContextId.value + "]/enumerations[id=priority]/literals/(id|name)";
				

				
				
			XHR.oslcXmlGetRequest(categoryUrl).then(
				function (data) {
					var enumerationNodes = Array.from(data.getElementsByTagName("literals") || []);
	
					var priorityLiterals = enumerationNodes.map(function(node) {
					    // 1. Récupération des valeurs brutes
					    var literalId = self.getFirstTagText(node, "id"); // Ex: "severity.literal.l1"
					    var literalName = self.getFirstTagText(node, "name"); // Ex: "Unclassified"
					 	
					    // 2. Construction de l'ID complet (URI OSLC/Enum)
					    // L'URI OSLC pour les littéraux d'énumération suit généralement ce format:
					    // ccmUrl + "oslc/enumerations/{projectAreaId}/{enumType}/{literalId}"
					    // Nous allons utiliser un format simplifié basé sur la structure EWM:
					    var enumId = ccmUrl + "oslc/enumerations/" + self.paContextId.value + "/priority/" + literalId; 
					    
					    // Remarque : Si vous avez accès à l'ID du projet et au nom de l'énumération ("severity"), 
					    // l'URI complète ci-dessus est la plus correcte pour OSLC.
					    
					    return {
					        // L'ID est l'URI complète pour cette valeur d'énumération
					        id: enumId,
					        // Le nom est la valeur lisible
					        name: literalName
					    };
					});
					
					
						
					
					var storeData = priorityLiterals.map(function(item){
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
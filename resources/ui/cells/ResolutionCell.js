/**
 * ResolutionCell.js
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
	"dojo/dom-construct",
	"dojo/topic"
], function(declare, ComboBox, Memory, 
	_WidgetBase,
	XHR, JAZZ, domConstruct, topic){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.ResolutionCell", [_WidgetBase], {

        element: {},
		workItemId: "",
		url: null,
		paContextId: "",
        onChange: null,  // callback lors du changement
		widget: null,
		actionId: "",

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
			this.workItemId = args.contextIds.id || {};
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
			
			self.getValues("");

			self.own(
				topic.subscribe("/workitem/state/changed", function(message) {
					console.log("ResolutionCell : Changement de action détecté. ID:", message.newActionId);		
					self.getValues(message.newActionId); 
				})
			);

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
		
		getValues: function(actionId) {
			var self = this;
			
			var wId = (self.workItemId && self.workItemId.value) ? self.workItemId.value.trim() : null;
			var aId = (actionId) ? actionId.toString().trim() : null;

			// 2. Test de validité
			if (!wId || !aId) {
 				    
			    // On crée le store vide
			    var emptyStore = new Memory({ data: [] });
			    
			    // On met à jour le widget immédiatement
			    self.widget.set("store", emptyStore); 
	
			    return;
			}
				
			var categoryUrl = JAZZ.getApplicationBaseUrl() +
				"service/fr.syncheo.ewm.childitem.server.IGetResolutionService" +
				"?workItemId=" + self.workItemId.value + "&actionId=" + actionId;

				
			XHR.oslcJsonGetRequest(categoryUrl).then(
				function (jsonString) {
					
					var jsonObjet = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
					var resolutionList = jsonObjet.resolutions.map(function (item) {
						return {
							id: JAZZ.getApplicationBaseUrl() +  "oslc/workflows/" + self.paContextId.value + "/resolutions/" + item.id,
							name: item.name

						}
					})
					//<rtc_cm:resolution rdf:resource="https://jazz-server:9443/ccm/oslc/workflows/_pG5nILDqEfC38tEFCAkmbQ/resolutions/com.ibm.team.workitem.defectWorkflow/3"/>
			
						
					var store = new Memory({ data: resolutionList });
					
					self.widget.set("store", store);  

				}, function(err) {
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
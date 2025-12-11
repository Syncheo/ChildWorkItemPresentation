/**
 * CategoryCellBox.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
	"dojo/Deferred",
	"dijit/_WidgetBase",
	"../XhrHelpers",
	"../JazzHelpers",
	"dojo/dom-construct",
	"dojo/on"
], function(declare, ComboBox, Memory, Deferred,
	_WidgetBase,
	XHR, JAZZ, domConstruct, on){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.IterationCell", [_WidgetBase], {

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

			var initialValue = self.element.value || "";

            // Store temporaire vide au départ
            var store = new Memory({ data: [] });

            // Création du ComboBox
            self.widget = new ComboBox({
                value: initialValue,
                store: store,
                searchAttr: "name", 
                autoComplete: false
            }, container);

            self.widget.startup();

			if (self.element.value) {
		        self.fetchInitialIterationName().then(function(iterationName) {
		            if (iterationName) {
		                // Mettre à jour la valeur affichée du ComboBox avec le nom lisible
		                self.widget.set("value", iterationName);
		            }
		        });
		    }

						
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
   /*         on(self.widget, "change", function(val){
				self.onChange(val, self.element);
            });*/
        },
		
		fetchInitialIterationName: function() {
		    var self = this;
		    var deferred = new Deferred();
		    
		    // L'URL est stockée dans self.element.value
		    var categoryOslcUrl = self.element.value; 
		    
		    // Ajouter le paramètre de champ pour obtenir le nom qualifié
		    var fetchUrl = categoryOslcUrl + "?fields=workitem/iteration/name";

		    // Utiliser XHR.oslcXmlGetRequest pour récupérer les détails de cette ressource
		    XHR.oslcXmlGetRequest(fetchUrl).then(
		        function(data) {
		            // La réponse devrait être un fragment XML contenant <qualifiedName>
		            // Ex: <workitem><category><qualifiedName>Projet/Équipe/NomCat</qualifiedName></category></workitem>
		            
		            // Trouver le nœud <qualifiedName>
		            var categoryNode = data.getElementsByTagName("iteration")[0];
		            var qualifiedName = self.getFirstTagText(categoryNode, "name");

		            // Nous ne voulons que la partie après le dernier '/' (le nom court)
		            var shortName = (qualifiedName || "").split("/").pop();
		            
		            deferred.resolve(shortName);
		        },
		        function(err) {
		            console.error("Erreur chargement nom de iteration initial:", err);
		            deferred.resolve(null); // Résoudre à null pour ne pas bloquer l'interface
		        }
		    );

		    return deferred.promise;
		},
		
		getValues: function() {
			var self = this;
			
			var ccmUrl = JAZZ.getApplicationBaseUrl() 
			var iterationUrl =  ccmUrl +
				"rpt/repository/workitem?fields=workitem/iteration[contextId=" + self.paContextId.value + "]/(itemId|itemType|name)";
				
			XHR.oslcXmlGetRequest(iterationUrl).then(
				function (data) {
					var iterations = Array.from(data.getElementsByTagName("iteration") || [] );
									
					var iters = iterations.map(function(d) {
						return {
							id: ccmUrl + "resource/itemOid/" + self.getFirstTagText(d, "itemType") + "/" + self.getFirstTagText(d, "itemId"), 
							name: self.getFirstTagText(d, "name")
						}
					});

					var newStore = new Memory({ data: iters });
					self.widget.set("store", newStore); 	
				},
				function(err) {
					console.error("Erreur chargement iteration:", err);
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
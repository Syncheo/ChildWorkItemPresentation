/*
 * MultiSelectCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dojox/form/CheckedMultiSelect",
    "dojo/store/Memory",
    "dijit/_WidgetBase",
    "dojo/dom-construct",
    "dojo/_base/array"
], function(declare, CheckedMultiSelect, Memory, _WidgetBase, domConstruct, array) {
    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.MultiSelectCell", [_WidgetBase], {

		element: {},
        enumerations: [],       // tableau de valeurs simples ["High", "Medium", "Low"]
        onChange: null,    // callback quand la valeur change
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
            this.enumerations = this.element.values || [];
            this.onChange = args.onChange || function() {};
        },

        render: function(tdElement) {
			var self = this;
			
			
            var container = domConstruct.create("div", {
                style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
            }, tdElement);

			var storeData = this.enumerations.map(function(item) {
			    return { 
			        id: item.id, 
			        label: item.name 
			    };
			});
			
           var memoryStore = new Memory({ data: storeData });

		   var initialValue = [];
		   if (typeof self.element.value === "string") {
		       initialValue = self.element.value.split("|")
		           .map(function(v) { 
		               return v.trim(); // Supprime les espaces autour de chaque valeur
		           })
		           .filter(function(v) { 
		               return v !== ""; // Supprime les entrées vides (comme après le dernier |)
		           });
		   }
		   
		   var initialIds = [];
		   if (this.enumerations && this.enumerations.length > 0) {
		       initialIds = initialValue.map(function(name) {
		           // 1. Chercher l'item correspondant au nom
		           var foundItem = self.enumerations.filter(function(enumItem) {
		               return enumItem.name === name;
		           })[0];
		           
		           // 2. Retourner l'ID si trouvé, sinon null
		           return foundItem ? foundItem.id : null;

		       }).filter(function(id) {
		           // 3. Ne garder que les éléments qui ne sont pas null
		           return id !== null;
		       });
		   }
					   
            self.widget = new CheckedMultiSelect({
				name: "multiSelect",
                store: memoryStore,
                multiple: true, // Autorise la sélection multiple
                labelAttr: "label",
				value: initialIds, // Doit être un tableau d'IDs
                style: "width:100%; box-sizing:border-box;"
            }, container);

            self.widget.startup();

			
			self.own(
			    self.widget.on("change", function(newValues) {
					var formattedValue = "";
                    if (newValues && newValues.length > 0) {
                        formattedValue = "|" + newValues.join("|") + "|";
                    }
					self.element.datatype = "resource";					

                    self.onChange(formattedValue, self.element);
			    })
			);
			
/*			on(self.widget, "change", function(val) {
				self.onChange(val, self.element);
			});*/
			
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

/**
 * NumberTextCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/NumberTextBox",
	"dijit/_WidgetBase",
	"dojo/dom-construct",
	"dojo/on"
], function(declare, NumberTextBox, _WidgetBase, domConstruct, on) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.NumberTextCell", [_WidgetBase], {

        element: {},
        onChange: null, // callback quand la valeur change
		widget: null,
		isList: false,

		
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
            this.onChange = args.onChange || function() {};
        },

		render: function (tdElement) {
			var self = this;
			
			var intValue = parseInt(self.element.value,10) || null;




			var container = domConstruct.create("div", {
                style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
            }, tdElement);

            self.widget = new NumberTextBox({
                value: intValue,
				style: "width:100%;",
                // CONFIGURATION POUR INTEGER :
                constraints: {
                    places: 0,        // 0 décimales forcées
                    fractional: false // Interdit la virgule/point décimal
                },
                invalidMessage: "Veuillez entrer un nombre entier valide.",
                promptMessage: "Entrez un nombre entier"
            }, container);

            self.widget.startup();

            // S'assurer que le TextBox et son focusNode respectent la largeur
            self.widget.domNode.style.width = "100%";
            self.widget.domNode.style.boxSizing = "border-box";

            if (self.widget.focusNode) {
                self.widget.focusNode.style.width = "100%";
                self.widget.focusNode.style.boxSizing = "border-box";
            }

			self.own(
                self.widget.on("change", function(newNumericValue) {
                    // newNumericValue est déjà un nombre (Number) ou NaN si invalide
                    
                    // On ne propage le changement que si la valeur est valide (respecte les constraints)
                    if (self.widget.isValid()) {
                        console.log("Valeur entière validée :", newNumericValue);
                        self.onChange(newNumericValue, self.element);
                    } else {
                        console.warn("Saisie invalide ignorée");
                    }
                })
            );
			
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

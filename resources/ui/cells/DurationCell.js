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

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.DurationCell", 
		[_WidgetBase], {

        element: {},
        onChange: null,  // callback lors du changement
		widget: null,
		
        constructor: function(args){
            this.element = args.element || {};
            this.onChange = args.onChange || function(){};
        },

		render: function (tdElement) {
			var self = this;

			var container = domConstruct.create("div", {
		        style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
		    }, tdElement);

		    self.widget = new TextBox({
		        value: this.element.value || ""
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
			    on(self.widget.focusNode, "input", function(evt) {
			        var val = self.convertWorkDaysToMilliseconds(evt.target.value);  // valeur réellement saisie
			        console.log("Nouvelle valeur :", val);
			        self.onChange(val, self.element);
			    })
			);
			
		},
		
		convertWorkDaysToMilliseconds: function(workDays) {
		    var MS_PER_WORK_DAY = 28800000;
		    
		    var input = String(workDays).trim(); // S'assurer que c'est une chaîne et supprimer les espaces

			input = input.toLowerCase();
		    if (input.endsWith("d")) input = input.replace(/\s*d$/i, '').trim()

			input = input.trim();

		    var days = parseFloat(input); 

		    // --- GESTION DES ERREURS/CAS SPÉCIAUX ---
		    // Si l'entrée est non numérique après nettoyage, ou si elle est négative
		    if (isNaN(days) || days < 0) return -1; // Retourne 0 millisecondes si la valeur est invalide ou négative
		
			// Multiplier le nombre de jours par la constante
		    var milliseconds = days * MS_PER_WORK_DAY;
		    
		    // Retourner le résultat arrondi à l'entier le plus proche (milliseconde)
		    return Math.round(milliseconds); 
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
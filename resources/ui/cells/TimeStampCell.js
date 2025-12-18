/**
 * CategoryCellBox.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/DateTextBox",
	"dojo/date/locale",
	"dijit/_WidgetBase",
	"../XhrHelpers",
	"../JazzHelpers",
	"dojo/dom-construct",
	"dojo/on"
], function(declare, DateTextBox, locale, _WidgetBase, 
	XHR, JAZZ, domConstruct, on){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.TimeStampCell", 
		[_WidgetBase], {

        element: {},
        onChange: null,  // callback lors du changement
		widget: null,
		
        constructor: function(args){
            this.element = args.element || {};
            this.onChange = args.onChange || function(){};
        },
		
		
		render: function(tdElement){
			
			var self = this;
			
			var initialValue = self.element.value;
			var dateObj = null;
		            
			// --- Définition des formats ---
			// Le format Dojo/Dijit pour l'affichage (locale.format)					
			// 1. Conversion de la chaîne ISO en objet Date JavaScript
			if (typeof initialValue === 'string' && initialValue) {
				// Utilisation du constructeur natif JS pour l'ISO 8601 (gestion heure/timezone)
				var parsedDate = new Date(initialValue); 
		                
                if (!isNaN(parsedDate.getTime())) {
					dateObj = parsedDate;
                }
			} else if (initialValue instanceof Date) {
				dateObj = initialValue; 
			}
			
			var container = domConstruct.create("div", {
				style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
			}, tdElement);

			// 2. Créer l'instance du DateTimeTextBox
			self.widget = new DateTextBox({ // <<< CHANGÉ
				value: dateObj,
				constraints: {
                    // dd : Jour (01-31)
                    // MMM : Mois abrégé localisé (déc., janv., etc.)
                    // yyyy : Année à quatre chiffres
                    datePattern: "dd MMM yyyy", 
                    
                    // Indiquer que le format d'entrée (parse) attend la date
                    selector: "date" 
                    
                    // Si vous utilisez DateTimeTextBox et voulez masquer l'heure:
                    // timePattern: "" 
				}
			}, container);
			
			self.widget.startup();
			
			// 3. Gestion du changement
			self.own(
				self.widget.on("change", function(newDateValue) {
					if (newDateValue instanceof Date && !isNaN(newDateValue.getTime())) {
						// Retourner la chaîne ISO 8601 complète (avec date et heure)
						var isoString = newDateValue.toISOString();    
						self.element.datatype = "http://www.w3.org/2001/XMLSchema#dateTime";
						self.onChange(isoString, self.element);
		                        
					} else if (newDateValue === null || newDateValue === undefined || newDateValue === "") {
					    // Gérer le cas où l'utilisateur efface la date
					    self.onChange(null, self.element); 
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
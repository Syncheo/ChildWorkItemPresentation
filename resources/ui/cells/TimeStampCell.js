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
			var customDatePattern = "dd MMM yyyy"; 
			var customTimePattern = "HH:mm:ss"; 
			
			var dateObj;
			
			try {
			    dateObj = locale.parse(self.element.value, {
			        datePattern: customDatePattern,
			        timePattern: customTimePattern,
			        selector: "datetime" // Indique à Dojo de lire les deux parties
			    });
			} catch(e) {
			    console.error("Erreur de parsing de la date formatée :", self.element.value, e);
			    dateObj = null; 
			}
							    

			var container = domConstruct.create("div", {
			    style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
			}, tdElement);

			// 2. Créer l'instance du DateTextBox
			self.widget = new DateTextBox({
				value: dateObj,
				onChange: function(newDateValue) {
					console.log("Nouvelle Date sélectionnée (objet Date JS) :", newDateValue);
					var simpleIsoDate = newDateValue.toISOString().substring(0, 10);
					console.log("Format pour sauvegarde (YYYY-MM-DD) :", simpleIsoDate);
				}
			}, container);
			.6
            self.widget.startup();
	
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
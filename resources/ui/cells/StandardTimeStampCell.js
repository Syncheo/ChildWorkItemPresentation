define([
    "dojo/_base/declare",
    "dojo/dom-construct",
	"dojo/date/locale"
], function (declare, domConstruct, locale) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.StandardTimeStampCell", null, {

        value: null,
        domNode: null,
		widget: null,

        constructor: function (args) {
            this.value = args.element.value;
        },

        /**
         * Crée un div non-éditable occupant 100% de la cellule
         * @param {HTMLElement} parentTd
         */
        render: function (parentTd) {
			var self = this;
			var customDatePattern = "dd MMM yyyy"; 
			var customTimePattern = "HH:mm:ss"; 
					
			var d = self.value;
			var dateObj = "";
			if (typeof d === 'string') {
				dateObj = self.formatIsoDateForCustomStyle(self.value);
			} else if (d instanceof Date) {
				try {
					dateObj = locale.parse(self.element.value, {
						datePattern: customDatePattern,
						timePattern: customTimePattern,
						selector: "datetime" // Indique à Dojo de lire les deux parties
					});
				} catch(e) {
					console.error("Erreur de parsing de la date formatée :", self.element.value, e);
					dateObj = d; 
				}
			} else {
				dateObj = d; 
			}
			
            this.domNode = domConstruct.create("div", {
                innerHTML: dateObj || "",
                style: "width:100%; box-sizing:border-box; padding:2px;"
            }, parentTd);

            return this.domNode;
        },
		
		formatIsoDateForCustomStyle: function(dateString) {
		    
			if (!dateString) return "";

		    // 1. Créer l'objet Date
		    var dateObj = new Date(dateString);

		    if (isNaN(dateObj.getTime())) {
		        return dateString;
		    }

		    var customDatePattern = "dd MMM yyyy"; 
		    var customTimePattern = "HH:mm:ss"; 
		    var formattedDate = locale.format(dateObj, {
		        datePattern: customDatePattern,
		        selector: "date"
		    });
		    
		    var formattedTime = locale.format(dateObj, {
		        timePattern: customTimePattern,
		        selector: "time"
		    });
		    return formattedDate + " " + formattedTime;
		},

		
		destroy: function() {
		    var self = this;
		    if (self.widget && typeof self.widget.destroy === 'function') {
		        self.widget.destroy();
		    }
			if (self.domNode) {
                // Utiliser domConstruct.destroy pour un nettoyage complet (y compris les références)
                domConstruct.destroy(self.domNode);
                self.domNode = null; // Optionnel, mais sécurise la référence
            }
						
		    // Note: Comme CategoryCell n'hérite de rien, inherited(arguments) n'est pas nécessaire.
		}
		
    });
});
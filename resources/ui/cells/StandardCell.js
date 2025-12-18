define([
    "dojo/_base/declare",
    "dojo/dom-construct"
], function (declare, domConstruct) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.TagsTextCell", null, {

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
			var str = self.value
			
			if (self.startAndEndsWithPipe(str)) {
				str = self.formatPipeString(str);
			}
			
            this.domNode = domConstruct.create("div", {
                innerHTML: str || "",
                style: "width:100%; box-sizing:border-box; padding:2px;"
            }, parentTd);

            return this.domNode;
        },
		
		startAndEndsWithPipe: function(str) {
		    if (typeof str !== 'string' || str.length < 2) {
		        return false;
		    }
		    
		    var regex = /^\|.*\|$/;
		    
		    return regex.test(str);
		},
		
		formatPipeString: function(tags) {
			var parts = tags.split('|');
			var filteredTags = parts.filter(Boolean);

			return filteredTags.join(', ');
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
define([
    "dojo/_base/declare",
    "dojo/dom-construct"
], function (declare, domConstruct) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.LinkCell", null, {

        value: null,
        href: null,
        domNode: null,
		widget: null,

        constructor: function (value, href) {
            this.value = value;
            this.href = href || "#";
        },

        /**
         * Crée un lien <a> non-éditable occupant 100% de la cellule.
         * @param {HTMLElement} parentTd
         */
        render: function (parentTd) {
            this.domNode = domConstruct.create("a", {
                innerHTML: this.value || "",
                href: this.href,
				style: "width:100%; display:block; " + 
					"box-sizing:border-box; padding:2px; " + 
					"color:blue;"
            }, parentTd);

            return this.domNode;
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

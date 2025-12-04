define([
    "dojo/_base/declare",
    "dojo/dom-construct"
], function (declare, domConstruct) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.LinkCell", null, {

        value: null,
        href: null,
        domNode: null,

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
        }
    });
});

define([
    "dojo/_base/declare",
    "dojo/dom-construct"
], function (declare, domConstruct) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.StandardCell", null, {

        value: null,
        domNode: null,

        constructor: function (value) {
            this.value = value;
        },

        /**
         * Crée un div non-éditable occupant 100% de la cellule
         * @param {HTMLElement} parentTd
         */
        render: function (parentTd) {
            this.domNode = domConstruct.create("div", {
                innerHTML: this.value || "",
                style: "width:100%; box-sizing:border-box; padding:2px;"
            }, parentTd);

            return this.domNode;
        }
    });
});
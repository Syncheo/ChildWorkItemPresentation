/**
 * ComboBoxCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dojo/on"
], function(declare, ComboBox, Memory, domConstruct, on) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.ComboBoxCell", null, {

		element: {},
        options: [],       // tableau de valeurs simples ["High", "Medium", "Low"]
        onChange: null,    // callback quand la valeur change

        constructor: function(element, options, onChange) {
            this.element = element || {};
            this.options = options || [];
            this.onChange = onChange || function() {};
        },

        render: function(tdElement) {
            var container = domConstruct.create("div", {
                style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
            }, tdElement);

            // Création du store pour la ComboBox
            var store = new Memory({
                data: this.options.map(function(opt) { return { name: opt.name, id: opt.id }; }),
                idProperty: "id"
            });

            var widget = new ComboBox({
                value: this.element.value,
                store: store,
                searchAttr: "name",
                style: "width:100%; box-sizing:border-box;"
            }, container);

            widget.startup();

            // Écoute du changement de valeur
            on(widget, "change", function(val) {				
				if (widget.focusNode) {
				        var event = document.createEvent("HTMLEvents");
				        event.initEvent("input", true, true);
				        widget.focusNode.dispatchEvent(event);
				    }
					
                if (typeof this.onChange === "function") {
					this.onChange(val, this.element);
                }
            }.bind(this));
        }

    });

});

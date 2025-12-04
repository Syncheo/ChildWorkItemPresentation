/**
 * EditableTextCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/TextBox",
	"dojo/dom-construct",
	"dojo/on"
], function(declare, TextBox, domConstruct, on) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.EditableTextCell", null, {

        value: "",
        onChange: null, // callback quand la valeur change

        constructor: function(value, onChange) {
            this.value = value || "";
            this.onChange = onChange || function() {};
        },

		render: function (tdElement) {
            var container = domConstruct.create("div", {
                style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
            }, tdElement);

            var widget = new TextBox({
                value: this.value
            }, container);

            widget.startup();

            // S'assurer que le TextBox et son focusNode respectent la largeur
            widget.domNode.style.width = "100%";
            widget.domNode.style.boxSizing = "border-box";

            if (widget.focusNode) {
                widget.focusNode.style.width = "100%";
                widget.focusNode.style.boxSizing = "border-box";
            }

            // Écoute du changement de valeur
            on(widget, "input", function () {
                var val = widget.get("value");
                if (typeof this.onChange === "function") {
                    this.onChange(val);
                }
            }.bind(this));
		}

    });

});

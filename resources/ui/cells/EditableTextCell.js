/**
 * EditableTextCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/TextBox",
	"dijit/_WidgetBase",
	"dojo/dom-construct",
	"dojo/on"
], function(declare, TextBox, _WidgetBase, domConstruct, on) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.EditableTextCell", [_WidgetBase], {

        element: {},
        onChange: null, // callback quand la valeur change
		widget: null,

        constructor: function(args){
			this.element = args.element || {};
            this.onChange = args.onChange || function() {};
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
			        var val = evt.target.value;  // valeur réellement saisie
			        console.log("Nouvelle valeur :", val);
			        self.onChange(val, self.element);
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

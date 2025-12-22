/**
 * CheckBoxCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/CheckBox",
	"dijit/_WidgetBase",
	"dojo/dom-construct"
], function(declare, CheckBox, _WidgetBase, domConstruct){

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.CheckBoxCell", 
		[_WidgetBase], {

        element: {},
		url: null,
		paContextId: "",
        onChange: null,  // callback lors du changement
		widget: null,
		
		/*
		var args = {
			element: childElemt,
			paContextId: contextIds.paContextId,
			workItemId: contextIds.id,
			contextId: contextIds.contextId,
			onChange: callback
		};
		*/
		
        constructor: function(args){
            this.element = args.element || {};
			this.paContextId = args.contextIds.paContextId || "";
			this.url = args.contextIds.url || "";
            this.onChange = args.onChange || function(){};
        },

        render: function(tdElement){
            var self = this;

			var container = domConstruct.create("div", {
			    style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
			}, tdElement);

			var isChecked = String(self.element.value).toLowerCase() === "true";
			
            // Création du ComboBox
            self.widget = new CheckBox({
				name: "checkBox",
                value: "true",
                checked: isChecked
            }, container);
			
			self.widget.startup();
			
			self.own(
			    self.widget.on("change", function(isChecked) {
					self.element.datatype = "http://www.w3.org/2001/XMLSchema#boolean";					

					self.onChange({
						newValue: isChecked,
						url: self.url,
						element: self.element
					});
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
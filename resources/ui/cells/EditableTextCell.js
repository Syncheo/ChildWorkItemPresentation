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
		isList: false,

		
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
            this.onChange = args.onChange || function() {};
        },

		render: function (tdElement) {
			var self = this;
			
			var str = self.element.value

			if (self.startAndEndsWithPipe(str)) {
				self.isList = true;
				str = self.formatPipeString(str);
			}


			var container = domConstruct.create("div", {
                style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
            }, tdElement);

            self.widget = new TextBox({
                value: str || ""
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
					var formattedValue = "";
					if (self.isList) {
						if (val && val.length > 0) {
						    formattedValue = self.formatStringToArray(val);
						}	
					} else {
						formattedValue = val;
					}

					self.element.datatype = "http://www.w3.org/2001/XMLSchema#string";
			        console.log("Nouvelle valeur :", formattedValue);
			        self.onChange(formattedValue, self.element);
			    })
			);
			
		},
		
		startAndEndsWithPipe: function(str) {
		    if (typeof str !== 'string' || str.length < 2) {
		        return false;
		    }
		    
		    var regex = /^\|.*\|$/;
		    
		    return regex.test(str);
		},
		
		formatStringToArray: function(tags) {
			var parts = tags.split(',');
			parts = parts.map(function(m) {
				return m.trim();
			});
			return parts;
			//return "|" + parts.join("|") + "|";
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
			self.inherited(arguments);

		    // Note: Comme CategoryCell n'hérite de rien, inherited(arguments) n'est pas nécessaire.
		}
    });

});

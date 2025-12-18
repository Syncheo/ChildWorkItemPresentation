/**
 * ComboBoxCell.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */

define([
    "dojo/_base/declare",
    "dijit/form/ComboBox",
    "dojo/store/Memory",
	"dijit/_WidgetBase",
    "dojo/dom-construct",
    "dojo/on"
], function(declare, ComboBox, Memory, _WidgetBase, domConstruct, on) {

    return declare("fr.syncheo.ewm.childitem.presentation.ui.cells.ComboBoxCell", [_WidgetBase], {

		element: {},
        options: [],       // tableau de valeurs simples ["High", "Medium", "Low"]
        onChange: null,    // callback quand la valeur change
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
            this.options = this.element.values || [];
            this.onChange = args.onChange || function() {};
        },

        render: function(tdElement) {
			var self = this;
            var container = domConstruct.create("div", {
                style: "width:100%; box-sizing:border-box; padding:0; margin:0;"
            }, tdElement);

            // Création du store pour la ComboBox
            var store = new Memory({
                data: this.options.map(function(opt) { return { name: opt.name, id: opt.id }; }),
                idProperty: "id"
            });

            self.widget = new ComboBox({
                value: this.element.value,
                store: store,
                searchAttr: "name",
                style: "width:100%; box-sizing:border-box;"
            }, container);

            self.widget.startup();

			
			self.own(
			    self.widget.on("change", function(newValue) {
					var store = self.widget.get("store");
					
					//"https://jazz-server:9443/ccm/oslc/enumerations/_pG5nILDqEfC38tEFCAkmbQ/enum%20de%20test/enum%20de%20test.literal.l2"/
					var selectedItem = store.query({ name: newValue })[0]; 
					var selectedId = null;
					if (selectedItem && selectedItem.id) selectedId = selectedItem.id;
					if (newValue === "") selectedId = ""; 
					self.element.datatype = "resource";
					self.onChange(selectedId, self.element);
			    })
			);
			
/*			on(self.widget, "change", function(val) {
				self.onChange(val, self.element);
			});*/
			
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

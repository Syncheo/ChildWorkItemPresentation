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

			on(widget, "change", function(val) {
			    // Marquer le widget comme dirty pour EWM
			    widget._hasBeenBlurred = true; // simule blur pour forcer _isDirty
			    widget._set("value", val);     // set la valeur réelle
			    widget._isDirty = true;        // le flag interne
			    widget.focusNode.dispatchEvent(new Event('change', { bubbles: true })); // event que EWM écoute

			    // Callback utilisateur
			    self.onChange(val, this.element);
			});
			
        }

    });

});

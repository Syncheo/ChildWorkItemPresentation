/**
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/Tooltip",
    "dijit/form/TextBox",
    "dijit/form/Select",
    "dijit/form/DateTextBox",
    "dijit/form/CheckBox",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/text!./templates/ChildRow.html"
], function (
    declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Tooltip, TextBox, Select, DateTextBox, CheckBox,
    on, domConstruct, template) {
	return declare("fr.syncheo.ewm.childitem.presentation.ui.ChildRow", 
		[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
			
			
			templateString: template,
			childData: null,
			
			
			constructor: function (childData) {
				this.childData = childData;
			},
	
			postCreate: function () {
				console.log(this.childData);
				this.inherited(arguments);
				
				if (!this.childData) return;
					
				
				var id = this.childData.filter(function(elmt) {
						return elmt.name === "Id"
				})[0];
				var type = this.childData.filter(function(elmt) {
					return elmt.name === "Type"
				})[0];
				var summary = this.childData.filter(function(elmt) {
					return elmt.name === "Summary"
				})[0];
				var url = this.childData.filter(function(elmt) {
					return elmt.name === "Url"
				})[0];

				var td1 = domConstruct.create("td", {}, this.childRow);
				domConstruct.create("a", {
					href: url.value,
					innerHTML: type.value + " " + id.value
				}, td1);

				// Cellule Summary
				var td2 = domConstruct.create("td", {}, this.childRow);
				if( summary.editable) {
					var container = domConstruct.create("div", { style: "width:100%;"}, td2);
					var widget = new TextBox({value: summary.value }, container);
					widget.startup();
					widget.domNode.style.width = "100%";
					if (widget.focusNode) {
					    widget.focusNode.style.width = "100%";
					    widget.focusNode.style.boxSizing = "border-box";
					}
				} else {
					domConstruct.create("a", { href: url.value, innerHTML: summary.value }, td2);	
				}
		

				for (var i = 0; i < this.childData.length; i++) {
					var childElemt = this.childData[i]
					if (childElemt.name === "Type" || childElemt.name === "Id" || 
						childElemt.name === "Summary" || childElemt.name === "Url") continue;
					if (!childElemt.editable) {
						domConstruct.create("td", { innerHTML: childElemt.value }, this.childRow);
					} else {
						var td = domConstruct.create("td", {}, this.childRow);
						var container = domConstruct.create("div", { style: "width:100%;" }, td);

						var widget = null;
						widget = new TextBox({ value: childElemt.value }, container);
						widget.startup();
						widget.domNode.style.width = "100%";
						if (widget.focusNode) {
						    widget.focusNode.style.width = "100%";
						    widget.focusNode.style.boxSizing = "border-box";
						}
					}
				}
			},
			
			startup: function () {
			    this.inherited(arguments);
			},

		        /** BLOCKER D’EVENEMENTS EWM
		         *  Empêche le dirty handler IBM de se déclencher
		         */
		/*        _blockIBMEvents: function (node) {
		            var eventsToBlock = [
		                "input", "change", "keydown", "keyup", "keypress",
		                "paste", "cut", "compositionstart", "compositionend"
		            ];

		            eventsToBlock.forEach(function (ev) {
		                node.addEventListener(ev, function (e) {
		                    e.stopPropagation();    // empêche EWM de détecter
		                }, true); // useCapture = true → bloque AVANT IBM
		            });
		        },
		*/
            // --- Summary ---
   

/*            // ========== AUTRES COLONNES ==========
            for (var i = 0; i < this.headers.length; i++) {
                var h = this.headers[i];
                if (h === "Type" || h === "Id" || h === "Summary") continue;
>>>>>>> Stashed changes

                var td = domConstruct.create("td", {}, this.childRow);
                var value = this.childData[h];
                var type = this.getFieldType(h);

                // NON EDITABLE
                if (!this.editable.includes(h)) {
                    td.innerHTML = value || "";
                    continue;
                }

                // --- CONTENEUR POUR LE WIDGET ---
                var container = domConstruct.create("div", {
                    style: "width:100%;"
                }, td);

                var widget = null;

                // ========== ENUM ==========
                if (type === "enum") {
                    widget = new Select({
                        value: value,
                        options: this.getEnumValues(h)
                    }, container);
                    widget.startup();
                }

                // ========== DATE ==========
                else if (type === "date") {
                    widget = new DateTextBox({
                        value: value ? new Date(value) : null
                    }, container);
                    widget.startup();
                }

                // ========== TEXTE ==========
                else {
                    widget = new TextBox({
                        value: value
                    }, container);
                    widget.startup();
                }

                // Largeur 100%
                widget.domNode.style.width = "100%";
                if (widget.focusNode) {
                    widget.focusNode.style.width = "100%";
                    widget.focusNode.style.boxSizing = "border-box";
                }

                // Empêche IBM de détecter les changements
  //              this._blockIBMEvents(widget.focusNode || widget.domNode);

                // Ton PROPRE mécanisme de sauvegarde
/*                (function (field, wgt) {

                    // Enter = commit
                    on(wgt.domNode, "keydown", function (evt) {
                        if (evt.keyCode === 13) {
                            var val = wgt.get("value");
                            self.childData[field] = val;
                            self.emitCustomSaveEvent(field, val);
                            evt.stopPropagation();
                            evt.preventDefault();
                        }
                    });

                    // Blur = commit (optionnel)
                    on(wgt.domNode, "blur", function () {
                        var val = wgt.get("value");
                        self.childData[field] = val;
                        self.emitCustomSaveEvent(field, val);
                    });

                })(h, widget);
            }
        },*/



/*        emitCustomSaveEvent: function (field, value) {
            var event = new CustomEvent("mySaveEvent", {
                detail: {
                    field: field,
                    value: value,
                    workItem: this.childData
                }
            });
            document.dispatchEvent(event);
        },*/

        getFieldType: function (header) {
            if (header === "Due Date" || header === "Start Date") return "date";
            if (header === "Priority" || header === "Severity") return "enum";
            return "text";
        },

        getEnumValues: function (header) {
            if (header === "Priority") {
                return [
                    { label: "High", value: "High" },
                    { label: "Medium", value: "Medium" },
                    { label: "Low", value: "Low" }
                ];
            }
            return [];
        }
    });
});

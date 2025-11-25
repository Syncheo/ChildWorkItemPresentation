/**
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */
define([
    "dojo/_base/declare",
	"dojo/_base/lang",
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
    declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Tooltip, TextBox, Select, DateTextBox, CheckBox,
    on, domConstruct, template) {
	return declare("fr.syncheo.ewm.childitem.presentation.ui.ChildRow", 
		[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
			
			
			templateString: template,
			childData: null,
			changed: null,
			url: null,
			
			
			constructor: function (childData) {
				this.childData = childData;
			},
	
			postCreate: function () {
				var self = this;
				self.changed = {};
				
				console.log(self.childData);
				self.inherited(arguments);
				
				if (!self.childData) return;
					
				// Lancer après un petit délai pour laisser Jazz rendre la page
				setTimeout(function () {
				    var globalSaveBtn = document.querySelector('button.j-button-primary[dojoattachpoint="saveCmd"]');

				    if (globalSaveBtn) {
				        self.own(
				            on(globalSaveBtn, "click", function (evt) {
				                self._onGlobalSave(evt);
				            })
				        );
				    } else {
				        console.warn("⚠️ Bouton Save global non trouvé !");
				    }
				}, 300);
					
				
				
				var id = self.childData.filter(function(elmt) {
						return elmt.name === "Id"
				})[0];
				var type = self.childData.filter(function(elmt) {
					return elmt.name === "Type"
				})[0];
				var summary = self.childData.filter(function(elmt) {
					return elmt.name === "Summary"
				})[0];
				this.url = self.childData.filter(function(elmt) {
					return elmt.name === "Url"
				})[0];

				var td1 = domConstruct.create("td", {}, self.childRow);
				domConstruct.create("a", {
					href: this.url.value,
					innerHTML: type.value + " " + id.value
				}, td1);

				// Cellule Summary
				var td2 = domConstruct.create("td", {}, self.childRow);
				if( summary.editable) {
					var container = domConstruct.create("div", { style: "width:100%;"}, td2);
					var widget = new TextBox({value: summary.value }, container);
					widget.startup();
					widget.domNode.style.width = "100%";
					if (widget.focusNode) {
					    widget.focusNode.style.width = "100%";
					    widget.focusNode.style.boxSizing = "border-box";
					}
					self.own(
					    on(widget, "input", lang.hitch(self, function(evt) {
					        console.log("Changement détecté :", widget.value);
							var value = widget.get("value");           // valeur actuelle du TextBox
							var fieldName = summary.name || "Summary"; // ou le nom de ton champ
							this._onTextboxChanged(this.url.value, fieldName, value);
					    }))
					);
					
				} else {
					domConstruct.create("a", { href: this.url.value, innerHTML: summary.value }, td2);	
				}
		

				for (var i = 0; i < self.childData.length; i++) {
					var childElemt = self.childData[i]
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
						this.own(
							on(widget, "input", lang.hitch(this, function(evt) {
								var value = widget.get("value");           			// valeur actuelle du TextBox
								var fieldName = childElemt.name || "childElemt"; 	// ou le nom de ton champ
								this._onTextboxChanged(this.url.value, fieldName, value);
							}))
						);
					}
				}
			},
			
			startup: function () {
			    this.inherited(arguments);
			},
			
			_onTextboxChanged: function(url, fieldName, value) {
				if (this.changed[url] === undefined) this.changed[url] = {};
				this.changed[url][fieldName] = value;
				console.log("Champ modifié :", url, ": " , fieldName, "->", value);
			},

			_onGlobalSave: function(evt) {
				if (Object.keys(this.changed).length !== 0) {
					console.log("👉 Le bouton SAVE global a été cliqué !");
					console.log("Changed : ", this.changed)
				}
			},
			
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

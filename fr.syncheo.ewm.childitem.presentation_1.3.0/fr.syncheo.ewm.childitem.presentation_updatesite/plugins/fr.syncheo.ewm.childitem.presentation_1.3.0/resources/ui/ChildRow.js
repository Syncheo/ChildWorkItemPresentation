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
    "dojo/text!./templates/ChildRow.html",
	"./cells/StandardCell",
	"./cells/LinkCell",
	"./cells/EditableTextCell",
	"./cells/ComboBoxCell",
	"./cells/CategoryCell",
	"./cells/ContributorCell",
	"./cells/DeliverableCell"
], function (
    declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Tooltip, TextBox, Select, DateTextBox, CheckBox,
    on, domConstruct, template, 
	StandardCell,  LinkCell, EditableTextCell, 
	ComboBoxCell, CategoryCell, ContributorCell, DeliverableCell) {
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
					
				
				
				var id = self.childData.filter(function(elmt) {	return elmt.name === "Id" })[0];
				var type = self.childData.filter(function(elmt) { return elmt.name === "Type"	})[0];
				var summary = self.childData.filter(function(elmt) { return elmt.name === "Summary" })[0];
				var paContextId = self.childData.filter(function(elmt) { return elmt.name === "paContextId"	})[0];
				var contextId = self.childData.filter(function(elmt) { return elmt.name === "contextId" })[0];
					
				self.url = self.childData.filter(function(elmt) { return elmt.name === "Url" })[0];
				self.contextId = self.childData.filter(function(elmt) { return elmt.name === "contextId" })[0];

				
				var td = domConstruct.create("td", {}, self.childRow);
				var cell = new LinkCell(type.value + " " + id.value, self.url.value); // si tu veux un lien
				cell.render(td);
				
	
				// Cellule Summary
				var td2 = domConstruct.create("td", {}, self.childRow);
				if( summary.editable) {
					var cell = new EditableTextCell(summary.value, function(newValue) {
					    var fieldName = summary.name || "Summary";
					    self._onTextboxChanged(self.url.value, fieldName, newValue);
					});					
				} else {
					var cell = new LinkCell(summary.value, this.url.value); // si tu veux un lien
				}
				cell.render(td2);

				for (var i = 0; i < self.childData.length; i++) {
					
					var childElemt = self.childData[i];

					if (["Type","Id","Summary","Url","contextId","paContextId"].includes(childElemt.name)) continue;


					var td = domConstruct.create("td", {}, this.childRow);
	
					if (!childElemt.editable) {
						var cell = new StandardCell(childElemt.value);
					} else {
						if (childElemt.type === "string" ) {
							var cell = new EditableTextCell(childElemt, self.callback.bind(self));
						
						} else if (childElemt.type === "category" ) {
							var cell = new CategoryCell(childElemt, paContextId, self.callback.bind(self));
						
						} else if (childElemt.type === "contributor" ) {
							var cell = new ContributorCell(childElemt, contextId, self.callback.bind(self));
						
						} else if (childElemt.type === "deliverable" ) {
							var cell = new DeliverableCell(childElemt, paContextId, self.callback.bind(self));
						
						} else if (childElemt.type === "enumeration" || childElemt.type === "state" ) {
							var cell = new ComboBoxCell(childElemt, childElemt.values, self.callback.bind(self));
						
						} else {
							console.log(childElemt);
						}
					}
					cell.render(td);
				}
			},
			
			
			callback: function(newValue, element) {
				var self = this;
				var fieldName = element.name || "childElemt.name";
				self._onTextboxChanged(self.url.value, fieldName, newValue);
			},
			
			startup: function () {
			    this.inherited(arguments);
			},
			
			_onTextboxChanged: function(url, fieldName, value) {
				if (this.changed[url] === undefined) this.changed[url] = {};
				this.changed[url][fieldName] = value;
				console.log("Champ modifié :", url, ": " , fieldName, "->", value);
				console.log(this.changed);

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
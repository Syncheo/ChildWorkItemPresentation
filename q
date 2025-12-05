[1mdiff --git a/resources/ui/ChildRow.js b/resources/ui/ChildRow.js[m
[1mindex 7699fbc..9b0846d 100644[m
[1m--- a/resources/ui/ChildRow.js[m
[1m+++ b/resources/ui/ChildRow.js[m
[36m@@ -15,13 +15,14 @@[m [mdefine([[m
 	"dojo/store/Memory",[m
     "dijit/form/DateTextBox",[m
     "dijit/form/CheckBox",[m
[32m+[m	[32m"dojo/date/stamp",[m
     "dojo/on",[m
     "dojo/dom-construct",[m
     "dojo/text!./templates/ChildRow.html"[m
 ], function ([m
     declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,[m
     Tooltip, TextBox, Select, ComboBox, Memory, DateTextBox, CheckBox,[m
[31m-    on, domConstruct, template) {[m
[32m+[m[32m    stamp, on, domConstruct, template) {[m
 	return declare("fr.syncheo.ewm.childitem.presentation.ui.ChildRow", [m
 		[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {[m
 			[m
[36m@@ -39,49 +40,28 @@[m [mdefine([[m
 				this.configurationElements = configurationElements;[m
 			},[m
 	[m
[32m+[m			[32mparseRtcDate: function(str) {[m
[32m+[m			[32m    return stamp.fromISOString( str.replace(/([+-]\d{2})(\d{2})$/, "$1:$2") );[m
[32m+[m			[32m},[m
[32m+[m
[32m+[m			[32mtoRtcDate: function(dateObj) {[m
[32m+[m			[32m    return stamp.toISOString(dateObj).replace(/([+-]\d{2}):(\d{2})$/, "$1$2");[m
[32m+[m			[32m},[m
[32m+[m[41m				[m
 			postCreate: function () {[m
 				var self = this;[m
[31m-				self.changed = {};[m
[31m-				[m
[32m+[m				[32mself.changed = {};[m[41m			[m
 				console.log(self.childData);[m
 				self.inherited(arguments);[m
[31m-				[m
[32m+[m
 				if (!self.childData) return;[m
[31m-					[m
[31m-				// Lancer après un petit délai pour laisser Jazz rendre la page[m
[31m-				setTimeout(function () {[m
[31m-				    var globalSaveBtn = document.querySelector('button.j-button-primary[dojoattachpoint="saveCmd"]');[m
 [m
[31m-				    if (globalSaveBtn) {[m
[31m-				        self.own([m
[31m-				            on(globalSaveBtn, "click", function (evt) {[m
[31m-				                self._onGlobalSave(evt);[m
[31m-				            })[m
[31m-				        );[m
[31m-				    } else {[m
[31m-				        console.warn("⚠️ Bouton Save global non trouvé !");[m
[31m-				    }[m
[31m-				}, 300);[m
[31m-					[m
[31m-				[m
[32m+[m				[32mvar id = self.childData.filter(function(elmt) {	return elmt.name === "Id" })[0];[m
[32m+[m				[32mvar type = self.childData.filter(function(elmt) { return elmt.name === "Type"	})[0];[m
[32m+[m				[32mvar summary = self.childData.filter(function(elmt) { return elmt.name === "Summary" })[0];[m
 				[m
[31m-				var id = self.childData.filter(function(elmt) {[m
[31m-						return elmt.name === "Id"[m
[31m-				})[0];[m
[31m-				var type = self.childData.filter(function(elmt) {[m
[31m-					return elmt.name === "Type"[m
[31m-				})[0];[m
[31m-				var summary = self.childData.filter(function(elmt) {[m
[31m-					return elmt.name === "Summary"[m
[31m-				})[0];[m
[31m-				[m
[31m-				self.url = self.childData.filter(function(elmt) {[m
[31m-					return elmt.name === "Url"[m
[31m-				})[0];[m
[31m-				[m
[31m-				self.contextId = self.childData.filter(function(elmt) {[m
[31m-					return elmt.name === "contextId"[m
[31m-				})[0];[m
[32m+[m				[32mself.url = self.childData.filter(function(elmt) { return elmt.name === "Url" })[0];[m
[32m+[m				[32mself.contextId = self.childData.filter(function(elmt) { return elmt.name === "contextId" })[0];[m
 [m
 				var td1 = domConstruct.create("td", {}, self.childRow);[m
 				domConstruct.create("a", {[m
[36m@@ -91,6 +71,7 @@[m [mdefine([[m
 [m
 				// Cellule Summary[m
 				var td2 = domConstruct.create("td", {}, self.childRow);[m
[32m+[m
 				if( summary.editable) {[m
 					var container = domConstruct.create("div", { style: "width:100%;"}, td2);[m
 					var widget = new TextBox({value: summary.value }, container);[m
[36m@@ -102,64 +83,69 @@[m [mdefine([[m
 					}[m
 					self.own([m
 					    on(widget, "input", lang.hitch(self, function(evt) {[m
[31m-					        console.log("Changement détecté :", widget.value);[m
[31m-							var value = widget.get("value");           // valeur actuelle du TextBox[m
[31m-							var fieldName = summary.name || "Summary"; // ou le nom de ton champ[m
[31m-							self._onTextboxChanged(self.url.value, fieldName, value);[m
[32m+[m							[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m							[32mvar value = widget.get("value");[m
[32m+[m							[32mvar fieldName = summary.name || "Summary";[m
[32m+[m							[32mvar urlValue = self.url && self.url.value ? self.url.value : null;[m
[32m+[m							[32mif (urlValue) self._onTextboxChanged(self.changed, urlValue, fieldName, value);[m
 					    }))[m
 					);[m
[31m-					[m
 				} else {[m
 					domConstruct.create("a", { href: self.url.value, innerHTML: summary.value }, td2);	[m
 				}[m
[31m-		[m
 [m
 				for (var i = 0; i < self.childData.length; i++) {[m
[31m-					var childElemt = self.childData[i][m
[31m-					if (childElemt.name === "Type" || childElemt.name === "Id" || [m
[31m-						childElemt.name === "Summary" || childElemt.name === "Url" || [m
[31m-						childElemt.name === "contextId"|| childElemt.name === "paContextId") continue;[m
[31m-					if (!childElemt.editable) {[m
[31m-						domConstruct.create("td", { innerHTML: childElemt.value }, self.childRow);[m
[31m-					} else {[m
[31m-						var td = domConstruct.create("td", {}, self.childRow);[m
[32m+[m					[32mvar childElement = self.childData[i][m
[32m+[m					[32mif (["Type","Id","Summary","Url","contextId","paContextId"].includes(childElement.name)) continue;[m
[32m+[m[41m					[m
[32m+[m					[32mvar td = domConstruct.create("td", {}, self.childRow);[m
[32m+[m
[32m+[m					[32mif (!childElement.editable) {[m
[32m+[m						[32mvar textBoxValue = childElement.value;[m
[32m+[m						[32mif (childElement.type === "pipearray") textBoxValue = textBoxValue.split("|").filter(Boolean).join(", ");[m
[32m+[m						[32mtd.innerHTML = textBoxValue;[m
[32m+[m					[32m}  else {[m
 						var container = domConstruct.create("div", { style: "width:100%;" }, td);[m
[32m+[m
[32m+[m					[32m}[m
[32m+[m
[32m+[m				[32m}[m
[32m+[m			[32m},[m
[32m+[m[41m							[m
[32m+[m[41m			[m
[32m+[m			[32m/*[m
[32m+[m[41m					[m
[32m+[m				[32mfor (var i = 0; i < self.childData.length; i++) {[m
[32m+[m					[32mvar childElement = self.childData[i][m
[32m+[m					[32mif (["Type","Id","Summary","Url","contextId","paContextId"].includes(childElement.name)) continue;[m
[32m+[m
[32m+[m[41m					[m
[32m+[m
[32m+[m[41m					[m
[32m+[m					[32melse {[m
 						var widget = null;[m
[31m-						[m
[31m-						/*[m
[31m-						array, contributor, category, deliverable, iteration, resolution, state, [m
[31m-						*/[m
[31m-						[m
[31m-						/*[m
[31m-						pipearray[m
[31m-						*/[m
[31m-						[m
[31m-						/*string, integer, timestamp, duration*/[m
[31m-						[m
[32m+[m[41m												[m
 						var comboBoxArrays = ["array", "contributor", "category", "deliverable", "iteration", "resolution", "state", "enumeration"];[m
 						[m
[31m-						[m
[31m-[m
[31m-						if (comboBoxArrays.includes(childElemt.type) ) {[m
[32m+[m						[32mif (comboBoxArrays.includes(childElement.type) ) { //array, contributor, category, deliverable, iteration, resolution, state, enumeration[m
 							[m
 							var options = [];[m
[31m-							if (childElemt.type === "contributor") {[m
[31m-								options = self.configurationElements[childElemt.type][self.contextId.value].map( function (c) {[m
[31m-									return { label: c.name, value: c.id };	[m
[31m-								});[m
[31m-							} else {[m
[31m-								options = self.configurationElements[childElemt.type].map( function (c) {[m
[31m-									return { label: c.name, value: c.id };	[m
[31m-								});[m
[31m-							}[m
[32m+[m							[32mtry {[m
[32m+[m							[32m    if (childElement.type === "contributor") {[m
[32m+[m							[32m        options = self.configurationElements[childElement.type][self.contextId.value] || [];[m
[32m+[m							[32m    } else {[m
[32m+[m							[32m        options = self.configurationElements[childElement.type] || [];[m
[32m+[m							[32m    }[m
[32m+[m							[32m} catch(e) { options = []; }[m
 							[m
[31m-							var storeData = options.map(function(opt) { return { name: opt.label || opt, id: opt.value || opt }; });[m
 [m
[32m+[m							[32mvar storeData = options.map(function(opt) { return { name: opt.name || opt.label, id: opt.id || opt.value }; });[m
[32m+[m[41m							[m
 							var memoryStore = new Memory({ data: storeData, idProperty: "id" });[m
 							[m
 							[m
 							widget = new ComboBox({[m
[31m-								value: childElemt.value, [m
[32m+[m								[32mvalue: childElement.value,[m[41m [m
 								store: memoryStore, [m
 								searchAttr: "name" }, container);							[m
 							widget.startup();[m
[36m@@ -170,15 +156,55 @@[m [mdefine([[m
 							}[m
 							self.own([m
 								on(widget, "change", lang.hitch(self, function(value) {[m
[31m-									var fieldName = childElemt.name || "childElemt";[m
[31m-									var item = memoryStore.query({ name: value })[0]; [m
[31m-									var idToSend = item ? item.id : value;[m
[31m-									[m
[31m-									self._onTextboxChanged(this.url.value, fieldName, idToSend);[m
[32m+[m				[32m                     if (self._destroyed || self._beingDestroyed) return;[m
[32m+[m				[32m                     var fieldName = childElement.name || "childElement";[m
[32m+[m				[32m                     var item = memoryStore.query({ name: value })[0];[m
[32m+[m				[32m                     var idToSend = item ? item.id : value;[m
[32m+[m				[32m                     var urlValue = self.url && self.url.value ? self.url.value : null;[m
[32m+[m				[32m                     if (urlValue) self._onTextboxChanged(self.changed, urlValue, fieldName, idToSend);[m[41m			[m
[32m+[m								[32m}))[m
[32m+[m							[32m);[m
[32m+[m						[32m} else if (childElement.type === "pipearray"){ //pipearray[m
[32m+[m							[32mvar textBoxValue = childElement.value.split("|").filter(Boolean).join(", ");[m
[32m+[m							[32mwidget = new TextBox({ value: textBoxValue }, container);[m
[32m+[m							[32mwidget.startup();[m
[32m+[m							[32mwidget.domNode.style.width = "100%";[m
[32m+[m							[32mif (widget.focusNode) {[m
[32m+[m							[32m    widget.focusNode.style.width = "100%";[m
[32m+[m							[32m    widget.focusNode.style.boxSizing = "border-box";[m
[32m+[m							[32m}[m
[32m+[m							[32mself.own([m
[32m+[m								[32mon(widget, "input", lang.hitch(self, function(evt) {[m
[32m+[m									[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m									[32mvar value = widget.get("value");[m[41m   [m
[32m+[m									[32mvalue = "|" + value.split(",").map(function(s) { return s.trim(); }).join("|") + "|";[m[41m								[m
[32m+[m									[32mvar fieldName = childElement.name || "childElement";[m
[32m+[m									[32mvar urlValue = self.url && self.url.value ? self.url.value : null;[m
[32m+[m									[32mif (urlValue) self._onTextboxChanged(self.changed, urlValue, fieldName, value);[m
 								}))[m
 							);[m
[31m-						} else {[m
[31m-							widget = new TextBox({ value: childElemt.value }, container);[m
[32m+[m						[32m} else if (childElement.type === "timestamp"){ //timestamp[m
[32m+[m
[32m+[m[41m							[m
[32m+[m								[32mwidget = new DateTextBox({ value: self.parseRtcDate(childElement.value) }, container);[m
[32m+[m								[32mwidget.startup();[m
[32m+[m								[32mwidget.domNode.style.width = "100%";[m
[32m+[m								[32mif (widget.focusNode) {[m
[32m+[m								[32m    widget.focusNode.style.width = "100%";[m
[32m+[m								[32m    widget.focusNode.style.boxSizing = "border-box";[m
[32m+[m								[32m}[m
[32m+[m								[32mself.own([m
[32m+[m									[32mon(widget, "change", lang.hitch(self, function(evt) {[m
[32m+[m										[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m										[32mvar value = widget.get("value");           			// valeur actuelle du TextBox[m
[32m+[m										[32mvalue = self.toRtcDate(value);[m
[32m+[m										[32mvar fieldName = childElement.name || "childElement"; 	// ou le nom de ton champ[m
[32m+[m										[32mvar urlValue = self.url && self.url.value ? self.url.value : null;[m
[32m+[m										[32mif (urlValue) self._onTextboxChanged(self.changed, urlValue, fieldName, value);[m
[32m+[m									[32m}))[m
[32m+[m								[32m);[m[41m				[m
[32m+[m						[32m} else {	//string, integer, duration, ,[m[41m [m
[32m+[m							[32mwidget = new TextBox({ value: childElement.value }, container);[m
 							widget.startup();[m
 							widget.domNode.style.width = "100%";[m
 							if (widget.focusNode) {[m
[36m@@ -187,147 +213,32 @@[m [mdefine([[m
 							}[m
 							self.own([m
 								on(widget, "input", lang.hitch(self, function(evt) {[m
[32m+[m									[32mif (self._destroyed || self._beingDestroyed) return;[m
 									var value = widget.get("value");           			// valeur actuelle du TextBox[m
[31m-									var fieldName = childElemt.name || "childElemt"; 	// ou le nom de ton champ[m
[31m-									self._onTextboxChanged(self.url.value, fieldName, value);[m
[32m+[m									[32mvar fieldName = childElement.name || "childElement"; 	// ou le nom de ton champ[m
[32m+[m									[32mvar urlValue = self.url && self.url.value ? self.url.value : null;[m
[32m+[m									[32mif (urlValue) self._onTextboxChanged(self.changed, urlValue, fieldName, value);[m
 								}))[m
 							);[m
 						}[m
 					}[m
 				}[m
[32m+[m[41m				[m
 			},[m
 			[m
[32m+[m[41m			[m
[32m+[m[41m			[m
[32m+[m			[32m*/[m
[32m+[m[41m			[m
 			startup: function () {[m
 			    this.inherited(arguments);[m
 			},[m
 			[m
[31m-			_onTextboxChanged: function(url, fieldName, value) {[m
[31m-				if (this.changed[url] === undefined) this.changed[url] = {};[m
[31m-				this.changed[url][fieldName] = value;[m
[32m+[m			[32m_onTextboxChanged: function(changed, url, fieldName, value) {[m
[32m+[m				[32mif (changed[url] === undefined) changed[url] = {};[m
[32m+[m				[32mchanged[url][fieldName] = value;[m
 				console.log("Champ modifié :", url, ": " , fieldName, "->", value);[m
[31m-			},[m
[31m-[m
[31m-			_onGlobalSave: function(evt) {[m
[31m-				if (Object.keys(this.changed).length !== 0) {[m
[31m-					console.log("👉 Le bouton SAVE global a été cliqué !");[m
[31m-					console.log("Changed : ", this.changed)[m
[31m-				}[m
[31m-			},[m
[31m-			[m
[31m-            // --- Summary ---[m
[31m-   [m
[31m-[m
[31m-/*            // ========== AUTRES COLONNES ==========[m
[31m-            for (var i = 0; i < this.headers.length; i++) {[m
[31m-                var h = this.headers[i];[m
[31m-                if (h === "Type" || h === "Id" || h === "Summary") continue;[m
[31m->>>>>>> Stashed changes[m
[31m-[m
[31m-                var td = domConstruct.create("td", {}, this.childRow);[m
[31m-                var value = this.childData[h];[m
[31m-                var type = this.getFieldType(h);[m
[31m-[m
[31m-                // NON EDITABLE[m
[31m-                if (!this.editable.includes(h)) {[m
[31m-                    td.innerHTML = value || "";[m
[31m-                    continue;[m
[31m-                }[m
[31m-[m
[31m-                // --- CONTENEUR POUR LE WIDGET ---[m
[31m-                var container = domConstruct.create("div", {[m
[31m-                    style: "width:100%;"[m
[31m-                }, td);[m
[31m-[m
[31m-                var widget = null;[m
[31m-[m
[31m-                // ========== ENUM ==========[m
[31m-                if (type === "enum") {[m
[31m-                    widget = new Select({[m
[31m-                        value: value,[m
[31m-                        options: this.getEnumValues(h)[m
[31m-                    }, container);[m
[31m-                    widget.startup();[m
[31m-                }[m
[31m-[m
[31m-                // ========== DATE ==========[m
[31m-                else if (type === "date") {[m
[31m-                    widget = new DateTextBox({[m
[31m-                        value: value ? new Date(value) : null[m
[31m-                    }, container);[m
[31m-                    widget.startup();[m
[31m-                }[m
[31m-[m
[31m-                // ========== TEXTE ==========[m
[31m-                else {[m
[31m-                    widget = new TextBox({[m
[31m-                        value: value[m
[31m-                    }, container);[m
[31m-                    widget.startup();[m
[31m-                }[m
[31m-[m
[31m-                // Largeur 100%[m
[31m-                widget.domNode.style.width = "100%";[m
[31m-                if (widget.focusNode) {[m
[31m-                    widget.focusNode.style.width = "100%";[m
[31m-                    widget.focusNode.style.boxSizing = "border-box";[m
[31m-                }[m
[31m-[m
[31m-                // Empêche IBM de détecter les changements[m
[31m-  //              this._blockIBMEvents(widget.focusNode || widget.domNode);[m
[31m-[m
[31m-                // Ton PROPRE mécanisme de sauvegarde[m
[31m-/*                (function (field, wgt) {[m
[31m-[m
[31m-                    // Enter = commit[m
[31m-                    on(wgt.domNode, "keydown", function (evt) {[m
[31m-                        if (evt.keyCode === 13) {[m
[31m-                            var val = wgt.get("value");[m
[31m-                            self.childData[field] = val;[m
[31m-                            self.emitCustomSaveEvent(field, val);[m
[31m-                            evt.stopPropagation();[m
[31m-                            evt.preventDefault();[m
[31m-                        }[m
[31m-                    });[m
[31m-[m
[31m-                    // Blur = commit (optionnel)[m
[31m-                    on(wgt.domNode, "blur", function () {[m
[31m-                        var val = wgt.get("value");[m
[31m-                        self.childData[field] = val;[m
[31m-                        self.emitCustomSaveEvent(field, val);[m
[31m-                    });[m
[31m-[m
[31m-                })(h, widget);[m
[31m-            }[m
[31m-        },*/[m
[31m-[m
[31m-[m
[31m-[m
[31m-/*        emitCustomSaveEvent: function (field, value) {[m
[31m-            var event = new CustomEvent("mySaveEvent", {[m
[31m-                detail: {[m
[31m-                    field: field,[m
[31m-                    value: value,[m
[31m-                    workItem: this.childData[m
[31m-                }[m
[31m-            });[m
[31m-            document.dispatchEvent(event);[m
[31m-        },*/[m
[31m-[m
[31m-        getFieldType: function (header) {[m
[31m-            if (header === "Due Date" || header === "Start Date") return "date";[m
[31m-            if (header === "Priority" || header === "Severity") return "enum";[m
[31m-            return "text";[m
[31m-        },[m
[32m+[m			[32m}[m
 [m
[31m-        getEnumValues: function (header) {[m
[31m-            if (header === "Priority") {[m
[31m-                return [[m
[31m-                    { label: "High", value: "High" },[m
[31m-                    { label: "Medium", value: "Medium" },[m
[31m-                    { label: "Low", value: "Low" }[m
[31m-                ];[m
[31m-            }[m
[31m-            return [];[m
[31m-        }[m
     });[m
 });[m
[1mdiff --git a/resources/ui/Presentation.js b/resources/ui/Presentation.js[m
[1mindex 32e522d..f862e39 100644[m
[1m--- a/resources/ui/Presentation.js[m
[1m+++ b/resources/ui/Presentation.js[m
[36m@@ -1,4 +1,3 @@[m
[31m-[m
 define([[m
 	"dojo/_base/declare",[m
 	"dijit/_WidgetBase",[m
[36m@@ -75,7 +74,7 @@[m [mdefine([[m
 			this.inherited(arguments, []);[m
 			this.templateString = template;[m
 			this.itemId = args.workItem.itemId;[m
[31m-			this.conf = this.setConfigurationProperties(args);[m
[32m+[m			[32mthis.setConfigurationProperties(args);[m
 			this.workItem = args.workItem;[m
 		},[m
 		[m
[36m@@ -89,7 +88,6 @@[m [mdefine([[m
 		[m
 [m
 		setConfigurationProperties: function (args) {[m
[31m-			var conf = {};[m
 			var properties = args.presentation.properties;[m
 [m
 			this.setVisibleAttributes();[m
[36m@@ -112,7 +110,7 @@[m [mdefine([[m
 							configuredAttribut.name = added;[m
 							configuredAttribut.visible = true;[m
 							configuredAttribut.editable = "configurable";[m
[31m-							configuredAttribut.rest = "allExtensions/(displayName|displayValue|type)|customAttributes/(identifier|attributeType|projectArea/enumerations/*/*)";							[m
[32m+[m							[32mconfiguredAttribut.rest = "allExtensions/(key|displayName|displayValue|type)|customAttributes/(identifier|attributeType|projectArea/enumerations/*/*)";[m[41m							[m
 						}[m
 						this.visibleAttributes.push(configuredAttribut)[m
 					}[m
[36m@@ -122,7 +120,7 @@[m [mdefine([[m
 				var editableProperties = properties.filter(function(p) {[m
 					return p.key === "editable"[m
 				})[m
[31m-				[m
[32m+[m[41m									[m
 				for (var i = 0; i < editableProperties.length; i++ ) {[m
 					var editableProperty = editableProperties[i];[m
 					var editableAttributes = this.splitByComma(editableProperty.value);[m
[36m@@ -136,13 +134,15 @@[m [mdefine([[m
 				}[m
 			}[m
 [m
[31m-			return conf;[m
[32m+[m			[32mthis.visibleAttributes.forEach(function(e) { if (e.editable === "configurable") e.editable = false })[m
 		},[m
 [m
 [m
 		createChildTable: function (workItemId) {[m
 			var self = this;[m
 			[m
[32m+[m			[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m[41m			[m
 			self.childs = [];[m
 			[m
 			//var childsUrl = JAZZ.getApplicationBaseUrl() [m
[36m@@ -159,247 +159,248 @@[m [mdefine([[m
 			[m
 [m
 			XHR.oslcXmlGetRequest(childsUrl).then(function (data) {[m
[32m+[m				[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m
 				var children = data.getElementsByTagName("children");[m
 				[m
 				var allRowsPromises = [];[m
 				[m
 				for (var i = 0; i < children.length; i++) {[m
 					(function(index) {[m
[31m-					var c = children[i];[m
[31m-					var child = [];[m
[31m-					var childPromises = []; // tableau pour collecter toutes les promesses de XHR[m
[31m-					[m
[31m-					for (var j = 0; j < self.visibleAttributes.length; j += 1) {[m
[31m-						var childAttributes = {};[m
[31m-						var attribut = self.visibleAttributes[j];[m
[31m-						for(var k = 0; k < Object.keys(attribut).length; k++) {[m
[31m-							childAttributes[Object.keys(attribut)[k]] = attribut[Object.keys(attribut)[k]];[m
[31m-						}					[m
[32m+[m						[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m
[32m+[m						[32mvar c = children[i];[m
[32m+[m						[32mvar child = [];[m
[32m+[m						[32mvar childPromises = []; // tableau pour collecter toutes les promesses de XHR[m
 						[m
[31m-						function getFirstTagText(element, tagName) {[m
[31m-						    if (!element) return null;[m
[31m-						    var n = element.getElementsByTagName(tagName);[m
[31m-						    return (n && n[0] && n[0].textContent) || null;[m
[31m-						}[m
[31m-													[m
[31m-						if (childAttributes.rest && childAttributes.rest.indexOf("allExtensions") !== -1) {[m
[31m-							var tt = self.getCustomAttributDisplayValue(c, childAttributes.name);[m
[31m-							childAttributes.type = tt ? tt.type : "";[m
[31m-							childAttributes.value = tt ? tt.value : "";[m
[31m-						} else if (childAttributes.rest && childAttributes.rest.indexOf("state") !== -1) {[m
[32m+[m						[32mfor (var j = 0; j < self.visibleAttributes.length; j += 1) {[m
[32m+[m							[32mvar childAttributes = Object.assign({}, self.visibleAttributes[j]);[m
[32m+[m[41m									[m
[32m+[m							[32mif (childAttributes.rest && childAttributes.rest.indexOf("allExtensions") !== -1) {[m
[32m+[m								[32mvar tt = self.getAllExtensionsDisplayValue(c, childAttributes.name);[m
[32m+[m								[32mchildAttributes.type = tt ? tt.type : "";[m
[32m+[m								[32mchildAttributes.value = tt ? tt.value : "";[m
[32m+[m								[32mvar key = tt ? tt.key : null;[m
[32m+[m[41m								[m
[32m+[m								[32mif (key) { // ✅ Vérification ESSENTIELLE[m
[32m+[m									[32mvar enumerations = self.getCustomAttributesBykey(c, key);[m
[32m+[m									[32mchildAttributes.type = enumerations ? enumerations.type : childAttributes.type;[m
[32m+[m									[32mchildAttributes.values = enumerations ? enumerations.values : [];[m
[32m+[m								[32m}[m
 							[m
[32m+[m							[32m} else if (childAttributes.rest && childAttributes.rest.indexOf("state") !== -1) {[m
[32m+[m[41m					[m
[32m+[m								[32mvar stateName = self.getFirstTagText(c.getElementsByTagName("state")[0], "name");[m
[32m+[m[41m								[m
[32m+[m								[32mvar stateTransitions = Array.from([m
[32m+[m								[32m    c.getElementsByTagName("stateTransitions") || [][m
[32m+[m								[32m);[m
[32m+[m[41m							[m
[32m+[m								[32mvar targetStates = stateTransitions.map(function(st) {[m
[32m+[m							[32m        if (!st) return null;[m
[32m+[m									[32mvar targetStateId = self.getFirstTagText(st, "targetStateId");[m
[32m+[m									[32mif (!targetStateId) return null;[m
[32m+[m[41m	[m
[32m+[m									[32mvar sourceProjectArea = st.getElementsByTagName("sourceProjectArea")[0];[m
[32m+[m									[32mif (!sourceProjectArea) return null;[m
[32m+[m[41m	[m
[32m+[m									[32mvar states = Array.from(sourceProjectArea.getElementsByTagName("states") || []);[m
[32m+[m									[32mvar matched = states.map(function(state) {[m
[32m+[m										[32mif (!state) return null;[m
[32m+[m										[32mvar id = self.getFirstTagText(state, "id");[m
[32m+[m										[32mif (id !== targetStateId) return null;[m
[32m+[m										[32mreturn self.getFirstTagText(state, "name");[m
[32m+[m									[32m}).filter(function(x) { return x; }); // retire null/undefined[m
[32m+[m									[32mreturn matched[0] || null;[m
[32m+[m[41m								[m
[32m+[m								[32m}).filter(function(x) { return x; });[m[41m [m
[32m+[m[41m					[m
 	[m
[31m-							var stateName = getFirstTagText(c.getElementsByTagName("state")[0], "name");[m
[32m+[m								[32mif (!targetStates.includes(stateName)) targetStates.unshift(stateName);[m
[32m+[m								[32mchildAttributes.value = stateName;[m
[32m+[m								[32mchildAttributes.values = targetStates;[m
[32m+[m[41m								[m
[32m+[m							[32m} else if (childAttributes.rest.includes("/")) {[m
[32m+[m								[32mvar parts = childAttributes.rest.split("/");[m[41m [m
[32m+[m								[32mvar firstNode = c.getElementsByTagName(parts[0])[0];[m[41m [m
[32m+[m								[32mvar secondNode = firstNode ? firstNode.getElementsByTagName(parts[1])[0] : null;[m[41m [m
[32m+[m								[32mchildAttributes.value = secondNode ? secondNode.textContent : "";[m[41m							[m
[32m+[m							[32m} else {[m
[32m+[m								[32mvar elemtNode = c.getElementsByTagName(childAttributes.rest)[0];[m[41m [m
[32m+[m								[32mvar elemt = elemtNode ? elemtNode.textContent : "";[m[41m [m
[32m+[m								[32mif (childAttributes.rest === "itemId")[m[41m [m
[32m+[m									[32melemt = JAZZ.getApplicationBaseUrl() + "resource/itemOid/com.ibm.team.workitem.WorkItem/" + elemt;[m[41m [m
[32m+[m								[32mchildAttributes.value = elemt;[m
[32m+[m							[32m}[m
 							[m
[31m-							var stateTransitions = Array.from([m
[31m-							    c.getElementsByTagName("stateTransitions") || [][m
[31m-							);[m
[32m+[m							[32mif (!self.configurationElements) self.configurationElements= {};[m
 							[m
[31m-							var targetStates = stateTransitions.map(function(st) {[m
[31m-						        if (!st) return null;[m
[31m-								var targetStateId = getFirstTagText(st, "targetStateId");[m
[31m-								if (!targetStateId) return null;[m
[31m-[m
[31m-								var sourceProjectArea = st.getElementsByTagName("sourceProjectArea")[0];[m
[31m-								if (!sourceProjectArea) return null;[m
[31m-[m
[31m-								var states = Array.from(sourceProjectArea.getElementsByTagName("states") || []);[m
[31m-								var matched = states.map(function(state) {[m
[31m-									if (!state) return null;[m
[31m-									var id = getFirstTagText(state, "id");[m
[31m-									if (id !== targetStateId) return null;[m
[31m-									return getFirstTagText(state, "name");[m
[31m-								}).filter(function(x) { return x; }); // retire null/undefined[m
[31m-								return matched[0] || null;[m
[32m+[m							[32mvar paContextId = self.getFirstTagText(c.getElementsByTagName("projectArea")[0], "contextId");[m
 							[m
[31m-							}).filter(function(x) { return x; }); [m
[31m-					[m
[31m-	[m
[31m-							if (!targetStates.includes(stateName)) targetStates.unshift(stateName);[m
[31m-							childAttributes.value = stateName;[m
[31m-							childAttributes.values = targetStates;[m
[32m+[m							[32mvar contextIdNode = c.getElementsByTagName("contextId")[0];[m[41m [m
[32m+[m							[32mvar contextId = contextIdNode ? contextIdNode.textContent : "empty";[m
 							[m
[31m-						} else if (childAttributes.rest.includes("/")) {[m
[31m-							var parts = childAttributes.rest.split("/"); [m
[31m-							var firstNode = c.getElementsByTagName(parts[0])[0]; [m
[31m-							var secondNode = firstNode ? firstNode.getElementsByTagName(parts[1])[0] : null; [m
[31m-							childAttributes.value = secondNode ? secondNode.textContent : "";							[m
[31m-						} else {[m
[31m-							var elemtNode = c.getElementsByTagName(childAttributes.rest)[0]; [m
[31m-							var elemt = elemtNode ? elemtNode.textContent : ""; [m
[31m-							if (childAttributes.rest === "itemId") [m
[31m-								elemt = JAZZ.getApplicationBaseUrl() + "resource/itemOid/com.ibm.team.workitem.WorkItem/" + elemt; [m
[31m-							childAttributes.value = elemt;[m
[31m-						}[m
[31m-						[m
[31m-						if (!self.configurationElements) self.configurationElements= {};[m
[31m-						[m
[31m-						var paContextId = getFirstTagText(c.getElementsByTagName("projectArea")[0], "contextId");[m
[31m-						[m
[31m-						var contextIdNode = c.getElementsByTagName("contextId")[0]; [m
[31m-						var contextId = contextIdNode ? contextIdNode.textContent : "empty";[m
[31m-						[m
[31m-						[m
[31m-						[m
[31m-						if (childAttributes.type === "deliverable" && childAttributes.editable !== false) {[m
 							[m
[31m-							if (!Array.isArray(self.configurationElements.deliverable) || self.configurationElements.deliverable.length === 0) {[m
[31m-								var deliverablePromise = new Deferred(); [m
[31m-								self.configurationElements.deliverable = [];[m
[32m+[m[41m						[m
[32m+[m							[32mif (childAttributes.type === "deliverable" && childAttributes.editable !== false) {[m
 								[m
[31m-								if (paContextId) {[m
[31m-									var deliverableUrl = JAZZ.getApplicationBaseUrl() +[m
[31m-										"rpt/repository/workitem?fields=workitem/deliverable[contextId=" + paContextId + "]/(itemId|name)";[m
[31m-									XHR.oslcXmlGetRequest(deliverableUrl).then([m
[31m-										function (data) {[m
[31m-											var devNodes = data ? data.getElementsByTagName("deliverable") : [];[m
[31m-											var dev = Array.from(devNodes || []);[m
[31m-	[m
[31m-											self.configurationElements.deliverable = dev.map(function(d) {[m
[31m-												return {[m
[31m-													id: getFirstTagText(d, "itemId"),[m
[31m-													name: getFirstTagText(d, "name")[m
[31m-												}[m
[31m-											});[m
[31m-											deliverablePromise.resolve();[m
[31m-										},[m
[31m-										function(err) {[m
[31m-											console.error("Erreur chargement deliverable:", err);[m
[31m-											deliverablePromise.resolve();[m
[31m-										}[m
[31m-									);[m
[31m-								} else {[m
[31m-									deliverablePromise.resolve();[m
[32m+[m								[32mif (!Array.isArray(self.configurationElements.deliverable) || self.configurationElements.deliverable.length === 0) {[m
[32m+[m									[32mvar deliverablePromise = new Deferred();[m[41m [m
[32m+[m									[32mself.configurationElements.deliverable = [];[m
[32m+[m[41m									[m
[32m+[m									[32mif (paContextId) {[m
[32m+[m										[32mvar deliverableUrl = JAZZ.getApplicationBaseUrl() +[m
[32m+[m											[32m"rpt/repository/workitem?fields=workitem/deliverable[contextId=" + paContextId + "]/(itemId|name)";[m
[32m+[m										[32mXHR.oslcXmlGetRequest(deliverableUrl).then([m
[32m+[m											[32mfunction (data) {[m
[32m+[m												[32mif (self._destroyed || self._beingDestroyed) return deliverablePromise.resolve();[m
[32m+[m[41m												[m
[32m+[m												[32mvar deliverables = Array.from(data.getElementsByTagName("deliverable") || [] );[m
[32m+[m[41m		[m
[32m+[m												[32mself.configurationElements.deliverable = deliverables.map(function(d) {[m
[32m+[m													[32mreturn {[m
[32m+[m														[32mid: self.getFirstTagText(d, "itemId"),[m
[32m+[m														[32mname: self.getFirstTagText(d, "name")[m
[32m+[m													[32m}[m
[32m+[m												[32m});[m
[32m+[m												[32mdeliverablePromise.resolve();[m
[32m+[m											[32m},[m
[32m+[m											[32mfunction(err) {[m
[32m+[m												[32mconsole.error("Erreur chargement deliverable:", err);[m
[32m+[m												[32mdeliverablePromise.resolve();[m
[32m+[m											[32m}[m
[32m+[m										[32m);[m
[32m+[m									[32m} else {[m
[32m+[m										[32mdeliverablePromise.resolve();[m
[32m+[m									[32m}[m
[32m+[m									[32mchildPromises.push(deliverablePromise);[m
 								}[m
[31m-								childPromises.push(deliverablePromise);[m
 							}[m
[31m-						}[m
 						[m
 						[m
[31m-						if (childAttributes.type === "category" && childAttributes.editable !== false) {[m
[31m-							if (!self.configurationElements) self.configurationElements= {};[m
[31m-							if (!Array.isArray(self.configurationElements.category) || self.configurationElements.category.length === 0) {[m
[31m-								var categoryPromise = new Deferred();[m
[31m-								self.configurationElements.category = [];[m
[31m-								[m
[31m-								var paContextId = getFirstTagText(c.getElementsByTagName("projectArea")[0], "contextId");[m
[31m-[m
[31m-								[m
[31m-								if (paContextId) {[m
[31m-									var categoryUrl = JAZZ.getApplicationBaseUrl() +[m
[31m-										"rpt/repository/workitem?fields=workitem/category[contextId=" + paContextId + "]/(id|name)";[m
[31m-									XHR.oslcXmlGetRequest(categoryUrl).then([m
[31m-										function (data) {[m
[31m-											var catNodes = data ? data.getElementsByTagName("category") : [];[m
[31m-											var cat = Array.from(catNodes || []);[m
[32m+[m							[32mif (childAttributes.type === "category" && childAttributes.editable !== false) {[m
[32m+[m								[32mif (!self.configurationElements) self.configurationElements= {};[m
[32m+[m								[32mif (!Array.isArray(self.configurationElements.category) || self.configurationElements.category.length === 0) {[m
[32m+[m									[32mvar categoryPromise = new Deferred();[m
[32m+[m									[32mself.configurationElements.category = [];[m
[32m+[m[41m									[m
[32m+[m									[32mvar paContextId = self.getFirstTagText(c.getElementsByTagName("projectArea")[0], "contextId");[m
 	[m
[31m-											self.configurationElements.category = cat.map(function(d) {[m
[31m-												return {[m
[31m-													id: getFirstTagText(d, "id"), [m
[31m-													name: (getFirstTagText(d, "name") || "").split("/").pop()[m
[31m-												}[m
[31m-											});[m
[31m-											categoryPromise.resolve();[m
[31m-										},[m
[31m-										function(err) {[m
[31m-											console.error("Erreur chargement deliverable:", err);[m
[31m-											categoryPromise.resolve();[m
[31m-										}[m
[31m-									);[m
[31m-								} else {[m
[31m-									categoryPromise.resolve();[m
[32m+[m[41m									[m
[32m+[m									[32mif (paContextId) {[m
[32m+[m										[32mvar categoryUrl = JAZZ.getApplicationBaseUrl() +[m
[32m+[m											[32m"rpt/repository/workitem?fields=workitem/category[contextId=" + paContextId + "]/(id|name)";[m
[32m+[m										[32mXHR.oslcXmlGetRequest(categoryUrl).then([m
[32m+[m											[32mfunction (data) {[m
[32m+[m												[32mif (self._destroyed || self._beingDestroyed) return categoryPromise.resolve();[m
[32m+[m
[32m+[m[41m												[m
[32m+[m												[32mvar categories = Array.from(data.getElementsByTagName("category") || []);[m
[32m+[m[41m		[m
[32m+[m												[32mself.configurationElements.category = categories.map(function(d) {[m
[32m+[m													[32mreturn {[m
[32m+[m														[32mid: self.getFirstTagText(d, "id"),[m[41m [m
[32m+[m														[32mname: (self.getFirstTagText(d, "name") || "").split("/").pop()[m
[32m+[m													[32m}[m
[32m+[m												[32m});[m
[32m+[m												[32mcategoryPromise.resolve();[m
[32m+[m											[32m},[m
[32m+[m											[32mfunction(err) {[m
[32m+[m												[32mconsole.error("Erreur chargement category:", err);[m
[32m+[m												[32mcategoryPromise.resolve();[m
[32m+[m											[32m}[m
[32m+[m										[32m);[m
[32m+[m									[32m} else {[m
[32m+[m										[32mcategoryPromise.resolve();[m
[32m+[m									[32m}[m
[32m+[m									[32mchildPromises.push(categoryPromise);[m
 								}[m
[31m-								childPromises.push(categoryPromise);[m
 							}[m
[31m-						}[m
 [m
 						[m
[31m-						if (childAttributes.type === "contributor" && childAttributes.editable !== false) {[m
[31m-							[m
[31m-							if (!self.configurationElements.contributor) self.configurationElements.contributor = {};[m
[31m-							[m
[31m-							if (!self.configurationElements.contributor[contextId] || [m
[31m-							    self.configurationElements.contributor[contextId].length === 0) {[m
[32m+[m							[32mif (childAttributes.type === "contributor" && childAttributes.editable !== false) {[m
 								[m
[31m-								if (contextId) {[m
[31m-										[m
[31m-									var contributorPromise = new Deferred();[m
[31m-									self.configurationElements.contributor[contextId] = [];[m
[31m-										[m
[31m-									var contributorUrl = JAZZ.getApplicationBaseUrl() + [m
[31m-										"rpt/repository/foundation?fields=foundation/(" + [m
[31m-										"projectArea[itemId=" + contextId+ "]/teamMembers/(userId|name)|" + [m
[31m-										"teamArea[itemId="+ contextId+ "]/teamMembers/(userId|name))";[m
[31m-										[m
[31m-									XHR.oslcXmlGetRequest(contributorUrl).then([m
[31m-										function (data) {			[m
[31m-											var projectArea = Array.from(data.getElementsByTagName("projectArea") || []);[m
[31m-											var teamArea = Array.from(data.getElementsByTagName("teamArea") || []);[m
[32m+[m								[32mif (!self.configurationElements.contributor) self.configurationElements.contributor = {};[m
[32m+[m[41m								[m
[32m+[m								[32mif (!self.configurationElements.contributor[contextId] ||[m[41m [m
[32m+[m								[32m    self.configurationElements.contributor[contextId].length === 0) {[m
[32m+[m[41m									[m
[32m+[m									[32mif (contextId) {[m
 											[m
[32m+[m										[32mvar contributorPromise = new Deferred();[m
[32m+[m										[32mself.configurationElements.contributor[contextId] = [];[m
 											[m
[31m-											var paMembers = projectArea.map(function(pa) {[m
[31m-												var nodes = Array.from(pa.getElementsByTagName("teamMembers") || []);[m
[31m-												return nodes.map(function (tm) {[m
[31m-													return {[m
[31m-														id: getFirstTagText(tm, "userId"), [m
[31m-														name: getFirstTagText(tm, "name")[m
[31m-													}[m
[31m-												});[m
[31m-											});[m
[32m+[m										[32mvar contributorUrl = JAZZ.getApplicationBaseUrl() +[m[41m [m
[32m+[m											[32m"rpt/repository/foundation?fields=foundation/(" +[m[41m [m
[32m+[m											[32m"projectArea[itemId=" + contextId+ "]/teamMembers/(userId|name)|" +[m[41m [m
[32m+[m											[32m"teamArea[itemId="+ contextId+ "]/teamMembers/(userId|name))";[m
 											[m
[31m-											var taMembers = teamArea.map(function(ta) {[m
[31m-												var nodes = Array.from(ta.getElementsByTagName("teamMembers") || []);[m
[31m-												return nodes.map(function (tm) {[m
[31m-													return {[m
[31m-														id: getFirstTagText(tm, "userId"), [m
[31m-														name: getFirstTagText(tm, "name")[m
[31m-													}[m
[32m+[m										[32mXHR.oslcXmlGetRequest(contributorUrl).then([m
[32m+[m											[32mfunction (data) {[m[41m			[m
[32m+[m												[32mif (self._destroyed || self._beingDestroyed) return contributorPromise.resolve();[m
[32m+[m[41m	[m
[32m+[m												[32mvar projectArea = Array.from(data.getElementsByTagName("projectArea") || []);[m
[32m+[m												[32mvar teamArea = Array.from(data.getElementsByTagName("teamArea") || []);[m
[32m+[m[41m												[m
[32m+[m[41m												[m
[32m+[m												[32mvar paMembers = projectArea.map(function(pa) {[m
[32m+[m													[32mvar nodes = Array.from(pa.getElementsByTagName("teamMembers") || []);[m
[32m+[m													[32mreturn nodes.map(function (tm) {[m
[32m+[m														[32mreturn {[m
[32m+[m															[32mid: self.getFirstTagText(tm, "userId"),[m[41m [m
[32m+[m															[32mname: self.getFirstTagText(tm, "name")[m
[32m+[m														[32m}[m
[32m+[m													[32m});[m
 												});[m
[31m-											});[m
[31m-											[m
[31m-											self.configurationElements.contributor[contextId] = [];[m
[31m-											[m
[31m-											for (var ii = 0; ii < paMembers.length; ii++) {[m
[31m-											    self.configurationElements.contributor[contextId] = self.configurationElements.contributor[contextId].concat(paMembers[ii]);[m
[31m-											}[m
[31m-											for (var jj = 0; jj < taMembers.length; jj++) {[m
[31m-												self.configurationElements.contributor[contextId] = self.configurationElements.contributor[contextId].concat(taMembers[jj]);[m
[32m+[m[41m												[m
[32m+[m												[32mvar taMembers = teamArea.map(function(ta) {[m
[32m+[m													[32mvar nodes = Array.from(ta.getElementsByTagName("teamMembers") || []);[m
[32m+[m													[32mreturn nodes.map(function (tm) {[m
[32m+[m														[32mreturn {[m
[32m+[m															[32mid: self.getFirstTagText(tm, "userId"),[m[41m [m
[32m+[m															[32mname: self.getFirstTagText(tm, "name")[m
[32m+[m														[32m}[m
[32m+[m													[32m});[m
[32m+[m												[32m});[m
[32m+[m[41m												[m
[32m+[m												[32mself.configurationElements.contributor[contextId] = [];[m
[32m+[m[41m												[m
[32m+[m												[32mfor (var ii = 0; ii < paMembers.length; ii++) {[m
[32m+[m												[32m    self.configurationElements.contributor[contextId] = self.configurationElements.contributor[contextId].concat(paMembers[ii]);[m
[32m+[m												[32m}[m
[32m+[m												[32mfor (var jj = 0; jj < taMembers.length; jj++) {[m
[32m+[m													[32mself.configurationElements.contributor[contextId] = self.configurationElements.contributor[contextId].concat(taMembers[jj]);[m
[32m+[m												[32m}[m
[32m+[m												[32mcontributorPromise.resolve();[m
[32m+[m											[32m},[m
[32m+[m											[32mfunction(err) {[m
[32m+[m												[32mconsole.error("Erreur chargement deliverable:", err);[m
[32m+[m												[32mcontributorPromise.resolve();[m
 											}[m
[31m-											contributorPromise.resolve();[m
[31m-										},[m
[31m-										function(err) {[m
[31m-											console.error("Erreur chargement deliverable:", err);[m
[31m-											contributorPromise.resolve();[m
[31m-										}[m
[31m-									);[m
[31m-								} else {[m
[31m-									contributorPromise.resolve();[m
[32m+[m										[32m);[m
[32m+[m									[32m} else {[m
[32m+[m										[32mcontributorPromise.resolve();[m
[32m+[m									[32m}[m
[32m+[m									[32mchildPromises.push(contributorPromise);[m
 								}[m
[31m-								childPromises.push(contributorPromise);[m
[31m-							}[m
[31m-						}					[m
[32m+[m							[32m}[m[41m					[m
 [m
[31m-						child.push(childAttributes);[m
[31m-					}[m
[31m-					[m
[31m-					var rowPromise = all(childPromises).then(function() { [m
[31m-						console.log(child)[m
[31m-						self.childs[index] = child; [m
[31m-					});[m
[31m-					[m
[31m-					allRowsPromises.push(rowPromise);[m
[31m-					})(i);[m
[31m-					[m
[31m-	[m
[31m-					[m
[32m+[m							[32mchild.push(childAttributes);[m
[32m+[m						[32m}[m
 					[m
[31m-					//var id = children[i].getElementsByTagName("id")[0].textContent;[m
[31m-					//var summary = children[i].getElementsByTagName("summary")[0].textContent;[m
[31m-					//var stateName = children[i].getElementsByTagName("state")[0].getElementsByTagName("name")[0].textContent;[m
[31m-					//var ownerName = children[i].getElementsByTagName("owner")[0].getElementsByTagName("name")[0].textContent;[m
[31m-					//var type = children[i].getElementsByTagName("type")[0].getElementsByTagName("name")[0].textContent;[m
[31m-	[m
[32m+[m						[32mvar rowPromise = all(childPromises).then(function() {[m[41m [m
[32m+[m							[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m							[32mself.childs[index] = child;[m[41m [m
[32m+[m						[32m});[m
[32m+[m[41m						[m
[32m+[m						[32mallRowsPromises.push(rowPromise);[m
[32m+[m					[32m})(i);[m[41m	[m
 				}[m
[32m+[m[41m				[m
[32m+[m				[32mall(allRowsPromises).then(function() {[m[41m [m
[32m+[m					[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m					[32mchildDfd.resolve();[m[41m [m
[32m+[m				[32m});[m
 [m
 				// sort states[m
 				self.childs.sort(function (a, b) {[m
[36m@@ -414,12 +415,12 @@[m [mdefine([[m
 				    return ai - bi;[m
 				});[m
 [m
[31m-				all(allRowsPromises).then(function() { [m
[31m-					childDfd.resolve(); [m
[31m-				});[m
[32m+[m
 			});[m
 [m
 			all([childDfd]).then(function () {[m
[32m+[m				[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m				[32mif (!self.childrenBody || !document.body.contains(self.childrenBody)) return;[m
 				self.processChilds(self.childs, self.configurationElements);[m
 			});[m
 		},[m
[36m@@ -435,9 +436,11 @@[m [mdefine([[m
 		processChilds: function(allChilds, configurationElements) {[m
 		    var self = this;[m
 [m
[32m+[m			[32mif (self._destroyed || self._beingDestroyed) return;[m
[32m+[m			[32mif (!self.childrenBody || !document.body.contains(self.childrenBody)) return;[m
[32m+[m
[32m+[m[41m			[m
 			console.log("All childs:", allChilds);[m
[31m-			console.log("childrenTable reference:", self.childTable);[m
[31m-			console.log("childrenTable in DOM?", document.body.contains(self.childTable));[m
 [m
 			// Vider le tbody[m
 			domConstruct.empty(self.childrenHeader);[m
[36m@@ -448,15 +451,23 @@[m [mdefine([[m
 			ch.startup();[m
 			[m
 			for (var i = 0; i < allChilds.length; i++) {[m
[32m+[m				[32mif (self._destroyed || self._beingDestroyed) break;[m
[32m+[m				[32mif (!allChilds[i]) continue;[m
 				var cr = new ChildRow(allChilds[i], configurationElements);[m
[32m+[m[41m				[m
[32m+[m				[32mif (!self.childrenBody || !document.body.contains(self.childrenBody)) break;[m
 				cr.placeAt(self.childrenBody);[m
[31m-			    cr.startup();[m
[32m+[m[41m				[m
[32m+[m				[32mif (cr._destroyed || cr._beingDestroyed) continue;[m
[32m+[m				[32mcr.startup();[m
 			}[m
 		[m
 		},[m
[31m-		[m
[31m-		_onGlobalSave: function(evt) {[m
[31m-		    console.log("👉 Le bouton SAVE global a été cliqué !");[m
[32m+[m
[32m+[m		[32mgetFirstTagText: function(element, tagName) {[m
[32m+[m		[32m    if (!element) return null;[m
[32m+[m		[32m    var n = element.getElementsByTagName(tagName);[m
[32m+[m		[32m    return (n && n[0] && n[0].textContent) || null;[m
 		},[m
 		[m
 		splitByComma: function(str) {[m
[36m@@ -496,17 +507,79 @@[m [mdefine([[m
 		    return rex.join("|");[m
 		},[m
 		[m
[31m-		getCustomAttributDisplayValue: function(workItem, targetDisplayName) {[m
[31m-			var obj = {}[m
[31m-		    var exts = workItem.getElementsByTagName("allExtensions");[m
[32m+[m		[32mgetAllExtensionsDisplayValue: function(workItem, targetDisplayName) {[m
[32m+[m		[32m    if (!workItem) return { value: "", type: "string", key: "" };[m
[32m+[m
[32m+[m		[32m    var exts = workItem.getElementsByTagName("allExtensions") || [];[m
[32m+[m[41m		    [m
 		    for (var i = 0; i < exts.length; i++) {[m
[31m-		        if (exts[i].getElementsByTagName("displayName")[0].textContent === targetDisplayName) {[m
[31m-					obj.value = exts[i].getElementsByTagName("displayValue")[0].textContent;[m
[31m-					obj.type = exts[i].getElementsByTagName("type")[0].textContent;[m
[31m-		            return obj;[m
[32m+[m		[32m        var ext = exts[i];[m
[32m+[m		[32m        if (!ext) continue;[m
[32m+[m
[32m+[m		[32m        var displayName = (ext.getElementsByTagName("displayName")[0] || {}).textContent || null;[m
[32m+[m
[32m+[m		[32m        if (displayName === targetDisplayName) {[m
[32m+[m		[32m            return {[m
[32m+[m		[32m                value: (ext.getElementsByTagName("displayValue")[0] || {}).textContent || "",[m
[32m+[m		[32m                type:  (ext.getElementsByTagName("type")[0]         || {}).textContent || "",[m
[32m+[m		[32m                key:   (ext.getElementsByTagName("key")[0]          || {}).textContent || ""[m
[32m+[m		[32m            };[m
 		        }[m
 		    }[m
[31m-		    return null;[m
[32m+[m
[32m+[m		[32m    return { value: "", type: "string", key: "" };[m
[32m+[m		[32m},[m
[32m+[m[41m		[m
[32m+[m		[32mgetCustomAttributesBykey: function(workItem, key) {[m
[32m+[m
[32m+[m			[32mvar values = [];[m
[32m+[m			[32mvar attributeType = "";[m
[32m+[m			[32mvar customAttrs = Array.from(workItem.getElementsByTagName("customAttributes"));[m
[32m+[m[41m			[m
[32m+[m			[32mif (!customAttrs || customAttrs.length === 0) return { type:"", values:[] }; // ✅ Vérification ajoutée[m
[32m+[m
[32m+[m			[32mvar match = customAttrs.find(function(attr) {[m
[32m+[m				[32mvar identifier = attr.getElementsByTagName("identifier")[0];[m
[32m+[m				[32mreturn identifier && identifier.textContent === key;[m
[32m+[m			[32m});[m
[32m+[m
[32m+[m			[32mif (match) {[m
[32m+[m				[32mvar attrTypeElement = match.getElementsByTagName("attributeType")[0];[m
[32m+[m				[32mif (attrTypeElement) { // ✅ Vérification ajoutée[m
[32m+[m					[32mattributeType = attrTypeElement.textContent;[m
[32m+[m				[32m}[m
[32m+[m			[32m}[m
[32m+[m[41m		[m
[32m+[m			[32mvar projectArea = customAttrs[0].getElementsByTagName("projectArea")[0];[m
[32m+[m			[32mif (!projectArea) return { type:"", values:[] }; // ✅ Vérification ajoutée[m
[32m+[m[41m			 [m
[32m+[m			[32mvar enums = Array.from(projectArea.getElementsByTagName("enumerations"));[m
[32m+[m[41m 						[m
[32m+[m			[32mmatch = enums.find(function(attr) {[m
[32m+[m				[32mvar id = attr.getElementsByTagName("id")[0];[m
[32m+[m				[32mreturn id && id.textContent === attributeType;[m
[32m+[m			[32m});[m
[32m+[m
[32m+[m			[32mif (match) {[m
[32m+[m				[32mattributeType = "enumeration"[m
[32m+[m				[32mvar literals = Array.from(match.getElementsByTagName("literals"));[m
[32m+[m				[32mvalues = literals.map(function(e) {[m
[32m+[m					[32mvar idElem = e.getElementsByTagName("id")[0];[m
[32m+[m					[32mvar nameElem = e.getElementsByTagName("name")[0];[m
[32m+[m					[32mif (!idElem || !nameElem) return null; // ✅ Sécurité[m
[32m+[m					[32mreturn {[m
[32m+[m						[32mid: idElem.textContent,[m
[32m+[m						[32mname: nameElem.textContent[m
[32m+[m					[32m}[m
[32m+[m				[32m}).filter(function(x) { return x; }); // ✅ Retire les null[m
[32m+[m[32m}[m
[32m+[m
[32m+[m
[32m+[m			[32mreturn {[m
[32m+[m				[32mtype: attributeType,[m
[32m+[m				[32mvalues: values[m
[32m+[m			[32m};[m
[32m+[m
 		},[m
 		[m
 		setVisibleAttributes: function() {[m
[36m@@ -514,5 +587,5 @@[m [mdefine([[m
 				return e.visible[m
 			});	[m
 		}[m
[31m-	});[m
[31m-});[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
\ No newline at end of file[m


define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/Tooltip",
	"dojo/Deferred",
	"dojo/on",
	"dojo/promise/all",
	"dojo/query",
	"dojo/dom-construct",
	"dojo/dom-style",
	"./XhrHelpers",
	"./JazzHelpers",
	"./ChildRow",
	"./ChildHeader",
	"dojo/text!./templates/Presentation.html",
	"dojo/domReady!"
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, 
		Deferred, on, all, query, domConstruct, domStyle, XHR, JAZZ, ChildRow, ChildHeader, template) {

	return declare("fr.syncheo.ewm.childitem.presentation.ui.Presentation",
	[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		
		wellKnownAttributes : [
{name: "contextId", 		rest: "contextId", 																		value: "", visible: true,  editable: false, 			type: "string"},
{name: "paContextId", 		rest: "projectArea/contextId", 															value: "", visible: true,  editable: false, 			type: "string"},
{name: "Url", 				rest: "itemId", 																		value: "", visible: true,  editable: false, 			type: "string"},
{name: "Commentaires", 		rest: "comments/content", 																value: "", visible: false, editable: false, 			type: "array"},
{name: "Durée", 			rest: "correctedEstimate", 																value: "", visible: false, editable: "configurable", 	type: "integer"},
{name: "Created By", 		rest: "creator/name", 																	value: "", visible: false, editable: false, 			type: "contributor"},
{name: "Creation Date",		rest: "creationDate", 																	value: "", visible: false, editable: false, 			type: "timestamp"},
{name: "Description", 		rest: "formattedDescription", 															value: "", visible: false, editable: "configurable", 	type: "string"},
{name: "Due Date", 			rest: "dueDate", 																		value: "", visible: false, editable: "configurable", 	type: "timestamp"},
{name: "Estimate", 			rest: "duration", 																		value: "", visible: false, editable: "configurable", 	type: "integer"},
{name: "Filed Against", 	rest: "category/name", 																	value: "", visible: false, editable: "configurable", 	type: "category"},
{name: "Found In", 			rest: "foundIn/name", 																	value: "", visible: false, editable: "configurable", 	type: "deliverable"},
{name: "Id", 				rest: "id", 																			value: "", visible: true,  editable: false, 			type: "integer"},
{name: "Modified By", 		rest: "modifiedBy/name", 																value: "", visible: false, editable: false, 			type: "contributor"},
{name: "Modified Date", 	rest: "modified", 																		value: "", visible: false, editable: false, 			type: "timestamp"},
{name: "Owned By", 			rest: "owner/name", 																	value: "", visible: true,  editable: "configurable", 	type: "contributor"},
{name: "Planned For", 		rest: "target/name", 																	value: "", visible: false, editable: "configurable", 	type: "iteration"},
{name: "Priority", 			rest: "priority/name", 																	value: "", visible: false, editable: "configurable", 	type: "priority"},
{name: "Zone de projet",	rest: "projectArea/name", 																value: "", visible: false, editable: false, 			type: "string"},
{name: "Resolution", 		rest: "resolution", 																	value: "", visible: false, editable: "configurable",	type: "resolution"},
{name: "Resolution Date",	rest: "resolutionDate", 																value: "", visible: false, editable: "configurable", 	type: "timestamp"},
{name: "Resolved By", 		rest: "resolver/name", 																	value: "", visible: false, editable: false, 			type: "constributor"},
{name: "Severity", 			rest: "severity/name", 																	value: "", visible: false, editable: "configurable", 	type: "severity"},
{name: "State", 			rest: "state/name|stateTransitions/(targetStateId|sourceProjectArea/states/(id|name))",	value: "", visible: true,  editable: "configurable", 	type: "state"},
{name: "Start Date", 		rest: "plannedStartDate", 																value: "", visible: false, editable: "configurable",	type: "timestamp"},
{name: "Subscribed By", 	rest: "subscriptions/name", 															value: "", visible: false, editable: false, 			type: "contributor"},
{name: "Summary", 			rest: "summary", 																		value: "", visible: true,  editable: "configurable", 	type: "string"},
{name: "Tags", 				rest: "tags", 																			value: "", visible: false, editable: "configurable", 	type: "pipearray"},
{name: "Time Spent", 		rest: "timeSpent", 																		value: "", visible: false, editable: "configurable", 	type: "duration"},
{name: "Type", 				rest: "type/name", 																		value: "", visible: true,  editable: false, 			type: "string"}
		],
					
		//https://jazz-server:9443/ccm/rpt/repository/workitem?fields=workitem/workItem[id=11]/stateTransitions/(targetStateId|sourceProjectArea/states/*)
		
		visibleAttributes: [],
		templateString: template,
		_classProperties: { instanceID: 0 },
		instanceID: null,
		attributes: [],
		
		itemId: null,
		childs: null,

		workItem: null,
		_editorContext: null,
		childRowWidgets: null, // Initialiser à null ou [],
		changedElements: {},
		        
				
		constructor: function (args) {
			this.instanceID = ++this._classProperties.instanceID;
			this.inherited(arguments, []);
			this.templateString = template;
			this.itemId = args.workItem.itemId;
			this.setConfigurationProperties(args);
			this.workItem = args.workItem;
			this._editorContext = args.parentController;		
		},
		
		postCreate: function() {
            this.inherited(arguments);
            if (this.workItem && this.workItem.id > 0) {
                this.createChildTable(this.workItem.id);
            }
        },
		
		
		setConfigurationProperties: function (args) {
			var properties = args.presentation.properties;

			this.setVisibleAttributes();

			if (typeof properties !== "undefined" && properties.length && properties.length > 0) {
				
				var attributeProperties = properties.filter(function(p) { return p.key === "attributes" })
				
				for (var i = 0; i < attributeProperties.length; i++ ) {
					var attributeProperty = attributeProperties[i];
					var addedAttributes = this.splitByComma(attributeProperty.value);
					for (var j = 0; j < addedAttributes.length; j++) {
						var added = addedAttributes[j];
						var configuredAttribut = this.deepClone(this.getWellKnownAttributeByName(added));
						if (configuredAttribut) {
							configuredAttribut.visible = true;
						} else {
							configuredAttribut = {};
							configuredAttribut.name = added;
							configuredAttribut.visible = true;
							configuredAttribut.editable = "configurable";
							configuredAttribut.rest = "allExtensions/(key|displayName|displayValue|type)|customAttributes/(identifier|attributeType|projectArea/enumerations/*/*)";							
						}
						this.visibleAttributes.push(configuredAttribut)
					}
				}
				
				var editableProperties = properties.filter(function(p) { return p.key === "editable" })
									
				for (var i = 0; i < editableProperties.length; i++ ) {
					var editableProperty = editableProperties[i];
					var editableAttributes = this.splitByComma(editableProperty.value);

					this.visibleAttributes = this.visibleAttributes.map(function(e) {
						if (e.editable === "configurable")
							if (editableAttributes.includes(e.name)) e.editable = true;
							else e.editable = false;
						return e;
					})
				}
			}

			this.visibleAttributes.forEach(function(e) { if (e.editable === "configurable") e.editable = false })
		},
		
		createChildTable: function (workItemId) {
			var self = this;
			
			self.childs = [];
			
			//var childsUrl = JAZZ.getApplicationBaseUrl() 
			//	+ "rpt/repository/workitem?fields=workitem/workItem[id=" + workItemId + "]"
			//	+ "/children/(type/name|id|summary|state/name|owner/name)";
				
			var childsUrl = JAZZ.getApplicationBaseUrl() 
					+ "rpt/repository/workitem?fields=workitem/workItem[id=" + workItemId + "]" +
					"/children/(" + self.joinWithPipe(self.visibleAttributes) +  ")";
											
							
			var childDfd = new Deferred();
			
			

			XHR.oslcXmlGetRequest(childsUrl).then(function (data) {
				var children = data.getElementsByTagName("children");
				
				for (var i = 0; i < children.length; i++) {
					var c = children[i];
					var child = [];
					
					for (var j = 0; j < self.visibleAttributes.length; j += 1) {
						var childAttributes = {};
						var attribut = self.visibleAttributes[j];
						
						for(var k = 0; k < Object.keys(attribut).length; k++) {
							childAttributes[Object.keys(attribut)[k]] = attribut[Object.keys(attribut)[k]];
						}
														
						if (childAttributes.rest.includes("allExtensions")) {
							var tt = self.getAllExtensionsDisplayValue(c, childAttributes.name);
							childAttributes.type = tt ? tt.type : "";
							childAttributes.value = tt ? tt.value : "";
							var key = tt ? tt.key : null;

							if (key && childAttributes.editable) { // ✅ Vérification ESSENTIELLE
								var enumerations = self.getCustomAttributesBykey(c, key);
								childAttributes.type = enumerations ? enumerations.type : childAttributes.type;
								childAttributes.values = enumerations ? enumerations.values : [];
							}
						} else if (childAttributes.rest.includes("state")) {
							var stateName = self.getFirstTagText(c.getElementsByTagName("state")[0], "name");
							if (childAttributes.editable) {
								var stateTransitions = Array.from(
								    c.getElementsByTagName("stateTransitions") || []
								);
								var targetStates = stateTransitions.map(function(st) {
							        if (!st) return null;
									var targetStateId = self.getFirstTagText(st, "targetStateId");
									if (!targetStateId) return null;

									var sourceProjectArea = st.getElementsByTagName("sourceProjectArea")[0];
									if (!sourceProjectArea) return null;

									var states = Array.from(sourceProjectArea.getElementsByTagName("states") || []);
									var matched = states.map(function(state) {
										if (!state) return null;
										var id = self.getFirstTagText(state, "id");
										if (id !== targetStateId) return null;
										return self.getFirstTagText(state, "name");
									}).filter(function(x) { return x; }); // retire null/undefined
									return matched[0] || null;
								
								}).filter(function(x) { return x; }); 


								if (!targetStates.includes(stateName)) targetStates.unshift(stateName);
								childAttributes.value = stateName;
								childAttributes.values = targetStates;
							}
						} else if (childAttributes.rest.includes("/")) {
							childAttributes.value = self.getValueByNameAttribute(c, childAttributes.rest)
						} else {
							var elemt = c.getElementsByTagName(childAttributes.rest)[0].textContent
							if (childAttributes.rest === "itemId") elemt = JAZZ.getApplicationBaseUrl() + "resource/itemOid/com.ibm.team.workitem.WorkItem/" + elemt
							childAttributes.value = elemt

						}
						child.push(childAttributes);
					}
					console.log(child)		
					self.childs[i] = child;
					
					
					//var id = children[i].getElementsByTagName("id")[0].textContent;
					//var summary = children[i].getElementsByTagName("summary")[0].textContent;
					//var stateName = children[i].getElementsByTagName("state")[0].getElementsByTagName("name")[0].textContent;
					//var ownerName = children[i].getElementsByTagName("owner")[0].getElementsByTagName("name")[0].textContent;
					//var type = children[i].getElementsByTagName("type")[0].getElementsByTagName("name")[0].textContent;
	
				}

				// sort states
				self.childs.sort(function (a, b) {
					var childIda = a.filter(function(elmt) {
						return elmt.name === "Id"
					})[0];
					var childIdb = b.filter(function(elmt) {
						return elmt.name === "Id"
					})[0];
				    var ai = Number(childIda.value) || 0;
				    var bi = Number(childIdb.value) || 0;
				    return ai - bi;
				});

				childDfd.resolve();
			});

			all([childDfd]).then(function () {
				self.processChilds(self.childs);
			});
		},


		changedOject: function(object) {
		    var self = this;
		    // 1. Mettre à jour l'objet de suivi des changements
		    // Assurez-vous que self.changedElements est initialisé comme un objet vide dans le constructeur.
		    if (!self.changedElements) {
		        self.changedElements = {};
		    }
		    // Object.assign ajoute/écrase les propriétés de 'object' dans 'self.changedElements'
		    Object.assign(self.changedElements, object);
		    
		    console.log("Données en cours de modification (changedElements):", self.changedElements);
		    
		    // 2. Tenter d'activer l'état 'Dirty' sur l'éditeur principal
		    
		    if (self._editorContext) {
		        
		        // Tentative A (La plus probable pour l'API EWM)
		        if (typeof self._editorContext.setWorkItemModified === 'function') {
		            
		            console.log("✅ SUCCESS : Activation du bouton 'Enregistrer' via setWorkItemModified(true).");
		            self._editorContext.setWorkItemModified(true); 
		            
		            // Sortir si la méthode fonctionne pour éviter les appels inutiles.
		            return;
		            
		        } 
		        
		        // Tentative B (Variante de l'API Work Item)
		        if (typeof self._editorContext.markWorkItemModified === 'function') {
		            
		            console.log("✅ SUCCESS : Activation du bouton 'Enregistrer' via markWorkItemModified(true).");
		            self._editorContext.markWorkItemModified(true);
		            return;
		            
		        }
		        
		        // Tentative C (Dernière chance avec les conventions génériques non EWM)
		        if (typeof self._editorContext.setModified === 'function') {
		            
		            console.log("✅ SUCCESS : Activation du bouton 'Enregistrer' via setModified(true).");
		            self._editorContext.setModified(true);
		            return;
		            
		        }
				
				if (typeof self._editorContext.markDirty === 'function') {
				    
				    console.log("✅ SUCCESS : Activation du bouton 'Enregistrer' via markDirty(true).");
				    self._editorContext.markDirty(true);
				    return;
				    
				}

		        // Si aucune des méthodes n'a fonctionné :
		        console.error("❌ Échec de la notification : Aucune méthode EWM/Dojo connue pour marquer l'éditeur comme modifié n'a été trouvée.");
		        
		    } else {
		        console.error("ERREUR : _editorContext (parentController) n'est pas défini. Impossible de notifier l'éditeur.");
		    }
		},
		
		/**
		 *
		 * going through the jazz integrated proxy. This allows as to make cross
		 * origin request's from client side
		 * @params allStates: {array} array of objects containing the work item state information
		 */

		processChilds: function(allChilds, attributeNames, editable) {
		    var self = this;
			
			if (self.childRowWidgets) {
			    self.childRowWidgets.forEach(function(widget) {
			        
			        // 🎯 CORRECTION : Utiliser destroyRecursive pour garantir le nettoyage complet
			        if (widget && widget.destroyRecursive) { 
			            widget.destroyRecursive(); 
			        } else if (widget && widget.destroy) {
			            // Fallback, mais destroyRecursive est préférable
			            widget.destroy();
			        }
			    });
			}
			self.childRowWidgets = []; // Réinitialiser pour stocker les nouvelles

			self.normalizeFieldValues(allChilds);
			
			console.log("All childs:", allChilds);
			console.log("childrenTable reference:", self.childTable);
			console.log("childrenTable in DOM?", document.body.contains(self.childTable));

			// Vider le tbody
			domConstruct.empty(self.childrenHeader);
			domConstruct.empty(self.childrenBody);
			
			var ch = new ChildHeader(self.visibleAttributes);
			ch.placeAt(self.childrenHeader);
			ch.startup();
			
			for (var i = 0; i < allChilds.length; i++) {								
				var cr = new ChildRow({
					childData: allChilds[i], 
					onChange: self.changedOject.bind(self)
				});
				cr.placeAt(self.childrenBody);
			    cr.startup();
				self.childRowWidgets.push(cr);
						
			}
		
		},
		
		normalizeFieldValues: function(data) {
			
			var names = data[0].map(function(n) { return n.name; })

			names = names.filter(function (f) {
				var d = data[0].filter(function(g) { return g.name === f; })[0];
				return (d.editable);
			});

			for (var i = 0; i < names.length; i++) {
				var name = names[i];
				var valueToUse = null;
				var valuesToUse = [];
				
			    for (var r = 0; r < data.length; r++) {
			        for (var c = 0; c < data[r].length; c++) {
			            var item = data[r][c];
			            if (item.name === name && item.type !== "") {
			                valueToUse = item.type;
			                valuesToUse = item.values;
			                break;
			            }
			        }
			        if (valueToUse !== null) break;
			    }
			    
				if (!valueToUse) valueToUse = "string";
				if (valueToUse.toLowerCase().indexOf("string") !== -1) {
					valueToUse = "string";
				}
			
			    for (var r2 = 0; r2 < data.length; r2++) {
			        for (var c2 = 0; c2 < data[r2].length; c2++) {
			            var item2 = data[r2][c2];
			            if (item2.name === name) {
			                item2.type = valueToUse;
			                item2.values = valuesToUse;
			            }
			        }
			    }
			}
		},
		
		getCustomAttributesBykey: function(workItem, key) {

			var values = [];
			var attributeType = "";
			var customAttrs = Array.from(workItem.getElementsByTagName("customAttributes"));
			
			if (!customAttrs || customAttrs.length === 0) return { type:"", values:[] }; // ✅ Vérification ajoutée

			var match = customAttrs.find(function(attr) {
				var identifier = attr.getElementsByTagName("identifier")[0];
				return identifier && identifier.textContent === key;
			});

			if (match) {
				var attrTypeElement = match.getElementsByTagName("attributeType")[0];
				if (attrTypeElement) { // ✅ Vérification ajoutée
					attributeType = attrTypeElement.textContent;
				}
			}
		
			var projectArea = customAttrs[0].getElementsByTagName("projectArea")[0];
			if (!projectArea) return { type:"", values:[] }; // ✅ Vérification ajoutée
			 
			var enums = Array.from(projectArea.getElementsByTagName("enumerations"));
 						
			match = enums.find(function(attr) {
				var id = attr.getElementsByTagName("id")[0];
				return id && id.textContent === attributeType;
			});

			if (match) {
				attributeType = "enumeration"
				var literals = Array.from(match.getElementsByTagName("literals"));
				values = literals.map(function(e) {
					var idElem = e.getElementsByTagName("id")[0];
					var nameElem = e.getElementsByTagName("name")[0];
					if (!idElem || !nameElem) return null; // ✅ Sécurité
					return {
						id: idElem.textContent,
						name: nameElem.textContent
					}
				}).filter(function(x) { return x; }); // ✅ Retire les null
			}


			return {
				type: attributeType,
				values: values
			};

		},

		getValueByNameAttribute: function(c, rest) {
			if (!rest || typeof rest !== "string") return "";
			
			var parts = rest.split("/");
			
			if (parts.length < 2) return "";

			var tag1 = parts[0];
			var tag2 = parts[1];
			if (!c || typeof c.getElementsByTagName !== "function") return "";
			
			var elems1 = c.getElementsByTagName(tag1);
			if (!elems1 || elems1.length === 0) return "";

			var elems2 = elems1[0].getElementsByTagName(tag2);
			if (!elems2 || elems2.length === 0) return "";
			
			var text = elems2[0].textContent;
			return (typeof text === "string" ? text : "");												
		},
		
		getAllExtensionsDisplayValue: function(workItem, targetDisplayName) {
		    if (!workItem) return { value: "", type: "", key: "" };

		    var exts = workItem.getElementsByTagName("allExtensions") || [];
		    
		    for (var i = 0; i < exts.length; i++) {
		        var ext = exts[i];
		        if (!ext) continue;

		        var displayName = (ext.getElementsByTagName("displayName")[0] || {}).textContent || null;

		        if (displayName === targetDisplayName) {
		            return {
		                value: (ext.getElementsByTagName("displayValue")[0] || {}).textContent || "",
		                type:  (ext.getElementsByTagName("type")[0]         || {}).textContent || "",
		                key:   (ext.getElementsByTagName("key")[0]          || {}).textContent || ""
		            };
		        }
		    }

		    return { value: "", type: "", key: "" };
		},
		
		getFirstTagText: function(element, tagName) {
		    if (!element) return null;
		    var n = element.getElementsByTagName(tagName);
		    return (n && n[0] && n[0].textContent) || null;
		},
		
/*		_onGlobalSave: function(evt) {
		    console.log("👉 Le bouton SAVE global a été cliqué !");
		},*/
		
		splitByComma: function(str) {
		    if (typeof str !== "string") {
		        return [];
		    }
		    return str.split(",").map(function(s) {
		        return s.trim();
		    });
		},

		getWellKnownAttributeByName: function (key) {
			for (var i = 0; i < this.wellKnownAttributes.length; i++) {
				var attr = this.wellKnownAttributes[i]
				if (attr.name === key) return attr;
			} 
			return null;
		},
			
		keyExists: function (key) {
			return this.wellKnownAttributes.hasOwnProperty(key)
		},
		
		getWellKnownAttribute: function (key) {
			return this.wellKnownAttributes[key]
		},
		
		joinWithPipe: function(arr) {
		    if (!Array.isArray(arr)) {
		        throw new Error("L'argument doit être un tableau");
		    }
			var rex = [];
			for (var i = 0; i < arr.length; i++) {
				if (!rex.includes(arr[i].rest)) rex.push(arr[i].rest)
			}
			
		    return rex.join("|");
		},
		
		getCustomAttributDisplayValue: function(workItem, targetDisplayName) {
			var obj = {}
		    var exts = workItem.getElementsByTagName("allExtensions");
		    for (var i = 0; i < exts.length; i++) {
		        if (exts[i].getElementsByTagName("displayName")[0].textContent === targetDisplayName) {
					obj.value = exts[i].getElementsByTagName("displayValue")[0].textContent;
					obj.type = exts[i].getElementsByTagName("type")[0].textContent;
		            return obj;
		        }
		    }
		    return null;
		},
		
		setVisibleAttributes: function() {
			var self = this;
			this.visibleAttributes = this.wellKnownAttributes
				.filter(function(attr) { return attr.visible; })
			    .map(function(attr) { return self.deepClone(attr); });
		},
		
		deepClone: function(obj) {
			var self = this;
		    // Cas simple pour null, non-objets ou Date
		    if (obj === null || typeof obj !== "object") return obj;
		    if (obj instanceof Date) return new Date(obj);

		    // Tableau
		    if (Array.isArray(obj)) {
		        return obj.map(function(item) {
		            return self.deepClone(item);
		        });
		    }

		    // Objet
		    var cloned = {};
		    for (var key in obj) {
		        if (obj.hasOwnProperty(key)) {
		            cloned[key] = self.deepClone(obj[key]);
		        }
		    }
		    return cloned;
		}
		
	});
});
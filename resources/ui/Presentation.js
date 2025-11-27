
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
{name: "Priority", 			rest: "priority/name", 																	value: "", visible: false, editable: "configurable", 	type: "string"},
{name: "Zone de projet",	rest: "projectArea/name", 																value: "", visible: false, editable: false, 			type: "string"},
{name: "Resolution", 		rest: "resolution", 																	value: "", visible: false, editable: "configurable",	type: "resolution"},
{name: "Resolution Date",	rest: "resolutionDate", 																value: "", visible: false, editable: "configurable", 	type: "timestamp"},
{name: "Resolved By", 		rest: "resolver/name", 																	value: "", visible: false, editable: false, 			type: "contributor"},
{name: "Severity", 			rest: "severity/name", 																	value: "", visible: false, editable: "configurable", 	type: "string"},
{name: "State", 			rest: "state/name|stateTransitions/(targetStateId|sourceProjectArea/states/(id|name))",	value: "", visible: true,  editable: "configurable", 	type: "state"},
{name: "Start Date", 		rest: "plannedStartDate", 																value: "", visible: false, editable: "configurable",	type: "timestamp"},
{name: "Subscribed By", 	rest: "subscriptions/name", 															value: "", visible: false, editable: false, 			type: "contributor"},
{name: "Summary", 			rest: "summary", 																		value: "", visible: true,  editable: "configurable", 	type: "string"},
{name: "Tags", 				rest: "tags", 																			value: "", visible: false, editable: "configurable", 	type: "pipearray"},
{name: "Time Spent", 		rest: "timeSpent", 																		value: "", visible: false, editable: "configurable", 	type: "duration"},
{name: "Type", 				rest: "type/name", 																		value: "", visible: true,  editable: false, 			type: "string"}
		],
		
		
		visibleAttributes: [],
		configurationElements: {},
		templateString: template,
		_classProperties: { instanceID: 0 },
		instanceID: null,
		attributes: [],
		
		conf: null,
		itemId: null,
		childs: null,

		workItem: null,

		constructor: function (args) {
			this.instanceID = ++this._classProperties.instanceID;
			this.inherited(arguments, []);
			this.templateString = template;
			this.itemId = args.workItem.itemId;
			this.conf = this.setConfigurationProperties(args);
			this.workItem = args.workItem;
		},
		
		postCreate: function() {
            this.inherited(arguments);
			
            if (this.workItem && this.workItem.id > 0) {
                this.createChildTable(this.workItem.id);
            }
        },
		

		setConfigurationProperties: function (args) {
			var conf = {};
			var properties = args.presentation.properties;

			this.setVisibleAttributes();

			if (typeof properties !== "undefined" && properties.length && properties.length > 0) {
				var attributeProperties = properties.filter(function(p) {
					return p.key === "attributes"
				})
				
				for (var i = 0; i < attributeProperties.length; i++ ) {
					var attributeProperty = attributeProperties[i];
					var addedAttributes = this.splitByComma(attributeProperty.value);
					for (var j = 0; j < addedAttributes.length; j++) {
						var added = addedAttributes[j];
						var configuredAttribut = this.getWellKnownAttributeByName(added);
						if (configuredAttribut) {
							configuredAttribut.visible = true;
						} else {
							configuredAttribut = {};
							configuredAttribut.name = added;
							configuredAttribut.visible = true;
							configuredAttribut.editable = "configurable";
							configuredAttribut.rest = "allExtensions/(displayName|displayValue|type)|customAttributes/(identifier|attributeType|projectArea/enumerations/*/*)";							
						}
						this.visibleAttributes.push(configuredAttribut)
					}

				}
				
				var editableProperties = properties.filter(function(p) {
					return p.key === "editable"
				})
				
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

			return conf;
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
				
				var allRowsPromises = [];
				
				for (var i = 0; i < children.length; i++) {
					(function(index) {
					var c = children[i];
					var child = [];
					var childPromises = []; // tableau pour collecter toutes les promesses de XHR
					
					for (var j = 0; j < self.visibleAttributes.length; j += 1) {
						var childAttributes = {};
						var attribut = self.visibleAttributes[j];
						for(var k = 0; k < Object.keys(attribut).length; k++) {
							childAttributes[Object.keys(attribut)[k]] = attribut[Object.keys(attribut)[k]];
						}					
						
						function getFirstTagText(element, tagName) {
						    if (!element) return null;
						    var n = element.getElementsByTagName(tagName);
						    return (n && n[0] && n[0].textContent) || null;
						}
													
						if (childAttributes.rest && childAttributes.rest.indexOf("allExtensions") !== -1) {
							var tt = self.getCustomAttributDisplayValue(c, childAttributes.name);
							childAttributes.type = tt ? tt.type : "";
							childAttributes.value = tt ? tt.value : "";
						} else if (childAttributes.rest && childAttributes.rest.indexOf("state") !== -1) {
							
	
							var stateName = getFirstTagText(c.getElementsByTagName("state")[0], "name");
							
							var stateTransitions = Array.from(
							    c.getElementsByTagName("stateTransitions") || []
							);
							
							var targetStates = stateTransitions.map(function(st) {
						        if (!st) return null;
								var targetStateId = getFirstTagText(st, "targetStateId");
								if (!targetStateId) return null;

								var sourceProjectArea = st.getElementsByTagName("sourceProjectArea")[0];
								if (!sourceProjectArea) return null;

								var states = Array.from(sourceProjectArea.getElementsByTagName("states") || []);
								var matched = states.map(function(state) {
									if (!state) return null;
									var id = getFirstTagText(state, "id");
									if (id !== targetStateId) return null;
									return getFirstTagText(state, "name");
								}).filter(function(x) { return x; }); // retire null/undefined
								return matched[0] || null;
							
							}).filter(function(x) { return x; }); 
					
	
							if (!targetStates.includes(stateName)) targetStates.unshift(stateName);
							childAttributes.value = stateName;
							childAttributes.values = targetStates;
							
						} else if (childAttributes.rest.includes("/")) {
							var parts = childAttributes.rest.split("/"); 
							var firstNode = c.getElementsByTagName(parts[0])[0]; 
							var secondNode = firstNode ? firstNode.getElementsByTagName(parts[1])[0] : null; 
							childAttributes.value = secondNode ? secondNode.textContent : "";							
						} else {
							var elemtNode = c.getElementsByTagName(childAttributes.rest)[0]; 
							var elemt = elemtNode ? elemtNode.textContent : ""; 
							if (childAttributes.rest === "itemId") 
								elemt = JAZZ.getApplicationBaseUrl() + "resource/itemOid/com.ibm.team.workitem.WorkItem/" + elemt; 
							childAttributes.value = elemt;
						}
						
						if (!self.configurationElements) self.configurationElements= {};
						
						var paContextId = getFirstTagText(c.getElementsByTagName("projectArea")[0], "contextId");
						
						var contextIdNode = c.getElementsByTagName("contextId")[0]; 
						var contextId = contextIdNode ? contextIdNode.textContent : "empty";
						
						
						
						if (childAttributes.type === "deliverable" && childAttributes.editable !== false) {
							
							if (!Array.isArray(self.configurationElements.deliverable) || self.configurationElements.deliverable.length === 0) {
								var deliverablePromise = new Deferred(); 
								self.configurationElements.deliverable = [];
								
								if (paContextId) {
									var deliverableUrl = JAZZ.getApplicationBaseUrl() +
										"rpt/repository/workitem?fields=workitem/deliverable[contextId=" + paContextId + "]/(itemId|name)";
									XHR.oslcXmlGetRequest(deliverableUrl).then(
										function (data) {
											var devNodes = data ? data.getElementsByTagName("deliverable") : [];
											var dev = Array.from(devNodes || []);
	
											self.configurationElements.deliverable = dev.map(function(d) {
												return {
													id: getFirstTagText(d, "itemId"),
													name: getFirstTagText(d, "name")
												}
											});
											deliverablePromise.resolve();
										},
										function(err) {
											console.error("Erreur chargement deliverable:", err);
											deliverablePromise.resolve();
										}
									);
								} else {
									deliverablePromise.resolve();
								}
								childPromises.push(deliverablePromise);
							}
						}
						
						
						if (childAttributes.type === "category" && childAttributes.editable !== false) {
							if (!self.configurationElements) self.configurationElements= {};
							if (!Array.isArray(self.configurationElements.category) || self.configurationElements.category.length === 0) {
								var categoryPromise = new Deferred();
								self.configurationElements.category = [];
								
								var paContextId = getFirstTagText(c.getElementsByTagName("projectArea")[0], "contextId");

								
								if (paContextId) {
									var categoryUrl = JAZZ.getApplicationBaseUrl() +
										"rpt/repository/workitem?fields=workitem/category[contextId=" + paContextId + "]/(id|name)";
									XHR.oslcXmlGetRequest(categoryUrl).then(
										function (data) {
											var catNodes = data ? data.getElementsByTagName("category") : [];
											var cat = Array.from(catNodes || []);
	
											self.configurationElements.category = cat.map(function(d) {
												return {
													id: getFirstTagText(d, "id"), 
													name: (getFirstTagText(d, "name") || "").split("/").pop()
												}
											});
											categoryPromise.resolve();
										},
										function(err) {
											console.error("Erreur chargement deliverable:", err);
											categoryPromise.resolve();
										}
									);
								} else {
									categoryPromise.resolve();
								}
								childPromises.push(categoryPromise);
							}
						}

						
						if (childAttributes.type === "contributor" && childAttributes.editable !== false) {
							
							if (!self.configurationElements.contributor) self.configurationElements.contributor = {};
							
							if (!self.configurationElements.contributor[contextId] || 
							    self.configurationElements.contributor[contextId].length === 0) {
								
								if (contextId) {
										
									var contributorPromise = new Deferred();
									self.configurationElements.contributor[contextId] = [];
										
									var contributorUrl = JAZZ.getApplicationBaseUrl() + 
										"rpt/repository/foundation?fields=foundation/(" + 
										"projectArea[itemId=" + contextId+ "]/teamMembers/(userId|name)|" + 
										"teamArea[itemId="+ contextId+ "]/teamMembers/(userId|name))";
										
									XHR.oslcXmlGetRequest(contributorUrl).then(
										function (data) {			
											var projectArea = Array.from(data.getElementsByTagName("projectArea") || []);
											var teamArea = Array.from(data.getElementsByTagName("teamArea") || []);
											
											
											var paMembers = projectArea.map(function(pa) {
												var nodes = Array.from(pa.getElementsByTagName("teamMembers") || []);
												return nodes.map(function (tm) {
													return {
														id: getFirstTagText(tm, "userId"), 
														name: getFirstTagText(tm, "name")
													}
												});
											});
											
											var taMembers = teamArea.map(function(ta) {
												var nodes = Array.from(ta.getElementsByTagName("teamMembers") || []);
												return nodes.map(function (tm) {
													return {
														id: getFirstTagText(tm, "userId"), 
														name: getFirstTagText(tm, "name")
													}
												});
											});
											
											self.configurationElements.contributor[contextId] = [];
											
											for (var ii = 0; ii < paMembers.length; ii++) {
											    self.configurationElements.contributor[contextId] = self.configurationElements.contributor[contextId].concat(paMembers[ii]);
											}
											for (var jj = 0; jj < taMembers.length; jj++) {
												self.configurationElements.contributor[contextId] = self.configurationElements.contributor[contextId].concat(taMembers[jj]);
											}
											contributorPromise.resolve();
										},
										function(err) {
											console.error("Erreur chargement deliverable:", err);
											contributorPromise.resolve();
										}
									);
								} else {
									contributorPromise.resolve();
								}
								childPromises.push(contributorPromise);
							}
						}					

						child.push(childAttributes);
					}
					
					var rowPromise = all(childPromises).then(function() { 
						console.log(child)
						self.childs[index] = child; 
					});
					
					allRowsPromises.push(rowPromise);
					})(i);
					
	
					
					
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

				all(allRowsPromises).then(function() { 
					childDfd.resolve(); 
				});
			});

			all([childDfd]).then(function () {
				self.processChilds(self.childs, self.configurationElements);
			});
		},


		/**
		 *
		 * going through the jazz integrated proxy. This allows as to make cross
		 * origin request's from client side
		 * @params allStates: {array} array of objects containing the work item state information
		 */

		processChilds: function(allChilds, configurationElements) {
		    var self = this;

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
				var cr = new ChildRow(allChilds[i], configurationElements);
				cr.placeAt(self.childrenBody);
			    cr.startup();
			}
		
		},
		
		_onGlobalSave: function(evt) {
		    console.log("👉 Le bouton SAVE global a été cliqué !");
		},
		
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
			this.visibleAttributes = this.wellKnownAttributes.filter(function(e) {
				return e.visible
			});	
		}
	});
});

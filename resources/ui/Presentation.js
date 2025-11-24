
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
			{name: "Url", 				rest: "itemId", 				value: "", visible: true, editable: false, type: "string"},
			{name: "Commentaires", 		rest: "comments/content", 		value: "", visible: false, editable: false, type: "array"},
			{name: "Durée", 			rest: "correctedEstimate", 		value: "", visible: false, editable: "configurable", 	type: "integer"},
			{name: "Created By", 		rest: "creator/name", 			value: "", visible: false, editable: false, type: "string"},
			{name: "Creation Date",		rest: "creationDate", 			value: "", visible: false, editable: false, type: "timestamp"},
			{name: "Description", 		rest: "formattedDescription", 	value: "", visible: false, editable: "configurable", 	type: "string"},
			{name: "Due Date", 			rest: "dueDate", 				value: "", visible: false, editable: "configurable", 	type: "timestamp"},
			{name: "Estimate", 			rest: "duration", 				value: "", visible: false, editable: "configurable", 	type: "integer"},
			{name: "Filed Against", 	rest: "category/name", 			value: "", visible: false, editable: "configurable", 	type: "string"},
			{name: "Found In", 			rest: "foundIn/name", 			value: "", visible: false, editable: "configurable", 	type: "string"},
			{name: "Id", 				rest: "id", 					value: "", visible: true,  editable: false, type: "integer"},
			{name: "Modified By", 		rest: "modifiedBy/name", 		value: "", visible: false, editable: false, type: "array"},
			{name: "Modified Date", 	rest: "modified", 				value: "", visible: false, editable: false, type: "timestamp"},
			{name: "Owned By", 			rest: "owner/name", 			value: "", visible: true,  editable: "configurable", 	type: "string"},
			{name: "Planned For", 		rest: "target/name", 			value: "", visible: false, editable: "configurable", 	type: "string"},
			{name: "Priority", 			rest: "priority/name", 			value: "", visible: false, editable: "configurable", 	type: "string"},
			{name: "Zone de projet",	rest: "projectArea/name", 		value: "", visible: false, editable: false, type: "string"},
			{name: "Resolution", 		rest: "resolution", 			value: "", visible: false, editable: "configurable",	type: "string"},
			{name: "Resolution Date",	rest: "resolutionDate", 		value: "", visible: false, editable: "configurable", 	type: "timestamp"},
			{name: "Resolved By", 		rest: "resolver/name", 			value: "", visible: false, editable: false, type: "string"},
			{name: "Severity", 			rest: "severity/name", 			value: "", visible: false, editable: "configurable", 	type: "string"},
			{name: "State", 			rest: "state/name", 			value: "", visible: true,  editable: "configurable", 	type: "string"},
			{name: "Start Date", 		rest: "plannedStartDate", 		value: "", visible: false, editable: "configurable",	type: "timestamp"},
			{name: "Subscribed By", 	rest: "subscriptions/name", 	value: "", visible: false, editable: false, type: "string"},
			{name: "Summary", 			rest: "summary", 				value: "", visible: true,  editable: "configurable", 	type: "string"},
			{name: "Tags", 				rest: "tags", 					value: "", visible: false, editable: "configurable", 	type: "pipearray"},
			{name: "Time Spent", 		rest: "timeSpent", 				value: "", visible: false, editable: "configurable", 	type: "duration"},
			{name: "Type", 				rest: "type/name", 				value: "", visible: true,  editable: false, type: "string"}
		],
		
		visibleAttributes: [],
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
				
				if (attributeProperties !== null) {
					var attributeProperty = attributeProperties[0];
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
							configuredAttribut.rest = "allExtensions/(displayName|displayValue|type)";
						}
						this.visibleAttributes.push(configuredAttribut)
					}

				}
				
				var editableProperties = properties.filter(function(p) {
					return p.key === "editable"
				})
				
				if (editableProperties !== null) {
					var editableProperty = editableProperties[0];
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
							var tt = self.getCustomAttributDisplayValue(c, childAttributes.name);
							childAttributes.type = tt ? tt.type : "";
							childAttributes.value = tt ? tt.value : "";
						} else if (childAttributes.rest.includes("/")) {
							childAttributes.value = c.getElementsByTagName(childAttributes.rest.split("/")[0])[0].getElementsByTagName(childAttributes.rest.split("/")[1])[0].textContent	
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


		/**
		 *
		 * going through the jazz integrated proxy. This allows as to make cross
		 * origin request's from client side
		 * @params allStates: {array} array of objects containing the work item state information
		 */

		processChilds: function(allChilds, attributeNames, editable) {
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
				var cr = new ChildRow(allChilds[i]);
				cr.placeAt(self.childrenBody);
			    cr.startup();
			}
		
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

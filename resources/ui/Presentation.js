
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
	[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
	{
		
		wellKnownAttributes : {
		    "Commentaires": "comments/content",
		    "Durée": "correctedEstimate",
		    "Created By": "creator/name",
		    "Creation Date": "creationDate",
		    "Description": "formattedDescription",
		    "Due Date": "dueDate",
		    "Estimate": "duration",
		    "Filed Against": "category/name",
		    "Found In": "foundIn/name",
		    "Id": "id",
		    "Modified By": "modifiedBy/name",
		    "Modified Date": "modified",
		    "Owned By": "owner/name",
		    "Planned For": "target/name",
		    "Priority": "priority/name",
		    "Zone de projet": "projectArea/name",
		    "Resolution": "resolution",
		    "Resolution Date": "resolutionDate",
		    "Resolved By": "resolver/name",
		    "Severity": "severity/name",
		    "State": "state/name",
		    "Start Date": "plannedStartDate",
		    "Subscribed By": "subscriptions/name",
		    "Summary": "summary",
		    "Tags": "tags", // à splitter par "|" si besoin
		    "Time Spent": "timeSpent",
		    "Type": "type/name"
		},
		
		templateString: template,
		_classProperties: { instanceID: 0 },
		instanceID: null,
		attributes: [],
		restAttributes: ["type/name", "id" ,"summary", "state/name", "owner/name"],
		attributeName: ["Type", "Id" ,"Summary", "State", "Owned By"],
		
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
			if (typeof properties !== "undefined" && properties.length && properties.length > 0) {
				for (var i = 0; i < properties.length; i++) {
					var property = properties[i];
					if (property.key == "attributes") {
						this.attributes = this.splitByComma(property.value);


						for (var i = 0; i < this.attributes.length; i += 1) {
						 	var attribut = this.attributes[i];
							if (!this.attributeName.includes(attribut)) {
								this.attributeName.push(attribut);
							}
						}

						
						for (var i = 0; i < this.attributes.length; i += 1) {
							var attribut = this.attributes[i];
							if (this.keyExists(attribut)) {
								if (!this.restAttributes.includes(this.getWellKnownAttribute(attribut))) {
									this.restAttributes.push(this.getWellKnownAttribute(attribut));
								}								
							} else {
								if (!this.restAttributes.includes("allExtensions/(displayName|displayValue|type)")) {
									this.restAttributes.push("allExtensions/(displayName|displayValue|type)");
								}
							}
						}
					}
					conf[property.key] = property.value;
				}
			}
			return conf;
		},


		createChildTable: function (workItemId) {
			var self = this;
			
			//var childsUrl = JAZZ.getApplicationBaseUrl() 
			//	+ "rpt/repository/workitem?fields=workitem/workItem[id=" + workItemId + "]"
			//	+ "/children/(type/name|id|summary|state/name|owner/name)";
				
			var childsUrl = JAZZ.getApplicationBaseUrl() 
					+ "rpt/repository/workitem?fields=workitem/workItem[id=" + workItemId + "]" +
					"/children/(itemId|"+ self.joinWithPipe(this.restAttributes) +  ")";
											
							
			var childDfd = new Deferred();
			self.childs = [];
			

			XHR.oslcXmlGetRequest(childsUrl).then(function (data) {
				var children = data.getElementsByTagName("children");
				
				for (var i = 0; i < children.length; i++) {
					var object = {};
					var child = children[i];
					object.itemId = child.getElementsByTagName("itemId")[0].textContent
					
						
					for (var j = 0; j < self.attributeName.length; j += 1) {
						var attribut = self.attributeName[j];
						var rest = "";
						
						if (self.keyExists(attribut)) rest = self.getWellKnownAttribute(attribut);
						else rest = "allExtensions/(displayName|displayValue|type)";
						
						if (rest.includes("allExtensions")) {
							object[attribut] = self.getCustomAttributDisplayValue(child, attribut);
						} else if (rest.includes("/")) {
							object[attribut] = child.getElementsByTagName(rest.split("/")[0])[0].getElementsByTagName(rest.split("/")[1])[0].textContent	
						} else {
							object[attribut] = child.getElementsByTagName(rest)[0].textContent	

						}
					}
					
					object["url"] = JAZZ.getApplicationBaseUrl() + "resource/itemOid/com.ibm.team.workitem.WorkItem/" + object.itemId;
					console.log(object);
					
					//var id = children[i].getElementsByTagName("id")[0].textContent;
					//var summary = children[i].getElementsByTagName("summary")[0].textContent;
					//var stateName = children[i].getElementsByTagName("state")[0].getElementsByTagName("name")[0].textContent;
					//var ownerName = children[i].getElementsByTagName("owner")[0].getElementsByTagName("name")[0].textContent;
					//var type = children[i].getElementsByTagName("type")[0].getElementsByTagName("name")[0].textContent;

					console.log(object.Id + " -> " + object.Summary + " -> " + object.State + " -> " + object.url)
					self.childs[i] = object;	
					/*elf.childs[i] = {
						id: id,
						summary: summary,
						name: stateName,
						owner: ownerName,
						url: url, 
						type: type
					};*/
				}

				// sort states
				self.childs.sort(function (a, b) {
				    var ai = Number(a.Id) || 0;
				    var bi = Number(b.Id) || 0;
				    return ai - bi;
				});

				childDfd.resolve();
			});

			all([childDfd]).then(function () {
				domConstruct.empty(self.childrenTable);
				self.processHeader();
				self.processChilds(self.childs, self.attributeName);
			});
		},


		/**
		 *
		 * going through the jazz integrated proxy. This allows as to make cross
		 * origin request's from client side
		 * @params allStates: {array} array of objects containing the work item state information
		 */
		
		processHeader: function() {
		    var self = this;
			var ch = new ChildHeader(self.attributeName);
			ch.placeAt(self.childrenHeader);
			ch.startup();

		},
		
		processChilds: function(allChilds, attributeNames) {
		    var self = this;

			console.log("All childs:", allChilds);
			console.log("childrenTable children before loop:", self.childrenTable.childNodes.length);
			console.log("childrenTable reference:", self.childrenTable);
			console.log("childrenTable in DOM?", document.body.contains(self.childrenTable));

		    // Ajouter les nouvelles lignes
		    for (var i = 0; i < allChilds.length; i++) {
				var cr = new ChildRow(allChilds[i], attributeNames);
				cr.placeAt(self.childrenTable);
		        cr.startup();
		    }
			console.log(document.querySelector('tbody[data-dojo-attach-point="childrenTable"]').innerHTML);
			console.log(dijit.registry.findWidgets(document.querySelector('tbody[data-dojo-attach-point="childrenTable"]')));

		},
		
		splitByComma: function(str) {
		    if (typeof str !== "string") {
		        return [];
		    }
		    return str.split(",").map(function(s) {
		        return s.trim();
		    });
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
		    return arr.join("|");
		},
		
		 getCustomAttributDisplayValue: function(workItem, targetDisplayName) {
		    var exts = workItem.getElementsByTagName("allExtensions");
		    for (var i = 0; i < exts.length; i++) {
		        if (exts[i].getElementsByTagName("displayName")[0].textContent === targetDisplayName) {
		            return exts[i].getElementsByTagName("displayValue")[0].textContent;
		        }
		    }
		    return '';
		}

	});
});

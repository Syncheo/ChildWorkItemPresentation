
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
	"dojo/text!./templates/Presentation.html",
	"dojo/domReady!"
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, Deferred, on, all, query, domConstruct, domStyle, XHR, JAZZ, ChildRow, template) {

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
		    "Status": "state/name",
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
		attributeName: ["ID" ,"Summary", "State", "Owned By"],
		
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
						if (this.keyExists(property.key)) {
							this.restAttributes.push(this.wellKnownAttributes[property.key]);
						} else {
							this.restAttributes.push("allExtensions/(displayName|displayValue|type)");
						}
					}

					conf[property.key] = property.value;
				}
			}
			return conf;
		},


		createChildTable: function (workItemId) {
			var self = this;


			
			var childsUrl = JAZZ.getApplicationBaseUrl() 
				+ "rpt/repository/workitem?fields=workitem/workItem[id=" + workItemId + "]"
				 + "/children/(type/name|id|summary|state/name|owner/name)";
				
			//var childsUrl = JAZZ.getApplicationBaseUrl() 
			//		+ "rpt/repository/workitem?fields=workitem/workItem[id=" + workItemId + "]" +
			//		"/children/("+ this.joinWithPipe(this.restAttributes) +  ")";
											
							
			var childDfd = new Deferred();
			self.childs = [];
			

			XHR.oslcXmlGetRequest(childsUrl).then(function (data) {
				var children = data.getElementsByTagName("children");

				for (var i = 0; i < children.length; i++) {
					var id = children[i].getElementsByTagName("id")[0].textContent;
					var summary = children[i].getElementsByTagName("summary")[0].textContent;
					var stateName = children[i].getElementsByTagName("state")[0].getElementsByTagName("name")[0].textContent;
					var ownerName = children[i].getElementsByTagName("owner")[0].getElementsByTagName("name")[0].textContent;
					var type = children[i].getElementsByTagName("type")[0].getElementsByTagName("name")[0].textContent;

					var url = JAZZ.getApplicationBaseUrl() + 
						"resource/itemName/com.ibm.team.workitem.WorkItem/" + id;
					console.log(id + " -> " + summary + " -> " + stateName + " -> " + url)		
					self.childs[i] = {
						id: id,
						summary: summary,
						name: stateName,
						owner: ownerName,
						url: url, 
						type: type
					};
				}

				// sort states
				self.childs.sort(function (a, b) {
				    var ai = Number(a.id) || 0;
				    var bi = Number(b.id) || 0;
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
		
		processChilds: function(allChilds) {
		    var self = this;

			console.log("All childs:", allChilds);
			console.log("childrenTable children before loop:", self.childrenTable.childNodes.length);
			console.log("childrenTable reference:", self.childrenTable);
			console.log("childrenTable in DOM?", document.body.contains(self.childrenTable));

		    // Vider le tbody
		    domConstruct.empty(self.childrenTable);

		    // Ajouter les nouvelles lignes
		    for (var i = 0; i < allChilds.length; i++) {
				var cr = new ChildRow(allChilds[i]);
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
		
		joinWithPipe: function(arr) {
		    if (!Array.isArray(arr)) {
		        throw new Error("L'argument doit être un tableau");
		    }
		    return arr.join("|");
		}

	});
});

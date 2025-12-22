/**
 * Presentation.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */


define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/Deferred",
	"dojo/on",
	"dojo/dom",
	"dojo/promise/all",
	"dojo/date/locale",
	"dojo/dom-construct",
	"dojo/data/ItemFileWriteStore",
	"dojox/grid/DataGrid",
	"dojox/grid/cells", // On charge l'espace de nom des cellules	"./XhrHelpers",
	"./helpers/XmlParserHelper",
	"./helpers/XhrHelpers",
	"./helpers/JazzHelpers",
	"./CellWidgetFactory",
	"./WorkItemBatchUpdater",
	"dojo/text!./templates/Presentation.html",
	"dojo/domReady!"
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, 
		Deferred, on, dom, all, locale, domConstruct, ItemFileWriteStore, DataGrid,
		gridCells, XML, XHR, JAZZ, CellWidgetFactory, WorkItemBatchUpdater, template) {
			
			
		var FactoryGridCell = declare("fr.syncheo.ewm.grid.FactoryCell", [gridCells.Cell], {
			// Ces propriétés seront passées via la structure de la grille
			factory: null,
			globalCallback: null,
			
			// Surcharge de la méthode formatNode (appelée quand la grille dessine la cellule)
			formatNode: function(inNode, inDatum, inRowIndex) {
				if (!inDatum) return;

					// 1. Nettoyage si la cellule est redessinée
					// (Note: pour une gestion mémoire parfaite, on devrait stocker le widget et le détruire)
					domConstruct.empty(inNode);

					// 2. Extraction des données préparées (voir étape Data Transformation)
					// inDatum contient ici l'objet complet { element: ..., context: ... }
					var element = inDatum.element;
					var contextIds = inDatum.context;

					// 3. Appel de VOTRE Factory existante
					var cellWidget = this.factory.createCell(
						element, 
						contextIds, 
						this.globalCallback // Le callback bindé (changedOject)
					);
					
					
					// 4. Rendu dans le noeud de la grille
					if (cellWidget) {
						cellWidget.render(inNode);
						if (cellWidget.startup) {
							cellWidget.startup();
						}
						
						// IMPORTANT: Stocker le widget sur le noeud pour pouvoir le détruire plus tard si besoin*
						inNode.widget = cellWidget; 
					}
				}
			});
			
	return declare("fr.syncheo.ewm.childitem.presentation.ui.Presentation",
	[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
				wellKnownAttributes : [
		{name: "contextId", 		rest: "contextId", 												visible: true,  editable: false, 		type: "string"},
		{name: "paContextId", 		rest: "projectArea/contextId", 									visible: true,  editable: false, 		type: "string"},
		{name: "Url", 				rest: "itemId", 												visible: true,  editable: false, 		type: "string"},
		{name: "Commentaires", 		rest: "comments/(creationDate|creator/name|formattedContent)", 	visible: false, editable: false, 		type: "string"},
		{name: "Durée", 			rest: "correctedEstimate", 										visible: false, editable: "configurable",type: "duration", oslckey: "rtc_cm:correctedEstimate"},
		{name: "Created By", 		rest: "creator/name", 											visible: false, editable: false, 		type: "string"},
		{name: "Creation Date",		rest: "creationDate", 											visible: false, editable: false, 		type: "timestamp"},
		{name: "Description", 		rest: "formattedDescription", 									visible: false, editable: false,		type: "string"},
		{name: "Due Date", 			rest: "dueDate", 												visible: false, editable: "configurable",type: "timestamp", oslckey: "rtc_cm:due"},
		{name: "Estimate", 			rest: "duration", 												visible: false, editable: "configurable",type: "duration", oslckey: "rtc_cm:estimate"},
		{name: "Found In", 			rest: "foundIn/name", 											visible: false, editable: "configurable",type: "deliverable", oslckey: "rtc_cm:foundIn"},
		{name: "Id", 				rest: "id", 													visible: true,  editable: false, 		type: "integer"},
		{name: "Modified By", 		rest: "modifiedBy/name",				 						visible: false, editable: false, 		type: "string"},
		{name: "Modified Date", 	rest: "modified", 												visible: false, editable: false, 		type: "timestamp"},
		{name: "Filed Against", 	rest: "category/reportableUrl",									visible: false, editable: "configurable",type: "category", oslckey: "rtc_cm:filedAgainst"},
		{name: "Owned By", 			rest: "owner/reportableUrl",									visible: false, editable: "configurable",type: "contributor", oslckey: "dcterms:contributor"},
		{name: "Planned For", 		rest: "target/reportableUrl", 									visible: false, editable: "configurable",type: "iteration", oslckey: "rtc_cm:plannedFor"},
		{name: "Priority", 			rest: "priority/name", 											visible: false, editable: "configurable",type: "priority", oslckey: "oslc_cmx:priority"},
		{name: "Zone de projet",	rest: "projectArea/name", 										visible: false, editable: false, 		type: "string"},
		{name: "Resolution", 		rest: "resolution/name", 										visible: false, editable: "configurable",type: "resolution", oslckey: "rtc_cm:resolution"},
		{name: "Resolution Date",	rest: "resolutionDate", 										visible: false, editable: false, 		type: "timestamp"},
		{name: "Resolved By", 		rest: "resolver/name", 											visible: false, editable: false, 		type: "string"},
		{name: "Severity", 			rest: "severity/name", 											visible: false, editable: "configurable",type: "severity", oslckey: "oslc_cmx:severity"},
		{name: "State", 			rest: "state/name",												visible: false, editable: "configurable",type: "state", oslckey: "rtc_cm:state"},
		{name: "Start Date", 		rest: "plannedStartDate", 										visible: false, editable: false,			type: "timestamp"},
		{name: "Subscribed By", 	rest: "subscriptions/name", 									visible: false, editable: false, 		type: "string"},
		{name: "Summary", 			rest: "summary", 												visible: true,  editable: "configurable",type: "string", oslckey: "dcterms:title"},
		{name: "Tags", 				rest: "tags", 													visible: false, editable: "configurable",type: "pipearray", oslckey: "dcterms:subject"},
		{name: "Time Spent", 		rest: "timeSpent", 												visible: false, editable: "configurable",type: "duration", oslckey: "rtc_cm:timeSpent"},
		{name: "Type", 				rest: "type/name", 												visible: true,  editable: false, 		type: "string"}
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
			var self = this;
			
            this.inherited(arguments);
            if (this.workItem && this.workItem.id > 0) {
                this.createChildTable(this.workItem.id);
            }
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
							//https://jazz-server:9443/ccm/rpt/repository/workitem?fields=workitem/workItem[id=9]/projectArea/extensionMetadata/*
							configuredAttribut.rest = "projectArea/extensionMetadata/*" + "|" + 
														"allExtensions/(displayName|displayValue|key|type|itemValue/*)" + "|" + 
														"customAttributes/(identifier|attributeType|projectArea/enumerations/(id|literals/(id|name)))";							
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
						
						if (childAttributes.name === "contextId") 			childAttributes.value = XML.getWorkitemContextId(c);
						else if (childAttributes.name === "paContextId") 	childAttributes.value = XML.getProjectAreaContextId(c);
						else if (childAttributes.name === "Url") 			childAttributes.value = XML.getWorkitemUrl(c);
						else if (childAttributes.name === "Type") 			childAttributes.value = XML.getWorkitemType(c);
						else if (childAttributes.name === "Summary")		childAttributes.value = XML.getWorkitemSummary(c);	
						else if (childAttributes.name === "Commentaires") 	childAttributes.value = XML.formatLatestCommentToHtml(c);
						else if (childAttributes.name === "Planned For") 	childAttributes.value = XML.getIterationUrl(c);
						else if (childAttributes.name === "Filed Against") 	childAttributes.value = XML.getCategoryUrl(c);
						else if (childAttributes.name === "Owned By")		childAttributes.value = XML.getOwnerUrl(c);
							
						else if (childAttributes.rest.includes("allExtensions")) {
							
							var paContextItem = child.find(function(item) {
							    return item.name === "paContextId";
							});

							// On récupère la valeur si l'objet a été trouvé
							var paContextId = paContextItem ? paContextItem.value : null;
							if (!paContextId) {
								paContextId = XML.getProjectAreaContextId(c);
							}
							
							//configuredAttribut.rest = "allExtensions/(displayName|displayValue|key|type|itemValue/*)|customAttributes/(identifier|attributeType|projectArea/enumerations/(id|literals/(id|name)))";							
							var extensionMetadata = XML.getExtensionMetadata(c, childAttributes.name);
							childAttributes.oslckey = "rtc_ext:" + extensionMetadata.key;
							childAttributes.isEnumeration = extensionMetadata.isEnumeration;
							
							var extension = XML.getAllExtensionsDisplayValue(c, childAttributes.name);
							var customAttribute = self.getCustomAttributeData(c, paContextId, extension); //var defaultValue = { value: "", type: "", key: "" };
							childAttributes.value = extension.value;									
							childAttributes.type = customAttribute.type;
							childAttributes.values = customAttribute.enumerations
	
						} else if (childAttributes.rest.includes("subscriptions")) {
							childAttributes.value = XML.getArrayOfAttributes(c, "subscriptions", "name");
						} else if (childAttributes.rest.includes("/")) {
							childAttributes.value = XML.getValueByNameAttribute(c, childAttributes.rest)
						} else {
							var elemt = c.getElementsByTagName(childAttributes.rest)[0].textContent
							childAttributes.value = elemt;
							if (childAttributes.type === "pipearray") childAttributes.value =  self.formatPipeString(elemt);
							else if (childAttributes.type === "duration") childAttributes.value = self.convertMillisecondsToWorkDays(parseInt(elemt));
							//else if (childAttributes.type === "timestamp") childAttributes.value = self.formatIsoDateForCustomStyle(elemt);					
						}
						child.push(childAttributes);
					}		
					self.childs[i] = child;
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


		changedObject: function(object) {
		    var self = this;
			
			var element = object.element;
			/*
			element: {…}​
			newValue: true​
			url: "https://jazz-server:9443/ccm/resource/itemOid/com.ibm.team.workitem.WorkItem/_l1UN4b_NEfCIXMPyoWwROA"
			*/
			
			
		    // 1. Mettre à jour l'objet de suivi des changements
		    // Assurez-vous que self.changedElements est initialisé comme un objet vide dans le constructeur.
		    if (!self.changedElements) self.changedElements = {};
			if (!self.changedElements[object.url]) self.changedElements[object.url] = {};
			if (!self.changedElements[object.url][element.oslckey]) self.changedElements[object.url][element.oslckey] = {};

			
			
		    // Object.assign ajoute/écrase les propriétés de 'object' dans 'self.changedElements'
		    Object.assign(self.changedElements[object.url][element.oslckey], object);

		    console.log("Données en cours de modification (changedElements):", self.changedElements);
		    
		    if (self._editorContext) {
				if (typeof self._editorContext.markDirty === 'function') {
					self._editorContext.markDirty(true);
				    return;
				    
				}		        
		    } else {
		        console.error("ERREUR : _editorContext (parentController) n'est pas défini. Impossible de notifier l'éditeur.");
		    }
		},
		
		_onGlobalSave: function(evt) {
			var self = this;
			console.log(self.changedElements);
			WorkItemBatchUpdater.processBatchUpdates(self.changedElements)
			    .then(function(results) {
			        console.log("Toutes les mises à jour de Work Items sont terminées.", results);
			    })
			    .otherwise(function(error) {
			        console.error("Au moins une mise à jour a échoué. Arrêt du processus global.");
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

			// 1. Nettoyage de l'existant
			if (self.grid) {
			    try { self.grid.destroyRecursive(); } catch(e) {}
			    self.grid = null;
			}
			domConstruct.empty(self.childrenBody);
			
			if (!self.cellFactory) {
			    self.cellFactory = new CellWidgetFactory();
			}
			
			// 2. Initialisation du Cache (pour stocker les objets que le Store rejette)
			self._gridDataCache = {};
			
			// Fonction utilitaire pour trouver un attribut dans le tableau brut
			var getAttrSafe = function(rowArray, attrName) {
			    if (!rowArray) return { "name": attrName, "value": "" };
			    for (var i = 0; i < rowArray.length; i++) {
			        if (rowArray[i] && rowArray[i].name === attrName) return rowArray[i];
			    }
			    return { "name": attrName, "value": "" };
			};
			
			// 3. Le Formatter : C'est le pont entre le Store et le Cache
		    var widgetFormatter = function(rowValue, inRowIndex, cell) {
				var item = cell.grid.getItem(inRowIndex);
				if (!item) return rowValue || "";
				
				var rowKey = cell.grid.store.getValue(item, "uniqueId");
				
				var rowCache = self._gridDataCache[rowKey];
				var complexData = rowCache ? rowCache[cell.field] : null;
					
				// Si on ne trouve pas de données complexes, on affiche la valeur brute
				if (!complexData || !complexData.element) {
					return rowValue || ""; 
				}

				var safeFieldName = cell.field.replace(/[^a-z0-9]/gi, '_');
				var containerId = "w" + self.instanceID + "_cw_" + inRowIndex + "_" + safeFieldName;
						        
				setTimeout(function() {
		            var node = dom.byId(containerId);
					if (node && complexData) {
						try {
							var widget = self.cellFactory.createCell(
		                    	complexData.element, 
		                    	complexData.context, 
		                    	self.changedObject.bind(self)
		               	 	);
			                if (widget) {
			                    domConstruct.empty(node);
			                    widget.render(node);
			                    if (widget.startup) widget.startup();
			                }
						} catch (e) {
							console.error("Erreur Factory sur " + cell.field, e);
							node.innerHTML = rowValue || "Erreur";
						}
		            }
		        }, 20);

		        return '<div id="' + containerId + '" style="min-height:20px;"></div>';
		    };
				
				

			// 4. Préparation des données (Store + Cache)
		    var gridItems = [];
		    for (var i = 0; i < allChilds.length; i++) {
		        var row = allChilds[i];
		        if (!row) continue;

		        var idAttr = getAttrSafe(row, "Id");
		        var urlAttr = getAttrSafe(row, "Url");
		        var typeAttr = getAttrSafe(row, "Type");
				var fullIdLabel = (typeAttr.value ? typeAttr.value + " " : "") + (idAttr.value || "");
				
				var rowKey = "inst" + self.instanceID + "_row_" + i + "_" + (idAttr.value || i);
				
		        // Objet "léger" pour le Store (Uniquement des chaînes de caractères)
		        var storeItem = { "uniqueId": rowKey };
		        self._gridDataCache[rowKey] = {};

		        // Contexte partagé pour toute la ligne
		        var rowContext = {
		            "id": idAttr.value,
					"url": urlAttr.value,
					"type": typeAttr.value,
		            "paContextId": getAttrSafe(row, "paContextId").value,
		            "contextId": getAttrSafe(row, "contextId").value
		        };
				
				storeItem["Id"] = fullIdLabel;
				self._gridDataCache[rowKey]["Id"] = {
				    "element": { 
				        "type": "link",
						"name": "Id",
				        "value": fullIdLabel, 
				        "url": urlAttr.value || "" 
				    },
				    "context": rowContext
				};

		        // Données pour les colonnes dynamiques
		        for (var j = 0; j < self.visibleAttributes.length; j++) {
					var attrTemplate = self.visibleAttributes[j];
					var attrName = attrTemplate.name;
					
					if (attrName === "Id") continue;
						
					var actualAttr = getAttrSafe(row, attrName);
					
					if (attrName === "Summary") {
						actualAttr.type = "link";
						actualAttr.url = urlAttr.value || "";
					}
					
					if (actualAttr.value === undefined || actualAttr.value === null || actualAttr.value === "") {
		                // On fusionne avec le template pour ne pas perdre le type de widget
		                var safeAttr = {};
		                for(var key in attrTemplate) { safeAttr[key] = attrTemplate[key]; }
		                safeAttr.value = ""; // On force la valeur vide pour l'affichage
		                actualAttr = safeAttr;
		            }

		            actualAttr.url = urlAttr.value || "";
								
					storeItem[attrName] = actualAttr.value || "";

					self._gridDataCache[rowKey][attrName] = {
		                "element": actualAttr, // contient editable, etc.
		                "context": rowContext
		            };
		        }
		        gridItems.push(storeItem);
		    }

			// 5. Configuration du Layout (Colonnes de la grille)
			var layout = [
		        {
		            "name": "Id",
		            "field": "Id",
		            "width": "120px",
		            "formatter": widgetFormatter
		        },
		        {
		            "name": "Summary", // On le force en 2e position
		            "field": "Summary",
		            "width": "auto", // Vous pouvez mettre "250px" si vous voulez qu'il soit plus large
		            "formatter": widgetFormatter
		        }
		    ];
			
			var forbidden = ["Type", "Id", "Summary", "Url", "contextId", "paContextId"];
		    
			for (var k = 0; k < self.visibleAttributes.length; k++) {
		        var name = self.visibleAttributes[k].name;
		        
				if (forbidden.indexOf(name) === -1) {
		            layout.push({
		                "name": name,
		                "field": name,
		                "width": "auto",
		                "formatter": widgetFormatter
		            });
		        }
		    }
				
			// 6. Création du Store et Rendu final
		    var store = new ItemFileWriteStore({
		        "data": { "identifier": "uniqueId", "items": gridItems }
		    });

		    var gridDiv = domConstruct.create("div", {
		        "class": "ewm-child-grid",
		        "style": "width:100%; height:350px;"
		    }, self.childrenBody);

		    self.grid = new DataGrid({
		        "store": store,
		        "structure": layout,
		        "selectionMode": "none",
		        "autoHeight": false,
				"id": "grid_inst_" + self.instanceID // On donne un ID unique à la grille elle-même
		    }, gridDiv);

		    self.grid.startup();
	
		},
		
		
		formatIsoDateForCustomStyle: function(dateString) {
		    
			if (!dateString) return "";

		    // 1. Créer l'objet Date
		    var dateObj = new Date(dateString);

		    if (isNaN(dateObj.getTime())) {
		        return dateString;
		    }

		    var customDatePattern = "dd MMM yyyy"; 
		    var customTimePattern = "HH:mm:ss"; 
		    var formattedDate = locale.format(dateObj, {
		        datePattern: customDatePattern,
		        selector: "date"
		    });
		    
		    var formattedTime = locale.format(dateObj, {
		        timePattern: customTimePattern,
		        selector: "time"
		    });
		    return formattedDate + " " + formattedTime;
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
		
		convertMillisecondsToWorkDays: function(milliseconds) {
		    // 28 800 000 est le nombre de millisecondes dans 8 heures
		    var MS_PER_WORK_DAY = 28800000;
		    
		    if (typeof milliseconds !== 'number' || isNaN(milliseconds) || milliseconds < 0) {
		        // Gérer les autres cas invalides si nécessaire (si vous ne voulez pas de durées négatives non -1)
		        return ""; 
		    }

		    // 1. Calcul du résultat exact
		    var days = milliseconds / MS_PER_WORK_DAY;

		    // 2. Arrondir à deux décimales (méthode Math.round(x * 100) / 100)
		    var roundedDays = Math.round(days * 100) / 100;

			return roundedDays + " d";

		},
		
		
		


		getCustomAttributeData: function(workItem, paContextId, extension) {
			//var defaultValue = { value: "", type: "", key: "" };
			
		    var defaultValue = { 
		        type: extension.type, 
		        enumerations: null // Retourne null si ce n'est pas une énumération
		    };

		    if (!workItem) return defaultValue;
			
			var customAttrs = Array.from(workItem.getElementsByTagName("customAttributes") || []);

		    var foundAttr = customAttrs.find(function(attr) {
		        var identifierNode = attr.getElementsByTagName("identifier")[0];
		        var identifier = (identifierNode && identifierNode.textContent) || null;		        
		        return identifier === extension.key;
		    });
			
			if (!foundAttr) return defaultValue;

			var attributeType = (foundAttr.getElementsByTagName("attributeType")[0] || {}).textContent || "";

			defaultValue.type = attributeType;
			
			var enumerations = null;
			
			var projectAreaNode = foundAttr.getElementsByTagName("projectArea")[0];
			
			if (!projectAreaNode) return defaultValue;
			
			var allEnumerations = Array.from(projectAreaNode.getElementsByTagName("enumerations") || []);
		    
			var matchingEnumerationNode = allEnumerations.find(function(enumNode) {
			    // L'ID du nœud d'énumération est comparé à l'attributeType extrait plus haut
			    var enumId = (enumNode.getElementsByTagName("id")[0] || {}).textContent || null;
			    return enumId === attributeType;
			});
			
			if (!matchingEnumerationNode) return defaultValue;
			
			var literals = Array.from(matchingEnumerationNode.getElementsByTagName("literals") || []);
			
			//"https://jazz-server:9443/ccm/oslc/enumerations/_pG5nILDqEfC38tEFCAkmbQ/enum%20de%20test/enum%20de%20test.literal.l2"/>

			
			if (literals.length > 0) {
				enumerations = literals.map(function(literal) {
					
					var idNode = literal.getElementsByTagName("id")[0];
					var id = (idNode && idNode.textContent) || "";
				    var urlId   = JAZZ.getApplicationBaseUrl() + "oslc/enumerations/" + paContextId +"/" + defaultValue.type + "/" + id;
									    
					var nameNode = literal.getElementsByTagName("name")[0];
				    
				    return {
				        id: urlId,
				        name: (nameNode && nameNode.textContent) || null
				    };
				});
				
				if (attributeType.includes("enumerationList$")) {
					attributeType = "enumerationList";
				} else {
					attributeType = "enumeration";
				}		
				return {
			        type: attributeType,
			        enumerations: enumerations
			    };
			} else {
				return {
			        type: attributeType,
			        enumerations: []
			    };
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
			var self = this;
			for (var i = 0; i < self.wellKnownAttributes.length; i++) {
				var attr = self.wellKnownAttributes[i]
				if (attr.name === key) return attr;
			} 
			return null;
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
		
		formatPipeString: function(tags) {
			var parts = tags.split('|');
			var filteredTags = parts.filter(Boolean);

			return filteredTags.join(', ');
		},
		
		setVisibleAttributes: function() {
			var self = this;
			self.visibleAttributes = self.wellKnownAttributes
				.filter(function(attr) { return attr.visible; })
			    .map(function(attr) { return self.deepClone(attr); });
		},
		
		uninitialize: function() {
			var self = this;
		    if (self.grid) {
		        self.grid.destroyRecursive();
		    }
		    // Vide le cache pour libérer la RAM
		    self._gridDataCache = null;
		    self.inherited(arguments);
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
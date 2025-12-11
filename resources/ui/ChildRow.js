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
    "dojo/on",
    "dojo/dom-construct",
    "dojo/text!./templates/ChildRow.html",
	"./cells/StandardCell",
	"./cells/LinkCell",
	"./cells/EditableTextCell",
	"./cells/ComboBoxCell",
	"./cells/CategoryCell",
	"./cells/ContributorCell",
	"./cells/DeliverableCell",
	"./cells/StateCell",
	"./cells/IterationCell",
	"./cells/PriorityCell",
	"./cells/ResolutionCell",
	"./cells/SeverityCell",
	"./cells/TimeStampCell",
	"./cells/DurationCell",
], function (
    declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Tooltip, on, domConstruct, template, 
	StandardCell,  LinkCell, EditableTextCell, 
	ComboBoxCell, CategoryCell, ContributorCell, DeliverableCell, StateCell,
	IterationCell, ResolutionCell, SeverityCell, TimeStampCell, DurationCell) {
	return declare("fr.syncheo.ewm.childitem.presentation.ui.ChildRow", 
		[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
			
			
			templateString: template,
			childData: null,
			changed: null,
			url: null,
			allCells: null,
			onChange: null,
			
			constructor: function (args) {
				this.childData = args.childData || {};
				this.onChange = args.onChange || function(){};
			},
			
	
			postCreate: function () {
				var self = this;
				self.changed = {};
				self.allCells = [];
				
				self.inherited(arguments);
				
				if (!self.childData) return;
				
				var id = self.childData.filter(function(elmt) {	return elmt.name === "Id" })[0];
				var type = self.childData.filter(function(elmt) { return elmt.name === "Type"	})[0];
				var summary = self.childData.filter(function(elmt) { return elmt.name === "Summary" })[0];
				var paContextId = self.childData.filter(function(elmt) { return elmt.name === "paContextId"	})[0];
				var contextId = self.childData.filter(function(elmt) { return elmt.name === "contextId" })[0];
					
				self.url = self.childData.filter(function(elmt) { return elmt.name === "Url" })[0];
				self.contextId = self.childData.filter(function(elmt) { return elmt.name === "contextId" })[0];

				
				var td = domConstruct.create("td", {}, self.childRow);
				var cellId = new LinkCell(type.value + " " + id.value, self.url.value); // si tu veux un lien
				cellId.render(td);
				
				self.allCells.push(cellId);
				
				// Cellule Summary
				var td2 = domConstruct.create("td", {}, self.childRow);
				if( summary.editable) {
					var cellSummary = new EditableTextCell(summary.value, self.callback.bind(self));					
				} else {
					var cellSummary = new LinkCell(summary.value, this.url.value); // si tu veux un lien
				}
				cellSummary.render(td2);

				self.allCells.push(cellSummary);
				
				for (var i = 0; i < self.childData.length; i++) {
					
					var childElemt = self.childData[i];

					if (["Type","Id","Summary","Url","contextId","paContextId"].includes(childElemt.name)) continue;


					var td = domConstruct.create("td", {}, this.childRow);
	
					if (!childElemt.editable) {
						var cell = new StandardCell(childElemt.value);
					} else {
						if (childElemt.type === "string" ) {
							var cell = new EditableTextCell({
								element: childElemt, 
								onChange: self.callback.bind(self)
							});						
						} else if (childElemt.type === "category" ) {
							var cell = new CategoryCell({
								element: childElemt, 
								paContextId: paContextId, 
								onChange: self.callback.bind(self)
							});						
						} else if (childElemt.type === "contributor" ) {
							var cell = new ContributorCell({
								element: childElemt, 
								contextId: contextId, 
								onChange: self.callback.bind(self)
							});
						} else if (childElemt.type === "iteration" ) {
							var cell = new IterationCell({
								element: childElemt, 
								contextId: contextId, 
								onChange: self.callback.bind(self)
							});
						} else if (childElemt.type === "deliverable" ) {
							var cell = new DeliverableCell({
								element: childElemt, 
								paContextId: paContextId, 
								onChange: self.callback.bind(self)
							});	
						} else if (childElemt.type === "priority" ) {
							var cell = new PriorityCell({
								element: childElemt, 
								paContextId: paContextId, 
								onChange: self.callback.bind(self)
							});
						} else if (childElemt.type === "severity" ) {
							var cell = new SeverityCell({
								element: childElemt, 
								paContextId: paContextId, 
								onChange: self.callback.bind(self)
							});
						} else if (childElemt.type === "resolution" ) {
							var cell = new ResolutionCell({
								element: childElemt, 
								paContextId: id, 
								onChange: self.callback.bind(self)
							});					
						} else if (childElemt.type === "enumeration" ) {
							var cell = new ComboBoxCell({
								element: childElemt,  
								onChange: self.callback.bind(self)
							});				
						} else if (childElemt.type === "duration" ) {
							var cell = new DurationCell({
								element: childElemt,  
								onChange: self.callback.bind(self)
							});	
						} else if (childElemt.type === "timestamp" ) {
							var cell = new TimeStampCell({
								element: childElemt,  
								onChange: self.callback.bind(self)
							});	
						} else if (childElemt.type === "state" ) {
							var cell = new StateCell({
								element: childElemt, 
								workItemId: id,
								onChange: self.callback.bind(self)
							});						
						} else {
							console.log(childElemt);
						}
					}
					cell.render(td);
					self.allCells.push(cell);
				}
			},
			
			destroy: function() {
			    var self = this;
			    
			    // CRITIQUE : Démarrer la destruction des éléments contenus
			    if (self.allCells) {
			        self.allCells.forEach(function(cell) {
			            // Supposons que chaque cellule a une méthode 'destroy' qui nettoie son widget Dijit interne
			            if (cell && typeof cell.destroy === 'function') {
			                cell.destroy();
			            } else if (cell && cell.widget && typeof cell.widget.destroy === 'function') {
			                // Alternative: Si la cellule expose son widget interne dans une propriété 'widget'
			                cell.widget.destroy();
			            }
			        });
			    }
			    
			    // Nettoyer les écouteurs d'événements (du bouton SAVE global)
			    self.own([]); // La méthode 'own' gère déjà la destruction des écouteurs on(globalSaveBtn, "click", ...)

			    // Appeler la méthode destroy du parent (_WidgetBase)
			    self.inherited(arguments); 
			},
			
			
			callback: function(newValue, element) {
				var self = this;
				var objectUrl = self.url.value;
				var fieldName = element.name || "childElemt.name";
				if (self.changed[objectUrl] === undefined) self.changed[objectUrl] = {};
				self.changed[objectUrl][fieldName] = newValue;
				console.log("Champ modifié :", objectUrl, ": " , fieldName, "->", newValue);
				self.onChange(self.changed);
			},
			
			startup: function () {
			    this.inherited(arguments);
			}
			

			
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

    });
});
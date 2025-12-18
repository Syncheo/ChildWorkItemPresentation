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
	"./cells/LinkCell",
	"./cells/EditableTextCell",
	"./CellWidgetFactory"
], function (
    declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Tooltip, on, domConstruct, template, 
	LinkCell, EditableTextCell, CellWidgetFactory) {
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
					
				self.url = self.childData.filter(function(elmt) { return elmt.name === "Url" })[0];
				self.contextId = self.childData.filter(function(elmt) { return elmt.name === "contextId" })[0];

				var contextIds = {
				    paContextId: paContextId, // supposons que paContextId est défini dans cette portée
				    contextId: self.contextId,     // supposons que contextId est défini
				    id: id                    // supposons que id est défini (pour resolution/state)
				};
				
				
				var td = domConstruct.create("td", {}, self.childRow);
				var linkElement = {
					editable: false,
					type: "link",
					value: type.value + " " + id.value,
					url: self.url.value
				}
				
				this.cellFactory = new CellWidgetFactory();
				
				var cellId = this.cellFactory.createCell(
				    linkElement, 
				    contextIds, 
				    self.callback.bind(self)
				);
				
				cellId.render(td);
				
				self.allCells.push(cellId);
				
				// Cellule Summary
				var td2 = domConstruct.create("td", {}, self.childRow);
				
				var summaryElement = {
					editable: summary.editable,
					type: "link",
					name: "Summary",
					oslckey: "dcterms:title",
					datatype: "Literal",
					value: summary.value,
					url: self.url.value
				}
				
				this.cellFactory = new CellWidgetFactory();

				var cellSummary = this.cellFactory.createCell(
					summaryElement,
					contextIds,
					self.callback.bind(self)
				);
				
				cellSummary.render(td2);

				self.allCells.push(cellSummary);
				
				for (var i = 0; i < self.childData.length; i++) {
					
					var childElemt = self.childData[i];

					if (["Type","Id","Summary","Url","contextId","paContextId"].includes(childElemt.name)) continue;
					
					var td = domConstruct.create("td", {}, this.childRow);
					
					this.cellFactory = new CellWidgetFactory();
	
					var cell = this.cellFactory.createCell(
					    childElemt,
					    contextIds, 
					    self.callback.bind(self)
					);

					// Rendre la cellule (la logique de rendu reste la même)
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
			var fieldName = element.oslckey || element.name  || "Unknown";
			if (!self.changed[objectUrl]) {
			    self.changed[objectUrl] = {};
			}

			// 2. Utiliser l'oslckey comme CLÉ au lieu de faire un push dans un tableau
			// Cela écrase automatiquement l'ancienne valeur si le même champ est rechangé
			self.changed[objectUrl][element.oslckey] = {
			    value: newValue,
			    oslckey: element.oslckey,
			    datatype: element.datatype
			};
			console.log("Champ modifié :", objectUrl, ": " , fieldName, "->", newValue);
			self.onChange(self.changed);
		},
			
		startup: function () {
		    this.inherited(arguments);
		}
    });
});
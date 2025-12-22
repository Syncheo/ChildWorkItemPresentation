/**
 * CellWidgetFactory.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */



define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    // Importer toutes les classes de cellules référencées
    "./cells/LinkCell",
	"./cells/StandardCell",
	"./cells/StandardCategoryCell",
	"./cells/StandardIterationCell",
	"./cells/StandardContributorCell",
	"./cells/StandardTimeStampCell",
    "./cells/EditableTextCell",
    "./cells/CategoryCell",
    "./cells/ContributorCell",
    "./cells/IterationCell",
    "./cells/DeliverableCell",
    "./cells/PriorityCell",
    "./cells/SeverityCell",
    "./cells/ResolutionCell",
    "./cells/ComboBoxCell",
    "./cells/DurationCell",
    "./cells/TimeStampCell",
    "./cells/StateCell",
	"./cells/CheckBoxCell",
	"./cells/TagsTextCell",
	"./cells/MultiSelectCell",
	"./cells/NumberTextCell"
    // ... autres dépendances si nécessaire
], function(declare, _WidgetBase, LinkCell,
    StandardCell, StandardCategoryCell, StandardIterationCell, StandardContributorCell,
	StandardTimeStampCell, EditableTextCell, CategoryCell, ContributorCell, IterationCell, 
    DeliverableCell, PriorityCell, SeverityCell, ResolutionCell, ComboBoxCell, 
    DurationCell, TimeStampCell, StateCell, CheckBoxCell, TagsTextCell,MultiSelectCell,
	NumberTextCell) {
		
		return declare("fr.syncheo.ewm.childitem.presentation.ui.CellWidgetFactory", null, {

        /**
         * Table de correspondance (Mapping) entre le type d'élément et la classe de widget correspondante.
         * Notez que les clés sont les valeurs de childElemt.type.
         * La valeur associée est la Classe Dojo (pas encore instanciée).
         */
        _cellMappings: {
            "string":		EditableTextCell,
            "category":		CategoryCell,
            "contributor":	ContributorCell,
            "iteration":	IterationCell,
			"interval":		IterationCell,
            "deliverable":	DeliverableCell,
            "priority":		PriorityCell,
            "severity":		SeverityCell,
            "resolution":	ResolutionCell,
            "enumeration":	ComboBoxCell,
            "duration":		DurationCell,
            "timestamp":	TimeStampCell,
            "state":		StateCell,
			"link":			EditableTextCell,
			"boolean":		CheckBoxCell,
			"pipearray":	TagsTextCell,
			"enumerationList":	MultiSelectCell,
			"integer":		NumberTextCell
            // Les autres types peuvent être ajoutés ici
        },
		_nonEditableCellMappings: {
		    "string":		StandardCell,
		    "category":		StandardCategoryCell,
		    "contributor":	StandardContributorCell,
		    "iteration":	StandardIterationCell,
			"interval":		StandardIterationCell,
		    "deliverable":	StandardCell,
		    "priority":		StandardCell,
		    "severity":		StandardCell,
		    "resolution":	StandardCell,
		    "enumeration":	StandardCell,
		    "duration":		StandardCell,
		    "timestamp":	StandardTimeStampCell,
		    "state":		StandardCell,
			"link":			LinkCell
		    // Les autres types peuvent être ajoutés ici
		},

        constructor: function(args) {
            // Le Factory n'a généralement pas besoin de propriétés, mais on peut les initialiser
        },

        /**
         * Crée et instancie le widget de cellule approprié en fonction du type d'élément.
         * * @param {Object} childElemt L'objet contenant les propriétés 'editable' et 'type'.
         * @param {Object} contextIds L'objet contenant contextId, paContextId, id, etc.
         * @param {Function} callback La fonction de rappel pour l'événement onChange.
         * @returns {Object} L'instance du widget de cellule.
         */
		
		createCell: function(childElemt, contextIds, callback) {
			var cell;
			
			// Si non éditable, retourne la cellule standard
			if (!childElemt.editable) {
				var WidgetClass = this._nonEditableCellMappings[childElemt.type];
				if (WidgetClass) {
					cell = new WidgetClass({
						element: childElemt,
						contextIds: contextIds
					});
				} else {
                    cell = new StandardCell({
						element: childElemt,
						contextIds: contextIds
					});
                }
			} else {
				// Récupère la classe de widget basée sur le type
				var WidgetClass = this._cellMappings[childElemt.type];
				
				if (WidgetClass) {
					// Les arguments de base pour tous les widgets éditables
					var args = {
						element: childElemt,
						contextIds: contextIds,
						onChange: callback
					};
                    
	                // Instanciation de la classe trouvée
	                cell = new WidgetClass(args);
		                    
                } else {
                    cell = new StandardCell(childElemt || ""); 
                }
			}
			return cell;
		}
	});
});
/**
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/Tooltip",
	"dojo/dom-construct",
	"dojo/text!./templates/ChildRow.html"
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, domConstruct, template) {
	return declare("fr.syncheo.ewm.childitem.presentation.ui.ChildRow", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		stateData: null,
		

		constructor: function (stateData) {
			this.stateData = stateData;
		},

		postCreate: function() {
			console.log(this.stateData);
            this.inherited(arguments);

            if (!this.stateData) return;

            // Remplit les cellules
            this.idLink.href = this.stateData.url;
            this.idLink.innerHTML = this.stateData.type + " " + this.stateData.id;

            this.summaryLink.href = this.stateData.url;
            this.summaryLink.innerHTML = this.stateData.summary;

            this.stateCell.innerHTML = this.stateData.name;
            this.ownerCell.innerHTML = this.stateData.owner || "";
		},

        startup: function() {
            this.inherited(arguments); // toujours appeler inherited
        }

		
	});
});

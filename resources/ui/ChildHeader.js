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
	"dojo/text!./templates/ChildHeader.html"
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, domConstruct, template) {
	return declare("fr.syncheo.ewm.childitem.presentation.ui.ChildHeader", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		headerNames: null,
		

		constructor: function (attributeNames) {
			this.headerNames = attributeNames;
		},

		postCreate: function() {
			console.log(this.headerNames);
            this.inherited(arguments);

            if (!this.headerNames) return;
			
			
			
			var string = "<tr>";
			for (var i = 0; i < this.headerNames.length; i++) {
				var h = this.headerNames[i];
				if (h == "Type") continue;
				string = string + "<th>" + h + "</th>";	
			}  
			string = string + "</tr>";
			console.log(string);
			
			this.childHeader.innerHTML = string;

		},

        startup: function() {
            this.inherited(arguments); // toujours appeler inherited
        }

		
	});
});

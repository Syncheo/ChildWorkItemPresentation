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
		childData: null,
		

		constructor: function (childData) {
			this.childData = childData;
		},

		postCreate: function() {
			console.log(this.childData);
            this.inherited(arguments);

            if (!this.childData) return;
			
			domConstruct.create("th", { innerHTML: "Id" }, this.childHeader);
			domConstruct.create("th", { innerHTML: "Summary" }, this.childHeader);

			for (var i = 0; i < this.childData.length; i++) {
				var childElemt = this.childData[i]
				if (childElemt.name === "Type" || childElemt.name === "Id" || 
					childElemt.name === "Summary" || childElemt.name === "Url") continue;  
				
				domConstruct.create("th", { innerHTML: childElemt.name }, this.childHeader);
			}
		},

        startup: function() {
            this.inherited(arguments); // toujours appeler inherited
        }

		
	});
});

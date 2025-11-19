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
		childData: null,
		headers: null,
		

		constructor: function (childData, attributeNames) {
			this.childData = childData;
			this.headers = attributeNames;
		},

		postCreate: function() {
			console.log(this.childData);
            this.inherited(arguments);

            if (!this.childData) return;
			
			var string = "<tr>";
			string = string + "<td><a class=\"jazz-ui-ResourceLink\" href=" + this.childData.url + "\">" + 
				this.childData.Type + " " + this.childData.Id + "</a></td>";
				string = string + "<td><a class=\"jazz-ui-ResourceLink\" href=" + this.childData.url + "\">" + 
								this.childData.Summary + "</a></td>";
			
			for (var i = 0; i < this.headers.length; i++) {
				var h = this.headers[i];
				if (h == "Type") continue;
				if (h == "Id") continue;
				if (h == "Summary") continue;
				string = string + "<td>" + this.childData[h] + "</td>";	
			}  
			
			string = string + "</tr>";

			console.log(string)
			this.childRow.innerHTML = string;
           /* // Remplit les cellules
            this.idLink.href = this.stateData.url;
            this.idLink.innerHTML = this.stateData.type + " " + this.stateData.id;

            this.summaryLink.href = this.stateData.url;
            this.summaryLink.innerHTML = this.stateData.summary;

            this.stateCell.innerHTML = this.stateData.name;
            this.ownerCell.innerHTML = this.stateData.owner || "";
			*/
		},

        startup: function() {
            this.inherited(arguments); // toujours appeler inherited
        }

		
	});
});

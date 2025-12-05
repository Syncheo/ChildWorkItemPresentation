/**
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
	return declare("fr.syncheo.ewm.childitem.presentation.ui.UpdateWorkitem", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		workitemData: null,
		xmlDocument: null,
		
		constructor: function (workitemData) {
			this.workitemData = workitemData;
			console.log(new XMLSerializer().serializeToString(this._buildXml()));
		},
		
		_buildXml: function() {
			
			var xmlDoc = document.implementation.createDocument(
			    "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			    "rdf:RDF",
			    null
			);

			var root = xmlDoc.documentElement;
			
			root.setAttribute("xmlns:rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
			root.setAttribute("xmlns:dcterms", "http://purl.org/dc/terms/");
			root.setAttribute("xmlns:rtc_ext", "http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/");
			root.setAttribute("xmlns:oslc", "http://open-services.net/ns/core#");
			root.setAttribute("xmlns:acp", "http://jazz.net/ns/acp#");
			root.setAttribute("xmlns:oslc_cm", "http://open-services.net/ns/cm#");
			root.setAttribute("xmlns:oslc_cmx", "http://open-services.net/ns/cm-x#");
			root.setAttribute("xmlns:oslc_pl", "http://open-services.net/ns/pl#");
			root.setAttribute("xmlns:acc", "http://open-services.net/ns/core/acc#");
			root.setAttribute("xmlns:rtc_cm", "http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/");
			root.setAttribute("xmlns:process", "http://jazz.net/ns/process#");
			
			// Description
			var desc = xmlDoc.createElementNS(
				"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
				"rdf:Description"
			);
			
			desc.setAttribute("rdf:about", this.workitemData.aboutUrl);
			root.appendChild(desc);

			// Title
			var title = xmlDoc.createElementNS(
				"http://purl.org/dc/terms/",
				"dcterms:title"
			);
			
			title.setAttribute("rdf:parseType", "Literal");
			title.textContent = this.workitemData.title;
			
			desc.appendChild(title);
			
			// Custom Attribute
			var custom = xmlDoc.createElementNS(
				"http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/",
				"rtc_ext:CustomAttribute"
			);
			
			custom.setAttribute("rdf:datatype", "http://www.w3.org/2001/XMLSchema#string");
			custom.textContent = this.workitemData.customValue;
			desc.appendChild(custom);
			// construire ton XML...
			return xmlDoc;
		}
		

		/*
		  <rdf:Description rdf:about="https://jazz-server:9443/ccm/resource/itemOid/com.ibm.team.workitem.WorkItem/_9vUXsLohEfCoBvH4zpHzlA">
		    <dcterms:title rdf:parseType="Literal">Child Defect</dcterms:title>
		    <dcterms:contributor rdf:resource="https://jazz-server:9443/jts/users/smaamari"/>
		    <rtc_ext:com.ibm.team.apt.attribute.planitem.blockedReason rdf:datatype="http://www.w3.org/2001/XMLSchema#string"></rtc_ext:com.ibm.team.apt.attribute.planitem.blockedReason>
		    <rtc_ext:CustomAttribute rdf:datatype="http://www.w3.org/2001/XMLSchema#string">My filed custom attribute</rtc_ext:CustomAttribute>
		    <rtc_cm:resolution rdf:resource="https://jazz-server:9443/ccm/oslc/workflows/_pG5nILDqEfC38tEFCAkmbQ/resolutions/com.ibm.team.workitem.defectWorkflow/1"/>
		    <rtc_ext:com.ibm.team.apt.attribute.planitem.blocked rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">false</rtc_ext:com.ibm.team.apt.attribute.planitem.blocked>
		    <rtc_cm:state rdf:resource="https://jazz-server:9443/ccm/oslc/workflows/_pG5nILDqEfC38tEFCAkmbQ/states/com.ibm.team.workitem.defectWorkflow/com.ibm.team.workitem.defectWorkflow.state.s3"/>
		    <dcterms:description rdf:parseType="Literal"></dcterms:description>
		    <oslc_cmx:priority rdf:resource="https://jazz-server:9443/ccm/oslc/enumerations/_pG5nILDqEfC38tEFCAkmbQ/priority/priority.literal.l01"/>
		    <rtc_cm:subscribers rdf:resource="https://jazz-server:9443/jts/users/smaamari"/>
		    <oslc_cm:status rdf:datatype="http://www.w3.org/2001/XMLSchema#string">Resolved</oslc_cm:status>
		    <oslc:discussedBy rdf:resource="https://jazz-server:9443/ccm/oslc/workitems/_9vUXsLohEfCoBvH4zpHzlA/rtc_cm:comments"/>
		    <oslc_cmx:severity rdf:resource="https://jazz-server:9443/ccm/oslc/enumerations/_pG5nILDqEfC38tEFCAkmbQ/severity/severity.literal.l3"/>
		    <rtc_cm:filedAgainst rdf:resource="https://jazz-server:9443/ccm/resource/itemOid/com.ibm.team.workitem.Category/_rHe-0LDqEfCOFslQOGWoog"/>
		  </rdf:Description>
		</rdf:RDF>
		*/
	})

});
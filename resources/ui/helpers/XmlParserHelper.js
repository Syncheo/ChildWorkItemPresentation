/**
 * XML Parser Helper.js
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */


define([ 
	"dojo/_base/declare",
	"./JazzHelpers"
 ], function(declare, JAZZ) { return {
	
	getWorkitemType: function(c) {
		var typeNameNode = c.querySelector("children > type > name");
		var typeName = typeNameNode ? typeNameNode.textContent : "";
		return typeName;
	},
	
	getProjectAreaContextId: function(c) {
		var typeNameNode = c.querySelector("children > projectArea > contextId");
		var typeName = typeNameNode ? typeNameNode.textContent : "";
		return typeName;
	},
	
	getCategoryUrl: function(c) {
		var typeNameNode = c.querySelector("children > category > reportableUrl");
		var typeName = typeNameNode ? typeNameNode.textContent : "";
		return typeName;
	},
	
	getOwnerUrl: function(c) {
		var typeNameNode = c.querySelector("children > owner > reportableUrl");
		var typeName = typeNameNode ? typeNameNode.textContent : "";
		return typeName;
	},
	
	getIterationUrl: function(c) {
		var typeNameNode = c.querySelector("children > target > reportableUrl");
		var typeName = typeNameNode ? typeNameNode.textContent : "";
		return typeName;
	},

	getWorkitemContextId: function(c) {
		var typeNameNode = c.querySelector("children > contextId");
		var typeName = typeNameNode ? typeNameNode.textContent : "";
		return typeName;
	},

	getWorkitemSummary: function(c) {
		var typeNameNode = c.querySelector("children > summary");
		var typeName = typeNameNode ? typeNameNode.textContent : "";
		return typeName;
	},
		
	getWorkitemUrl: function(c) {
		var itemIdNode = c.querySelector("children > itemId");
		var itemId = itemIdNode ? itemIdNode.textContent : "";
		return JAZZ.getApplicationBaseUrl() + "resource/itemOid/com.ibm.team.workitem.WorkItem/" + itemId
	},
	
	getWorkitemId: function(c) {
		var itemIdNode = c.querySelector("children > id");
		var typeName = itemIdNode ? itemIdNode.textContent : "";
		return typeName;
	},
	
	
	getLatestCommentDetails: function(xmlDoc) {
	    var commentsNodes = Array.from(xmlDoc.getElementsByTagName("comments") || []);
		
		if (commentsNodes.length === 0) {
			return { creatorName: "N/A", content: "Aucun commentaire", date: new Date(0) };
		}
		
		var comments = commentsNodes.map(function(commentNode) {
			var dateString = this.getFirstTagText(commentNode, "creationDate");
			return {
				date: new Date(dateString),
				creatorName: this.getFirstTagText(commentNode.getElementsByTagName("creator")[0], "name"),
				content: this.getFirstTagText(commentNode, "formattedContent")
			};
		});

		comments.sort(function(a, b) {
			return b.date.getTime() - a.date.getTime();
		});
		
		return comments[0];

	},

	formatLatestCommentToHtml: function(xmlDoc) {

	    var latestComment = this.getLatestCommentDetails(xmlDoc);

	    if (!latestComment.creatorName || latestComment.creatorName === "N/A") {
	        return "<div>Aucun commentaire trouvé.</div>";
	    }
	    
	    // Mise en forme de la date au format local (Ex: 10/12/2025 14:09)
	    var dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
	    var formattedDate = latestComment.date.toLocaleDateString('fr-FR', dateOptions);

	    // Construction de la chaîne HTML sur trois lignes
	    var htmlString = 
	        "<div>Créateur : <b>" + latestComment.creatorName + "</b></div>" + // Ligne 1 : Créateur en gras
	        "<div>Date : " + formattedDate + "</div>" +                         // Ligne 2 : Date
	        "<div>Contenu : " + latestComment.content + "</div>";                // Ligne 3 : Contenu formaté

	    return htmlString;
	},

	
	getExtensionMetadata: function(workItem, targetDisplayName) {
		var defaultExtensionMetadata = {key: "", type: "", isEnumeration: "", };
		/*
		<extensionMetadata>
		<key>MonEnum</key>
		<displayName>Mon Enum</displayName>
		<type>enum de test</type>
		<isEnumeration>true</isEnumeration>
		<archived>false</archived>
		<workItemType/>
		</extensionMetadata>
		*/
		if (!workItem) return defaultValue;
		var exts = Array.from(workItem.getElementsByTagName("extensionMetadata") || []);
		var foundExt = exts.find(function(ext) {
			var displayNameNode = ext.getElementsByTagName("displayName")[0];
			var displayName = (displayNameNode && displayNameNode.textContent) || null;
			return displayName === targetDisplayName;
		});
		
		if (foundExt) {
			defaultExtensionMetadata.type = (foundExt.getElementsByTagName("type")[0] || {}).textContent || "";
			defaultExtensionMetadata.key  = (foundExt.getElementsByTagName("key")[0]  || {}).textContent || "";
			defaultExtensionMetadata.isEnumeration  = (foundExt.getElementsByTagName("isEnumeration")[0]  || {}).textContent || "";
		}

		return defaultExtensionMetadata;
		
	},
			


	
	getValueByTag1andTag2: function(c, tag1, tag2) {
		if (!tag1 || typeof tag1 !== "string") return "";
		if (!tag2 || typeof tag2 !== "string") return "";
		
		if (!c || typeof c.getElementsByTagName !== "function") return "";
		
		var elems1 = c.getElementsByTagName(tag1);
		if (!elems1 || elems1.length === 0) return "";

		var elems2 = elems1[0].getElementsByTagName(tag2);
		if (!elems2 || elems2.length === 0) return "";
		
		var text = elems2[0].textContent;
		return (typeof text === "string" ? text : "");												
	},
	
	getArrayOfAttributes: function(xmlDoc, node, item) {
		var self = this;
		var nodes = Array.from(xmlDoc.getElementsByTagName(node) || []);
		if (nodes.length === 0) {
			return "";
		}
		
		var items = nodes.map(function(nodeElmt) {
			return this.getFirstTagText(nodeElmt, item);
		});
		return items.join(", ");
	},
	
	getAllExtensionsDisplayValue: function(workItem, targetDisplayName) {
		//configuredAttribut.rest = "allExtensions/(displayName|displayValue|key|type|itemValue/reportableUrl)|customAttributes/(identifier|attributeType|projectArea/enumerations/(id|literals/(id|name)))";							

		var defaultValue = { value: "", type: "", key: "" };

	    if (!workItem) return defaultValue;
	    		
	    var exts = Array.from(workItem.getElementsByTagName("allExtensions") || []);
	    
		var foundExt = exts.find(function(ext) {
			var displayNameNode = ext.getElementsByTagName("displayName")[0];
			var displayName = (displayNameNode && displayNameNode.textContent) || null;
			return displayName === targetDisplayName;
		});
		
		if (foundExt) {
			var type = (foundExt.getElementsByTagName("type")[0] || {}).textContent || "";
			var key  = (foundExt.getElementsByTagName("key")[0]  || {}).textContent || "";
			
			var value;
			
			if (type === "itemValue") {
			    var itemValueNode = foundExt.getElementsByTagName("itemValue")[0];
			
			    if (itemValueNode) {
			        var reportableUrlNode = itemValueNode.getElementsByTagName("reportableUrl")[0];
			        value = (reportableUrlNode && reportableUrlNode.textContent) || "";
			    } else {
			        value = ""; // Nœud <itemValue> manquant
			    }
			
			} else {
			    // Pour tous les autres types (chaîne, nombre, etc.), utiliser displayValue
			    value = (foundExt.getElementsByTagName("displayValue")[0] || {}).textContent || "";
			}

	        return {
	            value: value,
	            type:  type,
	            key:   key,
	        };
	    }
		
		
		return defaultValue;
	},

	
	getFirstTagText: function(element, tagName) {
	    if (!element) return null;
	    var n = element.getElementsByTagName(tagName);
	    return (n && n[0] && n[0].textContent) || null;
	},
	
	
	getValueByNameAttribute: function(c, rest) {
		if (!rest || typeof rest !== "string") return "";
		
		var parts = rest.split("/");
		
		if (parts.length < 2) return "";
			var tag1 = parts[0];
			var tag2 = parts[1];
			if (!c || typeof c.getElementsByTagName !== "function") return "";
			
			var elems1 = c.getElementsByTagName(tag1);
			if (!elems1 || elems1.length === 0) return "";

			var elems2 = elems1[0].getElementsByTagName(tag2);
			if (!elems2 || elems2.length === 0) return "";
			
			var text = elems2[0].textContent;
			return (typeof text === "string" ? text : "");												
		}
				
    };
});
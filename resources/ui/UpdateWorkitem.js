/**
 * UpdateWorkitem.js
 * Module de service Dojo pour la mise à jour d'un Work Item via OSLC/PUT.
 * @Author Sany Maamari
 * @Copyright (c) 2025, Syncheo
 */


define([
	"./helpers/XhrHelpers"
], function(xhr){

    return {
		
		rtcCmNs: "http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/",
		rdfNs: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		dctermsNs: "http://purl.org/dc/terms/",
		rtcExtNs: "http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/",
		oslcNs: "http://open-services.net/ns/core#",
		acpNs: "http://jazz.net/ns/acp#",
		oslcCmNs: "http://open-services.net/ns/cm#",
		oslcCmxNs: "http://open-services.net/ns/cm-x#",
		oslcPlNs: "http://open-services.net/ns/pl#",
		oslcAccNs: "http://open-services.net/ns/core/acc#",
		processNs: "http://jazz.net/ns/process#",
				
        /**
         * Met à jour un Work Item EWM en utilisant une transaction OSLC PUT sécurisée par ETag.
         * * @param {object} dataToUpdate L'objet contenant les données de l'élément à modifier.
         * Ex: { itemId: 12345, summary: "Nouvelle valeur", ... }
         * @param {string} repositoryUrl L'URL de base du serveur JTS/CCM (ex: https://jazz-server:9443/ccm)
         * @returns {dojo/promise/Promise} La promesse de l'opération de sauvegarde.
         */
        update: function(dataToUpdate, repositoryUrl) {
            
            // 3. 🎯 Construction de la charge utile XML RDF
            var rdfXmlPayload = this._buildRdfXml({data: dataToUpdate, 
				url: repositoryUrl});

            // 4. Exécuter le cycle GET ETag puis PUT OSLC
            return xhr.oslcPutWithEtag(rdfXmlPayload.url, rdfXmlPayload.data);
        },

        /**
         * Méthode privée pour construire la charge utile XML RDF/OSLC
         * (C'est ici que vous insérez la logique de sérialisation des données)
         * @param {object} data Les données à sérialiser.
         * @returns {string} Le XML RDF/OSLC.
         */
        _buildRdfXml: function(dataToUpdate) {
			//Object.assign(dataToUpdate[element.oslckey], object);
			if(!dataToUpdate) return {data: "", url: null };
			var data = dataToUpdate.data;
			if(!data) return {data: "", url: null };
			var url = dataToUpdate.url;
			if(!url) return {data: "", url: null };

			
			var xmlDoc = document.implementation.createDocument(this.rdfNs, "rdf:RDF", null	);

			var root = xmlDoc.documentElement;

			// Déclaration de tous les namespaces
			root.setAttribute("xmlns:dcterms", this.dctermsNs);
			root.setAttribute("xmlns:rtc_ext", this.rtcExtNs);
			root.setAttribute("xmlns:oslc", this.oslcNs);
			root.setAttribute("xmlns:acp", this.acpNs);
			root.setAttribute("xmlns:oslc_cm", this.oslcCmNs);
			root.setAttribute("xmlns:oslc_cmx", this.oslcCmxNs);
			root.setAttribute("xmlns:oslc_pl", this.oslcPlNs);
			root.setAttribute("xmlns:acc", this.oslcAccNs);
			root.setAttribute("xmlns:rtc_cm", this.rtcCmNs);
			root.setAttribute("xmlns:process", this.processNs);
			
			// Description
			var desc = xmlDoc.createElementNS(this.rdfNs, "rdf:Description" );
			desc.setAttributeNS(this.rdfNs, "rdf:about", url);

			root.appendChild(desc);
			
			
			
			for (var oslckey in data) {
				if (oslckey === "rtc_cm:state") continue;
				var value = data[oslckey].value;
				var datatype = data[oslckey].datatype;
				if (datatype === "Literal") {
					this._addLiteralElement(xmlDoc, desc, this.getNamespace(oslckey), oslckey, value);
				} else if (datatype !== "resource") {
					if (this.getType(value) === "array") {
						for(var i = 0; i < value.length; i++) {
							var oslcelement = xmlDoc.createElement(oslckey);
							oslcelement.setAttribute("rdf:datatype", datatype);
							oslcelement.textContent = value[i];
							desc.appendChild(oslcelement);
						}
					} else {
						var oslcelement = xmlDoc.createElement(oslckey);
						oslcelement.setAttribute("rdf:datatype", datatype);
						oslcelement.textContent = value;
						desc.appendChild(oslcelement);
					}
					

				} else if (datatype === "resource") {
					if (this.getType(value) === "array") {
						for(var i = 0; i < value.length; i++) {
							this._addResourceElement(xmlDoc, desc, this.getNamespace(oslckey), oslckey, value[i]);
						}
					} else {
						this._addResourceElement(xmlDoc, desc, this.getNamespace(oslckey), oslckey, value);
					}
				this._addResourceElement(xmlDoc, desc, this.getNamespace(oslckey), oslckey, value);
				}
			}
			
			var stateObject = data["rtc_cm:state"];
			
			if (stateObject && stateObject.value) {
				var stateValue = stateObject.value;
				if (stateValue.trim() !== "") {
					url = url + "?_action=" + stateValue;
				}
			}
			var xmlString = new XMLSerializer().serializeToString(xmlDoc);
			console.log(xmlString);
            
            return {data: xmlString, url: url };
        },
		
		getType: function(obj) {
		    if (Array.isArray(obj)) return "array";
		    if (typeof obj === "string") return "string";
		    if (obj === null) return "null";
		    return typeof obj;
		},
		
		
		getNamespace: function(oslckey) {
			var key = "";
			var keys = oslckey.split(":")
			key = keys[0];
			var nsMapping = {
				dcterms: this.dctermsNs,
				rtc_ext: this.rtcExtNs,
				oslc: this.oslcNs,
				acp: this.acpNs,
				oslc_cm: this.oslcCmNs,
				oslc_cmx: this.oslcCmxNs,
				oslc_pl: this.oslcPlNs,
				acc: this.oslcAccNs,
				rtc_cm: this.rtcCmNs,
				process: this.processNs
			}
			
			return nsMapping[key];
		},
		
		/**
		 * Crée et attache un élément XML de type RESSOURCE (avec rdf:resource).
		 * @param {XMLDocument} xmlDoc Le document XML.
		 * @param {Element} desc Le nœud parent (rdf:Description).
		 * @param {string} nsUri L'URI du namespace de l'élément (ex: this.rtcCmNs).
		 * @param {string} name Le nom qualifié de l'élément (ex: "rtc_cm:filedAgainst").
		 * @param {string} value L'URI de la ressource.
		 */
		
		_addResourceElement: function(xmlDoc, desc, nsUri, name, value) {
		    if (!value) return; // Sortir si la valeur est vide

		    var element = xmlDoc.createElementNS(nsUri, name);
		    // Utilisation de l'URI RDF (this.rdfNs) pour l'attribut rdf:resource
		    element.setAttributeNS(this.rdfNs, "rdf:resource", value);
		    desc.appendChild(element);
		},
		
		/**
		 * Crée et attache un élément XML de type LITTÉRAL (avec textContent).
		 * @param {XMLDocument} xmlDoc Le document XML.
		 * @param {Element} desc Le nœud parent (rdf:Description).
		 * @param {string} nsUri L'URI du namespace de l'élément (ex: this.dctermsNs).
		 * @param {string} name Le nom qualifié de l'élément (ex: "dcterms:title").
		 * @param {string} value Le contenu textuel.
		 * @param {string} [dataType] L'URI de rdf:datatype (ex: "http://www.w3.org/2001/XMLSchema#string").
		 */
		_addLiteralElement: function(xmlDoc, desc, nsUri, name, value, dataType) {
		    if (!value) return; // Sortir si la valeur est vide

		    var element = xmlDoc.createElementNS(nsUri, name);
		    element.textContent = value;
		    
		    if (dataType) {
		        // Ajoute l'attribut rdf:datatype si spécifié (utile pour les tags/sujets)
		        element.setAttributeNS(this.rdfNs, "rdf:datatype", dataType);
		    } else if (name === "dcterms:title") {
		        // Ajout spécifique pour le titre (généralement requis par EWM/OSLC)
		        element.setAttributeNS(this.rdfNs, "rdf:parseType", "Literal");
		    }
		    
		    desc.appendChild(element);
		}
		
		
		
    };
});
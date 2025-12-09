/**
 * UpdateWorkitem.js
 * Module de service Dojo pour la mise à jour d'un Work Item via OSLC/PUT.
 */

define([
	"./XhrHelpers"
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
			var data = dataToUpdate.data;
			var url = dataToUpdate.url;
			
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

			root.appendChild(desc);
			
			if (data["Filed Against"]) {
				var filedAgainstElement = xmlDoc.createElementNS(this.rtcCmNs, "rtc_cm:filedAgainst");
				filedAgainstElement.setAttributeNS(this.rdfNs, "rdf:resource", data["Filed Against"]);
				desc.appendChild(filedAgainstElement);
			}
					
			if (data["Found In"]) {
				var foundInElement = xmlDoc.createElementNS(this.rtcCmNs, "rtc_cm:foundIn");
				foundInElement.setAttributeNS(this.rdfNs, "rdf:resource", data["Found In"]);
				desc.appendChild(foundInElement);
			}
			
			if (data["Owned By"]) {
				var ownedByElement = xmlDoc.createElementNS(this.dctermsNs, "dcterms:contributor");
				ownedByElement.setAttributeNS(this.rdfNs, "rdf:resource", data["Owned By"]);
				ownedByElement.removeAttributeNS("http://www.w3.org/2000/xmlns/", "dcterms"); 
				// ownedByElement.removeAttribute("xmlns:dcterms");	
				desc.appendChild(ownedByElement);
			}
			
			if (data["State"]) {
				url = url + "?_action=" + data["State"];
			}
			var xmlString = new XMLSerializer().serializeToString(xmlDoc);
			console.log(xmlString);
            
            return {data: xmlString, url: url };
        }
    };
});
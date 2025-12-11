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
			
				
			// Champs Littéraux (TEXTE)
			this._addLiteralElement(xmlDoc, desc, this.dctermsNs, "dcterms:title", data["Summary"] );
			// Gérer les Tags (Littéral avec un type de données XSD)
			// Le contenu doit être déjà joint avec ", " si c'est une liste
			this._addLiteralElement(xmlDoc, desc, this.dctermsNs, "dcterms:subject", data["Tags"], "http://www.w3.org/2001/XMLSchema#string");
			// Champs Ressources (LIENS / URI)
			this._addResourceElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:filedAgainst", data["Filed Against"]);

			this._addResourceElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:foundIn", data["Found In"]	);

			this._addResourceElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:plannedFor", data["Planned For"] );

			this._addResourceElement(xmlDoc, desc, this.dctermsNs, "dcterms:contributor", data["Owned By"] );

			this._addResourceElement(xmlDoc, desc, this.oslcCmxNs, "oslc_cmx:severity", data["Severity"] );

			this._addResourceElement(xmlDoc, desc, this.oslcCmxNs, "oslc_cmx:priority", data["Priority"] );
			
			this._addResourceElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:resolution", data["Resolution"] );
			//<rtc_cm:resolution rdf:resource="https://jazz-server:9443/ccm/oslc/workflows/_pG5nILDqEfC38tEFCAkmbQ/resolutions/com.ibm.team.workitem.defectWorkflow/3"/>
			
			this._addResourceElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:resolution", data["Resolution"] );

			this._addLiteralElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:timeSpent", data["Durée"], "http://www.w3.org/2001/XMLSchema#integer");
			this._addLiteralElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:estimate", data["Estimate"], "http://www.w3.org/2001/XMLSchema#integer");
			this._addLiteralElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:correctedEstimate", data["Time Spent"], "http://www.w3.org/2001/XMLSchema#integer");
			
			this._addLiteralElement(xmlDoc, desc, this.rtcCmNs, "rtc_cm:due", data["Due Date"], "http://www.w3.org/2001/XMLSchema#dateTime");


									
			// --- Traitement spécial pour l'action de transition (inchangé) ---
			if (data["State"]) {
			    // Si la transition change, on modifie l'URL, pas le XML
			    url = url + "?_action=" + data["State"];
			}
			var xmlString = new XMLSerializer().serializeToString(xmlDoc);
			console.log(xmlString);
            
            return {data: xmlString, url: url };
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
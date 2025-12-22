/**
 * @Author Lukas Steiger
 * @Author Sany Maamari
 * @Copyright (c) 2017, 2025, Siemens AG, Syncheo
 */
define([
        "dojo/_base/declare",
        "dojo/Deferred"
], function(declare, Deferred) {
	var XhrHelper = declare("com.siemens.bt.jazz.utils.xhr", null, {

		xhr: function(method, args, hasBody) {
			/* globals jazz: false */
        	return jazz.client.xhr(method, args, hasBody);
		},
		

		oslcRequest: function(method, url, accept, handleAs) {
			return this.xhr(method, {
        		url: url,            		
        		headers: {
        			"OSLC-Core-Version": "2.0",
        			"Accept": accept
        		},
        	    handleAs: handleAs
        	}, false);
		},
		
		oslcJsonGetRequest: function(url) {
			return this.oslcRequest("GET", url, "application/json", "json");
		},
				

		oslcXmlGetRequest: function(url) {
			return this.oslcRequest("GET", url, "application/xml", "xml");
		},
		
		oslcRequestGetEtag: function(url) {
		    var d = new Deferred();

		    this.xhr("GET", {
		        url: url,
		        handleAs: "text",
		        headers: {
		            "Accept": "application/rdf+xml",
		            "OSLC-Core-Version": "2.0"
		        },
		        load: function(data, ioArgs) {
		            var xhr = ioArgs.xhr;
		            var etag = xhr.getResponseHeader("ETag");
					etag = etag.replace(/^"|"$/g, '');
		            d.resolve({ etag: etag, data: data });
		        },
		        error: function(err, ioArgs) {
		            var xhr = ioArgs.xhr;
		            var etag = xhr ? xhr.getResponseHeader("ETag") : null;
		            d.reject({ error: err, etag: etag });
		        }
		    }, false);

		    return d.promise;
		},
		
		oslcPutWithEtag: function(url, rdfXmlPayload) {
		    var self = this;

		    return this.oslcRequestGetEtag(url)
		        .then(function(result) {
		            var etag = result.etag;
		            console.log("ETag :", etag);

		            var putHeaders = {
		                "Accept": "application/rdf+xml",
		                "OSLC-Core-Version": "2.0",
		                "Content-Type": "application/rdf+xml"
		            };

		            if (etag) {
		                putHeaders["If-Match"] = etag;
		            }

					console.log(rdfXmlPayload);
		            return self.xhr("PUT", {
		                url: url,
		                postData: rdfXmlPayload,
		                headers: putHeaders,
						handleAs: "xml" // ✅ Ajout de handleAs: "xml"
		            }, true);
		        }, function(error) {
					// Erreur GET
					console.error("Erreur lors du GET pour récupérer le ETag :", error);
					throw error;
				})
		        .then(function(putResponse) {
		            console.log("Sauvegarde OSLC réussie !");
		            return putResponse;
		        }, function(error) {
		            var status = error.status || (error.xhr && error.xhr.status);

		            if (status === 412) {
		                console.error("Erreur 412 : Work Item modifié par un autre utilisateur.");
		            } else {
		                console.error("Erreur OSLC :", status, error.responseText);
		            }
		            throw error;
		        });
		}
		
	});
	// create singleton
	return new XhrHelper();
});
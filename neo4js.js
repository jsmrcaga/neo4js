/******TODO IMPORTANT********

	-	Make node from attribute, but is more display than code	
*****************************/

var neo4js = {};


neo4js.config ={
	URL : "http://localhost:7474/db/data/"
}

neo4js.getNode = function(nodeNumber, callback){
	if (typeof nodeNumber == 'undefined'){
		throw new Error("nodeNumber is required in getNode");
	}

 	var params = {
	 	url : neo4js.config.URL + "node/" + nodeNumber,
	 	method: "GET",
	 	callback : callback, 
	 	status : 200
	};

	AJAXCall(params);
};


neo4js.createNode = function(dataToNode) {
	if(typeof dataToNode == 'undefined' || typeof dataToNode != 'object') {
		throw new Error("CreateNode needs data to create node, in a JavaScript object");
	}

	dataToNode = JSON.stringify(dataToNode);
	var params = {
		url : neo4js.config.URL + "node",
		data : dataToNode, //dataToNode JSON string
		method: "POST",
		status: 201,
		callback : function(data){
			console.log("Node Created");
		}
	};

	AJAXCall(params);
};

neo4js.modifyNode = function(node, attributes){

	if(typeof node == 'undefined' || (typeof attributes == 'undefined' || typeof attributes != 'object' )) {
		throw new Error("Node ID and Attributes (JS Object) are required to modifyNode");
	}

	var dataToChange = JSON.stringify(attributes);
	var params = {
		url: neo4js.config.URL + "node/" + node + "/properties",
		method: "PUT",
		status: 204,
		data: dataToChange,
		callback: function(){
			console.log("Node Modified");
		}
	};

	AJAXCall(params);
};

neo4js.updateNode = function(node, attributes){
	if(typeof node == 'undefined' || typeof attributes == 'undefined' || typeof attributes != 'object') {
		throw new Error("Node ID and attributes (as JS object) are required to updateNode");
	}

	neo4js.getNode(node, function(dataNode){
		dataNode = JSON.parse(dataNode);
		var nodeProps =  dataNode.data;

		for (var key in attributes){
			nodeProps[key] = attributes[key];
		}
		neo4js.modifyNode(node, nodeProps);
	});

};

neo4js.getRelationships = function(node, callback) {
	if (typeof node == 'undefined'){
		throw new Error("Node is needed to get relationships");
	}

	var params = {
		url: neo4js.config.URL + "node/"+node+"/relationships/all", 
		method: "GET",
		status: 200,
		callback : callback
	};

	AJAXCall(params);
};

neo4js.addLabel = function(node, label) {
	if(typeof node == 'undefined' || typeof label == 'undefined'){
		throw new Error("Parameters node(int) and label(string) are required for addLabel");
	}

	var params = {
		url: neo4js.config.URL + 'node/' + node + '/labels',
		method: "POST", 
		data : JSON.stringify(label),
		status: 204, 
		callback : function(){
			console.log("label Added");
		}
	};
	AJAXCall(params);
};

neo4js.deleteNodeSecure = function(node){
	if (typeof node == 'undefined'){
		throw new Error("Node ID is required to delete");
	}
	var params = {
		method: "DELETE",
		url : neo4js.config.URL + "node/" + node,
		status: 204,
		callback : function(){
			console.log("Node DELETED");
			return "DELETED";
		}
	};

	AJAXCall(params);
};

neo4js.deleteNode = function(node) {
	//verify relationships
	neo4js.getNode(node, function(nodeData){
		var parsedNode = JSON.parse(nodeData);
		//outgoing
		var params = {
			url: parsedNode.outgoing_relationships,
			method: "GET",
			async: false,
			status: 200,
			callback: function(relations){
				var rels = JSON.parse(relations);
				if (rels.length != 0){
					console.log("Have to delete "+ rels.length + " relationships, starting NOW");
					for (var i=0; i<rels.length; i++){
						console.log("Deleting relationship: ",rels[i].metadata.id);
						neo4js.deleteRelationshipSync(rels[i].metadata.id);
					}
				}
			}
		};

		AJAXCall(params);
		
		//incoming
		params.url = parsedNode.incoming_relationships;
	
		AJAXCall(params);
		
		neo4js.deleteNodeSecure(node);
	});

};

neo4js.deleteProperty = function(node, propertyName){
	if(typeof propertyName == 'undefined' || typeof node == 'undefined') {
		throw new Error("Node and Property Name is needed to delete it (duh)");
	}

	var params = {
		url: neo4js.config.URL + "node/" + node + "/properties/" + propertyName,
		method: "DELETE",
		status: 204,
		callback: function() {
			console.log("Property Deleted");
		}
	};

	AJAXCall(params);
};

neo4js.deleteAllProperties = function(node){
	if(typeof node == 'undefined') {
		throw new Error("Node is required to delete all properties from it");
	}

	var params= {
		method: "DELETE",
		url: neo4js.config.URL + "node/" + node + "/properties",
		status: 204,
		callback: function(){
			console.log("Deleted all properties from node: " + node);
		}
	};

	AJAXCall(params);
};

neo4js.deleteRelationship = function(relation) {
	if(typeof relation == 'undefined') {
		throw new Error("Relationship ID is required to delete relationship");
	}

	var params = {
		url :"http://localhost:7474/db/data/relationship/"+relation,
		method: "DELETE",
		status: 204,
		callback:  function(data){
			console.log("Relationship " + relation + " deleted");
			return "DELETED";
		}
	};

	AJAXCall(params);
};

neo4js.deleteRelationshipSync = function(relation) {
	//to use with delete node
	if(typeof relation == 'undefined') {
		throw new Error("Relationship ID is required to delete relationship");
	}

	var params = {
		url :"http://localhost:7474/db/data/relationship/"+relation,
		method: "DELETE",
		async: false,
		status: 204,
		callback:  function(data){
			console.log("Relationship " + relation + " deleted");
			return "DELETED";
		}
	};

	AJAXCall(params);
};

neo4js.createRelationship = function(from_node, to_node, type) {
	if(typeof from_node == 'undefined' || typeof to_node == 'undefined' || typeof type == 'undefined'){
		throw new Error("Params (int)from, (int)to and (string)type are required");
	}

	var params = {
		url: neo4js.config.URL + "node/"+from_node+"/relationships",
		method: "POST",
		status: 201,
		data: '{"to": neo4js.config.URL + "node/'+to_node+'", "type": "'+type+'"}',
		callback :function(){
			console.log("Relationship Created");
		}
	};

	AJAXCall(params);
};

neo4js.cypherQuery = function(query, callback, params) {
	if (typeof query == 'undefined'){
		throw new Error("Query is required for cypherQuery");
	}

	var data;
	if (typeof params != 'undefined'){
		data = {
			query: query,
			params: params
		};
	}else{
		data = {
			query: query,
			params: {}
		};
	}

	data = JSON.stringify(data);

	var aParams = {
		method: "POST",
		url: neo4js.config.URL +"cypher",
		status: 200,
		data: data,
		callback: callback
	};

	AJAXCall(aParams);
};

neo4js.getShortestPath = function(n1, n2, usrData, callback) {
	/*GET SHORTEST PATH
		Must experiment TODO:
			- find if "relationships" is required in data
			- find if relationship type and direction can be ignored
			- find if max_depth can be ignored
	*/
	// data = {max_depth / relationships = {to / direction} } 
	//EXAMPLE: getShortestPath(9,0, {unique: false, max_depth: 3 , relationType: "isSubordinate", relationDir: "out"}, function(res){console.log(res);})
	if (typeof n1 == 'undefined' || typeof n2 == 'undefined' || typeof usrData == 'undefined'){
		throw new Error("Node numbers and data are required to find shortest path");
	}
	if(typeof usrData.unique == 'undefined'){
		var unique = false;	
	}else{
		var unique = usrData.unique; 
	}

	var pathURL = (unique) ? "/path" : "/paths";

	var data = {
		to : neo4js.config.URL + "node/"+ n2,
		max_depth : usrData.max_depth,
		relationships : {
			type : usrData.relationType,
			direction : usrData.relationDir
		},
		algorithm: "shortestPath"
	};

	data = JSON.stringify(data);

	var params = {
		url: neo4js.config.URL + "node/"+n1+pathURL,
		method : "POST",
		status: 200,
		data: data,
		callback: callback
	};

	AJAXCall(params);
};

neo4js.getDegree = function(nodeNb, callback, direction, types) {
	if (typeof nodeNb == 'undefined') throw new Error("Node number is required for getDegree");

	var urlEnd = (typeof direction == 'undefined') ? "/all" : "/" + direction + "/";
	if (typeof direction != 'undefined' && typeof types != 'undefined'){
		for (var i = 0; i< types.length; i++){
			urlEnd += types[i] + "&";
		}
		urlEnd = urlEnd.substring(0, urlEnd.length-1);
	}

	var params = {
		url: neo4js.config.URL + "node/"+nodeNb+"/degree" + urlEnd,
		method: "GET",
		status:200,
		callback: callback
	};

	AJAXCall(params);
};

neo4js.commitTransaction = function(query, callback, props) {
	//Not working : 415 Unsupported media type
	if(typeof query == 'undefined') {
		throw new Error("Query is required for commitTransaction");
	}
	var data="";
	if(typeof props == 'undefined') {
		data = {
				statements : [ {
					statement : query,
					} ]
				}
	}else{
		data = {
				statements : [ {
				  	statement : query,
				  	parameters : {
				    	props : props
				    }
				  } ]
				}
	}
	
	console.log("Data:", JSON.stringify(data));
	var params = {
		url: neo4js.config.URL + "transaction/commit",
		method: "POST",
		status: 200,
		callback: callback,
		data: JSON.stringify(data)
	};

	AJAXCall(params);
};


/**************************************
			AJAX Call Function
			Optimised for Neo4j
**************************************/

function AJAXCall (params){
	//params = url, method, callback, data, async, status
	if (typeof params == 'undefined'){
		throw new Error("Parameters are required");
	}

	if (typeof params.url == 'undefined'){
		throw new Error("URL is required for AJAXCall");
	}

	if (typeof params.method == 'undefined' || (params.method != "GET" && params.method != "POST" && params.method != "DELETE" && params.method != "PUT")){
		throw new Error("method for AJAXCall is required and must be GET, POST, DELETE or PUT only");
	}

	if (typeof params.status == 'undefined'){
		throw new Error("Status (200, 201, 204...) is required for callback");
	}

	var xml = new XMLHttpRequest();
	xml.onreadystatechange = function(){
		if (xml.readyState == 4 && xml.status == params.status){
			if (typeof params.callback != 'undefined') params.callback(xml.responseText);
			return xml.responseText;
		}
	};

	var async;
	if (typeof params.async != 'undefined'){
		async = params.async;
	}else{
		async = true;
	}

	if (params.method == "GET" || params.method == "DELETE"){

		if (typeof params.data == 'undefined'){
			xml.open(params.method, params.url, async);
			xml.send();
		}else{
			var url = (params.url.substring(params.url.length-1, params.url.length) == "/")? "?" : "/?";
			for (var key in params.data){
				url += key + "=" + params.data[key] + "&";
			}
			url = url.substring(0,url.length-1);
			params.url += url;
			xml.open(params.method, params.url, async);
			xml.send();
		}

	}else if(params.method == "POST" || params.method == "PUT"){
		xml.open(params.method, params.url, async);
		if (typeof params.data != 'undefined'){
			xml.send(params.data);
		}else{
			xml.send();
		}
	}
}
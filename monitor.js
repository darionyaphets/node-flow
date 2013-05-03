var Collector = require("./server.js");

var EventEmitter = require('events').EventEmitter;
var radium = new EventEmitter();
var addrssFlows = {};

var Db = require("mongodb").Db;
var MongoClient = require("mongodb").MongoClient;
var Server = require("mongodb").Server;

var client;

var mongoclient = new MongoClient(new Server("localhost", 27017), {
	native_parser : true
});

mongoclient.open(function(err, mongoclient) {
	var db = mongoclient.db("test");
	client = db.collection("collection");
});

var x = new Collector(function(err) {
}).on("listening", function() {
	console.log("listening");
})

.on("packet", function(packets) {
	if (packets instanceof Array) {
		for ( var index = 0; index < packets.length; index++) {
			var packet = packets[index];
			// console.log(packet);
			var source_address = packet.srcaddr;
			var target_address = packet.dstaddr;
			var link = packet.nexthop;
			var key = link + ":" + source_address + ":" + target_address;

			if (addrssFlows[key] == null) {
				addrssFlows[key] = packet['dPkts'];
			} else {
				var value = addrssFlows[key];
				addrssFlows[key] = packet['dPkts'] + value;
			}
		}
	}
}).listen(9996);

setInterval(function() {
	for ( var flow in addrssFlows) {
		var address_array = flow.split(':');
		var link = address_array[0];
		var source_address = address_array[1];
		var target_address = address_array[2];

		var date = new Date(new Date().getTime());

		var timestamp = date.getFullYear() + '-' + date.getMonth() + '-'
				+ date.getDate() + ' ' + date.getHours() + ":"
				+ date.getMinutes();

		client.insert({
			'link' : link,
			'source' : source_address,
			'target' : target_address,
			'packages' : addrssFlows[flow],
			'timestamp' : timestamp
		}, function(err, result) {
			if (err == null) {
				console.log('insert into test.collection');
			}
		});
	}
}, 1000 * 60);
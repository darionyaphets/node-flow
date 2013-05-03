var parser = require("./package_parser.js");
var dgram = require("dgram");
var events = require("events");
var sys = require('util');

var server = function() {
	var eventContext = this;
	this.server = dgram.createSocket("udp4");
	events.EventEmitter.call(this);

	this.server.on("message", function(mesg, rinfo) {
		try {
			var netflow = new parser(mesg);
			this.emit.call(eventContext, "packet", netflow);
		} catch (err) {
			this.emit.call(eventContext, "error", err);
		}
	});

	this.server.on("listening", this.emit.bind(this, "listening"));
	this.listen = function(port) {
		this.server.bind(port);
	};
};

sys.inherits(Netflow, events.EventEmitter);
module.exports = server;
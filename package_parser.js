var package_parser = function(message) {
	var offset;
	var flow;

	if (message.length <= 11) {
		return;
	}

	var buffer = new Buffer(message);
	this.header = {};

	var version = buffer.readUInt16BE(0);
	if (version != 5)
		return;

	this.header.version = version;
	this.header.count = buffer.readUInt16BE(2);
	this.header.sys_uptime = buffer.readUInt32BE(4);
	this.header.unix_secs = buffer.readUInt32BE(8);

	if (this.header.version == 5) {

		if (msg.length > 23) {
			this.header.unix_nsecs = buffer.readUInt32BE(12);
			this.header.flow_sequence = buffer.readUInt32BE(16);
			this.header.engine_type = buffer.readUInt8(20);
			this.header.engine_id = buffer.readUInt8(21);
			this.header.sampling_interval = buffer.readUInt16BE(22);
		} else {
			throw new Error("Packet is " + msg.length
					+ " bytes long, too short to be a netflow version 5 packet");
		}

		var packages = [];
		for ( var index = 0; index < this.header.count; index++) {
			offset = 24 + (index * 48);

			if ((msg.length - offset) > 47) {

				flow = {};

				var src_address = "";
				var tag_address = "";
				var next_hop = "";

				src_address = buffer.readUInt8(offset).toString() + ".";
				src_address += buffer.readUInt8(offset + 1).toString() + '.';
				src_address += buffer.readUInt8(offset + 2).toString() + '.';
				src_address += buffer.readUInt8(offset + 3).toString();
				flow['srcaddr'] = src_address;

				tag_address = buffer.readUInt8(offset + 4).toString() + ".";
				tag_address += buffer.readUInt8(offset + 5).toString() + ".";
				tag_address += buffer.readUInt8(offset + 6).toString() + ".";
				tag_address += buffer.readUInt8(offset + 7).toString();
				flow['dstaddr'] = tag_address;

				next_hop = buffer.readUInt8(offset + 8).toString() + ".";
				next_hop += buffer.readUInt8(offset + 9).toString() + ".";
				next_hop += buffer.readUInt8(offset + 10).toString() + ".";
				next_hop += buffer.readUInt8(offset + 11).toString();
				flow['nexthop'] = next_hop;

				flow['dPkts'] = buffer.readUInt32BE(offset + 16);
				flow['count'] = buffer.readUInt32BE(offset + 20);

				// flow.input = buffer.readUInt16BE(offset + 12);
				// flow.output = buffer.readUInt16BE(offset + 14);
				// flow.first = buffer.readUInt32BE(offset + 24);
				// flow.last = buffer.readUInt32BE(offset + 28);
				// flow.srcport = buffer.readUInt16BE(offset + 32);
				// flow.dstport = buffer.readUInt16BE(offset + 34);
				// flow.pad1 = buffer.readUInt8(offset + 36);
				// flow.tcp_flags = buffer.readUInt8(offset + 37);
				// flow.prot = buffer.readUInt8(offset + 38);
				// flow.tos = buffer.readUInt8(offset + 39);
				// flow.src_as = buffer.readUInt16BE(offset + 40);
				// flow.dst_as = buffer.readUInt16BE(offset + 42);
				// flow.src_mask = buffer.readUInt8(offset + 44);
				// flow.dst_mask = buffer.readUInt8(offset + 45);
				packages[index] = flow;
			}
		}
		return packages;

	}
};

module.exports = package_parser;
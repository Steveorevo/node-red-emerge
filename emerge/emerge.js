module.exports = function(RED) {
    function emerge(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = "emerge";
            node.send(msg);
        });
    }
    RED.nodes.registerType('emerge', emerge);
}
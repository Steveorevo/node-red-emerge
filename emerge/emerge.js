module.exports = function(RED) {
    function emerge(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg, send, done) {

            // Merge the incoming msg into msgBuffer
            let nodeContext = node.context();
            let msgBuffer = nodeContext.get('msgBuffer');
            if (msgBuffer == undefined) {
                msgBuffer = {};
            }
            Object.assign(msgBuffer, msg);
            nodeContext.set('msgBuffer', msgBuffer);
            
            // Check if all rules are valid
            let rulePass = false;
            for (let i = 0; i < config.grpRules.length; i++) {
                let r = config.grpRules[i];
                let flowContext = node.context().flow;
                let globalContext = node.context().global;
                
                // Get the property value to compare
                let rulePropertyValue = null;
                switch(r.rulePropertyType) {
                    case "msg":
                        rulePropertyValue = msgBuffer[r.ruleProperty];
                        break;
                    case "flow":
                        rulePropertyValue = flowContext.get(r.ruleProperty);
                        break;
                    case "global":
                        rulePropertyValue = globalContext.get(r.ruleProperty);
                        break;
                }

                // Get the comparative rule value
                let ruleCompareValue = null;
                switch(r.ruleValueType) {
                    case "msg":
                        ruleCompareValue = msgBuffer[r.ruleValue];
                        break;
                    case "flow":
                        ruleCompareValue = flowContext.get(r.ruleValue);
                        break;
                    case "global":
                        ruleCompareValue = globalContext.get(r.ruleValue);
                        break;
                    case "str":
                        ruleCompareValue = r.ruleValue;
                        break;
                    case "num":
                        ruleCompareValue = Number(r.ruleValue);
                        break;
                    case "bool":
                        ruleCompareValue = (r.ruleValue == 'true');
                        break;
                }

                // Do the comparative logic
                rulePass = false;
                switch(r.ruleOperation) {
                    case "==":
                        if (rulePropertyValue == ruleCompareValue) rulePass = true;
                        break;
                    case "!=":
                        if (rulePropertyValue != ruleCompareValue) rulePass = true;
                        break;
                    case "gt":
                        if (rulePropertyValue > ruleCompareValue) rulePass = true;
                        break;
                    case "lt":
                        if (rulePropertyValue < ruleCompareValue) rulePass = true;
                        break;
                    case "empty":
                        if (!rulePropertyValue) rulePass = true;
                        break;
                    case "!empty":
                        if (rulePropertyValue) rulePass = true;
                        break;
                    case "sz=":
                        if (rulePropertyValue.length == Number(ruleCompareValue)) rulePass = true;
                        break;
                    case "szgt":
                        if (rulePropertyValue.length > Number(ruleCompareValue)) rulePass = true;
                        break;
                    case "szlt":
                        if (rulePropertyValue.length < Number(ruleCompareValue)) rulePass = true;
                        break;
                }
                
                // Check if rules have failed
                if (rulePass == false ) break;
            }

            // Reset any timeout on msg arrival 
            let msgTimeout = nodeContext.get('msgTimeout');
            if (config.timeoutAction != 0) {
                if (msgTimeout != undefined) {
                    clearTimeout(msgTimeout);
                }
                msgTimeout = setTimeout(function () {
                    msg = msgBuffer;
                    nodeContext.set('msgBuffer', {});
                    if (config.timeoutAction == 2) {
                        done(msg);
                    }
                }, config.rulesTimeout * 1000);
                nodeContext.set('msgTimeout', msgTimeout);
            }

            // Send msg on its way
            if (rulePass) {
                if (msgTimeout != undefined) {
                    clearTimeout(msgTimeout);
                }
                msg = msgBuffer;
                nodeContext.set('msgBuffer', {});
                send(msg);
            }
        });
        node.on('close', function () {
            // Clean up any remaining timeout 
            let nodeContext = node.context();
            let msgTimeout = nodeContext.get('msgTimeout');
            if (msgTimeout != undefined) {
                clearTimeout(msgTimeout);
            }
        });
        
                
    }
    RED.nodes.registerType('emerge', emerge);
}
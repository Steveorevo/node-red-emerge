module.exports = function(RED) {
    function emerge(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Access nested objects
        const getNestedObject = (nestedObj, pathArr) => {
            return pathArr.split('.').reduce((obj, key) =>
                (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
        }
        
        // String manipulation functions
        String.prototype.delLeftMost = function (sFind) {
            for (var i = 0; i < this.length; i = i + 1) {
                var f = this.indexOf(sFind, i);
                if (f != -1) {
                    return this.substring(f + sFind.length, f + sFind.length + this.length);
                    break;
                }
            }
            return this;
        };
        String.prototype.getLeftMost = function (sFind) {
            for (var i = 0; i < this.length; i = i + 1) {
                var f = this.indexOf(sFind, i);
                if (f != -1) {
                    return this.substring(0, f);
                    break;
                }
            }
            return this;
        };

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
            if (config.grpRules == undefined) return;
            for (let i = 0; i < config.grpRules.length; i++) {
                let r = config.grpRules[i];
                let flowContext = node.context().flow;
                let globalContext = node.context().global;
                rulePass = false;
                
                // Get the property value to compare
                let rulePropertyValue = null;
                switch(r.rulePropertyType) {
                    case "msg":
                        rulePropertyValue = getNestedObject(msgBuffer, r.ruleProperty);
                        break;
                    case "flow":
                        if (r.ruleProperty.indexOf(".") == -1) {
                            rulePropertyValue = flowContext.get(r.ruleProperty);
                        }else{
                            let parent = r.ruleProperty.getLeftMost('.');
                            let offspring = r.ruleProperty.delLeftMost('.');
                            rulePropertyValue = flowContext.get(parent);
                            rulePropertyValue = getNestedObject(rulePropertyValue, offspring);
                        }
                        break;
                    case "global":
                        if (r.ruleProperty.indexOf(".") == -1) {
                            rulePropertyValue = globalContext.get(r.ruleProperty);
                        } else {
                            let parent = r.ruleProperty.getLeftMost('.');
                            let offspring = r.ruleProperty.delLeftMost('.');
                            rulePropertyValue = globalContext.get(parent);
                            rulePropertyValue = getNestedObject(rulePropertyValue, offspring);
                        }
                        break;
                }
                if (rulePropertyValue == undefined) break;

                // Get the comparative rule value
                let ruleCompareValue = null;
                switch(r.ruleValueType) {
                    case "msg":
                        ruleCompareValue = getNestedObject(msgBuffer, r.ruleValue);
                        break;
                    case "flow":
                        if (r.ruleValue.indexOf(".") == -1) {
                            ruleCompareValue = flowContext.get(r.ruleValue);
                        }else{
                            let parent = r.ruleValue.getLeftMost('.');
                            let offspring = r.ruleValue.delLeftMost('.');
                            ruleCompareValue = flowContext.get(parent);
                            ruleCompareValue = getNestedObject(ruleCompareValue, offspring);
                        }
                        break;
                    case "global":
                        if (r.ruleValue.indexOf(".") == -1) {
                            ruleCompareValue = globalContext.get(r.ruleValue);
                        } else {
                            let parent = r.ruleValue.getLeftMost('.');
                            let offspring = r.ruleValue.delLeftMost('.');
                            ruleCompareValue = globalContext.get(parent);
                            ruleCompareValue = getNestedObject(ruleCompareValue, offspring);
                        }
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
                if (ruleCompareValue == undefined) break;

                // Do the comparative logic
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
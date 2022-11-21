# node-red-contrib-emerge
The emerge node merges incoming msg objects into an internal buffer until all matching predefined rules have been met. The merged buffer msg then 'emerges' (is sent) to the output when all rules have been satisfied. The internal buffer is then cleared to await the assembly of a new merged buffer msg object. An optional timeout can be thrown to invoke a catch node. 

### Use case scenario
Often times we need to submit a msg to a node with various properties present and filled out; these properties may come from various asynchronous and parallel flow segments. Counting messages and waiting to gather all these values into a single msg can be a burden. The emerge node can simplify that burden be combining msgs until all the needed properties are present and/or meet the conditional requirements before passing the message along. 

### How to install
You can install emerge via [Node-RED's built in palette manager](https://nodered.org/docs/user-guide/editor/palette/manager) and searching for @Steveorevo/node-red-emerge

or 

Run the following command in your Node-RED user directory (typically ~/.node-red):

    npm install @Steveorevo/node-red-emerge

The emerge node will appear in the palette under the sequence group.

### Building
The emerge node was built using the same author's [Node-Maker](https://github.com/steveorevo/node-maker) project. Included in this repo is the node-maker.json file containing the flow needed to build emerge. Simply import this flow into Node-RED and click the associated inject button. The current version of node-red-emerge folder will appear in your Node-RED's node_modules folder. 

#### Support the creator
You can help Steveorevo's open source development endeavors by donating any amount. Your donation, no matter how large or small helps pay for his time and resources to create MIT and GPL licensed projects that you and the world can benefit from. Click the link below to donate today :)
<div>
         

[<kbd> <br> Donate to this Project <br> </kbd>][KBD]


</div>


<!---------------------------------------------------------------------------->

[KBD]: https://www.paypal.com/pools/c/8P4HVTZiH2

https://www.paypal.com/pools/c/8P4HVTZiH2

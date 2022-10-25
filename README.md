# node-red-contrib-emerge
A node that merges msg objects until all defined properties are present / conditions are met before passing the combined msg along.

Often times we need to submit a msg to a node with various properties present and filled out; these properties may come from various asynchronous and parallel flow segments. Counting messages and waiting to gather all these values into a single msg can be a burden. The emerge node can simplify that burden be combining msgs until all the needed properties are present and/or meet the conditional requirements before passing the message along. The internal buffer is then cleared to await the assembly of a new message object. An optional timeout can be thrown to invoke a catch node or second output. 

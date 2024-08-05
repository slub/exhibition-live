---
to: _templates/<%= name %>/<%= action || 'new' %>/prompt.js
---

// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
module.exports = [
  {
    type: 'input',
    name: 'message',
    message: "Name of the sub package"
    initial: "@slub/edb-"
  }
]

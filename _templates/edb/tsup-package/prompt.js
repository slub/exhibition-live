// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
module.exports = [
  {
    type: "input",
    name: "name",
    message: "Name of the sub package",
    initial: "@slub/edb-",
  },
  {
    type: "input",
    name: "description",
    message: "Description of the sub package",
  },
];
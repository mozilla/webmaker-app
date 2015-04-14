var React = require('react');
var TextField = require('./TextField.jsx');
var Header = require('./Header.jsx');
var Image = require('./Image.jsx');

var Generator = function(){};

Generator.TEXTFIELD = "textfield";
Generator.HEADER = "header";
Generator.IMAGE = "image";

Generator.generateBlock = function(options) {
  if (options.type === Generator.TEXTFIELD) {
    return <TextField value={options.value} />;
  }
  if (options.type === Generator.HEADER) {
   return <Header value={options.value} />;
  }
  if (options.type === Generator.IMAGE) {
    return <Image src={options.src} alt={options.alt} />;
  }
  return false;
};

Generator.generateDefinition = function(type, options) {
  var def = JSON.parse(JSON.stringify(options));
  def.type = type;
  return def;
};

module.exports = Generator;

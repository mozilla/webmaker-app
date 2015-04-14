var React = require('react');
var render = require('../../lib/render.jsx');
var Positionable = require('react-positionable-component');
var Generator = require('./blocks/generator.js');

var Three = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      content: []
    };
  },

  render: function () {
    var positionables = this.formPositionables(this.state.content);
    return (<div className="blockedit">
      <p>Let's try some stuff eh?</p>
      <div className="controls">
        <button onClick={this.loadFromString}>Load...</button>
        <button onClick={this.saveToString}>Save...</button>
        <button onClick={this.addHeader}>Header</button>
        <button onClick={this.addText}>Text</button>
        <button onClick={this.addImage}>Image</button>
      </div>
      <div className="positionables">
        {positionables}
      </div>
    </div>);
  },

  formPositionables: function(content) {
    return content.map(m => {
      var element = Generator.generateBlock(m);
      var positionable = <Positionable clickHandler={this.clickHandler}>{element}</Positionable>;
      return <div>{positionable}</div>;
    });
  },

  clickHandler: function(positionable) {
    positionable.toggle();
  },

  append: function(obj) {
    this.setState({
      content: this.state.content.concat([obj])
    });
  },

  addHeader: function() {
    this.append(Generator.generateDefinition(Generator.HEADER, {
      value: "this is a header"
    }));
  },

  addText: function() {
    this.append(Generator.generateDefinition(Generator.TEXTFIELD, {
      value: "This is text"
    }));
  },

  addImage: function() {
    this.append(Generator.generateDefinition(Generator.IMAGE, {
      src: "https://farm4.staticflickr.com/3609/3567927108_8300f83fab_b.jpg",
      alt: "This is an image"
    }));
  },

  save: function() {
    return JSON.stringify(this.state.content);
  },

  saveToString: function() {
    prompt("Content data:", this.save())
  },

  load: function(content) {
    this.setState({
      content: content
    }, function() {
      console.log("restored state");
    });
  },

  loadFromString: function() {
    var data = prompt("Content data:");
    try {
      var content = JSON.parse(data);
      this.load(content);
    } catch (e) {
      alert("could not parse data as JSON");
    }
  }
});

// Render!
render(Three);

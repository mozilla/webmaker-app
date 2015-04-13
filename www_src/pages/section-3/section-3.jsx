var React = require('react');
var render = require('../../lib/render.jsx');
var Positionable = require('react-positionable-component');

var Header = require('./Header.jsx');
var TextField = require('./TextField.jsx');
var Image = require('./Image.jsx');

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
      var element;
      if(m.type==="text")  { element = <TextField value={m.value} />; }
      if(m.type==="header"){ element = <Header value={m.value} />; }
      if(m.type==="image") { element = <Image src={m.src} alt={m.alt} />; }
      return <div><Positionable>{element}</Positionable></div>;
    });
  },

  append: function(obj) {
    this.setState({
      content: this.state.content.concat([obj])
    });
  },

  addHeader: function() {
    this.append({
      type: "header",
      value: "This is a header"
    });
  },

  addText: function() {
    this.append({
      type: "text",
      value: "This is text"
    });
  },

  addImage: function() {
    this.append({
      type: "image",
      src: "https://farm4.staticflickr.com/3609/3567927108_8300f83fab_b.jpg",
      alt: "This is an image"
    });
  }
});

// Render!
render(Three);

var React = require('react');
var render = require('../../lib/render.jsx');
var classNames = require('classnames');

var fakeBlocks = [];
for (var i = 0; i < 50; i++) {
  fakeBlocks.push(i);
}

var Tile = React.createClass({
  render: function () {
    return (<div className="project-tile" onClick={this.props.onClick}>
      {this.props.text}
    </div>);
  }
});

var Three = React.createClass({
  getInitialState: function () {
    return {
      zoom: 1
    };
  },
  zoom: function () {
    this.setState({
      zoom: this.state.zoom === 1 ? 2 : 1
    });
  },
  componentDidMount: function () {
    window.scrollTo(window.innerWidth / 2, window.innerHeight / 2);
  },
  render: function () {
    var gridTransform = {
      transform: 'scale(' + this.state.zoom + ')',
      WebkitTransform: 'scale(' + this.state.zoom + ')'
    }
    var buttonMenuClass = {
      'button-menu': true,
      'on': this.state.zoom === 2
    };
    return <div>
      <div className="panner" style={gridTransform}>
        {fakeBlocks.map(block => <Tile text="Hello!" onClick={this.zoom} />)}
      </div>
      <div className={classNames(buttonMenuClass)}>
        <button>Add</button>
      </div>
    </div>
  }
});

// Render!
render(Three);

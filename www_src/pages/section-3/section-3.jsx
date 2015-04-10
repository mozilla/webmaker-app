var React = require('react');
var render = require('../../lib/render.jsx');

var fakeBlocks = [];
for (var i = 0; i < 50; i++) {
  fakeBlocks.push(i);
}

var Tile = React.createClass({
  render: function () {
    return (<div className="project-tile">
      {this.props.text}
    </div>);
  }
});

var Three = React.createClass({
  getInitialState: function () {
    return {};
  },
  componentDidMount: function () {
    this.setState({
      scrollX: window.innerWidth / 2,
      scrollY: window.innerHeight / 2
    });
  },
  render: function () {
    window.scrollTo(this.state.scrollX, this.state.scrollY);
    return <div className="panner">
      {fakeBlocks.map(block => <Tile text={block} />)}
    </div>
  }
});

// Render!
render(Three);

var React = require('react');
var render = require('../../lib/render.jsx');
var classNames = require('classnames');
var scrollTo = require('scroll-to');

var fakeBlocks = [];
for (var i = 0; i < 50; i++) {
  fakeBlocks.push(i);
}

var rows = [];
rows[0] = [0, 2];
rows[1] = [0, 1, 3, 7,8];
rows[2] = [1, 3];

function makeRow(indexes) {
  var output = [];
  var lastIndex = indexes[indexes.length - 1];
  for (var i = indexes[0] - 1; i <= lastIndex + 1; i++) {
    if (indexes.indexOf(i) === -1) {
      output.push('x');
    } else {
      output.push(i);
    }
  }
  return output;
}

console.log(makeRow(rows[1]))

var CanvasText = React.createClass({
  getDefaultProps: function () {
    return {
      text: 'Hello world',
      fontSize: 15,
      fontFamily: 'Fira Sans'
    };
  },
  draw: function () {
    var c = this.getDOMNode();
    var ctx = c.getContext('2d');
    var ratio = window.devicePixelRatio || 1;
    c.width = 150 * ratio * 2;
    c.height = 100 * ratio * 2;
    c.style.width = '150px';
    c.style.height = '100px';
    ctx.scale(ratio, ratio);
    ctx.textAlign = 'center';
    ctx.font = `normal normal 300 ${this.props.fontSize * 2}pt ${this.props.fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.fillText(this.props.text, 150, 1);
  },
  componentDidMount: function () {
   this.draw();
  },
  componentDidUpdate: function () {
    this.draw();
  },
  render: function () {
    return (<canvas className="canvas-text" />);
  }
});

var Tile = React.createClass({
  render: function () {
    return (<div className="project-tile" onClick={this.props.onClick}>
      <p>{this.props.text}</p>
    </div>);
  }
});

var Three = React.createClass({
  getInitialState: function () {
    return {
      zoom: 1,
      origin: '50% 50%'
    };
  },
  zoom: function (ref) {
    return () => {
      var tileEl = this.refs[ref].getDOMNode();
      var originLeft = tileEl.offsetLeft + tileEl.clientWidth/2;
      var originTop = tileEl.offsetTop + tileEl.clientHeight/2;

      //window.scrollTo(originLeft - window.innerWidth/2, originTop - window.innerHeight/2);
      scrollTo(originLeft - window.innerWidth/2, originTop - window.innerHeight/2, {
        ease: 'inOutQuad',
        duration: 200
      });
      this.setState({
        zoom: this.state.zoom === 1 ? 2 : 1,
        origin: `${originLeft}px ${originTop}px`
      });
    };
  },
  componentWillMount: function () {
    scrollTo(window.innerWidth/2, window.innerHeight/2);
  },
  render: function () {
    var gridTransform = {
      transform: 'scale(' + this.state.zoom + ')',
      WebkitTransform: 'scale(' + this.state.zoom + ')',
      transformOrigin: this.state.origin,
      WebkitTransformOrigin: this.state.origin
    };
    var buttonMenuClass = {
      'button-menu': true,
      'on': this.state.zoom === 2
    };
    return <div>
      <div className="panner" style={gridTransform}>
        {fakeBlocks.map((block, i) => <Tile text={'Hello ' + block} ref={'tile-' + i} onClick={this.zoom('tile-' + i)} />)}
      </div>
      <div className={classNames(buttonMenuClass)}>
        <button>Add</button>
      </div>
    </div>
  }
});

// Render!
render(Three);

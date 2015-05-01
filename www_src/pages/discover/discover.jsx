var React = require('react/addons');
var api = require('../../lib/api.js');
var render = require('../../lib/render.jsx');
var Link = require('../../components/link/link.jsx');

var Discover = React.createClass({
  mixins: [],
  getInitialState: function () {
    this.list = require('./mock.json');

    return {
      list: this.list,
      offset: 0,
      limit: 10,
      locale: {
        language: 'en',
        country: 'us'
      }
    };
  },
  render: function () {
    var cards = [];
    var project = null;
    
    for (var i = 0; i < this.state.list.length; i++) {
      project = this.state.list[i];
      console.dir(project.thumbnail[480]);
      cards.push(
        <Link url="/map/123" href="/pages/map" key={project.id} className="card">
          <div className="thumbnail">
            <img src={project.thumbnail[480]} />
          </div>

          <div className="meta">
            <div className="title">{project.title}</div>
            <div className="author">{project.author.username}</div>
          </div>
        </Link>
      );
    }

    return (
      <div id="discover">
        {cards}
      </div>
    );
  }
});

render(Discover);

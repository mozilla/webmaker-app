var api = require('../../lib/api');

function findLandingPage(pages) {
  var result;
  // ... first, try to select 0, 0
  pages.forEach((page) => {
    if (page.coords.x === 0 && page.coords.y === 0) {
      result = page;
    }
  });
  // ... and if it was deleted, select the first page in the array
  return result || pages[0];
}

module.exports = {
  uri: function () {
    return `/users/${this.state.params.user}/projects/${this.state.params.project}/pages`;
  },

  load: function () {
    this.setState({loading: true});
    api({uri: this.uri()}, (err, data) => {

      this.setState({loading: false});

      if (err) {
        console.error('Error loading project', err);
      } else if (!data || !data.pages) {
        console.error('No project found...');
      } else {
        var state = {};
        var pages = this.formatPages(data.pages);

        // Set cartesian coordinates
        this.cartesian.allCoords = pages.map(el => el.coords);

        state.pages = pages;

        var landingPage = findLandingPage(pages);
        var focusTransform = this.cartesian.getFocusTransform(landingPage.coords, this.state.zoom);

        if (this.state.params.mode === 'edit' && !this.state.selectedEl) {
          state.selectedEl = landingPage.id;
          state.camera = focusTransform;
        } else if (typeof this.state.camera.x === 'undefined') {
          state.camera = focusTransform;
        }

        this.setState(state);

        // Highlight the source page if you're in link destination mode
        if (this.state.params.mode === 'link') {
          if (window.Android) {
            this.highlightPage(this.state.routeData.pageID, 'source');
          }
        }
      }
    });
  },
};

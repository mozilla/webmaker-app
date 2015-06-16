var React = require('react/addons');
var assign = require('react/lib/Object.assign');
var {SecondaryButton} = require('../../components/action-menu/action-menu.jsx');

module.exports = {
  getContainerStyle: function() {
    return {
      width: this.cartesian.width + 'px',
      height: this.cartesian.height + 'px'
    };
  },

  getBoundingStyle: function() {
    return assign({
        transform: `translate(${this.state.camera.x || 0}px, ${this.state.camera.y || 0}px) scale(${this.state.zoom})`,
        opacity: this.state.pages.length ? 1 : 0
      },
      this.cartesian.getBoundingSize()
    );
  },

  getPageURL: function(params, selectedEl) {
    return `/users/${params.user}/projects/${params.project}/pages/${selectedEl}`;
  },

  generateAddContainers: function(isPlayOnly) {
    if (isPlayOnly) {
      return false;
    }

    return this.cartesian.edges.map(coords => {
      return (<div className="page-container add" style={{transform: this.cartesian.getTransform(coords)}} onClick={this.addPage(coords)}>
        <img className="icon" src="../../img/plus.svg" />
      </div>);
    });
  },

  getRemovePageButton: function(isPlayOnly) {
    if (this.state.pages.length <= 1) {
      return false;
    }
    return <SecondaryButton side="left" off={isPlayOnly || !this.state.selectedEl} onClick={this.removePage} icon="../../img/trash.svg" />;
  }
};

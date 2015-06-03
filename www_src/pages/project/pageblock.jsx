var React = require('react/addons');
var classNames = require('classnames');
var ElementGroup = require('../../components/element-group/element-group.jsx');

/**
 * This is the component used in the Project view that draws pages as
 * a "simple page representation" rather than the detailed representation
 * you get when you navigate to the Page view.
 */
var PageBlock = React.createClass({

  render: function() {
    var classes = classNames('page-container', {
      selected: this.props.selected,
      unselected: this.props.unselected,
      source: this.props.source,
      target: this.props.target
    });

    var style = {
      backgroundColor: this.props.page.styles.backgroundColor,
      transform: this.props.transform
    };

    // The "shim" and "indicator" divs don't actually house any content,
    // suggesting that either they are intended to be empty, or they will
    // be hooked into later, in which case we have failed to uphold React
    // practices and reverted to traditional HTML work, which would be bad.
    return (<div className={classes} style={style} onClick={this.props.onClick}>
      <div className="shim">
        <div className="indicator"/>
      </div>
      <ElementGroup elements={this.props.page.elements} />
    </div>);
  }
});

module.exports = PageBlock;

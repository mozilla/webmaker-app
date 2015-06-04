// TODO: rename this file to .js, since it's a Mixin, not a react component

module.exports = {
  android: window.Android,
  getRouteParams: function () {
    var params = {};

    if (this.android) {
      // Check to see if route params exist & create cache key
      var routeParams = this.android.getRouteParams();
      var key = 'route::params';

      // If they do, save them. If not, fetch from storage
      if (routeParams !== '{}') {
        params = JSON.parse(routeParams);
        this.android.setMemStorage(key, routeParams);
      } else {
        var hit = this.android.getMemStorage(key);
        try {
          params = JSON.parse(hit);
        } catch (e) {}
      }
    } else {
      params = {
        mode: 'play', // 'edit', 'play', 'link'
        user: 1,
        project: 1,
        page: 1,
        element: 1
      };
    }

    return params;
  },
  getRouteData: function () {
    var data = {};

    if (this.android) {
      var routeData = this.android.getRouteData();
      if (typeof routeData !== 'undefined') {
        data = JSON.parse(routeData);
      }
    }

    return data;
  },
  getInitialState: function () {
    return {
      params: this.getRouteParams(),
      routeData: this.getRouteData()
    };
  }
};

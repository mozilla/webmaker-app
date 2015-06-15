module.exports = {
  componentDidMount: function() {
    // Handle remix calls from Android wrapper
    window.createRemix = () => {
      var uri = `/users/${this.state.params.user}/projects/${this.state.params.project}/remixes`;

      // Duplicate project via API call
      api({
        method: 'post',
        uri: uri
      }, (err, data) => {
        if (err) {
          return console.error('Error remixing project', err);
        }

        var projectID = data.project.id;
        var projectTitle = data.project.title;

        // Get author's username
        api({
          method: 'GET',
          uri: `/users/${this.state.params.user}/projects/${this.state.params.project}`
        }, (err, moreData) => {
          if (err) {
            return console.error('Error remixing project', err);
          }

          if (window.Android) {
            window.Android.setView(
              `/users/${this.state.user.id}/projects/${projectID}`,
              JSON.stringify({
                isFreshRemix: true,
                title: projectTitle,
                originalAuthor: moreData.project.author.username
              })
            );
          }
        });
      });
    };

    if (this.android && this.state.routeData.isFreshRemix) {
      // Notify user that THIS IS A REEEEEEMIXXXXX
      dispatcher.fire('modal-confirm:show', {
        config: {
          header: 'Project Remix',
          body: `This is your copy of ${this.state.routeData.title}. You can add or change anything. The original will stay the same. Have fun!`,
          attribution: this.state.routeData.originalAuthor,
          icon: 'tinker.png',
          buttonText: 'OK, got it!'
        }
      });

      // Prepend "Remix of..." to project name

      var remixTitle = this.state.routeData.title;

      if (!remixTitle.match(/^Remix of/)) {
        remixTitle = 'Remix of ' + remixTitle;
      }

      api({
        method: 'PATCH',
        uri: `/users/${this.state.user.id}/projects/${this.state.params.project}`,
        json: {
          title: remixTitle
        }
      }, function (err, body) {
        if (err) {
          console.error('Could not update project settings.');
        }
      });
    }
  }
};

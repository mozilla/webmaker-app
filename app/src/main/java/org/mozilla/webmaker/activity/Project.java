package org.mozilla.webmaker.activity;

import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import org.json.JSONException;
import org.mozilla.webmaker.R;
import org.mozilla.webmaker.WebmakerActivity;
import org.mozilla.webmaker.router.Router;
import org.mozilla.webmaker.util.Share;

public class Project extends WebmakerActivity {
    public Project() {
        super("project", R.id.project_layout, R.layout.project_layout, R.menu.menu_project);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        try {
            routeParams.put("mode", "edit");
        } catch (JSONException e) {
            // do nothing
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(menuResId, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Fetch project ID
        String id;
        try {
            id = routeParams.get("project").toString();
        } catch (JSONException e) {
            return super.onOptionsItemSelected(item);
        }

        // Handle button press
        switch (item.getItemId()) {
            case R.id.action_play:
                Router.sharedRouter().open("/projects/" + id + "/play");
                return true;
            case R.id.action_settings:
                Router.sharedRouter().open("/projects/" + id + "/settings");
                return true;
            case R.id.action_share:
                final String url = getString(R.string.share_url).concat(id);
                Share.launchShareIntent(url, this);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}

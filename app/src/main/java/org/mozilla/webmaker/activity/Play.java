package org.mozilla.webmaker.activity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.webmaker.R;
import org.mozilla.webmaker.WebmakerActivity;
import org.mozilla.webmaker.router.SimpleRouter;
import org.mozilla.webmaker.web.javascript.WebAppInterface;
import org.mozilla.webmaker.util.Share;

public class Play extends WebmakerActivity {
    public Play() {
        super("project", R.id.page_layout, R.layout.page_layout, R.menu.menu_play);
    }

    protected String sessionId;
    protected String projectAuthor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        /**
         * Get the id of the logged in user from the sharedPreferences as well as the id of the
         * maker of the app. These strings are later compared to give an 'edit' button to the
         * app creator.
         **/
        try {
            SharedPreferences userSession = getSharedPreferences(WebAppInterface.USER_SESSION_KEY, 0);
            JSONObject session = new JSONObject(userSession.getString("session", ""));

            sessionId = session.getJSONObject("user").get("id").toString();
            projectAuthor = routeParams.get("user").toString();
        } catch (JSONException e) {
            // Do nothing.
        }

        // Set "mode" in route params
        try {
            routeParams.put("mode", "play");
        } catch (JSONException e) {
            // do nothing
        }

        // Get data from deep link (if available)
        Intent intent = getIntent();
        Uri data = intent.getData();

        // Set route params if valid deep link
        if (data == null) return;
        projectAuthor = data.getQueryParameter("user");
        final String project = data.getQueryParameter("project");

        if (projectAuthor == null || project == null) return;
        try {
            routeParams.put("user", projectAuthor);
            routeParams.put("project", project);
        } catch (JSONException e) {
            // do nothing
        }
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        MenuItem editItem = menu.findItem(R.id.action_edit);

        if (editItem == null || sessionId == null) return true;

        if (projectAuthor.equals(sessionId)) {
            editItem.setVisible(true);
        }

        return true;
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
        String userId;
        try {
            id = routeParams.get("project").toString();
            userId = routeParams.get("user").toString();
        } catch (JSONException e) {
            return super.onOptionsItemSelected(item);
        }

        // Handle button press
        switch (item.getItemId()) {
            case R.id.action_share:
                //Share.launchShareIntent(userId, id, this);
                return true;
            case R.id.action_remix:
                view.load("javascript: window.createRemix && window.createRemix()", null);
                return true;
            case R.id.action_edit:
                SimpleRouter.getSharedRouter().call("/users/" + userId + "/projects/" + id);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}

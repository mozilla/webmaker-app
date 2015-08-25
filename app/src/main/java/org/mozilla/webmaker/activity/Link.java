package org.mozilla.webmaker.activity;

import android.os.Bundle;

import org.json.JSONException;
import org.mozilla.webmaker.R;
import org.mozilla.webmaker.WebmakerActivity;

public class Link extends WebmakerActivity {
    public Link() {
        super("project", R.id.page_layout, R.layout.page_layout, R.menu.menu_page);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            routeParams.put("mode", "link");
        } catch (JSONException e) {
            // do nothing
        }
    }
}

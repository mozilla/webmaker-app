package org.mozilla.webmaker;

import android.app.ActionBar;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.ViewConfiguration;
import android.widget.RelativeLayout;

import org.json.JSONException;
import org.json.JSONObject;

import org.mozilla.webmaker.view.WebmakerWebView;

import java.lang.reflect.Field;

public class WebmakerActivity extends BaseActivity {

    public WebmakerWebView view;
    protected JSONObject routeParams;
    protected String pageName;
    protected int id, layoutResID, menuResId;
    protected boolean mIsRestart = false;

    public WebmakerActivity(String pageName, int id, int layoutResID, int menuResId) {
        this.pageName = pageName;
        this.id = id;
        this.layoutResID = layoutResID;
        this.menuResId = menuResId;
    }

    /**
     * Extracts route information from intent extras & Adds {@link org.mozilla.webmaker.view.WebmakerWebView} to layout.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        routeParams = new JSONObject();

        Bundle intentExtras = getIntent().getExtras();
        if (intentExtras != null) {
            try {
                routeParams.put("user", intentExtras.get("user"));
                routeParams.put("project", intentExtras.get("project"));
                routeParams.put("page", intentExtras.get("page"));
                routeParams.put("element", intentExtras.get("element"));
                routeParams.put("propertyName", intentExtras.get("propertyName"));
                routeParams.put("editor", intentExtras.get("editor"));
                routeParams.put("mode", intentExtras.get("mode"));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        ActionBar actionBar = getActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setIcon(android.R.color.transparent);
        }

        try {
            ViewConfiguration config = ViewConfiguration.get(this);
            Field menuKeyField = ViewConfiguration.class.getDeclaredField("sHasPermanentMenuKey");
            if (menuKeyField != null) {
                menuKeyField.setAccessible(true);
                menuKeyField.setBoolean(config, false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        setContentView(layoutResID);
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onRestart() {
        mIsRestart = true;
        super.onRestart();
    }

    @Override
    protected void onStart() {
        if (!mIsRestart) {
            view = new WebmakerWebView(this, this, pageName, routeParams);
            RelativeLayout layout = (RelativeLayout) findViewById(id);
            layout.addView(view);
        }

        super.onStart();
    }

    @Override
    public void onBackPressed() {
        view.load("javascript: window.jsComm && window.jsComm('onBackPressed')", null);
    }

    @Override
    protected void onResume() {
        view.load("javascript: window.jsComm && window.jsComm('onResume')", null);
        super.onResume();
    }

    @Override
    protected void onPause() {
        view.load("javascript: window.jsComm && window.jsComm('onPause')", null);
        super.onPause();
    }

    @Override
    public void onDestroy() {
        if (view != null) {
            view.onDestroy();
            view = null;
        }
        super.onDestroy();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch(item.getItemId()) {
            case android.R.id.home:
                onBackPressed();
                return true;
        }
        return super.onOptionsItemSelected(item);
    }
}

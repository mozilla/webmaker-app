package org.mozilla.webmaker.javascript;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.google.android.gms.analytics.HitBuilders;

import org.json.JSONObject;
import org.mozilla.webmaker.BaseActivity;
import org.mozilla.webmaker.BuildConfig;
import org.mozilla.webmaker.WebmakerApplication;
import org.mozilla.webmaker.activity.Element;
import org.mozilla.webmaker.router.Router;
import org.mozilla.webmaker.storage.MemStorage;
import org.xwalk.core.JavascriptInterface;

public class WebAppInterface {

    protected Context mContext;
    protected BaseActivity mActivity;
    protected SharedPreferences mPrefs;
    protected JSONObject mRoute;
    protected String mPrefKey;
    protected String mPageState;

    public static final String SHARED_PREFIX = "prefs::".concat(BuildConfig.VERSION_NAME);
    public static final String ROUTE_KEY = "route::data";

    public WebAppInterface(Context context) {
        this(context, null);
    }

    public WebAppInterface(Context context, JSONObject routeParams) {
        mContext = context;
        mActivity = (BaseActivity) context;
        mPrefKey = "::".concat(mContext.getClass().getSimpleName());
        mPrefs = mContext.getSharedPreferences(mPrefKey, 0);
        mRoute = routeParams;
        Log.v("wm", "getting state " + mPrefKey + ": " + mPageState);
    }

    /**
     * ---------------------------------------
     * Disk-based Storage
     * ---------------------------------------
     */

    @JavascriptInterface
    public String getSharedPreferences(String key) {
        return getSharedPreferences(key, false);
    }

    @JavascriptInterface
    public String getSharedPreferences(String key, final boolean global) {
        SharedPreferences getter = mContext.getSharedPreferences(SHARED_PREFIX, 0);
        if (!global) key = key.concat(mPrefKey);
        return getter.getString(key, null);
    }

    @JavascriptInterface
    public void setSharedPreferences(String key, final String value) {
        setSharedPreferences(key, value, false);
    }

    @JavascriptInterface
    public void setSharedPreferences(String key, final String value, final boolean global) {
        SharedPreferences.Editor editor = mContext.getSharedPreferences(SHARED_PREFIX, 0).edit();
        if (!global) key = key.concat(mPrefKey);
        editor.putString(key, value);
        editor.apply();
    }

    /**
     * ---------------------------------------
     * Memory-based Storage
     * ---------------------------------------
     */

    @JavascriptInterface
    public String getMemStorage(String key) {
        return getMemStorage(key, false);
    }

    @JavascriptInterface
    public String getMemStorage(String key, final boolean global) {
        if (!global) key = key.concat(mPrefKey);
        return MemStorage.sharedStorage().get(key);
    }

    @JavascriptInterface
    public void setMemStorage(String key, final String value) {
        setMemStorage(key, value, false);
    }

    @JavascriptInterface
    public void setMemStorage(String key, final String value, final boolean global) {
        if (!global) key = key.concat(mPrefKey);
        MemStorage.sharedStorage().put(key, value);
    }

    /**
     * ---------------------------------------
     * Camera
     * ---------------------------------------
     */
    @JavascriptInterface
    public void getFromCamera() {
        Element elementActivity = (Element) mContext;
        if (elementActivity != null) {
            elementActivity.dispatchCameraIntent();
        }
    }

    @JavascriptInterface
    public void getFromMedia() {
        Element elementActivity = (Element) mContext;
        if (elementActivity != null) {
            elementActivity.dispatchMediaIntent();
        }
    }

    /**
     * ---------------------------------------
     * Back Button
     * ---------------------------------------
     */

    @JavascriptInterface
    public void goBack() {
        mActivity.runOnUiThread(new Runnable() {
            public void run() {
                mActivity.goBack();
            }
        });
    }

    /**
     * ---------------------------------------
     * Router
     * ---------------------------------------
     */

    @JavascriptInterface
    public void setView(final String url) {
        setView(url, null);
    }

    @JavascriptInterface
    public void setView(final String url, final String routeData) {
        Activity activity = (Activity) mContext;
        if (activity == null) return;

        if (routeData != null) {
            MemStorage.sharedStorage().put(ROUTE_KEY, routeData);
        }

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Router.sharedRouter().open(url);
            }
        });
    }

    /**
     * ---------------------------------------
     * Router Bindings
     * ---------------------------------------
     */

    @JavascriptInterface
    public String getRouteParams() {
        if (mRoute == null) return "";
        return mRoute.toString();
    }

    @JavascriptInterface
    public String getRouteData() {
        return MemStorage.sharedStorage().get(ROUTE_KEY);
    }

    /**
     * ----------------------------------------
     * Google Analytics
     * ----------------------------------------
     */

    /**
     * Sends a event to Google Analytics without the optional value param
     * @param category The name you supply for the group of objects you want to track.
     * @param action Used to define the type of user interaction for the web object.
     * @param label Used to provide additional information about the event that was fired.
     */
    @JavascriptInterface
    public void trackEvent(String category, String action, String label) {
        WebmakerApplication.getTracker().send(new HitBuilders.EventBuilder()
                .setCategory(category).setAction(action).setLabel(label).build());
    }

    /**
     * Sends a event to Google Analytics with the optional value param
     * @param category The name you supply for the group of objects you want to track.
     * @param action Used to define the type of user interaction for the web object.
     * @param label Used to provide additional information about the event that was fired.
     * @param value Allows you to provide numerical data about the user event that was fired.
     */
    @JavascriptInterface
    public void trackEvent(String category, String action, String label, long value) {
        WebmakerApplication.getTracker().send(new HitBuilders.EventBuilder()
                .setCategory(category).setAction(action).setLabel(label).setValue(value).build());
    }
}
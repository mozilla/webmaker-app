package org.mozilla.webmaker.web.javascript;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.util.Log;

import com.google.android.gms.analytics.HitBuilders;

import org.json.JSONObject;
import org.mozilla.webmaker.BaseActivity;
import org.mozilla.webmaker.BuildConfig;
import org.mozilla.webmaker.WebmakerApplication;
import org.mozilla.webmaker.activity.Element;
import org.mozilla.webmaker.router.Router;
import org.mozilla.webmaker.util.Share;
import org.mozilla.webmaker.view.WebmakerWebView;
import org.xwalk.core.JavascriptInterface;

import java.util.Locale;

public class WebAppInterface {

    protected Context mContext;
    protected BaseActivity mActivity;
    protected SharedPreferences mPrefs;
    protected SharedPreferences mUserPrefs;
    protected JSONObject mRoute;
    protected String mPrefKey;
    protected String mPageState;

    protected WebmakerAPI api;

    public static final String SHARED_PREFIX = "prefs::".concat(BuildConfig.VERSION_NAME);
    public static final String ROUTE_KEY = "route::data";
    public static final String USER_SESSION_KEY =  "user::session";

    public WebAppInterface(WebmakerWebView view, Context context) {
        this(view, context, null);
    }

    public WebAppInterface(WebmakerWebView view, Context context, JSONObject routeParams) {
        mContext = context;
        mActivity = (BaseActivity) context;
        mPrefKey = "::".concat(mContext.getClass().getSimpleName());
        mPrefs = mContext.getSharedPreferences(mPrefKey, 0);
        mUserPrefs = mContext.getSharedPreferences(USER_SESSION_KEY, 0);
        mRoute = routeParams;
        api = WebmakerAPI.getInstance();
        api.setView(view);
        api.setActivity(mActivity);
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

    @JavascriptInterface
    public void resetSharedPreferences() {
        mPrefs.edit().clear().commit();
    }

    @JavascriptInterface
    public void setUserSession(String userData) {
        SharedPreferences.Editor editor = mUserPrefs.edit();
        editor.putString("session", userData);
        editor.commit();
    }

    @JavascriptInterface
    public void clearUserSession() {
        SharedPreferences.Editor editor = mUserPrefs.edit();
        editor.clear();
        editor.commit();
    }

    @JavascriptInterface
    public String getUserSession() {
       return mUserPrefs.getString("session", "");
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
        //return MemStorage.sharedStorage().get(key);
        return WebmakerAPI.instance.getPayloads(key);
    }

    @JavascriptInterface
    public void setMemStorage(String key, final String value) {
        setMemStorage(key, value, false);
    }

    @JavascriptInterface
    public void setMemStorage(String key, final String value, final boolean global) {
        if (!global) key = key.concat(mPrefKey);
        //MemStorage.sharedStorage().put(key, value);
        WebmakerAPI.instance.queue(key, value);
    }

    /**
     * ---------------------------------------
     * Camera
     * ---------------------------------------
     */
    @JavascriptInterface
    public boolean cameraIsAvailable() {
        final PackageManager pm = mContext.getPackageManager();
        final boolean front = pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_FRONT);
        final boolean rear = pm.hasSystemFeature(PackageManager.FEATURE_CAMERA);

        return front || rear;
    }

    @JavascriptInterface
    public void getFromCamera() {
        if (cameraIsAvailable()) {
            try {
                Element elementActivity = (Element) mContext;
                if (elementActivity != null) {
                    elementActivity.dispatchCameraIntent();
                }
            } catch (ActivityNotFoundException e) {
                Log.e("CAMERA", "Attempted to dispatch camera intent.");
            }
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
     * Share
     * ---------------------------------------
     */
    @JavascriptInterface
    public void shareProject(String userId, String projectId) {
        Share.launchShareIntent(userId, projectId, mActivity);
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

    @JavascriptInterface
    public void goToHomeScreen() {
        Intent startMain = new Intent(Intent.ACTION_MAIN);
        startMain.addCategory(Intent.CATEGORY_HOME);
        startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        mActivity.startActivity(startMain);
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
            //MemStorage.sharedStorage().put(ROUTE_KEY, routeData);
            WebmakerAPI.instance.queue(ROUTE_KEY, routeData);
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
        //return MemStorage.sharedStorage().get(ROUTE_KEY);
        return WebmakerAPI.instance.getPayloads(ROUTE_KEY);
    }

    @JavascriptInterface
    public void clearRouteData() {
        //MemStorage.sharedStorage().put(ROUTE_KEY, "");
        WebmakerAPI.instance.queue(ROUTE_KEY, "");
    }

    /**
     * ----------------------------------------
     * Google Analytics
     * ----------------------------------------
     */

    @JavascriptInterface
    public void trackEvent(String category, String action, String label) {
        WebmakerApplication.getTracker().send(new HitBuilders.EventBuilder()
                .setCategory(category).setAction(action).setLabel(label).build());
    }

    @JavascriptInterface
    public void trackEvent(String category, String action, String label, long value) {
        WebmakerApplication.getTracker().send(new HitBuilders.EventBuilder()
                .setCategory(category).setAction(action).setLabel(label).setValue(value).build());
    }

    /**
     * ----------------------------------------
     * Open External URL
     * ----------------------------------------
     */
    @JavascriptInterface
    public void openExternalUrl(String url) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        mActivity.startActivity(i);
    }

    /**
     * ----------------------------------------
     * Is Debug Build
     * ----------------------------------------
     */
    @JavascriptInterface
    public boolean isDebugBuild() {
        return BuildConfig.DEBUG;
    }

    /**
     * ----------------------------------------
     * Get a reference to the API class
     * ----------------------------------------
     */
    @JavascriptInterface
    public WebmakerAPI getAPI() { return api; }

    /**
     * ----------------------------------------
     * Get System Locale
     * ----------------------------------------
     */
    @JavascriptInterface
    public String getSystemLanguage() {
        // Change underscores to dashes (The browser uses dashes instead)
        return Locale.getDefault().toString().replace("_", "-");
    }

    /**
     * ----------------------------------------
     * Determine network availability
     * ----------------------------------------
     */
    @JavascriptInterface
    public boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();

        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }

}
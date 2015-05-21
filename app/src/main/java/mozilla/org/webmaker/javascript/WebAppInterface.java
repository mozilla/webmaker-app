package mozilla.org.webmaker.javascript;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONObject;
import org.xwalk.core.JavascriptInterface;

import mozilla.org.webmaker.BaseActivity;
import mozilla.org.webmaker.activity.Element;
import mozilla.org.webmaker.router.Router;

public class WebAppInterface {

    protected Context mContext;
    protected BaseActivity mActivity;
    protected SharedPreferences mPrefs;
    protected JSONObject mRoute;
    protected String mRouteData;
    protected String mPrefKey;
    protected String mPageState;

    public static final String WEBMAKER_PREFS = "WEBMAKER";

    public WebAppInterface(Context context) {
        this(context, null);
    }

    public WebAppInterface(Context context, JSONObject routeParams) {
        mContext = context;
        mActivity = (BaseActivity) context;
        mPrefKey = "::".concat(mContext.getClass().getSimpleName());
        mPrefs = mContext.getSharedPreferences(mPrefKey, 0);
        mPageState = mPrefs.getString("page_state", "{}");
        mRoute = routeParams;
        Log.v("wm", "getting state " + mPrefKey + ": " + mPageState);
    }

    /**
     * ---------------------------------------
     * SharedPreferences
     * ---------------------------------------
     */

    @JavascriptInterface
    public String getSharedPreferences(String key, boolean scope) {
        SharedPreferences getter = mContext.getSharedPreferences(WEBMAKER_PREFS, 0);
        if (scope) {
            key = key.concat(mPrefKey);
        }
        return getter.getString(key, null);
    }

    @JavascriptInterface
    public void setSharedPreferences(String key, String value, boolean scope) {
        SharedPreferences.Editor editor = mContext.getSharedPreferences(WEBMAKER_PREFS, 0).edit();
        if (scope) {
            key = key.concat(mPrefKey);
        }
        editor.putString(key, value);
        editor.apply();
    }

    @JavascriptInterface
    public String getState() {
        return mPrefs.getString("page_state", "{}");
    }

    @JavascriptInterface
    public void setState(String serializedState) {
        SharedPreferences.Editor edit = mPrefs.edit();
        edit.putString("page_state", serializedState);
        edit.apply();
    }

    /**
     * ---------------------------------------
     * Utility
     * ---------------------------------------
     */

    @JavascriptInterface
    public void logText(String txt){
        Log.v("wm", txt);
    }

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
        Activity activity = (Activity) mContext;
        if (activity == null) return;

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Router.sharedRouter().open(url);
            }
        });
    }

    @JavascriptInterface
    public void setView(final String url, final String routeData) {
        Activity activity = (Activity) mContext;
        if (activity == null) return;
        if(routeData != null) this.mRouteData = routeData;

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Router.sharedRouter().open(url);
            }
        });
    }

    @JavascriptInterface
    public String getRouteParams() {
        if (mRoute == null) return "";
        return mRoute.toString();
    }

    @JavascriptInterface
    public String getRouteData() {
        if (mRouteData == null) return "";
        return mRouteData;
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
}
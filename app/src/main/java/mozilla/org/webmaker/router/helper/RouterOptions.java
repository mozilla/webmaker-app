package mozilla.org.webmaker.router.helper;

import android.app.Activity;

import java.util.Map;

/**
 * The class used to determine behavior when opening a URL.
 * If you want to extend Routable to handle things like transition
 * animations or fragments, this class should be augmented.
 */
public class RouterOptions {

    Class<? extends Activity> clazz;
    RouterCallback routerCallback;
    Map<String, String> defaultParams;

    public RouterOptions(Class<? extends Activity> clazz) {
        this.clazz = clazz;
    }

    public RouterOptions(Map<String, String> defaultParams) {
        this.defaultParams = defaultParams;
    }

    public RouterOptions(Map<String, String> defaultParams, Class<? extends Activity> clazz) {
        this.defaultParams = defaultParams;
        this.clazz = clazz;
    }

    public RouterOptions() {}

    public Class<? extends Activity> getOpenClass() {
        return this.clazz;
    }

    public RouterCallback getCallback() {
        return this.routerCallback;
    }

    public void setCallback(RouterCallback routerCallback) {
        this.routerCallback = routerCallback;
    }

    public Map<String, String> getDefaultParams() {
        return this.defaultParams;
    }
}
package mozilla.org.webmaker;

import android.app.Application;
import android.util.Log;

import mozilla.org.webmaker.router.Router;

public class WebmakerApplication extends Application {

    private static WebmakerApplication singleton;

    @Override
    public void onCreate() {
        super.onCreate();
        singleton = this;

        Log.v("[Webmaker]", "Application created.");

        // @todo Google Analytics

        // Router

        Router router = new Router(getApplicationContext());
        router.map("/main", MainActivity.class);
        router.map("/main/:tab", MainActivity.class);

        Router.sharedRouter().setContext(getApplicationContext());
        Router.sharedRouter().map("/main", MainActivity.class);
        Router.sharedRouter().map("/main/:tab", MainActivity.class);

        // @todo Restore state
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
    }

    @Override
    public void onTerminate() {
        super.onTerminate();
    }

    public static WebmakerApplication getInstance() {
        return singleton;
    }
}

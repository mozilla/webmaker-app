package mozilla.org.webmaker;

import android.app.Application;
import android.util.Log;
import mozilla.org.webmaker.Router;

public class WebmakerApplication extends Application {

    // Singleton
    private static WebmakerApplication singleton;
    public WebmakerApplication getInstance(){
        return singleton;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        singleton = this;

        Log.v("[Webmaker]", "Application created.");

        // @todo Google Analytics

        // Router
        Router.sharedRouter().setContext(getApplicationContext());
        Router.sharedRouter().map("/main", MainActivity.class);
        Router.sharedRouter().map("/main/:tab", MainActivity.class);

        // @todo Restore state
    }

    @Override
    public void onLowMemory() {
        Log.v("[Webmaker]", "Low memory warning.");
        super.onLowMemory();
    }

    @Override
    public void onTerminate() {
        Log.v("[Webmaker]", "Application terminated.");
        super.onTerminate();
    }
}

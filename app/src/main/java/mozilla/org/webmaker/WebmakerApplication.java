package mozilla.org.webmaker;

import android.app.Application;
import android.util.Log;
import com.google.android.gms.analytics.GoogleAnalytics;
import com.google.android.gms.analytics.Logger;
import com.google.android.gms.analytics.Tracker;
import mozilla.org.webmaker.Router;

import java.util.HashMap;

public class WebmakerApplication extends Application {

    public GoogleAnalytics mGaInstance;
    public Tracker mGaTracker;

    @Override
    public void onCreate() {
        super.onCreate();
        singleton = this;

        Log.v("[Webmaker]", "Application created.");

        // Google Analytics
        mGaInstance = GoogleAnalytics.getInstance(this);
        mGaTracker = mGaInstance.newTracker(R.xml.global_tracker);

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

    // Singleton
    private static WebmakerApplication singleton;
    public WebmakerApplication getInstance(){
        return singleton;
    }
}

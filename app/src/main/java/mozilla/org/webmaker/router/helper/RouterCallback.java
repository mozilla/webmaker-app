package mozilla.org.webmaker.router.helper;

import java.util.Map;

/**
 * The class used when you want to map a function (given in `run`) to a Router URL.
 */
public abstract class RouterCallback {
    public abstract void run(Map<String, String> params);
}
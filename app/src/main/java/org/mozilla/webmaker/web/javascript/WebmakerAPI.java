package org.mozilla.webmaker.web.javascript;

import org.mozilla.webmaker.BaseActivity;
import org.mozilla.webmaker.view.WebmakerWebView;
import org.xwalk.core.JavascriptInterface;

import java.util.ArrayList;
import java.util.HashMap;

public class WebmakerAPI {

    // used for triggering JS on the main UI thread
    protected WebmakerWebView currentView = null;
    protected BaseActivity currentActivity = null;

    protected Queue queue;

    // Static behaviour
    protected static WebmakerAPI instance = new WebmakerAPI();

    @JavascriptInterface
    public static WebmakerAPI getInstance() {
        return WebmakerAPI.instance;
    }

    // Instance behaviour

    /**
     * Dictionary class for storing arrays of String data tied to specific keys.
     */
    protected class Queue extends HashMap<String, ArrayList<String>> {
        public void queue(String origin, String payload) {
            if (this.get(origin) == null) {
                this.put(origin, new ArrayList<String>());
            }
            this.get(origin).add(payload);
        }

        public int getQueueSize(String origin) {
            ArrayList<String> queue = this.get(origin);
            if (queue == null) return -1;
            return queue.size();
        }

        public String getPayload(String origin, int idx) {
            return this.get(origin).get(idx);
        }

        public void dequeue(String origin, int idx) {
            this.get(origin).remove(idx);
        }
    }

    public WebmakerAPI() {
        queue = new Queue();
    }

    public void setView(WebmakerWebView view) {
        currentView = view;
    }

    public void setActivity(BaseActivity activity) {
        currentActivity = activity;
    }

    @JavascriptInterface
    public void queue(String origin, String data) {
        queue.queue(origin, data);
    }

    /**
     * If we need to iterate over all available queues on
     * the JS side, we need to be able to ask which keys exist.
     * @return JSON serialized array of keys
     */
    @JavascriptInterface
    public String getQueueOrigins() {
        String keys = "";
        for (String s: queue.keySet()) {
            keys += '"' + s + '"' + ',';
        }
        if (!keys.trim().equals("")) {
            keys = keys.substring(0, keys.length() - 1);
        }
        return "[" + keys + "]";
    }

    /**
     * Checks the size of a specific key's queue.
     * @param origin Dictionary key
     * @return int size of the array associated with the key
     */
    @JavascriptInterface
    public int getQueueSize(String origin) {
        return queue.getQueueSize(origin);
    }

    /**
     * Get the array of payloads
     * @param origin the array key
     * @return JSON serialized array of payloads strings
     */
    @JavascriptInterface
    public String getPayloads(String origin) {
        String json = "";
        ArrayList<String> payloads =  queue.get(origin);
        if (payloads == null || payloads.size() == 0) {
           return null;
        }
        for (String s: payloads) {
            json += s + ",";
        }
        json = "[" + json.substring(0, json.length()-1) + "]";
        return json;
    }

    /**
     * Empty an array associated with a specific key
     * @param origin the key for which to clear the array
     */
    @JavascriptInterface
    public void clearPayloads(String origin) {
        ArrayList<String> payloads =  queue.get(origin);
        if (payloads != null) {
            payloads.clear();
        }
    }

    /**
     * Get a single payload from a keyed array
     * @param origin The array's key
     * @param idx the position in the array
     * @return the String data as it was queued
     */
    @JavascriptInterface
    public String getPayload(String origin, int idx) {
        return queue.getPayload(origin, idx);
    }

    /**
     * Remove a specific payload from a keyed array
     * @param origin the array's key
     * @param idx the position at which to remove a payload from the array
     */
    @JavascriptInterface
    public void removePayload(String origin, int idx) {
        queue.dequeue(origin, idx);
    }

    /**
     * Run some arbitrary JavaScript code inside the currently active web view.
     * @param js The JavaScript source code that should be evaluated by the view
     */
    public void runJavaScript(final String js) {
        // Not exposed to JS, because it used for internal JAVA -> JS bridging
        currentActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                currentView.evaluateJavascript(js, null);
            }
        });
    }
}

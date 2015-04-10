package mozilla.org.webmaker.fragment;

import android.annotation.SuppressLint;
import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.view.animation.Animation;
import android.view.animation.AlphaAnimation;
import android.view.animation.DecelerateInterpolator;
import mozilla.org.webmaker.R;
import android.util.Log;
import android.content.Context;

@SuppressLint("SetJavaScriptEnabled")
public class WebviewFragment extends Fragment {

    /**
     * The fragment argument representing the section number for this fragment.
     */
    private static final String ARG_SECTION_NUMBER = "section_number";
    private WebView mWebView;

    /**
     * Returns a new instance of this fragment for the given section number.
     */
    public static WebviewFragment newInstance(int sectionNumber) {
        WebviewFragment fragment = new WebviewFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_SECTION_NUMBER, sectionNumber);
        fragment.setArguments(args);
        return fragment;
    }

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void logText(String txt){
            Log.v("wm", txt);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View mView = inflater.inflate(R.layout.fragment_main, container, false);
        String sectionId;

        mView.setId(View.generateViewId());
        sectionId = Integer.toString(super.getArguments().getInt(ARG_SECTION_NUMBER));

        mWebView = (WebView) mView.findViewById(R.id.activity_main_webview);
        mWebView.getSettings().setJavaScriptEnabled(true);
        mWebView.getSettings().setBuiltInZoomControls(true);
        mWebView.getSettings().setDisplayZoomControls(false);
        mWebView.setWebViewClient(new WebClient());
        mWebView.loadUrl("file:///android_asset/www/pages/section-" + sectionId + "/index.html");
        mWebView.setBackgroundColor(0x00000000);
        mWebView.addJavascriptInterface(new WebAppInterface(mView.getContext()), "Android");
        mWebView.setWebContentsDebuggingEnabled(true);

        return mView;
    }

    @Override
    public void onDestroyView() {
        mWebView.destroy();
        mWebView = null;
        super.onDestroyView();
    }

    private void animate(final WebView view) {
        Animation fadeIn = new AlphaAnimation(0, 1);
        fadeIn.setInterpolator(new DecelerateInterpolator()); //add this
        fadeIn.setDuration(1000);
        view.startAnimation(fadeIn);
    }

    private class WebClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.setVisibility(View.GONE);
            return false;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            animate(view);
            view.setVisibility(View.VISIBLE);
            super.onPageFinished(view, url);
        }

    }
}

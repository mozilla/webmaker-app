package org.mozilla.webmaker.util;

import android.app.Activity;
import android.content.Intent;
import org.mozilla.webmaker.R;

public class Share {

    /**
     * Launches a share intent.
     *
     * @param url URL to be appended to the share body
     * @param activity Base activity
     */
    public static void launchShareIntent(final String url, final Activity activity) {
        final Intent shareIntent = new Intent(android.content.Intent.ACTION_SEND);
        final String shareSubject = activity.getString(R.string.share_subject);
        final String shareBody = activity.getString(R.string.share_body).concat(" " + url);

        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, shareSubject);
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareBody);

        activity.startActivity(Intent.createChooser(shareIntent, "Share"));
    }
}

package org.mozilla.webmaker.util;

import android.app.Activity;
import android.content.Intent;

import com.google.android.gms.analytics.HitBuilders;

import org.mozilla.webmaker.R;
import org.mozilla.webmaker.WebmakerApplication;

public class Share {

    /**
     * Launches a share intent.
     *
     * @param userId The user id of the share project intent.
     * @param projectId The project id of the share project intent.
     * @param activity Base activity
     */
    public static void launchShareIntent(final String userId, final String projectId, final Activity activity) {
        WebmakerApplication.getTracker().send(new HitBuilders.EventBuilder()
            .setCategory("Share").setAction("Share Intent").setLabel("Send Share Intent to OS").build());

        final Intent shareIntent = new Intent(android.content.Intent.ACTION_SEND);
        final String shareSubject = activity.getString(R.string.share_subject);
        final String url = activity.getString(R.string.share_url) + "/users/" + userId + "/projects/" + projectId;
        final String shareBody = activity.getString(R.string.share_body).concat(" " + url);

        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, shareSubject);
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareBody);

        activity.startActivity(Intent.createChooser(shareIntent, "Share"));
    }
}

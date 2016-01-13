package org.mozilla.webmaker.util;

import com.google.android.gms.analytics.HitBuilders;
import android.app.Activity;
import android.content.Intent;
import org.mozilla.webmaker.R;
import org.mozilla.webmaker.WebmakerApplication;

public class Share {

    /**
     * Launches a new share {@link Intent}.
     * @param userId Numeric id of the user whose project we want to share.
     * @param projectId Numeric id of the project we want to share.
     * @param projectAuthor Username of the user whose project we want to share.
     * @param projectTitle Title of the project we want to share.
     * @param activity Instance of {@link Activity} to use to launch the {@link Intent}.
     */
    public static void launchIntent(final String userId, final String projectId, final String projectAuthor, final String projectTitle, final Activity activity) {
        WebmakerApplication.getTracker().send(new HitBuilders.EventBuilder()
                .setCategory("Share").setAction("Share Intent").setLabel("Send Share Intent to OS").build());
        final String url = activity.getString(R.string.share_url) + "/users/" + userId + "/projects/" + projectId;
        final String shareBody = activity.getString(R.string.share_body, projectTitle, projectAuthor).concat(" " + url);
        final Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, activity.getString(R.string.share_subject));
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareBody);
        activity.startActivity(Intent.createChooser(shareIntent, "Share"));
    }
}

package org.mozilla.webmaker.activity;

import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Environment;
import android.util.Log;

import java.io.File;
import java.util.UUID;

import org.mozilla.webmaker.R;
import org.mozilla.webmaker.WebmakerActivity;
import org.mozilla.webmaker.util.Image;

public class Element extends WebmakerActivity {

    public String mUuid = UUID.randomUUID().toString();
    public File mFile = new File(Environment.getExternalStorageDirectory() + File.separator + mUuid + ".jpg");
    protected final int CAMERA_REQUEST_CODE = 1888;
    protected final int MEDIA_REQUEST_CODE = 1889;

    public Element() {
        super("element", R.id.element_layout, R.layout.element_layout, R.menu.menu_element);
    }

    /**
     * Dispatches a new image capture intent.
     */
    public void dispatchCameraIntent() {
        Intent intent = Image.getCameraIntent(mFile);
        startActivityForResult(intent, CAMERA_REQUEST_CODE);
    }

    /**
     * Dispatches a new media gallery intent.
     */
    public void dispatchMediaIntent() {
        Intent intent = Image.getMediaStoreIntent(mFile);
        startActivityForResult(intent, MEDIA_REQUEST_CODE);
    }

    /**
     * Result handler for the image capture activity.
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        Bitmap bitmap = null;

        // Return if user exited without capturing / selecting an image
        if (resultCode == 0) return;

        // Handle camera activity
        if (requestCode == CAMERA_REQUEST_CODE) {
            bitmap = Image.decodeBitmapFromFile(mFile.getAbsolutePath(), 200, 200);
        }

        // Handle media (gallery) activity
        if (requestCode == MEDIA_REQUEST_CODE) {
            bitmap = Image.decodeBitmapFromMediaStore(data.getData(), 600, this);
        }

        // @todo Handle error
        if (bitmap == null) {
            Log.e("DATAURI:ERROR", "Bitmap is null");
            return;
        }

        // Convert bitmap to data uri and forward to JS
        String uri = Image.createDataUriFromBitmap(bitmap, 60);
        view.load("javascript: window.imageReady && window.imageReady('" + uri + "')", null);
    }
}

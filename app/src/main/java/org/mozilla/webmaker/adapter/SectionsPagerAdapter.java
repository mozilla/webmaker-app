package org.mozilla.webmaker.adapter;

import android.app.Fragment;
import android.app.FragmentManager;
import android.content.Context;
import android.support.v13.app.FragmentPagerAdapter;

import org.mozilla.webmaker.R;
import org.mozilla.webmaker.fragment.WebviewFragment;

import java.util.Locale;

/**
 * A {@link android.support.v13.app.FragmentPagerAdapter} that returns a fragment corresponding to one of the sections/tabs/pages.
 */
public class SectionsPagerAdapter extends FragmentPagerAdapter {

    private Context context;

    /**
     * Constructor, requires both a {@link android.app.FragmentManager}, and either a {@link android.app.Activity}
     * or {@link android.app.Service} to be passed with it.
     * @param fragmentManager The {@link android.app.FragmentManager} assigned to this class
     * @param context The {@link android.app.Activity} or {@link android.app.Service} that is using this adapter
     */
    public SectionsPagerAdapter(FragmentManager fragmentManager, Context context) {
        super(fragmentManager);
        this.context = context;
    }

    /**
     * This method is called to instantiate the fragment for the given page.
     * @param position The given page to instantiate
     * @return a {@link org.mozilla.webmaker.fragment.WebviewFragment} for the position given
     */
    @Override
    public Fragment getItem(int position) {
        return WebviewFragment.newInstance(position + 1);
    }

    /**
     * The amount of total pages to show.
     * @return Amount of total pages to show
     */
    @Override
    public int getCount() {
        return 2;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        Locale l = Locale.getDefault();
        switch (position) {
            case 0:
                return context.getString(R.string.title_section1).toUpperCase(l);
            case 1:
                return context.getString(R.string.title_section2).toUpperCase(l);
        }
        return null;
    }
}
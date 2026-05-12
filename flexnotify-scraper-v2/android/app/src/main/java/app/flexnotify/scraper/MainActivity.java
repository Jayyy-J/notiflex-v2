package app.flexnotify.scraper;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.view.accessibility.AccessibilityManager;
import android.content.Context;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import java.util.List;

public class MainActivity extends ReactActivity {

    @Override
    protected String getMainComponentName() {
        return "FlexNotifyScraper";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            DefaultNewArchitectureEntryPoint.getFabricEnabled()
        );
    }

    // Called from React Native to save config
    public static void saveConfig(Context context, String apiUrl, String apiKey) {
        SharedPreferences prefs = context.getSharedPreferences("FlexNotifyConfig", Context.MODE_PRIVATE);
        prefs.edit()
            .putString("api_url", apiUrl)
            .putString("api_key", apiKey)
            .apply();
    }

    // Check if accessibility service is enabled
    public static boolean isAccessibilityServiceEnabled(Context context) {
        AccessibilityManager am = (AccessibilityManager) context.getSystemService(Context.ACCESSIBILITY_SERVICE);
        List<AccessibilityServiceInfo> enabledServices = am.getEnabledAccessibilityServiceList(
            AccessibilityServiceInfo.FEEDBACK_ALL_MASK
        );
        for (AccessibilityServiceInfo service : enabledServices) {
            if (service.getId().contains("app.flexnotify.scraper")) {
                return true;
            }
        }
        return false;
    }
}

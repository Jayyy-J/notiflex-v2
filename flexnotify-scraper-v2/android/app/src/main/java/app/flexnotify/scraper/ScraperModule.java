package app.flexnotify.scraper;

import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.view.accessibility.AccessibilityManager;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.List;

public class ScraperModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public ScraperModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ScraperModule";
    }

    @ReactMethod
    public void saveConfig(String apiUrl, String apiKey, Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(
                "FlexNotifyConfig", Context.MODE_PRIVATE
            );
            prefs.edit()
                .putString("api_url", apiUrl)
                .putString("api_key", apiKey)
                .apply();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isAccessibilityEnabled(Promise promise) {
        try {
            AccessibilityManager am = (AccessibilityManager) reactContext
                .getSystemService(Context.ACCESSIBILITY_SERVICE);
            List<AccessibilityServiceInfo> services = am.getEnabledAccessibilityServiceList(
                AccessibilityServiceInfo.FEEDBACK_ALL_MASK
            );
            boolean enabled = false;
            for (AccessibilityServiceInfo service : services) {
                if (service.getId().contains("app.flexnotify.scraper")) {
                    enabled = true;
                    break;
                }
            }
            promise.resolve(enabled);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openAccessibilitySettings(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getConfig(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(
                "FlexNotifyConfig", Context.MODE_PRIVATE
            );
            String apiUrl = prefs.getString("api_url", "");
            String apiKey = prefs.getString("api_key", "");
            com.facebook.react.bridge.WritableMap map = 
                com.facebook.react.bridge.Arguments.createMap();
            map.putString("apiUrl", apiUrl);
            map.putString("apiKey", apiKey);
            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}

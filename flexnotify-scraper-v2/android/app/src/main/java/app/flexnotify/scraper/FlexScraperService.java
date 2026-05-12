package app.flexnotify.scraper;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FlexScraperService extends AccessibilityService {

    private static final String TAG = "FlexScraper";
    private static final String FLEX_PACKAGE = "com.amazon.flex";
    private static final Pattern PRICE_PATTERN = Pattern.compile("\\$([0-9]+\\.?[0-9]*)");
    private static final Pattern DURATION_PATTERN = Pattern.compile("(\\d+)\\s*(?:hr|hour|min|hrs)");

    private Set<String> sentBlocks = new HashSet<>();
    private Handler handler = new Handler(Looper.getMainLooper());
    private String apiUrl = "";
    private String apiKey = "";

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "FlexNotify Accessibility Service connected");

        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED |
                         AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED |
                         AccessibilityEvent.TYPE_VIEW_SCROLLED;
        info.packageNames = new String[]{FLEX_PACKAGE};
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS |
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
        info.notificationTimeout = 100;
        setServiceInfo(info);

        loadConfig();
        Log.d(TAG, "Watching Amazon Flex for blocks...");
    }

    private void loadConfig() {
        SharedPreferences prefs = getSharedPreferences("FlexNotifyConfig", MODE_PRIVATE);
        apiUrl = prefs.getString("api_url", "");
        apiKey = prefs.getString("api_key", "");
        Log.d(TAG, "Config loaded - API: " + apiUrl);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getPackageName() == null) return;
        if (!event.getPackageName().toString().equals(FLEX_PACKAGE)) return;

        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        // Look for block offers on screen
        List<BlockData> blocks = extractBlocks(rootNode);
        rootNode.recycle();

        for (BlockData block : blocks) {
            String blockKey = block.price + "_" + block.location + "_" + block.duration;
            if (!sentBlocks.contains(blockKey)) {
                sentBlocks.add(blockKey);
                sendBlockToAPI(block);
                Log.d(TAG, "New block found: $" + block.price + " - " + block.location);
            }
        }

        // Clear old blocks every 5 minutes to avoid memory leak
        if (sentBlocks.size() > 500) {
            sentBlocks.clear();
        }
    }

    private List<BlockData> extractBlocks(AccessibilityNodeInfo root) {
        List<BlockData> blocks = new ArrayList<>();
        List<String> allTexts = new ArrayList<>();

        // Collect all visible text
        collectTexts(root, allTexts);

        // Find blocks by price pattern
        BlockData currentBlock = null;
        for (int i = 0; i < allTexts.size(); i++) {
            String text = allTexts.get(i).trim();
            if (text.isEmpty()) continue;

            Matcher priceMatcher = PRICE_PATTERN.matcher(text);
            if (priceMatcher.find()) {
                double price = Double.parseDouble(priceMatcher.group(1));
                if (price >= 10 && price <= 500) { // Valid Amazon Flex price range
                    currentBlock = new BlockData();
                    currentBlock.price = price;

                    // Look ahead for location and duration
                    for (int j = i + 1; j < Math.min(i + 8, allTexts.size()); j++) {
                        String nearby = allTexts.get(j).trim();

                        // Duration
                        Matcher durMatcher = DURATION_PATTERN.matcher(nearby);
                        if (durMatcher.find() && currentBlock.duration == 0) {
                            currentBlock.duration = Integer.parseInt(durMatcher.group(1));
                            if (nearby.contains("hr") || nearby.contains("hour")) {
                                currentBlock.duration *= 60;
                            }
                        }

                        // Location/Station (usually contains warehouse code like DEN1, SEA3, etc)
                        if (nearby.matches(".*[A-Z]{2,4}[0-9]{1,2}.*") || 
                            nearby.contains("Warehouse") || 
                            nearby.contains("Station") ||
                            nearby.contains("Amazon")) {
                            if (currentBlock.location.isEmpty()) {
                                currentBlock.location = nearby;
                            }
                        }

                        // Zone/area
                        if (nearby.length() > 3 && nearby.length() < 50 && 
                            !nearby.startsWith("$") && 
                            currentBlock.zone.isEmpty() &&
                            !nearby.contains("hr") && !nearby.contains("min")) {
                            currentBlock.zone = nearby;
                        }
                    }

                    if (price > 0) {
                        if (currentBlock.location.isEmpty()) currentBlock.location = "Unknown Station";
                        if (currentBlock.zone.isEmpty()) currentBlock.zone = "Unknown Zone";
                        blocks.add(currentBlock);
                    }
                }
            }
        }
        return blocks;
    }

    private void collectTexts(AccessibilityNodeInfo node, List<String> texts) {
        if (node == null) return;

        if (node.getText() != null && !node.getText().toString().trim().isEmpty()) {
            texts.add(node.getText().toString());
        }
        if (node.getContentDescription() != null && !node.getContentDescription().toString().trim().isEmpty()) {
            texts.add(node.getContentDescription().toString());
        }

        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                collectTexts(child, texts);
                child.recycle();
            }
        }
    }

    private void sendBlockToAPI(final BlockData block) {
        if (apiUrl.isEmpty() || apiKey.isEmpty()) {
            Log.w(TAG, "API not configured");
            return;
        }

        new Thread(() -> {
            try {
                String externalId = "AF-" + System.currentTimeMillis();
                JSONObject payload = new JSONObject();
                payload.put("platform", "amazon_flex");
                payload.put("external_id", externalId);
                payload.put("title", "Amazon Flex Block — " + block.location);
                payload.put("pickup_location", block.location);
                payload.put("delivery_zone", block.zone);
                payload.put("price", block.price);
                payload.put("currency", "USD");
                payload.put("estimated_duration_min", block.duration);
                payload.put("status", "available");

                URL url = new URL(apiUrl + "/api/deliveries/ingest");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("x-api-key", apiKey);
                conn.setDoOutput(true);
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);

                byte[] input = payload.toString().getBytes(StandardCharsets.UTF_8);
                OutputStream os = conn.getOutputStream();
                os.write(input, 0, input.length);
                os.close();

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Block sent to API - Response: " + responseCode + " - $" + block.price);
                conn.disconnect();

            } catch (Exception e) {
                Log.e(TAG, "Error sending block to API: " + e.getMessage());
            }
        }).start();
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "FlexNotify Scraper interrupted");
    }

    static class BlockData {
        double price = 0;
        String location = "";
        String zone = "";
        int duration = 0;
    }
}

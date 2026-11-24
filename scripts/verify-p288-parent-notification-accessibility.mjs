import assert from 'node:assert/strict';
import fs from 'node:fs';
const app = fs.readFileSync('apps/parent-mobile/App.tsx', 'utf8');
const checks = [
  ['Notification preference section retained', app.includes('Notification preferences')],
  ['Accessibility role on switches', app.includes('accessibilityRole="switch"')],
  ['Category/channel-specific accessible labels', app.includes('accessibilityLabel=') && app.includes('channel===') && app.includes('notifications`}')],
  ['Accessibility hint on push unavailability', app.includes('Push delivery is not available yet.')],
  ['Push switches are disabled', app.includes("disabled={busy||offlineSession||savingNotificationPreference[notificationPreferenceKey(category,channel)]||reconcilingNotificationPreference[notificationPreferenceKey(category,channel)]||channel==='PUSH'")],
  ['Push switch is forced off while unsupported', app.includes("value={channel==='PUSH'?false:preferenceEnabled(category,channel)}")],
  ['In-app and email preference values preserved', app.includes('preferenceEnabled(category,channel)')],
  ['Offline mutation guard retained', app.includes('if(!selected||offlineSession)return;')],
  ['Preference update endpoint retained', app.includes('/portal/notification-preferences')],
  ['Channel readiness copy explains email provider dependency', app.includes('Email delivery is not configured')],
];
for (const [name, ok] of checks) assert.ok(ok, `FAILED: ${name}`);
console.log(`P288 parent notification accessibility verifier: ${checks.length}/${checks.length} PASS`);

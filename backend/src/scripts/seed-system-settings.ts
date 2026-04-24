import { readFileSync } from "fs";
import { prisma } from "../db.js";
import { getLocaleCandidatePaths } from "../i18n/lang-pack-paths.js";

const BUNDLED_LANGUAGE_CODES = ["en", "fa", "zh-CN"] as const;

const DEFAULTS: Array<[string, string]> = [
  ["active_languages", ["ru", ...BUNDLED_LANGUAGE_CODES].join(",")],
  ["active_currencies", "usd,rub"],
  ["default_referral_percent", "10"],
  ["trial_days", "3"],
  ["service_name", "STEALTHNET"],
  [
    "bot_inner_button_styles",
    '{"tariffPay":"success","topup":"primary","back":"danger","profile":"primary","trialConfirm":"success","lang":"primary","currency":"primary"}',
  ],
  ["category_emojis", '{"ordinary":"📦","premium":"⭐"}'],
  [
    "bot_emojis",
    '{"TRIAL":{"unicode":"🎁"},"PACKAGE":{"unicode":"📦"},"CARD":{"unicode":"💳"},"LINK":{"unicode":"🔗"},"SERVERS":{"unicode":"🌐"},"PUZZLE":{"unicode":"🧩"},"BACK":{"unicode":"◀️"},"MAIN_MENU":{"unicode":"👋"},"BALANCE":{"unicode":"💰"},"TARIFFS":{"unicode":"📦"},"HEADER":{"unicode":"🛡"}}',
  ],
  [
    "bot_menu_line_visibility",
    '{"welcomeTitlePrefix":true,"welcomeGreeting":true,"balancePrefix":true,"tariffPrefix":true,"subscriptionPrefix":true,"expirePrefix":true,"daysLeftPrefix":true,"devicesLabel":true,"trafficPrefix":true,"linkLabel":true,"chooseAction":true}',
  ],
  ["default_auto_renew_enabled", "false"],
  ["auto_renew_days_before_expiry", "1"],
  ["auto_renew_notify_days_before", "3"],
  ["auto_renew_grace_period_days", "2"],
  ["auto_renew_max_retries", "3"],
  ["yookassa_recurring_enabled", "false"],
  ["gift_subscriptions_enabled", "false"],
  ["gift_code_expiry_hours", "72"],
  ["max_additional_subscriptions", "5"],
  ["gift_code_format_length", "12"],
  ["gift_rate_limit_per_minute", "5"],
  ["gift_expiry_notification_days", "3"],
  ["gift_referral_enabled", "true"],
  ["gift_message_max_length", "200"],
];

export async function ensureSystemSettings() {
  for (const [key, value] of DEFAULTS) {
    await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }
  await seedBundledLanguagePacks();
}

async function seedBundledLanguagePacks() {
  for (const code of BUNDLED_LANGUAGE_CODES) {
    await seedLanguagePack(code);
  }
}

async function seedLanguagePack(code: string) {
  const key = `lang_pack_${code}`;
  const existing = await prisma.systemSetting.findUnique({ where: { key } });
  if (existing) return;

  try {
    let data: string | null = null;
    for (const path of getLocaleCandidatePaths(code)) {
      try {
        data = readFileSync(path, "utf-8");
        break;
      } catch {
        /* next */
      }
    }

    if (!data) {
      console.warn(`[seed] ${code}.json not found, skip`);
      return;
    }

    JSON.parse(data);
    await prisma.systemSetting.create({ data: { key, value: data } });
    console.log(`[seed] ${code} language pack seeded`);
  } catch (e) {
    console.warn(`[seed] Could not seed ${code} language pack:`, e instanceof Error ? e.message : e);
  }
}

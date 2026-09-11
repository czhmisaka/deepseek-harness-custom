/**
 * Turn-rail timeline — host half.
 *
 * The whole feature lives in the browser half; the host side owns exactly one
 * thing: the durable `turn-rail` settings namespace (Settings → Turn rail), so
 * the chosen look survives restarts and is shared by every window of this dsh
 * home. The fine-grained fields are the source of truth; `variant` only records
 * which preset was last applied, and the page derives "custom" by comparing the
 * fields against the presets. Per-turn token usage is read from the displayed
 * session at render time and never stored.
 * @module dsh-turn-rail
 */

import z from '@deepseek-ai/schemastery'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'turn-rail'

/** Settings namespace owning the rail appearance. */
export const SETTINGS_NAMESPACE = 'turn-rail'

/** Preset ids the configuration page can apply. */
export const PRESETS = ['off', 'minimal', 'standard', 'strong']

/** Durable section: every field the configuration page edits. */
export const SettingsSchema = z.object({
  variant: z.union([...PRESETS]).default('standard'),
  enabled: z.boolean().default(true),
  spine: z.boolean().default(true),
  spineWidth: z.natural().min(1).max(4).default(2),
  ordinals: z.boolean().default(true),
  hoverGrow: z.boolean().default(true),
  halo: z.boolean().default(true),
  hitWidth: z.natural().min(28).max(80).default(48),
  cardUpgrade: z.boolean().default(true),
  cardWidth: z.natural().min(260).max(480).default(340),
  promptLines: z.natural().min(1).max(4).default(2),
  unloadedBadge: z.boolean().default(true),
  usage: z.boolean().default(true),
  usageDetail: z.boolean().default(true),
  usageHeat: z.boolean().default(false),
})

/**
 * Register the settings namespace while a settings provider is composed.
 * Without one the browser half keeps its in-memory defaults and the page still
 * works for the current window.
 * @param {object} ctx - the Cordis plugin context.
 */
export function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    try {
      settingsCtx.settings.register(SETTINGS_NAMESPACE, SettingsSchema)
    } catch (error) {
      // The namespace registers once per apply; a duplicate means a live
      // registration already serves the same schema (HMR reload).
      if (!/already registered/u.test(error?.message ?? '')) throw error
    }
  })
}

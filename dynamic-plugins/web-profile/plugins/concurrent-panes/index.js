/**
 * Concurrent panes — host half.
 *
 * The feature lives entirely in the browser half; the host side owns exactly
 * one thing: the durable `concurrent-panes` settings namespace (Settings →
 * Concurrent panes), so the pane count, the pinned slot assignment and the
 * density survive restarts and are shared by every window of this dsh home.
 * Nothing about a session is stored: panes are read live from the client
 * object layer at render time.
 * @module dsh-concurrent-panes
 */

import z from '@deepseek-ai/schemastery'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'concurrent-panes'

/** Settings namespace owning the pane layout. */
export const SETTINGS_NAMESPACE = 'concurrent-panes'

/** Durable section: every field the browser half reads or writes. */
export const SettingsSchema = z.object({
  /** Visible pane slots, 1-4. */
  columns: z.natural().min(1).max(4).default(2),
  /** Fill free slots from the sessions that are working right now. */
  autoFill: z.boolean().default(true),
  /** Explicit session per slot; an empty string leaves the slot to auto-fill. */
  paneIds: z.array(z.string()).default([]),
  /** Row rhythm inside a pane. */
  density: z.union(['comfy', 'compact']).default('comfy'),
  /** How many trailing rows one pane keeps on screen. */
  tail: z.natural().min(8).max(200).default(40),
  /** Render assistant reasoning rows. */
  showReasoning: z.boolean().default(false),
  /** Render the background-job strip in a pane header. */
  showJobs: z.boolean().default(true),
  /** Keep a pane scrolled to its newest row. */
  follow: z.boolean().default(true),
})

/**
 * Register the settings namespace while a settings provider is composed.
 * Without one the browser half keeps its in-memory defaults and the view still
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

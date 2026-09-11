var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/host.ts
import z from "@deepseek-ai/schemastery";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { mkdirSync, statSync } from "node:fs";
import { open, readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute } from "node:path";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";

// src/ledger-display.ts
import { dshHomeDisplay, resolveDshHome } from "@deepseek-ai/dsh-home-paths";
var DISPLAYED_MODEL_ROUTES = 5;
var DISPLAYED_SESSIONS = 5;
var LAST_DAY_HOURS = 24;
var MS_PER_HOUR = 36e5;
function formatTokenCount(count) {
  if (count < 1e3) return String(count);
  if (count < 1e6) return scaledTokenCount(count, 1e3, 1) + "K";
  if (count < 1e9) return scaledTokenCount(count, 1e6, 1) + "M";
  if (count < 1e12) return scaledTokenCount(count, 1e9, 2) + "B";
  return scaledTokenCount(count, 1e12, 2) + "T";
}
function scaledTokenCount(count, divisor, decimals) {
  let scaled = (count / divisor).toFixed(decimals);
  while (scaled.includes(".") && scaled.endsWith("0")) {
    scaled = scaled.slice(0, -1);
  }
  return scaled.endsWith(".") ? scaled.slice(0, -1) : scaled;
}
function displaySessionId(sessionId) {
  return sessionId.startsWith("session-") ? sessionId.slice("session-".length) : sessionId;
}
function activityDay(time) {
  return new Date(time).toISOString().slice(0, 10);
}
function hourKey(time) {
  return new Date(time).toISOString().slice(0, 13);
}
function formatUsageTotals(totals, ledgerDisplay) {
  if (totals.requests === 0) {
    return "No token usage recorded yet. Ledger: " + ledgerDisplay;
  }
  const lines = [
    "Token usage \u2014 all sessions (ledger: " + ledgerDisplay + ")",
    "Requests " + totals.requests.toLocaleString("en-US") + " \xB7 Input " + formatTokenCount(totals.inputTokens) + " \xB7 Cache read " + formatTokenCount(totals.cacheReadTokens) + " \xB7 Cache write " + formatTokenCount(totals.cacheWriteTokens) + " \xB7 Output " + formatTokenCount(totals.outputTokens) + " \xB7 Total " + formatTokenCount(totals.totalTokens)
  ];
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const todayTotals = totals.byDay.find((entry) => entry.day === today);
  if (todayTotals !== void 0) {
    lines.push("Today (UTC " + today + "): " + todayTotals.requests.toLocaleString("en-US") + " requests \xB7 " + formatTokenCount(todayTotals.totalTokens) + " tokens");
  }
  const windowFloor = hourKey(Date.now() - LAST_DAY_HOURS * MS_PER_HOUR);
  const last24 = totals.byHour.filter((entry) => entry.hour >= windowFloor);
  if (last24.length > 0) {
    const requests = last24.reduce((sum, entry) => sum + entry.requests, 0);
    const tokens = last24.reduce((sum, entry) => sum + entry.totalTokens, 0);
    lines.push("Last 24 hours (UTC): " + requests.toLocaleString("en-US") + " requests \xB7 " + formatTokenCount(tokens) + " tokens");
  }
  lines.push("By model:");
  for (const model of totals.byModel.slice(0, DISPLAYED_MODEL_ROUTES)) {
    lines.push("  " + model.provider + "/" + model.model + " \u2014 " + model.requests.toLocaleString("en-US") + " requests \xB7 " + formatTokenCount(model.totalTokens) + " tokens");
  }
  if (totals.byModel.length > DISPLAYED_MODEL_ROUTES) {
    const rest = totals.byModel.length - DISPLAYED_MODEL_ROUTES;
    lines.push("  \u2026 and " + String(rest) + " more route" + (rest === 1 ? "" : "s"));
  }
  if (totals.bySession.length > 0) {
    lines.push("By session:");
    for (const session of totals.bySession.slice(0, DISPLAYED_SESSIONS)) {
      lines.push("  " + displaySessionId(session.sessionId) + " \u2014 " + session.requests.toLocaleString("en-US") + " requests \xB7 " + formatTokenCount(session.totalTokens) + " tokens \xB7 last " + activityDay(session.lastActivity));
    }
    if (totals.bySession.length > DISPLAYED_SESSIONS) {
      const rest = totals.bySession.length - DISPLAYED_SESSIONS;
      lines.push("  \u2026 and " + String(rest) + " more session" + (rest === 1 ? "" : "s"));
    }
  }
  return lines.join("\n");
}
function displayLedgerPath(path) {
  const home = resolveDshHome();
  if (path === home) return dshHomeDisplay(home);
  if (path.startsWith(home + "/")) return dshHomeDisplay(home) + path.slice(home.length);
  return path;
}

// src/ledger-fold.ts
import { deepFreeze } from "@deepseek-ai/dsh-util-values";
function modelKey(provider, model) {
  return provider + "\0" + model;
}
function accumulateBucket(holder, record) {
  holder.requests += 1;
  holder.inputTokens += record.inputTokens;
  holder.outputTokens += record.outputTokens;
  holder.cacheReadTokens += record.cacheReadTokens;
  holder.cacheWriteTokens += record.cacheWriteTokens;
  holder.totalTokens = holder.inputTokens + holder.outputTokens + holder.cacheReadTokens + holder.cacheWriteTokens;
}
function createAccumulator() {
  return {
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    lastRecordTime: null,
    byModel: /* @__PURE__ */ new Map(),
    byDay: /* @__PURE__ */ new Map(),
    byHour: /* @__PURE__ */ new Map(),
    bySession: /* @__PURE__ */ new Map()
  };
}
function accumulateRecord(accumulator, record) {
  accumulateBucket(accumulator, record);
  if (accumulator.lastRecordTime === null || record.time > accumulator.lastRecordTime) {
    accumulator.lastRecordTime = record.time;
  }
  const modelKeyString = modelKey(record.provider, record.model);
  let modelTotals = accumulator.byModel.get(modelKeyString);
  if (modelTotals === void 0) {
    modelTotals = {
      provider: record.provider,
      model: record.model,
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 0
    };
    accumulator.byModel.set(modelKeyString, modelTotals);
  }
  accumulateBucket(modelTotals, record);
  const day = new Date(record.time).toISOString().slice(0, 10);
  let dayTotals = accumulator.byDay.get(day);
  if (dayTotals === void 0) {
    dayTotals = { day, requests: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: 0 };
    accumulator.byDay.set(day, dayTotals);
  }
  accumulateBucket(dayTotals, record);
  const hour = new Date(record.time).toISOString().slice(0, 13);
  let hourTotals = accumulator.byHour.get(hour);
  if (hourTotals === void 0) {
    hourTotals = { hour, requests: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, totalTokens: 0 };
    accumulator.byHour.set(hour, hourTotals);
  }
  accumulateBucket(hourTotals, record);
  let sessionTotals = accumulator.bySession.get(record.sessionId);
  if (sessionTotals === void 0) {
    sessionTotals = {
      sessionId: record.sessionId,
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 0,
      lastActivity: record.time
    };
    accumulator.bySession.set(record.sessionId, sessionTotals);
  }
  accumulateBucket(sessionTotals, record);
  if (record.time > sessionTotals.lastActivity) {
    sessionTotals.lastActivity = record.time;
  }
}
var HOURLY_WINDOW_HOURS = 48;
function finishTotals(accumulator) {
  const byModel = [...accumulator.byModel.values()].sort((left, right) => {
    if (right.totalTokens !== left.totalTokens) return right.totalTokens - left.totalTokens;
    if (left.provider !== right.provider) return left.provider < right.provider ? -1 : 1;
    return left.model < right.model ? -1 : 1;
  });
  const byDay = [...accumulator.byDay.values()].sort((left, right) => left.day < right.day ? -1 : 1);
  const bySession = [...accumulator.bySession.values()].sort((left, right) => {
    if (right.totalTokens !== left.totalTokens) return right.totalTokens - left.totalTokens;
    return left.sessionId < right.sessionId ? -1 : 1;
  });
  const byHour = [...accumulator.byHour.values()].sort((left, right) => left.hour < right.hour ? -1 : 1).slice(-HOURLY_WINDOW_HOURS);
  return deepFreeze({
    requests: accumulator.requests,
    inputTokens: accumulator.inputTokens,
    outputTokens: accumulator.outputTokens,
    cacheReadTokens: accumulator.cacheReadTokens,
    cacheWriteTokens: accumulator.cacheWriteTokens,
    totalTokens: accumulator.totalTokens,
    byModel,
    byDay,
    byHour,
    bySession,
    lastRecordTime: accumulator.lastRecordTime
  });
}

// src/ledger-records.ts
function encodeRecordLine(record) {
  return JSON.stringify(record);
}
function isNonNegativeSafeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}
function parseRecordLine(line) {
  const trimmed = line.trim();
  if (trimmed === "") return null;
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed;
  if (record.version !== 1) return null;
  if (!isNonNegativeSafeInteger(record.time)) return null;
  if (!isNonEmptyString(record.sessionId) || !isNonEmptyString(record.provider) || !isNonEmptyString(record.model)) return null;
  if (!isNonNegativeSafeInteger(record.inputTokens) || !isNonNegativeSafeInteger(record.outputTokens) || !isNonNegativeSafeInteger(record.cacheReadTokens) || !isNonNegativeSafeInteger(record.cacheWriteTokens)) return null;
  return {
    version: 1,
    time: record.time,
    sessionId: record.sessionId,
    provider: record.provider,
    model: record.model,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    cacheReadTokens: record.cacheReadTokens,
    cacheWriteTokens: record.cacheWriteTokens
  };
}

// src/host.ts
var PLUGIN_LABEL = "dsh-usage-ledger";
function recordFromEvent(session, event) {
  if (event.type !== "assistant/message") return null;
  const usage = event.data.usage;
  if (usage === void 0) return null;
  return {
    version: 1,
    time: event.time,
    sessionId: session.id,
    provider: event.data.message.source.provider,
    model: event.data.message.source.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens ?? 0,
    cacheWriteTokens: usage.cacheWriteTokens ?? 0
  };
}
var _remoteExportTotals_dec, _a, _init;
var UsageLedger = class extends (_a = TypertRemoteService, _remoteExportTotals_dec = [Remote("totals")], _a) {
  constructor(ctx, config) {
    super(ctx, "usageLedger", { namespace: "usage" });
    __runInitializers(_init, 5, this);
    /** Resolved absolute ledger file path. */
    __publicField(this, "path");
    /** Serialized append chain; queued records reach the file in commit order. */
    __publicField(this, "chain", Promise.resolve());
    /** Lazily opened append handle; one writer per service instance. */
    __publicField(this, "handle");
    /** File identity the cached totals fold covers; size -1 means no file yet. */
    __publicField(this, "folded");
    const path = resolveLedgerPath(config.path);
    if (statOrUndefined(path)?.isDirectory()) {
      throw new Error(PLUGIN_LABEL + ": configured ledger path is a directory: " + path);
    }
    mkdirSync(dirname(path), { recursive: true });
    this.path = path;
    ctx.on("session/event", (session, event) => {
      const record = recordFromEvent(session, event);
      if (record !== null) this.appendRecord(record);
    });
    ctx.on("session/flush", () => this.flush());
    ctx.effect(() => this.dispose(), "usage-ledger: drain and close ledger file");
    ctx.inject(["commands"], (commandCtx) => {
      commandCtx.commands.register({
        name: "usage",
        description: "Show total token usage across all sessions",
        handler: async () => ({ kind: "success", text: await this.commandText() })
      });
    });
  }
  /**
   * Aggregate whole-ledger token usage. Folds the ledger file when its size or
   * mtime moved past the cached fold — including writes from other processes
   * sharing the harness home — and serves the cached snapshot otherwise.
   *
   * @returns a deeply frozen totals snapshot at one file state.
   */
  async totals() {
    const stats = await stat(this.path).catch((error) => {
      if (error?.code === "ENOENT") return void 0;
      throw error;
    });
    if (stats === void 0) {
      return this.cacheTotals(-1, -1, finishTotals(createAccumulator()));
    }
    if (this.folded !== void 0 && this.folded.size === stats.size && this.folded.mtimeMs === stats.mtimeMs) {
      return this.folded.totals;
    }
    return this.cacheTotals(stats.size, stats.mtimeMs, await this.foldFile());
  }
  async remoteExportTotals(signal) {
    signal.throwIfAborted();
    return { totals: await this.totals(), ledgerDisplay: displayLedgerPath(this.path) };
  }
  /**
   * Resolve when every queued record has reached the ledger file. The
   * session/flush subscription awaits this on the session log's durability
   * checkpoint, and hosts may await it before reading the file directly.
   *
   * @returns a promise settling after every pending append settles.
   */
  flush() {
    return this.chain;
  }
  /** Queue one append on the serialized chain; failures log and never throw. */
  appendRecord(record) {
    const line = encodeRecordLine(record) + "\n";
    this.chain = this.chain.then(() => this.writeLine(line)).catch((error) => {
      this.ctx.logger.error("%s: failed to append usage record: %o", PLUGIN_LABEL, error);
    });
  }
  /** Write one line through the lazily opened append handle. */
  async writeLine(line) {
    if (this.handle === void 0) this.handle = await open(this.path, "a");
    await this.handle.write(line);
  }
  /**
   * Fold the whole ledger file; parseRecordLine skips damaged lines. The file
   * is read whole — one buffered read avoids the readline module, which the
   * packed webworker image does not carry — and every line is one small JSON
   * record, so the fold is O(records) in time and memory.
   */
  async foldFile() {
    const accumulator = createAccumulator();
    const content = await readFile(this.path, "utf8");
    for (const line of content.split("\n")) {
      const record = parseRecordLine(line);
      if (record !== null) accumulateRecord(accumulator, record);
    }
    return finishTotals(accumulator);
  }
  /** Cache and return one totals value. */
  cacheTotals(size, mtimeMs, totals) {
    this.folded = { size, mtimeMs, totals };
    return totals;
  }
  /** Disposer: drain the pending chain, then close the handle. */
  dispose() {
    return async () => {
      await this.chain;
      await this.handle?.close();
      this.handle = void 0;
    };
  }
  /** Build the /usage command text from one fresh totals fold. */
  async commandText() {
    const totals = await this.totals();
    return formatUsageTotals(totals, displayLedgerPath(this.path));
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "remoteExportTotals", _remoteExportTotals_dec, UsageLedger);
__decoratorMetadata(_init, UsageLedger);
__publicField(UsageLedger, "Config", z.object({
  path: z.string().required()
}));
function statOrUndefined(path) {
  try {
    return statSync(path);
  } catch (error) {
    if (error?.code === "ENOENT") return void 0;
    throw error;
  }
}
var LiquidGlassSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  seaTheme: z.string().default("dark"),
  speed: z.number().min(0.2).max(3).default(1.3),
  colorWave: z.boolean().default(true),
  opacity: z.number().min(0.3).max(1).default(1),
  blur: z.number().min(0).max(40).default(26),
  colorMode: z.string().default("theme"),
  colorA: z.string().default("#05020f"),
  colorB: z.string().default("#d18cff")
});
function resolveLedgerPath(path) {
  const expanded = path === "~" || path.startsWith("~/") ? dshHomePath(path.slice(1)) : path;
  if (!isAbsolute(expanded)) {
    throw new Error(PLUGIN_LABEL + ': configured ledger path must be absolute, got "' + path + '"');
  }
  return expanded;
}
function apply(ctx) {
  void ctx.plugin(UsageLedger, {
    path: dshHomePath("usage", "usage.jsonl")
  });
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.register("liquid-glass", LiquidGlassSettingsSchema);
  });
}
export {
  LiquidGlassSettingsSchema,
  UsageLedger,
  apply
};

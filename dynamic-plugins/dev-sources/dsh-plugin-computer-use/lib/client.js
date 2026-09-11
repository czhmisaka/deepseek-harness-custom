window.__ModuleLoader__.load({
	id: "dsh-tool-computer-use",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __export = (target, all) => {
		  for (var name2 in all)
		    __defProp(target, name2, { get: all[name2], enumerable: true });
		};
		var __copyProps = (to, from, except, desc) => {
		  if (from && typeof from === "object" || typeof from === "function") {
		    for (let key of __getOwnPropNames(from))
		      if (!__hasOwnProp.call(to, key) && key !== except)
		        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
		  }
		  return to;
		};
		var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

		// src/client.js
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  inject: () => inject,
		  name: () => name
		});
		module.exports = __toCommonJS(client_exports);
		var import_react2 = require("react");

		// src/client-settings.js
		var import_react = require("react");
		var import_jsx_runtime = require("react/jsx-runtime");
		var SETTINGS_NS = "computer-use";
		var COLOR_MUTED = "var(--dsw-text-muted, #8a8f98)";
		var COLOR_ACCENT = "var(--dsw-accent, #4f8ef7)";
		var COLOR_DANGER = "var(--dsw-danger, #e5534b)";
		var COLOR_OK = "var(--dsw-success, #3fb950)";
		var ACTION_META = {
		  screenshot: { label: "\u622A\u53D6\u5C4F\u5E55", hint: "\u622A\u53D6\u6240\u9009\u5C4F\u5E55\u7684\u753B\u9762\uFF08\u9700\u8981\u5C4F\u5E55\u5F55\u5236\u6743\u9650\uFF09" },
		  cursor_position: { label: "\u8BFB\u53D6\u5149\u6807\u4F4D\u7F6E", hint: "\u67E5\u8BE2\u5F53\u524D\u9F20\u6807\u5750\u6807" },
		  left_click: { label: "\u5DE6\u952E\u5355\u51FB", hint: "\u5728\u6307\u5B9A\u4F4D\u7F6E\u5DE6\u952E\u70B9\u51FB" },
		  double_click: { label: "\u53CC\u51FB", hint: "\u9700\u8981 cliclick" },
		  right_click: { label: "\u53F3\u952E\u5355\u51FB", hint: "\u9700\u8981 cliclick" },
		  move: { label: "\u79FB\u52A8\u6307\u9488", hint: "\u79FB\u52A8\u9F20\u6807\u4E0D\u70B9\u51FB\uFF0C\u9700\u8981 cliclick" },
		  drag: { label: "\u62D6\u62FD", hint: "\u6309\u4E0B\u5E76\u62D6\u52A8\uFF0C\u9700\u8981 cliclick" },
		  type: { label: "\u8F93\u5165\u6587\u672C", hint: "\u5411\u7126\u70B9\u5E94\u7528\u8F93\u5165\u4EFB\u610F\u6587\u672C" },
		  key: { label: "\u6309\u952E", hint: "\u5355\u952E\u4E0E\u7EC4\u5408\u952E\uFF08\u5982 cmd+c\uFF09" },
		  scroll: { label: "\u6EDA\u52A8", hint: "\u952E\u76D8\u5F0F\u6EDA\u52A8\uFF08\u65B9\u5411\u952E\u8FDE\u6309\uFF09" },
		  wait: { label: "\u7B49\u5F85", hint: "\u7B49\u5F85\u6307\u5B9A\u6BEB\u79D2\u6570\uFF0C\u65E0\u526F\u4F5C\u7528" }
		};
		var ACTION_GROUPS = [
		  { key: "observe", label: "\u89C2\u5BDF", actions: ["screenshot", "cursor_position"] },
		  { key: "mouse", label: "\u9F20\u6807", actions: ["left_click", "double_click", "right_click", "move", "drag"] },
		  { key: "keyboard", label: "\u952E\u76D8", actions: ["type", "key", "scroll"] },
		  { key: "other", label: "\u5176\u4ED6", actions: ["wait"] }
		];
		var READONLY_ACTIONS = ["screenshot", "cursor_position"];
		var ALL_ACTIONS = Object.keys(ACTION_META);
		function Toggle({ checked, disabled, onToggle, title }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		    "button",
		    {
		      type: "button",
		      role: "switch",
		      "aria-checked": checked,
		      "aria-label": title,
		      disabled,
		      onClick: onToggle,
		      style: {
		        position: "relative",
		        width: 36,
		        height: 20,
		        borderRadius: 10,
		        border: "none",
		        cursor: disabled ? "not-allowed" : "pointer",
		        flexShrink: 0,
		        opacity: disabled ? 0.45 : 1,
		        background: checked ? COLOR_ACCENT : "rgba(127,127,127,0.35)",
		        transition: "background 0.15s"
		      },
		      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		        "span",
		        {
		          style: {
		            position: "absolute",
		            top: 2,
		            left: checked ? 18 : 2,
		            width: 16,
		            height: 16,
		            borderRadius: "50%",
		            background: "#fff",
		            transition: "left 0.15s",
		            boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
		          }
		        }
		      )
		    }
		  );
		}
		function Row({ title, hint, children }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "div",
		    {
		      style: {
		        display: "flex",
		        alignItems: "center",
		        justifyContent: "space-between",
		        gap: 12,
		        padding: "9px 0",
		        width: "100%"
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { minWidth: 0 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13.5, fontWeight: 500 }, children: title }),
		          hint !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: COLOR_MUTED, marginTop: 2, lineHeight: "17px" }, children: hint })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }, children })
		      ]
		    }
		  );
		}
		function createEnableRow(scope) {
		  function EnableRow() {
		    const [snapshot, setSnapshot] = (0, import_react.useState)(() => scope.getSnapshot());
		    (0, import_react.useEffect)(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope]);
		    const enabled = snapshot.status === "ready" ? snapshot.value?.enabled !== false : true;
		    const writable = snapshot.status === "ready" && snapshot.writable;
		    const [pending, setPending] = (0, import_react.useState)(false);
		    const toggle = () => {
		      setPending(true);
		      scope.set("enabled", !enabled).catch(() => {
		      }).finally(() => setPending(false));
		    };
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      Row,
		      {
		        title: "Computer \u4F7F\u7528\uFF08computer use\uFF09",
		        hint: "\u5141\u8BB8\u6A21\u578B\u622A\u53D6\u5C4F\u5E55\u5E76\u63A7\u5236\u672C\u673A\u9F20\u6807\u4E0E\u952E\u76D8\u3002\u5173\u95ED\u540E\u6240\u6709 computer \u52A8\u4F5C\u7ACB\u5373\u88AB\u62D2\u7EDD\u3002",
		        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, { checked: enabled, disabled: pending || !writable, onToggle: toggle, title: "\u542F\u7528 Computer \u4F7F\u7528" })
		      }
		    );
		  }
		  return EnableRow;
		}
		function createEnvironmentRow(readUiMeta) {
		  function EnvironmentRow() {
		    const ui = readUiMeta() ?? {};
		    const env = ui.environment;
		    const displayCount = ui.displays?.length ?? 0;
		    if (env === null || env === void 0) {
		      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { title: "\u8FD0\u884C\u73AF\u5883", hint: displayCount > 0 ? `\u5DF2\u53D1\u73B0 ${displayCount} \u53F0\u663E\u793A\u5668\uFF1B\u6743\u9650\u72B6\u6001\u68C0\u6D4B\u4E2D\u2026` : "\u6B63\u5728\u68C0\u6D4B\u6743\u9650\u72B6\u6001\u2026", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLOR_MUTED, fontSize: 12 }, children: "\u68C0\u6D4B\u4E2D\u2026" }) });
		    }
		    const items = [
		      { ok: env.screenRecording, label: "\u5C4F\u5E55\u5F55\u5236", fix: "\u7CFB\u7EDF\u8BBE\u7F6E \u2192 \u9690\u79C1\u4E0E\u5B89\u5168\u6027 \u2192 \u5C4F\u5E55\u5F55\u5236\uFF0C\u6388\u6743\u542F\u52A8 dsh \u7684\u5E94\u7528\u540E\u91CD\u542F dsh" },
		      { ok: env.accessibility, label: "\u8F85\u52A9\u529F\u80FD", fix: "\u7CFB\u7EDF\u8BBE\u7F6E \u2192 \u9690\u79C1\u4E0E\u5B89\u5168\u6027 \u2192 \u8F85\u52A9\u529F\u80FD\uFF0C\u6388\u6743\u542F\u52A8 dsh \u7684\u5E94\u7528\u540E\u91CD\u542F dsh" },
		      { ok: env.cliclick, label: "cliclick\uFF08\u53CC\u51FB/\u53F3\u952E/\u62D6\u62FD\u9700\u8981\uFF09", fix: "brew install cliclick" }
		    ];
		    const failing = items.filter((item) => item.ok === false);
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      Row,
		      {
		        title: displayCount > 0 ? `\u8FD0\u884C\u73AF\u5883 \xB7 ${displayCount} \u53F0\u663E\u793A\u5668` : "\u8FD0\u884C\u73AF\u5883",
		        hint: failing.length === 0 ? "\u6743\u9650\u9F50\u5907\u3002\u622A\u5C4F\u6BCF\u52A8\u4F5C\u90FD\u4F1A\u771F\u5B9E\u6267\u884C\uFF0C\u8BF7\u7559\u610F\u6A21\u578B\u6B63\u5728\u64CD\u4F5C\u7684\u754C\u9762\u3002" : failing.map((item) => `${item.label}\uFF1A${item.fix}`).join("\uFF1B"),
		        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { display: "flex", gap: 6 }, children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		          "span",
		          {
		            title: item.ok === false ? item.fix : item.label + " \u5DF2\u5C31\u7EEA",
		            style: {
		              fontSize: 11,
		              padding: "2px 8px",
		              borderRadius: 10,
		              whiteSpace: "nowrap",
		              color: item.ok === true ? COLOR_OK : item.ok === false ? COLOR_DANGER : COLOR_MUTED,
		              border: "1px solid",
		              borderColor: item.ok === true ? COLOR_OK : item.ok === false ? COLOR_DANGER : "rgba(127,127,127,0.4)"
		            },
		            children: [
		              item.ok === true ? "\u2713" : item.ok === false ? "\u2715" : "\u2013",
		              " ",
		              item.label.split("\uFF08")[0]
		            ]
		          },
		          item.label
		        )) })
		      }
		    );
		  }
		  return EnvironmentRow;
		}
		function createActionsRow(scope, readUiMeta) {
		  function ActionsRow() {
		    const [snapshot, setSnapshot] = (0, import_react.useState)(() => scope.getSnapshot());
		    (0, import_react.useEffect)(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope]);
		    const [pending, setPending] = (0, import_react.useState)(false);
		    const ui = readUiMeta() ?? {};
		    const allowedActions = ui.allowedActions;
		    const writable = snapshot.status === "ready" && snapshot.writable;
		    const userActions = snapshot.status === "ready" && snapshot.value?.actions !== null && typeof snapshot.value?.actions === "object" ? snapshot.value.actions : {};
		    const isAllowed = (action) => allowedActions === void 0 || allowedActions.includes(action);
		    const isEnabled = (action) => isAllowed(action) && userActions[action] !== false;
		    const writeActions = (next) => {
		      setPending(true);
		      scope.set("actions", next).catch(() => {
		      }).finally(() => setPending(false));
		    };
		    const toggleAction = (action) => {
		      writeActions({ ...userActions, [action]: !isEnabled(action) });
		    };
		    const applyReadonlyPreset = () => {
		      const next = {};
		      for (const action of ALL_ACTIONS) next[action] = READONLY_ACTIONS.includes(action);
		      writeActions(next);
		    };
		    const applyFullPreset = () => {
		      setPending(true);
		      scope.unset("actions").catch(() => {
		      }).finally(() => setPending(false));
		    };
		    const effectiveCount = (allowedActions ?? ALL_ACTIONS).filter(isEnabled).length;
		    const disabled = pending || !writable;
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "9px 0", width: "100%" }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { minWidth: 0 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13.5, fontWeight: 500 }, children: "\u52A8\u4F5C\u6743\u9650\u5206\u914D" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: COLOR_MUTED, marginTop: 2, lineHeight: "17px" }, children: [
		            "\u9010\u9879\u51B3\u5B9A\u6A21\u578B\u53EF\u6267\u884C\u7684\u52A8\u4F5C\uFF08\u5F53\u524D\u751F\u6548 ",
		            effectiveCount,
		            "/",
		            (allowedActions ?? ALL_ACTIONS).length,
		            " \u9879\uFF09\u3002 \u90E8\u7F72\u914D\u7F6E\u662F\u4E0A\u9650\uFF0C\u8FD9\u91CC\u53EA\u80FD\u5728\u5176\u8303\u56F4\u5185\u6536\u7A84\u3002"
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "flex", gap: 6, flexShrink: 0 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		            "button",
		            {
		              type: "button",
		              disabled,
		              onClick: applyReadonlyPreset,
		              style: presetButtonStyle(disabled),
		              children: "\u53EA\u8BFB\u89C2\u5BDF"
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		            "button",
		            {
		              type: "button",
		              disabled,
		              onClick: applyFullPreset,
		              style: presetButtonStyle(disabled),
		              children: "\u5B8C\u5168\u63A7\u5236"
		            }
		          )
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "2px 24px", marginTop: 8 }, children: ACTION_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: COLOR_MUTED, marginTop: 6, marginBottom: 2, letterSpacing: "0.05em" }, children: group.label }),
		        group.actions.map((action) => {
		          const meta = ACTION_META[action];
		          const deploymentLocked = !isAllowed(action);
		          const on = isEnabled(action);
		          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		            "label",
		            {
		              title: deploymentLocked ? "\u90E8\u7F72\u672A\u6388\u6743\u8BE5\u52A8\u4F5C\uFF08cordis.patch.yml \u7684 allowedActions\uFF09" : meta.hint,
		              style: {
		                display: "flex",
		                alignItems: "center",
		                gap: 8,
		                padding: "3px 0",
		                cursor: disabled || deploymentLocked ? "not-allowed" : "pointer",
		                opacity: disabled ? 0.6 : 1
		              },
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                  "input",
		                  {
		                    type: "checkbox",
		                    checked: deploymentLocked ? false : on,
		                    disabled: disabled || deploymentLocked,
		                    onChange: () => toggleAction(action),
		                    style: { accentColor: COLOR_ACCENT, margin: 0 }
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: 12.5, color: deploymentLocked ? COLOR_MUTED : void 0 }, children: [
		                  meta.label,
		                  deploymentLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 10.5, color: COLOR_MUTED, marginLeft: 4 }, children: "\uFF08\u90E8\u7F72\u672A\u6388\u6743\uFF09" })
		                ] })
		              ]
		            },
		            action
		          );
		        })
		      ] }, group.key)) })
		    ] });
		  }
		  return ActionsRow;
		}
		function presetButtonStyle(disabled) {
		  return {
		    fontSize: 12,
		    padding: "3px 10px",
		    borderRadius: 6,
		    cursor: disabled ? "not-allowed" : "pointer",
		    border: "1px solid rgba(127,127,127,0.35)",
		    background: "transparent",
		    color: "inherit",
		    opacity: disabled ? 0.5 : 1
		  };
		}
		function createDisplayRow(scope, readUiMeta) {
		  function DisplayRow() {
		    const [snapshot, setSnapshot] = (0, import_react.useState)(() => scope.getSnapshot());
		    (0, import_react.useEffect)(() => scope.subscribe(() => setSnapshot(scope.getSnapshot())), [scope]);
		    const ui = readUiMeta() ?? {};
		    const writable = snapshot.status === "ready" && snapshot.writable;
		    const current = snapshot.status === "ready" && typeof snapshot.value?.display === "string" && snapshot.value.display.length > 0 ? snapshot.value.display : "main";
		    const displays = Array.isArray(ui.displays) ? ui.displays : [];
		    const main = displays.find((d) => d.isMain === true) ?? displays[0];
		    const [pending, setPending] = (0, import_react.useState)(false);
		    const change = (value) => {
		      setPending(true);
		      scope.set("display", value).catch(() => {
		      }).finally(() => setPending(false));
		    };
		    const placement = (display) => {
		      if (main === void 0 || display.isMain) return display.isMain ? "\u4E3B\u5C4F" : "";
		      if (display.x >= main.x + main.width) return "\u4E3B\u5C4F\u53F3\u4FA7";
		      if (display.x + display.width <= main.x) return "\u4E3B\u5C4F\u5DE6\u4FA7";
		      if (display.y >= main.y + main.height) return "\u4E3B\u5C4F\u4E0B\u65B9";
		      if (display.y + display.height <= main.y) return "\u4E3B\u5C4F\u4E0A\u65B9";
		      return "\u526F\u5C4F";
		    };
		    const options = displays.length > 0 ? displays.map((display) => ({
		      value: String(display.index),
		      label: `\u663E\u793A\u5668 ${display.index} \xB7 ${display.width}\xD7${display.height}` + (display.isMain ? "\uFF08\u4E3B\u5C4F\uFF09" : `\uFF08${placement(display)}\uFF09`)
		    })) : [{ value: "main", label: "\u4E3B\u663E\u793A\u5668" }];
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      Row,
		      {
		        title: "\u53EF\u7528\u5C4F\u5E55",
		        hint: displays.length > 0 ? `\u6A21\u578B\u53EA\u80FD\u622A\u53D6\u5E76\u63A7\u5236\u6240\u9009\u5C4F\u5E55\uFF08\u5F53\u524D ${options.find((o) => o.value === current)?.label ?? "\u4E3B\u663E\u793A\u5668"}\uFF09\u3002\u952E\u76D8\u8F93\u5165\u4ECD\u4F5C\u7528\u4E8E\u7CFB\u7EDF\u5F53\u524D\u805A\u7126\u7684\u5E94\u7528\uFF1B\u5916\u63A5\u663E\u793A\u5668\u540E\u5982\u672A\u51FA\u73B0\uFF0C\u5237\u65B0\u9875\u9762\u3002` : "\u6A21\u578B\u53EA\u80FD\u622A\u53D6\u5E76\u63A7\u5236\u6240\u9009\u5C4F\u5E55\u3002\u663E\u793A\u5668\u5217\u8868\u7531\u63D2\u4EF6\u542F\u52A8\u65F6\u63A2\u6D4B\uFF1B\u82E5\u521A\u63A5\u5165\u5916\u63A5\u663E\u793A\u5668\uFF0C\u5237\u65B0\u9875\u9762\u6216\u91CD\u542F dsh\u3002",
		        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "select",
		          {
		            value: options.some((o) => o.value === current) ? current : "main",
		            disabled: !writable || pending,
		            onChange: (event) => change(event.target.value),
		            style: {
		              fontSize: 12.5,
		              padding: "4px 8px",
		              borderRadius: 6,
		              color: "inherit",
		              background: "var(--dsw-bg-subtle, rgba(127,127,127,0.08))",
		              border: "1px solid rgba(127,127,127,0.35)",
		              cursor: writable ? "pointer" : "not-allowed"
		            },
		            children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option.value, children: option.label }, option.value))
		          }
		        )
		      }
		    );
		  }
		  return DisplayRow;
		}
		function SectionShell({ renderSlot }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: renderSlot("settings.computer.item", {}) });
		}
		function registerSettingsSection(ctx) {
		  const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS });
		  function readUiMeta() {
		    try {
		      const describe = ctx.settingsScope.describe();
		      const mirror = describe?.getSnapshot();
		      const view = mirror?.view;
		      if (view === void 0) return void 0;
		      const entry = Array.isArray(view.namespaces) ? view.namespaces.find((ns) => ns !== null && typeof ns === "object" && ns.ns === SETTINGS_NS) : void 0;
		      const envelope = entry?.schema;
		      if (envelope === null || typeof envelope !== "object") return void 0;
		      const refs = envelope.refs;
		      const root = refs !== void 0 ? refs[envelope.uid] : void 0;
		      return root?.meta?.computerUi;
		    } catch {
		      return void 0;
		    }
		  }
		  function useDescribeSubscription() {
		    const [, force] = (0, import_react.useState)(0);
		    (0, import_react.useEffect)(() => {
		      let live = true;
		      let unsubscribe;
		      try {
		        const describe = ctx.settingsScope.describe();
		        unsubscribe = describe?.subscribe(() => {
		          if (live) force((n) => n + 1);
		        });
		      } catch {
		        unsubscribe = void 0;
		      }
		      return () => {
		        live = false;
		        unsubscribe?.();
		      };
		    }, []);
		  }
		  const EnableRow = createEnableRow(scope);
		  const EnvironmentRow = createEnvironmentRow(readUiMeta);
		  const ActionsRow = createActionsRow(scope, readUiMeta);
		  const DisplayRow = createDisplayRow(scope, readUiMeta);
		  const Wrap = (Component) => function Wrapped() {
		    useDescribeSubscription();
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, {});
		  };
		  ctx.slots.inject("settings.section", () => ctx.slots.register({
		    name: "settings.section",
		    id: "computer-use",
		    order: 15,
		    label: () => "Computer \u4F7F\u7528",
		    children: {
		      "settings.computer.item": { kind: "list", scope: "root" }
		    }
		  }, SectionShell));
		  ctx.slots.inject("settings.computer.item", () => {
		    ctx.slots.register({ name: "settings.computer.item", id: "enable", order: 10 }, EnableRow);
		    ctx.slots.register({ name: "settings.computer.item", id: "environment", order: 20 }, Wrap(EnvironmentRow));
		    ctx.slots.register({ name: "settings.computer.item", id: "actions", order: 30 }, Wrap(ActionsRow));
		    ctx.slots.register({ name: "settings.computer.item", id: "display", order: 40 }, Wrap(DisplayRow));
		  });
		}

		// src/client.js
		var import_jsx_runtime2 = require("react/jsx-runtime");
		var name = "client-computer-use";
		var inject = ["slots", "sessions", "uiSession", "settingsScope"];
		var COLOR_ACCENT2 = "var(--dsw-accent, #4f8ef7)";
		var COLOR_ERROR = "var(--dsw-danger, #e5534b)";
		var COLOR_MUTED2 = "var(--dsw-text-muted, #8a8f98)";
		function runningHeadline(args) {
		  if (args === null || typeof args !== "object" || typeof args.action !== "string") return void 0;
		  const at = (pair) => Array.isArray(pair) && pair.length === 2 ? `(${pair[0]}, ${pair[1]})` : "";
		  switch (args.action) {
		    case "screenshot":
		      return "\u6B63\u5728\u622A\u53D6\u5C4F\u5E55\u2026";
		    case "cursor_position":
		      return "\u6B63\u5728\u8BFB\u53D6\u5149\u6807\u4F4D\u7F6E\u2026";
		    case "left_click":
		      return at(args.coordinate) ? `\u6B63\u5728\u5DE6\u952E\u70B9\u51FB ${at(args.coordinate)}\u2026` : "\u6B63\u5728\u5DE6\u952E\u70B9\u51FB\u2026";
		    case "double_click":
		      return at(args.coordinate) ? `\u6B63\u5728\u53CC\u51FB ${at(args.coordinate)}\u2026` : "\u6B63\u5728\u53CC\u51FB\u2026";
		    case "right_click":
		      return at(args.coordinate) ? `\u6B63\u5728\u53F3\u952E\u70B9\u51FB ${at(args.coordinate)}\u2026` : "\u6B63\u5728\u53F3\u952E\u70B9\u51FB\u2026";
		    case "move":
		      return at(args.coordinate) ? `\u6B63\u5728\u79FB\u52A8\u9F20\u6807\u5230 ${at(args.coordinate)}\u2026` : "\u6B63\u5728\u79FB\u52A8\u9F20\u6807\u2026";
		    case "drag":
		      return `\u6B63\u5728\u62D6\u62FD ${at(args.start_coordinate)} \u2192 ${at(args.coordinate)}\u2026`;
		    case "type":
		      return typeof args.text === "string" ? `\u6B63\u5728\u8F93\u5165 ${args.text.length} \u4E2A\u5B57\u7B26\u2026` : "\u6B63\u5728\u8F93\u5165\u6587\u672C\u2026";
		    case "key":
		      return typeof args.key === "string" ? `\u6B63\u5728\u6309\u4E0B ${args.key}\u2026` : "\u6B63\u5728\u6309\u952E\u2026";
		    case "scroll":
		      return `\u6B63\u5728${args.direction === "up" ? "\u5411\u4E0A" : args.direction === "left" ? "\u5411\u5DE6" : args.direction === "right" ? "\u5411\u53F3" : "\u5411\u4E0B"}\u6EDA\u52A8 ${typeof args.amount === "number" ? args.amount : 3} \u683C\u2026`;
		    case "wait":
		      return `\u6B63\u5728\u7B49\u5F85 ${typeof args.durationMs === "number" ? args.durationMs : "?"} ms\u2026`;
		    default:
		      return `\u6B63\u5728\u6267\u884C ${args.action}\u2026`;
		  }
		}
		function settledHeadline(args) {
		  if (args === null || typeof args !== "object" || typeof args.action !== "string") return void 0;
		  const at = (pair) => Array.isArray(pair) && pair.length === 2 ? `(${pair[0]}, ${pair[1]})` : "";
		  switch (args.action) {
		    case "screenshot":
		      return "\u5DF2\u622A\u53D6\u5C4F\u5E55";
		    case "cursor_position":
		      return "\u5DF2\u8BFB\u53D6\u5149\u6807\u4F4D\u7F6E";
		    case "left_click":
		      return `\u5DF2\u5DE6\u952E\u70B9\u51FB ${at(args.coordinate)}`.trim();
		    case "double_click":
		      return `\u5DF2\u53CC\u51FB ${at(args.coordinate)}`.trim();
		    case "right_click":
		      return `\u5DF2\u53F3\u952E\u70B9\u51FB ${at(args.coordinate)}`.trim();
		    case "move":
		      return `\u5DF2\u79FB\u52A8\u9F20\u6807\u5230 ${at(args.coordinate)}`.trim();
		    case "drag":
		      return `\u5DF2\u62D6\u62FD ${at(args.start_coordinate)} \u2192 ${at(args.coordinate)}`;
		    case "type":
		      return `\u5DF2\u8F93\u5165 ${typeof args.text === "string" ? args.text.length : "?"} \u4E2A\u5B57\u7B26`;
		    case "key":
		      return `\u5DF2\u6309\u4E0B ${typeof args.key === "string" ? args.key : "?"}`;
		    case "scroll":
		      return `\u5DF2${args.direction === "up" ? "\u5411\u4E0A" : args.direction === "left" ? "\u5411\u5DE6" : args.direction === "right" ? "\u5411\u53F3" : "\u5411\u4E0B"}\u6EDA\u52A8`;
		    case "wait":
		      return `\u5DF2\u7B49\u5F85 ${typeof args.durationMs === "number" ? formatDuration(args.durationMs) : "?"}`;
		    default:
		      return `\u5DF2\u6267\u884C ${args.action}`;
		  }
		}
		function parseArgs(argsRaw) {
		  try {
		    return JSON.parse(argsRaw);
		  } catch {
		    return void 0;
		  }
		}
		function formatDuration(ms) {
		  return ms < 1e3 ? ms + " ms" : (ms / 1e3).toFixed(1) + " \u79D2";
		}
		function firstImageAttachment(content) {
		  if (!Array.isArray(content)) return void 0;
		  for (const block of content) {
		    if (block !== null && typeof block === "object" && block.type === "image" && block.attachment !== null && typeof block.attachment === "object" && typeof block.attachment.attachmentId === "string") {
		      return { attachmentId: block.attachment.attachmentId, mediaType: typeof block.attachment.mediaType === "string" ? block.attachment.mediaType : "image/png" };
		    }
		  }
		  return void 0;
		}
		function createImageLoader(sessions) {
		  const cache = /* @__PURE__ */ new Map();
		  return (sessionId, attachmentId) => {
		    const key = sessionId + ":" + attachmentId;
		    const cached = cache.get(key);
		    if (cached !== void 0) return cached;
		    const pending = (async () => {
		      const binding = sessions.binding(sessionId);
		      if (binding === void 0) throw new Error("unknown session");
		      const result = await binding.session.readAttachment(attachmentId);
		      if (!result.ok) throw new Error(result.error.code + ": " + result.error.message);
		      const bytes = Uint8Array.from(result.value.data);
		      const mediaType = result.value.attachment.mediaType;
		      if (typeof URL.createObjectURL !== "function") {
		        let binary = "";
		        for (const byte of bytes) binary += String.fromCharCode(byte);
		        return "data:" + mediaType + ";base64," + btoa(binary);
		      }
		      const url = URL.createObjectURL(new Blob([bytes.buffer], { type: mediaType }));
		      return url;
		    })();
		    cache.set(key, pending);
		    pending.catch(() => cache.delete(key));
		    return pending;
		  };
		}
		function ScreenshotThumbnail({ load, attachmentId }) {
		  const [url, setUrl] = (0, import_react2.useState)(void 0);
		  (0, import_react2.useEffect)(() => {
		    let live = true;
		    setUrl(void 0);
		    load(attachmentId).then((resolved) => {
		      if (live) setUrl(resolved);
		    }).catch(() => {
		    });
		    return () => {
		      live = false;
		    };
		  }, [attachmentId, load]);
		  if (url === void 0) {
		    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: COLOR_MUTED2, fontSize: 12 }, children: "\u622A\u56FE\u52A0\u8F7D\u4E2D\u2026" });
		  }
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		    "img",
		    {
		      src: url,
		      alt: "\u5C4F\u5E55\u622A\u56FE",
		      style: {
		        maxHeight: 120,
		        maxWidth: 320,
		        borderRadius: 6,
		        border: "1px solid rgba(127,127,127,0.25)",
		        display: "block",
		        cursor: "zoom-in"
		      },
		      onClick: () => window.open(url, "_blank")
		    }
		  );
		}
		function ComputerRow({ block, sessionId, loadImage }) {
		  const running = block !== null && typeof block === "object" && block.kind === void 0;
		  const settled = block !== null && typeof block === "object" && block.kind === "tool-result";
		  if (!running && !settled) return null;
		  const callArgs = running ? parseArgs(block.argsRaw) : block.call === null ? void 0 : parseArgs(block.call.argsRaw);
		  const headline = running ? runningHeadline(callArgs) : settledHeadline(callArgs);
		  if (headline === void 0) return null;
		  const isError = settled === true && block.isError === true;
		  const errorMessage = isError && typeof block.error?.name === "string" ? block.error.name : void 0;
		  const durationText = settled && typeof block.callTime === "number" ? formatDuration(Math.max(0, block.time - block.callTime)) : void 0;
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		    "div",
		    {
		      style: {
		        display: "flex",
		        alignItems: "center",
		        gap: 8,
		        padding: "6px 10px",
		        borderRadius: 8,
		        fontSize: 13,
		        lineHeight: "18px",
		        background: "var(--dsw-bg-subtle, rgba(127,127,127,0.08))"
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontSize: 14 }, "aria-hidden": true, children: "\u{1F5A5}\uFE0F" }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontWeight: 500 }, children: headline }),
		        running && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "span",
		          {
		            "aria-hidden": true,
		            style: {
		              width: 7,
		              height: 7,
		              borderRadius: "50%",
		              background: COLOR_ACCENT2,
		              animation: "dsh-computer-pulse 1s ease-in-out infinite"
		            }
		          }
		        ),
		        settled && errorMessage !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { color: COLOR_ERROR, fontSize: 12 }, children: [
		          "\u5931\u8D25 \xB7 ",
		          errorMessage
		        ] }),
		        settled && !isError && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { color: COLOR_MUTED2, fontSize: 12 }, children: [
		          "\u672C\u673A\u64CD\u4F5C\u5DF2\u6267\u884C",
		          durationText !== void 0 ? " \xB7 \u7528\u65F6 " + durationText : ""
		        ] }),
		        running && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("style", { children: "@keyframes dsh-computer-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.25 } }" })
		      ]
		    }
		  );
		}
		function ComputerCard(props) {
		  const { block, computerLoadImage } = props;
		  const row = ComputerRow(props);
		  if (row === null) return null;
		  const settled = block !== null && typeof block === "object" && block.kind === "tool-result";
		  const image = settled && !block.isError && block.action === void 0 ? firstImageAttachment(block.content) : void 0;
		  const isScreenshot = settled && !block.isError && block.call !== null && typeof block.call === "object" && (() => {
		    try {
		      return JSON.parse(block.call.argsRaw)?.action === "screenshot";
		    } catch {
		      return false;
		    }
		  })();
		  if (image === void 0 || !isScreenshot || typeof computerLoadImage !== "function") return row;
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
		    row,
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		      ScreenshotThumbnail,
		      {
		        load: computerLoadImage,
		        attachmentId: image.attachmentId
		      }
		    )
		  ] });
		}
		function apply(ctx) {
		  const loadImage = createImageLoader(ctx.sessions);
		  ctx.uiSession.provide({
		    props: ["computerLoadImage"],
		    resolve: (binding) => ({
		      props: {
		        computerLoadImage: (attachmentId) => loadImage(binding.sessionId, attachmentId)
		      }
		    })
		  });
		  ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({ name: "tool.call.toolview", key: "computer" }, ComputerCard));
		  registerSettingsSection(ctx);
		}

		return module.exports;
	}
});

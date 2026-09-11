window.__ModuleLoader__.load({
	id: "dsh-usage-glass",
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

		// src/client/index.ts
		var index_exports = {};
		__export(index_exports, {
		  LIQUID_GLASS_THEME: () => LIQUID_GLASS_THEME,
		  LIQUID_GLASS_THEME_ID: () => LIQUID_GLASS_THEME_ID,
		  apply: () => apply,
		  inject: () => inject,
		  name: () => name
		});
		module.exports = __toCommonJS(index_exports);

		// src/client/glass.css
		var glass_default = "/* Liquid Glass structural effects - active only while body[data-ds-glass] is\n   set by the theme plugin. Token values (translucent fills) come from the\n   registered theme; this sheet adds what tokens cannot express: the aurora\n   base under the sea canvas, backdrop blur, and specular edges. */\n\nbody[data-ds-glass] {\n  /* The aurora base behind the sea canvas (the canvas draws over it). */\n  background:\n    radial-gradient(120% 90% at 12% 0%, rgb(48 62 120 / 55%) 0%, transparent 55%),\n    radial-gradient(100% 80% at 88% 12%, rgb(28 96 120 / 42%) 0%, transparent 58%),\n    radial-gradient(120% 120% at 82% 100%, rgb(84 48 140 / 38%) 0%, transparent 60%),\n    radial-gradient(90% 90% at 40% 100%, rgb(20 60 90 / 30%) 0%, transparent 55%),\n    #070b14;\n  background-attachment: fixed;\n  /* Blur axis, driven by the settings page. */\n  --dsg-blur-main: 26px;\n}\n\n/* Sea wallpaper: the bottom-most layer (flowing color bands). A light scrim\n   keeps UI text readable above it; the canvas ignores pointer events. */\n[data-dsg-sea-wallpaper] {\n  position: fixed;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n}\n\n[data-dsg-sea-wallpaper]::after {\n  content: '';\n  position: absolute;\n  inset: 0;\n  background: rgb(4 7 14 / 32%);\n}\n\n/* The app frame rides above the wallpaper. */\nbody[data-ds-glass] > [class*='_frame_'] {\n  position: relative;\n  z-index: 1;\n}\n\n/* Sidebar column: the thinnest pane, blurred over the wallpaper. */\nbody[data-ds-glass] [class*='_sidebarCol_'] {\n  backdrop-filter: blur(var(--dsg-blur-main)) saturate(150%);\n  -webkit-backdrop-filter: blur(var(--dsg-blur-main)) saturate(150%);\n  background: var(--dsw-specific-sidebar-fill);\n}\n\n/* Center and details columns get a whisper of blur so cards float. */\nbody[data-ds-glass] [class*='_centerCol_'],\nbody[data-ds-glass] [class*='_detailsCol_'] {\n  backdrop-filter: blur(6px);\n  -webkit-backdrop-filter: blur(6px);\n}\n\n/* Shell overlay occupants (dialogs, popovers, panels). */\nbody[data-ds-glass] [data-shell-overlay] > * {\n  backdrop-filter: blur(var(--dsg-blur-main)) saturate(170%);\n  -webkit-backdrop-filter: blur(var(--dsg-blur-main)) saturate(170%);\n}\n\n/* Specular edge: a light-catching inner hairline on glass panes. */\nbody[data-ds-glass] [class*='_sidebarCol_'],\nbody[data-ds-glass] [data-shell-overlay] > * {\n  box-shadow:\n    inset 0 1px 0 rgb(255 255 255 / 14%),\n    inset 1px 0 0 rgb(255 255 255 / 7%),\n    inset -1px 0 0 rgb(255 255 255 / 7%),\n    0 8px 32px rgb(0 0 0 / 25%);\n}\n\n/* Cards and raised panes across features turn into frosted panes. */\nbody[data-ds-glass] [class*='_card_'],\nbody[data-ds-glass] [class*='_panel_']:not([data-shell-overlay]) {\n  backdrop-filter: blur(calc(var(--dsg-blur-main) * 0.7)) saturate(140%);\n  -webkit-backdrop-filter: blur(calc(var(--dsg-blur-main) * 0.7)) saturate(140%);\n}\n\n/* The settings dialog itself becomes the hero glass sheet. */\nbody[data-ds-glass] dialog {\n  backdrop-filter: blur(calc(var(--dsg-blur-main) + 4px)) saturate(160%);\n  -webkit-backdrop-filter: blur(calc(var(--dsg-blur-main) + 4px)) saturate(160%);\n}\n";

		// src/client/dsgx.css
		var dsgx_default = "/* dsh-usage-glass: dashboard, bubble, and glass page styles (dsgx- prefix). */\n\n/* ============ usage settings section ============ */\n.dsgx-section {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 720px;\n  color: var(--dsw-alias-label-primary);\n}\n.dsgx-heading {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 600;\n}\n.dsgx-intro {\n  margin: 0;\n  font-size: 13px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-card {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px 14px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-1);\n}\n.dsgx-cardTitle {\n  font-size: 13px;\n  font-weight: 600;\n}\n.dsgx-figures {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 10px;\n}\n.dsgx-figure {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  padding: 8px 10px;\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-2);\n}\n.dsgx-figureLabel {\n  font-size: 12px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-figureValue {\n  font-size: 16px;\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n}\n.dsgx-figure[data-figure='total'] .dsgx-figureValue {\n  color: var(--dsw-alias-brand-primary);\n}\n.dsgx-ledgerPath {\n  margin: 0;\n  font-size: 12px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-todayLine {\n  margin: 0;\n  font-size: 14px;\n}\n.dsgx-trend {\n  display: flex;\n  align-items: flex-end;\n  gap: 10px;\n}\n.dsgx-trendColumn {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-trendTrack {\n  display: flex;\n  align-items: flex-end;\n  width: 44px;\n  height: 72px;\n  border-radius: 4px;\n  background: var(--dsw-alias-bg-layer-2);\n  position: relative;\n  overflow: hidden;\n}\n.dsgx-trendBar {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  border-radius: 4px 4px 0 0;\n  background: var(--dsw-alias-brand-primary);\n  display: block;\n}\n.dsgx-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n}\n.dsgx-table th,\n.dsgx-table td {\n  padding: 6px 8px;\n  text-align: left;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n}\n.dsgx-table th {\n  color: var(--dsw-alias-label-tertiary);\n  font-weight: 500;\n}\n.dsgx-more {\n  margin: 0;\n  font-size: 12px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-refresh {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 6px;\n  padding: 4px 12px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n}\n.dsgx-refresh:hover {\n  color: var(--dsw-alias-label-primary);\n}\n\n/* ============ liquid glass settings page ============ */\n.dsgx-glassCard {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px 14px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-1);\n}\n.dsgx-glassRowTitle {\n  font-size: 13px;\n  font-weight: 600;\n}\n.dsgx-glassRowHint {\n  font-size: 12px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-glassRowHead {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n.dsgx-glassToggle {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 6px;\n  padding: 5px 14px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n}\n.dsgx-glassToggle:hover,\n.dsgx-glassToggle[aria-pressed='true'] {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-brand-primary);\n}\n.dsgx-glassOptionRow {\n  display: flex;\n  gap: 8px;\n}\n.dsgx-glassOption {\n  flex: 1;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  padding: 7px 10px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n}\n.dsgx-glassOption:hover,\n.dsgx-glassOption[aria-pressed='true'] {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-brand-primary);\n}\n.dsgx-glassSlider {\n  width: 100%;\n  accent-color: var(--dsw-alias-brand-primary);\n}\n.dsgx-glassHint {\n  margin: 0;\n  font-size: 11px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-glassIntro {\n  margin: 0;\n  font-size: 13px;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* ============ usage bubble ============ */\n.dsgx-bubbleLayer {\n  position: fixed;\n  inset: 0;\n  z-index: 60;\n  pointer-events: none;\n}\n.dsgx-bubble {\n  position: fixed;\n  right: 18px;\n  bottom: 18px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 7px 12px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 999px;\n  corner-shape: round;\n  background: var(--dsw-alias-bg-overlay);\n  color: var(--dsw-alias-label-secondary);\n  font: inherit;\n  font-size: 12px;\n  line-height: 16px;\n  cursor: pointer;\n  pointer-events: auto;\n  touch-action: none;\n  user-select: none;\n  backdrop-filter: blur(26px) saturate(170%);\n  -webkit-backdrop-filter: blur(26px) saturate(170%);\n  box-shadow:\n    inset 0 1px 0 rgb(255 255 255 / 14%),\n    0 4px 16px rgb(0 0 0 / 22%);\n}\n.dsgx-bubble:hover {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-border-l2);\n}\n.dsgx-bubble[data-failed='true'] {\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-bubbleBody {\n  display: flex;\n  align-items: baseline;\n  gap: 4px;\n}\n.dsgx-bubbleValue {\n  font-size: 13px;\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  color: var(--dsw-alias-brand-primary);\n}\n.dsgx-bubbleUnit {\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-bubbleMark {\n  font-weight: 600;\n}\n.dsgx-bubblePanel {\n  position: fixed;\n  right: 18px;\n  bottom: 64px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  width: 250px;\n  padding: 12px 14px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-overlay);\n  color: var(--dsw-alias-label-primary);\n  pointer-events: auto;\n  backdrop-filter: blur(26px) saturate(170%);\n  -webkit-backdrop-filter: blur(26px) saturate(170%);\n  box-shadow: 0 4px 16px rgb(0 0 0 / 22%);\n}\n.dsgx-bubblePanelHead {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.dsgx-bubblePanelTitle {\n  font-size: 13px;\n  font-weight: 600;\n}\n.dsgx-bubbleClose {\n  border: 0;\n  padding: 0 4px;\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary);\n  font: inherit;\n  font-size: 14px;\n  line-height: 18px;\n  cursor: pointer;\n}\n.dsgx-bubbleRow {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 12px;\n  font-size: 12px;\n}\n.dsgx-bubbleRowLabel {\n  color: var(--dsw-alias-label-tertiary);\n}\n.dsgx-bubbleRowValue {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n}\n.dsgx-bubbleHint {\n  margin: 0;\n  font-size: 11px;\n  color: var(--dsw-alias-label-tertiary);\n  overflow-wrap: anywhere;\n}\n\n/* ============ band color controls ============ */\n.dsgx-colorRow {\n  display: flex;\n  align-items: center;\n  gap: 18px;\n  margin-top: 10px;\n}\n.dsgx-colorCell {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary);\n}\n.dsgx-colorInput {\n  width: 44px;\n  height: 28px;\n  padding: 0;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  background: transparent;\n  cursor: pointer;\n}\n.dsgx-colorInput::-webkit-color-swatch-wrapper {\n  padding: 2px;\n}\n.dsgx-colorInput::-webkit-color-swatch {\n  border: none;\n  border-radius: 6px;\n}\n.dsgx-dice {\n  margin-left: auto;\n  padding: 4px 10px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 999px;\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-secondary);\n  font: inherit;\n  font-size: 13px;\n  line-height: 18px;\n  cursor: pointer;\n}\n.dsgx-dice:hover {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-border-l2);\n}\n";

		// src/liquid-glass-tokens.ts
		var GLASS_TOKENS = {
		  "--dsw-alias-bg-base": "rgba(10, 14, 24, 0.42)",
		  "--dsw-alias-bg-layer-1": "rgba(255, 255, 255, 0.065)",
		  "--dsw-alias-bg-layer-2": "rgba(255, 255, 255, 0.045)",
		  "--dsw-alias-bg-overlay": "rgba(18, 22, 34, 0.55)",
		  "--dsw-alias-border-l1": "rgba(255, 255, 255, 0.14)",
		  "--dsw-alias-border-l2": "rgba(255, 255, 255, 0.22)",
		  "--dsw-alias-brand-primary": "#6fd2ff",
		  "--dsw-alias-label-primary": "#f2f6ff",
		  "--dsw-alias-label-secondary": "rgba(235, 242, 255, 0.78)",
		  "--dsw-alias-state-error-primary": "#ff7d70",
		  "--dsw-alias-state-success-primary": "#5ce2a8",
		  "--dsw-alias-state-warn-primary": "#ffc06b",
		  "--dsw-specific-sidebar-fill": "rgba(255, 255, 255, 0.035)"
		};

		// src/client/sea-background-script.ts
		var sea_background_script_default = `var MatrixRainSea = (function (exports) {
		  'use strict';

		  // src/sea-background.ts
		  var THEMES = {
		    dark: { base: [0.094, 0.094, 0.106], colorA: [0.02, 8e-3, 0.06], colorB: [0.82, 0.55, 1], ray: [0.42, 0.25, 0.72], grid: [0.2, 0.17, 0.26], char: [0.72, 0.48, 1] },
		    light: { base: [0.976, 0.968, 0.965], colorA: [1, 0.85, 0.78], colorB: [0.996, 0.27, 0], ray: [1, 0.55, 0.3], grid: [0.92, 0.85, 0.82], char: [0.85, 0.32, 0.05] }
		  };
		  var THEME_KEYS = ["base", "colorA", "colorB", "ray", "grid", "char"];
		  var VERT = "#version 300 es\\nconst vec2 P[4] = vec2[4](vec2(-1,-1),vec2(1,-1),vec2(-1,1),vec2(1,1));void main(){ gl_Position = vec4(P[gl_VertexID],0.,1.); }";
		  var FRAG = "#version 300 es\\nprecision highp float;out vec4 fragColor;uniform vec2 uRes;uniform float uTime;uniform sampler2D uAtlas;uniform vec3 uBase;uniform vec3 uColorA;uniform vec3 uColorB;uniform vec3 uRayColor;uniform vec3 uGridColor;uniform vec3 uCharColor;uniform float uLayers;float hash21(vec2 p){ p = fract(p*vec2(233.34,851.73)); p += dot(p,p+23.45); return fract(p.x*p.y); }float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);  return mix(mix(hash21(i),hash21(i+vec2(1,0)),u.x), mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),u.x), u.y); }vec2 warp(vec2 uv, float detail, float t){  vec2 p = uv;  p.x += sin(uv.y*detail*1.7 + t*0.8)*0.12 + cos(uv.x*detail*0.9 - t*0.5)*0.05;  p.y += cos(uv.x*detail*1.3 - t*0.6)*0.12 + sin(uv.y*detail*1.1 + t*0.7)*0.05;  float d2 = detail*2.1;  p.x += cos(p.y*d2*2.7 - t*0.45)*0.07 + sin(p.x*d2*1.9 + t*0.6)*0.04;  p.y += sin(p.x*d2*2.3 + t*0.65)*0.07 + cos(p.y*d2*1.6 - t*0.4)*0.04;  float d3 = detail*3.7;  p.x += (sin(p.y*d3*1.8 + t*0.85)*0.04 + cos(p.x*d3*1.3 - t*0.55)*0.025) + sin((p.x+p.y)*d3*0.7 + t*0.9)*0.02;  p.y += (cos(p.x*d3*1.6 - t*0.75)*0.04 + sin(p.y*d3*1.1 + t*0.5)*0.025) + cos((p.x+p.y)*d3*0.8 - t*0.95)*0.02;  return p; }float fbm2(vec2 p){ return vnoise(p)*0.6 + vnoise(p*2.13 + 17.7)*0.4; }vec4 seaColor(vec2 uv, float t, vec3 cA, vec3 cB, float distortion, float seed){  vec2 e = uv - 0.5;  float aspect = uRes.x/uRes.y;  float a1 = fbm2(e*0.9 + vec2(t*0.035, -t*0.022) + seed) - 0.5;  float ang = a1 * 12.566371 * distortion;  float ca = cos(ang), sa = sin(ang);  vec2 c0 = vec2(e.x, e.y/aspect);  vec2 p = vec2(c0.x*ca - c0.y*sa, (c0.x*sa + c0.y*ca)*aspect);  p.x += sin(p.y*5.0 + t*0.15)/50.0*distortion*2.0;  p.y += sin(p.x*7.5 + t*0.15)/25.0*distortion*2.0;  float b1 = 0.5 + 0.5*sin(p.y*1.0 + p.x*0.4 + t*0.3);  float b2 = 0.5 + 0.5*sin(p.x*0.7 - p.y*0.55 - t*0.22 + 2.1);  float m = smoothstep(0.05, 0.95, 0.5 + 0.55*(b1-0.5) + 0.7*(b2-0.5));  vec3 cMid = vec3(0.36, 0.13, 0.85);  vec3 col = m < 0.5 ? mix(cA, cMid, m*2.0) : mix(cMid, cB, (m-0.5)*2.0);  col *= 1.0 + 0.09*sin(t*1.4 + b1*6.0);  return vec4(col, m); }float rayOct(vec2 cell, float pw){ return pow(vnoise(cell), pw); }float godrays(vec2 uv, float t, float density, float intensity, float spotty, float aspect, out vec2 sc){  sc = uv - vec2(0.72, 0.78); sc.x *= aspect;  float ang = atan(sc.y, sc.x);  float r = length(sc);  float ta = t*0.2;  float pw = 4.0 - 3.0*clamp(intensity,0.,1.);  float fade = smoothstep(-0.15, 0.15, sc.x);  float f1 = 30.0*density;  float o1 = rayOct(vec2(ang*f1,     r*1.0 - ta*3.0), pw);  float o2 = rayOct(vec2(ang*f1,     r*0.5*(1.0+6.5*abs(spotty)) - ta*2.0), pw);  float f3 = f1*4.5;  float o3 = rayOct(vec2(ang*f3,     r*1.4 - ta*2.5), pw);  float o4 = rayOct(vec2(ang*f3*3.5, r*0.7*(1.0+6.5*abs(spotty)) - ta*1.8), pw);  return clamp(o1*o2 + o3*o4*0.7, 0., 1.) * fade; }float lum(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }void main(){  vec2 uv = gl_FragCoord.xy / uRes;  float aspect = uRes.x/uRes.y;  float L = uLayers;  vec3 col = uBase;  if (L >= 1.0) { float gsz = 42.0;    vec2 gp = fract(uv*vec2(gsz*aspect, gsz));    vec2 gd = min(gp, 1.0-gp);    float line = 1.0 - smoothstep(0.0, 0.06, min(gd.x, gd.y));    col = mix(col, uGridColor, line*0.03); }  vec4 sea = vec4(uBase, 0.5);  if (L >= 4.0) {    sea = seaColor(uv, uTime, uColorA, uColorB, 0.5, 0.17);    vec3 seaRGB = (L >= 2.0) ? mix(uBase*0.3, sea.rgb, 0.25 + 0.75*sea.a) : sea.rgb;    col = seaRGB; }  if (L >= 8.0) {    vec2 sc2;    float rays = godrays(uv, uTime, 0.55, 0.66, 0.35, aspect, sc2);    float distFade = 1.0 - smoothstep(0.0, 1.2, length(sc2));    col = mix(col, uRayColor, rays*0.28*distFade + distFade*0.16); }  if (L >= 2.0) {    float cols = 90.0;    vec2 nc = vec2(cols*aspect, cols);    vec2 cid = floor(uv*nc);    vec2 cuc = fract(uv*nc);    vec2 cc = (cid + 0.5)/nc;    vec3 cellSea;    if (L >= 4.0) { cellSea = seaColor(cc, uTime, uColorA, uColorB, 0.5, 0.17).rgb; }    else { cellSea = mix(uBase, uCharColor, 0.25 + 0.5*hash21(cid)); }    float srcLum = lum(cellSea);    float bright = smoothstep(0.03, 0.45, srcLum);    float ci = clamp(floor((1.0 - pow(clamp(srcLum,0.,1.), 1.1)) * 63.0), 0.0, 63.0);    float ccol = mod(ci, 16.0);    float crow = floor(ci/16.0);    vec2 pad = clamp(cuc, 0.12, 0.88) - cuc;    vec2 auv = vec2((ccol + cuc.x + pad.x*sign(cuc.x-0.5))/16.0,                    1.0 - (crow + 1.0 - (cuc.y + pad.y*sign(cuc.y-0.5)))/4.0);    float ch = texture(uAtlas, auv).a;    float tw = sin(uTime*1.6 + hash21(cid)*6.283)*0.5 + 0.5;    float a = ch * bright * (0.55 + 0.45*tw) * 0.3;    col = mix(col, cellSea * 1.35, a); }  if (L >= 16.0) {    float wy = 0.30 + 0.06*sin(uv.x*3.0*6.28318 + uTime*0.5);    float wl = 1.0 - smoothstep(0.0012, 0.0035, abs(uv.y - wy));    col = mix(col, uCharColor*1.3, wl*0.6); }  fragColor = vec4(col, 1.0);}";
		  function makeAtlas() {
		    const chars = "01<>[]{}#$%*+=-:;.^~\\\\/|ABCDEFXYZ";
		    const cols = 16, rows = 4, cell = 48;
		    const cv = document.createElement("canvas");
		    cv.width = cols * cell;
		    cv.height = rows * cell;
		    const c = cv.getContext("2d");
		    c.fillStyle = "#fff";
		    c.font = "600 32px ui-monospace, Menlo, monospace";
		    c.textAlign = "center";
		    c.textBaseline = "middle";
		    for (let i = 0; i < 64; i++) {
		      c.fillText(chars[i % chars.length], (i % cols + 0.5) * cell, (Math.floor(i / cols) + 0.5) * cell);
		    }
		    return cv;
		  }
		  function createSeaBackground(options) {
		    const container = options.container;
		    const canvas = document.createElement("canvas");
		    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
		    canvas.style.zIndex = String(options.zIndex ?? 0);
		    canvas.style.opacity = String(options.opacity ?? 0.9);
		    container.appendChild(canvas);
		    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
		    if (!gl) {
		      const noop = () => {
		      };
		      return { canvas, setTheme: noop, setSpeed: noop, setLayers: noop, setColors: noop, clearColors: noop, destroy: () => canvas.remove() };
		    }
		    const compile = (type, src) => {
		      const s = gl.createShader(type);
		      gl.shaderSource(s, src);
		      gl.compileShader(s);
		      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("[SeaBackground] " + gl.getShaderInfoLog(s));
		      return s;
		    };
		    const prog = gl.createProgram();
		    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
		    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
		    gl.linkProgram(prog);
		    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("[SeaBackground] " + gl.getProgramInfoLog(prog));
		    gl.useProgram(prog);
		    const U = {};
		    for (const n of ["uRes", "uTime", "uAtlas", "uBase", "uColorA", "uColorB", "uRayColor", "uGridColor", "uCharColor", "uLayers"])
		      U[n] = gl.getUniformLocation(prog, n);
		    const tex = gl.createTexture();
		    gl.bindTexture(gl.TEXTURE_2D, tex);
		    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, makeAtlas());
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		    gl.uniform1i(U.uAtlas, 0);
		    const resize = () => {
		      const dpr = Math.min(window.devicePixelRatio || 1, 2);
		      const w = canvas.clientWidth, h = canvas.clientHeight;
		      canvas.width = Math.max(1, Math.round(w * dpr));
		      canvas.height = Math.max(1, Math.round(h * dpr));
		      gl.viewport(0, 0, canvas.width, canvas.height);
		    };
		    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
		    if (ro) ro.observe(container);
		    resize();
		    let custom = null;
		    const cur = JSON.parse(JSON.stringify(THEMES[options.theme ?? "dark"]));
		    if (options.colorA || options.colorB) custom = { colorA: options.colorA ?? null, colorB: options.colorB ?? null };
		    let target = options.theme ?? "dark";
		    let tweenStart = -1;
		    let speed = options.speed ?? 1;
		    const colorWave = options.colorWave !== false;
		    const L = options.layers ?? {};
		    let layerBits = (L.grid === false ? 0 : 1) | (L.ascii === false ? 0 : 2) | (L.gradient === false ? 0 : 4) | (L.rays === false ? 0 : 8) | (L.wave === false ? 0 : 16);
		    const easeOut = (t2) => 1 - Math.pow(1 - t2, 4);
		    let t = 0;
		    let last = performance.now();
		    let rafId = 0;
		    let destroyed = false;
		    const frame = (now) => {
		      if (destroyed) return;
		      const dt = Math.min((now - last) / 1e3, 0.05);
		      last = now;
		      t += dt * speed;
		      const k = tweenStart < 0 ? 1 : Math.min((now - tweenStart) / 1200, 1);
		      const e = k >= 1 ? 1 : easeOut(k);
		      const T0 = THEMES[target];
		      const T = custom ? { base: T0.base, colorA: custom.colorA || T0.colorA, colorB: custom.colorB || T0.colorB, ray: T0.ray, grid: T0.grid, char: T0.char } : T0;
		      for (const key of THEME_KEYS) for (let i = 0; i < 3; i++)
		        cur[key][i] += (T[key][i] - cur[key][i]) * e;
		      gl.uniform2f(U.uRes, canvas.width, canvas.height);
		      gl.uniform1f(U.uTime, t);
		      gl.uniform3fv(U.uBase, cur.base);
		      if (colorWave) {
		        const drift = (seed, tt, amp) => {
		          const v = 0.5 + 0.5 * Math.sin(tt * 0.17 + seed * 12.9) * 0.72 + 0.28 * Math.sin(tt * 0.41 + seed * 78.2);
		          return (v - 0.5) * 2 * amp;
		        };
		        const hueShift = drift(1, t, 22);
		        const lumA = 1 + drift(2, t, 0.12);
		        const lumB = 1 + drift(3, t, 0.12);
		        const shift = (rgb, dH, dL) => {
		          const mx = Math.max(rgb[0], rgb[1], rgb[2]), mn = Math.min(rgb[0], rgb[1], rgb[2]);
		          const l = (mx + mn) / 2;
		          let h = 0, s = 0;
		          if (mx !== mn) {
		            const dd = mx - mn;
		            s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
		            h = mx === rgb[0] ? (rgb[1] - rgb[2]) / dd + (rgb[1] < rgb[2] ? 6 : 0) : mx === rgb[1] ? (rgb[2] - rgb[0]) / dd + 2 : (rgb[0] - rgb[1]) / dd + 4;
		            h *= 60;
		          }
		          h = ((h + dH) % 360 + 360) % 360;
		          const s2 = Math.min(1, s * 1.06);
		          const l2 = Math.max(0, Math.min(1, l * dL));
		          const cc = (1 - Math.abs(2 * l2 - 1)) * s2;
		          const hp = h / 60, x2 = cc * (1 - Math.abs(hp % 2 - 1));
		          let r2 = 0, g2 = 0, b2 = 0;
		          if (hp < 1) {
		            r2 = cc;
		            g2 = x2;
		          } else if (hp < 2) {
		            r2 = x2;
		            g2 = cc;
		          } else if (hp < 3) {
		            g2 = cc;
		            b2 = x2;
		          } else if (hp < 4) {
		            g2 = x2;
		            b2 = cc;
		          } else if (hp < 5) {
		            r2 = x2;
		            b2 = cc;
		          } else {
		            r2 = cc;
		            b2 = x2;
		          }
		          const m2 = l2 - cc / 2;
		          return [r2 + m2, g2 + m2, b2 + m2];
		        };
		        gl.uniform3fv(U.uColorA, shift(cur.colorA, hueShift, lumA));
		        gl.uniform3fv(U.uColorB, shift(cur.colorB, hueShift * 0.6, lumB));
		      } else {
		        gl.uniform3fv(U.uColorA, cur.colorA);
		        gl.uniform3fv(U.uColorB, cur.colorB);
		      }
		      gl.uniform3fv(U.uRayColor, cur.ray);
		      gl.uniform3fv(U.uGridColor, cur.grid);
		      gl.uniform3fv(U.uCharColor, cur.char);
		      gl.uniform1f(U.uLayers, layerBits);
		      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		      rafId = requestAnimationFrame(frame);
		    };
		    rafId = requestAnimationFrame(frame);
		    return {
		      canvas,
		      setTheme(theme) {
		        target = theme;
		        tweenStart = performance.now();
		      },
		      setSpeed(n) {
		        speed = Math.max(0, n);
		      },
		      setLayers(partial) {
		        const merged = { grid: !!(layerBits & 1), ascii: !!(layerBits & 2), gradient: !!(layerBits & 4), rays: !!(layerBits & 8), wave: !!(layerBits & 16), ...partial };
		        layerBits = (merged.grid ? 1 : 0) | (merged.ascii ? 2 : 0) | (merged.gradient ? 4 : 0) | (merged.rays ? 8 : 0) | (merged.wave ? 16 : 0);
		      },
		      setColors(colorA, colorB) {
		        custom = { colorA: colorA ?? null, colorB: colorB ?? null };
		        tweenStart = performance.now();
		      },
		      clearColors() {
		        custom = null;
		        tweenStart = performance.now();
		      },
		      destroy() {
		        destroyed = true;
		        cancelAnimationFrame(rafId);
		        if (ro) ro.disconnect();
		        canvas.remove();
		      }
		    };
		  }

		  exports.createSeaBackground = createSeaBackground;

		  return exports;

		})({});
		`;

		// src/client/sea-wallpaper.ts
		var WALLPAPER_SELECTOR = "[data-dsg-sea-wallpaper]";
		var scriptInjected = false;
		var instance;
		function hexToRgb(hex) {
		  if (hex === void 0) return void 0;
		  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
		  if (match === null) return void 0;
		  const value = parseInt(match[1], 16);
		  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
		}
		function mountSeaWallpaper(params) {
		  if (typeof document === "undefined") return;
		  if (document.querySelector(WALLPAPER_SELECTOR) !== null) return;
		  if (!scriptInjected) {
		    const script = document.createElement("script");
		    script.textContent = sea_background_script_default;
		    document.head.appendChild(script);
		    scriptInjected = true;
		  }
		  const layer = document.createElement("div");
		  layer.setAttribute("data-dsg-sea-wallpaper", "");
		  document.body.prepend(layer);
		  const globalApi = window.MatrixRainSea;
		  if (globalApi?.createSeaBackground === void 0) return;
		  const colorA = hexToRgb(params.colorA);
		  const colorB = hexToRgb(params.colorB);
		  instance = globalApi.createSeaBackground({
		    container: layer,
		    theme: params.seaTheme,
		    speed: params.speed,
		    colorWave: true,
		    opacity: 1,
		    ...colorA !== void 0 ? { colorA } : {},
		    ...colorB !== void 0 ? { colorB } : {}
		  });
		}
		function updateSeaWallpaper(params) {
		  if (instance === void 0) return;
		  instance.setTheme?.(params.seaTheme);
		  instance.setSpeed?.(params.speed);
		  const colorA = hexToRgb(params.colorA);
		  const colorB = hexToRgb(params.colorB);
		  if (colorA !== void 0 || colorB !== void 0) {
		    instance.setColors?.(colorA, colorB);
		  } else {
		    instance.clearColors?.();
		  }
		}
		function unmountSeaWallpaper() {
		  if (typeof document === "undefined") return;
		  document.querySelector(WALLPAPER_SELECTOR)?.remove();
		  instance?.destroy();
		  instance = void 0;
		}

		// ../../../../node_modules/zod/dist/esm/v3/external.js
		var external_exports = {};
		__export(external_exports, {
		  BRAND: () => BRAND,
		  DIRTY: () => DIRTY,
		  EMPTY_PATH: () => EMPTY_PATH,
		  INVALID: () => INVALID,
		  NEVER: () => NEVER,
		  OK: () => OK,
		  ParseStatus: () => ParseStatus,
		  Schema: () => ZodType,
		  ZodAny: () => ZodAny,
		  ZodArray: () => ZodArray,
		  ZodBigInt: () => ZodBigInt,
		  ZodBoolean: () => ZodBoolean,
		  ZodBranded: () => ZodBranded,
		  ZodCatch: () => ZodCatch,
		  ZodDate: () => ZodDate,
		  ZodDefault: () => ZodDefault,
		  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
		  ZodEffects: () => ZodEffects,
		  ZodEnum: () => ZodEnum,
		  ZodError: () => ZodError,
		  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
		  ZodFunction: () => ZodFunction,
		  ZodIntersection: () => ZodIntersection,
		  ZodIssueCode: () => ZodIssueCode,
		  ZodLazy: () => ZodLazy,
		  ZodLiteral: () => ZodLiteral,
		  ZodMap: () => ZodMap,
		  ZodNaN: () => ZodNaN,
		  ZodNativeEnum: () => ZodNativeEnum,
		  ZodNever: () => ZodNever,
		  ZodNull: () => ZodNull,
		  ZodNullable: () => ZodNullable,
		  ZodNumber: () => ZodNumber,
		  ZodObject: () => ZodObject,
		  ZodOptional: () => ZodOptional,
		  ZodParsedType: () => ZodParsedType,
		  ZodPipeline: () => ZodPipeline,
		  ZodPromise: () => ZodPromise,
		  ZodReadonly: () => ZodReadonly,
		  ZodRecord: () => ZodRecord,
		  ZodSchema: () => ZodType,
		  ZodSet: () => ZodSet,
		  ZodString: () => ZodString,
		  ZodSymbol: () => ZodSymbol,
		  ZodTransformer: () => ZodEffects,
		  ZodTuple: () => ZodTuple,
		  ZodType: () => ZodType,
		  ZodUndefined: () => ZodUndefined,
		  ZodUnion: () => ZodUnion,
		  ZodUnknown: () => ZodUnknown,
		  ZodVoid: () => ZodVoid,
		  addIssueToContext: () => addIssueToContext,
		  any: () => anyType,
		  array: () => arrayType,
		  bigint: () => bigIntType,
		  boolean: () => booleanType,
		  coerce: () => coerce,
		  custom: () => custom,
		  date: () => dateType,
		  datetimeRegex: () => datetimeRegex,
		  defaultErrorMap: () => en_default,
		  discriminatedUnion: () => discriminatedUnionType,
		  effect: () => effectsType,
		  enum: () => enumType,
		  function: () => functionType,
		  getErrorMap: () => getErrorMap,
		  getParsedType: () => getParsedType,
		  instanceof: () => instanceOfType,
		  intersection: () => intersectionType,
		  isAborted: () => isAborted,
		  isAsync: () => isAsync,
		  isDirty: () => isDirty,
		  isValid: () => isValid,
		  late: () => late,
		  lazy: () => lazyType,
		  literal: () => literalType,
		  makeIssue: () => makeIssue,
		  map: () => mapType,
		  nan: () => nanType,
		  nativeEnum: () => nativeEnumType,
		  never: () => neverType,
		  null: () => nullType,
		  nullable: () => nullableType,
		  number: () => numberType,
		  object: () => objectType,
		  objectUtil: () => objectUtil,
		  oboolean: () => oboolean,
		  onumber: () => onumber,
		  optional: () => optionalType,
		  ostring: () => ostring,
		  pipeline: () => pipelineType,
		  preprocess: () => preprocessType,
		  promise: () => promiseType,
		  quotelessJson: () => quotelessJson,
		  record: () => recordType,
		  set: () => setType,
		  setErrorMap: () => setErrorMap,
		  strictObject: () => strictObjectType,
		  string: () => stringType,
		  symbol: () => symbolType,
		  transformer: () => effectsType,
		  tuple: () => tupleType,
		  undefined: () => undefinedType,
		  union: () => unionType,
		  unknown: () => unknownType,
		  util: () => util,
		  void: () => voidType
		});

		// ../../../../node_modules/zod/dist/esm/v3/helpers/util.js
		var util;
		(function(util2) {
		  util2.assertEqual = (_) => {
		  };
		  function assertIs(_arg) {
		  }
		  util2.assertIs = assertIs;
		  function assertNever(_x) {
		    throw new Error();
		  }
		  util2.assertNever = assertNever;
		  util2.arrayToEnum = (items) => {
		    const obj = {};
		    for (const item of items) {
		      obj[item] = item;
		    }
		    return obj;
		  };
		  util2.getValidEnumValues = (obj) => {
		    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
		    const filtered = {};
		    for (const k of validKeys) {
		      filtered[k] = obj[k];
		    }
		    return util2.objectValues(filtered);
		  };
		  util2.objectValues = (obj) => {
		    return util2.objectKeys(obj).map(function(e) {
		      return obj[e];
		    });
		  };
		  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
		    const keys = [];
		    for (const key in object) {
		      if (Object.prototype.hasOwnProperty.call(object, key)) {
		        keys.push(key);
		      }
		    }
		    return keys;
		  };
		  util2.find = (arr, checker) => {
		    for (const item of arr) {
		      if (checker(item))
		        return item;
		    }
		    return void 0;
		  };
		  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
		  function joinValues(array, separator = " | ") {
		    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
		  }
		  util2.joinValues = joinValues;
		  util2.jsonStringifyReplacer = (_, value) => {
		    if (typeof value === "bigint") {
		      return value.toString();
		    }
		    return value;
		  };
		})(util || (util = {}));
		var objectUtil;
		(function(objectUtil2) {
		  objectUtil2.mergeShapes = (first, second) => {
		    return {
		      ...first,
		      ...second
		      // second overwrites first
		    };
		  };
		})(objectUtil || (objectUtil = {}));
		var ZodParsedType = util.arrayToEnum([
		  "string",
		  "nan",
		  "number",
		  "integer",
		  "float",
		  "boolean",
		  "date",
		  "bigint",
		  "symbol",
		  "function",
		  "undefined",
		  "null",
		  "array",
		  "object",
		  "unknown",
		  "promise",
		  "void",
		  "never",
		  "map",
		  "set"
		]);
		var getParsedType = (data) => {
		  const t = typeof data;
		  switch (t) {
		    case "undefined":
		      return ZodParsedType.undefined;
		    case "string":
		      return ZodParsedType.string;
		    case "number":
		      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
		    case "boolean":
		      return ZodParsedType.boolean;
		    case "function":
		      return ZodParsedType.function;
		    case "bigint":
		      return ZodParsedType.bigint;
		    case "symbol":
		      return ZodParsedType.symbol;
		    case "object":
		      if (Array.isArray(data)) {
		        return ZodParsedType.array;
		      }
		      if (data === null) {
		        return ZodParsedType.null;
		      }
		      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
		        return ZodParsedType.promise;
		      }
		      if (typeof Map !== "undefined" && data instanceof Map) {
		        return ZodParsedType.map;
		      }
		      if (typeof Set !== "undefined" && data instanceof Set) {
		        return ZodParsedType.set;
		      }
		      if (typeof Date !== "undefined" && data instanceof Date) {
		        return ZodParsedType.date;
		      }
		      return ZodParsedType.object;
		    default:
		      return ZodParsedType.unknown;
		  }
		};

		// ../../../../node_modules/zod/dist/esm/v3/ZodError.js
		var ZodIssueCode = util.arrayToEnum([
		  "invalid_type",
		  "invalid_literal",
		  "custom",
		  "invalid_union",
		  "invalid_union_discriminator",
		  "invalid_enum_value",
		  "unrecognized_keys",
		  "invalid_arguments",
		  "invalid_return_type",
		  "invalid_date",
		  "invalid_string",
		  "too_small",
		  "too_big",
		  "invalid_intersection_types",
		  "not_multiple_of",
		  "not_finite"
		]);
		var quotelessJson = (obj) => {
		  const json = JSON.stringify(obj, null, 2);
		  return json.replace(/"([^"]+)":/g, "$1:");
		};
		var ZodError = class _ZodError extends Error {
		  get errors() {
		    return this.issues;
		  }
		  constructor(issues) {
		    super();
		    this.issues = [];
		    this.addIssue = (sub) => {
		      this.issues = [...this.issues, sub];
		    };
		    this.addIssues = (subs = []) => {
		      this.issues = [...this.issues, ...subs];
		    };
		    const actualProto = new.target.prototype;
		    if (Object.setPrototypeOf) {
		      Object.setPrototypeOf(this, actualProto);
		    } else {
		      this.__proto__ = actualProto;
		    }
		    this.name = "ZodError";
		    this.issues = issues;
		  }
		  format(_mapper) {
		    const mapper = _mapper || function(issue) {
		      return issue.message;
		    };
		    const fieldErrors = { _errors: [] };
		    const processError = (error) => {
		      for (const issue of error.issues) {
		        if (issue.code === "invalid_union") {
		          issue.unionErrors.map(processError);
		        } else if (issue.code === "invalid_return_type") {
		          processError(issue.returnTypeError);
		        } else if (issue.code === "invalid_arguments") {
		          processError(issue.argumentsError);
		        } else if (issue.path.length === 0) {
		          fieldErrors._errors.push(mapper(issue));
		        } else {
		          let curr = fieldErrors;
		          let i = 0;
		          while (i < issue.path.length) {
		            const el = issue.path[i];
		            const terminal = i === issue.path.length - 1;
		            if (!terminal) {
		              curr[el] = curr[el] || { _errors: [] };
		            } else {
		              curr[el] = curr[el] || { _errors: [] };
		              curr[el]._errors.push(mapper(issue));
		            }
		            curr = curr[el];
		            i++;
		          }
		        }
		      }
		    };
		    processError(this);
		    return fieldErrors;
		  }
		  static assert(value) {
		    if (!(value instanceof _ZodError)) {
		      throw new Error(`Not a ZodError: ${value}`);
		    }
		  }
		  toString() {
		    return this.message;
		  }
		  get message() {
		    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
		  }
		  get isEmpty() {
		    return this.issues.length === 0;
		  }
		  flatten(mapper = (issue) => issue.message) {
		    const fieldErrors = {};
		    const formErrors = [];
		    for (const sub of this.issues) {
		      if (sub.path.length > 0) {
		        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
		        fieldErrors[sub.path[0]].push(mapper(sub));
		      } else {
		        formErrors.push(mapper(sub));
		      }
		    }
		    return { formErrors, fieldErrors };
		  }
		  get formErrors() {
		    return this.flatten();
		  }
		};
		ZodError.create = (issues) => {
		  const error = new ZodError(issues);
		  return error;
		};

		// ../../../../node_modules/zod/dist/esm/v3/locales/en.js
		var errorMap = (issue, _ctx) => {
		  let message;
		  switch (issue.code) {
		    case ZodIssueCode.invalid_type:
		      if (issue.received === ZodParsedType.undefined) {
		        message = "Required";
		      } else {
		        message = `Expected ${issue.expected}, received ${issue.received}`;
		      }
		      break;
		    case ZodIssueCode.invalid_literal:
		      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
		      break;
		    case ZodIssueCode.unrecognized_keys:
		      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
		      break;
		    case ZodIssueCode.invalid_union:
		      message = `Invalid input`;
		      break;
		    case ZodIssueCode.invalid_union_discriminator:
		      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
		      break;
		    case ZodIssueCode.invalid_enum_value:
		      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
		      break;
		    case ZodIssueCode.invalid_arguments:
		      message = `Invalid function arguments`;
		      break;
		    case ZodIssueCode.invalid_return_type:
		      message = `Invalid function return type`;
		      break;
		    case ZodIssueCode.invalid_date:
		      message = `Invalid date`;
		      break;
		    case ZodIssueCode.invalid_string:
		      if (typeof issue.validation === "object") {
		        if ("includes" in issue.validation) {
		          message = `Invalid input: must include "${issue.validation.includes}"`;
		          if (typeof issue.validation.position === "number") {
		            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
		          }
		        } else if ("startsWith" in issue.validation) {
		          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
		        } else if ("endsWith" in issue.validation) {
		          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
		        } else {
		          util.assertNever(issue.validation);
		        }
		      } else if (issue.validation !== "regex") {
		        message = `Invalid ${issue.validation}`;
		      } else {
		        message = "Invalid";
		      }
		      break;
		    case ZodIssueCode.too_small:
		      if (issue.type === "array")
		        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
		      else if (issue.type === "string")
		        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
		      else if (issue.type === "number")
		        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
		      else if (issue.type === "date")
		        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
		      else
		        message = "Invalid input";
		      break;
		    case ZodIssueCode.too_big:
		      if (issue.type === "array")
		        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
		      else if (issue.type === "string")
		        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
		      else if (issue.type === "number")
		        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
		      else if (issue.type === "bigint")
		        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
		      else if (issue.type === "date")
		        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
		      else
		        message = "Invalid input";
		      break;
		    case ZodIssueCode.custom:
		      message = `Invalid input`;
		      break;
		    case ZodIssueCode.invalid_intersection_types:
		      message = `Intersection results could not be merged`;
		      break;
		    case ZodIssueCode.not_multiple_of:
		      message = `Number must be a multiple of ${issue.multipleOf}`;
		      break;
		    case ZodIssueCode.not_finite:
		      message = "Number must be finite";
		      break;
		    default:
		      message = _ctx.defaultError;
		      util.assertNever(issue);
		  }
		  return { message };
		};
		var en_default = errorMap;

		// ../../../../node_modules/zod/dist/esm/v3/errors.js
		var overrideErrorMap = en_default;
		function setErrorMap(map) {
		  overrideErrorMap = map;
		}
		function getErrorMap() {
		  return overrideErrorMap;
		}

		// ../../../../node_modules/zod/dist/esm/v3/helpers/parseUtil.js
		var makeIssue = (params) => {
		  const { data, path, errorMaps, issueData } = params;
		  const fullPath = [...path, ...issueData.path || []];
		  const fullIssue = {
		    ...issueData,
		    path: fullPath
		  };
		  if (issueData.message !== void 0) {
		    return {
		      ...issueData,
		      path: fullPath,
		      message: issueData.message
		    };
		  }
		  let errorMessage = "";
		  const maps = errorMaps.filter((m) => !!m).slice().reverse();
		  for (const map of maps) {
		    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
		  }
		  return {
		    ...issueData,
		    path: fullPath,
		    message: errorMessage
		  };
		};
		var EMPTY_PATH = [];
		function addIssueToContext(ctx, issueData) {
		  const overrideMap = getErrorMap();
		  const issue = makeIssue({
		    issueData,
		    data: ctx.data,
		    path: ctx.path,
		    errorMaps: [
		      ctx.common.contextualErrorMap,
		      // contextual error map is first priority
		      ctx.schemaErrorMap,
		      // then schema-bound map if available
		      overrideMap,
		      // then global override map
		      overrideMap === en_default ? void 0 : en_default
		      // then global default map
		    ].filter((x) => !!x)
		  });
		  ctx.common.issues.push(issue);
		}
		var ParseStatus = class _ParseStatus {
		  constructor() {
		    this.value = "valid";
		  }
		  dirty() {
		    if (this.value === "valid")
		      this.value = "dirty";
		  }
		  abort() {
		    if (this.value !== "aborted")
		      this.value = "aborted";
		  }
		  static mergeArray(status, results) {
		    const arrayValue = [];
		    for (const s of results) {
		      if (s.status === "aborted")
		        return INVALID;
		      if (s.status === "dirty")
		        status.dirty();
		      arrayValue.push(s.value);
		    }
		    return { status: status.value, value: arrayValue };
		  }
		  static async mergeObjectAsync(status, pairs) {
		    const syncPairs = [];
		    for (const pair of pairs) {
		      const key = await pair.key;
		      const value = await pair.value;
		      syncPairs.push({
		        key,
		        value
		      });
		    }
		    return _ParseStatus.mergeObjectSync(status, syncPairs);
		  }
		  static mergeObjectSync(status, pairs) {
		    const finalObject = {};
		    for (const pair of pairs) {
		      const { key, value } = pair;
		      if (key.status === "aborted")
		        return INVALID;
		      if (value.status === "aborted")
		        return INVALID;
		      if (key.status === "dirty")
		        status.dirty();
		      if (value.status === "dirty")
		        status.dirty();
		      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
		        finalObject[key.value] = value.value;
		      }
		    }
		    return { status: status.value, value: finalObject };
		  }
		};
		var INVALID = Object.freeze({
		  status: "aborted"
		});
		var DIRTY = (value) => ({ status: "dirty", value });
		var OK = (value) => ({ status: "valid", value });
		var isAborted = (x) => x.status === "aborted";
		var isDirty = (x) => x.status === "dirty";
		var isValid = (x) => x.status === "valid";
		var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

		// ../../../../node_modules/zod/dist/esm/v3/helpers/errorUtil.js
		var errorUtil;
		(function(errorUtil2) {
		  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
		  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
		})(errorUtil || (errorUtil = {}));

		// ../../../../node_modules/zod/dist/esm/v3/types.js
		var ParseInputLazyPath = class {
		  constructor(parent, value, path, key) {
		    this._cachedPath = [];
		    this.parent = parent;
		    this.data = value;
		    this._path = path;
		    this._key = key;
		  }
		  get path() {
		    if (!this._cachedPath.length) {
		      if (Array.isArray(this._key)) {
		        this._cachedPath.push(...this._path, ...this._key);
		      } else {
		        this._cachedPath.push(...this._path, this._key);
		      }
		    }
		    return this._cachedPath;
		  }
		};
		var handleResult = (ctx, result) => {
		  if (isValid(result)) {
		    return { success: true, data: result.value };
		  } else {
		    if (!ctx.common.issues.length) {
		      throw new Error("Validation failed but no issues detected.");
		    }
		    return {
		      success: false,
		      get error() {
		        if (this._error)
		          return this._error;
		        const error = new ZodError(ctx.common.issues);
		        this._error = error;
		        return this._error;
		      }
		    };
		  }
		};
		function processCreateParams(params) {
		  if (!params)
		    return {};
		  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
		  if (errorMap2 && (invalid_type_error || required_error)) {
		    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
		  }
		  if (errorMap2)
		    return { errorMap: errorMap2, description };
		  const customMap = (iss, ctx) => {
		    const { message } = params;
		    if (iss.code === "invalid_enum_value") {
		      return { message: message ?? ctx.defaultError };
		    }
		    if (typeof ctx.data === "undefined") {
		      return { message: message ?? required_error ?? ctx.defaultError };
		    }
		    if (iss.code !== "invalid_type")
		      return { message: ctx.defaultError };
		    return { message: message ?? invalid_type_error ?? ctx.defaultError };
		  };
		  return { errorMap: customMap, description };
		}
		var ZodType = class {
		  get description() {
		    return this._def.description;
		  }
		  _getType(input) {
		    return getParsedType(input.data);
		  }
		  _getOrReturnCtx(input, ctx) {
		    return ctx || {
		      common: input.parent.common,
		      data: input.data,
		      parsedType: getParsedType(input.data),
		      schemaErrorMap: this._def.errorMap,
		      path: input.path,
		      parent: input.parent
		    };
		  }
		  _processInputParams(input) {
		    return {
		      status: new ParseStatus(),
		      ctx: {
		        common: input.parent.common,
		        data: input.data,
		        parsedType: getParsedType(input.data),
		        schemaErrorMap: this._def.errorMap,
		        path: input.path,
		        parent: input.parent
		      }
		    };
		  }
		  _parseSync(input) {
		    const result = this._parse(input);
		    if (isAsync(result)) {
		      throw new Error("Synchronous parse encountered promise.");
		    }
		    return result;
		  }
		  _parseAsync(input) {
		    const result = this._parse(input);
		    return Promise.resolve(result);
		  }
		  parse(data, params) {
		    const result = this.safeParse(data, params);
		    if (result.success)
		      return result.data;
		    throw result.error;
		  }
		  safeParse(data, params) {
		    const ctx = {
		      common: {
		        issues: [],
		        async: params?.async ?? false,
		        contextualErrorMap: params?.errorMap
		      },
		      path: params?.path || [],
		      schemaErrorMap: this._def.errorMap,
		      parent: null,
		      data,
		      parsedType: getParsedType(data)
		    };
		    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
		    return handleResult(ctx, result);
		  }
		  "~validate"(data) {
		    const ctx = {
		      common: {
		        issues: [],
		        async: !!this["~standard"].async
		      },
		      path: [],
		      schemaErrorMap: this._def.errorMap,
		      parent: null,
		      data,
		      parsedType: getParsedType(data)
		    };
		    if (!this["~standard"].async) {
		      try {
		        const result = this._parseSync({ data, path: [], parent: ctx });
		        return isValid(result) ? {
		          value: result.value
		        } : {
		          issues: ctx.common.issues
		        };
		      } catch (err) {
		        if (err?.message?.toLowerCase()?.includes("encountered")) {
		          this["~standard"].async = true;
		        }
		        ctx.common = {
		          issues: [],
		          async: true
		        };
		      }
		    }
		    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
		      value: result.value
		    } : {
		      issues: ctx.common.issues
		    });
		  }
		  async parseAsync(data, params) {
		    const result = await this.safeParseAsync(data, params);
		    if (result.success)
		      return result.data;
		    throw result.error;
		  }
		  async safeParseAsync(data, params) {
		    const ctx = {
		      common: {
		        issues: [],
		        contextualErrorMap: params?.errorMap,
		        async: true
		      },
		      path: params?.path || [],
		      schemaErrorMap: this._def.errorMap,
		      parent: null,
		      data,
		      parsedType: getParsedType(data)
		    };
		    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
		    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
		    return handleResult(ctx, result);
		  }
		  refine(check, message) {
		    const getIssueProperties = (val) => {
		      if (typeof message === "string" || typeof message === "undefined") {
		        return { message };
		      } else if (typeof message === "function") {
		        return message(val);
		      } else {
		        return message;
		      }
		    };
		    return this._refinement((val, ctx) => {
		      const result = check(val);
		      const setError = () => ctx.addIssue({
		        code: ZodIssueCode.custom,
		        ...getIssueProperties(val)
		      });
		      if (typeof Promise !== "undefined" && result instanceof Promise) {
		        return result.then((data) => {
		          if (!data) {
		            setError();
		            return false;
		          } else {
		            return true;
		          }
		        });
		      }
		      if (!result) {
		        setError();
		        return false;
		      } else {
		        return true;
		      }
		    });
		  }
		  refinement(check, refinementData) {
		    return this._refinement((val, ctx) => {
		      if (!check(val)) {
		        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
		        return false;
		      } else {
		        return true;
		      }
		    });
		  }
		  _refinement(refinement) {
		    return new ZodEffects({
		      schema: this,
		      typeName: ZodFirstPartyTypeKind.ZodEffects,
		      effect: { type: "refinement", refinement }
		    });
		  }
		  superRefine(refinement) {
		    return this._refinement(refinement);
		  }
		  constructor(def) {
		    this.spa = this.safeParseAsync;
		    this._def = def;
		    this.parse = this.parse.bind(this);
		    this.safeParse = this.safeParse.bind(this);
		    this.parseAsync = this.parseAsync.bind(this);
		    this.safeParseAsync = this.safeParseAsync.bind(this);
		    this.spa = this.spa.bind(this);
		    this.refine = this.refine.bind(this);
		    this.refinement = this.refinement.bind(this);
		    this.superRefine = this.superRefine.bind(this);
		    this.optional = this.optional.bind(this);
		    this.nullable = this.nullable.bind(this);
		    this.nullish = this.nullish.bind(this);
		    this.array = this.array.bind(this);
		    this.promise = this.promise.bind(this);
		    this.or = this.or.bind(this);
		    this.and = this.and.bind(this);
		    this.transform = this.transform.bind(this);
		    this.brand = this.brand.bind(this);
		    this.default = this.default.bind(this);
		    this.catch = this.catch.bind(this);
		    this.describe = this.describe.bind(this);
		    this.pipe = this.pipe.bind(this);
		    this.readonly = this.readonly.bind(this);
		    this.isNullable = this.isNullable.bind(this);
		    this.isOptional = this.isOptional.bind(this);
		    this["~standard"] = {
		      version: 1,
		      vendor: "zod",
		      validate: (data) => this["~validate"](data)
		    };
		  }
		  optional() {
		    return ZodOptional.create(this, this._def);
		  }
		  nullable() {
		    return ZodNullable.create(this, this._def);
		  }
		  nullish() {
		    return this.nullable().optional();
		  }
		  array() {
		    return ZodArray.create(this);
		  }
		  promise() {
		    return ZodPromise.create(this, this._def);
		  }
		  or(option) {
		    return ZodUnion.create([this, option], this._def);
		  }
		  and(incoming) {
		    return ZodIntersection.create(this, incoming, this._def);
		  }
		  transform(transform) {
		    return new ZodEffects({
		      ...processCreateParams(this._def),
		      schema: this,
		      typeName: ZodFirstPartyTypeKind.ZodEffects,
		      effect: { type: "transform", transform }
		    });
		  }
		  default(def) {
		    const defaultValueFunc = typeof def === "function" ? def : () => def;
		    return new ZodDefault({
		      ...processCreateParams(this._def),
		      innerType: this,
		      defaultValue: defaultValueFunc,
		      typeName: ZodFirstPartyTypeKind.ZodDefault
		    });
		  }
		  brand() {
		    return new ZodBranded({
		      typeName: ZodFirstPartyTypeKind.ZodBranded,
		      type: this,
		      ...processCreateParams(this._def)
		    });
		  }
		  catch(def) {
		    const catchValueFunc = typeof def === "function" ? def : () => def;
		    return new ZodCatch({
		      ...processCreateParams(this._def),
		      innerType: this,
		      catchValue: catchValueFunc,
		      typeName: ZodFirstPartyTypeKind.ZodCatch
		    });
		  }
		  describe(description) {
		    const This = this.constructor;
		    return new This({
		      ...this._def,
		      description
		    });
		  }
		  pipe(target) {
		    return ZodPipeline.create(this, target);
		  }
		  readonly() {
		    return ZodReadonly.create(this);
		  }
		  isOptional() {
		    return this.safeParse(void 0).success;
		  }
		  isNullable() {
		    return this.safeParse(null).success;
		  }
		};
		var cuidRegex = /^c[^\s-]{8,}$/i;
		var cuid2Regex = /^[0-9a-z]+$/;
		var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
		var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
		var nanoidRegex = /^[a-z0-9_-]{21}$/i;
		var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
		var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
		var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
		var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		var emojiRegex;
		var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
		var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
		var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
		var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
		var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
		var dateRegex = new RegExp(`^${dateRegexSource}$`);
		function timeRegexSource(args) {
		  let secondsRegexSource = `[0-5]\\d`;
		  if (args.precision) {
		    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
		  } else if (args.precision == null) {
		    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
		  }
		  const secondsQuantifier = args.precision ? "+" : "?";
		  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
		}
		function timeRegex(args) {
		  return new RegExp(`^${timeRegexSource(args)}$`);
		}
		function datetimeRegex(args) {
		  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
		  const opts = [];
		  opts.push(args.local ? `Z?` : `Z`);
		  if (args.offset)
		    opts.push(`([+-]\\d{2}:?\\d{2})`);
		  regex = `${regex}(${opts.join("|")})`;
		  return new RegExp(`^${regex}$`);
		}
		function isValidIP(ip, version) {
		  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
		    return true;
		  }
		  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
		    return true;
		  }
		  return false;
		}
		function isValidJWT(jwt, alg) {
		  if (!jwtRegex.test(jwt))
		    return false;
		  try {
		    const [header] = jwt.split(".");
		    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
		    const decoded = JSON.parse(atob(base64));
		    if (typeof decoded !== "object" || decoded === null)
		      return false;
		    if ("typ" in decoded && decoded?.typ !== "JWT")
		      return false;
		    if (!decoded.alg)
		      return false;
		    if (alg && decoded.alg !== alg)
		      return false;
		    return true;
		  } catch {
		    return false;
		  }
		}
		function isValidCidr(ip, version) {
		  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
		    return true;
		  }
		  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
		    return true;
		  }
		  return false;
		}
		var ZodString = class _ZodString extends ZodType {
		  _parse(input) {
		    if (this._def.coerce) {
		      input.data = String(input.data);
		    }
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.string) {
		      const ctx2 = this._getOrReturnCtx(input);
		      addIssueToContext(ctx2, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.string,
		        received: ctx2.parsedType
		      });
		      return INVALID;
		    }
		    const status = new ParseStatus();
		    let ctx = void 0;
		    for (const check of this._def.checks) {
		      if (check.kind === "min") {
		        if (input.data.length < check.value) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_small,
		            minimum: check.value,
		            type: "string",
		            inclusive: true,
		            exact: false,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "max") {
		        if (input.data.length > check.value) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_big,
		            maximum: check.value,
		            type: "string",
		            inclusive: true,
		            exact: false,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "length") {
		        const tooBig = input.data.length > check.value;
		        const tooSmall = input.data.length < check.value;
		        if (tooBig || tooSmall) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          if (tooBig) {
		            addIssueToContext(ctx, {
		              code: ZodIssueCode.too_big,
		              maximum: check.value,
		              type: "string",
		              inclusive: true,
		              exact: true,
		              message: check.message
		            });
		          } else if (tooSmall) {
		            addIssueToContext(ctx, {
		              code: ZodIssueCode.too_small,
		              minimum: check.value,
		              type: "string",
		              inclusive: true,
		              exact: true,
		              message: check.message
		            });
		          }
		          status.dirty();
		        }
		      } else if (check.kind === "email") {
		        if (!emailRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "email",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "emoji") {
		        if (!emojiRegex) {
		          emojiRegex = new RegExp(_emojiRegex, "u");
		        }
		        if (!emojiRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "emoji",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "uuid") {
		        if (!uuidRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "uuid",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "nanoid") {
		        if (!nanoidRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "nanoid",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "cuid") {
		        if (!cuidRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "cuid",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "cuid2") {
		        if (!cuid2Regex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "cuid2",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "ulid") {
		        if (!ulidRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "ulid",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "url") {
		        try {
		          new URL(input.data);
		        } catch {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "url",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "regex") {
		        check.regex.lastIndex = 0;
		        const testResult = check.regex.test(input.data);
		        if (!testResult) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "regex",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "trim") {
		        input.data = input.data.trim();
		      } else if (check.kind === "includes") {
		        if (!input.data.includes(check.value, check.position)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.invalid_string,
		            validation: { includes: check.value, position: check.position },
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "toLowerCase") {
		        input.data = input.data.toLowerCase();
		      } else if (check.kind === "toUpperCase") {
		        input.data = input.data.toUpperCase();
		      } else if (check.kind === "startsWith") {
		        if (!input.data.startsWith(check.value)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.invalid_string,
		            validation: { startsWith: check.value },
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "endsWith") {
		        if (!input.data.endsWith(check.value)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.invalid_string,
		            validation: { endsWith: check.value },
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "datetime") {
		        const regex = datetimeRegex(check);
		        if (!regex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.invalid_string,
		            validation: "datetime",
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "date") {
		        const regex = dateRegex;
		        if (!regex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.invalid_string,
		            validation: "date",
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "time") {
		        const regex = timeRegex(check);
		        if (!regex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.invalid_string,
		            validation: "time",
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "duration") {
		        if (!durationRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "duration",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "ip") {
		        if (!isValidIP(input.data, check.version)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "ip",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "jwt") {
		        if (!isValidJWT(input.data, check.alg)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "jwt",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "cidr") {
		        if (!isValidCidr(input.data, check.version)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "cidr",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "base64") {
		        if (!base64Regex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "base64",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "base64url") {
		        if (!base64urlRegex.test(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            validation: "base64url",
		            code: ZodIssueCode.invalid_string,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else {
		        util.assertNever(check);
		      }
		    }
		    return { status: status.value, value: input.data };
		  }
		  _regex(regex, validation, message) {
		    return this.refinement((data) => regex.test(data), {
		      validation,
		      code: ZodIssueCode.invalid_string,
		      ...errorUtil.errToObj(message)
		    });
		  }
		  _addCheck(check) {
		    return new _ZodString({
		      ...this._def,
		      checks: [...this._def.checks, check]
		    });
		  }
		  email(message) {
		    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
		  }
		  url(message) {
		    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
		  }
		  emoji(message) {
		    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
		  }
		  uuid(message) {
		    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
		  }
		  nanoid(message) {
		    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
		  }
		  cuid(message) {
		    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
		  }
		  cuid2(message) {
		    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
		  }
		  ulid(message) {
		    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
		  }
		  base64(message) {
		    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
		  }
		  base64url(message) {
		    return this._addCheck({
		      kind: "base64url",
		      ...errorUtil.errToObj(message)
		    });
		  }
		  jwt(options) {
		    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
		  }
		  ip(options) {
		    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
		  }
		  cidr(options) {
		    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
		  }
		  datetime(options) {
		    if (typeof options === "string") {
		      return this._addCheck({
		        kind: "datetime",
		        precision: null,
		        offset: false,
		        local: false,
		        message: options
		      });
		    }
		    return this._addCheck({
		      kind: "datetime",
		      precision: typeof options?.precision === "undefined" ? null : options?.precision,
		      offset: options?.offset ?? false,
		      local: options?.local ?? false,
		      ...errorUtil.errToObj(options?.message)
		    });
		  }
		  date(message) {
		    return this._addCheck({ kind: "date", message });
		  }
		  time(options) {
		    if (typeof options === "string") {
		      return this._addCheck({
		        kind: "time",
		        precision: null,
		        message: options
		      });
		    }
		    return this._addCheck({
		      kind: "time",
		      precision: typeof options?.precision === "undefined" ? null : options?.precision,
		      ...errorUtil.errToObj(options?.message)
		    });
		  }
		  duration(message) {
		    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
		  }
		  regex(regex, message) {
		    return this._addCheck({
		      kind: "regex",
		      regex,
		      ...errorUtil.errToObj(message)
		    });
		  }
		  includes(value, options) {
		    return this._addCheck({
		      kind: "includes",
		      value,
		      position: options?.position,
		      ...errorUtil.errToObj(options?.message)
		    });
		  }
		  startsWith(value, message) {
		    return this._addCheck({
		      kind: "startsWith",
		      value,
		      ...errorUtil.errToObj(message)
		    });
		  }
		  endsWith(value, message) {
		    return this._addCheck({
		      kind: "endsWith",
		      value,
		      ...errorUtil.errToObj(message)
		    });
		  }
		  min(minLength, message) {
		    return this._addCheck({
		      kind: "min",
		      value: minLength,
		      ...errorUtil.errToObj(message)
		    });
		  }
		  max(maxLength, message) {
		    return this._addCheck({
		      kind: "max",
		      value: maxLength,
		      ...errorUtil.errToObj(message)
		    });
		  }
		  length(len, message) {
		    return this._addCheck({
		      kind: "length",
		      value: len,
		      ...errorUtil.errToObj(message)
		    });
		  }
		  /**
		   * Equivalent to `.min(1)`
		   */
		  nonempty(message) {
		    return this.min(1, errorUtil.errToObj(message));
		  }
		  trim() {
		    return new _ZodString({
		      ...this._def,
		      checks: [...this._def.checks, { kind: "trim" }]
		    });
		  }
		  toLowerCase() {
		    return new _ZodString({
		      ...this._def,
		      checks: [...this._def.checks, { kind: "toLowerCase" }]
		    });
		  }
		  toUpperCase() {
		    return new _ZodString({
		      ...this._def,
		      checks: [...this._def.checks, { kind: "toUpperCase" }]
		    });
		  }
		  get isDatetime() {
		    return !!this._def.checks.find((ch) => ch.kind === "datetime");
		  }
		  get isDate() {
		    return !!this._def.checks.find((ch) => ch.kind === "date");
		  }
		  get isTime() {
		    return !!this._def.checks.find((ch) => ch.kind === "time");
		  }
		  get isDuration() {
		    return !!this._def.checks.find((ch) => ch.kind === "duration");
		  }
		  get isEmail() {
		    return !!this._def.checks.find((ch) => ch.kind === "email");
		  }
		  get isURL() {
		    return !!this._def.checks.find((ch) => ch.kind === "url");
		  }
		  get isEmoji() {
		    return !!this._def.checks.find((ch) => ch.kind === "emoji");
		  }
		  get isUUID() {
		    return !!this._def.checks.find((ch) => ch.kind === "uuid");
		  }
		  get isNANOID() {
		    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
		  }
		  get isCUID() {
		    return !!this._def.checks.find((ch) => ch.kind === "cuid");
		  }
		  get isCUID2() {
		    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
		  }
		  get isULID() {
		    return !!this._def.checks.find((ch) => ch.kind === "ulid");
		  }
		  get isIP() {
		    return !!this._def.checks.find((ch) => ch.kind === "ip");
		  }
		  get isCIDR() {
		    return !!this._def.checks.find((ch) => ch.kind === "cidr");
		  }
		  get isBase64() {
		    return !!this._def.checks.find((ch) => ch.kind === "base64");
		  }
		  get isBase64url() {
		    return !!this._def.checks.find((ch) => ch.kind === "base64url");
		  }
		  get minLength() {
		    let min = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "min") {
		        if (min === null || ch.value > min)
		          min = ch.value;
		      }
		    }
		    return min;
		  }
		  get maxLength() {
		    let max = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "max") {
		        if (max === null || ch.value < max)
		          max = ch.value;
		      }
		    }
		    return max;
		  }
		};
		ZodString.create = (params) => {
		  return new ZodString({
		    checks: [],
		    typeName: ZodFirstPartyTypeKind.ZodString,
		    coerce: params?.coerce ?? false,
		    ...processCreateParams(params)
		  });
		};
		function floatSafeRemainder(val, step) {
		  const valDecCount = (val.toString().split(".")[1] || "").length;
		  const stepDecCount = (step.toString().split(".")[1] || "").length;
		  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
		  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
		  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
		  return valInt % stepInt / 10 ** decCount;
		}
		var ZodNumber = class _ZodNumber extends ZodType {
		  constructor() {
		    super(...arguments);
		    this.min = this.gte;
		    this.max = this.lte;
		    this.step = this.multipleOf;
		  }
		  _parse(input) {
		    if (this._def.coerce) {
		      input.data = Number(input.data);
		    }
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.number) {
		      const ctx2 = this._getOrReturnCtx(input);
		      addIssueToContext(ctx2, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.number,
		        received: ctx2.parsedType
		      });
		      return INVALID;
		    }
		    let ctx = void 0;
		    const status = new ParseStatus();
		    for (const check of this._def.checks) {
		      if (check.kind === "int") {
		        if (!util.isInteger(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.invalid_type,
		            expected: "integer",
		            received: "float",
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "min") {
		        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
		        if (tooSmall) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_small,
		            minimum: check.value,
		            type: "number",
		            inclusive: check.inclusive,
		            exact: false,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "max") {
		        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
		        if (tooBig) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_big,
		            maximum: check.value,
		            type: "number",
		            inclusive: check.inclusive,
		            exact: false,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "multipleOf") {
		        if (floatSafeRemainder(input.data, check.value) !== 0) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.not_multiple_of,
		            multipleOf: check.value,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "finite") {
		        if (!Number.isFinite(input.data)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.not_finite,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else {
		        util.assertNever(check);
		      }
		    }
		    return { status: status.value, value: input.data };
		  }
		  gte(value, message) {
		    return this.setLimit("min", value, true, errorUtil.toString(message));
		  }
		  gt(value, message) {
		    return this.setLimit("min", value, false, errorUtil.toString(message));
		  }
		  lte(value, message) {
		    return this.setLimit("max", value, true, errorUtil.toString(message));
		  }
		  lt(value, message) {
		    return this.setLimit("max", value, false, errorUtil.toString(message));
		  }
		  setLimit(kind, value, inclusive, message) {
		    return new _ZodNumber({
		      ...this._def,
		      checks: [
		        ...this._def.checks,
		        {
		          kind,
		          value,
		          inclusive,
		          message: errorUtil.toString(message)
		        }
		      ]
		    });
		  }
		  _addCheck(check) {
		    return new _ZodNumber({
		      ...this._def,
		      checks: [...this._def.checks, check]
		    });
		  }
		  int(message) {
		    return this._addCheck({
		      kind: "int",
		      message: errorUtil.toString(message)
		    });
		  }
		  positive(message) {
		    return this._addCheck({
		      kind: "min",
		      value: 0,
		      inclusive: false,
		      message: errorUtil.toString(message)
		    });
		  }
		  negative(message) {
		    return this._addCheck({
		      kind: "max",
		      value: 0,
		      inclusive: false,
		      message: errorUtil.toString(message)
		    });
		  }
		  nonpositive(message) {
		    return this._addCheck({
		      kind: "max",
		      value: 0,
		      inclusive: true,
		      message: errorUtil.toString(message)
		    });
		  }
		  nonnegative(message) {
		    return this._addCheck({
		      kind: "min",
		      value: 0,
		      inclusive: true,
		      message: errorUtil.toString(message)
		    });
		  }
		  multipleOf(value, message) {
		    return this._addCheck({
		      kind: "multipleOf",
		      value,
		      message: errorUtil.toString(message)
		    });
		  }
		  finite(message) {
		    return this._addCheck({
		      kind: "finite",
		      message: errorUtil.toString(message)
		    });
		  }
		  safe(message) {
		    return this._addCheck({
		      kind: "min",
		      inclusive: true,
		      value: Number.MIN_SAFE_INTEGER,
		      message: errorUtil.toString(message)
		    })._addCheck({
		      kind: "max",
		      inclusive: true,
		      value: Number.MAX_SAFE_INTEGER,
		      message: errorUtil.toString(message)
		    });
		  }
		  get minValue() {
		    let min = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "min") {
		        if (min === null || ch.value > min)
		          min = ch.value;
		      }
		    }
		    return min;
		  }
		  get maxValue() {
		    let max = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "max") {
		        if (max === null || ch.value < max)
		          max = ch.value;
		      }
		    }
		    return max;
		  }
		  get isInt() {
		    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
		  }
		  get isFinite() {
		    let max = null;
		    let min = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
		        return true;
		      } else if (ch.kind === "min") {
		        if (min === null || ch.value > min)
		          min = ch.value;
		      } else if (ch.kind === "max") {
		        if (max === null || ch.value < max)
		          max = ch.value;
		      }
		    }
		    return Number.isFinite(min) && Number.isFinite(max);
		  }
		};
		ZodNumber.create = (params) => {
		  return new ZodNumber({
		    checks: [],
		    typeName: ZodFirstPartyTypeKind.ZodNumber,
		    coerce: params?.coerce || false,
		    ...processCreateParams(params)
		  });
		};
		var ZodBigInt = class _ZodBigInt extends ZodType {
		  constructor() {
		    super(...arguments);
		    this.min = this.gte;
		    this.max = this.lte;
		  }
		  _parse(input) {
		    if (this._def.coerce) {
		      try {
		        input.data = BigInt(input.data);
		      } catch {
		        return this._getInvalidInput(input);
		      }
		    }
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.bigint) {
		      return this._getInvalidInput(input);
		    }
		    let ctx = void 0;
		    const status = new ParseStatus();
		    for (const check of this._def.checks) {
		      if (check.kind === "min") {
		        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
		        if (tooSmall) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_small,
		            type: "bigint",
		            minimum: check.value,
		            inclusive: check.inclusive,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "max") {
		        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
		        if (tooBig) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_big,
		            type: "bigint",
		            maximum: check.value,
		            inclusive: check.inclusive,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "multipleOf") {
		        if (input.data % check.value !== BigInt(0)) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.not_multiple_of,
		            multipleOf: check.value,
		            message: check.message
		          });
		          status.dirty();
		        }
		      } else {
		        util.assertNever(check);
		      }
		    }
		    return { status: status.value, value: input.data };
		  }
		  _getInvalidInput(input) {
		    const ctx = this._getOrReturnCtx(input);
		    addIssueToContext(ctx, {
		      code: ZodIssueCode.invalid_type,
		      expected: ZodParsedType.bigint,
		      received: ctx.parsedType
		    });
		    return INVALID;
		  }
		  gte(value, message) {
		    return this.setLimit("min", value, true, errorUtil.toString(message));
		  }
		  gt(value, message) {
		    return this.setLimit("min", value, false, errorUtil.toString(message));
		  }
		  lte(value, message) {
		    return this.setLimit("max", value, true, errorUtil.toString(message));
		  }
		  lt(value, message) {
		    return this.setLimit("max", value, false, errorUtil.toString(message));
		  }
		  setLimit(kind, value, inclusive, message) {
		    return new _ZodBigInt({
		      ...this._def,
		      checks: [
		        ...this._def.checks,
		        {
		          kind,
		          value,
		          inclusive,
		          message: errorUtil.toString(message)
		        }
		      ]
		    });
		  }
		  _addCheck(check) {
		    return new _ZodBigInt({
		      ...this._def,
		      checks: [...this._def.checks, check]
		    });
		  }
		  positive(message) {
		    return this._addCheck({
		      kind: "min",
		      value: BigInt(0),
		      inclusive: false,
		      message: errorUtil.toString(message)
		    });
		  }
		  negative(message) {
		    return this._addCheck({
		      kind: "max",
		      value: BigInt(0),
		      inclusive: false,
		      message: errorUtil.toString(message)
		    });
		  }
		  nonpositive(message) {
		    return this._addCheck({
		      kind: "max",
		      value: BigInt(0),
		      inclusive: true,
		      message: errorUtil.toString(message)
		    });
		  }
		  nonnegative(message) {
		    return this._addCheck({
		      kind: "min",
		      value: BigInt(0),
		      inclusive: true,
		      message: errorUtil.toString(message)
		    });
		  }
		  multipleOf(value, message) {
		    return this._addCheck({
		      kind: "multipleOf",
		      value,
		      message: errorUtil.toString(message)
		    });
		  }
		  get minValue() {
		    let min = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "min") {
		        if (min === null || ch.value > min)
		          min = ch.value;
		      }
		    }
		    return min;
		  }
		  get maxValue() {
		    let max = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "max") {
		        if (max === null || ch.value < max)
		          max = ch.value;
		      }
		    }
		    return max;
		  }
		};
		ZodBigInt.create = (params) => {
		  return new ZodBigInt({
		    checks: [],
		    typeName: ZodFirstPartyTypeKind.ZodBigInt,
		    coerce: params?.coerce ?? false,
		    ...processCreateParams(params)
		  });
		};
		var ZodBoolean = class extends ZodType {
		  _parse(input) {
		    if (this._def.coerce) {
		      input.data = Boolean(input.data);
		    }
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.boolean) {
		      const ctx = this._getOrReturnCtx(input);
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.boolean,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    return OK(input.data);
		  }
		};
		ZodBoolean.create = (params) => {
		  return new ZodBoolean({
		    typeName: ZodFirstPartyTypeKind.ZodBoolean,
		    coerce: params?.coerce || false,
		    ...processCreateParams(params)
		  });
		};
		var ZodDate = class _ZodDate extends ZodType {
		  _parse(input) {
		    if (this._def.coerce) {
		      input.data = new Date(input.data);
		    }
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.date) {
		      const ctx2 = this._getOrReturnCtx(input);
		      addIssueToContext(ctx2, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.date,
		        received: ctx2.parsedType
		      });
		      return INVALID;
		    }
		    if (Number.isNaN(input.data.getTime())) {
		      const ctx2 = this._getOrReturnCtx(input);
		      addIssueToContext(ctx2, {
		        code: ZodIssueCode.invalid_date
		      });
		      return INVALID;
		    }
		    const status = new ParseStatus();
		    let ctx = void 0;
		    for (const check of this._def.checks) {
		      if (check.kind === "min") {
		        if (input.data.getTime() < check.value) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_small,
		            message: check.message,
		            inclusive: true,
		            exact: false,
		            minimum: check.value,
		            type: "date"
		          });
		          status.dirty();
		        }
		      } else if (check.kind === "max") {
		        if (input.data.getTime() > check.value) {
		          ctx = this._getOrReturnCtx(input, ctx);
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.too_big,
		            message: check.message,
		            inclusive: true,
		            exact: false,
		            maximum: check.value,
		            type: "date"
		          });
		          status.dirty();
		        }
		      } else {
		        util.assertNever(check);
		      }
		    }
		    return {
		      status: status.value,
		      value: new Date(input.data.getTime())
		    };
		  }
		  _addCheck(check) {
		    return new _ZodDate({
		      ...this._def,
		      checks: [...this._def.checks, check]
		    });
		  }
		  min(minDate, message) {
		    return this._addCheck({
		      kind: "min",
		      value: minDate.getTime(),
		      message: errorUtil.toString(message)
		    });
		  }
		  max(maxDate, message) {
		    return this._addCheck({
		      kind: "max",
		      value: maxDate.getTime(),
		      message: errorUtil.toString(message)
		    });
		  }
		  get minDate() {
		    let min = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "min") {
		        if (min === null || ch.value > min)
		          min = ch.value;
		      }
		    }
		    return min != null ? new Date(min) : null;
		  }
		  get maxDate() {
		    let max = null;
		    for (const ch of this._def.checks) {
		      if (ch.kind === "max") {
		        if (max === null || ch.value < max)
		          max = ch.value;
		      }
		    }
		    return max != null ? new Date(max) : null;
		  }
		};
		ZodDate.create = (params) => {
		  return new ZodDate({
		    checks: [],
		    coerce: params?.coerce || false,
		    typeName: ZodFirstPartyTypeKind.ZodDate,
		    ...processCreateParams(params)
		  });
		};
		var ZodSymbol = class extends ZodType {
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.symbol) {
		      const ctx = this._getOrReturnCtx(input);
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.symbol,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    return OK(input.data);
		  }
		};
		ZodSymbol.create = (params) => {
		  return new ZodSymbol({
		    typeName: ZodFirstPartyTypeKind.ZodSymbol,
		    ...processCreateParams(params)
		  });
		};
		var ZodUndefined = class extends ZodType {
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.undefined) {
		      const ctx = this._getOrReturnCtx(input);
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.undefined,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    return OK(input.data);
		  }
		};
		ZodUndefined.create = (params) => {
		  return new ZodUndefined({
		    typeName: ZodFirstPartyTypeKind.ZodUndefined,
		    ...processCreateParams(params)
		  });
		};
		var ZodNull = class extends ZodType {
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.null) {
		      const ctx = this._getOrReturnCtx(input);
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.null,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    return OK(input.data);
		  }
		};
		ZodNull.create = (params) => {
		  return new ZodNull({
		    typeName: ZodFirstPartyTypeKind.ZodNull,
		    ...processCreateParams(params)
		  });
		};
		var ZodAny = class extends ZodType {
		  constructor() {
		    super(...arguments);
		    this._any = true;
		  }
		  _parse(input) {
		    return OK(input.data);
		  }
		};
		ZodAny.create = (params) => {
		  return new ZodAny({
		    typeName: ZodFirstPartyTypeKind.ZodAny,
		    ...processCreateParams(params)
		  });
		};
		var ZodUnknown = class extends ZodType {
		  constructor() {
		    super(...arguments);
		    this._unknown = true;
		  }
		  _parse(input) {
		    return OK(input.data);
		  }
		};
		ZodUnknown.create = (params) => {
		  return new ZodUnknown({
		    typeName: ZodFirstPartyTypeKind.ZodUnknown,
		    ...processCreateParams(params)
		  });
		};
		var ZodNever = class extends ZodType {
		  _parse(input) {
		    const ctx = this._getOrReturnCtx(input);
		    addIssueToContext(ctx, {
		      code: ZodIssueCode.invalid_type,
		      expected: ZodParsedType.never,
		      received: ctx.parsedType
		    });
		    return INVALID;
		  }
		};
		ZodNever.create = (params) => {
		  return new ZodNever({
		    typeName: ZodFirstPartyTypeKind.ZodNever,
		    ...processCreateParams(params)
		  });
		};
		var ZodVoid = class extends ZodType {
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.undefined) {
		      const ctx = this._getOrReturnCtx(input);
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.void,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    return OK(input.data);
		  }
		};
		ZodVoid.create = (params) => {
		  return new ZodVoid({
		    typeName: ZodFirstPartyTypeKind.ZodVoid,
		    ...processCreateParams(params)
		  });
		};
		var ZodArray = class _ZodArray extends ZodType {
		  _parse(input) {
		    const { ctx, status } = this._processInputParams(input);
		    const def = this._def;
		    if (ctx.parsedType !== ZodParsedType.array) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.array,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    if (def.exactLength !== null) {
		      const tooBig = ctx.data.length > def.exactLength.value;
		      const tooSmall = ctx.data.length < def.exactLength.value;
		      if (tooBig || tooSmall) {
		        addIssueToContext(ctx, {
		          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
		          minimum: tooSmall ? def.exactLength.value : void 0,
		          maximum: tooBig ? def.exactLength.value : void 0,
		          type: "array",
		          inclusive: true,
		          exact: true,
		          message: def.exactLength.message
		        });
		        status.dirty();
		      }
		    }
		    if (def.minLength !== null) {
		      if (ctx.data.length < def.minLength.value) {
		        addIssueToContext(ctx, {
		          code: ZodIssueCode.too_small,
		          minimum: def.minLength.value,
		          type: "array",
		          inclusive: true,
		          exact: false,
		          message: def.minLength.message
		        });
		        status.dirty();
		      }
		    }
		    if (def.maxLength !== null) {
		      if (ctx.data.length > def.maxLength.value) {
		        addIssueToContext(ctx, {
		          code: ZodIssueCode.too_big,
		          maximum: def.maxLength.value,
		          type: "array",
		          inclusive: true,
		          exact: false,
		          message: def.maxLength.message
		        });
		        status.dirty();
		      }
		    }
		    if (ctx.common.async) {
		      return Promise.all([...ctx.data].map((item, i) => {
		        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
		      })).then((result2) => {
		        return ParseStatus.mergeArray(status, result2);
		      });
		    }
		    const result = [...ctx.data].map((item, i) => {
		      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
		    });
		    return ParseStatus.mergeArray(status, result);
		  }
		  get element() {
		    return this._def.type;
		  }
		  min(minLength, message) {
		    return new _ZodArray({
		      ...this._def,
		      minLength: { value: minLength, message: errorUtil.toString(message) }
		    });
		  }
		  max(maxLength, message) {
		    return new _ZodArray({
		      ...this._def,
		      maxLength: { value: maxLength, message: errorUtil.toString(message) }
		    });
		  }
		  length(len, message) {
		    return new _ZodArray({
		      ...this._def,
		      exactLength: { value: len, message: errorUtil.toString(message) }
		    });
		  }
		  nonempty(message) {
		    return this.min(1, message);
		  }
		};
		ZodArray.create = (schema, params) => {
		  return new ZodArray({
		    type: schema,
		    minLength: null,
		    maxLength: null,
		    exactLength: null,
		    typeName: ZodFirstPartyTypeKind.ZodArray,
		    ...processCreateParams(params)
		  });
		};
		function deepPartialify(schema) {
		  if (schema instanceof ZodObject) {
		    const newShape = {};
		    for (const key in schema.shape) {
		      const fieldSchema = schema.shape[key];
		      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
		    }
		    return new ZodObject({
		      ...schema._def,
		      shape: () => newShape
		    });
		  } else if (schema instanceof ZodArray) {
		    return new ZodArray({
		      ...schema._def,
		      type: deepPartialify(schema.element)
		    });
		  } else if (schema instanceof ZodOptional) {
		    return ZodOptional.create(deepPartialify(schema.unwrap()));
		  } else if (schema instanceof ZodNullable) {
		    return ZodNullable.create(deepPartialify(schema.unwrap()));
		  } else if (schema instanceof ZodTuple) {
		    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
		  } else {
		    return schema;
		  }
		}
		var ZodObject = class _ZodObject extends ZodType {
		  constructor() {
		    super(...arguments);
		    this._cached = null;
		    this.nonstrict = this.passthrough;
		    this.augment = this.extend;
		  }
		  _getCached() {
		    if (this._cached !== null)
		      return this._cached;
		    const shape = this._def.shape();
		    const keys = util.objectKeys(shape);
		    this._cached = { shape, keys };
		    return this._cached;
		  }
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.object) {
		      const ctx2 = this._getOrReturnCtx(input);
		      addIssueToContext(ctx2, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.object,
		        received: ctx2.parsedType
		      });
		      return INVALID;
		    }
		    const { status, ctx } = this._processInputParams(input);
		    const { shape, keys: shapeKeys } = this._getCached();
		    const extraKeys = [];
		    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
		      for (const key in ctx.data) {
		        if (!shapeKeys.includes(key)) {
		          extraKeys.push(key);
		        }
		      }
		    }
		    const pairs = [];
		    for (const key of shapeKeys) {
		      const keyValidator = shape[key];
		      const value = ctx.data[key];
		      pairs.push({
		        key: { status: "valid", value: key },
		        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
		        alwaysSet: key in ctx.data
		      });
		    }
		    if (this._def.catchall instanceof ZodNever) {
		      const unknownKeys = this._def.unknownKeys;
		      if (unknownKeys === "passthrough") {
		        for (const key of extraKeys) {
		          pairs.push({
		            key: { status: "valid", value: key },
		            value: { status: "valid", value: ctx.data[key] }
		          });
		        }
		      } else if (unknownKeys === "strict") {
		        if (extraKeys.length > 0) {
		          addIssueToContext(ctx, {
		            code: ZodIssueCode.unrecognized_keys,
		            keys: extraKeys
		          });
		          status.dirty();
		        }
		      } else if (unknownKeys === "strip") {
		      } else {
		        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
		      }
		    } else {
		      const catchall = this._def.catchall;
		      for (const key of extraKeys) {
		        const value = ctx.data[key];
		        pairs.push({
		          key: { status: "valid", value: key },
		          value: catchall._parse(
		            new ParseInputLazyPath(ctx, value, ctx.path, key)
		            //, ctx.child(key), value, getParsedType(value)
		          ),
		          alwaysSet: key in ctx.data
		        });
		      }
		    }
		    if (ctx.common.async) {
		      return Promise.resolve().then(async () => {
		        const syncPairs = [];
		        for (const pair of pairs) {
		          const key = await pair.key;
		          const value = await pair.value;
		          syncPairs.push({
		            key,
		            value,
		            alwaysSet: pair.alwaysSet
		          });
		        }
		        return syncPairs;
		      }).then((syncPairs) => {
		        return ParseStatus.mergeObjectSync(status, syncPairs);
		      });
		    } else {
		      return ParseStatus.mergeObjectSync(status, pairs);
		    }
		  }
		  get shape() {
		    return this._def.shape();
		  }
		  strict(message) {
		    errorUtil.errToObj;
		    return new _ZodObject({
		      ...this._def,
		      unknownKeys: "strict",
		      ...message !== void 0 ? {
		        errorMap: (issue, ctx) => {
		          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
		          if (issue.code === "unrecognized_keys")
		            return {
		              message: errorUtil.errToObj(message).message ?? defaultError
		            };
		          return {
		            message: defaultError
		          };
		        }
		      } : {}
		    });
		  }
		  strip() {
		    return new _ZodObject({
		      ...this._def,
		      unknownKeys: "strip"
		    });
		  }
		  passthrough() {
		    return new _ZodObject({
		      ...this._def,
		      unknownKeys: "passthrough"
		    });
		  }
		  // const AugmentFactory =
		  //   <Def extends ZodObjectDef>(def: Def) =>
		  //   <Augmentation extends ZodRawShape>(
		  //     augmentation: Augmentation
		  //   ): ZodObject<
		  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
		  //     Def["unknownKeys"],
		  //     Def["catchall"]
		  //   > => {
		  //     return new ZodObject({
		  //       ...def,
		  //       shape: () => ({
		  //         ...def.shape(),
		  //         ...augmentation,
		  //       }),
		  //     }) as any;
		  //   };
		  extend(augmentation) {
		    return new _ZodObject({
		      ...this._def,
		      shape: () => ({
		        ...this._def.shape(),
		        ...augmentation
		      })
		    });
		  }
		  /**
		   * Prior to zod@1.0.12 there was a bug in the
		   * inferred type of merged objects. Please
		   * upgrade if you are experiencing issues.
		   */
		  merge(merging) {
		    const merged = new _ZodObject({
		      unknownKeys: merging._def.unknownKeys,
		      catchall: merging._def.catchall,
		      shape: () => ({
		        ...this._def.shape(),
		        ...merging._def.shape()
		      }),
		      typeName: ZodFirstPartyTypeKind.ZodObject
		    });
		    return merged;
		  }
		  // merge<
		  //   Incoming extends AnyZodObject,
		  //   Augmentation extends Incoming["shape"],
		  //   NewOutput extends {
		  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
		  //       ? Augmentation[k]["_output"]
		  //       : k extends keyof Output
		  //       ? Output[k]
		  //       : never;
		  //   },
		  //   NewInput extends {
		  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
		  //       ? Augmentation[k]["_input"]
		  //       : k extends keyof Input
		  //       ? Input[k]
		  //       : never;
		  //   }
		  // >(
		  //   merging: Incoming
		  // ): ZodObject<
		  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
		  //   Incoming["_def"]["unknownKeys"],
		  //   Incoming["_def"]["catchall"],
		  //   NewOutput,
		  //   NewInput
		  // > {
		  //   const merged: any = new ZodObject({
		  //     unknownKeys: merging._def.unknownKeys,
		  //     catchall: merging._def.catchall,
		  //     shape: () =>
		  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
		  //     typeName: ZodFirstPartyTypeKind.ZodObject,
		  //   }) as any;
		  //   return merged;
		  // }
		  setKey(key, schema) {
		    return this.augment({ [key]: schema });
		  }
		  // merge<Incoming extends AnyZodObject>(
		  //   merging: Incoming
		  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
		  // ZodObject<
		  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
		  //   Incoming["_def"]["unknownKeys"],
		  //   Incoming["_def"]["catchall"]
		  // > {
		  //   // const mergedShape = objectUtil.mergeShapes(
		  //   //   this._def.shape(),
		  //   //   merging._def.shape()
		  //   // );
		  //   const merged: any = new ZodObject({
		  //     unknownKeys: merging._def.unknownKeys,
		  //     catchall: merging._def.catchall,
		  //     shape: () =>
		  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
		  //     typeName: ZodFirstPartyTypeKind.ZodObject,
		  //   }) as any;
		  //   return merged;
		  // }
		  catchall(index) {
		    return new _ZodObject({
		      ...this._def,
		      catchall: index
		    });
		  }
		  pick(mask) {
		    const shape = {};
		    for (const key of util.objectKeys(mask)) {
		      if (mask[key] && this.shape[key]) {
		        shape[key] = this.shape[key];
		      }
		    }
		    return new _ZodObject({
		      ...this._def,
		      shape: () => shape
		    });
		  }
		  omit(mask) {
		    const shape = {};
		    for (const key of util.objectKeys(this.shape)) {
		      if (!mask[key]) {
		        shape[key] = this.shape[key];
		      }
		    }
		    return new _ZodObject({
		      ...this._def,
		      shape: () => shape
		    });
		  }
		  /**
		   * @deprecated
		   */
		  deepPartial() {
		    return deepPartialify(this);
		  }
		  partial(mask) {
		    const newShape = {};
		    for (const key of util.objectKeys(this.shape)) {
		      const fieldSchema = this.shape[key];
		      if (mask && !mask[key]) {
		        newShape[key] = fieldSchema;
		      } else {
		        newShape[key] = fieldSchema.optional();
		      }
		    }
		    return new _ZodObject({
		      ...this._def,
		      shape: () => newShape
		    });
		  }
		  required(mask) {
		    const newShape = {};
		    for (const key of util.objectKeys(this.shape)) {
		      if (mask && !mask[key]) {
		        newShape[key] = this.shape[key];
		      } else {
		        const fieldSchema = this.shape[key];
		        let newField = fieldSchema;
		        while (newField instanceof ZodOptional) {
		          newField = newField._def.innerType;
		        }
		        newShape[key] = newField;
		      }
		    }
		    return new _ZodObject({
		      ...this._def,
		      shape: () => newShape
		    });
		  }
		  keyof() {
		    return createZodEnum(util.objectKeys(this.shape));
		  }
		};
		ZodObject.create = (shape, params) => {
		  return new ZodObject({
		    shape: () => shape,
		    unknownKeys: "strip",
		    catchall: ZodNever.create(),
		    typeName: ZodFirstPartyTypeKind.ZodObject,
		    ...processCreateParams(params)
		  });
		};
		ZodObject.strictCreate = (shape, params) => {
		  return new ZodObject({
		    shape: () => shape,
		    unknownKeys: "strict",
		    catchall: ZodNever.create(),
		    typeName: ZodFirstPartyTypeKind.ZodObject,
		    ...processCreateParams(params)
		  });
		};
		ZodObject.lazycreate = (shape, params) => {
		  return new ZodObject({
		    shape,
		    unknownKeys: "strip",
		    catchall: ZodNever.create(),
		    typeName: ZodFirstPartyTypeKind.ZodObject,
		    ...processCreateParams(params)
		  });
		};
		var ZodUnion = class extends ZodType {
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    const options = this._def.options;
		    function handleResults(results) {
		      for (const result of results) {
		        if (result.result.status === "valid") {
		          return result.result;
		        }
		      }
		      for (const result of results) {
		        if (result.result.status === "dirty") {
		          ctx.common.issues.push(...result.ctx.common.issues);
		          return result.result;
		        }
		      }
		      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_union,
		        unionErrors
		      });
		      return INVALID;
		    }
		    if (ctx.common.async) {
		      return Promise.all(options.map(async (option) => {
		        const childCtx = {
		          ...ctx,
		          common: {
		            ...ctx.common,
		            issues: []
		          },
		          parent: null
		        };
		        return {
		          result: await option._parseAsync({
		            data: ctx.data,
		            path: ctx.path,
		            parent: childCtx
		          }),
		          ctx: childCtx
		        };
		      })).then(handleResults);
		    } else {
		      let dirty = void 0;
		      const issues = [];
		      for (const option of options) {
		        const childCtx = {
		          ...ctx,
		          common: {
		            ...ctx.common,
		            issues: []
		          },
		          parent: null
		        };
		        const result = option._parseSync({
		          data: ctx.data,
		          path: ctx.path,
		          parent: childCtx
		        });
		        if (result.status === "valid") {
		          return result;
		        } else if (result.status === "dirty" && !dirty) {
		          dirty = { result, ctx: childCtx };
		        }
		        if (childCtx.common.issues.length) {
		          issues.push(childCtx.common.issues);
		        }
		      }
		      if (dirty) {
		        ctx.common.issues.push(...dirty.ctx.common.issues);
		        return dirty.result;
		      }
		      const unionErrors = issues.map((issues2) => new ZodError(issues2));
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_union,
		        unionErrors
		      });
		      return INVALID;
		    }
		  }
		  get options() {
		    return this._def.options;
		  }
		};
		ZodUnion.create = (types, params) => {
		  return new ZodUnion({
		    options: types,
		    typeName: ZodFirstPartyTypeKind.ZodUnion,
		    ...processCreateParams(params)
		  });
		};
		var getDiscriminator = (type) => {
		  if (type instanceof ZodLazy) {
		    return getDiscriminator(type.schema);
		  } else if (type instanceof ZodEffects) {
		    return getDiscriminator(type.innerType());
		  } else if (type instanceof ZodLiteral) {
		    return [type.value];
		  } else if (type instanceof ZodEnum) {
		    return type.options;
		  } else if (type instanceof ZodNativeEnum) {
		    return util.objectValues(type.enum);
		  } else if (type instanceof ZodDefault) {
		    return getDiscriminator(type._def.innerType);
		  } else if (type instanceof ZodUndefined) {
		    return [void 0];
		  } else if (type instanceof ZodNull) {
		    return [null];
		  } else if (type instanceof ZodOptional) {
		    return [void 0, ...getDiscriminator(type.unwrap())];
		  } else if (type instanceof ZodNullable) {
		    return [null, ...getDiscriminator(type.unwrap())];
		  } else if (type instanceof ZodBranded) {
		    return getDiscriminator(type.unwrap());
		  } else if (type instanceof ZodReadonly) {
		    return getDiscriminator(type.unwrap());
		  } else if (type instanceof ZodCatch) {
		    return getDiscriminator(type._def.innerType);
		  } else {
		    return [];
		  }
		};
		var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    if (ctx.parsedType !== ZodParsedType.object) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.object,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    const discriminator = this.discriminator;
		    const discriminatorValue = ctx.data[discriminator];
		    const option = this.optionsMap.get(discriminatorValue);
		    if (!option) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_union_discriminator,
		        options: Array.from(this.optionsMap.keys()),
		        path: [discriminator]
		      });
		      return INVALID;
		    }
		    if (ctx.common.async) {
		      return option._parseAsync({
		        data: ctx.data,
		        path: ctx.path,
		        parent: ctx
		      });
		    } else {
		      return option._parseSync({
		        data: ctx.data,
		        path: ctx.path,
		        parent: ctx
		      });
		    }
		  }
		  get discriminator() {
		    return this._def.discriminator;
		  }
		  get options() {
		    return this._def.options;
		  }
		  get optionsMap() {
		    return this._def.optionsMap;
		  }
		  /**
		   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
		   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
		   * have a different value for each object in the union.
		   * @param discriminator the name of the discriminator property
		   * @param types an array of object schemas
		   * @param params
		   */
		  static create(discriminator, options, params) {
		    const optionsMap = /* @__PURE__ */ new Map();
		    for (const type of options) {
		      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
		      if (!discriminatorValues.length) {
		        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
		      }
		      for (const value of discriminatorValues) {
		        if (optionsMap.has(value)) {
		          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
		        }
		        optionsMap.set(value, type);
		      }
		    }
		    return new _ZodDiscriminatedUnion({
		      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
		      discriminator,
		      options,
		      optionsMap,
		      ...processCreateParams(params)
		    });
		  }
		};
		function mergeValues(a, b) {
		  const aType = getParsedType(a);
		  const bType = getParsedType(b);
		  if (a === b) {
		    return { valid: true, data: a };
		  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
		    const bKeys = util.objectKeys(b);
		    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
		    const newObj = { ...a, ...b };
		    for (const key of sharedKeys) {
		      const sharedValue = mergeValues(a[key], b[key]);
		      if (!sharedValue.valid) {
		        return { valid: false };
		      }
		      newObj[key] = sharedValue.data;
		    }
		    return { valid: true, data: newObj };
		  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
		    if (a.length !== b.length) {
		      return { valid: false };
		    }
		    const newArray = [];
		    for (let index = 0; index < a.length; index++) {
		      const itemA = a[index];
		      const itemB = b[index];
		      const sharedValue = mergeValues(itemA, itemB);
		      if (!sharedValue.valid) {
		        return { valid: false };
		      }
		      newArray.push(sharedValue.data);
		    }
		    return { valid: true, data: newArray };
		  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
		    return { valid: true, data: a };
		  } else {
		    return { valid: false };
		  }
		}
		var ZodIntersection = class extends ZodType {
		  _parse(input) {
		    const { status, ctx } = this._processInputParams(input);
		    const handleParsed = (parsedLeft, parsedRight) => {
		      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
		        return INVALID;
		      }
		      const merged = mergeValues(parsedLeft.value, parsedRight.value);
		      if (!merged.valid) {
		        addIssueToContext(ctx, {
		          code: ZodIssueCode.invalid_intersection_types
		        });
		        return INVALID;
		      }
		      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
		        status.dirty();
		      }
		      return { status: status.value, value: merged.data };
		    };
		    if (ctx.common.async) {
		      return Promise.all([
		        this._def.left._parseAsync({
		          data: ctx.data,
		          path: ctx.path,
		          parent: ctx
		        }),
		        this._def.right._parseAsync({
		          data: ctx.data,
		          path: ctx.path,
		          parent: ctx
		        })
		      ]).then(([left, right]) => handleParsed(left, right));
		    } else {
		      return handleParsed(this._def.left._parseSync({
		        data: ctx.data,
		        path: ctx.path,
		        parent: ctx
		      }), this._def.right._parseSync({
		        data: ctx.data,
		        path: ctx.path,
		        parent: ctx
		      }));
		    }
		  }
		};
		ZodIntersection.create = (left, right, params) => {
		  return new ZodIntersection({
		    left,
		    right,
		    typeName: ZodFirstPartyTypeKind.ZodIntersection,
		    ...processCreateParams(params)
		  });
		};
		var ZodTuple = class _ZodTuple extends ZodType {
		  _parse(input) {
		    const { status, ctx } = this._processInputParams(input);
		    if (ctx.parsedType !== ZodParsedType.array) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.array,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    if (ctx.data.length < this._def.items.length) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.too_small,
		        minimum: this._def.items.length,
		        inclusive: true,
		        exact: false,
		        type: "array"
		      });
		      return INVALID;
		    }
		    const rest = this._def.rest;
		    if (!rest && ctx.data.length > this._def.items.length) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.too_big,
		        maximum: this._def.items.length,
		        inclusive: true,
		        exact: false,
		        type: "array"
		      });
		      status.dirty();
		    }
		    const items = [...ctx.data].map((item, itemIndex) => {
		      const schema = this._def.items[itemIndex] || this._def.rest;
		      if (!schema)
		        return null;
		      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
		    }).filter((x) => !!x);
		    if (ctx.common.async) {
		      return Promise.all(items).then((results) => {
		        return ParseStatus.mergeArray(status, results);
		      });
		    } else {
		      return ParseStatus.mergeArray(status, items);
		    }
		  }
		  get items() {
		    return this._def.items;
		  }
		  rest(rest) {
		    return new _ZodTuple({
		      ...this._def,
		      rest
		    });
		  }
		};
		ZodTuple.create = (schemas, params) => {
		  if (!Array.isArray(schemas)) {
		    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
		  }
		  return new ZodTuple({
		    items: schemas,
		    typeName: ZodFirstPartyTypeKind.ZodTuple,
		    rest: null,
		    ...processCreateParams(params)
		  });
		};
		var ZodRecord = class _ZodRecord extends ZodType {
		  get keySchema() {
		    return this._def.keyType;
		  }
		  get valueSchema() {
		    return this._def.valueType;
		  }
		  _parse(input) {
		    const { status, ctx } = this._processInputParams(input);
		    if (ctx.parsedType !== ZodParsedType.object) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.object,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    const pairs = [];
		    const keyType = this._def.keyType;
		    const valueType = this._def.valueType;
		    for (const key in ctx.data) {
		      pairs.push({
		        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
		        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
		        alwaysSet: key in ctx.data
		      });
		    }
		    if (ctx.common.async) {
		      return ParseStatus.mergeObjectAsync(status, pairs);
		    } else {
		      return ParseStatus.mergeObjectSync(status, pairs);
		    }
		  }
		  get element() {
		    return this._def.valueType;
		  }
		  static create(first, second, third) {
		    if (second instanceof ZodType) {
		      return new _ZodRecord({
		        keyType: first,
		        valueType: second,
		        typeName: ZodFirstPartyTypeKind.ZodRecord,
		        ...processCreateParams(third)
		      });
		    }
		    return new _ZodRecord({
		      keyType: ZodString.create(),
		      valueType: first,
		      typeName: ZodFirstPartyTypeKind.ZodRecord,
		      ...processCreateParams(second)
		    });
		  }
		};
		var ZodMap = class extends ZodType {
		  get keySchema() {
		    return this._def.keyType;
		  }
		  get valueSchema() {
		    return this._def.valueType;
		  }
		  _parse(input) {
		    const { status, ctx } = this._processInputParams(input);
		    if (ctx.parsedType !== ZodParsedType.map) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.map,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    const keyType = this._def.keyType;
		    const valueType = this._def.valueType;
		    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
		      return {
		        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
		        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
		      };
		    });
		    if (ctx.common.async) {
		      const finalMap = /* @__PURE__ */ new Map();
		      return Promise.resolve().then(async () => {
		        for (const pair of pairs) {
		          const key = await pair.key;
		          const value = await pair.value;
		          if (key.status === "aborted" || value.status === "aborted") {
		            return INVALID;
		          }
		          if (key.status === "dirty" || value.status === "dirty") {
		            status.dirty();
		          }
		          finalMap.set(key.value, value.value);
		        }
		        return { status: status.value, value: finalMap };
		      });
		    } else {
		      const finalMap = /* @__PURE__ */ new Map();
		      for (const pair of pairs) {
		        const key = pair.key;
		        const value = pair.value;
		        if (key.status === "aborted" || value.status === "aborted") {
		          return INVALID;
		        }
		        if (key.status === "dirty" || value.status === "dirty") {
		          status.dirty();
		        }
		        finalMap.set(key.value, value.value);
		      }
		      return { status: status.value, value: finalMap };
		    }
		  }
		};
		ZodMap.create = (keyType, valueType, params) => {
		  return new ZodMap({
		    valueType,
		    keyType,
		    typeName: ZodFirstPartyTypeKind.ZodMap,
		    ...processCreateParams(params)
		  });
		};
		var ZodSet = class _ZodSet extends ZodType {
		  _parse(input) {
		    const { status, ctx } = this._processInputParams(input);
		    if (ctx.parsedType !== ZodParsedType.set) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.set,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    const def = this._def;
		    if (def.minSize !== null) {
		      if (ctx.data.size < def.minSize.value) {
		        addIssueToContext(ctx, {
		          code: ZodIssueCode.too_small,
		          minimum: def.minSize.value,
		          type: "set",
		          inclusive: true,
		          exact: false,
		          message: def.minSize.message
		        });
		        status.dirty();
		      }
		    }
		    if (def.maxSize !== null) {
		      if (ctx.data.size > def.maxSize.value) {
		        addIssueToContext(ctx, {
		          code: ZodIssueCode.too_big,
		          maximum: def.maxSize.value,
		          type: "set",
		          inclusive: true,
		          exact: false,
		          message: def.maxSize.message
		        });
		        status.dirty();
		      }
		    }
		    const valueType = this._def.valueType;
		    function finalizeSet(elements2) {
		      const parsedSet = /* @__PURE__ */ new Set();
		      for (const element of elements2) {
		        if (element.status === "aborted")
		          return INVALID;
		        if (element.status === "dirty")
		          status.dirty();
		        parsedSet.add(element.value);
		      }
		      return { status: status.value, value: parsedSet };
		    }
		    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
		    if (ctx.common.async) {
		      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
		    } else {
		      return finalizeSet(elements);
		    }
		  }
		  min(minSize, message) {
		    return new _ZodSet({
		      ...this._def,
		      minSize: { value: minSize, message: errorUtil.toString(message) }
		    });
		  }
		  max(maxSize, message) {
		    return new _ZodSet({
		      ...this._def,
		      maxSize: { value: maxSize, message: errorUtil.toString(message) }
		    });
		  }
		  size(size, message) {
		    return this.min(size, message).max(size, message);
		  }
		  nonempty(message) {
		    return this.min(1, message);
		  }
		};
		ZodSet.create = (valueType, params) => {
		  return new ZodSet({
		    valueType,
		    minSize: null,
		    maxSize: null,
		    typeName: ZodFirstPartyTypeKind.ZodSet,
		    ...processCreateParams(params)
		  });
		};
		var ZodFunction = class _ZodFunction extends ZodType {
		  constructor() {
		    super(...arguments);
		    this.validate = this.implement;
		  }
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    if (ctx.parsedType !== ZodParsedType.function) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.function,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    function makeArgsIssue(args, error) {
		      return makeIssue({
		        data: args,
		        path: ctx.path,
		        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
		        issueData: {
		          code: ZodIssueCode.invalid_arguments,
		          argumentsError: error
		        }
		      });
		    }
		    function makeReturnsIssue(returns, error) {
		      return makeIssue({
		        data: returns,
		        path: ctx.path,
		        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
		        issueData: {
		          code: ZodIssueCode.invalid_return_type,
		          returnTypeError: error
		        }
		      });
		    }
		    const params = { errorMap: ctx.common.contextualErrorMap };
		    const fn = ctx.data;
		    if (this._def.returns instanceof ZodPromise) {
		      const me = this;
		      return OK(async function(...args) {
		        const error = new ZodError([]);
		        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
		          error.addIssue(makeArgsIssue(args, e));
		          throw error;
		        });
		        const result = await Reflect.apply(fn, this, parsedArgs);
		        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
		          error.addIssue(makeReturnsIssue(result, e));
		          throw error;
		        });
		        return parsedReturns;
		      });
		    } else {
		      const me = this;
		      return OK(function(...args) {
		        const parsedArgs = me._def.args.safeParse(args, params);
		        if (!parsedArgs.success) {
		          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
		        }
		        const result = Reflect.apply(fn, this, parsedArgs.data);
		        const parsedReturns = me._def.returns.safeParse(result, params);
		        if (!parsedReturns.success) {
		          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
		        }
		        return parsedReturns.data;
		      });
		    }
		  }
		  parameters() {
		    return this._def.args;
		  }
		  returnType() {
		    return this._def.returns;
		  }
		  args(...items) {
		    return new _ZodFunction({
		      ...this._def,
		      args: ZodTuple.create(items).rest(ZodUnknown.create())
		    });
		  }
		  returns(returnType) {
		    return new _ZodFunction({
		      ...this._def,
		      returns: returnType
		    });
		  }
		  implement(func) {
		    const validatedFunc = this.parse(func);
		    return validatedFunc;
		  }
		  strictImplement(func) {
		    const validatedFunc = this.parse(func);
		    return validatedFunc;
		  }
		  static create(args, returns, params) {
		    return new _ZodFunction({
		      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
		      returns: returns || ZodUnknown.create(),
		      typeName: ZodFirstPartyTypeKind.ZodFunction,
		      ...processCreateParams(params)
		    });
		  }
		};
		var ZodLazy = class extends ZodType {
		  get schema() {
		    return this._def.getter();
		  }
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    const lazySchema = this._def.getter();
		    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
		  }
		};
		ZodLazy.create = (getter, params) => {
		  return new ZodLazy({
		    getter,
		    typeName: ZodFirstPartyTypeKind.ZodLazy,
		    ...processCreateParams(params)
		  });
		};
		var ZodLiteral = class extends ZodType {
		  _parse(input) {
		    if (input.data !== this._def.value) {
		      const ctx = this._getOrReturnCtx(input);
		      addIssueToContext(ctx, {
		        received: ctx.data,
		        code: ZodIssueCode.invalid_literal,
		        expected: this._def.value
		      });
		      return INVALID;
		    }
		    return { status: "valid", value: input.data };
		  }
		  get value() {
		    return this._def.value;
		  }
		};
		ZodLiteral.create = (value, params) => {
		  return new ZodLiteral({
		    value,
		    typeName: ZodFirstPartyTypeKind.ZodLiteral,
		    ...processCreateParams(params)
		  });
		};
		function createZodEnum(values, params) {
		  return new ZodEnum({
		    values,
		    typeName: ZodFirstPartyTypeKind.ZodEnum,
		    ...processCreateParams(params)
		  });
		}
		var ZodEnum = class _ZodEnum extends ZodType {
		  _parse(input) {
		    if (typeof input.data !== "string") {
		      const ctx = this._getOrReturnCtx(input);
		      const expectedValues = this._def.values;
		      addIssueToContext(ctx, {
		        expected: util.joinValues(expectedValues),
		        received: ctx.parsedType,
		        code: ZodIssueCode.invalid_type
		      });
		      return INVALID;
		    }
		    if (!this._cache) {
		      this._cache = new Set(this._def.values);
		    }
		    if (!this._cache.has(input.data)) {
		      const ctx = this._getOrReturnCtx(input);
		      const expectedValues = this._def.values;
		      addIssueToContext(ctx, {
		        received: ctx.data,
		        code: ZodIssueCode.invalid_enum_value,
		        options: expectedValues
		      });
		      return INVALID;
		    }
		    return OK(input.data);
		  }
		  get options() {
		    return this._def.values;
		  }
		  get enum() {
		    const enumValues = {};
		    for (const val of this._def.values) {
		      enumValues[val] = val;
		    }
		    return enumValues;
		  }
		  get Values() {
		    const enumValues = {};
		    for (const val of this._def.values) {
		      enumValues[val] = val;
		    }
		    return enumValues;
		  }
		  get Enum() {
		    const enumValues = {};
		    for (const val of this._def.values) {
		      enumValues[val] = val;
		    }
		    return enumValues;
		  }
		  extract(values, newDef = this._def) {
		    return _ZodEnum.create(values, {
		      ...this._def,
		      ...newDef
		    });
		  }
		  exclude(values, newDef = this._def) {
		    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
		      ...this._def,
		      ...newDef
		    });
		  }
		};
		ZodEnum.create = createZodEnum;
		var ZodNativeEnum = class extends ZodType {
		  _parse(input) {
		    const nativeEnumValues = util.getValidEnumValues(this._def.values);
		    const ctx = this._getOrReturnCtx(input);
		    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
		      const expectedValues = util.objectValues(nativeEnumValues);
		      addIssueToContext(ctx, {
		        expected: util.joinValues(expectedValues),
		        received: ctx.parsedType,
		        code: ZodIssueCode.invalid_type
		      });
		      return INVALID;
		    }
		    if (!this._cache) {
		      this._cache = new Set(util.getValidEnumValues(this._def.values));
		    }
		    if (!this._cache.has(input.data)) {
		      const expectedValues = util.objectValues(nativeEnumValues);
		      addIssueToContext(ctx, {
		        received: ctx.data,
		        code: ZodIssueCode.invalid_enum_value,
		        options: expectedValues
		      });
		      return INVALID;
		    }
		    return OK(input.data);
		  }
		  get enum() {
		    return this._def.values;
		  }
		};
		ZodNativeEnum.create = (values, params) => {
		  return new ZodNativeEnum({
		    values,
		    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
		    ...processCreateParams(params)
		  });
		};
		var ZodPromise = class extends ZodType {
		  unwrap() {
		    return this._def.type;
		  }
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.promise,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
		    return OK(promisified.then((data) => {
		      return this._def.type.parseAsync(data, {
		        path: ctx.path,
		        errorMap: ctx.common.contextualErrorMap
		      });
		    }));
		  }
		};
		ZodPromise.create = (schema, params) => {
		  return new ZodPromise({
		    type: schema,
		    typeName: ZodFirstPartyTypeKind.ZodPromise,
		    ...processCreateParams(params)
		  });
		};
		var ZodEffects = class extends ZodType {
		  innerType() {
		    return this._def.schema;
		  }
		  sourceType() {
		    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
		  }
		  _parse(input) {
		    const { status, ctx } = this._processInputParams(input);
		    const effect = this._def.effect || null;
		    const checkCtx = {
		      addIssue: (arg) => {
		        addIssueToContext(ctx, arg);
		        if (arg.fatal) {
		          status.abort();
		        } else {
		          status.dirty();
		        }
		      },
		      get path() {
		        return ctx.path;
		      }
		    };
		    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
		    if (effect.type === "preprocess") {
		      const processed = effect.transform(ctx.data, checkCtx);
		      if (ctx.common.async) {
		        return Promise.resolve(processed).then(async (processed2) => {
		          if (status.value === "aborted")
		            return INVALID;
		          const result = await this._def.schema._parseAsync({
		            data: processed2,
		            path: ctx.path,
		            parent: ctx
		          });
		          if (result.status === "aborted")
		            return INVALID;
		          if (result.status === "dirty")
		            return DIRTY(result.value);
		          if (status.value === "dirty")
		            return DIRTY(result.value);
		          return result;
		        });
		      } else {
		        if (status.value === "aborted")
		          return INVALID;
		        const result = this._def.schema._parseSync({
		          data: processed,
		          path: ctx.path,
		          parent: ctx
		        });
		        if (result.status === "aborted")
		          return INVALID;
		        if (result.status === "dirty")
		          return DIRTY(result.value);
		        if (status.value === "dirty")
		          return DIRTY(result.value);
		        return result;
		      }
		    }
		    if (effect.type === "refinement") {
		      const executeRefinement = (acc) => {
		        const result = effect.refinement(acc, checkCtx);
		        if (ctx.common.async) {
		          return Promise.resolve(result);
		        }
		        if (result instanceof Promise) {
		          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
		        }
		        return acc;
		      };
		      if (ctx.common.async === false) {
		        const inner = this._def.schema._parseSync({
		          data: ctx.data,
		          path: ctx.path,
		          parent: ctx
		        });
		        if (inner.status === "aborted")
		          return INVALID;
		        if (inner.status === "dirty")
		          status.dirty();
		        executeRefinement(inner.value);
		        return { status: status.value, value: inner.value };
		      } else {
		        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
		          if (inner.status === "aborted")
		            return INVALID;
		          if (inner.status === "dirty")
		            status.dirty();
		          return executeRefinement(inner.value).then(() => {
		            return { status: status.value, value: inner.value };
		          });
		        });
		      }
		    }
		    if (effect.type === "transform") {
		      if (ctx.common.async === false) {
		        const base = this._def.schema._parseSync({
		          data: ctx.data,
		          path: ctx.path,
		          parent: ctx
		        });
		        if (!isValid(base))
		          return INVALID;
		        const result = effect.transform(base.value, checkCtx);
		        if (result instanceof Promise) {
		          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
		        }
		        return { status: status.value, value: result };
		      } else {
		        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
		          if (!isValid(base))
		            return INVALID;
		          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
		            status: status.value,
		            value: result
		          }));
		        });
		      }
		    }
		    util.assertNever(effect);
		  }
		};
		ZodEffects.create = (schema, effect, params) => {
		  return new ZodEffects({
		    schema,
		    typeName: ZodFirstPartyTypeKind.ZodEffects,
		    effect,
		    ...processCreateParams(params)
		  });
		};
		ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
		  return new ZodEffects({
		    schema,
		    effect: { type: "preprocess", transform: preprocess },
		    typeName: ZodFirstPartyTypeKind.ZodEffects,
		    ...processCreateParams(params)
		  });
		};
		var ZodOptional = class extends ZodType {
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType === ZodParsedType.undefined) {
		      return OK(void 0);
		    }
		    return this._def.innerType._parse(input);
		  }
		  unwrap() {
		    return this._def.innerType;
		  }
		};
		ZodOptional.create = (type, params) => {
		  return new ZodOptional({
		    innerType: type,
		    typeName: ZodFirstPartyTypeKind.ZodOptional,
		    ...processCreateParams(params)
		  });
		};
		var ZodNullable = class extends ZodType {
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType === ZodParsedType.null) {
		      return OK(null);
		    }
		    return this._def.innerType._parse(input);
		  }
		  unwrap() {
		    return this._def.innerType;
		  }
		};
		ZodNullable.create = (type, params) => {
		  return new ZodNullable({
		    innerType: type,
		    typeName: ZodFirstPartyTypeKind.ZodNullable,
		    ...processCreateParams(params)
		  });
		};
		var ZodDefault = class extends ZodType {
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    let data = ctx.data;
		    if (ctx.parsedType === ZodParsedType.undefined) {
		      data = this._def.defaultValue();
		    }
		    return this._def.innerType._parse({
		      data,
		      path: ctx.path,
		      parent: ctx
		    });
		  }
		  removeDefault() {
		    return this._def.innerType;
		  }
		};
		ZodDefault.create = (type, params) => {
		  return new ZodDefault({
		    innerType: type,
		    typeName: ZodFirstPartyTypeKind.ZodDefault,
		    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
		    ...processCreateParams(params)
		  });
		};
		var ZodCatch = class extends ZodType {
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    const newCtx = {
		      ...ctx,
		      common: {
		        ...ctx.common,
		        issues: []
		      }
		    };
		    const result = this._def.innerType._parse({
		      data: newCtx.data,
		      path: newCtx.path,
		      parent: {
		        ...newCtx
		      }
		    });
		    if (isAsync(result)) {
		      return result.then((result2) => {
		        return {
		          status: "valid",
		          value: result2.status === "valid" ? result2.value : this._def.catchValue({
		            get error() {
		              return new ZodError(newCtx.common.issues);
		            },
		            input: newCtx.data
		          })
		        };
		      });
		    } else {
		      return {
		        status: "valid",
		        value: result.status === "valid" ? result.value : this._def.catchValue({
		          get error() {
		            return new ZodError(newCtx.common.issues);
		          },
		          input: newCtx.data
		        })
		      };
		    }
		  }
		  removeCatch() {
		    return this._def.innerType;
		  }
		};
		ZodCatch.create = (type, params) => {
		  return new ZodCatch({
		    innerType: type,
		    typeName: ZodFirstPartyTypeKind.ZodCatch,
		    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
		    ...processCreateParams(params)
		  });
		};
		var ZodNaN = class extends ZodType {
		  _parse(input) {
		    const parsedType = this._getType(input);
		    if (parsedType !== ZodParsedType.nan) {
		      const ctx = this._getOrReturnCtx(input);
		      addIssueToContext(ctx, {
		        code: ZodIssueCode.invalid_type,
		        expected: ZodParsedType.nan,
		        received: ctx.parsedType
		      });
		      return INVALID;
		    }
		    return { status: "valid", value: input.data };
		  }
		};
		ZodNaN.create = (params) => {
		  return new ZodNaN({
		    typeName: ZodFirstPartyTypeKind.ZodNaN,
		    ...processCreateParams(params)
		  });
		};
		var BRAND = Symbol("zod_brand");
		var ZodBranded = class extends ZodType {
		  _parse(input) {
		    const { ctx } = this._processInputParams(input);
		    const data = ctx.data;
		    return this._def.type._parse({
		      data,
		      path: ctx.path,
		      parent: ctx
		    });
		  }
		  unwrap() {
		    return this._def.type;
		  }
		};
		var ZodPipeline = class _ZodPipeline extends ZodType {
		  _parse(input) {
		    const { status, ctx } = this._processInputParams(input);
		    if (ctx.common.async) {
		      const handleAsync = async () => {
		        const inResult = await this._def.in._parseAsync({
		          data: ctx.data,
		          path: ctx.path,
		          parent: ctx
		        });
		        if (inResult.status === "aborted")
		          return INVALID;
		        if (inResult.status === "dirty") {
		          status.dirty();
		          return DIRTY(inResult.value);
		        } else {
		          return this._def.out._parseAsync({
		            data: inResult.value,
		            path: ctx.path,
		            parent: ctx
		          });
		        }
		      };
		      return handleAsync();
		    } else {
		      const inResult = this._def.in._parseSync({
		        data: ctx.data,
		        path: ctx.path,
		        parent: ctx
		      });
		      if (inResult.status === "aborted")
		        return INVALID;
		      if (inResult.status === "dirty") {
		        status.dirty();
		        return {
		          status: "dirty",
		          value: inResult.value
		        };
		      } else {
		        return this._def.out._parseSync({
		          data: inResult.value,
		          path: ctx.path,
		          parent: ctx
		        });
		      }
		    }
		  }
		  static create(a, b) {
		    return new _ZodPipeline({
		      in: a,
		      out: b,
		      typeName: ZodFirstPartyTypeKind.ZodPipeline
		    });
		  }
		};
		var ZodReadonly = class extends ZodType {
		  _parse(input) {
		    const result = this._def.innerType._parse(input);
		    const freeze = (data) => {
		      if (isValid(data)) {
		        data.value = Object.freeze(data.value);
		      }
		      return data;
		    };
		    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
		  }
		  unwrap() {
		    return this._def.innerType;
		  }
		};
		ZodReadonly.create = (type, params) => {
		  return new ZodReadonly({
		    innerType: type,
		    typeName: ZodFirstPartyTypeKind.ZodReadonly,
		    ...processCreateParams(params)
		  });
		};
		function cleanParams(params, data) {
		  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
		  const p2 = typeof p === "string" ? { message: p } : p;
		  return p2;
		}
		function custom(check, _params = {}, fatal) {
		  if (check)
		    return ZodAny.create().superRefine((data, ctx) => {
		      const r = check(data);
		      if (r instanceof Promise) {
		        return r.then((r2) => {
		          if (!r2) {
		            const params = cleanParams(_params, data);
		            const _fatal = params.fatal ?? fatal ?? true;
		            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
		          }
		        });
		      }
		      if (!r) {
		        const params = cleanParams(_params, data);
		        const _fatal = params.fatal ?? fatal ?? true;
		        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
		      }
		      return;
		    });
		  return ZodAny.create();
		}
		var late = {
		  object: ZodObject.lazycreate
		};
		var ZodFirstPartyTypeKind;
		(function(ZodFirstPartyTypeKind2) {
		  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
		  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
		  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
		  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
		  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
		  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
		  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
		  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
		  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
		  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
		  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
		  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
		  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
		  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
		  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
		  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
		  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
		  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
		  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
		  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
		  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
		  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
		  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
		  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
		  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
		  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
		  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
		  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
		  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
		  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
		  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
		  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
		  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
		  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
		  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
		  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
		})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
		var instanceOfType = (cls, params = {
		  message: `Input not instance of ${cls.name}`
		}) => custom((data) => data instanceof cls, params);
		var stringType = ZodString.create;
		var numberType = ZodNumber.create;
		var nanType = ZodNaN.create;
		var bigIntType = ZodBigInt.create;
		var booleanType = ZodBoolean.create;
		var dateType = ZodDate.create;
		var symbolType = ZodSymbol.create;
		var undefinedType = ZodUndefined.create;
		var nullType = ZodNull.create;
		var anyType = ZodAny.create;
		var unknownType = ZodUnknown.create;
		var neverType = ZodNever.create;
		var voidType = ZodVoid.create;
		var arrayType = ZodArray.create;
		var objectType = ZodObject.create;
		var strictObjectType = ZodObject.strictCreate;
		var unionType = ZodUnion.create;
		var discriminatedUnionType = ZodDiscriminatedUnion.create;
		var intersectionType = ZodIntersection.create;
		var tupleType = ZodTuple.create;
		var recordType = ZodRecord.create;
		var mapType = ZodMap.create;
		var setType = ZodSet.create;
		var functionType = ZodFunction.create;
		var lazyType = ZodLazy.create;
		var literalType = ZodLiteral.create;
		var enumType = ZodEnum.create;
		var nativeEnumType = ZodNativeEnum.create;
		var promiseType = ZodPromise.create;
		var effectsType = ZodEffects.create;
		var optionalType = ZodOptional.create;
		var nullableType = ZodNullable.create;
		var preprocessType = ZodEffects.createWithPreprocess;
		var pipelineType = ZodPipeline.create;
		var ostring = () => stringType().optional();
		var onumber = () => numberType().optional();
		var oboolean = () => booleanType().optional();
		var coerce = {
		  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
		  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
		  boolean: ((arg) => ZodBoolean.create({
		    ...arg,
		    coerce: true
		  })),
		  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
		  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
		};
		var NEVER = INVALID;

		// src/client/usage-remote-client.js
		var _deepseek_ai_dsh_usage_ledger_usage_totals_result$schema = external_exports.object({
		  "totals": external_exports.object({
		    "requests": external_exports.number(),
		    "inputTokens": external_exports.number(),
		    "outputTokens": external_exports.number(),
		    "cacheReadTokens": external_exports.number(),
		    "cacheWriteTokens": external_exports.number(),
		    "totalTokens": external_exports.number(),
		    "byModel": external_exports.array(external_exports.object({
		      "provider": external_exports.string(),
		      "model": external_exports.string(),
		      "requests": external_exports.number(),
		      "inputTokens": external_exports.number(),
		      "outputTokens": external_exports.number(),
		      "cacheReadTokens": external_exports.number(),
		      "cacheWriteTokens": external_exports.number(),
		      "totalTokens": external_exports.number()
		    })),
		    "byDay": external_exports.array(external_exports.object({
		      "day": external_exports.string(),
		      "requests": external_exports.number(),
		      "inputTokens": external_exports.number(),
		      "outputTokens": external_exports.number(),
		      "cacheReadTokens": external_exports.number(),
		      "cacheWriteTokens": external_exports.number(),
		      "totalTokens": external_exports.number()
		    })),
		    "byHour": external_exports.array(external_exports.object({
		      "hour": external_exports.string(),
		      "requests": external_exports.number(),
		      "inputTokens": external_exports.number(),
		      "outputTokens": external_exports.number(),
		      "cacheReadTokens": external_exports.number(),
		      "cacheWriteTokens": external_exports.number(),
		      "totalTokens": external_exports.number()
		    })),
		    "bySession": external_exports.array(external_exports.object({
		      "sessionId": external_exports.string(),
		      "lastActivity": external_exports.number(),
		      "requests": external_exports.number(),
		      "inputTokens": external_exports.number(),
		      "outputTokens": external_exports.number(),
		      "cacheReadTokens": external_exports.number(),
		      "cacheWriteTokens": external_exports.number(),
		      "totalTokens": external_exports.number()
		    })),
		    "lastRecordTime": external_exports.union([external_exports.literal(null), external_exports.number()])
		  }),
		  "ledgerDisplay": external_exports.string()
		});
		var TYPERT_REMOTE = {
		  package: "@deepseek-ai/dsh-usage-ledger",
		  descriptors: [
		    {
		      id: "@deepseek-ai/dsh-usage-ledger#usage/totals",
		      service: "usageLedger",
		      namespace: "usage",
		      method: "totals",
		      implementation: "remoteExportTotals",
		      invocation: { kind: "direct" },
		      parameters: [],
		      cancellation: { parameter: "signal" },
		      result: {
		        mode: "strict",
		        typeSymbol: "@deepseek-ai/dsh-usage-ledger/types#UsageLedgerSnapshot",
		        schema: _deepseek_ai_dsh_usage_ledger_usage_totals_result$schema
		      },
		      sourceLocation: { "file": "packages/llm/usage-ledger/src/index.ts", "line": 157, "column": 9 }
		    }
		  ]
		};
		var usage_remote_client_default = TYPERT_REMOTE;

		// src/client/remote-mount.ts
		function mountUsageRemote(ctx) {
		  void ctx.remote.$mount(usage_remote_client_default).catch(() => {
		  });
		}

		// src/client/usage-section.tsx
		var import_react = require("react");
		var import_jsx_runtime = require("react/jsx-runtime");
		var TREND_DAYS = 7;
		var DISPLAYED_ROUTES = 5;
		function compact(count) {
		  if (count < 1e3) return String(count);
		  if (count < 1e6) return (count / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
		  return (count / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
		}
		function shapeSection(snapshot) {
		  const byDay = snapshot.totals.byDay;
		  const days = byDay.slice(-TREND_DAYS);
		  const peak = Math.max(1, ...days.map((entry) => entry.totalTokens));
		  const trend = days.map((entry) => ({
		    day: entry.day,
		    display: entry.day.slice(5),
		    width: Math.round(entry.totalTokens / peak * 100),
		    label: compact(entry.totalTokens)
		  }));
		  const byModel = snapshot.totals.byModel;
		  const routes = byModel.slice(0, DISPLAYED_ROUTES).map((entry) => ({
		    route: entry.provider + "/" + entry.model,
		    requests: entry.requests,
		    tokens: entry.totalTokens
		  }));
		  return { trend, routes, hiddenRoutes: Math.max(0, byModel.length - DISPLAYED_ROUTES) };
		}
		function UsageSection({ t, load }) {
		  const [snapshot, setSnapshot] = (0, import_react.useState)(null);
		  const [failed, setFailed] = (0, import_react.useState)(null);
		  const refresh = (0, import_react.useCallback)(() => {
		    void load().then((outcome) => {
		      if (outcome.ok) setSnapshot(outcome.snapshot);
		      else setFailed(outcome.code);
		    });
		  }, [load]);
		  (0, import_react.useEffect)(() => {
		    refresh();
		  }, [refresh]);
		  const d = snapshot;
		  const n = (v) => v.toLocaleString();
		  const view = d !== null ? shapeSection(d) : void 0;
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-section", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "dsgx-heading", children: t("usage.page.title") }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsgx-refresh", onClick: refresh, children: t("usage.refresh") })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsgx-intro", children: t("usage.page.intro") }),
		    failed !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dsgx-intro", children: [
		      t("usage.loadFailed"),
		      ": ",
		      failed
		    ] }),
		    d !== null && view !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-card", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsgx-cardTitle", children: t("usage.totalsHeading") }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-figures", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-figure", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureLabel", children: t("usage.requestsLabel") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureValue", children: n(d.totals.requests) })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-figure", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureLabel", children: t("usage.inputLabel") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureValue", children: n(d.totals.inputTokens) })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-figure", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureLabel", children: t("usage.cacheReadLabel") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureValue", children: n(d.totals.cacheReadTokens) })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-figure", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureLabel", children: t("usage.cacheWriteLabel") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureValue", children: n(d.totals.cacheWriteTokens) })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-figure", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureLabel", children: t("usage.outputLabel") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureValue", children: n(d.totals.outputTokens) })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-figure", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureLabel", children: t("usage.totalLabel") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-figureValue", children: n(d.totals.totalTokens) })
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dsgx-ledgerPath", children: [
		          t("usage.ledgerPathLabel"),
		          ": ",
		          d.ledgerDisplay
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-card", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsgx-cardTitle", children: t("usage.trendHeading") }),
		        view.trend.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsgx-intro", children: t("usage.trendEmpty") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsgx-trend", children: view.trend.map((bar) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-trendColumn", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: bar.display }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsgx-trendTrack", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsgx-trendBar", style: { width: bar.width + "%" } }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: bar.label })
		        ] }, bar.day)) })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsgx-card", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsgx-cardTitle", children: t("usage.routesHeading") }),
		        view.routes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsgx-intro", children: t("usage.routesEmpty") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "dsgx-table", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t("usage.routeNameColumn") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t("usage.routeRequestsColumn") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t("usage.routeTokensColumn") })
		          ] }) }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: view.routes.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.route }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: n(row.requests) }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: n(row.tokens) })
		          ] }, row.route)) })
		        ] }),
		        view.hiddenRoutes > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dsgx-more", children: [
		          "+",
		          view.hiddenRoutes,
		          " ",
		          t("usage.moreRoutes")
		        ] })
		      ] })
		    ] })
		  ] });
		}

		// src/client/usage-bubble.tsx
		var import_react2 = require("react");
		var import_jsx_runtime2 = require("react/jsx-runtime");
		var REFRESH_MS = 6e4;
		var DRAG_THRESHOLD = 4;
		var POS_KEY = "dsh-usage-bubble-pos";
		function readPos() {
		  try {
		    const raw = localStorage.getItem(POS_KEY);
		    if (raw === null) return null;
		    const p = JSON.parse(raw);
		    if (typeof p.x !== "number" || typeof p.y !== "number") return null;
		    return {
		      x: Math.min(Math.max(p.x, 8), window.innerWidth - 8),
		      y: Math.min(Math.max(p.y, 8), window.innerHeight - 8)
		    };
		  } catch {
		    return null;
		  }
		}
		function savePos(p) {
		  try {
		    localStorage.setItem(POS_KEY, JSON.stringify(p));
		  } catch {
		  }
		}
		function clamp(x, y) {
		  return {
		    x: Math.min(Math.max(x, 8), window.innerWidth - 8),
		    y: Math.min(Math.max(y, 8), window.innerHeight - 8)
		  };
		}
		function UsageBubble({ t, load }) {
		  const [total, setTotal] = (0, import_react2.useState)(null);
		  const [failed, setFailed] = (0, import_react2.useState)(false);
		  const [open, setOpen] = (0, import_react2.useState)(false);
		  const [details, setDetails] = (0, import_react2.useState)(null);
		  const [pos, setPos] = (0, import_react2.useState)(() => readPos());
		  const drag = (0, import_react2.useRef)();
		  const panelRef = (0, import_react2.useRef)(null);
		  const refresh = (0, import_react2.useCallback)(() => {
		    void load().then((outcome) => {
		      if (outcome.ok) {
		        setTotal(outcome.snapshot.totals.totalTokens);
		        setFailed(false);
		        setDetails({
		          requests: outcome.snapshot.totals.requests,
		          byModel: outcome.snapshot.totals.byModel.slice(0, 5).map((e) => ({
		            route: e.provider + "/" + e.model,
		            tokens: e.totalTokens
		          })),
		          path: outcome.snapshot.ledgerDisplay
		        });
		      } else {
		        setTotal(null);
		        setFailed(true);
		      }
		    });
		  }, [load]);
		  (0, import_react2.useEffect)(() => {
		    refresh();
		    const timer = setInterval(refresh, REFRESH_MS);
		    return () => {
		      clearInterval(timer);
		    };
		  }, [refresh]);
		  const onPointerDown = (e) => {
		    if (!e.isPrimary || e.button !== 0) return;
		    const rect = e.currentTarget.getBoundingClientRect();
		    const base = pos ?? { x: rect.left, y: rect.top };
		    drag.current = { px: e.clientX, py: e.clientY, bx: base.x, by: base.y, moved: false };
		    e.currentTarget.setPointerCapture?.(e.pointerId);
		  };
		  const onPointerMove = (e) => {
		    const d = drag.current;
		    if (d === void 0) return;
		    const dx = e.clientX - d.px;
		    const dy = e.clientY - d.py;
		    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
		    d.moved = true;
		    setOpen(false);
		    setPos(clamp(d.bx + dx, d.by + dy));
		  };
		  const onPointerUp = (e) => {
		    const d = drag.current;
		    drag.current = void 0;
		    e.currentTarget.releasePointerCapture?.(e.pointerId);
		    if (d === void 0 || !d.moved) return;
		    setPos((current) => {
		      if (current !== null) savePos(current);
		      return current;
		    });
		  };
		  const onClick = () => {
		    if (drag.current !== void 0) return;
		    setOpen((previous) => !previous);
		    refresh();
		  };
		  const fmt = (v) => v.toLocaleString();
		  const style = pos !== void 0 && pos !== null ? { left: pos.x + "px", top: pos.y + "px", right: "auto", bottom: "auto" } : void 0;
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsgx-bubbleLayer", children: [
		    open && details !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ref: panelRef, className: "dsgx-bubblePanel", role: "dialog", "aria-label": t("usage.page.title"), children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsgx-bubblePanelHead", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubblePanelTitle", children: t("usage.page.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsgx-bubbleClose", onClick: () => setOpen(false), "aria-label": "close", children: "\xD7" })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsgx-bubbleRow", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubbleRowLabel", children: t("usage.requestsLabel") }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubbleRowValue", children: fmt(details.requests) })
		      ] }),
		      details.byModel.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsgx-bubbleRow", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubbleRowLabel", children: entry.route }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubbleRowValue", children: fmt(entry.tokens) })
		      ] }, entry.route)),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "dsgx-bubbleHint", children: [
		        t("usage.ledgerPathLabel"),
		        ": ",
		        details.path
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		      "button",
		      {
		        type: "button",
		        className: "dsgx-bubble",
		        "data-failed": failed ? "true" : void 0,
		        style,
		        onPointerDown,
		        onPointerMove,
		        onPointerUp,
		        onClick,
		        "aria-label": t("bubble.aria"),
		        title: t("bubble.aria"),
		        children: total === null ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubbleMark", children: "\u03A3" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "dsgx-bubbleBody", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubbleValue", children: total.toLocaleString() }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsgx-bubbleUnit", children: t("bubble.total") })
		        ] })
		      }
		    )
		  ] });
		}

		// src/client/liquid-glass-section.tsx
		var import_react3 = require("react");

		// src/liquid-glass-settings.ts
		var LIQUID_GLASS_DEFAULTS = {
		  enabled: false,
		  seaTheme: "dark",
		  speed: 1.3,
		  colorWave: true,
		  opacity: 1,
		  blur: 26,
		  colorMode: "theme",
		  colorA: "#05020f",
		  colorB: "#d18cff"
		};

		// src/client/liquid-glass-section.tsx
		var import_jsx_runtime3 = require("react/jsx-runtime");
		function hslToHex(h, s, l) {
		  const a = s * Math.min(l, 1 - l);
		  const f = (n) => {
		    const k = (n + h / 30) % 12;
		    const v = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		    return Math.round(255 * v).toString(16).padStart(2, "0");
		  };
		  return "#" + f(0) + f(8) + f(4);
		}
		function randomGradientPair() {
		  const deep = Math.floor(Math.random() * 360);
		  const bright = (deep + 90 + Math.floor(Math.random() * 180)) % 360;
		  return [hslToHex(deep, 72, 14), hslToHex(bright, 88, 74)];
		}
		function LiquidGlassSection({ t, scope, set }) {
		  const [snapshot, setSnapshot] = (0, import_react3.useState)(scope.getSnapshot);
		  (0, import_react3.useEffect)(() => scope.subscribe(() => {
		    setSnapshot(scope.getSnapshot());
		  }), [scope]);
		  const ready = snapshot.status === "ready" && snapshot.value !== void 0;
		  const value = ready ? { ...LIQUID_GLASS_DEFAULTS, ...snapshot.value } : void 0;
		  const custom2 = value?.colorMode === "custom";
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-section", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "dsgx-heading", children: t("glass.page.title") }),
		    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "dsgx-glassIntro", children: t("glass.page.intro") }),
		    !ready && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "dsgx-glassIntro", children: t("glass.enable.off") }),
		    ready && value !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassCard", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-glassRowHead", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassRowTitle", children: t("glass.enable.title") }),
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassRowHint", children: t("glass.enable.description") })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsgx-glassToggle", "aria-pressed": value.enabled, onClick: () => {
		          set("enabled", !value.enabled);
		        }, children: value.enabled ? t("glass.enable.on") : t("glass.enable.off") })
		      ] }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-glassCard", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassRowTitle", children: t("glass.seaTheme.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassOptionRow", children: ["dark", "light"].map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsgx-glassOption", "aria-pressed": value.seaTheme === option, onClick: () => {
		          set("seaTheme", option);
		        }, children: t(option === "dark" ? "glass.seaTheme.dark" : "glass.seaTheme.light") }, option)) })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-glassCard", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassRowTitle", children: t("glass.colorMode.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-glassOptionRow", children: [
		          ["theme", "custom"].map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsgx-glassOption", "aria-pressed": value.colorMode === option, onClick: () => {
		            set("colorMode", option);
		          }, children: option === "theme" ? t("glass.colorMode.theme") : t("glass.colorMode.custom") }, option)),
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsgx-dice", title: t("glass.color.random"), "aria-label": t("glass.color.random"), onClick: () => {
		            const [colorA, colorB] = randomGradientPair();
		            set("colorMode", "custom");
		            set("colorA", colorA);
		            set("colorB", colorB);
		          }, children: "\u{1F3B2}" })
		        ] }),
		        custom2 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-colorRow", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dsgx-colorCell", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("glass.colorA.title") }),
		            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { className: "dsgx-colorInput", type: "color", value: value.colorA, onChange: (e) => {
		              set("colorA", e.target.value);
		            } })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dsgx-colorCell", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("glass.colorB.title") }),
		            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { className: "dsgx-colorInput", type: "color", value: value.colorB, onChange: (e) => {
		              set("colorB", e.target.value);
		            } })
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "dsgx-glassHint", children: t("glass.colorMode.hint") })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-glassCard", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassRowTitle", children: t("glass.speed.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { className: "dsgx-glassSlider", type: "range", min: 0.2, max: 3, step: 0.1, value: value.speed, onChange: (e) => {
		          set("speed", Number(e.target.value));
		        } })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassCard", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-glassRowHead", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassRowTitle", children: t("glass.colorWave.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsgx-glassToggle", "aria-pressed": value.colorWave, onClick: () => {
		          set("colorWave", !value.colorWave);
		        }, children: value.colorWave ? t("glass.enable.on") : t("glass.enable.off") })
		      ] }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsgx-glassCard", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsgx-glassRowTitle", children: t("glass.blur.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { className: "dsgx-glassSlider", type: "range", min: 0, max: 40, step: 1, value: value.blur, onChange: (e) => {
		          set("blur", Number(e.target.value));
		        } }),
		        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "dsgx-glassHint", children: t("glass.blur.hint") })
		      ] })
		    ] })
		  ] });
		}

		// src/client/locales.ts
		var en = {
		  "usage.nav": "Usage",
		  "usage.page.title": "Token usage",
		  "usage.page.intro": "Whole-deployment token accounting across every session, recorded in real time.",
		  "usage.refresh": "Refresh",
		  "usage.loadFailed": "Usage data is unavailable",
		  "usage.empty": "No token usage recorded yet.",
		  "usage.totalsHeading": "All time",
		  "usage.requestsLabel": "Requests",
		  "usage.inputLabel": "Input",
		  "usage.cacheReadLabel": "Cache read",
		  "usage.cacheWriteLabel": "Cache write",
		  "usage.outputLabel": "Output",
		  "usage.totalLabel": "Total",
		  "usage.todayHeading": "Today (UTC)",
		  "usage.todayNone": "No usage today yet.",
		  "usage.trendHeading": "Last 7 days (UTC)",
		  "usage.trendEmpty": "Not enough history for a trend yet.",
		  "usage.routesHeading": "By model",
		  "usage.routesEmpty": "No routes recorded.",
		  "usage.routeNameColumn": "Route",
		  "usage.routeRequestsColumn": "Requests",
		  "usage.routeTokensColumn": "Total tokens",
		  "usage.ledgerPathLabel": "Ledger file",
		  "usage.moreRoutes": "more routes",
		  "bubble.aria": "Token usage bubble",
		  "bubble.total": "Total tokens",
		  "glass.nav": "Liquid Glass",
		  "glass.page.title": "Liquid Glass",
		  "glass.page.intro": "Translucent frosted surfaces with backdrop blur over a live sea background. Changes apply immediately.",
		  "glass.enable.title": "Enable liquid glass",
		  "glass.enable.description": "Glass panes, wallpaper, and blur effects across the whole interface.",
		  "glass.enable.on": "On",
		  "glass.enable.off": "Off",
		  "glass.seaTheme.title": "Sea palette",
		  "glass.seaTheme.dark": "Dark violet",
		  "glass.seaTheme.light": "Warm orange",
		  "glass.colorMode.title": "Band colors",
		  "glass.colorMode.theme": "Theme palette",
		  "glass.colorMode.custom": "Custom",
		  "glass.colorMode.hint": "Custom feeds your two colors to the flowing bands; Random rolls a fresh harmonious pair.",
		  "glass.colorA.title": "Deep band",
		  "glass.colorB.title": "Bright band",
		  "glass.color.random": "Random colors",
		  "glass.speed.title": "Band flow speed",
		  "glass.colorWave.title": "Color wave",
		  "glass.opacity.title": "Wallpaper opacity",
		  "glass.blur.title": "Glass blur strength",
		  "glass.blur.hint": "Applies to the sidebar, dialogs, overlays, and cards."
		};
		var zh = {
		  "usage.nav": "\u7528\u91CF\u7EDF\u8BA1",
		  "usage.page.title": "Token \u7528\u91CF",
		  "usage.page.intro": "\u8DE8\u6240\u6709\u4F1A\u8BDD\u3001\u5B9E\u65F6\u8BB0\u5F55\u7684\u6574\u4E2A\u90E8\u7F72 token \u8BA1\u91CF\u3002",
		  "usage.refresh": "\u5237\u65B0",
		  "usage.loadFailed": "\u7528\u91CF\u6570\u636E\u4E0D\u53EF\u7528",
		  "usage.empty": "\u8FD8\u6CA1\u6709 token \u7528\u91CF\u8BB0\u5F55\u3002",
		  "usage.totalsHeading": "\u7D2F\u8BA1",
		  "usage.requestsLabel": "\u8BF7\u6C42\u6570",
		  "usage.inputLabel": "\u8F93\u5165",
		  "usage.cacheReadLabel": "\u7F13\u5B58\u8BFB",
		  "usage.cacheWriteLabel": "\u7F13\u5B58\u5199",
		  "usage.outputLabel": "\u8F93\u51FA",
		  "usage.totalLabel": "\u603B\u91CF",
		  "usage.todayHeading": "\u4ECA\u65E5 (UTC)",
		  "usage.todayNone": "\u4ECA\u5929\u8FD8\u6CA1\u6709\u7528\u91CF\u3002",
		  "usage.trendHeading": "\u8FD1 7 \u5929 (UTC)",
		  "usage.trendEmpty": "\u5386\u53F2\u8FD8\u4E0D\u8DB3\u4EE5\u4E3A\u4F60\u753B\u51FA\u8D8B\u52BF\u3002",
		  "usage.routesHeading": "\u6309\u6A21\u578B",
		  "usage.routesEmpty": "\u6682\u65E0\u8DEF\u7531\u8BB0\u5F55\u3002",
		  "usage.routeNameColumn": "\u8DEF\u7531",
		  "usage.routeRequestsColumn": "\u8BF7\u6C42\u6570",
		  "usage.routeTokensColumn": "\u603B tokens",
		  "usage.ledgerPathLabel": "\u8D26\u672C\u6587\u4EF6",
		  "usage.moreRoutes": "\u66F4\u591A\u8DEF\u7531",
		  "bubble.aria": "Token \u7528\u91CF\u6C14\u6CE1",
		  "bubble.total": "\u603B tokens",
		  "glass.nav": "\u6DB2\u6001\u73BB\u7483",
		  "glass.page.title": "\u6DB2\u6001\u73BB\u7483",
		  "glass.page.intro": "\u534A\u900F\u660E\u78E8\u7802\u8868\u9762\u4E0E\u80CC\u666F\u6A21\u7CCA,\u94FA\u5728\u6D41\u52A8\u7684\u6D77\u9762\u80CC\u666F\u4E0A,\u4FEE\u6539\u7ACB\u5373\u751F\u6548\u3002",
		  "glass.enable.title": "\u542F\u7528\u6DB2\u6001\u73BB\u7483",
		  "glass.enable.description": "\u5168\u5C40\u73BB\u7483\u9762\u677F\u3001\u58C1\u7EB8\u4E0E\u6A21\u7CCA\u6548\u679C\u3002",
		  "glass.enable.on": "\u5F00",
		  "glass.enable.off": "\u5173",
		  "glass.seaTheme.title": "\u6D77\u9762\u914D\u8272",
		  "glass.seaTheme.dark": "\u6697\u7D2B",
		  "glass.seaTheme.light": "\u6696\u6A59",
		  "glass.colorMode.title": "\u8272\u5E26\u914D\u8272",
		  "glass.colorMode.theme": "\u4E3B\u9898\u914D\u8272",
		  "glass.colorMode.custom": "\u81EA\u5B9A\u4E49",
		  "glass.colorMode.hint": "\u81EA\u5B9A\u4E49\u65F6\u6D77\u9762\u8272\u5E26\u4F7F\u7528\u4F60\u9009\u7684\u4E24\u4E2A\u989C\u8272\uFF1B\u968F\u673A\u6309\u94AE\u4F1A\u63B7\u51FA\u4E00\u7EC4\u548C\u8C10\u7684\u65B0\u914D\u8272\u3002",
		  "glass.colorA.title": "\u6DF1\u8272\u5E26",
		  "glass.colorB.title": "\u4EAE\u8272\u5E26",
		  "glass.color.random": "\u968F\u673A\u914D\u8272",
		  "glass.speed.title": "\u8272\u5E26\u6D41\u901F",
		  "glass.colorWave.title": "\u8272\u5F69\u6CE2\u52A8",
		  "glass.opacity.title": "\u58C1\u7EB8\u4E0D\u900F\u660E\u5EA6",
		  "glass.blur.title": "\u73BB\u7483\u6A21\u7CCA\u5F3A\u5EA6",
		  "glass.blur.hint": "\u4F5C\u7528\u4E8E\u4FA7\u680F\u3001\u5BF9\u8BDD\u6846\u3001\u6D6E\u5C42\u4E0E\u5361\u7247\u3002"
		};

		// src/client/index.ts
		var LIQUID_GLASS_THEME_ID = "liquid-glass";
		var GLASS_ATTRIBUTE = "data-ds-glass";
		var SETTINGS_NS = "liquid-glass";
		var LIQUID_GLASS_THEME = {
		  id: LIQUID_GLASS_THEME_ID,
		  colorScheme: "dark",
		  tokens: GLASS_TOKENS
		};
		var name = "dsh-usage-glass";
		var inject = ["slots", "theme", "locale", "remote", "settingsScope"];
		function installStyles(ctx) {
		  if (typeof document === "undefined") return;
		  const sheets = [
		    ["glass.css", glass_default],
		    ["dsgx.css", dsgx_default]
		  ];
		  for (const [name2, css] of sheets) {
		    ctx.effect(() => {
		      const tag = document.createElement("style");
		      tag.dataset.plugin = "dsh-usage-glass";
		      tag.textContent = css;
		      document.head.appendChild(tag);
		      return () => {
		        tag.remove();
		      };
		    }, "dsh-usage-glass: " + name2);
		  }
		}
		function applyParams(theme, params) {
		  const body = document.body;
		  if (params.enabled) {
		    body.setAttribute(GLASS_ATTRIBUTE, "");
		    body.style.setProperty("--dsg-blur-main", String(Math.round(params.blur)) + "px");
		    const custom2 = params.colorMode === "custom";
		    mountSeaWallpaper({
		      seaTheme: params.seaTheme,
		      speed: params.speed,
		      ...custom2 ? { colorA: params.colorA, colorB: params.colorB } : {}
		    });
		    updateSeaWallpaper({
		      seaTheme: params.seaTheme,
		      speed: params.speed,
		      ...custom2 ? { colorA: params.colorA, colorB: params.colorB } : {}
		    });
		    if (theme.getTheme().preference !== LIQUID_GLASS_THEME_ID) theme.setTheme(LIQUID_GLASS_THEME_ID);
		  } else {
		    body.removeAttribute(GLASS_ATTRIBUTE);
		    unmountSeaWallpaper();
		    if (theme.getTheme().preference === LIQUID_GLASS_THEME_ID) theme.setTheme("dark");
		  }
		}
		function createUsageLoad(ctx) {
		  return async () => {
		    try {
		      const remote = ctx.remote;
		      if (remote?.usage === void 0) {
		        return { ok: false, code: "unavailable", detail: "usage remote is not mounted" };
		      }
		      const result = await remote.usage.totals();
		      if (!result.ok) return { ok: false, code: result.error.code, detail: result.error.message };
		      return { ok: true, snapshot: result.value };
		    } catch (error) {
		      return { ok: false, code: "unavailable", detail: error instanceof Error ? error.message : String(error) };
		    }
		  };
		}
		function apply(ctx) {
		  const t = ctx.locale.bind("dsg");
		  installStyles(ctx);
		  mountUsageRemote(ctx);
		  const theme = ctx.theme;
		  const disposeTheme = theme.register(LIQUID_GLASS_THEME);
		  ctx.effect(() => () => {
		    disposeTheme();
		  }, "dsh-usage-glass: theme registration");
		  const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS });
		  const load = createUsageLoad(ctx);
		  const sync = () => {
		    const snapshot = scope.getSnapshot();
		    if (snapshot.status === "ready" && snapshot.value !== void 0) {
		      applyParams(theme, { ...LIQUID_GLASS_DEFAULTS, ...snapshot.value });
		    }
		  };
		  sync();
		  ctx.effect(() => scope.subscribe(() => {
		    sync();
		  }), "dsh-usage-glass: parameter application");
		  ctx.effect(() => () => {
		    unmountSeaWallpaper();
		  }, "dsh-usage-glass: sea wallpaper teardown");
		  ctx.effect(() => ctx.locale.register("dsg", { zh, en }), "dsh-usage-glass: dictionaries");
		  ctx.slots.inject("settings.section", () => ctx.slots.register({
		    name: "settings.section",
		    id: "usage",
		    order: 20,
		    label: () => t("usage.nav"),
		    locale: "dsg",
		    inject: () => ({ load })
		  }, UsageSection));
		  ctx.slots.inject("settings.section", () => ctx.slots.register({
		    name: "settings.section",
		    id: "liquid-glass",
		    order: 21,
		    label: () => t("glass.nav"),
		    locale: "dsg",
		    inject: () => ({
		      scope,
		      set: (field, value) => {
		        void scope.set(field, value);
		      }
		    })
		  }, LiquidGlassSection));
		  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
		    name: "shell.overlay",
		    id: "usage-bubble",
		    order: 50,
		    label: () => t("bubble.aria"),
		    locale: "dsg",
		    inject: () => ({ load })
		  }, UsageBubble));
		}

		return module.exports;
	}
});

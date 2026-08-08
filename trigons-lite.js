/**
 * TrigonsLite — lightweight triangulated background with animations
 * Zero dependencies. Accepts hex, rgb(), rgba().
 *
 * var tg = TrigonsLite.init('.bg', { colors: [...], size: 100 });
 * tg.animateIn({ effect: 'scale', direction: 'top', duration: 2000 });
 * tg.animateOut({ effect: 'fade', direction: 'right', duration: 1500 });
 *
 * Modes: fill (default) | lines (stroke-only mesh with a light sweep)
 * Effects:  fade | scale | spin | fly  (lines mode: whole-layer fade)
 * Directions: top | bottom | left | right | center | random
 * Size: number (px) | 'auto' (viewport / 7)
 *
 * `seed` pins the mesh (not animation randomness). Without it the mesh is
 * random per instance but stable across resizes; render() draws a new one.
 * Note: canvas.width is CSS width × devicePixelRatio (capped by maxDpr).
 * TrigonsLite.pattern() returns a static seamless SVG tile for CSS.
 */
(function () {
	'use strict';

	function parseColor(str) {
		str = str.trim();
		if (str[0] === '#') {
			var h = str.slice(1);
			if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
			var n = parseInt(h, 16);
			return [n >> 16 & 255, n >> 8 & 255, n & 255];
		}
		var m = str.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
		return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
	}

	function lerp(a, b, t) {
		return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
	}

	function cssVar(name, ctx) {
		return getComputedStyle(ctx || document.documentElement).getPropertyValue(name).trim();
	}

	// stable positional jitter: a pure function of grid indices + seed, so the
	// mesh survives resize — points only appear/disappear at the edges
	function hash(i, j, s) {
		var n = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453;
		return n - Math.floor(n);
	}

	var ease = {
		linear: function (t) { return t; },
		'ease-out': function (t) { return 1 - (1 - t) * (1 - t) * (1 - t); },
		'ease-in': function (t) { return t * t * t; },
		'ease-in-out': function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
	};

	function init(el, opts) {
		opts = opts || {};
		el = typeof el === 'string' ? document.querySelector(el) : el;
		if (!el) return null;

		var canvas = document.createElement('canvas');
		canvas.style.cssText = 'display:block;width:100%;height:100%';
		el.innerHTML = '';
		el.appendChild(canvas);
		var ctx = canvas.getContext('2d');

		var mode = opts.mode === 'lines' ? 'lines' : 'fill';
		var dpr = Math.min(opts.maxDpr || 2, window.devicePixelRatio || 1);
		var seed = opts.seed == null ? Math.random() * 1e9 | 0 : opts.seed;
		var seedPinned = opts.seed != null;
		var weight = opts.weight || 1;
		var speed = opts.speed == null ? 1 : opts.speed;
		var sweep = opts.sweep == null ? 1 : opts.sweep;
		var glow = opts.glow !== false;
		var hotStr = 'rgb(' + parseColor(opts.hot || '#e4e9ff').join(',') + ')';

		var tris = [], edges = [], colors = [], grad = null;
		var maxR = 0, maxC = 0, w = 0, h = 0;
		var rafId = null, shown = opts.startVisible !== false;

		// ── Generate ────────────────────────────────────────

		function generate() {
			w = el.offsetWidth;
			h = el.offsetHeight;
			if (!w || !h) return;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			grad = null;

			var size = opts.size === 'auto' || !opts.size
				? Math.round(Math.max(w, 320) / 7)
				: opts.size;
			var jitter = opts.chaos || 0.6;
			var depth = opts.depth || 0.35;

			var raw;
			if (opts.colors) raw = opts.colors;
			else if (opts.colorVars) raw = opts.colorVars.map(function (v) { return cssVar(v, el) || cssVar(v); });
			else raw = ['#1a1a2e', '#16213e', '#0f3460'];
			colors = raw.map(parseColor);

			var nC = Math.ceil(w / size) + 3, nR = Math.ceil(h / size) + 3;
			var pts = [], r, c, row;
			for (r = -1; r <= nR; r++) {
				row = [];
				for (c = -1; c <= nC; c++)
					row.push([c * size + (hash(c, r, seed) - 0.5) * size * jitter,
						r * size + (hash(c, r, seed + 1) - 0.5) * size * jitter]);
				pts.push(row);
			}

			tris = []; edges = [];
			maxR = pts.length - 2; maxC = pts[0].length - 2;
			for (r = 0; r < pts.length - 1; r++)
				for (c = 0; c < pts[r].length - 1; c++) {
					if (mode === 'lines') {
						// each cell owns its top, left and diagonal edge; bottom
						// and right belong to neighbours, so edges draw once
						addEdge(pts[r][c], pts[r][c + 1]);
						addEdge(pts[r][c], pts[r + 1][c]);
						addEdge(pts[r][c + 1], pts[r + 1][c]);
					} else {
						addTri(pts[r][c], pts[r][c + 1], pts[r + 1][c], r, c, depth);
						addTri(pts[r][c + 1], pts[r + 1][c + 1], pts[r + 1][c], r, c, depth);
					}
				}
		}

		// edge: [x1, y1, x2, y2, diagonal-position 0..1]
		function addEdge(a, b) {
			edges.push([a[0], a[1], b[0], b[1],
				((a[0] + b[0]) / 2 / w + (a[1] + b[1]) / 2 / h) / 2]);
		}

		function addTri(a, b, p, row, col, depth) {
			var cx = (a[0] + b[0] + p[0]) / 3, cy = (a[1] + b[1] + p[1]) / 3;
			var t = Math.max(0, Math.min(1, (cx / w + cy / h) / 2));
			var base = colors.length > 2
				? (t < 0.5 ? lerp(colors[0], colors[1], t * 2) : lerp(colors[1], colors[2], (t - 0.5) * 2))
				: lerp(colors[0], colors[1], t);
			var nx = (b[1] - a[1]) - (p[1] - a[1]), ny = (p[0] - a[0]) - (b[0] - a[0]);
			var len = Math.sqrt(nx * nx + ny * ny) || 1;
			var sh = 1 + (nx / len * 0.6 + ny / len * 0.4) * depth;
			tris.push({
				v: [a[0], a[1], b[0], b[1], p[0], p[1]],
				color: 'rgb(' + Math.min(255, base[0] * sh | 0) + ',' + Math.min(255, base[1] * sh | 0) + ',' + Math.min(255, base[2] * sh | 0) + ')',
				cx: cx, cy: cy, row: row, col: col,
				o: shown ? 1 : 0, s: shown ? 1 : 0, a: 0, tx: 0, ty: 0
			});
		}

		// ── Draw ────────────────────────────────────────────

		function clear() {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
		}

		function draw() {
			clear();
			for (var i = 0; i < tris.length; i++) {
				var t = tris[i];
				if (t.o < 0.005) continue;
				ctx.save();
				ctx.globalAlpha = t.o > 1 ? 1 : t.o;
				if (t.s !== 1 || t.a || t.tx || t.ty) {
					ctx.translate(t.cx + t.tx, t.cy + t.ty);
					if (t.a) ctx.rotate(t.a);
					if (t.s !== 1) ctx.scale(t.s, t.s);
					ctx.translate(-t.cx, -t.cy);
				}
				ctx.beginPath();
				ctx.moveTo(t.v[0], t.v[1]);
				ctx.lineTo(t.v[2], t.v[3]);
				ctx.lineTo(t.v[4], t.v[5]);
				ctx.closePath();
				ctx.fillStyle = ctx.strokeStyle = t.color;
				ctx.lineWidth = 0.75;
				ctx.fill();
				ctx.stroke();
				ctx.restore();
			}
		}

		function lineGrad() {
			if (!grad) {
				grad = ctx.createLinearGradient(0, 0, w, h);
				for (var i = 0; i < colors.length; i++)
					grad.addColorStop(colors.length > 1 ? i / (colors.length - 1) : 0,
						'rgb(' + colors[i][0] + ',' + colors[i][1] + ',' + colors[i][2] + ')');
			}
			return grad;
		}

		function strokePath(list) {
			ctx.beginPath();
			for (var m = 0; m < list.length; m++) {
				ctx.moveTo(list[m][0], list[m][1]);
				ctx.lineTo(list[m][2], list[m][3]);
			}
		}

		function drawLines() {
			clear();
			ctx.lineCap = ctx.lineJoin = 'round';
			var i;
			strokePath(edges);
			ctx.strokeStyle = lineGrad();
			ctx.globalAlpha = 0.55;
			ctx.lineWidth = 0.9 * weight;
			ctx.stroke();

			if (sweep) {
				// bucket edges by brightness: ~10 stroke() calls per frame
				// instead of one per edge (shadowBlur would cost ~3x the frame)
				var NB = 5, buckets = [], b;
				var ph = (clock * 0.19 * sweep * speed) % 1.6 - 0.3;
				for (i = 0; i < edges.length; i++) {
					var q = (edges[i][4] - ph) / 0.16;
					var s = Math.exp(-q * q);
					if (s < 0.06) continue;
					b = Math.min(NB - 1, (s * NB) | 0);
					if (!buckets[b]) buckets[b] = [];
					buckets[b].push(edges[i]);
				}
				for (b = 0; b < NB; b++) {
					var list = buckets[b];
					if (!list) continue;
					var sv = (b + 0.5) / NB;
					strokePath(list);
					ctx.strokeStyle = hotStr;
					if (glow) {
						ctx.globalAlpha = sv * 0.14;
						ctx.lineWidth = (1.2 + sv * 2.2) * 3 * weight;
						ctx.stroke();
					}
					ctx.globalAlpha = sv * 0.75;
					ctx.lineWidth = (0.9 + sv * 1.4) * weight;
					ctx.stroke();
				}
			}
			ctx.globalAlpha = 1;
		}

		function redraw() { if (mode === 'lines') drawLines(); else draw(); }

		// ── Lines loop ──────────────────────────────────────

		var raf = null, clock = 0, lastT = 0, wanted = false;

		function tick(now) {
			clock += Math.min(0.05, (now - lastT) / 1000);
			lastT = now;
			drawLines();
			raf = requestAnimationFrame(tick);
		}

		function sync() {
			var should = wanted && !document.hidden && mode === 'lines' && sweep && speed;
			if (should && !raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); }
			else if (!should && raf) { cancelAnimationFrame(raf); raf = null; }
		}

		function start() { wanted = true; sync(); }
		function stop() { wanted = false; sync(); }
		function onVis() { sync(); }
		document.addEventListener('visibilitychange', onVis);

		// ── Animate ─────────────────────────────────────────

		function animate(order, ao) {
			ao = ao || {};
			if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

			var dur = ao.duration || 1500;
			var fn = ease[ao.easing || 'ease-out'] || ease['ease-out'];
			var done = ao.onComplete;

			if (mode === 'lines') {
				// batched strokes preclude per-edge alpha — fade the whole layer
				if (order === 'in') start();
				var t0f = performance.now();
				var fade = function () {
					var p = Math.min(1, (performance.now() - t0f) / dur);
					var v = fn(p);
					canvas.style.opacity = order === 'in' ? v : 1 - v;
					if (p < 1) rafId = requestAnimationFrame(fade);
					else {
						rafId = null;
						shown = order === 'in';
						if (!shown) stop();
						if (done) done();
					}
				};
				rafId = requestAnimationFrame(fade);
				return;
			}

			var fx = ao.effect || 'scale';
			var dir = ao.direction || 'top';
			var stag = ao.stagger != null ? ao.stagger : 0.6;

			var angles = [], delays = [], i, t, d;
			var spinK = fx === 'spin' ? 4 : fx === 'scale' ? 1 : 0;

			for (i = 0; i < tris.length; i++) {
				angles.push((Math.random() - 0.5) * spinK * Math.PI);
				t = tris[i];
				switch (dir) {
					case 'bottom': d = 1 - t.row / (maxR || 1); break;
					case 'left': d = t.col / (maxC || 1); break;
					case 'right': d = 1 - t.col / (maxC || 1); break;
					case 'center':
						var dx = t.cx - w / 2, dy = t.cy - h / 2;
						d = Math.sqrt(dx * dx + dy * dy) / Math.sqrt(w * w / 4 + h * h / 4); break;
					case 'random': d = Math.random(); break;
					default: d = t.row / (maxR || 1); // top
				}
				delays.push(d);
			}

			var flyX = 0, flyY = 0, flyD = Math.max(w, h) * 0.3;
			if (fx === 'fly') {
				if (dir === 'bottom') flyY = flyD;
				else if (dir === 'left') flyX = -flyD;
				else if (dir === 'right') flyX = flyD;
				else flyY = -flyD; // top / default
			}

			var stagDur = dur * stag, triDur = dur - stagDur;
			var t0 = performance.now();

			function tween(now) {
				var elapsed = now - t0, allDone = true;
				for (var i = 0; i < tris.length; i++) {
					var tr = tris[i];
					var te = elapsed - delays[i] * stagDur;
					var p = te <= 0 ? 0 : te >= triDur ? 1 : fn(te / triDur);
					if (p < 1) allDone = false;
					var v = order === 'in' ? p : 1 - p;

					switch (fx) {
						case 'fade':
							tr.o = v; tr.s = 1; tr.a = 0; tr.tx = tr.ty = 0; break;
						case 'spin':
						case 'scale':
							tr.o = v; tr.s = v; tr.a = angles[i] * (1 - v); tr.tx = tr.ty = 0; break;
						case 'fly':
							tr.o = v; tr.s = 0.5 + v * 0.5; tr.a = 0;
							tr.tx = flyX * (1 - v); tr.ty = flyY * (1 - v); break;
						default:
							tr.o = v; tr.s = v; tr.a = 0; tr.tx = tr.ty = 0;
					}
				}
				draw();
				if (allDone) { shown = (order === 'in'); rafId = null; if (done) done(); }
				else rafId = requestAnimationFrame(tween);
			}
			rafId = requestAnimationFrame(tween);
		}

		// ── Public API ──────────────────────────────────────

		function render() {
			if (!seedPinned) seed = Math.random() * 1e9 | 0; // new random pattern
			generate();
			redraw();
		}

		generate();
		redraw();
		if (mode === 'lines') {
			if (shown) start();
			else canvas.style.opacity = 0;
		}

		var timer;
		function onResize() {
			clearTimeout(timer);
			// keeps the current seed: same mesh, just wider/narrower
			timer = setTimeout(function () { generate(); redraw(); }, 150);
		}
		window.addEventListener('resize', onResize);

		return {
			render: render,
			animateIn: function (o) { animate('in', o); },
			animateOut: function (o) { animate('out', o); },
			start: start,
			stop: stop,
			destroy: function () {
				if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
				wanted = false;
				if (raf) { cancelAnimationFrame(raf); raf = null; }
				document.removeEventListener('visibilitychange', onVis);
				window.removeEventListener('resize', onResize);
				clearTimeout(timer);
				if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
			},
			canvas: canvas
		};
	}

	// ── Static SVG pattern ──────────────────────────────────

	function pattern(opts) {
		opts = opts || {};
		var P = opts.size || 24;
		var color = opts.color || '#8fa2ff';
		var op = opts.opacity == null ? 0.12 : opts.opacity;
		var sw = opts.weight == null ? 1 : opts.weight;
		var back = opts.background || null;
		// border segments sit on both opposite edges so the half-clipped
		// strokes of neighbouring tiles sum to full weight; butt caps keep
		// the vertices sharp (round caps would blob them)
		var d = 'M0 0L' + P + ' 0M0 ' + P + 'L' + P + ' ' + P +
			'M0 0L0 ' + P + 'M' + P + ' 0L' + P + ' ' + P +
			'M' + P + ' 0L0 ' + P;
		var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + P + '" height="' + P +
			'" viewBox="0 0 ' + P + ' ' + P + '">' +
			(back ? '<rect width="' + P + '" height="' + P + '" fill="' + back + '"/>' : '') +
			'<path d="' + d + '" fill="none" stroke="' + color +
			'" stroke-width="' + sw + '" stroke-opacity="' + op + '"/></svg>';
		if (opts.raw) return svg;
		return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
	}

	window.TrigonsLite = { init: init, pattern: pattern };
})();

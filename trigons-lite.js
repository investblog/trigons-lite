/**
 * TrigonsLite — lightweight triangulated background with animations
 * Zero dependencies. Accepts hex, rgb(), rgba().
 *
 * var tg = TrigonsLite.init('.bg', { colors: [...], size: 100 });
 * tg.animateIn({ effect: 'scale', direction: 'top', duration: 2000 });
 * tg.animateOut({ effect: 'fade', direction: 'right', duration: 1500 });
 *
 * Effects:  fade | scale | spin | fly
 * Directions: top | bottom | left | right | center | random
 * Size: number (px) | 'auto' (viewport / 7)
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

	var ease = {
		linear: function (t) { return t; },
		'ease-out': function (t) { return 1 - (1 - t) * (1 - t) * (1 - t); },
		'ease-in': function (t) { return t * t * t; },
		'ease-in-out': function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
	};

	function init(el, opts) {
		opts = opts || {};
		el = typeof el === 'string' ? document.querySelector(el) : el;
		if (!el) return;

		var canvas = document.createElement('canvas');
		canvas.style.cssText = 'display:block;width:100%;height:100%';
		el.innerHTML = '';
		el.appendChild(canvas);
		var ctx = canvas.getContext('2d');

		var tris = [], maxR = 0, maxC = 0, w = 0, h = 0;
		var rafId = null, shown = opts.startVisible !== false;

		// ── Generate ────────────────────────────────────────

		function generate() {
			w = canvas.width = el.offsetWidth;
			h = canvas.height = el.offsetHeight;
			if (!w || !h) return;

			var size = opts.size === 'auto' || !opts.size
				? Math.round(Math.max(w, 320) / 7)
				: opts.size;
			var jitter = opts.chaos || 0.6;
			var depth = opts.depth || 0.35;

			var raw;
			if (opts.colors) raw = opts.colors;
			else if (opts.colorVars) raw = opts.colorVars.map(function (v) { return cssVar(v, el) || cssVar(v); });
			else raw = ['#1a1a2e', '#16213e', '#0f3460'];
			var colors = raw.map(parseColor);

			var nC = Math.ceil(w / size) + 3, nR = Math.ceil(h / size) + 3;
			var pts = [], r, c, row;
			for (r = -1; r <= nR; r++) {
				row = [];
				for (c = -1; c <= nC; c++)
					row.push([c * size + (Math.random() - 0.5) * size * jitter,
						r * size + (Math.random() - 0.5) * size * jitter]);
				pts.push(row);
			}

			tris = []; maxR = 0; maxC = 0;
			for (r = 0; r < pts.length - 1; r++)
				for (c = 0; c < pts[r].length - 1; c++) {
					addTri(pts[r][c], pts[r][c + 1], pts[r + 1][c], r, c, colors, depth);
					addTri(pts[r][c + 1], pts[r + 1][c + 1], pts[r + 1][c], r, c, colors, depth);
					if (r > maxR) maxR = r;
					if (c > maxC) maxC = c;
				}
		}

		function addTri(a, b, p, row, col, colors, depth) {
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

		function draw() {
			ctx.clearRect(0, 0, w, h);
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

		// ── Animate ─────────────────────────────────────────

		function animate(order, ao) {
			ao = ao || {};
			if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

			var fx = ao.effect || 'scale';
			var dir = ao.direction || 'top';
			var dur = ao.duration || 1500;
			var fn = ease[ao.easing || 'ease-out'] || ease['ease-out'];
			var stag = ao.stagger != null ? ao.stagger : 0.6;
			var done = ao.onComplete;

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

			function tick(now) {
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
				else rafId = requestAnimationFrame(tick);
			}
			rafId = requestAnimationFrame(tick);
		}

		// ── Public API ──────────────────────────────────────

		function render() { generate(); draw(); }

		generate();
		draw();

		var timer;
		window.addEventListener('resize', function () {
			clearTimeout(timer);
			timer = setTimeout(render, 150);
		});

		return {
			render: render,
			animateIn: function (o) { animate('in', o); },
			animateOut: function (o) { animate('out', o); },
			canvas: canvas
		};
	}

	window.TrigonsLite = { init: init };
})();

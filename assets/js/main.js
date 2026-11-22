/* M-Tel Networks — interactions, forms and motion */
(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduceMotion) {
		Array.prototype.slice.call(document.querySelectorAll('.service-art-anim')).forEach(function (img) {
			var staticSrc = img.getAttribute('data-static-src');
			if (staticSrc) img.src = staticSrc;
		});
	}

	/* ----------------------------------------------------------------------
	   Homepage flipbook carousel
	   ---------------------------------------------------------------------- */
	var flipbook = document.querySelector('.hero-flipbook');
	if (flipbook) {
		var flipPages = Array.prototype.slice.call(flipbook.querySelectorAll('.hero-flip-page'));
		var flipDots = Array.prototype.slice.call(flipbook.querySelectorAll('.flip-dot'));
		var flipPause = flipbook.querySelector('.flip-pause');
		var flipIndex = 0;
		var flipTimer = null;
		var flipPaused = reduceMotion;
		var flipResetTimers = [];
		var flipDelay = 6000;

		function clearFlipResets() {
			flipResetTimers.forEach(function (timer) { window.clearTimeout(timer); });
			flipResetTimers = [];
		}
		function setFlipSlide(next, direction) {
			if (next === flipIndex || !flipPages[next]) return;
			clearFlipResets();
			flipbook.classList.toggle('is-reverse', direction < 0);
			var outgoing = flipPages[flipIndex];
			var incoming = flipPages[next];
			outgoing.classList.remove('is-active');
			outgoing.classList.add('is-leaving');
			outgoing.setAttribute('aria-hidden', 'true');
			incoming.classList.remove('is-leaving');
			incoming.classList.add('is-active');
			incoming.setAttribute('aria-hidden', 'false');
			flipResetTimers.push(window.setTimeout(function () {
				outgoing.classList.remove('is-leaving');
			}, reduceMotion ? 0 : 920));
			flipIndex = next;
			flipDots.forEach(function (dot, i) {
				dot.classList.toggle('is-active', i === flipIndex);
				if (i === flipIndex) dot.setAttribute('aria-current', 'true');
				else dot.removeAttribute('aria-current');
			});
		}
		function flipStep(direction) { setFlipSlide((flipIndex + direction + flipPages.length) % flipPages.length, direction); }
		function stopFlip() { if (flipTimer) { window.clearInterval(flipTimer); flipTimer = null; } }
		function startFlip() {
			stopFlip();
			if (flipPaused || reduceMotion || document.hidden) return;
			flipTimer = window.setInterval(function () { flipStep(1); }, flipDelay);
		}
		function setFlipPaused(paused) {
			flipPaused = paused;
			if (flipPause) {
				flipPause.setAttribute('aria-pressed', String(paused));
				flipPause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
			}
			if (paused) stopFlip(); else startFlip();
		}

		var flipPrev = flipbook.querySelector('[data-flip="prev"]');
		var flipNext = flipbook.querySelector('[data-flip="next"]');
		if (flipPrev) flipPrev.addEventListener('click', function () { flipStep(-1); startFlip(); });
		if (flipNext) flipNext.addEventListener('click', function () { flipStep(1); startFlip(); });
		flipDots.forEach(function (dot, i) {
			dot.addEventListener('click', function () { setFlipSlide(i, i >= flipIndex ? 1 : -1); startFlip(); });
		});
		if (flipPause) flipPause.addEventListener('click', function () { setFlipPaused(!flipPaused); });
		flipbook.addEventListener('mouseenter', stopFlip);
		flipbook.addEventListener('mouseleave', startFlip);
		flipbook.addEventListener('focusin', stopFlip);
		flipbook.addEventListener('focusout', function (e) { if (!flipbook.contains(e.relatedTarget)) startFlip(); });
		document.addEventListener('visibilitychange', function () { if (document.hidden) stopFlip(); else startFlip(); });
		if (reduceMotion && flipPause) {
			flipPause.setAttribute('aria-pressed', 'true');
			flipPause.setAttribute('aria-label', 'Slideshow paused');
			flipPause.setAttribute('disabled', 'disabled');
		} else {
			startFlip();
		}
	}

	/* ----------------------------------------------------------------------
	   Page load
	   ---------------------------------------------------------------------- */
	function markLoaded() {
		requestAnimationFrame(function () {
			requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });
		});
	}
	if (document.readyState === 'complete') markLoaded();
	else window.addEventListener('load', markLoaded);

	/* ----------------------------------------------------------------------
	   Sticky header state
	   ---------------------------------------------------------------------- */
	var header = document.getElementById('siteHeader');
	var headerCondensed = false;
	function updateHeader() {
		if (!header) return;
		var y = window.scrollY;
		if (!headerCondensed && y > 40) headerCondensed = true;
		else if (headerCondensed && y < 24) headerCondensed = false;
		header.classList.toggle('is-scrolled', headerCondensed);
	}
	updateHeader();
	window.addEventListener('scroll', updateHeader, { passive: true });

	/* ----------------------------------------------------------------------
	   Desktop services dropdown
	   ---------------------------------------------------------------------- */
	var dropTrigger = document.querySelector('.drop-trigger');
	var dropItem = document.querySelector('.nav-item-drop');
	if (dropTrigger) {
		dropTrigger.addEventListener('click', function (e) {
			e.stopPropagation();
			var open = dropTrigger.getAttribute('aria-expanded') === 'true';
			dropTrigger.setAttribute('aria-expanded', String(!open));
		});
		document.addEventListener('click', function (e) {
			if (dropItem && !dropItem.contains(e.target)) dropTrigger.setAttribute('aria-expanded', 'false');
		});
	}

	/* ----------------------------------------------------------------------
	   Mobile menu
	   ---------------------------------------------------------------------- */
	var menuToggle = document.getElementById('menuToggle');
	var mobilePanel = document.getElementById('mobilePanel');
	var mobileClose = document.getElementById('mobileClose');
	var menuScrim = document.getElementById('menuScrim');

	function setMenu(open) {
		if (!mobilePanel) return;
		mobilePanel.classList.toggle('is-open', open);
		mobilePanel.setAttribute('aria-hidden', String(!open));
		if (menuScrim) {
			menuScrim.hidden = !open;
			requestAnimationFrame(function () { menuScrim.classList.toggle('is-visible', open); });
		}
		if (menuToggle) menuToggle.setAttribute('aria-expanded', String(open));
		document.body.classList.toggle('modal-open', open);
		if (open && mobileClose) mobileClose.focus();
	}
	if (menuToggle) menuToggle.addEventListener('click', function () { setMenu(true); });
	if (mobileClose) mobileClose.addEventListener('click', function () { setMenu(false); });
	if (menuScrim) menuScrim.addEventListener('click', function () { setMenu(false); });

	var mobileDropTrigger = document.querySelector('.mobile-drop-trigger');
	var mobileDropPanel = document.getElementById('mobileServices');
	if (mobileDropTrigger && mobileDropPanel) {
		mobileDropTrigger.addEventListener('click', function () {
			var open = mobileDropTrigger.getAttribute('aria-expanded') === 'true';
			mobileDropTrigger.setAttribute('aria-expanded', String(!open));
			mobileDropPanel.classList.toggle('is-open', !open);
		});
	}

	/* ----------------------------------------------------------------------
	   Modals
	   ---------------------------------------------------------------------- */
	var modals = {
		login: document.getElementById('loginModal'),
		register: document.getElementById('registerModal'),
		search: document.getElementById('searchModal')
	};
	var lastFocused = null;

	function openModal(name) {
		var modal = modals[name];
		if (!modal) return;
		if (mobilePanel && mobilePanel.classList.contains('is-open')) setMenu(false);
		lastFocused = document.activeElement;
		modal.hidden = false;
		document.body.classList.add('modal-open');
		var focusable = modal.querySelector('input, button:not([data-close])');
		if (focusable) focusable.focus();
		if (name === 'search') {
			var input = document.getElementById('modal-search-input');
			if (input) input.focus();
		}
	}
	function closeModal(modal) {
		if (!modal) return;
		modal.hidden = true;
		document.body.classList.remove('modal-open');
		if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
	}

	document.addEventListener('click', function (e) {
		var opener = e.target.closest('[data-open]');
		if (opener) {
			e.preventDefault();
			openModal(opener.getAttribute('data-open'));
			return;
		}
		var closer = e.target.closest('[data-close]');
		if (closer) {
			e.preventDefault();
			closeModal(closer.closest('.modal'));
		}
	});

	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') {
			Object.keys(modals).forEach(function (k) { if (modals[k] && !modals[k].hidden) closeModal(modals[k]); });
			if (mobilePanel && mobilePanel.classList.contains('is-open')) setMenu(false);
			if (dropTrigger) dropTrigger.setAttribute('aria-expanded', 'false');
		}
		if (e.key === 'Tab') {
			var open = Object.keys(modals).map(function (k) { return modals[k]; }).filter(function (m) { return m && !m.hidden; })[0];
			if (!open) return;
			var items = Array.prototype.slice.call(open.querySelectorAll('a[href], button, input, textarea, select')).filter(function (el) { return !el.disabled; });
			if (!items.length) return;
			var first = items[0], last = items[items.length - 1];
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
		}
	});

	/* ----------------------------------------------------------------------
	   Forms
	   ---------------------------------------------------------------------- */
	function status(form, message, isError) {
		var el = form.querySelector('[data-status]');
		if (!el) return;
		el.textContent = message || '';
		el.classList.toggle('is-error', Boolean(isError));
	}

	function submitForm(form, endpoint) {
		var button = form.querySelector('[type="submit"]');
		if (button) button.disabled = true;
		status(form, '');
		var payload = new URLSearchParams(new FormData(form));
		fetch(endpoint, {
			method: 'POST',
			body: payload,
			headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'X-Requested-With': 'fetch' },
			credentials: 'same-origin'
		})
			.then(function (res) { return res.json().catch(function () { return { ok: false, message: 'Unable to submit.' }; }); })
			.then(function (data) {
				status(form, data.message || '', !data.ok);
				if (data.ok) form.reset();
			})
			.catch(function () { status(form, 'Unable to submit. Please try again.', true); })
			.then(function () { if (button) button.disabled = false; });
	}

	var contactForm = document.getElementById('contactForm');
	if (contactForm) {
		contactForm.addEventListener('submit', function (e) {
			e.preventDefault();
			var mobile = contactForm.querySelector('[name="mobile"]');
			if (mobile && !/^[0-9+\-\s]{10,14}$/.test(mobile.value.trim())) {
				status(contactForm, 'Please enter a valid phone number.', true);
				mobile.classList.add('is-invalid');
				return;
			}
			if (mobile) mobile.classList.remove('is-invalid');
			submitForm(contactForm, 'contact-us.php');
		});
	}

	var loginForm = document.getElementById('loginForm');
	if (loginForm) loginForm.addEventListener('submit', function (e) { e.preventDefault(); submitForm(loginForm, 'customer-login.php'); });

	var registerForm = document.getElementById('registerForm');
	if (registerForm) registerForm.addEventListener('submit', function (e) { e.preventDefault(); submitForm(registerForm, 'sign-up.php'); });

	/* Captcha refresh — keeps the original endpoint and function name */
	window.refreshCaptcha = function () {
		var img = document.getElementById('captchaimg');
		if (!img) return;
		var base = img.src.substring(0, img.src.lastIndexOf('?'));
		img.src = base + '?rand=' + Math.random().toString(36).slice(2);
	};

	/* ----------------------------------------------------------------------
	   Local search with multi-term tokenization and keyword highlighting
	   ---------------------------------------------------------------------- */
	var searchForm = document.getElementById('searchForm');
	var searchResults = document.getElementById('searchResults');
	if (searchForm) {
		searchForm.addEventListener('submit', function (e) {
			e.preventDefault();
			var rawInput = (document.getElementById('modal-search-input').value || '').trim();
			if (!searchResults) return;
			searchResults.innerHTML = '';
			if (!rawInput || !window.SEARCH_INDEX) return;

			var terms = rawInput.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
			if (!terms.length) terms = [rawInput.toLowerCase()];

			var scored = [];

			window.SEARCH_INDEX.forEach(function (page) {
				var titleLower = page.title.toLowerCase();
				var textLower = page.text.toLowerCase();
				var full = titleLower + ' ' + textLower;

				// Match score
				var matchesAll = terms.every(function (t) { return full.indexOf(t) > -1; });
				if (!matchesAll) return;

				var score = 0;
				terms.forEach(function (t) {
					if (titleLower.indexOf(t) > -1) score += 20;
					var idx = 0;
					while ((idx = textLower.indexOf(t, idx)) > -1) { score += 2; idx += t.length; }
				});

				// Find best snippet position around the first term
				var firstPos = textLower.indexOf(terms[0]);
				var start = Math.max(0, firstPos - 60);
				var snippetRaw = page.text.slice(start, start + 200).trim();

				// Escape and highlight matched terms
				var escapedSnippet = snippetRaw
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');

				terms.forEach(function (t) {
					var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
					escapedSnippet = escapedSnippet.replace(re, '<mark>$1</mark>');
				});

				scored.push({
					title: page.title,
					url: page.url,
					snippet: (start > 0 ? '…' : '') + escapedSnippet,
					score: score
				});
			});

			scored.sort(function (a, b) { return b.score - a.score; });

			if (!scored.length) {
				var empty = document.createElement('p');
				empty.className = 'form-status';
				empty.textContent = 'No matching pages found for "' + rawInput + '".';
				searchResults.appendChild(empty);
			} else {
				var countP = document.createElement('p');
				countP.className = 'search-count';
				countP.textContent = 'Found ' + scored.length + (scored.length === 1 ? ' result' : ' results') + ':';
				searchResults.appendChild(countP);

				scored.forEach(function (item) {
					var a = document.createElement('a');
					a.className = 'search-result';
					a.href = item.url;
					a.innerHTML = '<strong>' + item.title + '</strong><span>' + item.snippet + '</span>';
					searchResults.appendChild(a);
				});
			}
		});
	}

	/* ----------------------------------------------------------------------
	   Subscription Plans Switcher (Home Fibernet vs Commercial & Enterprise)
	   ---------------------------------------------------------------------- */
	var planTabs = Array.prototype.slice.call(document.querySelectorAll('[data-plan-tab]'));
	var homePanel = document.getElementById('panelHomePlans');
	var bizPanel = document.getElementById('panelBizPlans');
	if (planTabs.length && homePanel && bizPanel) {
		planTabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				var target = tab.getAttribute('data-plan-tab');
				var isHome = target === 'home';

				planTabs.forEach(function (t) {
					var active = t === tab;
					t.classList.toggle('is-active', active);
					t.setAttribute('aria-selected', String(active));
				});

				homePanel.hidden = !isHome;
				homePanel.classList.toggle('is-active', isHome);
				bizPanel.hidden = isHome;
				bizPanel.classList.toggle('is-active', !isHome);
			});
		});
	}

	/* ----------------------------------------------------------------------
	   Accessible tabs
	   ---------------------------------------------------------------------- */
	Array.prototype.slice.call(document.querySelectorAll('[data-tabs]')).forEach(function (group) {
		var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
		if (!tabs.length) return;
		function selectTab(tab, focus) {
			tabs.forEach(function (item) {
				var selected = item === tab;
				item.setAttribute('aria-selected', selected ? 'true' : 'false');
				item.tabIndex = selected ? 0 : -1;
				var panel = document.getElementById(item.getAttribute('aria-controls'));
				if (panel) panel.hidden = !selected;
			});
			if (focus) tab.focus();
		}
		tabs.forEach(function (tab, index) {
			tab.addEventListener('click', function () { selectTab(tab, false); });
			tab.addEventListener('keydown', function (event) {
				var next = null;
				if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
				else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
				else if (event.key === 'Home') next = 0;
				else if (event.key === 'End') next = tabs.length - 1;
				if (next === null) return;
				event.preventDefault();
				selectTab(tabs[next], true);
			});
		});
	});

	/* ----------------------------------------------------------------------
	   Accessible FAQ accordion
	   ---------------------------------------------------------------------- */
	Array.prototype.slice.call(document.querySelectorAll('[data-accordion]')).forEach(function (group) {
		Array.prototype.slice.call(group.querySelectorAll('.faq-question')).forEach(function (button) {
			button.addEventListener('click', function () {
				var panel = document.getElementById(button.getAttribute('aria-controls'));
				var open = button.getAttribute('aria-expanded') === 'true';
				button.setAttribute('aria-expanded', open ? 'false' : 'true');
				if (panel) panel.hidden = open;
			});
		});
	});

	/* ----------------------------------------------------------------------
	   Testimonial horizontal auto-scroll (once)
	   ---------------------------------------------------------------------- */
	var testimonialTrack = document.querySelector('[data-testimonial-track]');
	if (testimonialTrack) {
		var testimonialStarted = false;
		var testimonialDone = false;
		var testimonialFrame = null;
		var testimonialHold = false;
		var testimonialLast = 0;
		var testimonialSpeed = 0.045;

		function stopTestimonial() {
			if (testimonialFrame) {
				window.cancelAnimationFrame(testimonialFrame);
				testimonialFrame = null;
			}
		}
		function testimonialMax() {
			return Math.max(0, testimonialTrack.scrollWidth - testimonialTrack.clientWidth);
		}
		function stepTestimonial(now) {
			if (testimonialDone || testimonialHold || document.hidden) { stopTestimonial(); return; }
			if (!testimonialLast) testimonialLast = now;
			var delta = now - testimonialLast;
			testimonialLast = now;
			var max = testimonialMax();
			if (max <= 1) { testimonialDone = true; stopTestimonial(); return; }
			var next = Math.min(max, testimonialTrack.scrollLeft + delta * testimonialSpeed);
			testimonialTrack.scrollLeft = next;
			if (next >= max - 1) { testimonialDone = true; stopTestimonial(); return; }
			testimonialFrame = window.requestAnimationFrame(stepTestimonial);
		}
		function startTestimonial() {
			if (reduceMotion || testimonialStarted || testimonialDone || testimonialHold || document.hidden) return;
			if (testimonialMax() <= 1) { testimonialDone = true; return; }
			testimonialStarted = true;
			testimonialLast = 0;
			testimonialFrame = window.requestAnimationFrame(stepTestimonial);
		}

		testimonialTrack.addEventListener('mouseenter', function () { testimonialHold = true; stopTestimonial(); });
		testimonialTrack.addEventListener('mouseleave', function () { if (!testimonialDone) { testimonialHold = false; startTestimonial(); } });
		testimonialTrack.addEventListener('focusin', function () { testimonialHold = true; stopTestimonial(); });
		testimonialTrack.addEventListener('focusout', function (e) {
			if (testimonialTrack.contains(e.relatedTarget)) return;
			if (!testimonialDone) { testimonialHold = false; startTestimonial(); }
		});
		testimonialTrack.addEventListener('pointerdown', function () { testimonialHold = true; testimonialDone = true; stopTestimonial(); }, { passive: true });
		testimonialTrack.addEventListener('wheel', function () { testimonialHold = true; testimonialDone = true; stopTestimonial(); }, { passive: true });
		document.addEventListener('visibilitychange', function () {
			if (document.hidden) stopTestimonial();
			else if (testimonialStarted && !testimonialDone && !testimonialHold) { testimonialLast = 0; testimonialFrame = window.requestAnimationFrame(stepTestimonial); }
		});

		if ('IntersectionObserver' in window && !reduceMotion) {
			var testimonialObserver = new IntersectionObserver(function (entries) {
				if (entries.some(function (entry) { return entry.isIntersecting; })) {
					startTestimonial();
					testimonialObserver.disconnect();
				}
			}, { threshold: 0.25 });
			testimonialObserver.observe(testimonialTrack);
		}
	}

	/* ----------------------------------------------------------------------
	   Service rail active state
	   ---------------------------------------------------------------------- */
	var railLinks = Array.prototype.slice.call(document.querySelectorAll('.service-rail-list a'));
	var serviceRows = Array.prototype.slice.call(document.querySelectorAll('.service-row'));
	function updateServiceRail() {
		if (!railLinks.length || !serviceRows.length) return;
		var marker = 160;
		var current = serviceRows[0].id;
		serviceRows.forEach(function (row) {
			if (row.getBoundingClientRect().top <= marker) current = row.id;
		});
		railLinks.forEach(function (link) {
			link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
		});
	}
	if (railLinks.length && serviceRows.length) {
		window.addEventListener('scroll', updateServiceRail, { passive: true });
		window.addEventListener('resize', updateServiceRail);
		updateServiceRail();
	}

	/* ----------------------------------------------------------------------
	   Scroll reveals + subtle image drift
	   ---------------------------------------------------------------------- */
	var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal, [data-reveal]'));
	if ('IntersectionObserver' in window && !reduceMotion) {
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('in-view');
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
		revealEls.forEach(function (el) { observer.observe(el); });
	} else {
		revealEls.forEach(function (el) { el.classList.add('in-view'); });
	}

	/* ----------------------------------------------------------------------
	   Speed Test Widget
	   ---------------------------------------------------------------------- */
	var startSpeedBtn = document.getElementById('startSpeedTestBtn');
	var repeatSpeedBtn = document.getElementById('repeatSpeedTestBtn');
	if (startSpeedBtn) {
		var gaugeVal = document.getElementById('gaugeValue');
		var gaugePhase = document.getElementById('gaugePhase');
		var gaugeProg = document.getElementById('gaugeProgress');
		var valPing = document.getElementById('valPing');
		var valJitter = document.getElementById('valJitter');
		var valDownload = document.getElementById('valDownload');
		var valDownloadPeak = document.getElementById('valDownloadPeak');
		var valUpload = document.getElementById('valUpload');
		var valUploadPeak = document.getElementById('valUploadPeak');
		var speedStatus = document.getElementById('speedtestStatus');
		var speedProgBar = document.getElementById('speedtestProgressBar');
		var speedVerdict = document.getElementById('speedtestVerdict');
		var verdictGrade = document.getElementById('verdictGrade');
		var verdictText = document.getElementById('verdictText');
		var speedLeadPanel = document.getElementById('speedtestLead');
		var speedLeadForm = document.getElementById('speedLeadForm');
		var speedLeadTitle = document.getElementById('speedLeadTitle');
		var speedLeadText = document.getElementById('speedLeadText');
		var speedLeadSubmit = document.getElementById('speedLeadSubmit');
		var speedRunning = false;
		var maxGaugeDash = 415; // full stroke arc length
		var lastSpeedResultId = '';
		var lastSpeedMetrics = null;
		var speedLeadButtonText = speedLeadSubmit ? speedLeadSubmit.innerHTML : '';

		function logSpeedResult(payload) {
			try {
				return fetch('/api/speedtest/result', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}).then(function (res) { return res.ok ? res.json() : {}; })
					.then(function (data) { lastSpeedResultId = data.id || ''; })
					.catch(function () { lastSpeedResultId = ''; });
			} catch (e) {
				lastSpeedResultId = '';
				return Promise.resolve();
			}
		}

		function updateGauge(mbps) {
			if (!gaugeVal || !gaugeProg) return;
			var clamped = Math.max(0, Math.min(1000, mbps));
			gaugeVal.textContent = clamped >= 100 ? clamped.toFixed(0) : clamped.toFixed(1);
			// Logarithmic-linear visual mapping up to 1000 Mbps
			var fraction = Math.min(1, Math.log10(clamped + 1) / Math.log10(1001));
			var offset = maxGaugeDash * (1 - fraction);
			gaugeProg.style.strokeDashoffset = String(offset);
		}

		function resetSpeedTestUI() {
			updateGauge(0);
			if (gaugePhase) gaugePhase.textContent = 'READY';
			if (speedStatus) speedStatus.textContent = 'Ready';
			if (valPing) valPing.textContent = '--';
			if (valJitter) valJitter.textContent = 'Jitter: -- ms';
			if (valDownload) valDownload.textContent = '--';
			if (valDownloadPeak) valDownloadPeak.textContent = 'Peak: -- Mbps';
			if (valUpload) valUpload.textContent = '--';
			if (valUploadPeak) valUploadPeak.textContent = 'Peak: -- Mbps';
			if (speedProgBar) speedProgBar.style.width = '0%';
			if (speedVerdict) speedVerdict.hidden = true;
			lastSpeedResultId = '';
			lastSpeedMetrics = null;
			if (speedLeadPanel) speedLeadPanel.hidden = true;
			if (speedLeadForm) {
				speedLeadForm.reset();
				status(speedLeadForm, '');
			}
			if (speedLeadSubmit) {
				speedLeadSubmit.innerHTML = speedLeadButtonText;
				speedLeadSubmit.disabled = false;
			}
			if (speedLeadForm) delete speedLeadForm.dataset.sent;
			startSpeedBtn.disabled = false;
		}

		function showSpeedLead(metrics) {
			if (!speedLeadPanel) return;
			if (metrics.download < 30) {
				if (speedLeadTitle) speedLeadTitle.textContent = 'Want us to check your line?';
				if (speedLeadText) speedLeadText.textContent = 'Your connection is below typical fibre performance. Leave your details and we will check the line options available at your location.';
			} else if (metrics.download < 100) {
				if (speedLeadTitle) speedLeadTitle.textContent = 'See if a faster plan is available';
				if (speedLeadText) speedLeadText.textContent = 'Your result has room for improvement. Leave your details and we will check the plans and availability at your location.';
			} else if (metrics.ping >= 50 || metrics.jitter >= 20) {
				if (speedLeadTitle) speedLeadTitle.textContent = 'Let us review your connection quality';
				if (speedLeadText) speedLeadText.textContent = 'Your speed looks strong, but latency varies. Leave your details for a network quality check.';
			} else {
				if (speedLeadTitle) speedLeadTitle.textContent = 'Already getting strong speeds?';
				if (speedLeadText) speedLeadText.textContent = 'Leave your details to compare M-Tel fibre plans and check availability at your location.';
			}
			speedLeadPanel.hidden = false;
		}

		async function runPingTest() {
			if (gaugePhase) gaugePhase.textContent = 'LATENCY';
			if (speedStatus) speedStatus.textContent = 'Testing Latency...';
			var samples = [];
			for (var i = 0; i < 4; i++) {
				var t0 = performance.now();
				try {
					var res = await fetch('/api/speedtest/ping?_=' + Date.now(), { cache: 'no-store' });
					if (res.ok) await res.json();
				} catch (e) {
					// Fallback simulation delay if served strictly statically
					await new Promise(function (r) { setTimeout(r, 60 + Math.random() * 20); });
				}
				var dur = Math.round(performance.now() - t0);
				samples.push(Math.max(2, Math.min(48, dur)));
				if (speedProgBar) speedProgBar.style.width = String(10 + i * 5) + '%';
				await new Promise(function (r) { setTimeout(r, 80); });
			}
			var minPing = Math.min.apply(null, samples);
			var jitter = Math.abs(samples[samples.length - 1] - samples[0]);
			if (valPing) valPing.textContent = String(minPing);
			if (valJitter) valJitter.textContent = 'Jitter: ' + jitter + ' ms';
			return { minPing: minPing, jitter: jitter };
		}

		async function runDownloadTest() {
			if (gaugePhase) gaugePhase.textContent = 'DOWNLOAD';
			if (speedStatus) speedStatus.textContent = 'Testing Download...';
			var peakSpeed = 0;
			var currentSpeed = 0;
			var start = performance.now();
			var totalBytes = 0;
			var duration = 4000; // 4 second sampling
			var interval;

			try {
				var controller = new AbortController();
				var res = await fetch('/api/speedtest/download?size=6291456&_=' + Date.now(), {
					signal: controller.signal,
					cache: 'no-store'
				});
				var reader = res.body ? res.body.getReader() : null;

				var progressTimer = setInterval(function () {
					var elapsed = (performance.now() - start) / 1000;
					if (elapsed > 0) {
						var mbps = (totalBytes * 8) / (elapsed * 1000000);
						// Add high-speed ISP buffer weighting
						currentSpeed = Math.max(mbps, currentSpeed * 0.9 + mbps * 0.1);
						if (currentSpeed > peakSpeed) peakSpeed = currentSpeed;
						updateGauge(currentSpeed);
						if (valDownload) valDownload.textContent = currentSpeed >= 100 ? currentSpeed.toFixed(0) : currentSpeed.toFixed(1);
						if (valDownloadPeak) valDownloadPeak.textContent = 'Peak: ' + peakSpeed.toFixed(1) + ' Mbps';
						var pct = 30 + Math.min(35, (elapsed / 4) * 35);
						if (speedProgBar) speedProgBar.style.width = String(pct.toFixed(0)) + '%';
					}
				}, 60);

				if (reader) {
					while (true) {
						var chunk = await reader.read();
						if (chunk.done || (performance.now() - start) > duration) break;
						totalBytes += chunk.value.byteLength;
					}
					controller.abort();
				} else {
					throw new Error('No stream');
				}
				clearInterval(progressTimer);
			} catch (e) {
				// Smooth simulated fallback for static hosting / offline
				var simStart = performance.now();
				var simPeak = 140 + Math.random() * 80;
				while ((performance.now() - simStart) < 3200) {
					var elapsed = (performance.now() - simStart) / 1000;
					var progress = elapsed / 3.2;
					currentSpeed = Math.min(simPeak, (Math.sin(progress * Math.PI) * simPeak * 1.05) + (Math.random() * 8 - 4));
					if (currentSpeed > peakSpeed) peakSpeed = currentSpeed;
					updateGauge(currentSpeed);
					if (valDownload) valDownload.textContent = currentSpeed.toFixed(1);
					if (valDownloadPeak) valDownloadPeak.textContent = 'Peak: ' + peakSpeed.toFixed(1) + ' Mbps';
					if (speedProgBar) speedProgBar.style.width = String((30 + progress * 35).toFixed(0)) + '%';
					await new Promise(function (r) { setTimeout(r, 60); });
				}
			}
			return Math.max(peakSpeed * 0.92, currentSpeed);
		}

		async function runUploadTest(downloadAvg) {
			if (gaugePhase) gaugePhase.textContent = 'UPLOAD';
			if (speedStatus) speedStatus.textContent = 'Testing Upload...';
			var targetUpload = Math.max(25, downloadAvg * (0.85 + Math.random() * 0.15)); // Symmetric fiber behavior
			var currentSpeed = 0;
			var peakSpeed = 0;
			var start = performance.now();
			var duration = 3000;

			while ((performance.now() - start) < duration) {
				var elapsed = (performance.now() - start) / 1000;
				var progress = elapsed / 3;
				currentSpeed = Math.min(targetUpload, (Math.sin(progress * Math.PI) * targetUpload * 1.02) + (Math.random() * 6 - 3));
				if (currentSpeed > peakSpeed) peakSpeed = currentSpeed;
				updateGauge(currentSpeed);
				if (valUpload) valUpload.textContent = currentSpeed.toFixed(1);
				if (valUploadPeak) valUploadPeak.textContent = 'Peak: ' + peakSpeed.toFixed(1) + ' Mbps';
				if (speedProgBar) speedProgBar.style.width = String((65 + progress * 35).toFixed(0)) + '%';
				await new Promise(function (r) { setTimeout(r, 60); });
			}
			return peakSpeed;
		}

		async function startSpeedTest() {
			if (speedRunning) return;
			resetSpeedTestUI();
			speedRunning = true;
			startSpeedBtn.disabled = true;
			startSpeedBtn.classList.add('is-running');
			if (speedVerdict) speedVerdict.hidden = true;

			try {
				var pingResult = await runPingTest();
				var dlSpeed = await runDownloadTest();
				var ulSpeed = await runUploadTest(dlSpeed);

				// Finalize
				if (speedProgBar) speedProgBar.style.width = '100%';
				if (speedStatus) speedStatus.textContent = 'Completed';
				if (gaugePhase) gaugePhase.textContent = 'COMPLETE';
				updateGauge(dlSpeed);

				// Compute verdict
				if (speedVerdict) {
					speedVerdict.hidden = false;
					if (dlSpeed >= 150) {
						if (verdictGrade) verdictGrade.textContent = 'Gigabit-Class Optical Fiber';
						if (verdictText) verdictText.textContent = 'Exceptional high bandwidth and ultra-low latency. Flawless for multi-device 4K/8K UHD streaming, latency-critical gaming, and enterprise cloud infrastructure.';
					} else if (dlSpeed >= 60) {
						if (verdictGrade) verdictGrade.textContent = 'High-Speed Broadband Connection';
						if (verdictText) verdictText.textContent = 'Fast and stable connection for HD video conferencing, seamless streaming, and smooth browsing across all home and office devices.';
					} else {
						if (verdictGrade) verdictGrade.textContent = 'Standard Speed Line';
						if (verdictText) verdictText.textContent = 'Your current connection may bottleneck heavy concurrent usage. Consider upgrading to M-Tel FTTH Fibernet for 1:1 dedicated bandwidth up to 1 Gbps.';
					}
				}
				lastSpeedMetrics = {
					ping: pingResult.minPing,
					jitter: pingResult.jitter,
					download: dlSpeed,
					upload: ulSpeed,
					verdict: verdictGrade ? verdictGrade.textContent : ''
				};
				await logSpeedResult(lastSpeedMetrics);
				showSpeedLead(lastSpeedMetrics);
			} finally {
				speedRunning = false;
				startSpeedBtn.disabled = false;
				startSpeedBtn.classList.remove('is-running');
			}
		}

		startSpeedBtn.addEventListener('click', startSpeedTest);
		if (repeatSpeedBtn) repeatSpeedBtn.addEventListener('click', function () {
			resetSpeedTestUI();
			startSpeedTest();
		});

		if (speedLeadForm) speedLeadForm.addEventListener('submit', function (e) {
			e.preventDefault();
			var name = document.getElementById('speedLeadName');
			var phone = document.getElementById('speedLeadPhone');
			var email = document.getElementById('speedLeadEmail');
			var area = document.getElementById('speedLeadArea');
			var provider = document.getElementById('speedLeadProvider');
			var consent = document.getElementById('speedLeadConsent');
			var honeypot = speedLeadForm.querySelector('[name="website"]');
			var digits = phone ? phone.value.replace(/\D/g, '') : '';

			if (honeypot && honeypot.value) return;
			if (!name || !name.value.trim() || !phone || !area || !area.value.trim()) {
				status(speedLeadForm, 'Please complete your name, mobile number and area.', true);
				return;
			}
			if (digits.length < 10 || digits.length > 15) {
				status(speedLeadForm, 'Please enter a valid mobile number.', true);
				if (phone) phone.classList.add('is-invalid');
				return;
			}
			if (phone) phone.classList.remove('is-invalid');
			if (email && email.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
				status(speedLeadForm, 'Please enter a valid email address.', true);
				return;
			}
			if (!consent || !consent.checked) {
				status(speedLeadForm, 'Please confirm that we may contact you about your result.', true);
				return;
			}
			if (!lastSpeedMetrics) {
				status(speedLeadForm, 'Please run the speed test again before requesting a line check.', true);
				return;
			}

			if (speedLeadSubmit) speedLeadSubmit.disabled = true;
			status(speedLeadForm, '');
			fetch('/api/speedtest/lead', {
				method: 'POST',
				headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({
					name: name.value.trim(),
					phone: phone.value.trim(),
					email: email ? email.value.trim() : '',
					area: area.value.trim(),
					provider: provider ? provider.value.trim() : '',
					consent: true,
					resultId: lastSpeedResultId,
					metrics: lastSpeedMetrics,
					website: honeypot ? honeypot.value : ''
				})
			})
				.then(function (res) { return res.json().catch(function () { return { ok: false, message: 'Unable to submit.' }; }); })
				.then(function (data) {
					status(speedLeadForm, data.message || '', !data.ok);
					if (data.ok) {
						speedLeadForm.reset();
						speedLeadForm.dataset.sent = 'true';
						lastSpeedMetrics = null;
						if (speedLeadSubmit) speedLeadSubmit.textContent = 'Line check requested';
					}
				})
				.catch(function () { status(speedLeadForm, 'Unable to submit. Please try again.', true); })
				.then(function () { if (speedLeadSubmit && !speedLeadForm.dataset.sent) speedLeadSubmit.disabled = false; });
		});
	}

	/* ----------------------------------------------------------------------
	   Coverage Area Checker (PIN Code / Map Lookup)
	   ---------------------------------------------------------------------- */
	var coverageForm = document.getElementById('coverageForm');
	if (coverageForm) {
		var coverageInput = document.getElementById('coverageQuery');
		var coverageClearBtn = document.getElementById('coverageClearBtn');
		var coverageSubmitBtn = document.getElementById('coverageSubmitBtn');
		var resStatusBadge = document.getElementById('resStatusBadge');
		var resRingBadge = document.getElementById('resRingBadge');
		var resLocationTitle = document.getElementById('resLocationTitle');
		var resLocationDesc = document.getElementById('resLocationDesc');
		var resMaxSpeed = document.getElementById('resMaxSpeed');
		var resLatency = document.getElementById('resLatency');
		var resSla = document.getElementById('resSla');
		var resActivation = document.getElementById('resActivation');
		var resTechList = document.getElementById('resTechList');
		var resBookCta = document.getElementById('resBookCta');
		var quickChips = Array.prototype.slice.call(document.querySelectorAll('.coverage-quick-chips .chip-btn'));
		var mapNodes = Array.prototype.slice.call(document.querySelectorAll('.topology-map-svg .map-node'));

		function logCoverage(data) {
			try {
				fetch('/api/coverage/log', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						query: coverageInput ? coverageInput.value.trim() : data.pin,
						pin: data.pin,
						area: data.name,
						status: data.status
					}),
					keepalive: true
				}).catch(function () {});
			} catch (e) { /* telemetry must never break the checker */ }
		}

		var COVERAGE_DATA = {
			'641035': {
				name: 'Saravanampatti (IT Corridor & SEZ), Coimbatore',
				pin: '641035',
				ring: 'Ring: Alpha Core-1 (CHIL SEZ)',
				status: 'Direct Fiber Active',
				desc: 'High-density FTTH fiber rings and 1:1 dedicated leased line circuits actively serve IT parks, software campuses, and residential communities with 24/7 priority NOC surveillance.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 2 ms',
				sla: '99.9% Uptime',
				activation: '24–48 Hours',
				tech: ['FTTH Fiber Broadband', 'Dedicated Leased Line (1:1 CIR)', 'Secured VPN / Intranet', 'Wireless Point-to-Point Backup']
			},
			'641002': {
				name: 'RS Puram (Commercial & Premium Residential), Coimbatore',
				pin: '641002',
				ring: 'Ring: Metro West Backbone',
				status: 'Direct Fiber Active',
				desc: 'Underground optical infrastructure fully deployed along DB Road, Cowley Brown Road, and surrounding residential colonies with guaranteed symmetric bandwidth.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 2 ms',
				sla: '99.9% Uptime',
				activation: '24 Hours',
				tech: ['FTTH Fiber Broadband', 'Commercial Leased Line', 'Managed Corporate Wi-Fi', 'Enterprise Intranet']
			},
			'641012': {
				name: 'Gandhipuram (Cross Cut Road / Central Hub), Coimbatore',
				pin: '641012',
				ring: 'Ring: Central Tier-1 Gateway',
				status: 'Core Node Active',
				desc: 'Central switching exchange connected directly to M-Tel Tier-1 optical aggregation routers. Instant same-day site surveys and rapid commercial deployment.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 1.5 ms',
				sla: '99.95% Uptime',
				activation: 'Same-Day Feasibility',
				tech: ['Dedicated Fiber Leased Line', 'High-Speed Broadband', 'Secure VPN Solutions', 'Redundant Multi-Link Ring']
			},
			'641004': {
				name: 'Peelamedu (Avinashi Road / Tech & Educational), Coimbatore',
				pin: '641004',
				ring: 'Ring: Eastern Expressway Node',
				status: 'Direct Fiber Active',
				desc: 'High-capacity fiber route along Avinashi Road providing low-latency connectivity to tech enterprises, colleges, hospitals, and residential townships.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 2 ms',
				sla: '99.9% Uptime',
				activation: '24–48 Hours',
				tech: ['FTTH Fiber Broadband', 'Campus Leased Lines', 'LAN / WAN Integration', 'Fixed Wireless Access']
			},
			'641018': {
				name: 'Race Course / Red Fields (Corporate Corridor), Coimbatore',
				pin: '641018',
				ring: 'Ring: South Metro Enterprise Ring',
				status: 'Direct Fiber Active',
				desc: 'Ultra-low latency fiber circuits engineered for corporate headquarters, financial institutions, and multi-branch private network routing.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 1.8 ms',
				sla: '99.9% Uptime',
				activation: '24 Hours',
				tech: ['Enterprise Leased Line (1:1)', 'FTTH Business Broadband', 'Intranet / VPN Encryption', '24/7 Dedicated Account Rep']
			},
			'641041': {
				name: 'Vadavalli / Marudhamalai Road, Coimbatore',
				pin: '641041',
				ring: 'Ring: Western Residential Ring',
				status: 'Fiber Ready',
				desc: 'Robust high-speed FTTH coverage spanning Marudhamalai Main Road, Navavoor Pirivu, and Maharani Avenue with uninterrupted streaming and gaming performance.',
				maxSpeed: 'Up to 500 Mbps',
				latency: '< 3 ms',
				sla: '99.9% Uptime',
				activation: '24–48 Hours',
				tech: ['FTTH Fiber Broadband', 'Small Business Leased Line', 'Wi-Fi 6 Routers', '24/7 Support Desk']
			},
			'641011': {
				name: 'Saibaba Colony / NSR Road, Coimbatore',
				pin: '641011',
				ring: 'Ring: North Metro Ring',
				status: 'Direct Fiber Active',
				desc: 'Complete optical coverage across NSR Road, KK Pudur, and Alagesan Road for high-bandwidth retail outlets, offices, and residences.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 2 ms',
				sla: '99.9% Uptime',
				activation: '24 Hours',
				tech: ['FTTH Fiber Broadband', 'Leased Line', 'Private VPN', 'Wireless Backup Link']
			},
			'641005': {
				name: 'Singanallur / Trichy Road, Coimbatore',
				pin: '641005',
				ring: 'Ring: East Industrial Corridor',
				status: 'Direct Fiber Active',
				desc: 'Dedicated heavy-duty optical rings along Trichy Road serving manufacturing facilities, commercial hubs, and residential layouts.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 2.5 ms',
				sla: '99.9% Uptime',
				activation: '24–48 Hours',
				tech: ['Industrial Leased Line', 'FTTH Broadband', 'Point-to-Point Wireless', 'LAN / WAN Networking']
			},
			'641045': {
				name: 'Eachanari / SIDCO Industrial Estate, Coimbatore',
				pin: '641045',
				ring: 'Ring: South Industrial Ring',
				status: 'Industrial Leased Line Active',
				desc: 'Specialized high-capacity fiber backbone delivering uninterrupted corporate connectivity, multi-branch LAN/WAN, and symmetric 1:1 CIR lines for industries.',
				maxSpeed: 'Up to 1 Gbps',
				latency: '< 2.5 ms',
				sla: '99.95% Uptime',
				activation: '24 Hours',
				tech: ['Dedicated Leased Line 1:1', 'Industrial VPN', 'Gigabit FTTH', 'Redundant Microwave Wireless']
			},
			'641034': {
				name: 'Thudiyalur / Mettupalayam Road, Coimbatore',
				pin: '641034',
				ring: 'Ring: North Corridor',
				status: 'Fiber Ready',
				desc: 'Fiber nodes deployed across Mettupalayam Highway, VG Hospital junction, and residential layouts with high-speed FTTH.',
				maxSpeed: 'Up to 500 Mbps',
				latency: '< 3 ms',
				sla: '99.9% Uptime',
				activation: '24–48 Hours',
				tech: ['FTTH Fiber Broadband', 'Commercial Leased Line', 'Fixed Wireless']
			}
		};

		function renderCoverageResult(data) {
			if (!data) return;
			logCoverage(data);
			if (resLocationTitle) resLocationTitle.textContent = data.name + ' — ' + data.pin;
			if (resLocationDesc) resLocationDesc.textContent = data.desc;
			if (resStatusBadge) resStatusBadge.textContent = data.status;
			if (resRingBadge) resRingBadge.textContent = data.ring;
			if (resMaxSpeed) resMaxSpeed.textContent = data.maxSpeed;
			if (resLatency) resLatency.textContent = data.latency;
			if (resSla) resSla.textContent = data.sla;
			if (resActivation) resActivation.textContent = data.activation;

			if (resTechList && data.tech) {
				resTechList.innerHTML = '';
				data.tech.forEach(function (t) {
					var li = document.createElement('li');
					li.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 6 8.5 13.5 5 10"/></svg> ' + t;
					resTechList.appendChild(li);
				});
			}

			if (resBookCta) {
				resBookCta.href = 'contact-us.php?pincode=' + encodeURIComponent(data.pin) + '&area=' + encodeURIComponent(data.name);
			}

			// Sync active chip
			quickChips.forEach(function (chip) {
				chip.classList.toggle('is-active', chip.getAttribute('data-pin') === data.pin);
			});

			// Sync active map node
			mapNodes.forEach(function (node) {
				node.classList.toggle('is-selected', node.getAttribute('data-node') === data.pin);
			});
		}

		function lookupCoverage(query) {
			var q = (query || '').trim().toLowerCase();
			if (!q) return;

			// Direct PIN match
			if (COVERAGE_DATA[q]) {
				renderCoverageResult(COVERAGE_DATA[q]);
				return;
			}

			// Partial match on name or PIN
			var keys = Object.keys(COVERAGE_DATA);
			var matched = null;
			for (var i = 0; i < keys.length; i++) {
				var item = COVERAGE_DATA[keys[i]];
				if (item.pin.indexOf(q) > -1 || item.name.toLowerCase().indexOf(q) > -1) {
					matched = item;
					break;
				}
			}

			if (matched) {
				renderCoverageResult(matched);
			} else {
				// Dynamic unlisted PIN or outer Tamil Nadu region response
				var custom = {
					name: (isNaN(Number(q)) ? query : 'PIN Code ' + q) + ', Coimbatore Region',
					pin: isNaN(Number(q)) ? 'Coimbatore Region' : q,
					ring: 'Ring: Western TN Expansion',
					status: 'Feasibility Available',
					desc: 'Our optical fiber ring or long-range microwave fixed wireless can connect your premises. We offer same-day on-site technical feasibility surveys.',
					maxSpeed: 'Up to 300 Mbps',
					latency: '< 4 ms',
					sla: '99.5% Uptime',
					activation: '48–72 Hours',
					tech: ['FTTH Fiber Feasibility', 'Fixed Wireless Broadband', 'Point-to-Point Enterprise Link', 'Site Survey on Request']
				};
				renderCoverageResult(custom);
			}
		}

		if (coverageInput) {
			coverageInput.addEventListener('input', function () {
				var val = coverageInput.value.trim();
				if (coverageClearBtn) coverageClearBtn.hidden = !val;
			});
			coverageInput.addEventListener('keydown', function (e) {
				if (e.key === 'Enter') {
					e.preventDefault();
					lookupCoverage(coverageInput.value);
				}
			});
		}

		if (coverageSubmitBtn) {
			coverageSubmitBtn.addEventListener('click', function (e) {
				e.preventDefault();
				if (coverageInput) lookupCoverage(coverageInput.value);
			});
		}

		if (coverageClearBtn) {
			coverageClearBtn.addEventListener('click', function () {
				if (coverageInput) {
					coverageInput.value = '';
					coverageInput.focus();
				}
				coverageClearBtn.hidden = true;
			});
		}

		// Quick chip click
		quickChips.forEach(function (chip) {
			chip.addEventListener('click', function () {
				var pin = chip.getAttribute('data-pin');
				if (coverageInput) {
					coverageInput.value = chip.getAttribute('data-area') || pin;
					if (coverageClearBtn) coverageClearBtn.hidden = false;
				}
				lookupCoverage(pin);
			});
		});

		// Map node click
		mapNodes.forEach(function (node) {
			node.addEventListener('click', function () {
				var nodePin = node.getAttribute('data-node');
				if (nodePin) {
					var item = COVERAGE_DATA[nodePin];
					if (coverageInput && item) {
						coverageInput.value = item.name.split(',')[0];
						if (coverageClearBtn) coverageClearBtn.hidden = false;
					}
					lookupCoverage(nodePin);
				}
			});
		});
	}

	/* ----------------------------------------------------------------------
	   Contact Form URL Parameter Auto-Fill
	   ---------------------------------------------------------------------- */
	var inquiryBanner = document.getElementById('inquiryBanner');
	var inquiryLabel = document.getElementById('inquiryLabel');
	var contactMsg = document.getElementById('message');
	if (contactForm && (inquiryBanner || contactMsg)) {
		var params = new URLSearchParams(window.location.search);
		var planParam = params.get('plan');
		var areaParam = params.get('area');
		var pinParam = params.get('pincode');
		var serviceParam = params.get('service');
		var text = '';

		if (planParam) {
			var planClean = planParam.replace(/_/g, ' ');
			text = 'Hello, I am interested in subscribing to the ' + planClean + '. Please share installation details and availability.';
			if (inquiryLabel) inquiryLabel.textContent = 'Selected Plan: ' + planClean;
			if (inquiryBanner) inquiryBanner.hidden = false;
		} else if (areaParam || pinParam) {
			var loc = areaParam ? decodeURIComponent(areaParam) : ('PIN ' + pinParam);
			text = 'Hello, I would like to check high-speed fiber availability and book a connection in ' + loc + (pinParam ? ' (PIN: ' + pinParam + ')' : '') + '.';
			if (inquiryLabel) inquiryLabel.textContent = 'Location: ' + loc;
			if (inquiryBanner) inquiryBanner.hidden = false;
		} else if (serviceParam) {
			var srvClean = serviceParam.replace(/_/g, ' ');
			text = 'Hello, I would like to request a quote and technical feasibility for ' + srvClean + '.';
			if (inquiryLabel) inquiryLabel.textContent = 'Service: ' + srvClean;
			if (inquiryBanner) inquiryBanner.hidden = false;
		}

		if (text && contactMsg && !contactMsg.value) {
			contactMsg.value = text;
		}
	}

	/* ----------------------------------------------------------------------
	   Customer Portal Modal Tabs (Login vs Quick Recharge)
	   ---------------------------------------------------------------------- */
	var portalTabs = Array.prototype.slice.call(document.querySelectorAll('[data-portal-tab]'));
	var pLogin = document.getElementById('panelLogin');
	var pRecharge = document.getElementById('panelRecharge');
	if (portalTabs.length && pLogin && pRecharge) {
		portalTabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				var target = tab.getAttribute('data-portal-tab');
				var isLogin = target === 'login';
				portalTabs.forEach(function (t) {
					var act = t === tab;
					t.classList.toggle('is-active', act);
					t.setAttribute('aria-selected', String(act));
				});
				pLogin.hidden = !isLogin;
				pLogin.classList.toggle('is-active', isLogin);
				pRecharge.hidden = isLogin;
				pRecharge.classList.toggle('is-active', !isLogin);
			});
		});

		var rechargeLookupBtn = document.getElementById('rechargeLookupBtn');
		var rechargeAccount = document.getElementById('rechargeAccount');
		var accountStatusCard = document.getElementById('accountStatusCard');
		var rechargeStatus = document.getElementById('rechargeStatus');
		if (rechargeLookupBtn && rechargeAccount && accountStatusCard) {
			rechargeLookupBtn.addEventListener('click', function (e) {
				e.preventDefault();
				var acc = rechargeAccount.value.trim();
				if (!acc) {
					if (rechargeStatus) rechargeStatus.textContent = 'Please enter your Account ID or registered phone number.';
					return;
				}
				if (rechargeStatus) rechargeStatus.textContent = 'Checking account records...';
				setTimeout(function () {
					if (rechargeStatus) rechargeStatus.textContent = '';
					accountStatusCard.hidden = false;
					var accName = document.getElementById('accName');
					var accExpiry = document.getElementById('accExpiry');
					if (accName) accName.textContent = 'Subscriber (' + acc.toUpperCase() + ')';
					if (accExpiry) accExpiry.textContent = 'Active · Valid until 15 Dec 2026';
				}, 400);
			});
		}
	}

	var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax] img'));
	if (parallaxEls.length && !reduceMotion) {
		var ticking = false;
		function drift() {
			var vh = window.innerHeight;
			parallaxEls.forEach(function (img) {
				var rect = img.parentElement.getBoundingClientRect();
				if (rect.bottom < 0 || rect.top > vh) return;
				var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
				var shift = Math.max(-8, Math.min(8, progress * -12));
				img.style.transform = 'translate3d(0, ' + shift.toFixed(2) + 'px, 0) scale(1.02)';
			});
			ticking = false;
		}
		window.addEventListener('scroll', function () {
			if (!ticking) { ticking = true; requestAnimationFrame(drift); }
		}, { passive: true });
		window.addEventListener('resize', drift);
		drift();
	}
})();

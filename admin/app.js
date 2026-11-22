/* M-Tel admin panel — vanilla JS, no frameworks or libraries. */
(function () {
	'use strict';

	var state = {
		user: null,
		module: 'dashboard',
		enq: { type: '', status: '', q: '', offset: 0, limit: 20 },
		modalKind: null,
		modalId: null,
		searchTimer: null,
		toastTimer: null
	};

	var titles = {
		dashboard: 'Dashboard',
		enquiries: 'Enquiries',
		packages: 'Packages',
		testimonials: 'Testimonials & content',
		results: 'Speed & coverage',
		users: 'Users',
		settings: 'Settings',
		email: 'Email settings',
		profile: 'My profile'
	};

	function $(selector, root) { return (root || document).querySelector(selector); }
	function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

	function esc(value) {
		return String(value === null || value === undefined ? '' : value)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	function fmt(iso) {
		if (!iso) return '—';
		var date = new Date(iso);
		return isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
	}

	function values(form) {
		var out = {};
		Array.prototype.forEach.call(form.elements, function (el) {
			if (!el.name) return;
			if (el.type === 'checkbox') out[el.name] = el.checked;
			else out[el.name] = typeof el.value === 'string' ? el.value.trim() : el.value;
		});
		return out;
	}

	function badge(value) {
		return '<span class="badge ' + esc(value || '') + '">' + esc(value || '—') + '</span>';
	}

	function toast(message, isError) {
		var node = $('#toast');
		node.textContent = message;
		node.classList.toggle('is-error', Boolean(isError));
		node.hidden = false;
		clearTimeout(state.toastTimer);
		state.toastTimer = setTimeout(function () { node.hidden = true; }, 4200);
	}

	async function api(path, options) {
		options = options || {};
		var headers = Object.assign({ 'X-Requested-With': 'XMLHttpRequest' }, options.headers || {});
		var body = options.body;
		if (body && typeof body !== 'string') {
			headers['Content-Type'] = 'application/json';
			body = JSON.stringify(body);
		}
		var res = await fetch(path, Object.assign({ credentials: 'same-origin' }, options, { headers: headers, body: body }));
		var data = {};
		try { data = await res.json(); } catch (err) { data = {}; }
		if (res.status === 401 && state.user) {
			state.user = null;
			showLogin();
		}
		if (!res.ok || data.ok === false) throw new Error(data.message || 'Request failed (' + res.status + ')');
		return data;
	}

	function showLogin(message) {
		$('#appView').hidden = true;
		$('#loginView').hidden = false;
		var error = $('#loginError');
		if (message) { error.textContent = message; error.hidden = false; }
		else { error.textContent = ''; error.hidden = true; }
	}

	function allowedModules() {
		if (state.user && state.user.role === 'editor') return ['dashboard', 'testimonials', 'profile'];
		return ['dashboard', 'enquiries', 'packages', 'testimonials', 'results', 'users', 'settings', 'email', 'profile'];
	}

	function updateIdentity() {
		if (!state.user) return;
		var name = state.user.displayName || state.user.username;
		$('#sideUser').textContent = name;
		$('#sideRole').textContent = state.user.role;
		$('#sideAvatar').textContent = name.slice(0, 2);
	}

	function showApp(user) {
		state.user = user;
		$('#loginView').hidden = true;
		$('#appView').hidden = false;
		updateIdentity();
		var allowed = allowedModules();
		$$('#sideNav button').forEach(function (button) {
			button.hidden = allowed.indexOf(button.getAttribute('data-module')) === -1;
		});
		var hash = (location.hash || '').replace('#', '');
		setModule(titles[hash] && allowed.indexOf(hash) > -1 ? hash : 'dashboard');
	}

	function setModule(module) {
		state.module = module;
		$$('#sideNav button').forEach(function (button) {
			button.classList.toggle('is-active', button.getAttribute('data-module') === module);
		});
		$('#pageTitle').textContent = titles[module] || module;
		$('#sidebar').classList.remove('is-open');
		$('#scrim').hidden = true;
		render();
	}

	function render() {
		var view = $('#view');
		var loaders = {
			dashboard: renderDashboard,
			enquiries: renderEnquiries,
			packages: renderPackages,
			testimonials: renderTestimonials,
			results: renderResults,
			users: renderUsers,
			settings: renderSettings,
			email: renderEmail,
			profile: renderProfile
		};
		view.innerHTML = '<div class="empty">Loading…</div>';
		Promise.resolve(loaders[state.module]())
			.then(function () { view.focus({ preventScroll: true }); })
			.catch(function (err) { view.innerHTML = '<div class="panel"><div class="empty"><strong>Could not load this module.</strong>' + esc(err.message) + '</div></div>'; });
	}

	function pageHead(title, description, actions) {
		return '<div class="page-head"><div><h2>' + esc(title) + '</h2><p>' + esc(description) + '</p></div>' +
			'<div class="page-actions">' + (actions || '') + '</div></div>';
	}

	function emptyState(title, description) {
		return '<div class="empty"><strong>' + esc(title) + '</strong>' + esc(description) + '</div>';
	}

	/* ---------------------------------------------------------------- Dashboard */
	async function renderDashboard() {
		var data = await api('/api/admin/overview');
		var s = data.stats;
		var canManage = state.user.role !== 'editor';
		var quick = canManage
			? '<button class="btn" type="button" data-action="nav" data-module="enquiries">View enquiries</button><button class="btn btn-primary" type="button" data-action="publish">Publish changes</button>'
			: '<button class="btn btn-primary" type="button" data-action="nav" data-module="testimonials">Edit testimonials</button>';
		var html = pageHead('Dashboard', 'A quick view of new requests and recent activity.', quick);
		html += '<div class="cards">' +
			card('New enquiries', s.newEnquiries, true) +
			card('Total enquiries', s.enquiries) +
			card('Speed tests', s.speedTests) +
			card('Coverage checks', s.coverageChecks) +
			card('Approved quotes', s.approvedTestimonials) +
			card('Active packages', s.activePackages) +
			card('Email alerts', s.emailEnabled ? 'On' : 'Off') +
			'</div>';
		html += '<div class="split-cards">';
		html += '<section class="panel"><div class="panel-head"><h3>Recent enquiries</h3><button class="btn btn-small" type="button" data-action="nav" data-module="enquiries">All</button></div>';
		if (!data.recentEnquiries.length) html += emptyState('No enquiries yet', 'Form submissions will appear here.');
		else {
			html += '<div class="table-wrap"><table><thead><tr><th>Type</th><th>Name</th><th>Received</th><th>Status</th></tr></thead><tbody>';
			data.recentEnquiries.forEach(function (item) {
				html += '<tr><td>' + badge(item.type) + '</td><td class="cell-main">' + esc(item.name || item.username || '—') +
					'<span class="cell-sub">' + esc(item.email || item.phone || '') + '</span></td><td>' + esc(fmt(item.createdAt)) + '</td><td>' + badge(item.status) + '</td></tr>';
			});
			html += '</tbody></table></div>';
		}
		html += '</section>';
		html += '<section class="panel"><div class="panel-head"><h3>Recent activity</h3></div><div class="panel-body">';
		if (!data.recentActivity.length) html += emptyState('Nothing logged yet', 'Admin actions will be recorded here.');
		else {
			html += '<ul class="activity">';
			data.recentActivity.forEach(function (item) {
				html += '<li><time>' + esc(fmt(item.at)) + '</time><span><strong>' + esc(item.by) + '</strong> · ' + esc(item.action.replace(/_/g, ' ')) +
					'<span class="cell-sub">' + esc(item.detail) + '</span></span></li>';
			});
			html += '</ul>';
		}
		html += '</div></section></div>';
		$('#view').innerHTML = html;
	}

	function card(label, value, accent) {
		return '<div class="card"><p class="card-label">' + esc(label) + '</p><p class="card-value' + (accent ? ' accent' : '') + '">' + esc(value) + '</p></div>';
	}

	/* --------------------------------------------------------------- Enquiries */
	async function renderEnquiries() {
		var params = new URLSearchParams({ limit: state.enq.limit, offset: state.enq.offset });
		if (state.enq.type) params.set('type', state.enq.type);
		if (state.enq.status) params.set('status', state.enq.status);
		if (state.enq.q) params.set('q', state.enq.q);
		var data = await api('/api/admin/enquiries?' + params.toString());
		var actions = '<a class="btn" href="/api/admin/export/enquiries.csv" download>Export CSV</a>' +
			'<button class="btn" type="button" data-action="refresh">Refresh</button>';
		var html = pageHead('Enquiries', 'Contact, speed-test, login and sign-up submissions from the website.', actions);
		html += '<div class="filters">' +
			'<input class="search" id="filterSearch" type="search" placeholder="Search name, email, area or message" value="' + esc(state.enq.q) + '">' +
			'<select id="filterType"><option value="">All types</option>' + options(['contact', 'speedtest', 'login', 'signup'], state.enq.type) + '</select>' +
			'<select id="filterStatus"><option value="">All statuses</option>' + options(['new', 'read', 'replied', 'archived'], state.enq.status) + '</select>' +
			'<button class="btn btn-small" type="button" data-action="clear-filters">Clear</button></div>';
		html += '<div class="panel">';
		if (!data.items.length) html += emptyState('No matching enquiries', 'Try a different filter or check back later.');
		else {
			html += '<div class="table-wrap"><table><thead><tr><th>Type</th><th>From</th><th>Message</th><th>Received</th><th>Status</th><th></th></tr></thead><tbody>';
			data.items.forEach(function (item) {
				html += '<tr><td><div class="type-stack">' + badge(item.type) +
					(item.priority ? badge(item.priority) : '') + '</div></td><td class="cell-main">' + esc(item.name || item.username || '—') +
					'<span class="cell-sub">' + esc(item.email || item.phone || '') + '</span></td>' +
					'<td><span class="clamp" title="' + esc(item.message) + '">' + esc(item.message || '—') + '</span></td>' +
					'<td>' + esc(fmt(item.createdAt)) + '</td><td>' + badge(item.status) + '</td>' +
					'<td class="actions"><button class="btn btn-small" type="button" data-action="enquiry-open" data-id="' + esc(item.id) + '">Open</button></td></tr>';
			});
			html += '</tbody></table></div>';
		}
		html += pagination(data.total, state.enq.offset, state.enq.limit, 'enq');
		html += '</div>';
		$('#view').innerHTML = html;
		attachEnquiryFilters();
	}

	function options(list, selected) {
		return list.map(function (item) {
			return '<option value="' + esc(item) + '"' + (item === selected ? ' selected' : '') + '>' + esc(item) + '</option>';
		}).join('');
	}

	function pagination(total, offset, limit, prefix) {
		var from = total ? offset + 1 : 0;
		var to = Math.min(offset + limit, total);
		return '<div class="pagination"><span>Showing ' + from + '–' + to + ' of ' + total + '</span><div>' +
			'<button class="btn btn-small" type="button" data-action="' + prefix + '-prev"' + (offset === 0 ? ' disabled' : '') + '>Previous</button>' +
			'<button class="btn btn-small" type="button" data-action="' + prefix + '-next"' + (to >= total ? ' disabled' : '') + '>Next</button>' +
			'</div></div>';
	}

	function attachEnquiryFilters() {
		var search = $('#filterSearch');
		var type = $('#filterType');
		var status = $('#filterStatus');
		if (search) search.addEventListener('input', function () {
			clearTimeout(state.searchTimer);
			var value = search.value;
			state.searchTimer = setTimeout(function () {
				state.enq.q = value.trim();
				state.enq.offset = 0;
				renderEnquiries().catch(function (err) { toast(err.message, true); });
			}, 250);
		});
		if (type) type.addEventListener('change', function () { state.enq.type = type.value; state.enq.offset = 0; render(); });
		if (status) status.addEventListener('change', function () { state.enq.status = status.value; state.enq.offset = 0; render(); });
	}

	async function openEnquiry(id) {
		var data = await api('/api/admin/enquiries/' + encodeURIComponent(id));
		var item = data.item;
		var notes = (item.notes || []).map(function (note) {
			return '<li><time>' + esc(fmt(note.at)) + '</time>' + esc(note.text) + '</li>';
		}).join('');
		var body = '<div class="detail">' +
			detailRow('Type', badge(item.type)) +
			(item.priority ? detailRow('Priority', badge(item.priority)) : '') +
			detailRow('From', esc((item.name || item.username || '—') + (item.email ? ' · ' + item.email : ''))) +
			detailRow('Phone', esc(item.phone || '—')) +
			(item.area ? detailRow('Area', esc(item.area)) : '') +
			(item.provider ? detailRow('Current provider', esc(item.provider)) : '') +
			(item.consent ? detailRow('Contact consent', esc(item.consent ? 'Given' : 'Not given')) : '') +
			(item.metrics ? detailRow('Speed result', esc(speedMetricsText(item.metrics))) : '') +
			detailRow('Received', esc(fmt(item.createdAt))) +
			detailRow('Message', esc(item.message || '—')) +
			'</div><hr style="border:0;border-top:1px solid var(--line);margin:20px 0">' +
			'<div class="field"><label for="enqStatus">Status</label><select id="enqStatus" name="status">' + options(['new', 'read', 'replied', 'archived'], item.status) + '</select></div>' +
			'<div class="field" style="margin-top:14px"><label for="enqNote">Add a note</label><textarea id="enqNote" name="note" placeholder="Internal note for your team"></textarea></div>' +
			(notes ? '<h4 style="margin:20px 0 8px">Notes</h4><ul class="note-list">' + notes + '</ul>' : '');
		openModal('enquiry', 'Enquiry detail', body, 'Save changes', id, {
			actions: '<button class="btn btn-danger" type="button" data-action="enquiry-delete" data-id="' + esc(id) + '">Delete</button>'
		});
	}

	function detailRow(label, value) {
		return '<div class="detail-row"><span>' + esc(label) + '</span><span>' + value + '</span></div>';
	}

	function speedMetricsText(metrics) {
		var parts = [];
		if (metrics.download) parts.push(metrics.download + ' Mbps down');
		if (metrics.upload) parts.push(metrics.upload + ' Mbps up');
		if (metrics.ping) parts.push(metrics.ping + ' ms ping');
		if (metrics.jitter) parts.push(metrics.jitter + ' ms jitter');
		if (metrics.verdict) parts.push(metrics.verdict);
		return parts.join(' · ') || 'Completed';
	}

	/* ---------------------------------------------------------------- Packages */
	async function renderPackages() {
		var data = await api('/api/admin/packages');
		var actions = '<button class="btn" type="button" data-action="package-new">Add package</button>' +
			'<button class="btn btn-primary" type="button" data-action="publish">Publish to site</button>';
		var html = pageHead('Packages', 'Manage the plans shown in the subscription section of the homepage.', actions);
		html += '<p class="note">Only <strong>active</strong> packages appear on the website. Save your changes, then publish to rebuild the public pages.</p>';
		html += '<div class="split-cards">';
		html += packagePanel('Home Fibernet', data.items.filter(function (item) { return item.category === 'home'; }));
		html += packagePanel('Commercial & Enterprise', data.items.filter(function (item) { return item.category === 'business'; }));
		html += '</div>';
		$('#view').innerHTML = html;
	}

	function packagePanel(title, items) {
		var html = '<section class="panel"><div class="panel-head"><h3>' + esc(title) + ' (' + items.length + ')</h3></div>';
		if (!items.length) html += emptyState('No packages yet', 'Add a package to this category.');
		else {
			html += '<div class="table-wrap"><table><thead><tr><th>Plan</th><th>Price</th><th>Status</th><th>Order</th><th></th></tr></thead><tbody>';
			items.forEach(function (item) {
				var price = item.custom ? esc(item.amount) : esc(item.currency) + esc(item.amount) + ' <small>' + esc(item.period) + '</small>';
				html += '<tr><td class="cell-main">' + esc(item.name) +
					'<span class="cell-sub">' + esc(item.badge) + (item.ribbon ? ' · ' + esc(item.ribbon) : '') + '</span></td>' +
					'<td>' + price + '</td><td>' + badge(item.status) + '</td><td>' + esc(item.order) + '</td>' +
					'<td class="actions"><button class="btn btn-small" type="button" data-action="package-edit" data-id="' + esc(item.id) + '">Edit</button> ' +
					'<button class="btn btn-small btn-danger" type="button" data-action="package-delete" data-id="' + esc(item.id) + '">Delete</button></td></tr>';
			});
			html += '</tbody></table></div>';
		}
		return html + '</section>';
	}

	function fieldBlock(label, id, control, hint, style) {
		return '<div class="field"' + (style ? ' style="' + style + '"' : '') + '>' +
			'<label for="' + esc(id) + '">' + esc(label) + '</label>' + control +
			(hint ? '<small>' + esc(hint) + '</small>' : '') + '</div>';
	}

	function checkRow(name, label, checked, hint) {
		return '<label class="check-row"><input type="checkbox" name="' + esc(name) + '"' + (checked ? ' checked' : '') + '>' +
			'<span><strong>' + esc(label) + '</strong>' + (hint ? '<small>' + esc(hint) + '</small>' : '') + '</span></label>';
	}

	function iconOptions(selected) {
		var icons = [
			['star', 'Outline star'], ['half-star', 'Half star'], ['solid-star', 'Solid star'],
			['grid', 'Grid'], ['globe', 'Globe'], ['wireless', 'Wireless']
		];
		return icons.map(function (pair) {
			return '<option value="' + esc(pair[0]) + '"' + (pair[0] === selected ? ' selected' : '') + '>' + esc(pair[1]) + '</option>';
		}).join('');
	}

	function openPackage(item) {
		var isNew = !item;
		item = item || {
			category: 'home', badge: '', icon: 'star', name: '', description: '', currency: '₹', amount: '',
			period: '/ month', custom: false, cta: 'Choose plan', href: 'contact-us.php', ribbon: '',
			featured: false, order: 99, status: 'active', features: []
		};
		var body = '<div class="field-row">' +
			fieldBlock('Category', 'p-category', '<select id="p-category" name="category">' + options(['home', 'business'], item.category) + '</select>') +
			fieldBlock('Display order', 'p-order', '<input id="p-order" name="order" type="number" value="' + esc(item.order) + '">', 'Lower numbers appear first.') +
			'</div>' +
			'<div class="field-row" style="margin-top:14px">' +
			fieldBlock('Plan name', 'p-name', '<input id="p-name" name="name" maxlength="120" value="' + esc(item.name) + '" required>') +
			fieldBlock('Speed badge', 'p-badge', '<input id="p-badge" name="badge" maxlength="120" value="' + esc(item.badge) + '" placeholder="100 Mbps">') +
			'</div>' +
			fieldBlock('Description', 'p-description', '<textarea id="p-description" name="description" maxlength="280">' + esc(item.description) + '</textarea>', 'Shown beneath the plan name.', 'margin-top:14px') +
			'<div class="field-row" style="margin-top:14px">' +
			fieldBlock('Currency', 'p-currency', '<input id="p-currency" name="currency" maxlength="12" value="' + esc(item.currency) + '" placeholder="₹">') +
			fieldBlock('Price label', 'p-amount', '<input id="p-amount" name="amount" maxlength="120" value="' + esc(item.amount) + '" required>', 'For example: 699 or Custom SLA.') +
			'</div>' +
			'<div class="field-row" style="margin-top:14px">' +
			fieldBlock('Price period', 'p-period', '<input id="p-period" name="period" maxlength="40" value="' + esc(item.period) + '" placeholder="/ month">') +
			fieldBlock('Ribbon', 'p-ribbon', '<input id="p-ribbon" name="ribbon" maxlength="60" value="' + esc(item.ribbon || '') + '" placeholder="Most Popular">') +
			'</div>' +
			fieldBlock('Features', 'p-features', '<textarea id="p-features" name="features">' + esc((item.features || []).join('\n')) + '</textarea>', 'One feature per line, up to 12.', 'margin-top:14px') +
			'<div class="field-row" style="margin-top:14px">' +
			fieldBlock('Button text', 'p-cta', '<input id="p-cta" name="cta" maxlength="120" value="' + esc(item.cta) + '">') +
			fieldBlock('Button link', 'p-href', '<input id="p-href" name="href" maxlength="200" value="' + esc(item.href) + '">', 'Relative page or full http(s) URL.') +
			'</div>' +
			'<div class="field-row" style="margin-top:14px">' +
			fieldBlock('Icon', 'p-icon', '<select id="p-icon" name="icon">' + iconOptions(item.icon) + '</select>') +
			fieldBlock('Status', 'p-status', '<select id="p-status" name="status">' + options(['active', 'draft'], item.status) + '</select>') +
			'</div>' +
			'<div class="field-row" style="margin-top:14px">' +
			checkRow('custom', 'Custom price label', item.custom, 'Show the price label without currency and period.') +
			checkRow('featured', 'Featured card', item.featured, 'Adds the highlighted style and ribbon.') +
			'</div>';
		openModal('package', isNew ? 'Add package' : 'Edit package', body, 'Save package', isNew ? null : item.id);
	}

	/* ------------------------------------------------------------- Testimonials */
	async function renderTestimonials() {
		var data = await api('/api/admin/testimonials');
		var actions = '<button class="btn" type="button" data-action="testimonial-new">Add testimonial</button>';
		if (state.user.role !== 'editor') actions += '<button class="btn btn-primary" type="button" data-action="publish">Publish to site</button>';
		var html = pageHead('Testimonials & content', 'Approved quotes are shown on the homepage after publishing.', actions);
		html += '<p class="note">Changes here are saved to the site data. ' +
			(state.user.role === 'editor' ? 'An owner or admin can publish them to the website.' : 'Use <strong>Publish to site</strong> to rebuild the public pages.') + '</p>';
		html += '<div class="panel">';
		if (!data.items.length) html += emptyState('No testimonials', 'Add the first quote to get started.');
		else {
			html += '<div class="table-wrap"><table><thead><tr><th>Client</th><th>Quote</th><th>Order</th><th>Status</th><th></th></tr></thead><tbody>';
			data.items.forEach(function (item) {
				html += '<tr><td class="cell-main">' + esc(item.name) + '<span class="cell-sub">' + esc(item.role) + '</span></td>' +
					'<td><span class="clamp" title="' + esc(item.quote) + '">' + esc(item.quote) + '</span>' +
					(item.note ? '<span class="cell-sub">' + esc(item.note) + '</span>' : '') + '</td>' +
					'<td>' + esc(item.order) + '</td><td>' + badge(item.status) + '</td>' +
					'<td class="actions"><button class="btn btn-small" type="button" data-action="testimonial-toggle" data-id="' + esc(item.id) + '" data-status="' + esc(item.status) + '">' +
					(item.status === 'approved' ? 'Unapprove' : 'Approve') + '</button> ' +
					'<button class="btn btn-small" type="button" data-action="testimonial-edit" data-id="' + esc(item.id) + '">Edit</button> ' +
					'<button class="btn btn-small btn-danger" type="button" data-action="testimonial-delete" data-id="' + esc(item.id) + '">Delete</button></td></tr>';
			});
			html += '</tbody></table></div>';
		}
		html += '</div>';
		$('#view').innerHTML = html;
	}

	function openTestimonial(item) {
		var isNew = !item;
		item = item || { quote: '', name: '', role: '', initials: '', note: '', order: 99, status: 'approved' };
		var body = '<div class="field"><label for="tQuote">Quote</label><textarea id="tQuote" name="quote" maxlength="280" required>' + esc(item.quote) + '</textarea></div>' +
			'<div class="field-row" style="margin-top:14px">' +
			'<div class="field"><label for="tName">Client name</label><input id="tName" name="name" maxlength="60" value="' + esc(item.name) + '" required></div>' +
			'<div class="field"><label for="tRole">Role / location</label><input id="tRole" name="role" maxlength="60" value="' + esc(item.role) + '"></div></div>' +
			'<div class="field-row" style="margin-top:14px">' +
			'<div class="field"><label for="tInitials">Initials</label><input id="tInitials" name="initials" maxlength="3" value="' + esc(item.initials) + '"></div>' +
			'<div class="field"><label for="tOrder">Display order</label><input id="tOrder" name="order" type="number" value="' + esc(item.order) + '"></div></div>' +
			'<div class="field" style="margin-top:14px"><label for="tNote">Subscriber label</label><input id="tNote" name="note" maxlength="120" value="' + esc(item.note || '') + '" placeholder="Shown beneath the quote"></div>' +
			'<div class="field" style="margin-top:14px"><label for="tStatus">Status</label><select id="tStatus" name="status">' +
			options(['approved', 'draft'], item.status) + '</select></div>';
		openModal('testimonial', isNew ? 'Add testimonial' : 'Edit testimonial', body, 'Save testimonial', isNew ? null : item.id);
	}

	/* ------------------------------------------------------------------ Results */
	async function renderResults() {
		var data = await api('/api/admin/results?kind=all&limit=100');
		var actions = '<button class="btn" type="button" data-action="refresh">Refresh</button>';
		var html = pageHead('Speed & coverage', 'Logged results from the homepage widgets.', actions);
		html += '<p class="note">Upload figures from the speed test are estimated from the download result, not measured against the upload endpoint.</p>';
		html += '<div class="split-cards">';
		html += '<section class="panel"><div class="panel-head"><h3>Speed tests (' + data.speed.length + ')</h3></div>';
		if (!data.speed.length) html += emptyState('No tests logged', 'Completed homepage tests appear here.');
		else {
			html += '<div class="table-wrap"><table><thead><tr><th>When</th><th>Ping</th><th>Download</th><th>Upload*</th><th></th></tr></thead><tbody>';
			data.speed.forEach(function (r) {
				html += '<tr><td>' + esc(fmt(r.createdAt)) + '</td><td>' + esc(r.ping) + ' ms</td><td class="cell-main">' + esc(r.download) + ' Mbps</td>' +
					'<td>' + esc(r.upload) + ' Mbps</td><td class="actions"><button class="btn btn-small btn-danger" type="button" data-action="result-delete" data-kind="speed" data-id="' + esc(r.id) + '">Delete</button></td></tr>';
			});
			html += '</tbody></table></div>';
		}
		html += '</section>';
		html += '<section class="panel"><div class="panel-head"><h3>Coverage checks (' + data.coverage.length + ')</h3></div>';
		if (!data.coverage.length) html += emptyState('No coverage checks', 'Homepage PIN/area lookups appear here.');
		else {
			html += '<div class="table-wrap"><table><thead><tr><th>When</th><th>Query</th><th>Area</th><th></th></tr></thead><tbody>';
			data.coverage.forEach(function (r) {
				html += '<tr><td>' + esc(fmt(r.createdAt)) + '</td><td class="cell-main">' + esc(r.query) + '</td><td>' + esc(r.area) + '</td>' +
					'<td class="actions"><button class="btn btn-small btn-danger" type="button" data-action="result-delete" data-kind="coverage" data-id="' + esc(r.id) + '">Delete</button></td></tr>';
			});
			html += '</tbody></table></div>';
		}
		html += '</section></div>';
		$('#view').innerHTML = html;
	}

	/* -------------------------------------------------------------------- Users */
	async function renderUsers() {
		var data = await api('/api/admin/users');
		var actions = state.user.role === 'owner' ? '<button class="btn btn-primary" type="button" data-action="user-new">Add user</button>' : '';
		var html = pageHead('Users', 'Accounts that can access this panel.', actions);
		html += '<div class="panel">';
		html += '<div class="table-wrap"><table><thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead><tbody>';
		data.items.forEach(function (item) {
			var canManage = state.user.role === 'owner' && item.role !== 'owner' && item.id !== state.user.id;
			html += '<tr><td class="cell-main">' + esc(item.username) + (item.id === state.user.id ? '<span class="cell-sub">You</span>' : '') + '</td>' +
				'<td>' + badge(item.role) + '</td><td>' + badge(item.disabled ? 'disabled' : 'active') + '</td>' +
				'<td>' + esc(fmt(item.lastLogin)) + '</td><td class="actions">' +
				(state.user.role === 'owner' || item.id === state.user.id ? '<button class="btn btn-small" type="button" data-action="user-password" data-id="' + esc(item.id) + '" data-name="' + esc(item.username) + '">Password</button> ' : '') +
				(canManage ? '<button class="btn btn-small" type="button" data-action="user-toggle" data-id="' + esc(item.id) + '" data-disabled="' + item.disabled + '">' +
					(item.disabled ? 'Enable' : 'Disable') + '</button> <button class="btn btn-small btn-danger" type="button" data-action="user-delete" data-id="' + esc(item.id) + '">Delete</button>' : '') +
				'</td></tr>';
		});
		html += '</tbody></table></div></div>';
		$('#view').innerHTML = html;
	}

	function openUser() {
		var body = '<div class="field"><label for="uName">Username</label><input id="uName" name="username" maxlength="40" required></div>' +
			'<div class="field" style="margin-top:14px"><label for="uPass">Temporary password</label><input id="uPass" name="password" type="password" minlength="8" required><small>At least 8 characters. Share it securely with the user.</small></div>' +
			'<div class="field" style="margin-top:14px"><label for="uRole">Role</label><select id="uRole" name="role"><option value="editor">Editor — content only</option><option value="admin">Admin — content, enquiries, settings</option></select></div>';
		openModal('user', 'Add user', body, 'Create user');
	}

	function openPassword(id, name) {
		var body = '<p class="note">Changing the password for <strong>' + esc(name) + '</strong>.</p>' +
			'<div class="field"><label for="pNew">New password</label><input id="pNew" name="password" type="password" minlength="8" required><small>At least 8 characters.</small></div>';
		openModal('password', 'Change password', body, 'Update password', id);
	}

	/* ----------------------------------------------------------------- Settings */
	async function renderSettings() {
		var data = await api('/api/admin/settings');
		var s = data.settings;
		var actions = '<button class="btn btn-primary" type="button" data-action="publish">Save & publish</button>';
		var html = pageHead('Settings', 'Contact details and gateway label shown across the site.', actions);
		html += '<p class="note">Saving updates the stored settings. Publishing rebuilds the static pages so the changes appear on the website.</p>';
		html += '<form id="settingsForm" class="panel"><div class="panel-body"><div class="grid-2">' +
			field('Contact email', 'contactEmail', s.contactEmail, 'email', 'Shown on Contact Us, legal pages and the footer.') +
			field('Contact phone (display)', 'contactPhone', s.contactPhone, 'text', 'For example: +91-73737 10071 / 72') +
			field('Top bar / short phone', 'topbarPhone', s.topbarPhone, 'text', 'Compact display in the top bar and coverage result.') +
			field('Phone digits', 'phoneDigits', s.phoneDigits, 'text', 'Digits only, used for tel: and WhatsApp links.') +
			'</div>' + field('Speed test gateway name', 'gatewayName', s.gatewayName, 'text', 'Displayed in the speed test widget.') +
			'</div><div class="modal-actions"><button class="btn btn-primary" type="submit">Save settings</button></div></form>';
		$('#view').innerHTML = html;
	}

	function field(label, name, value, type, hint) {
		return '<div class="field"><label for="s-' + esc(name) + '">' + esc(label) + '</label>' +
			'<input id="s-' + esc(name) + '" name="' + esc(name) + '" type="' + esc(type || 'text') + '" value="' + esc(value) + '">' +
			(hint ? '<small>' + esc(hint) + '</small>' : '') + '</div>';
	}

	/* ------------------------------------------------------------ Email settings */
	async function renderEmail() {
		var data = await api('/api/admin/settings');
		var s = data.settings.smtp;
		var html = pageHead('Email settings', 'SMTP delivery for enquiry notifications and test messages.', '');
		html += '<p class="note">Changes apply to new form submissions immediately. Publishing is not needed for email settings.</p>';
		html += '<form id="smtpForm" class="panel"><div class="panel-head"><h3>SMTP configuration</h3></div><div class="panel-body">';
		html += checkRow('enabled', 'Send email notifications', s.enabled, 'Email the notification recipient when a public form is submitted.');
		var notify = s.notifyTypes || {};
		html += '<div class="field" style="margin-top:14px"><label>Notify me about</label>' +
			'<div class="check-grid">' +
			checkRow('notifySpeedtest', 'Speed-test leads', notify.speedtest !== false, 'High-intent requests with measured results.') +
			checkRow('notifyContact', 'Contact Us messages', notify.contact !== false, 'Quote and general enquiry submissions.') +
			checkRow('notifyLogin', 'Customer login requests', notify.login !== false, 'Login attempts captured from the website.') +
			checkRow('notifySignup', 'Sign-ups', notify.signup !== false, 'New account requests.') +
			'</div><small>Only the selected types are emailed to the notification recipient.</small></div>';
		html += '<div class="grid-2" style="margin-top:16px">' +
			field('SMTP host', 'host', s.host, 'text', 'For example: smtp.example.com') +
			field('Port', 'port', s.port, 'number', 'Usually 587 for STARTTLS or 465 for SSL.') +
			field('Username', 'user', s.user, 'text', 'Leave blank for an unauthenticated relay.') +
			field('Password', 'password', s.password, 'password', s.passwordSet
				? 'Leave the masked value unchanged to keep it, or clear it to remove it.'
				: 'Stored in data/settings.json on this server.') +
			field('From name', 'fromName', s.fromName, 'text') +
			field('From email', 'fromEmail', s.fromEmail, 'email') +
			field('Notification recipient', 'notifyEmail', s.notifyEmail, 'email', 'New form submissions are sent here.') +
			field('Subject prefix', 'subjectPrefix', s.subjectPrefix, 'text') +
			field('Timeout (ms)', 'timeoutMs', s.timeoutMs, 'number', 'Between 3000 and 30000.') +
			'</div>';
		html += '<div class="field-row" style="margin-top:14px">' +
			checkRow('secure', 'Use implicit TLS (port 465)', s.secure, 'Otherwise STARTTLS is used when the server offers it.') +
			'</div>';
		html += '<p class="cell-sub" style="margin-top:16px">Last successful test: ' + esc(fmt(s.verifiedAt)) + '</p>';
		html += fieldBlock('Test recipient', 'smtpTestTo', '<input id="smtpTestTo" type="email" value="' + esc(s.notifyEmail) + '">', 'Save changes before sending a test.', 'margin-top:18px');
		html += '</div><div class="modal-actions">' +
			'<button class="btn" type="button" data-action="email-test">Send test email</button>' +
			'<button class="btn btn-primary" type="submit">Save email settings</button></div></form>';
		$('#view').innerHTML = html;
	}

	/* ------------------------------------------------------------------ Profile */
	async function renderProfile() {
		var data = await api('/api/admin/profile');
		var u = data.user;
		var html = pageHead('My profile', 'Update your display name, contact email and password.', '');
		html += '<div class="split-cards">';
		html += '<section class="panel"><div class="panel-head"><h3>Profile details</h3></div>' +
			'<form id="profileForm"><div class="panel-body">' +
			fieldBlock('Username', 'profileUsername', '<input id="profileUsername" value="' + esc(u.username) + '" readonly>', 'Usernames cannot be changed here.') +
			'<div class="field-row" style="margin-top:14px">' +
			fieldBlock('Display name', 'profileName', '<input id="profileName" name="displayName" maxlength="60" value="' + esc(u.displayName) + '" required>') +
			fieldBlock('Role', 'profileRole', '<input id="profileRole" value="' + esc(u.role) + '" readonly>') +
			'</div>' +
			fieldBlock('Email address', 'profileEmail', '<input id="profileEmail" name="email" type="email" maxlength="120" value="' + esc(u.email) + '">', 'Used for admin correspondence.', 'margin-top:14px') +
			fieldBlock('Last sign-in', 'profileLastLogin', '<input id="profileLastLogin" value="' + esc(fmt(u.lastLogin)) + '" readonly>', '', 'margin-top:14px') +
			'</div><div class="modal-actions"><button class="btn btn-primary" type="submit">Save profile</button></div></form></section>';
		html += '<section class="panel"><div class="panel-head"><h3>Change password</h3></div>' +
			'<form id="passwordForm"><div class="panel-body">' +
			fieldBlock('Current password', 'pwCurrent', '<input id="pwCurrent" name="currentPassword" type="password" autocomplete="current-password" required>') +
			fieldBlock('New password', 'pwNew', '<input id="pwNew" name="password" type="password" autocomplete="new-password" minlength="8" required>', 'At least 8 characters.', 'margin-top:14px') +
			fieldBlock('Confirm new password', 'pwConfirm', '<input id="pwConfirm" name="confirm" type="password" autocomplete="new-password" required>', '', 'margin-top:14px') +
			'</div><div class="modal-actions"><button class="btn btn-primary" type="submit">Change password</button></div></form></section>';
		html += '</div>';
		$('#view').innerHTML = html;
	}

	/* ------------------------------------------------------------------- Modals */
	function openModal(kind, title, body, submitLabel, id, extra) {
		extra = extra || {};
		state.modalKind = kind;
		state.modalId = id || null;
		$('#modalRoot').innerHTML = '<div class="modal-backdrop" data-action="modal-close"></div>' +
			'<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
			'<div class="modal-head"><h2 id="modalTitle">' + esc(title) + '</h2>' +
			'<button class="icon-btn" type="button" data-action="modal-close" aria-label="Close dialog">×</button></div>' +
			'<form id="modalForm" data-kind="' + esc(kind) + '"><div class="modal-body">' + body + '</div>' +
			'<div class="modal-actions">' + (extra.actions || '') +
			'<button class="btn" type="button" data-action="modal-close">Cancel</button>' +
			'<button class="btn btn-primary" type="submit">' + esc(submitLabel || 'Save') + '</button></div></form></div>';
		var first = $('#modalForm input, #modalForm select, #modalForm textarea');
		if (first) first.focus();
	}

	function closeModal() {
		$('#modalRoot').innerHTML = '';
		state.modalKind = null;
		state.modalId = null;
	}

	/* ------------------------------------------------------------------ Actions */
	async function handleAction(action, el) {
		var id = el.getAttribute('data-id');
		switch (action) {
			case 'logout':
				await api('/api/admin/logout', { method: 'POST' });
				state.user = null;
				showLogin();
				break;
			case 'toggle-menu':
				$('#sidebar').classList.toggle('is-open');
				$('#scrim').hidden = !$('#sidebar').classList.contains('is-open');
				break;
			case 'refresh':
				render();
				break;
			case 'publish':
				var published = await api('/api/admin/publish', { method: 'POST' });
				toast(published.message || 'Public pages rebuilt.');
				break;
			case 'clear-filters':
				state.enq = { type: '', status: '', q: '', offset: 0, limit: 20 };
				render();
				break;
			case 'enq-prev':
				state.enq.offset = Math.max(0, state.enq.offset - state.enq.limit);
				render();
				break;
			case 'enq-next':
				state.enq.offset += state.enq.limit;
				render();
				break;
			case 'enquiry-open':
				await openEnquiry(id);
				break;
			case 'enquiry-delete':
				if (!confirm('Delete this enquiry permanently?')) break;
				await api('/api/admin/enquiries/' + encodeURIComponent(id), { method: 'DELETE' });
				closeModal(); toast('Enquiry deleted.'); render();
				break;
			case 'package-new':
				openPackage(null);
				break;
			case 'package-edit':
				var pkgs = await api('/api/admin/packages');
				openPackage(pkgs.items.find(function (p) { return p.id === id; }));
				break;
			case 'package-delete':
				if (!confirm('Delete this package?')) break;
				await api('/api/admin/packages/' + encodeURIComponent(id), { method: 'DELETE' });
				toast('Package deleted. Publish to update the site.'); render();
				break;
			case 'email-test':
				var testTo = $('#smtpTestTo') ? $('#smtpTestTo').value.trim() : '';
				var sent = await api('/api/admin/email/test', { method: 'POST', body: { to: testTo } });
				toast(sent.message || 'Test email sent.');
				break;
			case 'testimonial-new':
				openTestimonial(null);
				break;
			case 'testimonial-edit':
				var all = await api('/api/admin/testimonials');
				openTestimonial(all.items.find(function (t) { return t.id === id; }));
				break;
			case 'testimonial-toggle':
				var next = el.getAttribute('data-status') === 'approved' ? 'draft' : 'approved';
				await api('/api/admin/testimonials/' + encodeURIComponent(id), { method: 'PATCH', body: { status: next } });
				toast('Testimonial set to ' + next + '.');
				render();
				break;
			case 'testimonial-delete':
				if (!confirm('Delete this testimonial?')) break;
				await api('/api/admin/testimonials/' + encodeURIComponent(id), { method: 'DELETE' });
				toast('Testimonial deleted.'); render();
				break;
			case 'result-delete':
				if (!confirm('Delete this logged result?')) break;
				await api('/api/admin/results/' + encodeURIComponent(el.getAttribute('data-kind')) + '/' + encodeURIComponent(id), { method: 'DELETE' });
				toast('Result deleted.'); render();
				break;
			case 'user-new':
				openUser();
				break;
			case 'user-password':
				openPassword(id, el.getAttribute('data-name'));
				break;
			case 'user-toggle':
				await api('/api/admin/users/' + encodeURIComponent(id), { method: 'PATCH', body: { disabled: el.getAttribute('data-disabled') !== 'true' } });
				toast('User updated.'); render();
				break;
			case 'user-delete':
				if (!confirm('Remove this user?')) break;
				await api('/api/admin/users/' + encodeURIComponent(id), { method: 'DELETE' });
				toast('User removed.'); render();
				break;
			case 'modal-close':
				closeModal();
				break;
		}
	}

	async function saveModal(form) {
		var data = values(form);
		var kind = form.getAttribute('data-kind');
		var path;
		var method;
		if (kind === 'enquiry') {
			path = '/api/admin/enquiries/' + encodeURIComponent(state.modalId);
			method = 'PATCH';
			var payload = { status: data.status };
			if (data.note) payload.note = data.note;
			data = payload;
		} else if (kind === 'testimonial') {
			path = state.modalId ? '/api/admin/testimonials/' + encodeURIComponent(state.modalId) : '/api/admin/testimonials';
			method = state.modalId ? 'PATCH' : 'POST';
			data.order = Number(data.order) || 0;
		} else if (kind === 'package') {
			path = state.modalId ? '/api/admin/packages/' + encodeURIComponent(state.modalId) : '/api/admin/packages';
			method = state.modalId ? 'PATCH' : 'POST';
			data.order = Number(data.order) || 0;
			data.features = String(data.features || '').split(/\r?\n/).map(function (feature) { return feature.trim(); }).filter(Boolean).slice(0, 12);
		} else if (kind === 'user') {
			path = '/api/admin/users';
			method = 'POST';
		} else if (kind === 'password') {
			path = '/api/admin/users/' + encodeURIComponent(state.modalId) + '/password';
			method = 'POST';
		} else return;
		await api(path, { method: method, body: data });
		closeModal();
		toast('Saved.');
		render();
	}

	async function saveSettings(form) {
		await api('/api/admin/settings', { method: 'PUT', body: values(form) });
		toast('Settings saved. Publish to update the website.');
	}

	async function saveSmtp(form) {
		var body = values(form);
		body.password = form.elements.password.value;
		if (body.password === '') body.clearPassword = true;
		body.port = Number(body.port) || 587;
		body.timeoutMs = Number(body.timeoutMs) || 8000;
		body.notifyTypes = {
			contact: body.notifyContact,
			speedtest: body.notifySpeedtest,
			login: body.notifyLogin,
			signup: body.notifySignup
		};
		delete body.notifyContact;
		delete body.notifySpeedtest;
		delete body.notifyLogin;
		delete body.notifySignup;
		await api('/api/admin/settings', { method: 'PUT', body: { smtp: body } });
		toast('Email settings saved.');
		render();
	}

	async function saveProfile(form) {
		var data = await api('/api/admin/profile', { method: 'PATCH', body: values(form) });
		state.user = data.user;
		updateIdentity();
		toast('Profile updated.');
		render();
	}

	async function savePassword(form) {
		var currentPassword = form.elements.currentPassword.value;
		var password = form.elements.password.value;
		var confirm = form.elements.confirm.value;
		if (password.length < 8) throw new Error('Use at least 8 characters for the new password.');
		if (password !== confirm) throw new Error('The new passwords do not match.');
		await api('/api/admin/profile/password', { method: 'POST', body: { currentPassword: currentPassword, password: password } });
		form.reset();
		toast('Password changed.');
	}

	async function doLogin(form) {
		var error = $('#loginError');
		error.hidden = true;
		var button = form.querySelector('button[type="submit"]');
		button.disabled = true;
		button.textContent = 'Signing in…';
		try {
			var data = await api('/api/admin/login', { method: 'POST', body: values(form) });
			form.reset();
			showApp(data.user);
		} catch (err) {
			error.textContent = err.message;
			error.hidden = false;
		} finally {
			button.disabled = false;
			button.textContent = 'Sign in';
		}
	}

	/* ------------------------------------------------------------------- Events */
	document.addEventListener('click', function (event) {
		var target = event.target;
		if (!(target instanceof Element)) return;
		var el = target.closest('[data-action]');
		if (!el) return;
		var action = el.getAttribute('data-action');
		if (action === 'nav') {
			event.preventDefault();
			var module = el.getAttribute('data-module');
			if (titles[module] && allowedModules().indexOf(module) > -1) {
				location.hash = module;
				setModule(module);
			}
			return;
		}
		if (action === 'modal-close' && target.closest('.modal') && !target.closest('[data-action="modal-close"]')) return;
		event.preventDefault();
		Promise.resolve(handleAction(action, el)).catch(function (err) { toast(err.message, true); });
	});

	document.addEventListener('submit', function (event) {
		var form = event.target;
		if (!(form instanceof HTMLFormElement)) return;
		event.preventDefault();
		var task;
		if (form.id === 'loginForm') task = doLogin(form);
		else if (form.id === 'settingsForm') task = saveSettings(form);
		else if (form.id === 'smtpForm') task = saveSmtp(form);
		else if (form.id === 'profileForm') task = saveProfile(form);
		else if (form.id === 'passwordForm') task = savePassword(form);
		else if (form.id === 'modalForm') task = saveModal(form);
		if (task) Promise.resolve(task).catch(function (err) { toast(err.message, true); });
	});

	window.addEventListener('hashchange', function () {
		var module = (location.hash || '').replace('#', '');
		if (titles[module] && allowedModules().indexOf(module) > -1 && module !== state.module) setModule(module);
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && state.modalKind) closeModal();
	});

	(async function boot() {
		try {
			var data = await api('/api/admin/session');
			if (data.user) showApp(data.user);
			else showLogin();
		} catch (err) {
			showLogin();
		}
	})();
})();

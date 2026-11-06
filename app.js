(function () {
  var app = document.getElementById('app');
  var nav = document.getElementById('dayNav');

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Render a body string that may contain markdown links [text](url).
  function mdLinks(s) {
    var out = esc(s);
    return out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, function (_, t, u) {
      return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + t + '</a>';
    });
  }

  function hostOf(u) {
    try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  function card(it) {
    var h = '<article class="card">';
    if (it.image) h += '<img src="' + esc(it.image) + '" alt="" loading="lazy">';
    h += '<div class="card-body">';
    h += '<div class="krow"><span class="kicker">' + esc(it.kicker) + '</span>' +
         '<span class="cat">' + esc(it.category) + '</span></div>';
    h += '<h3>' + esc(it.title) + '</h3>';
    h += '<p>' + mdLinks(it.body) + '</p>';
    if (it.stats && it.stats.length) {
      h += '<div class="stats">';
      it.stats.forEach(function (st) {
        h += '<div class="stat"><b>' + esc(st.value) + '</b><span>' + esc(st.label) + '</span></div>';
      });
      h += '</div>';
    }
    if (it.source_url) {
      h += '<div class="src"><a href="' + esc(it.source_url) + '" target="_blank" rel="noopener noreferrer">阅读原文 · ' + esc(hostOf(it.source_url)) + ' →</a></div>';
    }
    h += '</div></article>';
    return h;
  }

  fetch('data/feed.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      document.getElementById('updatedAt').textContent = '更新于 ' + (data.updated_at || '');
      var total = 0;
      var navHtml = '', html = '';
      data.days.forEach(function (day) {
        total += day.items.length;
        navHtml += '<a href="#d-' + day.date + '">' + day.date.slice(5) + ' ' + esc(day.weekday) + '</a>';
        html += '<section class="day" id="d-' + day.date + '">';
        html += '<div class="day-head"><h2>' + day.date + '</h2><span class="weekday">' + esc(day.weekday) + '</span>' +
                '<span class="count">共 ' + day.items.length + ' 条</span></div>';
        html += '<div class="grid">';
        day.items.forEach(function (it) { html += card(it); });
        html += '</div></section>';
      });
      document.getElementById('totalCount').textContent = ' · 已收录 ' + total + ' 条';
      nav.innerHTML = navHtml;
      app.innerHTML = html;
    })
    .catch(function () {
      app.innerHTML = '<p class="loading">加载失败，请稍后刷新重试。</p>';
    });
})();

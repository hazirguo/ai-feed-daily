(function () {
  var HOME_DAYS = 7; // 首页只展示最近 7 天，历史靠日历跳转
  var app = document.getElementById('app');
  var nav = document.getElementById('dayNav');
  var archiveView = document.getElementById('archiveView');
  var DATA = null;
  var dayMap = {};   // date -> day object
  var homeDates = {}; // date -> true（首页已渲染的最近 7 天）
  var calCursor = null; // {y, m} 当前日历显示的年月（m 为 0-11）

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

  function daySection(day) {
    var h = '<section class="day" id="d-' + day.date + '">';
    h += '<div class="day-head"><h2>' + day.date + '</h2><span class="weekday">' + esc(day.weekday) + '</span>' +
         '<span class="count">共 ' + day.items.length + ' 条</span></div>';
    h += '<div class="grid">';
    day.items.forEach(function (it) { h += card(it); });
    h += '</div></section>';
    return h;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateStr(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

  function renderCalendar() {
    var title = document.getElementById('calTitle');
    var grid = document.getElementById('calGrid');
    var y = calCursor.y, m = calCursor.m;
    title.textContent = y + ' 年 ' + (m + 1) + ' 月';
    // 周一为每周第一天：getDay() 周日为 0，换算偏移
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var today = new Date();
    var todayStr = dateStr(today.getFullYear(), today.getMonth(), today.getDate());
    var h = '';
    for (var i = 0; i < offset; i++) h += '<span class="cal-cell empty"></span>';
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = dateStr(y, m, d);
      var day = dayMap[ds];
      if (day) {
        h += '<button class="cal-cell has-news' + (ds === todayStr ? ' today' : '') + '" data-date="' + ds + '">' +
             '<span class="dnum">' + d + '</span><span class="dcount">' + day.items.length + ' 条</span></button>';
      } else {
        h += '<span class="cal-cell none' + (ds === todayStr ? ' today' : '') + '"><span class="dnum">' + d + '</span></span>';
      }
    }
    grid.innerHTML = h;
    var btns = grid.querySelectorAll('button.has-news');
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener('click', function () { openDay(this.getAttribute('data-date')); });
    }
  }

  function openDay(ds) {
    var cf = document.getElementById('calFloat');
    if (cf && window.innerWidth <= 1280) cf.classList.remove('open');
    if (homeDates[ds]) {
      archiveView.hidden = true;
      archiveView.innerHTML = '';
      var el = document.getElementById('d-' + ds);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var day = dayMap[ds];
    if (!day) return;
    archiveView.innerHTML =
      '<div class="arch-bar"><span>历史归档</span>' +
      '<button id="archBack" class="cal-btn arch-back">返回最近一周 ↑</button></div>' + daySection(day);
    archiveView.hidden = false;
    document.getElementById('archBack').addEventListener('click', function () {
      archiveView.hidden = true;
      archiveView.innerHTML = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    archiveView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var calFloat = document.getElementById('calFloat');
  document.getElementById('calFab').addEventListener('click', function () {
    calFloat.classList.toggle('open');
  });

  document.getElementById('calPrev').addEventListener('click', function () {
    calCursor.m -= 1;
    if (calCursor.m < 0) { calCursor.m = 11; calCursor.y -= 1; }
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', function () {
    calCursor.m += 1;
    if (calCursor.m > 11) { calCursor.m = 0; calCursor.y += 1; }
    renderCalendar();
  });

  fetch('data/feed.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      DATA = data;
      document.getElementById('updatedAt').textContent = '更新于 ' + (data.updated_at || '');
      var total = 0;
      data.days.forEach(function (day) { dayMap[day.date] = day; total += day.items.length; });

      var homeDays = data.days.slice(0, HOME_DAYS);
      homeDays.forEach(function (day) { homeDates[day.date] = true; });
      var navHtml = '', html = '';
      homeDays.forEach(function (day) {
        navHtml += '<a href="#d-' + day.date + '">' + day.date.slice(5) + ' ' + esc(day.weekday) + '</a>';
        html += daySection(day);
      });
      document.getElementById('totalCount').textContent =
        ' · 已收录 ' + total + ' 条 · 首页展示最近 ' + homeDays.length + ' 天';
      nav.innerHTML = navHtml;
      app.innerHTML = html;

      // 日历默认停在最新一天所在的月份
      var latest = data.days.length ? data.days[0].date : null;
      if (latest) {
        var p = latest.split('-');
        calCursor = { y: parseInt(p[0], 10), m: parseInt(p[1], 10) - 1 };
      } else {
        var now = new Date();
        calCursor = { y: now.getFullYear(), m: now.getMonth() };
      }
      renderCalendar();

      // 带 #d-YYYY-MM-DD 打开时，历史日期自动展开归档区
      var m = /^#d-(\d{4}-\d{2}-\d{2})$/.exec(location.hash || '');
      if (m && dayMap[m[1]] && !homeDates[m[1]]) openDay(m[1]);
    })
    .catch(function () {
      app.innerHTML = '<p class="loading">加载失败，请稍后刷新重试。</p>';
    });
})();

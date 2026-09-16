/* ==========================================================================
   姚子健 · 个人网站  公共脚本
   --------------------------------------------------------------------------
   负责两件事：
   1. 背景音乐的播放 / 暂停控制，以及“自动播放被拦截”时的兜底提示；
   2. 页面滚动后给头部加一点阴影层次。
   五个页面共用本文件。
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     一、背景音乐控制
     ====================================================================== */
  var audio   = document.getElementById('bgMusic');
  var btn     = document.getElementById('musicBtn');
  var tip     = document.getElementById('musicTip');
  var tipBtn  = document.getElementById('musicTipBtn');

  if (audio && btn) {
    var iconEl = btn.querySelector('.ico');
    var textEl = btn.querySelector('.txt');

    /* 根据当前播放状态同步按钮外观 */
    function syncBtn(playing) {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
      if (iconEl) { iconEl.textContent = playing ? '❚❚' : '♪'; }
      if (textEl) { textEl.textContent = playing ? '暂停音乐' : '背景音乐'; }
    }

    /* 显示 / 隐藏“点击播放”兜底提示 */
    function showTip(show) {
      if (!tip) { return; }
      tip.classList.toggle('show', !!show);
    }

    /* 播放：现代浏览器可能返回被拒绝的 Promise，这里统一兜底 */
    function playMusic() {
      var p = audio.play();

      if (p && typeof p.then === 'function') {
        p.then(function () {
          syncBtn(true);
          showTip(false);
        }).catch(function () {
          // 被浏览器自动播放策略拦截：保持暂停状态并提示用户点击
          syncBtn(false);
          showTip(true);
        });
      } else {
        syncBtn(!audio.paused);
      }
    }

    /* 暂停 */
    function pauseMusic() {
      audio.pause();
      syncBtn(false);
    }

    /* 点击右上角按钮：切换播放 / 暂停 */
    btn.addEventListener('click', function () {
      if (audio.paused) { playMusic(); } else { pauseMusic(); }
    });

    /* 点击兜底提示里的按钮 */
    if (tipBtn) {
      tipBtn.addEventListener('click', function () {
        playMusic();
      });
    }

    /* 音频元素自身状态变化时，保持按钮一致
       （例如用户用系统媒体控件暂停，或音频加载失败） */
    audio.addEventListener('play',  function () { syncBtn(true);  showTip(false); });
    audio.addEventListener('pause', function () { syncBtn(false); });

    /* 音频加载失败（缺少 little_wish.mp3 时）给出友好提示，不让页面看起来是坏的 */
    audio.addEventListener('error', function () {
      syncBtn(false);
      showTip(false);
      if (iconEl) { iconEl.textContent = '—'; }
      if (textEl) { textEl.textContent = '音乐缺失'; }
      btn.title = '未找到 little_wish.mp3，请把音频文件放到网页同一目录下';
      btn.disabled = false;
      console.warn('[背景音乐] 无法加载 little_wish.mp3 —— 请确认音频文件与网页在同一个目录。');
    });

    /* 页面载入后先尝试自动播放。
       autoplay 属性已经写在 <audio> 上，这里再主动调用一次，
       是为了能捕获“被拦截”的情况并弹出兜底提示。 */
    playMusic();

    /* 额外兜底：用户第一次点击页面任意位置时再试一次
       （多数浏览器允许在用户交互后播放） */
    var firstGesture = function () {
      if (audio.paused && !audio.error) { playMusic(); }
      document.removeEventListener('click', firstGesture);
      document.removeEventListener('keydown', firstGesture);
      document.removeEventListener('touchstart', firstGesture);
    };
    document.addEventListener('click', firstGesture);
    document.addEventListener('keydown', firstGesture);
    document.addEventListener('touchstart', firstGesture);
  }

  /* ======================================================================
     二、头部滚动阴影
     ====================================================================== */
  var header = document.querySelector('.site-header');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();   // 初始执行一次，处理“刷新时已在页面中部”的情况
  }

  /* ======================================================================
     三、图片缺失兜底
     素材放在 images/ 目录下（images/hust_logo.png、images/saixi.jpg）。
     万一图片没放进去或格式不对，不要让页面上出现难看的破图图标 ——
     这里改成给元素加一个 .img-missing 类，用样式把它变成一块
     带提示文字的浅色占位区域。
     ====================================================================== */
  Array.prototype.forEach.call(document.querySelectorAll('img[data-fallback]'), function (img) {
    img.addEventListener('error', function handleError() {
      img.removeEventListener('error', handleError);

      var file = img.getAttribute('data-fallback');
      img.classList.add('img-missing');

      /* 把 alt 文字显出来，让占位块有说明 */
      if (!img.getAttribute('alt')) { img.setAttribute('alt', '图片未找到'); }

      console.warn('[素材] 未能加载 images/' + file + '，已显示为占位块。');
    });
  });
})();

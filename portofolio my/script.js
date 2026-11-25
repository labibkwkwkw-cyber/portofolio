/**
 * PORTOFOLIO LABIB ABDUL FATTAH
 * Slanted 3D Rotating Wheel Menu Engine
 * Terinspirasi dari carterogunsola.com/lab
 */

function initPortfolio() {
  const landingScreen = document.getElementById('landing-screen');
  const btnNext = document.getElementById('btn-next-beranda');
  const btnBackToIntro = document.getElementById('btn-back-to-intro');
  const btnHudAbout = document.getElementById('btn-hud-about');
  const cylinderViewport = document.getElementById('lab-cylinder-viewport');
  const itemsTrack = document.getElementById('lab-items-track');
  const cylinderItems = document.querySelectorAll('.lab-cylinder-item');
  const btnSpinUp = document.getElementById('lab-spin-up');
  const btnSpinDown = document.getElementById('lab-spin-down');
  const hudActiveNum = document.getElementById('hud-active-num');
  const btnOpenDetail = document.getElementById('btn-open-active-detail');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundLabel = document.getElementById('sound-label');
  const hudClock = document.getElementById('hud-clock');
  const hudFps = document.getElementById('hud-fps');

  // Drawer Elements
  const detailDrawer = document.getElementById('lab-detail-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerTitle = document.getElementById('drawer-section-title');
  const drawerTag = document.getElementById('drawer-section-tag');
  const drawerViews = document.querySelectorAll('.drawer-section-view');

  // Safe Hash Update (Menghindari crash pushState di protokol file://)
  function safeSetHash(hash) {
    try {
      if (window.location.protocol !== 'file:' && window.history && window.history.pushState) {
        window.history.pushState(null, null, hash || ' ');
      } else {
        if (hash) {
          window.location.hash = hash;
        } else if (window.location.hash) {
          window.location.hash = '';
        }
      }
    } catch (e) {
      // Abaikan exception izin URL file://
    }
  }

  // ========================================================
  // 1. TRANSISI LAYAR INTRO KE BERANDA SILINDER 3D
  // ========================================================
  function openBeranda() {
    if (landingScreen) {
      landingScreen.classList.add('hide-intro');
      document.body.style.overflow = 'hidden';
      safeSetHash('#beranda');
      playMechanicalTick(1.2);
    }
  }

  function backToIntro() {
    closeDrawer();
    if (landingScreen) {
      landingScreen.classList.remove('hide-intro');
      safeSetHash('');
      playMechanicalTick(0.85);
    } else {
      window.location.href = 'index.html';
    }
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      openBeranda();
    });
  }

  // Tombol Aksi di Postcard Layar Awal (Briefcase & Trophy)
  const postcardActionBtns = document.querySelectorAll('.landing-screen .postcard-action-btn');
  postcardActionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const href = btn.getAttribute('href');
      const section = href ? href.replace('#', '') : '';
      openBeranda();
      if (section) {
        setTimeout(() => {
          openSectionDrawer(section);
        }, 350);
      }
    });
  });

  if (btnBackToIntro) {
    btnBackToIntro.addEventListener('click', (e) => {
      e.preventDefault();
      backToIntro();
    });
  }

  if (btnHudAbout) {
    btnHudAbout.addEventListener('click', (e) => {
      e.preventDefault();
      openSectionDrawer('tentang');
    });
  }

  if (window.location.hash === '#beranda' && landingScreen) {
    landingScreen.classList.add('hide-intro');
  }

  // ========================================================
  // 2. AUDIO SYNTHESIZER: SUARA KLIK MEKANIKAL ANALOG
  // ========================================================
  let soundEnabled = true;
  let audioCtx = null;

  function playMechanicalTick(pitch = 1.0) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      const baseFreq = 1050 * pitch;
      osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(190, audioCtx.currentTime + 0.024);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.024);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.024);
    } catch (e) {}
  }

  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      const icon = btnSoundToggle.querySelector('i');
      if (soundEnabled) {
        if (soundLabel) soundLabel.textContent = 'Audio: ON';
        if (icon) icon.className = 'fa-solid fa-volume-high';
        playMechanicalTick(1.3);
      } else {
        if (soundLabel) soundLabel.textContent = 'Audio: OFF';
        if (icon) icon.className = 'fa-solid fa-volume-xmark';
      }
    });
  }

  // ========================================================
  // 3. HUD METADATA (LIVE CLOCK & FPS COUNTER)
  // ========================================================
  function updateLiveClock() {
    if (!hudClock) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    hudClock.textContent = `${h}:${m}:${s}WIB`;
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  let frameCount = 0;
  let lastFpsTime = performance.now();
  function fpsLoop(now) {
    frameCount++;
    if (now - lastFpsTime >= 1000) {
      if (hudFps) hudFps.textContent = String(frameCount);
      frameCount = 0;
      lastFpsTime = now;
    }
    requestAnimationFrame(fpsLoop);
  }
  requestAnimationFrame(fpsLoop);

  // ========================================================
  // 4. FISIKA ROTASI SILINDER VERTIKAL (CARTER OGUNSOLA LAB)
  // ========================================================
  const totalItems = cylinderItems.length;
  let activeIndex = 0;
  let currentY = 0;
  let targetY = 0;
  let isDragging = false;
  let startPointerY = 0;
  let startTrackY = 0;
  let lastMoveY = 0;
  let lastMoveTime = 0;
  let moveVelocity = 0;
  let animId = null;
  let lastTickIdx = -1;

  function getItemStep() {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? 64 : 108; // Jarak vertikal terukur: tinggi item (48px) + gap (16px) = 64px
  }

  // Update Posisi Track & Efek Perspektif Setiap Item
  function updateCylinderPositions() {
    if (!itemsTrack) return;
    const step = getItemStep();
    const isMobile = window.innerWidth <= 768;

    // Gerakkan track secara vertikal
    itemsTrack.style.transform = `translate3d(0, ${currentY}px, 0)`;

    // Hitung posisi relatif tiap item terhadap titik pusat tengah (Y = 0)
    const floatIndex = -currentY / step;

    cylinderItems.forEach((item, i) => {
      const diff = i - floatIndex;
      const absDiff = Math.abs(diff);

      // Skala & Opasitas melengkung ke belakang (ditingkatkan agar tetap terbaca jelas)
      const scale = Math.max(0.72, 1 - absDiff * 0.08);
      const minOpacity = isMobile ? 0.55 : 0.30;
      const opacityDecay = isMobile ? 0.12 : 0.20;
      const opacity = Math.max(minOpacity, 1 - absDiff * opacityDecay);

      item.style.opacity = opacity.toFixed(3);
      item.style.transform = `scale(${scale.toFixed(3)})`;

      if (absDiff < 0.45) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    // Update active index & audio klik
    const roundedIdx = Math.max(0, Math.min(totalItems - 1, Math.round(floatIndex)));
    if (roundedIdx !== lastTickIdx) {
      playMechanicalTick(1.0 + (roundedIdx * 0.08));
      lastTickIdx = roundedIdx;
      activeIndex = roundedIdx;
      if (hudActiveNum) {
        hudActiveNum.textContent = String(activeIndex + 1).padStart(2, '0');
      }
    }
  }

  // Animasi Smooth Spring Lerp ke Target
  function animateCylinder() {
    if (isDragging) return;

    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.4) {
      currentY += diff * 0.16;
      updateCylinderPositions();
      animId = requestAnimationFrame(animateCylinder);
    } else {
      currentY = targetY;
      updateCylinderPositions();
      cancelAnimationFrame(animId);
    }
  }

  function snapToIndex(idx, playSound = true) {
    const step = getItemStep();
    activeIndex = Math.max(0, Math.min(totalItems - 1, idx));
    targetY = - (activeIndex * step);
    if (playSound) playMechanicalTick(1.1);
    if (animId) cancelAnimationFrame(animId);
    animateCylinder();
  }

  // --- Input Drag / Swipe Mouse & Touch ---
  let hasMovedDrag = false;
  let startPointerX = 0;

  if (cylinderViewport) {
    cylinderViewport.addEventListener('pointerdown', (e) => {
      if (detailDrawer && detailDrawer.classList.contains('open')) return;

      isDragging = true;
      hasMovedDrag = false;
      startPointerY = e.clientY;
      startPointerX = e.clientX;
      startTrackY = currentY;
      lastMoveY = e.clientY;
      lastMoveTime = performance.now();
      moveVelocity = 0;

      if (animId) cancelAnimationFrame(animId);
    });

    cylinderViewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const deltaY = e.clientY - startPointerY;
      const deltaX = e.clientX - startPointerX;

      if (!hasMovedDrag && (Math.abs(deltaY) > 6 || Math.abs(deltaX) > 6)) {
        hasMovedDrag = true;
        try {
          cylinderViewport.setPointerCapture(e.pointerId);
        } catch (err) {}
        cylinderViewport.classList.add('is-dragging');
      }

      if (!hasMovedDrag) return;

      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dy = e.clientY - lastMoveY;

      moveVelocity = dy / dt;
      lastMoveY = e.clientY;
      lastMoveTime = now;

      currentY = startTrackY + deltaY;

      // Batas elastis di ujung atas & bawah
      const step = getItemStep();
      const minY = - ((totalItems - 1) * step) - 50;
      const maxY = 50;

      if (currentY > maxY) {
        currentY = maxY + (currentY - maxY) * 0.25;
      } else if (currentY < minY) {
        currentY = minY + (currentY - minY) * 0.25;
      }

      updateCylinderPositions();
    });

    let justFinishedDrag = false;

    function handlePointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      cylinderViewport.classList.remove('is-dragging');
      try {
        if (cylinderViewport.hasPointerCapture(e.pointerId)) {
          cylinderViewport.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}

      if (hasMovedDrag) {
        justFinishedDrag = true;
        setTimeout(() => { justFinishedDrag = false; }, 160);
        const step = getItemStep();
        // Momentum lemparan
        let predictedY = currentY + (moveVelocity * 180);
        let targetIdx = Math.round(-predictedY / step);
        snapToIndex(targetIdx);
      }
    }

    cylinderViewport.addEventListener('pointerup', handlePointerUp);
    cylinderViewport.addEventListener('pointercancel', handlePointerUp);

    // --- Input Mouse Wheel Scroll ---
    cylinderViewport.addEventListener('wheel', (e) => {
      if (detailDrawer && detailDrawer.classList.contains('open')) return;
      e.preventDefault();
      const direction = Math.sign(e.deltaY);
      snapToIndex(activeIndex + direction);
    }, { passive: false });
  }

  // Tombol Panah di Footer HUD
  if (btnSpinUp) {
    btnSpinUp.addEventListener('click', (e) => {
      e.preventDefault();
      snapToIndex(activeIndex - 1);
    });
  }

  if (btnSpinDown) {
    btnSpinDown.addEventListener('click', (e) => {
      e.preventDefault();
      snapToIndex(activeIndex + 1);
    });
  }

  // Tombol Panah Keyboard
  window.addEventListener('keydown', (e) => {
    if (detailDrawer && detailDrawer.classList.contains('open')) {
      if (e.key === 'Escape') closeDrawer();
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      snapToIndex(activeIndex - 1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      snapToIndex(activeIndex + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      openActiveSectionDetail();
    }
  });

  // Klik Langsung pada Item Menu (Langsung Snap & Buka Detail)
  cylinderItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      if (justFinishedDrag || hasMovedDrag) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const sec = item.getAttribute('data-section');
      if (sec === 'intro') {
        backToIntro();
        return;
      }

      snapToIndex(index);
      openSectionDrawer(sec);
    });
  });

  // ========================================================
  // 5. SLIDE-OVER DRAWER KONTEN DETAIL
  // ========================================================
  const sectionMeta = {
    'tentang': { tag: 'PROFILE & BIO', title: 'Tentang Labib Abdul Fattah' },
    'keahlian': { tag: 'STACK & SKILLS', title: 'Keahlian & Teknologi' },
    'proyek': { tag: 'SHOWCASE & WORK', title: 'Portofolio Proyek' },
    'motion-lab': { tag: 'CREATIVE LAB', title: 'Creative Motion Experiments' },
    'kontak': { tag: 'COLLABORATION', title: 'Hubungi Saya' }
  };

  function openSectionDrawer(sectionName) {
    if (!detailDrawer) return;

    if (sectionName === 'intro') {
      backToIntro();
      return;
    }

    drawerViews.forEach((view) => {
      if (view.id === `content-${sectionName}`) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    });

    const meta = sectionMeta[sectionName] || { tag: 'DETAIL', title: 'Informasi' };
    if (drawerTag) drawerTag.textContent = meta.tag;
    if (drawerTitle) drawerTitle.textContent = meta.title;

    detailDrawer.classList.add('open');
    detailDrawer.setAttribute('aria-hidden', 'false');
    playMechanicalTick(1.35);
  }

  function closeDrawer() {
    if (detailDrawer) {
      detailDrawer.classList.remove('open');
      detailDrawer.setAttribute('aria-hidden', 'true');
      playMechanicalTick(0.9);
    }
  }

  // Expose ke window agar elemen HTML dengan inline onclick berfungsi normal
  window.openSectionDrawer = openSectionDrawer;
  window.closeDrawer = closeDrawer;
  window.openBeranda = openBeranda;
  window.backToIntro = backToIntro;

  function openActiveSectionDetail() {
    const activeItem = cylinderItems[activeIndex];
    if (activeItem) {
      const sec = activeItem.getAttribute('data-section');
      openSectionDrawer(sec);
    }
  }

  if (btnOpenDetail) {
    btnOpenDetail.addEventListener('click', (e) => {
      e.preventDefault();
      openActiveSectionDetail();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  // ========================================================
  // 6. PEMUTAR MUSIK PIRINGAN HITAM & KASET HEAVENLY JUMPSTYLE
  // ========================================================
  function initTurntableMusic() {
    const turntableWidget = document.getElementById('turntable-widget');
    const turntableMiniDock = document.getElementById('turntable-mini-dock');
    const miniDockTrigger = document.getElementById('mini-dock-trigger');
    const btnMiniPlay = document.getElementById('btn-mini-play');
    const miniPlayIcon = document.getElementById('mini-play-icon');
    const miniSongTitle = document.getElementById('mini-song-title');
    const miniSongStatus = document.getElementById('mini-song-status');

    const vinylDisc = document.getElementById('vinyl-disc');
    const vinylCoverImg = document.getElementById('vinyl-cover-img');
    const turntableArm = document.getElementById('turntable-arm');
    const btnMusicPlay = document.getElementById('btn-music-play');
    const musicPlayIcon = document.getElementById('music-play-icon');
    const btnMusicPrev = document.getElementById('btn-music-prev');
    const btnMusicNext = document.getElementById('btn-music-next');
    const musicRadioStatus = document.getElementById('music-radio-status');
    const musicRotationLabel = document.getElementById('music-rotation-label');
    const musicSongTitle = document.getElementById('music-song-title');
    const musicSongArtist = document.getElementById('music-song-artist');
    const musicGenreTag = document.getElementById('music-genre-tag');
    const musicTimeCurr = document.getElementById('music-time-curr');
    const progressFill = document.getElementById('turntable-progress-fill');
    const progressTrack = document.getElementById('turntable-progress-track');
    const deckVolume = document.getElementById('deck-volume');
    const btnTurntableToggle = document.getElementById('btn-turntable-toggle');
    const turntableCloseBtn = document.getElementById('turntable-close-btn');
    const landingMusicBtn = document.getElementById('landing-music-btn');
    const landingMusicText = document.getElementById('landing-music-text');
    const musicPillLabel = document.getElementById('music-pill-label');
    const visualizerBars = document.querySelectorAll('.v-bar');
    const trackPills = document.querySelectorAll('.track-pill');
    const musicFileInput = document.getElementById('music-file-input');
    const realAudio = document.getElementById('real-audio-player');
    const btnSpeed33 = document.getElementById('btn-speed-33');
    const btnSpeed45 = document.getElementById('btn-speed-45');

    // Playlist Data (Bisa pilih lagu!)
    const playlist = [
      {
        title: 'Heavenly Jumpstyle',
        artist: 'Zirect Label • Phonk / Jumpstyle',
        genre: 'PHONK',
        bpm: 144,
        rotation: 'DRAKE × 14',
        cover: 'assets/music-album-art.jpg',
        src: 'assets/heavenly-jumpstyle.mp3',
        altSrc: 'assets/heavenly-jumpstyle.wav',
        notes: [
          370.0, 370.0, 0, 440.0, 493.88, 0, 370.0, 0,
          330.0, 0, 293.66, 0, 330.0, 370.0, 0, 440.0,
          370.0, 370.0, 0, 440.0, 493.88, 554.37, 0, 493.88,
          440.0, 0, 370.0, 0, 330.0, 293.66, 330.0, 0
        ]
      },
      {
        title: 'Brazilian Hardstyle',
        artist: 'Funk Montagem • Viral TikTok',
        genre: 'HARDSTYLE',
        bpm: 150,
        rotation: 'TIKTOK × 99',
        cover: 'assets/music-cover.jpg',
        src: 'assets/brazilian-hardstyle.mp3',
        notes: [
          440.0, 0, 440.0, 0, 523.25, 0, 493.88, 0,
          440.0, 392.0, 440.0, 0, 587.33, 523.25, 493.88, 0,
          440.0, 0, 440.0, 0, 523.25, 0, 659.25, 0,
          587.33, 0, 523.25, 0, 493.88, 440.0, 392.0, 0
        ]
      },
      {
        title: 'Night City Drift',
        artist: 'Phonk Killer • Midnight Drive',
        genre: 'DRIFT PHONK',
        bpm: 138,
        rotation: 'SPEED × 88',
        cover: 'assets/music-album-art.jpg',
        src: 'assets/drift.mp3',
        notes: [
          293.66, 0, 293.66, 349.23, 0, 293.66, 0, 261.63,
          293.66, 0, 349.23, 0, 392.00, 349.23, 293.66, 0,
          293.66, 0, 293.66, 349.23, 0, 440.00, 0, 392.00,
          349.23, 0, 293.66, 0, 261.63, 246.94, 261.63, 0
        ]
      },
      {
        title: 'Carter Lab Lo-Fi',
        artist: 'Carter Ogunsola • Chill Beats',
        genre: 'LO-FI / JAZZ',
        bpm: 90,
        rotation: 'RADIO × 24',
        cover: 'assets/profile-stamp.jpg',
        src: 'assets/lofi.mp3',
        notes: [
          261.63, 0, 329.63, 0, 392.00, 0, 493.88, 0,
          440.00, 0, 392.00, 0, 349.23, 0, 329.63, 0,
          293.66, 0, 349.23, 0, 440.00, 0, 523.25, 0,
          493.88, 0, 440.00, 0, 392.00, 0, 329.63, 0
        ]
      }
    ];

    let currentTrackIdx = 0;
    let isPlaying = false;
    let isUsingRealAudio = false;
    let musicAudioCtx = null;
    let masterGain = null;
    let analyserNode = null;
    let schedulerTimer = null;
    let nextStepTime = 0;
    let current16thStep = 0;
    let elapsedSeconds = 0;
    let progressTimer = null;
    let currentVolume = 0.8;
    let speedRate = 1.0;

    const TOTAL_TRACK_SECONDS = 255;

    function ensureAudioContext() {
      if (!musicAudioCtx) {
        musicAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = musicAudioCtx.createGain();
        masterGain.gain.setValueAtTime(currentVolume, musicAudioCtx.currentTime);

        analyserNode = musicAudioCtx.createAnalyser();
        analyserNode.fftSize = 64;

        masterGain.connect(analyserNode);
        analyserNode.connect(musicAudioCtx.destination);
      }
      if (musicAudioCtx.state === 'suspended') {
        musicAudioCtx.resume();
      }
    }

    // Web Audio Synthesizer: Kick Drum
    function playKick(time) {
      if (!musicAudioCtx) return;
      const osc = musicAudioCtx.createOscillator();
      const gain = musicAudioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(155 * speedRate, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

      gain.gain.setValueAtTime(0.95, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + 0.22);
    }

    // Bass Synth
    function playBass(time, stepIdx) {
      if (!musicAudioCtx) return;
      const osc = musicAudioCtx.createOscillator();
      const filter = musicAudioCtx.createBiquadFilter();
      const gain = musicAudioCtx.createGain();

      osc.type = 'sawtooth';
      let freq = 92.5 * speedRate;
      if (stepIdx >= 16 && stepIdx < 24) freq = 82.4 * speedRate;
      if (stepIdx >= 24) freq = 73.4 * speedRate;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, time);
      filter.frequency.exponentialRampToValueAtTime(220, time + 0.12);

      gain.gain.setValueAtTime(0.55, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + 0.14);
    }

    // Cowbell / Melody Synth
    function playCowbell(time, freq) {
      if (!musicAudioCtx || !freq) return;
      const osc1 = musicAudioCtx.createOscillator();
      const osc2 = musicAudioCtx.createOscillator();
      const bpf = musicAudioCtx.createBiquadFilter();
      const gain = musicAudioCtx.createGain();

      const f = freq * speedRate;
      osc1.type = 'square';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(f, time);
      osc2.frequency.setValueAtTime(f * 1.48, time);

      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(f * 1.1, time);
      bpf.Q.setValueAtTime(2.2, time);

      gain.gain.setValueAtTime(0.38, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc1.connect(bpf);
      osc2.connect(bpf);
      bpf.connect(gain);
      gain.connect(masterGain);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.18);
      osc2.stop(time + 0.18);
    }

    // Hi-Hat
    function playHat(time, isAccent = false) {
      if (!musicAudioCtx) return;
      const bufferSize = Math.floor(musicAudioCtx.sampleRate * 0.04);
      const buffer = musicAudioCtx.createBuffer(1, bufferSize, musicAudioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = musicAudioCtx.createBufferSource();
      noise.buffer = buffer;

      const hpf = musicAudioCtx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(7000, time);

      const gain = musicAudioCtx.createGain();
      const vol = isAccent ? 0.22 : 0.12;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.038);

      noise.connect(hpf);
      hpf.connect(gain);
      gain.connect(masterGain);

      noise.start(time);
      noise.stop(time + 0.038);
    }

    // Snare / Clap
    function playClap(time) {
      if (!musicAudioCtx) return;
      const bufferSize = Math.floor(musicAudioCtx.sampleRate * 0.1);
      const buffer = musicAudioCtx.createBuffer(1, bufferSize, musicAudioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = musicAudioCtx.createBufferSource();
      noise.buffer = buffer;

      const bpf = musicAudioCtx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(1400, time);
      bpf.Q.setValueAtTime(1.5, time);

      const gain = musicAudioCtx.createGain();
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

      noise.connect(bpf);
      bpf.connect(gain);
      gain.connect(masterGain);

      noise.start(time);
      noise.stop(time + 0.09);
    }

    // Procedural Beat Scheduler
    function scheduleStep() {
      if (isUsingRealAudio) return;
      const currentTrack = playlist[currentTrackIdx];
      const bpm = (currentTrack.bpm || 144) * speedRate;
      const secPer16th = (60.0 / bpm) / 4.0;
      const notes = currentTrack.notes || [];

      while (nextStepTime < musicAudioCtx.currentTime + 0.15) {
        const step = current16thStep % 32;

        if (step % 4 === 0) playKick(nextStepTime);
        if (step === 4 || step === 12 || step === 20 || step === 28) playClap(nextStepTime);
        if (step % 4 === 2) playBass(nextStepTime, step);
        if (step % 2 === 0) playHat(nextStepTime, step % 4 === 2);
        else if (step === 15 || step === 31) playHat(nextStepTime, false);

        const note = notes[step];
        if (note > 0) playCowbell(nextStepTime, note);

        nextStepTime += secPer16th;
        current16thStep++;
      }
    }

    // Visualizer Loop
    function updateVisualizer() {
      if (!isPlaying) {
        visualizerBars.forEach(bar => {
          bar.style.height = '4px';
        });
        return;
      }

      if (analyserNode && visualizerBars.length > 0) {
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(dataArray);

        visualizerBars.forEach((bar, idx) => {
          const val = dataArray[idx * 2] || 0;
          const h = Math.max(4, Math.min(22, (val / 255) * 22));
          bar.style.height = `${h}px`;
        });
      }

      requestAnimationFrame(updateVisualizer);
    }

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateProgress() {
      if (isUsingRealAudio && realAudio && !isNaN(realAudio.duration)) {
        elapsedSeconds = Math.floor(realAudio.currentTime);
        const total = Math.floor(realAudio.duration);
        if (musicTimeCurr) musicTimeCurr.textContent = formatTime(elapsedSeconds);
        if (progressFill && total > 0) {
          progressFill.style.width = `${(elapsedSeconds / total) * 100}%`;
        }
      } else {
        elapsedSeconds = (elapsedSeconds + 1) % TOTAL_TRACK_SECONDS;
        if (musicTimeCurr) musicTimeCurr.textContent = formatTime(elapsedSeconds);
        if (progressFill) {
          progressFill.style.width = `${(elapsedSeconds / TOTAL_TRACK_SECONDS) * 100}%`;
        }
      }
    }

    // Ganti Lagu (Track Selection)
    function loadTrack(idx, autoplay = true) {
      currentTrackIdx = idx;
      const track = playlist[currentTrackIdx];

      if (musicSongTitle) musicSongTitle.textContent = track.title;
      if (musicSongArtist) musicSongArtist.textContent = track.artist;
      if (musicGenreTag) musicGenreTag.textContent = track.genre;
      if (musicRotationLabel) musicRotationLabel.textContent = track.rotation;
      if (miniSongTitle) miniSongTitle.textContent = track.title;
      if (vinylCoverImg && track.cover) vinylCoverImg.src = track.cover;

      trackPills.forEach((p, i) => {
        if (i === currentTrackIdx) p.classList.add('active');
        else p.classList.remove('active');
      });

      elapsedSeconds = 0;
      if (musicTimeCurr) musicTimeCurr.textContent = '00:00';
      if (progressFill) progressFill.style.width = '0%';

      // Cek apakah ada file audio nyata
      if (realAudio && track.src) {
        realAudio.src = track.src;
        realAudio.load();
        const playPromise = realAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            isUsingRealAudio = true;
            if (autoplay) setMusicPlaying(true);
          }).catch(() => {
            // Jika file MP3 lokal belum diunduh, fallback otomatis ke synth tanpa henti!
            isUsingRealAudio = false;
            if (autoplay) setMusicPlaying(true);
          });
        }
      } else {
        isUsingRealAudio = false;
        if (autoplay) setMusicPlaying(true);
      }
    }

    function setMusicPlaying(state) {
      isPlaying = state;

      if (isPlaying) {
        ensureAudioContext();

        if (isUsingRealAudio && realAudio) {
          realAudio.play().catch(() => {});
        } else {
          nextStepTime = musicAudioCtx.currentTime + 0.05;
          if (!schedulerTimer) {
            schedulerTimer = setInterval(scheduleStep, 25);
          }
        }

        if (!progressTimer) {
          progressTimer = setInterval(updateProgress, 1000);
        }
        updateVisualizer();

        // UI States
        if (turntableWidget) turntableWidget.classList.add('is-playing');
        if (turntableMiniDock) turntableMiniDock.classList.add('is-playing');
        if (vinylDisc) vinylDisc.classList.add('is-playing');
        if (turntableArm) turntableArm.classList.add('is-playing');
        if (musicPlayIcon) musicPlayIcon.className = 'fa-solid fa-pause';
        if (miniPlayIcon) miniPlayIcon.className = 'fa-solid fa-pause';
        if (musicRadioStatus) musicRadioStatus.textContent = 'RADIO :: ON-AIR';
        if (miniSongStatus) {
          const isOpen = turntableWidget && !turntableWidget.classList.contains('is-minimized');
          miniSongStatus.textContent = isOpen ? 'Tutup Deck ✕' : 'Memutar • Buka Deck ⌃';
        }
        if (musicPillLabel) musicPillLabel.textContent = 'Music: ON';
        if (landingMusicText) landingMusicText.textContent = 'Playing Phonk';
        if (btnTurntableToggle) btnTurntableToggle.classList.add('is-active');
        if (landingMusicBtn) landingMusicBtn.classList.add('is-active');
      } else {
        if (realAudio) {
          realAudio.pause();
        }
        if (schedulerTimer) {
          clearInterval(schedulerTimer);
          schedulerTimer = null;
        }
        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }
        updateVisualizer();

        // UI States
        if (turntableWidget) turntableWidget.classList.remove('is-playing');
        if (turntableMiniDock) turntableMiniDock.classList.remove('is-playing');
        if (vinylDisc) vinylDisc.classList.remove('is-playing');
        if (turntableArm) turntableArm.classList.remove('is-playing');
        if (musicPlayIcon) musicPlayIcon.className = 'fa-solid fa-play';
        if (miniPlayIcon) miniPlayIcon.className = 'fa-solid fa-play';
        if (musicRadioStatus) musicRadioStatus.textContent = 'RADIO :: OFF-AIR';
        if (miniSongStatus) {
          const isOpen = turntableWidget && !turntableWidget.classList.contains('is-minimized');
          miniSongStatus.textContent = isOpen ? 'Tutup Deck ✕' : 'Jeda • Buka Deck ⌃';
        }
        if (musicPillLabel) musicPillLabel.textContent = 'Music: Phonk';
        if (landingMusicText) landingMusicText.textContent = 'Music: Phonk';
        if (btnTurntableToggle) btnTurntableToggle.classList.remove('is-active');
        if (landingMusicBtn) landingMusicBtn.classList.remove('is-active');
      }
    }

    function togglePlay() {
      setMusicPlaying(!isPlaying);
    }

    // Kontrol Buka / Tutup Deck (Open / Close Turntable)
    function openTurntable() {
      if (turntableWidget) {
        turntableWidget.classList.remove('is-minimized');
      }
      if (turntableMiniDock) {
        turntableMiniDock.classList.add('deck-is-open');
        if (miniSongStatus) miniSongStatus.textContent = 'Tutup Deck ✕';
      }
      if (btnTurntableToggle) {
        btnTurntableToggle.classList.add('is-active');
      }
      playMechanicalTick(1.15);
    }

    function closeTurntable() {
      if (turntableWidget) {
        turntableWidget.classList.add('is-minimized');
      }
      if (turntableMiniDock) {
        turntableMiniDock.classList.remove('deck-is-open');
        if (miniSongStatus) {
          miniSongStatus.textContent = isPlaying ? 'Memutar • Buka Deck ⌃' : 'Jeda • Buka Deck ⌃';
        }
      }
      if (btnTurntableToggle) {
        btnTurntableToggle.classList.remove('is-active');
      }
      playMechanicalTick(0.85);
    }

    function toggleTurntable() {
      if (!turntableWidget) return;
      if (turntableWidget.classList.contains('is-minimized')) {
        openTurntable();
      } else {
        closeTurntable();
      }
    }

    // Event Listeners: Open / Close
    if (turntableCloseBtn) {
      turntableCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeTurntable();
      });
    }

    if (btnTurntableToggle) {
      btnTurntableToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTurntable();
      });
    }

    if (landingMusicBtn) {
      landingMusicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openTurntable();
        if (!isPlaying) togglePlay();
      });
    }

    if (miniDockTrigger) {
      miniDockTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTurntable();
      });
    }

    if (btnMiniPlay) {
      btnMiniPlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
      });
    }

    // Playback Buttons
    if (btnMusicPlay) {
      btnMusicPlay.addEventListener('click', (e) => {
        e.preventDefault();
        togglePlay();
      });
    }

    if (btnMusicPrev) {
      btnMusicPrev.addEventListener('click', (e) => {
        e.preventDefault();
        const prevIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
        loadTrack(prevIdx, true);
        playMechanicalTick(1.1);
      });
    }

    if (btnMusicNext) {
      btnMusicNext.addEventListener('click', (e) => {
        e.preventDefault();
        const nextIdx = (currentTrackIdx + 1) % playlist.length;
        loadTrack(nextIdx, true);
        playMechanicalTick(1.1);
      });
    }

    // Playlist Track Pills
    trackPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(pill.getAttribute('data-track'), 10);
        if (!isNaN(idx)) {
          loadTrack(idx, true);
          playMechanicalTick(1.2);
        }
      });
    });

    // Pilih File Lagu Sendiri (Custom MP3 Picker)
    if (musicFileInput) {
      musicFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileUrl = URL.createObjectURL(file);
          const customTrack = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'File Audio Saya (MP3)',
            genre: 'CUSTOM',
            bpm: 140,
            rotation: 'LOCAL × 01',
            cover: 'assets/music-album-art.jpg',
            src: fileUrl
          };

          playlist.unshift(customTrack);
          loadTrack(0, true);
          playMechanicalTick(1.4);
        }
      });
    }

    // RPM Speed Toggle
    if (btnSpeed33 && btnSpeed45) {
      btnSpeed33.addEventListener('click', () => {
        speedRate = 1.0;
        btnSpeed33.classList.add('active');
        btnSpeed45.classList.remove('active');
        if (realAudio) realAudio.playbackRate = 1.0;
        playMechanicalTick(1.0);
      });

      btnSpeed45.addEventListener('click', () => {
        speedRate = 1.36; // 45 / 33.3 RPM
        btnSpeed45.classList.add('active');
        btnSpeed33.classList.remove('active');
        if (realAudio) realAudio.playbackRate = 1.36;
        playMechanicalTick(1.3);
      });
    }

    // Volume Slider
    if (deckVolume) {
      deckVolume.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100.0;
        currentVolume = val;
        if (masterGain && musicAudioCtx) {
          masterGain.gain.setValueAtTime(currentVolume, musicAudioCtx.currentTime);
        }
        if (realAudio) {
          realAudio.volume = currentVolume;
        }
      });
    }

    // Seek Progress
    if (progressTrack) {
      progressTrack.addEventListener('click', (e) => {
        const rect = progressTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        if (isUsingRealAudio && realAudio && !isNaN(realAudio.duration)) {
          realAudio.currentTime = pct * realAudio.duration;
        } else {
          elapsedSeconds = Math.floor(pct * TOTAL_TRACK_SECONDS);
        }
        updateProgress();
      });
    }

    // Pastikan secara default pemutar musik tertutup (tidak langsung membuka tab music saat di beranda)
    if (turntableWidget) {
      turntableWidget.classList.add('is-minimized');
    }
    if (turntableMiniDock) {
      turntableMiniDock.classList.remove('deck-is-open', 'is-playing');
    }
    if (miniSongStatus) {
      miniSongStatus.textContent = 'Buka Deck ⌃';
    }
  }

  initTurntableMusic();

  // ========================================================
  // 7. SISTEM WAKTU DAERAH/NEGARA & MODE OTOMATIS (SIANG / MALAM)
  // ========================================================
  function initDateTimeAndThemeMode() {
    const modeBtns = document.querySelectorAll('.mode-btn');

    // 1. Deteksi Zona Waktu, Singkatan, & Negara Pengguna
    function getRegionAndZone() {
      let zoneName = 'WIB';
      let countryCode = 'ID';

      try {
        const resolved = Intl.DateTimeFormat().resolvedOptions();
        const timeZone = resolved.timeZone || 'Asia/Jakarta';

        const now = new Date();
        const parts = new Intl.DateTimeFormat('id-ID', {
          timeZone: timeZone,
          timeZoneName: 'short'
        }).formatToParts(now);

        const tzPart = parts.find(p => p.type === 'timeZoneName');
        if (tzPart && tzPart.value) {
          zoneName = tzPart.value;
        }

        const tzLower = timeZone.toLowerCase();
        if (tzLower.includes('jakarta') || tzLower.includes('pontianak') || tzLower.includes('makassar') || tzLower.includes('jayapura')) {
          countryCode = 'ID';
        } else if (tzLower.startsWith('america')) {
          countryCode = 'US';
        } else if (tzLower.startsWith('europe/london')) {
          countryCode = 'UK';
        } else if (tzLower.startsWith('asia/tokyo')) {
          countryCode = 'JP';
        } else if (tzLower.startsWith('asia/singapore')) {
          countryCode = 'SG';
        } else if (tzLower.startsWith('asia/kuala_lumpur')) {
          countryCode = 'MY';
        } else {
          const segs = timeZone.split('/');
          countryCode = (segs[1] || segs[0]).replace(/_/g, ' ').toUpperCase().slice(0, 3);
        }
      } catch (e) {
        zoneName = 'WIB';
        countryCode = 'ID';
      }

      return { zoneName, countryCode };
    }

    // 2. Deteksi Otomatis Mode Siang / Malam Berdasarkan Waktu Lokal Saat Ini
    // Jam 06:00 s.d 17:59 = Siang (Day)
    // Jam 18:00 s.d 05:59 = Malam (Night)
    function getAutoModeByTime() {
      const currentHour = new Date().getHours();
      return (currentHour >= 6 && currentHour < 18) ? 'day' : 'night';
    }

    // 3. Update Jam Real-Time Tiap Detik
    function updateClockDisplay() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${h}:${m}:${s}`;
      const shortTime = `${h}:${m}`;

      const { zoneName, countryCode } = getRegionAndZone();

      const clockTimes = document.querySelectorAll('.clock-time');
      clockTimes.forEach(el => el.textContent = timeStr);

      const clockZones = document.querySelectorAll('.clock-zone');
      clockZones.forEach(el => el.textContent = `${zoneName} • ${countryCode}`);

      const postcardClocks = document.querySelectorAll('.postcard-clock');
      postcardClocks.forEach(el => el.textContent = `${shortTime} ${zoneName}`);
    }

    updateClockDisplay();
    setInterval(updateClockDisplay, 1000);

    // 4. Menerapkan Mode ke Body & Tombol
    function updateThemeBtnStates(activeMode, isAuto = false) {
      modeBtns.forEach(btn => {
        const modeAttr = btn.getAttribute('data-mode');
        if (isAuto) {
          if (modeAttr === 'auto') btn.classList.add('active');
          else btn.classList.remove('active');
        } else {
          if (modeAttr === activeMode) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });
    }

    function applyMode(mode, isManual = false, isAutoChoice = false) {
        if (mode === 'night') {
          document.body.classList.add('mode-night');
          document.body.classList.remove('mode-day');
        } else {
          document.body.classList.remove('mode-night');
          document.body.classList.add('mode-day');
        }

        if (isAutoChoice) {
          try {
            localStorage.removeItem('portfolio-theme-mode');
            sessionStorage.removeItem('user-manual-theme');
          } catch (e) {}
          updateThemeBtnStates(mode, true);
        } else if (isManual) {
          try {
            localStorage.setItem('portfolio-theme-mode', mode);
            sessionStorage.setItem('user-manual-theme', 'true');
          } catch (e) {}
          updateThemeBtnStates(mode, false);
        } else {
          const saved = localStorage.getItem('portfolio-theme-mode');
          updateThemeBtnStates(mode, !saved);
        }
      }

      // Tentukan mode awal (otomatis sesuai waktu setempat negara/daerah)
      let initialMode = getAutoModeByTime();
      let hasSavedManual = false;
      try {
        const savedTheme = localStorage.getItem('portfolio-theme-mode');
        if (savedTheme === 'day' || savedTheme === 'night') {
          initialMode = savedTheme;
          hasSavedManual = true;
        }
      } catch (e) {
        initialMode = getAutoModeByTime();
      }

      applyMode(initialMode, hasSavedManual, !hasSavedManual);

      // Interaksi Tombol Pilihan Tema (Siang, Malam, Otomatis)
      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetMode = btn.getAttribute('data-mode');
          if (targetMode === 'auto') {
            const autoMode = getAutoModeByTime();
            applyMode(autoMode, false, true);
          } else {
            applyMode(targetMode, true, false);
          }
          if (typeof playMechanicalTick === 'function') {
            playMechanicalTick(targetMode === 'night' ? 0.95 : 1.25);
          }
        });
      });

      // Pengecekan otomatis berkala (setiap menit) jika mode diatur Otomatis
      setInterval(() => {
        try {
          const savedTheme = localStorage.getItem('portfolio-theme-mode');
          if (!savedTheme) {
            const autoMode = getAutoModeByTime();
            applyMode(autoMode, false, true);
          }
        } catch (e) {}
      }, 60000);

      // Wilayah & Jam pada Settings Modal
      const detectedRegionEl = document.getElementById('settings-detected-region');
      if (detectedRegionEl) {
        const { zoneName, countryCode } = getRegionAndZone();
        try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
          detectedRegionEl.textContent = `${countryCode} • ${zoneName} (${timeZone})`;
        } catch (e) {
          detectedRegionEl.textContent = `${countryCode} • ${zoneName}`;
        }
      }

      // Settings Modal Open / Close Logic
      const settingsModal = document.getElementById('portfolio-settings-modal');
      const openSettingsBtns = document.querySelectorAll('#btn-open-settings, #btn-open-settings-landing, .hud-btn-settings');
      const closeSettingsBtns = document.querySelectorAll('#btn-settings-close, #btn-settings-done, #settings-modal-backdrop');

      function openSettingsModal() {
        if (settingsModal) {
          settingsModal.classList.add('is-open');
          settingsModal.setAttribute('aria-hidden', 'false');
          if (typeof playMechanicalTick === 'function') playMechanicalTick(1.15);
        }
      }

      function closeSettingsModal() {
        if (settingsModal) {
          settingsModal.classList.remove('is-open');
          settingsModal.setAttribute('aria-hidden', 'true');
          if (typeof playMechanicalTick === 'function') playMechanicalTick(0.9);
        }
      }

      window.openSettingsModal = openSettingsModal;
      window.closeSettingsModal = closeSettingsModal;

      openSettingsBtns.forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
        openSettingsModal();
      }));

      closeSettingsBtns.forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
        closeSettingsModal();
      }));

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal && settingsModal.classList.contains('is-open')) {
          closeSettingsModal();
        }
      });

      // Sound Toggle di Dalam Settings Modal
      const btnSettingsSound = document.getElementById('btn-settings-sound-toggle');
      const settingsSoundLabel = document.getElementById('settings-sound-label');

      function updateSoundToggleUi() {
        if (btnSettingsSound) {
          btnSettingsSound.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
          btnSettingsSound.classList.toggle('is-active', soundEnabled);
        }
        if (settingsSoundLabel) {
          settingsSoundLabel.textContent = soundEnabled ? 'Audio: AKTIF' : 'Audio: NONAKTIF';
        }
      }

      if (btnSettingsSound) {
        btnSettingsSound.addEventListener('click', (e) => {
          e.preventDefault();
          soundEnabled = !soundEnabled;
          updateSoundToggleUi();
          if (soundEnabled && typeof playMechanicalTick === 'function') {
            playMechanicalTick(1.3);
          }
        });
        updateSoundToggleUi();
      }
    }

  initDateTimeAndThemeMode();

  // Inisialisasi Posisi Awal
  snapToIndex(0, false);
  window.addEventListener('resize', () => {
    snapToIndex(activeIndex, false);
  });
}

// Inisialisasi saat DOM siap atau jika sudah siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

/**
 * ============================================================================
 * T-REX ESCAPE: JURASSIC CHASE
 * Full Game Engine & Logic
 * ============================================================================
 */

(function () {
  'use strict';

  // Capacitor/emulators can expose desktop-like media-query values. Detect the
  // native/mobile environment independently so touch UI is never hidden there.
  const capacitorNative = Boolean(
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform()
  );
  const nativeMobile = capacitorNative || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (nativeMobile) document.documentElement.classList.add('native-mobile');

  // --- AUDIO SYNTHESIZER (Web Audio API - No External Files) ---
  class SoundController {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.heartbeatOsc = null;
      this.heartbeatGain = null;
      this.lastHeartbeatTime = 0;
      this.heartbeatInterval = 1000;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    playJump() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.16);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    }

    playSlide() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      // White noise buffer for whoosh
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.22);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    }

    playStep(volume = 0.4) {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

      gain.gain.setValueAtTime(Math.min(volume, 0.6), t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }

    playRoar() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.25);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.7);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.75);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.75);
    }

    playMeatToss() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.25);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }

    playChomp() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    }

    playGem() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = t + idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    }

    playHit() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }

    playGameOver() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(140, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.9);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.0);
    }

    updateHeartbeat(proximityPercent, now) {
      if (this.muted || !this.ctx) return;
      // If proximity < 40%, start pulse
      if (proximityPercent < 45) {
        // Interval ranges from 700ms down to 240ms as danger increases
        const factor = proximityPercent / 45;
        this.heartbeatInterval = 240 + factor * 460;

        if (now - this.lastHeartbeatTime > this.heartbeatInterval) {
          this.lastHeartbeatTime = now;
          this.playHeartbeatThump();
        }
      }
    }

    playHeartbeatThump() {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(70, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  // --- PARALLAX BACKGROUND SYSTEM ---
  class ParallaxBackground {
    constructor(canvasWidth, canvasHeight, groundY) {
      this.width = canvasWidth;
      this.height = canvasHeight;
      this.groundY = groundY;
      this.offset1 = 0;
      this.offset2 = 0;
      this.offset3 = 0;
      this.groundOffset = 0;

      // Clouds
      this.clouds = [
        { x: 100, y: 50, size: 60, speed: 0.2 },
        { x: 450, y: 80, size: 85, speed: 0.25 },
        { x: 800, y: 40, size: 50, speed: 0.18 }
      ];

      // Volcano smoke particles
      this.smokePuffs = [];
      for (let i = 0; i < 8; i++) {
        this.smokePuffs.push({
          x: 230 + (Math.random() * 20 - 10),
          y: 190 - i * 15,
          radius: 12 + i * 4,
          opacity: 0.5 - i * 0.05,
          vx: 0.3 + Math.random() * 0.2,
          vy: -0.4 - Math.random() * 0.3
        });
      }
    }

    update(speed, dt) {
      // Parallax speeds
      this.offset1 = (this.offset1 + speed * 0.15 * dt * 60) % 960;
      this.offset2 = (this.offset2 + speed * 0.4 * dt * 60) % 960;
      this.offset3 = (this.offset3 + speed * 0.7 * dt * 60) % 960;
      this.groundOffset = (this.groundOffset + speed * dt * 60) % 60;

      // Clouds
      for (const cloud of this.clouds) {
        cloud.x -= (cloud.speed + speed * 0.04) * dt * 60;
        if (cloud.x + cloud.size * 2 < 0) {
          cloud.x = this.width + Math.random() * 100;
          cloud.y = 30 + Math.random() * 80;
        }
      }

      // Volcano smoke
      for (const p of this.smokePuffs) {
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.radius += 0.15 * dt * 60;
        p.opacity -= 0.003 * dt * 60;
        if (p.opacity <= 0 || p.y < 20) {
          p.x = 230 + (Math.random() * 14 - 7);
          p.y = 195;
          p.radius = 10;
          p.opacity = 0.55;
        }
      }
    }

    draw(ctx) {
      // 1. Sky Gradient (Sunset / Cretaceous Dusk)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      skyGrad.addColorStop(0, '#1c1530');
      skyGrad.addColorStop(0.35, '#3b1d38');
      skyGrad.addColorStop(0.65, '#873428');
      skyGrad.addColorStop(0.9, '#cf6226');
      skyGrad.addColorStop(1, '#ffaa44');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Prehistoric Sun / Glowing moon behind haze
      const sunGrad = ctx.createRadialGradient(720, 140, 10, 720, 140, 110);
      sunGrad.addColorStop(0, 'rgba(255, 230, 150, 0.9)');
      sunGrad.addColorStop(0.3, 'rgba(255, 170, 70, 0.4)');
      sunGrad.addColorStop(1, 'rgba(255, 120, 40, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(720, 140, 110, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      ctx.fillStyle = 'rgba(255, 200, 160, 0.22)';
      for (const cloud of this.clouds) {
        this.drawCloud(ctx, cloud.x, cloud.y, cloud.size);
      }

      // 2. Distant Volcano (around x = 230)
      this.drawVolcano(ctx);

      // 3. Far Mountains (Layer 1)
      ctx.fillStyle = '#2d182b';
      this.drawMountains(ctx, this.offset1, 230, 120, 0.6);

      // 4. Midground Prehistoric Cycad / Jungle Silhouette (Layer 2)
      ctx.fillStyle = '#1b1c24';
      this.drawMidJungle(ctx, this.offset2);

      // 5. Near Forest Edge (Layer 3)
      ctx.fillStyle = '#111e17';
      this.drawNearForest(ctx, this.offset3);

      // 6. Ground & Dirt Path
      this.drawGround(ctx);
    }

    drawCloud(ctx, x, y, size) {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.45, 0, Math.PI * 2);
      ctx.arc(x + size * 0.8, y, size * 0.4, 0, Math.PI * 2);
      ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    drawVolcano(ctx) {
      // Volcano shape
      ctx.fillStyle = '#221124';
      ctx.beginPath();
      ctx.moveTo(110, this.groundY);
      ctx.lineTo(210, 200);
      ctx.lineTo(250, 200);
      ctx.lineTo(360, this.groundY);
      ctx.closePath();
      ctx.fill();

      // Crater lava glow
      const craterGrad = ctx.createLinearGradient(210, 200, 250, 200);
      craterGrad.addColorStop(0, '#ff3b00');
      craterGrad.addColorStop(0.5, '#ffee55');
      craterGrad.addColorStop(1, '#ff3b00');
      ctx.fillStyle = craterGrad;
      ctx.fillRect(212, 198, 36, 6);

      // Smoke puffs
      for (const p of this.smokePuffs) {
        ctx.fillStyle = `rgba(50, 40, 48, ${Math.max(0, p.opacity)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawMountains(ctx, offset, baseY, height, scale) {
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      const step = 160;
      for (let x = -offset - step; x < this.width + step * 2; x += step) {
        const peakY = baseY + Math.sin(x * 0.015) * height * 0.5;
        ctx.lineTo(x, peakY);
      }
      ctx.lineTo(this.width, this.groundY);
      ctx.closePath();
      ctx.fill();
    }

    drawMidJungle(ctx, offset) {
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      const step = 80;
      for (let x = -offset - step; x < this.width + step * 2; x += step) {
        const h = 70 + Math.sin(x * 0.05) * 35;
        ctx.lineTo(x, this.groundY - h);
        ctx.lineTo(x + step * 0.5, this.groundY - h * 0.6);
      }
      ctx.lineTo(this.width, this.groundY);
      ctx.closePath();
      ctx.fill();
    }

    drawNearForest(ctx, offset) {
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      const step = 50;
      for (let x = -offset - step; x < this.width + step * 2; x += step) {
        const h = 45 + Math.cos(x * 0.1) * 20;
        ctx.lineTo(x, this.groundY - h);
      }
      ctx.lineTo(this.width, this.groundY);
      ctx.closePath();
      ctx.fill();
    }

    drawGround(ctx) {
      // Main Ground Base
      const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
      groundGrad.addColorStop(0, '#362419');
      groundGrad.addColorStop(0.15, '#26180f');
      groundGrad.addColorStop(1, '#110b06');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

      // Top grass & moss strip
      ctx.fillStyle = '#476326';
      ctx.fillRect(0, this.groundY, this.width, 6);
      ctx.fillStyle = '#6b9638';
      ctx.fillRect(0, this.groundY, this.width, 2);

      // Dirt texture / pebbles scrolling
      ctx.fillStyle = '#543b2b';
      for (let x = -this.groundOffset; x < this.width + 60; x += 30) {
        ctx.fillRect(x + 5, this.groundY + 12, 10, 3);
        ctx.fillRect(x + 18, this.groundY + 28, 6, 2);
        ctx.fillRect(x + 8, this.groundY + 50, 14, 4);
      }

      ctx.fillStyle = '#20150e';
      for (let x = -this.groundOffset; x < this.width + 60; x += 45) {
        ctx.fillRect(x + 12, this.groundY + 18, 12, 2);
        ctx.fillRect(x + 24, this.groundY + 40, 8, 3);
      }
    }
  }

  // --- PARTICLE SYSTEM ---
  class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    spawnDust(x, y, count = 3, color = 'rgba(150, 120, 90, 0.6)') {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: x + (Math.random() * 10 - 5),
          y: y + (Math.random() * 4 - 2),
          vx: -(Math.random() * 2 + 1),
          vy: -(Math.random() * 1.5 + 0.5),
          radius: Math.random() * 3.5 + 2,
          color: color,
          alpha: 0.7,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    spawnMeatBites(x, y) {
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() * 6 - 3),
          vy: -(Math.random() * 5 + 2),
          radius: Math.random() * 3 + 2,
          color: Math.random() > 0.3 ? '#cc2233' : '#ffeecc',
          alpha: 1,
          decay: 0.025
        });
      }
    }

    spawnGemSparkles(x, y) {
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() * 4 - 2),
          vy: (Math.random() * 4 - 2),
          radius: Math.random() * 3 + 1.5,
          color: '#ffdd44',
          alpha: 1,
          decay: 0.03
        });
      }
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.alpha -= p.decay * dt * 60;
        p.radius = Math.max(0.2, p.radius - 0.04 * dt * 60);

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      ctx.save();
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    clear() {
      this.particles = [];
    }
  }

  // --- PLAYER CHARACTER CLASS ---
  class Player {
    constructor(groundY) {
      this.groundY = groundY;
      this.x = 340; // Position on screen
      this.y = groundY;
      this.vx = 0;
      this.vy = 0;
      this.width = 44;
      this.height = 68;

      this.isGrounded = true;
      this.isSliding = false;
      this.isSlideKeyHeld = false;
      this.slideTimer = 0;
      this.minSlideTime = 0.55; // a quick downward swipe still lasts long enough to dodge
      this.jumpHoldTimer = 0;
      this.isJumpKeyHeld = false;

      this.stumbleTimer = 0;
      this.isSlowed = false;
      this.slowTimer = 0;

      // Animation cycle
      this.runFrame = 0;
      this.animSpeed = 12;

      // Stats & Inventory
      this.meatAmmo = 1; // start with 1 meat
      this.maxMeat = 3;
    }

    reset() {
      this.y = this.groundY;
      this.vy = 0;
      this.isGrounded = true;
      this.isSliding = false;
      this.isSlideKeyHeld = false;
      this.slideTimer = 0;
      this.stumbleTimer = 0;
      this.isSlowed = false;
      this.slowTimer = 0;
      this.meatAmmo = 1;
      this.runFrame = 0;
    }

    jump() {
      if (this.isGrounded && !this.isSliding) {
        this.vy = -14.5;
        this.isGrounded = false;
        this.jumpHoldTimer = 0;
        return true;
      }
      return false;
    }

    slide() {
      if (this.isGrounded && !this.isSliding) {
        this.isSliding = true;
        this.slideTimer = this.minSlideTime;
        return true;
      }
      return false;
    }

    stumble() {
      this.stumbleTimer = 0.45;
    }

    applySlow(duration = 1.2) {
      this.isSlowed = true;
      this.slowTimer = duration;
    }

    getHitbox() {
      if (this.isSliding) {
        // Lower, flatter hitbox during slide
        return {
          x: this.x - 18,
          y: this.y - 30,
          width: 54,
          height: 30
        };
      } else {
        // Normal standing/jumping hitbox
        return {
          x: this.x - 16,
          y: this.y - this.height,
          width: 32,
          height: this.height - 4
        };
      }
    }

    update(dt, speedMultiplier, particles, soundCtrl) {
      // Slow timer
      if (this.isSlowed) {
        this.slowTimer -= dt;
        if (this.slowTimer <= 0) {
          this.isSlowed = false;
        }
      }

      // Stumble timer
      if (this.stumbleTimer > 0) {
        this.stumbleTimer -= dt;
      }

      // Variable jump height (holding jump floats slightly higher)
      if (!this.isGrounded) {
        const gravity = 34; // px/s^2 approx
        if (this.isJumpKeyHeld && this.vy < 0 && this.jumpHoldTimer < 0.22) {
          this.vy += gravity * 0.55 * dt;
          this.jumpHoldTimer += dt;
        } else {
          this.vy += gravity * dt;
        }

        this.y += this.vy * dt * 60;

        if (this.y >= this.groundY) {
          this.y = this.groundY;
          this.vy = 0;
          this.isGrounded = true;
          particles.spawnDust(this.x, this.groundY, 4);
        }
      }

      // Stay low while the key/button is held, with a short minimum tap duration.
      if (this.isSliding) {
        this.slideTimer -= dt;
        if (Math.random() < 0.5) {
          particles.spawnDust(this.x - 10, this.groundY, 1, 'rgba(180, 150, 110, 0.4)');
        }
        if (!this.isSlideKeyHeld && this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      // Running animation
      if (this.isGrounded && !this.isSliding) {
        this.runFrame += this.animSpeed * speedMultiplier * dt;
        if (Math.floor(this.runFrame) % 6 === 0) {
          particles.spawnDust(this.x - 12, this.groundY, 1);
        }
      }
    }

    draw(ctx, tRexProximity) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Stumble flash
      if (this.stumbleTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
        ctx.globalAlpha = 0.6;
      }

      if (this.isSliding) {
        this.drawSlidingPlayer(ctx);
      } else if (!this.isGrounded) {
        this.drawJumpingPlayer(ctx);
      } else {
        this.drawRunningPlayer(ctx);
      }

      // Sweat drops if T-Rex is dangerously close (< 35%)
      if (tRexProximity < 35 && this.stumbleTimer <= 0) {
        ctx.fillStyle = '#66ccff';
        const sweatY = -this.height + 10 + Math.sin(Date.now() * 0.02) * 4;
        ctx.beginPath();
        ctx.arc(14, sweatY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawRunningPlayer(ctx) {
      const frame = Math.floor(this.runFrame) % 8;
      const legAngle1 = Math.sin(this.runFrame * 0.65) * 0.7;
      const legAngle2 = -legAngle1;
      const armAngle1 = -legAngle1 * 0.8;
      const armAngle2 = legAngle1 * 0.8;
      const bob = Math.abs(Math.sin(this.runFrame * 0.65)) * 4;

      const bodyY = -42 + bob;

      // Shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Back Leg
      this.drawLeg(ctx, -2, -18 + bob, legAngle2, '#7a5a3a');

      // Torso / Explorer Jacket (Khaki)
      ctx.fillStyle = '#b89758';
      ctx.fillRect(-10, bodyY, 20, 26);

      // Explorer Belt & Buckle
      ctx.fillStyle = '#4a2c11';
      ctx.fillRect(-11, bodyY + 22, 22, 5);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-3, bodyY + 22, 6, 5);

      // Backpack
      ctx.fillStyle = '#5c4028';
      ctx.beginPath();
      ctx.roundRect(-16, bodyY + 2, 8, 18, 3);
      ctx.fill();

      // Back Arm
      this.drawArm(ctx, 2, bodyY + 4, armAngle2, '#99733d');

      // Head & Explorer Fedora Hat
      this.drawHead(ctx, 0, bodyY - 14);

      // Front Leg
      this.drawLeg(ctx, 4, -18 + bob, legAngle1, '#946f45');

      // Front Arm
      this.drawArm(ctx, -2, bodyY + 4, armAngle1, '#b89758');
    }

    drawJumpingPlayer(ctx) {
      const bodyY = -48;

      // Shadow on ground (shrinks as height increases)
      const heightAboveGround = this.groundY - this.y;
      const shadowScale = Math.max(0.3, 1 - heightAboveGround / 250);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(0, heightAboveGround, 16 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.fillStyle = '#b89758';
      ctx.fillRect(-10, bodyY, 20, 26);

      // Belt
      ctx.fillStyle = '#4a2c11';
      ctx.fillRect(-11, bodyY + 22, 22, 5);

      // Backpack
      ctx.fillStyle = '#5c4028';
      ctx.fillRect(-16, bodyY + 2, 8, 18);

      // Tucked/jump legs
      ctx.fillStyle = '#946f45';
      ctx.beginPath();
      ctx.ellipse(-4, -10, 6, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -12, 6, 12, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Arms reaching forward/up
      ctx.fillStyle = '#b89758';
      ctx.beginPath();
      ctx.ellipse(10, bodyY + 6, 4, 12, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Head
      this.drawHead(ctx, 2, bodyY - 14);
    }

    drawSlidingPlayer(ctx) {
      // Dust / speed trail under sliding player
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(4, 0, 28, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs stretched back
      ctx.fillStyle = '#946f45';
      ctx.beginPath();
      ctx.ellipse(-14, -8, 16, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Torso leaning flat
      ctx.fillStyle = '#b89758';
      ctx.beginPath();
      ctx.ellipse(6, -14, 18, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Backpack on back
      ctx.fillStyle = '#5c4028';
      ctx.fillRect(-4, -26, 12, 8);

      // Head forward
      this.drawHead(ctx, 22, -18);

      // Arm bracing along ground
      ctx.fillStyle = '#8a693c';
      ctx.beginPath();
      ctx.ellipse(8, -4, 14, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHead(ctx, hx, hy) {
      // Face / Skin
      ctx.fillStyle = '#f5c598';
      ctx.beginPath();
      ctx.arc(hx, hy, 10, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#221105';
      ctx.fillRect(hx + 3, hy - 3, 3, 4);

      // Fedora Hat
      // Hat Brim
      ctx.fillStyle = '#78522e';
      ctx.beginPath();
      ctx.ellipse(hx + 2, hy - 8, 18, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Hat Crown
      ctx.fillStyle = '#5a3d22';
      ctx.fillRect(hx - 7, hy - 20, 16, 12);
      // Hat Band
      ctx.fillStyle = '#2b1b0d';
      ctx.fillRect(hx - 7, hy - 11, 16, 3);
    }

    drawLeg(ctx, lx, ly, angle, color) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);

      // Thigh & Shin
      ctx.fillStyle = color;
      ctx.fillRect(-4, 0, 8, 14);

      // Boot
      ctx.fillStyle = '#26170d';
      ctx.fillRect(-4, 12, 12, 6);

      ctx.restore();
    }

    drawArm(ctx, ax, ay, angle, color) {
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);

      ctx.fillStyle = color;
      ctx.fillRect(-3, 0, 6, 16);

      // Hand
      ctx.fillStyle = '#f5c598';
      ctx.beginPath();
      ctx.arc(0, 16, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // --- T-REX ENEMY CLASS ---
  class TRex {
    constructor(groundY) {
      this.groundY = groundY;
      this.proximity = 75; // 0 = caught player, 100 = far back
      this.targetProximity = 75;
      this.baseX = 80;
      this.x = 80;
      this.y = groundY;

      this.stepTimer = 0;
      this.stepInterval = 0.38;
      this.footToggle = false;

      this.jawOpen = 0.2; // 0 to 1
      this.jawTimer = 0;
      this.isRoaring = false;
      this.roarTimer = 0;

      this.eatingTimer = 0;
      this.distracted = false;

      this.runFrame = 0;
    }

    reset() {
      this.proximity = 75;
      this.targetProximity = 75;
      this.x = 80;
      this.y = this.groundY;
      this.stepTimer = 0;
      this.jawOpen = 0.2;
      this.isRoaring = false;
      this.roarTimer = 0;
      this.eatingTimer = 0;
      this.distracted = false;
      this.runFrame = 0;
    }

    pushBack(amount = 28) {
      this.targetProximity = Math.min(95, this.targetProximity + amount);
      this.distracted = true;
      this.eatingTimer = 1.0;
    }

    advance(amount = 15) {
      this.targetProximity = Math.max(0, this.targetProximity - amount);
    }

    update(dt, playerX, speedMultiplier, soundCtrl, screenShakeCallback) {
      // Natural proximity creep over distance (T-Rex relentlessly pursues)
      this.targetProximity -= (0.45 + speedMultiplier * 0.05) * dt;

      // Distracted by meat
      if (this.distracted) {
        this.eatingTimer -= dt;
        if (this.eatingTimer <= 0) {
          this.distracted = false;
        }
      }

      // Smooth interpolation towards target proximity
      this.proximity += (this.targetProximity - this.proximity) * Math.min(1, dt * 2.5);

      // Clamp proximity
      this.proximity = Math.max(0, Math.min(100, this.proximity));

      // Calculate screen X position based on proximity:
      // When proximity is 100% -> T-Rex is at x = -40 (barely sniffing into view)
      // When proximity is 0% -> T-Rex is right at player's back (playerX - 50)
      const minX = -40;
      const maxX = playerX - 52;
      const proximityFactor = 1 - (this.proximity / 100);
      this.x = minX + (maxX - minX) * proximityFactor;

      // Animation cycle
      this.runFrame += (10 + speedMultiplier * 2) * dt;

      // Footstep & screen shake sound
      this.stepTimer += dt;
      if (this.stepTimer >= this.stepInterval / Math.max(1, speedMultiplier * 0.8)) {
        this.stepTimer = 0;
        this.footToggle = !this.footToggle;

        // Sound & shake intensity increases as T-Rex gets closer
        const closeness = 1 - (this.proximity / 100); // 0 far, 1 close
        soundCtrl.playStep(0.2 + closeness * 0.45);

        if (screenShakeCallback) {
          screenShakeCallback(closeness * 7);
        }
      }

      // Jaw snap animation (snaps faster and wider when close)
      this.jawTimer += dt * (2.5 + (1 - this.proximity / 100) * 5);
      if (this.eatingTimer > 0) {
        // Fast chomping
        this.jawOpen = 0.3 + Math.abs(Math.sin(this.jawTimer * 3)) * 0.6;
      } else {
        this.jawOpen = 0.15 + Math.abs(Math.sin(this.jawTimer)) * (0.35 + (1 - this.proximity / 100) * 0.4);
      }

      // Roar behavior
      if (this.roarTimer > 0) {
        this.roarTimer -= dt;
        this.isRoaring = true;
      } else {
        this.isRoaring = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      const legAngle1 = Math.sin(this.runFrame * 0.55) * 0.75;
      const legAngle2 = -legAngle1;
      const bob = Math.abs(Math.sin(this.runFrame * 0.55)) * 6;
      const bodyY = -95 + bob;

      // Huge Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(30, 0, 48, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Back Massive Leg
      this.drawTRexLeg(ctx, 10, -35 + bob, legAngle2, '#2d422a');

      // Tail (Curved and swishing behind)
      this.drawTRexTail(ctx, -25, bodyY + 30, bob);

      // Massive Muscular Torso
      ctx.fillStyle = '#41633d';
      ctx.beginPath();
      ctx.ellipse(25, bodyY + 25, 48, 36, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Belly / Underside (Pale Scales)
      ctx.fillStyle = '#7a9667';
      ctx.beginPath();
      ctx.ellipse(32, bodyY + 38, 36, 18, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Dorsal Scales / Spikes on back
      ctx.fillStyle = '#1e301c';
      for (let i = 0; i < 6; i++) {
        const sx = -10 + i * 12;
        const sy = bodyY - 4 + Math.sin(i) * 6;
        ctx.beginPath();
        ctx.moveTo(sx - 4, sy);
        ctx.lineTo(sx, sy - 9);
        ctx.lineTo(sx + 4, sy);
        ctx.closePath();
        ctx.fill();
      }

      // Front Massive Leg
      this.drawTRexLeg(ctx, 35, -35 + bob, legAngle1, '#4f754a');

      // Tiny predator arm
      ctx.fillStyle = '#395435';
      ctx.beginPath();
      ctx.ellipse(60, bodyY + 32, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Claws
      ctx.fillStyle = '#111';
      ctx.fillRect(68, bodyY + 34, 3, 2);
      ctx.fillRect(66, bodyY + 37, 3, 2);

      // Massive T-Rex Head with animated snapping jaws
      this.drawTRexHead(ctx, 70, bodyY - 10, this.jawOpen);

      ctx.restore();
    }

    drawTRexTail(ctx, tx, ty, bob) {
      ctx.save();
      ctx.translate(tx, ty);
      const tailWiggle = Math.sin(this.runFrame * 0.4) * 0.12;
      ctx.rotate(tailWiggle);

      ctx.fillStyle = '#385534';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.quadraticCurveTo(-60, -25, -110, -5 + bob * 0.5);
      ctx.quadraticCurveTo(-50, 10, 0, 12);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawTRexLeg(ctx, lx, ly, angle, color) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);

      // Powerful thigh
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 26, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Calf / Shin
      ctx.fillRect(-6, 12, 12, 28);

      // Foot with 3 vicious talons
      ctx.fillStyle = '#1e301c';
      ctx.fillRect(-10, 36, 32, 10);

      // Sharp Talons
      ctx.fillStyle = '#0f170e';
      ctx.beginPath();
      ctx.moveTo(22, 38);
      ctx.lineTo(28, 46);
      ctx.lineTo(18, 46);
      ctx.fill();

      ctx.restore();
    }

    drawTRexHead(ctx, hx, hy, jawSpread) {
      ctx.save();
      ctx.translate(hx, hy);

      // Powerful Neck
      ctx.fillStyle = '#41633d';
      ctx.beginPath();
      ctx.moveTo(-15, 30);
      ctx.lineTo(10, -15);
      ctx.lineTo(30, 20);
      ctx.closePath();
      ctx.fill();

      // Upper Skull & Snout
      ctx.fillStyle = '#4f754a';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(55, -15); // snout tip
      ctx.lineTo(60, 4);   // front teeth line
      ctx.lineTo(10, 8);
      ctx.lineTo(-5, 15);
      ctx.closePath();
      ctx.fill();

      // Nostril
      ctx.fillStyle = '#1a2919';
      ctx.beginPath();
      ctx.arc(48, -7, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Amber Eye with reptilian slit
      ctx.fillStyle = '#ff9900';
      ctx.beginPath();
      ctx.arc(15, -4, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#110500';
      ctx.fillRect(14, -7, 2, 7); // Slit pupil

      // Eye ridge / menacing brow
      ctx.fillStyle = '#263b24';
      ctx.fillRect(8, -11, 15, 4);

      // Upper Razor Teeth
      ctx.fillStyle = '#fff7e0';
      for (let t = 0; t < 5; t++) {
        const tx = 18 + t * 8;
        ctx.beginPath();
        ctx.moveTo(tx, 7);
        ctx.lineTo(tx + 3, 15);
        ctx.lineTo(tx + 6, 7);
        ctx.closePath();
        ctx.fill();
      }

      // Lower Jaw (Rotates open based on jawSpread)
      ctx.save();
      ctx.translate(10, 8);
      ctx.rotate(jawSpread * 0.45);

      ctx.fillStyle = '#3e5c3a';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(46, -2);
      ctx.lineTo(44, 10);
      ctx.lineTo(-5, 8);
      ctx.closePath();
      ctx.fill();

      // Lower Teeth
      ctx.fillStyle = '#fff7e0';
      for (let t = 0; t < 4; t++) {
        const tx = 8 + t * 9;
        ctx.beginPath();
        ctx.moveTo(tx, -1);
        ctx.lineTo(tx + 3, -8);
        ctx.lineTo(tx + 6, -1);
        ctx.closePath();
        ctx.fill();
      }

      // Pinkish Tongue / Gullet inside
      ctx.fillStyle = '#9e3535';
      ctx.fillRect(2, -1, 24, 4);

      ctx.restore();

      ctx.restore();
    }
  }

  // --- THROWN MEAT DISTRACTION ENTITY ---
  class ThrownMeat {
    constructor(startX, startY, groundY) {
      this.x = startX;
      this.y = startY;
      this.vx = -6.5; // Flies backwards towards T-Rex!
      this.vy = -5.0;
      this.groundY = groundY;
      this.rotation = 0;
      this.active = true;
    }

    update(dt) {
      this.vy += 18 * dt; // gravity
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.rotation += 8 * dt;

      if (this.y >= this.groundY - 10) {
        this.y = this.groundY - 10;
        this.vx *= 0.5;
        this.vy = 0;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // Bone
      ctx.fillStyle = '#f0ede1';
      ctx.fillRect(-16, -3, 32, 6);
      ctx.beginPath();
      ctx.arc(-16, -4, 4, 0, Math.PI * 2);
      ctx.arc(-16, 4, 4, 0, Math.PI * 2);
      ctx.arc(16, -4, 4, 0, Math.PI * 2);
      ctx.arc(16, 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Juicy Meat Around Middle
      ctx.fillStyle = '#b82834';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // --- OBSTACLES & COLLECTIBLES MANAGERS ---
  class ObstacleManager {
    constructor(groundY) {
      this.groundY = groundY;
      this.items = []; // Obstacles and collectibles
      this.spawnTimer = 2.0;
      this.minInterval = 1.2;
      this.maxInterval = 2.6;
    }

    reset() {
      this.items = [];
      this.spawnTimer = 2.0;
    }

    update(dt, speed, gameMeters, particles, player) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnRandom(gameMeters);
        // Interval decreases as speed and meters increase
        const meterFactor = Math.min(1, gameMeters / 1500);
        const interval = (this.maxInterval - meterFactor * 0.9) * (0.85 + Math.random() * 0.4);
        this.spawnTimer = Math.max(this.minInterval, interval);
      }

      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        item.x -= speed * dt * 60;

        // Custom update (e.g. flying pterodactyl animation)
        if (item.update) {
          item.update(dt);
        }

        // Cleanup if far off screen left
        if (item.x < -100) {
          this.items.splice(i, 1);
        }
      }
    }

    spawnRandom(meters) {
      const roll = Math.random();
      const spawnX = 1020;

      // Collectibles chance: 28%
      if (roll < 0.18) {
        // Meat drop
        this.items.push(new Collectible(spawnX, this.groundY - 55, 'meat'));
      } else if (roll < 0.28) {
        // Amber Gem drop
        this.items.push(new Collectible(spawnX, this.groundY - (Math.random() > 0.5 ? 40 : 100), 'gem'));
      } else if (roll < 0.52) {
        // Boulder / Rocks (Jump over)
        this.items.push(new RockObstacle(spawnX, this.groundY));
      } else if (roll < 0.76) {
        // Mud Puddle (Slows player down dramatically!)
        this.items.push(new MudObstacle(spawnX, this.groundY));
      } else {
        // Pterodactyl flying at neck/head height (Must duck/slide!)
        // Appears more after 100m
        const flyY = this.groundY - 56;
        this.items.push(new PterodactylObstacle(spawnX, flyY));
      }
    }

    draw(ctx) {
      for (const item of this.items) {
        item.draw(ctx);
      }
    }
  }

  // --- OBSTACLE TYPES ---
  class RockObstacle {
    constructor(x, groundY) {
      this.type = 'rock';
      this.x = x;
      this.groundY = groundY;
      this.width = 38;
      this.height = 36;
      this.variant = Math.floor(Math.random() * 2);
    }

    getHitbox() {
      return {
        x: this.x + 4,
        y: this.groundY - this.height + 4,
        width: this.width - 8,
        height: this.height - 4
      };
    }

    draw(ctx) {
      ctx.save();
      const y = this.groundY;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.x + 19, y, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Prehistoric Boulder
      ctx.fillStyle = '#615243';
      ctx.beginPath();
      ctx.moveTo(this.x, y);
      ctx.lineTo(this.x + 6, y - 28);
      ctx.lineTo(this.x + 22, y - 36);
      ctx.lineTo(this.x + 36, y - 24);
      ctx.lineTo(this.x + 38, y);
      ctx.closePath();
      ctx.fill();

      // Rock Highlights & Cracks
      ctx.fillStyle = '#82705e';
      ctx.beginPath();
      ctx.moveTo(this.x + 6, y - 28);
      ctx.lineTo(this.x + 22, y - 36);
      ctx.lineTo(this.x + 18, y - 18);
      ctx.closePath();
      ctx.fill();

      // Jungle Moss on top
      ctx.fillStyle = '#557832';
      ctx.fillRect(this.x + 12, y - 36, 12, 3);

      ctx.restore();
    }
  }

  class MudObstacle {
    constructor(x, groundY) {
      this.type = 'mud';
      this.x = x;
      this.groundY = groundY;
      this.width = 64;
      this.height = 10;
    }

    getHitbox() {
      return {
        x: this.x + 6,
        y: this.groundY - 6,
        width: this.width - 12,
        height: 12
      };
    }

    draw(ctx) {
      ctx.save();
      const y = this.groundY;

      // Dark sticky mud puddle
      ctx.fillStyle = '#1c130d';
      ctx.beginPath();
      ctx.ellipse(this.x + 32, y + 2, 32, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mud bubbles
      ctx.fillStyle = '#38261a';
      ctx.beginPath();
      ctx.arc(this.x + 20, y - 1, 3, 0, Math.PI * 2);
      ctx.arc(this.x + 42, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  class PterodactylObstacle {
    constructor(x, y) {
      this.type = 'pterodactyl';
      this.x = x;
      this.baseY = y;
      this.y = y;
      this.width = 50;
      this.height = 28;
      this.wingAnim = 0;
    }

    update(dt) {
      this.wingAnim += 9 * dt;
      // Bob around a fixed altitude so flight is independent from frame rate.
      this.y = this.baseY + Math.sin(this.wingAnim * 0.5) * 6;
    }

    getHitbox() {
      // Must duck underneath! Hitbox stays around mid-height
      return {
        x: this.x - 14,
        y: this.y - 10,
        width: 38,
        height: 20
      };
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      const wingY = Math.sin(this.wingAnim) * 14;

      // Beak & Head pointing forward (left)
      ctx.fillStyle = '#c75b28';
      ctx.beginPath();
      ctx.moveTo(-18, 0); // long beak tip
      ctx.lineTo(2, -4);
      ctx.lineTo(6, -10); // crest
      ctx.lineTo(0, -2);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffee33';
      ctx.beginPath();
      ctx.arc(0, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#8f3e1a';
      ctx.beginPath();
      ctx.ellipse(8, 2, 14, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Wings (flapping up & down)
      ctx.fillStyle = '#aa4c20';
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(14, wingY - 14);
      ctx.lineTo(26, wingY - 6);
      ctx.lineTo(18, 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // --- COLLECTIBLES (Meat & Amber Gems) ---
  class Collectible {
    constructor(x, y, type) {
      this.x = x;
      this.baseY = y;
      this.y = y;
      this.type = type; // 'meat' or 'gem'
      this.width = 28;
      this.height = 28;
      this.anim = Math.random() * 10;
      this.collected = false;
    }

    update(dt) {
      this.anim += 4 * dt;
      this.y = this.baseY + Math.sin(this.anim) * 6;
    }

    getHitbox() {
      return {
        x: this.x - 4,
        y: this.y - 4,
        width: this.width + 8,
        height: this.height + 8
      };
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x + 14, this.y + 14);

      if (this.type === 'meat') {
        // Juicy Drumstick with glowing halo
        ctx.fillStyle = 'rgba(255, 170, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Bone
        ctx.fillStyle = '#fffdf0';
        ctx.fillRect(-10, -2, 20, 4);
        ctx.beginPath();
        ctx.arc(-10, -3, 3, 0, Math.PI * 2);
        ctx.arc(-10, 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Meat chunk
        ctx.fillStyle = '#d93848';
        ctx.beginPath();
        ctx.ellipse(3, 0, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'gem') {
        // Amber Fossil Gem (Golden Diamond)
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 11);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();

        // Fossil inclusion inside
        ctx.fillStyle = '#543000';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- MAIN GAME CONTROLLER ---
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.groundY = 440;
      this.width = 960;
      this.height = 540;

      // Audio & Background
      this.sound = new SoundController();
      this.bg = new ParallaxBackground(this.width, this.height, this.groundY);
      this.particles = new ParticleSystem();

      // Entities
      this.player = new Player(this.groundY);
      this.tRex = new TRex(this.groundY);
      this.obstacles = new ObstacleManager(this.groundY);
      this.thrownMeats = [];

      // Game States
      this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
      this.meters = 0;
      this.distanceRemainder = 0;
      this.highScore = parseInt(localStorage.getItem('trex_escape_highscore') || '0', 10);
      this.speed = 6.2; // Base scroll speed
      this.baseSpeed = 6.2;
      this.meatThrownCount = 0;
      this.gemsCollectedCount = 0;

      // Screen Shake
      this.screenShake = 0;
      this.gestureGuideTimer = null;

      // UI Element Bindings
      this.initDOMElements();
      this.initEvents();
      this.updateHUD();

      // Game loop timing
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    initDOMElements() {
      this.dom = {
        meterCounter: document.getElementById('meter-counter'),
        highScoreCounter: document.getElementById('highscore-counter'),
        speedIndicator: document.getElementById('speed-indicator'),
        meatIcons: document.getElementById('meat-icons'),
        proximityStatus: document.getElementById('proximity-status'),
        rexIcon: document.getElementById('proximity-indicator-rex'),
        dangerVignette: document.getElementById('danger-vignette'),

        startScreen: document.getElementById('start-screen'),
        pauseScreen: document.getElementById('pause-screen'),
        gameOverScreen: document.getElementById('gameover-screen'),

        startBtn: document.getElementById('start-btn'),
        restartBtn: document.getElementById('restart-btn'),
        resumeBtn: document.getElementById('resume-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        audioToggleBtn: document.getElementById('audio-toggle-btn'),

        finalMeters: document.getElementById('final-meters'),
        finalHighScore: document.getElementById('final-highscore'),
        newRecordBanner: document.getElementById('new-record-banner'),
        statsMeat: document.getElementById('stats-meat'),
        statsGems: document.getElementById('stats-gems'),
        deathReasonBadge: document.getElementById('death-reason-badge'),

        touchMeatBtn: document.getElementById('touch-meat-btn'),
        touchMeatCount: document.getElementById('touch-meat-count'),
        gestureGuide: document.getElementById('gesture-guide')
      };

      this.dom.highScoreCounter.innerHTML = `${this.highScore} <small>m</small>`;
    }

    initEvents() {
      // Keyboard input
      window.addEventListener('keydown', (e) => {
        if (e.repeat) return;

        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          this.handleJumpPress();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          this.handleSlidePress();
        } else if (e.code === 'KeyX' || e.code === 'KeyE') {
          e.preventDefault();
          this.throwMeat();
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          e.preventDefault();
          this.togglePause();
        } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
          e.preventDefault();
          // Permetti ad Invio di iniziare/riavviare solo dalle schermate di Start o Game Over
          if (this.state === 'START' || this.state === 'GAMEOVER') {
            this.startGame();
          }
        }
      });

      // Rimuovi sempre il focus dai bottoni cliccati per evitare attivazioni accidentali con tastiera
      window.addEventListener('click', () => {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          this.handleJumpRelease();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          this.handleSlideRelease();
        }
      });

      // Avoid held actions getting stuck when Android interrupts or backgrounds the WebView.
      window.addEventListener('blur', () => this.releaseHeldControls());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.releaseHeldControls();
      });

      // UI Button Clicks
      this.dom.startBtn.addEventListener('click', (e) => {
        if (e.target && e.target.blur) e.target.blur();
        this.startGame();
      });
      this.dom.restartBtn.addEventListener('click', (e) => {
        if (e.target && e.target.blur) e.target.blur();
        this.startGame();
      });
      this.dom.resumeBtn.addEventListener('click', (e) => {
        if (e.target && e.target.blur) e.target.blur();
        this.togglePause();
      });
      this.dom.pauseBtn.addEventListener('click', (e) => {
        if (e.target && e.target.blur) e.target.blur();
        this.togglePause();
      });

      this.dom.audioToggleBtn.addEventListener('click', (e) => {
        if (e.target && e.target.blur) e.target.blur();
        this.sound.init();
        const isMuted = this.sound.toggleMute();
        this.dom.audioToggleBtn.textContent = isMuted ? '🔇' : '🔊';
      });

      // Unified pointer input supports touch, mouse and simultaneous fingers.
      const bindButtonPress = (btn, onPress, onRelease) => {
        let activePointerId = null;

        const release = (e) => {
          if (activePointerId === null || e.pointerId !== activePointerId) return;
          e.preventDefault();
          activePointerId = null;
          btn.classList.remove('is-pressed');
          if (onRelease) onRelease();
        };

        const cancel = () => {
          if (activePointerId === null) return;
          activePointerId = null;
          btn.classList.remove('is-pressed');
          if (onRelease) onRelease();
        };

        btn.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          e.preventDefault();
          if (activePointerId !== null) return;

          activePointerId = e.pointerId;
          btn.classList.add('is-pressed');
          if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
          onPress();
        });
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointercancel', release);
        btn.addEventListener('lostpointercapture', release);
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
        window.addEventListener('blur', cancel);
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) cancel();
        });
      };

      bindButtonPress(this.dom.touchMeatBtn, () => this.throwMeat());

      // Click on HUD meat panel to throw
      const meatPanel = document.getElementById('meat-panel');
      if (meatPanel) {
        meatPanel.addEventListener('click', () => this.throwMeat());
      }

      // Vertical swipe controls: swipe up to jump, swipe down to slide/crouch.
      let activeSwipe = null;

      const cancelSwipe = () => {
        if (!activeSwipe) return;
        if (activeSwipe.action === 'jump') this.handleJumpRelease();
        if (activeSwipe.action === 'slide') this.handleSlideRelease();
        activeSwipe = null;
      };

      this.canvas.addEventListener('pointerdown', (e) => {
        if (this.state === 'START' || this.state === 'GAMEOVER') {
          this.startGame();
          return;
        }

        if (this.state !== 'PLAYING' || e.pointerType === 'mouse' || activeSwipe) return;

        e.preventDefault();
        activeSwipe = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          action: null
        };
        if (this.canvas.setPointerCapture) this.canvas.setPointerCapture(e.pointerId);
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (!activeSwipe || e.pointerId !== activeSwipe.pointerId || activeSwipe.action) return;

        e.preventDefault();
        const deltaX = e.clientX - activeSwipe.startX;
        const deltaY = e.clientY - activeSwipe.startY;
        const threshold = Math.max(36, Math.min(64, this.canvas.clientHeight * 0.09));

        if (Math.abs(deltaY) < threshold || Math.abs(deltaY) <= Math.abs(deltaX) * 1.15) return;

        if (deltaY < 0) {
          activeSwipe.action = 'jump';
          this.handleJumpPress();
        } else {
          activeSwipe.action = 'slide';
          this.handleSlidePress();
        }
        this.hideGestureGuide();
      });

      const finishSwipe = (e) => {
        if (!activeSwipe || e.pointerId !== activeSwipe.pointerId) return;
        e.preventDefault();
        cancelSwipe();
      };

      this.canvas.addEventListener('pointerup', finishSwipe);
      this.canvas.addEventListener('pointercancel', finishSwipe);
      this.canvas.addEventListener('lostpointercapture', finishSwipe);
      window.addEventListener('blur', cancelSwipe);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelSwipe();
      });
    }

    handleJumpPress() {
      this.sound.init();
      if (this.state === 'START' || this.state === 'GAMEOVER') {
        this.startGame();
        return;
      }
      if (this.state === 'PLAYING') {
        this.player.isJumpKeyHeld = true;
        if (this.player.jump()) {
          this.pulseHaptic(12);
          this.sound.playJump();
          this.particles.spawnDust(this.player.x, this.player.y, 4);
        }
      }
    }

    handleJumpRelease() {
      this.player.isJumpKeyHeld = false;
    }

    handleSlidePress() {
      this.sound.init();
      if (this.state === 'PLAYING') {
        this.player.isSlideKeyHeld = true;
        if (this.player.slide()) {
          this.pulseHaptic(10);
          this.sound.playSlide();
        }
      }
    }

    handleSlideRelease() {
      this.player.isSlideKeyHeld = false;
    }

    releaseHeldControls() {
      this.handleJumpRelease();
      this.handleSlideRelease();
      document.querySelectorAll('.touch-btn.is-pressed').forEach((btn) => {
        btn.classList.remove('is-pressed');
      });
    }

    pulseHaptic(duration = 10) {
      if (navigator.vibrate) navigator.vibrate(duration);
    }

    showGestureGuide() {
      const touchLayout = document.documentElement.classList.contains('native-mobile') ||
        window.matchMedia('(pointer: coarse), (max-width: 820px)').matches;
      if (!this.dom.gestureGuide || !touchLayout) return;
      window.clearTimeout(this.gestureGuideTimer);
      this.dom.gestureGuide.classList.add('visible');
      this.gestureGuideTimer = window.setTimeout(() => this.hideGestureGuide(), 4500);
    }

    hideGestureGuide() {
      window.clearTimeout(this.gestureGuideTimer);
      this.gestureGuideTimer = null;
      if (this.dom.gestureGuide) this.dom.gestureGuide.classList.remove('visible');
    }

    throwMeat() {
      this.sound.init();
      if (this.state !== 'PLAYING') return;

      if (this.player.meatAmmo > 0) {
        this.player.meatAmmo--;
        this.meatThrownCount++;
        this.pulseHaptic(18);
        this.sound.playMeatToss();

        // Spawn thrown meat moving towards the T-Rex
        this.thrownMeats.push(
          new ThrownMeat(this.player.x - 10, this.player.y - 30, this.groundY)
        );

        this.updateHUD();
      }
    }

    startGame() {
      // Se la partita è già in corso, non resettare!
      if (this.state === 'PLAYING') return;

      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }

      this.sound.init();
      this.sound.playRoar();

      this.state = 'PLAYING';
      this.meters = 0;
      this.distanceRemainder = 0;
      this.speed = this.baseSpeed;
      this.meatThrownCount = 0;
      this.gemsCollectedCount = 0;
      this.screenShake = 0;

      this.player.reset();
      this.tRex.reset();
      this.obstacles.reset();
      this.thrownMeats = [];
      this.particles.clear();

      this.dom.startScreen.classList.remove('active');
      this.dom.gameOverScreen.classList.remove('active');
      this.dom.pauseScreen.classList.remove('active');

      this.updateHUD();
      this.showGestureGuide();
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.dom.pauseScreen.classList.add('active');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.dom.pauseScreen.classList.remove('active');
      }
    }

    gameOver(reason = 'CATTURATO DAL T-REX!') {
      this.state = 'GAMEOVER';
      this.sound.playGameOver();

      const isNewRecord = this.meters > this.highScore;
      if (isNewRecord) {
        this.highScore = this.meters;
        localStorage.setItem('trex_escape_highscore', this.highScore.toString());
      }

      this.dom.deathReasonBadge.textContent = reason;
      this.dom.finalMeters.textContent = `${this.meters} m`;
      this.dom.finalHighScore.textContent = `${this.highScore} m`;
      this.dom.statsMeat.textContent = this.meatThrownCount.toString();
      this.dom.statsGems.textContent = this.gemsCollectedCount.toString();

      if (isNewRecord && this.meters > 0) {
        this.dom.newRecordBanner.classList.remove('hidden');
      } else {
        this.dom.newRecordBanner.classList.add('hidden');
      }

      this.dom.dangerVignette.className = '';
      this.dom.gameOverScreen.classList.add('active');
      this.updateHUD();
    }

    checkCollisions() {
      const playerHitbox = this.player.getHitbox();

      // 1. Check collisions with Obstacles and Collectibles
      for (let i = this.obstacles.items.length - 1; i >= 0; i--) {
        const item = this.obstacles.items[i];
        const itemBox = item.getHitbox();

        if (this.rectsIntersect(playerHitbox, itemBox)) {
          if (item.type === 'meat') {
            // Collect meat ammo
            if (this.player.meatAmmo < this.player.maxMeat) {
              this.player.meatAmmo++;
              this.sound.playGem();
              this.particles.spawnGemSparkles(item.x + 14, item.y + 14);
              this.obstacles.items.splice(i, 1);
              this.updateHUD();
            }
          } else if (item.type === 'gem') {
            // Collect Amber (+50m boost)
            this.meters += 50;
            this.gemsCollectedCount++;
            this.sound.playGem();
            this.particles.spawnGemSparkles(item.x + 14, item.y + 14);
            this.obstacles.items.splice(i, 1);
            this.updateHUD();
          } else if (item.type === 'mud') {
            // Step in mud puddle -> Player is slowed, T-Rex surges forward!
            if (!this.player.isSlowed) {
              this.player.applySlow(1.2);
              this.tRex.advance(16); // T-Rex closes the distance quickly!
              this.sound.playHit();
              this.particles.spawnDust(this.player.x, this.groundY, 6, 'rgba(45, 30, 20, 0.8)');
            }
          } else if (item.type === 'rock' || item.type === 'pterodactyl') {
            // Hard Obstacle Hit: Stumble & Push closer to T-Rex!
            if (this.player.stumbleTimer <= 0) {
              this.player.stumble();
              this.tRex.advance(22); // Danger! T-Rex gains big ground
              this.sound.playHit();
              this.screenShake = 6;
              this.particles.spawnDust(this.player.x, this.player.y, 8);
            }
          }
        }
      }

      // 2. Check Thrown Meat vs T-Rex
      for (let i = this.thrownMeats.length - 1; i >= 0; i--) {
        const meat = this.thrownMeats[i];
        // If meat reaches the T-Rex mouth / head position
        if (meat.x <= this.tRex.x + 100 && meat.x >= this.tRex.x) {
          this.sound.playChomp();
          this.particles.spawnMeatBites(meat.x, meat.y);
          this.tRex.pushBack(28); // T-Rex stops to chomp and falls back!
          this.thrownMeats.splice(i, 1);
          this.updateHUD();
        } else if (meat.x < this.tRex.x - 30) {
          this.thrownMeats.splice(i, 1);
        }
      }

      // 3. Check T-Rex catching Player
      // T-Rex jaw reach
      if (this.tRex.proximity <= 2 || this.tRex.x + 85 >= playerHitbox.x) {
        this.gameOver('IL T-REX TI HA DIVORATO!');
      }
    }

    rectsIntersect(r1, r2) {
      return (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
      );
    }

    update(dt) {
      if (this.state !== 'PLAYING') return;

      // Speed progression as distance increases
      const speedMultiplier = 1 + Math.min(2.5, this.meters / 800);
      const currentSpeed = this.speed * speedMultiplier;
      const effectiveSpeed = this.player.isSlowed ? currentSpeed * 0.5 : currentSpeed;

      // Preserve sub-meter progress so the score is independent from refresh rate.
      this.distanceRemainder += effectiveSpeed * dt * 4.5;
      const completedMeters = Math.floor(this.distanceRemainder);
      if (completedMeters > 0) {
        this.meters += completedMeters;
        this.distanceRemainder -= completedMeters;
      }

      // Background scroll
      this.bg.update(effectiveSpeed, dt);

      // Player & T-Rex updates
      this.player.update(dt, speedMultiplier, this.particles, this.sound);
      this.tRex.update(dt, this.player.x, speedMultiplier, this.sound, (intensity) => {
        this.screenShake = Math.max(this.screenShake, intensity);
      });

      // Thrown meats
      for (let i = this.thrownMeats.length - 1; i >= 0; i--) {
        const meat = this.thrownMeats[i];
        meat.update(dt);
      }

      // Obstacles
      this.obstacles.update(dt, effectiveSpeed, this.meters, this.particles, this.player);

      // Particles
      this.particles.update(dt);

      // Check all collisions
      this.checkCollisions();

      // Screen shake decay
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - 14 * dt);
      }

      // Sound dynamic heartbeat
      this.sound.updateHeartbeat(this.tRex.proximity, performance.now());

      // Update HUD values
      this.updateHUD();
    }

    updateHUD() {
      this.dom.meterCounter.innerHTML = `${this.meters} <small>m</small>`;
      this.dom.highScoreCounter.innerHTML = `${this.highScore} <small>m</small>`;

      const progressionMultiplier = 1 + Math.min(2.5, this.meters / 800);
      const speedMult = (this.player.isSlowed ? progressionMultiplier * 0.5 : progressionMultiplier).toFixed(1);
      this.dom.speedIndicator.textContent = `${speedMult}x`;

      // Distraction ammo icons
      const slots = this.dom.meatIcons.querySelectorAll('.meat-slot');
      slots.forEach((slot, idx) => {
        if (idx < this.player.meatAmmo) {
          slot.className = 'meat-slot active';
        } else {
          slot.className = 'meat-slot empty';
        }
      });
      this.dom.touchMeatCount.textContent = this.player.meatAmmo.toString();

      // Proximity Tracker
      const prox = Math.round(this.tRex.proximity);
      // Rex position on mini bar: 0% = next to player (right), 100% = far left (0%)
      const rexBarPos = (100 - prox) * 0.88;
      this.dom.rexIcon.style.left = `${rexBarPos}%`;

      if (prox < 25) {
        this.dom.proximityStatus.textContent = 'PERICOLO CRITICO! MORSO IMMINENTE!';
        this.dom.proximityStatus.className = 'status-danger';
        this.dom.dangerVignette.className = 'danger-high';
      } else if (prox < 45) {
        this.dom.proximityStatus.textContent = 'ATTENZIONE: T-REX ALLE CALCAGNA';
        this.dom.proximityStatus.className = 'status-danger';
        this.dom.dangerVignette.className = 'danger-medium';
      } else {
        this.dom.proximityStatus.textContent = 'DISTANZA DI SICUREZZA';
        this.dom.proximityStatus.className = '';
        this.dom.dangerVignette.className = '';
      }
    }

    draw() {
      this.ctx.save();

      // Apply screen shake
      if (this.screenShake > 0) {
        const sx = (Math.random() * 2 - 1) * this.screenShake;
        const sy = (Math.random() * 2 - 1) * this.screenShake;
        this.ctx.translate(sx, sy);
      }

      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Parallax World
      this.bg.draw(this.ctx);

      // 2. Obstacles & Collectibles
      this.obstacles.draw(this.ctx);

      // 3. Thrown Meats
      for (const meat of this.thrownMeats) {
        meat.draw(this.ctx);
      }

      // 4. Particles (Footstep dust, debris)
      this.particles.draw(this.ctx);

      // 5. T-Rex
      this.tRex.draw(this.ctx);

      // 6. Player
      this.player.draw(this.ctx, this.tRex.proximity);

      this.ctx.restore();
    }

    loop(currentTime) {
      let dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Cap delta time to prevent physics explosions on background tab
      if (dt > 0.1) dt = 0.1;

      this.update(dt);
      this.draw();

      requestAnimationFrame((t) => this.loop(t));
    }
  }

  // Launch game once DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
  });
})();

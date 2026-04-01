let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
	if (!ctx) ctx = new AudioContext();
	return ctx;
}

function playNote(
	ac: AudioContext,
	freq: number,
	startTime: number,
	duration: number,
	gain: number,
	type: OscillatorType = 'sine'
) {
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.connect(g);
	g.connect(ac.destination);
	osc.type = type;
	osc.frequency.setValueAtTime(freq, startTime);
	g.gain.setValueAtTime(0, startTime);
	g.gain.linearRampToValueAtTime(gain, startTime + 0.02);
	g.gain.setValueAtTime(gain, startTime + duration - 0.04);
	g.gain.linearRampToValueAtTime(0, startTime + duration);
	osc.start(startTime);
	osc.stop(startTime + duration);
}

function playBrass(ac: AudioContext, freq: number, start: number, duration: number, vol: number) {
	// Two slightly detuned sawtooth oscillators → lowpass filter → gain
	// Simulates a bright brass/trumpet timbre
	const compressor = ac.createDynamicsCompressor();
	compressor.connect(ac.destination);

	[1, 1.008].forEach((detune) => {
		const osc = ac.createOscillator();
		const filter = ac.createBiquadFilter();
		const g = ac.createGain();

		osc.type = 'sawtooth';
		osc.frequency.value = freq * detune;

		// Filter sweep: closed attack → bright sustain → warm release
		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(300, start);
		filter.frequency.exponentialRampToValueAtTime(4000, start + 0.04);
		filter.frequency.exponentialRampToValueAtTime(1800, start + duration * 0.5);
		filter.frequency.exponentialRampToValueAtTime(800, start + duration);
		filter.Q.value = 1.5;

		osc.connect(filter);
		filter.connect(g);
		g.connect(compressor);

		g.gain.setValueAtTime(0, start);
		g.gain.linearRampToValueAtTime(vol, start + 0.03);
		g.gain.setValueAtTime(vol, start + duration - 0.12);
		g.gain.exponentialRampToValueAtTime(0.0001, start + duration);

		osc.start(start);
		osc.stop(start + duration + 0.05);
	});

	// Sub bass reinforcement
	const bass = ac.createOscillator();
	const bassGain = ac.createGain();
	bass.type = 'sine';
	bass.frequency.value = freq / 2;
	bass.connect(bassGain);
	bassGain.connect(compressor);
	bassGain.gain.setValueAtTime(0, start);
	bassGain.gain.linearRampToValueAtTime(vol * 0.3, start + 0.05);
	bassGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
	bass.start(start);
	bass.stop(start + duration + 0.05);
}

function playPercussion(ac: AudioContext, start: number) {
	// Noise burst for a snare/impact hit
	const bufLen = Math.floor(ac.sampleRate * 0.18);
	const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

	const src = ac.createBufferSource();
	src.buffer = buf;

	const hp = ac.createBiquadFilter();
	hp.type = 'highpass';
	hp.frequency.value = 2000;

	const g = ac.createGain();
	g.gain.setValueAtTime(0.35, start);
	g.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

	src.connect(hp);
	hp.connect(g);
	g.connect(ac.destination);
	src.start(start);
	src.stop(start + 0.2);

	// Low thud
	const kick = ac.createOscillator();
	const kg = ac.createGain();
	kick.type = 'sine';
	kick.frequency.setValueAtTime(180, start);
	kick.frequency.exponentialRampToValueAtTime(40, start + 0.12);
	kick.connect(kg);
	kg.connect(ac.destination);
	kg.gain.setValueAtTime(0.5, start);
	kg.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
	kick.start(start);
	kick.stop(start + 0.15);
}

export function playWinnerFanfare() {
	try {
		const ac = getCtx();
		const t = ac.currentTime + 0.05;

		// Percussion hit on beat 1
		playPercussion(ac, t);

		// Fast ascending arpeggio: G4 → C5 → E5 → G5
		const arp: [number, number][] = [
			[392, t + 0.0],
			[523, t + 0.1],
			[659, t + 0.2],
			[784, t + 0.3],
		];
		arp.forEach(([freq, when]) => playBrass(ac, freq, when, 0.25, 0.13));

		// Fanfare melody: G5, E5, C5, G5 — then long C6
		const melody: [number, number, number][] = [
			[784,  t + 0.55, 0.22],
			[659,  t + 0.78, 0.22],
			[523,  t + 1.00, 0.22],
			[784,  t + 1.25, 0.30],
			[1047, t + 1.58, 1.10],
		];
		melody.forEach(([freq, when, dur]) => playBrass(ac, freq, when, dur, 0.16));

		// Second percussion hit at the final note
		playPercussion(ac, t + 1.55);

		// Final chord: C5 + E5 + G5 + C6 together under the long note
		[523, 659, 784].forEach((freq) => playBrass(ac, freq, t + 1.58, 1.0, 0.07));

	} catch {
		// silent
	}
}

export function playCorrect() {
	try {
		const ac = getCtx();
		const t = ac.currentTime;
		// Zwei aufsteigende Töne — kurzes "Ding-Ding"
		playNote(ac, 523, t,        0.12, 0.18, 'sine');
		playNote(ac, 784, t + 0.1,  0.18, 0.18, 'sine');
	} catch { /* silent */ }
}

export function playWrong() {
	try {
		const ac = getCtx();
		const t = ac.currentTime;
		// Absteigendes Buzzer-Geräusch
		const osc = ac.createOscillator();
		const gain = ac.createGain();
		osc.connect(gain);
		gain.connect(ac.destination);
		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(220, t);
		osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
		gain.gain.setValueAtTime(0.15, t);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
		osc.start(t);
		osc.stop(t + 0.28);
	} catch { /* silent */ }
}

export function playClick() {
	try {
		const ac = getCtx();

		// Short pitched tick — fits the game-show theme
		const osc = ac.createOscillator();
		const gain = ac.createGain();

		osc.connect(gain);
		gain.connect(ac.destination);

		osc.type = 'sine';
		osc.frequency.setValueAtTime(720, ac.currentTime);
		osc.frequency.exponentialRampToValueAtTime(420, ac.currentTime + 0.06);

		gain.gain.setValueAtTime(0.13, ac.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08);

		osc.start(ac.currentTime);
		osc.stop(ac.currentTime + 0.08);
	} catch {
		// AudioContext not available (SSR / blocked)
	}
}

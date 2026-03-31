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

export function playWinnerFanfare() {
	try {
		const ac = getCtx();
		const t = ac.currentTime + 0.05;

		// Aufsteigende Arpeggio-Fanfare: C4 → E4 → G4 → C5 → E5
		const arpNotes = [262, 330, 392, 523, 659];
		arpNotes.forEach((freq, i) => {
			playNote(ac, freq, t + i * 0.13, 0.22, 0.18, 'triangle');
			// leise Oberton-Harmonie eine Oktave höher
			playNote(ac, freq * 2, t + i * 0.13, 0.18, 0.06, 'sine');
		});

		// Letzter Akkord (C-Dur) — alle Töne zusammen nach dem Arpeggio
		const chordStart = t + arpNotes.length * 0.13 + 0.05;
		[262, 330, 392, 523].forEach((freq) => {
			playNote(ac, freq, chordStart, 0.9, 0.14, 'triangle');
			playNote(ac, freq * 2, chordStart, 0.7, 0.05, 'sine');
		});
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

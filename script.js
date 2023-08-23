// Build samplers
let samplers = {}
let sounds = ['ah','oo','ee'];
const ranges = {
	mouth1: 3,
}
for (let i of Object.keys(ranges)) {
	let subSamplers = {};
	for (let sound of sounds) {
		subSamplers[sound] = new Tone.Sampler({
			urls: {
				C3: `${i}-${sound}.mp3`
			},
			baseUrl: "sounds/",
			volume: -10,
		}).toDestination();
	}
	samplers[i] = subSamplers;
}

let id = 0;
class MouthStep {
	constructor(mouth) {
		this.id = id;
		id++;

		this.mouth = mouth;
		this.tempo = Math.random()*2000+500;
		this.step = 0;
		this.stepRotation = 0;
		this.stepPosition = 0;
		this.rotation = Math.floor(Math.random()*360);
		this.trail = 15;
		this.size = Math.floor(Math.random()*20+5);
		this.overlap = 1;
		this.paused = false;
		this.octave = Math.floor(Math.random()*2+2);
		this.notes = ['C','E','G','A'];
		this.sounds = ['ah','oo','ee'];

		// Build DOM elements
		let grid = document.querySelector('.grid');

		let cell = document.createElement('div');
		cell.classList.add('cell');
		cell.dataset.id = this.id;
		cell.style.setProperty('--size', this.size + "vh");

		let mouthContainer = document.createElement('div');
		mouthContainer.classList.add('mouth-container');
		cell.appendChild(mouthContainer);

		// Controls
		cell.innerHTML += `
			<div class="mouth-controls">
				<div class="mouth-controls-row">
					<div>
						<p>Volume</p>
						<button class="size-down">–</button>
						<button class="size-up">+</button>
					</div>
					<div>
						<p>Tempo</p>
						<button class="tempo-down">–</button>
						<button class="tempo-up">+</button>
					</div>
					<div>
						<p>Octave</p>
						<button class="pitch-down">–</button>
						<button class="pitch-up">+</button>
					</div>
					<div>
						<p>Notes</p>
						<button class="note" data-note="C" data-active="1">C</button>
						<button class="note" data-note="C#">C#</button>
						<button class="note" data-note="D">D</button>
						<button class="note" data-note="D#">D#</button>
						<button class="note" data-note="E" data-active="1">E</button>
						<button class="note" data-note="F">F</button>
						<button class="note" data-note="F#">F#</button>
						<button class="note" data-note="G" data-active="1">G</button>
						<button class="note" data-note="G#">G#</button>
						<button class="note" data-note="A" data-active="1">A</button>
						<button class="note" data-note="A#">A#</button>
						<button class="note" data-note="B">B</button>
					</div>
					<div>
						<p>Sounds</p>
						<button class="sound" data-sound="ah" data-active="1">ah</button>
						<button class="sound" data-sound="oo" data-active="1">oo</button>
						<button class="sound" data-sound="ee" data-active="1">ee</button>
					</div>
					<div>
						<p>Mouth</p>
						<button class="mouth" data-mouth="ah" data-active="1">gab</button>
						<button class="mouth" data-mouth="oo" data-active="1">mad</button>
						<button class="mouth" data-mouth="ee" data-active="1">cap</button>
					</div>
				</div>
			</div>
			<button class="remove">X</button>
		`
		cell.querySelector('.size-down').addEventListener('mousedown', () => {
			this.sizeDown();
			let loop = setInterval(() => {
				this.sizeDown();
			}, 50);
			document.onmouseup = () => { clearInterval(loop); document.onmouseup = null };
		});
		cell.querySelector('.size-up').addEventListener('mousedown', () => {
			this.sizeUp();
			let loop = setInterval(() => {
				this.sizeUp();
			}, 50);
			document.onmouseup = () => { clearInterval(loop); document.onmouseup = null };
		});
		cell.querySelector('.tempo-down').addEventListener('mousedown', () => {
			this.tempoDown();
			let loop = setInterval(() => {
				this.tempoDown();
			}, 200);
			document.onmouseup = () => { clearInterval(loop); document.onmouseup = null };
		});
		cell.querySelector('.tempo-up').addEventListener('mousedown', () => {
			this.tempoUp();
			let loop = setInterval(() => {
				this.tempoUp();
			}, 200);
			document.onmouseup = () => { clearInterval(loop); document.onmouseup = null };
		});
		cell.querySelector('.pitch-down').addEventListener('mousedown', () => {
			this.octaveDown();
			let loop = setInterval(() => {
				this.octaveDown();
			}, 500);
			document.onmouseup = () => { clearInterval(loop); document.onmouseup = null };
		});
		cell.querySelector('.pitch-up').addEventListener('mousedown', () => {
			this.octaveUp();
			let loop = setInterval(() => {
				this.octaveUp();
			}, 500);
			document.onmouseup = () => { clearInterval(loop); document.onmouseup = null };
		});
		cell.querySelector('.remove').addEventListener('click', () => {
			this.deleteSelf();
		});

		// Notes and sounds
		for (let btn of cell.querySelectorAll('.note')) {
			btn.addEventListener('click', () => {
				this.toggleNote(btn.dataset.note);
			})
		}
		for (let btn of cell.querySelectorAll('.sound')) {
			btn.addEventListener('click', () => {
				this.toggleSound(btn.dataset.sound);
			})
		}

		grid.appendChild(cell);
		this.cell = grid.querySelector(`[data-id="${this.id}"]`);
		this.content = cell.querySelector(`.mouth-container`);

		// Start playing
		this.forward();
	}

	// Move forward one step
	forward() {
		this.step++;
		this.cell.style.transition = this.tempo + "ms";
	
		// Create nodes for new step image
		let imgContainer = document.createElement("div");
		imgContainer.classList = "mouth-container-child";
		let img = new Image();
		img.classList = "mouth-container-child-img";
	
		// Add image to the container
		imgContainer.appendChild(img);
	
		// Set initial properties for new step image/container
		imgContainer.style.transform = `translateY(-${this.size}px)`;
		imgContainer.style.zIndex = 9;
		imgContainer.dataset.pos = 0;

		// Generate new mouth/sound
		let sound = sounds[Math.floor(Math.random()*sounds.length)];
		if (this.sounds.length > 0) {
			sound = this.sounds[Math.floor(Math.random()*this.sounds.length)];
		}
		img.src = `mouths/${this.mouth}-${sound}.png`;
		let note = this.notes[Math.floor(Math.random()*this.notes.length)];
		playSound(this.mouth, sound, 1000/this.tempo, note, this.octave, this.size/30);
		this.cell.style.backgroundColor = `hsl(${notes.indexOf(note)*30}deg,100%,50%)`;

		// Set position of new image
		this.stepRotation += Math.round(Math.random()*10-5);
		this.stepPosition += this.stepRotation*2;
		if (this.stepPosition > 30) {
			this.stepRotation -= 10;
			this.stepPosition = 30;
		} else if (this.stepPosition < -30) {
			this.stepRotation += 10;
			this.stepPosition = -30;
		}
		img.style.transform = `rotate(${this.stepRotation}deg) translate(${this.stepPosition}%, -50%)`;
	
		// Add finished node to live div
		this.content.appendChild(imgContainer);
	
		// Animate transform by adding delay
		setTimeout(() => {
			imgContainer.style.transform = `translateY(0)`;
		}, 50)
	
		// Style and position previous steps
		for (let step of this.content.childNodes) {
			let pos = parseInt(step.dataset.pos);
			if (step.dataset.pos >= this.trail) { // Remove oldest
				step.style.transform = `translateY(${this.size*pos*this.overlap}vh)`;
				step.style.opacity = 0;
				setTimeout(() => {
					step.remove();
				}, 500)
			} else if (step != imgContainer && pos > 0) {
				let ratio = pos/this.trail;
				step.style.zIndex = `0`;
				step.style.filter = `brightness(${100-ratio*100}%)`;
				step.style.transform = `translateY(${this.size*pos*this.overlap}vh)`;
				// step.style.opacity = 1 - ratio;
			}
			step.dataset.pos = pos + 1;
		}
	
		this.rotation += Math.floor(Math.random()*6-3);
		this.content.style.transform = `rotate(${this.rotation}deg)`;
		this.content.style.filter = `brightness(${(this.octave-1)/2}) grayscale(100%)`;

		setTimeout(() => {
			if (this.paused == false) {
				this.forward();
			}
		}, this.tempo)
	}

	// Controls
	sizeDown() {
		if (this.size > 2) {
			this.size -= 1;
			this.cell.style.setProperty('--size', this.size + "vh");
		}
		for (let step of this.content.childNodes) {
			step.style.transform = `translateY(${this.size*step.dataset.pos*this.overlap}vh)`;
		}
	}
	sizeUp() {
		if (this.size < 40) {
			this.size += 1;
			this.cell.style.setProperty('--size', this.size + "vh");
		}
		for (let step of this.content.childNodes) {
			step.style.transform = `translateY(${this.size*step.dataset.pos*this.overlap}vh)`;
		}
	}
	tempoDown() {
		if (this.tempo < 2500) {
			this.tempo += 100;
		}
	}
	tempoUp() {
		if (this.tempo > 100) {
			this.tempo -= 100;
		}
	}
	octaveDown() {
		if (this.octave > 2) {
			this.octave -= 1;
		}
	}
	octaveUp() {
		if (this.octave < 4) {
			this.octave += 1;
		}
	}
	pause() {
		this.paused = true;
	}
	play() {
		if (this.paused != false) {
			this.paused = false;
			this.forward();
		}
	}
	deleteSelf() {
		this.paused = true;
		this.cell.remove();
		totalMouths--;
		checkTitle();
	}
	toggleNote(note) {
		let btn = this.cell.querySelector(`[data-note="${note}"]`);
		if (parseInt(btn.dataset.active) == 1) {
			btn.dataset.active = 0;
			this.notes.splice(this.notes.indexOf(note), 1);
		} else {
			btn.dataset.active = 1;
			this.notes.push(note);
		}
	}
	toggleSound(sound) {
		let btn = this.cell.querySelector(`[data-sound="${sound}"]`);
		if (parseInt(btn.dataset.active) == 1) {
			btn.dataset.active = 0;
			this.sounds.splice(this.sounds.indexOf(sound), 1);
		} else {
			btn.dataset.active = 1;
			this.sounds.push(sound);
		}
	}
}

// Play note
let notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function playSound(mouth, sound, duration, note, octave, volume) {
	let actualNote = note+octave || note+Math.floor(Math.random()*2+2) || notes[Math.floor(Math.random()*notes.length)]+octave || notes[Math.floor(Math.random()*notes.length)]+Math.floor(Math.random()*2+2);
	let subSampler = samplers[mouth][sound];
	subSampler.triggerAttackRelease(actualNote, duration, undefined, volume);
}

// Controls
let mouths = {};
let totalMouths = 0;

let maxCount = 9;
if (window.innerWidth < 800) {
	maxCount = 6;
} else {
	maxCount = 9;
}
window.addEventListener('resize', () => {
	if (window.innerWidth < 800) {
		maxCount = 6;
	} else {
		maxCount = 9;
	}
})

let controls = document.querySelector(".controls");

let controlsClear = controls.querySelector("#clear");
clear.addEventListener('click', () => {
	for (let mouth of Object.keys(mouths)) {
		if (mouths[mouth].paused == false) {
			mouths[mouth].deleteSelf();
		}
	}
	checkTitle();
})

let controlsRandomize = controls.querySelector("#randomize");
controlsRandomize.addEventListener('click', () => {
	for (let mouth of Object.keys(mouths)) {
		if (mouths[mouth].paused == false) {
			mouths[mouth].deleteSelf();
		}
	}
	while (totalMouths < Math.floor(Math.random()*(maxCount-1)+1)) {
		mouths[id] = new MouthStep('mouth1');
		totalMouths++;
	}
	checkTitle();
})

let controlsGenerate = controls.querySelector("#generate");
generate.addEventListener('click', () => {
	if (totalMouths < maxCount) {
		mouths[id] = new MouthStep('mouth1');
		totalMouths++;
	}
	checkTitle();
})


// Title animation
let title = document.querySelector('.title');
let temp = "";
let titleDelay = 0;
for (let i of title.innerText) {
	temp += `<span style="animation-delay:${titleDelay}s">${i}</span>`;
	titleDelay -= .2;
}
title.innerHTML = temp;

function checkTitle() {
	if (totalMouths == 0) {
		title.style.display = 'flex';
	} else {
		title.style.display = 'none';
	}
}

// TODO
// make the tempo adjustment clearer so its not so abrupt
// fix the filtering on chains
// make the randomization actually random
// add some other generate buttons for specific presets
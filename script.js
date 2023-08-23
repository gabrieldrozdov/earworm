// Build samplers
let samplers = {}
let sounds = ['ee', 'ay', 'ah', 'oh', 'oo', 's', 'p', 't', 'k'];
let voices = ['gab'];
for (let voice of voices) {
	let subSamplers = {};
	for (let sound of sounds) {
		subSamplers[sound] = new Tone.Sampler({
			urls: {
				C3: `${voice}-${sound}.mp3`
			},
			baseUrl: "assets/sounds/",
			volume: -10,
		}).toDestination();
	}
	samplers[voice] = subSamplers;
}

// Class for cells
let id = 0;
class GridCell {
	constructor(setVoice, setTempo, setVolume, setOctave, setNotes, setSounds) {
		this.id = id;
		id++;

		this.voices = setVoice || ['gab'];
		this.tempo = setTempo || Math.floor(Math.floor(Math.random()*10)*100+250);
		this.step = 0;
		this.stepRotation = 0;
		this.trail = 10;
		this.size = setVolume || Math.floor(Math.random()*20+5);
		this.paused = false;
		this.octave = setOctave || Math.floor(Math.random()*4+1);
		this.notes = setNotes || ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
		this.sounds = setSounds || ['ee', 'ay', 'ah', 'oh', 'oo', 's', 'p', 't', 'k'];

		// Build DOM elements
		let grid = document.querySelector('.grid');

		let cell = document.createElement('div');
		cell.classList.add('cell');
		cell.dataset.id = this.id;
		cell.style.setProperty('--size', this.size + "vh");

		let cellContent = document.createElement('div');
		cellContent.classList.add('cell-content');
		cell.appendChild(cellContent);

		// Controls
		cell.innerHTML += `
			<div class="cell-controls">
				<div>
					<p>volume</p>
					<button class="size-down">–</button>
					<button class="size-up">+</button>
				</div>
				<div>
					<p>tempo</p>
					<button class="tempo-down">–</button>
					<button class="tempo-up">+</button>
				</div>
				<div>
					<p>octave</p>
					<button class="pitch-down">–</button>
					<button class="pitch-up">+</button>
				</div>
				<div>
					<p>notes</p>
					<button class="note" data-note="C">C</button>
					<button class="note" data-note="C#">C#</button>
					<button class="note" data-note="D">D</button>
					<button class="note" data-note="D#">D#</button>
					<button class="note" data-note="E">E</button>
					<button class="note" data-note="F">F</button>
					<button class="note" data-note="F#">F#</button>
					<button class="note" data-note="G">G</button>
					<button class="note" data-note="G#">G#</button>
					<button class="note" data-note="A">A</button>
					<button class="note" data-note="A#">A#</button>
					<button class="note" data-note="B">B</button>
				</div>
				<div>
					<p>sounds</p>
					<button class="sound" data-sound="ee">ee</button>
					<button class="sound" data-sound="ay">ay</button>
					<button class="sound" data-sound="ah">ah</button>
					<button class="sound" data-sound="oh">oh</button>
					<button class="sound" data-sound="oo">oo</button>
					<button class="sound" data-sound="s">s</button>
					<button class="sound" data-sound="p">p</button>
					<button class="sound" data-sound="t">t</button>
					<button class="sound" data-sound="k">k</button>
				</div>
				<!-- <div>
					<p>voice</p>
					<button class="voice" data-voice="gab" data-active="1">gab</button>
				</div> -->
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

		// Toggles
		for (let btn of cell.querySelectorAll('.note')) {
			if (this.notes.includes(btn.dataset.note)) {
				btn.dataset.active = 1;
			}
			btn.addEventListener('click', () => {
				this.toggleNote(btn.dataset.note);
			})
		}
		for (let btn of cell.querySelectorAll('.sound')) {
			if (this.sounds.includes(btn.dataset.sound)) {
				btn.dataset.active = 1;
			}
			btn.addEventListener('click', () => {
				this.toggleSound(btn.dataset.sound);
			})
		}
		for (let btn of cell.querySelectorAll('.voice')) {
			if (this.voices.includes(btn.dataset.voice)) {
				btn.dataset.active = 1;
			}
			btn.addEventListener('click', () => {
				this.toggleVoice(btn.dataset.voice);
			})
		}

		grid.appendChild(cell);
		this.cell = grid.querySelector(`[data-id="${this.id}"]`);
		this.content = cell.querySelector(`.cell-content`);

		// Start playing
		this.forward();
	}

	// Move forward one step
	forward() {
		this.step++;
		this.cell.style.transition = "background-color " + this.tempo + "ms";
	
		// Create nodes for new step item
		let cellContentChild = document.createElement("div");
		cellContentChild.classList = "cell-content-child";
		let cellContentChildItem = document.createElement("p");
		cellContentChildItem.classList = "cell-content-child-item";
	
		// Add item to the container
		cellContentChild.appendChild(cellContentChildItem);
	
		// Set initial properties for new step item/container
		cellContentChild.style.transform = `scale(0)`;
		cellContentChild.style.zIndex = 9;
		cellContentChild.dataset.pos = 0;

		// Set voice
		let voice = voices[Math.floor(Math.random()*voices.length)];
		if (this.voices.length > 0) {
			voice = this.voices[Math.floor(Math.random()*this.voices.length)];
		}

		// Set sound
		let sound = sounds[Math.floor(Math.random()*sounds.length)];
		if (this.sounds.length > 0) {
			sound = this.sounds[Math.floor(Math.random()*this.sounds.length)];
		}
		cellContentChildItem.innerText = sound;

		// Set note
		let note = notes[Math.floor(Math.random()*notes.length)];
		if (this.notes.length > 0) {
			note = this.notes[Math.floor(Math.random()*this.notes.length)];
		}
		
		// Set background color according to note
		this.cell.style.backgroundColor = `hsl(${notes.indexOf(note)*30}deg,100%,50%)`;

		// Play audio
		playSound(voice, sound, 1000/this.tempo, note, this.octave, this.size/30);

		// Set position of new item
		this.stepRotation += Math.round(Math.random()*50-25);
		cellContentChildItem.dataset.rotation = this.stepRotation;
		cellContentChildItem.style.transform = `rotate(${cellContentChildItem.dataset.rotation}deg) scale(${(5.5-this.octave)/2})`;
	
		// Add finished node to live div
		this.content.appendChild(cellContentChild);
	
		// Animate transform by adding delay
		setTimeout(() => {
			cellContentChild.style.transform = `scale(1)`;
		}, 50)
	
		// Style and re-position previous steps
		for (let step of this.content.childNodes) {
			let item = step.querySelector('.cell-content-child-item');
			let pos = parseInt(step.dataset.pos);
			if (step.dataset.pos >= this.trail) { // Remove oldest
				step.style.opacity = 0;
				setTimeout(() => {
					discardElement(step);
				}, 500)
			} else if (step != cellContentChild && pos > 0) {
				let ratio = pos/this.trail;
				step.style.zIndex = `0`;
				step.style.transformOrigin = `50% -${50*pos}%`;
				step.style.transform = `rotate(${item.dataset.rotation}deg) translateY(${this.size*pos*10}px)`;
				step.style.opacity = 1 - ratio;
			}
			step.dataset.pos = pos + 1;
		}

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
			let pos = step.dataset.pos;
			if (pos > 1) {
				let item = step.querySelector('.cell-content-child-item');
				step.style.transform = `rotate(${item.dataset.rotation}deg) translateY(${this.size*pos*10}px)`;
			}
		}
	}
	sizeUp() {
		if (this.size < 40) {
			this.size += 1;
			this.cell.style.setProperty('--size', this.size + "vh");
		}
		for (let step of this.content.childNodes) {
			let pos = step.dataset.pos;
			if (pos > 1) {
				let item = step.querySelector('.cell-content-child-item');
				step.style.transform = `rotate(${item.dataset.rotation}deg) translateY(${this.size*pos*10}px)`;
			}
		}
	}
	tempoDown() {
		if (this.tempo < 1250) {
			this.tempo += 50;
		}
	}
	tempoUp() {
		if (this.tempo > 100) {
			this.tempo -= 50;
		}
	}
	octaveDown() {
		if (this.octave > 1) {
			this.octave -= 1;
		}
	}
	octaveUp() {
		if (this.octave < 5) {
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
		discardElement(this.cell);
		totalCells--;
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
	toggleVoice(voice) {
		let btn = this.cell.querySelector(`[data-voice="${voice}"]`);
		if (parseInt(btn.dataset.active) == 1) {
			btn.dataset.active = 0;
			this.voices.splice(this.voices.indexOf(voice), 1);
		} else {
			btn.dataset.active = 1;
			this.voices.push(voice);
		}
	}
}

// Play note
let notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function playSound(voice, sound, duration, note, octave, volume) {
	let actualNote = note+octave || note+Math.floor(Math.random()*4+1) || notes[Math.floor(Math.random()*notes.length)]+octave || notes[Math.floor(Math.random()*notes.length)]+Math.floor(Math.random()*4+1);
	let subSampler = samplers[voice][sound];
	let freq = Tone.Frequency(actualNote).toFrequency();
	let randomFreq = freq + Math.random()*freq/40;
	subSampler.triggerAttackRelease(randomFreq, 1, undefined, volume);
}

// Trackers
let cells = {};
let totalCells = 0;

// Set max number of cells per screen size
let maxCount = 9;
if (window.innerWidth < 800) {
	maxCount = 4;
} else {
	maxCount = 9;
}
window.addEventListener('resize', () => {
	if (window.innerWidth < 800) {
		maxCount = 4;
	} else {
		maxCount = 9;
	}
})

// Controls
let controls = document.querySelector(".controls");

// Clear all cells
let controlsClear = controls.querySelector("#clear");
clear.addEventListener('click', () => {
	for (let cell of Object.keys(cells)) {
		if (cells[cell].paused == false) {
			cells[cell].deleteSelf();
		}
	}
	checkTitle();
})

// Randomize cells
let controlsRandomize = controls.querySelector("#randomize");
controlsRandomize.addEventListener('click', () => {
	for (let cell of Object.keys(cells)) {
		if (cells[cell].paused == false) {
			cells[cell].deleteSelf();
		}
	}
	while (totalCells < Math.floor(Math.random()*(maxCount-1)+1)) {
		cells[id] = new GridCell(['gab'], undefined, undefined, undefined, randomNotes(), randomSounds());
		totalCells++;
	}
	checkTitle();
})
function randomize(key) {
	for (let cell of Object.keys(cells)) {
		if (cells[cell].paused == false) {
			cells[cell].deleteSelf();
		}
	}
	while (totalCells < Math.floor(Math.random()*(maxCount-1)+1)) {
		cells[id] = new GridCell(['gab'], undefined, undefined, undefined, randomNotes(key), randomSounds());
		totalCells++;
	}
	checkTitle();
}

// Add new cell
let controlsGenerate = controls.querySelector("#generate");
generate.addEventListener('click', () => {
	if (totalCells < maxCount) {
		cells[id] = new GridCell([], 800, 20, 3, [], []);
		totalCells++;
	}
	checkTitle();
})

// Randomize cells in specific key
for (let preset of document.querySelectorAll('.preset')){
	preset.addEventListener('click', () => {
		if (totalCells < maxCount) {
			cells[id] = new GridCell(['gab'], undefined, undefined, undefined, randomNotes(preset.dataset.preset), randomSounds());
			totalCells++;
		}
		checkTitle();
	})
	preset.addEventListener('contextmenu', (e) => {
		e.preventDefault();
		if (totalCells < maxCount) {
			cells[id] = new GridCell(['gab'], undefined, undefined, undefined, randomNotes(preset.dataset.preset, 'minor'), randomSounds());
			totalCells++;
		}
		checkTitle();
		return false
	}, false);
}

// Generate random parameters
function randomNotes(key, type) {
	let temp = [];
	let majorTriads = {
		'C': ['C', 'E', 'G', 'B'],
		'C#': ['C#', 'F', 'G#', 'C'],
		'D': ['D', 'F#', 'A', 'C#'],
		'D#': ['D#', 'G', 'A#', 'D'],
		'E': ['E', 'G#', 'B', 'D#'],
		'F': ['F', 'A', 'C', 'E'],
		'F#': ['F#', 'A#', 'C#', 'F'],
		'G': ['G', 'B', 'D', 'F#'],
		'G#': ['G#', 'C', 'D#', 'G'],
		'A': ['A', 'C#', 'E', 'G#'],
		'A#': ['A#', 'D', 'F', 'A'],
		'B': ['B', 'D#', 'F#', 'A#'],
	}
	let minorTriads = {
		'C': ['C', 'D#', 'G', 'A#'],
		'C#': ['C#', 'E', 'G#', 'B'],
		'D': ['D', 'F', 'A', 'C'],
		'D#': ['D#', 'F#', 'A#', 'C#'],
		'E': ['E', 'G', 'B', 'D'],
		'F': ['F', 'G#', 'C', 'D#'],
		'F#': ['F#', 'A', 'C#', 'E'],
		'G': ['G', 'A#', 'D', 'F'],
		'G#': ['G#', 'B', 'D#', 'F#'],
		'A': ['A', 'C', 'E', 'G'],
		'A#': ['A#', 'C#', 'F', 'G#'],
		'B': ['B', 'D', 'F#', 'A'],
	}
	if (key != undefined) {
		temp = majorTriads[key];
		// Minor keys
		if (type == 'minor') {
			temp = minorTriads[key];
		}
		// // Fragment chord
		// for (let i=0; i<temp.length-1; i++) {
		// 	if (Math.random()<.5) {
		// 		temp.splice(Math.floor(Math.random()*temp.length), 1);
		// 	}
		// }
	} else {
		for (let note of notes) {
			if (Math.random()<.5) {
				temp.push(note);
			}
		}
	}
	return temp
}
function randomSounds() {
	let temp = [];
	for (let sound of sounds) {
		if (Math.random()<.5) {
			temp.push(sound);
		}
	}
	return temp
}
function randomVoices() {
	let temp = [];
	for (let voice of voices) {
		if (Math.random()<.5) {
			temp.push(voice);
		}
	}
	return temp
}

// Title animation
let titleContainer = document.querySelector('.title-container');
let title = document.querySelector('.title');
let temp = "";
let titleDelay = 0;
for (let i of title.innerText) {
	temp += `<span style="animation-delay:${titleDelay}s">${i}</span>`;
	titleDelay -= .2;
}
title.innerHTML = temp;

function checkTitle() {
	if (totalCells == 0) {
		titleContainer.style.display = 'flex';
	} else {
		titleContainer.style.display = 'none';
	}
}

// Info
function openInfo() {
	let info = document.querySelector('.info');
	info.dataset.active = 1;
}
function closeInfo() {
	let info = document.querySelector('.info');
	info.dataset.active = 0;
}

// Remove elements to prevent lag
let garbageBin = document.createElement('div');
garbageBin.style.display = 'none'; // Make sure it is not displayed
document.body.appendChild(garbageBin);
function discardElement(element) {
    garbageBin.appendChild(element);
    // Empty the garbage bin
    garbageBin.innerHTML = "";
}
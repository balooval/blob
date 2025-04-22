import Evt from './event.js';

let majActiv = false;
let ctrlActiv = false;

export let lastKeyDown = -1;
export let lastKeyUp = -1;
export let evt = null;

export function init() {
	evt = new Evt();
	document.body.addEventListener('keydown', onKeyDown);
	document.body.addEventListener('keyup', onKeyUp);
}

export function onKeyDown(event) {
	if (document.activeElement.type == undefined ){
		const key = event.keyCode || event.which;
		if (lastKeyDown != key ){
			lastKeyUp = -1;
			lastKeyDown = key;
		} else {
			return false;
		}
		evt.fireEvent('DOWN_' + key, key);
		evt.fireEvent('DOWN', key);

		if( key == 87 ){ // w
			
		}else if( key == 16 ){ // MAJ
			majActiv = true;
		}else if( key == 17 ){ // CTRL
			ctrlActiv = true;
		}else if( key == 32){ // SPACE
			evt.fireEvent('DOWN', 'SPACE');
		}else if( key == 37 ){ // LEFT
			evt.fireEvent('DOWN', 'LEFT');
		}else if( key == 39 ){ // RIGHT
			evt.fireEvent('DOWN', 'RIGHT');
		}else if( key == 38 ){ // TOP
			evt.fireEvent('DOWN', 'UP');
		}else if( key == 40 ){ // BOTTOM
			evt.fireEvent('DOWN', 'DOWN');
		}else if( key == 49 ){ // 1
			
		}else if( key == 50 ){ // 2
			
		}else if( key == 51 ){ // 3
			
		}else if( key == 65 ){ // a
			
		}else if( key == 66 ){ // b
			
		}else if( key == 67 ){ // c
			evt.fireEvent('DOWN', 'C');
			
		}else if( key == 68 ){ // d
			evt.fireEvent('DOWN', 'D');
			
		}else if( key == 69 ){ // e
			evt.fireEvent('DOWN', 'E');
			
		}else if( key == 71 ){ // g
			
		}else if( key == 76 ){ // l
			
		}else if( key == 79 ){ // o
			
		}else if( key == 80 ){ // p

		}else if( key == 81 ){ // q
			evt.fireEvent('DOWN', 'Q');
			
		}else if( key == 82 ){ // r
			
		}else if( key == 83 ){ // s
			evt.fireEvent('DOWN', 'S');
			
		}else if( key == 90 ){ // z
			evt.fireEvent('DOWN', 'Z');
			
		}else if( key == 107 ){ // +
			
		}else if( key == 109 ){ // -
			
		}else if( key == 88 ){ // x
			
		}
	}
}
		
export function onKeyUp(_event) {
	const key = _event.keyCode || _event.which;
	// const keychar = String.fromCharCode(key);
	if (lastKeyUp != key ){
		lastKeyDown = -1;
		lastKeyUp = key;
	}
	if( key == 17 ){ // CTRL
		ctrlActiv = false;
	}else if( key == 16 ){ // MAJ
		majActiv = false;
	}else if( key == 32){ // SPACE
		evt.fireEvent('UP', 'SPACE');
	}else if( key == 37 ){ // LEFT
		evt.fireEvent('UP', 'LEFT');
	}else if( key == 39 ){ // RIGHT
		evt.fireEvent('UP', 'RIGHT');
	}else if( key == 38 ){ // TOP
			evt.fireEvent('UP', 'UP');
	}else if( key == 40 ){ // BOTTOM
		evt.fireEvent('UP', 'DOWN');

	}else if( key == 68 ){ // d
		evt.fireEvent('UP', 'D');

	}else if( key == 81 ){ // q
		evt.fireEvent('UP', 'Q');
		
	}else if( key == 83 ){ // s
		evt.fireEvent('UP', 'S');
		
	}else if( key == 90 ){ // z
		evt.fireEvent('UP', 'Z');
	}
}
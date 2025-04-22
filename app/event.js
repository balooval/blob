class Evt {

	constructor() {
		this.events = new Map();
		this.listeners = new Map();
	}

	addEventListener(_evtName, _listener, _callback) {
		if (!this.events.has(_evtName)) {
			this.events.set(_evtName, []);
			this.listeners.set(_evtName, []);
		}
		this.events.get(_evtName).push(_callback);
		this.listeners.get(_evtName).push(_listener);
	}

	removeEventListener(_evtName, _listener, _callback) {
		let index = -1;
		if (!this.events.has(_evtName)) return false;
		const listeners = this.listeners.get(_evtName);
		const events = this.events.get(_evtName);
		for (let i = 0; i < listeners.length; i ++) {
			if (listeners[i] == _listener && events[i] == _callback) {
				index = i;
				break;
			}
		}
		if (index < 0){
			return false;
		}
		this.events.get(_evtName).splice(index, 1);
		listeners.splice(index, 1);
	}
	
	clearEventListener(_listener) {
		const events = {};
		this.listeners.forEach((_listeners, eventName) => {
			_listeners.forEach((listener, i) => {
				if (listener == _listener) {
					events[eventName] = i;
				}
			});
		});
		Object.entries(events).forEach(([eventName, index]) => {
			this.listeners.get(eventName).splice(index, 1);
			this.events.get(eventName).splice(index, 1);
		});
	}
	

	fireEvent(_evtName, _args = []) {
		if (!this.events.has(_evtName)) return false;
		const evs = this.events.get(_evtName).slice(0);
		const lst = this.listeners.get(_evtName).slice(0);
		const listenerNb = evs.length;
		for (let i = 0; i < listenerNb; i++) {
			evs[i].call(lst[i], _args);
		}
	}

	dispose() {
		this.events = new Map();
		this.listeners = new Map();
	}
}

export {Evt as default}
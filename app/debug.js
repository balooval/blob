
let element;

export function init() {
    element = document.getElementById('debug');
}

export function view(value) {
    element.innerHTML = value;
}
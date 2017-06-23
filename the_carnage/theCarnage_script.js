window.addEventListener('DOMContentLoaded', () => alert('Document is loaded'));

function changeMe() {
	var h1 = document.getElementById("change_heading");
	h1.innerText = "Hello World!";
}

function showSelectedColor(event) {
	var ribbon = document.querySelector('.selected');
	ribbon.innerText = event.target.classList[0];
}

function showNoneColor(event) {
	var ribbon = document.querySelector('.selected');
	ribbon.innerText = 'None!';
}

function createDiv() {
	var newDiv = document.createElement('div');
	newDiv.setAttribute('class', 'purple');
	newDiv.style.backgroundColor = 'purple';
	(document.querySelector('section')).append(newDiv);
}

function runTheCar(carElem, speed) {
	carElem.style.marginLeft = 0;
	
	var intervalId = setInterval((carElem) => {
		var m = parseInt(carElem.style.marginLeft);
		var accelerate = Math.random()*10;
		carElem.style.marginLeft = m + accelerate + "px";
	}, speed, carElem);
	
	return intervalId;
}

function startTheCarnage() {
	// before start
	var track = document.querySelector('body');
	var getStyle = function(elem, style) {
		return getComputedStyle(elem).getPropertyValue(style);
	}
	var trackLength = parseFloat(getStyle(track, 'width')) - parseFloat(getStyle(track, 'margin-left')) - parseFloat(getStyle(track, 'margin-right')) - parseFloat(getStyle(track, 'padding-left')) - parseFloat(getStyle(track, 'padding-right'));

	// init cars
	var car1Elem = document.querySelector('.car1');
	var car2Elem = document.querySelector('.car2');
	var car1Id = runTheCar(car1Elem, 10);
	var car2Id = runTheCar(car2Elem, 10);

	var timerId = setInterval(function () {
		var clear = () => {
			clearTimeout(car1Id);
			clearTimeout(car2Id);
			clearTimeout(timerId);
			car1Elem.style.marginLeft = 0;
			car2Elem.style.marginLeft = 0;
		}
		
		var car1path = trackLength - parseInt(car1Elem.style.marginLeft) - parseFloat(getStyle(car1Elem, 'width')) ;
		var car2path = trackLength - parseInt(car2Elem.style.marginLeft) - parseFloat(getStyle(car2Elem, 'width')) ;
		if (car1path < 0) {
			alert ('Winner the 1st');
			clear(this)
		} else if (car2path < 0) {
			alert('Winner the 2nd');
			clear(this);
		}
	}, 1, car1Elem, car2Elem, car1Id, car2Id, trackLength)
}



changeMe();
createDiv();

for (var child of document.querySelector('section').children) {
	child.addEventListener('mouseover', showSelectedColor);
	child.addEventListener('mouseout', showNoneColor);
}

var btnStart = document.querySelector('button');
btnStart.addEventListener('click', startTheCarnage);
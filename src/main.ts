import "./style.scss";
import sound from "./sound";

let alertInterval: number | null = null;

const focusButton = document.querySelector(".focus__start");
const focusTimer = document.querySelector(".focus__timer");
const focusDot = document.querySelector(".focus__dot");
const focusProgress = document.querySelector(".focus__progress");

interface CountDowns {
  interval: number | null;
  difference: number | null;
}

const focuss: CountDowns = {
  interval: null,
  difference: null
};

const restButton = document.querySelector(".rest__start");
const restTimer = document.querySelector(".rest__timer");
const restDot = document.querySelector(".rest__dot");
const restProgress = document.querySelector(".rest__progress");

const rest: CountDowns = {
  interval: null,
  difference: null
};

type nullElement = Element | null;

function dotAnimation(
  dot: nullElement,
  minutes: number,
  seconds: number,
  totalMinutes: number
) {
  if (dot instanceof HTMLElement) {
    dot.style.transform = `rotateZ(${
      (minutes * 60 + seconds) * (360 / (totalMinutes * 60))
    }deg)`;
  }
}

function progressAnimation(
  progress: nullElement,
  minutes: number,
  seconds: number,
  totalMinutes: number
) {
  if (progress instanceof SVGCircleElement) {
    const dashArray = +window
      .getComputedStyle(progress)
      .strokeDasharray.replace("px", "");
    progress.style.strokeDashoffset = `${
      dashArray - (minutes * 60 + seconds) * (dashArray / (totalMinutes * 60))
    }`;
  }
}

function countDownStart(
  timer: nullElement,
  dot: nullElement,
  progress: nullElement,
  button: nullElement,
  control: CountDowns
) {
  const totalMinutes =
    timer instanceof HTMLElement && Number(timer.dataset.minutes);
  const focusTime = control.difference
    ? Date.now() + control.difference
    : Date.now() + (totalMinutes || 0) * 60000;
  control.interval = setInterval(() => {
    const actualTime = Date.now();
    control.difference = focusTime - actualTime;
    let minutes = Math.floor(control.difference / 60000);
    let seconds = Math.floor((control.difference % 60000) / 1000);
    if (timer)
      timer.innerHTML = `${minutes < 10 ? `0${minutes}` : minutes}:${
        seconds < 10 ? `0${seconds}` : seconds
      }`;
    if (totalMinutes) {
      if (control.difference <= 0 && control.interval) {
        clearInterval(control.interval);
        control.interval = null;
        control.difference = null;
        timer.innerHTML = "00:00";
        minutes = 0;
        seconds = 0;
        if (button) button.innerHTML = "Restart";
        timer.classList.add("alert");
        alertInterval = setInterval(() => {
          sound.start();
          sound.stop("+0.1");
        }, 300);
      }
      dotAnimation(dot, minutes, seconds, totalMinutes);
      progressAnimation(progress, minutes, seconds, totalMinutes);
    }
  }, 100);
}

function countDownReset(
  timer: nullElement,
  dot: nullElement,
  progress: nullElement,
  button: nullElement,
  control: CountDowns
) {
  alertInterval && clearInterval(alertInterval);
  alertInterval = null;
  if (timer instanceof HTMLElement)
    timer.innerHTML = `${
      Number(timer.dataset.minutes) < 10
        ? `0${timer.dataset.minutes}`
        : timer.dataset.minutes
    }:00`;
  timer?.classList.remove("alert");
  if (dot instanceof HTMLElement) dot.style.transform = "rotateZ(0deg)";
  if (progress instanceof SVGCircleElement)
    progress.style.strokeDashoffset = "0";
  if (button) button.innerHTML = "Start";
  control.interval = null;
  control.difference = null;
}

if (focusButton instanceof HTMLButtonElement) {
  focusButton.addEventListener("click", () => {
    if (focusTimer?.classList.contains("alert")) {
      countDownReset(focusTimer, focusDot, focusProgress, focusButton, focuss);
    } else if (!focuss.interval) {
      countDownStart(focusTimer, focusDot, focusProgress, focusButton, focuss);
      focusButton.innerHTML = "Pause";
    } else {
      clearInterval(focuss.interval);
      focuss.interval = null;
      focusButton.innerHTML = "Start";
    }
  });
}

if (restButton instanceof HTMLButtonElement) {
  restButton.addEventListener("click", () => {
    if (restTimer?.classList.contains("alert")) {
      countDownReset(restTimer, restDot, restProgress, restButton, rest);
    } else if (!rest.interval) {
      countDownStart(restTimer, restDot, restProgress, restButton, rest);
      restButton.innerHTML = "Pause";
    } else {
      clearInterval(rest.interval);
      rest.interval = null;
      restButton.innerHTML = "Start";
    }
  });
}

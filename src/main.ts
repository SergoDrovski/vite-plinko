import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

document.addEventListener('DOMContentLoaded', () => {
// Select the timer display element
    const timerElement = document.querySelector('.bonus__time') as HTMLSpanElement;

    if(!timerElement) return;

// Set initial countdown time (in seconds) if not already in localStorage
    const initialCountdown = 24 * 60 * 60; // 24 hours
    const countdownKey = 'bonusTimerCountdown';

// Retrieve remaining time from localStorage or set default
    let remainingTime = parseInt(localStorage.getItem(countdownKey) || `${initialCountdown}`, 10);

// Function to format time in HH:MM:SS
    function formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    }

// Function to update the timer display
    function updateTimerDisplay() {
        if (timerElement) {
            timerElement.textContent = formatTime(remainingTime);
        }
    }

// Function to update the countdown each second
    function startCountdown() {
        const interval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime -= 1;
                localStorage.setItem(countdownKey, `${remainingTime}`);
                updateTimerDisplay();
            } else {
                clearInterval(interval);
                // Optionally, handle timer expiration (e.g., disable a button or show a message)
                console.log('The countdown has ended.');
            }
        }, 1000);
    }

    Swiper.use([Navigation]);
    new Swiper('.swiper', {
        direction: 'horizontal',
        // loop: true,
        spaceBetween: 19,
    
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });

    // Initialize the Accordion
    function initAccordion() {
        document.querySelectorAll(".accordion__wrapper").forEach((button) => {
            button.addEventListener("click", () => {
                const item = button.parentElement;
                const content = item.querySelector(".accordion__content");
                const icon = button.querySelector(".accordion__icon");

                item.classList.toggle("active");
            });
        });
    }

// Initialize the timer display and start the countdown
    updateTimerDisplay();
    startCountdown();
    initAccordion();
});
import { tick } from 'svelte';
import anime from 'animejs';

let isAnimating = false;

async function animateSuffix(suffixElement, updateSuffix) {
    if (isAnimating) return;
    isAnimating = true;

    if (suffixElement) {
      await tick(); 

      const lettersElement = suffixElement.querySelector('.letters');
      const lettersWidth = lettersElement.getBoundingClientRect().width;

      const timeline = anime.timeline({ loop: false });

      timeline.add({
        targets: '.title-suffix .line',
        scaleY: [0, 1],
        opacity: [0.5, 1],
        easing: 'easeOutExpo',
        duration: 700,
      });

      timeline.add({
        targets: '.title-suffix .line',
        translateX: [0, lettersWidth + 10],
        easing: 'easeOutExpo',
        duration: 700,
        delay: 100,
      });

      timeline.add({
        targets: '.title-suffix .letter',
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        offset: '-=775', 
        delay: (el, i) => 34 * (i + 1),
      });

      timeline.add({
        targets: '.title-suffix .letters',
        opacity: [1, 0],
        easing: 'easeOutExpo',
        duration: 100,
        delay: 1000,
        complete: () => {
            updateSuffix(); 
            isAnimating = false;
        },
      });
    }
  }

export { animateSuffix };


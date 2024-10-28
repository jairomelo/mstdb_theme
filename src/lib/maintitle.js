import { titleStem, titleSuffixes } from '$conf/local';
import { writable } from 'svelte/store';

let currentSuffixIndex = 0;
export const currentSuffix = writable('');
export const currentColor = writable('');

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 31) + 70;
    const lightness = Math.floor(Math.random() * 21) + 60;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function updateSuffix() {
    currentSuffixIndex = (currentSuffixIndex + 1) % titleSuffixes.length;
    currentSuffix.set(titleSuffixes[currentSuffixIndex]);
    currentColor.set(getRandomColor());
}

export { titleStem };
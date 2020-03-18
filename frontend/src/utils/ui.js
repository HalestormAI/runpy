export function secondsToHMS(seconds) {
    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    // We know there will never be negative numbers here... If there are it'll look bad.
    const pad = n => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`
}
const pad = n => n.toString().padStart(2, "0");

export function secondsToHMS(seconds) {
    if (seconds < 0) {
        throw new Error("Number of seconds cannot be negative.");
    }

    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    // We know there will never be negative numbers here... If there are it'll look bad.
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function speedToPaceMS(speed) {
    if (speed < 0) {
        throw new Error("Speed must be greater than 0.");
    }
    if (speed === 0) {
        return NaN;
    }

    const x = 1 / (0.06 * speed);
    const mins = Math.floor(x);
    const secs = Math.round((x - mins) * 60);
    return `${pad(mins)}:${pad(secs)}`;
}

export function distanceFormat(distance) {
    return (distance / 1000).toFixed(2);
}
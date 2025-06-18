export const TUNING_DEFAULTS = {6: 'E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'E'};

export const NOTES = [
  'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F',
  'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'
];

export const NOTE_INDEX = {
  'C': 0, 'C#/Db': 1, 'D': 2, 'D#/Eb': 3, 'E': 4, 'F': 5,
  'F#/Gb': 6, 'G': 7, 'G#/Ab': 8, 'A': 9, 'A#/Bb': 10, 'B': 11
};

export const getNoteFromFret = (openNote, fret) => {
    const startIdx = NOTE_INDEX[openNote];
    const resultIdx = (startIdx + fret) % 12;
  return NOTES[resultIdx];
};

export const INTERVALS_MAJOR_INDEX = {'P1': 0, 'M2': 2, 'M3': 4, 'P4': 5, 'P5': 7, 'M6': 9, 'M7': 11};
export const INTERVALS_MINOR_INDEX = {'P1': 0, 'M2': 2, 'm3': 3, 'P4': 5, 'P5': 7, 'm6': 8, 'm7': 10};
export const INTERVALS_MAJOR_PENTA_INDEX = {'P1': 0, 'M2': 2, 'M3': 4, 'P5': 7, 'M6': 9};
export const INTERVALS_MINOR_PENTA_INDEX = {'P1': 0, 'm3': 3, 'P4': 5, 'P5': 7, 'm7': 10};

export const CHROMATIC_INTERVALS_INDEX = {
  'P1': 0, 'm2': 1, 'M2': 2, 'm3': 3, 'M3': 4, 'P4': 5, 'TT': 6, 'P5': 7, 'm6': 8, 'M6': 9, 'm7': 10, 'M7': 11
};

export const SCALE_MAP = {
  Major: INTERVALS_MAJOR_INDEX,
  Minor: INTERVALS_MINOR_INDEX,
  MajorPenta: INTERVALS_MAJOR_PENTA_INDEX,
  MinorPenta: INTERVALS_MINOR_PENTA_INDEX,
};

export const DIATONIC_CHORDS_MAJOR = [
  'maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'
];

export const DIATONIC_CHORDS_MINOR = [
  'm7', 'm7b5', 'Maj7', 'm7', 'm7', 'Maj7', '7'
];
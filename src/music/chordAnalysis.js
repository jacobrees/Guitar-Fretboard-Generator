import { defaultIntervalLabels } from "@/stores/constants";

const sortNumeric = (leftValue, rightValue) => leftValue - rightValue;

const getUniqueSortedValues = (values) =>
  Array.from(new Set(values)).sort(sortNumeric);

// Ordered from most specific to most general so the matcher prefers the
// richest valid symbol before falling back to simpler chord families.
const createChordPatternDefinitions = () =>
  Object.freeze(
    [
      {
        name: "Major 13",
        symbol: "maj13",
        requiredIntervals: [0, 4, 9, 11],
        optionalIntervals: [2, 6, 7],
      },
      {
        name: "Dominant 13 Sharp 11 Flat 9",
        symbol: "13(#11,b9)",
        requiredIntervals: [0, 1, 4, 6, 9, 10],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 13 Sharp 11",
        symbol: "13(#11)",
        requiredIntervals: [0, 4, 6, 9, 10],
        optionalIntervals: [2, 7],
      },
      {
        name: "Dominant 13 Suspended 4",
        symbol: "13sus4",
        requiredIntervals: [0, 5, 9, 10],
        optionalIntervals: [2, 7],
      },
      {
        name: "Dominant 13",
        symbol: "13",
        requiredIntervals: [0, 4, 9, 10],
        optionalIntervals: [2, 7],
      },
      {
        name: "Minor 13",
        symbol: "m13",
        requiredIntervals: [0, 3, 9, 10],
        optionalIntervals: [2, 5, 7],
      },
      {
        name: "Major 9 Sharp 11",
        symbol: "maj9(#11)",
        requiredIntervals: [0, 2, 4, 6, 11],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 9 Sharp 11",
        symbol: "9(#11)",
        requiredIntervals: [0, 2, 4, 6, 10],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 7 Flat 9 Sharp 11",
        symbol: "7(b9,#11)",
        requiredIntervals: [0, 1, 4, 6, 10],
        optionalIntervals: [7],
      },
      {
        name: "Minor 11 Flat 5",
        symbol: "m11b5",
        requiredIntervals: [0, 3, 5, 6, 10],
        optionalIntervals: [2],
      },
      {
        name: "Minor 11",
        symbol: "m11",
        requiredIntervals: [0, 3, 5, 10],
        optionalIntervals: [2, 7],
      },
      {
        name: "Dominant 9 Suspended 4",
        symbol: "9sus4",
        requiredIntervals: [0, 2, 5, 10],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 7 Flat 9 Sharp 9 Sharp 5",
        symbol: "7(b9,#9,#5)",
        requiredIntervals: [0, 1, 3, 4, 8, 10],
      },
      {
        name: "Dominant 7 Flat 9 Sharp 9",
        symbol: "7(b9,#9)",
        requiredIntervals: [0, 1, 3, 4, 10],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 7 Sharp 9 Sharp 5",
        symbol: "7(#9,#5)",
        requiredIntervals: [0, 3, 4, 8, 10],
      },
      {
        name: "Dominant 7 Flat 9 Sharp 5",
        symbol: "7(b9,#5)",
        requiredIntervals: [0, 1, 4, 8, 10],
      },
      {
        name: "Major 9",
        symbol: "maj9",
        requiredIntervals: [0, 2, 4, 11],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 9 Sharp 5",
        symbol: "9(#5)",
        requiredIntervals: [0, 2, 4, 8, 10],
      },
      {
        name: "Dominant 9",
        symbol: "9",
        requiredIntervals: [0, 2, 4, 10],
        optionalIntervals: [7],
      },
      {
        name: "Minor 9",
        symbol: "m9",
        requiredIntervals: [0, 2, 3, 10],
        optionalIntervals: [7],
      },
      {
        name: "6/9",
        symbol: "6/9",
        requiredIntervals: [0, 2, 4, 9],
        optionalIntervals: [7],
      },
      {
        name: "Minor 6/9",
        symbol: "m6/9",
        requiredIntervals: [0, 2, 3, 9],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 7 Flat 9",
        symbol: "7(b9)",
        requiredIntervals: [0, 1, 4, 10],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 7 Sharp 9",
        symbol: "7(#9)",
        requiredIntervals: [0, 3, 4, 10],
        optionalIntervals: [7],
      },
      {
        name: "Major 7 Sharp 11",
        symbol: "maj7(#11)",
        requiredIntervals: [0, 4, 6, 11],
        optionalIntervals: [2, 7],
      },
      {
        name: "Major 7 Sharp 5",
        symbol: "maj7#5",
        requiredIntervals: [0, 4, 8, 11],
      },
      {
        name: "Minor Major 7",
        symbol: "mMaj7",
        requiredIntervals: [0, 3, 11],
        optionalIntervals: [7],
      },
      {
        name: "Major 7",
        symbol: "maj7",
        requiredIntervals: [0, 4, 11],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 7 Suspended 4",
        symbol: "7sus4",
        requiredIntervals: [0, 5, 10],
        optionalIntervals: [7],
      },
      {
        name: "Dominant 7 Sharp 5",
        symbol: "7#5",
        requiredIntervals: [0, 4, 8, 10],
      },
      {
        name: "Dominant 7 Flat 5",
        symbol: "7(b5)",
        requiredIntervals: [0, 4, 6, 10],
      },
      {
        name: "Dominant 7",
        symbol: "7",
        requiredIntervals: [0, 4, 10],
        optionalIntervals: [7],
      },
      {
        name: "Minor 7",
        symbol: "m7",
        requiredIntervals: [0, 3, 10],
        optionalIntervals: [7],
      },
      {
        name: "Half-Diminished 7",
        symbol: "m7b5",
        requiredIntervals: [0, 3, 6, 10],
      },
      {
        name: "Diminished Major 7",
        symbol: "dimMaj7",
        requiredIntervals: [0, 3, 6, 11],
      },
      {
        name: "Diminished 7",
        symbol: "dim7",
        requiredIntervals: [0, 3, 6, 9],
      },
      {
        name: "Major 6",
        symbol: "6",
        requiredIntervals: [0, 4, 9],
        optionalIntervals: [7],
      },
      {
        name: "Minor 6",
        symbol: "m6",
        requiredIntervals: [0, 3, 9],
        optionalIntervals: [7],
      },
      {
        name: "Add Flat 9",
        symbol: "addb9",
        requiredIntervals: [0, 1, 4],
        optionalIntervals: [7],
        voicingVariants: {
          intervalClass: 1,
          compactName: "Add Flat 2",
          compactSymbol: "addb2",
          extendedName: "Add Flat 9",
          extendedSymbol: "addb9",
        },
      },
      {
        name: "Minor Add Flat 9",
        symbol: "maddb9",
        requiredIntervals: [0, 1, 3],
        optionalIntervals: [7],
        voicingVariants: {
          intervalClass: 1,
          compactName: "Minor Add Flat 2",
          compactSymbol: "maddb2",
          extendedName: "Minor Add Flat 9",
          extendedSymbol: "maddb9",
        },
      },
      {
        name: "Add 9",
        symbol: "add9",
        requiredIntervals: [0, 2, 4],
        optionalIntervals: [7],
        voicingVariants: {
          intervalClass: 2,
          compactName: "Add 2",
          compactSymbol: "add2",
          extendedName: "Add 9",
          extendedSymbol: "add9",
        },
      },
      {
        name: "Minor Add 9",
        symbol: "madd9",
        requiredIntervals: [0, 2, 3],
        optionalIntervals: [7],
        voicingVariants: {
          intervalClass: 2,
          compactName: "Minor Add 2",
          compactSymbol: "madd2",
          extendedName: "Minor Add 9",
          extendedSymbol: "madd9",
        },
      },
      {
        name: "Add 11",
        symbol: "add11",
        requiredIntervals: [0, 4, 5],
        optionalIntervals: [7],
        voicingVariants: {
          intervalClass: 5,
          compactName: "Add 4",
          compactSymbol: "add4",
          extendedName: "Add 11",
          extendedSymbol: "add11",
        },
      },
      {
        name: "Minor Add 11",
        symbol: "madd11",
        requiredIntervals: [0, 3, 5],
        optionalIntervals: [7],
        voicingVariants: {
          intervalClass: 5,
          compactName: "Minor Add 4",
          compactSymbol: "madd4",
          extendedName: "Minor Add 11",
          extendedSymbol: "madd11",
        },
      },
      {
        name: "Suspended 2 and 4",
        symbol: "sus2sus4",
        requiredIntervals: [0, 2, 5, 7],
      },
      {
        name: "Augmented",
        symbol: "aug",
        requiredIntervals: [0, 4, 8],
      },
      {
        name: "Diminished",
        symbol: "dim",
        requiredIntervals: [0, 3, 6],
      },
      {
        name: "Suspended 2",
        symbol: "sus2",
        requiredIntervals: [0, 2, 7],
      },
      {
        name: "Suspended 4",
        symbol: "sus4",
        requiredIntervals: [0, 5, 7],
      },
      {
        name: "Major",
        symbol: "",
        requiredIntervals: [0, 4, 7],
      },
      {
        name: "Minor",
        symbol: "m",
        requiredIntervals: [0, 3, 7],
      },
      {
        name: "Power Chord",
        symbol: "5",
        requiredIntervals: [0, 7],
      },
    ].map((definition, priority) => {
      const requiredIntervals = getUniqueSortedValues(
        definition.requiredIntervals,
      );
      const optionalIntervals = getUniqueSortedValues(
        definition.optionalIntervals ?? [],
      );
      const allowedIntervals = getUniqueSortedValues([
        ...requiredIntervals,
        ...optionalIntervals,
      ]);

      return Object.freeze({
        ...definition,
        priority,
        requiredIntervals,
        optionalIntervals,
        allowedIntervals,
        allowedIntervalSet: new Set(allowedIntervals),
      });
    }),
  );

const chordPatternDefinitions = createChordPatternDefinitions();

const getUniqueNoteIndexes = (noteIndexes) =>
  getUniqueSortedValues(noteIndexes);

const getNormalizedIntervalSet = (rootNoteIndex, noteIndexes) =>
  getUniqueSortedValues(
    noteIndexes.map((noteIndex) => (noteIndex - rootNoteIndex + 12) % 12),
  );

const getLowestSelectedMidiNumberForNoteIndex = (selectedNotes, noteIndex) =>
  selectedNotes.reduce((lowestMidiNumber, noteDetails) => {
    if (noteDetails.noteIndex !== noteIndex) {
      return lowestMidiNumber;
    }

    if (
      lowestMidiNumber === null ||
      noteDetails.midiNumber < lowestMidiNumber
    ) {
      return noteDetails.midiNumber;
    }

    return lowestMidiNumber;
  }, null);

const getFunctionalCompoundSemitoneDistance = (
  rootMidiNumber,
  noteMidiNumber,
) => {
  const semitoneDistance = noteMidiNumber - rootMidiNumber;

  if (semitoneDistance >= 0) {
    return semitoneDistance;
  }

  const wrappedIntervalClass = ((semitoneDistance % 12) + 12) % 12;

  return wrappedIntervalClass === 0 ? 12 : wrappedIntervalClass + 12;
};

const compoundIntervalExtensionLabels = Object.freeze({
  1: "♭9",
  2: "9",
  5: "11",
  6: "#11",
  8: "♭13",
  9: "13",
});

const getDefaultIntervalLabel = (intervalClass) =>
  defaultIntervalLabels[intervalClass] ?? `${intervalClass}`;

const getCompoundIntervalsByClass = ({
  rootMidiNumber,
  rootNoteIndex,
  selectedNotes,
}) => {
  if (
    rootMidiNumber === null ||
    rootNoteIndex === null ||
    selectedNotes.length === 0
  ) {
    return new Map();
  }

  const compoundIntervalsByClass = new Map();

  selectedNotes.forEach((noteDetails) => {
    const intervalClass = (noteDetails.noteIndex - rootNoteIndex + 12) % 12;
    const compoundSemitones = getFunctionalCompoundSemitoneDistance(
      rootMidiNumber,
      noteDetails.midiNumber,
    );
    const existingCompoundIntervals =
      compoundIntervalsByClass.get(intervalClass) ?? [];

    compoundIntervalsByClass.set(intervalClass, [
      ...existingCompoundIntervals,
      compoundSemitones,
    ]);
  });

  return new Map(
    Array.from(compoundIntervalsByClass.entries()).map(
      ([intervalClass, compoundSemitones]) => [
        intervalClass,
        compoundSemitones.sort(sortNumeric),
      ],
    ),
  );
};

const getResolvedPatternDisplay = (pattern, compoundIntervalsByClass) => {
  if (!pattern) {
    return null;
  }

  if (!pattern.voicingVariants) {
    return pattern;
  }

  const compoundSemitones =
    compoundIntervalsByClass.get(pattern.voicingVariants.intervalClass) ?? [];
  const useExtendedVariant = compoundSemitones.some(
    (semitones) => semitones > 11,
  );

  return {
    ...pattern,
    name: useExtendedVariant
      ? pattern.voicingVariants.extendedName
      : pattern.voicingVariants.compactName,
    symbol: useExtendedVariant
      ? pattern.voicingVariants.extendedSymbol
      : pattern.voicingVariants.compactSymbol,
  };
};

const compareCandidateMatches = (leftMatch, rightMatch, bassNoteIndex) => {
  const leftUsesBass = Number(leftMatch.rootNoteIndex === bassNoteIndex);
  const rightUsesBass = Number(rightMatch.rootNoteIndex === bassNoteIndex);

  if (leftUsesBass !== rightUsesBass) {
    return rightUsesBass - leftUsesBass;
  }

  if (leftMatch.intervals.length !== rightMatch.intervals.length) {
    return rightMatch.intervals.length - leftMatch.intervals.length;
  }

  return leftMatch.pattern.priority - rightMatch.pattern.priority;
};

const getPatternMatch = (intervals) => {
  const matchingPatterns = chordPatternDefinitions
    .map((definition) => {
      const hasAllRequiredIntervals = definition.requiredIntervals.every(
        (interval) => intervals.includes(interval),
      );

      if (!hasAllRequiredIntervals) {
        return null;
      }

      const hasOnlyAllowedIntervals = intervals.every((interval) =>
        definition.allowedIntervalSet.has(interval),
      );

      if (!hasOnlyAllowedIntervals) {
        return null;
      }

      const matchedOptionalCount = definition.optionalIntervals.filter(
        (interval) => intervals.includes(interval),
      ).length;

      return {
        pattern: definition,
        matchedOptionalCount,
      };
    })
    .filter(Boolean);

  if (matchingPatterns.length === 0) {
    return null;
  }

  matchingPatterns.sort((leftMatch, rightMatch) => {
    const leftRequiredCount = leftMatch.pattern.requiredIntervals.length;
    const rightRequiredCount = rightMatch.pattern.requiredIntervals.length;

    if (leftRequiredCount !== rightRequiredCount) {
      return rightRequiredCount - leftRequiredCount;
    }

    if (leftMatch.matchedOptionalCount !== rightMatch.matchedOptionalCount) {
      return rightMatch.matchedOptionalCount - leftMatch.matchedOptionalCount;
    }

    return leftMatch.pattern.priority - rightMatch.pattern.priority;
  });

  return matchingPatterns[0].pattern;
};

const getChordDescription = ({
  rootNote,
  bassNote,
  bassNoteIndex,
  rootNoteIndex,
  pattern,
}) => {
  if (pattern) {
    return bassNote && bassNoteIndex !== rootNoteIndex
      ? `${rootNote} ${pattern.name} over ${bassNote}`
      : `${rootNote} ${pattern.name}`;
  }

  return bassNote ? `Custom voicing over ${bassNote}` : "Custom voicing";
};

const createChordResult = ({
  bassNoteIndex,
  noteNames,
  pattern,
  rootNoteIndex,
  intervals,
  compoundIntervalsByClass,
}) => {
  const rootNote = noteNames[rootNoteIndex];
  const bassNote = bassNoteIndex === null ? null : noteNames[bassNoteIndex];
  const isSingleNote = intervals.length === 1;
  const displayPattern = getResolvedPatternDisplay(
    pattern,
    compoundIntervalsByClass,
  );
  const baseSymbol = displayPattern
    ? `${rootNote}${displayPattern.symbol}`
    : isSingleNote
      ? rootNote
      : null;

  return {
    rootNoteIndex,
    bassNoteIndex,
    rootNote,
    bassNote,
    pattern: displayPattern,
    isKnown: Boolean(displayPattern),
    symbol:
      baseSymbol && bassNote && bassNoteIndex !== rootNoteIndex
        ? `${baseSymbol}/${bassNote}`
        : baseSymbol,
    description: displayPattern
      ? getChordDescription({
          rootNote,
          bassNote,
          rootNoteIndex,
          bassNoteIndex,
          pattern: displayPattern,
        })
      : isSingleNote
        ? `${rootNote} note`
        : getChordDescription({
            rootNote,
            bassNote,
            rootNoteIndex,
            bassNoteIndex,
            pattern: null,
          }),
    intervals: intervals.map((semitones) => ({
      semitones,
      label: defaultIntervalLabels[semitones] ?? `${semitones}`,
    })),
  };
};

export const getBassRelativeIntervalLabel = (semitones) =>
  typeof semitones === "number"
    ? getDefaultIntervalLabel(semitones)
    : getRelativeIntervalLabel(semitones);

const getRelativeIntervalLabel = ({
  rootMidiNumber,
  rootNoteIndex,
  noteMidiNumber,
  noteIndex,
}) => {
  if (
    rootMidiNumber === null ||
    rootMidiNumber === undefined ||
    rootNoteIndex === null ||
    rootNoteIndex === undefined
  ) {
    return null;
  }

  const intervalClass = (noteIndex - rootNoteIndex + 12) % 12;
  const compoundSemitones = getFunctionalCompoundSemitoneDistance(
    rootMidiNumber,
    noteMidiNumber,
  );

  if (
    compoundSemitones > 11 &&
    Object.prototype.hasOwnProperty.call(
      compoundIntervalExtensionLabels,
      intervalClass,
    )
  ) {
    return compoundIntervalExtensionLabels[intervalClass];
  }

  return getDefaultIntervalLabel(intervalClass);
};

export const getRootRelativeIntervalLabel = ({
  rootMidiNumber,
  rootNoteIndex,
  noteMidiNumber,
  noteIndex,
}) =>
  getRelativeIntervalLabel({
    rootMidiNumber,
    rootNoteIndex,
    noteMidiNumber,
    noteIndex,
  });

const identifyChordMatches = ({
  noteIndexes,
  noteNames,
  bassNoteIndex = null,
  preferredRootNoteIndex = null,
  preferredRootMidiNumber = null,
  selectedNotes = [],
}) => {
  const uniqueNoteIndexes = getUniqueNoteIndexes(noteIndexes);

  if (uniqueNoteIndexes.length === 0) {
    return [];
  }

  const candidateRootIndexes =
    preferredRootNoteIndex === null
      ? uniqueNoteIndexes
      : [preferredRootNoteIndex];
  const candidateMatches = candidateRootIndexes
    .map((rootNoteIndex) => {
      const rootMidiNumber =
        rootNoteIndex === preferredRootNoteIndex &&
        preferredRootMidiNumber !== null
          ? preferredRootMidiNumber
          : getLowestSelectedMidiNumberForNoteIndex(
              selectedNotes,
              rootNoteIndex,
            );
      const intervals = getNormalizedIntervalSet(
        rootNoteIndex,
        uniqueNoteIndexes,
      );
      const compoundIntervalsByClass = getCompoundIntervalsByClass({
        rootMidiNumber,
        rootNoteIndex,
        selectedNotes,
      });

      return {
        rootNoteIndex,
        intervals,
        pattern: getPatternMatch(intervals),
        compoundIntervalsByClass,
      };
    })
    .filter(
      ({ pattern }) => preferredRootNoteIndex !== null || pattern !== null,
    );

  if (candidateMatches.length === 0) {
    if (preferredRootNoteIndex !== null) {
      return [
        createChordResult({
          bassNoteIndex,
          noteNames,
          pattern: null,
          rootNoteIndex: preferredRootNoteIndex,
          intervals: getNormalizedIntervalSet(
            preferredRootNoteIndex,
            uniqueNoteIndexes,
          ),
          compoundIntervalsByClass: getCompoundIntervalsByClass({
            rootMidiNumber: preferredRootMidiNumber,
            rootNoteIndex: preferredRootNoteIndex,
            selectedNotes,
          }),
        }),
      ];
    }

    if (uniqueNoteIndexes.length === 1) {
      return [
        createChordResult({
          bassNoteIndex,
          noteNames,
          pattern: null,
          rootNoteIndex: uniqueNoteIndexes[0],
          intervals: [0],
          compoundIntervalsByClass: new Map(),
        }),
      ];
    }

    return [];
  }

  candidateMatches.sort((leftMatch, rightMatch) =>
    compareCandidateMatches(leftMatch, rightMatch, bassNoteIndex),
  );

  return candidateMatches.map((match) =>
    createChordResult({
      bassNoteIndex,
      noteNames,
      pattern: match.pattern,
      rootNoteIndex: match.rootNoteIndex,
      intervals: match.intervals,
      compoundIntervalsByClass: match.compoundIntervalsByClass,
    }),
  );
};

export const identifyChordMatch = (options) => {
  const [bestMatch = null] = identifyChordMatches(options);

  return bestMatch;
};

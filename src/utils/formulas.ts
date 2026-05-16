// Asphalt formulas
export const asphalt = {
  cubicFeet: (lengthFt: number, widthFt: number, depthFt: number) =>
    lengthFt * widthFt * depthFt,
  cubicYards: (cubicFeet: number) => cubicFeet / 27,
  tons: (cubicYards: number, density = 1.4) => cubicYards * density,
  sqYardsToTons: (sqYards: number, depthInches: number, density = 1.4) =>
    (sqYards * depthInches / 324) * density,
};

// Roof pitch formulas
export const roofPitch = {
  factor: (rise: number, run: number) =>
    Math.sqrt(rise * rise + run * run) / run,
  angleDeg: (rise: number, run: number) =>
    Math.atan(rise / run) * (180 / Math.PI),
  roofArea: (baseArea: number, factor: number) => baseArea * factor,
};

// Gravel formulas
export const gravel = {
  cubicYards: (lengthFt: number, widthFt: number, depthFt: number) =>
    (lengthFt * widthFt * depthFt) / 27,
  tons: (cubicYards: number, density: number) => cubicYards * density,
  coverage: (tons: number, depthInches: number) =>
    (tons * 2000) / (depthInches * 100),
  weight: (cubicYards: number, lbsPerCubicYard: number) =>
    cubicYards * lbsPerCubicYard,
};

// Sod formulas
export const sod = {
  pallets: (sqft: number, sqftPerPallet = 450) => sqft / sqftPerPallet,
  rolls: (sqft: number, sqftPerRoll = 10) => sqft / sqftPerRoll,
  pieces: (sqft: number, sqftPerPiece = 2.75) => sqft / sqftPerPiece,
  palletWeight: (pallets: number, lbsPerPallet = 2000) =>
    pallets * lbsPerPallet,
};

// Pool formulas
export const pool = {
  rectangular: (length: number, width: number, depth: number) =>
    length * width * depth * 7.48,
  circular: (diameter: number, depth: number) =>
    Math.PI * (diameter / 2) ** 2 * depth * 7.48,
  oval: (longDiameter: number, shortDiameter: number, depth: number) =>
    Math.PI * (longDiameter / 2) * (shortDiameter / 2) * depth * 7.48,
};

// Stair formulas
export const stairs = {
  numberOfSteps: (totalRise: number, idealRiser = 7.5) =>
    Math.round(totalRise / idealRiser),
  riserHeight: (totalRise: number, steps: number) => totalRise / steps,
  angle: (rise: number, run: number) =>
    Math.atan(rise / run) * (180 / Math.PI),
};

// Ramp formulas
export const ramp = {
  length: (rise: number, slopeRatio: number) => rise * slopeRatio,
  angle: (rise: number, length: number) =>
    Math.atan(rise / length) * (180 / Math.PI),
  volume: (length: number, width: number, rise: number) =>
    (length * width * rise) / 2,
  surfaceArea: (length: number, width: number) => length * width,
};

// Unit conversions
export const conversions = {
  inchesToFeet: (inches: number) => inches / 12,
  feetToInches: (feet: number) => feet * 12,
  metersToFeet: (meters: number) => meters * 3.28084,
  yardsToFeet: (yards: number) => yards * 3,
};

import { TileInput, CalculationResult, CutType, TileConfig } from '../types';

export const calculateItem = (item: TileInput, config: TileConfig): CalculationResult => {
  const { width, height, quantity, bevelWidth, bevelHeight } = item;

  // 1. Standardization
  // "Finished Long" is the longer side, "Finished Short" is the shorter side.
  const finishedLong = Math.max(width, height);
  const finishedShort = Math.min(width, height);

  // Determine Base Dimensions from Config
  const baseLong = Math.max(config.baseWidth, config.baseHeight);
  const baseShort = Math.min(config.baseWidth, config.baseHeight);

  let cutType = CutType.DOUBLE;
  let cutCount = 0;

  // 2. Cutting Logic
  // If Finished Long = Base Long OR Finished Short = Base Short -> Single Cut.
  // Match Base Size -> No Cut.
  
  const matchesLong = finishedLong === baseLong;
  const matchesShort = finishedShort === baseShort;

  if (matchesLong && matchesShort) {
    cutType = CutType.NONE;
    cutCount = 0;
  } else if (matchesLong || matchesShort) {
    cutType = CutType.SINGLE;
    cutCount = 1;
  } else {
    cutType = CutType.DOUBLE;
    cutCount = 2;
  }

  // Total Cut Fee
  const cutFee = cutCount * quantity * config.cutRate;

  // 3. Internal Beveling Logic
  let singlePieceBevelMeters = 0;
  if (bevelWidth) singlePieceBevelMeters += width / 100;
  if (bevelHeight) singlePieceBevelMeters += height / 100;
  
  const totalBevelLength = singlePieceBevelMeters * quantity;
  const bevelFee = totalBevelLength * config.bevelRate;

  // 4. Trimming Logic (V7.0 Adaptive)
  
  // Calculate Dynamic Thresholds based on Base Size
  // 50% Thresholds
  const THRESHOLD_HALF_LONG = baseLong * 0.5;
  const THRESHOLD_HALF_SHORT = baseShort * 0.5;
  
  // 30% Thresholds (Tiny Piece)
  const THRESHOLD_TINY_LONG = baseLong * 0.3;
  const THRESHOLD_TINY_SHORT = baseShort * 0.3;

  let singlePieceTrimMeters = 0;
  let trimDetails = "";

  if (cutType === CutType.NONE) {
    singlePieceTrimMeters = 0;
    trimDetails = "原尺寸无需修边";
  } else if (cutType === CutType.SINGLE) {
    // Single Cut Logic
    
    let lTrimCm = 0;
    let sDimCm = 0; // The S dimension (the resulting width)

    if (matchesLong) {
      lTrimCm = finishedLong; 
      sDimCm = finishedShort; 
    } else {
      lTrimCm = finishedShort; 
      sDimCm = finishedLong; 
    }

    const lTrimM = lTrimCm / 100;
    
    // Premium Check (Compare S against 50% of Base Short)
    // E.g. for 60x120, compare against 30cm.
    if (sDimCm < THRESHOLD_HALF_SHORT) {
      singlePieceTrimMeters = lTrimM * 2;
      trimDetails = `单刀窄板(S=${sDimCm}<${THRESHOLD_HALF_SHORT}): ${lTrimM}m × 2`;
    } else {
      singlePieceTrimMeters = lTrimM * 1;
      trimDetails = `单刀标准(S=${sDimCm}≥${THRESHOLD_HALF_SHORT}): ${lTrimM}m × 1`;
    }

  } else {
    // Double Cut Logic
    // Step 1: Tiny Piece Check
    if (finishedLong < THRESHOLD_TINY_LONG || finishedShort < THRESHOLD_TINY_SHORT) {
      // Full Perimeter
      singlePieceTrimMeters = ((finishedLong + finishedShort) * 2) / 100;
      trimDetails = `极小件(L<${THRESHOLD_TINY_LONG}或S<${THRESHOLD_TINY_SHORT}): 周长修边`;
    } else {
      // Step 2: Standard Double Cut Logic
      // Long Side Check (Compare against 50% Base Long)
      let longMult = 1;
      if (finishedLong < THRESHOLD_HALF_LONG) longMult = 2;

      // Short Side Check (Compare against 50% Base Short)
      let shortMult = 1;
      if (finishedShort < THRESHOLD_HALF_SHORT) shortMult = 2;

      const longPart = (finishedLong / 100) * longMult;
      const shortPart = (finishedShort / 100) * shortMult;
      
      singlePieceTrimMeters = longPart + shortPart;
      trimDetails = `双刀: 长边(${longMult}倍) + 短边(${shortMult}倍)`;
    }
  }

  const totalTrimLength = singlePieceTrimMeters * quantity;
  const trimFee = totalTrimLength * config.trimRate;

  return {
    id: item.id,
    cutType,
    cutCount: cutCount * quantity, // Total cuts for all items
    cutFee,
    trimLength: totalTrimLength,
    trimFee,
    trimDetails,
    bevelLength: totalBevelLength,
    bevelFee,
    totalFee: cutFee + trimFee + bevelFee,
    finishedLong,
    finishedShort
  };
};
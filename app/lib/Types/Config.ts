export type TypeConfig = {
  name: string;
  mbGenSize: number,
  mbMovingAverage: number,
  mbMutationProbability: number,
  mbPopSize: number,
  smrGenSize: number,
  smrMovingAverage: number,
  smrMutationProbability: number,
  smrPopSize: number,
  pressureLowerbound: number,
  pressureUpperbound: number,
  temperatureLowerbound: number,
  temperatureUpperbound: number,
  steamCarbonRatioLowerbound: number,
  steamCarbonRatioUpperbound: number,
  standardPressure: number,
  ch4: number,
  c2h6: number,
  c3h8: number,
  ic4: number,
  nc4: number,
  ic5: number,
  nc5: number,
  ic6: number,
  nc6: number,
  co2: number,
  h2: number,
  n2: number,
  userid: string
}
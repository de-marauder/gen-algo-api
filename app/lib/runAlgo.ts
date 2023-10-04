import { Stop } from './Algorithm/SMR/types';
import { main as genAlgo } from './Algorithm/main';
import { Config } from './Types/algo';


export async function runAlgo(config: Config) {

  try {
    return {
      run: genAlgo({
        compositions: {
          ...config.flareGasComposition
        },
        smrConfig: {
          ...config.smrConfig
        },
        mbConfig: {
          ...config.mbConfig
        },
        traitBoundaries: {
          ...config.traitBoundaries
        },
        standardPressure: config.standardPressure
      }),
      error: null
    }
  } catch (error) {
    return { error: error as Error, run: null }
  }
}

export type AlgoResult = {
  // mbGenSize: number;
  // mbPopSize: number;
  // mbMutationProbability: number;
  // mbMovingAverage: number;
  // smrGenSize: number;
  // smrPopSize: number;
  // smrMutationProbability: number;
  // smrMovingAverage: number;
  // pressureLowerbound: number;
  // pressureUpperbound: number;
  // temperatureLowerbound: number;
  // temperatureUpperbound: number;
  // steamCarbonRatioLowerbound: number;
  // steamCarbonRatioUpperbound: number;
  // standardPressure: number;
  // ch4: number;
  // c2h6: number;
  // c3h8: number;
  // ic4: number;
  // nc4: number;
  // ic5: number;
  // nc5: number;
  // ic6: number;
  // nc6: number;
  // h2: number;
  // n2: number;
  // co2: number;
  config: string;
  stopCondition: Stop // convergence, fitness or max gen_size
  numberOfGenerationsRan: number;
  pressure: number;
  temperature: number;
  steamToCarbonRatio: number;
  outputH2: number;
  outputH2O: number;
  outputCO2: number;
  outputCO: number;
  outputCH4: number;
  timeTaken: string;
}
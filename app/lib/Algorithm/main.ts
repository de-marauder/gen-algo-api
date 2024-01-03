import { SMRGeneticsAlgorithm } from './SMR';
import { Compositions, IndividualConfig } from './SMR/types';

export const main = ({
  compositions,
  smrConfig,
  mbConfig,
  traitBoundaries,
  standardPressure
}: {
  compositions: Compositions;
  smrConfig: {
    smrPopSize: number;
    smrGenSize: number;
    smrMovingAverage: number;
    smrMutationProbability: number;
  };
  mbConfig: {
    mbPopSize: number;
    mbGenSize: number;
    mbMovingAverage: number;
    mbMutationProbability: number;
  };
  traitBoundaries: IndividualConfig;
  standardPressure: number
}) => {
  // try {
  // Create new GeneticsAlgorithm
  // start a while loop that terminates when stopping criteria is reached or gen_size is reached
  // In the loop create next generation
  // On termination of loop
  // log generations to console
  const start = Date.now();
  const algo = new SMRGeneticsAlgorithm(
    { compositions },
    {
      smrConfig: {
        genSize: smrConfig.smrGenSize,
        popSize: smrConfig.smrPopSize,
        movingAverage: smrConfig.smrMovingAverage,
        mutationProbability: smrConfig.smrMutationProbability
      },
      mbConfig: {
        genSize: mbConfig.mbGenSize,
        popSize: mbConfig.mbPopSize,
        movingAverage: mbConfig.mbMovingAverage,
        mutationProbability: mbConfig.mbMutationProbability
      },
      traitBoundaries,
      standardPressure
    }
  );

  let id = 0;
  while (!algo.stop) {
    algo.createNextGeneration();

    id++;
  }
  
  console.log(`\n======= BEST SMR Individual ========`);
  console.log('traits: ', algo.population.population[0].traits);
  console.log('H2: ', algo.population.population[0].fitness);
  console.log('CO2: ', algo.population.population[0].y);
  console.log('CH4: ', algo.population.population[0].a);
  console.log('CO: ', algo.population.population[0].b);
  console.log('H2O: ', algo.population.population[0].h);
  console.log('K1K2: ', algo.population.population[0].K1K2);
  console.log('K: ', algo.population.population[0].k);
  console.log('f: ', algo.population.population[0].f);
  console.log('e: ', algo.population.population[0].error);
  console.log('=====================================\n');
  const end = Date.now();
  console.log(
    `============== time taken: ${(end - start) / 1000 / 60
    } mins ===============\n`
  );
  return {
    result: algo,
    timeTaken: `${(end - start) / 1000 / 60} mins`
  }
};

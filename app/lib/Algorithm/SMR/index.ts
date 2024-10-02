import { SMRIndividual } from './Individual';
import { Population } from './Population';
import {
  defaultNewIndividualTraits,
  getRandomNumberInRange,
  roundToNearestInteger
} from '../helpers/functions';
import {
  AlgoConfig,
  Compositions,
  IndividualConfig,
  SMRIndividualType,
  SMRTraits,
  Stop
} from './types';

export class SMRGeneticsAlgorithm {
  generations: SMRIndividual[][] = [];
  population: Population;
  private config: Required<AlgoConfig>;
  mutationCounter: number = 0;
  mbConfig: AlgoConfig;
  traitBoundaries: IndividualConfig;
  standardPressure: number
  compositions: Compositions
  stoppedBy: Stop = 'maxGen'

  // Creates initial random population
  constructor(
    {
      compositions
    }: {
      compositions: Compositions;
    },
    config: {
      smrConfig: AlgoConfig;
      mbConfig: AlgoConfig;
      traitBoundaries: IndividualConfig;
      standardPressure: number
    },
  ) {
    this.compositions = compositions
    this.mbConfig = config.mbConfig;
    this.traitBoundaries = config.traitBoundaries;
    this.standardPressure = config.standardPressure;
    SMRIndividual.traitBoundaries = this.traitBoundaries
    this.config = { ...config.smrConfig };
    this.population = new Population(this.config.popSize, compositions);
    this.population.spawnPopulation({
      mbConfig: config.mbConfig,
      traitBoundaries: config.traitBoundaries,
      standardPressure: this.standardPressure,
      flareGasComposition: this.compositions
    });
  }

  // Implements the breeding process to create a new generation and update the current population
  createNextGeneration(): void {
    for (let i = 0; i < this.population.size; i++) {
      const { individualA, individualB } = this.selectIndividuals();
      let newIndividual = this.crossover(individualA, individualB);
      const willMutate = this.willMutate();

      if (willMutate) {
        // mutatate new individual in place
        newIndividual = this.mutation(newIndividual);
      }

      this.population.children.push(newIndividual);
    }
    this.generations.push([...this.population.population]);
    this.population.generateNewPopulation();
  }

  // Selects two Individuals to mate for crossover
  // Selection favours better fit individuals in the population
  selectIndividuals() {
    // Adaptive probabilities based on generation progress
    const progress = this.generations.length / this.config.genSize;
    const tournamentProb = 0.3 + 0.4 * progress; // Increases over time
    const biasedRouletteProb = 0.4 - 0.2 * progress; // Decreases over time
    // Standard roulette takes the remaining probability

    const rand = Math.random();

    let individualA: SMRIndividual;
    let individualB: SMRIndividual;

    if (rand < tournamentProb + biasedRouletteProb) {
      individualA = this.biasedRouletteSelection();
      individualB = this.biasedRouletteSelection();
    } else if (rand < tournamentProb) {
      individualA = this.tournamentSelection();
      individualB = this.tournamentSelection();
    } else {
      individualA = this.standardRouletteSelection();
      individualB = this.standardRouletteSelection();
    }

    // Ensure individuals are different
    while (individualA === individualB) {
      individualB = this.selectRandomMethod();
    }

    return { individualA, individualB };
  }

  // Helper method to select a random selection method
  private selectRandomMethod(): SMRIndividual {
    const rand = Math.random();
    if (rand < 0.33) {
      return this.tournamentSelection();
    } else if (rand < 0.66) {
      return this.biasedRouletteSelection();
    } else {
      return this.standardRouletteSelection();
    }
  }

  // Implements the tournament selection procedure
  // Two unique individuals are chosen from the population at random
  // The better fit individual out of the two is returned
  tournamentSelection(): SMRIndividual {
    const a = roundToNearestInteger(
      Math.random() * (this.config.popSize - 1)
    );
    let b = roundToNearestInteger(
      Math.random() * (this.config.popSize - 1)
    );
    while (a === b)
      b = roundToNearestInteger(
        Math.random() * (this.config.popSize - 1)
      );

    const individualA = this.population.population[a];
    const individualB = this.population.population[b];

    if (individualA.fitness > individualB.fitness) return individualA;
    else return individualB;
  }

  // Implements the biased roulette wheel selection approach
  // A probability distribution is created based on the fitness of each individual
  // A cummulation of the distribution is evaluated
  // An individual is then selected randomly from the cummulated probability distribution
  standardRouletteSelection(): SMRIndividual {
    const fitnessArr = this.population.population.map(el => el.fitness);
    // Since higher fitness values is preferred
    // we just take the quotient of the fitness and sum of fitnesses
    const sum = fitnessArr.reduce((prev, curr) => prev + curr);
    const probabilityDistribution = fitnessArr.map(el => el / sum);

    const cummulatedProbabilityDistribution: number[] = [];
    let cummulatedSum = 0;
    for (let i = 0; i < probabilityDistribution.length; i++) {
      cummulatedSum = cummulatedSum + probabilityDistribution[i];
      cummulatedProbabilityDistribution.push(cummulatedSum);
    }

    const randProb = Math.random();

    for (let i = 0; i < cummulatedProbabilityDistribution.length; i++) {
      if (cummulatedProbabilityDistribution[i] > randProb) {
        return this.population.population[i];
      }
    }
    // If we reach here due to floating-point precision issues,
    // return the last individual
    return this.population.population[this.population.population.length - 1];
  }

  biasedRouletteSelection(): SMRIndividual {
    // Sort the population by fitness in descending order and get their ranks
    const rankedPopulation = this.population.population
      .map((individual, index) => ({ individual, fitness: individual.fitness }))
      // .sort((a, b) => b.fitness - a.fitness)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const populationSize = rankedPopulation.length;

    // Calculate rank-based selection probabilities
    // Using a linear ranking: P(rank) = (2-s)/N + 2*rank*(s-1)/(N*(N-1))
    // where s is the selection pressure (usually between 1.0 and 2.0)
    const s = 1.5; // Adjust this value to change selection pressure
    const rankProbabilities = rankedPopulation.map(({ rank }) =>
      (2 - s) / populationSize + 2 * rank * (s - 1) / (populationSize * (populationSize - 1))
    );

    // Calculate cumulative probabilities
    const cumulativeProbabilities: number[] = [];
    let cumulativeSum = 0;
    for (const probability of rankProbabilities) {
      cumulativeSum += probability;
      cumulativeProbabilities.push(cumulativeSum);
    }

    // Select an individual using the cumulative probabilities
    const randProb = Math.random();
    let i = 0;
    for (; i < cumulativeProbabilities.length; i++) {
      if (cumulativeProbabilities[i] > randProb) {
        return rankedPopulation[i].individual;
      }
    }

    // If we reach here due to floating-point precision issues,
    // return the last individual
    return this.population.population[this.population.population.length - 1];
  }

  getMutationProbability(): number {
    const probability = 1 - this.getCrossOverProbability();
    return probability
  }

  getCrossOverProbability(): number {
    const probability = (this.generations.length / this.config.genSize);
    return probability
  }

  // Combines two individual's traits to form a new individual
  // Mode 1: Averaging
  // Mode 2: random selection of certain traits
  crossover(
    individualA: SMRIndividual,
    individualB: SMRIndividual
  ): SMRIndividual {
    // const crossOverProbability = this.getCrossOverProbability()
    const crossOverProbability = 2

    // If the crossover probability is not met, return the better individual
    if (crossOverProbability < Math.random()) {
      if (individualA.fitness > individualB.fitness) return individualA
      else return individualB
    }
    const modeSelectorProbabilty = Math.random();
    if (modeSelectorProbabilty > 0.5) {
      // Do Mode 1
      return this.crossOverByRandomBiasedAveraging(individualA, individualB);
    } else {
      // Do mode 2
      return this.crossOverByRandomSelection(individualA, individualB);
    }
  }

  // Averages all the individual traits
  // Weights for averaging are selected randomly and
  // Biased to favour better parent's traits
  crossOverByRandomBiasedAveraging(
    individualA: SMRIndividual,
    individualB: SMRIndividual
  ): SMRIndividual {
    const newIndividualTraits: SMRIndividualType = {
      pressure: 0,
      temperature: 0,
      steamCarbonRatio: 0
    };
    const probability = Math.random();
    const better = Math.max(individualA.fitness, individualB.fitness);

    // console.log('=======================================')
    // console.log()
    // console.log('=======================================')
    // console.log('probability: ', probability, '   better: ', better)
    // console.log('individualA.traits before: ', individualA.traits, individualA.fitness)
    // console.log('individualB.traits before: ', individualB.traits, individualB.fitness)
    for (const k in newIndividualTraits) {
      if (individualA.fitness === better && probability > 0.5) {
        newIndividualTraits[k as SMRTraits] = +(
          (probability * individualA.traits[k as SMRTraits]) +
          ((1 - probability) * individualB.traits[k as SMRTraits])
        ).toFixed(4);
      } else if (individualA.fitness === better && probability < 0.5) {
        newIndividualTraits[k as SMRTraits] = +(
          ((1 - probability) * individualA.traits[k as SMRTraits]) +
          (probability * individualB.traits[k as SMRTraits])
        ).toFixed(4);
      } else if (individualB.fitness === better && probability > 0.5) {
        newIndividualTraits[k as SMRTraits] = +(
          ((1 - probability) * individualA.traits[k as SMRTraits]) +
          (probability * individualB.traits[k as SMRTraits])
        ).toFixed(4);
      } else if (individualB.fitness === better && probability < 0.5) {
        newIndividualTraits[k as SMRTraits] = +(
          (probability * individualA.traits[k as SMRTraits]) +
          ((1 - probability) * individualB.traits[k as SMRTraits])
        ).toFixed(4);
      }
    }
    // console.log('crossOverByRandomBiasedAveraging traits: ', newIndividualTraits)

    return new SMRIndividual(
      {
        mbConfig: this.mbConfig,
        traitBoundaries: this.traitBoundaries,
        standardPressure: this.standardPressure,
        flareGasComposition: this.compositions
      },
      newIndividualTraits
    );
  }

  // selects a random trait from either parent based on a random probabilty (50% chance of A or B)
  // The other traits are then filled in from the other parent
  crossOverByRandomSelection(
    individualA: SMRIndividual,
    individualB: SMRIndividual
  ): SMRIndividual {
    const newIndividualTraits = { ...defaultNewIndividualTraits };

    const traitsList = Object.entries(newIndividualTraits);
    const probability = Math.random();
    const randomId = roundToNearestInteger(
      Math.random() * (traitsList.length - 1)
    );
    const randKey = traitsList[randomId][0];
    const othersList = traitsList.filter((_, id) => id !== randomId);

    // console.log('=======================================')
    // console.log()
    // console.log('=======================================')
    // console.log('probability: ', probability, '   better: ', randKey)
    // console.log('individualA.traits before: ', individualA.traits, individualA.fitness)
    // console.log('individualB.traits before: ', individualB.traits, individualB.fitness)
    if (probability < 0.5) {
      // select randKey from A and the others from B
      newIndividualTraits[randKey as SMRTraits] =
        individualA.traits[randKey as SMRTraits];

      for (const [k] of othersList) {
        newIndividualTraits[k as SMRTraits] =
          individualB.traits[k as SMRTraits];
      }
    } else {
      // select randKey from B and the others from A
      newIndividualTraits[randKey as SMRTraits] =
        individualB.traits[randKey as SMRTraits];

      for (const [k] of othersList) {
        newIndividualTraits[k as SMRTraits] =
          individualA.traits[k as SMRTraits];
      }
    }
    // console.log('crossOverByRandomSelection traits: ', newIndividualTraits)

    return new SMRIndividual(
      {
        mbConfig: this.mbConfig,
        traitBoundaries: this.traitBoundaries,
        standardPressure: this.standardPressure,
        flareGasComposition: this.compositions
      },
      newIndividualTraits
    );
  }

  // Changes certain traits of an individual to encourage randomness in algorithm
  // Select number of traits to change randomly
  // Get their keys
  // Change them
  mutation(individualA: SMRIndividual): SMRIndividual {
    // individualA.getFitness()
    // console.log('=======================================')
    // console.log()
    // console.log('=======================================')
    const newIndividualTraits = { ...individualA.traits };
    const traitsList = Object.entries(newIndividualTraits);
    // console.log('before mutating traits: ', newIndividualTraits)

    const numberOfTraitsToChange = roundToNearestInteger(
      Math.random() * traitsList.length
    );
    const idList: Array<number> = [];
    for (let i = 0; i < numberOfTraitsToChange; i++) {
      const randomId = roundToNearestInteger(
        Math.random() * (traitsList.length - 1)
      );
      idList.push(randomId);
    }

    const mutableTraits = traitsList.filter((_, id) => idList.includes(id));

    for (const [k] of mutableTraits) {
      newIndividualTraits[k as SMRTraits] = SMRIndividual.generateTrait(
        k as SMRTraits
      );
    }
    // console.log('mutableTraits: ', mutableTraits)
    // console.log('numberOfTraitsToChange: ', numberOfTraitsToChange)
    // console.log('mutated traits: ', newIndividualTraits)
    // console.log('=======================================')
    // console.log()
    // console.log('=======================================')
    const newIndividual = new SMRIndividual(
      {
        mbConfig: this.mbConfig,
        traitBoundaries: this.traitBoundaries,
        standardPressure: this.standardPressure,
        flareGasComposition: this.compositions
      },
      newIndividualTraits
    );

    this.mutationCounter += 1;
    return newIndividual;
  }

  willMutate(): boolean {
    const rand = getRandomNumberInRange(0, 100);
    // const mutatationProbability = this.getMutationProbability()

    // If the mutation probability is not met, return false
    // Otherwise, return true
    // return +rand.toFixed(0) <= mutatationProbability;
    return +rand.toFixed(0) <= this.config.mutationProbability;
  }

  // eveluates stopping criteria
  get stop(): boolean {
    if (this.population.isFit) this.stoppedBy = 'isFit'
    else if (this.hasConverged) this.stoppedBy = 'convergence'
    else if (this.generations.length >= this.config.genSize) this.stoppedBy = 'maxGen'
    return (
      this.population.isFit ||
      this.hasConverged ||
      this.generations.length >= this.config.genSize
    );
  }

  // Checks convergence based on a moving average over a specific number of points.
  // If the last 10 best points are identical, convergence has been reached
  get hasConverged() {
    const movingAverageSize = this.config?.movingAverage ?? 10;
    if (this.generations.length > movingAverageSize) {
      const listOfBestIndividuals = this.generations
        .slice(-1 * movingAverageSize)
        .map(el => el[0]);
      const listOfBestIndividualsFitness = listOfBestIndividuals.map(
        el => el.fitness
      );
      const movingAverage =
        listOfBestIndividualsFitness.reduce(
          (prev, curr) => prev + curr
        ) / movingAverageSize;

      const converged =
        +movingAverage.toFixed(4) === listOfBestIndividualsFitness[0];
      // if (converged) {
      //   console.log(
      //     `========== SMR HAS CONVERGED after ${this.generations.length} genenrations ============`
      //   );
      // }

      return converged;
    }
    return false;
  }
}

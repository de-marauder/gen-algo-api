import { Request, Response } from "express";
import ErrorBoundarySync, { ErrorResponse } from "../../helpers/ErrorBoundarySync";
import { TypeConfig } from "../../lib/Types/Config";
import { ConfigModel } from "../../models/Config";
import { TypeUser } from "../../lib/Types/user";

export const createConfig = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  res, req,
  cb: async () => {
    const configPayload = buildConfig(req.body.config as ConfigBody);
    const user = req.body._user as Required<TypeUser>;
    console.log('config user: ', user)
    configPayload.userid = user._id.toString();
    const config = await ConfigModel.create(configPayload).catch((error) => {
      console.log(error);
      throw new ErrorResponse({ message: 'Error while creating config' })
    });
    console.log('creaed config', config)
    return res.status(201).json({
      status: 'success',
      message: 'Configuration created',
      data: config
    })
  }
})


const buildConfig = (config: ConfigBody) => {
  const build = {
    name: config.name,
    smrPopSize: config.smrConfig.smrPopSize,
    smrGenSize: config.smrConfig.smrGenSize,
    smrMovingAverage: config.smrConfig.smrMovingAverage,
    smrMutationProbability: config.smrConfig.smrMutationProbability,
    mbPopSize: config.mbConfig.mbPopSize,
    mbGenSize: config.mbConfig.mbGenSize,
    mbMovingAverage: config.mbConfig.mbMovingAverage,
    mbMutationProbability: config.mbConfig.mbMutationProbability,
    ch4: config.flareGasComposition.ch4,
    c2h6: config.flareGasComposition.c2h6,
    c3h8: config.flareGasComposition.c3h8,
    ic4: config.flareGasComposition.ic4,
    nc4: config.flareGasComposition.nc4,
    ic5: config.flareGasComposition.ic5,
    nc5: config.flareGasComposition.nc5,
    ic6: config.flareGasComposition.ic6,
    nc6: config.flareGasComposition.nc6,
    h2: config.flareGasComposition.h2,
    n2: config.flareGasComposition.n2,
    co2: config.flareGasComposition.co2,
    standardPressure: config.standardPressure,
    pressureLowerbound: config.traitBoundaries.pressureLowerbound,
    pressureUpperbound: config.traitBoundaries.pressureUpperbound,
    temperatureLowerbound: config.traitBoundaries.temperatureLowerbound,
    temperatureUpperbound: config.traitBoundaries.temperatureUpperbound,
    steamCarbonRatioLowerbound: config.traitBoundaries.steamCarbonRatioLowerbound,
    steamCarbonRatioUpperbound: config.traitBoundaries.steamCarbonRatioUpperbound,
    userid: ''
  }
  return build
}

type ConfigBody = {
  name?: string;
  smrConfig: {
    smrPopSize: number;
    smrGenSize: number;
    smrMovingAverage: number;
    smrMutationProbability: number
  };
  mbConfig: {
    mbPopSize: number;
    mbGenSize: number;
    mbMovingAverage: number;
    mbMutationProbability: number
  };
  flareGasComposition: {
    ch4: number;
    c2h6: number;
    c3h8: number;
    ic4: number;
    nc4: number;
    ic5: number;
    nc5: number;
    ic6: number;
    nc6: number;
    h2: number;
    n2: number;
    co2: number
  };
  standardPressure: number;
  traitBoundaries: {
    pressureLowerbound: number;
    pressureUpperbound: number;
    temperatureLowerbound: number;
    temperatureUpperbound: number;
    steamCarbonRatioLowerbound: number;
    steamCarbonRatioUpperbound: number
  },
}
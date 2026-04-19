import {
  BadRequestException,
} from '@nestjs/common';
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  CreateCompanyLambdaInput,
  CreateCompanyLambdaOutput,
} from './contracts';
import {
  CreateCompanyCommand,
  CreateCompanyUseCase,
} from '../src/application/use-cases/create-company.use-case';
import { CompanyType } from '../src/domain/entities/company.entity';
import { FileStorage } from '../src/infrastructure/persistence/file-storage';
import { JsonCompanyRepository } from '../src/infrastructure/persistence/json-company.repository';
import { mapErrorToResponse } from '../src/infrastructure/http/utils/error-response.mapper';

const fileStorage = new FileStorage();
const companyRepository = new JsonCompanyRepository(fileStorage);
const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);

export const handler = async (
  event: ApiGatewayEvent,
): Promise<ApiGatewayResponse> => {
  try {
    const payload = parseBody(event.body);
    const command: CreateCompanyCommand = {
      taxId: payload.taxId,
      name: payload.name,
      type: payload.type as CompanyType,
      country: payload.country,
    };
    const createdCompany = await createCompanyUseCase.execute(command);

    const response: CreateCompanyLambdaOutput = {
      id: createdCompany.id,
      taxId: createdCompany.taxId,
      name: createdCompany.name,
      type: createdCompany.type,
      country: createdCompany.country,
      registrationDate: createdCompany.registrationDate.toISOString(),
    };

    return jsonResponse(201, response);
  } catch (error) {
    return mapError(error);
  }
};

const parseBody = (body: string | null): CreateCompanyLambdaInput => {
  if (!body) {
    throw new BadRequestException('Request body is required');
  }

  try {
    return JSON.parse(body) as CreateCompanyLambdaInput;
  } catch {
    throw new BadRequestException('Request body must be valid JSON');
  }
};

const mapError = (error: unknown): ApiGatewayResponse => {
  const payload = mapErrorToResponse(error);
  return jsonResponse(payload.statusCode, payload);
};

const jsonResponse = (statusCode: number, body: unknown): ApiGatewayResponse => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify(body),
});

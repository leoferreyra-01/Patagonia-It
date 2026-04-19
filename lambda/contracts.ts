export type CreateCompanyLambdaInput = {
  taxId: string;
  name: string;
  type: 'PYME' | 'CORPORATIVA';
  country?: string;
};

export type CreateCompanyLambdaOutput = {
  id: string;
  taxId: string;
  name: string;
  type: 'PYME' | 'CORPORATIVA';
  country: string;
  registrationDate: string;
};

export type ApiGatewayEvent = {
  body: string | null;
};

export type ApiGatewayResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

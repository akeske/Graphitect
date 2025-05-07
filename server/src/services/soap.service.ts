/** @format */

import * as soap from 'soap';
import { SoapOperation } from '../entities/SoapOperation';

export class SoapService {
  static async analyzeWsdlAndStore(wsdlUrl: string): Promise<void> {
    const client = await soap.createClientAsync(wsdlUrl);
    const description = client.describe();
    const bindings = client.wsdl.definitions.bindings;

    for (const service in description) {
      const ports = description[service];

      for (const port in ports) {
        const operations = ports[port];
        const portBinding = bindings[port];

        for (const opName in operations) {
          const opDesc = operations[opName];

          // Get the actual SOAP action from the binding definition
          const soapAction = (portBinding as any)?.operations?.[opName]?.soapAction || '';

          const operation = SoapOperation.create({
            wsdlUrl,
            service,
            port,
            operation: opName,
            soapAction,
            input: opDesc.input ?? {},
            output: opDesc.output ?? {},
          });

          await operation.save();
        }
      }
    }
  }
}

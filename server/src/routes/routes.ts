/** @format */

import { Router } from 'express';
import { ApiController } from '../controllers/api.controller';
import { WorkspaceController } from '../controllers/workspace.controller';
import { ApiStatusController } from '../controllers/apistatus.controller';
import { SaopController } from '../controllers/soap.controller';
import { ArchitectureController } from '../controllers/architecture.controller';

const apiv1 = Router();

apiv1.get('/api-calls', ApiController.getApis);
apiv1.get('/api-calls/:id/select', ApiController.getApiById);
apiv1.put('/api-calls/:id', ApiController.updateApi);
apiv1.delete('/api-calls/:id', ApiController.deleteApi);
apiv1.get('/api-calls/:workspaceId', ApiController.getApisByWorkspaceId);
apiv1.post('/api-calls', ApiController.createApi);
apiv1.get('/api-calls/:id/test', ApiController.testApiCall);

apiv1.get('/workspaces', WorkspaceController.getWorkspaces);
apiv1.get('/workspaces/:id', WorkspaceController.getWorkspace);
apiv1.get('/workspaces/like-name/:name/:dashCount', WorkspaceController.getWorkspacesLikeByName);
apiv1.post('/workspaces', WorkspaceController.createWorkspace);
apiv1.delete('/workspaces/:id', WorkspaceController.deleteWorkspace);

apiv1.get('/api-statuses/:apiId', ApiStatusController.getStatusesByApiId);

apiv1.post('/analyze-wsdl', SaopController.storeSoap);

apiv1.get('/architectures', ArchitectureController.getArchitectures);
apiv1.post('/architectures', ArchitectureController.createArchitecture);
apiv1.put('/architectures/:id', ArchitectureController.updateArchitecture);
apiv1.get('/architectures/:id', ArchitectureController.getArchitectureById);
apiv1.delete('/architectures/:id', ArchitectureController.deleteArchitecture);

export default apiv1;

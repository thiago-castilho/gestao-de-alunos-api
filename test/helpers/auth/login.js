import apiClient from '../../clients/apiClient.js';
import environment from '../../config/environment.js';

async function login(usuario) {
  return apiClient
    .post(`${environment.apiPath}/auth/login`)
    .send(usuario)
    .timeout(environment.requestTimeout);
}

export {
  login
};

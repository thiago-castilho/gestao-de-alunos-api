import environment from '../../config/environment.js';
import apiClient from '../../clients/apiClient.js';

async function registrarTrabalho(token, alunoId, trabalho) {
  return apiClient
    .post(`${environment.apiPath}/alunos/${alunoId}/trabalhos`)
    .set('Authorization', `Bearer ${token}`)
    .send(trabalho)
    .timeout(environment.requestTimeout);
}

export { registrarTrabalho };
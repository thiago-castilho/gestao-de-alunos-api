import environment from '../../config/environment.js';
import apiClient from '../../clients/apiClient.js';

async function criarAluno(token, aluno) {
  return apiClient
    .post(`${environment.apiPath}/admin/alunos`)
    .set('Authorization', `Bearer ${token}`)
    .send(aluno)
    .timeout(environment.requestTimeout);
};

async function deletarAluno(token, aluno) {
  return apiClient
    .delete(`${environment.apiPath}/admin/alunos/${aluno.id}`)
    .set('Authorization', `Bearer ${token}`)
    .timeout(environment.requestTimeout);
};

export {
  criarAluno,
  deletarAluno
};
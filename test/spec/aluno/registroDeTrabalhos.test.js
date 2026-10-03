import { expect } from 'chai';
import { login } from '../../helpers/auth/login.js';
import { registrarTrabalho } from '../../helpers/aluno/trabalhos.js';

import trabalhos from '../../fixtures/aluno/trabalhos.json' with { type: 'json' };


describe('POST /api/alunos/{alunoId}/trabalhos', () => {
  let token;
  before('Obtém token', async () => {
    const resposta = await login(trabalhos.usuario_valido.login);
    expect(resposta.status).to.be.equal(200);
    token = resposta.body.token;
    expect(token.split('.')).to.have.lengthOf(3);
  });

  it('deve entregar um trabalho com sucesso', async () => {
    const { alunoId, email, senha, ...trabalho } = { ...trabalhos.usuario_valido };
    const resposta = await registrarTrabalho(token, alunoId, trabalho);

    expect(resposta.status).to.be.equal(201);

    const trabalhoCadastrado = resposta.body;

    expect(trabalhoCadastrado.titulo).to.be.equal(trabalho.titulo);
    expect(trabalhoCadastrado.descricao).to.be.equal(trabalho.descricao);
    expect(trabalhoCadastrado.disciplinaId).to.be.equal(trabalho.disciplinaId);
    expect(trabalhoCadastrado.alunoId).to.be.equal(alunoId);
    expect(trabalhoCadastrado.status).to.be.equal('entregue');
    expect(trabalhoCadastrado.nota).to.be.null;
    expect(trabalhoCadastrado.feedback).to.be.null;
    expect(trabalhoCadastrado.dataEntrega).to.not.be.null;
    expect(trabalhoCadastrado.createdAt).to.not.be.null;
    expect(trabalhoCadastrado.updatedAt).to.not.be.null;
    expect(trabalhoCadastrado.id).to.not.be.null;
  });

  it('deve retornar erro 401 ao tentar registrar trabalho sem token', async () => {
    const { alunoId, email, senha, ...trabalho } = { ...trabalhos.usuario_valido };
    const resposta = await registrarTrabalho(null, alunoId, trabalho);
    expect(resposta.status).to.be.equal(401);
  });

  it('deve retornar erro 400 ao tentar registrar trabalho com dados inválidos', async () => {
    const { alunoId, login, ...trabalho } = { ...trabalhos.usuario_valido };
    const dadosSemIdDisciplina = { ...trabalho, disciplinaId: undefined };
    const resposta = await registrarTrabalho(token, alunoId, dadosSemIdDisciplina);
    expect(resposta.status).to.be.equal(400);
  });

  it('deve retornar erro 403 quando o aluno autenticado não for o dono do recurso nem administrador', async () => {
    const { alunoId, login, ...trabalho } = { ...trabalhos.usuario_valido, alunoId: trabalhos.usuario_nao_matriculado_na_disciplina.alunoId };
    const resposta = await registrarTrabalho(token, alunoId, trabalho);
    expect(resposta.status).to.be.equal(403);
    expect(resposta.body.error).to.be.equal('Você só pode acessar os seus próprios dados.');
  });

  it('deve retornar erro 404 ao tentar registrar trabalho em uma disciplina inexistente', async () => {
    const { alunoId, login, ...trabalho } = { ...trabalhos.usuario_valido, disciplinaId: 'disciplina-inexistente' };
    const resposta = await registrarTrabalho(token, alunoId, trabalho);
    expect(resposta.status).to.be.equal(404);
    expect(resposta.body.error).to.be.equal('Disciplina com id "disciplina-inexistente" não encontrada.');
  });

  it('deve retornar erro 409 ao tentar registrar trabalho para um aluno não cadastrado na disciplina', async () => {
    const { alunoId, login, ...trabalho } = { ...trabalhos.usuario_valido, disciplinaId: 'disciplina-historia' };
    const resposta = await registrarTrabalho(token, alunoId, trabalho);
    expect(resposta.status).to.be.equal(409);
    expect(resposta.body.error).to.be.equal('O aluno não está matriculado nesta disciplina.');
  });
});
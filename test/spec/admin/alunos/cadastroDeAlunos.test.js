import { expect } from 'chai';
import { login } from '../../../helpers/auth/login.js';
import { criarAluno, deletarAluno } from '../../../helpers/admin/alunos.js';

import cadastroDeAlunos from '../../../fixtures/admin/alunos/cadastroDeAlunos.json' with { type: 'json' };
import loginData from '../../../fixtures/auth/login.json' with { type: 'json' };
import dadosUsuariosCadastrados from '../../../data/dadosDosUsuarios.json' with { type: 'json' };

describe('POST /api/admin/alunos', () => {
  let token;
  let alunoCadastrado;

  before('Obtém token', async () => {
    const resposta = await login(loginData.admin);
    expect(resposta.status).to.be.equal(200);
    token = resposta.body.token;
    expect(token.split('.')).to.have.lengthOf(3);
  });

  afterEach('Deleta o aluno cadastrado', async () => {
    if (!alunoCadastrado?.id) return;
    const resposta = await deletarAluno(token, alunoCadastrado);
    expect(resposta.status).to.be.equal(204);
    alunoCadastrado = undefined;
  });

  it(`deve cadastrar um aluno com sucesso quando todos os campos forem preenchidos e estiver logado como admin`, async () => {
    const aluno = cadastroDeAlunos.usuario_valido;
    const resposta = await criarAluno(token, aluno);
    expect(resposta.status).to.be.equal(201);
    alunoCadastrado = resposta.body;

    expect(alunoCadastrado.id).to.not.be.empty;
    expect(alunoCadastrado.nome).to.be.equal(aluno.nome);
    expect(alunoCadastrado.email).to.be.equal(aluno.email);
    expect(alunoCadastrado.matricula).to.be.equal(aluno.matricula);
    expect(alunoCadastrado.role).to.be.equal('aluno');
    expect(alunoCadastrado.createdAt).to.not.be.empty;
    expect(alunoCadastrado.updatedAt).to.not.be.empty;
  });

  it('deve retornar erro 400 quando o nome do aluno não for preenchido', async () => {
    const { nome, ...payloadAlunoSemNome } = cadastroDeAlunos.usuario_valido;
    const resposta = await criarAluno(token, payloadAlunoSemNome);
    expect(resposta.status).to.be.equal(400);
    expect(resposta.body.error).to.be.equal('Os campos "nome", "email", "matricula" e "senha" são obrigatórios.');
  });

  it('deve retornar erro 401 quando o token não for válido', async () => {
    const aluno = cadastroDeAlunos.usuario_valido;
    const resposta = await criarAluno('token_invalido', aluno);
    expect(resposta.status).to.be.equal(401);
    expect(resposta.body.error).to.be.equal('Token de autenticação inválido ou expirado.');
  });

  it('deve retornar erro 403 quando o usuário não for administrador', async () => {
    const respostaLoginAluno = await login(loginData.aluno);
    expect(respostaLoginAluno.status).to.be.equal(200);
    const tokenAluno = respostaLoginAluno.body.token;

    const aluno = cadastroDeAlunos.usuario_valido;
    const resposta = await criarAluno(tokenAluno, aluno);
    expect(resposta.status).to.be.equal(403);
    expect(resposta.body.error).to.be.equal('Você não tem permissão para acessar este recurso.');
  });

  it('deve retornar erro 409 quando o aluno já estiver cadastrado', async () => {
    const { id, role, ...payloadAlunoExistente } = { ...dadosUsuariosCadastrados.aluno };
    const resposta = await criarAluno(token, payloadAlunoExistente);
    expect(resposta.status).to.be.equal(409);
    expect(resposta.body.error).to.be.equal('Já existe um aluno cadastrado com essa matrícula ou e-mail.');
  });
});
import { expect } from "chai";
import { login } from '../../helpers/auth/login.js';

import loginData from '../../fixtures/auth/login.json' with { type: 'json' };
import dadosUsuariosCadastrados from '../../data/dadosDosUsuarios.json' with { type: 'json' };

describe('POST /auth/login', () => {

  it('deve realizar login com credenciais válidas de um usuário administrador', async () => {
    const resposta = await login(loginData.admin);
    validaLogin(resposta);

    const usuarioLogado = resposta.body.usuario;
    validaUsuarioLogado(usuarioLogado, dadosUsuariosCadastrados.admin);
  });

  it('deve realizar login com credenciais válidas de um usuário aluno', async () => {
    const resposta = await login(loginData.aluno);
    validaLogin(resposta);

    const usuarioLogado = resposta.body.usuario;
    validaUsuarioLogado(usuarioLogado, dadosUsuariosCadastrados.aluno);
  });

  it('deve retornar erro 400 quando a senha não for informada', async () => {
    const credenciais = { ...loginData.admin, senha: '' };
    const resposta = await login(credenciais);
    expect(resposta.status).to.be.equal(400);
    expect(resposta.body.error).to.be.equal('Os campos "email" e "senha" são obrigatórios.');
  });

  it('deve retornar erro 400 quando o email não for informado', async () => {
    const credenciais = { ...loginData.admin, email: '' };
    const resposta = await login(credenciais);
    expect(resposta.status).to.be.equal(400);
    expect(resposta.body.error).to.be.equal('Os campos "email" e "senha" são obrigatórios.');
  });

  it('deve retornar erro 401 quando as credenciais forem inválidas', async () => {
    const credenciais = { ...loginData.admin, senha: 'senha_invalida' };
    const resposta = await login(credenciais);
    expect(resposta.status).to.be.equal(401);
    expect(resposta.body.error).to.be.equal('E-mail ou senha inválidos.');
  });
});

function validaUsuarioLogado(usuarioLogado, dadosUsuarioCadastrado) {
  expect(usuarioLogado.id).to.be.equal(dadosUsuarioCadastrado.id);
  expect(usuarioLogado.nome).to.be.equal(dadosUsuarioCadastrado.nome);
  expect(usuarioLogado.email).to.be.equal(dadosUsuarioCadastrado.email);
  expect(usuarioLogado.role).to.be.equal(dadosUsuarioCadastrado.role);
}

function validaLogin(resposta) {
  expect(resposta.status).to.equal(200);
  expect(resposta.body.token).to.be.a('string').and.not.be.empty;
  expect(resposta.body.token.split('.')).to.have.lengthOf(3);
}

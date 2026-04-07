import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      
      
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      const linhas = page.locator('#tabela-alunos tbody tr');
      const linhaJoao = linhas.filter({ hasText: 'João Silva' });

      await expect(linhas).toHaveCount(1);
      await expect(linhaJoao).toHaveCount(1);
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve continuar sem dados reais
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.00
      const celulaMedia = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });

  // ========== GRUPO 3: Validação de Notas ==========

  test.describe('Validação de Notas', () => {

    test('deve rejeitar nota acima de 10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Teste Inválido');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('entre 0 e 10');
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve rejeitar nota abaixo de 0', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Teste Inválido');
      await page.getByLabel('Nota 1').fill('-1');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('entre 0 e 10');
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 4: Busca por Nome ==========

  test.describe('Busca por Nome', () => {

    test('deve exibir apenas o aluno correspondente ao termo buscado', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Carlos Mendes');
      await page.getByLabel('Nota 1').fill('4');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Fernanda Lima');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Buscar por nome').fill('Carlos');

      const linhas = page.locator('#tabela-alunos tbody tr');
      await expect(linhas).toHaveCount(1);
      await expect(linhas.filter({ hasText: 'Carlos Mendes' })).toHaveCount(1);
      await expect(linhas.filter({ hasText: 'Fernanda Lima' })).toHaveCount(0);
    });

  });

  // ========== GRUPO 5: Exclusão de Aluno ==========

  test.describe('Exclusão de Aluno', () => {

    test('deve excluir aluno e deixar a tabela vazia', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Lucas Rocha');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByRole('button', { name: 'Excluir Lucas Rocha' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 6: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test('deve exibir contagens corretas para Aprovado, Recuperação e Reprovado', async ({ page }) => {
      // Aprovado: média esperada = (4+8+10)/3 = 7.33
      await page.getByLabel('Nome do Aluno').fill('Aluno Aprovado');
      await page.getByLabel('Nota 1').fill('4');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Recuperação: média esperada = (3+5+10)/3 = 6
      await page.getByLabel('Nome do Aluno').fill('Aluno Recuperação');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Reprovado: média esperada = (1+3+4)/3 = 2.67
      await page.getByLabel('Nome do Aluno').fill('Aluno Reprovado');
      await page.getByLabel('Nota 1').fill('1');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('4');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#stat-total')).toHaveText('3');
      await expect(page.locator('#stat-aprovados')).toHaveText('1');
      await expect(page.locator('#stat-recuperacao')).toHaveText('1');
      await expect(page.locator('#stat-reprovados')).toHaveText('1');
    });

  });

  // ========== GRUPO 7: Situação do Aluno ==========

  test.describe('Situação do Aluno', () => {

    test('deve exibir "Aprovado" para média >= 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Aprovado');
      await page.getByLabel('Nota 1').fill('4');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (4 + 8 + 10) / 3 = 7.33 → Aprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Aprovado');
    });

    test('deve exibir "Reprovado" para média < 5', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Reprovado');
      await page.getByLabel('Nota 1').fill('1');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('4');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (1 + 3 + 4) / 3 = 2.67 → Reprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Reprovado');
    });

    test('deve exibir "Recuperação" para média >= 5 e < 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Recuperação');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (3 + 5 + 10) / 3 = 6.00 → Recuperação
      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Recuperação');
    });

  });

  // ========== GRUPO 8: Múltiplos Cadastros ==========

  test.describe('Múltiplos Cadastros', () => {

    test('deve cadastrar 3 alunos consecutivos e exibir 3 linhas na tabela', async ({ page }) => {
      const alunos = [
        { nome: 'Aluno Um',   n1: '4', n2: '8', n3: '10' },
        { nome: 'Aluno Dois', n1: '3', n2: '5', n3: '10' },
        { nome: 'Aluno Três', n1: '1', n2: '3', n3: '4'  },
      ];

      for (const aluno of alunos) {
        await page.getByLabel('Nome do Aluno').fill(aluno.nome);
        await page.getByLabel('Nota 1').fill(aluno.n1);
        await page.getByLabel('Nota 2').fill(aluno.n2);
        await page.getByLabel('Nota 3').fill(aluno.n3);
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

  });

});
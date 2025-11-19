# Tela de Gestão CCMs

Esta aplicação React + Vite exibe o dashboard de gestão para os dois CCMs com visão TV para o gestor.

## Como executar um preview local

1. Instale as dependências (apenas na primeira vez):
   ```bash
   npm install
   ```
2. Rode o servidor de desenvolvimento acessível na rede local (mostra mudanças em tempo real):
   ```bash
   npm run dev -- --host --port 4173
   ```
   Depois, abra `http://localhost:4173/gestao` no navegador/TV para ver a tela.
3. Para validar exatamente o build de produção, gere os arquivos e sirva o preview:
   ```bash
   npm run build
   npm run preview -- --host --port 4173
   ```
   O preview também fica disponível em `http://localhost:4173/gestao`.

## Scripts disponíveis
- `npm run dev` – servidor de desenvolvimento Vite.
- `npm run build` – build de produção.
- `npm run preview` – serve o build para conferência.
- `npm run lint` – análise estática com ESLint.

## Tecnologias
- React 19
- React Router 7
- TypeScript
- Vite
- Tailwind CSS

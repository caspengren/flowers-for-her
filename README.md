# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# Flowers for Her

An animated flower garden built with React and Vite.

## Local development

```bash
npm install
npm run dev
```

The production checks are:

```bash
npm run lint
npm run build
```

## GitHub Pages

Deployment is handled automatically by `.github/workflows/deploy.yml` whenever changes are pushed to `main`.

The first time, open the repository on GitHub and go to **Settings > Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.

After the workflow finishes, the site will be available at:

<https://caspengren.github.io/flowers-for-her/>

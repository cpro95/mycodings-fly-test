# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

This template includes three Dockerfiles optimized for different package managers:

- `Dockerfile` - for npm
- `Dockerfile.pnpm` - for pnpm
- `Dockerfile.bun` - for bun

To build and run using Docker:

```bash
# For npm
docker build -t my-app .

# For pnpm
docker build -f Dockerfile.pnpm -t my-app .

# For bun
docker build -f Dockerfile.bun -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

## Prisma Init

```sh
✗ npm i prisma -D

✗ npm i @prisma/client

✗ npx prisma init --datasource-provider sqlite

✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.

warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Run prisma db pull to turn your database schema into a Prisma schema.
3. Run prisma generate to generate the Prisma Client. You can then start querying your database.
4. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and real-time database events. Read: https://pris.ly/cli/beyond-orm

More information in our documentation:
https://pris.ly/d/getting-started
```

위와 같이 Prisma 설치하고 schema.prisma 파일에 Model을 세팅하고 아래와 같이 Migration을 실행시켜야합니다.

### Prisma Migrate

```sh
✗ npx prisma migrate dev --name init
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

SQLite database dev.db created at file:./dev.db

Applying migration `20250128094409_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250128094409_init/
    └─ migration.sql

Your database is now in sync with your schema.

Running generate... (Use --skip-generate to skip the generators)

✔ Generated Prisma Client (v6.2.1) to ./node_modules/@prisma/client in 40ms
```

## Update Process

```sh
node --require dotenv/config others/refresh-on-content-change.mjs
```
위 watch 모드가 실행되고 있으면 content 폴더의 모든 파일 변화를 감지한다.

그리고 아래와 같이 3가지의 경우에 따라 update를 실행하는데,

```sh
type Body = {
  refreshAll?: boolean;
  paths?: Array<string>;
  sha: string;
};
```

로컬 개발서버에서는 2번째 paths 항목에 데이터가 들어간다.

update는 개발 서버의 라우팅인

`/_content/update-content` 인데,

이 파일을 보면 아래와 같이 결국 getMdxListItems 함수를 실행한다.

```sh
if (refreshPaths.some((p) => p.startsWith("blog"))) {
      void getMdxListItems({
        contentDirectory: "blog",
        page: 1,
        itemsPerPage: 100000,
      });
    }
```

### getMdxListItems 함수 뜯어보기

이 함수는 content 폴더에 아무것도 없으면 즉, count === 0 이면
populateMdx 함수를 실행하고,

업데이트할 게 있으면 updateMdx 함수를 실행한다.

```sh
count: 1
'pagesToUpdates : [{"id":"ed4340b8-e2e6-4e64-9d22-2cb58e6550ce","contentDirectory":"blog","slug":"2025-01-30-new-blog-test-1","title":"","code":"","frontmatter":"","timestamp":"2025-01-30T13:34:53.083Z","updatedAt":"2025-01-31T03:06:05.857Z","published":true,"requiresUpdate":true,"description":""}]'
```

첫 번째로 count가 1이기 때문에 updateMdx 함수를 알아보자

#### updateMdx

```ts
async function updateMdx(mdxToUpdate: Content[], contentDirectory: string) {
  const pages = await downloadMdx(mdxToUpdate, contentDirectory);
  const compiledPages = await compileMdxPages(pages);
  await upsertContent(compiledPages, contentDirectory);
}
```

먼저, downloadMdx 함수를 실행하는데,

```ts
async function downloadMdx(
  filesList: Array<{ slug: string }>,
  contentDir: string
) {
  return Promise.all(
    filesList.map(async ({ slug }) => {
      const path = `${contentDir}/${slug}`;

      return {
        ...(await downloadMdxOrDirectory(path)),
        path,
        slug,
      };
    })
  );
}
```

---

그 다음으로, populateMdx 함수를 살펴보자

#### populateMdx

```ts
  if (count === 0) {
    await populateMdx(contentDirectory);
  }
```

해당 함수를 보면 아래와 같다.

```ts
async function populateMdx(contentDirectory: string) {
  const filesList = await dirList(contentDirectory);
  const pages = await downloadMdx(filesList, contentDirectory);
  const compiledPages = await compileMdxPages(pages);
  await upsertContent(compiledPages, contentDirectory);
}
```

먼저, dirList로 컨텐츠가 있는 폴더의 fileList를 가져온다.

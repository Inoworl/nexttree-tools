import { access, cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const firebaseCommonsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
)
const repositoryRoot = resolve(firebaseCommonsDir, '..')
const sourceDir = resolve(
  repositoryRoot,
  'apps/biwa-counter/frontend/.output/public',
)
const destinationDir = resolve(
  firebaseCommonsDir,
  'dist/loquat-counter',
)

await access(sourceDir)
await rm(destinationDir, { recursive: true, force: true })
await mkdir(destinationDir, { recursive: true })
await cp(sourceDir, destinationDir, { recursive: true })

console.log('Prepared Firebase Hosting files in firebase-commons/dist/loquat-counter')

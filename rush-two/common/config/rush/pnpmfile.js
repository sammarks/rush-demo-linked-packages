'use strict'

const fs = require('fs')
const path = require('path')

let linkedPackages = {}
const LINKS = path.join(__dirname, '../config/links.json')
if (fs.existsSync(LINKS)) {
  const contents = fs.readFileSync(LINKS).toString()
  linkedPackages = JSON.parse(contents)
}

module.exports = {
  hooks: {
    readPackage,
    afterAllResolved,
  },
}

function afterAllResolved(lockFile, context) {
  for (const importerKey of Object.keys(lockFile.importers)) {
    // Check to make sure it starts with ../../ because that means it's probably
    // inside the current project.
    if (importerKey.startsWith('../../')) {
      for (const root of Object.keys(linkedPackages.roots || {})) {
        for (const linkedPackageName of Object.keys(linkedPackages.roots[root] || {})) {
          const finalPath = path.join('../..', root, linkedPackages.roots[root][linkedPackageName])
          context.log(`(lockfile) ${linkedPackageName} → link:${finalPath}`)
          lockFile.importers[importerKey].dependencies[linkedPackageName] = `link:${finalPath}`
        }
      }
    }
  }

  return lockFile
}

const DEP_KEYS = ['dependencies', 'devDependencies']
function readPackage(packageJson, context) {
  for (const depKey of DEP_KEYS) {
    for (const root of Object.keys(linkedPackages.roots || {})) {
      for (const linkedPackageName of Object.keys(linkedPackages.roots[root] || {})) {
        if (packageJson[depKey][linkedPackageName]) {
          const finalPath = path.join('../..', root, linkedPackages.roots[root][linkedPackageName])
          context.log(`${linkedPackageName} → ${finalPath}`)
          packageJson[depKey][linkedPackageName] = `${finalPath}`
        }
      }
    }
  }

  return packageJson
}

#! /usr/bin/env node

let supportTs = false
import('../src/index.ts').then(module => {
  console.log('support ts, use Typescript code')
  module.exec()
}).catch(() => {
  import('../dist/index.js').then(module => {
    console.log('not support ts, use JavaScript code');
    module.exec()
  })
})

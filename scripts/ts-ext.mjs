// Lets Node resolve the plugin's extensionless imports ('./kit') the way Claude Code does.
// Used as: node --import ./scripts/ts-ext.mjs scripts/<script>.mjs
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

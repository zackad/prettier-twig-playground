import * as Comlink from 'comlink'

import prettier from 'prettier/standalone'
import HtmlPlugin from 'prettier/parser-html'
import PhpPlugin from '@prettier/plugin-php/standalone'

let plugin = PhpPlugin

class Prettifier {
  async useCustomPlugin(code) {
    if (!code) {
      plugin = PhpPlugin
      return
    }

    self.prettier = prettier

    try {
      eval(code)

      if (
        typeof self.prettierPlugins !== 'object' ||
        typeof self.prettierPlugins.php !== 'object'
      ) {
        throw new Error()
      }
    } catch {
      throw new Error('Invalid plugin file')
    } finally {
      delete self.prettier
    }

    plugin = self.prettierPlugins.php
    delete self.prettierPlugins
  }

  async format(code, prettierOptions = {}, editorOptions = {}) {
    try {
      const parseOptions = {
        ...prettierOptions,
        plugins: [HtmlPlugin, plugin],
        parser: 'php'
      }

      return {
        type: 'formatted',
        code: prettier.format(code, parseOptions),
        ast: editorOptions.ast
          ? prettier.__debug.parse(code, parseOptions).ast
          : null
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        return {
          type: 'syntax-error',
          message: err.message.match(/^(.+)(\n|$)/)[1],
          line: err.loc.start.line,
          column: err.loc.start.column,
          frame: err.codeFrame
        }
      } else {
        return {
          type: 'error',
          message: err.message || String(err)
        }
      }
    }
  }
}

Comlink.expose(Prettifier)

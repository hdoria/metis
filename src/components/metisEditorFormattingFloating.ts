import { flip, offset, shift } from '@floating-ui/dom'
import type { FloatingUIOptions } from '@blocknote/react'

const FORMATTER_VIEWPORT_PADDING_PX = 8
type MetisFloatingOptions = NonNullable<FloatingUIOptions['useFloatingOptions']>
type MetisFloatingMiddleware = NonNullable<MetisFloatingOptions['middleware']>[number]

function viewportClampMiddleware(): MetisFloatingMiddleware {
  return {
    name: 'metisViewportClamp',
    fn({ x, rects }: { rects: { floating: { width: number } }; x: number }) {
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth
      const minX = FORMATTER_VIEWPORT_PADDING_PX
      const maxX = Math.max(
        minX,
        viewportWidth - rects.floating.width - FORMATTER_VIEWPORT_PADDING_PX,
      )

      return {
        x: Math.min(Math.max(x, minX), maxX),
      }
    },
  }
}

export function withViewportSafeMiddleware(
  options?: MetisFloatingOptions,
): MetisFloatingOptions {
  return {
    ...options,
    middleware: [
      offset(10),
      shift(),
      flip(),
      ...(options?.middleware ?? []),
      viewportClampMiddleware(),
    ],
  }
}

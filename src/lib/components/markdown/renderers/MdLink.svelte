<script lang="ts">
  import { photonify } from './plugins.js'

  interface Props {
    href?: string
    title?: string
    children?: import('svelte').Snippet
  }

  let { href = '', title = undefined, children }: Props = $props()

  export const parseURL = (href: string) => {
    try {
      return new URL(href)
    } catch {
      return undefined
    }
  }

  let photonified = $derived(photonify(href))
</script>

<a
  href={photonified ?? href}
  {title}
  class="hover:underline text-sky-600 dark:text-sky-500"
>
  {@render children?.()}
</a>

<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import { page } from '$app/state'

  interface Props {
    routes: {
      href: string
      name: string
    }[]
    currentRoute?: string | undefined
    buildUrl?: (currentRoute: string | undefined, href: string) => string
    defaultRoute?: string | undefined
    class?: string
    children?: import('svelte').Snippet
  }

  let {
    routes,
    currentRoute = undefined,
    buildUrl = (_, href) => href,
    defaultRoute = undefined,
    class: clazz = '',
    children,
  }: Props = $props()

  function isSelected(
    url: URL,
    currentRoute: string | undefined,
    route: string,
    defaultRoute?: string,
  ) {
    if (route.startsWith('?')) {
      const param = route.slice(1)
      const key = param.split(/(?<=[=])/g)[0]
      if (currentRoute?.includes(param)) {
        return true
      } else if (route == defaultRoute && !currentRoute?.includes(key)) {
        return true
      }
    }
    return (currentRoute ?? url.pathname) == route
  }
</script>

<nav
  class="flex flex-row items-center gap-1 p-1 rounded-full bg-white/60 dark:bg-zinc-800/60
  backdrop-blur-lg border border-slate-200 dark:border-zinc-800 shadow-sm {clazz ??
    ''}
  "
>
  {#each routes as route (route.href)}
    <a
      onclick={() => invalidateAll()}
      href={buildUrl(currentRoute, route.href)}
      class="font-medium rounded-full px-4 py-1 hover:bg-slate-200/40 dark:hover:bg-zinc-700/40
      transition-colors duration-100 relative z-0 shrink-0"
    >
      {route.name}
      {#if isSelected(page.url, currentRoute, route.href, defaultRoute)}
        <div
          class="rounded-full bg-slate-100/60 dark:bg-zinc-700/60
          absolute inset-0 w-full h-full -z-10"
        ></div>
      {/if}
    </a>
  {/each}
  {@render children?.()}
</nav>

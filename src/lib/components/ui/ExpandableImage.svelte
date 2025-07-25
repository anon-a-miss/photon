<script lang="ts" module>
  import { pushState } from '$app/navigation'

  export function showImage(url: string) {
    pushState('', {
      openImage: url,
    })
  }
</script>

<script lang="ts">
  import { page } from '$app/state'
  import { Button, Material, toast } from 'mono-svelte'
  import { Icon, Share, XMark } from 'svelte-hero-icons'
  import { expoOut } from 'svelte/easing'
  import { fade, scale } from 'svelte/transition'
  import { focusTrap } from 'svelte-focus-trap'
  import { t } from '$lib/i18n/translations'

  interface Props {
    /**
     * The full-resolution image URL
     */
    alt?: string
    class?: string
    children?: import('svelte').Snippet
  }

  let { alt = '', class: clazz = '', children }: Props = $props()
</script>

{#if page.state.openImage || '' != ''}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed top-0 left-0 w-screen h-svh overflow-auto bg-white/50 dark:bg-black/50
    flex flex-col z-100 backdrop-blur-xs"
    transition:fade={{ duration: 150 }}
    onclick={() => history.back()}
    onkeydown={e => {
      if (e.key == 'Escape') history.back()
    }}
    use:focusTrap
  >
    <img
      width={800}
      height={800}
      src={page.state.openImage}
      class={[
        'max-w-full mx-auto my-auto overscroll-contain bg-white dark:bg-zinc-900',
      ]}
      transition:scale={{ start: 0.95, easing: expoOut, duration: 250 }}
      {alt}
    />
    <div class="sticky z-10 bottom-4 left-1/2 -translate-x-1/2 w-max">
      <Material
        class="gap-1 p-0.5 px-1 flex flex-row items-center dark:bg-zinc-950/50 border-opacity-50"
        rounding="full"
        padding="none"
        color="uniform"
        onclick={e => e.stopPropagation()}
      >
        <Button
          onclick={() => {
            navigator.clipboard.writeText(page.state.openImage)
            toast({ content: $t('toast.copied') })
          }}
          color="tertiary"
          size="square-lg"
          rounding="pill"
          title={$t('post.actions.more.share')}
        >
          {#snippet prefix()}
            <Icon src={Share} size="20" micro />
          {/snippet}
        </Button>
        <Button
          onclick={() => history.back()}
          color="tertiary"
          size="square-lg"
          rounding="pill"
          title={$t('post.image.close')}
        >
          {#snippet prefix()}
            <Icon src={XMark} size="20" micro />
          {/snippet}
        </Button>
      </Material>
    </div>
  </div>
{/if}

<button onclick={() => history.back()} class="contents {clazz}">
  {@render children?.()}
</button>

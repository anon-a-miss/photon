<script lang="ts">
  import DebugTree from '$lib/components/util/debug/DebugTree.svelte'
  import { Modal } from 'mono-svelte'

  interface Props {
    // eslint-disable-next-line
    object: any
    open?: boolean
    title?: import('svelte').Snippet
  }

  let { object, open = $bindable(false), title }: Props = $props()
</script>

<Modal bind:open>
  {#snippet customTitle()}
    <span>
      {#if title}{@render title()}{:else}Debug{/if}
    </span>
  {/snippet}
  <DebugTree {object} isParent={true} />
</Modal>

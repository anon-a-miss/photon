<script lang="ts">
  interface Props {
    checked?: boolean
    labelClass?: string
    class?: string
    children?: import('svelte').Snippet
    description?: import('svelte').Snippet
  }

  let {
    checked = $bindable(),
    labelClass = '',
    class: clazz = '',
    children,
    description,
  }: Props = $props()
</script>

<label
  class="font-normal cursor-pointer flex flex-row items-center gap-4 group {clazz}"
>
  <div
    class="w-11 h-6 rounded-full relative z-[inherit] cursor-pointer flex flex-row transition-colors shadow-xs
{checked
      ? 'bg-primary-900 dark:bg-primary-100'
      : 'bg-slate-200 dark:bg-zinc-800'}
 p-0.5 shrink-0"
  >
    <input
      bind:checked
      type="checkbox"
      class="peer appearance-none absolute top-0 left-0 w-full h-full cursor-pointer z-10"
    />
    <div
      class="box-border w-5 h-full bg-white dark:peer-checked:bg-black rounded-full shadow-xs
		group-active:w-6 transition peer-checked:translate-x-5 peer-checked:group-active:translate-x-4
		peer-checked:rtl:-translate-x-5 peer-checked:group-active:rtl:-translate-x-4"
    ></div>
  </div>
  <div class="flex flex-col {labelClass}">
    {@render children?.()}
    {#if description}
      <span class="font-normal text-sm text-slate-700 dark:text-zinc-300">
        {@render description?.()}
      </span>
    {/if}
  </div>
</label>

<style>
  .transition {
    transition: all 500ms cubic-bezier(0.075, 0.82, 0.165, 1);
  }
</style>

<script lang="ts">
  import { navigating, page } from '$app/state'
  import { profile } from '$lib/auth.svelte.js'
  import ObjectAutocomplete from '$lib/components/lemmy/ObjectAutocomplete.svelte'
  import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
  import CommunityItem from '$lib/components/lemmy/community/CommunityItem.svelte'
  import Sort from '$lib/components/lemmy/dropdowns/Sort.svelte'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import UserItem from '$lib/components/lemmy/user/UserItem.svelte'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import Skeleton from '$lib/components/ui/generic/Skeleton.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { t } from '$lib/i18n/translations.js'
  import {
    isCommentView,
    isCommunityView,
    isPostView,
    isUser,
  } from '$lib/lemmy/item.js'
  import { searchParam } from '$lib/util.svelte.js'
  import { Button, Select, Spinner, TextInput } from 'mono-svelte'
  import Option from 'mono-svelte/forms/select/Option.svelte'
  import {
    AdjustmentsHorizontal,
    ChevronDown,
    Icon,
    MagnifyingGlass,
  } from 'svelte-hero-icons'
  import { expoOut } from 'svelte/easing'
  import { fly, slide } from 'svelte/transition'

  let { data } = $props()

  let searchElement: HTMLInputElement | undefined = $state()
  let form = $state<HTMLFormElement>()

  let pageNum = $state(data.filters.value.page)

  let moreOptions = $state(false)
</script>

<svelte:window
  onkeydown={e => {
    if (e.target == document.body) searchElement?.focus()
  }}
/>

<svelte:head>
  <title>{$t('routes.search.title')}</title>
</svelte:head>

<Header pageHeader>
  {$t('routes.search.title')}
</Header>
<form method="get" action="/search" class="contents" bind:this={form}>
  <div class="mt-4 mb-0 sticky z-30 top-6 lg:top-22">
    <Tabs routes={[]} class="p-2 dark:bg-zinc-925/70">
      <div class="flex gap-2 flex-row items-center w-full text-base h-10">
        <TextInput
          bind:value={data.filters.value.query}
          bind:element={searchElement}
          name="q"
          aria-label={$t('routes.search.query')}
          size="lg"
          class="flex-1 rounded-full! h-full text-base!"
        />
        <Button
          submit
          color="primary"
          size="custom"
          class="shrink-0 h-full aspect-square"
          title="Search"
          rounding="pill"
          loading={navigating.to?.route.id == '/search'}
        >
          {#snippet prefix()}
            <Icon src={MagnifyingGlass} size="16" micro />
          {/snippet}
        </Button>
      </div>
    </Tabs>
  </div>
  <div class="flex flex-row flex-wrap items-center gap-4 mt-4">
    <Select
      name="type"
      bind:value={data.filters.value.type}
      onchange={() => form?.requestSubmit()}
    >
      {#snippet customLabel()}
        <span class="flex items-center gap-1">
          <Icon src={AdjustmentsHorizontal} mini size="15" />
          {$t('filter.type')}
        </span>
      {/snippet}
      <Option value="All">{$t('content.all')}</Option>
      <Option value="Posts">{$t('content.posts')}</Option>
      <Option value="Comments">{$t('content.comments')}</Option>
      <Option value="Communities">{$t('content.communities')}</Option>
      <Option value="Users">{$t('content.users')}</Option>
    </Select>
    <Sort
      name="sort"
      bind:selected={data.filters.value.sort}
      onchange={() => form?.requestSubmit()}
    />
    <Button
      size="square-lg"
      color="tertiary"
      class="self-end justify-self-center"
      onclick={() => (moreOptions = !moreOptions)}
    >
      <Icon src={ChevronDown} size="20" mini />
    </Button>
  </div>
</form>
{#if moreOptions}
  <div transition:slide={{ axis: 'y', easing: expoOut }} class="max-w-sm">
    <ObjectAutocomplete
      label={$t('nav.create.community')}
      jwt={profile.data?.jwt}
      listing_type="All"
      showWhenEmpty={true}
      onselect={c =>
        searchParam(page.url, 'community', c?.id || undefined, 'page')}
    />
  </div>
{/if}
{#if !data.results}
  {#if navigating.to?.route.id == '/search'}
    <div class="flex flex-col gap-3 mt-6">
      {#each new Array(5) as _, index}
        {_}
        <div
          in:fly|global={{
            duration: 800,
            easing: expoOut,
            y: 12,
            delay: index * 100,
          }}
          style="width: {(1 / ((index + 1) % 3)) * 100}%"
        >
          <Skeleton />
        </div>
      {/each}
    </div>
  {:else}
    <div class="my-auto">
      <Placeholder
        icon={MagnifyingGlass}
        title={$t('routes.search.noResults.title')}
        description={data.filters.value.query == ''
          ? $t('routes.search.noResults.alt')
          : $t('routes.search.noResults.description')}
      />
    </div>
  {/if}
{:else}
  {#await data.streamed.object}
    <div
      class="flex gap-2 items-center mt-4"
      out:slide={{ axis: 'y', easing: expoOut }}
    >
      <Spinner width={24} />
      <span>{$t('routes.search.federating')}</span>
    </div>
  {:then object}
    {#if object}
      <div
        transition:slide={{ axis: 'y', easing: expoOut }}
        class="divide-y divide-slate-200 dark:divide-zinc-900"
      >
        {#if object.community}
          <div
            class="-mx-4 sm:-mx-6 px-6 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <CommunityItem
              community={object.community}
              showCounts={false}
              class="py-3"
            />
          </div>
        {/if}
        {#if object.post}
          <Post post={object.post} />
        {/if}
        {#if object.comment}
          <CommentItem comment={object.comment} />
        {/if}
        {#if object.person}
          <UserItem user={object.person} />
        {/if}
      </div>
    {/if}
  {/await}
  <div
    class="flex flex-col mt-4 divide-slate-200 dark:divide-zinc-800 divide-y!"
  >
    {#key data.results.value}
      {#each data.results.value as result (result)}
        {#if isPostView(result)}
          <Post post={result} />
        {:else if isCommentView(result)}
          <CommentItem comment={result} />
        {:else if isCommunityView(result)}
          <div
            class="-mx-4 sm:-mx-6 px-6 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <CommunityItem community={result} showCounts={false} class="py-3" />
          </div>
        {:else if isUser(result)}
          <div
            class="-mx-4 sm:-mx-6 px-6 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <UserItem user={result} showCounts={false} class="py-3" />
          </div>
        {/if}
      {/each}
    {/key}
  </div>
  <div class="mt-4"></div>
  {#if data.results.value.length > 0}
    <Pageination bind:page={pageNum} href={page => `?page=${page}`} />
  {/if}
{/if}

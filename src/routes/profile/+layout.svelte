<script>
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { t } from '$lib/i18n/translations'
  import { site } from '$lib/lemmy.svelte'
  import { feature } from '$lib/version'
  import { Button, Menu, MenuButton } from 'mono-svelte'
  import {
    ArrowDown,
    ArrowUp,
    EllipsisHorizontal,
    Icon,
    Photo,
  } from 'svelte-hero-icons'
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
</script>

<svelte:head>
  <title>{$t('profile.profile')}</title>
</svelte:head>

<div class="flex flex-col gap-4 h-full z-0">
  <div
    class="sticky mx-auto z-50 max-w-full min-w-0 flex items-center gap-2 top-6 lg:top-22"
  >
    <Tabs
      class="overflow-auto"
      routes={[
        {
          href: '/profile',
          name: $t('routes.profile.overview'),
        },
        {
          href: '/profile/user',
          name: $t('routes.profile.submissions'),
        },

        {
          href: '/profile/settings',
          name: $t('routes.profile.settings'),
        },

        {
          href: '/profile/blocks',
          name: $t('routes.profile.blocks.title'),
        },

        {
          href: '/profile/password',
          name: $t('routes.profile.credentials'),
        },
      ]}
    />
    {#if feature('mediaAndVotes', site.data?.version)}
      <Menu class="flex-1" placement="bottom-end">
        {#snippet target()}
          <Button
            title={$t('post.actions.more.label')}
            size="square-lg"
            rounding="pill"
            color="none"
            class="bg-white/60 dark:bg-zinc-800/60
          border border-slate-200/60 dark:border-zinc-800
          backdrop-blur-xl shadow-xl hover:bg-slate-100 dark:hover:bg-zinc-800
          shrink-0"
          >
            <Icon src={EllipsisHorizontal} size="16" mini />
          </Button>
        {/snippet}
        <MenuButton href="/profile/media">
          {#snippet prefix()}
            <Icon src={Photo} size="16" mini />
          {/snippet}
          {$t('routes.profile.media.title')}
        </MenuButton>
        <MenuButton href="/profile/voted/up">
          {#snippet prefix()}
            <Icon src={ArrowUp} size="16" micro />
          {/snippet}
          {$t('routes.profile.upvoted')}
        </MenuButton>
        <MenuButton href="/profile/voted/down">
          {#snippet prefix()}
            <Icon src={ArrowDown} size="16" micro />
          {/snippet}
          {$t('routes.profile.downvoted')}
        </MenuButton>
      </Menu>
    {/if}
  </div>
  {@render children?.()}
</div>

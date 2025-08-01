<script lang="ts">
  import { profile } from '$lib/auth.svelte'
  import EntityHeader from '$lib/components/ui/EntityHeader.svelte'
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import { formatRelativeDate } from '$lib/components/util/RelativeDate.svelte'
  import { publishedToDate } from '$lib/components/util/date'
  import { t } from '$lib/i18n/translations'
  import { userLink } from '$lib/lemmy/generic'
  import { settings } from '$lib/settings.svelte'
  import { fullCommunityName } from '$lib/util.svelte'
  import type {
    Community,
    CommunityAggregates,
    CommunityModeratorView,
    SubscribedType,
  } from 'lemmy-js-client'
  import { action, Button, Menu, MenuButton, modal, toast } from 'mono-svelte'
  import {
    BuildingOffice2,
    Check,
    Cog6Tooth,
    EllipsisHorizontal,
    Fire,
    Icon,
    Newspaper,
    NoSymbol,
    Plus,
    ShieldCheck,
  } from 'svelte-hero-icons'
  import Subscribe from '../../../../routes/communities/Subscribe.svelte'
  import ItemList from '../generic/ItemList.svelte'
  import { amMod, isAdmin } from '../moderation/moderation'
  import { block, blockInstance, purgeCommunity } from './CommunityCard.svelte'

  interface Props {
    community: Community
    subscribed: SubscribedType
    counts?: CommunityAggregates | undefined
    moderators?: CommunityModeratorView[]
    blocked?: boolean
    banner?: boolean
    class?: string
  }

  let {
    community = $bindable(),
    subscribed = $bindable(),
    counts = undefined,
    moderators = [],
    blocked = false,
    banner = !(settings.nsfwBlur && community.nsfw),
    class: clazz = '',
  }: Props = $props()
</script>

<EntityHeader
  banner={banner ? community.banner : undefined}
  avatar={community.icon}
  name={community.title}
  url="/c/{fullCommunityName(community.name, community.actor_id)}"
  stats={counts
    ? [
        {
          name: $t('cards.community.members'),
          value: counts.subscribers.toString(),
        },
        {
          name: $t('content.posts'),
          value: counts.posts.toString(),
        },
        {
          name: $t('cards.community.activeDay'),
          value: counts.users_active_day.toString(),
        },
        {
          name: $t('stats.created'),
          format: false,
          value: formatRelativeDate(publishedToDate(community.published), {
            style: 'short',
          }).toString(),
        },
      ]
    : []}
  bio={community.description}
  class={['tracking-normal', clazz]}
>
  {#snippet nameDetail()}
    <button
      onclick={() => {
        navigator?.clipboard?.writeText?.(
          `!${fullCommunityName(community.name, community.actor_id)}`,
        )
        toast({ content: $t('toast.copied') })
      }}
      class="text-sm flex gap-0 items-center"
    >
      !{fullCommunityName(community.name, community.actor_id)}
    </button>
  {/snippet}
  {#if moderators.length > 0}
    <Expandable class="">
      {#snippet title()}
        {$t('cards.community.moderators')}
        <hr class="flex-1 border-slate-200 dark:border-zinc-800 mx-3" />
      {/snippet}
      <ItemList
        items={moderators.map(m => ({
          id: m.moderator.id,
          name: m.moderator.name,
          url: userLink(m.moderator),
          avatar: m.moderator.avatar,
          instance: new URL(m.moderator.actor_id).hostname,
        }))}
      />
    </Expandable>
  {/if}
  <div class="flex items-center gap-2 h-max w-max">
    {#if profile.current?.jwt}
      <Subscribe
        community={{
          community: community,
          banned_from_community: false,
          blocked: false,
          counts: counts!,
          subscribed: subscribed,
        }}
      >
        {#snippet children({ subscribe, subscribing })}
          <Button
            disabled={subscribing}
            loading={subscribing}
            color={subscribed == 'NotSubscribed' ? 'primary' : 'secondary'}
            onclick={async () => {
              subscribed =
                (await subscribe())?.community_view.subscribed ??
                'NotSubscribed'
            }}
            class="relative z-[inherit]"
            rounding="pill"
          >
            {#snippet prefix()}
              <Icon
                src={subscribed != 'NotSubscribed' ? Check : Plus}
                micro
                size="16"
              />
            {/snippet}
            {subscribed == 'Subscribed' || subscribed == 'Pending'
              ? $t('cards.community.subscribed')
              : $t('cards.community.subscribe')}
          </Button>
        {/snippet}
      </Subscribe>
    {/if}

    {#if profile.current?.user && profile.current.user.moderates
        .map(c => c.community.id)
        .includes(community.id)}
      <Button
        color="secondary"
        size="custom"
        rounding="pill"
        class="h-9 aspect-square"
        href="/c/{fullCommunityName(
          community.name,
          community.actor_id,
        )}/settings"
      >
        <Icon src={Cog6Tooth} size="16" mini />
      </Button>
    {/if}
    <Menu placement="top-end">
      {#snippet target()}
        <Button size="custom" rounding="pill" class="h-8.5 aspect-square">
          {#snippet prefix()}
            <Icon src={EllipsisHorizontal} size="16" mini />
          {/snippet}
        </Button>
      {/snippet}
      <MenuButton href="/modlog?community={community.id}">
        <Icon src={Newspaper} size="16" mini />
        {$t('cards.community.modlog')}
      </MenuButton>
      {#if profile.current.user && amMod(profile.current.user, community)}
        <MenuButton
          color="success-subtle"
          href="/moderation?community={community.id}"
        >
          <Icon src={ShieldCheck} size="16" micro />
          {$t('routes.moderation.feed')}
        </MenuButton>
      {/if}
      {#if profile.current?.jwt}
        <MenuButton
          color="danger-subtle"
          size="lg"
          onclick={() => block(community.id, !blocked)}
        >
          {#snippet prefix()}
            <Icon src={NoSymbol} size="16" mini />
          {/snippet}
          {blocked
            ? $t('cards.community.unblock')
            : $t('cards.community.block')}
        </MenuButton>
        {#if profile.current?.user}
          <MenuButton
            color="danger-subtle"
            size="lg"
            onclick={() => blockInstance(community.instance_id)}
          >
            {#snippet prefix()}
              <Icon src={BuildingOffice2} size="16" mini />
            {/snippet}
            {$t('cards.community.blockInstance')}
          </MenuButton>
        {/if}
        {#if profile.current?.user && isAdmin(profile.current.user)}
          <MenuButton
            color="danger-subtle"
            onclick={() =>
              modal({
                title: $t('admin.purgeCommunity.title'),
                body: `${community.title}: ${$t('admin.purgeCommunity.warning')}`,
                actions: [
                  action({
                    close: true,
                    content: $t('common.cancel'),
                  }),
                  action({
                    action: () => purgeCommunity(community.id),
                    close: true,
                    content: $t('admin.purge'),
                    type: 'danger',
                    icon: Fire,
                  }),
                ],
                dismissable: true,
                type: 'error',
              })}
          >
            {#snippet prefix()}
              <Icon src={Fire} size="16" mini />
            {/snippet}
            {$t('admin.purge')}
          </MenuButton>
        {/if}
      {/if}
    </Menu>
  </div>
</EntityHeader>

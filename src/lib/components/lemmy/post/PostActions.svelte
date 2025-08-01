<script lang="ts">
  import { goto } from '$app/navigation'
  import { profile } from '$lib/auth.svelte.js'
  import {
    amMod,
    isAdmin,
    report,
  } from '$lib/components/lemmy/moderation/moderation.js'
  import ModerationMenu from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
  import TextProps from '$lib/components/ui/text/TextProps.svelte'
  import { publishedToDate } from '$lib/components/util/date'
  import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
  import { t } from '$lib/i18n/translations'
  import { instance } from '$lib/instance.svelte'
  import { site } from '$lib/lemmy.svelte.js'
  import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
  import { communityLink, userLink } from '$lib/lemmy/generic'
  import { setSessionStorage } from '$lib/session.js'
  import { settings, type View } from '$lib/settings.svelte.js'
  import { instanceToURL } from '$lib/util.svelte'
  import { feature } from '$lib/version'
  import type { PostView } from 'lemmy-js-client'
  import {
    Button,
    Menu,
    MenuButton,
    MenuDivider,
    Modal,
    Spinner,
    toast,
  } from 'mono-svelte'
  import {
    ArrowTopRightOnSquare,
    Bookmark,
    BookmarkSlash,
    BugAnt,
    ChatBubbleOvalLeft,
    ChatBubbleOvalLeftEllipsis,
    EllipsisHorizontal,
    Eye,
    EyeSlash,
    Flag,
    GlobeAmericas,
    Icon,
    MapPin,
    Newspaper,
    PencilSquare,
    Share,
    Trash,
    UserCircle,
    XMark,
  } from 'svelte-hero-icons'
  import { hidePost, postLink } from './helpers'
  import PostVote from './PostVote.svelte'

  let editing = $state(false)
  let saving = $state(false)

  let localShare = $state(false)

  interface Props {
    post: PostView
    view?: View
    debug?: boolean
    style?: string
    onedit?: (post: PostView) => void
    onhide?: (hide: boolean) => void
  }

  let {
    post = $bindable(),
    view = 'cozy',
    debug = $bindable(false),
    style = '',
    onedit,
    onhide,
  }: Props = $props()
  let buttonHeight = $derived(view == 'compact' ? 'h-7' : 'h-8')
  let buttonSquare = $derived(view == 'compact' ? 'w-7 h-7' : 'w-8 h-8')
</script>

{#if editing}
  <Modal bind:open={editing}>
    {#snippet customTitle()}
      <h1 class="text-2xl font-bold">Editing post</h1>
    {/snippet}
    {#await import('./form/PostForm.svelte')}
      <div class="mx-auto h-96 flex justify-center items-center">
        <Spinner width={32} />
      </div>
    {:then { default: PostForm }}
      <PostForm
        edit
        editingPost={post.post}
        onsubmit={e => {
          editing = false
          post = e
          onedit?.(e)
        }}
      >
        {#snippet formtitle()}
          <!-- Have the title not exist at all -->
        {/snippet}
      </PostForm>
    {/await}
  </Modal>
{/if}

<footer
  class="flex flex-row gap-2 items-center shrink-0 {buttonHeight}"
  class:flex-row-reverse={settings.posts.reverseActions}
  {style}
>
  <PostVote
    post={post.post}
    bind:vote={post.my_vote}
    bind:score={post.counts.score}
    bind:upvotes={post.counts.upvotes}
    bind:downvotes={post.counts.downvotes}
    showCounts={profile.current?.user?.local_user_view?.local_user
      ?.show_scores ?? true}
  />

  <Button
    size="custom"
    href="{postLink(post.post)}#comments"
    class="text-inherit! h-full px-3 relative"
    color="ghost"
    rounding="pill"
    target={settings.openLinksInNewTab ? '_blank' : ''}
    title={$t('post.actions.comments')}
  >
    {@const newComment =
      publishedToDate(post.counts.newest_comment_time).getTime() >
      new Date().getTime() - 5 * 60 * 1000}
    <Icon
      src={newComment ? ChatBubbleOvalLeftEllipsis : ChatBubbleOvalLeft}
      size="18"
    />
    <FormattedNumber number={post.counts.comments} />
  </Button>
  <div class="flex-1"></div>
  {#if settings.debugInfo}
    {#if debug}
      {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
        <DebugObject object={post} bind:open={debug} />
      {/await}
    {/if}
    <Button
      onclick={() => (debug = true)}
      title="Debug"
      size="custom"
      color="ghost"
      rounding="pill"
      class={buttonSquare}
      animations={{ scale: true, large: true }}
    >
      {#snippet prefix()}
        <Icon src={BugAnt} micro size="16" />
      {/snippet}
    </Button>
  {/if}
  {#if profile.current?.user && (amMod(profile.current.user, post.community) || isAdmin(profile.current.user))}
    <ModerationMenu
      size="custom"
      color="ghost"
      rounding="pill"
      class={buttonSquare}
      bind:item={post}
      community={post.community}
    />
  {/if}

  {#if profile.current?.jwt}
    <Button
      onclick={async () => {
        if (!profile.current?.jwt) return
        saving = true
        post.saved = await save(post, !post.saved)
        saving = false
      }}
      size="custom"
      class={buttonSquare}
      color="ghost"
      rounding="pill"
      loading={saving}
      disabled={saving}
      title={post.saved ? $t('post.actions.unsave') : $t('post.actions.save')}
    >
      {#snippet prefix()}
        <Icon src={post.saved ? BookmarkSlash : Bookmark} size="16" mini />
      {/snippet}
    </Button>
  {/if}

  <Menu placement="bottom-end" class="h-8">
    {#snippet target()}
      <Button
        title={$t('post.actions.more.label')}
        color="ghost"
        rounding="pill"
        size="custom"
        class={buttonSquare}
        animations={{ scale: true, large: true }}
      >
        {#snippet prefix()}
          <Icon src={EllipsisHorizontal} width={16} micro />
        {/snippet}
      </Button>
    {/snippet}
    <MenuDivider>{$t('post.actions.more.creator')}</MenuDivider>
    <MenuButton link href={userLink(post.creator)}>
      {#snippet prefix()}
        <Icon src={UserCircle} size="16" micro class="shrink-0" />
      {/snippet}
      <TextProps wrap="no-wrap">
        {post.creator.name}
      </TextProps>
    </MenuButton>
    <MenuButton link href={communityLink(post.community)}>
      {#snippet prefix()}
        <Icon src={Newspaper} size="16" micro class="shrink-0" />
      {/snippet}
      <TextProps wrap="no-wrap">
        {post.community.title}
      </TextProps>
    </MenuButton>
    <MenuDivider>
      {$t('post.actions.more.actions')}
    </MenuDivider>
    {#if profile.current?.user && profile.current?.jwt && profile.current.user.local_user_view.person.id == post.creator.id}
      <MenuButton onclick={() => (editing = true)}>
        {#snippet prefix()}
          <Icon src={PencilSquare} size="16" micro />
        {/snippet}
        {$t('post.actions.more.edit')}
      </MenuButton>
    {/if}
    {#if profile.current?.jwt}
      <MenuButton
        onclick={async () => {
          if (profile.current?.jwt)
            post.read = await markAsRead(post.post, !post.read)
        }}
      >
        {#snippet prefix()}
          <Icon src={post.read ? EyeSlash : Eye} size="16" micro />
        {/snippet}
        {post.read
          ? $t('post.actions.more.markUnread')
          : $t('post.actions.more.markRead')}
      </MenuButton>
    {/if}
    <MenuButton
      onclick={() => {
        if (navigator.share)
          navigator.share?.({
            url: localShare
              ? `${instanceToURL(instance.data)}/post/${post.post.id}`
              : post.post.ap_id,
          })
        else
          navigator.clipboard.writeText(
            localShare
              ? `${instanceToURL(instance.data)}/post/${post.post.id}`
              : post.post.ap_id,
          )
        toast({ content: $t('toast.copied') })
      }}
      class="flex-1 py-0!"
    >
      {#snippet prefix()}
        <Icon src={Share} size="16" micro />
      {/snippet}
      {$t('post.actions.more.share')}
      <div class="flex-1"></div>
      {#if !post.post.local}
        <div class="flex gap-1">
          <Button
            color={!localShare ? 'primary' : 'secondary'}
            size="square-sm"
            rounding="pill"
            onclick={() => (localShare = false)}
            title={$t('filter.location.global')}
          >
            <Icon src={GlobeAmericas} size="16" micro />
          </Button>
          <Button
            color={localShare ? 'primary' : 'secondary'}
            size="square-sm"
            rounding="pill"
            onclick={() => (localShare = true)}
            title={$t('filter.location.local')}
          >
            <Icon src={MapPin} size="16" micro />
          </Button>
        </div>
      {/if}
    </MenuButton>
    {#if profile.current?.jwt}
      <MenuButton
        onclick={() => {
          setSessionStorage('postDraft', {
            body: `${
              settings.crosspostOriginalLink
                ? `cross-posted from: ${post.post.ap_id}`
                : ``
            }\n${
              post.post.body
                ? '>' + post.post.body.split('\n').join('\n> ')
                : ''
            }`,
            url: post.post.url,
            title: post.post.name,
            loading: false,
            nsfw: post.post.nsfw,
            community: null,
            image: null,
          })

          goto('/create/post?crosspost=true')
        }}
      >
        {#snippet prefix()}
          <Icon src={ArrowTopRightOnSquare} size="16" micro />
        {/snippet}
        {$t('post.actions.more.crosspost')}
      </MenuButton>
      {#if profile.current.user && post.creator.id == profile.current.user.local_user_view.person.id}
        <MenuButton
          onclick={async () => {
            if (profile.current?.jwt)
              post.post.deleted = await deleteItem(post, !post.post.deleted)
          }}
          color="danger-subtle"
        >
          {#snippet prefix()}
            <Icon src={Trash} size="16" micro />
          {/snippet}
          {post.post.deleted
            ? $t('post.actions.more.restore')
            : $t('post.actions.more.delete')}
        </MenuButton>
      {/if}
      {#if profile.current.user?.local_user_view.person.id != post.creator.id}
        {#if feature('hidePosts', site.data?.version)}
          <MenuButton
            onclick={async () => {
              if (!profile.current?.jwt) return
              const hidden = await hidePost(
                post.post.id,
                !post.hidden,
                profile.current?.jwt,
              )
              post.hidden = hidden
              if (hidden) onhide?.(hidden)
            }}
            color="danger-subtle"
          >
            {#snippet prefix()}
              <Icon src={XMark} size="16" micro />
            {/snippet}
            {post.hidden
              ? $t('post.actions.more.unhide')
              : $t('post.actions.more.hide')}
          </MenuButton>
        {/if}
        <MenuButton onclick={() => report(post)} color="danger-subtle">
          {#snippet prefix()}
            <Icon src={Flag} width={16} micro />
          {/snippet}
          {$t('moderation.report')}
        </MenuButton>
      {/if}
    {/if}
  </Menu>
</footer>

<script lang="ts">
  import {
    profile as currentProfile,
    deleteProfile,
    moveProfile,
    type Profile,
    profile,
    profileData,
    setUserID,
  } from '$lib/auth.svelte.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import DebugObject from '$lib/components/util/debug/DebugObject.svelte'
  import { t } from '$lib/i18n/translations'
  import { LINKED_INSTANCE_URL } from '$lib/instance.svelte.js'
  import ProfileAvatar from '$lib/lemmy/ProfileAvatar.svelte'
  import { settings } from '$lib/settings.svelte.js'
  import { Button, Menu, MenuButton, Modal } from 'mono-svelte'
  import {
    ArrowLeftOnRectangle,
    ArrowRightOnRectangle,
    ArrowsRightLeft,
    BugAnt,
    Check,
    ChevronDown,
    ChevronUp,
    EllipsisHorizontal,
    Icon,
    Identification,
    Plus,
  } from 'svelte-hero-icons'
  import { expoOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

  let debugging = $state(false)
  let debugProfile: Profile | undefined = $state(undefined)

  let removing = $state({
    shown: false,
    account: undefined as Profile | undefined,
  })

  let switching = $state(-2)
</script>

<svelte:head>
  <title>{$t('routes.accounts')}</title>
</svelte:head>

{#if debugging}
  <DebugObject
    object={debugProfile?.id == profile.data?.id ? profile : debugProfile}
    bind:open={debugging}
  >
    {#snippet title()}
      <span class="flex flex-col">
        <h1 class="font-bold text-2xl">Debug</h1>
        <span class="text-slate-600 dark:text-zinc-400 text-base font-normal">
          Do NOT share anything from this menu.
        </span>
      </span>
    {/snippet}
  </DebugObject>
{/if}

{#if removing.shown && removing.account}
  <Modal bind:open={removing.shown}>
    {#snippet customTitle()}
      <span>Removing Account</span>
    {/snippet}
    <div class="flex flex-row items-center gap-2">
      <ProfileAvatar profile={removing.account} selected={true} />

      <div class="flex flex-col">
        <span class="font-bold">{removing.account.username}</span>
        <span class="text-sm text-slate-600 dark:text-zinc-400">
          {removing.account.instance}
        </span>
      </div>
    </div>
    <p>This removes the account from Photon, it does not delete the account.</p>
    <div class="flex flex-row gap-2 items-center">
      <Button size="lg" class="flex-1" onclick={() => (removing.shown = false)}>
        Cancel
      </Button>
      <Button
        onclick={() => {
          removing.shown = false
          if (removing.account) deleteProfile(removing.account.id)
        }}
        size="lg"
        class="flex-1"
        color="danger"
      >
        Remove
      </Button>
    </div>
  </Modal>
{/if}

{#if profileData.profiles.length == 0}
  <div class="h-max flex items-center justify-center my-auto">
    <div
      class="flex flex-col justify-center items-center py-8 gap-4
      my-auto"
    >
      <div class="flex flex-col items-center">
        <Icon src={ArrowLeftOnRectangle} size="48" solid />
        <h1 class="font-bold text-3xl">No accounts</h1>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button href="/accounts/login" size="lg">
          {#snippet prefix()}
            <Icon src={ArrowLeftOnRectangle} size="16" micro />
          {/snippet}
          Log in
        </Button>
        <Button href="/signup" size="lg">
          {#snippet prefix()}
            <Icon src={Identification} size="16" micro />
          {/snippet}
          Sign up
        </Button>
      </div>
    </div>
  </div>
{:else}
  <div class="flex flex-col h-full gap-4">
    <Header pageHeader>
      {$t('routes.accounts')}
      {#snippet extended()}
        <div class="flex">
          <div class="flex gap-2 mr-auto">
            <Button
              href="/accounts/login"
              size="lg"
              class="flex-1 px-8"
              color="primary"
            >
              {#snippet prefix()}
                <Icon src={ArrowLeftOnRectangle} size="16" mini />
              {/snippet}
              {$t('account.login')}
            </Button>
            {#if !LINKED_INSTANCE_URL}
              <Button href="/accounts/login/guest" size="lg">
                {#snippet prefix()}
                  <Icon src={Plus} size="16" micro />
                {/snippet}
                {$t('account.addGuest')}
              </Button>
            {/if}
          </div>
        </div>
      {/snippet}
    </Header>
    <div>
      {#each profileData.profiles as profile, index (profile.id)}
        <div
          class="flex flex-row gap-2 items-center py-3"
          transition:fly={{ duration: 500, y: -12, easing: expoOut }}
        >
          <Button
            title={profile.id == currentProfile?.data.id ? 'Switch' : 'Current'}
            onclick={async () => {
              if (profile.id != currentProfile?.data.id) {
                switching = profile.id
                await setUserID(profile.id)
                switching = -69
              }
            }}
            size="square-md"
            color={profile.id == currentProfile?.data.id ? 'primary' : 'ghost'}
            loading={switching == profile.id}
            disabled={switching == profile.id}
            rounding="pill"
          >
            {#snippet prefix()}
              {#if profile.id == currentProfile?.data.id}
                <Icon src={Check} mini size="16" />
              {:else}
                <Icon src={ArrowsRightLeft} size="16" mini />
              {/if}
            {/snippet}
          </Button>
          <div class="flex items-center gap-2">
            <ProfileAvatar
              {profile}
              {index}
              selected={currentProfile?.data.id == profile.id}
              size={24}
            />
            <div class="flex flex-col">
              <span class="font-medium">{profile.username}</span>
              <span class="text-sm text-slate-600 dark:text-zinc-400">
                {profile.instance}
              </span>
            </div>
          </div>
          <div class="ml-auto"></div>
          <Menu placement="bottom-end">
            {#snippet target()}
              <Button size="square-md">
                {#snippet prefix()}
                  <Icon src={EllipsisHorizontal} mini size="16" />
                {/snippet}
              </Button>
            {/snippet}
            <div class="px-4 py-2 flex items-center gap-2">
              <Button
                size="square-md"
                color="secondary"
                title={$t('account.moveUp')}
                onclick={() => moveProfile(profile.id, true)}
              >
                {#snippet prefix()}
                  <Icon src={ChevronUp} size="16" mini />
                {/snippet}
              </Button>
              <Button
                size="square-md"
                color="secondary"
                title={$t('account.moveDown')}
                onclick={() => moveProfile(profile.id, false)}
              >
                {#snippet prefix()}
                  <Icon src={ChevronDown} size="16" mini />
                {/snippet}
              </Button>
            </div>
            {#if settings.debugInfo}
              <MenuButton
                onclick={() => {
                  debugProfile = profile
                  debugging = !debugging
                }}
              >
                {#snippet prefix()}
                  <Icon src={BugAnt} size="16" mini />
                {/snippet}
                {$t('common.debug')}
              </MenuButton>
            {/if}
            {#if !LINKED_INSTANCE_URL || profile.user}
              <MenuButton
                onclick={() => {
                  removing.account = profile
                  removing.shown = !removing.shown
                }}
                color="danger-subtle"
              >
                {#snippet prefix()}
                  <Icon src={ArrowRightOnRectangle} size="16" mini />
                {/snippet}
                {$t('account.logout')}
              </MenuButton>
            {/if}
          </Menu>
        </div>
      {/each}
    </div>
  </div>
{/if}

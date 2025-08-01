<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import ErrorContainer, {
    clearErrorScope,
    pushError,
  } from '$lib/components/error/ErrorContainer.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/i18n/translations'
  import {
    DEFAULT_INSTANCE_URL,
    LINKED_INSTANCE_URL,
  } from '$lib/instance.svelte.js'
  import { getClient, mayBeIncompatible, site } from '$lib/lemmy.svelte.js'
  import { errorMessage } from '$lib/lemmy/error'
  import { DOMAIN_REGEX_FORMS } from '$lib/util.svelte.js'
  import { MINIMUM_VERSION } from '$lib/version.js'
  import { Button, Note, TextInput, toast } from 'mono-svelte'
  import {
    Icon,
    Identification,
    QuestionMarkCircle,
    UserCircle,
  } from 'svelte-hero-icons'
  import { profile } from '$lib/auth.svelte'

  interface Props {
    ref?: string
    children?: import('svelte').Snippet
  }

  let { ref = page.url.searchParams.get('redirect') ?? '/', children }: Props =
    $props()

  let data = $state({
    instance: DEFAULT_INSTANCE_URL,
    username: '',
    password: '',
    totp: '',
    loading: false,
    attempts: 0,
  })

  async function logIn() {
    data.loading = true
    clearErrorScope(page.route.id)

    try {
      data.instance = data.instance.trim()

      const response = await getClient(data.instance).login({
        username_or_email: data.username.trim(),
        password: data.password,
        totp_2fa_token: data.totp,
      })

      if (response?.jwt) {
        const result = await profile.add(response.jwt, data.instance)

        if (result) {
          toast({ content: $t('toast.logIn'), type: 'success' })
          goto(ref)
        }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      pushError({
        message:
          // @ts-expect-error cursed json hack
          JSON.parse((error as object)?.body?.message ?? '{}')?.error ==
          'incorrect_login'
            ? errorMessage(
                'incorrect_login' +
                  (data.attempts == 0 || data.attempts >= 12
                    ? ''
                    : `_${data.attempts + 1}`),
              )
            : errorMessage(error),
        scope: page.route.id!,
      })
      data.attempts++
    }
    data.loading = false
  }
</script>

<svelte:head>
  <title>{$t('account.login')}</title>
</svelte:head>

<div class="max-w-xl w-full mx-auto h-max my-auto">
  <form onsubmit={preventDefault(logIn)} class="flex flex-col gap-5">
    <div class="flex flex-col">
      {@render children?.()}
      <Header>{$t('account.login')}</Header>
      {#if site.data && mayBeIncompatible(MINIMUM_VERSION, site.data.version.replace('v', ''))}
        <Note>
          {$t('account.versionGate', {
            version: `v${MINIMUM_VERSION}`,
          })}
        </Note>
      {/if}
      <ErrorContainer class="pt-2" scope={page.route.id} />
    </div>
    <div class="flex flex-row w-full items-center gap-2">
      <TextInput
        id="username"
        bind:value={data.username}
        label={$t('form.username')}
        class="flex-1"
        required
      />
      {#if !LINKED_INSTANCE_URL}
        <TextInput
          id="instance_url"
          label={$t('form.instance')}
          placeholder={DEFAULT_INSTANCE_URL}
          disabled={LINKED_INSTANCE_URL != undefined}
          bind:value={data.instance}
          class="flex-1"
          required
          pattern={DOMAIN_REGEX_FORMS}
          autocorrect="off"
          autocapitalize="none"
        />
      {/if}
    </div>
    <div class="flex flex-row gap-2">
      <TextInput
        id="password"
        bind:value={data.password}
        label={$t('form.password')}
        type="password"
        minlength={10}
        maxlength={60}
        required
        class="w-full"
      />
      <TextInput
        id="totp"
        bind:value={data.totp}
        label={$t('form.2fa')}
        placeholder="123456"
        pattern={'\\d{6}'}
        minlength={6}
        maxlength={6}
        class="w-24"
      />
    </div>
    <Button
      loading={data.loading}
      disabled={data.loading}
      color="primary"
      size="lg"
      submit
    >
      {$t('account.login')}
    </Button>
    <hr class="border-slate-200 dark:border-zinc-800" />
    <div class="flex flex-row items-center gap-2 overflow-auto *:shrink-0">
      <Button rounding="pill" color="ghost" href="/signup">
        <Icon src={Identification} mini size="16" />
        {$t('account.signup')}
      </Button>
      <Button rounding="pill" color="ghost" href="/login_reset">
        <Icon src={QuestionMarkCircle} mini size="16" />
        {$t('form.forgotpassword')}
      </Button>
      {#if !LINKED_INSTANCE_URL}
        <Button rounding="pill" color="ghost" href="/login/guest">
          <Icon src={UserCircle} mini size="16" />
          {$t('account.guest')}
        </Button>
      {/if}
    </div>
  </form>
</div>

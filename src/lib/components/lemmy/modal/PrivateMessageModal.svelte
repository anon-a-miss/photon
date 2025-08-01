<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { profile } from '$lib/auth.svelte.js'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import { t } from '$lib/i18n/translations'
  import type { Person } from 'lemmy-js-client'
  import { Button, Modal, toast } from 'mono-svelte'
  import { Icon, PaperAirplane } from 'svelte-hero-icons'
  import { errorMessage } from '$lib/lemmy/error'

  interface Props {
    open?: boolean
    user: Person
  }

  let { open = $bindable(false), user }: Props = $props()

  let message = $state('')

  let loading = $state(false)

  async function sendMessage() {
    if (!profile.current?.jwt || message == '') return

    loading = true

    try {
      await getClient().createPrivateMessage({
        content: message,
        recipient_id: user.id,
      })

      toast({
        content: $t('toast.sentMessage'),
        type: 'success',
      })

      open = false
    } catch (err) {
      toast({
        content: errorMessage(err as string),
        type: 'error',
      })
    }

    loading = false
  }
</script>

<Modal bind:open>
  {#snippet customTitle()}
    <h1 class="text-2xl font-bold">Message</h1>
  {/snippet}
  <form onsubmit={preventDefault(sendMessage)} class="flex flex-col gap-4">
    <p class="inline-flex flex-row gap-2 items-center">
      <Icon src={PaperAirplane} size="16" mini />
      <UserLink avatar {user} />
    </p>
    <MarkdownEditor
      bind:value={message}
      label={$t('content.message')}
      rows={4}
    />
    <Button color="primary" size="lg" submit {loading} disabled={loading}>
      {$t('common.send')}
    </Button>
  </form>
</Modal>

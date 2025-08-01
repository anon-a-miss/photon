<script lang="ts">
  import { goto } from '$app/navigation'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { client } from '$lib/lemmy.svelte'
  import { t } from '$lib/i18n/translations'
  import {
    Button,
    Checkbox,
    Material,
    Modal,
    removeToast,
    Switch,
    TextInput,
    toast,
  } from 'mono-svelte'
  import { profile } from '$lib/auth.svelte'

  let deletion = $state({
    modal: false,
    password: '',
    deleteContent: false,
  })

  async function deleteAccount(level: number) {
    switch (level) {
      case 0: {
        toast({
          content: $t('toast.confirmDelete1'),
          action: () => deleteAccount(1),
        })
        return
      }
      case 1: {
        toast({
          content: $t('toast.confirmDelete2'),
          action: () => deleteAccount(2),
        })
        return
      }
      case 2: {
        toast({
          content: $t('toast.confirmDelete3'),
          action: () => deleteAccount(3),
        })
        return
      }
      case 3: {
        deletion.modal = true
        deletion.password = ''
        return
      }
    }

    if (!(deletion.password || null)) {
      toast({
        content: $t('toast.needPassword'),
        type: 'warning',
      })
    }

    const id = toast({
      content: $t('toast.deleting'),
      loading: true,
    })

    try {
      await client().deleteAccount({
        password: deletion.password,

        delete_content: deletion.deleteContent,
      })

      profile.meta.profiles.splice(
        profile.meta.profiles.findIndex(p => profile.meta.profile == p.id),
      )

      profile.meta.profile = -1
      toast({
        content: $t('toast.deleted'),
      })
      goto('/')
    } catch (err) {
      toast({
        content: err as string,
        type: 'error',
      })
    } finally {
      removeToast(id)
    }
  }
</script>

{#if deletion.modal}
  <Modal
    bind:open={deletion.modal}
    action="Submit"
    onaction={() => deleteAccount(4)}
  >
    {#snippet customTitle()}
      <span>{$t('form.profile.deleteAccount.label')}</span>
    {/snippet}
    <TextInput
      label={$t('form.password')}
      type="password"
      bind:value={deletion.password}
    />
    <Checkbox bind:checked={deletion.deleteContent}>
      {$t('form.profile.deleteAccount.deleteContent')}
      {#snippet description()}
        <span>
          {$t('form.profile.deleteAccount.warning')}
        </span>
      {/snippet}
    </Checkbox>
  </Modal>
{/if}

<Material
  color="distinct"
  class="border-2 border-red-500! text-red-600 dark:text-red-400 flex flex-col gap-4"
  padding="xl"
  rounding="2xl"
>
  <Header class="mx-auto w-max font-bold!">
    {$t('routes.profile.delete.title')}
  </Header>
  <p class="text-base">
    {$t('routes.profile.delete.warning')}
  </p>
  <Switch bind:checked={deletion.deleteContent}>
    {$t('form.profile.deleteAccount.deleteContent')}
    {#snippet description()}
      <span>
        {$t('form.profile.deleteAccount.warning')}
      </span>
    {/snippet}
  </Switch>
  <Button size="lg" color="danger" onclick={() => deleteAccount(3)}>
    {$t('routes.profile.delete.title')}
  </Button>
</Material>

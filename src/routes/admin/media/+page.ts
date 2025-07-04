import { profile } from '$lib/auth.svelte'
import { client } from '$lib/lemmy.svelte.js'

export async function load({ fetch, url }) {
  const { jwt } = profile.data

  const page = Number(url.searchParams.get('page')) || 1

  const res = await client({ func: fetch, auth: jwt }).listAllMedia({
    limit: 20,
    page: page,
  })

  return { images: res.images }
}

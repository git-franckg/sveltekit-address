<script lang="ts">
  import type { AddressFetcher, Address, AddressPreview } from '$lib/index.js';
  import type { Snippet } from 'svelte';

  const {
    query,
    fetcher,
    onCompleted,
    suggestions,
    insufficientQuery,
    loading
  }: {
    query: string;
    fetcher: AddressFetcher;
    onCompleted: (address: Address | undefined) => void;
    suggestions: Snippet<[AddressPreview[], (selected: AddressPreview) => void, () => void]>;
    insufficientQuery?: Snippet;
    loading?: Snippet;
  } = $props();

  let previews = $state<AddressPreview[]>();
  const minLength = $derived(fetcher.minimumQueryLength ?? 1);

  $effect(() => {
    if (query.length < minLength) {
      previews = undefined;
      return;
    }

    const abort = new AbortController();
    previews = undefined;

    fetcher
      .search(query, abort.signal)
      .then((newData) => {
        abort.signal.throwIfAborted();
        previews = newData;
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name == 'AbortError') {
          // Request canceled
          return;
        }
        console.error('Failed to fetch suggestions', { query }, err);
        previews = [];
      });

    return () => {
      abort.abort();
    };
  });
</script>

{#if query.length < minLength}
  {@render insufficientQuery?.()}
{:else if previews === undefined}
  {@render loading?.()}
{:else}
  {@render suggestions(
    previews,
    (selection) => {
      previews = undefined;
      fetcher
        .getById(selection.id)
        .then((address) => onCompleted(address))
        .catch((err) => {
          if (err instanceof DOMException && err.name == 'AbortError') {
            // Request canceled
            return;
          }
          console.error('Failed to fetch address lookup', { query }, err);
        });
    },
    () => onCompleted(undefined)
  )}
{/if}

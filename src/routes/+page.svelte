<script lang="ts">
  import { fetchers, AddressAutocompletion, type AddressFetcher } from '$lib/index.js';

  let fetcherName = $state<'postnl'>('postnl');
  const fetcher = $derived.by<AddressFetcher | undefined>(() => {
    if (fetcherName == 'postnl') return new fetchers.PostNlAddressFetcher('FRA', 'fr');
    else return undefined;
  });

  let query = $state('');
</script>

<select bind:value={fetcherName}>
  <option value="postnl">PostNL</option>
</select>

<input type="text" bind:value={query} placeholder="Adresse" />

{#if fetcher}
  <AddressAutocompletion
    {query}
    {fetcher}
    onCompleted={(addr) => {
      alert(`Selected: ${JSON.stringify(addr)}`);
    }}
  >
    {#snippet suggestions(previews, selectSuggestion, disableAutocomplete)}
      <div style="display:flex;flex-direction:column;width:400px;">
        {#each previews as preview (preview.id)}
          <button onclick={() => selectSuggestion(preview)}>{preview.text}</button>
        {/each}
        <button onclick={() => disableAutocomplete()}>Saisi manuel</button>
      </div>
    {/snippet}
    {#snippet loading()}
      <p>Loading</p>
    {/snippet}
    {#snippet insufficientQuery()}
      <p>Les suggestions s'afficheront ici</p>
    {/snippet}
  </AddressAutocompletion>
{/if}

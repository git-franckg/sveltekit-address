import type { CountryIso3 } from '@git-franckg/countries';

export interface AddressPreview {
  id: string | number;
  text: string;
  countryIso3: CountryIso3;
}

export interface Address {
  addressLine1: string;
  city: string;
  postalCode: string;
}

export interface AddressFetcher {
  minimumQueryLength?: number;
  search(query: string, signal?: AbortSignal): Promise<AddressPreview[]>;
  getById(id: string | number, signal?: AbortSignal): Promise<Address>;
}

export * as fetchers from './fetchers/index.js';
export { default as AddressAutocompletion } from './AddressAutocompletion.svelte';

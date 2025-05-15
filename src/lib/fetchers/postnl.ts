import type { Address, AddressFetcher, AddressPreview } from '$lib/index.js';
import type { CountryIso3 } from '@git-franckg/countries';

export class PostNlAddressFetcher implements AddressFetcher {
  constructor(
    private countryIso3: CountryIso3,
    private language: string
  ) {}

  minimumQueryLength = 3;

  async search(query: string, signal?: AbortSignal): Promise<AddressPreview[]> {
    const url = new URL(
      'https://productprijslokatie.postnl.nl/location-widget/api/suggest?country=nld&query=Rueterlaan+3%2C+Blaricu&language=NL'
    );

    url.searchParams.set('country', this.countryIso3.toLowerCase());
    url.searchParams.set('query', query);
    url.searchParams.set('language', this.language.toUpperCase());

    const resp = await fetch(url, {
      signal,
      credentials: 'omit',
      headers: {
        Accept: 'application/json'
      },
      // referrer: 'https://www.postnl.nl/',
      method: 'GET',
      mode: 'cors'
    });

    const geojson = (await resp.json()) as {
      type: 'FeatureCollection';
      features: {
        type: 'Feature';
        id: string | number;
        properties: {
          country: 'The Netherlands' | CountryIso3;
          name: string;
        };
      }[];
    };

    return geojson.features
      .map((feature) => {
        if (!feature.id) {
          console.warn('PostNL has returned a geojson feature without id.', { geojson, feature });
          return undefined;
        }

        return {
          id: feature.id,
          countryIso3: feature.properties.country == 'The Netherlands' ? 'NLD' : feature.properties.country,
          text: feature.properties.name
        } satisfies AddressPreview;
      })
      .filter((it) => it != undefined);
  }

  async getById(id: string | number, signal?: AbortSignal): Promise<Address> {
    const url = new URL(
      'https://productprijslokatie.postnl.nl/location-widget/api/lookup?q=TkxELy8vL2FkZHJlc3MtMDM3NjEwMDAwMDAxODcyOS0wMzc2MjAwMDAwMTc3MDc5&id=TkxELy8vL2FkZHJlc3MtMDM3NjEwMDAwMDAxODcyOS0wMzc2MjAwMDAwMTc3MDc5'
    );

    url.searchParams.set('q', id.toString());
    url.searchParams.set('id', id.toString());

    const resp = await fetch(url, {
      signal,
      credentials: 'omit',
      headers: {
        Accept: 'application/json'
      },
      referrer: 'https://www.postnl.nl/',
      method: 'GET',
      mode: 'cors'
    });

    const {
      features: [feature]
    } = (await resp.json()) as {
      type: 'FeatureCollection';
      features: [
        {
          type: 'Feature';
          properties: {
            building: string;
            street: string;
            city: string;
            municipality: string;
            postalCode: string;
          };
        }
      ];
    };

    return {
      addressLine1: `${feature.properties.building} ${feature.properties.street}`,
      city: feature.properties.city ?? feature.properties.municipality,
      postalCode: feature.properties.postalCode
    } satisfies Address;
  }
}

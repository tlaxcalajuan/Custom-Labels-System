export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonSummary[];
}

export interface PokemonSummary {
  name: string;
  url: string;
}

export interface Type {
  name: string;
  url: string;
}

export interface TypeDetails {
  name: string;
  damage_relations: {
    no_damage_to: Type[];
    half_damage_to: Type[];
    double_damage_to: Type[];
    no_damage_from: Type[];
    half_damage_from: Type[];
    double_damage_from: Type[];
  };
}
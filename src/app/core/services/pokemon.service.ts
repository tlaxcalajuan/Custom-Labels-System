import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import {
  Pokemon,
  PokemonListResponse,
  PokemonSummary,
  Type,
  TypeDetails,
} from '../../shared/models/pokemon';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly apiUrl = 'https://pokeapi.co/api/v2';
  private readonly httpClient = inject(HttpClient);

  constructor() {}

  getPokemons(limit: number = 151, offset: number = 0): Observable<PokemonListResponse> {
    return this.httpClient.get<PokemonListResponse>(`${this.apiUrl}/pokemon`, {
      params: { limit: limit.toString(), offset: offset.toString() },
    });
  }

  getPokemonByName(name: string): Observable<Pokemon> {
    return this.httpClient.get<Pokemon>(`${this.apiUrl}/pokemon/${name}`);
  }

  getPokemonTypes(limit: number = 20): Observable<Type[]> {
    return this.httpClient.get<{ results: Type[] }>(`${this.apiUrl}/type`).pipe(
      map((response) => response.results.slice(0, limit))
    );
  }

  getTypeDetails(url: string): Observable<TypeDetails> {
    return this.httpClient.get<TypeDetails>(url);
  }

  searchPokemons(term: string): Observable<PokemonSummary[]> {
    if (!term.trim()) {
      return new Observable<PokemonSummary[]>((observer) => observer.next([]));
    }

    return this.httpClient
      .get<PokemonListResponse>(`${this.apiUrl}/pokemon`, {
        params: { limit: '1154' },
      })
      .pipe(
        map((response) =>
          response.results.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(term.toLowerCase())
          )
        )
      );
  }
}
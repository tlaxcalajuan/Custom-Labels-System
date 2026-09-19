import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../../core/services/pokemon.service';
import { Pokemon, PokemonListResponse, PokemonSummary } from '../../../shared/models/pokemon';
import { RouterLink } from '@angular/router';
import { TitlecasePipe } from '../../../shared/pipes/titlecase.pipe';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TitlecasePipe],
  template: `
    <div class="pokemon-list">
      <div class="search-container">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          placeholder="Buscar Pokémon..."
          class="search-input"
        />
      </div>

      <div class="pokemon-grid">
        @for (pokemon of pokemons(); track pokemon.id) {
          <div class="pokemon-card">
            <img [src]="pokemon.sprites.other['official-artwork'].front_default" [alt]="pokemon.name" />
            <h3>{{ pokemon.name | titlecase }}</h3>
            <div class="pokemon-types">
              @for (type of pokemon.types; track type.slot) {
                <span class="type-badge type-{{ type.type.name }}">{{ type.type.name }}</span>
              }
            </div>
            <a [routerLink]="['/pokemons', pokemon.name]" class="view-btn">Ver Detalles</a>
          </div>
        }
      </div>

      @if (isLoading()) {
        <div class="loading">Cargando Pokémon...</div>
      }

      @if (pokemons().length === 0 && !isLoading()) {
        <div class="no-results">No se encontraron Pokémon</div>
      }
    </div>
  `,
  styles: [`
    .pokemon-list {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .search-container {
      margin-bottom: 30px;
    }

    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 12px 20px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .pokemon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .pokemon-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .pokemon-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .pokemon-card img {
      width: 150px;
      height: 150px;
      object-fit: contain;
      margin-bottom: 15px;
    }

    .pokemon-card h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .pokemon-types {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 15px;
    }

    .type-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: white;
      text-transform: capitalize;
    }

    .type-badge.type-normal { background: #a8a77a; }
    .type-badge.type-fire { background: #ee8130; }
    .type-badge.type-water { background: #6390f0; }
    .type-badge.type-electric { background: #f7d02c; }
    .type-badge.type-grass { background: #7ac74c; }
    .type-badge.type-ice { background: #96d9d6; }
    .type-badge.type-fighting { background: #c22e28; }
    .type-badge.type-poison { background: #a33ea1; }
    .type-badge.type-ground { background: #e2bf65; }
    .type-badge.type-flying { background: #a98ff3; }
    .type-badge.type-fairy { background: #d685ad; }

    .view-btn {
      display: inline-block;
      padding: 8px 20px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: background 0.3s;
    }

    .view-btn:hover {
      background: #2563eb;
    }

    .loading, .no-results {
      text-align: center;
      padding: 40px;
      font-size: 18px;
      color: #666;
    }
  `]
})
export class PokemonListComponent implements OnInit {
  pokemons = signal<Pokemon[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.isLoading.set(true);
    this.pokemonService.getPokemons(151).subscribe({
      next: (response) => {
        this.pokemons.set(response.results.map((p, index) => ({
          ...p,
          id: index + 1,
          sprites: {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
            other: {
              'official-artwork': {
                front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`,
              },
            },
          },
          height: 0,
          weight: 0,
          types: [],
        })));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        console.error('Error loading Pokémon');
      },
    });
  }

  onSearch(): void {
    const term = this.searchTerm();
    if (term.length < 2) {
      this.loadPokemons();
      return;
    }

    this.isLoading.set(true);
    this.pokemonService.searchPokemons(term).subscribe({
      next: (results) => {
        this.pokemons.set(results.map((p, index) => ({
          ...p,
          id: index + 1,
          sprites: {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
            other: {
              'official-artwork': {
                front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`,
              },
            },
          },
          height: 0,
          weight: 0,
          types: [],
        })));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        console.error('Error searching Pokémon');
      },
    });
  }
}
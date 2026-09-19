import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PokemonService } from '../../../core/services/pokemon.service';
import { Pokemon } from '../../../shared/models/pokemon';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TitleCasePipe],
  template: `
    <div class="pokemon-detail">
      <a [routerLink]="['/pokemons']" class="back-btn">← Volver a la lista</a>

      @if (pokemon(); as p) {
        <div class="detail-container">
          <div class="detail-header">
            <h1>{{ p.name | titlecase }}</h1>
            <span class="pokemon-id">#{{ p.id | number:'03' }}</span>
          </div>

          <div class="detail-content">
            <div class="image-section">
              <img [src]="p.sprites.other['official-artwork'].front_default" [alt]="p.name" />
            </div>

            <div class="info-section">
              <div class="info-grid">
                <div class="info-item">
                  <h4>Altura</h4>
                  <p>{{ p.height / 10 }} m</p>
                </div>
                <div class="info-item">
                  <h4>Peso</h4>
                  <p>{{ p.weight / 10 }} kg</p>
                </div>
              </div>

              <div class="types-section">
                <h4>Tipos</h4>
                <div class="types-list">
                  @for (type of p.types; track type.slot) {
                    <span class="type-badge type-{{ type.type.name }}">{{ type.type.name }}</span>
                  }
                </div>
              </div>

              <div class="abilities-section">
                <h4>Habilidades</h4>
                <p class="no-data">Información de habilidades no disponible en esta demo</p>
              </div>
            </div>
          </div>
        </div>
      } @else if (isLoading()) {
        <div class="loading">Cargando Pokémon...</div>
      }
    </div>
  `,
  styles: [`
    .pokemon-detail {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    .back-btn {
      display: inline-block;
      padding: 10px 20px;
      background: #6b7280;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-bottom: 20px;
      transition: background 0.3s;
    }

    .back-btn:hover {
      background: #4b5563;
    }

    .detail-container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .detail-header h1 {
      margin: 0;
      color: #1f2937;
      text-transform: capitalize;
    }

    .pokemon-id {
      font-size: 18px;
      color: #6b7280;
      font-weight: 600;
    }

    .detail-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 30px;
    }

    .image-section {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .image-section img {
      width: 250px;
      height: 250px;
      object-fit: contain;
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .info-item {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }

    .info-item h4 {
      margin: 0 0 5px 0;
      color: #6b7280;
      font-size: 14px;
    }

    .info-item p {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .types-section h4, .abilities-section h4 {
      color: #1f2937;
      margin: 0 0 10px 0;
    }

    .types-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .type-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
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

    .no-data {
      color: #6b7280;
      font-style: italic;
    }

    .loading {
      text-align: center;
      padding: 60px;
      font-size: 18px;
      color: #6b7280;
    }
  `]
})
export class PokemonDetailComponent implements OnInit {
  pokemon = signal<Pokemon | null>(null);
  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? '';
    this.loadPokemon(name);
  }

  loadPokemon(name: string): void {
    this.isLoading.set(true);
    this.pokemonService.getPokemonByName(name).subscribe({
      next: (data) => {
        this.pokemon.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        console.error('Error loading Pokémon details');
      },
    });
  }
}
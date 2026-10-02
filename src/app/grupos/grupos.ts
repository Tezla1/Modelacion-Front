import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoService } from '../services/grupo';
import { Grupo } from '../models/grupo.model';

@Component({
  selector: 'app-grupos',
  imports: [CommonModule, FormsModule],
  templateUrl: './grupos.html',
  styleUrl: './grupos.css',
})
export class Grupos implements OnInit {
  private grupoService = inject(GrupoService);

  // El template lee este signal directamente - cuando el WebSocket
  // actualiza un cupo, esto se refleja solo, sin que el componente haga nada más.
  grupos = this.grupoService.grupos;

  codigoEstudiante = 'EST-001';
  mensaje = '';
  esError = false;

  ngOnInit(): void {
    this.grupoService.cargarGrupos();
  }

  inscribirme(grupoId: number): void {
    this.grupoService.inscribir(grupoId, this.codigoEstudiante).subscribe({
      next: () => {
        this.esError = false;
        this.mensaje = `Inscripción exitosa en el grupo ${grupoId}`;
      },
      error: (err) => {
        this.esError = true;
        this.mensaje = `Error: ${err.error?.message ?? 'no se pudo inscribir (¿ya no quedan cupos?)'}`;
      },
    });
  }

  porcentaje(g: Grupo): number {
    return g.cuposTotales ? (g.cuposDisponibles / g.cuposTotales) * 100 : 0;
  }

  nivel(g: Grupo): 'alto' | 'medio' | 'bajo' | 'agotado' {
    if (g.cuposDisponibles === 0) return 'agotado';
    const p = this.porcentaje(g);
    return p > 40 ? 'alto' : p > 15 ? 'medio' : 'bajo';
  }
}

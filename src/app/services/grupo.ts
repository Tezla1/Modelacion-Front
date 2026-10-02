import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Grupo, CupoActualizadoEvent } from '../models/grupo.model';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080';

  // signal: Angular re-renderiza solo las partes del HTML que usan este valor
  // cada vez que cambia — ni siquiera hace falta pedirlo, es automático.
  grupos = signal<Grupo[]>([]);

  private stompClient?: Client;

  // 1) Trae la lista inicial por HTTP normal (como ya probamos en Postman)
  cargarGrupos(): void {
    this.http.get<Grupo[]>(`${this.baseUrl}/api/grupos`).subscribe((data) => {
      this.grupos.set(data);
      this.conectarWebSocket(data);
    });
  }

  inscribir(grupoId: number, codigoEstudiante: string) {
    return this.http.post(`${this.baseUrl}/api/inscripciones`, { grupoId, codigoEstudiante });
  }

  // 2) Una vez tiene la lista, se suscribe al canal de CADA grupo
  //    (el mismo "/topic/grupos/{id}" que publica el InscripcionService en Spring Boot)
  private conectarWebSocket(gruposIniciales: Grupo[]): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${this.baseUrl}/ws`),
      reconnectDelay: 5000, // si se corta la conexión, reintenta solo cada 5s
    });

    this.stompClient.onConnect = () => {
      gruposIniciales.forEach((grupo) => {
        this.stompClient!.subscribe(`/topic/grupos/${grupo.id}`, (message: IMessage) => {
          const evento: CupoActualizadoEvent = JSON.parse(message.body);
          this.actualizarCupos(evento);
        });
      });
    };

    this.stompClient.activate();
  }

  // 3) Cuando llega un mensaje, actualiza SOLO el grupo que cambió —
  //    sin volver a pedirle nada al backend. Esto es lo que reemplaza
  //    el "refrescar la página" del modelo original.
  private actualizarCupos(evento: CupoActualizadoEvent): void {
    this.grupos.update((lista) =>
      lista.map((g) => (g.id === evento.grupoId ? { ...g, cuposDisponibles: evento.cuposDisponibles } : g))
    );
  }
}

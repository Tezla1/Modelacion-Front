import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Grupos } from './grupos/grupos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Grupos],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('matricula-frontend');
}

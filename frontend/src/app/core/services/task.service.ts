import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, CreateTaskDto, UpdateTaskDto, ApiResponse } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  // Master signal — private writable, public readonly
  private readonly _tasks = signal<Task[]>([]);
  readonly tasks = this._tasks.asReadonly();

  // Derived computed signal
  readonly pendingCount = computed(() => this._tasks().filter(t => !t.completed).length);

  // Loading state — exposed as Observable for toSignal() consumption in components (D-16)
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  loadTasks(): void {
    this._loading$.next(true);
    this.http.get<ApiResponse<Task[]>>(this.apiUrl).subscribe({
      next: ({ data }) => {
        this._tasks.set(
          [...data].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
        this._loading$.next(false);
      },
      error: () => this._loading$.next(false),
    });
  }

  createTask(dto: CreateTaskDto): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, dto).pipe(
      tap(({ data }) => this._tasks.update(tasks => [data, ...tasks])),
    );
  }

  updateTask(id: number, dto: UpdateTaskDto): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(({ data }) =>
        this._tasks.update(tasks => tasks.map(t => (t.id === id ? data : t))),
      ),
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this._tasks.update(tasks => tasks.filter(t => t.id !== id))),
    );
  }

  toggleTask(id: number): Observable<ApiResponse<Task>> {
    return this.http
      .patch<ApiResponse<Task>>(`${this.apiUrl}/${id}/toggle`, {})
      .pipe(
        tap(({ data }) =>
          this._tasks.update(tasks => tasks.map(t => (t.id === id ? data : t))),
        ),
      );
  }
}

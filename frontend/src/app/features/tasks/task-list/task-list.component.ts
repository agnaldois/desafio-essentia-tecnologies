import {
  Component, OnInit, inject, ChangeDetectionStrategy,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    TaskCardComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  protected readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  // Bridge TaskService's loading$ Observable to the signal boundary (D-16)
  readonly isLoading = toSignal(this.taskService.loading$, { initialValue: false });

  ngOnInit(): void {
    this.taskService.loadTasks();
  }

  openCreateModal(): void {
    this.dialog.open(TaskFormComponent, { width: '480px' });
  }

  onToggle(id: number): void {
    this.taskService.toggleTask(id).subscribe();
  }

  onEdit(task: Task): void {
    this.dialog.open(TaskFormComponent, {
      width: '480px',
      data: task,
    });
  }

  onDelete(id: number): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { width: '320px' });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.taskService.deleteTask(id).subscribe();
      }
    });
  }
}

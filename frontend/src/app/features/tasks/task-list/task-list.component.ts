import {
  Component, OnInit, inject, ChangeDetectionStrategy, viewChild,
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
    TaskFormComponent,
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

  // Reference to the inline form component for CTA focus (empty state D-03)
  readonly createForm = viewChild(TaskFormComponent);

  // Bridge TaskService's loading$ Observable to the signal boundary (D-16)
  // toSignal() MUST be called as a field initializer, never inside ngOnInit()
  readonly isLoading = toSignal(this.taskService.loading$, { initialValue: false });

  ngOnInit(): void {
    this.taskService.loadTasks();
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

  focusCreateForm(): void {
    // Delegate focus to the inline form component (D-03 CTA action)
    this.createForm()?.focusTitleInput();
  }
}

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { DatePipe, TitleCasePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, NgClass, MatCardModule, MatCheckboxModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  // Signal inputs — Angular 17+ API (not @Input() decorator)
  task = input.required<Task>();

  // Output events — emits id or full task upward; no direct service calls
  toggle = output<number>();  // emits task.id on checkbox change
  edit   = output<Task>();    // emits full Task for form pre-fill
  delete = output<number>();  // emits task.id for confirm dialog

  // Computed due date state for badge color/icon
  readonly dueDateState = computed(() => {
    const due = this.task().dueDate;
    if (!due) return null;
    const dueDate = new Date(due);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate.getTime() === today.getTime()) return 'today';
    if (dueDate < today) return 'overdue';
    return 'upcoming';
  });
}

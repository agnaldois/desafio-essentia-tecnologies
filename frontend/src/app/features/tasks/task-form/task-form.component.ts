import {
  Component, OnInit, inject, input, output,
  ChangeDetectionStrategy, computed, ElementRef, viewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  // Signal inputs — used when rendered inline in TaskListComponent
  task = input<Task | null>(null);
  saved = output<void>();

  // Dialog context — populated only when opened via MatDialog.open(TaskFormComponent, { data: task })
  // MUST use { optional: true } — without it, NullInjectorError when rendered inline (Pitfall 3)
  private readonly dialogRef = inject(MatDialogRef<TaskFormComponent>, { optional: true });
  private readonly dialogData = inject<Task | null>(MAT_DIALOG_DATA, { optional: true });

  private readonly taskService = inject(TaskService);

  // ViewChild reference to the title input for CTA focus (D-03)
  readonly titleInputRef = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  readonly isEditMode = computed(() => !!this.task() || !!this.dialogData);
  readonly isModal = computed(() => !!this.dialogRef);

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    description: new FormControl<string | null>(null),
    priority: new FormControl<'low' | 'medium' | 'high'>('medium'),
    dueDate: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    // Resolve task from either inline input or dialog data
    const taskToEdit = this.task() ?? this.dialogData;
    if (taskToEdit) {
      this.form.patchValue({
        title: taskToEdit.title,
        description: taskToEdit.description ?? null,
        priority: taskToEdit.priority ?? 'medium',
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    // Use getRawValue() to include all controls including disabled ones (Pitfall 8)
    const value = this.form.getRawValue();
    const dto = {
      title: value.title!,
      description: value.description ?? undefined,
      priority: value.priority!,
      dueDate: value.dueDate?.toISOString().split('T')[0] ?? undefined,
    };

    const taskToEdit = this.task() ?? this.dialogData;
    const op = taskToEdit
      ? this.taskService.updateTask(taskToEdit.id, dto)
      : this.taskService.createTask(dto);

    op.subscribe({
      next: () => {
        this.form.reset({ priority: 'medium' });
        this.saved.emit();
        this.dialogRef?.close(true); // closes dialog if in modal mode; no-op if inline
      },
    });
  }

  focusTitleInput(): void {
    const input = this.titleInputRef();
    if (input) {
      input.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.nativeElement.focus();
    }
  }
}

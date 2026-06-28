package com.trello.dto;

import com.trello.entity.TaskPriority;
import com.trello.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskCreateDto {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private TaskStatus status = TaskStatus.TODO; // default to TODO

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Board ID is required")
    private Long boardId;

    private Long assigneeId;
}

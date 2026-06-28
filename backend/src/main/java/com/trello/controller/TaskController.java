package com.trello.controller;

import com.trello.dto.BoardEvent;
import com.trello.dto.TaskCreateDto;
import com.trello.dto.TaskDto;
import com.trello.entity.TaskStatus;
import com.trello.security.UserPrincipal;
import com.trello.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(@RequestParam(required = false) Long boardId,
                                                 @AuthenticationPrincipal UserPrincipal currentUser) {
        List<TaskDto> tasks = taskService.getTasks(boardId, currentUser);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id,
                                               @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskDto task = taskService.getTaskById(id, currentUser);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskCreateDto createDto,
                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskDto createdTask = taskService.createTask(createDto, currentUser);
        
        // WebSocket broadcast
        messagingTemplate.convertAndSend("/topic/board/" + createdTask.getBoardId(), 
                new BoardEvent<>("TASK_CREATED", createdTask));

        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id,
                                              @Valid @RequestBody TaskCreateDto createDto,
                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskDto updatedTask = taskService.updateTask(id, createDto, currentUser);

        // WebSocket broadcast
        messagingTemplate.convertAndSend("/topic/board/" + updatedTask.getBoardId(), 
                new BoardEvent<>("TASK_UPDATED", updatedTask));

        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           @AuthenticationPrincipal UserPrincipal currentUser) {
        // Fetch task info to know which board it belongs to before deleting
        TaskDto task = taskService.getTaskById(id, currentUser);
        taskService.deleteTask(id, currentUser);

        // WebSocket broadcast
        messagingTemplate.convertAndSend("/topic/board/" + task.getBoardId(), 
                new BoardEvent<>("TASK_DELETED", task));

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TaskDto> moveTask(@PathVariable Long id,
                                            @RequestParam TaskStatus status,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskDto updatedTask = taskService.moveTask(id, status, currentUser);

        // WebSocket broadcast
        messagingTemplate.convertAndSend("/topic/board/" + updatedTask.getBoardId(), 
                new BoardEvent<>("TASK_MOVED", updatedTask));

        return ResponseEntity.ok(updatedTask);
    }
}

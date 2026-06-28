package com.trello.service;

import com.trello.dto.TaskCreateDto;
import com.trello.dto.TaskDto;
import com.trello.dto.UserDto;
import com.trello.entity.Board;
import com.trello.entity.Task;
import com.trello.entity.TaskStatus;
import com.trello.entity.User;
import com.trello.exception.ResourceNotFoundException;
import com.trello.exception.UnauthorizedException;
import com.trello.repository.TaskRepository;
import com.trello.repository.UserRepository;
import com.trello.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardService boardService;

    @Autowired
    private UserService userService;

    @Transactional(readOnly = true)
    public List<TaskDto> getTasks(Long boardId, UserPrincipal currentUser) {
        if (boardId == null) {
            // If no boardId is provided, return all tasks user has access to.
            // For simplicity in a Mini Trello, we usually display tasks inside a board.
            // But let's return all tasks if boardId is null, checking board access for each.
            return taskRepository.findAll().stream()
                    .filter(t -> {
                        try {
                            boardService.verifyBoardAccess(t.getBoard().getId(), currentUser);
                            return true;
                        } catch (UnauthorizedException e) {
                            return false;
                        }
                    })
                    .map(this::mapToTaskDto)
                    .collect(Collectors.toList());
        }

        boardService.verifyBoardAccess(boardId, currentUser);
        return taskRepository.findAllByBoardId(boardId).stream()
                .map(this::mapToTaskDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long taskId, UserPrincipal currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        boardService.verifyBoardAccess(task.getBoard().getId(), currentUser);
        return mapToTaskDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskCreateDto createDto, UserPrincipal currentUser) {
        boardService.verifyBoardAccess(createDto.getBoardId(), currentUser);

        Board board = boardService.findEntityById(createDto.getBoardId());
        User creator = userService.findEntityById(currentUser.getId());
        User assignee = null;

        if (createDto.getAssigneeId() != null) {
            assignee = userService.findEntityById(createDto.getAssigneeId());
        }

        Task task = Task.builder()
                .title(createDto.getTitle())
                .description(createDto.getDescription())
                .status(createDto.getStatus() != null ? createDto.getStatus() : TaskStatus.TODO)
                .priority(createDto.getPriority())
                .dueDate(createDto.getDueDate())
                .board(board)
                .assignee(assignee)
                .createdBy(creator)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToTaskDto(savedTask);
    }

    @Transactional
    public TaskDto updateTask(Long taskId, TaskCreateDto createDto, UserPrincipal currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        // Member must own the task (be creator or assignee) or be Admin
        verifyTaskManagementPermission(task, currentUser);

        // Assignee check
        User assignee = null;
        if (createDto.getAssigneeId() != null) {
            assignee = userService.findEntityById(createDto.getAssigneeId());
        }

        task.setTitle(createDto.getTitle());
        task.setDescription(createDto.getDescription());
        task.setPriority(createDto.getPriority());
        task.setDueDate(createDto.getDueDate());
        task.setAssignee(assignee);
        if (createDto.getStatus() != null) {
            task.setStatus(createDto.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        return mapToTaskDto(updatedTask);
    }

    @Transactional
    public void deleteTask(Long taskId, UserPrincipal currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        // Member must own the task or be Admin
        verifyTaskManagementPermission(task, currentUser);

        taskRepository.delete(task);
    }

    @Transactional
    public TaskDto moveTask(Long taskId, TaskStatus status, UserPrincipal currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        // Member must own the task or be Admin
        verifyTaskManagementPermission(task, currentUser);

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskDto(updatedTask);
    }

    public void verifyTaskManagementPermission(Task task, UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return;
        }

        // MEMBER can only manage their own tasks (created by them OR assigned to them)
        boolean isCreator = task.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(currentUser.getId());

        if (!isCreator && !isAssignee) {
            throw new UnauthorizedException("You are not authorized to modify this task. You must be either the creator or assignee.");
        }
    }

    public TaskDto mapToTaskDto(Task task) {
        UserDto assigneeDto = null;
        if (task.getAssignee() != null) {
            assigneeDto = userService.mapToUserDto(task.getAssignee());
        }

        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .boardId(task.getBoard().getId())
                .assignee(assigneeDto)
                .createdBy(userService.mapToUserDto(task.getCreatedBy()))
                .build();
    }
}

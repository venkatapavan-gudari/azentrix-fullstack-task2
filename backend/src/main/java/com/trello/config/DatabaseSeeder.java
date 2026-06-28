package com.trello.config;

import com.trello.entity.*;
import com.trello.repository.BoardMemberRepository;
import com.trello.repository.BoardRepository;
import com.trello.repository.TaskRepository;
import com.trello.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardMemberRepository boardMemberRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Seeding database with default users, boards, and tasks...");

            // 1. Create Default Users
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@trello.com")
                    .password(passwordEncoder.encode("password"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User member = User.builder()
                    .name("John Member")
                    .email("member@trello.com")
                    .password(passwordEncoder.encode("password"))
                    .role(Role.MEMBER)
                    .build();
            userRepository.save(member);

            log.info("Created Users: admin@trello.com (ADMIN), member@trello.com (MEMBER)");

            // 2. Create Default Boards
            Board board1 = Board.builder()
                    .name("Azentrix Web Project")
                    .description("Core product development board for Azentrix Internship Task 2.")
                    .createdBy(admin)
                    .build();
            boardRepository.save(board1);

            Board board2 = Board.builder()
                    .name("Marketing Campaign")
                    .description("Social media rollout and advertising planning.")
                    .createdBy(admin)
                    .build();
            boardRepository.save(board2);

            log.info("Created Boards: Azentrix Web Project, Marketing Campaign");

            // 3. Assign Member to Boards
            BoardMember bm1 = BoardMember.builder()
                    .board(board1)
                    .user(member)
                    .build();
            boardMemberRepository.save(bm1);

            BoardMember bm2 = BoardMember.builder()
                    .board(board1)
                    .user(admin)
                    .build();
            boardMemberRepository.save(bm2);

            log.info("Assigned member@trello.com and admin@trello.com to Azentrix Web Project");

            // 4. Create Default Tasks
            Task task1 = Task.builder()
                    .title("Setup Spring Boot Backend")
                    .description("Initialize project, write JPA models, secure REST APIs with JWT, configure websocket connection.")
                    .status(TaskStatus.DONE)
                    .priority(TaskPriority.HIGH)
                    .dueDate(LocalDate.now().minusDays(1))
                    .board(board1)
                    .assignee(admin)
                    .createdBy(admin)
                    .build();
            taskRepository.save(task1);

            Task task2 = Task.builder()
                    .title("Build Glassmorphic React UI")
                    .description("Develop dynamic dashboard, Kanban drag & drop, WebSocket integration, and responsive dark layouts.")
                    .status(TaskStatus.IN_PROGRESS)
                    .priority(TaskPriority.MEDIUM)
                    .dueDate(LocalDate.now().plusDays(3))
                    .board(board1)
                    .assignee(member)
                    .createdBy(admin)
                    .build();
            taskRepository.save(task2);

            Task task3 = Task.builder()
                    .title("Write Documentation & Deploy")
                    .description("Document environment setup instructions, database schema details, and deploy to Vercel/Render.")
                    .status(TaskStatus.TODO)
                    .priority(TaskPriority.LOW)
                    .dueDate(LocalDate.now().plusDays(7))
                    .board(board1)
                    .assignee(member)
                    .createdBy(admin)
                    .build();
            taskRepository.save(task3);

            log.info("Created initial Tasks for Azentrix Web Project board.");
        } else {
            log.info("Database already contains records. Skipping seeding.");
        }
    }
}

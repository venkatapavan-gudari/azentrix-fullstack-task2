package com.trello.repository;

import com.trello.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByBoardId(Long boardId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.board.id = :boardId")
    long countByBoardId(@Param("boardId") Long boardId);
}

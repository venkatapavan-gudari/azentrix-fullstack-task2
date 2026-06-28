package com.trello.repository;

import com.trello.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    
    @Query("SELECT DISTINCT b FROM Board b LEFT JOIN BoardMember bm ON b.id = bm.board.id " +
           "WHERE b.createdBy.id = :userId OR bm.user.id = :userId")
    List<Board> findBoardsByMemberOrCreator(@Param("userId") Long userId);
}

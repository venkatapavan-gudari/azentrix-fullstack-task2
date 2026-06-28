package com.trello.repository;

import com.trello.entity.BoardMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {
    List<BoardMember> findAllByBoardId(Long boardId);
    boolean existsByBoardIdAndUserId(Long boardId, Long userId);
    Optional<BoardMember> findByBoardIdAndUserId(Long boardId, Long userId);
    void deleteByBoardIdAndUserId(Long boardId, Long userId);
}

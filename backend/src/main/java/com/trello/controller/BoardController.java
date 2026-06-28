package com.trello.controller;

import com.trello.dto.BoardCreateDto;
import com.trello.dto.BoardDto;
import com.trello.dto.BoardMembersUpdateDto;
import com.trello.dto.UserDto;
import com.trello.security.UserPrincipal;
import com.trello.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    @Autowired
    private BoardService boardService;

    @GetMapping
    public ResponseEntity<List<BoardDto>> getAllBoards(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<BoardDto> boards = boardService.getUserBoards(currentUser);
        return ResponseEntity.ok(boards);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDto> getBoardById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        BoardDto board = boardService.getBoardById(id, currentUser);
        return ResponseEntity.ok(board);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardDto> createBoard(@Valid @RequestBody BoardCreateDto createDto,
                                                @AuthenticationPrincipal UserPrincipal currentUser) {
        BoardDto createdBoard = boardService.createBoard(createDto, currentUser);
        return new ResponseEntity<>(createdBoard, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardDto> updateBoard(@PathVariable Long id,
                                                @Valid @RequestBody BoardCreateDto createDto,
                                                @AuthenticationPrincipal UserPrincipal currentUser) {
        BoardDto updatedBoard = boardService.updateBoard(id, createDto, currentUser);
        return ResponseEntity.ok(updatedBoard);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        boardService.deleteBoard(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserDto>> getBoardMembers(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserPrincipal currentUser) {
        List<UserDto> members = boardService.getBoardMembers(id, currentUser);
        return ResponseEntity.ok(members);
    }

    @PutMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateBoardMembers(@PathVariable Long id,
                                                   @RequestBody BoardMembersUpdateDto updateDto,
                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        boardService.updateBoardMembers(id, updateDto, currentUser);
        return ResponseEntity.ok().build();
    }
}

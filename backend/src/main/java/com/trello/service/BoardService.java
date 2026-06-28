package com.trello.service;

import com.trello.dto.BoardCreateDto;
import com.trello.dto.BoardDto;
import com.trello.dto.BoardMembersUpdateDto;
import com.trello.dto.UserDto;
import com.trello.entity.Board;
import com.trello.entity.BoardMember;
import com.trello.entity.Role;
import com.trello.entity.User;
import com.trello.exception.BadRequestException;
import com.trello.exception.ResourceNotFoundException;
import com.trello.exception.UnauthorizedException;
import com.trello.repository.BoardMemberRepository;
import com.trello.repository.BoardRepository;
import com.trello.repository.TaskRepository;
import com.trello.repository.UserRepository;
import com.trello.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardMemberRepository boardMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @Transactional(readOnly = true)
    public List<BoardDto> getUserBoards(UserPrincipal currentUser) {
        List<Board> boards;
        if (currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            // Admin can view all boards
            boards = boardRepository.findAll();
        } else {
            // Members view assigned boards (creator or member)
            boards = boardRepository.findBoardsByMemberOrCreator(currentUser.getId());
        }

        return boards.stream()
                .map(this::mapToBoardDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BoardDto getBoardById(Long boardId, UserPrincipal currentUser) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));

        // Security check: must be Admin, Creator, or Assigned member
        verifyBoardAccess(boardId, currentUser);

        return mapToBoardDto(board);
    }

    @Transactional
    public BoardDto createBoard(BoardCreateDto createDto, UserPrincipal currentUser) {
        // Only Admin can create boards
        verifyAdmin(currentUser);

        User user = userService.findEntityById(currentUser.getId());
        Board board = Board.builder()
                .name(createDto.getName())
                .description(createDto.getDescription())
                .createdBy(user)
                .build();

        Board savedBoard = boardRepository.save(board);
        return mapToBoardDto(savedBoard);
    }

    @Transactional
    public BoardDto updateBoard(Long boardId, BoardCreateDto createDto, UserPrincipal currentUser) {
        // Only Admin can update boards
        verifyAdmin(currentUser);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));

        board.setName(createDto.getName());
        board.setDescription(createDto.getDescription());

        Board updatedBoard = boardRepository.save(board);
        return mapToBoardDto(updatedBoard);
    }

    @Transactional
    public void deleteBoard(Long boardId, UserPrincipal currentUser) {
        // Only Admin can delete boards
        verifyAdmin(currentUser);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));

        // Delete associated board members first (to clean up references)
        List<BoardMember> members = boardMemberRepository.findAllByBoardId(boardId);
        boardMemberRepository.deleteAll(members);

        boardRepository.delete(board);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getBoardMembers(Long boardId, UserPrincipal currentUser) {
        verifyBoardAccess(boardId, currentUser);

        return boardMemberRepository.findAllByBoardId(boardId).stream()
                .map(bm -> userService.mapToUserDto(bm.getUser()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateBoardMembers(Long boardId, BoardMembersUpdateDto updateDto, UserPrincipal currentUser) {
        verifyAdmin(currentUser);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));

        // Clear existing members
        List<BoardMember> existingMembers = boardMemberRepository.findAllByBoardId(boardId);
        boardMemberRepository.deleteAll(existingMembers);

        // Add new members
        if (updateDto.getUserIds() != null) {
            for (Long userId : updateDto.getUserIds()) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
                BoardMember boardMember = BoardMember.builder()
                        .board(board)
                        .user(user)
                        .build();
                boardMemberRepository.save(boardMember);
            }
        }
    }

    public Board findEntityById(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", id));
    }

    public void verifyBoardAccess(Long boardId, UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return;
        }

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", boardId));

        if (board.getCreatedBy().getId().equals(currentUser.getId())) {
            return;
        }

        boolean isMember = boardMemberRepository.existsByBoardIdAndUserId(boardId, currentUser.getId());
        if (!isMember) {
            throw new UnauthorizedException("You do not have access to this board.");
        }
    }

    private void verifyAdmin(UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new UnauthorizedException("Only Administrators can perform this action.");
        }
    }

    private BoardDto mapToBoardDto(Board board) {
        long taskCount = taskRepository.countByBoardId(board.getId());
        long membersCount = boardMemberRepository.findAllByBoardId(board.getId()).size();

        return BoardDto.builder()
                .id(board.getId())
                .name(board.getName())
                .description(board.getDescription())
                .createdBy(userService.mapToUserDto(board.getCreatedBy()))
                .taskCount(taskCount)
                .membersCount(membersCount)
                .build();
    }
}

package com.trello.dto;

import lombok.Data;
import java.util.List;

@Data
public class BoardMembersUpdateDto {
    private List<Long> userIds;
}

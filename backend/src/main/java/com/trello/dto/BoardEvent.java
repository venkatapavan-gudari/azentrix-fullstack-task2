package com.trello.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardEvent<T> {
    private String action; // CREATE, UPDATE, DELETE, MOVE
    private T data;
}

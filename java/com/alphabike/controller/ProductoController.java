package com.alphabike.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/productos")
    public List<Map<String, Object>> obtenerProductos() {
        String sql = "SELECT * FROM Productos";
        return jdbcTemplate.queryForList(sql);
    }
}

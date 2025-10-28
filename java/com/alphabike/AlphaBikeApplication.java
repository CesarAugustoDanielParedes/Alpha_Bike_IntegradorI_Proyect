package com.alphabike;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AlphaBikeApplication {
    public static void main(String[] args) {
        SpringApplication.run(AlphaBikeApplication.class, args);
        System.out.println("🚴 Servidor corriendo en http://localhost:3000");
    }
}

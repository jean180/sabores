package com.sabores.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "ingredients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ingredient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    @Builder.Default
    @Column(nullable = false, length = 50)
    private String category = "OTROS";
}

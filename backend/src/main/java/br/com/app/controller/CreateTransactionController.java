package br.com.app.controller;

import br.com.app.dto.CreateTransactionDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/create-transaction")
public class CreateTransactionController {

    @PostMapping("/mount-transaction")
    public ResponseEntity<String> mountTransaction(@RequestBody CreateTransactionDTO transactionDTO) {
        
        return ResponseEntity.ok("Transaction received successfully");
    }
}

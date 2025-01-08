package br.com.app.controller;

import br.com.app.dto.CreditCardDTO;
import br.com.app.repository.CreditCardRepository;
import br.com.app.model.CreditCard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/credit-cards")
public class CreditCardController {

    @Autowired
    private CreditCardRepository creditCardRepository;

    // Endpoint de pesquisa de contas bancárias por userId
    @PostMapping("/search")
    public List<CreditCardDTO> findByUserId(@RequestBody Long userId) {
        List<CreditCard> creditCards = creditCardRepository.findByUserId(userId);

        // Convertendo de CreditCard para CreditCardDTO
        return creditCards.stream()
                .map(creditCard -> new CreditCardDTO(
                        creditCard.getId(),
                        creditCard.getName(),
                        creditCard.getColor(),
                        creditCard.getClosingDay(),
                        creditCard.getPayingDay(),
                        creditCard.getStatus()))
                .collect(Collectors.toList());
    }
}
